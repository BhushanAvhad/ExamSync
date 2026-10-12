import { Button } from '../ui/Button';
import { ArrowRightIcon, UserIcon } from '../ui/Icons';

/**
 * ExamSync Bottom CTA Section (Section 9 - Revised)
 * Headline: "Ready to simplify exam scheduling?"
 * Buttons: "Get Started" and "Sign In"
 */
export function CtaSection({ onGetStarted, onSignIn }) {
  return (
    <section className="cta-section-wrapper">
      <div className="container">
        <div className="cta-box-card">
          {/* Subtle Ambient Decorative Backlight */}
          <div className="cta-box-glow" />

          <div className="cta-box-inner">
            <h2 className="cta-title">Ready to simplify exam scheduling?</h2>
            <p className="cta-subtitle">
              Join educational institutions that have replaced manual timetabling chaos with automated, conflict-aware clarity.
            </p>

            <div className="cta-actions">
              <Button
                variant="primary"
                size="lg"
                icon={<ArrowRightIcon size={16} />}
                onClick={onGetStarted}
              >
                Get Started
              </Button>

              <Button
                variant="secondary"
                size="lg"
                icon={<UserIcon size={16} />}
                onClick={onSignIn}
              >
                Sign In
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default CtaSection;
