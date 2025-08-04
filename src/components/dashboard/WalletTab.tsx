"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  FaWallet, 
  FaClock, 
  FaChartBar, 
  FaMoneyBillWave, 
  FaHistory, 
  FaCreditCard,
  FaPlus,
  FaArrowDown,
  FaArrowUp,
  FaSpinner,
  FaCheckCircle,
  FaExclamationTriangle,
  FaUniversity,
  FaSyncAlt
} from "react-icons/fa";
import { collection, query, where, orderBy, onSnapshot, doc, getDoc } from "firebase/firestore";
import { db } from "@/firebase";
import PaystackPaymentForm from "@/components/payments/PaystackPaymentForm";
import PaystackWithdrawal from "@/components/payments/PaystackWithdrawal";

interface Transaction {
  id: string;
  type: 'received' | 'sent' | 'pending';
  amount: number;
  description: string;
  date: any;
  from?: string;
  to?: string;
  projectId?: string;
  status: 'completed' | 'pending' | 'failed';
  paymentIntentId?: string;
  transferId?: string;
  bankAccountId?: string;
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

export default function WalletTab({ userData, walletData: initialWalletData }: WalletTabProps) {
  const [walletData, setWalletData] = useState(initialWalletData);
  const [activeTab, setActiveTab] = useState<'overview' | 'receive' | 'withdraw'>('overview');
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Real-time wallet updates
  useEffect(() => {
    if (!userData?.uid) return;

    const unsubscribeTransactions = onSnapshot(
      query(
        collection(db, 'transactions'),
        where('userId', '==', userData.uid),
        orderBy('date', 'desc')
      ),
      (snapshot) => {
        const transactions = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
        })) as Transaction[];

        setWalletData(prev => ({
          ...prev,
          transactions,
        }));
      }
    );

    // Listen for wallet balance updates
    const unsubscribeUser = onSnapshot(
      doc(db, 'users', userData.uid),
      (doc) => {
        if (doc.exists()) {
          const data = doc.data();
          setWalletData(prev => ({
            ...prev,
            balance: data.walletBalance || 0,
            totalEarned: data.totalEarned || 0,
          }));
        }
      }
    );

    return () => {
      unsubscribeTransactions();
      unsubscribeUser();
    };
  }, [userData?.uid]);



  const refreshWallet = async () => {
    setIsRefreshing(true);
    try {
      // Force refresh user data
      const userDoc = await getDoc(doc(db, 'users', userData.uid));
      if (userDoc.exists()) {
        const data = userDoc.data();
        setWalletData(prev => ({
          ...prev,
          balance: data.walletBalance || 0,
          totalEarned: data.totalEarned || 0,
        }));
      }
    } catch (error) {
      console.error('Error refreshing wallet:', error);
    } finally {
      setIsRefreshing(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header with Navigation */}
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Wallet</h2>
        <div className="flex items-center space-x-2">
          <button
            onClick={refreshWallet}
            disabled={isRefreshing}
            className="p-2 text-gray-600 hover:text-blue-600 transition-colors"
            title="Refresh Wallet"
          >
            <FaSyncAlt className={isRefreshing ? 'animate-spin' : ''} />
          </button>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="flex space-x-1 bg-gray-100 dark:bg-gray-800 rounded-lg p-1">
        {[
          { id: 'overview', label: 'Overview', icon: FaWallet },
          { id: 'receive', label: 'Receive Payment', icon: FaArrowDown },
          { id: 'withdraw', label: 'Withdraw', icon: FaArrowUp },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`flex items-center space-x-2 px-4 py-2 rounded-md transition-all duration-200 ${
              activeTab === tab.id
                ? 'bg-white dark:bg-gray-700 text-blue-600 shadow-sm'
                : 'text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200'
            }`}
          >
            <tab.icon className="text-sm" />
            <span className="text-sm font-medium">{tab.label}</span>
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <AnimatePresence mode="wait">
        {activeTab === 'overview' && (
          <motion.div
            key="overview"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-6"
          >
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

            {/* Quick Actions */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <button
                onClick={() => setActiveTab('receive')}
                className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:border-blue-500 transition-colors group"
              >
                <div className="flex items-center space-x-3">
                  <div className="bg-blue-100 dark:bg-blue-900/20 p-3 rounded-lg group-hover:bg-blue-200 dark:group-hover:bg-blue-900/40 transition-colors">
                    <FaArrowDown className="text-blue-600" />
                  </div>
                  <div className="text-left">
                    <h3 className="font-semibold">Receive Payment</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Create payment link for clients</p>
                  </div>
                </div>
              </button>

              <button
                onClick={() => setActiveTab('withdraw')}
                className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:border-green-500 transition-colors group"
              >
                <div className="flex items-center space-x-3">
                  <div className="bg-green-100 dark:bg-green-900/20 p-3 rounded-lg group-hover:bg-green-200 dark:group-hover:bg-green-900/40 transition-colors">
                    <FaArrowUp className="text-green-600" />
                  </div>
                  <div className="text-left">
                    <h3 className="font-semibold">Withdraw Funds</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Transfer to your bank account</p>
                  </div>
                </div>
              </button>
            </div>

            {/* Recent Transactions */}
            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <FaHistory />
                Recent Transactions
              </h3>
              <div className="space-y-3">
                {walletData.transactions.length === 0 ? (
                  <div className="text-center py-8">
                    <FaCreditCard className="text-4xl text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-500">No transactions yet</p>
                  </div>
                ) : (
                  walletData.transactions.slice(0, 5).map((transaction: Transaction) => (
                    <div key={transaction.id} className="flex justify-between items-center p-3 border border-gray-200 dark:border-gray-600 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <div className={`p-2 rounded-lg ${
                          transaction.type === 'received' 
                            ? 'bg-green-100 dark:bg-green-900/20' 
                            : 'bg-red-100 dark:bg-red-900/20'
                        }`}>
                          {transaction.type === 'received' ? (
                            <FaArrowDown className="text-green-600" />
                          ) : (
                            <FaArrowUp className="text-red-600" />
                          )}
                        </div>
                        <div>
                          <p className="font-medium">{transaction.description}</p>
                          <p className="text-sm text-gray-500">
                            {transaction.date?.toDate?.()?.toLocaleDateString() || 'Recent'}
                          </p>
                        </div>
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
          </motion.div>
        )}

        {activeTab === 'receive' && (
          <motion.div
            key="receive"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-6"
          >
            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-semibold mb-4">Receive Payment</h3>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                Create a payment request for your clients. They can pay you directly and the funds will be added to your wallet in real-time.
              </p>
              
              <PaystackPaymentForm
                onPaymentSuccess={(details) => {
                  console.log('Payment successful:', details);
                  // Refresh wallet data
                }}
              />
            </div>
          </motion.div>
        )}

        {activeTab === 'withdraw' && (
          <motion.div
            key="withdraw"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-6"
          >
            <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
              <PaystackWithdrawal
                walletBalance={walletData.balance}
                onWithdrawalSuccess={(details) => {
                  console.log('Withdrawal successful:', details);
                  // Refresh wallet data
                }}
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
