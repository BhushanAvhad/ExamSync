import { Hero } from '../components/landing/Hero';

/**
 * ExamSync Landing Page (Section 1 & 2 - Single-Screen Minimalist Hero)
 * Strictly NO scrolling sections below hero.
 * Communicates only the identity and purpose of ExamSync.
 */
export function LandingPage({ onNavigate }) {
  return (
    <div className="landing-single-screen-wrapper">
      <Hero onGetStarted={() => onNavigate('/register')} />
    </div>
  );
}

export default LandingPage;
