<?php

namespace App\Models;

// use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;

use Laravel\Sanctum\HasApiTokens;

class User extends Authenticatable implements \Illuminate\Contracts\Auth\MustVerifyEmail
{
    /** @use HasFactory<\Database\Factories\UserFactory> */
    use HasApiTokens, HasFactory, Notifiable, \Illuminate\Auth\MustVerifyEmail;

    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    protected $fillable = [
        'name',
        'email',
        'phone',
        'password',
        'role',
        'uuid',
        'is_vetted',
        'loyalty_points',
        'balance',
        'avatar_url',
        'google_id',
        'avatar',
        'two_factor_secret',
        'two_factor_recovery_codes',
        'two_factor_confirmed_at',
    ];

    /**
     * The "booted" method of the model.
     */
    protected static function booted(): void
    {
        static::saving(function (User $user) {
            if (!$user->uuid) {
                $user->uuid = (string) \Illuminate\Support\Str::uuid();
            }
        });
    }

    /**
     * The attributes that should be hidden for serialization.
     *
     * @var list<string>
     */
    protected $hidden = [
        'password',
        'remember_token',
        'two_factor_secret',
        'two_factor_recovery_codes',
    ];

    /**
     * Get the attributes that should be cast.
     *
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
            'is_vetted' => 'boolean',
            'balance' => 'decimal:2',
            'two_factor_confirmed_at' => 'datetime',
        ];
    }

    /* Relationships */

    public function bookings()
    {
        return $this->hasMany(Booking::class, 'client_id');
    }

    public function jobs()
    {
        return $this->hasMany(Booking::class, 'agent_id');
    }

    public function agentProfile()
    {
        return $this->hasOne(AgentProfile::class);
    }

    public function services()
    {
        return $this->belongsToMany(Service::class);
    }

    public function notifications()
    {
        return $this->hasMany(Notification::class);
    }

    public function unreadNotifications()
    {
        return $this->hasMany(Notification::class)->whereNull('read_at');
    }
}
