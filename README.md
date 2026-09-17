# Xoiom — Farhan Akhtar's Portfolio 🚀

A **full-stack** personal portfolio: a 3D glassmorphic React site, an Express API backend, and a
**private admin panel** that only the site owner can access.

![stack](https://img.shields.io/badge/React-18-61dafb) ![stack](https://img.shields.io/badge/Node-Express-339933)

## What's inside

- **Frontend** (`/` … `src/`) — React 18 + Vite, no heavy 3D libraries:
  - matte dark theme with film-grain finish, floating gradient orbs, subtle grid
  - glassmorphism panels (`backdrop-filter` blur + saturated glass)
  - real 3D: pointer-tilt cards with depth layers (`preserve-3d`, `perspective`)
  - scroll effects: reveal-on-scroll, animated skill bars, count-up stats, scroll progress bar,
    parallax orbs, active-section navbar — all respecting `prefers-reduced-motion`
- **Backend** (`server/`) — Express API:
  - `GET /api/site` — public content (profile, skills, projects, journey)
  - `POST /api/contact` — contact form messages (validated + rate-limited)
  - `POST /api/admin/login` — owner sign-in → JWT (bcrypt-hashed password, rate-limited)
  - Admin CRUD: profile, skills, projects, journey, message inbox, password change
  - Serves the built site from `dist/` too, so `npm start` = one process, one port
- **Admin panel** (`#/admin`) — only **you** can get in (your email + password, JWT-protected):
  - edit every piece of public content live
  - read/delete/mark contact messages
  - change your admin email & password

## Quick start (local)

```bash
npm install
cd server && npm install && cd ..

npm run build    # build the site into dist/
npm start        # API + site on http://localhost:3000
```

Or hot-reload development (Vite on :5173 with `/api` proxied to :3000):

```bash
npm run dev
```

Open **http://localhost:3000** — the admin panel is at **http://localhost:3000/#/admin**.

## 🔐 Admin credentials (defaults — CHANGE THESE)

| field    | value                 |
| -------- | --------------------- |
| Email    | `farhan@xoiom.dev`    |
| Password | `Farhan@Xoiom2026`    |

Change them in **Admin → Settings** after signing in, or set `ADMIN_EMAIL` / `ADMIN_PASSWORD`
environment variables before starting the API.

## Environment variables (API)

| variable         | default                     | purpose                          |
| ---------------- | --------------------------- | -------------------------------- |
| `PORT`           | `3000`                      | port to listen on                |
| `ADMIN_EMAIL`    | `farhan@xoiom.dev`          | admin sign-in email              |
| `ADMIN_PASSWORD` | `Farhan@Xoiom2026`          | admin sign-in password           |
| `JWT_SECRET`     | dev secret                  | **set a long random string**     |
| `CORS_ORIGIN`    | (all origins)               | e.g. your Pages site URL         |
| `SERVE_STATIC`   | auto (if `dist/` exists)    | `1`/`0` to force on/off          |

## Hosting

### Frontend → GitHub Pages (automatic)

`.github/workflows/deploy.yml` builds the site and deploys it to GitHub Pages on every push to
`main` (and the `arena/01a0a66d-xoiom` working branch). The repo name is the sub-path:
the site lives at `https://<you>.github.io/xoiom/`.
If you rename the repo, update `VITE_BASE` in the workflow.

> GitHub Pages serves **static files only** — it cannot run the Node backend.

### Backend → Render (free) / Railway / Fly.io

1. Push this repo, create a new web service on [Render](https://render.com):
   - **Root Directory:** `server`
   - **Build command:** `npm install`
   - **Start command:** `npm start`
2. Set env vars: `ADMIN_EMAIL`, `ADMIN_PASSWORD`, `JWT_SECRET`, and
   `CORS_ORIGIN=https://<you>.github.io`.
3. Point the site at your API — edit `public/config.js`:
   ```js
   window.XOIOM.apiBase = "https://your-api.onrender.com/api";
   ```
   then commit and push (the Pages workflow redeploys).

Until the API is connected, the site still works on GitHub Pages using built-in content, and the
contact form gracefully falls back to opening the visitor's mail app.

## Your photo 📷

Drop a portrait into `public/photo.jpg` (a 4:5 portrait looks best), commit and push — the hero
frame picks it up automatically. You can also paste any image URL in **Admin → Profile → Photo URL**.

## Project structure

```
├── index.html                 # app shell
├── vite.config.js             # dev proxy + Pages base path
├── public/
│   ├── config.js              # ← set your deployed API URL here
│   ├── favicon.svg
│   └── photo.jpg              # ← your portrait
├── src/
│   ├── main.jsx / App.jsx     # entry + hash router
│   ├── styles.css             # the whole 3D glass design system
│   ├── data/defaults.js       # built-in content + API seed
│   ├── lib/                   # api client, hooks (tilt/reveal/router)
│   ├── components/            # Navbar, Hero, About, Skills, Projects, …
│   ├── pages/Home.jsx
│   └── admin/                 # private admin panel (login + tabs)
├── server/
│   ├── index.js               # Express API + static serving
│   ├── lib/store.js           # JSON data store (server/data/db.json)
│   └── package.json
└── .github/workflows/deploy.yml
```

## Data & privacy notes

- Content + messages are stored in `server/data/db.json` (created on first run, git-ignored).
  On Render, attach a **disk** to persist data across redeploys, or keep the store in memory.
- Login is rate-limited (8 tries / 15 min per IP) and contact submissions (6 / 10 min per IP).
- Sessions are 12-hour JWTs kept in `localStorage` on the browser — sign out in the panel to clear.
