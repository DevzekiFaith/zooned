'use client'
import { useEffect, useState } from "react";
import { auth, db } from "@/firebase";
import { collection, addDoc, getDocs, onSnapshot, query, where } from "firebase/firestore";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function DashboardPage() {
  const router = useRouter();
  const [clients, setClients] = useState<any[]>([]);
  const user = auth.currentUser;

  useEffect(() => {
    if (!user) return router.push("/login");
    const q = query(collection(db, "users", user.uid, "clients"));
    const unsub = onSnapshot(q, (snapshot) => {
      setClients(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });
    return () => unsub();
  }, [user]);

  return (
    <div className="p-4 max-w-4xl mx-auto">
      <h2 className="text-2xl font-bold mb-4">Clients</h2>
      <Link href="/dashboard/clients/new" className="bg-blue-500 text-white px-4 py-2">+ New Client</Link>
      <ul className="mt-4 space-y-2">
        {clients.map(c => (
          <li key={c.id} className="border p-2 flex justify-between items-center">
            <div>
              <p className="font-semibold">{c.name}</p>
              <p className="text-sm">{c.email}</p>
            </div>
            <Link href={`/dashboard/clients/${c.id}`} className="text-blue-500">Manage</Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
// This code defines a simple dashboard page for managing clients in a freelance client management application.