import { useEffect, useState } from 'react';
import { Reveal, TiltCard, GitHubIcon, LinkedInIcon, MailIcon } from './ui.jsx';

const ROLES = ['Machine Learning', 'Deep Learning', 'Computer Vision', 'Full-Stack Web Dev', 'Problem Solver'];

export default function Hero({ profile }) {
  const [role, setRole] = useState(0);
  useEffect(() => {
    const t = setInterval(() => setRole((r) => (r + 1) % ROLES.length), 2600);
    return () => clearInterval(t);
  }, []);

  const photo = profile.photo || `${import.meta.env.BASE_URL}photo.jpg`;
  const [first, ...rest] = profile.name.split(' ');
  const last = rest.join(' ');

  return (
    <section id="home" className="hero">
      <div className="container hero-inner">
        <div className="hero-copy">
          <Reveal>
            <p className="hero-hello mono">{'// hello world, I am'}</p>
          </Reveal>
          <Reveal delay={90}>
            <h1 className="hero-name">
              {first} <span className="grad-text">{last}</span>
            </h1>
          </Reveal>
          <Reveal delay={180}>
            <div className="hero-role mono" aria-live="polite">
              <span className="role-prefix">&lt;</span>
              <span key={role} className="role-anim">{ROLES[role]}</span>
              <span className="role-prefix">&nbsp;/&nbsp;</span>
              <span className="caret" aria-hidden="true" />
            </div>
          </Reveal>
          <Reveal delay={260}>
            <p className="hero-sub">
              {profile.tagline} — from {profile.location.split(',')[0]} to wherever the model
              goes.
            </p>
          </Reveal>
          <Reveal delay={340} className="hero-actions">
            <a className="btn btn-primary" href="#projects">
              View my work <span className="btn-arrow" aria-hidden="true">→</span>
            </a>
            <a className="btn" href="#contact">
              Get in touch
            </a>
          </Reveal>
          <Reveal delay={430} className="hero-social">
            {profile.socials.github ? (
              <a className="icon-link" href={profile.socials.github} target="_blank" rel="noreferrer" aria-label="GitHub">
                <GitHubIcon />
              </a>
            ) : null}
            {profile.socials.linkedin ? (
              <a className="icon-link" href={profile.socials.linkedin} target="_blank" rel="noreferrer" aria-label="LinkedIn">
                <LinkedInIcon />
              </a>
            ) : null}
            <a className="icon-link" href={`mailto:${profile.email}`} aria-label="Email">
              <MailIcon />
            </a>
          </Reveal>
        </div>

        <div className="hero-visual">
          <Reveal delay={200} className="hero-visual-reveal">
            <TiltCard className="photo-tilt" max={9}>
              <div className="photo-frame">
                <img src={photo} alt={`Portrait of ${profile.name}`} className="photo" />
                <div className="photo-scan" aria-hidden="true" />
              </div>
              <div className="chip chip-a">
                <span className="chip-ico" aria-hidden="true">🎓</span>
                <span>
                  <strong>{profile.college}</strong>
                  <em>AIML undergrad</em>
                </span>
              </div>
              <div className="chip chip-b">
                <span className="chip-ico" aria-hidden="true">📍</span>
                {profile.location}
              </div>
              <div className="chip chip-c">
                <span className="chip-ico" aria-hidden="true">🤖</span>
                Building with AI/ML
              </div>
            </TiltCard>
          </Reveal>
        </div>
      </div>

      <a href="#about" className="scroll-cue" aria-label="Scroll to about section">
        <span className="mouse" aria-hidden="true">
          <span className="wheel" />
        </span>
        <span className="mono">scroll</span>
      </a>
    </section>
  );
}
