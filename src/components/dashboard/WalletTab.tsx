"use client";

import { useState } from "react";
import { FaWallet, FaClock, FaChartBar, FaMoneyBillWave, FaHistory, FaCreditCard } from "react-icons/fa";

interface Transaction {
  id: string;
  type: 'received' | 'sent' | 'pending';
  amount: number;
  description: string;
  date: Date;
  from?: string;
  to?: string;
  projectId?: string;
  status: 'completed' | 'pending' | 'failed';
}

interface WalletData {
  balance: number;
  pendingAmount: number;
  totalEarned: number;
  transactions: Transaction[];
}

interface WalletTabProps {
  userData: any;
  walletData: WalletData;
}

export default function WalletTab({ userData, walletData }: WalletTabProps) {
  const [showWithdrawForm, setShowWithdrawForm] = useState(false);
  const [withdrawAmount, setWithdrawAmount] = useState("");

  const handleWithdraw = () => {
    if (withdrawAmount && parseFloat(withdrawAmount) <= walletData.balance) {
      alert(`Withdrawal request for $${withdrawAmount} submitted successfully!`);
      setWithdrawAmount("");
      setShowWithdrawForm(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Wallet</h2>
        <button 
          onClick={() => setShowWithdrawForm(true)}
          className="btn-primary flex items-center space-x-2"
        >
          <FaMoneyBillWave />
          <span>Withdraw</span>
        </button>
      </div>

      {/* Wallet Balance Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-gradient-to-r from-green-500 to-green-600 text-white rounded-xl p-6">
          <div className="flex items-center gap-3">
            <FaWallet className="text-2xl" />
            <div>
              <p className="text-green-100">Available Balance</p>
              <p className="text-2xl font-bold">${walletData.balance.toLocaleString()}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-gradient-to-r from-yellow-500 to-yellow-600 text-white rounded-xl p-6">
          <div className="flex items-center gap-3">
            <FaClock className="text-2xl" />
            <div>
              <p className="text-yellow-100">Pending</p>
              <p className="text-2xl font-bold">${walletData.pendingAmount.toLocaleString()}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-xl p-6">
          <div className="flex items-center gap-3">
            <FaChartBar className="text-2xl" />
            <div>
              <p className="text-blue-100">Total Earned</p>
              <p className="text-2xl font-bold">${walletData.totalEarned.toLocaleString()}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Withdraw Form */}
      {showWithdrawForm && (
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold mb-4">Withdraw Funds</h3>
          <div className="space-y-4">
            <input
              type="number"
              placeholder="Amount to withdraw"
              value={withdrawAmount}
              onChange={(e) => setWithdrawAmount(e.target.value)}
              max={walletData.balance}
              className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-gray-700"
            />
            <p className="text-sm text-gray-500">
              Available balance: ${walletData.balance.toLocaleString()}
            </p>
            <div className="flex space-x-3">
              <button onClick={handleWithdraw} className="btn-primary">
                Submit Withdrawal
              </button>
              <button 
                onClick={() => setShowWithdrawForm(false)}
                className="btn-outline"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Transaction History */}
      <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <FaHistory />
          Transaction History
        </h3>
        <div className="space-y-3">
          {walletData.transactions.length === 0 ? (
            <div className="text-center py-8">
              <FaCreditCard className="text-4xl text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">No transactions yet</p>
            </div>
          ) : (
            walletData.transactions.slice(0, 10).map((transaction: Transaction) => (
              <div key={transaction.id} className="flex justify-between items-center p-3 border border-gray-200 dark:border-gray-600 rounded-lg">
                <div>
                  <p className="font-medium">{transaction.description}</p>
                  <p className="text-sm text-gray-500">
                    {transaction.date?.toLocaleDateString()}
                  </p>
                </div>
                <div className="text-right">
                  <p className={`font-bold ${
                    transaction.type === 'received' ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {transaction.type === 'received' ? '+' : '-'}${transaction.amount.toLocaleString()}
                  </p>
                  <p className={`text-xs ${
                    transaction.status === 'completed' ? 'text-green-500' : 
                    transaction.status === 'pending' ? 'text-yellow-500' : 'text-red-500'
                  }`}>
                    {transaction.status}
                  </p>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
