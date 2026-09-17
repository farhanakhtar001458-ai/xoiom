import express from 'express';
import cors from 'cors';
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { fileURLToPath } from 'node:url';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { loadStore, saveStore } from './lib/store.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const PORT = Number(process.env.PORT || 3000);
const JWT_SECRET = process.env.JWT_SECRET || 'xoiom-dev-secret-change-me-in-production';
const ADMIN_EMAIL = String(process.env.ADMIN_EMAIL || 'farhan@xoiom.dev').toLowerCase().trim();
const ADMIN_PASSWORD = String(process.env.ADMIN_PASSWORD || 'Farhan@Xoiom2026');
const DIST_DIR = path.resolve(__dirname, '..', 'dist');
const SERVE_STATIC = process.env.SERVE_STATIC
  ? process.env.SERVE_STATIC === '1'
  : fs.existsSync(path.join(DIST_DIR, 'index.html'));

const app = express();
app.disable('x-powered-by');
app.use(cors());
app.use(express.json({ limit: '1mb' }));

const store = loadStore({ email: ADMIN_EMAIL, password: ADMIN_PASSWORD });

/* ---------------- helpers ---------------- */

const ok = (res, data, status = 200) => res.status(status).json(data);
const fail = (res, status, error) => res.status(status).json({ error });
const persist = () => saveStore(store);
const str = (v, max = 500) => (typeof v === 'string' ? v.trim().slice(0, max) : '');
const ipOf = (req) => req.ip || (req.socket && req.socket.remoteAddress) || 'unknown';

/* tiny in-memory rate limiter (per IP per route) */
const buckets = new Map();
function isLimited(ip, key, max, windowMs) {
  const now = Date.now();
  const id = `${ip}:${key}`;
  const bucket = buckets.get(id);
  if (!bucket || now > bucket.resetAt) {
    buckets.set(id, { count: 1, resetAt: now + windowMs });
    return false;
  }
  bucket.count += 1;
  return bucket.count > max;
}
setInterval(() => {
  const now = Date.now();
  for (const [id, b] of buckets) if (now > b.resetAt) buckets.delete(id);
}, 60 * 60 * 1000).unref();

/* ---------------- auth ---------------- */

function requireAuth(req, res, next) {
  const header = req.headers.authorization || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : null;
  if (!token) return fail(res, 401, 'Authentication required.');
  try {
    const payload = jwt.verify(token, JWT_SECRET);
    if (payload.role !== 'admin') throw new Error('forbidden');
    req.user = payload;
    next();
  } catch {
    return fail(res, 401, 'Session expired. Please sign in again.');
  }
}

/* ---------------- public API ---------------- */

app.get('/api/health', (req, res) =>
  ok(res, { ok: true, service: 'xoiom-api', time: new Date().toISOString() })
);

app.get('/api/site', (req, res) =>
  ok(res, {
    profile: store.profile,
    skills: store.skills,
    projects: store.projects,
    journey: store.journey
  })
);

app.post('/api/contact', (req, res) => {
  if (isLimited(ipOf(req), 'contact', 6, 10 * 60 * 1000)) {
    return fail(res, 429, 'Too many messages from this connection. Please try again later.');
  }
  const body = req.body || {};
  const name = str(body.name, 100);
  const email = str(body.email, 200);
  const message = str(body.message, 2000);
  if (name.length < 2) return fail(res, 400, 'Please provide your name (at least 2 characters).');
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) {
    return fail(res, 400, 'Please provide a valid email address.');
  }
  if (message.length < 5) return fail(res, 400, 'Please write a message of at least 5 characters.');
  const msg = {
    id: crypto.randomUUID(),
    name,
    email,
    message,
    read: false,
    createdAt: new Date().toISOString()
  };
  store.messages.unshift(msg);
  if (store.messages.length > 300) store.messages.length = 300;
  persist();
  return ok(res, { ok: true, id: msg.id }, 201);
});

/* ---------------- admin auth ---------------- */

app.post('/api/admin/login', (req, res) => {
  if (isLimited(ipOf(req), 'login', 8, 15 * 60 * 1000)) {
    return fail(res, 429, 'Too many login attempts. Please wait a few minutes and try again.');
  }
  const body = req.body || {};
  const email = str(body.email, 200).toLowerCase();
  const password = typeof body.password === 'string' ? body.password : '';
  if (!email || !password) return fail(res, 400, 'Email and password are required.');
  const auth = store.auth;
  const valid = email === auth.email && bcrypt.compareSync(password, auth.passwordHash);
  if (!valid) return fail(res, 401, 'Invalid email or password.');
  const token = jwt.sign({ sub: auth.email, role: 'admin' }, JWT_SECRET, { expiresIn: '12h' });
  return ok(res, { token, name: store.profile.name, email: auth.email });
});

