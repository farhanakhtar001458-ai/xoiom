import { useCallback, useEffect, useState } from 'react';
import { api, setToken } from '../lib/api.js';
import { Spinner, useToast } from '../components/ui.jsx';

/* ---------------- shared bits ---------------- */

function Card({ title, sub, actions, children }) {
  return (
    <section className="admin-card glass">
      {title ? (
        <div className="admin-card-head">
          <div>
            <h3>{title}</h3>
            {sub ? <p className="admin-card-sub">{sub}</p> : null}
          </div>
          {actions ? <div className="admin-card-actions">{actions}</div> : null}
        </div>
      ) : null}
      {children}
    </section>
  );
}

function Labeled({ label, hint, children }) {
  return (
    <label className="field">
      <span className="field-label">{label}</span>
      {children}
      {hint ? <span className="field-hint mono">{hint}</span> : null}
    </label>
  );
}

function useData(path) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      setData(await api(path, { auth: true }));
    } catch (err) {
      setError(
        err.status === 401
          ? 'Session expired — please sign in again.'
          : err.message || 'Failed to load data.'
      );
    } finally {
      setLoading(false);
    }
  }, [path]);

  useEffect(() => {
    load();
  }, [load]);

  return { data, setData, loading, error, reload: load };
}

function Loading() {
  return (
    <div className="admin-card glass admin-loading">
      <Spinner className="lg" />
      <p className="mono">loading…</p>
    </div>
  );
}

function ErrorNote({ message, onRetry }) {
  return (
    <div className="admin-card glass error-note">
      <p>⚠️ {message}</p>
      {onRetry ? (
        <button className="btn btn-sm" onClick={onRetry} type="button">
          Retry
        </button>
      ) : null}
    </div>
  );
}

function fmtDate(iso) {
  try {
    return new Date(iso).toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' });
  } catch {
    return iso;
  }
}

/* ---------------- overview ---------------- */

export function OverviewTab({ onNavigate }) {
  const [site, setSite] = useState(null);
  const [msgs, setMsgs] = useState(null);
  const [err, setErr] = useState('');

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const [s, m] = await Promise.all([
          api('/admin/site', { auth: true }),
          api('/admin/messages', { auth: true })
        ]);
        if (!alive) return;
        setSite(s);
        setMsgs(m.messages || []);
      } catch (e) {
        if (alive) setErr(e.message);
      }
    })();
    return () => {
      alive = false;
    };
  }, []);

  if (err) return <ErrorNote message={err} />;
  if (!site || !msgs) return <Loading />;

  const unread = msgs.filter((m) => !m.read).length;
  const cards = [
    ['✉️', msgs.length, 'messages received', () => onNavigate('messages')],
    ['🔵', unread, 'unread messages', () => onNavigate('messages')],
    ['🚀', site.projects.length, 'live projects', () => onNavigate('projects')],
    ['⚡', site.skills.length, 'skill groups', () => onNavigate('skills')]
  ];

  return (
    <div className="admin-stack">
      <Card title="Dashboard" sub="Everything about your site, at a glance.">
        <div className="dash-grid">
          {cards.map(([ico, num, label, go]) => (
            <button key={label} className="dash-card" onClick={go} type="button">
              <span className="dash-ico" aria-hidden="true">{ico}</span>
              <span className="dash-num grad-text">{num}</span>
              <span className="dash-label">{label}</span>
            </button>
          ))}
        </div>
      </Card>
      <Card title="Latest messages" sub="The most recent visitors who contacted you.">
        {msgs.length === 0 ? (
          <p className="empty-note">No messages yet. Share your site link — they'll show up here. 🚀</p>
        ) : (
          <ul className="mini-msgs">
            {msgs.slice(0, 4).map((m) => (
              <li key={m.id} className="mini-msg">
                <span className={`mini-dot ${m.read ? '' : 'unread'}`} aria-hidden="true" />
                <strong>{m.name}</strong>
                <span className="mono dim">{fmtDate(m.createdAt)}</span>
                <p>{m.message.length > 90 ? `${m.message.slice(0, 90)}…` : m.message}</p>
              </li>
            ))}
          </ul>
        )}
      </Card>
      <Card
        title="Content is live"
        sub="Changes you save here appear on the public site immediately."
      >
        <div className="tip-row">
          <span aria-hidden="true">💡</span>
          <p>
            The public site reads from this API. If the site is hosted on GitHub Pages and the API
            is hosted elsewhere, set <code className="mono">window.XOIOM.apiBase</code> in{' '}
            <code className="mono">public/config.js</code> to your deployed API URL, then commit
            and push.
          </p>
        </div>
      </Card>
    </div>
  );
}

