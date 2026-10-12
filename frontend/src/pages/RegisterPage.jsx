import { useState } from 'react';
import { useAuth } from '../context/useAuth';
import {
  GraduationCapIcon,
  EyeIcon,
  EyeOffIcon,
  LockIcon,
  UserIcon,
  ArrowRightIcon,
  AlertTriangleIcon,
  CheckCircleIcon,
} from '../components/ui/Icons';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';

/**
 * ExamSync Create Account / Register Page
 * Strictly for STUDENTS only. Public Admin self-registration is forbidden.
 * Fields:
 * - Full Name
 * - Email
 * - Password
 * - Confirm Password
 */
export function RegisterPage({ onNavigate }) {
  const { signUpStudent } = useAuth();

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successInfo, setSuccessInfo] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (submitting) return;

    setErrorMessage('');
    setSuccessInfo(null);

    // Client-side input validation
    if (!fullName.trim() || !email.trim() || !password || !confirmPassword) {
      setErrorMessage('Please fill in all required fields.');
      return;
    }

    if (password !== confirmPassword) {
      setErrorMessage('Passwords do not match. Please re-enter your password.');
      return;
    }

    if (password.length < 6) {
      setErrorMessage('Password must be at least 6 characters in length.');
      return;
    }

    setSubmitting(true);

    try {
      const result = await signUpStudent(fullName, email, password);

      if (!result.success) {
        if (result.error?.toLowerCase().includes('rate limit')) {
          setErrorMessage(
            'Supabase email rate limit reached (max 3 emails/hr on default settings). ' +
            'In your Supabase Dashboard: Go to Authentication > Providers > Email, turn OFF "Confirm email", and save. ' +
            'Then try clicking Create Account again for instant registration.'
          );
        } else {
          setErrorMessage(result.error || 'Registration failed. Please try again.');
        }
        setSubmitting(false);
        return;
      }

      if (result.requiresEmailConfirmation) {
        setSuccessInfo({
          title: 'Account Created Successfully!',
          message: `A verification link has been dispatched to ${email}. Please confirm your email address, then sign in below.`,
          unconfirmed: true,
        });
      } else {
        setSuccessInfo({
          title: 'Welcome to ExamSync!',
          message: 'Account created and verified. Redirecting to your Student Portal...',
          unconfirmed: false,
        });
        setTimeout(() => {
          if (onNavigate) onNavigate('/student');
        }, 1500);
      }
    } catch (err) {
      setErrorMessage(err.message || 'An unexpected error occurred during account creation.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="login-page-wrapper">
      {/* Ambient background glow */}
      <div
        className="ambient-glow-orb ambient-glow-primary"
        style={{ top: '10%', left: '25%', width: 520, height: 520 }}
      />
      <div
        className="ambient-glow-orb ambient-glow-accent"
        style={{ bottom: '10%', right: '20%', width: 420, height: 420 }}
      />

      <div className="login-card">
        {/* Header */}
        <div className="login-header">
          <div className="login-brand-icon" style={{ background: 'linear-gradient(135deg, #0284c7 0%, #06b6d4 100%)' }}>
            <GraduationCapIcon size={24} />
          </div>
          <div className="auth-role-badge student">
            <span>Student Registration</span>
          </div>
          <h1 className="login-title">Create Student Account</h1>
          <p className="login-subtitle">
            Sign up to access your personalized timetable
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

        {/* Success notification banner */}
        {successInfo && (
          <div
            className="auth-alert success"
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: 6,
              padding: '14px 16px',
              borderRadius: 8,
              background: 'rgba(16, 185, 129, 0.12)',
              border: '1px solid rgba(16, 185, 129, 0.3)',
              color: '#6ee7b7',
              fontSize: '0.875rem',
              marginBottom: 18,
              lineHeight: 1.45,
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontWeight: 600 }}>
              <CheckCircleIcon size={18} />
              <span>{successInfo.title}</span>
            </div>
            <p style={{ margin: 0, color: 'var(--text-secondary, #cbd5e1)', fontSize: '0.825rem' }}>
              {successInfo.message}
            </p>
            {successInfo.unconfirmed && (
              <Button
                type="button"
                variant="primary"
                size="sm"
                onClick={() => onNavigate('/student-login')}
                style={{ marginTop: 8 }}
              >
                Proceed to Student Sign In →
              </Button>
            )}
          </div>
        )}

        {/* Form (only shown if not yet completed with email confirmation notice) */}
        {!successInfo && (
          <form className="login-form" onSubmit={handleSubmit}>
            <Input
              label="Full Name"
              id="register-fullname"
              type="text"
              placeholder="Jane Doe or Alex Morgan"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              prefixIcon={<UserIcon size={16} />}
              required
              disabled={submitting}
              autoComplete="name"
            />

            <Input
              label="Student Email Address"
              id="register-email"
              type="email"
              placeholder="student@university.edu"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              prefixIcon={<UserIcon size={16} />}
              required
              disabled={submitting}
              autoComplete="email"
            />

            <Input
              label="Password"
              id="register-password"
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
              autoComplete="new-password"
            />

            <Input
              label="Confirm Password"
              id="register-confirm-password"
              type={showConfirmPassword ? 'text' : 'password'}
              placeholder="••••••••••••"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              prefixIcon={<LockIcon size={16} />}
              disabled={submitting}
              suffixAction={
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
                  style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'inherit', display: 'flex' }}
                >
                  {showConfirmPassword ? <EyeOffIcon size={16} /> : <EyeIcon size={16} />}
                </button>
              }
              required
              autoComplete="new-password"
            />

            <Button
              type="submit"
              variant="primary"
              size="lg"
              disabled={submitting}
              icon={!submitting ? <ArrowRightIcon size={16} /> : null}
              style={{ width: '100%', marginTop: 8 }}
            >
              {submitting ? 'Creating Student Account...' : 'Create Account'}
            </Button>

            {/* Navigation link: Already have an account? Student Sign In */}
            <div style={{ textAlign: 'center', marginTop: 14, fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
              Already have an account?{' '}
              <button
                type="button"
                className="forgot-link"
                style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
                onClick={() => onNavigate('/student-login')}
              >
                Student Sign In
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
        )}

        {/* Security Notice */}
        <div className="prototype-notice">
          <strong>Security Notice</strong>
          <br />
          Student profiles are securely linked to verified university credentials with zero administrative privileges.
        </div>
      </div>
    </div>
  );
}

export default RegisterPage;
