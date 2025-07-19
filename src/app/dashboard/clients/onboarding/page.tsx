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
    { label: "Personal", icon: <UserIcon className="w-6 h-6 text-blue-600" /> },
    {
      label: "Company",
      icon: <BuildingOffice2Icon className="w-6 h-6 text-blue-600" />,
    },
    {
      label: "Notes",
      icon: <ChatBubbleLeftRightIcon className="w-6 h-6 text-blue-600" />,
    },
  ];

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleNext = () => setStep((s) => s + 1);
  const handleBack = () => setStep((s) => s - 1);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

  if (submitted) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-purple-100">
        <div className="bg-white rounded-xl shadow-lg p-10 max-w-md w-full flex flex-col items-center animate-fade-in">
          <CheckCircleIcon className="w-16 h-16 text-green-500 mb-4" />
          <h2 className="text-2xl font-bold mb-2 text-green-700">
            Client Onboarded!
          </h2>
          <p className="text-gray-600 mb-4">
            You have successfully onboarded{" "}
            <span className="font-semibold">{form.name}</span>.
          </p>
          <button
            className="mt-2 px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
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
            Add Another Client
          </button>
        </div>
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
          .animate-fade-in {
            animation: fade-in 0.7s cubic-bezier(0.4, 0, 0.2, 1) both;
          }
        `}</style>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-purple-100">
      <form
        onSubmit={handleSubmit}
        className="bg-white rounded-xl shadow-lg p-8 w-full max-w-md flex flex-col gap-6 animate-fade-in"
      >
        <h1 className="text-2xl font-bold text-center text-blue-700 mb-2">
          Client Onboarding
        </h1>
        {/* Progress Bar */}
        <div className="flex items-center justify-center gap-4 mb-6">
          {steps.map((s, idx) => (
            <div key={s.label} className="flex flex-col items-center">
              <div
                className={`rounded-full p-2 ${
                  step === idx + 1 ? "bg-blue-100" : "bg-gray-100"
                }`}
              >
                {s.icon}
              </div>
              <span
                className={`text-xs mt-1 ${
                  step === idx + 1
                    ? "text-blue-700 font-semibold"
                    : "text-gray-400"
                }`}
              >
                {s.label}
              </span>
            </div>
          ))}
        </div>
        <div className="h-2 w-full bg-gray-200 rounded-full mb-4">
          <div
            className="h-2 bg-blue-500 rounded-full transition-all"
            style={{ width: `${(step / steps.length) * 100}%` }}
          />
        </div>

        {/* Step Content */}
        {step === 1 && (
          <>
            <label className="flex flex-col gap-1">
              <span className="font-semibold">Full Name</span>
              <input
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
                name="email"
                type="email"
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
                name="phone"
                type="tel"
                value={form.phone}
                onChange={handleChange}
                required
                className="border rounded px-3 py-2"
                placeholder="Phone Number"
              />
            </label>
          </>
        )}

        {step === 2 && (
          <>
            <label className="flex flex-col gap-1">
              <span className="font-semibold">Company (optional)</span>
              <input
                name="company"
                value={form.company}
                onChange={handleChange}
                className="border rounded px-3 py-2"
                placeholder="Company Name"
              />
            </label>
          </>
        )}

        {step === 3 && (
          <>
            <label className="flex flex-col gap-1">
              <span className="font-semibold">Notes (optional)</span>
              <textarea
                name="notes"
                value={form.notes}
                onChange={handleChange}
                className="border rounded px-3 py-2"
                placeholder="Any extra notes about the client"
              />
            </label>
            {/* Summary */}
            <div className="bg-blue-50 rounded p-4 mt-4 text-sm text-blue-900">
              <div>
                <span className="font-semibold">Name:</span> {form.name}
              </div>
              <div>
                <span className="font-semibold">Email:</span> {form.email}
              </div>
              <div>
                <span className="font-semibold">Phone:</span> {form.phone}
              </div>
              {form.company && (
                <div>
                  <span className="font-semibold">Company:</span> {form.company}
                </div>
              )}
              {form.notes && (
                <div>
                  <span className="font-semibold">Notes:</span> {form.notes}
                </div>
              )}
            </div>
          </>
        )}

        {/* Navigation Buttons */}
        <div className="flex justify-between mt-4">
          {step > 1 ? (
            <button
              type="button"
              onClick={handleBack}
              className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300 transition"
            >
              Back
            </button>
          ) : (
            <span />
          )}
          {step < steps.length ? (
            <button
              type="button"
              onClick={handleNext}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
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
        .animate-fade-in {
          animation: fade-in 0.7s cubic-bezier(0.4, 0, 0.2, 1) both;
        }
      `}</style>
    </div>
  );
}
