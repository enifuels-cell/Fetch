<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('bookings', function (Blueprint $table) {
            $table->id();
            $table->foreignId('passenger_id')->constrained('users')->onDelete('cascade');
            $table->foreignId('rider_id')->nullable()->constrained('users')->onDelete('set null');
            $table->decimal('pickup_latitude', 10, 8);
            $table->decimal('pickup_longitude', 11, 8);
            $table->string('pickup_address');
            $table->decimal('dropoff_latitude', 10, 8)->nullable();
            $table->decimal('dropoff_longitude', 11, 8)->nullable();
            $table->string('dropoff_address')->nullable();
            $table->enum('status', [
                'pending',
                'notified',
                'accepted',
                'rider_arriving',
                'rider_arrived',
                'in_transit',
                'completed',
                'cancelled'
            ])->default('pending');
            $table->timestamp('booking_time')->useCurrent();
            $table->timestamp('accepted_time')->nullable();
            $table->timestamp('completed_time')->nullable();
            $table->decimal('estimated_fare', 8, 2)->nullable();
            $table->decimal('actual_fare', 8, 2)->nullable();
            $table->text('special_instructions')->nullable();
            $table->string('vehicle_type')->default('motorcycle');
            $table->integer('cancellation_count')->default(0);
            $table->timestamps();
            $table->softDeletes();

            $table->index('passenger_id');
            $table->index('rider_id');
            $table->index('status');
            $table->index('booking_time');
            $table->index(['pickup_latitude', 'pickup_longitude']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('bookings');
    }
};
