"use client";

import { useState } from "react";
import { loginUser } from "@/lib/api";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function submit(e: any) {
    e.preventDefault();
    setLoading(true);
    const res = await loginUser(email, password);
    setLoading(false);
    if (res?.token) {
      localStorage.setItem("pn_token", res.token);
      router.push("/account");
    } else {
      alert(res?.error || "Login failed");
    }
  }

  return (
    <div className="max-w-md mx-auto py-20 px-4">
      <div className="bg-white p-8 rounded-lg shadow">
        <h2 className="text-xl font-bold mb-4">Sign in</h2>
        <form onSubmit={submit} className="space-y-3">
          <input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email" className="w-full border px-3 py-2 rounded-md" />
          <input value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Password" type="password" className="w-full border px-3 py-2 rounded-md" />
          <div className="flex items-center justify-between mt-4">
            <button className="px-4 py-2 bg-emerald-600 text-white rounded-md" disabled={loading}>{loading ? 'Signing in...' : 'Sign in'}</button>
            <a href="/signup" className="text-sm text-gray-500">Create account</a>
          </div>
        </form>
      </div>
    </div>
  );
}
