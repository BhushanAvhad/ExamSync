import { useState } from 'react';
import { AdminSidebar } from './AdminSidebar';
import { AdminTopbar } from './AdminTopbar';

export function AdminLayout({
  currentPath,
  onNavigate,
  theme,
  onToggleTheme,
  children,
}) {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className={`admin-app-shell ${collapsed ? 'sidebar-collapsed' : ''}`}>
      <AdminSidebar
        currentPath={currentPath}
        onNavigate={onNavigate}
        collapsed={collapsed}
        onToggleCollapse={() => setCollapsed(!collapsed)}
        mobileOpen={mobileOpen}
        onCloseMobile={() => setMobileOpen(false)}
      />

      <div className="admin-main-wrapper">
        <AdminTopbar
          currentPath={currentPath}
          onNavigate={onNavigate}
          theme={theme}
          onToggleTheme={onToggleTheme}
          onOpenMobile={() => setMobileOpen(true)}
        />

        <main className="admin-content-container">
          {children}
        </main>
      </div>
    </div>
  );
}

export default AdminLayout;
