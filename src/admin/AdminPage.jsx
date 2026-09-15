import { useEffect, useState } from 'react';
import { api, getToken, setToken, isOfflineError } from '../lib/api.js';
import { useToast, Spinner } from '../components/ui.jsx';
import Orbs from '../components/Orbs.jsx';
import {
  OverviewTab,
  ProfileTab,
  SkillsTab,
  ProjectsTab,
  JourneyTab,
  MessagesTab,
  SettingsTab
} from './tabs.jsx';

const TABS = [
  ['overview', '📊', 'Overview'],
  ['profile', '👤', 'Profile'],
  ['skills', '⚡', 'Skills'],
  ['projects', '🚀', 'Projects'],
  ['journey', '🧭', 'Journey'],
  ['messages', '✉️', 'Messages'],
  ['settings', '⚙️', 'Settings']
];

function Login({ onLogin }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [show, setShow] = useState(false);
  const [error, setError] = useState('');
  const [offline, setOffline] = useState(false);
  const [busy, setBusy] = useState(false);

  async function submit(e) {
    e.preventDefault();
    setError('');
    setOffline(false);
    setBusy(true);
    try {
      const data = await api('/admin/login', { method: 'POST', body: { email, password } });
      setToken(data.token);
      onLogin(data);
    } catch (err) {
      if (err.status === 429) setError('Too many attempts — please wait a few minutes.');
      else if (err.status === 401) setError('Invalid email or password.');
      else if (isOfflineError(err)) setOffline(true);
      else setError(err.message || 'Login failed.');
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="admin-login-wrap">
      <div className="glass admin-login">
        <div className="admin-logo">
          <span className="brand-mark">FA</span>
          <span className="mono">xoiom / admin</span>
        </div>
        <h1>Admin sign in</h1>
        <p className="login-sub">This area is private — only the site owner can sign in.</p>
        <form onSubmit={submit} className="login-form">
          <label className="field">
            <span className="field-label">Email</span>
            <input
              className="input"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="owner@example.com"
              autoComplete="username"
              required
            />
          </label>
          <label className="field">
            <span className="field-label">Password</span>
            <span className="pw-wrap">
              <input
                className="input"
                type={show ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                autoComplete="current-password"
                required
              />
              <button type="button" className="pw-toggle mono" onClick={() => setShow((s) => !s)}>
                {show ? 'hide' : 'show'}
              </button>
            </span>
          </label>
          <button className="btn btn-primary" type="submit" disabled={busy}>
            {busy ? (
              <>
                <Spinner /> Signing in…
              </>
            ) : (
              'Sign in →'
            )}
          </button>
          {error ? <p className="form-error" role="alert">{error}</p> : null}
          {offline ? (
            <p className="form-hint mono" role="alert">
              • could not reach the backend — the admin panel needs the API deployed (see README)
            </p>
          ) : null}
        </form>
        <a className="back-link mono" href="#/">
          ← back to site
        </a>
      </div>
    </div>
  );
}

export default function AdminPage() {
  const [token, setTok] = useState(getToken());
  const [user, setUser] = useState(null);
  const [tab, setTab] = useState('overview');
  const toast = useToast();

  useEffect(() => {
    if (!token) {
      setUser(null);
      return undefined;
    }
    let alive = true;
    api('/admin/me', { auth: true })
      .then((d) => {
        if (alive) setUser(d);
      })
      .catch(() => {
        if (alive) {
          setToken(null);
          setTok(null);
        }
      });
    return () => {
      alive = false;
    };
  }, [token]);

  function logout() {
    setToken(null);
    setTok(null);
    setUser(null);
    setTab('overview');
    toast('Signed out', 'info');
  }

  if (!token) {
    return (
      <div className="admin">
        <Orbs />
        <Login
          onLogin={(d) => {
            setTok(d.token);
            setUser(d);
            toast(`Welcome back, ${d.email.split('@')[0]}!`, 'ok');
          }}
        />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="admin">
        <Orbs />
        <div className="admin-login-wrap">
          <div className="glass admin-loading">
            <Spinner className="lg" />
            <p className="mono">loading…</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="admin">
      <Orbs />
      <header className="admin-top glass">
        <div className="admin-brand">
          <span className="brand-mark">FA</span>
          <span className="mono">xoiom / admin</span>
        </div>
        <div className="admin-user">
          <span className="admin-email mono">{user.email}</span>
          <a className="btn btn-sm" href="#/">
            View site
          </a>
          <button className="btn btn-sm btn-danger" onClick={logout} type="button">
            Sign out
          </button>
        </div>
      </header>
      <div className="admin-shell">
        <nav className="admin-tabs glass" aria-label="Admin sections">
          {TABS.map(([id, ico, label]) => (
            <button
              key={id}
              type="button"
              className={`admin-tab ${tab === id ? 'active' : ''}`}
              onClick={() => setTab(id)}
            >
              <span className="admin-tab-ico" aria-hidden="true">{ico}</span>
              {label}
            </button>
          ))}
        </nav>
        <main className="admin-main">
          {tab === 'overview' ? <OverviewTab onNavigate={setTab} /> : null}
          {tab === 'profile' ? <ProfileTab /> : null}
          {tab === 'skills' ? <SkillsTab /> : null}
          {tab === 'projects' ? <ProjectsTab /> : null}
          {tab === 'journey' ? <JourneyTab /> : null}
          {tab === 'messages' ? <MessagesTab /> : null}
          {tab === 'settings' ? <SettingsTab /> : null}
        </main>
      </div>
    </div>
  );
}
