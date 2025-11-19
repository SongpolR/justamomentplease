<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
  public function up(): void
  {
    Schema::create('owner_api_tokens', function (Blueprint $t) {
      $t->id();
      $t->foreignId('owner_id')->constrained()->cascadeOnDelete();
      $t->string('token', 80)->unique();
      $t->timestamp('last_used_at')->nullable();
      $t->timestamps();
    });
  }

  public function down(): void
  {
    Schema::dropIfExists('owner_api_tokens');
  }
};
