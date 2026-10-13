import {
  BrandLogoIcon,
  LayoutDashboardIcon,
  UsersIcon,
  BookOpenIcon,
  DoorIcon,
  CalendarDaysIcon,
  CpuIcon,
  TableIcon,
  AlertTriangleIcon,
  FileTextIcon,
  SettingsIcon,
  LogOutIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  XIcon,
} from '../ui/Icons';
import { useAuth } from '../../context/useAuth';

export function AdminSidebar({
  currentPath,
  onNavigate,
  collapsed,
  onToggleCollapse,
  mobileOpen,
  onCloseMobile,
}) {
  const navSections = [
    {
      heading: 'Workspace',
      items: [
        { path: '/admin', label: 'Overview', icon: <LayoutDashboardIcon size={18} /> },
        { path: '/admin/students', label: 'Students', icon: <UsersIcon size={18} /> },
        { path: '/admin/academics', label: 'Classes & Subjects', icon: <BookOpenIcon size={18} /> },
        { path: '/admin/rooms', label: 'Exam Rooms', icon: <DoorIcon size={18} /> },
        { path: '/admin/exams', label: 'Exam Sessions', icon: <CalendarDaysIcon size={18} /> },
      ],
    },
    {
      heading: 'Scheduling',
      items: [
        { path: '/admin/generate-timetable', label: 'Generate Timetable', icon: <CpuIcon size={18} /> },
        { path: '/admin/timetable', label: 'Timetable', icon: <TableIcon size={18} /> },
        { path: '/admin/conflicts', label: 'Conflicts', icon: <AlertTriangleIcon size={18} />, badge: '4' },
      ],
    },
    {
      heading: 'System',
      items: [
        { path: '/admin/reports', label: 'Reports', icon: <FileTextIcon size={18} /> },
        { path: '/admin/settings', label: 'Settings', icon: <SettingsIcon size={18} /> },
      ],
    },
  ];

  const { signOut } = useAuth();

  const handleItemClick = (path) => {
    onNavigate(path);
    if (mobileOpen && onCloseMobile) {
      onCloseMobile();
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut();
    } finally {
      onNavigate('/admin-login');
      if (mobileOpen && onCloseMobile) {
        onCloseMobile();
      }
    }
  };

  return (
    <>
      {/* Mobile Drawer Overlay */}
      {mobileOpen && (
        <div
          className="admin-sidebar-backdrop"
          onClick={onCloseMobile}
          aria-hidden="true"
        />
      )}

      <aside
        className={`admin-sidebar ${collapsed ? 'is-collapsed' : ''} ${mobileOpen ? 'is-mobile-open' : ''}`}
        aria-label="Admin Navigation"
      >
        {/* Sidebar Brand Header */}
        <div className="admin-sidebar-header">
          <button
            type="button"
            className="admin-brand-btn"
            onClick={() => handleItemClick('/admin')}
            aria-label="ExamSync Admin Home"
          >
            <div className="admin-brand-icon">
              <BrandLogoIcon size={18} />
            </div>
            {!collapsed && (
              <div className="admin-brand-text">
                <span className="brand-name">
                  Exam<span className="brand-accent">Sync</span>
                </span>
                <span className="brand-role-tag">VIT Admin Console</span>
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

        {/* Sidebar Navigation */}
        <nav className="admin-sidebar-nav">
          {navSections.map((section) => (
            <div key={section.heading} className="nav-group">
              {!collapsed && (
                <div className="nav-group-heading">{section.heading}</div>
              )}
              <ul className="nav-item-list">
                {section.items.map((item) => {
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
                        {!collapsed && (
                          <span className="nav-item-label">{item.label}</span>
                        )}
                        {!collapsed && item.badge && (
                          <span className="nav-item-badge">{item.badge}</span>
                        )}
                      </button>
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
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

        {/* Bottom Sign Out */}
        <div className="admin-sidebar-footer">
          <button
            type="button"
            className="nav-item-btn sign-out-btn"
            onClick={handleSignOut}
            title={collapsed ? 'Sign Out' : undefined}
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

export default AdminSidebar;
