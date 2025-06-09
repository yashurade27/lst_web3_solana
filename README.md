# SOL Deposit Vault Service

This service listens for incoming SOL deposits to a vault address and automatically refunds the native SOL back to the sender. Additionally, it mints and burns tokens behind the scenes to accurately track deposit balances.

## How It Works

1. A user sends SOL to the vault address.
2. A webhook triggers upon detecting incoming SOL transfers.
3. The system mints equivalent tokens to the sender's account.
4. It burns tokens from the vault to maintain balance.

## Setup & Run

### Install Dependencies

```bash
npm install
```

Configuration
Update your vault public key in either address.ts or .env (refer to .env.example for guidance).

Run the Server
```bash
tsc
node dist/index.js
```

Webhook Testing
To expose your local server for webhook testing, use a tool like ngrok:

```bash
ngrok http 3000
```

API Endpoint
```
POST /helius
```
Receives webhook notifications for SOL transfers.
Expects an array of transfer events where the toUserAccount matches your vault address.

