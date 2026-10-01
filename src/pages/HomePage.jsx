import { useEffect, useState } from 'react';
import { ScrollTrigger } from '../lib/motion.js';
import Footer from '../components/Footer.jsx';
import Hero from './home/Hero.jsx';
import About from './home/About.jsx';
import Work from './home/Work.jsx';
import Services from './home/Services.jsx';
import Clients from './home/Clients.jsx';
import Cta from './home/Cta.jsx';

export default function HomePage() {
  const [projects, setProjects] = useState([]);

  useEffect(() => {
    document.title = 'Northfold — Independent brand & motion studio';
    fetch('/projects.json')
      .then(r => r.json())
      .then(setProjects)
      .catch(console.error);
  }, []);

  // The work rail mounts its pin after the sections below it, so put
  // triggers back in page order before re-measuring.
  useEffect(() => {
    if (!projects.length) return;
    ScrollTrigger.sort();
    ScrollTrigger.refresh();
  }, [projects.length]);

  return (
    <>
      <main>
        <Hero />
        <About />
        <Work projects={projects} />
        <Services />
        <Clients />
        <Cta />
      </main>
      <Footer />
    </>
  );
}
