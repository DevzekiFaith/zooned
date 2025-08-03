"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  FaUsers,
  FaCalendar,
  FaFileInvoiceDollar,
  FaChartBar,
  FaPlus,
  FaSearch,
  FaFilter,
  FaUserCircle,
  FaSignOutAlt,
  FaSun,
  FaMoon,
  FaRocket,
  FaProjectDiagram,
  FaClock,
  FaCheckCircle,
} from "react-icons/fa";
import { auth, db } from "@/firebase";
import { collection, getDocs, doc, getDoc, query, where } from "firebase/firestore";
import { signOut } from "firebase/auth";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";
import { Status } from "@/types/common";
import Image from "next/image";

interface Project {
  id: string;
  title: string;
  description: string;
  status: 'active' | 'completed' | 'pending';
  freelancerName?: string;
  budget: number;
  deadline: string;
}

export default function ClientDashboard() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [darkMode, setDarkMode] = useState(false);
  const [activeTab, setActiveTab] = useState("overview");
  const [userInfo, setUserInfo] = useState<{ name: string; email: string } | null>(null);
  const [projects, setProjects] = useState<Project[]>([]);
  const [stats, setStats] = useState({
    activeProjects: 0,
    completedProjects: 0,
    totalSpent: 0,
    freelancersHired: 0,
  });

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (user) => {
      if (!user) {
        router.push("/auth");
        return;
      }

      try {
        const userDoc = await getDoc(doc(db, "users", user.uid));
        const userData = userDoc.data();
        
        if (userData?.role !== "client") {
          router.push(`/dashboard/${userData?.role || 'freelancer'}`);
          return;
        }

        setUserInfo({
          name: userData?.name || user.displayName || "Client",
          email: user.email || "",
        });

        // Fetch client projects
        const projectsQuery = query(
          collection(db, "projects"),
          where("clientId", "==", user.uid)
        );
        const projectsSnapshot = await getDocs(projectsQuery);
        const projectsData = projectsSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as Project[];

        setProjects(projectsData);

        // Calculate stats
        const activeProjects = projectsData.filter(p => p.status === 'active').length;
        const completedProjects = projectsData.filter(p => p.status === 'completed').length;
        const totalSpent = projectsData.reduce((sum, p) => sum + (p.budget || 0), 0);
        const freelancersHired = new Set(projectsData.map(p => p.freelancerName).filter(Boolean)).size;

        setStats({
          activeProjects,
          completedProjects,
          totalSpent,
          freelancersHired,
        });

      } catch (error) {
        console.error("Error fetching user data:", error);
      } finally {
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, [router]);

  const handleSignOut = async () => {
    try {
      await signOut(auth);
      router.push("/");
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'text-blue-600 bg-blue-100';
      case 'completed': return 'text-green-600 bg-green-100';
      case 'pending': return 'text-yellow-600 bg-yellow-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className={`min-h-screen transition-colors duration-300 ${
      darkMode ? "bg-gray-900 text-white" : "bg-gray-50 text-gray-900"
    }`}>
      {/* Header */}
      <header className={`border-b transition-colors duration-300 ${
        darkMode ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200"
      }`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-3">
              <FaRocket className="text-2xl text-purple-600" />
              <h1 className="text-xl font-bold">FreelanceHub</h1>
              <span className="px-2 py-1 text-xs bg-purple-100 text-purple-600 rounded-full">Client</span>
            </div>
            
            <div className="flex items-center gap-4">
              <button
                onClick={() => setDarkMode(!darkMode)}
                className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              >
                {darkMode ? <FaSun className="text-yellow-500" /> : <FaMoon className="text-gray-600" />}
              </button>
              
              <div className="flex items-center gap-2">
                <FaUserCircle className="text-2xl text-gray-400" />
                <div className="text-sm">
                  <p className="font-medium">{userInfo?.name}</p>
                  <p className="text-gray-500">{userInfo?.email}</p>
                </div>
              </div>
              
              <button
                onClick={handleSignOut}
                className="p-2 rounded-lg hover:bg-red-100 text-red-600 transition-colors"
                title="Sign Out"
              >
                <FaSignOutAlt />
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h2 className="text-3xl font-bold mb-2">Welcome back, {userInfo?.name}!</h2>
          <p className="text-gray-600 dark:text-gray-400">
            Manage your projects and collaborate with talented freelancers.
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className={`p-6 rounded-xl shadow-sm ${
              darkMode ? "bg-gray-800" : "bg-white"
            }`}
          >
            <div className="flex items-center gap-4">
              <div className="p-3 bg-blue-100 rounded-lg">
                <FaProjectDiagram className="text-2xl text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.activeProjects}</p>
                <p className="text-sm text-gray-500">Active Projects</p>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className={`p-6 rounded-xl shadow-sm ${
              darkMode ? "bg-gray-800" : "bg-white"
            }`}
          >
            <div className="flex items-center gap-4">
              <div className="p-3 bg-green-100 rounded-lg">
                <FaCheckCircle className="text-2xl text-green-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.completedProjects}</p>
                <p className="text-sm text-gray-500">Completed</p>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className={`p-6 rounded-xl shadow-sm ${
              darkMode ? "bg-gray-800" : "bg-white"
            }`}
          >
            <div className="flex items-center gap-4">
              <div className="p-3 bg-purple-100 rounded-lg">
                <FaFileInvoiceDollar className="text-2xl text-purple-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">${stats.totalSpent.toLocaleString()}</p>
                <p className="text-sm text-gray-500">Total Spent</p>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className={`p-6 rounded-xl shadow-sm ${
              darkMode ? "bg-gray-800" : "bg-white"
            }`}
          >
            <div className="flex items-center gap-4">
              <div className="p-3 bg-orange-100 rounded-lg">
                <FaUsers className="text-2xl text-orange-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.freelancersHired}</p>
                <p className="text-sm text-gray-500">Freelancers Hired</p>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Quick Actions */}
        <div className="mb-8">
          <h3 className="text-xl font-semibold mb-4">Quick Actions</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <button
              onClick={() => router.push('/dashboard/client/projects/new')}
              className="p-4 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors flex items-center gap-3"
            >
              <FaPlus />
              Post New Project
            </button>
            <button
              onClick={() => router.push('/dashboard/client/freelancers')}
              className="p-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-3"
            >
              <FaSearch />
              Find Freelancers
            </button>
            <button
              onClick={() => router.push('/dashboard/client/invoices')}
              className="p-4 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center gap-3"
            >
              <FaFileInvoiceDollar />
              View Invoices
            </button>
          </div>
        </div>

        {/* Recent Projects */}
        <div className={`rounded-xl shadow-sm ${
          darkMode ? "bg-gray-800" : "bg-white"
        }`}>
          <div className="p-6 border-b border-gray-200 dark:border-gray-700">
            <div className="flex justify-between items-center">
              <h3 className="text-xl font-semibold">Recent Projects</h3>
              <button
                onClick={() => router.push('/dashboard/client/projects')}
                className="text-purple-600 hover:text-purple-700 text-sm font-medium"
              >
                View All
              </button>
            </div>
          </div>
          
          <div className="p-6">
            {projects.length === 0 ? (
              <div className="text-center py-12">
                <FaProjectDiagram className="text-4xl text-gray-300 mx-auto mb-4" />
                <h4 className="text-lg font-medium text-gray-500 mb-2">No projects yet</h4>
                <p className="text-gray-400 mb-4">Start by posting your first project</p>
                <button
                  onClick={() => router.push('/dashboard/client/projects/new')}
                  className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                >
                  Post Project
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                {projects.slice(0, 5).map((project) => (
                  <motion.div
                    key={project.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                  >
                    <div className="flex-1">
                      <h4 className="font-medium mb-1">{project.title}</h4>
                      <p className="text-sm text-gray-500 mb-2">{project.description}</p>
                      <div className="flex items-center gap-4 text-xs text-gray-400">
                        <span>Budget: ${project.budget?.toLocaleString()}</span>
                        <span>Deadline: {project.deadline}</span>
                        {project.freelancerName && (
                          <span>Freelancer: {project.freelancerName}</span>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(project.status)}`}>
                        {project.status}
                      </span>
                      <button
                        onClick={() => router.push(`/dashboard/client/projects/${project.id}`)}
                        className="text-purple-600 hover:text-purple-700 text-sm"
                      >
                        View
                      </button>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
