"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { auth, db } from "@/firebase";
import { onAuthStateChanged } from "firebase/auth";
import { doc, getDoc, collection, addDoc, serverTimestamp } from "firebase/firestore";
import { motion } from "framer-motion";
import { FaSun, FaMoon } from "react-icons/fa";

export default function HomePage() {
  const router = useRouter();
  const [darkMode, setDarkMode] = useState(false);
  const [userRole, setUserRole] = useState<"client" | "freelancer" | null>(null);
  const [authenticated, setAuthenticated] = useState(false);
  const [email, setEmail] = useState("");
  const [subscribed, setSubscribed] = useState(false);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (user) => {
      if (user) {
        const snap = await getDoc(doc(db, "users", user.uid));
        const role = snap.data()?.role || "client";
        setUserRole(role);
        setAuthenticated(true);
      }
    });
    return () => unsub();
  }, []);

  const handleNavigate = () => {
    router.push("/auth");
  };

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

  return (
    <div
      className={`min-h-screen flex flex-col transition-colors duration-500 ${
        darkMode ? "bg-gray-900 text-white" : "bg-white text-gray-800"
      }`}
    >
      <header className="w-full py-8 text-center relative">
        <div className="absolute top-4 right-4">
          <button
            onClick={() => setDarkMode(!darkMode)}
            title="Toggle Theme"
            className="text-xl"
          >
            {darkMode ? <FaSun /> : <FaMoon />}
          </button>
        </div>
        <motion.h1
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-4xl sm:text-5xl font-extrabold text-purple-700 mb-2"
        >
          Welcome to Onboarding
        </motion.h1>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="text-lg max-w-xl mx-auto text-gray-600 dark:text-gray-300"
        >
          One platform to manage clients, collaborate, and grow your freelance business.
        </motion.p>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="mt-6"
        >
          <button
            onClick={handleNavigate}
            className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-lg font-medium transition"
          >
            Get Started
          </button>
        </motion.div>
      </header>

      <main className="flex-1 px-4 py-12 max-w-4xl mx-auto">
        <section className="mb-20">
          <h2 className="text-2xl font-bold text-center mb-8">What Our Users Say</h2>
          <div className="grid md:grid-cols-3 gap-6">
            {["Alex", "Mia", "Chris"].map((user, idx) => (
              <motion.div
                key={user}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.2 }}
                className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow"
              >
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
            <input
              type="email"
              placeholder="Your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full sm:w-auto flex-1 border px-4 py-2 rounded focus:outline-none"
            />
            <button
              onClick={handleSubscribe}
              className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-2 rounded"
            >
              Subscribe
            </button>
          </div>
          {subscribed && (
            <p className="text-green-600 text-center mt-2 text-sm">Subscribed successfully!</p>
          )}
        </section>
      </main>

      <footer className="py-6 text-center text-sm text-gray-500 dark:text-gray-400">
        © {new Date().getFullYear()} Onboarding. All rights reserved.
      </footer>
    </div>
  );
}
