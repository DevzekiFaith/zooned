import { useState } from "react";

interface BookingFormProps {
  initialData?: {
    title?: string;
    date?: string;
    time?: string;
    notes?: string;
  };
  onSubmit: (data: { title: string; date: string; time: string; notes: string }) => void;
  loading?: boolean;
}

export default function BookingForm({ initialData = {}, onSubmit, loading }: BookingFormProps) {
  const [form, setForm] = useState({
    title: initialData.title || "",
    date: initialData.date || "",
    time: initialData.time || "",
    notes: initialData.notes || "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(form);
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-white rounded-xl shadow p-6 max-w-md mx-auto flex flex-col gap-4"
    >
      <h2 className="text-xl font-bold mb-2">{initialData.title ? "Edit Booking" : "New Booking"}</h2>
      <label className="flex flex-col gap-1">
        <span className="font-semibold">Title</span>
        <input
          type="text"
          name="title"
          value={form.title}
          onChange={handleChange}
          required
          className="border rounded px-3 py-2"
          placeholder="Meeting with client"
        />
      </label>
      <label className="flex flex-col gap-1">
        <span className="font-semibold">Date</span>
        <input
          type="date"
          name="date"
          value={form.date}
          onChange={handleChange}
          required
          className="border rounded px-3 py-2"
        />
      </label>
      <label className="flex flex-col gap-1">
        <span className="font-semibold">Time</span>
        <input
          type="time"
          name="time"
          value={form.time}
          onChange={handleChange}
          required
          className="border rounded px-3 py-2"
        />
      </label>
      <label className="flex flex-col gap-1">
        <span className="font-semibold">Notes</span>
        <textarea
          name="notes"
          value={form.notes}
          onChange={handleChange}
          className="border rounded px-3 py-2"
          placeholder="Additional notes (optional)"
        />
      </label>
      <button
        type="submit"
        disabled={loading}
        className="bg-purple-600 hover:bg-purple-700 text-white font-semibold px-4 py-2 rounded transition mt-2"
      >
        {loading ? "Saving..." : initialData.title ? "Update Booking" : "Create Booking"}
      </button>
        </form>
      );
    }