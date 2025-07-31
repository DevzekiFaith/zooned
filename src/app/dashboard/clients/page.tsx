"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  FaPlus,
  FaCalendarAlt,
  FaUsers,
} from "react-icons/fa";
import { auth, db } from "@/firebase";
import { collection, getDocs } from "firebase/firestore";

export default function ClientsPage() {
  const router = useRouter();
  const [clients, setClients] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (user) => {
      if (!user) {
        router.push("/login");
        return;
      }
      try {
        const snap = await getDocs(collection(db, "users", user.uid, "clients"));
        const fetchedClients = snap.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
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
      icon: <FaUsers className="text-3xl text-blue-600" />,
      description: "Create and manage client profiles easily.",
      href: "/dashboard/clients/new",
    },
    {
      title: "Booking Page",
      icon: <FaCalendarAlt className="text-3xl text-blue-600 animate-bounce" />,
      description: "Schedule appointments and track availability.",
      href: "/dashboard/clients/booking",
    },
    {
      title: "Meeting Calendar",
      icon: <FaCalendarAlt className="text-3xl text-blue-600 animate-pulse" />,
      description: "View upcoming meetings and availability.",
      href: "/dashboard/clients/meeting-calendar",
    },
  ];

  return (
    <div className="min-h-screen py-12 px-6 bg-gradient-to-br from-blue-50 via-white to-purple-100">
      <h1 className="text-3xl font-bold text-center text-blue-700 mb-10">Client Dashboard</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
        {items.map((item, index) => (
          <motion.div
            key={item.title}
            whileHover={{ scale: 1.05 }}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1, duration: 0.4 }}
            onClick={() => router.push(item.href)}
            className="cursor-pointer p-6 bg-white rounded-lg shadow hover:shadow-lg transition-all border border-gray-100 relative group"
          >
            <div className="mb-4 flex items-center justify-center">
              <div className="relative">
                {item.icon}
                <div className="absolute -top-8 left-1/2 -translate-x-1/2 px-2 py-1 text-xs text-white bg-gray-700 rounded opacity-0 group-hover:opacity-100 transition pointer-events-none z-10 whitespace-nowrap">
                  {item.description}
                </div>
              </div>
            </div>
            <h2 className="text-xl font-semibold text-blue-700 text-center mb-2">
              {item.title}
            </h2>
            <p className="text-sm text-gray-600 text-center">{item.description}</p>
          </motion.div>
        ))}
      </div>

      {!loading && clients.length > 0 && (
        <div className="mt-12 max-w-4xl mx-auto">
          <h2 className="text-xl font-semibold mb-4 text-blue-700">Your Clients</h2>
          <ul className="space-y-3">
            {clients.map((client) => (
              <li key={client.id} className="p-4 bg-white rounded shadow text-sm border border-gray-100">
                <p className="font-semibold text-blue-600">{client.name || "Unnamed Client"}</p>
                <p className="text-gray-500">{client.email || "No email provided"}</p>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
