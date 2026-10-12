import { PageHeader } from '../../components/admin/PageHeader';
import { StatCard } from '../../components/admin/StatCard';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import {
  CalendarDaysIcon,
  ClockIcon,
  DoorIcon,
  BookOpenIcon,
  ArrowRightIcon,
  BellIcon,
  UserIcon,
  InfoIcon,
} from '../../components/ui/Icons';
import {
  STUDENT_PROFILE,
  STUDENT_TIMETABLE_ENTRIES,
  STUDENT_SUBJECTS,
} from '../../data/studentDemoData';

export function StudentOverviewPage({ onNavigate }) {
  const nextExam = STUDENT_TIMETABLE_ENTRIES[0];
  const totalUpcoming = STUDENT_TIMETABLE_ENTRIES.length;
  const totalSubjects = STUDENT_SUBJECTS.length;

  return (
    <div className="admin-page-content student-overview-content">
      {/* Welcome Page Header */}
      <PageHeader
        title={`Welcome back, ${STUDENT_PROFILE.name}`}
        subtitle="Here is an overview of your upcoming examinations, venue allocations, and academic schedule."
        category="Student Portal"
        badge={
          <span className="overview-cycle-pill student-cycle-pill">
            <span className="cycle-dot" />
            {STUDENT_PROFILE.className} • {STUDENT_PROFILE.division}
          </span>
        }
        actions={
          <Button
            variant="primary"
            size="sm"
            icon={<CalendarDaysIcon size={16} />}
            onClick={() => onNavigate('/student/timetable')}
          >
            View My Timetable
          </Button>
        }
      />

      {/* Demo Notice Banner */}
      <div className="admin-banner info-banner">
        <InfoIcon size={18} className="banner-icon" />
        <div className="banner-content">
          <strong>Demonstration Student Portal</strong> — Personalized timetable entries and venue allocations displayed for <strong>{STUDENT_PROFILE.name}</strong> ({STUDENT_PROFILE.id}) reflect fictional institutional test records.
        </div>
      </div>

      {/* Summary Cards */}
      <div className="admin-stat-grid" style={{ marginBottom: 28 }}>
        <StatCard
          label="Upcoming Exams"
          value={totalUpcoming}
          icon={<CalendarDaysIcon size={20} />}
          helperText="Final examinations scheduled"
          accent="indigo"
          onClick={() => onNavigate('/student/timetable')}
        />
        <StatCard
          label="Registered Subjects"
          value={totalSubjects}
          icon={<BookOpenIcon size={20} />}
          helperText={`${STUDENT_PROFILE.term} curriculum units`}
          accent="cyan"
          onClick={() => onNavigate('/student/subjects')}
        />
        <StatCard
          label="Next Examination"
          value={nextExam ? nextExam.date.slice(5) : 'None'}
          icon={<ClockIcon size={20} />}
          helperText={nextExam ? `${nextExam.subjectCode} (${nextExam.startTime})` : 'No upcoming papers'}
          accent="emerald"
        />
        <StatCard
          label="Timetable Status"
          value="Published"
          icon={<DoorIcon size={20} />}
          helperText="Official Spring 2026 Schedule"
          accent="violet"
        />
      </div>

      {/* Next Examination Feature Hero Card */}
      {nextExam ? (
        <div className="next-exam-hero-card">
          <div className="next-exam-badge-row">
            <div className="next-exam-lead-tag">
              <span className="pulse-dot" />
              UPCOMING EXAMINATION
            </div>
            <Badge variant="scheduled">{nextExam.status}</Badge>
          </div>

          <div className="next-exam-title-row">
            <div>
              <span className="next-exam-code">{nextExam.subjectCode}</span>
              <h2 className="next-exam-name">{nextExam.subjectName}</h2>
            </div>
            <div className="next-exam-seat-box">
              <span className="seat-label">Assigned Desk</span>
              <span className="seat-number">{nextExam.seatNumber}</span>
            </div>
          </div>

          <div className="next-exam-meta-grid">
            <div className="meta-block">
              <div className="meta-block-icon">
                <CalendarDaysIcon size={18} />
              </div>
              <div className="meta-block-text">
                <span className="meta-label">Date & Day</span>
                <span className="meta-value">{nextExam.day}, {nextExam.date}</span>
              </div>
            </div>

            <div className="meta-block">
              <div className="meta-block-icon">
                <ClockIcon size={18} />
              </div>
              <div className="meta-block-text">
                <span className="meta-label">Time Interval</span>
                <span className="meta-value">{nextExam.timeSlot} ({nextExam.duration})</span>
              </div>
            </div>

            <div className="meta-block">
              <div className="meta-block-icon">
                <DoorIcon size={18} />
              </div>
              <div className="meta-block-text">
                <span className="meta-label">Examination Venue</span>
                <span className="meta-value">{nextExam.room}</span>
                <span className="meta-sub">{nextExam.location}</span>
              </div>
            </div>
          </div>

          <div className="next-exam-footer">
            <span className="next-exam-instruction">
              Please arrive 15 minutes prior to slot start with your student identity card.
            </span>
            <Button
              variant="secondary"
              size="sm"
              icon={<ArrowRightIcon size={14} />}
              onClick={() => onNavigate('/student/timetable')}
            >
              Timetable Details
            </Button>
          </div>
        </div>
      ) : (
        <div className="admin-card empty-state-box">
          <p>No examinations currently scheduled.</p>
        </div>
      )}

      {/* Main Grid: Upcoming List on Left, Quick Actions on Right */}
      <div className="student-dashboard-split-grid">
        {/* Left: Upcoming Examinations List */}
        <div className="admin-card student-exam-list-card">
          <div className="admin-card-header">
            <div>
              <h3 className="admin-card-title">My Examination Schedule</h3>
              <p className="admin-card-subtitle">
                Chronological list of all papers scheduled for your cohort
              </p>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onNavigate('/student/timetable')}
            >
              View Full →
            </Button>
          </div>

          <div className="student-schedule-list">
            {STUDENT_TIMETABLE_ENTRIES.map((entry) => (
              <div key={entry.id} className="student-schedule-item">
                <div className="schedule-date-col">
                  <span className="sc-day">{entry.day.slice(0, 3)}</span>
                  <span className="sc-date">{entry.date.slice(8)}</span>
                  <span className="sc-month">May</span>
                </div>

                <div className="schedule-info-col">
                  <div className="sc-subject-row">
                    <span className="sc-code">{entry.subjectCode}</span>
                    <strong className="sc-name">{entry.subjectName}</strong>
                  </div>
                  <div className="sc-meta-row">
                    <span>
                      <ClockIcon size={13} />
                      {entry.timeSlot}
                    </span>
                    <span>•</span>
                    <span>
                      <DoorIcon size={13} />
                      {entry.room}
                    </span>
                    <span>•</span>
                    <span className="sc-seat">{entry.seatNumber}</span>
                  </div>
                </div>

                <div className="schedule-status-col">
                  <Badge variant={entry.status === 'Optimized' ? 'optimized' : 'scheduled'}>
                    {entry.status}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right: Quick Actions & Profile Overview */}
        <div className="student-side-col">
          {/* Quick Shortcuts */}
          <div className="admin-card">
            <h3 className="admin-card-title">Student Shortcuts</h3>
            <p className="admin-card-subtitle">Quick access to academic resources</p>

            <div className="quick-actions-list">
              <button
                type="button"
                className="quick-action-item"
                onClick={() => onNavigate('/student/timetable')}
              >
                <div className="quick-action-icon indigo">
                  <CalendarDaysIcon size={16} />
                </div>
                <div className="quick-action-info">
                  <span className="qa-title">Full Timetable</span>
                  <span className="qa-desc">Daily view & print format</span>
                </div>
                <ArrowRightIcon size={14} className="qa-arrow" />
              </button>

              <button
                type="button"
                className="quick-action-item"
                onClick={() => onNavigate('/student/subjects')}
              >
                <div className="quick-action-icon cyan">
                  <BookOpenIcon size={16} />
                </div>
                <div className="quick-action-info">
                  <span className="qa-title">My Enrolled Subjects</span>
                  <span className="qa-desc">5 curriculum units</span>
                </div>
                <ArrowRightIcon size={14} className="qa-arrow" />
              </button>

              <button
                type="button"
                className="quick-action-item"
                onClick={() => onNavigate('/student/notifications')}
              >
                <div className="quick-action-icon violet">
                  <BellIcon size={16} />
                </div>
                <div className="quick-action-info">
                  <span className="qa-title">Examination Alerts</span>
                  <span className="qa-desc">Venue changes & notices</span>
                </div>
                <ArrowRightIcon size={14} className="qa-arrow" />
              </button>

              <button
                type="button"
                className="quick-action-item"
                onClick={() => onNavigate('/student/profile')}
              >
                <div className="quick-action-icon emerald">
                  <UserIcon size={16} />
                </div>
                <div className="quick-action-info">
                  <span className="qa-title">Student Profile</span>
                  <span className="qa-desc">{STUDENT_PROFILE.id}</span>
                </div>
                <ArrowRightIcon size={14} className="qa-arrow" />
              </button>
            </div>
          </div>

          {/* Academic Profile Snippet */}
          <div className="admin-card student-profile-mini-card">
            <div className="mini-profile-header">
              <div className="mini-avatar">{STUDENT_PROFILE.initials}</div>
              <div>
                <h4 className="mini-name">{STUDENT_PROFILE.name}</h4>
                <span className="mini-id">{STUDENT_PROFILE.id}</span>
              </div>
            </div>
            <div className="mini-profile-details">
              <div className="mini-detail-row">
                <span className="md-label">Program:</span>
                <span className="md-value">{STUDENT_PROFILE.className}</span>
              </div>
              <div className="mini-detail-row">
                <span className="md-label">Division:</span>
                <span className="md-value">{STUDENT_PROFILE.division}</span>
              </div>
              <div className="mini-detail-row">
                <span className="md-label">Academic Advisor:</span>
                <span className="md-value">{STUDENT_PROFILE.advisor}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default StudentOverviewPage;
