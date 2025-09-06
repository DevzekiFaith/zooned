"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { auth, db } from "@/firebase";
import { doc, getDoc } from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";
import { motion } from "framer-motion";
import { FaBriefcase, FaUser, FaEnvelope, FaCalendar, FaFileInvoice, FaWallet } from "react-icons/fa";

export default function FreelancerDashboard() {
  const router = useRouter();
  const [userData, setUserData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        try {
          const userDoc = await getDoc(doc(db, "users", user.uid));
          if (userDoc.exists()) {
            const userData = {
              id: user.uid,
              email: user.email || '',
              name: userDoc.data().name || user.displayName || 'User',
              role: userDoc.data().role || 'freelancer',
              avatar: user.photoURL || '',
              emailVerified: user.emailVerified,
            };
            setUserData(userData);
            
            // Redirect to client dashboard if not a freelancer
            if (userData.role !== 'freelancer') {
              router.push('/dashboard');
              return;
            }
          } else {
            // If user document doesn't exist, redirect to auth
            router.push('/auth');
          }
        } catch (error) {
          console.error('Error fetching user data:', error);
          router.push('/auth');
        }
      } else {
        router.push('/auth');
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100 dark:bg-gray-900">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900">
      <header className="bg-white dark:bg-gray-800 shadow">
        <div className="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Freelancer Dashboard</h1>
          <div className="flex items-center space-x-4">
            <span className="text-gray-700 dark:text-gray-300">
              Welcome, {userData?.name || 'Freelancer'}
            </span>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Stats Cards */}
          <motion.div 
            whileHover={{ scale: 1.03 }}
            className="bg-white dark:bg-gray-800 rounded-lg shadow p-6"
          >
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-300">
                <FaBriefcase className="h-6 w-6" />
              </div>
              <div className="ml-4">
                <h3 className="text-lg font-medium text-gray-900 dark:text-white">Active Projects</h3>
                <p className="text-2xl font-semibold text-gray-900 dark:text-white">5</p>
              </div>
            </div>
          </motion.div>

          <motion.div 
            whileHover={{ scale: 1.03 }}
            className="bg-white dark:bg-gray-800 rounded-lg shadow p-6"
          >
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-green-100 dark:bg-green-900 text-green-600 dark:text-green-300">
                <FaWallet className="h-6 w-6" />
              </div>
              <div className="ml-4">
                <h3 className="text-lg font-medium text-gray-900 dark:text-white">Earnings</h3>
                <p className="text-2xl font-semibold text-gray-900 dark:text-white">$2,450</p>
              </div>
            </div>
          </motion.div>

          <motion.div 
            whileHover={{ scale: 1.03 }}
            className="bg-white dark:bg-gray-800 rounded-lg shadow p-6"
          >
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-purple-100 dark:bg-purple-900 text-purple-600 dark:text-purple-300">
                <FaCalendar className="h-6 w-6" />
              </div>
              <div className="ml-4">
                <h3 className="text-lg font-medium text-gray-900 dark:text-white">Upcoming Meetings</h3>
                <p className="text-2xl font-semibold text-gray-900 dark:text-white">3</p>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Recent Activity */}
        <div className="mt-8 bg-white dark:bg-gray-800 shadow rounded-lg p-6">
          <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Recent Activity</h2>
          <div className="space-y-4">
            {[1, 2, 3].map((item) => (
              <div key={item} className="border-b border-gray-200 dark:border-gray-700 pb-4 last:border-0 last:pb-0">
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  You completed a milestone for Project {item}
                </p>
                <p className="text-xs text-gray-500 mt-1">2 days ago</p>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
