<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class StaffTokenAuth
{
  public function handle(Request $request, Closure $next)
  {
    $token = $request->bearerToken();
    if (!$token) {
      return response()->json([
        'message' => 'Unauthorized',
        'errors'  => [config('errorcodes.UNAUTHORIZED')],
      ], 401);
    }

    // Prefer: store hashed tokens and query by hash. (See note below)
    // For now (raw token stored), fetch candidate rows then compare with hash_equals.
    $row = DB::table('staff_api_tokens')
      ->where('token', $token)
      ->first(['id', 'staff_id', 'token']);

    if (!$row || !hash_equals((string) $row->token, (string) $token)) {
      return response()->json([
        'message' => 'Unauthorized',
        'errors'  => [config('errorcodes.UNAUTHORIZED')],
      ], 401);
    }

    $staff = DB::table('staffs')
      ->where('id', $row->staff_id)
      ->first(['id', 'shop_id', 'is_active']);

    if (!$staff || !(bool) $staff->is_active) {
      return response()->json([
        'message' => 'Unauthorized',
        'errors'  => [config('errorcodes.UNAUTHORIZED')],
      ], 401);
    }

    // Attach identity for controllers
    $request->attributes->set('staff_id', $staff->id);
    $request->attributes->set('shop_id', $staff->shop_id);
    $request->attributes->set('token_type', 'staff');

    // Best-effort update last_used_at (don't fail request if update fails)
    try {
      DB::table('staff_api_tokens')
        ->where('id', $row->id)
        ->update(['last_used_at' => now()]);
    } catch (\Throwable $e) {
      // ignore
    }

    return $next($request);
  }
}
