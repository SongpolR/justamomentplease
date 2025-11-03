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
    if (!$token) return response()->json(['error' => 'unauthorized'], 401);

    $row = DB::table('owner_api_tokens')->where('token', $token)->first();
    if (!$row) return response()->json(['error' => 'unauthorized'], 401);

    $request->attributes->set('owner_id', $row->owner_id);
    DB::table('owner_api_tokens')->where('id',$row->id)->update(['last_used_at'=>now()]);

    return $next($request);
  }
}
