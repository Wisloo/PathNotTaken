const express = require("express");
const router = express.Router();
const db = require("../db");
const jwt = require("jsonwebtoken");
const { Configuration, OpenAIApi } = require("openai");

const JWT_SECRET = process.env.JWT_SECRET || "dev-secret-change-me";

function getUserIdFromAuth(req) {
  const auth = (req.headers.authorization || "").replace("Bearer ", "");
  if (!auth) return null;
  try {
    const p = jwt.verify(auth, JWT_SECRET);
    return p.sub;
  } catch (e) {
    return null;
  }
}

// POST /api/roadmaps  -> save roadmap, returns { id, url }
router.post("/", async (req, res) => {
  try {
    const { careerId, title, weeks } = req.body;
    if (!careerId || !weeks) return res.status(400).json({ error: "careerId and weeks are required" });

    const id = (Date.now().toString(36) + Math.random().toString(36).slice(2, 8)).toLowerCase();
    const createdAt = new Date().toISOString();
    const ownerId = getUserIdFromAuth(req);
    await db.run('INSERT INTO roadmaps (id,ownerId,careerId,title,weeks,createdAt) VALUES (?,?,?,?,?,?)', id, ownerId || null, careerId, title || null, JSON.stringify(weeks || []), createdAt);

    const base = process.env.FRONTEND_URL || "http://localhost:3001";
    return res.json({ success: true, id, url: `${base}/roadmap?share=${id}` });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Failed to save roadmap" });
  }
});

// GET /api/roadmaps/:id -> retrieve saved roadmap
router.get("/:id", async (req, res) => {
  try {
    const id = req.params.id;
    const row = await db.get('SELECT id,ownerId,careerId,title,weeks,createdAt FROM roadmaps WHERE id = ?', id);
    if (!row) return res.status(404).json({ error: "Not found" });
    row.weeks = JSON.parse(row.weeks || '[]');
    return res.json({ success: true, roadmap: row });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Failed to read roadmap" });
  }
});

// PUT /api/roadmaps/:id  -> update roadmap (owner only)
router.put("/:id", async (req, res) => {
  try {
    const id = req.params.id;
    const ownerId = getUserIdFromAuth(req);
    const row = await db.get('SELECT ownerId FROM roadmaps WHERE id = ?', id);
    if (!row) return res.status(404).json({ error: 'Not found' });
    if (row.ownerId && row.ownerId !== ownerId) return res.status(403).json({ error: 'forbidden' });

    const { title, weeks } = req.body;
    await db.run('UPDATE roadmaps SET title = ?, weeks = ? WHERE id = ?', title || null, JSON.stringify(weeks || []), id);
    return res.json({ success: true });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'update failed' });
  }
});

// DELETE /api/roadmaps/:id  -> delete (owner only)
router.delete("/:id", async (req, res) => {
  try {
    const id = req.params.id;
    const ownerId = getUserIdFromAuth(req);
    const row = await db.get('SELECT ownerId FROM roadmaps WHERE id = ?', id);
    if (!row) return res.status(404).json({ error: 'Not found' });
    if (row.ownerId && row.ownerId !== ownerId) return res.status(403).json({ error: 'forbidden' });

    await db.run('DELETE FROM roadmaps WHERE id = ?', id);
    return res.json({ success: true });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'delete failed' });
  }
});

// POST /api/roadmaps/:id/generate-tasks -> use LLM if available or fallback
router.post("/:id/generate-tasks", async (req, res) => {
  try {
    const id = req.params.id;
    const row = await db.get('SELECT id,careerId,title,weeks FROM roadmaps WHERE id = ?', id);
    if (!row) return res.status(404).json({ error: 'Not found' });
    const weeks = JSON.parse(row.weeks || '[]');
    const openaiKey = process.env.OPENAI_API_KEY;
    if (!openaiKey) {
      // fallback simple generator: append "(AI-suggestion)" to each week's first task
      const newWeeks = weeks.map((w) => w.map((t) => ({ ...t })));
      for (let i = 0; i < newWeeks.length; i++) {
        if (newWeeks[i][0]) newWeeks[i][0].title = `${newWeeks[i][0].title} (suggested)`;
      }
      // persist
      await db.run('UPDATE roadmaps SET weeks = ? WHERE id = ?', JSON.stringify(newWeeks), id);
      return res.json({ success: true, weeks: newWeeks });
    }

    const configuration = new Configuration({ apiKey: openaiKey });
    const client = new OpenAIApi(configuration);

    // build prompt using careerId and existing weeks
    const prompt = `You are an assistant generating 12-week learning tasks for the career ${row.careerId}. For each week produce 4 concise tasks (1-2 short phrases) — return JSON array of arrays of objects with id and title.`;
    const r = await client.createChatCompletion({ model: 'gpt-4o-mini', messages: [{ role: 'user', content: prompt }], max_tokens: 800 });
    const content = r.data.choices?.[0]?.message?.content || '';
    // try parse JSON from content
    let parsed = null;
    try { parsed = JSON.parse(content); } catch (e) { parsed = null; }
    if (!parsed) {
      // fallback: keep existing weeks
      return res.json({ success: false, error: 'LLM did not return JSON' });
    }

    // persist
    await db.run('UPDATE roadmaps SET weeks = ? WHERE id = ?', JSON.stringify(parsed), id);
    return res.json({ success: true, weeks: parsed });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'generate failed' });
  }
});

// GET /api/roadmaps/:id/ics -> download iCalendar with weekly tasks as events
router.get('/:id/ics', async (req, res) => {
  try {
    const id = req.params.id;
    const row = await db.get('SELECT id,careerId,title,weeks,createdAt FROM roadmaps WHERE id = ?', id);
    if (!row) return res.status(404).json({ error: 'Not found' });
    const weeks = JSON.parse(row.weeks || '[]');

    // build ICS (simple): each week's first task as an all-day event on consecutive days starting today
    const dtStart = new Date();
    let ics = 'BEGIN:VCALENDAR\nVERSION:2.0\nPRODID:-//PathNotTaken//EN\n';
    weeks.forEach((week, idx) => {
      const task = week[0];
      const date = new Date(dtStart.getTime() + idx * 7 * 24 * 60 * 60 * 1000);
      const dateStr = date.toISOString().slice(0,10).replace(/-/g,'');
      const uid = `${id}-${idx}@pathnotaken.local`;
      ics += `BEGIN:VEVENT\nUID:${uid}\nDTSTAMP:${new Date().toISOString().replace(/[-:]/g,'').split('.')[0]}Z\nDTSTART;VALUE=DATE:${dateStr}\nSUMMARY:${task.title}\nEND:VEVENT\n`;
    });
    ics += 'END:VCALENDAR';

    res.setHeader('Content-Disposition', `attachment; filename="roadmap-${id}.ics"`);
    res.setHeader('Content-Type', 'text/calendar');
    res.send(ics);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'ics failed' });
  }
});

module.exports = router;
