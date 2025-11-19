<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
  public function up(): void
  {
    Schema::create('staffs', function (Blueprint $t) {
      $t->id();
      $t->foreignId('shop_id')->constrained('shops')->cascadeOnDelete();
      $t->string('name')->nullable();
      $t->string('email')->unique();
      $t->string('password'); // bcrypt
      $t->boolean('is_active')->default(true);
      $t->timestamps();
    });
  }

  public function down(): void
  {
    Schema::dropIfExists('staffs');
  }
};
