<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
  public function up(): void {
    Schema::create('owners', function (Blueprint $t) {
      $t->id();
      $t->string('name')->nullable();
      $t->string('email')->unique();
      $t->string('password'); // bcrypt
      $t->timestamps();
    });

    Schema::create('owner_api_tokens', function (Blueprint $t) {
      $t->id();
      $t->foreignId('owner_id')->constrained()->cascadeOnDelete();
      $t->string('token', 80)->unique();
      $t->timestamp('last_used_at')->nullable();
      $t->timestamps();
    });

    Schema::create('shops', function (Blueprint $t) {
      $t->id();
      $t->foreignId('owner_id')->constrained('owners')->cascadeOnDelete();
      $t->string('name')->default('My Cafe');
      $t->string('logo_url')->nullable();
      $t->enum('order_mode', ['SEQUENTIAL','RANDOM'])->default('SEQUENTIAL');
      $t->unsignedInteger('seq_next')->default(1);
      $t->unsignedSmallInteger('random_min')->default(100);
      $t->unsignedSmallInteger('random_max')->default(999);
      $t->enum('sound_key', ['ding','bell','chime','ping','beep'])->default('ding');
      $t->timestamps();
    });
  }

  public function down(): void {
    Schema::dropIfExists('shops');
    Schema::dropIfExists('owner_api_tokens');
    Schema::dropIfExists('owners');
  }
};
