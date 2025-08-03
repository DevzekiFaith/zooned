"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  FaBriefcase,
  FaFileInvoiceDollar,
  FaChartBar,
  FaPlus,
  FaSearch,
  FaUserCircle,
  FaSignOutAlt,
  FaSun,
  FaMoon,
  FaRocket,
  FaDollarSign,
  FaClock,
  FaCheckCircle,
  FaStar,
  FaEye,
  FaUsers,
  FaCalendar,
  FaVideo,
  FaComments,
  FaFolder,
  FaCog,
  FaWallet,
  FaCreditCard,
  FaMoneyBillWave,
  FaHistory,
  FaCalendarAlt,
  FaCalendarCheck,
  FaCalendarPlus,
  FaCopy,
} from "react-icons/fa";
import { auth, db } from "@/firebase";
import { signOut } from "firebase/auth";
import { doc, getDoc, collection, getDocs, addDoc, serverTimestamp } from "firebase/firestore";
import { withErrorHandling } from "@/utils/errorHandling";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";
import CalendarTab from "@/components/dashboard/CalendarTab";
import WalletTab from "@/components/dashboard/WalletTab";

// Types
interface UserData {
  name: string;
  email: string;
  role: 'client' | 'freelancer';
  avatar?: string;
}

interface Project {
  id: string;
  title: string;
  status: 'active' | 'completed' | 'pending';
  budget: number;
  deadline: string;
  client?: string;
  freelancer?: string;
}

interface Meeting {
  id: string;
  title: string;
  roomId: string;
  scheduledFor: Date;
  participants: string[];
  status: 'scheduled' | 'ongoing' | 'completed';
  description?: string;
  duration?: number;
}

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

