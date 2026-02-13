"use client";

import { useEffect, useState } from "react";

export default function AccountPage() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("pn_token");
    if (!token) {
      setLoading(false);
      return;
    }
    // use client API helper so client-side requests go to backend origin
    import('@/lib/api').then(({ fetchMe }) => {
      fetchMe(token).then((res: any) => {
        setUser(res.user);
      }).catch(() => {}).finally(() => setLoading(false));
    }).catch(() => setLoading(false));
  }, []);

  if (loading) return <div className="p-12">Loading…</div>;
  if (!user) return <div className="p-12">Not signed in — <a href="/login" className="text-emerald-600">Sign in</a></div>;

  return (
    <div className="max-w-4xl mx-auto py-12 px-4">
      <div className="bg-white rounded-lg p-6 shadow">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-lg font-bold">{user.name || user.email}</h2>
            <p className="text-sm text-gray-500">Member since {new Date(user.createdAt || Date.now()).toLocaleDateString()}</p>
          </div>
        </div>

        <h3 className="text-sm font-semibold mb-3">Saved roadmaps</h3>
        {user.roadmaps?.length ? (
          <ul className="space-y-2">
            {user.roadmaps.map((id: string) => (
              <li key={id} className="flex items-center justify-between gap-3">
                <div>
                  <a href={`/roadmap?share=${id}`} className="text-emerald-600 underline">Open roadmap — {id}</a>
                </div>
                <div className="flex gap-2">
                  <a href={`/roadmap?share=${id}`} className="text-sm px-2 py-1 bg-surface-50 border rounded text-gray-700">Edit</a>
                  <button
                    className="text-sm px-2 py-1 bg-rose-50 border rounded text-rose-600"
                    onClick={async () => {
                      if (!confirm('Delete this roadmap?')) return;
                      const token = localStorage.getItem('pn_token');
                      const { API_ORIGIN } = await import('@/lib/api');
                      const res = await fetch(`${API_ORIGIN}/api/roadmaps/${id}`, { method: 'DELETE', headers: token ? { Authorization: `Bearer ${token}` } : {} });
                      const j = await res.json();
                      if (j?.success) window.location.reload();
                      else alert('Delete failed');
                    }}
                  >Delete</button>
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-sm text-gray-500">You don't have any saved roadmaps yet. Create one from a career page and click "Save roadmap".</p>
        )}
      </div>
    </div>
  );
}