app.get('/api/admin/me', requireAuth, (req, res) =>
  ok(res, { email: req.user.sub, name: store.profile.name })
);

/* ---------------- admin content ---------------- */

app.get('/api/admin/site', requireAuth, (req, res) =>
  ok(res, {
    profile: store.profile,
    skills: store.skills,
    projects: store.projects,
    journey: store.journey
  })
);

app.put('/api/admin/profile', requireAuth, (req, res) => {
  const p = store.profile;
  const b = req.body || {};
  if (typeof b.name === 'string' && b.name.trim().length >= 2) {
    p.name = b.name.trim().slice(0, 80);
  }
  const fields = { tagline: 160, role: 100, location: 100, college: 100, branch: 120 };
  Object.keys(fields).forEach((f) => {
    if (typeof b[f] === 'string') p[f] = b[f].trim().slice(0, fields[f]);
  });
  if (typeof b.email === 'string' && b.email.trim()) p.email = b.email.trim().slice(0, 120);
  if (typeof b.photo === 'string') p.photo = b.photo.trim().slice(0, 500);
  if (Array.isArray(b.about)) {
    p.about = b.about
      .filter((x) => typeof x === 'string' && x.trim())
      .map((x) => x.trim())
      .slice(0, 8);
  }
  if (Array.isArray(b.stats)) {
    p.stats = b.stats
      .slice(0, 6)
      .map((s) => ({
        label: str(s && s.label, 40) || 'Stat',
        value: Math.max(0, Math.round(Number(s && s.value) || 0))
      }));
  }
  if (b.socials && typeof b.socials === 'object') {
    ['github', 'linkedin', 'twitter', 'website'].forEach((k) => {
      if (typeof b.socials[k] === 'string') p.socials[k] = b.socials[k].trim().slice(0, 300);
    });
  }
  persist();
  return ok(res, { ok: true, profile: p });
});

app.put('/api/admin/skills', requireAuth, (req, res) => {
  const list = req.body && req.body.skills;
  if (!Array.isArray(list)) return fail(res, 400, 'skills must be an array.');
  const icons = ['code', 'brain', 'globe', 'wrench', 'spark', 'star', 'book'];
  const clean = list.slice(0, 8).map((g) => ({
    id: str(g && g.id, 40) || crypto.randomUUID(),
    name: str(g && g.name, 60) || 'Skills',
    icon: icons.includes(g && g.icon) ? g.icon : 'star',
    items: (Array.isArray(g && g.items) ? g.items : []).slice(0, 12).map((it) => ({
      name: str(it && it.name, 40) || 'Skill',
      level: Math.max(0, Math.min(100, Math.round(Number(it && it.level) || 0)))
    }))
  }));
  store.skills = clean;
  persist();
  return ok(res, { ok: true, skills: clean });
});

/* projects CRUD */
function cleanProject(b, existing = {}) {
  b = b || {};
  return {
    id: str(existing.id, 40) || str(b.id, 40) || crypto.randomUUID(),
    title: str(b.title, 100) || existing.title || 'Untitled project',
    desc: str(b.desc, 400) || existing.desc || '',
    tags: Array.isArray(b.tags) ? b.tags.map((t) => str(t, 24)).filter(Boolean).slice(0, 6) : existing.tags || [],
    link: str(b.link, 300) || existing.link || '',
    repo: str(b.repo, 300) || existing.repo || '',
    featured: b.featured === true || existing.featured === true
  };
}

app.get('/api/admin/projects', requireAuth, (req, res) => ok(res, { projects: store.projects }));

app.post('/api/admin/projects', requireAuth, (req, res) => {
  if (!str((req.body || {}).title, 100)) return fail(res, 400, 'A project title is required.');
  const project = cleanProject(req.body);
  store.projects.unshift(project);
  persist();
  return ok(res, { ok: true, project }, 201);
});

