import { useState } from 'react';
import { useAuth } from '../context/useAuth';
import {
  ShieldCheckIcon,
  EyeIcon,
  EyeOffIcon,
  LockIcon,
  UserIcon,
  ArrowRightIcon,
  AlertTriangleIcon,
} from '../components/ui/Icons';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';

/**
 * ExamSync Admin Login Page
 * Connects to Supabase Auth with strict institutional Administrator verification.
 * Strictly NO public self-registration.
 */
export function AdminLoginPage({ onNavigate }) {
  const { signIn } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (submitting) return;

    setErrorMessage('');

    if (!email.trim() || !password) {
      setErrorMessage('Please enter your institutional administrator credentials.');
      return;
    }

    setSubmitting(true);

    try {
      const result = await signIn(email, password, 'admin');

      if (!result.success) {
        setErrorMessage(result.error || 'Authentication failed. Please verify your credentials.');
        setSubmitting(false);
        return;
      }

      // Successful verified Administrator authorization
      if (onNavigate) {
        onNavigate('/admin');
      }
    } catch (err) {
      setErrorMessage(err.message || 'An unexpected error occurred during administrative authentication.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="login-page-wrapper">
      {/* Subtle ambient lighting */}
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
          <div className="login-brand-icon" style={{ background: 'linear-gradient(135deg, #4f46e5 0%, #6366f1 100%)' }}>
            <ShieldCheckIcon size={24} />
          </div>
          <div className="auth-role-badge admin">
            <span>Administrator access</span>
          </div>
          <h1 className="login-title">Admin Sign In</h1>
          <p className="login-subtitle">
            Institutional examination management portal
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
            label="Administrator Email"
            id="admin-email"
            type="email"
            placeholder="admin@university.edu"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            prefixIcon={<UserIcon size={16} />}
            required
            disabled={submitting}
            autoComplete="username"
          />

          <Input
            label="Password"
            id="admin-password"
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
            {submitting ? 'Verifying Authorization...' : 'Sign In as Admin'}
          </Button>

          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => onNavigate('/')}
            style={{ marginTop: 8 }}
          >
            ← Return to ExamSync Home
          </Button>
        </form>

        {/* Notice - strictly stating admin credentials are institutionally provisioned */}
        <div className="prototype-notice">
          <strong>Institutional Governance</strong>
          <br />
          Administrative accounts are provisioned via secure institutional protocols. Public self-registration is strictly disabled.
        </div>
      </div>
    </div>
  );
}

export default AdminLoginPage;
