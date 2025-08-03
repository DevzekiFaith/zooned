"use client";

import { useState } from "react";
import {
  CheckCircleIcon,
  UserIcon,
  BuildingOffice2Icon,
  ChatBubbleLeftRightIcon,
} from "@heroicons/react/24/solid";

export default function ClientOnboardingPage() {
  const [step, setStep] = useState(1);
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    company: "",
    notes: "",
  });
  const [submitted, setSubmitted] = useState(false);

  const steps = [
    { label: "Personal", icon: <UserIcon className="w-6 h-6 text-purple-600" /> },
    {
      label: "Company",
      icon: <BuildingOffice2Icon className="w-6 h-6 text-purple-600" />,
    },
    {
      label: "Notes",
      icon: <ChatBubbleLeftRightIcon className="w-6 h-6 text-purple-600" />,
    },
  ];

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

  if (submitted) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 via-white to-purple-100">
        <div className="bg-white rounded-xl shadow-xl p-10 max-w-md w-full flex flex-col items-center transform transition duration-700 scale-95 hover:scale-100">
          <CheckCircleIcon className="w-16 h-16 text-green-500 mb-4 animate-bounce" />
          <h2 className="text-3xl font-bold mb-2 text-green-700">Success!</h2>
          <p className="text-gray-600 mb-4 text-center">
            Client <span className="font-semibold">{form.name}</span> onboarded
            successfully.
          </p>
          <button
            className="mt-2 px-6 py-2 bg-purple-600 text-white rounded hover:bg-purple-700 transition-transform transform hover:scale-105"
            onClick={() => {
              setForm({
                name: "",
                email: "",
                phone: "",
                company: "",
                notes: "",
              });
              setStep(1);
              setSubmitted(false);
            }}
          >
            Add Another
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 via-white to-purple-100 px-4">
      <form
        onSubmit={handleSubmit}
        className="bg-white rounded-xl shadow-xl p-8 w-full max-w-md flex flex-col gap-6 transform transition-all duration-500 hover:scale-[1.01] hover:-translate-y-1"
      >
        <h1 className="text-3xl font-bold text-center text-purple-700">
          Client Onboarding
        </h1>

        <div className="flex items-center justify-center gap-4">
          {steps.map((s, idx) => (
            <div
              key={s.label}
              className="flex flex-col items-center transition-transform transform hover:scale-110"
            >
              <div
                className={`rounded-full p-2 transition-transform duration-300 ${
                  step === idx + 1 ? "bg-purple-100 scale-110" : "bg-gray-100"
                }`}
              >
                {s.icon}
              </div>
              <span
                className={`text-xs mt-1 ${
                  step === idx + 1
                    ? "text-purple-700 font-semibold"
                    : "text-gray-400"
                }`}
              >
                {s.label}
              </span>
            </div>
          ))}
        </div>

        <div className="h-2 w-full bg-gray-200 rounded-full">
          <div
            className="h-2 bg-purple-500 rounded-full transition-all"
            style={{ width: `${(step / steps.length) * 100}%` }}
          />
        </div>

        {step === 1 && (
          <div className="animate-fade-in-up">
            <label className="block mb-2">
              <span className="block font-medium">Full Name</span>
              <input
                name="name"
                value={form.name}
                onChange={handleChange}
                required
                className="input"
                placeholder="Client Name"
              />
            </label>
            <label className="block mb-2">
              <span className="block font-medium">Email</span>
              <input
                name="email"
                type="email"
                value={form.email}
                onChange={handleChange}
                required
                className="input"
                placeholder="client@email.com"
              />
            </label>
            <label className="block mb-2">
              <span className="block font-medium">Phone</span>
              <input
                name="phone"
                type="tel"
                value={form.phone}
                onChange={handleChange}
                required
                className="input"
                placeholder="Phone Number"
              />
            </label>
          </div>
        )}

        {step === 2 && (
          <div className="animate-fade-in-up">
            <label className="block mb-2">
              <span className="block font-medium">Company</span>
              <input
                name="company"
                value={form.company}
                onChange={handleChange}
                className="input"
                placeholder="Company Name"
              />
            </label>
          </div>
        )}

        {step === 3 && (
          <div className="animate-fade-in-up">
            <label className="block mb-2">
              <span className="block font-medium">Notes</span>
              <textarea
                name="notes"
                value={form.notes}
                onChange={handleChange}
                className="input"
                placeholder="Extra notes..."
              />
            </label>
            <div className="bg-purple-50 rounded p-4 mt-4 text-sm text-purple-900 space-y-1">
              <div>
                <strong>Name:</strong> {form.name}
              </div>
              <div>
                <strong>Email:</strong> {form.email}
              </div>
              <div>
                <strong>Phone:</strong> {form.phone}
              </div>
              {form.company && (
                <div>
                  <strong>Company:</strong> {form.company}
                </div>
              )}
              {form.notes && (
                <div>
                  <strong>Notes:</strong> {form.notes}
                </div>
              )}
            </div>
          </div>
        )}

        <div className="flex justify-between mt-6">
          {step > 1 ? (
            <button
              type="button"
              onClick={() => setStep(step - 1)}
              className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300 transition"
            >
              Back
            </button>
          ) : (
            <div />
          )}

          {step < steps.length ? (
            <button
              type="button"
              onClick={() => setStep(step + 1)}
              className="px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700 transition"
              disabled={
                step === 1 && (!form.name || !form.email || !form.phone)
              }
            >
              Next
            </button>
          ) : (
            <button
              type="submit"
              className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition"
              disabled={!form.name || !form.email || !form.phone}
            >
              Finish
            </button>
          )}
        </div>
      </form>

      <style jsx global>{`
        @keyframes fade-in-up {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: none;
          }
        }
        .animate-fade-in-up {
          animation: fade-in-up 0.5s ease-out both;
        }
        .input {
          @apply w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-400;
        }
      `}</style>
    </div>
  );
}
