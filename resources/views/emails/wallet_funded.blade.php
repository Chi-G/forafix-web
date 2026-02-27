<x-mail::message>
# Wallet Funded Successfully! 🚀

Hi {{ $transaction->user->name }},

Your forafix wallet has been successfully funded with **₦{{ number_format($transaction->amount, 2) }}**.

Your new balance is **₦{{ number_format($transaction->user->balance, 2) }}**.

<x-mail::panel>
**Transaction Details:**
- **Reference:** {{ $transaction->reference }}
- **Amount:** ₦{{ number_format($transaction->amount, 2) }}
- **Date:** {{ $transaction->created_at->format('M d, Y h:i A') }}
</x-mail::panel>

You can now use these funds to book any service on the platform.

<x-mail::button :url="config('app.url') . '/cl/settings?tab=billing'">
View Wallet History
</x-mail::button>

Thanks,<br>
{{ config('app.name') }}
</x-mail::message>
