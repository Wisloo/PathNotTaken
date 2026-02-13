"use client";

import { useState } from "react";
import { registerUser } from "@/lib/api";
import { useRouter } from "next/navigation";

export default function SignUpPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  async function submit(e: any) {
    e.preventDefault();
    setError(null);
    if (!name.trim()) return setError('Please enter your name');
    if (!email.trim() || !password) return setError('Email and password are required');
    setLoading(true);
    const res = await registerUser(email, password, name.trim());
    setLoading(false);
    if (res?.token) {
      localStorage.setItem("pn_token", res.token);
      router.push("/account");
    } else {
      setError(res?.error || "Sign up failed");
    }
  }

  return (
    <div className="max-w-md mx-auto py-20 px-4">
      <div className="bg-white p-8 rounded-lg shadow">
        <h2 className="text-xl font-bold mb-4">Create an account</h2>
        <form onSubmit={submit} className="space-y-3">
          <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Your full name" className="w-full border px-3 py-2 rounded-md" />
          <input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email" className="w-full border px-3 py-2 rounded-md" />
          <input value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Password" type="password" className="w-full border px-3 py-2 rounded-md" />
          {error && <div className="text-sm text-rose-600">{error}</div>}
          <div className="flex items-center justify-between mt-4">
            <button className="px-4 py-2 bg-emerald-600 text-white rounded-md" disabled={loading}>{loading ? 'Creating...' : 'Create account'}</button>
            <a href="/login" className="text-sm text-gray-500">Already have an account?</a>
          </div>
        </form>
      </div>
    </div>
  );
}
