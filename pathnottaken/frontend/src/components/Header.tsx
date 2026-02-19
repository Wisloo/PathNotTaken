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
    { href: "/explore", label: "Explore" },
    { href: "/careers", label: "Browse Careers" },
    { href: "/#how-it-works", label: "How It Works" },
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
    <header className="sticky top-0 z-50 backdrop-blur-2xl bg-white/60 border-b border-gray-200/40 shadow-[0_1px_8px_rgba(0,0,0,0.03)]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2.5 group shrink-0">
            <div className="relative w-9 h-9 bg-gradient-to-br from-emerald-500 to-emerald-700 rounded-xl flex items-center justify-center shadow-md shadow-emerald-500/20 group-hover:shadow-emerald-500/40 transition-shadow duration-300">
              <span className="text-white font-extrabold text-sm tracking-tight">PN</span>
              <div className="absolute inset-0 rounded-xl bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            </div>
            <span className="text-[17px] font-extrabold text-gray-900 tracking-tight">
              Path<span className="gradient-text">NotTaken</span>
            </span>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-0.5">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`relative px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                  isActive(link.href)
                    ? "text-emerald-700 bg-emerald-50/80"
                    : "text-gray-500 hover:text-gray-900 hover:bg-gray-50"
                }`}
              >
                {link.label}
                {isActive(link.href) && (
                  <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-4 h-0.5 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full" />
                )}
              </Link>
            ))}
          </nav>

          {/* Right side (auth) */}
          <div className="hidden md:flex items-center gap-3">
            {!me ? (
              <>
                <Link href="/login" className="text-sm font-medium text-gray-500 hover:text-gray-900 px-4 py-2 rounded-lg hover:bg-gray-50 transition-all duration-200">Login</Link>
                <Link href="/signup" className="bg-gradient-to-r from-emerald-600 to-emerald-700 text-white px-5 py-2.5 rounded-xl text-sm font-semibold hover:from-emerald-700 hover:to-emerald-800 transition-all shadow-md shadow-emerald-600/20 hover:shadow-emerald-600/30 hover:-translate-y-px">Sign Up</Link>
              </>
            ) : (
              <div className="flex items-center gap-1">
                <Link href="/account" className="text-sm font-medium text-gray-600 px-3 py-2 rounded-lg hover:bg-emerald-50 hover:text-emerald-700 transition-all duration-200">My Roadmaps</Link>
                <button onClick={logout} className="text-sm text-gray-400 px-3 py-2 rounded-lg hover:bg-gray-50 hover:text-gray-600 transition-all duration-200">Logout</button>
              </div>
            )}
          </div>

          {/* Mobile toggle */}
          <button
            className="md:hidden p-2 text-gray-400 hover:text-gray-900 rounded-lg hover:bg-gray-50 transition-all"
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
          <div className="md:hidden border-t border-gray-100 py-3 space-y-1 animate-fade-in">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMobileOpen(false)}
                className={`block px-4 py-2.5 rounded-lg text-sm font-medium transition-all ${
                  isActive(link.href)
                    ? "text-emerald-700 bg-emerald-50/80"
                    : "text-gray-600 hover:bg-gray-50"
                }`}
              >
                {link.label}
              </Link>
            ))}

            <div className="pt-3 border-t border-gray-100 flex gap-2 px-4">
              {!me ? (
                <>
                  <Link href="/login" className="flex-1 text-center py-2.5 rounded-xl text-sm font-medium border border-gray-200 text-gray-700 hover:bg-gray-50 transition-all">Login</Link>
                  <Link href="/signup" className="flex-1 text-center py-2.5 rounded-xl text-sm font-semibold bg-gradient-to-r from-emerald-600 to-emerald-700 text-white">Sign Up</Link>
                </>
              ) : (
                <>
                  <Link href="/account" className="flex-1 text-center py-2.5 rounded-xl text-sm font-medium border border-gray-200 text-gray-700 hover:bg-gray-50 transition-all">My Roadmaps</Link>
                  <button onClick={logout} className="flex-1 text-center py-2.5 rounded-xl text-sm font-medium border border-gray-200 text-gray-500 hover:bg-gray-50 transition-all">Logout</button>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
