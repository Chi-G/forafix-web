<x-mail::message>
# Welcome to Forafix, {{ $user->name }}!

We're thrilled to have you join our community of professionals and service seekers.

At Forafix, we're dedicated to making it easy for you to find and book reliable services or grow your professional business.

<x-mail::button :url="config('app.url') . '/login'">
Get Started
</x-mail::button>

If you have any questions, feel free to reply to this email or visit our help center.

Thanks,<br>
The {{ config('app.name') }} Team
</x-mail::message>
