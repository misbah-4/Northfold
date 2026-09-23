import { useEffect, useState } from 'react';
import Navbar from '../components/Navbar.jsx';
import Footer from '../components/Footer.jsx';
import HeroSection    from './home/HeroSection.jsx';
import WorkSection    from './home/WorkSection.jsx';
import StudioSection  from './home/StudioSection.jsx';
import ServicesSection from './home/ServicesSection.jsx';
import GallerySection from './home/GallerySection.jsx';

export default function HomePage() {
  const [projects, setProjects] = useState([]);

  useEffect(() => {
    document.title = 'Northfold — Independent brand & motion studio';
    fetch('/projects.json')
      .then(r => r.json())
      .then(setProjects)
      .catch(console.error);
  }, []);

  return (
    <div id="top" style={{ position: 'relative', overflowX: 'clip' }}>
      <Navbar />
      <main>
        <HeroSection />
        <WorkSection projects={projects} />
        <StudioSection />
        <ServicesSection />
        <GallerySection />
      </main>
      <Footer />
    </div>
  );
}
