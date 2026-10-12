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
    window.location.reload();
  }

  return (
    <header className="sticky top-0 z-50 border-b border-white/10 bg-black/70 font-display backdrop-blur-2xl">
      <div className="mx-auto max-w-[1600px] px-4 sm:px-6 lg:px-8">
        <div className="relative flex h-16 items-center justify-between">
          {/* Logo */}
          <Link href="/" className="group flex shrink-0 items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-lime shadow-[0_0_24px_rgba(204,255,0,0.35)] transition-transform duration-300 group-hover:scale-105">
              <span className="text-sm font-bold tracking-tight text-black">PN</span>
            </div>
            <span className="text-[17px] font-medium tracking-tight text-ink">
              Path<span className="text-lime">NotTaken</span>
            </span>
          </Link>

          {/* Desktop Nav — centered pill */}
          <nav className="absolute left-1/2 hidden -translate-x-1/2 items-center gap-1 rounded-full border border-white/10 bg-white/5 px-1.5 py-1.5 backdrop-blur-xl md:flex">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`rounded-full px-4 py-2 text-sm transition-all duration-200 ${
                  isActive(link.href)
                    ? "bg-lime font-medium text-black"
                    : "text-white/70 hover:bg-white/5 hover:text-white"
                }`}
              >
                {link.label}
              </Link>
            ))}
          </nav>

          {/* Right side */}
          <div className="hidden items-center gap-4 md:flex">
            <span className="status-tag text-white/50">
              <span className="status-dot" />
              System Online
            </span>
            {!me ? (
              <>
                <Link href="/login" className="text-sm font-medium text-white/70 transition-colors hover:text-white">Login</Link>
                <Link href="/signup" className="rounded-full bg-white px-5 py-2.5 text-sm font-bold text-black transition-transform duration-300 hover:scale-105">Sign Up</Link>
              </>
            ) : (
              <div className="flex items-center gap-1">
                <Link href="/account" className="rounded-full px-4 py-2 text-sm font-medium text-white/70 transition-colors hover:bg-white/5 hover:text-white">My Profile</Link>
                <button onClick={logout} className="rounded-full px-4 py-2 text-sm text-white/40 transition-colors hover:bg-white/5 hover:text-white/70">Logout</button>
              </div>
            )}
          </div>

          {/* Mobile toggle */}
          <button
            className="rounded-lg p-2 text-white/60 transition-all hover:bg-white/5 hover:text-white md:hidden"
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label="Toggle menu"
          >
            <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
          <div className="animate-fade-in space-y-1 border-t border-white/10 py-3 md:hidden">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMobileOpen(false)}
                className={`block rounded-xl px-4 py-2.5 text-sm font-medium transition-all ${
                  isActive(link.href)
                    ? "bg-lime text-black"
                    : "text-white/70 hover:bg-white/5"
                }`}
              >
                {link.label}
              </Link>
            ))}

            <div className="flex gap-2 border-t border-white/10 px-4 pt-3">
              {!me ? (
                <>
                  <Link href="/login" className="flex-1 rounded-full border border-white/15 py-2.5 text-center text-sm font-medium text-white/80 transition-all hover:bg-white/5">Login</Link>
                  <Link href="/signup" className="flex-1 rounded-full bg-lime py-2.5 text-center text-sm font-bold text-black">Sign Up</Link>
                </>
              ) : (
                <>
                  <Link href="/account" className="flex-1 rounded-full border border-white/15 py-2.5 text-center text-sm font-medium text-white/80 transition-all hover:bg-white/5">My Profile</Link>
                  <button onClick={logout} className="flex-1 rounded-full border border-white/15 py-2.5 text-center text-sm font-medium text-white/60 transition-all hover:bg-white/5">Logout</button>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
