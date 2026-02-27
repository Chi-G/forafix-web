<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateProfileRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'name' => 'required|string|max:255',
            'email' => [
                'required',
                Rule::unique('users')->ignore($this->user()->id),
            ],
            'phone' => 'nullable|numeric|min_digits:11',
            'address' => 'nullable|string|max:255',
            'city' => 'nullable|string|max:100',
            'postal_code' => 'nullable|numeric|digits:6',
        ];
    }

    public function messages(): array
    {
        return [
            'postal_code.digits' => 'The postal code must be exactly 6 digits.',
            'postal_code.numeric' => 'The postal code must be a numeric value.',
            'phone.min_digits' => 'The phone number must be at least 11 digits.',
            'phone.numeric' => 'The phone number must be a numeric value.',
        ];
    }
}
