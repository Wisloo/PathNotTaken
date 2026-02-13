"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";

export default function Header() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  const isActive = (path: string) => pathname === path;

  const navLinks = [
    { href: "/", label: "Home" },
    { href: "/explore", label: "How It Works" },
    { href: "/careers", label: "Browse Careers" },
  ];

  const [me, setMe] = useState<{ id: string; email: string; name?: string } | null>(null);

  // detect token (use API origin helper so requests go to backend, not Next's /api)
  useEffect(() => {
    let mounted = true;
    async function load() {
      const token = localStorage.getItem("pn_token");
      if (!token) {
        if (mounted) setMe(null);
        return;
      }
      try {
        const { fetchMe } = await import("@/lib/api");
        const res = await fetchMe(token);
        if (mounted) setMe(res?.user || null);
      } catch (e) {
        if (mounted) setMe(null);
      }
    }

    load();

    const onStorage = (e: StorageEvent) => {
      if (e.key === 'pn_token') load();
    };
    window.addEventListener('storage', onStorage);

    return () => { mounted = false; window.removeEventListener('storage', onStorage); };
  }, [pathname]);

  function logout() {
    localStorage.removeItem("pn_token");
    setMe(null);
    // refresh to clear any auth-only UI
    window.location.reload();
  }

  return (
    <header className="sticky top-0 z-50 bg-white border-b border-surface-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2.5 group shrink-0">
            <div className="w-9 h-9 bg-brand-600 rounded-full flex items-center justify-center">
              <span className="text-white font-bold text-sm">PN</span>
            </div>
            <span className="text-[17px] font-bold text-gray-900 tracking-tight">
              PathNotTaken
            </span>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  isActive(link.href)
                    ? "text-brand-600"
                    : "text-gray-500 hover:text-gray-900"
                }`}
              >
                {link.label}
              </Link>
            ))}
          </nav>

          {/* Right side (auth) */}
          <div className="hidden md:flex items-center gap-3">
            {!me ? (
              <>
                <Link href="/login" className="text-sm font-medium text-gray-600 hover:text-gray-900 px-4 py-2 transition-colors">Login</Link>
                <Link href="/signup" className="bg-brand-600 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-brand-700 transition-colors">Sign Up</Link>
              </>
            ) : (
              <div className="flex items-center gap-2">
                <Link href="/account" className="text-sm text-gray-700 px-3 py-2 rounded-md hover:bg-surface-50">My Roadmaps</Link>
                <button onClick={logout} className="text-sm text-gray-500 px-3 py-2 rounded-md hover:bg-surface-50">Logout</button>
              </div>
            )}
          </div>

          {/* Mobile toggle */}
          <button
            className="md:hidden p-2 text-gray-500 hover:text-gray-900"
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label="Toggle menu"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {mobileOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>

        {/* Mobile Nav */}
        {mobileOpen && (
          <div className="md:hidden border-t border-surface-200 py-3 space-y-1 animate-fade-in">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMobileOpen(false)}
                className={`block px-4 py-2.5 rounded-lg text-sm font-medium ${
                  isActive(link.href)
                    ? "text-brand-600 bg-brand-50"
                    : "text-gray-600 hover:bg-surface-50"
                }`}
              >
                {link.label}
              </Link>
            ))}

            <div className="pt-3 border-t border-surface-200 flex gap-2 px-4">
              {!me ? (
                <>
                  <Link href="/login" className="flex-1 text-center py-2.5 rounded-lg text-sm font-medium border border-surface-200 text-gray-700">Login</Link>
                  <Link href="/signup" className="flex-1 text-center py-2.5 rounded-lg text-sm font-semibold bg-brand-600 text-white">Sign Up</Link>
                </>
              ) : (
                <>
                  <Link href="/account" className="flex-1 text-center py-2.5 rounded-lg text-sm font-medium border border-surface-200 text-gray-700">My Roadmaps</Link>
                  <button onClick={logout} className="flex-1 text-center py-2.5 rounded-lg text-sm font-medium border border-surface-200 text-gray-700">Logout</button>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
