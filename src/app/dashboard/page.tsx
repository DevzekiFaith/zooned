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
  FaShare,
  FaDownload,
  FaUpload,
  FaFile,
  FaFilePdf,
  FaFileWord,
  FaFileImage,
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
      case "documents":
        return <DocumentsTab userData={userData} />;
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
              { id: 'documents', label: 'Documents', icon: FaFile },
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
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [showInvoiceModal, setShowInvoiceModal] = useState(false);
  const [newProject, setNewProject] = useState({
    title: '',
    description: '',
    budget: '',
    deadline: '',
    clientName: '',
    clientEmail: '',
    hourlyRate: '100'
  });
  const [generatedInvoice, setGeneratedInvoice] = useState<any>(null);

  const handleCreateProject = async () => {
    if (!newProject.title || !newProject.clientName || !newProject.budget) {
      alert('Please fill in all required fields');
      return;
    }

    // Create project
    const projectData = {
      ...newProject,
      budget: parseFloat(newProject.budget),
      status: 'active',
      createdAt: new Date(),
      freelancerId: userData?.id || 'demo_freelancer'
    };

    // Auto-generate invoice for the project
    const invoice = {
      id: `inv_${Date.now()}`,
      invoiceNumber: `INV-${Date.now()}`,
      projectId: `proj_${Date.now()}`,
      clientName: newProject.clientName,
      clientEmail: newProject.clientEmail,
      freelancerName: userData?.name || 'Freelancer',
      items: [{
        id: '1',
        description: newProject.title,
        quantity: 1,
        rate: parseFloat(newProject.budget),
        amount: parseFloat(newProject.budget)
      }],
      subtotal: parseFloat(newProject.budget),
      taxRate: 10,
      taxAmount: parseFloat(newProject.budget) * 0.1,
      total: parseFloat(newProject.budget) * 1.1,
      date: new Date().toISOString().split('T')[0],
      dueDate: newProject.deadline,
      status: 'draft',
      notes: `Invoice for project: ${newProject.title}`,
      paymentTerms: 'Payment due within 30 days'
    };

    setGeneratedInvoice(invoice);
    setShowCreateForm(false);
    setShowInvoiceModal(true);

    // Reset form
    setNewProject({
      title: '',
      description: '',
      budget: '',
      deadline: '',
      clientName: '',
      clientEmail: '',
      hourlyRate: '100'
    });
  };

  const handleSendInvoice = () => {
    alert(`Invoice ${generatedInvoice.invoiceNumber} sent to ${generatedInvoice.clientName}!`);
    setShowInvoiceModal(false);
    setGeneratedInvoice(null);
  };

  if (showCreateForm) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-bold">Create New Project</h2>
          <button 
            onClick={() => setShowCreateForm(false)}
            className="btn-outline"
          >
            Back to Projects
          </button>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Project Details */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Project Details</h3>
              <div>
                <label className="block text-sm font-medium mb-2">Project Title *</label>
                <input
                  type="text"
                  value={newProject.title}
                  onChange={(e) => setNewProject(prev => ({ ...prev, title: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700"
                  placeholder="Website Development"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Description</label>
                <textarea
                  value={newProject.description}
                  onChange={(e) => setNewProject(prev => ({ ...prev, description: e.target.value }))}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700"
                  placeholder="Project description and requirements"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Budget *</label>
                  <input
                    type="number"
                    value={newProject.budget}
                    onChange={(e) => setNewProject(prev => ({ ...prev, budget: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700"
                    placeholder="5000"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Deadline</label>
                  <input
                    type="date"
                    value={newProject.deadline}
                    onChange={(e) => setNewProject(prev => ({ ...prev, deadline: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700"
                  />
                </div>
              </div>
            </div>

            {/* Client Details */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Client Information</h3>
              <div>
                <label className="block text-sm font-medium mb-2">Client Name *</label>
                <input
                  type="text"
                  value={newProject.clientName}
                  onChange={(e) => setNewProject(prev => ({ ...prev, clientName: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700"
                  placeholder="John Doe"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Client Email</label>
                <input
                  type="email"
                  value={newProject.clientEmail}
                  onChange={(e) => setNewProject(prev => ({ ...prev, clientEmail: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700"
                  placeholder="john@example.com"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Hourly Rate (Optional)</label>
                <input
                  type="number"
                  value={newProject.hourlyRate}
                  onChange={(e) => setNewProject(prev => ({ ...prev, hourlyRate: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700"
                  placeholder="100"
                />
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-3 mt-6 pt-6 border-t">
            <button 
              onClick={() => setShowCreateForm(false)}
              className="btn-outline"
            >
              Cancel
            </button>
            <button 
              onClick={handleCreateProject}
              className="btn-primary flex items-center gap-2"
            >
              <FaFileInvoiceDollar />
              Create Project & Generate Invoice
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Projects</h2>
        <button 
          onClick={() => setShowCreateForm(true)}
          className="btn-primary flex items-center space-x-2"
        >
          <FaPlus />
          <span>New Project</span>
        </button>
      </div>

      {/* Invoice Generation Modal */}
      {showInvoiceModal && generatedInvoice && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
              <FaFileInvoiceDollar className="text-green-600" />
              Invoice Generated Successfully!
            </h3>
            
            <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 mb-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p><strong>Invoice #:</strong> {generatedInvoice.invoiceNumber}</p>
                  <p><strong>Client:</strong> {generatedInvoice.clientName}</p>
                  <p><strong>Project:</strong> {generatedInvoice.items[0].description}</p>
                </div>
                <div>
                  <p><strong>Amount:</strong> ${generatedInvoice.subtotal.toLocaleString()}</p>
                  <p><strong>Tax:</strong> ${generatedInvoice.taxAmount.toFixed(2)}</p>
                  <p><strong>Total:</strong> ${generatedInvoice.total.toFixed(2)}</p>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <button
                onClick={handleSendInvoice}
                className="w-full bg-green-600 text-white py-3 rounded-lg hover:bg-green-700 transition-colors flex items-center justify-center gap-2"
              >
                <FaShare /> Send Invoice to Client
              </button>
              <button
                onClick={() => {
                  setShowInvoiceModal(false);
                  setGeneratedInvoice(null);
                }}
                className="w-full bg-gray-300 text-gray-700 py-3 rounded-lg hover:bg-gray-400 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
      
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

function InvoicesTab({ userData }: any) {
  const [invoices, setInvoices] = useState([
    {
      id: 'inv_001',
      invoiceNumber: 'INV-2024-001',
      clientName: 'John Doe',
      projectTitle: 'Website Development',
      amount: 5000,
      status: 'paid',
      date: '2024-01-15',
      dueDate: '2024-02-15'
    },
    {
      id: 'inv_002',
      invoiceNumber: 'INV-2024-002',
      clientName: 'Jane Smith',
      projectTitle: 'Mobile App Design',
      amount: 3500,
      status: 'pending',
      date: '2024-01-20',
      dueDate: '2024-02-20'
    },
    {
      id: 'inv_003',
      invoiceNumber: 'INV-2024-003',
      clientName: 'Tech Corp',
      projectTitle: 'E-commerce Platform',
      amount: 8000,
      status: 'draft',
      date: '2024-01-25',
      dueDate: '2024-02-25'
    }
  ]);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newInvoice, setNewInvoice] = useState({
    clientName: '',
    clientEmail: '',
    projectTitle: '',
    description: '',
    amount: '',
    dueDate: '',
    notes: ''
  });

  const handleCreateInvoice = () => {
    if (!newInvoice.clientName || !newInvoice.projectTitle || !newInvoice.amount) {
      alert('Please fill in all required fields');
      return;
    }

    const invoice = {
      id: `inv_${Date.now()}`,
      invoiceNumber: `INV-${new Date().getFullYear()}-${String(invoices.length + 1).padStart(3, '0')}`,
      clientName: newInvoice.clientName,
      projectTitle: newInvoice.projectTitle,
      amount: parseFloat(newInvoice.amount),
      status: 'draft',
      date: new Date().toISOString().split('T')[0],
      dueDate: newInvoice.dueDate
    };

    setInvoices(prev => [invoice, ...prev]);
    setShowCreateForm(false);
    setNewInvoice({
      clientName: '',
      clientEmail: '',
      projectTitle: '',
      description: '',
      amount: '',
      dueDate: '',
      notes: ''
    });

    alert(`Invoice ${invoice.invoiceNumber} created successfully!`);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'paid': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'pending': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      case 'overdue': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      case 'draft': return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const handleDownloadInvoice = (invoice: any) => {
    // Create invoice content as HTML
    const invoiceHTML = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Invoice ${invoice.invoiceNumber}</title>
        <style>
          body { font-family: Arial, sans-serif; margin: 40px; color: #333; }
          .header { margin-bottom: 40px; }
          .company-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 30px; }
          .company-info { text-align: left; }
          .company-name { font-size: 32px; font-weight: bold; color: #6366f1; margin-bottom: 5px; }
          .company-tagline { font-size: 14px; color: #6b7280; margin-bottom: 10px; }
          .company-details { font-size: 12px; color: #6b7280; line-height: 1.4; }
          .invoice-info { text-align: right; }
          .invoice-title { font-size: 28px; font-weight: bold; color: #6366f1; margin-bottom: 10px; }
          .invoice-number { font-size: 18px; margin: 5px 0; }
          .section { margin: 20px 0; }
          .row { display: flex; justify-content: space-between; margin: 10px 0; }
          .label { font-weight: bold; }
          .total { font-size: 20px; font-weight: bold; color: #059669; }
          .footer { margin-top: 40px; padding-top: 20px; border-top: 1px solid #e5e7eb; }
          .divider { height: 2px; background: linear-gradient(90deg, #6366f1, #8b5cf6); margin: 30px 0; }
        </style>
      </head>
      <body>
        <div class="header">
          <div class="company-header">
            <div class="company-info">
              <div class="company-name">FreelanceHub</div>
              <div class="company-tagline">Professional Freelance Services</div>
              <div class="company-details">
                ${userData?.name || 'Freelancer'}<br>
                ${userData?.email || 'freelancer@freelancehub.com'}<br>
                www.freelancehub.com
              </div>
            </div>
            <div class="invoice-info">
              <div class="invoice-title">INVOICE</div>
              <div class="invoice-number">${invoice.invoiceNumber}</div>
            </div>
          </div>
          <div class="divider"></div>
        </div>
        
        <div class="section">
          <div class="row">
            <div><span class="label">From:</span> ${userData?.name || 'Freelancer'}</div>
            <div><span class="label">Date:</span> ${invoice.date}</div>
          </div>
          <div class="row">
            <div><span class="label">To:</span> ${invoice.clientName}</div>
            <div><span class="label">Due Date:</span> ${invoice.dueDate}</div>
          </div>
        </div>
        
        <div class="section">
          <div class="row">
            <div class="label">Project:</div>
            <div>${invoice.projectTitle}</div>
          </div>
          <div class="row">
            <div class="label">Amount:</div>
            <div class="total">$${invoice.amount.toLocaleString()}</div>
          </div>
        </div>
        
        <div class="footer">
          <p>Thank you for your business!</p>
          <p><small>Generated on ${new Date().toLocaleDateString()}</small></p>
        </div>
      </body>
      </html>
    `;
    
    // Create and download the file
    const blob = new Blob([invoiceHTML], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Invoice_${invoice.invoiceNumber}.html`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    
    alert(`Invoice ${invoice.invoiceNumber} downloaded successfully!`);
  };

  if (showCreateForm) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-bold">Create New Invoice</h2>
          <button 
            onClick={() => setShowCreateForm(false)}
            className="btn-outline"
          >
            Back to Invoices
          </button>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Client Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Client Information</h3>
              <div>
                <label className="block text-sm font-medium mb-2">Client Name *</label>
                <input
                  type="text"
                  value={newInvoice.clientName}
                  onChange={(e) => setNewInvoice(prev => ({ ...prev, clientName: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700"
                  placeholder="John Doe"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Client Email</label>
                <input
                  type="email"
                  value={newInvoice.clientEmail}
                  onChange={(e) => setNewInvoice(prev => ({ ...prev, clientEmail: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700"
                  placeholder="john@example.com"
                />
              </div>
            </div>

            {/* Invoice Details */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Invoice Details</h3>
              <div>
                <label className="block text-sm font-medium mb-2">Project Title *</label>
                <input
                  type="text"
                  value={newInvoice.projectTitle}
                  onChange={(e) => setNewInvoice(prev => ({ ...prev, projectTitle: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700"
                  placeholder="Website Development"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Amount *</label>
                  <input
                    type="number"
                    value={newInvoice.amount}
                    onChange={(e) => setNewInvoice(prev => ({ ...prev, amount: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700"
                    placeholder="5000"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Due Date</label>
                  <input
                    type="date"
                    value={newInvoice.dueDate}
                    onChange={(e) => setNewInvoice(prev => ({ ...prev, dueDate: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700"
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="mt-6">
            <label className="block text-sm font-medium mb-2">Description</label>
            <textarea
              value={newInvoice.description}
              onChange={(e) => setNewInvoice(prev => ({ ...prev, description: e.target.value }))}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700"
              placeholder="Project description and work details"
            />
          </div>

          <div className="mt-6">
            <label className="block text-sm font-medium mb-2">Notes</label>
            <textarea
              value={newInvoice.notes}
              onChange={(e) => setNewInvoice(prev => ({ ...prev, notes: e.target.value }))}
              rows={2}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700"
              placeholder="Payment terms, additional notes..."
            />
          </div>

          <div className="flex justify-end gap-3 mt-6 pt-6 border-t">
            <button 
              onClick={() => setShowCreateForm(false)}
              className="btn-outline"
            >
              Cancel
            </button>
            <button 
              onClick={handleCreateInvoice}
              className="btn-primary flex items-center gap-2"
            >
              <FaFileInvoiceDollar />
              Create Invoice
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Invoices</h2>
        <button 
          onClick={() => setShowCreateForm(true)}
          className="btn-primary flex items-center space-x-2"
        >
          <FaPlus />
          <span>New Invoice</span>
        </button>
      </div>

      {/* Invoice Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
          <div className="text-2xl font-bold text-green-600">
            ${invoices.filter(inv => inv.status === 'paid').reduce((sum, inv) => sum + inv.amount, 0).toLocaleString()}
          </div>
          <div className="text-sm text-gray-600 dark:text-gray-400">Paid</div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
          <div className="text-2xl font-bold text-yellow-600">
            ${invoices.filter(inv => inv.status === 'pending').reduce((sum, inv) => sum + inv.amount, 0).toLocaleString()}
          </div>
          <div className="text-sm text-gray-600 dark:text-gray-400">Pending</div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
          <div className="text-2xl font-bold text-gray-600">
            ${invoices.filter(inv => inv.status === 'draft').reduce((sum, inv) => sum + inv.amount, 0).toLocaleString()}
          </div>
          <div className="text-sm text-gray-600 dark:text-gray-400">Draft</div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
          <div className="text-2xl font-bold text-purple-600">
            {invoices.length}
          </div>
          <div className="text-sm text-gray-600 dark:text-gray-400">Total Invoices</div>
        </div>
      </div>

      {/* Invoices List */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold">All Invoices</h3>
        </div>
        <div className="divide-y divide-gray-200 dark:divide-gray-700">
          {invoices.map((invoice) => (
            <div key={invoice.id} className="px-6 py-4 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-4">
                    <div>
                      <h4 className="font-semibold">{invoice.invoiceNumber}</h4>
                      <p className="text-sm text-gray-600 dark:text-gray-400">{invoice.clientName}</p>
                    </div>
                    <div>
                      <p className="font-medium">{invoice.projectTitle}</p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Due: {invoice.dueDate}</p>
                    </div>
                  </div>
                </div>
                <div className="flex items-center space-x-4">
                  <div className="text-right">
                    <p className="font-bold text-lg">${invoice.amount.toLocaleString()}</p>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(invoice.status)}`}>
                      {invoice.status.charAt(0).toUpperCase() + invoice.status.slice(1)}
                    </span>
                  </div>
                  <div className="flex space-x-2">
                    <button className="p-2 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors" title="View">
                      <FaEye />
                    </button>
                    <button 
                      onClick={() => handleDownloadInvoice(invoice)}
                      className="p-2 text-purple-600 hover:bg-purple-50 dark:hover:bg-purple-900/20 rounded-lg transition-colors" 
                      title="Download"
                    >
                      <FaDownload />
                    </button>
                    <button className="p-2 text-green-600 hover:bg-green-50 dark:hover:bg-green-900/20 rounded-lg transition-colors" title="Send">
                      <FaShare />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function DocumentsTab({ userData }: any) {
  const [documents, setDocuments] = useState([
    {
      id: 'doc_001',
      name: 'Project_Proposal.pdf',
      type: 'pdf',
      size: '2.4 MB',
      uploadedAt: '2024-01-15',
      uploadedBy: 'John Doe',
      category: 'Proposals'
    },
    {
      id: 'doc_002',
      name: 'Contract_Template.docx',
      type: 'docx',
      size: '1.2 MB',
      uploadedAt: '2024-01-18',
      uploadedBy: 'Jane Smith',
      category: 'Contracts'
    },
    {
      id: 'doc_003',
      name: 'Design_Mockup.png',
      type: 'png',
      size: '3.8 MB',
      uploadedAt: '2024-01-20',
      uploadedBy: userData?.name || 'You',
      category: 'Designs'
    }
  ]);
  const [dragActive, setDragActive] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [selectedDocument, setSelectedDocument] = useState<any>(null);
  const [shareForm, setShareForm] = useState({
    clientEmail: '',
    subject: '',
    message: '',
    includeDownloadLink: true
  });

  const getFileIcon = (type: string) => {
    switch (type.toLowerCase()) {
      case 'pdf': return <FaFilePdf className="text-red-500" />;
      case 'doc':
      case 'docx': return <FaFileWord className="text-blue-500" />;
      case 'png':
      case 'jpg':
      case 'jpeg':
      case 'gif': return <FaFileImage className="text-green-500" />;
      default: return <FaFile className="text-gray-500" />;
    }
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFiles(e.dataTransfer.files);
    }
  };

  const handleFiles = (files: FileList) => {
    setUploading(true);
    
    Array.from(files).forEach((file) => {
      const newDoc = {
        id: `doc_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        name: file.name,
        type: file.name.split('.').pop() || 'unknown',
        size: formatFileSize(file.size),
        uploadedAt: new Date().toISOString().split('T')[0],
        uploadedBy: userData?.name || 'You',
        category: 'Uploads'
      };
      
      setDocuments(prev => [newDoc, ...prev]);
    });
    
    setTimeout(() => {
      setUploading(false);
      alert(`${files.length} file(s) uploaded successfully!`);
    }, 1500);
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const handleDownloadDocument = (doc: any) => {
    // Simulate document download
    const link = document.createElement('a');
    link.href = '#'; // In real implementation, this would be the actual file URL
    link.download = doc.name;
    
    // Create a mock file content for demonstration
    const content = `Mock content for ${doc.name}\nDocument ID: ${doc.id}\nUploaded by: ${doc.uploadedBy}\nDate: ${doc.uploadedAt}`;
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    
    link.href = url;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    
    alert(`${doc.name} downloaded successfully!`);
  };

  const handleDeleteDocument = (docId: string) => {
    if (confirm('Are you sure you want to delete this document?')) {
      setDocuments(prev => prev.filter(doc => doc.id !== docId));
      alert('Document deleted successfully!');
    }
  };

  const handleShareDocument = (doc: any) => {
    setSelectedDocument(doc);
    setShareForm({
      clientEmail: '',
      subject: `${userData?.name || 'FreelanceHub'} - ${doc.name}`,
      message: `Hi,\n\nI'm sharing the document "${doc.name}" with you.\n\nDocument Details:\n- File: ${doc.name}\n- Size: ${doc.size}\n- Category: ${doc.category}\n\nBest regards,\n${userData?.name || 'FreelanceHub Team'}`,
      includeDownloadLink: true
    });
    setShowShareModal(true);
  };

  const handleSendEmail = () => {
    if (!shareForm.clientEmail || !shareForm.subject) {
      alert('Please fill in the client email and subject fields.');
      return;
    }

    // Generate shareable link (in real implementation, this would be a secure URL)
    const shareableLink = `https://freelancehub.com/shared/${selectedDocument?.id}?token=${Math.random().toString(36).substr(2, 16)}`;
    
    // Compose email content
    const emailBody = shareForm.includeDownloadLink 
      ? `${shareForm.message}\n\nDownload Link: ${shareableLink}\n\nThis link will expire in 7 days for security purposes.`
      : shareForm.message;

    // Create mailto link (opens default email client)
    const mailtoLink = `mailto:${shareForm.clientEmail}?subject=${encodeURIComponent(shareForm.subject)}&body=${encodeURIComponent(emailBody)}`;
    
    // Open email client
    window.open(mailtoLink, '_blank');
    
    // Close modal and reset form
    setShowShareModal(false);
    setSelectedDocument(null);
    setShareForm({
      clientEmail: '',
      subject: '',
      message: '',
      includeDownloadLink: true
    });
    
    alert(`Email composed and opened in your default email client!\nDocument: ${selectedDocument?.name}\nRecipient: ${shareForm.clientEmail}`);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Documents</h2>
        <label className="btn-primary flex items-center space-x-2 cursor-pointer">
          <FaUpload />
          <span>Upload Files</span>
          <input
            type="file"
            multiple
            className="hidden"
            onChange={(e) => e.target.files && handleFiles(e.target.files)}
          />
        </label>
      </div>

      {/* Upload Area */}
      <div
        className={`border-2 border-dashed rounded-xl p-8 text-center transition-colors ${
          dragActive 
            ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/20' 
            : 'border-gray-300 dark:border-gray-600 hover:border-purple-400'
        }`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
      >
        {uploading ? (
          <div className="flex flex-col items-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mb-4"></div>
            <p className="text-lg font-medium">Uploading files...</p>
          </div>
        ) : (
          <div className="flex flex-col items-center">
            <FaUpload className="text-4xl text-gray-400 mb-4" />
            <p className="text-lg font-medium mb-2">Drag and drop files here</p>
            <p className="text-sm text-gray-500">or click the Upload Files button above</p>
            <p className="text-xs text-gray-400 mt-2">Supports: PDF, DOC, DOCX, PNG, JPG, GIF</p>
          </div>
        )}
      </div>

      {/* Document Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
          <div className="text-2xl font-bold text-blue-600">{documents.length}</div>
          <div className="text-sm text-gray-600 dark:text-gray-400">Total Documents</div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
          <div className="text-2xl font-bold text-green-600">
            {documents.filter(doc => doc.type === 'pdf').length}
          </div>
          <div className="text-sm text-gray-600 dark:text-gray-400">PDF Files</div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
          <div className="text-2xl font-bold text-purple-600">
            {documents.filter(doc => ['png', 'jpg', 'jpeg', 'gif'].includes(doc.type)).length}
          </div>
          <div className="text-sm text-gray-600 dark:text-gray-400">Images</div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
          <div className="text-2xl font-bold text-orange-600">
            {documents.filter(doc => ['doc', 'docx'].includes(doc.type)).length}
          </div>
          <div className="text-sm text-gray-600 dark:text-gray-400">Word Docs</div>
        </div>
      </div>

      {/* Documents List */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold">All Documents</h3>
        </div>
        <div className="divide-y divide-gray-200 dark:divide-gray-700">
          {documents.map((doc) => (
            <div key={doc.id} className="px-6 py-4 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="text-2xl">
                    {getFileIcon(doc.type)}
                  </div>
                  <div>
                    <h4 className="font-semibold">{doc.name}</h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {doc.size} • Uploaded by {doc.uploadedBy} • {doc.uploadedAt}
                    </p>
                  </div>
                  <span className="px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded-full text-xs font-medium">
                    {doc.category}
                  </span>
                </div>
                <div className="flex space-x-2">
                  <button 
                    onClick={() => handleDownloadDocument(doc)}
                    className="p-2 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors" 
                    title="Download"
                  >
                    <FaDownload />
                  </button>
                  <button 
                    onClick={() => handleShareDocument(doc)}
                    className="p-2 text-green-600 hover:bg-green-50 dark:hover:bg-green-900/20 rounded-lg transition-colors" 
                    title="Share"
                  >
                    <FaShare />
                  </button>
                  <button 
                    onClick={() => handleDeleteDocument(doc.id)}
                    className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors" 
                    title="Delete"
                  >
                    <FaEye />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Share Document Modal */}
      {showShareModal && selectedDocument && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
              <FaShare className="text-green-600" />
              Share Document: {selectedDocument.name}
            </h3>
            
            <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 mb-6">
              <div className="flex items-center gap-3">
                <div className="text-2xl">
                  {getFileIcon(selectedDocument.type)}
                </div>
                <div>
                  <p className="font-semibold">{selectedDocument.name}</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {selectedDocument.size} • {selectedDocument.category}
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Client Email *</label>
                <input
                  type="email"
                  value={shareForm.clientEmail}
                  onChange={(e) => setShareForm(prev => ({ ...prev, clientEmail: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700"
                  placeholder="client@example.com"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-2">Subject *</label>
                <input
                  type="text"
                  value={shareForm.subject}
                  onChange={(e) => setShareForm(prev => ({ ...prev, subject: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-2">Message</label>
                <textarea
                  value={shareForm.message}
                  onChange={(e) => setShareForm(prev => ({ ...prev, message: e.target.value }))}
                  rows={6}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700"
                  placeholder="Add a personal message..."
                />
              </div>
              
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="includeDownloadLink"
                  checked={shareForm.includeDownloadLink}
                  onChange={(e) => setShareForm(prev => ({ ...prev, includeDownloadLink: e.target.checked }))}
                  className="mr-2"
                />
                <label htmlFor="includeDownloadLink" className="text-sm">
                  Include secure download link (expires in 7 days)
                </label>
              </div>
            </div>

            <div className="flex justify-end gap-3 mt-6 pt-6 border-t">
              <button 
                onClick={() => {
                  setShowShareModal(false);
                  setSelectedDocument(null);
                }}
                className="btn-outline"
              >
                Cancel
              </button>
              <button 
                onClick={handleSendEmail}
                className="btn-primary flex items-center gap-2"
              >
                <FaShare />
                Send Email
              </button>
            </div>
          </div>
        </div>
      )}
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
