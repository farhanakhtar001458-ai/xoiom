import { Reveal, Section, SectionHead } from './ui.jsx';

const KINDS = { study: '🎓 Study', work: '💼 Work', build: '🛠️ Building', life: '🌱 Life' };

export default function Journey({ journey }) {
  return (
    <Section id="journey" className="alt">
      <SectionHead
        eyebrow="journey"
        title="How I got here"
        sub="Milestones so far — and where this is heading."
      />
      <ol className="timeline">
        {(journey || []).map((j, i) => (
          <li key={j.id || i} className="tl-item">
            <Reveal delay={i * 100}>
              <div className="tl-card glass">
                <div className="tl-meta">
                  <span className="tl-kind">{KINDS[j.kind] || '✨ Milestone'}</span>
                  {j.period ? <span className="tl-period mono">{j.period}</span> : null}
                </div>
                <h3 className="tl-title">{j.title}</h3>
                {j.org ? <p className="tl-org">{j.org}</p> : null}
                {j.desc ? <p className="tl-desc">{j.desc}</p> : null}
              </div>
            </Reveal>
          </li>
        ))}
      </ol>
    </Section>
  );
}
