"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  FaFileInvoiceDollar,
  FaVideo,
  FaUserEdit,
  FaFolderOpen,
  FaChartBar,
  FaSun,
  FaMoon,
  FaUserCircle,
  FaSignOutAlt,
} from "react-icons/fa";
import { auth, db } from "@/firebase";
import { collection, getDocs, doc, getDoc } from "firebase/firestore";
import { toast } from "react-hot-toast";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

export default function FreelancerDashboardPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [darkMode, setDarkMode] = useState(false);
  const [activeTab, setActiveTab] = useState("activity");
  const [documentCount, setDocumentCount] = useState(0);
  const [unreadMessages, setUnreadMessages] = useState(0);
  const [pendingInvoices, setPendingInvoices] = useState(0);
  const [unauthorized, setUnauthorized] = useState(false);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (user) => {
      if (!user) return;
      const userRef = doc(db, "users", user.uid);
      const snap = await getDoc(userRef);
      const role = snap.data()?.role || "freelancer";
      if (role !== "freelancer") {
        setUnauthorized(true);
        toast.error("Access denied: Only freelancers can view this dashboard.");
        return;
      }
      await fetchStats(user.uid);
      setLoading(false);
    });
    return () => unsubscribe();
  }, [router]);

  const fetchStats = async (uid: string) => {
    const docsSnap = await getDocs(collection(db, "users", uid, "documents"));
    const unreadSnap = await getDocs(collection(db, "users", uid, "messages"));
    const invoiceSnap = await getDocs(collection(db, "users", uid, "invoices"));

    setDocumentCount(docsSnap.size);
    setUnreadMessages(
      unreadSnap.docs.filter((doc) => doc.data().read === false).length
    );
    setPendingInvoices(
      invoiceSnap.docs.filter((doc) => doc.data().status === "pending").length
    );
  };

  const chartData = [
    { name: "Documents", value: documentCount },
    { name: "Pending Invoices", value: pendingInvoices },
    { name: "Unread Messages", value: unreadMessages },
  ];

  const items = [
    {
      title: "Work Stages",
      icon: <FaChartBar className="text-3xl text-purple-600 animate-pulse" />,
      description: "Track progress and stages of client work.",
      href: "/dashboard/freelancers/work-stage",
    },
    {
      title: `Documents (${documentCount})`,
      icon: <FaFolderOpen className="text-3xl text-purple-600 animate-bounce" />,
      description: "Manage client and project documents.",
      href: "/dashboard/freelancers/document",
    },
    {
      title: `Invoices (${pendingInvoices})`,
      icon: <FaFileInvoiceDollar className="text-3xl text-purple-600 animate-wiggle" />,
      description: "Create, send, and manage invoices.",
      href: "/dashboard/freelancers/invoice",
    },
    {
      title: "Video Calls",
      icon: <FaVideo className="text-3xl text-purple-600 animate-ping" />,
      description: "Host or schedule project video meetings.",
      href: "/dashboard/freelancers/video",
    },
    {
      title: `Client Onboarding (${unreadMessages} unread)` ,
      icon: <FaUserEdit className="text-3xl text-purple-600 animate-spin-slow" />,
      description: "Manage onboarding workflows for new clients.",
      href: "/dashboard/freelancers/onboarding",
    },
  ];

  const handleLogout = async () => {
    await auth.signOut();
    toast.success("Logged out successfully");
    router.push("/auth");
  };

  if (loading) {
    return (
      <div className={`min-h-screen flex flex-col items-center justify-center ${darkMode ? 'bg-gray-900 text-white' : 'bg-gradient-to-br from-purple-50 via-white to-blue-100 text-purple-700'}`}>
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
          className="h-12 w-12 border-4 border-purple-600 border-t-transparent rounded-full mb-4"
        />
        <motion.h2
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-xl font-semibold"
        >
          Loading Freelancer Dashboard...
        </motion.h2>
      </div>
    );
  }

  if (unauthorized) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center text-center px-6">
        <h2 className="text-2xl font-bold text-red-600 mb-4">Access Denied</h2>
        <p className="text-gray-700 max-w-md">
          You do not have permission to view this dashboard. Please log in with a freelancer account
          or return to the homepage.
        </p>
        <button
          onClick={() => router.push("/")}
          className="mt-6 px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700"
        >
          Back to Home
        </button>
      </div>
    );
  }

  return (
    <div className={`${darkMode ? 'bg-gray-900 text-white' : 'bg-gradient-to-br from-purple-50 via-white to-blue-100'} min-h-screen py-12 px-6`}>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-purple-700 dark:text-white">
          Freelancer Dashboard
        </h1>
        <div className="flex items-center gap-4">
          <FaUserCircle className="text-2xl" title="Profile" />
          <button
            onClick={handleLogout}
            className="text-sm bg-purple-600 text-white px-3 py-1 rounded hover:bg-purple-700"
          >
            <FaSignOutAlt className="inline mr-1" /> Logout
          </button>
          <button
            onClick={() => setDarkMode(!darkMode)}
            className="text-xl"
            title="Toggle Theme"
          >
            {darkMode ? <FaSun /> : <FaMoon />}
          </button>
        </div>
      </div>

      <div className="flex gap-4 mb-6">
        <button
          onClick={() => setActiveTab("activity")}
          className={`px-4 py-2 rounded ${activeTab === "activity" ? "bg-purple-600 text-white" : "bg-gray-200"}`}
        >
          Activity
        </button>
        <button
          onClick={() => setActiveTab("stats")}
          className={`px-4 py-2 rounded ${activeTab === "stats" ? "bg-purple-600 text-white" : "bg-gray-200"}`}
        >
          Stats
        </button>
      </div>

      <AnimatePresence mode="wait">
        {activeTab === "stats" && (
          <motion.div
            key="stats"
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            transition={{ duration: 0.3 }}
            className="max-w-4xl mx-auto mb-12"
          >
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={chartData}>
                <XAxis dataKey="name" stroke="#7c3aed" />
                <YAxis stroke="#7c3aed" />
                <Tooltip />
                <Bar dataKey="value" fill="#a78bfa" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </motion.div>
        )}

        {activeTab === "activity" && (
          <motion.div
            key="activity"
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 50 }}
            transition={{ duration: 0.3 }}
            className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8 max-w-6xl mx-auto"
          >
            {items.map((item, index) => (
              <motion.div
                key={item.title}
                whileHover={{ scale: 1.05 }}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1, duration: 0.4 }}
                onClick={() => router.push(item.href)}
                className="cursor-pointer p-6 bg-white dark:bg-gray-800 rounded-lg shadow hover:shadow-lg transition-all border border-gray-100 relative group"
              >
                <div className="mb-4 flex items-center justify-center">
                  <div className="relative">
                    {item.icon}
                    <div className="absolute -top-8 left-1/2 -translate-x-1/2 px-2 py-1 text-xs text-white bg-gray-700 rounded opacity-0 group-hover:opacity-100 transition pointer-events-none z-10 whitespace-nowrap">
                      {item.description}
                    </div>
                  </div>
                </div>
                <h2 className="text-xl font-semibold text-purple-700 dark:text-white text-center mb-2">
                  {item.title}
                </h2>
                <p className="text-sm text-gray-600 dark:text-gray-300 text-center">{item.description}</p>
              </motion.div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
