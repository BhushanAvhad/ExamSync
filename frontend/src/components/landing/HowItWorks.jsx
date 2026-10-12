import { ArrowRightIcon } from '../ui/Icons';

/**
 * ExamSync How It Works Section (Section 6 - Revised)
 * Conceptual Process Timeline:
 * 01 — Add Examination Data
 * 02 — Define Constraints
 * 03 — Generate Schedule
 * 04 — Optimize
 * 05 — Publish Timetable
 */
export function HowItWorks() {
  const steps = [
    {
      num: '01',
      title: 'Add Examination Data',
      description:
        'Input student course registrations, departmental subjects, venue capacities, and institutional term calendars.',
    },
    {
      num: '02',
      title: 'Define Constraints',
      description:
        'Establish hard parameters like zero student clashes alongside preferences for gap intervals and session windows.',
    },
    {
      num: '03',
      title: 'Generate Schedule',
      description:
        'The intelligent engine processes cross-course dependencies to construct a fully conflict-aware scheduling baseline.',
    },
    {
      num: '04',
      title: 'Optimize',
      description:
        'Automated solvers balance room capacity usage, mitigate student testing fatigue, and harmonize campus resources.',
    },
    {
      num: '05',
      title: 'Publish Timetable',
      description:
        'Release verified, accurate schedules directly to administrative leaders and student portals with clear clarity.',
    },
  ];

  return (
    <section className="section-wrapper" id="how-it-works">
      <div className="container">
        <div className="section-header">
          <span className="section-tag">Conceptual Architecture</span>
          <h2 className="section-title">How ExamSync Works</h2>
          <p className="section-description">
            A clear, systematic workflow designed to convert complicated academic requirements
            into dependable examination timetables.
          </p>
        </div>

        <div className="process-timeline">
          {steps.map((step, idx) => (
            <div key={step.num} className="process-step-card">
              <div className="process-step-header">
                <span className="process-step-num">{step.num}</span>
                {idx < steps.length - 1 && (
                  <span className="process-arrow" aria-hidden="true">
                    <ArrowRightIcon size={14} />
                  </span>
                )}
              </div>
              <h3 className="process-step-title">{step.title}</h3>
              <p className="process-step-desc">{step.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default HowItWorks;
