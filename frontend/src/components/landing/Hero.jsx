import { Button } from '../ui/Button';
import { ArrowRightIcon, SparklesIcon } from '../ui/Icons';

/**
 * ExamSync Hero Section (Section 9, 10, 11, 16 - Single-Screen Viewport Fit)
 * Contains strictly:
 * - Hero badge
 * - Hero heading
 * - Short description
 * - Single [ Get Started ] button -> /register
 * - Subtle abstract background decoration
 */
export function Hero({ onGetStarted }) {
  return (
    <section className="hero-single-screen" id="home">
      {/* Subtle Background Glow Orbs */}
      <div
        className="ambient-glow-orb ambient-glow-primary"
        style={{ top: '10%', left: '50%', transform: 'translateX(-50%)', width: 560, height: 380 }}
      />
      <div
        className="ambient-glow-orb ambient-glow-accent"
        style={{ top: '25%', left: '48%', transform: 'translateX(-50%)', width: 440, height: 280, opacity: 0.35 }}
      />

      {/* Abstract Geometric Decoration Behind Content */}
      <div className="hero-abstract-backdrop" aria-hidden="true">
        <div className="abstract-glow-ring ring-1" />
        <div className="abstract-glow-ring ring-2" />
        <div className="abstract-geometric-dots" />
      </div>

      <div className="container hero-content-centered">
        {/* Hero Badge */}
        <div className="hero-pill-tag">
          <SparklesIcon size={14} />
          <span>Next-Generation Academic Platform</span>
        </div>

        {/* Hero Heading */}
        <h1 className="hero-title single-screen-title">
          Smarter Exams.
          <br />
          <span className="hero-title-highlight">Simpler Scheduling.</span>
        </h1>

        {/* Short Description */}
        <p className="hero-subtitle single-screen-sub">
          ExamSync helps educational institutions create organized, conflict-aware
          examination schedules through intelligent scheduling and optimization.
        </p>

        {/* Only ONE button: [ Get Started ] */}
        <div className="hero-cta-single">
          <Button
            variant="primary"
            size="lg"
            icon={<ArrowRightIcon size={16} />}
            onClick={onGetStarted}
          >
            Get Started
          </Button>
        </div>
      </div>
    </section>
  );
}

export default Hero;
