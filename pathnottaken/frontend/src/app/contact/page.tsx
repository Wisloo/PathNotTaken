"use client";

import { useState } from "react";
import { Metadata } from "next";

// Note: metadata cannot be exported from a client component, so we set it via head
// For a production app, consider splitting the form into a client component and keeping
// the page as a server component for SEO.

export default function ContactPage() {
  const [form, setForm] = useState({ name: "", email: "", message: "" });
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");

    if (!form.name.trim() || !form.email.trim() || !form.message.trim()) {
      setError("Please fill in all fields.");
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(form.email)) {
      setError("Please enter a valid email address.");
      return;
    }

    // In production, this would POST to an API endpoint or email service.
    // For now, simulate success.
    setSubmitted(true);
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-16">
      <h1 className="text-4xl font-bold text-slate-900 mb-3">Contact Us</h1>
      <p className="text-slate-600 mb-10">
        Have a question, suggestion, or found a bug? We&apos;d love to hear from you.
      </p>

      {submitted ? (
        <div className="bg-green-50 border border-green-200 rounded-xl p-8 text-center">
          <div className="w-14 h-14 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-7 h-7 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h2 className="text-xl font-semibold text-green-800 mb-2">Message Sent!</h2>
          <p className="text-green-700">
            Thank you for reaching out. We&apos;ll get back to you as soon as possible.
          </p>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-6" noValidate>
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm" role="alert">
              {error}
            </div>
          )}

          <div>
            <label htmlFor="name" className="block text-sm font-medium text-slate-700 mb-1">
              Name
            </label>
            <input
              id="name"
              name="name"
              type="text"
              value={form.name}
              onChange={handleChange}
              placeholder="Your name"
              autoComplete="name"
              className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition-shadow"
            />
          </div>

          <div>
            <label htmlFor="email" className="block text-sm font-medium text-slate-700 mb-1">
              Email
            </label>
            <input
              id="email"
              name="email"
              type="email"
              value={form.email}
              onChange={handleChange}
              placeholder="you@example.com"
              autoComplete="email"
              className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition-shadow"
            />
          </div>

          <div>
            <label htmlFor="message" className="block text-sm font-medium text-slate-700 mb-1">
              Message
            </label>
            <textarea
              id="message"
              name="message"
              value={form.message}
              onChange={handleChange}
              placeholder="How can we help?"
              rows={5}
              className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition-shadow resize-y"
            />
          </div>

          <button
            type="submit"
            className="w-full py-3 bg-emerald-600 text-white font-medium rounded-lg hover:bg-emerald-700 transition-colors"
          >
            Send Message
          </button>
        </form>
      )}
    </div>
  );
}
