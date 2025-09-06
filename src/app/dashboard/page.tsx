"use client";

import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import toast, { Toaster } from 'react-hot-toast';
import { 
  FaBriefcase, FaFileInvoiceDollar, FaChartBar, FaVideo, FaCalendarAlt, 
  FaWallet, FaFile, FaEnvelope, FaCommentAlt, FaSun, FaMoon, 
  FaSignOutAlt, FaUserCircle, FaPlus, FaTrash, FaShare, FaPaperPlane, 
  FaFilePdf, FaUpload, FaUsers, FaEllipsisV, FaFileWord, FaFileImage, 
  FaBars, FaTimes 
} from "react-icons/fa";
import { auth, db } from "@/firebase";
import { signOut } from "firebase/auth";
import { getDoc, setDoc, addDoc, query, orderBy, onSnapshot, FirestoreError, DocumentData } from "firebase/firestore";
import { getCollection, getDocRef, WithId } from "@/lib/firestore-utils";
import { serverTimestamp, convertTimestamps, toDate } from "@/lib/firebase-utils";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";
import { UserData, Meeting, Project } from "./components/types";

// Import components
import OverviewTab from "./components/OverviewTab";
import ProjectsTab from "@/app/dashboard/components/ProjectsTab";
import MeetingsTab from "@/app/dashboard/components/MeetingsTab";
import CalendarTab from "@/app/dashboard/components/CalendarTab";
import WalletTab from "@/app/dashboard/components/WalletTab";
import InvoicesTab from "@/app/dashboard/components/InvoicesTab";
import DocumentsTab from "@/app/dashboard/components/DocumentsTab";
import EmailTab from "@/app/dashboard/components/EmailTab";
import FeedbackTab from "./components/FeedbackTab";

