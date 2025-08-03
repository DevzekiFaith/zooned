"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Image from "next/image";
import { auth, db } from "@/firebase";
import {
  onAuthStateChanged,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithPopup,
  sendPasswordResetEmail,
  GoogleAuthProvider,
  AuthError,
} from "firebase/auth";
import { validateEmail, validatePassword, validateName } from "@/utils/validation";
import { withErrorHandling, AppError } from "@/utils/errorHandling";
import { LoadingButton } from "@/components/ui/LoadingSpinner";
import { Status } from "@/types/common";
import {
  doc,
  getDoc,
  setDoc,
  serverTimestamp,
} from "firebase/firestore";
import { motion, AnimatePresence } from "framer-motion";
import { 
  FaGoogle, 
  FaUser, 
  FaBriefcase, 
  FaEye, 
  FaEyeSlash, 
  FaArrowRight,
  FaCheckCircle,
  FaExclamationTriangle
} from "react-icons/fa";

export default function AuthPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [userRole, setUserRole] = useState<"client" | "freelancer">("client");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [authStatus, setAuthStatus] = useState<Status>('idle');
  const [error, setError] = useState<AppError | null>(null);
  const [isLoginMode, setIsLoginMode] = useState(true);
  const [step, setStep] = useState<'role' | 'auth'>('role');
  const [emailError, setEmailError] = useState<string>('');
  const [passwordError, setPasswordError] = useState<string>('');
  const [nameError, setNameError] = useState<string>('');

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (user) => {
      if (user) {
        const snap = await getDoc(doc(db, "users", user.uid));
        const data = snap.data();
        setUserInfo({
          name: data?.name || user.displayName || "User",
          image: data?.image || user.photoURL || "",
        });
      } else {
        setUserInfo(null);
      }
      setAuthChecked(true);
    });
    return () => unsub();
  }, []);

  useEffect(() => {
    const roleParam = searchParams.get("role");
    if (roleParam === "client" || roleParam === "freelancer") {
      setUserRole(roleParam);
    }
  }, [searchParams]);

  const handleSubscribe = async () => {
    if (!email || !email.includes("@")) return;
    try {
      await addDoc(collection(db, "newsletter_subscribers"), {
        email,
        subscribedAt: serverTimestamp(),
      });
      setSubscribed(true);
    } catch (err) {
      console.error("Subscription failed", err);
    }
  };

  const handleAuthSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");
    if (!email || !password) return setErrorMsg("Please enter both email and password.");
    try {
      if (isLoginMode) {
        const loginRes = await signInWithEmailAndPassword(auth, email, password);
        const userSnap = await getDoc(doc(db, "users", loginRes.user.uid));
        const role = userSnap.data()?.role || "client";
        router.push(`/dashboard/${role}`);
      } else {
        const signupRes = await createUserWithEmailAndPassword(auth, email, password);
        await setDoc(doc(db, "users", signupRes.user.uid), {
          email,
          role: userRole,
          createdAt: serverTimestamp(),
        });
        router.push(`/dashboard/${userRole}`);
      }
    } catch (err) {
      console.error(err);
      const authError = err as AuthError;
      setErrorMsg(authError.message || "Authentication failed");
    }
  };

  const handleGoogleSignIn = async () => {
    const provider = new GoogleAuthProvider();
    try {
      const result = await signInWithPopup(auth, provider);
      const user = result.user;
      const docRef = doc(db, "users", user.uid);
      const snap = await getDoc(docRef);
      if (!snap.exists()) {
        await setDoc(docRef, {
          email: user.email,
          name: user.displayName,
          image: user.photoURL,
          role: "client",
        });
        router.push("/dashboard/client");
      } else {
        const role = snap.data()?.role || "client";
        router.push(`/dashboard/${role}`);
      }
    } catch (err) {
      console.error(err);
      setErrorMsg("Google login failed");
    }
  };

  const handleResetPassword = async () => {
    try {
      await sendPasswordResetEmail(auth, resetEmail);
      setShowResetModal(false);
      alert("Password reset link sent.");
    } catch (err) {
      console.error(err);
      alert("Reset failed. Please try again.");
    }
  };

  if (!authChecked) return null;

  return (
    <div className={`min-h-screen flex flex-col transition-colors duration-500 ${darkMode ? "bg-gray-900 text-white" : "bg-white text-gray-800"}`}>
      <header className="w-full py-8 text-center relative">
        <div className="absolute top-4 right-4 flex items-center gap-2">
          {userInfo && (
            <div className="flex items-center gap-2">
              {userInfo.image && userInfo.image.trim() && userInfo.image.startsWith('http') ? (
                <Image 
                  src={userInfo.image} 
                  alt="User avatar" 
                  width={32}
                  height={32}
                  className="rounded-full"
                  onError={() => console.log('Failed to load user image')}
                  placeholder="blur"
                  blurDataURL="data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzIiIGhlaWdodD0iMzIiIHZpZXdCb3g9IjAgMCAzMiAzMiIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjMyIiBoZWlnaHQ9IjMyIiBmaWxsPSIjRjNGNEY2Ii8+Cjwvc3ZnPgo="
                />
              ) : (
                <FaUserCircle className="w-6 h-6 text-purple-500" />
              )}
              <span className="text-sm font-medium">{userInfo.name}</span>
            </div>
          )}
          <button onClick={() => setDarkMode(!darkMode)} title="Toggle Theme" className="text-xl">
            {darkMode ? <FaSun /> : <FaMoon />}
          </button>
        </div>
        <motion.h1 initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} className="text-4xl sm:text-5xl font-extrabold text-purple-700 mb-2">
          Welcome to FreelanceHub
        </motion.h1>
        <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }} className="text-lg max-w-xl mx-auto text-gray-600 dark:text-gray-300">
          Connect, collaborate, and grow your freelance business with the ultimate platform.
        </motion.p>

        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.6 }} className="mt-6 max-w-md mx-auto w-full">
          <form onSubmit={handleAuthSubmit} className={`space-y-4 ${errorMsg ? "animate-shake" : ""}`}>
            <select title="Role" value={userRole} onChange={(e) => setUserRole(e.target.value as "client" | "freelancer")} className="border border-purple-600 text-purple-700 rounded px-4 py-2 w-full">
              <option value="client">Client</option>
              <option value="freelancer">Freelancer</option>
            </select>
            <input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full border px-4 py-2 rounded focus:outline-none focus:ring-2 focus:ring-purple-500" />
            <input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} className="w-full border px-4 py-2 rounded focus:outline-none focus:ring-2 focus:ring-purple-500" />
            {errorMsg && <p className="text-red-500 text-sm text-left">{errorMsg}</p>}
            <div className="flex justify-end text-sm">
              <button type="button" onClick={() => setShowResetModal(true)} className="text-purple-600 underline">
                Forgot Password?
              </button>
            </div>
            <div className="flex gap-4">
              <button type="button" onClick={() => setIsLoginMode(true)} className={`w-1/2 py-2 rounded font-semibold ${isLoginMode ? "bg-purple-700 text-white" : "bg-gray-200 text-gray-700"}`}>
                Sign In
              </button>
              <button type="button" onClick={() => setIsLoginMode(false)} className={`w-1/2 py-2 rounded font-semibold ${!isLoginMode ? "bg-purple-700 text-white" : "bg-gray-200 text-gray-700"}`}>
                Sign Up
              </button>
            </div>
            <button type="submit" className="bg-purple-600 w-full text-white px-6 py-2 rounded hover:bg-purple-700">
              {isLoginMode ? "Sign In" : "Sign Up"}
            </button>
            <button type="button" onClick={handleGoogleSignIn} className="bg-white border w-full border-gray-300 mt-2 text-gray-800 px-6 py-2 rounded hover:bg-gray-100">
              Continue with Google
            </button>
          </form>
        </motion.div>
      </header>

      {showResetModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg w-96 shadow-xl">
            <h2 className="text-lg font-semibold mb-4 text-purple-700">Reset Password</h2>
            <input
              type="email"
              value={resetEmail}
              onChange={(e) => setResetEmail(e.target.value)}
              placeholder="Enter your email"
              className="w-full border px-4 py-2 rounded mb-4 focus:outline-none"
            />
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setShowResetModal(false)}
                className="text-sm px-4 py-2 rounded bg-gray-200 hover:bg-gray-300"
              >
                Cancel
              </button>
              <button
                onClick={handleResetPassword}
                className="text-sm px-4 py-2 rounded bg-purple-600 text-white hover:bg-purple-700"
              >
                Send Reset Link
              </button>
            </div>
          </div>
        </div>
      )}

      <main className="flex-1 px-4 py-12 max-w-4xl mx-auto">
        <section className="mb-20">
          <h2 className="text-2xl font-bold text-center mb-8">What Our Users Say</h2>
          <div className="grid md:grid-cols-3 gap-6">
            {["Alex", "Mia", "Chris"].map((user, idx) => (
              <motion.div key={user} initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.2 }} className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
                <p className="text-sm text-gray-600 dark:text-gray-300 mb-3">
                  {user === "Alex" && "This platform saved me hours every week managing client tasks."}
                  {user === "Mia" && "Onboarding my clients has never been easier."}
                  {user === "Chris" && "Calendar, video, invoices, and chat all in one place. Brilliant!"}
                </p>
                <p className="font-semibold text-purple-600 text-sm">— {user}</p>
              </motion.div>
            ))}
          </div>
        </section>

        <section className="mb-20">
          <h2 className="text-2xl font-bold text-center mb-4">Join Our Newsletter</h2>
          <p className="text-center text-sm text-gray-600 dark:text-gray-400 mb-4">
            Get updates on features, tips, and news!
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 max-w-xl mx-auto">
            <input type="email" placeholder="Your email" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full sm:w-auto flex-1 border px-4 py-2 rounded focus:outline-none" />
            <button onClick={handleSubscribe} className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-2 rounded">
              Subscribe
            </button>
          </div>
          {subscribed && (
            <p className="text-green-600 text-center mt-2 text-sm">Subscribed successfully!</p>
          )}
        </section>
      </main>

      <footer className="py-6 text-center text-sm text-gray-500 dark:text-gray-400">
        © {new Date().getFullYear()} FreelanceHub. All rights reserved.
      </footer>
    </div>
  );
}
