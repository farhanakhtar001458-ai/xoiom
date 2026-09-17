import { Reveal, Section, SectionHead } from './ui.jsx';
import { useCountUp, useRevealVisible } from '../lib/hooks.jsx';

function Stat({ label, value }) {
  const [ref, visible] = useRevealVisible();
  const n = useCountUp(value, visible);
  return (
    <div ref={ref} className="stat">
      <span className="stat-num grad-text">{n}</span>
      <span className="stat-label">{label}</span>
    </div>
  );
}

export default function About({ profile }) {
  const rows = [
    ['📍', 'Home base', profile.location],
    ['🎓', 'College', profile.college],
    ['🧠', 'Branch', profile.branch],
    ['✉️', 'Email', profile.email],
    ['🚀', 'Focus', 'AI · ML · Full-Stack']
  ];

  return (
    <Section id="about">
      <SectionHead
        eyebrow="about me"
        title="A little bit about me"
        sub="The person behind the projects."
      />
      <div className="about-grid">
        <Reveal className="about-card glass">
          <div className="about-quote" aria-hidden="true">“</div>
          {(profile.about || []).map((p, i) => (
            <p key={i}>{p}</p>
          ))}
        </Reveal>
        <div className="about-side">
          <Reveal delay={120} className="info-card glass">
            <h3 className="card-title">Quick facts</h3>
            <ul className="info-list">
              {rows.map(([ico, k, v]) => (
                <li key={k}>
                  <span className="info-ico" aria-hidden="true">{ico}</span>
                  <span className="info-k">{k}</span>
                  <span className="info-v">{v}</span>
                </li>
              ))}
            </ul>
          </Reveal>
          <Reveal delay={220} className="stats-card glass">
            <div className="stats-grid">
              {(profile.stats || []).map((s) => (
                <Stat key={s.label} label={s.label} value={Number(s.value) || 0} />
              ))}
            </div>
          </Reveal>
        </div>
      </div>
    </Section>
  );
}
