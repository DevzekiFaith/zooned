"use client";

import { useState, useCallback, useRef } from "react";
import Image from "next/image";
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
    link: "/dashboard/clients/meeting-calendar", // <-- Add link here
  },
  {
    title: "Documents",
    icon: <FaFolderOpen />,
    desc: "Securely share and store important files.",
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
  const [showInvoiceModal, setShowInvoiceModal] = useState(false);
  const [clientId, setClientId] = useState("");
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);

  const handleInvoiceClick = useCallback(() => {
    setShowInvoiceModal(true);
    setTimeout(() => inputRef.current?.focus(), 100);
  }, []);

  const handleInvoiceSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      if (clientId.trim()) {
        setShowInvoiceModal(false);
        router.push(`/dashboard/clients/${clientId.trim()}/invoice`);
      }
    },
    [clientId, router]
  );

  // Modern video call scheduling modal
  const [showVideoModal, setShowVideoModal] = useState(false);
  const [videoDate, setVideoDate] = useState("");
  const [videoNote, setVideoNote] = useState("");
  const [meetingUrl, setMeetingUrl] = useState("");

  const handleVideoClick = useCallback(() => {
    setShowVideoModal(true);
    setMeetingUrl("");
    setVideoDate("");
    setVideoNote("");
  }, []);

  const handleVideoSchedule = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      // Generate a Jitsi Meet link for demo (can be replaced with other providers)
      const room = `onboarding-${Date.now()}`;
      const url = `https://meet.jit.si/${room}`;
      setMeetingUrl(url);
    },
    []
  );

  const handleJoinMeeting = () => {
    if (meetingUrl) window.open(meetingUrl, "_blank");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-100 flex flex-col">
      <header className="w-full py-8 flex flex-col items-center bg-transparent">
        <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight mb-2 text-gray-900 animate-slide-down">
          Onboarding
        </h1>
        <p className="text-lg font-medium max-w-xl text-center text-gray-600 animate-fade-in">
          All your freelance client management in one place.
          <br />
          Onboard, collaborate, and grow your business with ease.
        </p>
      </header>
      <main className="flex-1 flex flex-col items-center justify-center px-4 py-12">
        <h2 className="text-2xl font-bold mb-8 text-gray-800 animate-fade-in">
          Amazing Features
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8 w-full max-w-5xl">
          {features.map((feature, i) => {
            const CardContent = (
              <div
                className={`bg-white rounded-xl shadow-md hover:shadow-xl transition-all duration-300 p-6 flex flex-col items-center text-center border border-gray-100 scale-95 hover:scale-105 cursor-pointer group animate-fade-up ${
                  feature.isVideo ? "border-blue-400" : ""
                }`}
                style={{ animationDelay: `${i * 80}ms` } as React.CSSProperties}
              >
                <span className="text-5xl mb-3 transition-transform duration-300 group-hover:scale-125 text-blue-600">
                  {feature.icon}
                </span>
                <h3 className="font-semibold text-lg mb-2 text-blue-700">
                  {feature.title}
                </h3>
                <p className="text-gray-500 text-sm">{feature.desc}</p>
                {feature.isVideo && (
                  <button
                    className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition font-semibold flex items-center gap-2"
                    onClick={handleVideoClick}
                  >
                    <FaVideo /> Schedule/Join Call
                  </button>
                )}
              </div>
            );

            // Invoice card: link to invoice page (replace modal with direct link)
            if (feature.isInvoice) {
              return (
                <Link
                  href="/dashboard/clients/invoice"
                  key={feature.title}
                  tabIndex={0}
                  aria-label={feature.title}
                >
                  {CardContent}
                </Link>
              );
            }

            if (feature.link && !feature.isVideo) {
              return (
                <Link
                  href={feature.link}
                  key={feature.title}
                  tabIndex={0}
                  aria-label={feature.title}
                >
                  {CardContent}
                </Link>
              );
            }

            if (feature.isVideo) {
              return <div key={feature.title}>{CardContent}</div>;
            }

            return (
              <button
                key={feature.title}
                type="button"
                aria-label={feature.title}
                tabIndex={0}
                className="bg-white rounded-xl shadow-md hover:shadow-xl transition-all duration-300 p-6 flex flex-col items-center text-center border border-gray-100 scale-95 hover:scale-105 cursor-pointer group animate-fade-up focus:outline-none focus:ring-2 focus:ring-blue-400"
                style={{ animationDelay: `${i * 80}ms` } as React.CSSProperties}
              >
                <span className="text-5xl mb-3 transition-transform duration-300 group-hover:scale-125">
                  {feature.icon}
                </span>
                <h3 className="font-semibold text-lg mb-2 text-blue-700">
                  {feature.title}
                </h3>
                <p className="text-gray-500 text-sm">{feature.desc}</p>
              </button>
            );
          })}
        </div>
      </main>
      {/* Invoice Modal */}
      {showInvoiceModal && (
        <div
          className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50"
          aria-modal="true"
          role="dialog"
        >
          <form
            className="bg-white rounded-xl shadow-lg p-8 flex flex-col gap-4 w-full max-w-xs"
            onSubmit={handleInvoiceSubmit}
            onClick={(e) => e.stopPropagation()}
          >
            <label htmlFor="clientId" className="font-semibold text-gray-700">
              Enter Client ID
            </label>
            <input
              id="clientId"
              ref={inputRef}
              type="text"
              value={clientId}
              onChange={(e) => setClientId(e.target.value)}
              className="border rounded px-3 py-2"
              required
              autoFocus
              aria-label="Client ID"
            />
            <div className="flex gap-2">
              <button
                type="submit"
                className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-4 py-2 rounded transition flex-1"
              >
                Go to Invoices
              </button>
              <button
                type="button"
                className="bg-gray-200 hover:bg-gray-300 text-gray-700 font-semibold px-4 py-2 rounded transition flex-1"
                onClick={() => setShowInvoiceModal(false)}
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}
      {/* Video Call Modal */}
      {showVideoModal && (
        <div
          className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50"
          aria-modal="true"
          role="dialog"
        >
          <form
            className="bg-white rounded-xl shadow-lg p-8 flex flex-col gap-4 w-full max-w-xs"
            onSubmit={handleVideoSchedule}
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="text-xl font-bold text-blue-700 flex items-center gap-2 mb-2">
              <FaVideo /> Schedule Video Call
            </h2>
            <label htmlFor="video-date" className="font-semibold text-gray-700">
              Date & Time
            </label>
            <input
              id="video-date"
              type="datetime-local"
              value={videoDate}
              onChange={(e) => setVideoDate(e.target.value)}
              className="border rounded px-3 py-2"
              required
            />
            <label htmlFor="video-note" className="font-semibold text-gray-700">
              Briefing Notes
            </label>
            <textarea
              id="video-note"
              value={videoNote}
              onChange={(e) => setVideoNote(e.target.value)}
              className="border rounded px-3 py-2"
              rows={2}
              placeholder="Add notes for the meeting"
            />
            <div className="flex gap-2">
              <button
                type="submit"
                className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-4 py-2 rounded transition flex-1"
              >
                Schedule & Get Link
              </button>
              <button
                type="button"
                className="bg-gray-200 hover:bg-gray-300 text-gray-700 font-semibold px-4 py-2 rounded transition flex-1"
                onClick={() => setShowVideoModal(false)}
              >
                Cancel
              </button>
            </div>
            {meetingUrl && (
              <div className="mt-4 p-3 bg-blue-50 rounded text-center">
                <div className="font-semibold text-blue-700 mb-2">Meeting Link:</div>
                <a
                  href={meetingUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 underline break-all"
                >
                  {meetingUrl}
                </a>
                <button
                  type="button"
                  className="mt-3 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded transition font-semibold w-full"
                  onClick={handleJoinMeeting}
                >
                  Join Call Now
                </button>
              </div>
            )}
          </form>
        </div>
      )}
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
          animation: fade-in 0.8s cubic-bezier(0.4, 0, 0.2, 1) both;
        }
        .animate-fade-up {
          animation: fade-up 0.8s cubic-bezier(0.4, 0, 0.2, 1) both;
        }
        .animate-slide-down {
          animation: slide-down 0.8s cubic-bezier(0.4, 0, 0.2, 1) both;
        }
      `}</style>
      <AIAssistant />
    </div>
  );
}
