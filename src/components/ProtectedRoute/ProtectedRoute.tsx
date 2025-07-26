// components/ProtectedRoute.tsx
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { auth } from "@/firebase";

export default function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (!user) {
        router.replace("/signup");
      } else {
        setLoading(false);
      }
    });
    return () => unsubscribe();
  }, [router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white text-blue-600 font-semibold text-lg">
        <span className="animate-spin border-4 border-blue-400 border-t-transparent rounded-full w-6 h-6 mr-2" />
        Loading...
      </div>
    );
  }

  return <>{children}</>;
}
// This component protects routes by checking if the user is authenticated.
// If not authenticated, it redirects to the signup page.