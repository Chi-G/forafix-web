<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <style>
        body { font-family: 'Inter', sans-serif; color: #1a202c; line-height: 1.6; }
        .container { max-width: 600px; margin: 0 auto; padding: 40px 20px; }
        .header { text-align: center; margin-bottom: 40px; }
        .logo { color: #14a800; font-size: 24px; font-weight: 900; }
        .success-icon { color: #14a800; font-size: 48px; margin: 20px 0; }
        .card { background: #f8fafc; border-radius: 24px; padding: 40px; border: 1px solid #e2e8f0; }
        .booking-info { margin: 30px 0; }
        .info-row { display: flex; justify-content: space-between; margin-bottom: 15px; border-bottom: 1px solid #edf2f7; padding-bottom: 10px; }
        .info-label { color: #718096; font-size: 12px; font-weight: 700; text-transform: uppercase; }
        .info-value { font-weight: 700; color: #2d3748; }
        .footer { text-align: center; margin-top: 40px; color: #718096; font-size: 14px; }
        .button { background: #14a800; color: white; padding: 16px 32px; border-radius: 12px; text-decoration: none; font-weight: 700; display: inline-block; margin-top: 20px; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <div class="logo">Forafix</div>
            <div class="success-icon">✓</div>
            <h1>Booking Confirmed!</h1>
            <p>Hi {{ $booking->client->name }}, your payment for <strong>{{ $booking->service->name }}</strong> was successful.</p>
        </div>

        <div class="card">
            <h3 style="margin-top: 0;">Order Summary</h3>
            <div class="booking-info">
                <div class="info-row">
                    <span class="info-label">Professional</span>
                    <span class="info-value">{{ $booking->agent->name }}</span>
                </div>
                <div class="info-row">
                    <span class="info-label">Service</span>
                    <span class="info-value">{{ $booking->service->name }}</span>
                </div>
                <div class="info-row">
                    <span class="info-label">Date & Time</span>
                    <span class="info-value">{{ $booking->scheduled_at->format('M d, Y @ h:i A') }}</span>
                </div>
                <div class="info-row">
                    <span class="info-label">Address</span>
                    <span class="info-value">{{ $booking->address }}</span>
                </div>
                <div class="info-row" style="border-bottom: none;">
                    <span class="info-label">Amount Paid</span>
                    <span class="info-value" style="color: #14a800;">₦{{ number_format($booking->total_price, 2) }}</span>
                </div>
            </div>

            <div style="text-align: center;">
                <a href="{{ url('/cl/messages/rooms') }}" class="button">Chat with Professional</a>
            </div>
        </div>

        <div class="footer">
            <p>Transation Reference: {{ 'B-' . $booking->id }}</p>
            <p>&copy; {{ date('Y') }} Forafix. All rights reserved.</p>
        </div>
    </div>
</body>
</html>
