import { Reveal, Section, SectionHead, TiltCard } from './ui.jsx';

const ICONS = { code: '⌨️', brain: '🧠', globe: '🌐', wrench: '🛠️', spark: '✨', star: '⭐', book: '📚' };

export default function Skills({ skills }) {
  return (
    <Section id="skills" className="alt">
      <SectionHead
        eyebrow="skills"
        title="What I work with"
        sub="The tools and technologies I use to turn ideas into products."
      />
      <div className="skills-grid">
        {(skills || []).map((g, i) => (
          <Reveal key={g.id || i} delay={(i % 3) * 100}>
            <TiltCard className="skill-card">
              <div className="skill-head">
                <span className="skill-ico" aria-hidden="true">{ICONS[g.icon] || '⭐'}</span>
                <h3>{g.name}</h3>
              </div>
              <ul className="skill-list">
                {(g.items || []).map((it) => (
                  <li key={it.name} className="skill-row">
                    <span className="skill-name">{it.name}</span>
                    <span className="mono skill-pct">{it.level}</span>
                    <span className="bar" aria-hidden="true">
                      <span className="bar-fill" style={{ '--w': `${it.level}%` }} />
                    </span>
                  </li>
                ))}
              </ul>
            </TiltCard>
          </Reveal>
        ))}
      </div>
    </Section>
  );
}
