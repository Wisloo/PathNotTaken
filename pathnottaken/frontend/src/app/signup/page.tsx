"use client";

import { useState } from "react";
import { registerUser } from "@/lib/api";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useToast } from "@/components/Toast";

export default function SignUpPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const router = useRouter();
  const { toast } = useToast();

  const passwordStrength = !password ? 0 : password.length < 6 ? 1 : password.length < 10 ? 2 : /[A-Z]/.test(password) && /[0-9]/.test(password) ? 4 : 3;
  const strengthLabels = ["", "Weak", "Fair", "Good", "Strong"];
  const strengthColors = ["", "bg-red-400", "bg-amber-400", "bg-blue-400", "bg-emerald-400"];

  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);

    if (!name.trim()) return setError("Please enter your name.");
    if (!email.trim()) return setError("Please enter your email address.");
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return setError("Please enter a valid email address.");
    if (password.length < 6) return setError("Password must be at least 6 characters.");
    if (password !== confirmPassword) return setError("Passwords do not match.");

    setLoading(true);
    try {
      const res = await registerUser(email, password, name.trim());
      if (res?.token) {
        localStorage.setItem("pn_token", res.token);
        if (name.trim()) localStorage.setItem("pn_user_name", name.trim());
        toast("Account created! Welcome to PathNotTaken.", "success");
        router.push("/explore");
      } else {
        setError(res?.error || "Sign up failed. Please try again.");
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
          <h1 className="text-2xl font-bold text-gray-900">Create your account</h1>
          <p className="text-sm text-gray-500 mt-1">Start discovering career paths you never knew existed</p>
        </div>

        <form onSubmit={submit} className="space-y-4" noValidate>
          <div>
            <label htmlFor="signup-name" className="block text-sm font-medium text-gray-700 mb-1">Full name</label>
            <input
              id="signup-name"
              type="text"
              autoComplete="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Jane Doe"
              className="w-full border border-gray-200 px-3 py-2.5 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
              required
            />
          </div>

          <div>
            <label htmlFor="signup-email" className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <input
              id="signup-email"
              type="email"
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              className="w-full border border-gray-200 px-3 py-2.5 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
              required
            />
          </div>

          <div>
            <label htmlFor="signup-password" className="block text-sm font-medium text-gray-700 mb-1">Password</label>
            <div className="relative">
              <input
                id="signup-password"
                type={showPassword ? "text" : "password"}
                autoComplete="new-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="At least 6 characters"
                className="w-full border border-gray-200 px-3 py-2.5 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 pr-10"
                required
                minLength={6}
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
            {password && (
              <div className="mt-1.5 flex items-center gap-2">
                <div className="flex gap-1 flex-1">
                  {[1, 2, 3, 4].map(n => (
                    <div key={n} className={`h-1 flex-1 rounded-full ${n <= passwordStrength ? strengthColors[passwordStrength] : 'bg-gray-200'}`} />
                  ))}
                </div>
                <span className="text-xs text-gray-500">{strengthLabels[passwordStrength]}</span>
              </div>
            )}
          </div>

          <div>
            <label htmlFor="signup-confirm" className="block text-sm font-medium text-gray-700 mb-1">Confirm password</label>
            <input
              id="signup-confirm"
              type={showPassword ? "text" : "password"}
              autoComplete="new-password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Re-enter your password"
              className="w-full border border-gray-200 px-3 py-2.5 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
              required
            />
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
            {loading ? "Creating account..." : "Create account"}
          </button>
        </form>

        <p className="text-center text-sm text-gray-500 mt-6">
          Already have an account?{" "}
          <Link href="/login" className="text-emerald-600 font-medium hover:text-emerald-700">Sign in</Link>
        </p>
      </div>
    </div>
  );
}
