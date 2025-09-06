import React, { useState } from 'react';
import { UserData, WalletData } from './types';
import { FaArrowDown, FaArrowUp, FaPlus, FaExchangeAlt, FaCreditCard, FaHistory } from 'react-icons/fa';

interface WalletTabProps {
  userData: UserData;
  walletData?: WalletData;
}

const defaultWalletData: WalletData = {
  balance: 0,
  transactions: [],
  totalEarned: 0,
  totalWithdrawn: 0,
  pendingBalance: 0,
  recentTransactions: [],
  paymentMethods: [],
  bankAccounts: []
};

const WalletTab: React.FC<WalletTabProps> = ({ 
  userData, 
  walletData = defaultWalletData
}) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'transactions' | 'cards'>('overview');
  const [showAddFunds, setShowAddFunds] = useState(false);
  const [showWithdraw, setShowWithdraw] = useState(false);
  const [showAddCard, setShowAddCard] = useState(false);
  
  const [amount, setAmount] = useState('');
  const [cardDetails, setCardDetails] = useState({
    number: '',
    name: '',
    expiry: '',
    cvv: ''
  });

  const handleAddFunds = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle add funds logic
    console.log('Adding funds:', amount);
    setShowAddFunds(false);
    setAmount('');
  };

  const handleWithdraw = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle withdraw logic
    console.log('Withdrawing:', amount);
    setShowWithdraw(false);
    setAmount('');
  };

  const handleAddCard = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle add card logic
    console.log('Adding card:', cardDetails);
    setShowAddCard(false);
    setCardDetails({
      number: '',
      name: '',
      expiry: '',
      cvv: ''
    });
  };

  const formatCardNumber = (number: string) => {
    return number.replace(/\s?/g, '').replace(/(\d{4})/g, '$1 ').trim();
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <h2 className="text-2xl font-bold">Wallet</h2>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowAddFunds(true)}
            className="btn-primary flex items-center gap-2"
          >
            <FaPlus /> Add Funds
          </button>
          <button
            onClick={() => setShowWithdraw(true)}
            className="btn-outline flex items-center gap-2"
          >
            <FaArrowUp /> Withdraw
          </button>
        </div>
      </div>

      {/* Wallet Balance */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-800 text-white rounded-xl p-6 shadow-lg">
        <div className="flex justify-between items-start">
          <div>
            <p className="text-blue-200">Available Balance</p>
            <h3 className="text-3xl font-bold mt-1">
              ${walletData?.balance?.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </h3>
          </div>
          <div className="bg-white/20 p-2 rounded-lg">
            <FaCreditCard className="h-6 w-6" />
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200 dark:border-gray-700">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveTab('overview')}
            className={`py-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'overview'
                ? 'border-blue-500 text-blue-600 dark:text-blue-400 dark:border-blue-400'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
            }`}
          >
            Overview
          </button>
          <button
            onClick={() => setActiveTab('transactions')}
            className={`py-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'transactions'
                ? 'border-blue-500 text-blue-600 dark:text-blue-400 dark:border-blue-400'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
            }`}
          >
            Transactions
          </button>
          <button
            onClick={() => setActiveTab('cards')}
            className={`py-4 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'cards'
                ? 'border-blue-500 text-blue-600 dark:text-blue-400 dark:border-blue-400'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
            }`}
          >
            Payment Methods
          </button>
        </nav>
      </div>

      {/* Tab Content */}
      <div className="py-4">
        {activeTab === 'overview' && (
          <div className="space-y-6">
            {/* Quick Actions */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Total Earnings</p>
                    <p className="text-xl font-semibold">
                      ${(walletData?.totalEarned || 0).toLocaleString()}
                    </p>
                  </div>
                  <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-full">
                    <FaArrowDown className="h-5 w-5 text-green-600 dark:text-green-400" />
                  </div>
                </div>
              </div>
              <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Total Withdrawn</p>
                    <p className="text-xl font-semibold">
                      ${(walletData?.totalWithdrawn || 0).toLocaleString()}
                    </p>
                  </div>
                  <div className="p-2 bg-red-100 dark:bg-red-900/30 rounded-full">
                    <FaArrowUp className="h-5 w-5 text-red-600 dark:text-red-400" />
                  </div>
                </div>
              </div>
              <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Pending Balance</p>
                    <p className="text-xl font-semibold">
                      ${(walletData?.pendingBalance || 0).toLocaleString()}
                    </p>
                  </div>
                  <div className="p-2 bg-yellow-100 dark:bg-yellow-900/30 rounded-full">
                    <FaExchangeAlt className="h-5 w-5 text-yellow-600 dark:text-yellow-400" />
                  </div>
                </div>
              </div>
            </div>

            {/* Recent Transactions */}
            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
              <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                <h3 className="text-lg font-semibold flex items-center gap-2">
                  <FaHistory className="text-blue-600" />
                  Recent Transactions
                </h3>
              </div>
              <div className="divide-y divide-gray-200 dark:divide-gray-700">
                {walletData?.recentTransactions?.length > 0 ? (
                  walletData.recentTransactions.slice(0, 5).map((txn: any, index: number) => (
                    <div key={index} className="p-4 hover:bg-gray-50 dark:hover:bg-gray-750 transition-colors">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className={`p-2 rounded-full ${
                            txn.type === 'credit' 
                              ? 'bg-green-100 dark:bg-green-900/30' 
                              : 'bg-red-100 dark:bg-red-900/30'
                          }`}>
                            {txn.type === 'credit' ? (
                              <FaArrowDown className="h-5 w-5 text-green-600 dark:text-green-400" />
                            ) : (
                              <FaArrowUp className="h-5 w-5 text-red-600 dark:text-red-400" />
                            )}
                          </div>
                          <div>
                            <p className="font-medium">{txn.description}</p>
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                              {new Date(txn.date).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className={`font-medium ${
                            txn.type === 'credit' 
                              ? 'text-green-600 dark:text-green-400' 
                              : 'text-red-600 dark:text-red-400'
                          }`}>
                            {txn.type === 'credit' ? '+' : '-'}${txn.amount.toFixed(2)}
                          </p>
                          <p className="text-sm text-gray-500 dark:text-gray-400">
                            {txn.status.charAt(0).toUpperCase() + txn.status.slice(1)}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="p-8 text-center text-gray-500 dark:text-gray-400">
                    <p>No recent transactions</p>
                  </div>
                )}
              </div>
              {walletData?.recentTransactions?.length > 5 && (
                <div className="p-4 border-t border-gray-200 dark:border-gray-700 text-center">
                  <button 
                    onClick={() => setActiveTab('transactions')}
                    className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 text-sm font-medium"
                  >
                    View All Transactions
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'transactions' && (
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
            <div className="p-4 border-b border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-semibold">All Transactions</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead className="bg-gray-50 dark:bg-gray-700">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Description
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Date
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Amount
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                  {walletData?.transactions?.length > 0 ? (
                    walletData.transactions.map((txn: any, index: number) => (
                      <tr key={index} className="hover:bg-gray-50 dark:hover:bg-gray-750">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className={`p-2 rounded-full ${
                              txn.type === 'credit' 
                                ? 'bg-green-100 dark:bg-green-900/30' 
                                : 'bg-red-100 dark:bg-red-900/30'
                            }`}>
                              {txn.type === 'credit' ? (
                                <FaArrowDown className="h-4 w-4 text-green-600 dark:text-green-400" />
                              ) : (
                                <FaArrowUp className="h-4 w-4 text-red-600 dark:text-red-400" />
                              )}
                            </div>
                            <div className="ml-4">
                              <div className="text-sm font-medium text-gray-900 dark:text-white">
                                {txn.description}
                              </div>
                              <div className="text-sm text-gray-500 dark:text-gray-400">
                                {txn.reference}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                          {new Date(txn.date).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <span className={`${
                            txn.type === 'credit' 
                              ? 'text-green-600 dark:text-green-400' 
                              : 'text-red-600 dark:text-red-400'
                          }`}>
                            {txn.type === 'credit' ? '+' : '-'}${txn.amount.toFixed(2)}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                            txn.status === 'completed' 
                              ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' 
                              : txn.status === 'pending'
                              ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400'
                              : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
                          }`}>
                            {txn.status.charAt(0).toUpperCase() + txn.status.slice(1)}
                          </span>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={4} className="px-6 py-8 text-center text-gray-500 dark:text-gray-400">
                        No transactions found
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'cards' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold">Payment Methods</h3>
              <button
                onClick={() => setShowAddCard(true)}
                className="btn-primary flex items-center gap-2"
              >
                <FaPlus /> Add Card
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {walletData?.paymentMethods?.length > 0 ? (
                walletData.paymentMethods.map((card: any, index: number) => (
                  <div key={index} className="bg-gradient-to-r from-blue-600 to-blue-800 text-white rounded-xl p-6 shadow-lg relative overflow-hidden">
                    <div className="absolute top-4 right-4">
                      <div className="bg-white/20 p-1 rounded-full">
                        {card.brand === 'visa' ? (
                          <span className="text-white text-xs font-bold">VISA</span>
                        ) : card.brand === 'mastercard' ? (
                          <span className="text-white text-xs font-bold">MC</span>
                        ) : (
                          <FaCreditCard className="h-4 w-4" />
                        )}
                      </div>
                    </div>
                    <div className="mt-4">
                      <p className="text-sm text-blue-200">Card Number</p>
                      <p className="text-xl font-mono tracking-wider">
                        •••• •••• •••• {card.last4}
                      </p>
                    </div>
                    <div className="mt-6 flex justify-between items-end">
                      <div>
                        <p className="text-xs text-blue-200">Card Holder</p>
                        <p className="text-sm font-medium">{card.name}</p>
                      </div>
                      <div>
                        <p className="text-xs text-blue-200">Expires</p>
                        <p className="text-sm font-medium">
                          {card.exp_month.toString().padStart(2, '0')}/{card.exp_year.toString().slice(-2)}
                        </p>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="col-span-3 py-12 text-center text-gray-500 dark:text-gray-400">
                  <FaCreditCard className="mx-auto h-12 w-12 opacity-50 mb-4" />
                  <p>No payment methods added</p>
                  <button
                    onClick={() => setShowAddCard(true)}
                    className="mt-4 text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 text-sm font-medium"
                  >
                    Add a payment method
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Add Funds Modal */}
      {showAddFunds && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 w-full max-w-md">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-semibold">Add Funds</h3>
              <button
                onClick={() => {
                  setShowAddFunds(false);
                  setAmount('');
                }}
                className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
              >
                ✕
              </button>
            </div>
            <form onSubmit={handleAddFunds} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Amount ($)</label>
                <input
                  type="number"
                  min="1"
                  step="0.01"
                  required
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700"
                  placeholder="0.00"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                />
              </div>
              <div className="grid grid-cols-4 gap-2 mt-2">
                {[10, 25, 50, 100].map((value) => (
                  <button
                    key={value}
                    type="button"
                    className="px-3 py-1.5 bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 rounded-md text-sm"
                    onClick={() => setAmount(value.toString())}
                  >
                    ${value}
                  </button>
                ))}
              </div>
              <div className="pt-4">
                <h4 className="text-sm font-medium mb-2">Payment Method</h4>
                <div className="space-y-2">
                  {walletData?.paymentMethods?.map((card: any, index: number) => (
                    <label key={index} className="flex items-center p-3 border border-gray-200 dark:border-gray-700 rounded-lg cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-750">
                      <input
                        type="radio"
                        name="paymentMethod"
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 dark:border-gray-600"
                        defaultChecked={index === 0}
                      />
                      <div className="ml-3">
                        <p className="text-sm font-medium">
                          {card.brand.charAt(0).toUpperCase() + card.brand.slice(1)} •••• {card.last4}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          Expires {card.exp_month.toString().padStart(2, '0')}/{card.exp_year.toString().slice(-2)}
                        </p>
                      </div>
                    </label>
                  ))}
                  <button
                    type="button"
                    className="w-full flex items-center justify-center p-3 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 hover:border-blue-400 dark:hover:border-blue-500 transition-colors"
                    onClick={() => {
                      setShowAddFunds(false);
                      setShowAddCard(true);
                    }}
                  >
                    <FaPlus className="mr-2" />
                    Add New Card
                  </button>
                </div>
              </div>
              <div className="pt-4">
                <button
                  type="submit"
                  className="w-full py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  Add ${amount || '0.00'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Withdraw Modal */}
      {showWithdraw && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 w-full max-w-md">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-semibold">Withdraw Funds</h3>
              <button
                onClick={() => {
                  setShowWithdraw(false);
                  setAmount('');
                }}
                className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
              >
                ✕
              </button>
            </div>
            <form onSubmit={handleWithdraw} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Amount ($)</label>
                <input
                  type="number"
                  min="1"
                  max={walletData?.balance}
                  step="0.01"
                  required
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700"
                  placeholder="0.00"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                />
                <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                  Available: ${walletData?.balance?.toFixed(2)}
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Withdraw To</label>
                <select
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700"
                  defaultValue=""
                  required
                >
                  <option value="" disabled>Select bank account</option>
                  {walletData?.bankAccounts?.map((account: any, index: number) => (
                    <option key={index} value={account.id}>
                      {account.bankName} •••• {account.last4} ({account.accountType})
                    </option>
                  ))}
                </select>
                <button
                  type="button"
                  className="mt-2 text-sm text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
                >
                  + Add Bank Account
                </button>
              </div>
              <div className="pt-2">
                <button
                  type="submit"
                  className="w-full py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={!amount || parseFloat(amount) <= 0 || (Boolean(walletData?.balance) && parseFloat(amount) > (walletData?.balance ?? 0))}
                >
                  Withdraw ${amount || '0.00'}
                </button>
                <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                  Processing time: 1-3 business days
                </p>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Card Modal */}
      {showAddCard && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 w-full max-w-md">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-semibold">Add Payment Method</h3>
              <button
                onClick={() => {
                  setShowAddCard(false);
                  setCardDetails({
                    number: '',
                    name: '',
                    expiry: '',
                    cvv: ''
                  });
                }}
                className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
              >
                ✕
              </button>
            </div>
            <form onSubmit={handleAddCard} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Card Number</label>
                <input
                  type="text"
                  inputMode="numeric"
                  pattern="[0-9\s]{13,19}"
                  maxLength={19}
                  required
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700"
                  placeholder="1234 5678 9012 3456"
                  value={formatCardNumber(cardDetails.number)}
                  onChange={(e) => {
                    const value = e.target.value.replace(/\s+/g, '');
                    if (/^\d*$/.test(value) || value === '') {
                      setCardDetails({...cardDetails, number: value});
                    }
                  }}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Cardholder Name</label>
                <input
                  type="text"
                  required
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700"
                  placeholder="John Doe"
                  value={cardDetails.name}
                  onChange={(e) => setCardDetails({...cardDetails, name: e.target.value})}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Expiry Date</label>
                  <input
                    type="text"
                    inputMode="numeric"
                    pattern="\d{2}/\d{2}"
                    placeholder="MM/YY"
                    maxLength={5}
                    required
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700"
                    value={cardDetails.expiry}
                    onChange={(e) => {
                      let value = e.target.value;
                      // Auto-add slash after MM
                      if (value.length === 2 && !value.includes('/')) {
                        value = value + '/';
                      }
                      // Only allow numbers and slash
                      if (/^\d*\/?\d*$/.test(value) || value === '') {
                        setCardDetails({...cardDetails, expiry: value});
                      }
                    }}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">CVV</label>
                  <input
                    type="text"
                    inputMode="numeric"
                    pattern="\d{3,4}"
                    maxLength={4}
                    required
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700"
                    placeholder="123"
                    value={cardDetails.cvv}
                    onChange={(e) => {
                      // Only allow numbers
                      if (/^\d*$/.test(e.target.value) || e.target.value === '') {
                        setCardDetails({...cardDetails, cvv: e.target.value});
                      }
                    }}
                  />
                </div>
              </div>
              <div className="pt-2">
                <button
                  type="submit"
                  className="w-full py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  Add Card
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default WalletTab;
