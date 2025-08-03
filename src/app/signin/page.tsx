"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  createUserWithEmailAndPassword,
  updateProfile,
  sendPasswordResetEmail,
  AuthError,
} from "firebase/auth";
import { auth, db, storage } from "@/firebase";
import { doc, setDoc } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { FaTimes, FaEye, FaEyeSlash } from "react-icons/fa";

export default function SigninPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [name, setName] = useState("");
  const [role, setRole] = useState<"client" | "freelancer">("client");
  const [avatar, setAvatar] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [toastMsg, setToastMsg] = useState<{
    message: string;
    type: "success" | "error";
  } | null>(null);

  const showToast = (message: string, type: "success" | "error") => {
    setToastMsg({ message, type });
    setTimeout(() => setToastMsg(null), 4000);
  };

  const isValidEmail = (email: string): boolean =>
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  const isStrongPassword = (password: string): boolean =>
    password.length >= 8 && /\d/.test(password) && /[A-Z]/.test(password);

  const handleSignup = async () => {
    if (!email || !password || !confirmPassword || !name) {
      return showToast("Please fill all fields", "error");
    }
    if (!isValidEmail(email)) {
      return showToast("Invalid email format", "error");
    }
    if (!isStrongPassword(password)) {
      return showToast(
        "Password must be at least 8 characters, include an uppercase letter and a number",
        "error"
      );
    }
    if (password !== confirmPassword) {
      return showToast("Passwords do not match", "error");
    }

    setLoading(true);
    try {
      const userCred = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );
      const user = userCred.user;

      let photoURL = "";
      if (avatar) {
        const storageRef = ref(storage, `avatars/${user.uid}`);
        await uploadBytes(storageRef, avatar);
        photoURL = await getDownloadURL(storageRef);
      }

      await updateProfile(user, { displayName: name, photoURL });
      await setDoc(doc(db, "users", user.uid), {
        email: user.email,
        name,
        role,
        image: photoURL,
      });

      showToast("Signup successful! Redirecting...", "success");

      setTimeout(() => {
        router.push(
          role === "freelancer" ? "/dashboard/freelancer" : "/dashboard/clients"
        );
      }, 1000);
    } catch (err) {
      console.error(err);
      const authError = err as AuthError;
      showToast(authError.message || "Signup failed", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async () => {
    if (!email) return showToast("Enter your email to reset password", "error");
    try {
      await sendPasswordResetEmail(auth, email);
      showToast("Password reset email sent", "success");
    } catch (err) {
      console.error(err);
      const authError = err as AuthError;
      showToast(authError.message || "Failed to send reset email", "error");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-100 to-purple-50 px-4">
      <div className="w-full max-w-md bg-white p-6 rounded-xl shadow-xl space-y-4 relative">
        {toastMsg && (
          <div
            className={`absolute top-2 inset-x-2 flex justify-between items-center px-4 py-2 text-sm rounded-lg shadow z-10 animate-fade-in ${
              toastMsg.type === "success"
                ? "bg-green-100 border border-green-300 text-green-700"
                : "bg-red-100 border border-red-300 text-red-700"
            }`}
          >
            <span>{toastMsg.message}</span>
            <button onClick={() => setToastMsg(null)} title="Dismiss">
              <FaTimes />
            </button>
          </div>
        )}

        <h2 className="text-2xl font-bold text-center text-purple-700">
          Create Account
        </h2>

        <input
          type="text"
          className="w-full border p-2 rounded focus:outline-none focus:ring-2 focus:ring-purple-400"
          placeholder="Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <input
          type="email"
          className="w-full border p-2 rounded focus:outline-none focus:ring-2 focus:ring-purple-400"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <div className="relative">
          <input
            type={showPassword ? "text" : "password"}
            className="w-full border p-2 rounded focus:outline-none focus:ring-2 focus:ring-purple-400"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-2 top-2 text-gray-600"
            title="Toggle Password"
          >
            {showPassword ? <FaEyeSlash /> : <FaEye />}
          </button>
        </div>

        <div className="relative">
          <input
            type={showConfirmPassword ? "text" : "password"}
            className="w-full border p-2 rounded focus:outline-none focus:ring-2 focus:ring-purple-400"
            placeholder="Confirm Password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
          />
          <button
            type="button"
            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
            className="absolute right-2 top-2 text-gray-600"
            title="Toggle Password"
          >
            {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
          </button>
        </div>

        <select
          title="Select Role"
          value={role}
          onChange={(e) => setRole(e.target.value as "client" | "freelancer")}
          className="w-full border p-2 rounded focus:outline-none focus:ring-2 focus:ring-purple-400"
        >
          <option value="client">Client</option>
          <option value="freelancer">Freelancer</option>
        </select>

        <input
          placeholder="Upload Avatar"
          type="file"
          accept="image/*"
          onChange={(e) => setAvatar(e.target.files?.[0] || null)}
          className="w-full border p-2 rounded"
        />

        <button
          onClick={handleSignup}
          disabled={loading}
          className={`w-full py-2 rounded text-white font-semibold transition-all duration-200 ${
            loading
              ? "bg-purple-300 cursor-not-allowed"
              : "bg-purple-600 hover:bg-purple-700"
          }`}
        >
          {loading ? "Creating..." : "Sign Up"}
        </button>

        <p className="text-sm text-gray-600 text-center">
          Already have an account?{" "}
          <a href="/auth" className="text-purple-600 underline">
            Login
          </a>
        </p>
        <p className="text-sm text-center">
          <button
            onClick={handleResetPassword}
            className="text-purple-600 underline"
          >
            Forgot Password?
          </button>
        </p>
      </div>
    </div>
  );
}
