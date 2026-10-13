import { useState, useEffect } from 'react';
import { PageHeader } from '../../components/admin/PageHeader';
import { Toast } from '../../components/admin/Toast';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import {
  SunIcon,
  MoonIcon,
  BuildingIcon,
  CheckCircleIcon,
} from '../../components/ui/Icons';
import { useAuth } from '../../context/useAuth';
import { supabase } from '../../lib/supabase';
import {
  getInstitutionSettings,
  saveInstitutionSettings,
  getPreferences,
  savePreferences,
} from '../../utils/institutionSettings';
import { OfficialPrintHeader } from '../../components/common/OfficialPrintHeader';
import { OfficialPrintFooter } from '../../components/common/OfficialPrintFooter';

export function SettingsPage({ theme, onToggleTheme }) {
  const { user, profile, refreshProfile } = useAuth();
  const [activeTab, setActiveTab] = useState('profile'); // 'profile' | 'institution' | 'appearance' | 'preferences'
  const [toastMessage, setToastMessage] = useState(null);
  const [saving, setSaving] = useState(false);

  // Profile Form State
  const [profileData, setProfileData] = useState(() => {
    try {
      const saved = localStorage.getItem('examsync_admin_profile');
      if (saved) return JSON.parse(saved);
    } catch (e) {}
    return {
      name: profile?.full_name || 'Dr. Eleanor Vance',
      email: profile?.email || user?.email || 'admin@vit.edu.in',
      title: profile?.phone || 'Dean of Academic Operations & Examinations',
      department: profile?.department || 'Department of Computer Engineering, VIT',
    };
  });

  // Sync when live profile loads
  useEffect(() => {
    if (profile) {
      setProfileData((prev) => ({
        ...prev,
        name: profile.full_name || prev.name,
        email: profile.email || prev.email,
        department: profile.department || prev.department,
        title: profile.phone || prev.title,
      }));
    }
  }, [profile]);

  // Institutional & Examination Authority State
  const [institutionData, setInstitutionData] = useState(getInstitutionSettings);

  // Display Preferences State
  const [preferences, setPreferencesState] = useState(getPreferences);

  // 1. Save Administrator Profile (Supabase DB + Local Storage)
  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (user && supabase) {
        const { error } = await supabase
          .from('profiles')
          .update({
            full_name: profileData.name,
            department: profileData.department,
            phone: profileData.title,
          })
          .eq('id', user.id);

        if (error) {
          console.warn('Database profile update failed, falling back to local storage:', error.message);
        } else {
          refreshProfile?.();
        }
      }
      localStorage.setItem('examsync_admin_profile', JSON.stringify(profileData));
      setToastMessage('Administrator profile updated and persisted successfully.');
    } catch (err) {
      console.error('Failed to save profile:', err);
      localStorage.setItem('examsync_admin_profile', JSON.stringify(profileData));
      setToastMessage('Profile changes saved to local settings.');
    } finally {
      setSaving(false);
    }
  };

  // 2. Save University & Exam Authority Profile (Powers all print headers)
  const handleSaveInstitution = (e) => {
    e.preventDefault();
    const updated = saveInstitutionSettings(institutionData);
    setInstitutionData(updated);
    setToastMessage('University profile & examination authority settings saved. Printable letterheads updated!');
  };

  // 3. Save System Preferences
  const handleSavePreferences = (e) => {
    e.preventDefault();
    const updated = savePreferences(preferences);
    setPreferencesState(updated);
    setToastMessage('Display preferences saved and persisted successfully.');
  };

  return (
    <div className="admin-page-content">
      <Toast message={toastMessage} onClose={() => setToastMessage(null)} />

      <PageHeader
        title="Admin Settings & Preferences"
        subtitle="Manage administrator credentials, university letterhead profile, and system display configurations."
        category="System"
      />

      {/* Tabs Navigation */}
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
          className={`admin-tab-btn ${activeTab === 'institution' ? 'is-active' : ''}`}
          onClick={() => setActiveTab('institution')}
        >
          <span>University & Exam Authority</span>
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

      {/* Tab 1: Administrator Profile */}
      {activeTab === 'profile' && (
        <div className="admin-card settings-card">
          <div className="settings-section-header">
            <h3 className="settings-section-title">Institutional Administrator Profile</h3>
            <p className="settings-section-desc">
              Your identity credentials as registered on the Supabase database and audit logs.
            </p>
          </div>

          <div className="profile-identity-strip">
            <div className="profile-avatar-large">
              {profileData.name
                .split(' ')
                .map((w) => w[0])
                .slice(0, 2)
                .join('')
                .toUpperCase() || 'AD'}
            </div>
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
                label="Administrative Title / Designation"
                id="admin-title"
                value={profileData.title}
                onChange={(e) => setProfileData({ ...profileData, title: e.target.value })}
              />

              <Input
                label="Academic Department / School"
                id="admin-dept"
                value={profileData.department}
                onChange={(e) => setProfileData({ ...profileData, department: e.target.value })}
              />
            </div>

            <div className="settings-form-actions">
              <Button variant="primary" size="sm" type="submit" disabled={saving}>
                {saving ? 'Saving to Database...' : 'Save Profile Changes'}
              </Button>
            </div>
          </form>
        </div>
      )}

      {/* Tab 2: Institution & Examination Authority */}
      {activeTab === 'institution' && (
        <div className="admin-card settings-card">
          <div className="settings-section-header">
            <h3 className="settings-section-title">Institution Branding & Print Authority (VIT)</h3>
            <p className="settings-section-desc">
              These details determine the official letterhead, institution name, and sign-off authority for
              <strong> Vidyalankar Institute of Technology (VIT)</strong> on both the <strong>Admin Master Timetable</strong> and the <strong>Student Examination Admit Cards</strong>.
            </p>
          </div>

          <form onSubmit={handleSaveInstitution} className="settings-form">
            <div className="form-row-2col">
              <Input
                label="University / Institution Full Name"
                id="inst-name"
                value={institutionData.universityName}
                onChange={(e) => setInstitutionData({ ...institutionData, universityName: e.target.value })}
                required
              />

              <Input
                label="Institutional Accreditation / Sub-Heading"
                id="inst-sub"
                value={institutionData.subHeading}
                onChange={(e) => setInstitutionData({ ...institutionData, subHeading: e.target.value })}
              />
            </div>

            <div className="form-row-2col">
              <Input
                label="Examination Division / Directorate Name"
                id="inst-office"
                value={institutionData.examOffice}
                onChange={(e) => setInstitutionData({ ...institutionData, examOffice: e.target.value })}
                required
              />

              <Input
                label="Campus Location / Examination Center"
                id="inst-campus"
                value={institutionData.campus}
                onChange={(e) => setInstitutionData({ ...institutionData, campus: e.target.value })}
              />
            </div>

            <div className="form-row-2col">
              <Input
                label="Controller of Examinations Name"
                id="inst-controller"
                value={institutionData.controllerName}
                onChange={(e) => setInstitutionData({ ...institutionData, controllerName: e.target.value })}
                required
              />

              <Input
                label="Controller Official Title"
                id="inst-controller-title"
                value={institutionData.controllerTitle}
                onChange={(e) => setInstitutionData({ ...institutionData, controllerTitle: e.target.value })}
              />
            </div>

            <div className="form-row-2col">
              <Input
                label="Dean of Academic Operations Name"
                id="inst-dean"
                value={institutionData.deanName}
                onChange={(e) => setInstitutionData({ ...institutionData, deanName: e.target.value })}
              />

              <Input
                label="Dean Official Title"
                id="inst-dean-title"
                value={institutionData.deanTitle}
                onChange={(e) => setInstitutionData({ ...institutionData, deanTitle: e.target.value })}
              />
            </div>

            <div className="settings-form-actions">
              <Button variant="primary" size="sm" type="submit">
                Save & Update Printable Letterheads
              </Button>
            </div>
          </form>

          {/* Live Print Letterhead Preview */}
          <div style={{ marginTop: 28, borderTop: '1px solid var(--border)', paddingTop: 20 }}>
            <h4 style={{ fontSize: 13, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 12, color: 'var(--text-secondary)' }}>
              Live Letterhead Preview (As seen on printed schedules & student admit cards)
            </h4>
            <div style={{ background: '#ffffff', color: '#0f172a', padding: '16px 20px', borderRadius: 8, border: '1px solid #cbd5e1' }}>
              <OfficialPrintHeader
                documentTitle="OFFICIAL EXAMINATION SCHEDULE & HALL ADMIT CARD"
                sessionTitle={institutionData.term}
              />
              <div style={{ fontSize: 11, textAlign: 'center', color: '#64748b', margin: '10px 0' }}>
                [Examination Schedule Table Renders Here with Zero Line-Wrapping]
              </div>
              <OfficialPrintFooter />
            </div>
          </div>
        </div>
      )}

      {/* Tab 3: Appearance */}
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

      {/* Tab 4: System Preferences */}
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
                  onChange={(e) => setPreferencesState({ ...preferences, timeFormat: e.target.value })}
                >
                  <option value="12h">12-Hour AM/PM (e.g. 09:00 AM — 12:00 PM)</option>
                  <option value="24h">24-Hour Military (e.g. 09:00 — 12:00)</option>
                </select>
                <span className="input-helper">Saved to institutional preferences</span>
              </div>

              <div className="input-group">
                <label htmlFor="pref-date" className="input-label">Date Format Representation</label>
                <select
                  id="pref-date"
                  className="input-field"
                  value={preferences.dateFormat}
                  onChange={(e) => setPreferencesState({ ...preferences, dateFormat: e.target.value })}
                >
                  <option value="YYYY-MM-DD">ISO 8601 (2026-05-18)</option>
                  <option value="DD/MM/YYYY">Standard (18/05/2026)</option>
                  <option value="MMM DD, YYYY">Verbal (May 18, 2026)</option>
                </select>
                <span className="input-helper">Saved to institutional preferences</span>
              </div>
            </div>

            <div className="input-group">
              <label htmlFor="pref-density" className="input-label">Data Table Cell Spacing Density</label>
              <select
                id="pref-density"
                className="input-field"
                value={preferences.tableDensity}
                onChange={(e) => setPreferencesState({ ...preferences, tableDensity: e.target.value })}
              >
                <option value="compact">Compact (Higher information density)</option>
                <option value="normal">Normal (Standard comfortable padding)</option>
                <option value="spacious">Spacious (Relaxed reading view)</option>
              </select>
              <span className="input-helper">Saved to institutional preferences</span>
            </div>

            <div className="settings-form-actions">
              <Button variant="primary" size="sm" type="submit">
                Save Preferences
              </Button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}

export default SettingsPage;
