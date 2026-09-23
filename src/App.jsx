import { Routes, Route } from 'react-router-dom';
import HomePage from './pages/HomePage.jsx';
import CaseStudyPage from './pages/CaseStudyPage.jsx';

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/case-study/:slug" element={<CaseStudyPage />} />
    </Routes>
  );
}