/* ---------------- profile ---------------- */

export function ProfileTab() {
  const toast = useToast();
  const { data, setData, loading, error, reload } = useData('/admin/site');
  const [form, setForm] = useState(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (data && !form) {
      const p = data.profile;
      setForm({
        name: p.name || '',
        tagline: p.tagline || '',
        role: p.role || '',
        location: p.location || '',
        college: p.college || '',
        branch: p.branch || '',
        email: p.email || '',
        photo: p.photo || '',
        about: (p.about || []).join('\n\n'),
        github: (p.socials && p.socials.github) || '',
        linkedin: (p.socials && p.socials.linkedin) || '',
        twitter: (p.socials && p.socials.twitter) || '',
        stats: (p.stats || []).map((s) => ({ label: s.label || '', value: String(s.value) }))
      });
    }
  }, [data, form]);

  if (loading || !form) return <Loading />;
  if (error) return <ErrorNote message={error} onRetry={reload} />;

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));
  const setStat = (i, k) => (e) =>
    setForm((f) => ({
      ...f,
      stats: f.stats.map((s, j) => (j === i ? { ...s, [k]: e.target.value } : s))
    }));

  async function save(e) {
    e.preventDefault();
    setSaving(true);
    try {
      const body = {
        name: form.name,
        tagline: form.tagline,
        role: form.role,
        location: form.location,
        college: form.college,
        branch: form.branch,
        email: form.email,
        photo: form.photo,
        about: form.about
          .split(/\n{2,}/)
          .map((s) => s.trim())
          .filter(Boolean),
        socials: { github: form.github, linkedin: form.linkedin, twitter: form.twitter },
        stats: form.stats.map((s) => ({ label: s.label, value: Number(s.value) || 0 }))
      };
      const res = await api('/admin/profile', { auth: true, method: 'PUT', body });
      setData((d) => ({ ...d, profile: res.profile }));
      toast('Profile saved — live on the site', 'ok');
    } catch (err) {
      toast(err.message, 'err');
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={save} className="admin-stack">
      <Card title="Profile & About" sub="Shown on the hero, about and contact sections.">
        <div className="form-grid">
          <Labeled label="Full name">
            <input className="input" value={form.name} onChange={set('name')} required />
          </Labeled>
          <Labeled label="Tagline">
            <input className="input" value={form.tagline} onChange={set('tagline')} />
          </Labeled>
          <Labeled label="Role / headline">
            <input className="input" value={form.role} onChange={set('role')} />
          </Labeled>
          <Labeled label="Location">
            <input className="input" value={form.location} onChange={set('location')} />
          </Labeled>
          <Labeled label="College">
            <input className="input" value={form.college} onChange={set('college')} />
          </Labeled>
          <Labeled label="Branch">
            <input className="input" value={form.branch} onChange={set('branch')} />
          </Labeled>
          <Labeled label="Contact email">
            <input className="input" type="email" value={form.email} onChange={set('email')} />
          </Labeled>
          <Labeled label="Photo URL" hint="leave empty to use the built-in photo (public/photo.jpg)">
            <input className="input" value={form.photo} onChange={set('photo')} placeholder="https://…" />
          </Labeled>
        </div>
        <Labeled label="About paragraphs" hint="separate paragraphs with a blank line">
          <textarea className="input textarea" rows={7} value={form.about} onChange={set('about')} />
        </Labeled>

        <h4 className="subhead">Stats</h4>
        <div className="stats-edit">
          {form.stats.map((s, i) => (
            <div className="stat-edit" key={i}>
              <input className="input" value={s.label} onChange={setStat(i, 'label')} placeholder="Label" />
              <input className="input" type="number" value={s.value} onChange={setStat(i, 'value')} placeholder="Value" />
            </div>
          ))}
        </div>

        <h4 className="subhead">Social links</h4>
        <div className="form-grid">
          <Labeled label="GitHub">
            <input className="input" value={form.github} onChange={set('github')} placeholder="https://github.com/…" />
          </Labeled>
          <Labeled label="LinkedIn">
            <input className="input" value={form.linkedin} onChange={set('linkedin')} placeholder="https://linkedin.com/in/…" />
          </Labeled>
          <Labeled label="Twitter / X">
            <input className="input" value={form.twitter} onChange={set('twitter')} placeholder="https://x.com/…" />
          </Labeled>
        </div>
      </Card>
      <div className="admin-actions">
        <button className="btn btn-primary" type="submit" disabled={saving}>
          {saving ? (
            <>
              <Spinner /> Saving…
            </>
          ) : (
            'Save changes'
          )}
        </button>
      </div>
    </form>
  );
}

