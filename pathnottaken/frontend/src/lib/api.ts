const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";
export const API_ORIGIN = API_BASE.replace('/api','');

export interface Skill {
  id: string;
  label: string;
}

export interface SkillCategory {
  id: string;
  name: string;
  skills: Skill[];
}

export interface Interest {
  id: string;
  label: string;
  icon: string;
}

export interface SalaryRange {
  min: number;
  median?: number;
  max: number;
  currency?: string;
}

export interface CareerRecommendation {
  id: string;
  title: string;
  category: string;
  description: string;
  dayInLife: string;
  salaryRange: SalaryRange;
  growthOutlook: string;
  matchScore: number;
  matchedSkills: string[];
  requiredSkills?: string[];
  matchedInterests: string[];
  missingSkills: string[];
  explanation: string;
  whyNonObvious?: string;
  nonObvious: boolean;
  source?: string;
  typicalBackgrounds?: string[];
  industries?: string[];
  skillTransfers?: Record<string, string>;
  realWorldExamples?: string[];
  entryPaths?: string[];
  careerProgression?: string[];
  pros?: string[];
  cons?: string[];
}

export interface RecommendationResponse {
  success: boolean;
  source: string;
  count: number;
  recommendations: CareerRecommendation[];
}

export async function fetchSkillCategories(): Promise<SkillCategory[]> {
  const res = await fetch(`${API_BASE}/skills/categories`);
  if (!res.ok) throw new Error(`Failed to fetch skill categories: ${res.status}`);
  const data = await res.json();
  return data.categories;
}

export async function fetchInterests(): Promise<Interest[]> {
  const res = await fetch(`${API_BASE}/skills/interests`);
  if (!res.ok) throw new Error(`Failed to fetch interests: ${res.status}`);
  const data = await res.json();
  return data.interests;
}

export async function registerUser(email: string, password: string, name?: string) {
  try {
    const res = await fetch(`${API_BASE.replace('/api','')}/api/auth/register`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password, name })
    });
    return await res.json();
  } catch (err: any) {
    return { error: err?.message || 'Network error' };
  }
}

export async function loginUser(email: string, password: string) {
  try {
    const res = await fetch(`${API_BASE.replace('/api','')}/api/auth/login`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });
    return await res.json();
  } catch (err: any) {
    return { error: err?.message || 'Network error' };
  }
}

export async function fetchMe(token: string) {
  try {
    const res = await fetch(`${API_BASE.replace('/api','')}/api/auth/me`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return await res.json();
  } catch (err: any) {
    return { error: err?.message || 'Network error' };
  }
}

export async function fetchRecommendations(
  skills: string[],
  interests: string[],
  background?: string,
  currentField?: string
): Promise<RecommendationResponse> {
  const res = await fetch(`${API_BASE}/careers/recommend`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ skills, interests, background, currentField }),
  });
  if (!res.ok) throw new Error(`Failed to fetch recommendations: ${res.status}`);
  return res.json();
}

export async function fetchAllCareers(): Promise<CareerRecommendation[]> {
  const res = await fetch(`${API_BASE}/careers/all`);
  if (!res.ok) throw new Error(`Failed to fetch careers: ${res.status}`);
  const data = await res.json();
  return data.careers || [];
}

export async function fetchCareerById(
  id: string
): Promise<CareerRecommendation> {
  const res = await fetch(`${API_BASE}/careers/${id}`);
  if (!res.ok) throw new Error(`Career not found: ${res.status}`);
  const data = await res.json();
  return data.career;
}
