<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('service_areas', function (Blueprint $table) {
            $table->id();
            $table->string('name');              // "Gwarinpa", "Wuse", "Kagini"
            $table->string('district');          // "Abuja Municipal Area Council"
            $table->string('city')->default('Abuja');
            $table->string('state')->default('FCT');
            $table->decimal('center_lat', 10, 8);
            $table->decimal('center_lng', 11, 8);
            $table->integer('radius_km')->default(5); // Serviceable radius
            $table->boolean('is_active')->default(true);
            $table->timestamps();
            
            $table->index(['center_lat', 'center_lng']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('service_areas');
    }
};
