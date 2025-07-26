// types/auth.ts
export interface TempUser {
  email: string;
  password: string;
  name?: string;
}
export interface User {
  uid: string;
  email: string;
  displayName?: string;
  photoURL?: string;
  setItems: (items: any) => void;
  clientId?: string;
  company?: string; // company name
}