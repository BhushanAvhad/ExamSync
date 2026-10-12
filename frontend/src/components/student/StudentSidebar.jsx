import {
  BrandLogoIcon,
  LayoutDashboardIcon,
  TableIcon,
  BookOpenIcon,
  BellIcon,
  UserIcon,
  HelpCircleIcon,
  LogOutIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  XIcon,
} from '../ui/Icons';
import { useAuth } from '../../context/useAuth';

export function StudentSidebar({
  currentPath,
  onNavigate,
  collapsed,
  onToggleCollapse,
  mobileOpen,
  onCloseMobile,
  unreadCount = 2,
}) {
  const navItems = [
    { path: '/student', label: 'Overview', icon: <LayoutDashboardIcon size={18} /> },
    { path: '/student/timetable', label: 'My Timetable', icon: <TableIcon size={18} /> },
    { path: '/student/subjects', label: 'My Subjects', icon: <BookOpenIcon size={18} /> },
    {
      path: '/student/notifications',
      label: 'Notifications',
      icon: <BellIcon size={18} />,
      badge: unreadCount > 0 ? unreadCount : null,
    },
    { path: '/student/profile', label: 'My Profile', icon: <UserIcon size={18} /> },
  ];

  const handleItemClick = (path) => {
    onNavigate(path);
    if (mobileOpen && onCloseMobile) {
      onCloseMobile();
    }
  };

  const { signOut } = useAuth();

  const handleSignOut = async () => {
    try {
      await signOut();
    } finally {
      onNavigate('/student-login');
      if (mobileOpen && onCloseMobile) {
        onCloseMobile();
      }
    }
  };

  return (
    <>
      {mobileOpen && (
        <div
          className="admin-sidebar-backdrop"
          onClick={onCloseMobile}
          aria-hidden="true"
        />
      )}

      <aside
        className={`admin-sidebar student-sidebar ${collapsed ? 'is-collapsed' : ''} ${mobileOpen ? 'is-mobile-open' : ''}`}
        aria-label="Student Navigation"
      >
        {/* Sidebar Brand Header */}
        <div className="admin-sidebar-header">
          <button
            type="button"
            className="admin-brand-btn"
            onClick={() => handleItemClick('/student')}
            aria-label="ExamSync Student Home"
          >
            <div className="admin-brand-icon student-accent-icon">
              <BrandLogoIcon size={18} />
            </div>
            {!collapsed && (
              <div className="admin-brand-text">
                <span className="brand-name">
                  Exam<span className="brand-accent">Sync</span>
                </span>
                <span className="brand-role-tag student-tag">Student Portal</span>
              </div>
            )}
          </button>

          {/* Mobile close button */}
          <button
            type="button"
            className="admin-sidebar-mobile-close"
            onClick={onCloseMobile}
            aria-label="Close menu"
          >
            <XIcon size={18} />
          </button>
        </div>

        {/* Sidebar Navigation Items */}
        <nav className="admin-sidebar-nav">
          <div className="nav-group">
            {!collapsed && <div className="nav-group-heading">Academic Portal</div>}
            <ul className="nav-item-list">
              {navItems.map((item) => {
                const isActive = currentPath === item.path;
                return (
                  <li key={item.path}>
                    <button
                      type="button"
                      className={`nav-item-btn ${isActive ? 'is-active' : ''}`}
                      onClick={() => handleItemClick(item.path)}
                      title={collapsed ? item.label : undefined}
                      aria-current={isActive ? 'page' : undefined}
                    >
                      <span className="nav-item-icon">{item.icon}</span>
                      {!collapsed && <span className="nav-item-label">{item.label}</span>}
                      {!collapsed && item.badge && (
                        <span className="nav-item-badge student-badge">{item.badge}</span>
                      )}
                    </button>
                  </li>
                );
              })}
            </ul>
          </div>
        </nav>

        {/* Desktop Collapse Toggle */}
        <div className="admin-sidebar-collapse-section">
          <button
            type="button"
            className="admin-collapse-toggle-btn"
            onClick={onToggleCollapse}
            aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            {collapsed ? <ChevronRightIcon size={16} /> : <ChevronLeftIcon size={16} />}
            {!collapsed && <span>Collapse Sidebar</span>}
          </button>
        </div>

        {/* Bottom Support & Sign Out */}
        <div className="admin-sidebar-footer">
          <button
            type="button"
            className={`nav-item-btn ${currentPath === '/student/help' ? 'is-active' : ''}`}
            onClick={() => handleItemClick('/student/help')}
            title={collapsed ? 'Help & Support' : undefined}
          >
            <span className="nav-item-icon">
              <HelpCircleIcon size={18} />
            </span>
            {!collapsed && <span className="nav-item-label">Help & Support</span>}
          </button>

          <button
            type="button"
            className="nav-item-btn sign-out-btn"
            onClick={handleSignOut}
            title={collapsed ? 'Sign Out' : undefined}
            style={{ marginTop: 4 }}
          >
            <span className="nav-item-icon">
              <LogOutIcon size={18} />
            </span>
            {!collapsed && <span className="nav-item-label">Sign Out</span>}
          </button>
        </div>
      </aside>
    </>
  );
}

export default StudentSidebar;
