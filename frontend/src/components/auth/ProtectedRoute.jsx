import { useEffect } from 'react';
import { useAuth } from '../../context/useAuth';
import { BrandLogoIcon } from '../ui/Icons';

/**
 * ProtectedRoute Component
 * Enforces authentication and authorized role checks for protected routes.
 * Prevents unauthenticated users and unauthorized roles from accessing sensitive panels.
 * Renders an accessible loading state during credential resolution.
 */
export function ProtectedRoute({ requiredRole, currentPath, onNavigate, children }) {
  const { user, role, loading } = useAuth();

  useEffect(() => {
    if (loading) return;

    // 1. Unauthenticated -> Redirect to role-appropriate login page
    if (!user) {
      const loginRoute = requiredRole === 'admin' ? '/admin-login' : '/student-login';
      if (onNavigate) {
        onNavigate(loginRoute);
      }
      return;
    }

    // 2. Authenticated but unauthorized role -> Safe cross-portal redirection
    if (requiredRole && role !== requiredRole) {
      const safeDestination = role === 'admin' ? '/admin' : '/student';
      if (onNavigate) {
        onNavigate(safeDestination);
      }
    }
  }, [user, role, loading, requiredRole, onNavigate, currentPath]);

  // Loading state while checking session and database profile
  if (loading) {
    return (
      <div
        className="auth-guard-loading-screen"
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '100vh',
          background: 'var(--bg-primary, #090d16)',
          color: 'var(--text-primary, #f8fafc)',
          fontFamily: 'var(--font-sans, system-ui, sans-serif)',
          gap: 16,
        }}
      >
        <div
          style={{
            width: 48,
            height: 48,
            borderRadius: 14,
            background: 'linear-gradient(135deg, #4f46e5 0%, #06b6d4 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 0 24px rgba(79, 70, 229, 0.4)',
            animation: 'pulse 1.8s ease-in-out infinite',
          }}
        >
          <BrandLogoIcon size={24} color="#ffffff" />
        </div>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '1rem', fontWeight: 600, letterSpacing: '-0.01em' }}>
            ExamSync Security Gateway
          </div>
          <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary, #94a3b8)', marginTop: 4 }}>
            Verifying account authorization and permissions...
          </div>
        </div>
      </div>
    );
  }

  // If unauthenticated or wrong role, render nothing while redirect fires
  if (!user || (requiredRole && role !== requiredRole)) {
    return null;
  }

  return children;
}

export default ProtectedRoute;
