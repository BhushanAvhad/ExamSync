import { useState, useEffect } from 'react';
import { getInstitutionSettings } from '../../utils/institutionSettings';

export function OfficialPrintHeader({
  documentTitle = 'OFFICIAL MASTER EXAMINATION TIMETABLE',
  sessionTitle = null,
  academicYear = null,
  referenceNo = null,
}) {
  const [settings, setSettings] = useState(getInstitutionSettings);

  useEffect(() => {
    const handleUpdate = (e) => {
      setSettings(e.detail || getInstitutionSettings());
    };
    window.addEventListener('examsync-settings-updated', handleUpdate);
    return () => window.removeEventListener('examsync-settings-updated', handleUpdate);
  }, []);

  const todayStr = new Date().toLocaleDateString('en-US', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  const refCode = referenceNo || `VIT-EXAM-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;

  return (
    <div className="official-print-header">
      <div className="print-header-top-row" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 16, marginBottom: 4 }}>
        {settings.logoUrl && (
          <img
            src={settings.logoUrl}
            alt={`${settings.shortName || 'VIT'} Logo`}
            className="print-institution-logo"
            style={{ height: 44, maxWidth: 160, objectFit: 'contain' }}
            onError={(e) => {
              e.currentTarget.style.display = 'none';
            }}
          />
        )}
        <div className="print-header-text-group" style={{ textAlign: 'center' }}>
          <div className="print-header-institution">
            {settings.universityName}
          </div>
          <div className="print-header-sub">
            {settings.subHeading}
          </div>
          {settings.affiliation && (
            <div className="print-header-affiliation" style={{ fontSize: '7.5pt', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.4px', margin: '1px 0' }}>
              {settings.affiliation}
            </div>
          )}
          <div className="print-header-division">
            {settings.examOffice}
          </div>
        </div>
      </div>

      <div className="print-rule-double" />

      <div className="print-title-box">
        <span className="print-document-title">{documentTitle}</span>
        <span className="print-document-session">
          {sessionTitle || settings.term} ({academicYear || settings.academicYear})
        </span>
      </div>

      <div className="print-meta-row">
        <span><strong>Document Ref:</strong> {refCode}</span>
        <span><strong>Campus:</strong> {settings.campus}</span>
        <span><strong>Website:</strong> {settings.website || 'https://vit.edu.in/'}</span>
        <span><strong>Date Issued:</strong> {todayStr}</span>
      </div>
    </div>
  );
}

export default OfficialPrintHeader;
