import { useState, useEffect } from 'react';
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
  ShieldCheckIcon,
} from '../../components/ui/Icons';
import {
  STUDENT_PROFILE,
  STUDENT_TIMETABLE_ENTRIES,
  STUDENT_SUBJECTS,
} from '../../data/studentDemoData';
import { useAuth } from '../../context/useAuth';
import { studentPortalService } from '../../services/studentPortalService';

export function StudentOverviewPage({ onNavigate }) {
  const { user, profile: authProfile } = useAuth();
  const [profile, setProfile] = useState(STUDENT_PROFILE);
  const [timetable, setTimetable] = useState(STUDENT_TIMETABLE_ENTRIES);
  const [subjects, setSubjects] = useState(STUDENT_SUBJECTS);

  useEffect(() => {
    async function load() {
      if (user?.id || user?.email) {
        const [profRes, ttRes, subRes] = await Promise.all([
          studentPortalService.getProfile(user?.id, user?.email, user?.user_metadata),
          studentPortalService.getStudentTimetable(user?.id, user?.email),
          studentPortalService.getRegisteredSubjects(user?.id, user?.email),
        ]);
        if (profRes.data) setProfile(profRes.data);
        if (ttRes.data && ttRes.data.length > 0) {
          setTimetable(ttRes.data);
        } else {
          setTimetable(STUDENT_TIMETABLE_ENTRIES);
        }
        if (subRes.data && subRes.data.length > 0) setSubjects(subRes.data);
      } else if (authProfile) {
        setProfile((prev) => ({
          ...prev,
          name: authProfile.full_name || prev.name,
          email: authProfile.email || prev.email,
        }));
      }
    }
    load();

    const handlePublishedUpdate = () => {
      load();
    };
    window.addEventListener('examsync_timetable_published', handlePublishedUpdate);
    window.addEventListener('examsync_timetable_updated', handlePublishedUpdate);
    window.addEventListener('storage', handlePublishedUpdate);
    return () => {
      window.removeEventListener('examsync_timetable_published', handlePublishedUpdate);
      window.removeEventListener('examsync_timetable_updated', handlePublishedUpdate);
      window.removeEventListener('storage', handlePublishedUpdate);
    };
  }, [user, authProfile]);

  const nextExam = timetable[0];
  const totalUpcoming = timetable.length;
  const totalSubjects = subjects.length;

  return (
    <div className="admin-page-content student-overview-content">
      {/* Welcome Page Header */}
      <PageHeader
        title={`Welcome back, ${profile.name}`}
        subtitle={`Vidyalankar Institute of Technology (VIT) — Examination Schedule & Hall Allocations for ${profile.className} (${profile.division}).`}
        category="Student Portal"
        badge={
          <span className="overview-cycle-pill student-cycle-pill">
            <span className="cycle-dot" />
            {profile.className} • {profile.division}
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

      {/* Candidate Verification Banner */}
      <div className="admin-banner info-banner" style={{ borderLeft: '4px solid #06b6d4' }}>
        <ShieldCheckIcon size={18} className="banner-icon" style={{ color: '#06b6d4' }} />
        <div className="banner-content">
          <strong>Authenticated Student Portal</strong> — Official candidate record active for{' '}
          <strong>{profile.name}</strong> (Candidate ID: <code>{profile.id}</code>). All timetable slots, venue blocks, and seat allocations are synchronized with VIT Wadala examinations office.
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
          helperText={`${profile.term} curriculum units`}
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
                Chronological list of all papers scheduled for {profile.className}
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
            {timetable.map((entry) => (
              <div key={entry.id} className="student-schedule-item">
                <div className="schedule-date-col">
                  <span className="sc-day">{entry.day ? entry.day.slice(0, 3) : 'DAY'}</span>
                  <span className="sc-date">{entry.date ? entry.date.slice(8) : '01'}</span>
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
                  <span className="qa-title">Hall Ticket & Timetable</span>
                  <span className="qa-desc">Daily view & print admit card</span>
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
                  <span className="qa-desc">{totalSubjects} curriculum units</span>
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
                  <span className="qa-desc">{profile.id}</span>
                </div>
                <ArrowRightIcon size={14} className="qa-arrow" />
              </button>
            </div>
          </div>

          {/* Academic Profile Snippet */}
          <div className="admin-card student-profile-mini-card">
            <div className="mini-profile-header">
              <div className="mini-avatar">{profile.initials}</div>
              <div>
                <h4 className="mini-name">{profile.name}</h4>
                <span className="mini-id">{profile.id}</span>
              </div>
            </div>
            <div className="mini-profile-details">
              <div className="mini-detail-row">
                <span className="md-label">Program:</span>
                <span className="md-value">{profile.className}</span>
              </div>
              <div className="mini-detail-row">
                <span className="md-label">Division:</span>
                <span className="md-value">{profile.division}</span>
              </div>
              <div className="mini-detail-row">
                <span className="md-label">Academic Advisor:</span>
                <span className="md-value">{profile.advisor}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default StudentOverviewPage;
