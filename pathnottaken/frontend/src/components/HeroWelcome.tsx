"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

export default function HeroWelcome() {
  const [name, setName] = useState<string | null>(null);

  useEffect(() => {
    const token = localStorage.getItem("pn_token");
    if (!token) return setName(null);
    // lazy-check local stored name (fast) — fall back to API if absent
    const stored = localStorage.getItem("pn_user_name");
    if (stored) return setName(stored);

    // otherwise fetch /api/auth/me via client helper
    import("@/lib/api").then(({ fetchMe }) => {
      fetchMe(token).then((res: any) => {
        if (res?.user?.name) {
          setName(res.user.name);
          try { localStorage.setItem("pn_user_name", res.user.name); } catch (e) {}
        }
      }).catch(() => {});
    }).catch(() => {});
  }, []);

  if (!name) return null;
  return (
    <div className="mt-6 text-center">
      <div className="inline-flex items-center gap-3 bg-emerald-50/80 backdrop-blur-sm border border-emerald-200/60 text-emerald-700 px-5 py-2.5 rounded-xl shadow-sm">
        <span className="text-sm">Welcome back,</span>
        <strong className="text-sm">{name}</strong>
        <Link href="/account" className="text-sm underline ml-2">Open your roadmaps</Link>
      </div>
    </div>
  );
}
