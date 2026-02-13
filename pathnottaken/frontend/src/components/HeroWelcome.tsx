"use client";

import { useEffect, useState } from "react";

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
      <div className="inline-flex items-center gap-3 bg-emerald-50 border border-emerald-100 text-emerald-700 px-4 py-2 rounded-full shadow-sm">
        <span className="text-sm">Welcome back,</span>
        <strong className="text-sm">{name}</strong>
        <a href="/account" className="text-sm underline ml-2">Open your roadmaps</a>
      </div>
    </div>
  );
}
