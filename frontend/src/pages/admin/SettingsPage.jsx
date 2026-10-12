import { useState } from 'react';
import { PageHeader } from '../../components/admin/PageHeader';
import { Toast } from '../../components/admin/Toast';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import {
  SunIcon,
  MoonIcon,
} from '../../components/ui/Icons';

export function SettingsPage({ theme, onToggleTheme }) {
  const [activeTab, setActiveTab] = useState('profile'); // 'profile' | 'appearance' | 'preferences'
  const [toastMessage, setToastMessage] = useState(null);

  // Profile form
  const [profileData, setProfileData] = useState({
    name: 'Dr. Eleanor Vance',
    email: 'eleanor.vance@university.edu',
    title: 'Dean of Academic Operations & Examinations',
    department: 'Faculty of Computing & Information Systems',
  });

  // Display Preferences
  const [preferences, setPreferences] = useState({
    timeFormat: '12h', // '12h' | '24h'
    dateFormat: 'YYYY-MM-DD',
    tableDensity: 'normal', // 'compact' | 'normal' | 'spacious'
    emailNotifications: true,
  });

  const handleSaveProfile = (e) => {
    e.preventDefault();
    setToastMessage('Profile settings saved (UI demonstration only)');
  };

  const handleSavePreferences = (e) => {
    e.preventDefault();
    setToastMessage('Display preferences updated (UI demonstration only)');
  };

  return (
    <div className="admin-page-content">
      <Toast message={toastMessage} onClose={() => setToastMessage(null)} />

      <PageHeader
        title="Admin Settings & Preferences"
        subtitle="Configure administrator profile details, visual appearance, and scheduling interface preferences."
        category="System"
      />

      {/* Tabs navigation */}
      <div className="admin-tabs-nav" style={{ marginBottom: 24 }}>
        <button
          type="button"
          className={`admin-tab-btn ${activeTab === 'profile' ? 'is-active' : ''}`}
          onClick={() => setActiveTab('profile')}
        >
          <span>Administrator Profile</span>
        </button>

        <button
          type="button"
          className={`admin-tab-btn ${activeTab === 'appearance' ? 'is-active' : ''}`}
          onClick={() => setActiveTab('appearance')}
        >
          <span>Interface Appearance</span>
        </button>

        <button
          type="button"
          className={`admin-tab-btn ${activeTab === 'preferences' ? 'is-active' : ''}`}
          onClick={() => setActiveTab('preferences')}
        >
          <span>System Preferences</span>
        </button>
      </div>

      {/* Tab 1: Profile */}
      {activeTab === 'profile' && (
        <div className="admin-card settings-card">
          <div className="settings-section-header">
            <h3 className="settings-section-title">Institutional Administrator Profile</h3>
            <p className="settings-section-desc">
              Your identity information as presented on generated examination publications and scheduling logs.
            </p>
          </div>

          <div className="profile-identity-strip">
            <div className="profile-avatar-large">EV</div>
            <div className="profile-identity-info">
              <h4>{profileData.name}</h4>
              <p>{profileData.title} • {profileData.department}</p>
              <span className="profile-badge-pill">Central Examination Office</span>
            </div>
          </div>

          <form onSubmit={handleSaveProfile} className="settings-form">
            <div className="form-row-2col">
              <Input
                label="Full Name"
                id="admin-full-name"
                value={profileData.name}
                onChange={(e) => setProfileData({ ...profileData, name: e.target.value })}
                required
              />

              <Input
                label="Official Academic Email"
                id="admin-email"
                type="email"
                value={profileData.email}
                onChange={(e) => setProfileData({ ...profileData, email: e.target.value })}
                required
              />
            </div>

            <div className="form-row-2col">
              <Input
                label="Administrative Title"
                id="admin-title"
                value={profileData.title}
                onChange={(e) => setProfileData({ ...profileData, title: e.target.value })}
              />

              <Input
                label="Academic Department"
                id="admin-dept"
                value={profileData.department}
                onChange={(e) => setProfileData({ ...profileData, department: e.target.value })}
              />
            </div>

            <div className="settings-form-actions">
              <Button variant="primary" size="sm" type="submit">
                Save Profile Changes (Demo)
              </Button>
            </div>
          </form>
        </div>
      )}

      {/* Tab 2: Appearance */}
      {activeTab === 'appearance' && (
        <div className="admin-card settings-card">
          <div className="settings-section-header">
            <h3 className="settings-section-title">Color Theme & Visual Ergonomics</h3>
            <p className="settings-section-desc">
              ExamSync provides polished Dark and Light modes engineered for high-contrast readability.
            </p>
          </div>

          <div className="theme-selector-grid">
            <div
              className={`theme-card ${theme === 'dark' ? 'is-selected' : ''}`}
              onClick={() => {
                if (theme !== 'dark' && onToggleTheme) onToggleTheme();
              }}
              role="button"
              tabIndex={0}
            >
              <div className="theme-card-preview dark-preview">
                <div className="mock-sidebar" />
                <div className="mock-body">
                  <div className="mock-header" />
                  <div className="mock-card" />
                </div>
              </div>
              <div className="theme-card-label">
                <div className="theme-title">
                  <MoonIcon size={16} />
                  <span>Midnight Navy (Dark)</span>
                </div>
                <span className="theme-sub">Default low-strain environment</span>
              </div>
            </div>

            <div
              className={`theme-card ${theme === 'light' ? 'is-selected' : ''}`}
              onClick={() => {
                if (theme !== 'light' && onToggleTheme) onToggleTheme();
              }}
              role="button"
              tabIndex={0}
            >
              <div className="theme-card-preview light-preview">
                <div className="mock-sidebar light" />
                <div className="mock-body light">
                  <div className="mock-header light" />
                  <div className="mock-card light" />
                </div>
              </div>
              <div className="theme-card-label">
                <div className="theme-title">
                  <SunIcon size={16} />
                  <span>Daylight Paper (Light)</span>
                </div>
                <span className="theme-sub">High-contrast daytime reading</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 3: Preferences */}
      {activeTab === 'preferences' && (
        <div className="admin-card settings-card">
          <div className="settings-section-header">
            <h3 className="settings-section-title">Scheduling Display Preferences</h3>
            <p className="settings-section-desc">
              Customize time format, date representations, and data table density.
            </p>
          </div>

          <form onSubmit={handleSavePreferences} className="settings-form">
            <div className="form-row-2col">
              <div className="input-group">
                <label htmlFor="pref-time" className="input-label">Time Representation</label>
                <select
                  id="pref-time"
                  className="input-field"
                  value={preferences.timeFormat}
                  onChange={(e) => setPreferences({ ...preferences, timeFormat: e.target.value })}
                >
                  <option value="12h">12-Hour AM/PM (e.g. 09:00 AM — 12:00 PM)</option>
                  <option value="24h">24-Hour Military (e.g. 09:00 — 12:00)</option>
                </select>
                <span className="input-helper">UI display demonstration</span>
              </div>

              <div className="input-group">
                <label htmlFor="pref-date" className="input-label">Date Format Representation</label>
                <select
                  id="pref-date"
                  className="input-field"
                  value={preferences.dateFormat}
                  onChange={(e) => setPreferences({ ...preferences, dateFormat: e.target.value })}
                >
                  <option value="YYYY-MM-DD">ISO 8601 (2026-05-18)</option>
                  <option value="DD/MM/YYYY">British / Standard (18/05/2026)</option>
                  <option value="MMM DD, YYYY">Verbal (May 18, 2026)</option>
                </select>
                <span className="input-helper">UI display demonstration</span>
              </div>
            </div>

            <div className="input-group">
              <label htmlFor="pref-density" className="input-label">Data Table Cell Spacing Density</label>
              <select
                id="pref-density"
                className="input-field"
                value={preferences.tableDensity}
                onChange={(e) => setPreferences({ ...preferences, tableDensity: e.target.value })}
              >
                <option value="compact">Compact (Higher information density)</option>
                <option value="normal">Normal (Standard comfortable padding)</option>
                <option value="spacious">Spacious (Relaxed reading view)</option>
              </select>
              <span className="input-helper">UI display demonstration</span>
            </div>

            <div className="settings-form-actions">
              <Button variant="primary" size="sm" type="submit">
                Save Preferences (Demo)
              </Button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}

export default SettingsPage;
