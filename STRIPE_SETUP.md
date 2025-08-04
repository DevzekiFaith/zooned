# 🔧 Stripe Payment Setup Guide

The error "Neither apiKey nor config.authenticator provided" occurs because Stripe environment variables are not configured yet.

## Quick Fix Steps:

### 1. Create `.env.local` file in your project root:

```bash
# Firebase Configuration (already working)
NEXT_PUBLIC_FIREBASE_API_KEY=AIzaSyCPgqop5Yhz7S3rvH7QVfZpQSYtDNoYjfs
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=onboarding-3eb95.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=onboarding-3eb95
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=onboarding-3eb95.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=8088933730
NEXT_PUBLIC_FIREBASE_APP_ID=1:8088933730:web:2fa7c9641ef2eb7c48483b

# App Configuration
NEXT_PUBLIC_APP_URL=http://localhost:3000
NODE_ENV=development

# Stripe Configuration - ADD THESE TO FIX THE ERROR
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_your_publishable_key_here
STRIPE_SECRET_KEY=sk_test_your_secret_key_here
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret_here
```

### 2. Get Your Stripe Keys:

1. **Sign up for Stripe**: Go to https://stripe.com and create an account
2. **Get Test Keys**: In your Stripe Dashboard → Developers → API Keys
   - Copy the **Publishable key** (starts with `pk_test_`)
   - Copy the **Secret key** (starts with `sk_test_`)
3. **Replace the placeholder values** in your `.env.local` file

### 3. For Development/Testing (Temporary Fix):

If you want to test the app without Stripe payments right now, you can use these test values:

```bash
# Temporary test values (payments won't work but app won't crash)
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_temp_key
STRIPE_SECRET_KEY=sk_test_temp_key
STRIPE_WEBHOOK_SECRET=whsec_temp_key
```

### 4. Restart Your Development Server:

```bash
npm run dev
```

## What This Fixes:

- ✅ Removes the "Neither apiKey nor config.authenticator provided" error
- ✅ Allows the wallet component to load properly
- ✅ Enables payment processing when real keys are added
- ✅ Provides graceful error handling for missing configuration

## Next Steps:

1. **Add real Stripe keys** for payment processing
2. **Set up webhooks** in Stripe Dashboard (for production)
3. **Test payment flow** with Stripe test cards

The app will work without errors once you create the `.env.local` file with the Stripe keys!
