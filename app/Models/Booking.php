<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Booking extends Model
{
    use HasFactory;
    const STATUS_PENDING = 'PENDING';
    const STATUS_ACCEPTED = 'ACCEPTED';
    const STATUS_PAID_ESCROW = 'PAID_ESCROW';
    const STATUS_COMPLETED = 'COMPLETED';
    const STATUS_CLOSED = 'CLOSED';
    const STATUS_CANCELLED = 'CANCELLED';
    const STATUS_DECLINED = 'DECLINED';

    protected $fillable = [
        'client_id',
        'agent_id',
        'service_id',
        'status',
        'scheduled_at',
        'address',
        'total_price',
        'notes',
    ];

    protected $casts = [
        'scheduled_at' => 'datetime',
        'total_price' => 'decimal:2',
    ];

    public function client()
    {
        return $this->belongsTo(User::class, 'client_id');
    }

    public function agent()
    {
        return $this->belongsTo(User::class, 'agent_id');
    }

    public function service()
    {
        return $this->belongsTo(Service::class);
    }

    public function review()
    {
        return $this->hasOne(Review::class);
    }
}
