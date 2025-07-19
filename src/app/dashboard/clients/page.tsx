'use client'
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { auth, db } from "../../../firebase";
import { doc, getDoc } from "firebase/firestore";
import Link from "next/link";

export default function ClientDetailPage() {
  const { clientId } = useParams();
  const [client, setClient] = useState<any>(null);
  const user = auth.currentUser!;

  useEffect(() => {
    const fetchClient = async () => {
      const docRef = doc(db, "users", user.uid, "clients", String(clientId));
      const docSnap = await getDoc(docRef);
      setClient(docSnap.data());
    };
    fetchClient();
  }, []);

  if (!client) return <p className="p-4">Loading...</p>;

  const whatsappUrl = `https://wa.me/${client.whatsapp}?text=${encodeURIComponent(
    `Hi ${client.name}, this is a message regarding your onboarding.`
  )}`;

  return (
    <div className="p-6 max-w-3xl mx-auto space-y-8">
      {/* Profile Card */}
      <div className="flex items-center gap-6 bg-white rounded-xl shadow p-6">
        <div className="w-20 h-20 rounded-full bg-gradient-to-br from-blue-400 to-purple-400 flex items-center justify-center text-3xl text-white font-bold">
          {client.name?.[0] || "?"}
        </div>
        <div>
          <h2 className="text-2xl font-bold">{client.name}</h2>
          <p className="text-gray-600">{client.email}</p>
          <p className="text-gray-600">{client.phone}</p>
          <div className="flex gap-3 mt-2">
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 px-3 py-1.5 bg-green-500 hover:bg-green-600 text-white rounded transition"
            >
              <span>💬</span> WhatsApp
            </a>
            <a
              href={`mailto:${client.email}`}
              className="inline-flex items-center gap-1 px-3 py-1.5 bg-blue-500 hover:bg-blue-600 text-white rounded transition"
            >
              <span>✉️</span> Email
            </a>
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="flex gap-4 justify-center">
        <Link
          href={`documents`}
          className="bg-blue-100 hover:bg-blue-200 text-blue-700 px-4 py-2 rounded font-semibold transition"
        >
          📁 Documents
        </Link>
        <Link
          href={`booking`}
          className="bg-purple-100 hover:bg-purple-200 text-purple-700 px-4 py-2 rounded font-semibold transition"
        >
          📅 Bookings
        </Link>
        <Link
          href={`invoice`}
          className="bg-green-100 hover:bg-green-200 text-green-700 px-4 py-2 rounded font-semibold transition"
        >
          💸 Invoices
        </Link>
      </div>

      {/* Client Details Section */}
      <div className="bg-white rounded-xl shadow p-6">
        <h3 className="text-lg font-bold mb-2">Client Details</h3>
        <ul className="text-gray-700 space-y-1">
          <li>
            <span className="font-semibold">Name:</span> {client.name}
          </li>
          <li>
            <span className="font-semibold">Email:</span> {client.email}
          </li>
          <li>
            <span className="font-semibold">Phone:</span> {client.phone}
          </li>
          <li>
            <span className="font-semibold">WhatsApp:</span> {client.whatsapp}
          </li>
        </ul>
      </div>
    </div>
  );
}
