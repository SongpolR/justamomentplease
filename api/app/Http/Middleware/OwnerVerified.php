<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class OwnerVerified
{
  public function handle(Request $request, Closure $next)
  {
    // OwnerTokenAuth should already run before this middleware.
    // So we trust the injected attribute instead of re-checking token again.
    $ownerId = $request->attributes->get('owner_id');

    if (!$ownerId) {
      return response()->json([
        'message' => 'Unauthorized',
        'errors'  => [config('errorcodes.UNAUTHORIZED')],
      ], 401);
    }

    $owner = DB::table('owners')
      ->where('id', $ownerId)
      ->first(['id', 'email_verified_at']);

    if (!$owner) {
      return response()->json([
        'message' => 'Unauthorized',
        'errors'  => [config('errorcodes.UNAUTHORIZED')],
      ], 401);
    }

    if (!$owner->email_verified_at) {
      return response()->json([
        'message' => 'Email not verified',
        'errors'  => [config('errorcodes.EMAIL_NOT_VERIFIED')],
      ], 403);
    }

    // keep attribute available downstream (optional)
    $request->attributes->set('owner_id', $owner->id);

    return $next($request);
  }
}
