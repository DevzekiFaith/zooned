// Paystack will be loaded via script tag

// Paystack configuration
export const PAYSTACK_CONFIG = {
  currency: 'NGN', // Nigerian Naira - can be changed to GHS, ZAR, KES, etc.
  channels: ['card', 'bank', 'ussd', 'qr', 'mobile_money', 'bank_transfer'],
  environment: process.env.NODE_ENV === 'production' ? 'live' : 'test',
};

// Supported African currencies
export const SUPPORTED_CURRENCIES = {
  NGN: 'Nigerian Naira',
  GHS: 'Ghanaian Cedi',
  ZAR: 'South African Rand',
  KES: 'Kenyan Shilling',
  USD: 'US Dollar',
};

// Validate Paystack configuration
const validatePaystackConfig = () => {
  if (typeof window !== 'undefined') {
    // Client-side validation
    if (!process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY) {
      console.warn('NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY is not set. Paystack payments will not work.');
      return false;
    }
  } else {
    // Server-side validation
    if (!process.env.PAYSTACK_SECRET_KEY) {
      console.warn('PAYSTACK_SECRET_KEY is not set. Paystack server operations will not work.');
      return false;
    }
  }
  return true;
};

// Initialize Paystack popup (will be loaded via script tag)
export const initializePaystack = () => {
  if (!validatePaystackConfig()) {
    return null;
  }

  // Paystack will be available on window object after script loads
  return true;
};

// Paystack API base URL
export const getPaystackApiUrl = () => {
  return 'https://api.paystack.co';
};

// Get Paystack headers for API requests
export const getPaystackHeaders = () => {
  return {
    'Authorization': `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
    'Content-Type': 'application/json',
  };
};

// Paystack transaction initialization interface
export interface PaystackTransactionRequest {
  amount: number; // Amount in kobo (for NGN) or smallest currency unit
  currency?: string;
  email: string;
  reference?: string;
  callback_url?: string;
  userId: string; // Add userId as a direct property
  projectId?: string; // Add projectId as a direct property
  description?: string; // Add description as a direct property
  metadata?: {
    userId: string;
    projectId?: string;
    description?: string;
  };
}

// Paystack transfer recipient interface
export interface PaystackTransferRecipient {
  type: 'nuban' | 'mobile_money' | 'basa';
  name: string;
  account_number: string;
  bank_code: string;
  currency?: string;
  metadata?: {
    userId: string;
    description?: string;
  };
}

// Paystack transfer interface
export interface PaystackTransferRequest {
  source: 'balance';
  amount: number; // Amount in kobo or smallest currency unit
  recipient: string; // Recipient code
  reason?: string;
  currency?: string;
  reference?: string;
}

// Convert amount to kobo (for NGN) or smallest currency unit
export const convertToKobo = (amount: number, currency: string = 'NGN'): number => {
  // Most African currencies use 100 subunits (kobo, pesewas, cents)
  return Math.round(amount * 100);
};

// Convert from kobo to main currency unit
export const convertFromKobo = (amount: number, currency: string = 'NGN'): number => {
  return amount / 100;
};

// Generate unique reference
export const generateReference = (prefix: string = 'tx'): string => {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
};
