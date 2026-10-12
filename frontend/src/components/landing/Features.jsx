import { CalendarIcon, AlertTriangleIcon, CpuIcon, LayersIcon } from '../ui/Icons';

/**
 * ExamSync Features Section (Section 5 - Revised)
 * 4 Product Capability Cards:
 * 1. Intelligent Scheduling
 * 2. Conflict Detection
 * 3. Smart Optimization
 * 4. Centralized Management
 * Elegant icons and short descriptions. No fake application screenshots.
 */
export function Features() {
  const featureList = [
    {
      id: 'scheduling',
      title: 'Intelligent Scheduling',
      description:
        'Coordinate multiple student cohorts, venue limits, and time slots simultaneously with rule-based scheduling intelligence.',
      icon: <CalendarIcon size={22} />,
    },
    {
      id: 'conflict',
      title: 'Conflict Detection',
      description:
        'Proactively identify exam overlaps, student double-bookings, back-to-back testing fatigue, and room capacity limits.',
      icon: <AlertTriangleIcon size={22} />,
    },
    {
      id: 'optimization',
      title: 'Smart Optimization',
      description:
        'Evenly distribute rigorous examinations, maintain comfortable rest gaps, and balance physical campus facilities.',
      icon: <CpuIcon size={22} />,
    },
    {
      id: 'management',
      title: 'Centralized Management',
      description:
        'Maintain a single, synchronized hub for timetable adjustments, administrative oversight, and student scheduling clarity.',
      icon: <LayersIcon size={22} />,
    },
  ];

  return (
    <section className="section-wrapper" id="features">
      <div className="container">
        <div className="section-header">
          <span className="section-tag">Core Capabilities</span>
          <h2 className="section-title">Designed for Modern Examination Logistics</h2>
          <p className="section-description">
            ExamSync replaces fragile manual processes with an automated,
            conflict-aware system engineered for educational institutions.
          </p>
        </div>

        <div className="features-grid">
          {featureList.map((item) => (
            <div key={item.id} className="feature-card">
              <div className="feature-icon-box" aria-hidden="true">
                {item.icon}
              </div>
              <h3 className="feature-card-title">{item.title}</h3>
              <p className="feature-card-desc">{item.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default Features;
