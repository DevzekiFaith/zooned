"use client";

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FaUniversity, 
  FaPlus, 
  FaEdit, 
  FaTrash, 
  FaCheck, 
  FaClock, 
  FaExclamationTriangle,
  FaSpinner,
  FaStar
} from 'react-icons/fa';
import { BankAccount } from '@/lib/stripe';

interface BankAccountManagerProps {
  userId: string;
  onAccountSelect?: (accountId: string) => void;
  selectedAccountId?: string;
}

interface BankAccountFormData {
  accountHolderName: string;
  accountNumber: string;
  routingNumber: string;
  bankName: string;
  accountType: 'checking' | 'savings';
}

export default function BankAccountManager({ 
  userId, 
  onAccountSelect, 
  selectedAccountId 
}: BankAccountManagerProps) {
  const [bankAccounts, setBankAccounts] = useState<BankAccount[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingAccount, setEditingAccount] = useState<BankAccount | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string>('');
  const [formData, setFormData] = useState<BankAccountFormData>({
    accountHolderName: '',
    accountNumber: '',
    routingNumber: '',
    bankName: '',
    accountType: 'checking',
  });

  useEffect(() => {
    fetchBankAccounts();
  }, [userId]);

  const fetchBankAccounts = async () => {
    try {
      setIsLoading(true);
      const response = await fetch(`/api/payments/bank-accounts?userId=${userId}`);
      const data = await response.json();

      if (response.ok) {
        setBankAccounts(data.bankAccounts);
      } else {
        setError(data.error || 'Failed to fetch bank accounts');
      }
    } catch (err) {
      setError('Failed to fetch bank accounts');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');

    try {
      const url = editingAccount 
        ? '/api/payments/bank-accounts'
        : '/api/payments/bank-accounts';
      
      const method = editingAccount ? 'PUT' : 'POST';
      const body = editingAccount
        ? { bankAccountId: editingAccount.id, ...formData }
        : { userId, ...formData };

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
      });

      const data = await response.json();

      if (response.ok) {
        await fetchBankAccounts();
        resetForm();
        setShowAddForm(false);
        setEditingAccount(null);
      } else {
        setError(data.error || 'Failed to save bank account');
      }
    } catch (err) {
      setError('Failed to save bank account');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (accountId: string) => {
    if (!confirm('Are you sure you want to delete this bank account?')) {
      return;
    }

    try {
      const response = await fetch(`/api/payments/bank-accounts?bankAccountId=${accountId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        await fetchBankAccounts();
      } else {
        const data = await response.json();
        setError(data.error || 'Failed to delete bank account');
      }
    } catch (err) {
      setError('Failed to delete bank account');
    }
  };

  const handleEdit = (account: BankAccount) => {
    setEditingAccount(account);
    setFormData({
      accountHolderName: account.accountHolderName,
      accountNumber: '', // Don't pre-fill for security
      routingNumber: account.routingNumber,
      bankName: account.bankName,
      accountType: account.accountType,
    });
    setShowAddForm(true);
  };

  const resetForm = () => {
    setFormData({
      accountHolderName: '',
      accountNumber: '',
      routingNumber: '',
      bankName: '',
      accountType: 'checking',
    });
    setError('');
  };

  const handleCancel = () => {
    setShowAddForm(false);
    setEditingAccount(null);
    resetForm();
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <FaSpinner className="animate-spin text-2xl text-blue-600" />
        <span className="ml-2">Loading bank accounts...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold flex items-center gap-2">
          <FaUniversity />
          Bank Accounts
        </h3>
        <button
          onClick={() => setShowAddForm(true)}
          className="btn-primary flex items-center space-x-2"
        >
          <FaPlus />
          <span>Add Account</span>
        </button>
      </div>

      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
          <div className="flex items-center space-x-2 text-red-700 dark:text-red-400">
            <FaExclamationTriangle />
            <span>{error}</span>
          </div>
        </div>
      )}

      {/* Bank Accounts List */}
      <div className="space-y-4">
        {bankAccounts.length === 0 ? (
          <div className="text-center py-8">
            <FaUniversity className="text-4xl text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">No bank accounts added yet</p>
            <p className="text-sm text-gray-400">Add a bank account to enable withdrawals</p>
          </div>
        ) : (
          bankAccounts.map((account) => (
            <motion.div
              key={account.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className={`bg-white dark:bg-gray-800 rounded-lg p-4 border-2 transition-all duration-200 ${
                selectedAccountId === account.id
                  ? 'border-blue-500 shadow-md'
                  : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
              }`}
            >
              <div className="flex justify-between items-start">
                <div 
                  className="flex-1 cursor-pointer"
                  onClick={() => onAccountSelect?.(account.id)}
                >
                  <div className="flex items-center gap-2 mb-2">
                    <h4 className="font-semibold">{account.bankName}</h4>
                    {account.isDefault && (
                      <FaStar className="text-yellow-500 text-sm" title="Default Account" />
                    )}
                    <div className={`px-2 py-1 rounded-full text-xs ${
                      account.isVerified
                        ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400'
                        : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400'
                    }`}>
                      {account.isVerified ? (
                        <><FaCheck className="inline mr-1" />Verified</>
                      ) : (
                        <><FaClock className="inline mr-1" />Pending</>
                      )}
                    </div>
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                    <p><strong>Account Holder:</strong> {account.accountHolderName}</p>
                    <p><strong>Account:</strong> ****{account.accountNumber}</p>
                    <p><strong>Type:</strong> {account.accountType.charAt(0).toUpperCase() + account.accountType.slice(1)}</p>
                    <p><strong>Routing:</strong> {account.routingNumber}</p>
                  </div>
                </div>
                <div className="flex space-x-2 ml-4">
                  <button
                    onClick={() => handleEdit(account)}
                    className="p-2 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
                    title="Edit Account"
                  >
                    <FaEdit />
                  </button>
                  <button
                    onClick={() => handleDelete(account.id)}
                    className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                    title="Delete Account"
                  >
                    <FaTrash />
                  </button>
                </div>
              </div>
            </motion.div>
          ))
        )}
      </div>

      {/* Add/Edit Bank Account Form */}
      <AnimatePresence>
        {showAddForm && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700"
          >
            <h4 className="text-lg font-semibold mb-4">
              {editingAccount ? 'Edit Bank Account' : 'Add New Bank Account'}
            </h4>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Account Holder Name
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.accountHolderName}
                    onChange={(e) => setFormData({ ...formData, accountHolderName: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700"
                    placeholder="John Doe"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Bank Name
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.bankName}
                    onChange={(e) => setFormData({ ...formData, bankName: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700"
                    placeholder="Chase Bank"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Account Number
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.accountNumber}
                    onChange={(e) => setFormData({ ...formData, accountNumber: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700"
                    placeholder="1234567890"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Routing Number
                  </label>
                  <input
                    type="text"
                    required
                    pattern="[0-9]{9}"
                    value={formData.routingNumber}
                    onChange={(e) => setFormData({ ...formData, routingNumber: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700"
                    placeholder="123456789"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Account Type
                  </label>
                  <select
                    value={formData.accountType}
                    onChange={(e) => setFormData({ ...formData, accountType: e.target.value as 'checking' | 'savings' })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700"
                  >
                    <option value="checking">Checking</option>
                    <option value="savings">Savings</option>
                  </select>
                </div>
              </div>

              <div className="flex space-x-3 pt-4">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="btn-primary flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? (
                    <>
                      <FaSpinner className="animate-spin" />
                      <span>Saving...</span>
                    </>
                  ) : (
                    <>
                      <FaCheck />
                      <span>{editingAccount ? 'Update Account' : 'Add Account'}</span>
                    </>
                  )}
                </button>
                <button
                  type="button"
                  onClick={handleCancel}
                  className="btn-outline"
                >
                  Cancel
                </button>
              </div>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
