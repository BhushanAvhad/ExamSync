import { useState, useRef, useEffect } from 'react';
import {
  MenuIcon,
  SunIcon,
  MoonIcon,
  BellIcon,
  ChevronDownIcon,
  LogOutIcon,
  UserIcon,
  HelpCircleIcon,
} from '../ui/Icons';
import { STUDENT_PROFILE, INITIAL_STUDENT_NOTIFICATIONS } from '../../data/studentDemoData';
import { useAuth } from '../../context/useAuth';

const PAGE_META = {
  '/student': { title: 'Overview', category: 'Student Portal' },
  '/student/timetable': { title: 'My Timetable', category: 'Examinations' },
  '/student/subjects': { title: 'My Subjects', category: 'Curriculum' },
  '/student/notifications': { title: 'Notifications', category: 'Alerts' },
  '/student/profile': { title: 'My Profile', category: 'Account' },
  '/student/help': { title: 'Help & Support', category: 'Guidance' },
};

export function StudentTopbar({
  currentPath,
  onNavigate,
  theme,
  onToggleTheme,
  onOpenMobile,
  notifications = INITIAL_STUDENT_NOTIFICATIONS,
}) {
  const [profileOpen, setProfileOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const profileRef = useRef(null);
  const notifRef = useRef(null);

  const meta = PAGE_META[currentPath] || { title: 'Student Portal', category: 'ExamSync' };
  const unreadCount = notifications.filter((n) => !n.read).length;

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (profileRef.current && !profileRef.current.contains(e.target)) {
        setProfileOpen(false);
      }
      if (notifRef.current && !notifRef.current.contains(e.target)) {
        setNotifOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const { user, profile, signOut } = useAuth();
  const [dynProfile, setDynProfile] = useState(null);

  useEffect(() => {
    async function resolve() {
      if (user?.id || user?.email) {
        const res = await studentPortalService.getProfile(user?.id, user?.email, user?.user_metadata);
        if (res?.data) setDynProfile(res.data);
      }
    }
    resolve();
  }, [user]);

  const studentName =
    dynProfile?.name ||
    profile?.full_name ||
    user?.user_metadata?.full_name ||
    (user?.email
      ? user.email.split('@')[0].replace(/[._-]/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())
      : 'VIT Student');

  const studentEmail =
    dynProfile?.email ||
    profile?.email ||
    user?.email ||
    'student@vit.edu.in';

  const studentInitials =
    dynProfile?.initials ||
    (studentName
      .split(' ')
      .filter(Boolean)
      .map((w) => w[0])
      .slice(0, 2)
      .join('')
      .toUpperCase() || 'ST');

  const handleSignOut = async () => {
    setProfileOpen(false);
    try {
      await signOut();
    } finally {
      onNavigate('/student-login');
    }
  };

  return (
    <header className="admin-topbar student-topbar">
      <div className="admin-topbar-left">
        {/* Mobile menu trigger */}
        <button
          type="button"
          className="admin-mobile-menu-btn"
          onClick={onOpenMobile}
          aria-label="Open navigation menu"
        >
          <MenuIcon size={20} />
        </button>

        {/* Breadcrumb / Title display */}
        <div className="admin-topbar-breadcrumb">
          <span className="topbar-crumb-category">{meta.category}</span>
          <span className="topbar-crumb-sep">/</span>
          <span className="topbar-crumb-title">{meta.title}</span>
        </div>
      </div>

      <div className="admin-topbar-right">
        {/* Session Badge Indicator */}
        <div className="student-session-indicator">
          <span className="student-indicator-dot" />
          <span className="student-indicator-text">{STUDENT_PROFILE.term}</span>
        </div>

        {/* Notification Bell Dropdown */}
        <div className="topbar-dropdown-container" ref={notifRef}>
          <button
            type="button"
            className="topbar-icon-btn"
            onClick={() => setNotifOpen(!notifOpen)}
            aria-label="Notifications"
            aria-expanded={notifOpen}
            title="Notifications"
          >
            <BellIcon size={18} />
            {unreadCount > 0 && <span className="notif-unread-dot" />}
          </button>

          {notifOpen && (
            <div className="topbar-popover notif-popover">
              <div className="notif-header">
                <span className="notif-title">Examination Alerts</span>
                <span className="notif-count">{unreadCount} unread</span>
              </div>
              <ul className="notif-list">
                {notifications.slice(0, 3).map((n) => (
                  <li key={n.id} className="notif-item">
                    <div className={`notif-item-dot ${n.read ? 'is-read' : ''}`} />
                    <div className="notif-item-body">
                      <div className="notif-item-title">{n.title}</div>
                      <div className="notif-item-time">{n.timestamp}</div>
                    </div>
                  </li>
                ))}
              </ul>
              <div className="notif-footer">
                <button
                  type="button"
                  className="filter-reset-link"
                  onClick={() => {
                    setNotifOpen(false);
                    onNavigate('/student/notifications');
                  }}
                >
                  View All Notifications →
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Theme Toggle */}
        <button
          type="button"
          className="topbar-icon-btn"
          onClick={onToggleTheme}
          aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
          title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
        >
          {theme === 'dark' ? <SunIcon size={18} /> : <MoonIcon size={18} />}
        </button>

        {/* Student Profile Dropdown */}
        <div className="topbar-dropdown-container" ref={profileRef}>
          <button
            type="button"
            className="topbar-profile-btn"
            onClick={() => setProfileOpen(!profileOpen)}
            aria-expanded={profileOpen}
            aria-label="Student Profile Menu"
          >
            <div className="topbar-avatar student-avatar-gradient">
              <span>{studentInitials}</span>
            </div>
            <div className="topbar-profile-info">
              <span className="topbar-admin-name">{studentName}</span>
              <span className="topbar-admin-role">VIT Student</span>
            </div>
            <ChevronDownIcon size={14} className={`topbar-chevron ${profileOpen ? 'is-rotated' : ''}`} />
          </button>

          {profileOpen && (
            <div className="topbar-popover profile-popover">
              <div className="profile-popover-header">
                <div className="profile-popover-avatar student-avatar-gradient">
                  {studentInitials}
                </div>
                <div className="profile-popover-details">
                  <span className="profile-popover-name">{studentName}</span>
                  <span className="profile-popover-email">{studentEmail}</span>
                  <span className="profile-cohort-sub">{profile?.department || 'Candidate'}</span>
                </div>
              </div>

              <div className="profile-popover-menu">
                <button
                  type="button"
                  className="profile-menu-item"
                  onClick={() => {
                    setProfileOpen(false);
                    onNavigate('/student/profile');
                  }}
                >
                  <UserIcon size={16} />
                  <span>View Full Profile</span>
                </button>
                <button
                  type="button"
                  className="profile-menu-item"
                  onClick={() => {
                    setProfileOpen(false);
                    onNavigate('/student/help');
                  }}
                >
                  <HelpCircleIcon size={16} />
                  <span>Help & Exam Guidelines</span>
                </button>
              </div>

              <div className="profile-popover-footer">
                <button
                  type="button"
                  className="profile-menu-item sign-out"
                  onClick={handleSignOut}
                >
                  <LogOutIcon size={16} />
                  <span>Sign Out</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}

export default StudentTopbar;
