declare module '@paystack/inline-js' {
  export interface PaystackOptions {
    key: string;
    email?: string;
    amount?: number;
    currency?: string;
    ref?: string;
    callback?: (response: any) => void;
    onClose?: () => void;
    metadata?: any;
    channels?: string[];
  }

  export interface PaystackResponse {
    reference: string;
    status: string;
    message: string;
    trans: string;
    transaction: string;
    trxref: string;
  }

  export class PaystackPop {
    static setup(options: { key: string }): {
      newTransaction: (options: PaystackOptions) => void;
    };
  }
}

declare module 'paystack-js' {
  export interface PaystackInstance {
    initialize: (options: PaystackOptions) => void;
  }

  export interface PaystackOptions {
    key: string;
    email: string;
    amount: number;
    currency?: string;
    ref?: string;
    callback: (response: any) => void;
    onClose?: () => void;
    metadata?: any;
    channels?: string[];
  }

  export default function PaystackPop(key: string): PaystackInstance;
}
