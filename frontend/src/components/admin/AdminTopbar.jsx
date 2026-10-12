import { useState, useRef, useEffect } from 'react';
import {
  MenuIcon,
  SunIcon,
  MoonIcon,
  BellIcon,
  SearchIcon,
  ChevronDownIcon,
  LogOutIcon,
  SettingsIcon,
  UserIcon,
} from '../ui/Icons';
import { DEMO_NOTIFICATIONS } from '../../data/adminDemoData';
import { useAuth } from '../../context/useAuth';

const PAGE_META = {
  '/admin': { title: 'Overview', category: 'Workspace' },
  '/admin/students': { title: 'Students', category: 'Workspace' },
  '/admin/academics': { title: 'Classes & Subjects', category: 'Workspace' },
  '/admin/rooms': { title: 'Exam Rooms', category: 'Workspace' },
  '/admin/exams': { title: 'Exam Sessions', category: 'Workspace' },
  '/admin/generate-timetable': { title: 'Generate Timetable', category: 'Scheduling' },
  '/admin/timetable': { title: 'Timetable', category: 'Scheduling' },
  '/admin/conflicts': { title: 'Conflicts', category: 'Scheduling' },
  '/admin/reports': { title: 'Reports', category: 'System' },
  '/admin/settings': { title: 'Settings', category: 'System' },
};

export function AdminTopbar({
  currentPath,
  onNavigate,
  theme,
  onToggleTheme,
  onOpenMobile,
}) {
  const [profileOpen, setProfileOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const profileRef = useRef(null);
  const notifRef = useRef(null);

  const meta = PAGE_META[currentPath] || { title: 'Dashboard', category: 'Admin' };

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

  const { profile, signOut } = useAuth();
  const adminName = profile?.full_name || 'Dr. Eleanor Vance';
  const adminEmail = profile?.email || 'eleanor.vance@university.edu';
  const adminInitials = adminName
    .split(' ')
    .filter(Boolean)
    .map((w) => w[0])
    .slice(0, 2)
    .join('')
    .toUpperCase() || 'AD';

  const handleSignOut = async () => {
    setProfileOpen(false);
    try {
      await signOut();
    } finally {
      onNavigate('/admin-login');
    }
  };

  return (
    <header className="admin-topbar">
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
        {/* Quick Global Search Trigger (demo preview) */}
        <div className="topbar-search-wrapper">
          <SearchIcon size={15} className="topbar-search-icon" />
          <input
            type="text"
            className="topbar-search-input"
            placeholder="Search records or modules..."
            aria-label="Global quick search"
          />
          <kbd className="topbar-kbd">⌘K</kbd>
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
            <span className="notif-unread-dot" />
          </button>

          {notifOpen && (
            <div className="topbar-popover notif-popover">
              <div className="notif-header">
                <span className="notif-title">Notifications</span>
                <span className="notif-count">3 unread</span>
              </div>
              <ul className="notif-list">
                {DEMO_NOTIFICATIONS.map((n) => (
                  <li key={n.id} className="notif-item">
                    <div className="notif-item-dot" />
                    <div className="notif-item-body">
                      <div className="notif-item-title">{n.title}</div>
                      <div className="notif-item-time">{n.time}</div>
                    </div>
                  </li>
                ))}
              </ul>
              <div className="notif-footer">
                <span className="demo-notice-text">Demonstration notifications only</span>
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

        {/* Admin Profile Dropdown */}
        <div className="topbar-dropdown-container" ref={profileRef}>
          <button
            type="button"
            className="topbar-profile-btn"
            onClick={() => setProfileOpen(!profileOpen)}
            aria-expanded={profileOpen}
            aria-label="Admin Profile Menu"
          >
            <div className="topbar-avatar">
              <span>{adminInitials}</span>
            </div>
            <div className="topbar-profile-info">
              <span className="topbar-admin-name">{adminName}</span>
              <span className="topbar-admin-role">Institutional Admin</span>
            </div>
            <ChevronDownIcon size={14} className={`topbar-chevron ${profileOpen ? 'is-rotated' : ''}`} />
          </button>

          {profileOpen && (
            <div className="topbar-popover profile-popover">
              <div className="profile-popover-header">
                <div className="profile-popover-avatar">{adminInitials}</div>
                <div className="profile-popover-details">
                  <span className="profile-popover-name">{adminName}</span>
                  <span className="profile-popover-email">{adminEmail}</span>
                </div>
              </div>

              <div className="profile-popover-menu">
                <button
                  type="button"
                  className="profile-menu-item"
                  onClick={() => {
                    setProfileOpen(false);
                    onNavigate('/admin/settings');
                  }}
                >
                  <SettingsIcon size={16} />
                  <span>Admin Settings</span>
                </button>
                <button
                  type="button"
                  className="profile-menu-item"
                  onClick={() => {
                    setProfileOpen(false);
                    onNavigate('/admin/settings');
                  }}
                >
                  <UserIcon size={16} />
                  <span>Profile Preferences</span>
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

export default AdminTopbar;