export default function UnifiedDashboard() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [darkMode, setDarkMode] = useState(false);
  const [activeTab, setActiveTab] = useState("overview");
  const [userData, setUserData] = useState<UserData | null>(null);
  const [projects, setProjects] = useState<Project[]>([]);
  const [meetings, setMeetings] = useState<Meeting[]>([]);
  const [walletData, setWalletData] = useState<WalletData>({
    balance: 0,
    pendingAmount: 0,
    totalEarned: 0,
    transactions: []
  });
  const [stats, setStats] = useState({
    totalProjects: 0,
    activeProjects: 0,
    completedProjects: 0,
    totalEarnings: 0,
    pendingPayments: 0,
    upcomingMeetings: 0,
  });

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (user) => {
      if (!user) {
        router.push("/auth");
        return;
      }

      const { data, error } = await withErrorHandling(async () => {
        const userRef = doc(db, "users", user.uid);
        const userSnap = await getDoc(userRef);
        const userData = userSnap.data();

        return {
          name: userData?.name || user.displayName || "User",
          email: user.email || "",
          role: userData?.role || "client",
          avatar: userData?.avatar || user.photoURL,
        };
      });

      if (error || !data) {
        console.error("Error loading user data:", error);
        router.push("/auth");
        return;
      }

      setUserData(data);
      await loadDashboardData(user.uid, data.role);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [router]);

  const loadDashboardData = async (userId: string, role: 'client' | 'freelancer') => {
    const { data } = await withErrorHandling(async () => {
      // Load projects
      const projectsSnap = await getDocs(collection(db, "users", userId, "projects"));
      const projectsData = projectsSnap.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Project[];

      // Load meetings
      const meetingsSnap = await getDocs(collection(db, "users", userId, "meetings"));
      const meetingsData = meetingsSnap.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        scheduledFor: doc.data().scheduledFor?.toDate()
      })) as Meeting[];

      // Load wallet/transaction data
      const transactionsSnap = await getDocs(collection(db, "users", userId, "transactions"));
      const transactionsData = transactionsSnap.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        date: doc.data().date?.toDate()
      })) as Transaction[];

      // Calculate wallet stats
      const completedTransactions = transactionsData.filter(t => t.status === 'completed');
      const pendingTransactions = transactionsData.filter(t => t.status === 'pending');
      const balance = completedTransactions
        .filter(t => t.type === 'received')
        .reduce((sum, t) => sum + t.amount, 0) - 
        completedTransactions
        .filter(t => t.type === 'sent')
        .reduce((sum, t) => sum + t.amount, 0);
      const pendingAmount = pendingTransactions
        .filter(t => t.type === 'received')
        .reduce((sum, t) => sum + t.amount, 0);
      const totalEarned = completedTransactions
        .filter(t => t.type === 'received')
        .reduce((sum, t) => sum + t.amount, 0);

      // Calculate stats
      const activeProjects = projectsData.filter(p => p.status === 'active').length;
      const completedProjects = projectsData.filter(p => p.status === 'completed').length;
      const totalEarnings = projectsData
        .filter(p => p.status === 'completed')
        .reduce((sum, p) => sum + (p.budget || 0), 0);
      const upcomingMeetings = meetingsData.filter(m => 
        m.status === 'scheduled' && m.scheduledFor > new Date()
      ).length;

      return {
        projects: projectsData,
        meetings: meetingsData,
        wallet: {
          balance,
          pendingAmount,
          totalEarned,
          transactions: transactionsData
        },
        stats: {
          totalProjects: projectsData.length,
          activeProjects,
          completedProjects,
          totalEarnings,
          pendingPayments: pendingAmount,
          upcomingMeetings,
        }
      };
    });

    if (data) {
      setProjects(data.projects);
      setMeetings(data.meetings);
      setWalletData(data.wallet);
      setStats(data.stats);
    }
  };

  const handleLogout = async () => {
    await signOut(auth);
    router.push("/");
  };

  const createJitsiMeeting = async (title: string, participantEmails: string[]) => {
    if (!userData) return;

    const roomId = `freelancehub-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const meetingData = {
      title,
      roomId,
      scheduledFor: new Date(),
      participants: participantEmails,
      status: 'scheduled',
      createdBy: userData.email,
      createdAt: serverTimestamp(),
      jitsiUrl: `https://meet.jit.si/${roomId}`,
    };

    const { error } = await withErrorHandling(async () => {
      await addDoc(collection(db, "users", auth.currentUser!.uid, "meetings"), meetingData);
    });

    if (!error) {
      // Refresh meetings
      await loadDashboardData(auth.currentUser!.uid, userData.role);
      
      // Copy meeting link to clipboard
      navigator.clipboard.writeText(`https://meet.jit.si/${roomId}`);
      alert(`Meeting created! Link copied to clipboard: https://meet.jit.si/${roomId}`);
    }
  };

  const getTabContent = () => {
    switch (activeTab) {
      case "overview":
        return <OverviewTab userData={userData} stats={stats} projects={projects} meetings={meetings} walletData={walletData} />;
      case "projects":
        return <ProjectsTab userData={userData} projects={projects} />;
      case "meetings":
        return <MeetingsTab userData={userData} meetings={meetings} onCreateMeeting={createJitsiMeeting} />;
      case "calendar":
        return <CalendarTab userData={userData} meetings={meetings} onCreateMeeting={createJitsiMeeting} />;
      case "wallet":
        return <WalletTab userData={userData} walletData={walletData} />;
      case "invoices":
        return <InvoicesTab userData={userData} />;
      case "clients":
        return userData?.role === 'freelancer' ? <ClientsTab /> : <FreelancersTab />;
      default:
        return <OverviewTab userData={userData} stats={stats} projects={projects} meetings={meetings} walletData={walletData} />;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className={`min-h-screen transition-all duration-300 ${
      darkMode ? "bg-gray-900 text-white" : "bg-gray-50 text-gray-900"
    }`}>
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                FreelanceHub
              </h1>
              <span className="ml-4 px-3 py-1 text-xs font-medium rounded-full bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200">
                {userData?.role === 'client' ? 'Client' : 'Freelancer'}
              </span>
            </div>
            
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setDarkMode(!darkMode)}
                className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              >
                {darkMode ? <FaSun className="text-yellow-500" /> : <FaMoon className="text-gray-600" />}
              </button>
              
              <div className="flex items-center space-x-3">
                <div className="text-right">
                  <p className="text-sm font-medium">{userData?.name}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">{userData?.email}</p>
                </div>
                {userData?.avatar ? (
                  <img src={userData.avatar} alt="Avatar" className="w-8 h-8 rounded-full" />
                ) : (
                  <FaUserCircle className="w-8 h-8 text-gray-400" />
                )}
              </div>
              
              <button
                onClick={handleLogout}
                className="p-2 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 text-red-600 dark:text-red-400 transition-colors"
                title="Logout"
              >
                <FaSignOutAlt />
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Navigation Tabs */}
        <div className="mb-8">
          <nav className="flex space-x-8 overflow-x-auto">
            {[
              { id: 'overview', label: 'Overview', icon: FaChartBar },
              { id: 'projects', label: 'Projects', icon: FaBriefcase },
              { id: 'meetings', label: 'Video Calls', icon: FaVideo },
              { id: 'calendar', label: 'Calendar', icon: FaCalendarAlt },
              { id: 'wallet', label: 'Wallet', icon: FaWallet },
              { id: 'invoices', label: 'Invoices', icon: FaFileInvoiceDollar },
              { id: 'clients', label: userData?.role === 'freelancer' ? 'Clients' : 'Freelancers', icon: FaUsers },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-medium transition-colors whitespace-nowrap ${
                  activeTab === tab.id
                    ? 'bg-purple-600 text-white'
                    : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                }`}
              >
                <tab.icon className="text-sm" />
                <span>{tab.label}</span>
              </button>
            ))}
          </nav>
        </div>

        {/* Tab Content */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.2 }}
          >
            {getTabContent()}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}

// Tab Components
function OverviewTab({ userData, stats, projects, meetings, walletData }: any) {
  return (
    <div className="space-y-8">
      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-purple-600 to-purple-800 rounded-xl p-8 text-white">
        <h2 className="text-3xl font-bold mb-2">
          Welcome back, {userData?.name}! 👋
        </h2>
        <p className="text-purple-100">
          {userData?.role === 'client' 
            ? "Manage your projects and connect with talented freelancers"
            : "Track your projects and grow your freelance business"
          }
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Projects"
          value={stats.totalProjects}
          icon={FaBriefcase}
          color="bg-blue-500"
        />
        <StatCard
          title="Active Projects"
          value={stats.activeProjects}
          icon={FaRocket}
          color="bg-green-500"
        />
        <StatCard
          title="Upcoming Meetings"
          value={stats.upcomingMeetings}
          icon={FaVideo}
          color="bg-purple-500"
        />
        <StatCard
          title={userData?.role === 'freelancer' ? "Total Earnings" : "Total Spent"}
          value={`$${stats.totalEarnings.toLocaleString()}`}
          icon={FaDollarSign}
          color="bg-yellow-500"
        />
      </div>

      {/* Recent Activity */}
      <div className="grid lg:grid-cols-2 gap-8">
        <RecentProjects projects={projects.slice(0, 3)} />
        <UpcomingMeetings meetings={meetings.slice(0, 3)} />
      </div>
    </div>
  );
}

function ProjectsTab({ userData, projects }: any) {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Projects</h2>
        <button className="btn-primary flex items-center space-x-2">
          <FaPlus />
          <span>New Project</span>
        </button>
      </div>
      
      <div className="grid gap-6">
        {projects.map((project: Project) => (
          <ProjectCard key={project.id} project={project} userRole={userData?.role} />
        ))}
      </div>
    </div>
  );
}

function MeetingsTab({ userData, meetings, onCreateMeeting }: any) {
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [meetingTitle, setMeetingTitle] = useState("");
  const [participantEmail, setParticipantEmail] = useState("");

  const handleCreateMeeting = () => {
    if (meetingTitle && participantEmail) {
      onCreateMeeting(meetingTitle, [participantEmail]);
      setMeetingTitle("");
      setParticipantEmail("");
      setShowCreateForm(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Video Calls & Meetings</h2>
        <button 
          onClick={() => setShowCreateForm(true)}
          className="btn-primary flex items-center space-x-2"
        >
          <FaVideo />
          <span>Schedule Meeting</span>
        </button>
      </div>

      {/* Create Meeting Form */}
      {showCreateForm && (
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold mb-4">Schedule New Meeting</h3>
          <div className="space-y-4">
            <input
              type="text"
              placeholder="Meeting title"
              value={meetingTitle}
              onChange={(e) => setMeetingTitle(e.target.value)}
              className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-gray-700"
            />
            <input
              type="email"
              placeholder="Participant email"
              value={participantEmail}
              onChange={(e) => setParticipantEmail(e.target.value)}
              className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-gray-700"
            />
            <div className="flex space-x-3">
              <button onClick={handleCreateMeeting} className="btn-primary">
                Create Meeting
              </button>
              <button 
                onClick={() => setShowCreateForm(false)}
                className="btn-outline"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
      
      <div className="grid gap-6">
        {meetings.map((meeting: Meeting) => (
          <MeetingCard key={meeting.id} meeting={meeting} />
        ))}
      </div>
    </div>
  );
}

function InvoicesTab({ userData }: any) {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Invoices</h2>
        <button className="btn-primary flex items-center space-x-2">
          <FaPlus />
          <span>New Invoice</span>
        </button>
      </div>
      <div className="text-center py-12 text-gray-500">
        <FaFileInvoiceDollar className="text-6xl mx-auto mb-4 opacity-50" />
        <p>No invoices yet. Create your first invoice to get started.</p>
      </div>
    </div>
  );
}

function ClientsTab() {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Clients</h2>
        <button className="btn-primary flex items-center space-x-2">
          <FaPlus />
          <span>Add Client</span>
        </button>
      </div>
      <div className="text-center py-12 text-gray-500">
        <FaUsers className="text-6xl mx-auto mb-4 opacity-50" />
        <p>No clients yet. Add your first client to get started.</p>
      </div>
    </div>
  );
}

function FreelancersTab() {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Freelancers</h2>
        <button className="btn-primary flex items-center space-x-2">
          <FaSearch />
          <span>Find Freelancers</span>
        </button>
      </div>
      <div className="text-center py-12 text-gray-500">
        <FaUsers className="text-6xl mx-auto mb-4 opacity-50" />
        <p>No freelancers yet. Search and connect with talented freelancers.</p>
      </div>
    </div>
  );
}

// Helper Components
function StatCard({ title, value, icon: Icon, color }: any) {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-600 dark:text-gray-400">{title}</p>
          <p className="text-2xl font-bold mt-1">{value}</p>
        </div>
        <div className={`p-3 rounded-lg ${color} text-white`}>
          <Icon className="text-xl" />
        </div>
      </div>
    </div>
  );
}

function ProjectCard({ project, userRole }: any) {
  const statusColors = {
    active: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
    completed: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
    pending: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="text-lg font-semibold">{project.title}</h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            {userRole === 'client' ? `Freelancer: ${project.freelancer}` : `Client: ${project.client}`}
          </p>
        </div>
        <span className={`px-3 py-1 rounded-full text-xs font-medium ${statusColors[project.status as keyof typeof statusColors]}`}>
          {project.status}
        </span>
      </div>
      <div className="flex justify-between items-center">
        <span className="text-lg font-bold text-green-600">${project.budget?.toLocaleString()}</span>
        <span className="text-sm text-gray-500">Due: {project.deadline}</span>
      </div>
    </div>
  );
}

function MeetingCard({ meeting }: any) {
  const handleJoinMeeting = () => {
    window.open(`https://meet.jit.si/${meeting.roomId}`, '_blank');
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(`https://meet.jit.si/${meeting.roomId}`);
    alert('Meeting link copied to clipboard!');
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="text-lg font-semibold">{meeting.title}</h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            {meeting.scheduledFor?.toLocaleString()}
          </p>
        </div>
        <span className={`px-3 py-1 rounded-full text-xs font-medium ${
          meeting.status === 'scheduled' ? 'bg-blue-100 text-blue-800' : 
          meeting.status === 'ongoing' ? 'bg-green-100 text-green-800' : 
          'bg-gray-100 text-gray-800'
        }`}>
          {meeting.status}
        </span>
      </div>
      <div className="flex space-x-3">
        <button onClick={handleJoinMeeting} className="btn-primary flex items-center space-x-2">
          <FaVideo />
          <span>Join Meeting</span>
        </button>
        <button onClick={handleCopyLink} className="btn-outline">
          Copy Link
        </button>
      </div>
    </div>
  );
}

function RecentProjects({ projects }: any) {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
      <h3 className="text-lg font-semibold mb-4">Recent Projects</h3>
      <div className="space-y-3">
        {projects.map((project: Project) => (
          <div key={project.id} className="flex justify-between items-center py-2">
            <div>
              <p className="font-medium">{project.title}</p>
              <p className="text-sm text-gray-500">{project.status}</p>
            </div>
            <span className="text-green-600 font-semibold">${project.budget?.toLocaleString()}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function UpcomingMeetings({ meetings }: any) {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
      <h3 className="text-lg font-semibold mb-4">Upcoming Meetings</h3>
      <div className="space-y-3">
        {meetings.map((meeting: Meeting) => (
          <div key={meeting.id} className="flex justify-between items-center py-2">
            <div>
              <p className="font-medium">{meeting.title}</p>
              <p className="text-sm text-gray-500">{meeting.scheduledFor?.toLocaleDateString()}</p>
            </div>
            <button className="text-purple-600 hover:text-purple-800 text-sm font-medium">
              Join
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
