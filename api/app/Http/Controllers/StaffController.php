<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;
use Illuminate\Validation\ValidationException;

class StaffController extends Controller
{
    public function index(Request $req)
    {
        $shopId = $req->attributes->get('shop_id');

        if (!$shopId) {
            return response()->json([
                'success' => false,
                'message' => 'UNAUTHORIZED',
                'errors'  => [config('errorcodes.UNAUTHORIZED')],
            ], 401);
        }

        // Existing staff for this shop
        $staffs = DB::table('staffs')
            ->where('shop_id', $shopId)
            ->orderBy('created_at', 'asc')
            ->get(['id', 'name', 'email', 'is_active', 'created_at']);

        // Pending invites (not accepted + not expired)
        $invites = DB::table('staff_invites')
            ->where('shop_id', $shopId)
            ->whereNull('accepted_at')
            ->where('expires_at', '>', now())
            ->orderBy('created_at', 'asc')
            ->get(['id', 'name', 'email', 'created_at', 'expires_at']);

        $existingEmails = $staffs
            ->pluck('email')
            ->filter()
            ->map(fn($e) => strtolower(trim($e)))
            ->values()
            ->all();

        $rows = [];

        // Staff rows
        foreach ($staffs as $s) {
            $rows[] = [
                'id'         => (int) $s->id,
                'uid'        => "staff:{$s->id}",
                'name'       => $s->name,
                'email'      => $s->email,
                'is_active'  => (bool) $s->is_active,
                'kind'       => 'staff',
                'created_at' => $s->created_at,
            ];
        }

        // Invite rows (skip if staff already exists)
        foreach ($invites as $inv) {
            $invEmail = strtolower(trim($inv->email ?? ''));
            if ($invEmail === '' || in_array($invEmail, $existingEmails, true)) {
                continue;
            }

            $rows[] = [
                'id'         => null,
                'uid'        => "invite:{$inv->id}",
                'name'       => $inv->name,
                'email'      => $inv->email,
                'is_active'  => false,
                'kind'       => 'invite',
                'invited_at' => $inv->created_at,
                'expires_at' => $inv->expires_at,
            ];
        }

        return response()->json([
            'success' => true,
            'data'    => ['staffs' => $rows],
        ], 200);
    }

    /**
     * Create a staff account (owner provisions).
     * Owner-only (protect via middleware: ['owner','verified'])
     */
    public function create(Request $req)
    {
        try {
            $req->validate([
                'name'     => 'nullable|string|max:120',
                'email'    => 'required|email|max:190|unique:staff,email',
                'password' => [
                    'required',
                    'string',
                    'min:8',
                    'regex:/[A-Z]/',          // at least one uppercase
                    'regex:/[0-9]/',          // at least one number
                    'regex:/^[A-Za-z0-9!@#$%^&*._-]+$/', // allowed chars
                ],
                'confirm_password' => 'required|string|same:password',
            ]);
        } catch (ValidationException $e) {
            // Keep it simple: return generic validation error code
            return response()->json([
                'message' => 'Validation failed',
                'errors'  => [config('errorcodes.VALIDATION_ERROR')],
            ], 422);
        }

        $shopId = $req->attributes->get('shop_id');
        if (!$shopId) {
            return response()->json([
                'success' => false,
                'message' => 'UNAUTHORIZED',
                'errors'  => [config('errorcodes.UNAUTHORIZED')],
            ], 401);
        }

        // Create staff
        $id = DB::table('staffs')->insertGetId([
            'shop_id'    => $shopId,
            'name'       => $req->input('name'),
            'email'      => $req->input('email'),
            'password'   => Hash::make($req->input('password')),
            'is_active'  => true,
            'created_at' => now(),
            'updated_at' => now(),
        ]);

        return response()->json([
            'success' => true,
            'data'    => ['id' => $id],
        ], 201);
    }

    /**
     * Activate a staff account (unlock).
     * Owner-only (protect via middleware: ['owner','verified'])
     */
    public function activate(Request $req, $id)
    {
        $shopId = $req->attributes->get('shop_id');
        if (!$shopId) {
            return response()->json([
                'success' => false,
                'message' => 'UNAUTHORIZED',
                'errors'  => [config('errorcodes.UNAUTHORIZED')],
            ], 401);
        }

        $affected = DB::table('staffs')
            ->where('id', $id)
            ->where('shop_id', $shopId)
            ->update([
                'is_active'  => true,
                'updated_at' => now(),
            ]);

        if (!$affected) {
            return response()->json([
                'message' => 'ACCOUNT_NOT_FOUND',
                'errors'  => [config('errorcodes.ACCOUNT_NOT_FOUND')],
            ], 404);
        }

        return response()->json(['success' => true, 'message' => 'OK']);
    }

    /**
     * Deactivate a staff account (soft lock).
     * Owner-only (protect via middleware: ['owner','verified'])
     */
    public function deactivate(Request $req, $id)
    {
        $shopId = $req->attributes->get('shop_id');
        if (!$shopId) {
            return response()->json([
                'success' => false,
                'message' => 'UNAUTHORIZED',
                'errors'  => [config('errorcodes.UNAUTHORIZED')],
            ], 401);
        }

        $affected = DB::table('staffs')
            ->where('id', $id)
            ->where('shop_id', $shopId)
            ->update([
                'is_active'  => false,
                'updated_at' => now(),
            ]);

        if (!$affected) {
            return response()->json([
                'message' => 'ACCOUNT_NOT_FOUND',
                'errors'  => [config('errorcodes.ACCOUNT_NOT_FOUND')],
            ], 404);
        }

        return response()->json(['success' => true, 'message' => 'OK']);
    }

