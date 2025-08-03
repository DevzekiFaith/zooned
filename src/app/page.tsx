"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { auth, db } from "@/firebase";
import { onAuthStateChanged } from "firebase/auth";
import { doc, getDoc, collection, addDoc, serverTimestamp } from "firebase/firestore";
import { motion } from "framer-motion";
import { FaSun, FaMoon, FaRocket, FaUsers, FaCalendar, FaFileInvoice, FaStar, FaArrowRight, FaExclamationTriangle } from "react-icons/fa";
import { validateEmail } from "@/utils/validation";
import { withErrorHandling, AppError } from "@/utils/errorHandling";
import { LoadingSpinner, LoadingButton } from "@/components/ui/LoadingSpinner";
import { Status } from "@/types/common";

export default function HomePage() {
  const router = useRouter();
  const [darkMode, setDarkMode] = useState(false);
  const [email, setEmail] = useState("");
  const [subscribed, setSubscribed] = useState(false);
  const [subscriptionStatus, setSubscriptionStatus] = useState<Status>('idle');
  const [authStatus, setAuthStatus] = useState<Status>('loading');
  const [error, setError] = useState<AppError | null>(null);
  const [emailError, setEmailError] = useState<string>('');

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (user) => {
      setAuthStatus('loading');
      if (user) {
        const { data, error } = await withErrorHandling(async () => {
          const snap = await getDoc(doc(db, "users", user.uid));
          return snap.data()?.role || "client";
        });
        
        if (error) {
          console.error("Failed to fetch user role:", error);
          setError(error);
          setAuthStatus('error');
        } else {
          console.log("User role:", data);
          setAuthStatus('success');
        }
      } else {
        setAuthStatus('idle');
      }
    });
    return () => unsub();
  }, []);

  const handleNavigate = useCallback(() => {
    router.push("/auth");
  }, [router]);

  const validateEmailInput = useCallback((emailValue: string): string => {
    if (!emailValue.trim()) {
      return 'Email is required';
    }
    if (!validateEmail(emailValue)) {
      return 'Please enter a valid email address';
    }
    return '';
  }, []);

  const handleEmailChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setEmail(value);
    setEmailError('');
    if (value && !validateEmail(value)) {
      setEmailError('Please enter a valid email address');
    }
  }, []);

  const handleSubscribe = useCallback(async () => {
    const validationError = validateEmailInput(email);
    if (validationError) {
      setEmailError(validationError);
      return;
    }

    setSubscriptionStatus('loading');
    setError(null);

    const { error: subscriptionError } = await withErrorHandling(async () => {
      await addDoc(collection(db, "newsletter_subscribers"), {
        email: email.trim().toLowerCase(),
        subscribedAt: serverTimestamp(),
        source: 'homepage',
        userAgent: navigator.userAgent,
      });
    });

    if (subscriptionError) {
      setError(subscriptionError);
      setSubscriptionStatus('error');
    } else {
      setSubscribed(true);
      setSubscriptionStatus('success');
      setEmail('');
    }
  }, [email, validateEmailInput]);

  const features = [
    {
      icon: <FaUsers className="text-5xl text-purple-600" />,
      title: "Client Management",
      description: "Streamline your client relationships with intelligent organization tools"
    },
    {
      icon: <FaCalendar className="text-5xl text-purple-600" />,
      title: "Smart Scheduling",
      description: "Effortlessly manage meetings and never miss important appointments"
    },
    {
      icon: <FaFileInvoice className="text-5xl text-purple-600" />,
      title: "Invoice & Payments",
      description: "Create professional invoices and track payments with ease"
    }
  ];

  return (
    <div className={`min-h-screen flex flex-col transition-all duration-700 ${
      darkMode ? "bg-gray-900 text-white" : "bg-gradient-to-br from-gray-50 via-white to-purple-50 text-gray-900"
    }`}>
      {/* Header */}
      <header className="relative w-full py-12 lg:py-20">
        <div className="absolute top-8 right-8 z-10">
          <button
            onClick={() => setDarkMode(!darkMode)}
            title="Toggle Theme"
            className="p-3 rounded-full bg-white/80 backdrop-blur-sm shadow-lg hover:shadow-xl transition-all duration-300 text-gray-600 hover:text-purple-600"
          >
            {darkMode ? <FaSun className="text-xl" /> : <FaMoon className="text-xl" />}
          </button>
        </div>
        
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="text-center"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2, duration: 0.6 }}
              className="mb-8"
            >
              <h1 className="text-6xl lg:text-8xl xl:text-9xl font-black text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-purple-800 mb-6 leading-none">
                FreelanceHub
              </h1>
            </motion.div>
            
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.6 }}
              className="text-xl lg:text-2xl xl:text-3xl font-light text-gray-600 dark:text-gray-300 max-w-4xl mx-auto mb-12 leading-relaxed"
            >
              The ultimate platform for freelancers and clients to connect, collaborate, and grow together.
            </motion.p>
            
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6, duration: 0.6 }}
              className="flex flex-col sm:flex-row gap-6 justify-center items-center"
            >
              <button
                onClick={handleNavigate}
                className="btn-primary text-lg px-10 py-5 flex items-center gap-3 group"
              >
                <FaRocket className="group-hover:rotate-12 transition-transform duration-300" />
                Get Started
                <FaArrowRight className="group-hover:translate-x-1 transition-transform duration-300" />
              </button>
              <button
                onClick={() => document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' })}
                className="btn-outline text-lg px-10 py-5"
              >
                Explore Features
              </button>
            </motion.div>
          </motion.div>
        </div>
      </header>

      <main className="flex-1">
        {/* Features Section */}
        <section id="features" className="py-24 lg:py-32 px-6 lg:px-8">
          <div className="max-w-7xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
              className="text-center mb-20"
            >
              <h2 className="text-5xl lg:text-6xl xl:text-7xl font-bold text-gray-900 dark:text-white mb-8">
                Everything you need to succeed
              </h2>
              <p className="text-xl lg:text-2xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
                Powerful tools designed to streamline your workflow and boost productivity
              </p>
            </motion.div>
            
            <div className="grid lg:grid-cols-3 gap-12 lg:gap-16">
              {features.map((feature, idx) => (
                <motion.div
                  key={feature.title}
                  initial={{ opacity: 0, y: 50 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: idx * 0.2, duration: 0.8 }}
                  className="group"
                >
                  <div className="text-center p-8 lg:p-12 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-3xl shadow-xl hover:shadow-2xl transition-all duration-500 border border-gray-100 dark:border-gray-700 group-hover:scale-105">
                    <motion.div
                      whileHover={{ rotate: 5, scale: 1.1 }}
                      transition={{ duration: 0.3 }}
                      className="mb-8 flex justify-center"
                    >
                      {feature.icon}
                    </motion.div>
                    <h3 className="text-2xl lg:text-3xl font-bold text-gray-900 dark:text-white mb-6">
                      {feature.title}
                    </h3>
                    <p className="text-lg text-gray-600 dark:text-gray-300 leading-relaxed">
                      {feature.description}
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Testimonials Section */}
        <section className="py-24 lg:py-32 px-6 lg:px-8 bg-gradient-to-br from-purple-50 to-white dark:from-gray-800 dark:to-gray-900">
          <div className="max-w-7xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
              className="text-center mb-20"
            >
              <h2 className="text-5xl lg:text-6xl xl:text-7xl font-bold text-gray-900 dark:text-white mb-8">
                What Our Users Say
              </h2>
              <p className="text-xl lg:text-2xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
                Join thousands of satisfied freelancers and clients
              </p>
            </motion.div>
            
            <div className="grid lg:grid-cols-3 gap-8 lg:gap-12">
              {[
                {
                  name: "Alex Chen",
                  role: "Freelance Designer",
                  content: "This platform saved me hours every week managing client tasks and projects.",
                  rating: 5
                },
                {
                  name: "Mia Rodriguez",
                  role: "Marketing Consultant",
                  content: "Onboarding my clients has never been easier. The workflow is seamless.",
                  rating: 5
                },
                {
                  name: "Chris Thompson",
                  role: "Web Developer",
                  content: "Calendar, video calls, invoices, and chat all in one place. Absolutely brilliant!",
                  rating: 5
                }
              ].map((user, idx) => (
                <motion.div
                  key={user.name}
                  initial={{ opacity: 0, y: 50 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: idx * 0.2, duration: 0.8 }}
                  className="group"
                >
                  <div className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm p-8 lg:p-10 rounded-3xl shadow-xl hover:shadow-2xl transition-all duration-500 border border-gray-100 dark:border-gray-700 group-hover:scale-105">
                    <div className="flex gap-1 mb-6">
                      {[...Array(user.rating)].map((_, i) => (
                        <FaStar key={i} className="text-yellow-400 text-lg" />
                      ))}
                    </div>
                    <p className="text-lg text-gray-600 dark:text-gray-300 mb-8 italic leading-relaxed">
                      &ldquo;{user.content}&rdquo;
                    </p>
                    <div>
                      <p className="font-bold text-xl text-gray-900 dark:text-white">{user.name}</p>
                      <p className="text-purple-600 dark:text-purple-400 font-medium">{user.role}</p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Newsletter Section */}
        <section className="py-24 lg:py-32 px-6 lg:px-8">
          <div className="max-w-6xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
              className="purple-gradient rounded-3xl p-12 lg:p-16 text-white text-center shadow-2xl"
            >
              <h2 className="text-4xl lg:text-5xl xl:text-6xl font-bold mb-8">
                Stay Updated
              </h2>
              <p className="text-xl lg:text-2xl text-purple-100 mb-12 max-w-3xl mx-auto leading-relaxed">
                Get the latest features, tips, and insights to grow your freelance business
              </p>
              <div className="flex flex-col lg:flex-row items-center justify-center gap-6 max-w-2xl mx-auto">
                <div className="w-full lg:w-auto flex-1">
                  <input
                    type="email"
                    placeholder="Enter your email address"
                    value={email}
                    onChange={handleEmailChange}
                    disabled={subscriptionStatus === 'loading'}
                    aria-label="Email address for newsletter subscription"
                    aria-invalid={!!emailError}
                    aria-describedby={emailError ? "email-error" : undefined}
                    className={`w-full px-6 py-4 rounded-2xl text-gray-900 text-lg focus:outline-none focus:ring-4 transition-all duration-300 ${
                      emailError 
                        ? 'border-2 border-red-500 focus:ring-red-200' 
                        : 'focus:ring-white/30'
                    } ${
                      subscriptionStatus === 'loading' ? 'opacity-50 cursor-not-allowed' : ''
                    }`}
                  />
                  {emailError && (
                    <p id="email-error" className="text-red-300 text-sm mt-2 flex items-center gap-1">
                      <FaExclamationTriangle className="text-xs" />
                      {emailError}
                    </p>
                  )}
                </div>
                <LoadingButton
                  loading={subscriptionStatus === 'loading'}
                  onClick={handleSubscribe}
                  disabled={!!emailError || !email.trim()}
                  className="bg-white text-purple-600 hover:bg-gray-100 px-8 py-4 rounded-2xl font-semibold text-lg transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1 disabled:transform-none disabled:shadow-lg"
                >
                  {subscriptionStatus === 'loading' ? 'Subscribing...' : 'Subscribe'}
                </LoadingButton>
              </div>
              
              {/* Success Message */}
              {subscribed && subscriptionStatus === 'success' && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="text-green-300 mt-6 text-lg font-medium flex items-center justify-center gap-2"
                  role="alert"
                  aria-live="polite"
                >
                  <FaStar className="text-yellow-400" />
                  Successfully subscribed! 🎉
                </motion.div>
              )}
              
              {/* Error Message */}
              {error && subscriptionStatus === 'error' && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="text-red-300 mt-6 text-lg font-medium flex items-center justify-center gap-2"
                  role="alert"
                  aria-live="assertive"
                >
                  <FaExclamationTriangle />
                  {error.message}
                </motion.div>
              )}
            </motion.div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="py-16 px-6 lg:px-8 border-t border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <p className="text-lg text-gray-600 dark:text-gray-400 mb-4">
              © {new Date().getFullYear()} FreelanceHub. All rights reserved.
            </p>
            <p className="text-gray-500 dark:text-gray-500">
              Built with ❤️ for freelancers and clients worldwide
            </p>
          </motion.div>
        </div>
      </footer>
    </div>
  );
}
