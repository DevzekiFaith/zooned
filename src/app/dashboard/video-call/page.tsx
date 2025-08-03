"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useSearchParams } from "next/navigation";
import { auth, db } from "@/firebase";
import {
  collection,
  addDoc,
  getDocs,
  serverTimestamp,
} from "firebase/firestore";
import {
  FaVideo,
  FaCalendarAlt,
  FaLink,
  FaCheckCircle,
  FaSpinner,
  FaExclamationCircle,
} from "react-icons/fa";

export default function VideoCallPage() {
  const params = useSearchParams();
  const clientId = params?.get("clientId") || "default";
  const [user, setUser] = useState(() => auth.currentUser);
  const [date, setDate] = useState("");
  const [note, setNote] = useState("");
  const [calls, setCalls] = useState<Array<{
    id: string;
    note: string;
    date: Date;
    meetingUrl: string;
    createdAt: unknown;
  }>>([]);
  const [meetingUrl, setMeetingUrl] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const [errorToast, setErrorToast] = useState<string | null>(null);
  const jitsiContainerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((firebaseUser) => {
      if (firebaseUser) {
        setUser(firebaseUser);
      }
    });
    return () => unsubscribe();
  }, []);

  const generateMeetingUrl = () => {
    const room = `onboarding-${user?.uid || "guest"}-${clientId}-${Date.now()}`;
    return `https://meet.jit.si/${room}`;
  };

  const generateGoogleCalendarUrl = (url: string) => {
    const start = new Date(date).toISOString().replace(/-|:|\.\d+/g, "");
    const end = new Date(new Date(date).getTime() + 30 * 60 * 1000)
      .toISOString()
      .replace(/-|:|\.\d+/g, "");
    const text = encodeURIComponent("Video Call Meeting");
    const details = encodeURIComponent(note);
    const location = encodeURIComponent(url);
    return `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${text}&dates=${start}/${end}&details=${details}&location=${location}`;
  };

  const generateICSFile = (url: string): string => {
    const dtStart = new Date(date).toISOString().replace(/[-:]|\.\d{3}/g, "");
    const dtEnd = new Date(new Date(date).getTime() + 30 * 60 * 1000)
      .toISOString()
      .replace(/[-:]|\.\d{3}/g, "");

    const ics = [
      "BEGIN:VCALENDAR",
      "VERSION:2.0",
      "BEGIN:VEVENT",
      `DTSTART:${dtStart}`,
      `DTEND:${dtEnd}`,
      `SUMMARY:Video Call Meeting`,
      `DESCRIPTION:${note}`,
      `LOCATION:${url}`,
      "END:VEVENT",
      "END:VCALENDAR",
    ].join("\r\n");

    const blob = new Blob([ics], { type: "text/calendar" });
    return URL.createObjectURL(blob);
  };

  const sendNotification = async (url: string) => {
    try {
      const res = await fetch("/api/send-schedule-notification", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url, note, date, clientId }),
      });
      if (res.ok) {
        setToast("Notification email sent successfully!");
        setTimeout(() => setToast(null), 3000);
      }
    } catch (err) {
      console.error("Notification failed", err);
    }
  };

  const scheduleCall = async () => {
    if (!date || !user) return;
    setSubmitting(true);
    try {
      const url = generateMeetingUrl();
      const callData = {
        note,
        date: new Date(date),
        meetingUrl: url,
        createdAt: serverTimestamp(),
      };
      await addDoc(
        collection(db, "users", user.uid, "clients", clientId, "videoCalls"),
        callData
      );
      localStorage.setItem(
        `videoCalls-${clientId}`,
        JSON.stringify([callData, ...calls])
      );
      setNote("");
      setDate("");
      setMeetingUrl(url);
      fetchCalls();
      launchJitsiMeeting(url);
      await sendNotification(url);
    } catch {
      setErrorToast("Failed to schedule call. Please try again.");
      setTimeout(() => setErrorToast(null), 4000);
    } finally {
      setSubmitting(false);
    }
  };

  const fetchCalls = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    try {
      const snapshot = await getDocs(
        collection(db, "users", user.uid, "clients", clientId, "videoCalls")
      );
      const fetched = snapshot.docs.map((doc) => {
        const data = doc.data();
        return {
          id: doc.id,
          note: data.note || '',
          date: data.date || new Date(),
          meetingUrl: data.meetingUrl || '',
          createdAt: data.createdAt || null,
        };
      });
      setCalls(fetched);
      localStorage.setItem(`videoCalls-${clientId}`, JSON.stringify(fetched));
    } catch {
      const offline = localStorage.getItem(`videoCalls-${clientId}`);
      if (offline) setCalls(JSON.parse(offline));
    } finally {
      setLoading(false);
    }
  }, [user, clientId]);

  const launchJitsiMeeting = (roomUrl: string) => {
    if (!jitsiContainerRef.current) return;

    const domain = "meet.jit.si";
    const options = {
      roomName: roomUrl.split("/").pop(),
      parentNode: jitsiContainerRef.current,
      width: "100%",
      height: 500,
    };
    const script = document.createElement("script");
    script.src = "https://meet.jit.si/external_api.js";
    script.onload = () => {
      // @ts-expect-error - JitsiMeetExternalAPI is loaded dynamically
      new window.JitsiMeetExternalAPI(domain, options);
    };
    document.body.appendChild(script);
  };

  useEffect(() => {
    if (user) fetchCalls();
  }, [user, fetchCalls]);

  return (
    <div className="max-w-2xl mx-auto mt-10 space-y-4">
      {toast && (
        <div className="bg-green-100 text-green-700 px-4 py-2 rounded flex items-center gap-2">
          <FaCheckCircle className="text-green-600" /> {toast}
        </div>
      )}
      {errorToast && (
        <div className="bg-red-100 text-red-700 px-4 py-2 rounded flex items-center gap-2">
          <FaExclamationCircle className="text-red-600" /> {errorToast}
        </div>
      )}

      <div className="flex items-center gap-2 mb-2">
        <FaVideo className="text-blue-600 text-2xl" />
        <h2 className="text-xl font-bold">Schedule & Join Video Call</h2>
      </div>
      <label htmlFor="call-date" className="block font-medium mb-1">
        <FaCalendarAlt className="inline mr-1" /> Date & Time
      </label>
      <input
        id="call-date"
        type="datetime-local"
        className="w-full border p-2"
        value={date}
        onChange={(e) => setDate(e.target.value)}
        placeholder="Select date and time"
        title="Video call date"
      />
      <textarea
        className="w-full border p-2"
        rows={3}
        placeholder="Briefing notes"
        value={note}
        onChange={(e) => setNote(e.target.value)}
      />
      <button
        className="bg-blue-600 text-white w-full p-2 flex items-center justify-center gap-2 disabled:opacity-50"
        onClick={scheduleCall}
        disabled={!user || !date || submitting}
      >
        {submitting ? (
          <>
            <FaSpinner className="animate-spin" /> Scheduling...
          </>
        ) : (
          <>
            <FaVideo /> Schedule Call
          </>
        )}
      </button>

      {meetingUrl && (
        <div className="mt-4 p-4 bg-blue-50 rounded">
          <div className="flex items-center gap-2 mb-2">
            <FaLink className="text-blue-600" />
            <span className="font-semibold">Your Meeting Link:</span>
          </div>
          <a
            href={meetingUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-700 underline break-all"
          >
            {meetingUrl}
          </a>
          <div className="mt-2 text-sm text-gray-600">
            Share this link with your client to join the call.
          </div>
          <div className="mt-2">
            <a
              href={generateGoogleCalendarUrl(meetingUrl)}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-blue-600 underline mr-4"
            >
              ➕ Add to Google Calendar
            </a>
            <a
              href={generateICSFile(meetingUrl)}
              download="meeting.ics"
              className="text-sm text-blue-600 underline"
            >
              📅 Download .ics
            </a>
          </div>
          <div
            ref={jitsiContainerRef}
            className="mt-4 rounded overflow-hidden"
          />
        </div>
      )}

      <h3 className="text-lg font-semibold mt-6">Scheduled Calls</h3>
      {loading ? (
        <ul className="space-y-2 animate-pulse">
          {[...Array(2)].map((_, i) => (
            <li key={i} className="h-20 bg-gray-200 rounded" />
          ))}
        </ul>
      ) : (
        <ul className="space-y-2">
          {calls.map((call) => (
            <li key={call.id} className="border p-2 rounded">
              <p>
                <strong>Date:</strong>{" "}
                {call.date ? (
                  // Handle both Firestore Timestamp and regular Date objects
                  typeof call.date === 'object' && call.date !== null && 'seconds' in call.date
                    ? new Date((call.date as any).seconds * 1000).toLocaleString()
                    : call.date instanceof Date
                    ? call.date.toLocaleString()
                    : new Date(call.date).toLocaleString()
                ) : "No date"}
              </p>
              <p>
                <strong>Note:</strong> {call.note}
              </p>
              <p>
                <strong>Meeting Link:</strong>{" "}
                <a
                  href={call.meetingUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-700 underline break-all"
                >
                  {call.meetingUrl}
                </a>
              </p>
              <button
                className="mt-2 bg-green-600 text-white px-4 py-1 rounded"
                onClick={() => window.open(call.meetingUrl, "_blank")}
              >
                Join Call
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
