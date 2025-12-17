<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class AnyTokenAuth
{
  public function handle(Request $request, Closure $next)
  {
    $token = $request->bearerToken();
    if (!$token) {
      return response()->json([
        'message' => 'Unauthorized',
        'errors' => [config('errorcodes.UNAUTHORIZED')],
      ], 401);
    }

    // ---- Owner token ----
    $o = DB::table('owner_api_tokens')->where('token', $token)->first();
    if ($o) {
      $owner = DB::table('owners')->where('id', $o->owner_id)->first();
      if ($owner) {
        $shop = DB::table('shops')->where('owner_id', $owner->id)->first();

        // IMPORTANT: do not default shop_id
        if (!$shop) {
          return response()->json([
            'message' => 'SHOP_NOT_FOUND',
            'errors' => [config('errorcodes.NOT_FOUND') ?? config('errorcodes.UNAUTHORIZED')],
          ], 404);
        }

        $request->attributes->set('actor', 'owner');
        $request->attributes->set('owner_id', $owner->id);
        $request->attributes->set('shop_id', $shop->id);

        return $next($request);
      }
    }

    // ---- Staff token ----
    $s = DB::table('staff_api_tokens')->where('token', $token)->first();
    if ($s) {
      $staff = DB::table('staffs')->where('id', $s->staff_id)->first();
      if ($staff && (int)$staff->is_active === 1) {
        $request->attributes->set('actor', 'staff');
        $request->attributes->set('staff_id', $staff->id);
        $request->attributes->set('shop_id', $staff->shop_id);

        return $next($request);
      }
    }

    return response()->json([
      'message' => 'Unauthorized',
      'errors' => [config('errorcodes.UNAUTHORIZED')],
    ], 401);
  }
}
