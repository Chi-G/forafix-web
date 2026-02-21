<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreBookingRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'service_id' => 'required|exists:services,id',
            'agent_id' => 'required|exists:users,id',
            'scheduled_at' => 'required|date|after:now',
            'address' => 'required|string|max:500',
            'notes' => 'nullable|string|max:1000',
        ];
    }
}
