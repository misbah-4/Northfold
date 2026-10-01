import { Routes, Route } from 'react-router-dom';
import SmoothScroll from './components/SmoothScroll.jsx';
import Preloader from './components/Preloader.jsx';
import Navbar from './components/Navbar.jsx';
import Cursor from './components/Cursor.jsx';
import HomePage from './pages/HomePage.jsx';
import CaseStudyPage from './pages/CaseStudyPage.jsx';

export default function App() {
  return (
    <SmoothScroll>
      <Preloader />
      <Navbar />
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/case-study/:slug" element={<CaseStudyPage />} />
      </Routes>
      <Cursor />
      <div className="grain" aria-hidden="true" />
    </SmoothScroll>
  );
}
