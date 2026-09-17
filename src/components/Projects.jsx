import { Reveal, Section, SectionHead, TiltCard } from './ui.jsx';

export default function Projects({ projects }) {
  return (
    <Section id="projects">
      <SectionHead
        eyebrow="projects"
        title="Things I've built"
        sub="A few projects I'm proud of — from ML experiments to full-stack apps."
      />
      <div className="projects-grid">
        {(projects || []).map((p, i) => (
          <Reveal key={p.id || i} delay={(i % 2) * 110}>
            <TiltCard className="project-card">
              {p.featured ? <span className="featured-badge">★ Featured</span> : null}
              <div className="project-glow" aria-hidden="true" />
              <h3 className="project-title">{p.title}</h3>
              <p className="project-desc">{p.desc}</p>
              <div className="tags">
                {(p.tags || []).map((t) => (
                  <span key={t} className="tag mono">{t}</span>
                ))}
              </div>
              <div className="project-links">
                {p.link ? (
                  <a className="btn btn-sm" href={p.link} target="_blank" rel="noreferrer">
                    Live demo ↗
                  </a>
                ) : null}
                {p.repo ? (
                  <a className="btn btn-sm" href={p.repo} target="_blank" rel="noreferrer">
                    Source code
                  </a>
                ) : null}
              </div>
            </TiltCard>
          </Reveal>
        ))}
      </div>
    </Section>
  );
}
