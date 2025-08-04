# Paystack Integration Setup Guide

This guide will help you set up Paystack payment processing for your FreelanceHub application.

## Overview

Paystack is the leading payment processor in Africa, supporting multiple African currencies and payment methods including:

- **Cards**: Visa, Mastercard, Verve
- **Bank Transfers**: Direct bank transfers
- **USSD**: Dial *code# on mobile phones
- **Mobile Money**: MTN, Airtel, Vodafone
- **QR Codes**: Scan to pay

## Supported Countries & Currencies

- 🇳🇬 **Nigeria** (NGN - Nigerian Naira)
- 🇬🇭 **Ghana** (GHS - Ghanaian Cedi)
- 🇿🇦 **South Africa** (ZAR - South African Rand)
- 🇰🇪 **Kenya** (KES - Kenyan Shilling)
- 🌍 **International** (USD - US Dollar)

## Step 1: Create Paystack Account

1. Visit [https://paystack.com](https://paystack.com)
2. Click "Get Started" and create your account
3. Complete the business verification process
4. Verify your email address

## Step 2: Get Your API Keys

### Test Keys (for development)
1. Log into your Paystack Dashboard
2. Go to **Settings** → **API Keys & Webhooks**
3. Copy your **Test Public Key** (starts with `pk_test_`)
4. Copy your **Test Secret Key** (starts with `sk_test_`)

### Live Keys (for production)
1. Complete business verification
2. Go to **Settings** → **API Keys & Webhooks**
3. Copy your **Live Public Key** (starts with `pk_live_`)
4. Copy your **Live Secret Key** (starts with `sk_live_`)

## Step 3: Configure Environment Variables

1. Copy `.env.example` to `.env.local`:
   ```bash
   cp .env.example .env.local
   ```

2. Update the Paystack configuration in `.env.local`:
   ```bash
   # Paystack Configuration (Test Keys)
   NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY=pk_test_your_actual_public_key_here
   PAYSTACK_SECRET_KEY=sk_test_your_actual_secret_key_here
   ```

3. For production, use live keys:
   ```bash
   # Paystack Configuration (Live Keys)
   NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY=pk_live_your_actual_public_key_here
   PAYSTACK_SECRET_KEY=sk_live_your_actual_secret_key_here
   ```

## Step 4: Test the Integration

1. Restart your development server:
   ```bash
   npm run dev
   ```

2. Navigate to the Wallet tab in your dashboard
3. Try making a test payment using Paystack's test cards:

### Test Card Numbers
- **Successful Payment**: `4084084084084081`
- **Insufficient Funds**: `4084084084084099`
- **Invalid CVV**: Use any card with CVV `000`

### Test Details
- **Expiry**: Any future date (e.g., `12/25`)
- **CVV**: `123` (or `000` for invalid CVV test)
- **PIN**: `1234` (for cards that require PIN)

## Step 5: Test Withdrawals

1. Go to the Withdraw tab
2. Enter a test amount
3. Use these test bank details:

### Test Bank Details (Nigeria)
- **Bank**: Access Bank
- **Account Number**: `0123456789`
- **Account Name**: Will be auto-resolved

### Test Bank Details (Ghana)
- **Bank**: Access Bank Ghana
- **Account Number**: `0123456789`
- **Account Name**: Will be auto-resolved

## Features Implemented

### ✅ Payment Processing
- Real-time payment acceptance
- Multiple payment channels (cards, bank, USSD, mobile money)
- Automatic wallet balance updates
- Transaction history tracking
- Multi-currency support

### ✅ Withdrawal System
- Instant withdrawals to bank accounts
- Bank account verification
- Real-time balance updates
- Transaction tracking
- Multi-currency support

### ✅ Security Features
- Environment variable protection
- Server-side API key handling
- Transaction verification
- Error handling and validation

## API Endpoints

The following API endpoints are available:

- `POST /api/payments/paystack/initialize` - Initialize payment
- `POST /api/payments/paystack/verify` - Verify payment
- `POST /api/payments/paystack/withdraw` - Process withdrawal

## Troubleshooting

### Common Issues

1. **"Paystack is not configured" error**
   - Ensure environment variables are set correctly
   - Restart the development server after adding variables

2. **Payment initialization fails**
   - Check that your public key starts with `pk_test_` or `pk_live_`
   - Verify the key is correctly set in `.env.local`

3. **Withdrawal fails**
   - Ensure you have sufficient balance in your Paystack account
   - Verify bank details are correct
   - Check that your secret key is valid

4. **Account verification fails**
   - Some test account numbers may not resolve
   - Try different test account numbers
   - Ensure the bank code is correct

### Support

- **Paystack Documentation**: [https://paystack.com/docs](https://paystack.com/docs)
- **Paystack Support**: [https://paystack.com/support](https://paystack.com/support)
- **Test Environment**: [https://dashboard.paystack.com](https://dashboard.paystack.com)

## Going Live

When ready for production:

1. Complete business verification on Paystack
2. Update environment variables with live keys
3. Test thoroughly in production environment
4. Monitor transactions in Paystack dashboard

## Security Best Practices

- Never expose secret keys in client-side code
- Use environment variables for all sensitive data
- Regularly rotate API keys
- Monitor transactions for suspicious activity
- Implement proper error handling

---

**🎉 You're all set!** Your FreelanceHub application now supports Paystack payments and withdrawals, perfect for the African market.