/* ---------------- skills ---------------- */

export function SkillsTab() {
  const toast = useToast();
  const { data, loading, error, reload } = useData('/admin/site');
  const [groups, setGroups] = useState(null);

  useEffect(() => {
    if (data && !groups) {
      setGroups((data.skills || []).map((g) => ({ ...g, items: (g.items || []).map((i) => ({ ...i })) })));
    }
  }, [data, groups]);

  if (loading || !groups) return <Loading />;
  if (error) return <ErrorNote message={error} onRetry={reload} />;

  const patchGroup = (gi, patch) =>
    setGroups((gs) => gs.map((g, i) => (i === gi ? { ...g, ...patch } : g)));
  const patchItem = (gi, ii, patch) =>
    setGroups((gs) =>
      gs.map((g, i) =>
        i === gi ? { ...g, items: g.items.map((it, j) => (j === ii ? { ...it, ...patch } : it)) } : g
      )
    );
  const addGroup = () =>
    setGroups((gs) => [
      ...gs,
      { id: `g${Date.now()}`, name: 'New group', icon: 'star', items: [{ name: 'New skill', level: 70 }] }
    ]);
  const removeGroup = (gi) => setGroups((gs) => gs.filter((_, i) => i !== gi));
  const addItem = (gi) =>
    setGroups((gs) =>
      gs.map((g, i) => (i === gi ? { ...g, items: [...g.items, { name: 'New skill', level: 70 }] } : g))
    );
  const removeItem = (gi, ii) =>
    setGroups((gs) =>
      gs.map((g, i) => (i === gi ? { ...g, items: g.items.filter((_, j) => j !== ii) } : g))
    );

  async function save(e) {
    e.preventDefault();
    try {
      const res = await api('/admin/skills', { auth: true, method: 'PUT', body: { skills: groups } });
      setGroups(res.skills);
      toast('Skills saved — live on the site', 'ok');
    } catch (err) {
      toast(err.message, 'err');
    }
  }

  return (
    <form onSubmit={save} className="admin-stack">
      <Card
        title="Skill groups"
        sub="Edit names, drag the levels, add or remove — then save."
        actions={
          <button type="button" className="btn btn-sm" onClick={addGroup}>
            + Add group
          </button>
        }
      >
        {groups.map((g, gi) => (
          <div className="skill-edit" key={g.id || gi}>
            <div className="skill-edit-head">
              <input className="input" value={g.name} onChange={(e) => patchGroup(gi, { name: e.target.value })} />
              <select className="input sel" value={g.icon} onChange={(e) => patchGroup(gi, { icon: e.target.value })}>
                {['star', 'code', 'brain', 'globe', 'wrench', 'spark', 'book'].map((ic) => (
                  <option key={ic} value={ic}>
                    {ic}
                  </option>
                ))}
              </select>
              <button type="button" className="btn btn-sm btn-danger" onClick={() => removeGroup(gi)}>
                Remove
              </button>
            </div>
            {g.items.map((it, ii) => (
              <div className="skill-item-edit" key={ii}>
                <input className="input" value={it.name} onChange={(e) => patchItem(gi, ii, { name: e.target.value })} />
                <input
                  className="range"
                  type="range"
                  min="0"
                  max="100"
                  value={it.level}
                  onChange={(e) => patchItem(gi, ii, { level: Number(e.target.value) })}
                  aria-label={`${it.name} level`}
                />
                <span className="mono range-val">{it.level}</span>
                <button type="button" className="btn btn-sm btn-danger" onClick={() => removeItem(gi, ii)} aria-label={`Remove ${it.name}`}>
                  ✕
                </button>
              </div>
            ))}
            <button type="button" className="btn btn-sm" onClick={() => addItem(gi)}>
              + Add skill
            </button>
          </div>
        ))}
      </Card>
      <div className="admin-actions">
        <button className="btn btn-primary" type="submit">
          Save skills
        </button>
      </div>
    </form>
  );
}

