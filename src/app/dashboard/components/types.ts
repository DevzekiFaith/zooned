export interface Meeting {
  id: string;
  title: string;
  scheduledFor: Date;
  roomId: string;
  description?: string;
  participants: string[];
  status?: 'scheduled' | 'completed' | 'cancelled';
  createdBy?: string;
  jitsiUrl?: string;
  createdAt?: Date;
}

export interface Project {
  id: string;
  title: string;
  status: 'active' | 'completed' | 'pending';
  budget: number;
  deadline: string;
  clientName: string;
  clientEmail?: string;
  hourlyRate?: number;
}

export interface UserData {
  id: string;
  uid?: string;  // Firebase UID
  name: string;
  displayName?: string;  // Firebase displayName
  email: string;
  role: 'client' | 'freelancer';
  avatar?: string;
  photoURL?: string;  // Firebase photoURL
  createdAt?: string | Date;
  updatedAt?: string | Date;
  emailVerified?: boolean;
}

export interface BankAccount {
  id: string;
  bankName: string;
  last4: string;
  accountType: string;
  isDefault?: boolean;
}

export interface PaymentMethod {
  id: string;
  type: string;
  last4: string;
  brand: string;
  expMonth: number;
  expYear: number;
  isDefault?: boolean;
}

export interface Transaction {
  id: string;
  amount: number;
  type: 'deposit' | 'withdrawal' | 'payment' | 'refund' | 'transfer';
  status: 'pending' | 'completed' | 'failed' | 'refunded';
  description: string;
  date: Date;
  reference?: string;
}

export interface WalletData {
  balance: number;
  transactions: Transaction[];
  totalEarned: number;
  totalWithdrawn: number;
  pendingBalance: number;
  recentTransactions: Transaction[];
  paymentMethods: PaymentMethod[];
  bankAccounts: BankAccount[];
}

export interface Stats {
  totalEarnings: number;
  activeProjects: number;
  completedProjects: number;
  pendingInvoices: number;
  totalClients?: number;
  meetingsThisWeek?: number;
  pendingPayments?: number;
  tasksDue?: number;
}
