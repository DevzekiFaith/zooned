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
  FaUsers,
  FaCalendar,
  FaRocket,
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

export default function DashboardPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [darkMode, setDarkMode] = useState(false);
  const [activeTab, setActiveTab] = useState("overview");
  const [userRole, setUserRole] = useState<"client" | "freelancer" | null>(null);
  const [userInfo, setUserInfo] = useState<{ name: string; email: string } | null>(null);
  const [stats, setStats] = useState({
    documents: 0,
    messages: 0,
    invoices: 0,
    clients: 0,
  });

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (user) => {
      if (!user) {
        router.push("/auth");
        return;
      }
      
      try {
        const userRef = doc(db, "users", user.uid);
        const snap = await getDoc(userRef);
        const userData = snap.data();
        const role = userData?.role || "client";
        
        setUserRole(role);
        setUserInfo({
          name: userData?.name || user.displayName || "User",
          email: user.email || "",
        });
        
        await fetchStats(user.uid, role);
        setLoading(false);
      } catch (error) {
        console.error("Error loading dashboard:", error);
        toast.error("Failed to load dashboard");
        setLoading(false);
      }
    });
    
    return () => unsubscribe();
  }, [router]);

  const fetchStats = async (uid: string, role: string) => {
    try {
      if (role === "freelancer") {
        const docsSnap = await getDocs(collection(db, "users", uid, "documents"));
        const clientsSnap = await getDocs(collection(db, "users", uid, "clients"));
        const invoiceSnap = await getDocs(collection(db, "users", uid, "invoices"));
        
        setStats({
          documents: docsSnap.size,
          messages: 0, // Will be implemented later
          invoices: invoiceSnap.size,
          clients: clientsSnap.size,
        });
      } else {
        // Client stats
        const docsSnap = await getDocs(collection(db, "users", uid, "documents"));
        setStats({
          documents: docsSnap.size,
          messages: 0,
          invoices: 0,
          clients: 0,
        });
      }
    } catch {
      console.error("Error fetching stats");
    }
  };

  const chartData = [
    { name: "Documents", value: stats.documents },
    { name: "Clients", value: stats.clients },
    { name: "Invoices", value: stats.invoices },
    { name: "Messages", value: stats.messages },
  ];

  const getDashboardItems = () => {
    if (userRole === "freelancer") {
      return [
        {
          title: "Client Management",
          icon: <FaUsers className="text-3xl text-purple-600" />,
          description: "Manage your client relationships and projects.",
          href: "/dashboard/clients",
        },
        {
          title: "Documents",
          icon: <FaFolderOpen className="text-3xl text-purple-600" />,
          description: "Organize and share project documents.",
          href: "/dashboard/freelancers/document",
        },
        {
          title: "Invoices",
          icon: <FaFileInvoiceDollar className="text-3xl text-purple-600" />,
          description: "Create and manage client invoices.",
          href: "/dashboard/freelancers/invoice",
        },
        {
          title: "Video Calls",
          icon: <FaVideo className="text-3xl text-purple-600" />,
          description: "Schedule and host client meetings.",
          href: "/dashboard/freelancers/video-call",
        },
        {
          title: "Client Onboarding",
          icon: <FaUserEdit className="text-3xl text-purple-600" />,
          description: "Streamline new client onboarding process.",
          href: "/dashboard/freelancers/onboarding",
        },
        {
          title: "Work Stages",
          icon: <FaChartBar className="text-3xl text-purple-600" />,
          description: "Track project progress and milestones.",
          href: "/dashboard/freelancers/work-stage",
        },
      ];
    } else {
      return [
        {
          title: "Find Freelancers",
          icon: <FaUsers className="text-3xl text-purple-600" />,
          description: "Discover talented freelancers for your projects.",
          href: "/dashboard/clients",
        },
        {
          title: "Book Meetings",
          icon: <FaCalendar className="text-3xl text-purple-600" />,
          description: "Schedule consultations and project meetings.",
          href: "/dashboard/clients/booking",
        },
        {
          title: "Project Calendar",
          icon: <FaChartBar className="text-3xl text-purple-600" />,
          description: "View upcoming meetings and project timeline.",
          href: "/dashboard/clients/meeting-calendar",
        },
        {
          title: "Get Started",
          icon: <FaRocket className="text-3xl text-purple-600" />,
          description: "Begin your first project with a freelancer.",
          href: "/dashboard/clients/new",
        },
      ];
    }
  };

  const handleLogout = async () => {
    try {
      await auth.signOut();
      toast.success("Logged out successfully");
      router.push("/");
    } catch {
      toast.error("Failed to log out");
    }
  };

  if (loading) {
    return (
      <div className={`min-h-screen flex flex-col items-center justify-center ${darkMode ? 'bg-gray-900 text-white' : 'bg-gradient-to-br from-purple-50 via-white to-purple-100'}`}>
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
          className="h-12 w-12 border-4 border-purple-600 border-t-transparent rounded-full mb-4"
        />
        <motion.h2
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-xl font-semibold text-purple-700"
        >
          Loading Dashboard...
        </motion.h2>
      </div>
    );
  }

  return (
    <div className={`${darkMode ? 'bg-gray-900 text-white' : 'bg-gradient-to-br from-purple-50 via-white to-purple-100'} min-h-screen py-12 px-6`}>
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-bold text-purple-700 dark:text-white mb-2">
              Welcome back, {userInfo?.name}!
            </h1>
            <p className="text-gray-600 dark:text-gray-300">
              {userRole === "freelancer" ? "Freelancer" : "Client"} Dashboard
            </p>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300">
              <FaUserCircle className="text-xl" />
              <span>{userInfo?.email}</span>
            </div>
            <button
              onClick={handleLogout}
              className="btn-outline text-sm"
            >
              <FaSignOutAlt className="inline mr-1" /> Logout
            </button>
            <button
              onClick={() => setDarkMode(!darkMode)}
              className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              title="Toggle Theme"
            >
              {darkMode ? <FaSun className="text-xl" /> : <FaMoon className="text-xl" />}
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex gap-4 mb-8">
          <button
            onClick={() => setActiveTab("overview")}
            className={`px-6 py-3 rounded-lg font-medium transition-colors ${
              activeTab === "overview" 
                ? "bg-purple-600 text-white" 
                : "bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
            }`}
          >
            Overview
          </button>
          <button
            onClick={() => setActiveTab("analytics")}
            className={`px-6 py-3 rounded-lg font-medium transition-colors ${
              activeTab === "analytics" 
                ? "bg-purple-600 text-white" 
                : "bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
            }`}
          >
            Analytics
          </button>
        </div>

        <AnimatePresence mode="wait">
          {activeTab === "analytics" && (
            <motion.div
              key="analytics"
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -50 }}
              transition={{ duration: 0.3 }}
              className="mb-12"
            >
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
                <h2 className="text-2xl font-bold text-purple-700 dark:text-white mb-6">
                  Activity Overview
                </h2>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={chartData}>
                    <XAxis dataKey="name" stroke="#7c3aed" />
                    <YAxis stroke="#7c3aed" />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: darkMode ? '#1f2937' : '#ffffff',
                        border: 'none',
                        borderRadius: '8px',
                        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                      }}
                    />
                    <Bar dataKey="value" fill="#a78bfa" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </motion.div>
          )}

          {activeTab === "overview" && (
            <motion.div
              key="overview"
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 50 }}
              transition={{ duration: 0.3 }}
            >
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {getDashboardItems().map((item, index) => (
                  <motion.div
                    key={item.title}
                    whileHover={{ scale: 1.02, y: -5 }}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1, duration: 0.4 }}
                    onClick={() => router.push(item.href)}
                    className="cursor-pointer p-6 bg-white dark:bg-gray-800 rounded-xl shadow-sm hover:shadow-lg transition-all border border-gray-100 dark:border-gray-700 relative group"
                  >
                    <div className="mb-4 flex items-center justify-center">
                      <div className="relative">
                        {item.icon}
                        <div className="absolute -top-8 left-1/2 -translate-x-1/2 px-3 py-1 text-xs text-white bg-gray-700 rounded-lg opacity-0 group-hover:opacity-100 transition pointer-events-none z-10 whitespace-nowrap">
                          {item.description}
                        </div>
                      </div>
                    </div>
                    <h2 className="text-xl font-semibold text-purple-700 dark:text-white text-center mb-3">
                      {item.title}
                    </h2>
                    <p className="text-sm text-gray-600 dark:text-gray-300 text-center leading-relaxed">
                      {item.description}
                    </p>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
