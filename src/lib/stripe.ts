import { loadStripe } from '@stripe/stripe-js';
import Stripe from 'stripe';

// Validate Stripe configuration
const validateStripeConfig = () => {
  if (typeof window !== 'undefined') {
    // Client-side validation
    if (!process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY) {
      console.warn('NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY is not set. Stripe payments will not work.');
      return false;
    }
  } else {
    // Server-side validation
    if (!process.env.STRIPE_SECRET_KEY) {
      console.warn('STRIPE_SECRET_KEY is not set. Stripe server operations will not work.');
      return false;
    }
  }
  return true;
};

// Initialize Stripe.js on the client side with validation
export const stripePromise = typeof window !== 'undefined' && validateStripeConfig() 
  ? loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!)
  : Promise.resolve(null);

// Initialize Stripe on the server side with validation
export const stripe = typeof window === 'undefined' && process.env.STRIPE_SECRET_KEY
  ? new Stripe(process.env.STRIPE_SECRET_KEY, {
      apiVersion: '2025-07-30.basil',
    })
  : null;

// Stripe configuration constants
export const STRIPE_CONFIG = {
  currency: 'usd',
  payment_method_types: ['card'],
  mode: 'payment' as const,
};

// Bank account validation for withdrawals
export interface BankAccount {
  id: string;
  accountHolderName: string;
  accountNumber: string;
  routingNumber: string;
  bankName: string;
  accountType: 'checking' | 'savings';
  isDefault: boolean;
  isVerified: boolean;
  country: string;
}

// Payment intent metadata
export interface PaymentMetadata {
  userId: string;
  projectId?: string;
  description: string;
  type: 'project_payment' | 'milestone_payment' | 'bonus_payment';
}
