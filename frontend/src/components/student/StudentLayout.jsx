import { useState } from 'react';
import { StudentSidebar } from './StudentSidebar';
import { StudentTopbar } from './StudentTopbar';

export function StudentLayout({
  currentPath,
  onNavigate,
  theme,
  onToggleTheme,
  children,
}) {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className={`admin-app-shell student-shell ${collapsed ? 'sidebar-collapsed' : ''}`}>
      <StudentSidebar
        currentPath={currentPath}
        onNavigate={onNavigate}
        collapsed={collapsed}
        onToggleCollapse={() => setCollapsed(!collapsed)}
        mobileOpen={mobileOpen}
        onCloseMobile={() => setMobileOpen(false)}
      />

      <div className="admin-main-wrapper">
        <StudentTopbar
          currentPath={currentPath}
          onNavigate={onNavigate}
          theme={theme}
          onToggleTheme={onToggleTheme}
          onOpenMobile={() => setMobileOpen(true)}
        />

        <main className="admin-content-container student-content-container">
          {children}
        </main>
      </div>
    </div>
  );
}

export default StudentLayout;