export default function DashboardPage() {
  const router = useRouter();
  const [userData, setUserData] = useState<UserData | null>(null);
  const [activeTab, setActiveTab] = useState('overview');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [darkMode, setDarkMode] = useState(false);
  const [meetings, setMeetings] = useState<Meeting[]>([]);

  useEffect(() => {
    const checkUserRole = async (user: any) => {
      if (!user?.uid) {
        router.push('/auth');
        return;
      }

      try {
        const userDocRef = getDocRef<DocumentData>(db, 'users', user.uid);
        const userDoc = await getDoc(userDocRef);
        
        if (userDoc.exists()) {
          const userData = convertTimestamps(userDoc.data());
          setUserData({
            ...userData,
            uid: user.uid,
            email: user.email || '',
            displayName: user.displayName || '',
            photoURL: user.photoURL || '',
            role: userData.role || 'client',
            createdAt: toDate(userData.createdAt),
            updatedAt: toDate(userData.updatedAt)
          } as UserData);
        } else {
          // Create user document if it doesn't exist
          const newUserData = {
            uid: user.uid,
            email: user.email || '',
            displayName: user.displayName || '',
            photoURL: user.photoURL || '',
            role: 'client',
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp()
          };
          await setDoc(userDocRef, newUserData);
          setUserData({
            ...newUserData,
            createdAt: new Date(),
            updatedAt: new Date()
          } as UserData);
        }
      } catch (error) {
        console.error('Error getting user data:', error);
        toast.error('Error loading user data');
      } finally {
        setLoading(false);
      }
    };

    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (user) {
        checkUserRole(user);
      } else {
        router.push('/auth');
      }
    });

    // Set up real-time listener for meetings
    const meetingsQuery = query(getCollection<Meeting>(db, 'meetings'), orderBy('scheduledFor', 'asc'));
    const unsubscribeMeetings = onSnapshot(meetingsQuery, 
      (snapshot) => {
        const meetingsData = snapshot.docs.map(doc => ({
          id: doc.id,
          ...convertTimestamps(doc.data())
        } as Meeting));
        setMeetings(meetingsData);
      },
      (error: FirestoreError) => {
        console.error('Error getting meetings:', error);
        toast.error('Error loading meetings');
      }
    );

    return () => {
      unsubscribe();
      unsubscribeMeetings();
    };
  }, [router]);

  const handleSignOut = async () => {
    try {
      await signOut(auth);
      router.push('/auth');
    } catch (error) {
      console.error('Error signing out:', error);
      toast.error('Error signing out');
    }
  };

  const createJitsiMeeting = async (meeting: Omit<Meeting, 'id' | 'roomId'>) => {
    try {
      const roomId = `meeting-${Date.now()}-${Math.random().toString(36).substring(2, 11)}`;
      const meetingData = {
        ...meeting,
        roomId,
        createdAt: serverTimestamp(),
        jitsiUrl: `https://meet.jit.si/${roomId}`,
        status: 'scheduled' as const,
        createdBy: userData?.email,
        scheduledFor: meeting.scheduledFor,
        participants: Array.isArray(meeting.participants) ? meeting.participants : []
      };

      const docRef = await addDoc(getCollection<DocumentData>(db, 'meetings'), meetingData);
      
      return {
        id: docRef.id,
        ...meetingData
      } as WithId<Meeting>;
    } catch (error) {
      console.error('Error creating meeting:', error);
      throw error;
    }
  };

  const renderHeader = () => (
    <header className="w-full bg-white dark:bg-gray-800 shadow-sm fixed top-0 left-0 right-0 z-10">
      <div className="w-full px-4 py-2">
        <div className="flex justify-between items-center">
          <div className="flex items-center">
            <button 
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 -ml-2 rounded-lg text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700 mr-2"
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <FaTimes /> : <FaBars />}
            </button>
            <div>
              <h1 className="text-xl font-bold">Dashboard</h1>
              <p className="text-sm text-gray-500 dark:text-gray-400 hidden sm:block">
                Welcome back, {userData?.displayName || 'User'}!
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-2 sm:space-x-4">
            <button
              onClick={() => setDarkMode(!darkMode)}
              className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
              aria-label="Toggle dark mode"
            >
              {darkMode ? <FaSun className="text-yellow-500" /> : <FaMoon />}
            </button>
            <div className="hidden sm:block h-6 w-px bg-gray-200 dark:bg-gray-700"></div>
            <button
              onClick={handleSignOut}
              className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
              aria-label="Sign out"
            >
              <FaSignOutAlt />
              <span className="sr-only sm:not-sr-only sm:ml-2">Sign out</span>
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        <div className={`md:hidden ${mobileMenuOpen ? 'block' : 'hidden'} bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 mt-2`}>
          <div className="px-2 pt-2 pb-3 space-y-1">
            {[
              { id: 'overview', label: 'Overview', icon: FaChartBar },
              { id: 'projects', label: 'Projects', icon: FaBriefcase },
              { id: 'meetings', label: 'Meetings', icon: FaVideo },
              { id: 'calendar', label: 'Calendar', icon: FaCalendarAlt },
              { id: 'wallet', label: 'Wallet', icon: FaWallet },
              { id: 'invoices', label: 'Invoices', icon: FaFileInvoiceDollar },
              { id: 'documents', label: 'Documents', icon: FaFile },
              { id: 'email', label: 'Email', icon: FaEnvelope },
              { id: 'feedback', label: 'Feedback', icon: FaCommentAlt },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => {
                  setActiveTab(tab.id);
                  setMobileMenuOpen(false);
                }}
                className={`w-full text-left px-3 py-2 rounded-md text-base font-medium flex items-center ${
                  activeTab === tab.id
                    ? 'bg-indigo-50 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400'
                    : 'text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700'
                }`}
              >
                <tab.icon className="h-5 w-5 mr-3" />
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </div>
    </header>
  );

  const renderContent = () => {
    if (loading) {
      return (
        <div className="min-h-screen flex items-center justify-center">
          <LoadingSpinner size="lg" />
        </div>
      );
    }

    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <Toaster 
          position="top-right"
          toastOptions={{
            style: {
              background: 'var(--background)',
              color: 'var(--foreground)',
              border: '1px solid var(--border)',
            },
          }}
        />
        {renderHeader()}
        <main className="max-w-7xl mx-auto px-4 pt-20 pb-6 md:pt-24">
          {/* Desktop Navigation */}
          <div className="hidden md:block border-b border-gray-200 dark:border-gray-700 mb-6">
            <nav className="-mb-px flex space-x-8">
              {[
                { id: 'overview', label: 'Overview', icon: FaChartBar },
                { id: 'projects', label: 'Projects', icon: FaBriefcase },
                { id: 'meetings', label: 'Meetings', icon: FaVideo },
                { id: 'calendar', label: 'Calendar', icon: FaCalendarAlt },
                { id: 'wallet', label: 'Wallet', icon: FaWallet },
                { id: 'invoices', label: 'Invoices', icon: FaFileInvoiceDollar },
                { id: 'documents', label: 'Documents', icon: FaFile },
                { id: 'email', label: 'Email', icon: FaEnvelope },
                { id: 'feedback', label: 'Feedback', icon: FaCommentAlt },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm flex items-center space-x-2 ${
                    activeTab === tab.id
                      ? 'border-indigo-500 text-indigo-600 dark:border-indigo-400 dark:text-indigo-400'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-200 dark:hover:border-gray-600'
                  }`}
                >
                  <tab.icon className="h-5 w-5" />
                  <span>{tab.label}</span>
                </button>
              ))}
            </nav>
          </div>

          {/* Tab content */}
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >
              {activeTab === 'overview' && userData && (
                <OverviewTab 
                  userData={userData}
                  stats={{
                    totalEarnings: 0,
                    activeProjects: 0,
                    completedProjects: 0,
                    pendingInvoices: 0,
                    totalClients: 0,
                    meetingsThisWeek: 0,
                    pendingPayments: 0,
                    tasksDue: 0
                  }}
                  projects={[]}
                  meetings={meetings}
                  walletData={{
                    balance: 0,
                    transactions: [],
                    totalEarned: 0,
                    totalWithdrawn: 0,
                    pendingBalance: 0,
                    recentTransactions: [],
                    paymentMethods: [],
                    bankAccounts: []
                  }}
                />
              )}
              {activeTab === 'projects' && userData && <ProjectsTab userData={userData} projects={[]} />}
              {activeTab === 'meetings' && userData && <MeetingsTab userData={userData} meetings={meetings} onCreateMeeting={createJitsiMeeting} />}
              {activeTab === 'calendar' && userData && <CalendarTab userData={userData} />}
              {activeTab === 'wallet' && userData && <WalletTab userData={userData} />}
              {activeTab === 'invoices' && userData && <InvoicesTab userData={userData} />}
              {activeTab === 'documents' && userData && <DocumentsTab userData={userData} />}
              {activeTab === 'email' && <EmailTab />}
              {activeTab === 'feedback' && <FeedbackTab />}
            </motion.div>
          </AnimatePresence>
        </main>
      </div>
    );
  };

  return (
    <div className={darkMode ? 'dark' : ''}>
      {renderContent()}
    </div>
  );
}
