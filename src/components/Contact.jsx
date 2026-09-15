import { useState } from 'react';
import { api, isOfflineError } from '../lib/api.js';
import { Reveal, Section, SectionHead, Spinner } from './ui.jsx';

export default function Contact({ profile, online }) {
  const [form, setForm] = useState({ name: '', email: '', message: '' });
  const [state, setState] = useState('idle'); // idle | sending | sent
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  async function submit(e) {
    e.preventDefault();
    setError('');
    setNotice('');
    if (form.name.trim().length < 2) {
      setError('Please tell me your name.');
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(form.email.trim())) {
      setError('Please enter a valid email address.');
      return;
    }
    if (form.message.trim().length < 5) {
      setError('Your message is a little too short.');
      return;
    }
    setState('sending');
    try {
      await api('/contact', { method: 'POST', body: form });
      setState('sent');
      setNotice("Thanks! I'll get back to you soon.");
      setForm({ name: '', email: '', message: '' });
    } catch (err) {
      if (isOfflineError(err)) {
        // Backend not deployed/reachable — fall back to the visitor's mail app.
        const subject = encodeURIComponent(`Portfolio message from ${form.name.trim()}`);
        const body = encodeURIComponent(`${form.message.trim()}\n\n— ${form.name.trim()} (${form.email.trim()})`);
        window.location.href = `mailto:${profile.email}?subject=${subject}&body=${body}`;
        setState('sent');
        setNotice("Backend isn't connected, so I opened your mail app with your message ready to send.");
        setForm({ name: '', email: '', message: '' });
      } else {
        setState('idle');
        setError(err.message || 'Something went wrong. Please try again.');
      }
    }
  }

  return (
    <Section id="contact">
      <SectionHead
        eyebrow="contact"
        title="Let's build something"
        sub="Have an idea, a role, or just want to say hi? My inbox is open."
      />
      <div className="contact-grid">
        <Reveal className="contact-form-wrap glass">
          <form className="contact-form" onSubmit={submit} noValidate>
            <div className="field">
              <label className="field-label" htmlFor="cf-name">Name</label>
              <input
                id="cf-name"
                className="input"
                type="text"
                value={form.name}
                onChange={set('name')}
                placeholder="Your name"
                autoComplete="name"
              />
            </div>
            <div className="field">
              <label className="field-label" htmlFor="cf-email">Email</label>
              <input
                id="cf-email"
                className="input"
                type="email"
                value={form.email}
                onChange={set('email')}
                placeholder="you@example.com"
                autoComplete="email"
              />
            </div>
            <div className="field">
              <label className="field-label" htmlFor="cf-msg">Message</label>
              <textarea
                id="cf-msg"
                className="input textarea"
                rows={5}
                value={form.message}
                onChange={set('message')}
                placeholder="Tell me about your project or idea…"
              />
            </div>
            <button className="btn btn-primary submit-btn" type="submit" disabled={state === 'sending'}>
              {state === 'sending' ? (
                <>
                  <Spinner /> Sending…
                </>
              ) : state === 'sent' ? (
                '✓ Message sent'
              ) : (
                <>
                  Send message <span aria-hidden="true">→</span>
                </>
              )}
            </button>
            {error ? (
              <p className="form-error" role="alert">{error}</p>
            ) : null}
            {notice ? (
              <p className="form-ok" role="status">{notice}</p>
            ) : null}
            {online === false ? (
              <p className="form-hint mono">• backend offline — messages fall back to your mail app</p>
            ) : null}
          </form>
        </Reveal>

        <Reveal delay={140} className="contact-side">
          <div className="glass contact-info">
            <h3>Or reach me directly</h3>
            <ul>
              <li>
                <span aria-hidden="true">✉️</span>
                <div>
                  <em>Email</em>
                  <a href={`mailto:${profile.email}`}>{profile.email}</a>
                </div>
              </li>
              {profile.socials.github ? (
                <li>
                  <span aria-hidden="true">🐙</span>
                  <div>
                    <em>GitHub</em>
                    <a href={profile.socials.github} target="_blank" rel="noreferrer">
                      {profile.socials.github.replace('https://', '')}
                    </a>
                  </div>
                </li>
              ) : null}
              {profile.socials.linkedin ? (
                <li>
                  <span aria-hidden="true">💼</span>
                  <div>
                    <em>LinkedIn</em>
                    <a href={profile.socials.linkedin} target="_blank" rel="noreferrer">
                      {profile.socials.linkedin.replace('https://', '')}
                    </a>
                  </div>
                </li>
              ) : null}
              <li>
                <span aria-hidden="true">📍</span>
                <div>
                  <em>Location</em>
                  <span>{profile.location} · {profile.college}</span>
                </div>
              </li>
            </ul>
            <div className="avail-chip">
              <span className="pulse-dot" aria-hidden="true" />
              Available for internships &amp; projects
            </div>
          </div>
        </Reveal>
      </div>
    </Section>
  );
}