/* ---------------- projects ---------------- */

function ProjectForm({ project, onDone }) {
  const toast = useToast();
  const [form, setForm] = useState({
    title: project ? project.title : '',
    desc: project ? project.desc : '',
    tags: (project && project.tags) ? project.tags.join(', ') : '',
    link: project ? project.link : '',
    repo: project ? project.repo : '',
    featured: !!(project && project.featured)
  });
  const [busy, setBusy] = useState(false);
  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  async function save(e) {
    e.preventDefault();
    setBusy(true);
    try {
      const body = {
        title: form.title,
        desc: form.desc,
        link: form.link,
        repo: form.repo,
        featured: form.featured,
        tags: form.tags
          .split(',')
          .map((t) => t.trim())
          .filter(Boolean)
      };
      if (project) {
        await api(`/admin/projects/${project.id}`, { auth: true, method: 'PUT', body });
        toast('Project updated', 'ok');
      } else {
        await api('/admin/projects', { auth: true, method: 'POST', body });
        toast('Project added', 'ok');
      }
      onDone();
    } catch (err) {
      toast(err.message, 'err');
    } finally {
      setBusy(false);
    }
  }

  return (
    <Card title={project ? 'Edit project' : 'New project'}>
      <form onSubmit={save} className="form-grid">
        <Labeled label="Title">
          <input className="input" value={form.title} onChange={set('title')} required />
        </Labeled>
        <Labeled label="Tags" hint="comma separated">
          <input className="input" value={form.tags} onChange={set('tags')} placeholder="React, Python, ML" />
        </Labeled>
        <Labeled label="Description">
          <textarea className="input textarea" rows={3} value={form.desc} onChange={set('desc')} />
        </Labeled>
        <Labeled label="Live link">
          <input className="input" value={form.link} onChange={set('link')} placeholder="https://…" />
        </Labeled>
        <Labeled label="Repository link">
          <input className="input" value={form.repo} onChange={set('repo')} placeholder="https://github.com/…" />
        </Labeled>
        <label className="check">
          <input
            type="checkbox"
            checked={form.featured}
            onChange={(e) => setForm((f) => ({ ...f, featured: e.target.checked }))}
          />
          <span>Featured project</span>
        </label>
        <div className="admin-actions">
          <button className="btn btn-primary" type="submit" disabled={busy}>
            {busy ? (
              <>
                <Spinner /> Saving…
              </>
            ) : (
              'Save project'
            )}
          </button>
          <button type="button" className="btn" onClick={onDone}>
            Cancel
          </button>
        </div>
      </form>
    </Card>
  );
}

