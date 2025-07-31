// types/auth.ts
export interface TempUser {
  email: string;
  password: string;
  name?: string;
  role: "client"| "freelancer";
  phone?: string;
  image ?: string;
  company?: string; // company name
  uid?: string; // user ID
  createdAt?: Date; // creation date
}
export interface User {
  uid: string;
  email: string;
  displayName?: string;
  photoURL?: string;
  setItems: (items: any) => void;
  clientId?: string;
  company?: string; // company name
  animationDuration?: number;
  animationDelay?: number;
  isDarkMode?: boolean; // dark mode
}

type Booking = {
  id: string;
  clientName: string;
  date: string;
  [key: string]: any;
};

// Replace `useState<any[]>` with:
// const [bookings, setBookings] = useState<Booking[]>([]);
export interface Client {
  id: string;
  name: string;
  email: string;
  phone?: string;
  image?: string;
  company?: string; // company name
  bookings?: Booking[];
}