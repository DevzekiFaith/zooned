import { loadScript } from '@paypal/paypal-js';

// PayPal configuration
export const PAYPAL_CONFIG = {
  currency: 'USD',
  intent: 'capture' as const,
  environment: process.env.NODE_ENV === 'production' ? 'production' : 'sandbox',
};

// Validate PayPal configuration
const validatePayPalConfig = () => {
  if (typeof window !== 'undefined') {
    // Client-side validation
    if (!process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID) {
      console.warn('NEXT_PUBLIC_PAYPAL_CLIENT_ID is not set. PayPal payments will not work.');
      return false;
    }
  } else {
    // Server-side validation
    if (!process.env.PAYPAL_CLIENT_SECRET) {
      console.warn('PAYPAL_CLIENT_SECRET is not set. PayPal server operations will not work.');
      return false;
    }
  }
  return true;
};

// Initialize PayPal SDK
export const initializePayPal = async () => {
  if (!validatePayPalConfig()) {
    return null;
  }

  try {
    const paypal = await loadScript({
      clientId: process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID!,
      currency: PAYPAL_CONFIG.currency,
      intent: PAYPAL_CONFIG.intent,
    });

    return paypal;
  } catch (error) {
    console.error('Failed to load PayPal SDK:', error);
    return null;
  }
};

// PayPal API base URL
export const getPayPalApiUrl = () => {
  return PAYPAL_CONFIG.environment === 'production'
    ? 'https://api-m.paypal.com'
    : 'https://api-m.sandbox.paypal.com';
};

// Get PayPal access token for server-side operations
export const getPayPalAccessToken = async (): Promise<string | null> => {
  if (!process.env.PAYPAL_CLIENT_SECRET || !process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID) {
    console.error('PayPal credentials not configured');
    return null;
  }

  try {
    const auth = Buffer.from(
      `${process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID}:${process.env.PAYPAL_CLIENT_SECRET}`
    ).toString('base64');

    const response = await fetch(`${getPayPalApiUrl()}/v1/oauth2/token`, {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${auth}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: 'grant_type=client_credentials',
    });

    if (!response.ok) {
      throw new Error(`PayPal auth failed: ${response.statusText}`);
    }

    const data = await response.json();
    return data.access_token;
  } catch (error) {
    console.error('Failed to get PayPal access token:', error);
    return null;
  }
};

// PayPal order creation interface
export interface PayPalOrderRequest {
  amount: number;
  currency?: string;
  description?: string;
  userId: string;
  projectId?: string;
}

// PayPal payout interface for withdrawals
export interface PayPalPayoutRequest {
  amount: number;
  currency?: string;
  recipientEmail: string;
  userId: string;
  description?: string;
}
