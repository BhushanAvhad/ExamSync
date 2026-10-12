import { BrandLogoIcon } from '../ui/Icons';

/**
 * ExamSync Footer Component
 */
export function Footer() {
  return (
    <footer className="footer-wrapper">
      <div className="container footer-content">
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div className="brand-icon-wrapper" style={{ width: 26, height: 26 }}>
            <BrandLogoIcon size={14} />
          </div>
          <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>
            ExamSync
          </span>
          <span style={{ color: 'var(--text-muted)' }}>
            — Intelligent Examination Scheduling & Optimization
          </span>
        </div>

        <div className="system-status-indicator">
          <span className="status-pulsing-dot" />
          <span>Core Engine: Nominal</span>
          <span style={{ color: 'var(--border-hover)' }}>•</span>
          <span>Phase 2 Visual Foundation</span>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
