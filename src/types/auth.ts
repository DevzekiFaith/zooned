// types/auth.ts
export interface TempUser {
  email: string;
  password: string;
  name?: string;
  role: "client"| "freelancer";
  phone?: string;
  image?: string;
  company?: string; // company name
  uid?: string; // user ID
  createdAt?: Date; // creation date
}

export interface User {
  uid: string;
  email: string;
  displayName?: string;
  photoURL?: string;
  setItems: (items: unknown[]) => void;
  clientId?: string;
  company?: string; // company name
  animationDuration?: number;
  animationDelay?: number;
  isDarkMode?: boolean; // dark mode
}

export interface Booking {
  id: string;
  clientName: string;
  date: string;
  time?: string;
  duration?: number;
  status?: 'pending' | 'confirmed' | 'cancelled' | 'completed';
  notes?: string;
  [key: string]: unknown;
}

export interface Client {
  id: string;
  name: string;
  email: string;
  phone?: string;
  image?: string;
  company?: string; // company name
  bookings?: Booking[];
}

export interface Freelancer {
  id: string;
  name: string;
  email: string;
  phone?: string;
  image?: string;
  skills?: string[];
  hourlyRate?: number;
  availability?: {
    days: string[];
    hours: string;
  };
  portfolio?: string;
  bio?: string;
}

export interface Project {
  id: string;
  title: string;
  description: string;
  clientId: string;
  freelancerId?: string;
  status: 'pending' | 'in-progress' | 'completed' | 'cancelled';
  budget?: number;
  deadline?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface Invoice {
  id: string;
  projectId: string;
  clientId: string;
  freelancerId: string;
  amount: number;
  currency: string;
  status: 'draft' | 'sent' | 'paid' | 'overdue';
  dueDate: Date;
  items: InvoiceItem[];
  createdAt: Date;
}

export interface InvoiceItem {
  description: string;
  quantity: number;
  rate: number;
  amount: number;
}

export interface Message {
  id: string;
  senderId: string;
  receiverId: string;
  content: string;
  timestamp: Date;
  read: boolean;
}

export interface Notification {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  read: boolean;
  createdAt: Date;
}