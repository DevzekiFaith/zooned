// pages/signup.tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { FaTimes } from "react-icons/fa";
import { setTempUser } from "@/utils/auth";
import { FaPlus, FaTrash } from "react-icons/fa";
import type { TempUser } from "@/types/auth";

export default function SignupPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState<{
    message: string;
    type: "success" | "error";
  } | null>(null);

  const triggerToast = (message: string, type: "success" | "error") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  };

  const handleSignup = () => {
    if (!email || !password || !confirmPassword) {
      return triggerToast("Please fill all fields", "error");
    }

    if (password !== confirmPassword) {
      return triggerToast("Passwords do not match.", "error");
    }

    const mockUser: TempUser = { email, password };
    setTempUser(mockUser);
    triggerToast("Signup successful! Redirecting...", "success");

    setTimeout(() => router.push("/"), 1000);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-100 to-blue-50 px-4">
      <div className="w-full max-w-md bg-white p-6 rounded-xl shadow-xl space-y-4 relative">
        {toast && (
          <div
            className={`absolute top-2 inset-x-2 flex justify-between items-center px-4 py-2 text-sm rounded-lg shadow z-10 animate-fade-in ${
              toast.type === "success"
                ? "bg-green-100 border border-green-300 text-green-700"
                : "bg-red-100 border border-red-300 text-red-700"
            }`}
          >
            <span>{toast.message}</span>
            <button onClick={() => setToast(null)} title="Dismiss">
              <FaTimes />
            </button>
          </div>
        )}

        <h2 className="text-2xl font-bold text-center text-blue-700">
          Create Account
        </h2>

        <input
          type="email"
          className="w-full border p-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-400"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <input
          type="password"
          className="w-full border p-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-400"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <input
          type="password"
          className="w-full border p-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-400"
          placeholder="Confirm Password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
        />

        <button
          onClick={handleSignup}
          disabled={loading}
          className={`w-full py-2 rounded text-white font-semibold transition-all duration-200 ${
            loading
              ? "bg-blue-300 cursor-not-allowed"
              : "bg-blue-600 hover:bg-blue-700"
          }`}
        >
          {loading ? "Creating..." : "Sign Up"}
        </button>

        <p className="text-sm text-gray-600 text-center">
          Already have an account?{" "}
          <a href="/login" className="text-blue-600 underline">
            Login
          </a>
        </p>
      </div>
    </div>
  );
}
