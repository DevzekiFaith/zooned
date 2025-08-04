"use client";

import { useState } from 'react';
import { FaCreditCard, FaMoneyBillWave, FaMobile, FaUniversity } from 'react-icons/fa';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { useAuthContext } from '@/contexts/AuthContext';
// Using Paystack inline script approach
declare global {
  interface Window {
    PaystackPop: {
      setup: (options: { key: string }) => {
        newTransaction: (options: any) => void;
      };
    };
  }
}

interface PaystackPaymentFormProps {
  onPaymentSuccess?: (data: any) => void;
}

interface PaystackResponse {
  status: string;
  reference: string;
  message?: string;
  trans?: string;
  transaction?: string;
  trxref?: string;
}

export default function PaystackPaymentForm({ onPaymentSuccess }: PaystackPaymentFormProps) {
  const { user } = useAuthContext();
  const [amount, setAmount] = useState('');
  const [currency, setCurrency] = useState('NGN');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);

  const currencies = [
    { code: 'NGN', name: 'Nigerian Naira', symbol: '₦' },
    { code: 'GHS', name: 'Ghanaian Cedi', symbol: 'GH₵' },
    { code: 'ZAR', name: 'South African Rand', symbol: 'R' },
    { code: 'KES', name: 'Kenyan Shilling', symbol: 'KSh' },
    { code: 'USD', name: 'US Dollar', symbol: '$' },
  ];

  const paymentChannels = [
    { id: 'card', name: 'Debit/Credit Card', icon: FaCreditCard, description: 'Visa, Mastercard, Verve' },
    { id: 'bank', name: 'Bank Transfer', icon: FaUniversity, description: 'Direct bank transfer' },
    { id: 'ussd', name: 'USSD', icon: FaMobile, description: 'Dial *code# on your phone' },
    { id: 'mobile_money', name: 'Mobile Money', icon: FaMoneyBillWave, description: 'MTN, Airtel, Vodafone' },
  ];

  const selectedCurrency = currencies.find(c => c.code === currency);

  const handlePayment = async () => {
    if (!user) {
      toast.error('Please log in to make a payment');
      return;
    }

    if (!amount || parseFloat(amount) <= 0) {
      toast.error('Please enter a valid amount');
      return;
    }

    if (!process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY) {
      toast.error('Paystack is not configured');
      return;
    }

    setLoading(true);

    try {
      // Initialize transaction with backend
      const initResponse = await fetch('/api/payments/paystack/initialize', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          amount: parseFloat(amount),
          currency,
          email: user?.email || '',
          userId: user?.uid || '',
          description: description || 'Freelance service payment',
        }),
      });

      if (!initResponse.ok) {
        const errorData = await initResponse.json();
        throw new Error(errorData.error || 'Failed to initialize payment');
      }

      const initData = await initResponse.json();

      if (!initData.status) {
        throw new Error(initData.error || 'Failed to initialize payment');
      }

      // Load Paystack script if not already loaded
      if (!window.PaystackPop) {
        const script = document.createElement('script');
        script.src = 'https://js.paystack.co/v1/inline.js';
        script.onload = () => {
          initializePayment(initData);
        };
        document.head.appendChild(script);
        return;
      }

      initializePayment(initData);
    } catch (error) {
      console.error('Payment error:', error);
      toast.error(error instanceof Error ? error.message : 'Payment failed');
      setLoading(false);
    }
  };

  const initializePayment = (initData: any) => {
    try {
      // Initialize Paystack popup
      const paystack = window.PaystackPop.setup({
        key: process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY!,
      });

      paystack.newTransaction({
        key: process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY!,
        email: user?.email || '',
        amount: parseFloat(amount) * 100, // Convert to kobo
        currency,
        ref: initData.data.reference,
        metadata: {
          userId: user?.uid || '',
          description: description || 'Freelance service payment',
        },
        callback: async (response: PaystackResponse) => {
          if (response.status === 'success') {
            try {
              // Verify payment with backend
              const verifyResponse = await fetch('/api/payments/paystack/verify', {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                  reference: response.reference,
                  userId: user?.uid || '',
                }),
              });

              if (verifyResponse.ok) {
                const verifyData = await verifyResponse.json();
                if (verifyData.status) {
                  toast.success(`Payment successful! ${selectedCurrency?.symbol}${amount} added to your wallet`);
                  setAmount('');
                  setDescription('');
                  onPaymentSuccess?.(verifyData.data);
                } else {
                  toast.error('Payment verification failed');
                }
              } else {
                toast.error('Payment verification failed');
              }
            } catch (error) {
              console.error('Payment verification error:', error);
              toast.error('Payment verification failed');
            }
          } else {
            toast.error('Payment was not successful');
          }
          setLoading(false);
        },
        onClose: () => {
          setLoading(false);
          toast.error('Payment cancelled');
        },
      });

    } catch (error) {
      console.error('Payment error:', error);
      toast.error(error instanceof Error ? error.message : 'Payment failed');
      setLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6"
    >
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 bg-green-100 dark:bg-green-900 rounded-lg">
          <FaCreditCard className="text-green-600 dark:text-green-400" />
        </div>
        <div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Receive Payment
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Accept payments via Paystack
          </p>
        </div>
      </div>

      <div className="space-y-4">
        {/* Currency Selection */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Currency
          </label>
          <select
            value={currency}
            onChange={(e) => setCurrency(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          >
            {currencies.map((curr) => (
              <option key={curr.code} value={curr.code}>
                {curr.symbol} {curr.name} ({curr.code})
              </option>
            ))}
          </select>
        </div>

        {/* Amount Input */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Amount ({selectedCurrency?.symbol})
          </label>
          <input
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="0.00"
            min="1"
            step="0.01"
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          />
        </div>

        {/* Description */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Description (Optional)
          </label>
          <input
            type="text"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Payment for services..."
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          />
        </div>

        {/* Payment Channels Info */}
        <div>
          <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
            Supported Payment Methods:
          </p>
          <div className="grid grid-cols-2 gap-2">
            {paymentChannels.map((channel) => (
              <div
                key={channel.id}
                className="flex items-center gap-2 p-2 bg-gray-50 dark:bg-gray-700 rounded-lg"
              >
                <channel.icon className="text-green-600 dark:text-green-400 text-sm" />
                <div>
                  <p className="text-xs font-medium text-gray-900 dark:text-white">
                    {channel.name}
                  </p>
                  <p className="text-xs text-gray-600 dark:text-gray-400">
                    {channel.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Payment Button */}
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={handlePayment}
          disabled={loading || !amount || parseFloat(amount) <= 0}
          className="w-full bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white font-medium py-3 px-4 rounded-lg transition-colors duration-200 flex items-center justify-center gap-2"
        >
          {loading ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
              Processing...
            </>
          ) : (
            <>
              <FaCreditCard />
              Pay {selectedCurrency?.symbol}{amount || '0.00'}
            </>
          )}
        </motion.button>

        <p className="text-xs text-gray-600 dark:text-gray-400 text-center">
          Secure payments powered by Paystack. Your payment information is encrypted and secure.
        </p>
      </div>
    </motion.div>
  );
}
