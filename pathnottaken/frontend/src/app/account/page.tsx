"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { fetchMe, API_ORIGIN } from "@/lib/api";
import { useToast } from "@/components/Toast";

interface RoadmapDetail {
  id: string;
  careerId: string;
  title: string;
  createdAt: string;
}

interface UserProfile {
  id: string;
  email: string;
  name?: string;
  createdAt?: string;
  roadmaps?: string[];
  roadmapDetails?: RoadmapDetail[];
}

export default function AccountPage() {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const router = useRouter();
  const { toast, confirm } = useToast();

  useEffect(() => {
    const token = localStorage.getItem("pn_token");
    if (!token) {
      setLoading(false);
      return;
    }
    fetchMe(token)
      .then((res) => setUser(res?.user || null))
      .catch(() => setUser(null))
      .finally(() => setLoading(false));
  }, []);

  function logout() {
    localStorage.removeItem("pn_token");
    localStorage.removeItem("pn_user_name");
    setUser(null);
    toast("Signed out successfully.", "info");
    router.push("/");
  }

  async function deleteRoadmap(id: string) {
    confirm("Are you sure you want to delete this roadmap? This cannot be undone.", async () => {
      setDeletingId(id);
      try {
        const token = localStorage.getItem("pn_token");
        const res = await fetch(`${API_ORIGIN}/api/roadmaps/${id}`, {
          method: "DELETE",
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        });
        const j = await res.json();
        if (j?.success) {
          setUser((prev) => prev ? { ...prev, roadmaps: prev.roadmaps?.filter((r) => r !== id) } : prev);
          toast("Roadmap deleted.", "success");
        } else {
          toast("Failed to delete roadmap.", "error");
        }
      } catch {
        toast("Connection error. Please try again.", "error");
      } finally {
        setDeletingId(null);
      }
    });
  }

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto py-20 px-4">
        <div className="flex items-center justify-center gap-3">
          <div className="w-6 h-6 border-3 border-gray-200 border-t-emerald-600 rounded-full animate-spin" />
          <span className="text-gray-500">Loading your account...</span>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="max-w-md mx-auto py-20 px-4">
        <div className="card-static p-8 text-center">
          <div className="w-12 h-12 bg-gray-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
          </div>
          <h2 className="text-lg font-bold text-gray-900 mb-1">Not signed in</h2>
          <p className="text-sm text-gray-500 mb-4">Sign in to save your roadmaps and track your progress.</p>
          <div className="flex justify-center gap-3">
            <Link href="/login" className="btn-primary px-4 py-2 text-sm">Sign in</Link>
            <Link href="/signup" className="btn-secondary px-4 py-2 text-sm">Create account</Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto py-12 px-4">
      {/* Profile card */}
      <div className="card-static p-6 mb-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-emerald-700 rounded-xl flex items-center justify-center shadow-sm">
              <span className="text-white font-bold text-lg">{(user.name || user.email)[0].toUpperCase()}</span>
            </div>
            <div>
              <h1 className="text-lg font-bold text-gray-900">{user.name || user.email}</h1>
              <p className="text-sm text-gray-500">{user.email}</p>
              {user.createdAt && (
                <p className="text-xs text-gray-400 mt-0.5">Member since {new Date(user.createdAt).toLocaleDateString("en-US", { month: "long", year: "numeric" })}</p>
              )}
            </div>
          </div>
          <button onClick={logout} className="px-4 py-2 text-sm font-medium text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors">
            Sign out
          </button>
        </div>
      </div>

      {/* Saved roadmaps */}
      <div className="card-static p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-base font-bold text-gray-900">Saved Roadmaps</h2>
          <Link href="/careers" className="text-sm text-emerald-600 hover:text-emerald-700 font-medium">+ Create new</Link>
        </div>

        {(user.roadmapDetails || []).length > 0 ? (
          <div className="space-y-3">
            {(user.roadmapDetails || []).map((rm: RoadmapDetail) => (
              <div key={rm.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl border border-gray-100 hover:border-gray-200 transition-colors">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-10 h-10 bg-emerald-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <svg className="w-5 h-5 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                    </svg>
                  </div>
                  <div className="min-w-0">
                    <Link href={`/roadmap?share=${rm.id}`} className="text-sm font-semibold text-gray-900 hover:text-emerald-600 truncate block">
                      {rm.title || 'Untitled Roadmap'}
                    </Link>
                    {rm.createdAt && (
                      <p className="text-xs text-gray-400 mt-0.5">
                        Created {new Date(rm.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                      </p>
                    )}
                  </div>
                </div>
                <div className="flex gap-2 flex-shrink-0 ml-4">
                  <Link href={`/roadmap?share=${rm.id}`} className="text-xs px-3 py-1.5 bg-white border border-gray-200 rounded-lg text-gray-600 hover:bg-gray-50 font-medium">
                    Open
                  </Link>
                  <button
                    className="text-xs px-3 py-1.5 bg-red-50 border border-red-200 rounded-lg text-red-600 hover:bg-red-100 disabled:opacity-50 font-medium"
                    onClick={() => deleteRoadmap(rm.id)}
                    disabled={deletingId === rm.id}
                  >
                    {deletingId === rm.id ? "Deleting..." : "Delete"}
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : user.roadmaps?.length ? (
          <div className="space-y-3">
            {user.roadmaps.map((id: string) => (
              <div key={id} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl border border-gray-100">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-emerald-100 rounded-lg flex items-center justify-center">
                    <svg className="w-5 h-5 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                    </svg>
                  </div>
                  <Link href={`/roadmap?share=${id}`} className="text-sm font-semibold text-emerald-600 hover:text-emerald-700">
                    Roadmap {id.slice(0, 8)}...
                  </Link>
                </div>
                <div className="flex gap-2">
                  <Link href={`/roadmap?share=${id}`} className="text-xs px-3 py-1.5 bg-white border border-gray-200 rounded-lg text-gray-600 hover:bg-gray-50">
                    Open
                  </Link>
                  <button
                    className="text-xs px-3 py-1.5 bg-red-50 border border-red-200 rounded-lg text-red-600 hover:bg-red-100 disabled:opacity-50"
                    onClick={() => deleteRoadmap(id)}
                    disabled={deletingId === id}
                  >
                    {deletingId === id ? "Deleting..." : "Delete"}
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <svg className="w-10 h-10 text-gray-300 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
            </svg>
            <p className="text-sm text-gray-500 mb-1">No saved roadmaps yet</p>
            <p className="text-xs text-gray-400">Create one from a career page and click &quot;Save roadmap.&quot;</p>
          </div>
        )}
      </div>
    </div>
  );
}
