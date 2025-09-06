import React from 'react';
import { UserData, Stats, Project, Meeting, WalletData } from './types';

interface OverviewTabProps {
  userData?: UserData | null;
  stats?: Stats;
  projects?: Project[];
  meetings?: Meeting[];
  walletData?: WalletData;
}

const OverviewTabComponent: React.FC<OverviewTabProps> = ({
  userData = null,
  stats = { totalProjects: 0, totalMeetings: 0, totalEarnings: 0 },
  projects = [],
  meetings = [],
  walletData = { balance: 0, transactions: [] }
}) => {
  if (!userData) {
    return (
      <div className="flex items-center justify-center h-64">
        <p>Loading user data...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Welcome back, {userData.name || 'User'}</h2>
      {/* Add your overview content here */}
    </div>
  );
};

export default OverviewTabComponent;
