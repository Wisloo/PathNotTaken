"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

/**
 * Wraps any page that requires authentication.
 * If no token is found, shows a friendly prompt to sign in.
 */
export default function AuthGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [checked, setChecked] = useState(false);
  const [authed, setAuthed] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("pn_token");
    if (token) {
      setAuthed(true);
    }
    setChecked(true);
  }, []);

  if (!checked) {
    return (
      <div className="max-w-4xl mx-auto py-20 px-4">
        <div className="flex items-center justify-center gap-3">
          <div className="w-6 h-6 border-3 border-gray-200 border-t-emerald-600 rounded-full animate-spin" />
          <span className="text-gray-500">Loading...</span>
        </div>
      </div>
    );
  }

  if (!authed) {
    return (
      <section className="min-h-[80vh] flex items-center justify-center bg-[#fafbfc]">
        <div className="max-w-md mx-auto px-4 text-center">
          <div className="card-static p-10">
            {/* Icon */}
            <div className="w-16 h-16 bg-gradient-to-br from-emerald-100 to-teal-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <svg className="w-8 h-8 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>

            <h2 className="text-2xl font-extrabold text-gray-900 mb-2">
              Sign in to continue
            </h2>
            <p className="text-gray-500 mb-8 text-sm leading-relaxed">
              Create a free account or sign in to discover hidden career paths, build roadmaps, and track your progress.
            </p>

            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link
                href="/login"
                className="btn-primary px-6 py-3 text-sm"
              >
                Sign in
              </Link>
              <Link
                href="/signup"
                className="btn-secondary px-6 py-3 text-sm"
              >
                Create free account
              </Link>
            </div>

            <p className="text-xs text-gray-400 mt-6">
              100% free &mdash; no credit card needed
            </p>
          </div>
        </div>
      </section>
    );
  }

  return <>{children}</>;
}
