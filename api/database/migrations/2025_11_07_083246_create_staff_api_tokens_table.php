<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
  public function up(): void
  {
    Schema::create('staff_api_tokens', function (Blueprint $t) {
      $t->id();
      $t->foreignId('staff_id')->constrained('staff')->cascadeOnDelete();
      $t->string('token', 80)->unique();
      $t->timestamp('last_used_at')->nullable();
      $t->timestamps();
    });
  }

  public function down(): void
  {
    Schema::dropIfExists('staff_api_tokens');
  }
};
