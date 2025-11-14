<?php

namespace App\Http\Controllers;

use App\Models\Order;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class OrderController extends Controller
{
    /**
     * List today's orders for the current shop.
     * Optional: ?status=pending|ready|done
     */
    public function index(Request $req)
    {
        $shopId = $req->attributes->get('shop_id'); // from AnyTokenAuth
        $status = $req->query('status');

        $today = now()->timezone(config('app.timezone', 'UTC'))->toDateString();

        $q = Order::where('shop_id', $shopId)
            ->where('order_date', $today)
            ->orderBy('created_at', 'asc');

        if ($status) {
            $q->where('status', $status);
        }

        $orders = $q->get([
            'id',
            'order_no',
            'status',
            'items',
            'pos_ref',
            'created_at',
            'ready_at',
            'done_at',
        ]);

        return response()->json($orders);
    }

    /**
     * Create a new order.
     *
     * Body may include:
     *  - order_no (optional override; otherwise auto-generated)
     *  - items    (optional array)
     *  - pos_ref  (optional string)
     */
    public function store(Request $req)
    {
        $shopId     = $req->attributes->get('shop_id');
        $actorType  = $req->attributes->get('actor_type'); // 'owner' | 'staff' (if you set this)
        $actorId    = $req->attributes->get('actor_id');

        $today = now()->timezone(config('app.timezone', 'UTC'))->toDateString();

        // Basic validation for incoming data
        $data = $req->validate([
            'order_no' => ['nullable', 'string', 'max:50'],
            'pos_ref'  => ['nullable', 'string', 'max:100'],
            'items'    => ['nullable', 'array', 'max:50'], // max 50 line items
            'items.*.name'  => ['nullable', 'string', 'max:255'],
            'items.*.qty'   => ['nullable', 'numeric'],
            'items.*.note'  => ['nullable', 'string', 'max:255'],
            // you can extend with price, sku, etc. later
        ]);

        // Load shop to know numbering mode
        $shop = DB::table('shops')->where('id', $shopId)->first();
        if (!$shop) {
            return response()->json([
                'message' => 'Shop not found',
                'errors'  => [config('errorcodes.UNKNOWN') ?? 1999],
            ], 404);
        }

        $mode = $shop->order_numbering_mode ?? 'sequential';

        try {
            $order = DB::transaction(function () use ($shopId, $today, $mode, $actorType, $actorId, $data) {
                $providedOrderNo = isset($data['order_no']) && $data['order_no'] !== ''
                    ? trim($data['order_no'])
                    : null;

                // Decide final order_no:
                if ($providedOrderNo !== null) {
                    // Ensure no collision: same shop + date + order_no
                    $exists = Order::where('shop_id', $shopId)
                        ->where('order_date', $today)
                        ->where('order_no', $providedOrderNo)
                        ->exists();

                    if ($exists) {
                        throw new \RuntimeException('ORDER_NO_CONFLICT');
                    }

                    $orderNo = $providedOrderNo;
                } else {
                    // Auto-generate
                    $orderNo = $this->generateOrderNo($shopId, $today, $mode);
                }

                $now = now();

                $order = Order::create([
                    'shop_id'        => $shopId,
                    'order_date'     => $today,
                    'order_no'       => $orderNo,
                    'status'         => 'pending',
                    'items'          => $data['items'] ?? null,
                    'pos_ref'        => $data['pos_ref'] ?? null,
                    'created_by_type' => $actorType,
                    'created_by_id'  => $actorId,
                    'created_at'     => $now,
                    'updated_at'     => $now,
                ]);

                return $order;
            });
        } catch (\RuntimeException $e) {
            if ($e->getMessage() === 'ORDER_NO_CONFLICT') {
                return response()->json([
                    'message' => 'Order number already exists for today.',
                    'errors'  => [config('errorcodes.ORDER_NUMBERING_FAILED')],
                ], 422);
            }

            return response()->json([
                'message' => 'Failed to generate order number',
                'errors'  => [config('errorcodes.ORDER_NUMBERING_FAILED')],
            ], 422);
        } catch (\Throwable $e) {
            return response()->json([
                'message' => 'Failed to create order',
                'errors'  => [config('errorcodes.UNKNOWN') ?? 1999],
            ], 500);
        }

        return response()->json([
            'id'        => $order->id,
            'order_no'  => $order->order_no,
            'status'    => $order->status,
            'items'     => $order->items,
            'pos_ref'   => $order->pos_ref,
            'created_at' => $order->created_at,
        ], 201);
    }

    /**
     * Mark order as READY.
     */
    public function ready(Request $req, $orderId)
    {
        return $this->changeStatus($req, $orderId, 'ready');
    }

    /**
     * Mark order as DONE.
     */
    public function done(Request $req, $orderId)
    {
        return $this->changeStatus($req, $orderId, 'done');
    }

    // ----------------- Helpers -----------------

    protected function changeStatus(Request $req, $orderId, string $toStatus)
    {
        $shopId = $req->attributes->get('shop_id');
        $now    = now();

        $order = Order::where('shop_id', $shopId)
            ->where('id', $orderId)
            ->first();

        if (!$order) {
            return response()->json([
                'message' => 'Order not found',
                'errors'  => [config('errorcodes.ORDER_NOT_FOUND')],
            ], 404);
        }

        $from = $order->status;

        // Valid transitions: pending -> ready -> done
        $valid = match ($from) {
            'pending' => $toStatus === 'ready',
            'ready'   => $toStatus === 'done',
            default   => false,
        };

        if (!$valid) {
            return response()->json([
                'message' => 'Invalid status transition',
                'errors'  => [config('errorcodes.ORDER_INVALID_TRANSITION')],
            ], 422);
        }

        $order->status = $toStatus;
        if ($toStatus === 'ready') {
            $order->ready_at = $now;
        }
        if ($toStatus === 'done') {
            $order->done_at = $now;
        }
        $order->updated_at = $now;
        $order->save();

        return response()->json([
            'id'        => $order->id,
            'order_no'  => $order->order_no,
            'status'    => $order->status,
            'items'     => $order->items,
            'pos_ref'   => $order->pos_ref,
            'ready_at'  => $order->ready_at,
            'done_at'   => $order->done_at,
        ]);
    }

    /**
     * Auto-generate an order number when not provided.
     * Modes:
     *  - sequential: 1,2,3,... per day per shop
     *  - random:     random 3–4 digit code, unique per day per shop
     */
    protected function generateOrderNo(int $shopId, string $date, string $mode): string
    {
        if ($mode === 'random') {
            for ($i = 0; $i < 10; $i++) {
                $candidate = (string) random_int(100, 9999);
                $exists = Order::where('shop_id', $shopId)
                    ->where('order_date', $date)
                    ->where('order_no', $candidate)
                    ->exists();

                if (!$exists) {
                    return $candidate;
                }
            }
            throw new \RuntimeException('RANDOM_EXHAUSTED');
        }

        // Default: sequential
        $max = Order::where('shop_id', $shopId)
            ->where('order_date', $date)
            ->max(DB::raw('CAST(order_no AS UNSIGNED)'));

        $next = $max ? ((int) $max + 1) : 1;
        return (string) $next;
    }
}