app.put('/api/admin/projects/:id', requireAuth, (req, res) => {
  const idx = store.projects.findIndex((p) => p.id === req.params.id);
  if (idx < 0) return fail(res, 404, 'Project not found.');
  store.projects[idx] = cleanProject(req.body, store.projects[idx]);
  persist();
  return ok(res, { ok: true, project: store.projects[idx] });
});

app.delete('/api/admin/projects/:id', requireAuth, (req, res) => {
  const idx = store.projects.findIndex((p) => p.id === req.params.id);
  if (idx < 0) return fail(res, 404, 'Project not found.');
  store.projects.splice(idx, 1);
  persist();
  return ok(res, { ok: true });
});

/* journey */
const KINDS = ['study', 'work', 'build', 'life'];
function cleanJourney(list) {
  if (!Array.isArray(list)) return null;
  return list.slice(0, 12).map((j) => ({
    id: str(j && j.id, 40) || crypto.randomUUID(),
    kind: KINDS.includes(j && j.kind) ? j.kind : 'life',
    title: str(j && j.title, 120) || 'Milestone',
    org: str(j && j.org, 120),
    period: str(j && j.period, 60),
    desc: str(j && j.desc, 400)
  }));
}

app.get('/api/admin/journey', requireAuth, (req, res) => ok(res, { journey: store.journey }));

app.put('/api/admin/journey', requireAuth, (req, res) => {
  const clean = cleanJourney(req.body && req.body.journey);
  if (!clean) return fail(res, 400, 'journey must be an array.');
  store.journey = clean;
  persist();
  return ok(res, { ok: true, journey: clean });
});

/* messages */
app.get('/api/admin/messages', requireAuth, (req, res) => ok(res, { messages: store.messages }));

app.post('/api/admin/messages/read-all', requireAuth, (req, res) => {
  store.messages.forEach((m) => {
    m.read = true;
  });
  persist();
  return ok(res, { ok: true });
});

app.patch('/api/admin/messages/:id', requireAuth, (req, res) => {
  const msg = store.messages.find((m) => m.id === req.params.id);
  if (!msg) return fail(res, 404, 'Message not found.');
  if (req.body && typeof req.body.read === 'boolean') msg.read = req.body.read;
  persist();
  return ok(res, { ok: true, message: msg });
});

app.delete('/api/admin/messages/:id', requireAuth, (req, res) => {
  const idx = store.messages.findIndex((m) => m.id === req.params.id);
  if (idx < 0) return fail(res, 404, 'Message not found.');
  store.messages.splice(idx, 1);
  persist();
  return ok(res, { ok: true });
});

/* account */
app.put('/api/admin/account', requireAuth, (req, res) => {
  const b = req.body || {};
  const current = typeof b.currentPassword === 'string' ? b.currentPassword : '';
  if (!bcrypt.compareSync(current, store.auth.passwordHash)) {
    return fail(res, 401, 'Current password is incorrect.');
  }
  if (b.newPassword) {
    if (String(b.newPassword).length < 8) {
      return fail(res, 400, 'New password must be at least 8 characters.');
    }
    store.auth.passwordHash = bcrypt.hashSync(String(b.newPassword), 10);
  }
  if (typeof b.email === 'string' && /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(b.email.trim())) {
    store.auth.email = b.email.trim().toLowerCase();
  }
  persist();
  return ok(res, { ok: true, email: store.auth.email });
});

/* ---------------- API 404 ---------------- */
app.use('/api', (req, res) => fail(res, 404, 'Not found'));

/* ---------------- static site (serves the Vite build, if present) ---------------- */
if (SERVE_STATIC) {
  app.use(express.static(DIST_DIR));
  app.use((req, res, next) => {
    if (req.method === 'GET' && !req.path.startsWith('/api/')) {
      return res.sendFile(path.join(DIST_DIR, 'index.html'));
    }
    next();
  });
}

/* ---------------- error handler ---------------- */
app.use((err, req, res, next) => {
  if (res.headersSent) return next(err);
  if (err && err.type === 'entity.parse.failed') return fail(res, 400, 'Invalid JSON body.');
  console.error('[xoiom-api] error:', err);
  return fail(res, 500, 'Internal server error.');
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`[xoiom-api] listening on http://0.0.0.0:${PORT}`);
  console.log(
    `[xoiom-api] static site: ${SERVE_STATIC ? 'on (' + DIST_DIR + ')' : 'off (run "npm run build" first, or use the Vite dev server)'}`
  );
  console.log(`[xoiom-api] admin login email: ${ADMIN_EMAIL}`);
});
