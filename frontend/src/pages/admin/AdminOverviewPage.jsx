import { useState } from 'react';
import { PageHeader } from '../../components/admin/PageHeader';
import { StatCard } from '../../components/admin/StatCard';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import {
  UsersIcon,
  BookOpenIcon,
  DoorIcon,
  CalendarDaysIcon,
  SparklesIcon,
  ArrowRightIcon,
  ClockIcon,
  CpuIcon,
  InfoIcon,
} from '../../components/ui/Icons';
import {
  INITIAL_SUMMARY_STATS,
  INITIAL_EXAM_SESSIONS,
  RECENT_ACTIVITIES,
} from '../../data/adminDemoData';

export function AdminOverviewPage({ onNavigate }) {
  const [activeSession, setActiveSession] = useState('SESS-2026-02');
  const session = INITIAL_EXAM_SESSIONS.find((s) => s.id === activeSession) || INITIAL_EXAM_SESSIONS[1];

  return (
    <div className="admin-page-content">
      {/* Page Header */}
      <PageHeader
        title="Institutional Examination Overview"
        subtitle="Manage academic schedules, venues, algorithmic optimizations, and timetable publications."
        category="Workspace"
        badge={
          <span className="overview-cycle-pill">
            <span className="cycle-dot" />
            Active Term: Spring 2026
          </span>
        }
        actions={
          <div className="header-action-group">
            <Button
              variant="secondary"
              size="sm"
              icon={<CalendarDaysIcon size={16} />}
              onClick={() => onNavigate('/admin/exams')}
            >
              Manage Sessions
            </Button>
            <Button
              variant="primary"
              size="sm"
              icon={<CpuIcon size={16} />}
              onClick={() => onNavigate('/admin/generate-timetable')}
            >
              Generate Timetable
            </Button>
          </div>
        }
      />

      {/* Demo Notice Banner */}
      <div className="admin-banner info-banner">
        <InfoIcon size={18} className="banner-icon" />
        <div className="banner-content">
          <strong>Interactive UI Prototype</strong> — The metrics, schedules, and activities displayed below are institutional demo data. Live database sync and real AI optimization will be connected in Phase 3.
        </div>
      </div>

      {/* Summary Stat Cards */}
      <div className="admin-stat-grid">
        <StatCard
          label="Total Enrolled Students"
          value={INITIAL_SUMMARY_STATS.totalStudents.toLocaleString()}
          icon={<UsersIcon size={20} />}
          helperText="Across 8 academic cohorts"
          accent="indigo"
          onClick={() => onNavigate('/admin/students')}
        />
        <StatCard
          label="Active Exam Subjects"
          value={INITIAL_SUMMARY_STATS.activeSubjects}
          icon={<BookOpenIcon size={20} />}
          helperText="Registered for examination cycle"
          accent="cyan"
          onClick={() => onNavigate('/admin/academics')}
        />
        <StatCard
          label="Exam Venues & Rooms"
          value={`${INITIAL_SUMMARY_STATS.availableRooms} / ${INITIAL_SUMMARY_STATS.examRooms}`}
          icon={<DoorIcon size={20} />}
          helperText={`${INITIAL_SUMMARY_STATS.availableRooms} currently available`}
          accent="violet"
          onClick={() => onNavigate('/admin/rooms')}
        />
        <StatCard
          label="Scheduled Examinations"
          value={INITIAL_SUMMARY_STATS.scheduledExams}
          icon={<CalendarDaysIcon size={20} />}
          helperText="Spread over 12 examination days"
          accent="emerald"
          onClick={() => onNavigate('/admin/timetable')}
        />
      </div>

      {/* Main Grid: Status & Upcoming on Left, Activity on Right */}
      <div className="overview-main-grid">
        {/* Left Column */}
        <div className="overview-col-left">
          {/* Active Examination Cycle Card */}
          <div className="admin-card">
            <div className="admin-card-header">
              <div>
                <h3 className="admin-card-title">Current Examination Session</h3>
                <p className="admin-card-subtitle">
                  Configure session timeline or switch active planning cycle
                </p>
              </div>
              <select
                className="session-select-control"
                value={activeSession}
                onChange={(e) => setActiveSession(e.target.value)}
                aria-label="Select Examination Session"
              >
                {INITIAL_EXAM_SESSIONS.map((sess) => (
                  <option key={sess.id} value={sess.id}>
                    {sess.name} ({sess.status})
                  </option>
                ))}
              </select>
            </div>

            <div className="session-detail-strip">
              <div className="detail-pill">
                <span className="pill-label">Academic Term</span>
                <span className="pill-value">{session.term}</span>
              </div>
              <div className="detail-pill">
                <span className="pill-label">Start Date</span>
                <span className="pill-value">{session.startDate}</span>
              </div>
              <div className="detail-pill">
                <span className="pill-label">End Date</span>
                <span className="pill-value">{session.endDate}</span>
              </div>
              <div className="detail-pill">
                <span className="pill-label">Session Status</span>
                <Badge variant={session.status === 'Completed' ? 'available' : session.status === 'Scheduled' ? 'scheduled' : 'pending'}>
                  {session.status}
                </Badge>
              </div>
            </div>

            <p className="session-description-text">{session.description}</p>

            <div className="session-card-actions">
              <Button
                variant="secondary"
                size="sm"
                onClick={() => onNavigate('/admin/timetable')}
              >
                View Session Timetable
              </Button>
              <Button
                variant="primary"
                size="sm"
                icon={<CpuIcon size={14} />}
                onClick={() => onNavigate('/admin/generate-timetable')}
              >
                Run Scheduling Workflow
              </Button>
            </div>
          </div>

          {/* Timetable Publication Status Card */}
          <div className="admin-card publication-status-card">
            <div className="publication-status-body">
              <div className="pub-status-indicator">
                <div className="pub-status-badge draft">
                  <ClockIcon size={16} />
                  <span>Draft v1.4</span>
                </div>
                <div className="pub-meta">
                  <h4>Timetable Status: Not Published to Students</h4>
                  <p>
                    The timetable draft is undergoing conflict verification. Examination dates are hidden from student portal accounts until official publication.
                  </p>
                </div>
              </div>

              <div className="publication-actions">
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => onNavigate('/admin/conflicts')}
                >
                  Review Conflicts (4)
                </Button>
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => onNavigate('/admin/timetable')}
                >
                  Preview & Publish
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Quick Links & Activity Log */}
        <div className="overview-col-right">
          {/* Quick Actions Card */}
          <div className="admin-card">
            <h3 className="admin-card-title">Quick Administration</h3>
            <p className="admin-card-subtitle">Common workflow shortcuts</p>

            <div className="quick-actions-list">
              <button
                type="button"
                className="quick-action-item"
                onClick={() => onNavigate('/admin/students')}
              >
                <div className="quick-action-icon indigo">
                  <UsersIcon size={16} />
                </div>
                <div className="quick-action-info">
                  <span className="qa-title">Manage Students</span>
                  <span className="qa-desc">Search, enroll, or inspect cohorts</span>
                </div>
                <ArrowRightIcon size={14} className="qa-arrow" />
              </button>

              <button
                type="button"
                className="quick-action-item"
                onClick={() => onNavigate('/admin/academics')}
              >
                <div className="quick-action-icon cyan">
                  <BookOpenIcon size={16} />
                </div>
                <div className="quick-action-info">
                  <span className="qa-title">Classes & Subjects</span>
                  <span className="qa-desc">Configure syllabi and cohort links</span>
                </div>
                <ArrowRightIcon size={14} className="qa-arrow" />
              </button>

              <button
                type="button"
                className="quick-action-item"
                onClick={() => onNavigate('/admin/rooms')}
              >
                <div className="quick-action-icon violet">
                  <DoorIcon size={16} />
                </div>
                <div className="quick-action-info">
                  <span className="qa-title">Exam Rooms & Halls</span>
                  <span className="qa-desc">Review capacities and room status</span>
                </div>
                <ArrowRightIcon size={14} className="qa-arrow" />
              </button>

              <button
                type="button"
                className="quick-action-item"
                onClick={() => onNavigate('/admin/generate-timetable')}
              >
                <div className="quick-action-icon emerald">
                  <SparklesIcon size={16} />
                </div>
                <div className="quick-action-info">
                  <span className="qa-title">Generate Timetable</span>
                  <span className="qa-desc">Configure constraints and parameters</span>
                </div>
                <ArrowRightIcon size={14} className="qa-arrow" />
              </button>
            </div>
          </div>

          {/* Recent Activity Log */}
          <div className="admin-card">
            <h3 className="admin-card-title">Recent Activity</h3>
            <p className="admin-card-subtitle">Local system log of scheduling actions</p>

            <ul className="recent-activity-list">
              {RECENT_ACTIVITIES.map((act) => (
                <li key={act.id} className="activity-entry">
                  <div className="activity-dot" />
                  <div className="activity-details">
                    <div className="activity-action-row">
                      <span className="activity-action-name">{act.action}</span>
                      <span className="activity-time">{act.time}</span>
                    </div>
                    <p className="activity-detail-text">{act.detail}</p>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AdminOverviewPage;
