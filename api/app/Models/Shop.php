<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use App\Services\ShopCodeService;

class Shop extends Model
{
    protected $table = 'shops';

    // Adjust based on your schema
    protected $fillable = [
        'owner_id',
        'name',
        'code',
        'logo_url',
        'sound_key',
        // add other columns you insert
    ];

    protected static function booted(): void
    {
        static::creating(function (Shop $shop) {
            // ✅ Apply app-level default BEFORE generating code
            if (empty($shop->name)) {
                $shop->name = 'My Shop'; // or config('app.default_shop_name', 'My Shop')
            }

            if (empty($shop->code)) {
                $shop->code = app(ShopCodeService::class)->allocate($shop->name);
            }
        });
    }
}
