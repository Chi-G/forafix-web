<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class UpdateAgentProfileRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()->role === 'AGENT';
    }

    public function rules(): array
    {
        return [
            'bio' => 'nullable|string|max:2000',
            'skills' => 'nullable|array',
            'skills.*' => 'string|max:50',
            'location_base' => 'nullable|string|max:255',
        ];
    }
}
