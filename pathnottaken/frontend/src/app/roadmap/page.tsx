"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { fetchCareerById } from "@/lib/api";

type WeekTask = { id: string; title: string; done?: boolean; note?: string };

export default function RoadmapPage() {
  const params = useSearchParams();
  const careerId = params?.get("career") || "";
  const [loading, setLoading] = useState(true);
  const [career, setCareer] = useState<any>(null);
  const [weeks, setWeeks] = useState<WeekTask[][]>([]);

  useEffect(() => {
    // support share=<id> (load saved roadmap) or career=<id>
    const shareId = params?.get("share");
    const storedCareerId = careerId;

    async function loadShared(id: string) {
      setLoading(true);
      try {
        const { API_ORIGIN } = await import('@/lib/api');
        const res = await fetch(`${API_ORIGIN}/api/roadmaps/${id}`);
        if (!res.ok) throw new Error("not found");
        const json = await res.json();
        const r = json.roadmap;
        const c = await fetchCareerById(r.careerId);
        setCareer(c);
        setWeeks(r.weeks || []);
        setSavedUrl(window.location.href);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }

    async function buildForCareer(id: string) {
      setLoading(true);
      try {
        const c = await fetchCareerById(id);
        setCareer(c);

        // check localStorage for an in-progress roadmap
        const lsKey = `roadmap:${id}`;
        const persisted = localStorage.getItem(lsKey);
        if (persisted) {
          setWeeks(JSON.parse(persisted));
          return;
        }

        // build a simple 12‑week (90 day) plan prefilled from matched/missing skills
        const skills = [
          ...(c.missingSkills || []),
          ...(c.matchedSkills?.slice(0, 6) || []),
        ].map((s: string) => s.replace(/-/g, " "));

        const projects = [] as string[];
        if (skills.length > 0) {
          projects.push(`Build a small project using ${skills[0]}`);
        }
        if (skills.length > 1) {
          projects.push(`Add ${skills[1]} feature to your project`);
        }

        const weekly: WeekTask[][] = Array.from({ length: 12 }, (_, w) => {
          const baseIdx = w % Math.max(1, skills.length);
          const tasks: WeekTask[] = [
            { id: `t-${w}-1`, title: `Learn: quick core concept — ${skills[baseIdx] || 'general'}` },
            { id: `t-${w}-2`, title: `Practice: 1 small exercise or kata` },
            { id: `t-${w}-3`, title: `Build: apply to your mini‑project${projects[w % projects.length] ? ' — ' + projects[w % projects.length] : ''}` },
            { id: `t-${w}-4`, title: `Reflect: write 3 things you learned` },
          ];
          return tasks;
        });

        setWeeks(weekly);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }

    if (shareId) {
      loadShared(shareId);
    } else if (storedCareerId) {
      buildForCareer(storedCareerId);
    }
  }, [careerId]);

  const [savedUrl, setSavedUrl] = useState<string | null>(null);
  const [apiOrigin, setApiOrigin] = useState<string>('');
  useEffect(() => { import('@/lib/api').then(m => setApiOrigin(m.API_ORIGIN)).catch(() => {}); }, []);

  function persistLocal(id?: string, data?: WeekTask[][]) {
    try {
      const key = `roadmap:${id || careerId}`;
      localStorage.setItem(key, JSON.stringify(data || weeks));
    } catch (e) {
      /* ignore */
    }
  }

  function toggleDone(monthIdx: number, weekIdx: number) {
    setWeeks((prev) => {
      const copy = prev.map((m) => m.map((t) => ({ ...t })));
      copy[monthIdx][weekIdx].done = !copy[monthIdx][weekIdx].done;
      // persist immediately
      persistLocal(career?.id, copy);
      return copy;
    });
  }

  async function saveRoadmap() {
    if (!career) return;
    try {
      const token = localStorage.getItem('pn_token');
      const headers: any = { "Content-Type": "application/json" };
      if (token) headers.Authorization = `Bearer ${token}`;

      const shareId = params?.get('share');
      if (shareId) {
        // update existing roadmap (PUT)
        const { API_ORIGIN } = await import('@/lib/api');
        const res = await fetch(`${API_ORIGIN}/api/roadmaps/${shareId}`, { method: 'PUT', headers, body: JSON.stringify({ title: career.title, weeks }) });
        const j = await res.json();
        if (j?.success) {
          alert('Saved changes');
          setSavedUrl(window.location.href);
        } else {
          alert('Failed to save changes');
        }
        return;
      }

      const { API_ORIGIN } = await import('@/lib/api');
      const res = await fetch(`${API_ORIGIN}/api/roadmaps`, {
        method: "POST",
        headers,
        body: JSON.stringify({ careerId: career.id, title: career.title, weeks }),
      });
      const json = await res.json();
      if (json && json.url) {
        setSavedUrl(json.url);
        // update browser URL to share param (client-side)
        const u = new URL(window.location.href);
        u.searchParams.delete("career");
        u.searchParams.set("share", json.id);
        window.history.replaceState({}, "", u.toString());
      }
    } catch (err) {
      console.error(err);
      alert("Failed to save roadmap");
    }
  }

  useEffect(() => {
    // save to localStorage whenever weeks change
    persistLocal(career?.id, weeks);
  }, [weeks, career]);

  if (!careerId) {
    return (
      <div className="max-w-4xl mx-auto py-24 px-6">
        <div className="bg-white rounded-lg p-8 shadow">No career selected. Go back and pick a career to prefill a 90‑day roadmap.</div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto py-12 px-6">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold">90‑Day Roadmap</h1>
          <p className="text-sm text-gray-500 mt-1">Personalized roadmap for <strong>{career?.title || '...'}</strong></p>
        </div>
        <div className="flex gap-3 items-center">
          <button
            className="px-4 py-2 bg-slate-100 text-sm rounded-md"
            onClick={() => navigator.clipboard.writeText(window.location.href)}
          >
            Copy shareable link
          </button>

          <button
            className="px-4 py-2 bg-emerald-600 text-white text-sm rounded-md"
            onClick={saveRoadmap}
          >
            Save roadmap
          </button>

          <a className="px-4 py-2 bg-white border border-surface-200 text-sm rounded-md" href={apiOrigin ? `${apiOrigin}/api/roadmaps/${new URL(window.location.href).searchParams.get('share') || ''}/ics` : '#'}>
            Export Calendar
          </a>

          <button
            className="px-4 py-2 bg-slate-100 text-sm rounded-md"
            onClick={async () => {
              const shareId = new URL(window.location.href).searchParams.get('share');
              if (!shareId) return alert('Save roadmap first');
              const { API_ORIGIN } = await import('@/lib/api');
              const res = await fetch(`${API_ORIGIN}/api/roadmaps/${shareId}/generate-tasks`, { method: 'POST' });
              const j = await res.json();
              if (j?.weeks) setWeeks(j.weeks);
              else alert(j?.error || 'Failed to generate');
            }}
          >
            Auto‑generate tasks (AI)
          </button>

          {savedUrl && (
            <div className="ml-4 text-sm text-emerald-600">
              Saved • <a className="underline" href={savedUrl} target="_blank" rel="noreferrer">Open share link</a>
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-3 gap-6">
        {Array.from({ length: 3 }).map((_, month) => (
          <div key={month} className="bg-white rounded-lg p-4 border border-surface-200 shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <div>
                <h3 className="text-sm font-semibold">Month {month + 1}</h3>
                <p className="text-xs text-gray-400">Weeks {(month*4)+1}–{(month+1)*4}</p>
              </div>
              <div className="text-xs text-gray-500">Focus: {career?.missingSkills?.[month] ? career.missingSkills[month].replace(/-/g, ' ') : career?.matchedSkills?.[month]?.replace(/-/g, ' ') || 'Core skills'}</div>
            </div>

            <div className="space-y-3">
              {weeks.slice(month*4, month*4 + 4).map((weekTasks, wi) => (
                <div key={wi} className="p-3 bg-surface-50 rounded-md border border-surface-100">
                  <div className="flex items-start gap-3">
                    <div className="text-sm font-semibold w-14">Week {(month*4)+wi+1}</div>
                    <div className="flex-1">
                      {weekTasks.map((task, ti) => (
                        <label key={task.id} className={`flex items-center gap-3 text-sm ${task.done ? 'opacity-60 line-through' : ''}`}>
                          <input
                            type="checkbox"
                            checked={!!task.done}
                            onChange={() => {
                              setWeeks((prev) => {
                                const copy = prev.map((m) => m.map((t) => ({ ...t })));
                                copy[month*4 + wi][ti].done = !copy[month*4 + wi][ti].done;
                                return copy;
                              });
                            }}
                            className="w-4 h-4 rounded"
                          />
                          <span>{task.title}</span>
                        </label>
                      ))}
                      <div className="mt-2 text-xs text-gray-400">Suggestion: 3–5 hours this week</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      <div className="mt-8 bg-white p-4 rounded-lg border border-surface-200 shadow-sm">
        <h3 className="text-sm font-semibold mb-2">Why this roadmap</h3>
        <p className="text-sm text-gray-600">This prototype turns the matched and missing skills for <strong>{career?.title}</strong> into a lightweight, actionable 90‑day plan: weekly learning, practice, and a mini‑project. You can extend this by adding progress tracking, deadlines, and integrations with courses or mentors.</p>
      </div>
    </div>
  );
}
