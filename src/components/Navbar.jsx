import { useState } from 'react';
import { useActiveSection, useScrollY } from '../lib/hooks.jsx';

const LINKS = [
  ['home', 'Home'],
  ['about', 'About'],
  ['skills', 'Skills'],
  ['projects', 'Projects'],
  ['journey', 'Journey'],
  ['contact', 'Contact']
];

export default function Navbar() {
  const y = useScrollY();
  const [open, setOpen] = useState(false);
  const active = useActiveSection(LINKS.map(([id]) => id));
  const max = Math.max(1, document.documentElement.scrollHeight - window.innerHeight);
  const progress = Math.min(1, y / max);

  return (
    <header className={`nav ${y > 24 ? 'is-scrolled' : ''}`}>
      <div
        className="nav-progress"
        style={{ transform: `scaleX(${progress})` }}
        aria-hidden="true"
      />
      <div className="container nav-inner">
        <a href="#home" className="brand" onClick={() => setOpen(false)}>
          <span className="brand-mark">FA</span>
          <span className="brand-name">
            xoiom<span className="mono">.dev</span>
          </span>
        </a>
        <nav className={`nav-links ${open ? 'open' : ''}`} aria-label="Main navigation">
          {LINKS.map(([id, label]) => (
            <a
              key={id}
              href={`#${id}`}
              className={active === id ? 'active' : ''}
              onClick={() => setOpen(false)}
            >
              {label}
            </a>
          ))}
        </nav>
        <a href="#contact" className="btn btn-primary btn-sm nav-cta">
          Let's talk
        </a>
        <button
          className={`nav-burger ${open ? 'open' : ''}`}
          aria-label="Toggle menu"
          aria-expanded={open}
          onClick={() => setOpen((o) => !o)}
        >
          <span />
          <span />
          <span />
        </button>
      </div>
    </header>
  );
}
