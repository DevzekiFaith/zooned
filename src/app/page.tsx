"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import AIAssistant from "@/components/AIAssistant/AIAssistant";
import {
  FaUserEdit,
  FaFileInvoiceDollar,
  FaVideo,
  FaCalendarAlt,
  FaFolderOpen,
  FaChartBar,
  FaUsers,
  FaComments,
} from "react-icons/fa";
import { getTempUser } from "@/utils/auth";

const features = [
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
    isInvoice: true,
    link: "/dashboard/clients/invoice",
  },
  {
    title: "Video Calls",
    icon: <FaVideo />,
    desc: "Schedule and join video meetings directly.",
    link: "/dashboard/clients/video-call",
    isVideo: true,
  },
  {
    title: "Meeting Calendar",
    icon: <FaCalendarAlt />,
    desc: "Keep track of all your appointments in one place.",
    link: "/dashboard/clients/meeting-calendar",
  },
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
  const router = useRouter();

  useEffect(() => {
    const user = getTempUser();
    if (!user) {
      const timer = setTimeout(() => router.push("/signup"), 1500);
      return () => clearTimeout(timer);
    } else {
      setShowOverlay(false);
    }
  }, [router]);

  const handleCardClick = (link: string | undefined) => {
    if (link) router.push(link);
  };

  return (
    <div className="relative min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-100 flex flex-col">
      {showOverlay && (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
          <div className="bg-white px-6 py-4 rounded-xl shadow-lg text-center animate-fade-in">
            <h2 className="text-xl font-semibold text-blue-700 mb-2">Welcome 👋</h2>
            <p className="text-sm text-gray-600">Redirecting you to sign up...</p>
          </div>
        </div>
      )}

      <header className="w-full py-8 flex flex-col items-center bg-transparent">
        <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight mb-2 text-gray-900 animate-slide-down">Onboarding</h1>
        <p className="text-lg font-medium max-w-xl text-center text-gray-600 animate-fade-in">
          All your freelance client management in one place.
          <br />
          Onboard, collaborate, and grow your business with ease.
        </p>
      </header>

      <main className="flex-1 flex flex-col items-center justify-center px-4 py-12">
        <h2 className="text-2xl font-bold mb-8 text-gray-800 animate-fade-in">Amazing Features</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8 w-full max-w-5xl">
          {features.map((feature, i) => (
            <div
              key={feature.title}
              role="button"
              tabIndex={0}
              onClick={() => handleCardClick(feature.link)}
              onKeyDown={(e) => e.key === "Enter" && handleCardClick(feature.link)}
              className="bg-white rounded-xl shadow-md hover:shadow-xl transition-all duration-300 p-6 flex flex-col items-center text-center border border-gray-100 scale-95 hover:scale-105 cursor-pointer group animate-fade-up"
              style={{ animationDelay: `${i * 80}ms` } as React.CSSProperties}
            >
              <span className="text-5xl mb-3 transition-transform duration-300 group-hover:scale-125 text-blue-600">
                {feature.icon}
              </span>
              <h3 className="font-semibold text-lg mb-2 text-blue-700">{feature.title}</h3>
              <p className="text-gray-500 text-sm">{feature.desc}</p>
            </div>
          ))}
        </div>
      </main>

      <footer className="w-full py-6 flex flex-col items-center bg-white border-t mt-8">
        <span className="text-xs text-gray-400 animate-fade-in">
          © {new Date().getFullYear()} Onboarding. All rights reserved.
        </span>
      </footer>

      <style jsx global>{`
        @keyframes fade-in {
          from {
            opacity: 0;
            transform: translateY(16px);
          }
          to {
            opacity: 1;
            transform: none;
          }
        }
        @keyframes fade-up {
          from {
            opacity: 0;
            transform: translateY(32px);
          }
          to {
            opacity: 1;
            transform: none;
          }
        }
        @keyframes slide-down {
          from {
            opacity: 0;
            transform: translateY(-32px);
          }
          to {
            opacity: 1;
            transform: none;
          }
        }
        .animate-fade-in {
          animation: fade-in 0.8s ease both;
        }
        .animate-fade-up {
          animation: fade-up 0.8s ease both;
        }
        .animate-slide-down {
          animation: slide-down 0.8s ease both;
        }
      `}</style>

      <AIAssistant />
    </div>
  );
}
