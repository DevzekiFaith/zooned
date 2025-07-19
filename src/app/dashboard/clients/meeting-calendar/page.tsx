"use client";

import { useState } from "react";
import { FaCalendarAlt, FaPlus, FaClock, FaTrash } from "react-icons/fa";

export default function MeetingCalendarPage() {
  const [appointments, setAppointments] = useState([
    // Example data
    {
      id: 1,
      title: "Kickoff Meeting",
      date: "2025-07-22T10:00",
      note: "Initial project discussion with client.",
    },
    {
      id: 2,
      title: "Design Review",
      date: "2025-07-24T14:30",
      note: "Review design mockups.",
    },
  ]);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ title: "", date: "", note: "" });

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title || !form.date) return;
    setAppointments([
      ...appointments,
      {
        id: Date.now(),
        title: form.title,
        date: form.date,
        note: form.note,
      },
    ]);
    setForm({ title: "", date: "", note: "" });
    setShowModal(false);
  };

  const handleDelete = (id: number) => {
    setAppointments(appointments.filter((a) => a.id !== id));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-100 flex flex-col items-center px-4 py-12">
      <div className="max-w-2xl w-full mx-auto">
        <div className="flex items-center gap-3 mb-8">
          <FaCalendarAlt className="text-blue-600 text-3xl" />
          <h1 className="text-3xl font-bold text-blue-700">Meeting Calendar</h1>
        </div>
        <p className="mb-6 text-gray-600 text-center">
          Keep track of all your appointments and meetings in one place. Schedule, view, and manage your upcoming events easily.
        </p>
        <div className="flex justify-end mb-4">
          <button
            className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded shadow hover:bg-blue-700 transition"
            onClick={() => setShowModal(true)}
          >
            <FaPlus /> Add Appointment
          </button>
        </div>
        <div className="bg-white rounded-xl shadow p-6">
          {appointments.length === 0 ? (
            <div className="text-center text-gray-400 py-8">
              <FaClock className="mx-auto text-4xl mb-2" />
              <div>No appointments scheduled yet.</div>
            </div>
          ) : (
            <ul className="divide-y">
              {appointments
                .sort((a, b) => a.date.localeCompare(b.date))
                .map((a) => (
                  <li key={a.id} className="py-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                    <div>
                      <div className="font-semibold text-blue-700 text-lg">{a.title}</div>
                      <div className="text-gray-500 text-sm">
                        {new Date(a.date).toLocaleString(undefined, {
                          dateStyle: "medium",
                          timeStyle: "short",
                        })}
                      </div>
                      {a.note && <div className="text-gray-600 mt-1">{a.note}</div>}
                    </div>
                    <button
                      className="mt-2 sm:mt-0 bg-red-100 hover:bg-red-200 text-red-700 px-3 py-1 rounded transition flex items-center gap-1"
                      onClick={() => handleDelete(a.id)}
                      title="Delete appointment"
                    >
                      <FaTrash /> Delete
                    </button>
                  </li>
                ))}
            </ul>
          )}
        </div>
      </div>
      {/* Modal for adding appointment */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
          <form
            className="bg-white rounded-xl shadow-lg p-8 flex flex-col gap-4 w-full max-w-xs"
            onSubmit={handleAdd}
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="text-xl font-bold text-blue-700 mb-2 flex items-center gap-2">
              <FaPlus /> Add Appointment
            </h2>
            <label className="font-semibold text-gray-700">
              Title
              <input
                type="text"
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                className="border rounded px-3 py-2 mt-1 w-full"
                required
                placeholder="Meeting Title"
              />
            </label>
            <label className="font-semibold text-gray-700">
              Date & Time
              <input
                type="datetime-local"
                value={form.date}
                onChange={(e) => setForm({ ...form, date: e.target.value })}
                className="border rounded px-3 py-2 mt-1 w-full"
                required
              />
            </label>
            <label className="font-semibold text-gray-700">
              Notes (optional)
              <textarea
                value={form.note}
                onChange={(e) => setForm({ ...form, note: e.target.value })}
                className="border rounded px-3 py-2 mt-1 w-full"
                rows={2}
                placeholder="Add notes for the meeting"
              />
            </label>
            <div className="flex gap-2 mt-2">
              <button
                type="submit"
                className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-4 py-2 rounded transition flex-1"
              >
                Save
              </button>
              <button
                type="button"
                className="bg-gray-200 hover:bg-gray-300 text-gray-700 font-semibold px-4 py-2 rounded transition flex-1"
                onClick={() => setShowModal(false)}
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}