"use client";

import { useState } from "react";
import { loginUser } from "@/lib/api";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useToast } from "@/components/Toast";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const router = useRouter();
  const { toast } = useToast();

  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);

    if (!email.trim()) return setError("Please enter your email address.");
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return setError("Please enter a valid email address.");
    if (!password || password.length < 6) return setError("Password must be at least 6 characters.");

    setLoading(true);
    try {
      const res = await loginUser(email, password);
      if (res?.token) {
        localStorage.setItem("pn_token", res.token);
        if (res.user?.name) localStorage.setItem("pn_user_name", res.user.name);
        toast("Welcome back!", "success");
        router.push("/account");
      } else {
        setError(res?.error || "Login failed. Please check your credentials.");
      }
    } catch {
      setError("Connection error. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-md mx-auto py-20 px-4">
      <div className="card-static p-8">
        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Welcome back</h1>
          <p className="text-sm text-gray-500 mt-1">Sign in to your PathNotTaken account</p>
        </div>

        <form onSubmit={submit} className="space-y-4" noValidate>
          <div>
            <label htmlFor="login-email" className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <input
              id="login-email"
              type="email"
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              className="w-full border border-gray-200 px-3 py-2.5 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-50 focus:border-emerald-500 transition-all"
              required
            />
          </div>

          <div>
            <label htmlFor="login-password" className="block text-sm font-medium text-gray-700 mb-1">Password</label>
            <div className="relative">
              <input
                id="login-password"
                type={showPassword ? "text" : "password"}
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                className="w-full border border-gray-200 px-3 py-2.5 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-50 focus:border-emerald-500 transition-all pr-10"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 text-xs"
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? "Hide" : "Show"}
              </button>
            </div>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 text-sm p-3 rounded-lg" role="alert">
              {error}
            </div>
          )}

          <button
            type="submit"
            className="w-full px-4 py-2.5 bg-gradient-to-r from-emerald-600 to-emerald-700 text-white rounded-xl font-medium hover:shadow-lg hover:shadow-emerald-600/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={loading}
          >
            {loading ? "Signing in..." : "Sign in"}
          </button>
        </form>

        <p className="text-center text-sm text-gray-500 mt-6">
          Don&apos;t have an account?{" "}
          <Link href="/signup" className="text-emerald-600 font-medium hover:text-emerald-700">Create one</Link>
        </p>
      </div>
    </div>
  );
}
