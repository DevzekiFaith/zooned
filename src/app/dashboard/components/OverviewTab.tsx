import React, { useState } from 'react';
import { UserData, Stats, Project, Meeting, WalletData, Transaction } from './types';
import { FaArrowRight, FaCalendarAlt, FaCheckCircle, FaClock, FaDollarSign, FaFileInvoiceDollar, FaProjectDiagram, FaUserFriends, FaVideo, FaWallet, FaEllipsisV, FaTrash, FaEdit, FaCopy } from 'react-icons/fa';

interface OverviewTabProps {
  userData: UserData;
  stats: Stats;
  projects: Project[];
  meetings: Meeting[];
  walletData: WalletData;
}

const OverviewTab: React.FC<OverviewTabProps> = ({
  userData,
  stats = {
    totalEarnings: 0,
    activeProjects: 0,
    completedProjects: 0,
    pendingInvoices: 0,
    totalClients: 0,
    meetingsThisWeek: 0,
    pendingPayments: 0,
    tasksDue: 0
  },
  projects = [],
  meetings = [],
  walletData = {
    balance: 0,
    transactions: [],
    totalEarned: 0,
    totalWithdrawn: 0,
    pendingBalance: 0,
    recentTransactions: [],
    paymentMethods: [],
    bankAccounts: []
  }
}) => {
  const [showAllProjects, setShowAllProjects] = useState(false);
  const [showAllMeetings, setShowAllMeetings] = useState(false);
  const [showAllTransactions, setShowAllTransactions] = useState(false);

  // Calculate additional stats if not provided
  const enhancedStats = {
    ...stats,
    totalClients: stats.totalClients || new Set(projects.map(p => p.clientEmail)).size,
    meetingsThisWeek: stats.meetingsThisWeek || meetings.filter(m => {
      const meetingDate = new Date(m.scheduledFor);
      const today = new Date();
      const nextWeek = new Date(today);
      nextWeek.setDate(today.getDate() + 7);
      return meetingDate >= today && meetingDate <= nextWeek;
    }).length,
    pendingPayments: stats.pendingPayments || projects
      .filter(p => p.status === 'active')
      .reduce((sum, p) => sum + (p.budget || 0), 0)
  };

  // Sort projects by deadline
  const sortedProjects = [...projects].sort((a, b) => 
    new Date(a.deadline).getTime() - new Date(b.deadline).getTime()
  );

  // Sort meetings by date
  const sortedMeetings = [...meetings].sort((a, b) => 
    new Date(a.scheduledFor).getTime() - new Date(b.scheduledFor).getTime()
  );

  // Helper functions
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(amount);
  };

  const getStatusBadge = (status: string) => {
    const statusMap: Record<string, { color: string; icon: React.ReactNode }> = {
      active: { color: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200', icon: <FaCheckCircle className="h-3 w-3" /> },
      completed: { color: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200', icon: <FaCheckCircle className="h-3 w-3" /> },
      pending: { color: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200', icon: <FaClock className="h-3 w-3" /> },
      cancelled: { color: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200', icon: <FaClock className="h-3 w-3" /> },
      scheduled: { color: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200', icon: <FaCalendarAlt className="h-3 w-3" /> }
    };
    
    const statusInfo = statusMap[status.toLowerCase()] || { color: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300', icon: null };
    
    return (
      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${statusInfo.color}`}>
        {statusInfo.icon}
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  const getTransactionIcon = (type: string) => {
    const iconMap: Record<string, React.ReactNode> = {
      deposit: <FaDollarSign className="h-4 w-4 text-green-500" />,
      withdrawal: <FaWallet className="h-4 w-4 text-blue-500" />,
      payment: <FaFileInvoiceDollar className="h-4 w-4 text-purple-500" />,
      refund: <FaArrowRight className="h-4 w-4 text-yellow-500 transform rotate-180" />,
      transfer: <FaArrowRight className="h-4 w-4 text-gray-500" />
    };
    return iconMap[type.toLowerCase()] || <FaDollarSign className="h-4 w-4 text-gray-400" />;
  };
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Welcome back, {userData?.name || 'User'}!</h2>
        <p className="text-gray-500 dark:text-gray-400">Here's what's happening with your projects today.</p>
      </div>
      
      {/* Stats Overview */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow-md border border-gray-100 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Total Earnings</p>
              <p className="mt-1 text-2xl font-bold">{formatCurrency(enhancedStats.totalEarnings)}</p>
              <p className="mt-1 text-xs text-green-500 dark:text-green-400">+12% from last month</p>
            </div>
            <div className="p-3 rounded-full bg-blue-50 dark:bg-blue-900/30 text-blue-500">
              <FaDollarSign className="h-6 w-6" />
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow-md border border-gray-100 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Active Projects</p>
              <p className="mt-1 text-2xl font-bold">{enhancedStats.activeProjects}</p>
              <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">{enhancedStats.tasksDue} tasks due</p>
            </div>
            <div className="p-3 rounded-full bg-green-50 dark:bg-green-900/30 text-green-500">
              <FaProjectDiagram className="h-6 w-6" />
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow-md border border-gray-100 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Upcoming Meetings</p>
              <p className="mt-1 text-2xl font-bold">{enhancedStats.meetingsThisWeek}</p>
              <p className="mt-1 text-xs text-blue-500 dark:text-blue-400">This week</p>
            </div>
            <div className="p-3 rounded-full bg-purple-50 dark:bg-purple-900/30 text-purple-500">
              <FaVideo className="h-6 w-6" />
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow-md border border-gray-100 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Active Clients</p>
              <p className="mt-1 text-2xl font-bold">{enhancedStats.totalClients}</p>
              <p className="mt-1 text-xs text-yellow-500 dark:text-yellow-400">+2 new this month</p>
            </div>
            <div className="p-3 rounded-full bg-yellow-50 dark:bg-yellow-900/30 text-yellow-500">
              <FaUserFriends className="h-6 w-6" />
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Projects */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md border border-gray-100 dark:border-gray-700 overflow-hidden">
          <div className="p-5 border-b border-gray-100 dark:border-gray-700 flex justify-between items-center">
            <h3 className="text-lg font-semibold">Recent Projects</h3>
            <button 
              onClick={() => setShowAllProjects(!showAllProjects)}
              className="text-sm text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1"
            >
              {showAllProjects ? 'Show Less' : 'View All'}
              <FaArrowRight className={`h-3 w-3 transition-transform ${showAllProjects ? 'rotate-180' : ''}`} />
            </button>
          </div>
          <div className="divide-y divide-gray-100 dark:divide-gray-700">
            {sortedProjects.slice(0, showAllProjects ? 10 : 3).map((project) => (
              <div key={project.id} className="p-4 hover:bg-gray-50 dark:hover:bg-gray-750 transition-colors">
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="font-medium text-gray-900 dark:text-white">{project.title}</h4>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                      {project.clientName} • {getStatusBadge(project.status)}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium">{formatCurrency(project.budget)}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      Due {new Date(project.deadline).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                <div className="mt-2 flex items-center justify-between">
                  <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
                    <FaClock className="h-3.5 w-3.5 mr-1.5" />
                    <span>Created {new Date(project.deadline).toLocaleDateString()}</span>
                  </div>
                  <button className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
                    <FaEllipsisV className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ))}
            {sortedProjects.length === 0 && (
              <div className="p-6 text-center text-gray-500 dark:text-gray-400">
                <FaProjectDiagram className="mx-auto h-8 w-8 mb-2 opacity-50" />
                <p>No projects found</p>
                <p className="text-sm mt-1">Create your first project to get started</p>
              </div>
            )}
          </div>
        </div>

        {/* Upcoming Meetings */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md border border-gray-100 dark:border-gray-700 overflow-hidden">
          <div className="p-5 border-b border-gray-100 dark:border-gray-700 flex justify-between items-center">
            <h3 className="text-lg font-semibold">Upcoming Meetings</h3>
            <button 
              onClick={() => setShowAllMeetings(!showAllMeetings)}
              className="text-sm text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1"
            >
              {showAllMeetings ? 'Show Less' : 'View All'}
              <FaArrowRight className={`h-3 w-3 transition-transform ${showAllMeetings ? 'rotate-180' : ''}`} />
            </button>
          </div>
          <div className="divide-y divide-gray-100 dark:divide-gray-700">
            {sortedMeetings.filter(m => new Date(m.scheduledFor) > new Date())
              .slice(0, showAllMeetings ? 10 : 3)
              .map((meeting) => (
                <div key={meeting.id} className="p-4 hover:bg-gray-50 dark:hover:bg-gray-750 transition-colors">
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="font-medium text-gray-900 dark:text-white">{meeting.title}</h4>
                      <div className="flex items-center mt-1 text-sm text-gray-500 dark:text-gray-400">
                        <FaCalendarAlt className="h-3.5 w-3.5 mr-1.5 flex-shrink-0" />
                        <span>
                          {new Date(meeting.scheduledFor).toLocaleDateString('en-US', {
                            weekday: 'short',
                            month: 'short',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button 
                        onClick={() => window.open(`/meeting/${meeting.roomId}`, '_blank')}
                        className="p-1.5 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-full"
                        title="Join Meeting"
                      >
                        <FaVideo className="h-4 w-4" />
                      </button>
                      <button className="p-1.5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 rounded-full">
                        <FaEllipsisV className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                  {meeting.participants && meeting.participants.length > 0 && (
                    <div className="mt-2 flex items-center text-sm text-gray-500 dark:text-gray-400">
                      <FaUserFriends className="h-3.5 w-3.5 mr-1.5 flex-shrink-0" />
                      <span className="truncate">
                        With {meeting.participants.length} participant{meeting.participants.length !== 1 ? 's' : ''}
                        {meeting.participants[0] ? ` (${meeting.participants[0]}` : ''}
                        {meeting.participants.length > 1 ? ' and others)' : meeting.participants[0] ? ')' : ''}
                      </span>
                    </div>
                  )}
                </div>
              ))}
            {sortedMeetings.length === 0 && (
              <div className="p-6 text-center text-gray-500 dark:text-gray-400">
                <FaVideo className="mx-auto h-8 w-8 mb-2 opacity-50" />
                <p>No upcoming meetings</p>
                <p className="text-sm mt-1">Schedule a meeting to get started</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default OverviewTab;
