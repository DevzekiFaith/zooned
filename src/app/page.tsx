"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
// import Link from "next/link";
// import AIAssistant from "@/components/AIAssistant/AIAssistant";
// import BookingForm from "@/components/BookingForm/BookingForm";
import {
  FaUserEdit,
  FaFileInvoiceDollar,
  FaVideo,
  FaCalendarAlt,
  FaFolderOpen,
  FaChartBar,
  FaUsers,
  FaComments,
  // FaExchangeAlt,
  // FaUserCircle,
  // FaEdit,
  // FaUpload,
  // FaSignOutAlt,
  // FaTrash,
} from "react-icons/fa";
import { motion } from "framer-motion";
import { doc, getDoc, setDoc, deleteDoc } from "firebase/firestore";
import { db, auth, storage } from "@/firebase";
import { toast } from "react-hot-toast";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";

const clientFeatures = [
  {
    title: "Client Onboarding",
    icon: <FaUserEdit />,
    desc: "Seamlessly onboard new clients with guided steps.",
    link: "/dashboard/clients/onboarding",
  },
  {
    title: "Invoices",
    icon: <FaFileInvoiceDollar />,
    desc: "Generate and manage invoices with ease.",
    link: "/dashboard/clients/invoice",
  },
  {
    title: "Video Calls",
    icon: <FaVideo />,
    desc: "Schedule and join video meetings directly.",
    link: "/dashboard/clients/video-call",
  },
  {
    title: "Meeting Calendar",
    icon: <FaCalendarAlt />,
    desc: "Keep track of all your appointments in one place.",
    link: "/dashboard/clients/meeting-calendar",
  },
];

const freelancerFeatures = [
  {
    title: "Documents",
    icon: <FaFolderOpen />,
    desc: "Securely share and store important files.",
    link: "/dashboard/clients/document",
  },
  {
    title: "Work Stages",
    icon: <FaChartBar />,
    desc: "Visualize and manage project progress.",
    link: "/dashboard/clients/work-stage",
  },
  {
    title: "Client Registry",
    icon: <FaUsers />,
    desc: "Maintain a searchable database of your clients.",
  },
  {
    title: "Chat",
    icon: <FaComments />,
    desc: "Communicate instantly with clients and team.",
  },
];

export default function Home() {
  const [showOverlay, setShowOverlay] = useState(true);
  const [loading, setLoading] = useState(true);
  const [userRole, setUserRole] = useState<"client" | "freelancer">("client");
  const [userProfile, setUserProfile] = useState({
    name: "Guest",
    email: "",
    image: "",
  });
  const [editMode, setEditMode] = useState(false);
  const [tempProfile, setTempProfile] = useState(userProfile);
  const router = useRouter();

  useEffect(() => {
    const checkUser = async () => {
      const currentUser = auth.currentUser;
      if (!currentUser) {
        setTimeout(() => router.push("/signup"), 1500);
        return;
      }

      try {
        const ref = doc(db, "users", currentUser.uid);
        const snap = await getDoc(ref);
        const data = snap.exists() ? snap.data() : {};

        setUserRole(data.role || "client");
        setUserProfile({
          name: data.name || currentUser.displayName || "Client",
          email: currentUser.email || "",
          image: data.image || currentUser.photoURL || "",
        });
        setTempProfile({
          name: data.name || currentUser.displayName || "Client",
          email: currentUser.email || "",
          image: data.image || currentUser.photoURL || "",
        });
      } catch (e) {
        console.error("Profile load failed:", e);
      } finally {
        setShowOverlay(false);
        setLoading(false);
      }
    };

    checkUser();
  }, [router]);

  const featuresToShow =
    userRole === "client" ? clientFeatures : freelancerFeatures;

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-blue-50 via-white to-purple-100 text-blue-700">
        <div className="flex flex-col items-center gap-4 animate-fade-in">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
            className="h-12 w-12 border-4 border-blue-600 border-t-transparent rounded-full"
          />
          <motion.h1
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-xl font-semibold"
          >
            Loading Onboarding
          </motion.h1>
        </div>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-100 flex">
      {/* Remainder of component remains unchanged */}
    </div>
  );
}
