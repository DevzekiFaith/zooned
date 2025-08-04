"use client";

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FaPaypal, 
  FaSpinner, 
  FaCheckCircle, 
  FaExclamationTriangle,
  FaMoneyBillWave,
  FaEnvelope
} from 'react-icons/fa';

interface PayPalWithdrawalProps {
  userId: string;
  availableBalance: number;
  onSuccess?: (details: any) => void;
  onError?: (error: string) => void;
}

export default function PayPalWithdrawal({
  userId,
  availableBalance,
  onSuccess,
  onError
}: PayPalWithdrawalProps) {
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [recipientEmail, setRecipientEmail] = useState('');
  const [description, setDescription] = useState('');
  const [isWithdrawing, setIsWithdrawing] = useState(false);
  const [withdrawError, setWithdrawError] = useState('');
  const [withdrawSuccess, setWithdrawSuccess] = useState(false);

  const handleWithdraw = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const amount = parseFloat(withdrawAmount);
    
    // Validation
    if (!withdrawAmount || !recipientEmail) {
      setWithdrawError('Please enter amount and recipient email');
      return;
    }

    if (amount <= 0 || amount > availableBalance) {
      setWithdrawError('Invalid withdrawal amount');
      return;
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(recipientEmail)) {
      setWithdrawError('Please enter a valid email address');
      return;
    }

    setIsWithdrawing(true);
    setWithdrawError('');
    setWithdrawSuccess(false);

    try {
      const response = await fetch('/api/payments/paypal/payout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId,
          amount,
          recipientEmail,
          description: description || 'Withdrawal from FreelanceHub wallet',
        }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setWithdrawSuccess(true);
        setWithdrawAmount('');
        setRecipientEmail('');
        setDescription('');
        onSuccess?.(data);
      } else {
        setWithdrawError(data.error || 'Withdrawal failed');
        onError?.(data.error || 'Withdrawal failed');
      }
    } catch (error) {
      const errorMsg = 'Network error. Please try again.';
      setWithdrawError(errorMsg);
      onError?.(errorMsg);
    } finally {
      setIsWithdrawing(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
        <div className="flex items-center space-x-2 text-blue-700 dark:text-blue-400 mb-2">
          <FaPaypal />
          <h3 className="font-semibold">PayPal Withdrawal</h3>
        </div>
        <p className="text-sm text-blue-600 dark:text-blue-300">
          Withdraw funds directly to any PayPal account. The recipient will receive an email notification.
        </p>
      </div>

      <AnimatePresence>
        {withdrawError && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4"
          >
            <div className="flex items-center space-x-2 text-red-700 dark:text-red-400">
              <FaExclamationTriangle />
              <span>{withdrawError}</span>
            </div>
          </motion.div>
        )}

        {withdrawSuccess && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4"
          >
            <div className="flex items-center space-x-2 text-green-700 dark:text-green-400">
              <FaCheckCircle />
              <span>Withdrawal initiated successfully! The recipient will receive an email notification.</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <form onSubmit={handleWithdraw} className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-2">
            Withdrawal Amount
          </label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">$</span>
            <input
              type="number"
              step="0.01"
              min="0.01"
              max={availableBalance}
              placeholder="0.00"
              value={withdrawAmount}
              onChange={(e) => setWithdrawAmount(e.target.value)}
              className="w-full pl-8 pr-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-gray-700 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            />
          </div>
          <p className="text-sm text-gray-500 mt-1">
            Available balance: ${availableBalance.toLocaleString()}
          </p>
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">
            <FaEnvelope className="inline mr-1" />
            Recipient PayPal Email
          </label>
          <input
            type="email"
            placeholder="recipient@example.com"
            value={recipientEmail}
            onChange={(e) => setRecipientEmail(e.target.value)}
            className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-gray-700 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            required
          />
          <p className="text-sm text-gray-500 mt-1">
            The recipient will receive the payment at this email address
          </p>
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">
            Description (Optional)
          </label>
          <input
            type="text"
            placeholder="Payment description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-gray-700 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            maxLength={100}
          />
        </div>

        <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
          <h4 className="font-medium mb-2">Withdrawal Summary</h4>
          <div className="space-y-1 text-sm">
            <div className="flex justify-between">
              <span>Amount:</span>
              <span className="font-semibold">${withdrawAmount || '0.00'}</span>
            </div>
            <div className="flex justify-between">
              <span>PayPal Fee:</span>
              <span className="text-gray-600 dark:text-gray-400">Handled by PayPal</span>
            </div>
            <div className="flex justify-between border-t pt-1 mt-2">
              <span className="font-medium">You'll receive:</span>
              <span className="font-semibold">${withdrawAmount || '0.00'}</span>
            </div>
          </div>
        </div>

        <button
          type="submit"
          disabled={isWithdrawing || !withdrawAmount || !recipientEmail}
          className="w-full py-3 px-4 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold flex items-center justify-center space-x-2 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isWithdrawing ? (
            <>
              <FaSpinner className="animate-spin" />
              <span>Processing Withdrawal...</span>
            </>
          ) : (
            <>
              <FaMoneyBillWave />
              <span>Withdraw ${withdrawAmount || '0'} via PayPal</span>
            </>
          )}
        </button>
      </form>

      <div className="text-center">
        <p className="text-xs text-gray-500">
          Withdrawals are processed instantly. The recipient will receive an email notification from PayPal.
        </p>
      </div>
    </div>
  );
}
