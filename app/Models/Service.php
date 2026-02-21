<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Service extends Model
{
    use HasFactory;
    protected $fillable = [
        'name',
        'category',
        'description',
        'base_price',
        'icon',
    ];

    public function bookings()
    {
        return $this->hasMany(Booking::class);
    }

    public function agents()
    {
        return $this->belongsToMany(User::class);
    }
}
