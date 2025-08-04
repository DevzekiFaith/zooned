"use client";

import { useState } from 'react';
import { Elements } from '@stripe/react-stripe-js';
import { stripePromise } from '@/lib/stripe';
import { PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { FaCreditCard, FaSpinner, FaCheckCircle, FaExclamationTriangle } from 'react-icons/fa';
import { motion, AnimatePresence } from 'framer-motion';

interface PaymentFormProps {
  amount: number;
  description: string;
  userId: string;
  projectId?: string;
  onSuccess?: (paymentIntentId: string) => void;
  onError?: (error: string) => void;
}

interface CheckoutFormProps extends PaymentFormProps {
  clientSecret: string;
}

function CheckoutForm({ 
  amount, 
  description, 
  userId, 
  projectId, 
  clientSecret,
  onSuccess,
  onError 
}: CheckoutFormProps) {
  const stripe = useStripe();
  const elements = useElements();
  const [isLoading, setIsLoading] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState<'idle' | 'processing' | 'succeeded' | 'failed'>('idle');
  const [errorMessage, setErrorMessage] = useState<string>('');

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    setIsLoading(true);
    setPaymentStatus('processing');
    setErrorMessage('');

    try {
      const { error, paymentIntent } = await stripe.confirmPayment({
        elements,
        confirmParams: {
          return_url: `${window.location.origin}/dashboard?payment=success`,
        },
        redirect: 'if_required',
      });

      if (error) {
        setPaymentStatus('failed');
        setErrorMessage(error.message || 'Payment failed');
        onError?.(error.message || 'Payment failed');
      } else if (paymentIntent && paymentIntent.status === 'succeeded') {
        setPaymentStatus('succeeded');
        onSuccess?.(paymentIntent.id);
      }
    } catch (err) {
      setPaymentStatus('failed');
      setErrorMessage('An unexpected error occurred');
      onError?.('An unexpected error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto">
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
          <h3 className="font-semibold text-lg mb-2">Payment Details</h3>
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

        <div className="bg-white dark:bg-gray-900 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
          <PaymentElement 
            options={{
              layout: 'tabs',
            }}
          />
        </div>

        <AnimatePresence>
          {errorMessage && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4"
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
              className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4"
            >
              <div className="flex items-center space-x-2 text-green-700 dark:text-green-400">
                <FaCheckCircle />
                <span>Payment successful! Your wallet will be updated shortly.</span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <button
          type="submit"
          disabled={!stripe || isLoading || paymentStatus === 'succeeded'}
          className={`w-full py-3 px-4 rounded-lg font-semibold flex items-center justify-center space-x-2 transition-all duration-200 ${
            isLoading || paymentStatus === 'succeeded'
              ? 'bg-gray-400 cursor-not-allowed'
              : 'bg-blue-600 hover:bg-blue-700 text-white'
          }`}
        >
          {isLoading ? (
            <>
              <FaSpinner className="animate-spin" />
              <span>Processing...</span>
            </>
          ) : paymentStatus === 'succeeded' ? (
            <>
              <FaCheckCircle />
              <span>Payment Complete</span>
            </>
          ) : (
            <>
              <FaCreditCard />
              <span>Pay ${amount.toFixed(2)}</span>
            </>
          )}
        </button>
      </form>
    </div>
  );
}

export default function PaymentForm(props: PaymentFormProps) {
  const [clientSecret, setClientSecret] = useState<string>('');
  const [isCreatingIntent, setIsCreatingIntent] = useState(false);
  const [error, setError] = useState<string>('');

  const createPaymentIntent = async () => {
    setIsCreatingIntent(true);
    setError('');

    try {
      const response = await fetch('/api/payments/create-payment-intent', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          amount: props.amount,
          metadata: {
            userId: props.userId,
            projectId: props.projectId,
            description: props.description,
            type: 'project_payment',
          },
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create payment intent');
      }

      setClientSecret(data.clientSecret);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to initialize payment');
      props.onError?.(err instanceof Error ? err.message : 'Failed to initialize payment');
    } finally {
      setIsCreatingIntent(false);
    }
  };

  if (!clientSecret) {
    return (
      <div className="max-w-md mx-auto text-center space-y-4">
        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
          <FaCreditCard className="text-4xl text-blue-600 mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">Ready to Pay</h3>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            You're about to pay <strong>${props.amount.toFixed(2)}</strong> for {props.description}
          </p>
          
          {error && (
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-3 mb-4">
              <div className="flex items-center space-x-2 text-red-700 dark:text-red-400 text-sm">
                <FaExclamationTriangle />
                <span>{error}</span>
              </div>
            </div>
          )}

          <button
            onClick={createPaymentIntent}
            disabled={isCreatingIntent}
            className="w-full py-3 px-4 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold flex items-center justify-center space-x-2 transition-colors duration-200 disabled:bg-gray-400 disabled:cursor-not-allowed"
          >
            {isCreatingIntent ? (
              <>
                <FaSpinner className="animate-spin" />
                <span>Initializing...</span>
              </>
            ) : (
              <>
                <FaCreditCard />
                <span>Continue to Payment</span>
              </>
            )}
          </button>
        </div>
      </div>
    );
  }

  return (
    <Elements 
      stripe={stripePromise} 
      options={{ 
        clientSecret,
        appearance: {
          theme: 'stripe',
          variables: {
            colorPrimary: '#2563eb',
          },
        },
      }}
    >
      <CheckoutForm {...props} clientSecret={clientSecret} />
    </Elements>
  );
}
