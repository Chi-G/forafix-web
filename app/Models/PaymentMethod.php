<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class PaymentMethod extends Model
{
    protected $fillable = [
        'user_id',
        'brand',
        'last4',
        'expiry',
        'is_default',
        'authorization_code',
        'signature',
        'cardholder_name',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