export function ProjectsTab() {
  const toast = useToast();
  const { data, loading, error, reload } = useData('/admin/projects');
  const [editing, setEditing] = useState(null); // null | 'new' | project

  if (loading) return <Loading />;
  if (error) return <ErrorNote message={error} onRetry={reload} />;
  const projects = data.projects || [];

  async function remove(p) {
    if (!window.confirm(`Delete "${p.title}"?`)) return;
    try {
      await api(`/admin/projects/${p.id}`, { auth: true, method: 'DELETE' });
      toast('Project deleted', 'ok');
      reload();
    } catch (err) {
      toast(err.message, 'err');
    }
  }

  return (
    <div className="admin-stack">
      <Card
        title="Projects"
        sub="Shown on the projects section of your site."
        actions={
          <button className="btn btn-sm" onClick={() => setEditing('new')} type="button">
            + New project
          </button>
        }
      >
        {projects.length === 0 ? (
          <p className="empty-note">No projects yet — add your first one!</p>
        ) : (
          <ul className="proj-list">
            {projects.map((p) => (
              <li key={p.id} className="proj-row">
                <div className="proj-row-main">
                  <strong>
                    {p.title} {p.featured ? <span className="mini-badge">★</span> : null}
                  </strong>
                  <p>{p.desc}</p>
                  <span className="tags">
                    {(p.tags || []).map((t) => (
                      <span key={t} className="tag mono">{t}</span>
                    ))}
                  </span>
                </div>
                <div className="proj-row-actions">
                  <button className="btn btn-sm" onClick={() => setEditing(p)} type="button">
                    Edit
                  </button>
                  <button className="btn btn-sm btn-danger" onClick={() => remove(p)} type="button">
                    Delete
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </Card>
      {editing ? (
        <ProjectForm project={editing === 'new' ? null : editing} onDone={() => { setEditing(null); reload(); }} />
      ) : null}
    </div>
  );
}

/* ---------------- journey ---------------- */

export function JourneyTab() {
  const toast = useToast();
  const { data, loading, error, reload } = useData('/admin/journey');
  const [items, setItems] = useState(null);

  useEffect(() => {
    if (data && !items) setItems((data.journey || []).map((j) => ({ ...j })));
  }, [data, items]);

  if (loading || !items) return <Loading />;
  if (error) return <ErrorNote message={error} onRetry={reload} />;

  const patch = (i, key, value) =>
    setItems((arr) => arr.map((j, idx) => (idx === i ? { ...j, [key]: value } : j)));
  const add = () =>
    setItems((arr) => [
      ...arr,
      { id: `j${Date.now()}`, kind: 'study', title: 'New milestone', org: '', period: '', desc: '' }
    ]);
  const remove = (i) => setItems((arr) => arr.filter((_, idx) => idx !== i));

  async function save(e) {
    e.preventDefault();
    try {
      const res = await api('/admin/journey', { auth: true, method: 'PUT', body: { journey: items } });
      setItems(res.journey);
      toast('Journey saved — live on the site', 'ok');
    } catch (err) {
      toast(err.message, 'err');
    }
  }

  return (
    <form onSubmit={save} className="admin-stack">
      <Card
        title="Journey timeline"
        sub="Milestones shown on the Journey section. Top to bottom = oldest to newest feel."
        actions={
          <button type="button" className="btn btn-sm" onClick={add}>
            + Add milestone
          </button>
        }
      >
        {items.map((j, i) => (
          <div className="skill-edit" key={j.id || i}>
            <div className="skill-edit-head">
              <select className="input sel" value={j.kind} onChange={(e) => patch(i, 'kind', e.target.value)}>
                <option value="study">🎓 Study</option>
                <option value="work">💼 Work</option>
                <option value="build">🛠️ Building</option>
                <option value="life">🌱 Life</option>
              </select>
              <input
                className="input"
                value={j.period}
                onChange={(e) => patch(i, 'period', e.target.value)}
                placeholder="2024 — Present"
              />
              <button type="button" className="btn btn-sm btn-danger" onClick={() => remove(i)}>
                Remove
              </button>
            </div>
            <div className="journey-row">
              <input className="input" value={j.title} onChange={(e) => patch(i, 'title', e.target.value)} placeholder="Title" />
              <input className="input" value={j.org} onChange={(e) => patch(i, 'org', e.target.value)} placeholder="Org / place" />
            </div>
            <textarea
              className="input textarea"
              rows={2}
              value={j.desc}
              onChange={(e) => patch(i, 'desc', e.target.value)}
              placeholder="Short description"
            />
          </div>
        ))}
      </Card>
      <div className="admin-actions">
        <button className="btn btn-primary" type="submit">
          Save journey
        </button>
      </div>
    </form>
  );
}

/* ---------------- messages ---------------- */

export function MessagesTab() {
  const toast = useToast();
  const { data, loading, error, reload } = useData('/admin/messages');

  if (loading) return <Loading />;
  if (error) return <ErrorNote message={error} onRetry={reload} />;
  const messages = data.messages || [];

  async function toggle(m) {
    try {
      await api(`/admin/messages/${m.id}`, { auth: true, method: 'PATCH', body: { read: !m.read } });
      reload();
    } catch (err) {
      toast(err.message, 'err');
    }
  }

  async function del(m) {
    if (!window.confirm(`Delete the message from ${m.name}?`)) return;
    try {
      await api(`/admin/messages/${m.id}`, { auth: true, method: 'DELETE' });
      toast('Message deleted', 'ok');
      reload();
    } catch (err) {
      toast(err.message, 'err');
    }
  }

  async function readAll() {
    try {
      await api('/admin/messages/read-all', { auth: true, method: 'POST' });
      toast('All messages marked as read', 'ok');
      reload();
    } catch (err) {
      toast(err.message, 'err');
    }
  }

  return (
    <div className="admin-stack">
      <Card
        title="Messages"
        sub={`${messages.length} total · ${messages.filter((m) => !m.read).length} unread`}
        actions={
          messages.some((m) => !m.read) ? (
            <button className="btn btn-sm" onClick={readAll} type="button">
              Mark all read
            </button>
          ) : null
        }
      >
        {messages.length === 0 ? (
          <p className="empty-note">Inbox zero. Messages from the contact form will land here. ✉️</p>
        ) : (
          <ul className="msg-list">
            {messages.map((m) => (
              <li key={m.id} className={`msg-item ${m.read ? '' : 'unread'}`}>
                <div className="msg-head">
                  <span className={`mini-dot ${m.read ? '' : 'unread'}`} aria-hidden="true" />
                  <strong>{m.name}</strong>
                  <a className="mono dim" href={`mailto:${m.email}`}>
                    {m.email}
                  </a>
                  <span className="mono dim">{fmtDate(m.createdAt)}</span>
                </div>
                <p className="msg-body">{m.message}</p>
                <div className="msg-actions">
                  <button className="btn btn-sm" onClick={() => toggle(m)} type="button">
                    {m.read ? 'Mark unread' : 'Mark read'}
                  </button>
                  <button className="btn btn-sm btn-danger" onClick={() => del(m)} type="button">
                    Delete
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </Card>
    </div>
  );
}

/* ---------------- settings ---------------- */

export function SettingsTab() {
  const toast = useToast();
  const [form, setForm] = useState({ current: '', next: '', confirm: '', email: '' });
  const [busy, setBusy] = useState(false);
  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  async function save(e) {
    e.preventDefault();
    if (form.next && form.next.length < 8) {
      toast('New password must be at least 8 characters', 'err');
      return;
    }
    if (form.next && form.next !== form.confirm) {
      toast('New password and confirmation do not match', 'err');
      return;
    }
    setBusy(true);
    try {
      await api('/admin/account', {
        auth: true,
        method: 'PUT',
        body: {
          currentPassword: form.current,
          newPassword: form.next || undefined,
          email: form.email || undefined
        }
      });
      setToken(null); // force re-login with the (possibly) updated credentials
      toast('Settings saved — please sign in again', 'ok');
    } catch (err) {
      toast(err.message, 'err');
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="admin-stack">
      <Card title="Sign in" sub="Update your admin email or password. You'll be signed out after saving.">
        <form onSubmit={save} className="form-grid">
          <Labeled label="Current password">
            <input className="input" type="password" value={form.current} onChange={set('current')} required autoComplete="current-password" />
          </Labeled>
          <Labeled label="New email (optional)">
            <input className="input" type="email" value={form.email} onChange={set('email')} placeholder="keep current to skip" />
          </Labeled>
          <Labeled label="New password (optional)">
            <input className="input" type="password" value={form.next} onChange={set('next')} autoComplete="new-password" />
          </Labeled>
          <Labeled label="Confirm new password">
            <input className="input" type="password" value={form.confirm} onChange={set('confirm')} autoComplete="new-password" />
          </Labeled>
          <div className="admin-actions">
            <button className="btn btn-primary" type="submit" disabled={busy}>
              {busy ? (
                <>
                  <Spinner /> Saving…
                </>
              ) : (
                'Save settings'
              )}
            </button>
          </div>
        </form>
      </Card>
      <Card
        title="Deployment environment"
        sub="If you host the API on Render or similar, set these environment variables there."
      >
        <table className="env-table mono">
          <tbody>
            <tr>
              <td>ADMIN_EMAIL</td>
              <td>your sign-in email</td>
            </tr>
            <tr>
              <td>ADMIN_PASSWORD</td>
              <td>your sign-in password (8+ characters)</td>
            </tr>
            <tr>
              <td>JWT_SECRET</td>
              <td>any long random string</td>
            </tr>
            <tr>
              <td>CORS_ORIGIN</td>
              <td>your site URL, e.g. https://farhanakhtar001458-ai.github.io</td>
            </tr>
          </tbody>
        </table>
      </Card>
    </div>
  );
}
