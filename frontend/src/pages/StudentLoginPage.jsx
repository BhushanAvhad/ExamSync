import { useState, useEffect } from 'react';
import { useAuth } from '../context/useAuth';
import {
  GraduationCapIcon,
  EyeIcon,
  EyeOffIcon,
  LockIcon,
  UserIcon,
  ArrowRightIcon,
  AlertTriangleIcon,
} from '../components/ui/Icons';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { studentsService } from '../services/studentsService';

/**
 * ExamSync Student Login Page
 * Connects to Supabase Auth and dynamic student roster with verified role enforcement.
 * Role: Student access only.
 */
export function StudentLoginPage({ onNavigate }) {
  const { signIn } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [enrolledPills, setEnrolledPills] = useState([]);

  useEffect(() => {
    async function loadRoster() {
      try {
        const { data } = await studentsService.getStudents();
        if (data && data.length > 0) {
          setEnrolledPills(data.slice(0, 4));
        }
      } catch (e) {
        // ignore
      }
    }
    loadRoster();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (submitting) return;

    setErrorMessage('');

    if (!email.trim() || !password) {
      setErrorMessage('Please enter both your student email address and password.');
      return;
    }

    setSubmitting(true);

    try {
      const result = await signIn(email, password, 'student');

      if (!result.success) {
        setErrorMessage(result.error || 'Authentication failed. Please verify your credentials.');
        setSubmitting(false);
        return;
      }

      // Handle role-mismatch edge case (Admin user logging in via student portal)
      if (result.roleMismatch && result.suggestedPath) {
        if (onNavigate) onNavigate(result.suggestedPath);
        return;
      }

      // Successful student authorization
      if (onNavigate) {
        onNavigate('/student');
      }
    } catch (err) {
      setErrorMessage(err.message || 'An unexpected error occurred during sign-in.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="login-page-wrapper">
      {/* Ambient lighting */}
      <div
        className="ambient-glow-orb ambient-glow-primary"
        style={{ top: '15%', left: '30%', width: 500, height: 500 }}
      />
      <div
        className="ambient-glow-orb ambient-glow-accent"
        style={{ bottom: '15%', right: '25%', width: 400, height: 400 }}
      />

      <div className="login-card">
        {/* Header */}
        <div className="login-header">
          <div className="login-brand-icon" style={{ background: 'linear-gradient(135deg, #0284c7 0%, #06b6d4 100%)' }}>
            <GraduationCapIcon size={24} />
          </div>
          <div className="auth-role-badge student">
            <span>Student access</span>
          </div>
          <h1 className="login-title">Student Sign In</h1>
          <p className="login-subtitle">
            Vidyalankar Institute of Technology (VIT) — Student Portal
          </p>
        </div>

        {/* Error notification banner */}
        {errorMessage && (
          <div
            className="auth-alert error"
            style={{
              display: 'flex',
              alignItems: 'flex-start',
              gap: 10,
              padding: '12px 14px',
              borderRadius: 8,
              background: 'rgba(239, 68, 68, 0.12)',
              border: '1px solid rgba(239, 68, 68, 0.3)',
              color: '#fca5a5',
              fontSize: '0.85rem',
              marginBottom: 16,
              lineHeight: 1.4,
            }}
          >
            <AlertTriangleIcon size={18} style={{ flexShrink: 0, marginTop: 1 }} />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Form */}
        <form className="login-form" onSubmit={handleSubmit}>
          <Input
            label="Student Email Address"
            id="student-email"
            type="email"
            placeholder="student@vit.edu.in"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            prefixIcon={<UserIcon size={16} />}
            required
            disabled={submitting}
            autoComplete="username"
          />

          <Input
            label="Password"
            id="student-password"
            type={showPassword ? 'text' : 'password'}
            placeholder="••••••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            prefixIcon={<LockIcon size={16} />}
            disabled={submitting}
            suffixAction={
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'inherit', display: 'flex' }}
              >
                {showPassword ? <EyeOffIcon size={16} /> : <EyeIcon size={16} />}
              </button>
            }
            required
            autoComplete="current-password"
          />

          <Button
            type="submit"
            variant="primary"
            size="lg"
            disabled={submitting}
            icon={!submitting ? <ArrowRightIcon size={16} /> : null}
            style={{ width: '100%', marginTop: 8 }}
          >
            {submitting ? 'Authenticating...' : 'Sign In as Student'}
          </Button>

          {/* Quick autofill candidate pills for testing */}
          {enrolledPills.length > 0 && (
            <div style={{ marginTop: 14, paddingTop: 12, borderTop: '1px solid var(--border)' }}>
              <div style={{ fontSize: '0.76rem', color: 'var(--text-muted)', marginBottom: 8 }}>
                Quick Test Login (Enrolled VIT Candidates):
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                {enrolledPills.map((s) => (
                  <button
                    key={s.id || s.email}
                    type="button"
                    onClick={() => {
                      setEmail(s.email);
                      setPassword('ExamSync@2026');
                    }}
                    style={{
                      fontSize: '0.74rem',
                      padding: '4px 8px',
                      borderRadius: 6,
                      background: 'var(--surface-secondary)',
                      border: '1px solid var(--border)',
                      color: 'var(--text-primary)',
                      cursor: 'pointer',
                    }}
                    title={`Click to fill ${s.name}`}
                  >
                    {s.name} ({s.className})
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Navigation link: Don't have an account? Create Account */}
          <div style={{ textAlign: 'center', marginTop: 14, fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
            Don't have an account?{' '}
            <button
              type="button"
              className="forgot-link"
              style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
              onClick={() => onNavigate('/register')}
            >
              Create Account
            </button>
          </div>

          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => onNavigate('/')}
            style={{ marginTop: 6 }}
          >
            ← Return to ExamSync Home
          </Button>
        </form>

        {/* Security Notice */}
        <div className="prototype-notice">
          <strong>Protected Candidate Portal</strong>
          <br />
          Vidyalankar Institute of Technology (VIT), Wadala, Mumbai. All sessions authenticated.
        </div>
      </div>
    </div>
  );
}

export default StudentLoginPage;
