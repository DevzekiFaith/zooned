import { useState } from "react";

interface ClientFormProps {
  initialData?: {
    name?: string;
    email?: string;
    phone?: string;
    whatsapp?: string;
  };
  onSubmit: (data: { name: string; email: string; phone: string; whatsapp: string }) => void;
  loading?: boolean;
}

export default function ClientForm({ initialData = {}, onSubmit, loading }: ClientFormProps) {
  const [form, setForm] = useState({
    name: initialData.name || "",
    email: initialData.email || "",
    phone: initialData.phone || "",
    whatsapp: initialData.whatsapp || "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
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
      <h2 className="text-xl font-bold mb-2">{initialData.name ? "Edit Client" : "Add New Client"}</h2>
      <label className="flex flex-col gap-1">
        <span className="font-semibold">Name</span>
        <input
          type="text"
          name="name"
          value={form.name}
          onChange={handleChange}
          required
          className="border rounded px-3 py-2"
          placeholder="Client Name"
        />
      </label>
      <label className="flex flex-col gap-1">
        <span className="font-semibold">Email</span>
        <input
          type="email"
          name="email"
          value={form.email}
          onChange={handleChange}
          required
          className="border rounded px-3 py-2"
          placeholder="client@email.com"
        />
      </label>
      <label className="flex flex-col gap-1">
        <span className="font-semibold">Phone</span>
        <input
          type="tel"
          name="phone"
          value={form.phone}
          onChange={handleChange}
          required
          className="border rounded px-3 py-2"
          placeholder="Phone Number"
        />
      </label>
      <label className="flex flex-col gap-1">
        <span className="font-semibold">WhatsApp</span>
        <input
          type="tel"
          name="whatsapp"
          value={form.whatsapp}
          onChange={handleChange}
          required
          className="border rounded px-3 py-2"
          placeholder="WhatsApp Number"
        />
      </label>
        <button
          type="submit"
          disabled={loading}
          className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-4 py-2 rounded transition mt-2"
        >
          {loading ? "Saving..." : initialData.name ? "Update Client" : "Add Client"}
        </button>
            </form>
          );
      }