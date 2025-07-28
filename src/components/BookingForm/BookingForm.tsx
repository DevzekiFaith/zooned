"use client";

import { useEffect, useState } from "react";
const [bookings, setBookings] = useState<Booking[]>([]); // Replace `any[]` with `Booking[]`

interface BookingData {
  name: string;
  email: string;
  date: string;
  message: string;
}

type Booking = {
  id: string;
  clientName: string;
  date: string;
  [key: string]: any;
};

// Replace `useState<any[]>` with:
// const clientFeatures = [
//   {
//     title: "Booking",
//     icon: <FaCalendarAlt />,
//     desc: "Schedule appointments with freelancers.",
//   },
//   {
//     title: "Chat",
//     icon: <FaComments />,
//     desc: "Communicate instantly with freelancers.",
//   },
// ];

export default function BookingForm({
  onSubmit,
}: {
  onSubmit?: (data: BookingData) => void;
}) {
  const [form, setForm] = useState<BookingData>({
    name: "",
    email: "",
    date: "",
    message: "",
  });
  const [toast, setToast] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [debouncedEmail, setDebouncedEmail] = useState(form.email);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };
  

  useEffect(() => {
    const timeout = setTimeout(() => {
      setDebouncedEmail(form.email);
    }, 500);
    return () => clearTimeout(timeout);
  }, [form.email]);

  const validateEmail = (email: string) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.date) {
      setError("Please fill all required fields.");
      return;
    }
    if (!validateEmail(debouncedEmail)) {
      setError("Please enter a valid email address.");
      return;
    }
    setError(null);
    setLoading(true);
    setTimeout(() => {
      if (onSubmit) onSubmit(form);
      setToast("Booking submitted successfully!");
      setTimeout(() => setToast(null), 3000);
      setForm({ name: "", email: "", date: "", message: "" });
      setLoading(false);
    }, 1000);
  };

  return (
    <div className="bg-white shadow-md rounded-lg p-6">
      {toast && (
        <div className="mb-4 bg-green-100 border border-green-200 text-green-800 px-4 py-2 rounded">
          {toast}
        </div>
      )}
      {error && (
        <div className="mb-4 bg-red-100 border border-red-200 text-red-800 px-4 py-2 rounded">
          {error}
        </div>
      )}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <label className="block font-medium mb-1">Full Name</label>
            <input
              name="name"
              value={form.name}
              onChange={handleChange}
              required
              className="w-full border rounded px-3 py-2"
              placeholder="John Doe"
            />
          </div>
          <div className="flex-1">
            <label className="block font-medium mb-1">Email</label>
            <input
              type="email"
              name="email"
              value={form.email}
              onChange={handleChange}
              required
              className="w-full border rounded px-3 py-2"
              placeholder="you@email.com"
            />
          </div>
        </div>
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <label className="block font-medium mb-1">Date</label>
            <input
            placeholder="Select date"
              type="date"
              name="date"
              value={form.date}
              onChange={handleChange}
              required
              className="w-full border rounded px-3 py-2"
            />
          </div>
          <div className="flex-1">
            <label className="block font-medium mb-1">Message</label>
            <textarea
              name="message"
              value={form.message}
              onChange={handleChange}
              rows={3}
              className="w-full border rounded px-3 py-2"
              placeholder="Let us know your needs"
            />
          </div>
        </div>
        <button
          type="submit"
          disabled={loading}
          className={`w-full px-4 py-2 rounded text-white ${
            loading
              ? "bg-blue-300 cursor-not-allowed"
              : "bg-blue-600 hover:bg-blue-700"
          }`}
        >
          {loading ? "Booking..." : "Book Now"}
        </button>
      </form>
    </div>
  );
}
