# Database Schema & Data Integrity

This document outlines the database design principles and integrity measures implemented in Forafix to ensure a reliable and secure platform.

## Database Tables & Relationships

### Core Entities
- **Users**: Central repository for all actors (Clients, Agents, Admins).
- **Services**: Categories of work available on the platform (e.g., Cleaning, Plumbing).
- **Agent Profiles**: Specific professional details for users with the 'agent' role.
- **Bookings**: Tracks the lifecycle of a service request between a Client and an Agent.

### Financial/Ledger System
- **Transactions**: An immutable ledger of all balance-affecting events.
- **Payment Methods**: Stores tokenized payment details (Paystack) for recurring or easy payments.
- **Idempotency Keys**: Prevents accidental double-processing of financial transactions.

### Integrity Measures

#### 1. Foreign Key Constraints
All relationships use database-level foreign keys to ensure referential integrity. 
- A `Booking` cannot exist without a valid `Service`, `Client`, and `Agent`.
- Deleting a `User` (though rare) is handled via logical flags or cascading where safe.

#### 2. Row-Level Locking (`lockForUpdate`)
To prevent race conditions (e.g., two requests deducting from the same balance simultaneously), we use `lockForUpdate`.
```php
DB::transaction(function () use ($userId, $amount) {
    $user = User::where('id', $userId)->lockForUpdate()->first();
    $user->balance -= $amount;
    $user->save();
});
```

#### 3. Transaction Safety
All multi-step state changes (Booking + Payment + Notification) are wrapped in `DB::transaction`. If any step fails, the entire operation is rolled back, preventing "zombie" states.

#### 4. Idempotency Middleware
The `X-Idempotency-Key` header is checked on all financial endpoints. If a client retries a request (e.g., due to a network timeout), the server detects the duplicate key and returns the original response instead of processing the payment again.

#### 5. Webhook Reliability
- Raw webhook payloads are logged to `webhook_logs` before processing.
- Webhooks are idempotent: checking if a transaction is already 'success' before applying funds.
- Signatures are verified using `hash_hmac` with the provider's secret.
