import { SparklesIcon, ShieldCheckIcon, LayersIcon } from '../ui/Icons';

/**
 * ExamSync About / Vision Section (Section 8 - Revised)
 * Strong visual composition communicating:
 * "Making examination scheduling more intelligent, organized and reliable."
 */
export function VisionSection() {
  const pillars = [
    {
      icon: <SparklesIcon size={20} />,
      title: 'Intelligent',
      desc: 'Harnessing modern constraint modeling to evaluate millions of potential scheduling combinations in seconds.',
    },
    {
      icon: <LayersIcon size={20} />,
      title: 'Organized',
      desc: 'Connecting academic faculties, department coordinators, and student cohorts within a synchronized structure.',
    },
    {
      icon: <ShieldCheckIcon size={20} />,
      title: 'Reliable',
      desc: 'Delivering conflict-free, dependable examination periods that students and faculty can plan around with confidence.',
    },
  ];

  return (
    <section className="section-wrapper" id="about">
      <div className="container">
        <div className="vision-container-card">
          {/* Subtle Ambient Decorative Glow */}
          <div className="vision-glow-effect" />

          <div className="vision-header-content">
            <span className="section-tag" style={{ color: 'var(--primary-light)' }}>
              Our Core Vision
            </span>
            <h2 className="vision-quote">
              “Making examination scheduling more intelligent, organized, and reliable.”
            </h2>
            <p className="vision-narrative">
              Examination schedules are the backbone of academic milestones.
              ExamSync was conceptualized to free academic administrators from the gridlock of manual
              clashes, creating an environment where institutional planning is seamless and students can focus entirely on their learning.
            </p>
          </div>

          {/* Three Pillar Cards */}
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
