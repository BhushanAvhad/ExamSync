import { useState, useEffect } from 'react';
import { PageHeader } from '../../components/admin/PageHeader';
import { Toast } from '../../components/admin/Toast';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Badge } from '../../components/ui/Badge';
import { EditIcon } from '../../components/ui/Icons';
import { STUDENT_PROFILE } from '../../data/studentDemoData';
import { useAuth } from '../../context/useAuth';
import { studentPortalService } from '../../services/studentPortalService';

export function StudentProfilePage() {
  const { user, profile: authProfile } = useAuth();
  const [profile, setProfile] = useState(STUDENT_PROFILE);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: profile.name,
    email: profile.email,
    phone: profile.phone,
  });
  const [formErrors, setFormErrors] = useState({});
  const [toastMessage, setToastMessage] = useState(null);

  useEffect(() => {
    async function load() {
      if (user?.id) {
        const { data } = await studentPortalService.getProfile(user.id, user.email);
        if (data) {
          setProfile(data);
          setFormData({
            name: data.name,
            email: data.email,
            phone: data.phone || '',
          });
        }
      } else if (authProfile) {
        setProfile((prev) => ({
          ...prev,
          name: authProfile.full_name || prev.name,
          email: authProfile.email || prev.email,
          phone: authProfile.phone || prev.phone,
        }));
      }
    }
    load();
  }, [user, authProfile]);

  const validate = () => {
    const errors = {};
    if (!formData.name.trim()) errors.name = 'Full name is required';
    if (!formData.email.trim()) {
      errors.email = 'Academic email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      errors.email = 'Please enter a valid email format';
    }
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    try {
      if (user?.id) {
        await studentPortalService.updateProfile(user.id, {
          name: formData.name,
          phone: formData.phone,
        });
      }
      setProfile((prev) => ({
        ...prev,
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        initials: formData.name.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase(),
      }));
      setToastMessage('Student contact profile updated in database');
    } catch (err) {
      console.error('Failed to update student profile:', err);
      setProfile((prev) => ({
        ...prev,
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        initials: formData.name.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase(),
      }));
      setToastMessage(`Profile saved locally (${err.message})`);
    }

    setIsEditing(false);
  };

  return (
    <div className="admin-page-content student-profile-page">
      <Toast message={toastMessage} onClose={() => setToastMessage(null)} />

      <PageHeader
        title="Student Profile & Enrollment Record"
        subtitle="Review institutional candidate credentials, academic cohort assignments, and contact preferences."
        category="Account"
        actions={
          <Button
            variant={isEditing ? 'secondary' : 'primary'}
            size="sm"
            icon={<EditIcon size={14} />}
            onClick={() => {
              if (isEditing) {
                setIsEditing(false);
                setFormData({ name: profile.name, email: profile.email, phone: profile.phone });
                setFormErrors({});
              } else {
                setIsEditing(true);
              }
            }}
          >
            {isEditing ? 'Cancel Editing' : 'Edit Contact Details'}
          </Button>
        }
      />

      {/* Main Profile Grid */}
      <div className="student-profile-layout">
        {/* Left Column: Identity Card */}
        <div className="admin-card student-identity-card">
          <div className="student-avatar-hero">
            <span>{profile.initials}</span>
          </div>

          <h2 className="profile-hero-name">{profile.name}</h2>
          <span className="profile-hero-id">{profile.id}</span>
          <span className="profile-hero-cohort">{profile.className} • {profile.division}</span>

          <div className="profile-status-pill-box">
            <Badge variant="available">{profile.enrollmentStatus}</Badge>
          </div>

          <div className="profile-divider" />

          <div className="profile-meta-list">
            <div className="p-meta-item">
              <span className="p-meta-label">Department</span>
              <span className="p-meta-val">{profile.department}</span>
            </div>
            <div className="p-meta-item">
              <span className="p-meta-label">Academic Year</span>
              <span className="p-meta-val">{profile.academicYear}</span>
            </div>
            <div className="p-meta-item">
              <span className="p-meta-label">Active Term</span>
              <span className="p-meta-val">{profile.term}</span>
            </div>
            <div className="p-meta-item">
              <span className="p-meta-label">Assigned Advisor</span>
              <span className="p-meta-val">{profile.advisor}</span>
            </div>
          </div>
        </div>

        {/* Right Column: Institutional Details & Edit Form */}
        <div className="student-profile-right-col">
          {/* Section 1: Institutionally Verified Academic Identity (Read-only) */}
          <div className="admin-card">
            <div className="admin-card-header">
              <div>
                <h3 className="admin-card-title">Institutional Academic Records</h3>
                <p className="admin-card-subtitle">
                  Registry-managed examination credentials (Read-Only)
                </p>
              </div>
              <span className="readonly-institution-tag">Verified by Registrar</span>
            </div>

            <div className="readonly-fields-grid">
              <div className="readonly-field-box">
                <span className="ro-label">Official Candidate ID</span>
                <span className="ro-value mono-id">{profile.id}</span>
                <span className="ro-hint">Permanently assigned matriculation number</span>
              </div>

              <div className="readonly-field-box">
                <span className="ro-label">Enrolled Program & Cohort</span>
                <span className="ro-value">{profile.className}</span>
                <span className="ro-hint">Spring 2026 examination cohort</span>
              </div>

              <div className="readonly-field-box">
                <span className="ro-label">Section & Division</span>
                <span className="ro-value">{profile.division}</span>
                <span className="ro-hint">Determines desk spacing allocation</span>
              </div>

              <div className="readonly-field-box">
                <span className="ro-label">Candidate Examination Standing</span>
                <span className="ro-value" style={{ color: 'var(--success)' }}>Eligible for Sitting</span>
                <span className="ro-hint">Cleared by Dean of Academic Operations</span>
              </div>
            </div>
          </div>

          {/* Section 2: Contact Information & Editable Preferences */}
          <div className="admin-card">
            <div className="admin-card-header">
              <div>
                <h3 className="admin-card-title">Contact & Communication Details</h3>
                <p className="admin-card-subtitle">
                  Where you receive examination notices and schedule alerts
                </p>
              </div>
            </div>

            {!isEditing ? (
              <div className="contact-display-grid">
                <div className="contact-item">
                  <span className="contact-label">Official Academic Email</span>
                  <span className="contact-value">{profile.email}</span>
                </div>
                <div className="contact-item">
                  <span className="contact-label">Contact Phone</span>
                  <span className="contact-value">{profile.phone}</span>
                </div>
                <div className="contact-item">
                  <span className="contact-label">Preferred Name</span>
                  <span className="contact-value">{profile.name}</span>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="admin-modal-form">
                <Input
                  label="Preferred Full Name"
                  id="student-edit-name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  error={formErrors.name}
                  required
                />

                <Input
                  label="Academic Email Address"
                  id="student-edit-email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  error={formErrors.email}
                  required
                />

                <Input
                  label="Contact Phone Number"
                  id="student-edit-phone"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  helper="Optional emergency contact number for examination logistics"
                />

                <div className="profile-edit-actions">
                  <Button
                    variant="secondary"
                    size="sm"
                    type="button"
                    onClick={() => setIsEditing(false)}
                  >
                    Cancel
                  </Button>
                  <Button variant="primary" size="sm" type="submit">
                    Save Contact Details (Demo)
                  </Button>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default StudentProfilePage;
