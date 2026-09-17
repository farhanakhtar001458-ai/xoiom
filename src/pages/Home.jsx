import { useEffect, useState } from 'react';
import { api } from '../lib/api.js';
import { DEFAULT_CONTENT } from '../data/defaults.js';
import Orbs from '../components/Orbs.jsx';
import Navbar from '../components/Navbar.jsx';
import Hero from '../components/Hero.jsx';
import About from '../components/About.jsx';
import Skills from '../components/Skills.jsx';
import Projects from '../components/Projects.jsx';
import Journey from '../components/Journey.jsx';
import Contact from '../components/Contact.jsx';
import Footer from '../components/Footer.jsx';

export default function Home() {
  const [content, setContent] = useState(DEFAULT_CONTENT);
  const [online, setOnline] = useState(null); // null = checking

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const data = await api('/site');
        if (!alive) return;
        setContent({
          profile: { ...DEFAULT_CONTENT.profile, ...(data.profile || {}) },
          skills: data.skills || DEFAULT_CONTENT.skills,
          projects: data.projects || DEFAULT_CONTENT.projects,
          journey: data.journey || DEFAULT_CONTENT.journey
        });
        setOnline(true);
      } catch {
        if (alive) setOnline(false);
      }
    })();
    return () => {
      alive = false;
    };
  }, []);

  return (
    <div className="site">
      <Orbs />
      <Navbar />
      <main>
        <Hero profile={content.profile} />
        <About profile={content.profile} />
        <Skills skills={content.skills} />
        <Projects projects={content.projects} />
        <Journey journey={content.journey} />
        <Contact profile={content.profile} online={online} />
      </main>
      <Footer profile={content.profile} />
    </div>
  );
}
