"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  createUserWithEmailAndPassword,
  updateProfile,
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
} from "firebase/auth";
import { auth, db, storage } from "@/firebase";
import { doc, setDoc, getDoc } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { FaTimes, FaEye, FaEyeSlash } from "react-icons/fa";
import { toast } from "react-hot-toast";

export default function AuthPage() {
  const router = useRouter();
  const [mode, setMode] = useState<"signup" | "login">("signup");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [name, setName] = useState("");
  const [role, setRole] = useState<"client" | "freelancer">("client");
  const [avatar, setAvatar] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const isValidEmail = (email: string): boolean => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  const isStrongPassword = (password: string): boolean => password.length >= 8 && /\d/.test(password) && /[A-Z]/.test(password);

  const handleSignup = async () => {
    if (!email || !password || !confirmPassword || !name)
      return toast.error("Please fill all fields");
    if (!isValidEmail(email)) return toast.error("Invalid email format");
    if (!isStrongPassword(password)) return toast.error("Weak password");
    if (password !== confirmPassword) return toast.error("Passwords do not match");

    setLoading(true);
    try {
      const userCred = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCred.user;

      let photoURL = "";
      if (avatar) {
        const storageRef = ref(storage, `avatars/${user.uid}`);
        await uploadBytes(storageRef, avatar);
        photoURL = await getDownloadURL(storageRef);
      }

      await updateProfile(user, { displayName: name, photoURL });
      await setDoc(doc(db, "users", user.uid), {
        email: user.email,
        name,
        role,
        image: photoURL,
      });

      toast.success("Signup successful! Redirecting...");
      setTimeout(() => router.push(role === "freelancer" ? "/dashboard/freelancers" : "/dashboard/clients"), 1000);
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || "Signup failed");
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = async () => {
    if (!email || !password) return toast.error("Enter email and password");
    setLoading(true);
    try {
      const res = await signInWithEmailAndPassword(auth, email, password);
      const snap = await getDoc(doc(db, "users", res.user.uid));
      const user = snap.data();
      router.push(user?.role === "freelancer" ? "/dashboard/freelancers" : "/dashboard/clients");
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async () => {
    if (!email) return toast.error("Enter your email");
    try {
      await sendPasswordResetEmail(auth, email);
      toast.success("Password reset sent");
    } catch (err: any) {
      console.error(err);
      toast.error("Reset failed");
    }
  };

  const handleGoogleSignIn = async () => {
    const provider = new GoogleAuthProvider();
    setLoading(true);
    try {
      const result = await signInWithPopup(auth, provider);
      const user = result.user;

      const docRef = doc(db, "users", user.uid);
      const snap = await getDoc(docRef);

      if (!snap.exists()) {
        await setDoc(docRef, {
          email: user.email,
          name: user.displayName,
          image: user.photoURL,
          role: "client",
        });
      }

      const role = snap.data()?.role || "client";
      router.push(role === "freelancer" ? "/dashboard/freelancers" : "/dashboard/clients");
    } catch (err: any) {
      console.error(err);
      toast.error("Google login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-100 to-blue-50 px-4">
      <div className="w-full max-w-md bg-white p-6 rounded-xl shadow-xl space-y-4 relative">
        <h2 className="text-2xl font-bold text-center text-blue-700">
          {mode === "signup" ? "Create Account" : "Sign In"}
        </h2>

        {mode === "signup" && (
          <input type="text" className="w-full border p-2 rounded" placeholder="Name" value={name} onChange={(e) => setName(e.target.value)} />
        )}

        <input type="email" className="w-full border p-2 rounded" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} />

        <div className="relative">
          <input type={showPassword ? "text" : "password"} className="w-full border p-2 rounded" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} />
          <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-2 top-2 text-gray-600" title="Toggle Password">
            {showPassword ? <FaEyeSlash /> : <FaEye />}
          </button>
        </div>

        {mode === "signup" && (
          <>
            <div className="relative">
              <input type={showConfirmPassword ? "text" : "password"} className="w-full border p-2 rounded" placeholder="Confirm Password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} />
              <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} className="absolute right-2 top-2 text-gray-600" title="Toggle Password">
                {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
              </button>
            </div>

            <select title="Select Role" value={role} onChange={(e) => setRole(e.target.value as "client" | "freelancer")} className="w-full border p-2 rounded">
              <option value="client">Client</option>
              <option value="freelancer">Freelancer</option>
            </select>

            <input placeholder="Avatar" type="file" accept="image/*" onChange={(e) => setAvatar(e.target.files?.[0] || null)} className="w-full border p-2 rounded" />
          </>
        )}

        <button onClick={mode === "signup" ? handleSignup : handleLogin} disabled={loading} className={`w-full py-2 rounded text-white font-semibold transition-all duration-200 ${loading ? "bg-blue-300 cursor-not-allowed" : "bg-blue-600 hover:bg-blue-700"}`}>
          {loading ? (mode === "signup" ? "Creating..." : "Logging in...") : mode === "signup" ? "Sign Up" : "Sign In"}
        </button>

        <button onClick={handleGoogleSignIn} className="w-full py-2 rounded bg-white text-gray-700 border border-gray-300 hover:bg-gray-100 flex justify-center gap-2 items-center">
          <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="Google" className="w-5 h-5" />
          Continue with Google
        </button>

        {mode === "login" && (
          <p className="text-sm text-center">
            <button onClick={handleResetPassword} className="text-blue-600 underline">
              Forgot Password?
            </button>
          </p>
        )}

        <p className="text-sm text-gray-600 text-center">
          {mode === "signup" ? (
            <>
              Already have an account? <button onClick={() => setMode("login")} className="text-blue-600 underline">Sign in</button>
            </>
          ) : (
            <>
              New user? <button onClick={() => setMode("signup")} className="text-blue-600 underline">Create Account</button>
            </>
          )}
        </p>
      </div>
    </div>
  );
}
