<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Illuminate\Validation\ValidationException;

class ShopController extends Controller
{
  public function show()
  {
    $shop = DB::table('shops')->first();
    return $shop ?: response()->json(['error' => 'no_shop'], 404);
  }

  public function update(Request $req)
  {
    try {
      // Partial update: all fields are optional but validated if present
      $req->validate([
        'name'      => 'sometimes|required|string|max:120',
        'logo'      => 'sometimes|nullable|image|max:2048', // 2MB
        'sound_key' => 'sometimes|required|string|in:ding,bell,chime,ping,beep',
        'timezone'  => 'sometimes|required|timezone',
      ]);

      // For MVP, assume single shop per owner
      // (Later you can resolve by authenticated owner_id)
      $shop = DB::table('shops')->first();

      if (!$shop) {
        return response()->json([
          'success' => false,
          'message' => 'SHOP_NOT_FOUND',
        ], 404);
      }

      // Optional: logo resolution check (≤ 1024×1024)
      if ($req->hasFile('logo')) {
        [$w, $h] = getimagesize($req->file('logo')->getPathname());
        if ($w > 1024 || $h > 1024) {
          return response()->json([
            'success' => false,
            'message' => 'VALIDATION_FAILED',
            'errors'  => [
              'logo' => [[
                'code' => config('errorcodes.IMAGE_TOO_LARGE'),
                'meta' => [
                  'max_w' => 1024,
                  'max_h' => 1024,
                ],
              ]],
            ],
          ], 422);
        }
      }

      $update = [];

      if ($req->filled('name')) {
        $update['name'] = $req->input('name');
      }

      if ($req->hasFile('logo')) {
        $path = $req->file('logo')->store('public/logos');
        $update['logo_url'] = Storage::url($path);
      }

      if ($req->filled('sound_key')) {
        $update['sound_key'] = $req->input('sound_key');
      }

      if ($req->filled('timezone')) {
        $update['timezone'] = $req->input('timezone');
      }

      if (!empty($update)) {
        $update['updated_at'] = now();
        DB::table('shops')->where('id', $shop->id)->update($update);
      }

      $fresh = DB::table('shops')->where('id', $shop->id)->first();

      return response()->json([
        'success' => true,
        'message' => 'SHOP_UPDATED',
        'data'    => [
          'shop' => $fresh,
        ],
      ], 200);
    } catch (ValidationException $e) {
      // Map Laravel validation rules → numeric error codes
      $map = [
        'REQUIRED' => config('errorcodes.REQUIRED_FIELD'),
        'STRING'   => config('errorcodes.INVALID_FORMAT'),
        'MAX'      => config('errorcodes.FILE_TOO_LARGE'),
        'IMAGE'    => config('errorcodes.INVALID_FORMAT'),
        'TIMEZONE' => config('errorcodes.INVALID_FORMAT'),
      ];

      $errors = [];
      $failed = $e->validator->failed(); // field => [rule => params]

      foreach ($failed as $field => $rules) {
        foreach ($rules as $rule => $params) {
          $key  = strtoupper($rule);
          $code = $map[$key] ?? config('errorcodes.VALIDATION_ERROR');

          $meta = [];
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

  public function uploadLogo(Request $req)
  {
    $req->validate(['logo' => 'required|image|max:2048']);
    [$w, $h] = getimagesize($req->file('logo')->getPathname());
    if ($w > 1024 || $h > 1024) {
      return response()->json(['error' => 'logo_resolution_too_large'], 422);
    }
    $path = $req->file('logo')->store('public/logos');
    $url = Storage::url($path);
    DB::table('shops')->where('id', 1)->update(['logo_url' => $url, 'updated_at' => now()]);
    return ['logo_url' => $url];
  }
}
