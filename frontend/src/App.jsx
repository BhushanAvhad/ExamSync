import { useState, useEffect, useCallback } from 'react';
import { AuthProvider } from './context/AuthContext';
import { ProtectedRoute } from './components/auth/ProtectedRoute';
import { Navbar } from './components/layout/Navbar';
import { LandingPage } from './pages/LandingPage';
import { AdminLoginPage } from './pages/AdminLoginPage';
import { StudentLoginPage } from './pages/StudentLoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { DesignSystemShowcase } from './pages/DesignSystemShowcase';

import { AdminLayout } from './components/admin/AdminLayout';
import { AdminOverviewPage } from './pages/admin/AdminOverviewPage';
import { StudentsPage } from './pages/admin/StudentsPage';
import { AcademicsPage } from './pages/admin/AcademicsPage';
import { RoomsPage } from './pages/admin/RoomsPage';
import { ExamSessionsPage } from './pages/admin/ExamSessionsPage';
import { GenerateTimetablePage } from './pages/admin/GenerateTimetablePage';
import { TimetablePage } from './pages/admin/TimetablePage';
import { ConflictsPage } from './pages/admin/ConflictsPage';
import { ReportsPage } from './pages/admin/ReportsPage';
import { SettingsPage } from './pages/admin/SettingsPage';

import { StudentLayout } from './components/student/StudentLayout';
import { StudentOverviewPage } from './pages/student/StudentOverviewPage';
import { StudentTimetablePage } from './pages/student/StudentTimetablePage';
import { StudentSubjectsPage } from './pages/student/StudentSubjectsPage';
import { StudentNotificationsPage } from './pages/student/StudentNotificationsPage';
import { StudentProfilePage } from './pages/student/StudentProfilePage';
import { StudentHelpPage } from './pages/student/StudentHelpPage';
import './App.css';

/**
 * ExamSync Application Shell
 * Client-Side Routing with Supabase Authentication and Role Guards
 */
function AppRoutes() {
  const [currentPath, setCurrentPath] = useState(
    typeof window !== 'undefined' ? window.location.pathname || '/' : '/'
  );
  const [theme, setTheme] = useState(() => {
    try {
      const saved = localStorage.getItem('examsync_theme');
      if (saved === 'light' || saved === 'dark') return saved;
    } catch (_) {}
    return 'dark';
  });

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    try {
      localStorage.setItem('examsync_theme', theme);
    } catch (_) {}
  }, [theme]);

  useEffect(() => {
    const handlePopState = () => {
      setCurrentPath(window.location.pathname || '/');
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const navigate = useCallback((path) => {
    if (window.location.pathname !== path) {
      window.history.pushState({}, '', path);
    }
    setCurrentPath(path);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  const toggleTheme = useCallback(() => {
    setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'));
  }, []);

  const isAdminRoute = currentPath.startsWith('/admin') && currentPath !== '/admin-login';
  const isStudentRoute = currentPath.startsWith('/student') && currentPath !== '/student-login';

  const renderAdminContent = () => {
    switch (currentPath) {
      case '/admin/students':
        return <StudentsPage onNavigate={navigate} />;
      case '/admin/academics':
        return <AcademicsPage onNavigate={navigate} />;
      case '/admin/rooms':
        return <RoomsPage onNavigate={navigate} />;
      case '/admin/exams':
        return <ExamSessionsPage onNavigate={navigate} />;
      case '/admin/generate-timetable':
        return <GenerateTimetablePage onNavigate={navigate} />;
      case '/admin/timetable':
        return <TimetablePage onNavigate={navigate} />;
      case '/admin/conflicts':
        return <ConflictsPage onNavigate={navigate} />;
      case '/admin/reports':
        return <ReportsPage onNavigate={navigate} />;
      case '/admin/settings':
        return <SettingsPage onNavigate={navigate} theme={theme} onToggleTheme={toggleTheme} />;
      case '/admin':
      default:
        return <AdminOverviewPage onNavigate={navigate} />;
    }
  };

  const renderStudentContent = () => {
    switch (currentPath) {
      case '/student/timetable':
        return <StudentTimetablePage onNavigate={navigate} />;
      case '/student/subjects':
        return <StudentSubjectsPage onNavigate={navigate} />;
      case '/student/notifications':
        return <StudentNotificationsPage onNavigate={navigate} />;
      case '/student/profile':
        return <StudentProfilePage onNavigate={navigate} />;
      case '/student/help':
        return <StudentHelpPage onNavigate={navigate} />;
      case '/student':
      default:
        return <StudentOverviewPage onNavigate={navigate} />;
    }
  };

  // 1. Role-Guarded Admin Console Routes
  if (isAdminRoute) {
    return (
      <ProtectedRoute requiredRole="admin" currentPath={currentPath} onNavigate={navigate}>
        <AdminLayout
          currentPath={currentPath}
          onNavigate={navigate}
          theme={theme}
          onToggleTheme={toggleTheme}
        >
          {renderAdminContent()}
        </AdminLayout>
      </ProtectedRoute>
    );
  }

  // 2. Role-Guarded Student Portal Routes
  if (isStudentRoute) {
    return (
      <ProtectedRoute requiredRole="student" currentPath={currentPath} onNavigate={navigate}>
        <StudentLayout
          currentPath={currentPath}
          onNavigate={navigate}
          theme={theme}
          onToggleTheme={toggleTheme}
        >
          {renderStudentContent()}
        </StudentLayout>
      </ProtectedRoute>
    );
  }

  // 3. Public Routes (Landing, Auth Screens, Showcase)
  return (
    <div className={`app-container ${currentPath === '/' ? 'is-landing-screen' : ''}`}>
      <Navbar
        currentPath={currentPath}
        onNavigate={navigate}
        theme={theme}
        onToggleTheme={toggleTheme}
      />

      <main className="main-content">
        {currentPath === '/admin-login' ? (
          <AdminLoginPage onNavigate={navigate} />
        ) : currentPath === '/student-login' || currentPath === '/login' ? (
          <StudentLoginPage onNavigate={navigate} />
        ) : currentPath === '/register' ? (
          <RegisterPage onNavigate={navigate} />
        ) : currentPath === '/showcase' ? (
          <DesignSystemShowcase onNavigate={navigate} />
        ) : (
          <LandingPage onNavigate={navigate} />
        )}
      </main>
    </div>
  );
}

export function App() {
  return (
    <AuthProvider>
      <AppRoutes />
    </AuthProvider>
  );
}

export default App;
