'use client'
import { useState } from "react";
import { auth, db } from "@/firebase";
import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import { useRouter } from "next/navigation";

export default function NewClientPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [whatsapp, setWhatsapp] = useState("");
  const router = useRouter();
  const user = auth.currentUser;

  const addClient = async () => {
    await addDoc(collection(db, "users", user!.uid, "clients"), {
      name, email, phone, whatsapp,
      createdAt: serverTimestamp(),
    });
    router.push("/dashboard");
  };

  return (
    <div className="max-w-md mx-auto mt-10 space-y-4">
      <h2 className="text-xl font-bold">New Client</h2>
      <input className="w-full border p-2" placeholder="Name" onChange={e => setName(e.target.value)} />
      <input className="w-full border p-2" placeholder="Email" onChange={e => setEmail(e.target.value)} />
      <input className="w-full border p-2" placeholder="Phone" onChange={e => setPhone(e.target.value)} />
      <input className="w-full border p-2" placeholder="WhatsApp Number" onChange={e => setWhatsapp(e.target.value)} />
      <button className="bg-green-500 text-white w-full p-2" onClick={addClient}>Add Client</button>
    </div>
  );
}
