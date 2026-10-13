import { Hero } from '../components/landing/Hero';
import { Features } from '../components/landing/Features';
import { HowItWorks } from '../components/landing/HowItWorks';
import { WhyExamSync } from '../components/landing/WhyExamSync';
import { VisionSection } from '../components/landing/VisionSection';
import { CtaSection } from '../components/landing/CtaSection';
import { BrandLogoIcon, ShieldCheckIcon, GraduationCapIcon } from '../components/ui/Icons';

/**
 * ExamSync Landing Page
 * Full Institutional Flow:
 * 1. Hero (#home)
 * 2. Core Capabilities (#features)
 * 3. Step-by-Step Optimization & Interactive Table (#how-it-works)
 * 4. Institutional Value (#why-examsync)
 * 5. About & Strategic Vision (#about)
 * 6. Call to Action (Register / Student Login)
 * 7. Institutional Footer
 */
export function LandingPage({ onNavigate }) {
  const scrollTo = (id) => {
    if (id === 'home') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      const el = document.getElementById(id);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth' });
      }
    }
  };

  return (
    <div className="landing-page-wrapper">
      {/* 1. Hero */}
      <Hero onGetStarted={() => onNavigate('/register')} />

      {/* 2. Features */}
      <Features />

      {/* 3. How It Works (Timeline + Live Table Preview) */}
      <HowItWorks />

      {/* 4. Why Educational Institutions Choose ExamSync */}
      <WhyExamSync />

      {/* 5. About & Vision */}
      <VisionSection />

      {/* 6. Call To Action */}
      <CtaSection
        onGetStarted={() => onNavigate('/register')}
        onSignIn={() => onNavigate('/student-login')}
      />

      {/* 7. Institutional Footer */}
      <footer className="footer-wrapper">
        <div className="container">
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
              gap: 32,
              paddingBottom: 32,
              borderBottom: '1px solid var(--border)',
              marginBottom: 24,
            }}
          >
            {/* Brand & Purpose */}
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
                <div className="brand-icon-wrapper">
                  <BrandLogoIcon size={18} />
                </div>
                <span className="brand-text" style={{ fontSize: '1.125rem' }}>
                  Exam<span className="brand-accent">Sync</span>
                </span>
              </div>
              <p style={{ fontSize: '0.8125rem', lineHeight: 1.6, color: 'var(--text-secondary)', margin: 0 }}>
                Next-generation automated exam scheduling system. Delivering mathematically verified,
                conflict-free timetables and print-ready student admit cards for educational institutions.
              </p>
            </div>

            {/* Platform Links */}
            <div>
              <div style={{ fontSize: '0.75rem', fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase', color: 'var(--text-primary)', marginBottom: 12 }}>
                Navigation
              </div>
              <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 8 }}>
                <li>
                  <button type="button" className="nav-link-btn" onClick={() => scrollTo('home')}>
                    Home
                  </button>
                </li>
                <li>
                  <button type="button" className="nav-link-btn" onClick={() => scrollTo('features')}>
                    Features & Capabilities
                  </button>
                </li>
                <li>
                  <button type="button" className="nav-link-btn" onClick={() => scrollTo('how-it-works')}>
                    How It Works
                  </button>
                </li>
                <li>
                  <button type="button" className="nav-link-btn" onClick={() => scrollTo('about')}>
                    About ExamSync
                  </button>
                </li>
              </ul>
            </div>

            {/* Access Portals */}
            <div>
              <div style={{ fontSize: '0.75rem', fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase', color: 'var(--text-primary)', marginBottom: 12 }}>
                Access Portals
              </div>
              <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 8 }}>
                <li>
                  <button
                    type="button"
                    className="nav-link-btn"
                    onClick={() => onNavigate('/admin-login')}
                    style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}
                  >
                    <ShieldCheckIcon size={14} />
                    <span>Admin & Coordinator Portal</span>
                  </button>
                </li>
                <li>
                  <button
                    type="button"
                    className="nav-link-btn"
                    onClick={() => onNavigate('/student-login')}
                    style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}
                  >
                    <GraduationCapIcon size={14} />
                    <span>Student Timetable & Admit Card</span>
                  </button>
                </li>
                <li>
                  <button
                    type="button"
                    className="nav-link-btn"
                    onClick={() => onNavigate('/register')}
                  >
                    Create Institutional Account
                  </button>
                </li>
              </ul>
            </div>

            {/* Operational Standards */}
            <div>
              <div style={{ fontSize: '0.75rem', fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase', color: 'var(--text-primary)', marginBottom: 12 }}>
                System Standards
              </div>
              <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 6, fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>
                <li>• Heuristic Genetic Optimizer v2.4</li>
                <li>• RFC-4180 Master Excel Timetables</li>
                <li>• Official Print Admit Cards & Passes</li>
                <li>• Zero Student Clash Hard Guarantee</li>
              </ul>
            </div>
          </div>

          {/* Bottom Bar: Copyright & Live Engine Pulse */}
          <div className="footer-content">
            <div style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>
              &copy; {new Date().getFullYear()} ExamSync Academic Logistics. All rights reserved.
            </div>

            <div className="system-status-indicator">
              <span className="status-pulsing-dot" aria-hidden="true" />
              <span>Genetic Heuristic Engine Active &bull; Zero Conflict Guarantee</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default LandingPage;
