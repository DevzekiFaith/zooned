// types/auth.ts
export interface TempUser {
  email: string;
  password: string;
  name?: string;
  role: "client";
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