<!DOCTYPE html>
<html lang="{{ str_replace('_', '-', app()->getLocale()) }}">
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <meta http-equiv="Content-Security-Policy" content="script-src 'self' 'unsafe-inline' https://js.paystack.co https://checkout.paystack.com https://checkout.gointerpay.net https://checkout.rch.io https://www.googletagmanager.com https://s3-eu-west-1.amazonaws.com https://applepay.cdn-apple.com; script-src-elem 'self' 'unsafe-inline' https://js.paystack.co https://checkout.paystack.com https://checkout.gointerpay.net https://checkout.rch.io https://www.googletagmanager.com https://s3-eu-west-1.amazonaws.com https://applepay.cdn-apple.com;">

        <title>Forafix - Home Services Marketplace</title>

        <!-- Fonts -->
        <link rel="preconnect" href="https://fonts.googleapis.com">
        <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">

        @viteReactRefresh
        @vite(['resources/css/app.css', 'resources/js/app.tsx'])
        <script src="https://js.paystack.co/v1/inline.js"></script>
    </head>
    <body class="antialiased">
        <div id="app"></div>
    </body>
</html>
