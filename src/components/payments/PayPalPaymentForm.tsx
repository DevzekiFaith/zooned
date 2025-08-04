"use client";

import { useState, useEffect } from 'react';
import { PayPalScriptProvider, PayPalButtons } from '@paypal/react-paypal-js';
import { motion, AnimatePresence } from 'framer-motion';
import { FaPaypal, FaSpinner, FaCheckCircle, FaExclamationTriangle } from 'react-icons/fa';

interface PayPalPaymentFormProps {
  amount: number;
  description: string;
  userId: string;
  projectId?: string;
  onSuccess?: (details: any) => void;
  onError?: (error: string) => void;
}

export default function PayPalPaymentForm({
  amount,
  description,
  userId,
  projectId,
  onSuccess,
  onError
}: PayPalPaymentFormProps) {
  const [paymentStatus, setPaymentStatus] = useState<'idle' | 'processing' | 'succeeded' | 'failed'>('idle');
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [isCreatingOrder, setIsCreatingOrder] = useState(false);

  // PayPal configuration
  const initialOptions = {
    clientId: process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID || '',
    currency: 'USD',
    intent: 'capture' as const,
  };

  const createOrder = async () => {
    setIsCreatingOrder(true);
    setErrorMessage('');

    try {
      const response = await fetch('/api/payments/paypal/create-order', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          amount,
          description,
          userId,
          projectId,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create PayPal order');
      }

      return data.orderID;
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Failed to create order';
      setErrorMessage(errorMsg);
      onError?.(errorMsg);
      throw error;
    } finally {
      setIsCreatingOrder(false);
    }
  };

  const onApprove = async (data: any) => {
    setPaymentStatus('processing');
    setErrorMessage('');

    try {
      const response = await fetch('/api/payments/paypal/capture-order', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          orderID: data.orderID,
          userId,
        }),
      });

      const captureData = await response.json();

      if (!response.ok) {
        throw new Error(captureData.error || 'Failed to capture payment');
      }

      if (captureData.success) {
        setPaymentStatus('succeeded');
        onSuccess?.(captureData);
      } else {
        throw new Error('Payment was not completed successfully');
      }
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Payment failed';
      setPaymentStatus('failed');
      setErrorMessage(errorMsg);
      onError?.(errorMsg);
    }
  };

  const onPayPalError = (error: any) => {
    console.error('PayPal error:', error);
    setPaymentStatus('failed');
    setErrorMessage('PayPal payment failed. Please try again.');
    onError?.('PayPal payment failed. Please try again.');
  };

  const onCancel = () => {
    setPaymentStatus('idle');
    setErrorMessage('Payment was cancelled');
  };

  if (!process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID) {
    return (
      <div className="max-w-md mx-auto text-center space-y-4">
        <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
          <div className="flex items-center space-x-2 text-yellow-700 dark:text-yellow-400">
            <FaExclamationTriangle />
            <span>PayPal is not configured. Please set NEXT_PUBLIC_PAYPAL_CLIENT_ID.</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto">
      <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 mb-6">
        <h3 className="font-semibold text-lg mb-2 flex items-center gap-2">
          <FaPaypal className="text-blue-600" />
          Payment Details
        </h3>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span>Amount:</span>
            <span className="font-semibold">${amount.toFixed(2)}</span>
          </div>
          <div className="flex justify-between">
            <span>Description:</span>
            <span className="text-gray-600 dark:text-gray-400">{description}</span>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {errorMessage && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 mb-4"
          >
            <div className="flex items-center space-x-2 text-red-700 dark:text-red-400">
              <FaExclamationTriangle />
              <span>{errorMessage}</span>
            </div>
          </motion.div>
        )}

        {paymentStatus === 'succeeded' && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4 mb-4"
          >
            <div className="flex items-center space-x-2 text-green-700 dark:text-green-400">
              <FaCheckCircle />
              <span>Payment successful! Your wallet will be updated shortly.</span>
            </div>
          </motion.div>
        )}

        {paymentStatus === 'processing' && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4 mb-4"
          >
            <div className="flex items-center space-x-2 text-blue-700 dark:text-blue-400">
              <FaSpinner className="animate-spin" />
              <span>Processing payment...</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="bg-white dark:bg-gray-900 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
        <PayPalScriptProvider options={initialOptions}>
          <PayPalButtons
            createOrder={createOrder}
            onApprove={onApprove}
            onError={onPayPalError}
            onCancel={onCancel}
            disabled={paymentStatus === 'processing' || paymentStatus === 'succeeded'}
            style={{
              layout: 'vertical',
              color: 'blue',
              shape: 'rect',
              label: 'paypal',
              height: 45,
            }}
          />
        </PayPalScriptProvider>

        {isCreatingOrder && (
          <div className="flex items-center justify-center py-4">
            <FaSpinner className="animate-spin text-blue-600 mr-2" />
            <span className="text-sm text-gray-600 dark:text-gray-400">Creating order...</span>
          </div>
        )}
      </div>

      <div className="mt-4 text-center">
        <p className="text-xs text-gray-500">
          Secure payment powered by PayPal. Your wallet will be updated in real-time.
        </p>
      </div>
    </div>
  );
}
