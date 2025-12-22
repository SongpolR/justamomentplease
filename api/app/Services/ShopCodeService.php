<?php

namespace App\Services;

use Illuminate\Support\Facades\DB;

class ShopCodeService
{


    public function allocate(string $shopName): string
    {
        $prefix = $this->makePrefix($shopName, 6);

        // Try a bunch of times with 6 random chars
        for ($attempt = 0; $attempt < 12; $attempt++) {
            $code = $prefix . '-' . $this->randomPart(6);
            if (!$this->exists($code)) {
                return $code;
            }
        }

        throw new \RuntimeException('FAILED_TO_ALLOCATE_SHOP_CODE');
    }

    private function exists(string $code): bool
    {
        return DB::table('shops')->where('code', $code)->exists();
    }

    private function makePrefix(string $name, int $len = 4): string
    {
        // remove spaces/symbols, keep only letters/numbers, uppercase
        $prefix = strtoupper(preg_replace('/[^A-Z0-9]/i', '', $name) ?? '');
        $prefix = substr($prefix, 0, $len);

        return $prefix !== '' ? $prefix : 'SHOP';
    }

    private function randomPart(int $len): string
    {
        // 32 chars, excludes I O 0 1
        $alphabet = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
        $max = strlen($alphabet) - 1;

        $out = '';
        for ($i = 0; $i < $len; $i++) {
            $out .= $alphabet[random_int(0, $max)];
        }
        return $out;
    }
}
