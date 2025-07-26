// utils/auth.ts
import { TempUser } from "@/types/auth";

export function setTempUser(user: TempUser) {
  localStorage.setItem("tempUser", JSON.stringify(user));
}

export function getTempUser(): TempUser | null {
  const user = localStorage.getItem("tempUser");
  return user ? JSON.parse(user) : null;
}
export function clearTempUser() {
  localStorage.removeItem("tempUser");
}