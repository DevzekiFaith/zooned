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
  FaExclamationTriangle,
  FaRocket,
  FaUsers,
  FaCalendar
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
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (user) => {
      setIsLoading(false);
      if (user) {
        try {
          const snap = await getDoc(doc(db, "users", user.uid));
          if (snap.exists()) {
            router.push('/dashboard');
          }
        } catch (error) {
          console.error("Error checking user data:", error);
        }
      }
    });
    return () => unsub();
  }, [router]);

  useEffect(() => {
    const roleParam = searchParams.get("role");
    if (roleParam === "client" || roleParam === "freelancer") {
      setUserRole(roleParam);
      setStep('auth');
    }
  }, [searchParams]);

  const validateForm = useCallback(() => {
    let isValid = true;

    // Email validation
    if (!email.trim()) {
      setEmailError('Email is required');
      isValid = false;
    } else if (!validateEmail(email)) {
      setEmailError('Please enter a valid email address');
      isValid = false;
    } else {
      setEmailError('');
    }

    // Password validation
    if (!password) {
      setPasswordError('Password is required');
      isValid = false;
    } else if (!isLoginMode) {
      const passwordValidation = validatePassword(password);
      if (!passwordValidation.isValid) {
        setPasswordError(passwordValidation.errors[0]);
        isValid = false;
      } else {
        setPasswordError('');
      }
    } else {
      setPasswordError('');
    }

    // Name validation for signup
    if (!isLoginMode) {
      if (!name.trim()) {
        setNameError('Name is required');
        isValid = false;
      } else if (!validateName(name)) {
        setNameError('Please enter a valid name (2-50 characters)');
        isValid = false;
      } else {
        setNameError('');
      }
    }

    return isValid;
  }, [email, password, name, isLoginMode]);

  const handleAuthSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    setAuthStatus('loading');
    setError(null);

    const { error: authError } = await withErrorHandling(async () => {
      if (isLoginMode) {
        const loginRes = await signInWithEmailAndPassword(auth, email, password);
        const userSnap = await getDoc(doc(db, "users", loginRes.user.uid));
        const userData = userSnap.data();
        const role = userData?.role || "client";
        
        // Store user role in localStorage for client-side access
        if (typeof window !== 'undefined') {
          localStorage.setItem('userRole', role);
        }
        
        router.push('/dashboard');
      } else {
        const signupRes = await createUserWithEmailAndPassword(auth, email, password);
        await setDoc(doc(db, "users", signupRes.user.uid), {
          email: email.trim().toLowerCase(),
          name: name.trim(),
          role: userRole,
          createdAt: serverTimestamp(),
        });
        
        // Store user role in localStorage for client-side access
        if (typeof window !== 'undefined') {
          localStorage.setItem('userRole', userRole);
        }
        
        router.push('/dashboard');
      }
    });

    if (authError) {
      setError(authError);
      setAuthStatus('error');
    } else {
      setAuthStatus('success');
    }
  }, [email, password, name, isLoginMode, userRole, validateForm, router]);

  const handleGoogleSignIn = useCallback(async () => {
    if (step === 'role') return;

    setAuthStatus('loading');
    setError(null);

    const { error: authError } = await withErrorHandling(async () => {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      const user = result.user;
      const docRef = doc(db, "users", user.uid);
      const snap = await getDoc(docRef);
      let role = userRole;

      if (!snap.exists()) {
        await setDoc(docRef, {
          email: user.email,
          name: user.displayName || 'User',
          role: userRole,
          createdAt: serverTimestamp(),
        });
      } else {
        role = snap.data()?.role || userRole;
      }

      // Store user role in localStorage for client-side access
      if (typeof window !== 'undefined') {
        localStorage.setItem('userRole', role);
      }
      
      router.push('/dashboard');
    });

    if (authError) {
      setError(authError);
      setAuthStatus('error');
    } else {
      setAuthStatus('success');
    }
  }, [userRole, step, router]);

  const handleRoleSelect = (role: "client" | "freelancer") => {
    setUserRole(role);
    setStep('auth');
  };

  const handleBackToRole = () => {
    setStep('role');
    setError(null);
    setEmail('');
    setPassword('');
    setName('');
    setEmailError('');
    setPasswordError('');
    setNameError('');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-100 via-gray-50 to-gray-200 dark:from-gray-900 dark:to-gray-800">
        <div className="animate-pulse flex flex-col items-center">
          <div className="w-16 h-16 bg-gray-300 dark:bg-gray-600 rounded-full mb-4"></div>
          <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-48"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-100 via-gray-50 to-gray-200 dark:from-gray-900 dark:to-gray-800 p-4 md:p-8">
      <div className="container mx-auto flex flex-col lg:flex-row items-center justify-center min-h-[calc(100vh-4rem)] gap-8">
        {/* Left Side - Welcome Content */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full lg:w-1/2 p-8 glassmorphism rounded-2xl backdrop-blur-lg border border-white/20 dark:border-gray-700/30"
        >
          <div className="max-w-md mx-auto">
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="mb-8"
            >
              <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-primary-500 to-primary-600 bg-clip-text text-transparent mb-4">
                Welcome to FreelanceHub
              </h1>
              <p className="text-xl text-gray-700 dark:text-gray-300">
                {step === 'role' 
                  ? 'Choose your role to get started'
                  : (isLoginMode ? 'Sign in to continue your journey' : 'Start your journey with us today')}
              </p>
            </motion.div>
          </div>
        </motion.div>

        <div className="w-full lg:w-1/2">
          <AnimatePresence mode="wait">
            {step === 'role' ? (
              <motion.div
                key="role-selection"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.3 }}
                className="space-y-6"
              >
                <motion.button
                  whileHover={{ scale: 1.02, y: -2 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => handleRoleSelect('client')}
                  className="w-full p-6 neumorph hover:neumorph-hover transition-all duration-300 group relative overflow-hidden"
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  <div className="flex items-center gap-4 relative z-10">
                    <div className="p-3 bg-white/80 dark:bg-gray-800/80 rounded-xl shadow-sm group-hover:shadow-md transition-all duration-300">
                      <FaUser className="text-2xl text-purple-600 dark:text-purple-400" />
                    </div>
                    <div className="text-left">
                      <h3 className="text-xl font-semibold text-gray-800 dark:text-white">I'm a Client</h3>
                      <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">Looking to hire talented freelancers</p>
                    </div>
                    <FaArrowRight className="text-gray-400 group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-all duration-300 ml-auto transform group-hover:translate-x-1" />
                  </div>
                </motion.button>

                <motion.button
                  whileHover={{ scale: 1.02, y: -2 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => handleRoleSelect('freelancer')}
                  className="w-full p-6 neumorph hover:neumorph-hover transition-all duration-300 group relative overflow-hidden"
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  <div className="flex items-center gap-4 relative z-10">
                    <div className="p-3 bg-white/80 dark:bg-gray-800/80 rounded-xl shadow-sm group-hover:shadow-md transition-all duration-300">
                      <FaBriefcase className="text-2xl text-blue-600 dark:text-blue-400" />
                    </div>
                    <div className="text-left">
                      <h3 className="text-xl font-semibold text-gray-800 dark:text-white">I'm a Freelancer</h3>
                      <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">Ready to showcase my skills and find work</p>
                    </div>
                    <FaArrowRight className="text-gray-400 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-all duration-300 ml-auto transform group-hover:translate-x-1" />
                  </div>
                </motion.button>
              </motion.div>
            ) : (
              <motion.div
                key="auth-form"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.3 }}
                className="space-y-6"
              >
                <div className="glassmorphism p-6 rounded-2xl">
                  <div className="flex flex-col items-center text-center mb-6">
                    <div className={`p-3 rounded-xl mb-3 ${userRole === 'client' ? 'bg-purple-100 dark:bg-purple-900/30' : 'bg-blue-100 dark:bg-blue-900/30'}`}>
                      {userRole === 'client' ? (
                        <FaUser className="text-2xl text-purple-600 dark:text-purple-400" />
                      ) : (
                        <FaBriefcase className="text-2xl text-blue-600 dark:text-blue-400" />
                      )}
                    </div>
                    <h2 className="text-2xl font-bold text-gray-800 dark:text-white">
                      {isLoginMode ? 'Welcome Back' : 'Create Account'}
                    </h2>
                    <p className="text-gray-600 dark:text-gray-300 mt-1">
                      {isLoginMode ? 'Sign in to your account' : `Join as a ${userRole}`}
                    </p>
                  </div>
                  <p className="text-center text-gray-600 dark:text-gray-300 mb-6">
                    Connect, Collaborate, and Grow Your Business
                  </p>
                </div>

                <form onSubmit={handleAuthSubmit} className="space-y-6">
                  {!isLoginMode && (
                    <div className="space-y-1">
                      <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Full Name
                      </label>
                      <div className="relative">
                        <input
                          id="name"
                          type="text"
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                          className={`w-full px-4 py-3 bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm rounded-xl border border-white/30 dark:border-gray-700/50 
                            focus:outline-none focus:ring-2 focus:ring-primary-500/30 focus:border-transparent 
                            transition-all duration-200 ${nameError ? 'border-red-400/50' : ''}
                            placeholder:text-gray-500 dark:placeholder:text-gray-400`}
                          placeholder="John Doe"
                        />
                      </div>
                      {nameError && <p className="mt-1 text-sm text-red-500 flex items-center gap-1"><FaExclamationTriangle className="text-xs" /> {nameError}</p>}
                    </div>
                  )}

                  <div className="space-y-1">
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Email Address
                    </label>
                    <div className="relative">
                      <input
                        id="email"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className={`w-full px-4 py-3 bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm rounded-xl border border-white/30 dark:border-gray-700/50 
                          focus:outline-none focus:ring-2 focus:ring-primary-500/30 focus:border-transparent 
                          transition-all duration-200 ${emailError ? 'border-red-400/50' : ''}
                          placeholder:text-gray-500 dark:placeholder:text-gray-400`}
                        placeholder="you@example.com"
                      />
                    </div>
                    {emailError && <p className="mt-1 text-sm text-red-500 flex items-center gap-1"><FaExclamationTriangle className="text-xs" /> {emailError}</p>}
                  </div>

                  <div className="space-y-1">
                    <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Password
                    </label>
                    <div className="relative">
                      <input
                        id="password"
                        type={showPassword ? 'text' : 'password'}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className={`w-full px-4 py-3 bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm rounded-xl border border-white/30 dark:border-gray-700/50 
                          focus:outline-none focus:ring-2 focus:ring-primary-500/30 focus:border-transparent 
                          pr-12 transition-all duration-200 ${passwordError ? 'border-red-400/50' : ''}
                          placeholder:text-gray-500 dark:placeholder:text-gray-400`}
                        placeholder="••••••••"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 p-1.5 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 
                          rounded-lg hover:bg-white/50 dark:hover:bg-gray-700/50 transition-colors"
                        aria-label={showPassword ? 'Hide password' : 'Show password'}
                      >
                        {showPassword ? <FaEyeSlash className="w-4 h-4" /> : <FaEye className="w-4 h-4" />}
                      </button>
                    </div>
                    {passwordError && <p className="mt-1 text-sm text-red-500 flex items-center gap-1"><FaExclamationTriangle className="text-xs" /> {passwordError}</p>}
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <input
                        id="remember-me"
                        name="remember-me"
                        type="checkbox"
                        className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                      />
                      <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-700 dark:text-gray-300">
                        Remember me
                      </label>
                    </div>

                    {isLoginMode && (
                      <div className="text-sm">
                        <a href="#" className="font-medium text-primary-600 hover:text-primary-500 dark:text-primary-400 dark:hover:text-primary-300">
                          Forgot password?
                        </a>
                      </div>
                    )}
                  </div>

                  <div>
                    <LoadingButton
                      type="submit"
                      loading={authStatus === 'loading'}
                      className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                    >
                      {isLoginMode ? 'Sign in' : 'Create account'}
                    </LoadingButton>
                  </div>
                </form>
                
                <div className="relative mt-6">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-gray-300 dark:border-gray-600"></div>
                  </div>
                  <div className="relative flex justify-center text-sm">
                    <span className="px-2 bg-white dark:bg-gray-800 text-gray-500 dark:text-gray-400">
                      Or continue with
                    </span>
                  </div>
                </div>

                <div className="mt-6">
                  <button
                    type="button"
                    onClick={handleGoogleSignIn}
                    className="w-full inline-flex justify-center py-2 px-4 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm bg-white dark:bg-gray-800 text-sm font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                    disabled={authStatus === 'loading'}
                  >
                    <span className="sr-only">Sign in with Google</span>
                    <FaGoogle className="h-5 w-5 text-red-500" />
                    <span className="ml-2">Sign in with Google</span>
                  </button>
                </div>

                <div className="mt-6 text-center text-sm">
                  <button
                    type="button"
                    onClick={() => {
                      setIsLoginMode(!isLoginMode);
                      setError(null);
                      setEmailError('');
                      setPasswordError('');
                      setNameError('');
                    }}
                    className="font-medium text-primary-600 hover:text-primary-500 dark:text-primary-400 dark:hover:text-primary-300"
                  >
                    {isLoginMode
                      ? "Don't have an account? Sign up"
                      : 'Already have an account? Sign in'}
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
