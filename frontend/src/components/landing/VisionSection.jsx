import { SparklesIcon, ShieldCheckIcon, LayersIcon, CheckCircleIcon, CalendarIcon, UsersIcon } from '../ui/Icons';

/**
 * ExamSync About & Institutional Vision Section
 * Section ID: #about
 * Communicates:
 * - The Problem: The combinatorial challenge of academic scheduling
 * - The Solution: Deterministic heuristic solver with student-centric well-being
 * - 4 Strategic Pillars
 * - Core Institutional Proof Metrics
 */
export function VisionSection() {
  const pillars = [
    {
      icon: <SparklesIcon size={20} />,
      title: 'Deterministic Precision',
      desc: 'Harnessing modern constraint modeling to evaluate millions of potential scheduling combinations in seconds, guaranteeing zero room clashes.',
    },
    {
      icon: <CalendarIcon size={20} />,
      title: 'Student Well-Being',
      desc: 'Ensuring balanced spacing between demanding exams to prevent mental fatigue, supporting student academic performance and retention.',
    },
    {
      icon: <ShieldCheckIcon size={20} />,
      title: 'Enterprise Governance',
      desc: 'Role-based access control with administrative verification gates, secure audit trails, and student credential protection.',
    },
    {
      icon: <LayersIcon size={20} />,
      title: 'Synchronized Campus',
      desc: 'Bridging exam controllers, room facility managers, and student cohorts into a single live truth with instant admit card delivery.',
    },
  ];

  const metrics = [
    { value: '< 60s', label: 'Genetic Solve Time', sub: 'Average optimization speed' },
    { value: '100%', label: 'Conflict-Free', sub: 'Hard constraints mathematically satisfied' },
    { value: '0', label: 'Double Bookings', sub: 'Eliminates room & student overlaps' },
    { value: '24/7', label: 'Portal Availability', sub: 'Instant student admit card downloads' },
  ];

  return (
    <section className="section-wrapper" id="about">
      <div className="container">
        <div className="vision-container-card">
          {/* Subtle Ambient Decorative Glow */}
          <div className="vision-glow-effect" />

          <div className="vision-header-content">
            <span className="section-tag" style={{ color: 'var(--primary-light)' }}>
              About ExamSync
            </span>
            <h2 className="vision-quote">
              “Making examination scheduling intelligent, organized, and reliable.”
            </h2>
            <p className="vision-narrative">
              Examination periods represent the highest stakes in academic life.
              Traditionally, university administrators spend weeks juggling overlapping student enrollments,
              limited lecture halls, and faculty schedules across fragile spreadsheets. ExamSync transforms this
              combinatorial challenge into an automated, verified, and transparent process that puts institutional clarity first.
            </p>
          </div>

          {/* Key Metrics Banner */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
              gap: 16,
              margin: '32px 0',
              padding: '20px 24px',
              background: 'rgba(99, 102, 241, 0.05)',
              border: '1px solid rgba(99, 102, 241, 0.15)',
              borderRadius: 'var(--radius-md)',
            }}
          >
            {metrics.map((m) => (
              <div key={m.label} style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--text-primary)', fontFamily: 'var(--font-mono)' }}>
                  {m.value}
                </div>
                <div style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--accent)', marginTop: 2 }}>
                  {m.label}
                </div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: 2 }}>
                  {m.sub}
                </div>
              </div>
            ))}
          </div>

          {/* Four Pillar Cards */}
          <div className="vision-pillars-grid">
            {pillars.map((pillar) => (
              <div key={pillar.title} className="vision-pillar-card">
                <div className="vision-pillar-icon" aria-hidden="true">
                  {pillar.icon}
                </div>
                <h3 className="vision-pillar-title">{pillar.title}</h3>
                <p className="vision-pillar-desc">{pillar.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

export default VisionSection;
