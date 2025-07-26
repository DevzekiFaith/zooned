"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { auth, db } from "@/firebase";
import { collection, addDoc, getDocs, serverTimestamp } from "firebase/firestore";
import { FaVideo, FaCalendarAlt, FaLink } from "react-icons/fa";

export default function VideoCallPage() {
  const params = useSearchParams();
  const clientId = params?.get("clientId") || "default"; // default value if no clientId is provided
  const user = auth.currentUser!;
  const [date, setDate] = useState("");
  const [note, setNote] = useState("");
  const [calls, setCalls] = useState<any[]>([]);
  const [meetingUrl, setMeetingUrl] = useState("");
  const [loading, setLoading] = useState(true);

  const generateMeetingUrl = () => {
    const room = `onboarding-${user.uid}-${clientId}-${Date.now()}`;
    return `https://meet.jit.si/${room}`;
  };

  const scheduleCall = async () => {
    if (!date) return;
    const url = generateMeetingUrl();
    const callData = {
      note,
      date: new Date(date),
      meetingUrl: url,
      createdAt: serverTimestamp(),
    };
    await addDoc(collection(db, "users", user.uid, "clients", clientId, "videoCalls"), callData);
    localStorage.setItem(`videoCalls-${clientId}`, JSON.stringify([callData, ...calls]));
    setNote("");
    setDate("");
    setMeetingUrl(url);
    fetchCalls();
  };

  const fetchCalls = async () => {
    setLoading(true);
    try {
      const snapshot = await getDocs(collection(db, "users", user.uid, "clients", clientId, "videoCalls"));
      const fetched = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setCalls(fetched);
      localStorage.setItem(`videoCalls-${clientId}`, JSON.stringify(fetched));
    } catch {
      const offline = localStorage.getItem(`videoCalls-${clientId}`);
      if (offline) setCalls(JSON.parse(offline));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCalls();
  }, []);

  return (
    <div className="max-w-md mx-auto mt-10 space-y-4">
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
        onChange={e => setDate(e.target.value)}
        placeholder="Select date and time"
        title="Video call date"
      />
      <textarea
        className="w-full border p-2"
        rows={3}
        placeholder="Briefing notes"
        value={note}
        onChange={e => setNote(e.target.value)}
      />
      <button
        className="bg-blue-600 text-white w-full p-2 flex items-center justify-center gap-2"
        onClick={scheduleCall}
      >
        <FaVideo /> Schedule Call
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
          <div className="mt-2 text-sm text-gray-600">Share this link with your client to join the call.</div>
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
          {calls.map(call => (
            <li key={call.id} className="border p-2 rounded">
              <p>
                <strong>Date:</strong>{" "}
                {call.date?.seconds
                  ? new Date(call.date.seconds * 1000).toLocaleString()
                  : ""}
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
