"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  FaCalendarAlt,
  FaUsers,
  FaPlus,
} from "react-icons/fa";
import { auth, db } from "@/firebase";
import { collection, getDocs } from "firebase/firestore";
import { Client } from "@/types/auth";

export default function ClientsPage() {
  const router = useRouter();
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (user) => {
      if (!user) {
        router.push("/auth");
        return;
      }
      try {
        const snap = await getDocs(collection(db, "users", user.uid, "clients"));
        const fetchedClients = snap.docs.map((doc) => ({ id: doc.id, ...doc.data() })) as Client[];
        setClients(fetchedClients);
      } catch (e) {
        console.error("Failed to fetch clients", e);
      } finally {
        setLoading(false);
      }
    });
    return () => unsubscribe();
  }, [router]);

  const items = [
    {
      title: "Add New Client",
      icon: <FaPlus className="text-3xl text-purple-600" />,
      description: "Create and manage client profiles easily.",
      href: "/dashboard/clients/new",
    },
    {
      title: "Booking Page",
      icon: <FaCalendarAlt className="text-3xl text-purple-600 animate-bounce" />,
      description: "Schedule appointments and track availability.",
      href: "/dashboard/clients/booking",
    },
    {
      title: "Meeting Calendar",
      icon: <FaCalendarAlt className="text-3xl text-purple-600 animate-pulse" />,
      description: "View upcoming meetings and availability.",
      href: "/dashboard/clients/meeting-calendar",
    },
  ];

  return (
    <div className="min-h-screen py-12 px-6 bg-gradient-to-br from-purple-50 via-white to-purple-100">
      <div className="max-w-6xl mx-auto">
        <motion.h1 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-4xl font-bold text-center text-purple-700 mb-4"
        >
          Client Dashboard
        </motion.h1>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="text-center text-gray-600 mb-10 max-w-2xl mx-auto"
        >
          Manage your clients, schedule meetings, and streamline your workflow
        </motion.p>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8 mb-12">
          {items.map((item, index) => (
            <motion.div
              key={item.title}
              whileHover={{ scale: 1.02, y: -5 }}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1, duration: 0.4 }}
              onClick={() => router.push(item.href)}
              className="cursor-pointer p-6 bg-white rounded-xl shadow-sm hover:shadow-lg transition-all border border-gray-100 relative group"
            >
              <div className="mb-4 flex items-center justify-center">
                <div className="relative">
                  {item.icon}
                  <div className="absolute -top-8 left-1/2 -translate-x-1/2 px-2 py-1 text-xs text-white bg-gray-700 rounded opacity-0 group-hover:opacity-100 transition pointer-events-none z-10 whitespace-nowrap">
                    {item.description}
                  </div>
                </div>
              </div>
              <h2 className="text-xl font-semibold text-purple-700 text-center mb-2">
                {item.title}
              </h2>
              <p className="text-sm text-gray-600 text-center">{item.description}</p>
            </motion.div>
          ))}
        </div>

        {!loading && clients.length > 0 && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="max-w-4xl mx-auto"
          >
            <h2 className="text-2xl font-semibold mb-6 text-purple-700">Your Clients</h2>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {clients.map((client) => (
                <div key={client.id} className="p-4 bg-white rounded-lg shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                      <FaUsers className="text-purple-600" />
                    </div>
                    <div>
                      <p className="font-semibold text-purple-600">{client.name || "Unnamed Client"}</p>
                      <p className="text-sm text-gray-500">{client.email || "No email provided"}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {!loading && clients.length === 0 && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="text-center py-12"
          >
            <FaUsers className="text-6xl text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-600 mb-2">No clients yet</h3>
            <p className="text-gray-500 mb-6">Start by adding your first client to get organized</p>
            <button 
              onClick={() => router.push("/dashboard/clients/new")}
              className="btn-primary"
            >
              Add Your First Client
            </button>
          </motion.div>
        )}
      </div>
    </div>
  );
}
