import { CheckCircleIcon, SparklesIcon, CalendarIcon, BuildingIcon, LayersIcon } from '../ui/Icons';

/**
 * ExamSync Why ExamSync Section (Section 7 - Revised)
 * Highlights the practical, institutional value of the platform:
 * - Reduce manual scheduling effort
 * - Identify conflicts automatically
 * - Improve room and time-slot utilization
 * - Provide students with clear schedules
 * - Make schedule changes easier
 * Strictly no invented numerical claims.
 */
export function WhyExamSync() {
  const valuePoints = [
    {
      id: 'reduce-effort',
      icon: <LayersIcon size={20} />,
      title: 'Reduce Manual Scheduling Effort',
      desc: 'Eliminate tedious manual spreadsheet coordination and countless hours spent resolving course overlap matrices.',
    },
    {
      id: 'identify-conflicts',
      icon: <SparklesIcon size={20} />,
      title: 'Identify Conflicts Automatically',
      desc: 'Detect overlapping student exam requirements, double-booked venues, and timing collisions before schedules are finalized.',
    },
    {
      id: 'improve-utilization',
      icon: <BuildingIcon size={20} />,
      title: 'Improve Room & Time-Slot Utilization',
      desc: 'Distribute examination sittings equitably across available campus halls, auditoriums, and specialized lab environments.',
    },
    {
      id: 'clear-schedules',
      icon: <CalendarIcon size={20} />,
      title: 'Provide Students with Clear Schedules',
      desc: 'Deliver unambiguous, transparent timetables that help students plan revision effectively and avoid exam back-to-back stress.',
    },
    {
      id: 'easy-changes',
      icon: <CheckCircleIcon size={20} />,
      title: 'Make Schedule Changes Easier',
      desc: 'Accommodate academic term shifts, emergency room unavailability, or syllabus changes without restarting from scratch.',
    },
  ];

  return (
    <section className="section-wrapper" id="why-examsync">
      <div className="container">
        <div className="section-header">
          <span className="section-tag">Institutional Value</span>
          <h2 className="section-title">Why Educational Institutions Choose ExamSync</h2>
          <p className="section-description">
            ExamSync provides the clarity, precision, and agility necessary to handle modern academic examination planning.
          </p>
        </div>

        <div className="why-grid">
          {valuePoints.map((item) => (
            <div key={item.id} className="why-card">
              <div className="why-icon-bubble" aria-hidden="true">
                {item.icon}
              </div>
              <div className="why-content">
                <h3 className="why-title">{item.title}</h3>
                <p className="why-desc">{item.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default WhyExamSync;
