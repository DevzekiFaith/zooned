"use client";

import { useState, useEffect } from 'react';
import { FaUniversity, FaArrowDown, FaSpinner } from 'react-icons/fa';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { useAuthContext } from '@/contexts/AuthContext';

interface PaystackWithdrawalProps {
  walletBalance: number;
  onWithdrawalSuccess?: (data: any) => void;
}

interface Bank {
  name: string;
  code: string;
  longcode: string;
  gateway: string;
  pay_with_bank: boolean;
  active: boolean;
  country: string;
  currency: string;
  type: string;
  is_deleted: boolean;
  createdAt: string;
  updatedAt: string;
}

export default function PaystackWithdrawal({ walletBalance, onWithdrawalSuccess }: PaystackWithdrawalProps) {
  const { user } = useAuthContext();
  const [amount, setAmount] = useState('');
  const [currency, setCurrency] = useState('NGN');
  const [accountNumber, setAccountNumber] = useState('');
  const [accountName, setAccountName] = useState('');
  const [bankCode, setBankCode] = useState('');
  const [reason, setReason] = useState('');
  const [loading, setLoading] = useState(false);
  const [verifyingAccount, setVerifyingAccount] = useState(false);
  const [banks, setBanks] = useState<Bank[]>([]);
  const [loadingBanks, setLoadingBanks] = useState(true);

  const currencies = [
    { code: 'NGN', name: 'Nigerian Naira', symbol: '₦' },
    { code: 'GHS', name: 'Ghanaian Cedi', symbol: 'GH₵' },
    { code: 'ZAR', name: 'South African Rand', symbol: 'R' },
    { code: 'KES', name: 'Kenyan Shilling', symbol: 'KSh' },
  ];

  const selectedCurrency = currencies.find(c => c.code === currency);

  // Fetch banks from Paystack
  useEffect(() => {
    const fetchBanks = async () => {
      try {
        const response = await fetch(`https://api.paystack.co/bank?currency=${currency}&country=${getCountryFromCurrency(currency)}`);
        if (response.ok) {
          const data = await response.json();
          if (data.status && data.data) {
            setBanks(data.data.filter((bank: Bank) => bank.active && !bank.is_deleted));
          }
        }
      } catch (error) {
        console.error('Error fetching banks:', error);
      } finally {
        setLoadingBanks(false);
      }
    };

    fetchBanks();
  }, [currency]);

  const getCountryFromCurrency = (curr: string) => {
    const countryMap: { [key: string]: string } = {
      'NGN': 'nigeria',
      'GHS': 'ghana',
      'ZAR': 'south-africa',
      'KES': 'kenya',
    };
    return countryMap[curr] || 'nigeria';
  };

  // Verify account name
  const verifyAccountName = async () => {
    if (!accountNumber || !bankCode) {
      toast.error('Please enter account number and select a bank');
      return;
    }

    setVerifyingAccount(true);
    try {
      const response = await fetch(`https://api.paystack.co/bank/resolve?account_number=${accountNumber}&bank_code=${bankCode}`, {
        headers: {
          'Authorization': `Bearer ${process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        if (data.status && data.data) {
          setAccountName(data.data.account_name);
          toast.success('Account verified successfully');
        } else {
          toast.error('Could not verify account');
        }
      } else {
        toast.error('Could not verify account');
      }
    } catch (error) {
      console.error('Account verification error:', error);
      toast.error('Could not verify account');
    } finally {
      setVerifyingAccount(false);
    }
  };

  const handleWithdrawal = async () => {
    if (!user) {
      toast.error('Please log in to make a withdrawal');
      return;
    }

    const withdrawAmount = parseFloat(amount);
    if (!amount || withdrawAmount <= 0) {
      toast.error('Please enter a valid amount');
      return;
    }

    if (withdrawAmount > walletBalance) {
      toast.error('Insufficient wallet balance');
      return;
    }

    if (!accountNumber || !bankCode || !accountName) {
      toast.error('Please fill in all bank details');
      return;
    }

    setLoading(true);

    try {
      const response = await fetch('/api/payments/paystack/withdraw', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          amount: withdrawAmount,
          currency,
          userId: user?.uid || '',
          bankCode,
          accountNumber,
          accountName,
          reason: reason || 'Freelance earnings withdrawal',
        }),
      });

      if (response.ok) {
        const data = await response.json();
        if (data.status) {
          toast.success(`Withdrawal of ${selectedCurrency?.symbol}${amount} initiated successfully!`);
          setAmount('');
          setAccountNumber('');
          setAccountName('');
          setBankCode('');
          setReason('');
          onWithdrawalSuccess?.(data.data);
        } else {
          toast.error(data.error || 'Withdrawal failed');
        }
      } else {
        const errorData = await response.json();
        toast.error(errorData.error || 'Withdrawal failed');
      }
    } catch (error) {
      console.error('Withdrawal error:', error);
      toast.error('Withdrawal failed');
    } finally {
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
        <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
          <FaArrowDown className="text-blue-600 dark:text-blue-400" />
        </div>
        <div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Withdraw Funds
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Available: {selectedCurrency?.symbol}{walletBalance.toFixed(2)}
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
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
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
            max={walletBalance}
            step="0.01"
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          />
          {parseFloat(amount) > walletBalance && (
            <p className="text-red-500 text-xs mt-1">Amount exceeds available balance</p>
          )}
        </div>

        {/* Bank Selection */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Bank
          </label>
          <select
            value={bankCode}
            onChange={(e) => setBankCode(e.target.value)}
            disabled={loadingBanks}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white disabled:opacity-50"
          >
            <option value="">
              {loadingBanks ? 'Loading banks...' : 'Select your bank'}
            </option>
            {banks.map((bank) => (
              <option key={bank.code} value={bank.code}>
                {bank.name}
              </option>
            ))}
          </select>
        </div>

        {/* Account Number */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Account Number
          </label>
          <div className="flex gap-2">
            <input
              type="text"
              value={accountNumber}
              onChange={(e) => setAccountNumber(e.target.value)}
              placeholder="0123456789"
              maxLength={10}
              className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            />
            <button
              onClick={verifyAccountName}
              disabled={!accountNumber || !bankCode || verifyingAccount}
              className="px-4 py-2 bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white rounded-lg transition-colors duration-200 flex items-center gap-2"
            >
              {verifyingAccount ? (
                <FaSpinner className="animate-spin" />
              ) : (
                'Verify'
              )}
            </button>
          </div>
        </div>

        {/* Account Name */}
        {accountName && (
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Account Name
            </label>
            <input
              type="text"
              value={accountName}
              readOnly
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-600 text-gray-900 dark:text-white"
            />
          </div>
        )}

        {/* Reason */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Reason (Optional)
          </label>
          <input
            type="text"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="Freelance earnings withdrawal"
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          />
        </div>

        {/* Withdrawal Button */}
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={handleWithdrawal}
          disabled={
            loading || 
            !amount || 
            parseFloat(amount) <= 0 || 
            parseFloat(amount) > walletBalance || 
            !accountNumber || 
            !bankCode || 
            !accountName
          }
          className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-medium py-3 px-4 rounded-lg transition-colors duration-200 flex items-center justify-center gap-2"
        >
          {loading ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
              Processing...
            </>
          ) : (
            <>
              <FaUniversity />
              Withdraw {selectedCurrency?.symbol}{amount || '0.00'}
            </>
          )}
        </motion.button>

        <p className="text-xs text-gray-600 dark:text-gray-400 text-center">
          Withdrawals are processed instantly via Paystack. Funds typically arrive within 24 hours.
        </p>
      </div>
    </motion.div>
  );
}
