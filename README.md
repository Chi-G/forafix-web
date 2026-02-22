# Forafix - Home Services Marketplace

Forafix is a premium, real-time marketplace connecting clients with skilled professionals (Agents) for home services like cleaning, repairs, plumbing, and electrical work.

## ✨ Key Features

- **Dynamic Service Booking**: Seamless booking flow with real-time availability.
- **Paystack Integration**: Secure payments processed via Paystack with automated receipts.
- **Real-time Notifications**: Powered by Laravel Reverb (Pusher-compatible) for instant updates.
- **Premium UI/UX**: Full dark mode support, glassmorphism aesthetics, and responsive design.
- **Automated Communication**: Instant email confirmations via Mailtrap for successful bookings.

## 🚀 Getting Started

### Prerequisites

- PHP 8.2+
- Node.js & NPM
- MySQL
- [Mailtrap](https://mailtrap.io) account (for development emails)
- [Paystack](https://paystack.com) account (for payment processing)

### Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/Chi-G/forafix-web.git
   cd forafix-web
   ```

2. **Install dependencies:**
   ```bash
   composer install
   npm install
   ```

3. **Environment Setup:**
   Copy `.env.example` to `.env` and configure your credentials:
   ```bash
   cp .env.example .env
   php artisan key:generate
   ```

4. **Database Configuration:**
   Run migrations and seeders:
   ```bash
   php artisan migrate --seed
   ```

5. **Configure Payment & Mail:**
   Add your keys to the `.env` file:
   ```env
   # Paystack
   PAYSTACK_PUBLIC_KEY=your_public_key
   PAYSTACK_SECRET_KEY=your_secret_key
   PAYSTACK_CALLBACK_URL=http://localhost:8000/payment/callback

   # Mailtrap
   MAIL_MAILER=smtp
   MAIL_HOST=sandbox.smtp.mailtrap.io
   MAIL_PORT=2525
   MAIL_USERNAME=your_username
   MAIL_PASSWORD=your_password
   ```

6. **Run the application:**
   ```bash
   # Terminal 1: Vite dev server
   npm run dev

   # Terminal 2: PHP server
   php artisan serve

   # Terminal 3: Reverb server (WebSockets)
   php artisan reverb:start
   ```

## 🛠 Tech Stack

- **Backend**: Laravel 11
- **Frontend**: React (with Vite)
- **Styling**: Tailwind CSS
- **State Management**: Zustand
- **Broadcasting**: Laravel Reverb + Pusher-JS
- **Payments**: Paystack API

## 🔒 Security

This project implements a strict **Content Security Policy (CSP)** to protect against XSS and injection attacks while maintaining compatibility with third-party integrations like Paystack.

---
Built with ❤️ by [Chi-G](https://github.com/Chi-G)
