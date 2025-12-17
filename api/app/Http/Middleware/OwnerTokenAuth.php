<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class OwnerTokenAuth
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

    $row = DB::table('owner_api_tokens')
      ->where('token', $token)
      // ->whereNull('revoked_at')
      // ->where(function ($q) { $q->whereNull('expires_at')->orWhere('expires_at', '>', now()); })
      ->first();

    if (!$row) {
      return response()->json([
        'message' => 'Unauthorized',
        'errors'  => [config('errorcodes.UNAUTHORIZED')],
      ], 401);
    }

    $owner = DB::table('owners')->where('id', $row->owner_id)->first();
    if (!$owner) {
      return response()->json([
        'message' => 'Unauthorized',
        'errors'  => [config('errorcodes.UNAUTHORIZED')],
      ], 401);
    }

    $shop = DB::table('shops')->where('owner_id', $owner->id)->first();
    if (!$shop) {
      // choose 404 or 401 depending on whether you want to reveal existence
      return response()->json([
        'message' => 'SHOP_NOT_FOUND',
        'errors'  => [config('errorcodes.NOT_FOUND') ?? config('errorcodes.UNAUTHORIZED')],
      ], 404);
    }

    $request->attributes->set('actor', 'owner');
    $request->attributes->set('owner_id', $owner->id);
    $request->attributes->set('shop_id', $shop->id);

    DB::table('owner_api_tokens')
      ->where('id', $row->id)
      ->update(['last_used_at' => now()]);

    return $next($request);
  }
}
