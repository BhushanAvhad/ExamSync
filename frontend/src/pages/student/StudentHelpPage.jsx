import { useState } from 'react';
import { PageHeader } from '../../components/admin/PageHeader';
import { Button } from '../../components/ui/Button';
import {
  ClockIcon,
  DoorIcon,
  CalendarDaysIcon,
  AlertTriangleIcon,
  ChevronDownIcon,
  ChevronUpIcon,
} from '../../components/ui/Icons';
import { STUDENT_FAQS, STUDENT_PROFILE } from '../../data/studentDemoData';

export function StudentHelpPage({ onNavigate }) {
  const [openFaqIndex, setOpenFaqIndex] = useState(0);

  const toggleFaq = (index) => {
    setOpenFaqIndex((prev) => (prev === index ? null : index));
  };

  return (
    <div className="admin-page-content student-help-page">
      <PageHeader
        title="Examination Help & Student Guidelines"
        subtitle="Institutional regulations, venue instructions, and frequently asked questions for candidate sittings."
        category="Guidance"
        actions={
          <Button
            variant="primary"
            size="sm"
            icon={<CalendarDaysIcon size={15} />}
            onClick={() => onNavigate('/student/timetable')}
          >
            Go to My Timetable
          </Button>
        }
      />

      {/* Guidance Cards Grid */}
      <div className="help-guidance-grid">
        <div className="admin-card guidance-card">
          <div className="guidance-icon-box cyan">
            <ClockIcon size={20} />
          </div>
          <h4>Examination Timing Rules</h4>
          <p>
            Candidate entry doors open 20 minutes prior to paper start and close strictly 10 minutes before reading commences. Late arrivals over 15 minutes are not permitted entry.
          </p>
        </div>

        <div className="admin-card guidance-card">
          <div className="guidance-icon-box violet">
            <DoorIcon size={20} />
          </div>
          <h4>Venue & Desk Protocol</h4>
          <p>
            Check your assigned Desk Number (e.g. Desk A-24 in Hall 101) on your timetable. Desks are arranged alphabetically by student candidate matriculation ID.
          </p>
        </div>

        <div className="admin-card guidance-card">
          <div className="guidance-icon-box emerald">
            <CalendarDaysIcon size={20} />
          </div>
          <h4>Permitted Materials</h4>
          <p>
            Carry your physical Student ID card, clear pencil case, blue/black ink pens, and non-programmable scientific calculators where explicitly authorized by module faculty.
          </p>
        </div>
      </div>

      {/* Discrepancy Reporting Notice */}
      <div className="admin-card reporting-protocol-card">
        <div className="reporting-lead">
          <AlertTriangleIcon size={22} className="reporting-icon" />
          <div>
            <h3>Reporting Timetable Discrepancies</h3>
            <p>
              If your personal timetable shows missing modules, incorrect cohort divisions, or an unresolvable overlap with another paper, please alert your academic department administrator immediately.
            </p>
          </div>
        </div>

        <div className="reporting-contact-strip">
          <div className="rep-item">
            <span className="rep-label">Examination Office:</span>
            <span className="rep-val">academic.exams@vit.edu.in</span>
          </div>
          <div className="rep-item">
            <span className="rep-label">Academic Advisor:</span>
            <span className="rep-val">{STUDENT_PROFILE.advisor}</span>
          </div>
          <div className="rep-item">
            <span className="rep-label">Location:</span>
            <span className="rep-val">VIT Examination Cell, Vidyalankar Campus, Wadala (East)</span>
          </div>
        </div>
      </div>

      {/* Accordion FAQs */}
      <div className="admin-card faq-section-card">
        <div className="admin-card-header">
          <div>
            <h3 className="admin-card-title">Frequently Asked Questions</h3>
            <p className="admin-card-subtitle">
              Common questions regarding ExamSync personal schedules
            </p>
          </div>
        </div>

        <div className="faq-accordion-list">
          {STUDENT_FAQS.map((faq, index) => {
            const isOpen = openFaqIndex === index;
            return (
              <div
                key={index}
                className={`faq-accordion-item ${isOpen ? 'is-open' : ''}`}
              >
                <button
                  type="button"
                  className="faq-question-btn"
                  onClick={() => toggleFaq(index)}
                  aria-expanded={isOpen}
                >
                  <span className="faq-q-text">{faq.q}</span>
                  {isOpen ? <ChevronUpIcon size={16} /> : <ChevronDownIcon size={16} />}
                </button>

                {isOpen && (
                  <div className="faq-answer-panel">
                    <p>{faq.a}</p>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export default StudentHelpPage;