    /**
     * Remove a staff account from shop, both inviting and actual staff.
     * Owner-only (protect via middleware: ['owner','verified'])
     */
    public function remove(Request $req, $id)
    {
        $shopId = $req->attributes->get('shop_id');
        if (!$shopId) {
            return response()->json([
                'success' => false,
                'message' => 'UNAUTHORIZED',
                'errors'  => [config('errorcodes.UNAUTHORIZED')],
            ], 401);
        }

        $removedStaff = DB::table('staffs')->where('shop_id', $shopId)->delete($id);
        $removedInviting = DB::table('staff_invites')->where('shop_id', $shopId)->delete($id);

        logger($id);
        logger($shopId);
        logger($removedStaff);
        logger($removedInviting);
        if (!$removedStaff && !$removedInviting) {
            return response()->json([
                'message' => 'ACCOUNT_NOT_FOUND',
                'errors'  => [config('errorcodes.ACCOUNT_NOT_FOUND')],
            ], 404);
        }

        return response()->json(['success' => true, 'message' => 'OK']);
    }

    /**
     * Staff login with email/password.
     * Public route (no auth) → returns staff API token on success.
     */
    public function login(Request $req)
    {
        try {
            $req->validate([
                'email'    => 'required|email',
                'password' => 'required|string',
                'shop_code' => 'required|string',
            ]);

            $shop = DB::table('shops')
                ->where('code', $req->shop_code)
                ->first();

            if (!$shop) {
                return response()->json([
                    'success' => false,
                    'message' => 'SHOP_NOT_FOUND',
                ], 404);
            }

            $email  = $req->email;
            $staff  = DB::table('staffs')
                ->where('shop_id', $shop->id)
                ->where('email', $email)
                ->first();
            $invite = DB::table('staff_invites')
                ->where('shop_id', $shop->id)
                ->where('email', $email)
                ->whereNull('accepted_at')
                ->first();

            // Case 1: no staff & no invite → contact owner
            if (!$staff && !$invite) {
                return response()->json([
                    'success' => false,
                    'message' => 'ACCOUNT_NOT_FOUND', // used by LoginErrorPanel (staff)
                ], 404);
            }

            // Case 2: invite exists, staff not created/activated → link to activate
            if (!$staff && $invite) {
                return response()->json([
                    'success' => false,
                    'message' => 'INVITE_PENDING', // used by LoginErrorPanel (staff)
                ], 403);
            }

            // Case 3: staff exists (invite may also exist but already used or still present)
            if (!$staff->is_active) {
                return response()->json([
                    'success' => false,
                    'message' => 'STAFF_INACTIVE', // used by LoginErrorPanel (staff)
                ], 403);
            }

            if (!Hash::check($req->password, $staff->password ?? '')) {
                return response()->json([
                    'success' => false,
                    'message' => 'INVALID_CREDENTIAL', // used by LoginErrorPanel (staff)
                ], 401);
            }

            // OK → issue staff token
            $token = Str::random(64);
            DB::table('staff_api_tokens')->insert([
                'shop_id' => $shop->id,
                'staff_id'   => $staff->id,
                'token'      => $token,
                'created_at' => now(),
                'updated_at' => now(),
            ]);

            return response()->json([
                'success' => true,
                'message' => 'LOGIN_SUCCESS',
                'data'    => [
                    'token' => $token,
                ],
            ], 200);
        } catch (ValidationException $e) {
            // Map Laravel validation rules → numeric error codes in config/errorcodes.php
            $map = [
                'REQUIRED' => config('errorcodes.REQUIRED_FIELD'),
                'EMAIL'    => config('errorcodes.INVALID_EMAIL'),
                'STRING'   => config('errorcodes.INVALID_FORMAT'),
                'MIN'      => config('errorcodes.TOO_SHORT') ?? config('errorcodes.VALIDATION_ERROR'),
                'MAX'      => config('errorcodes.TOO_LONG')  ?? config('errorcodes.VALIDATION_ERROR'),
            ];

            $errors = [];
            $failed = $e->validator->failed(); // field => [rule => params]

            foreach ($failed as $field => $rules) {
                foreach ($rules as $rule => $params) {
                    $key  = strtoupper($rule);
                    $code = $map[$key] ?? config('errorcodes.VALIDATION_ERROR');

                    $meta = [];
                    if ($key === 'MIN' && isset($params[0])) {
                        $meta['min'] = $params[0];
                    }
                    if ($key === 'MAX' && isset($params[0])) {
                        $meta['max'] = $params[0];
                    }

                    $errors[$field][] = [
                        'code' => $code,
                        'meta' => $meta,
                    ];
                }
            }

            return response()->json([
                'success' => false,
                'message' => 'VALIDATION_FAILED',
                'errors'  => $errors,
            ], 422);
        }
    }

    public function logout(Request $req)
    {
        $token = $req->bearerToken();
        if ($token) DB::table('staff_api_tokens')->where('token', $token)->delete();
        return response()->json(['success' => true, 'message' => 'OK']);
    }
}
