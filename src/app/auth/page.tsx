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

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (user) => {
      if (user) {
        const snap = await getDoc(doc(db, "users", user.uid));
        const data = snap.data();
        const role = data?.role || "client";
        router.push(`/dashboard/${role}`);
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
        const role = userSnap.data()?.role || "client";
        router.push(`/dashboard/${role}`);
      } else {
        const signupRes = await createUserWithEmailAndPassword(auth, email, password);
        await setDoc(doc(db, "users", signupRes.user.uid), {
          email: email.trim().toLowerCase(),
          name: name.trim(),
          role: userRole,
          createdAt: serverTimestamp(),
        });
        router.push(`/dashboard/${userRole}`);
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
      
      if (!snap.exists()) {
        await setDoc(docRef, {
          email: user.email,
          name: user.displayName || 'User',
          role: userRole,
          createdAt: serverTimestamp(),
        });
      }
      
      const userData = snap.data();
      const role = userData?.role || userRole;
      router.push(`/dashboard/${role}`);
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute inset-0 bg-[url('/photo1.jpg')] bg-cover bg-center"></div>
      </div>

      <div className="relative z-10 min-h-screen flex">
        {/* Left Side - Branding */}
        <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-purple-600 to-blue-600 p-12 flex-col justify-center items-center text-white">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center max-w-md"
          >
            <div className="mb-8">
              <FaRocket className="text-6xl mx-auto mb-4" />
              <h1 className="text-4xl font-bold mb-4">FreelanceHub</h1>
              <p className="text-xl text-purple-100">
                Connect, Collaborate, and Grow Your Business
              </p>
            </div>
            
            <div className="space-y-6">
              <div className="flex items-center gap-4">
                <FaUsers className="text-2xl text-purple-200" />
                <div className="text-left">
                  <h3 className="font-semibold">Client Management</h3>
                  <p className="text-sm text-purple-200">Streamline your relationships</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <FaCalendar className="text-2xl text-purple-200" />
                <div className="text-left">
                  <h3 className="font-semibold">Smart Scheduling</h3>
                  <p className="text-sm text-purple-200">Never miss appointments</p>
                </div>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Right Side - Auth Forms */}
        <div className="w-full lg:w-1/2 flex items-center justify-center p-8">
          <div className="w-full max-w-md">
            <AnimatePresence mode="wait">
              {step === 'role' ? (
                <motion.div
                  key="role-selection"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.3 }}
                  className="text-center"
                >
                  <h2 className="text-3xl font-bold text-gray-900 mb-2">Welcome to FreelanceHub</h2>
                  <p className="text-gray-600 mb-8">Choose your role to get started</p>

                  <div className="space-y-4">
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => handleRoleSelect('client')}
                      className="w-full p-6 border-2 border-gray-200 rounded-xl hover:border-purple-500 hover:bg-purple-50 transition-all duration-300 group"
                    >
                      <div className="flex items-center gap-4">
                        <div className="p-3 bg-purple-100 rounded-full group-hover:bg-purple-200 transition-colors">
                          <FaUser className="text-2xl text-purple-600" />
                        </div>
                        <div className="text-left">
                          <h3 className="text-xl font-semibold text-gray-900">I'm a Client</h3>
                          <p className="text-gray-600">Looking to hire talented freelancers</p>
                        </div>
                        <FaArrowRight className="text-gray-400 group-hover:text-purple-600 transition-colors ml-auto" />
                      </div>
                    </motion.button>

                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => handleRoleSelect('freelancer')}
                      className="w-full p-6 border-2 border-gray-200 rounded-xl hover:border-blue-500 hover:bg-blue-50 transition-all duration-300 group"
                    >
                      <div className="flex items-center gap-4">
                        <div className="p-3 bg-blue-100 rounded-full group-hover:bg-blue-200 transition-colors">
                          <FaBriefcase className="text-2xl text-blue-600" />
                        </div>
                        <div className="text-left">
                          <h3 className="text-xl font-semibold text-gray-900">I'm a Freelancer</h3>
                          <p className="text-gray-600">Ready to showcase my skills and find work</p>
                        </div>
                        <FaArrowRight className="text-gray-400 group-hover:text-blue-600 transition-colors ml-auto" />
                      </div>
                    </motion.button>
                  </div>
                </motion.div>
              ) : (
                <motion.div
                  key="auth-form"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.3 }}
                >
                  <div className="text-center mb-8">
                    <button
                      onClick={handleBackToRole}
                      className="text-sm text-gray-500 hover:text-gray-700 mb-4 flex items-center gap-2 mx-auto"
                    >
                      ← Back to role selection
                    </button>
                    <div className="flex items-center justify-center gap-2 mb-2">
                      {userRole === 'client' ? (
                        <FaUser className="text-2xl text-purple-600" />
                      ) : (
                        <FaBriefcase className="text-2xl text-blue-600" />
                      )}
                      <h2 className="text-2xl font-bold text-gray-900">
                        {isLoginMode ? 'Welcome Back' : 'Create Account'}
                      </h2>
                    </div>
                    <p className="text-gray-600">
                      {isLoginMode ? 'Sign in to your account' : `Join as a ${userRole}`}
                    </p>
                  </div>

                  {/* Google Sign In Button */}
                  <LoadingButton
                    loading={authStatus === 'loading'}
                    onClick={handleGoogleSignIn}
                    className="w-full mb-6 p-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors flex items-center justify-center gap-3 text-gray-700 font-medium"
                  >
                    <FaGoogle className="text-red-500" />
                    Continue with Google
                  </LoadingButton>

                  <div className="relative mb-6">
                    <div className="absolute inset-0 flex items-center">
                      <div className="w-full border-t border-gray-300"></div>
                    </div>
                    <div className="relative flex justify-center text-sm">
                      <span className="px-2 bg-white text-gray-500">Or continue with email</span>
                    </div>
                  </div>

                  {/* Auth Form */}
                  <form onSubmit={handleAuthSubmit} className="space-y-4">
                    {!isLoginMode && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Full Name
                        </label>
                        <input
                          type="text"
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                          className={`w-full p-3 border rounded-lg focus:outline-none focus:ring-2 transition-colors ${
                            nameError ? 'border-red-500 focus:ring-red-200' : 'border-gray-300 focus:ring-purple-200'
                          }`}
                          placeholder="Enter your full name"
                        />
                        {nameError && (
                          <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
                            <FaExclamationTriangle className="text-xs" />
                            {nameError}
                          </p>
                        )}
                      </div>
                    )}

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Email Address
                      </label>
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className={`w-full p-3 border rounded-lg focus:outline-none focus:ring-2 transition-colors ${
                          emailError ? 'border-red-500 focus:ring-red-200' : 'border-gray-300 focus:ring-purple-200'
                        }`}
                        placeholder="Enter your email"
                      />
                      {emailError && (
                        <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
                          <FaExclamationTriangle className="text-xs" />
                          {emailError}
                        </p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Password
                      </label>
                      <div className="relative">
                        <input
                          type={showPassword ? "text" : "password"}
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          className={`w-full p-3 border rounded-lg focus:outline-none focus:ring-2 transition-colors pr-10 ${
                            passwordError ? 'border-red-500 focus:ring-red-200' : 'border-gray-300 focus:ring-purple-200'
                          }`}
                          placeholder="Enter your password"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                        >
                          {showPassword ? <FaEyeSlash /> : <FaEye />}
                        </button>
                      </div>
                      {passwordError && (
                        <p className="text-red-500 text-sm mt-1 flex items-center gap-1">
                          <FaExclamationTriangle className="text-xs" />
                          {passwordError}
                        </p>
                      )}
                    </div>

                    {/* Error Message */}
                    {error && (
                      <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="p-3 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2 text-red-700"
                      >
                        <FaExclamationTriangle />
                        <span className="text-sm">{error.message}</span>
                      </motion.div>
                    )}

                    <LoadingButton
                      loading={authStatus === 'loading'}
                      type="submit"
                      className={`w-full p-3 rounded-lg text-white font-medium transition-colors ${
                        userRole === 'client' 
                          ? 'bg-purple-600 hover:bg-purple-700' 
                          : 'bg-blue-600 hover:bg-blue-700'
                      }`}
                    >
                      {isLoginMode ? 'Sign In' : 'Create Account'}
                    </LoadingButton>
                  </form>

                  <div className="mt-6 text-center">
                    <button
                      onClick={() => setIsLoginMode(!isLoginMode)}
                      className="text-sm text-gray-600 hover:text-gray-800"
                    >
                      {isLoginMode 
                        ? "Don't have an account? Sign up" 
                        : "Already have an account? Sign in"
                      }
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
}
