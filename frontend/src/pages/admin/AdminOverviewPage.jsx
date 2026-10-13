import { useState, useEffect, useCallback } from 'react';
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
  ShieldCheckIcon,
} from '../../components/ui/Icons';
import {
  INITIAL_SUMMARY_STATS,
  INITIAL_EXAM_SESSIONS,
  RECENT_ACTIVITIES,
} from '../../data/adminDemoData';
import { studentsService } from '../../services/studentsService';
import { academicsService } from '../../services/academicsService';
import { roomsService } from '../../services/roomsService';
import { sessionsService } from '../../services/sessionsService';
import { timetablesService } from '../../services/timetablesService';

export function AdminOverviewPage({ onNavigate }) {
  const [sessions, setSessions] = useState(INITIAL_EXAM_SESSIONS);
  const [activeSession, setActiveSession] = useState('SESS-2026-02');
  const [stats, setStats] = useState(INITIAL_SUMMARY_STATS);
  const [activities, setActivities] = useState(RECENT_ACTIVITIES);

  const loadStats = useCallback(async () => {
    try {
      const [studRes, subjRes, roomRes, sessRes, ttRes] = await Promise.all([
        studentsService.getStudents(),
        academicsService.getSubjects(),
        roomsService.getRooms(),
        sessionsService.getExamSessions(),
        timetablesService.getTimetables(),
      ]);

      if (sessRes.data && sessRes.data.length > 0) {
        setSessions(sessRes.data);
        setActiveSession(sessRes.data[0].id);
      }

      const studentList = studRes.data || [];
      const subjectList = subjRes.data || [];
      const roomList = roomRes.data || [];
      const availRooms = roomList.filter((r) => r.status === 'Available').length;
      const scheduledCount = ttRes.data?.length || 0;

      let isLive = false;
      try {
        const activePub = localStorage.getItem('examsync_session_published_active');
        if (activePub) isLive = JSON.parse(activePub).isPublished;
      } catch (e) {}

      setStats({
        totalStudents: studentList.length,
        activeSubjects: subjectList.length,
        examRooms: roomList.length,
        availableRooms: availRooms,
        scheduledExams: scheduledCount > 0 ? scheduledCount : INITIAL_SUMMARY_STATS.scheduledExams,
        currentSession: sessRes.data?.[0]?.name || INITIAL_SUMMARY_STATS.currentSession,
        timetableStatus: isLive ? 'Published — Live on Student Portal' : 'Draft v1.4 — Unpublished',
      });

      // Load dynamic activities from storage
      try {
        const rawAct = localStorage.getItem('examsync_recent_activities');
        if (rawAct) {
          const stored = JSON.parse(rawAct);
          if (Array.isArray(stored) && stored.length > 0) {
            setActivities([...stored, ...RECENT_ACTIVITIES.slice(0, 3)]);
          }
        }
      } catch (e) {
        // ignore
      }
    } catch (err) {
      console.error('Failed to load live overview metrics:', err);
    }
  }, []);

  useEffect(() => {
    loadStats();
  }, [loadStats]);

  // Reactive listeners for dynamic updates across the application
  useEffect(() => {
    const handleUpdate = () => {
      loadStats();
    };
    window.addEventListener('examsync_students_updated', handleUpdate);
    window.addEventListener('examsync_activity_logged', handleUpdate);
    window.addEventListener('examsync_timetable_published', handleUpdate);
    return () => {
      window.removeEventListener('examsync_students_updated', handleUpdate);
      window.removeEventListener('examsync_activity_logged', handleUpdate);
      window.removeEventListener('examsync_timetable_published', handleUpdate);
    };
  }, [loadStats]);

  const session = sessions.find((s) => s.id === activeSession) || sessions[0] || INITIAL_EXAM_SESSIONS[1];

  return (
    <div className="admin-page-content">
      {/* Page Header */}
      <PageHeader
        title="Institutional Examination Overview"
        subtitle="Vidyalankar Institute of Technology (VIT), Wadala — Examination scheduling, venue allocations, and candidate management."
        category="Workspace"
        badge={
          <span className="overview-cycle-pill">
            <span className="cycle-dot" />
            Active Term: Spring 2026 (VIT Mumbai)
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

      {/* Dynamic System Status Banner */}
      <div className="admin-banner info-banner" style={{ borderLeft: '4px solid #10b981' }}>
        <ShieldCheckIcon size={18} className="banner-icon" style={{ color: '#10b981' }} />
        <div className="banner-content">
          <strong>Dynamic Production Environment</strong> — Real-time synchronization active. Currently tracking{' '}
          <strong>{stats.totalStudents} enrolled candidates</strong>, <strong>{stats.activeSubjects} curriculum subjects</strong>, and{' '}
          <strong>{stats.examRooms} campus exam venues</strong> at Vidyalankar Institute of Technology.
        </div>
      </div>

      {/* Summary Stat Cards */}
      <div className="admin-stat-grid">
        <StatCard
          label="Total Enrolled Students"
          value={stats.totalStudents.toLocaleString()}
          icon={<UsersIcon size={20} />}
          helperText="Dynamic candidate roster"
          accent="indigo"
          onClick={() => onNavigate('/admin/students')}
        />
        <StatCard
          label="Active Exam Subjects"
          value={stats.activeSubjects}
          icon={<BookOpenIcon size={20} />}
          helperText="VIT academic curriculum units"
          accent="cyan"
          onClick={() => onNavigate('/admin/academics')}
        />
        <StatCard
          label="Exam Venues & Rooms"
          value={`${stats.availableRooms} / ${stats.examRooms}`}
          icon={<DoorIcon size={20} />}
          helperText={`${stats.availableRooms} currently available`}
          accent="violet"
          onClick={() => onNavigate('/admin/rooms')}
        />
        <StatCard
          label="Scheduled Examinations"
          value={stats.scheduledExams}
          icon={<CalendarDaysIcon size={20} />}
          helperText="Active in timetable session"
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
                  <span>Verified Schedule</span>
                </div>
                <div className="pub-meta">
                  <h4>Timetable Status: Synchronized & Published</h4>
                  <p>
                    Algorithmic timetable optimization is active. Examination schedules are automatically matched with candidate cohorts across VIT campus blocks.
                  </p>
                </div>
              </div>

              <div className="publication-actions">
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => onNavigate('/admin/conflicts')}
                >
                  Review Conflicts
                </Button>
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => onNavigate('/admin/timetable')}
                >
                  Manage Timetable
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
                  <span className="qa-desc">Search, import CSV, or inspect cohorts</span>
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
                  <span className="qa-desc">Configure VIT syllabi and cohort links</span>
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
                  <span className="qa-desc">Review capacities in Blocks A–M & Labs</span>
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
                  <span className="qa-desc">Run Genetic Algorithm optimizer</span>
                </div>
                <ArrowRightIcon size={14} className="qa-arrow" />
              </button>
            </div>
          </div>

          {/* Recent Activity Log (Dynamic) */}
          <div className="admin-card">
            <h3 className="admin-card-title">Recent Activity</h3>
            <p className="admin-card-subtitle">Real-time system log of scheduling actions</p>

            <ul className="recent-activity-list">
              {activities.slice(0, 6).map((act) => (
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
