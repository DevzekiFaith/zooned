'use client'
import { createUserWithEmailAndPassword } from "firebase/auth";
import { auth } from "@/firebase";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function RegisterPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const register = async () => {
    try {
      await createUserWithEmailAndPassword(auth, email, password);
      router.push("/dashboard");
    } catch (err) {
      alert("Register failed");
    }
  };

  return (
    <div className="max-w-md mx-auto mt-20 space-y-4">
      <h2 className="text-xl font-bold">Register</h2>
      <input type="email" className="w-full border p-2" placeholder="Email" onChange={e => setEmail(e.target.value)} />
      <input type="password" className="w-full border p-2" placeholder="Password" onChange={e => setPassword(e.target.value)} />
      <button className="bg-green-500 text-white p-2 w-full" onClick={register}>Register</button>
    </div>
  );
}
// import { createUserWithEmailAndPassword } from "firebase/auth";