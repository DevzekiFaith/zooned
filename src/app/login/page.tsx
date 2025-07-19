'use client'
import { signInWithEmailAndPassword } from "firebase/auth";
import { useRouter } from "next/navigation";
import { auth } from "@/firebase";
import { useState } from "react";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const login = async () => {
    try {
      await signInWithEmailAndPassword(auth, email, password);
      router.push("/dashboard");
    } catch (err) {
      alert("Login failed");
    }
  };

  return (
    <div className="max-w-md mx-auto mt-20 space-y-4">
      <h2 className="text-xl font-bold">Login</h2>
      <input type="email" className="w-full border p-2" placeholder="Email" onChange={e => setEmail(e.target.value)} />
      <input type="password" className="w-full border p-2" placeholder="Password" onChange={e => setPassword(e.target.value)} />
      <button className="bg-blue-500 text-white p-2 w-full" onClick={login}>Login</button>
    </div>
  );
}
// import { signInWithEmailAndPassword } from "firebase/auth";