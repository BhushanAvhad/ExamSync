import { useState, useMemo, useEffect, useCallback } from 'react';
import { PageHeader } from '../../components/admin/PageHeader';
import { FilterBar } from '../../components/admin/FilterBar';
import { DataTable } from '../../components/admin/DataTable';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import {
  CalendarDaysIcon,
  ClockIcon,
  DoorIcon,
  PrinterIcon,
  DownloadIcon,
  ShieldCheckIcon,
} from '../../components/ui/Icons';
import {
  STUDENT_PROFILE,
  STUDENT_TIMETABLE_ENTRIES,
} from '../../data/studentDemoData';
import { useAuth } from '../../context/useAuth';
import { studentPortalService } from '../../services/studentPortalService';
import { exportToCSV } from '../../utils/exportUtils';
import { OfficialPrintHeader } from '../../components/common/OfficialPrintHeader';
import { getInstitutionSettings } from '../../utils/institutionSettings';

export function StudentTimetablePage() {
  const { user, profile: authProfile } = useAuth();
  const [studentInfo, setStudentInfo] = useState(null);
  const [timetable, setTimetable] = useState(STUDENT_TIMETABLE_ENTRIES);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDay, setSelectedDay] = useState('all');
  const [selectedSubject, setSelectedSubject] = useState('all');
  const [viewMode, setViewMode] = useState('table'); // 'table' | 'grid'

  const [isPublished, setIsPublished] = useState(() => {
    try {
      const activePub = localStorage.getItem('examsync_active_timetable_published');
      if (activePub) return JSON.parse(activePub).isPublished;
    } catch (e) {}
    return true;
  });

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      const [profRes, ttRes] = await Promise.all([
        studentPortalService.getProfile(user?.id, user?.email, user?.user_metadata),
        studentPortalService.getStudentTimetable(user?.id, user?.email),
      ]);
      if (profRes.data) setStudentInfo(profRes.data);
      if (ttRes.data && ttRes.data.length > 0) {
        setTimetable(ttRes.data);
      } else {
        setTimetable(STUDENT_TIMETABLE_ENTRIES);
      }
      try {
        const activePub = localStorage.getItem('examsync_active_timetable_published');
        if (activePub) setIsPublished(JSON.parse(activePub).isPublished);
      } catch (e) {}
    } catch (err) {
      console.error('Failed to load student timetable or profile:', err);
      setTimetable(STUDENT_TIMETABLE_ENTRIES);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Reactive listener for real-time timetable generation & publication updates
  useEffect(() => {
    const handleTimetableChange = (e) => {
      if (e?.detail?.isPublished !== undefined) {
        setIsPublished(e.detail.isPublished);
      }
      loadData();
    };
    window.addEventListener('examsync_timetable_published', handleTimetableChange);
    window.addEventListener('examsync_timetable_updated', handleTimetableChange);
    window.addEventListener('storage', handleTimetableChange);
    return () => {
      window.removeEventListener('examsync_timetable_published', handleTimetableChange);
      window.removeEventListener('examsync_timetable_updated', handleTimetableChange);
      window.removeEventListener('storage', handleTimetableChange);
    };
  }, [loadData]);

  // Derive dynamic student candidate credentials from session & matched records
  const candidateName =
    studentInfo?.name ||
    authProfile?.full_name ||
    user?.user_metadata?.full_name ||
    (user?.email ? user.email.split('@')[0].replace(/[._-]/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase()) : 'Enrolled Candidate');

  const candidateId =
    studentInfo?.id ||
    authProfile?.id ||
    (user?.id ? `VIT-${user.id.slice(0, 8).toUpperCase()}` : 'VIT-2026-001');

  const candidateClass =
    studentInfo?.className ||
    authProfile?.department ||
    'TE CMPN';

  const candidateDivision =
    studentInfo?.division ||
    'Division A';

  const candidateProgram = candidateClass.includes('CMPN')
    ? 'B.E. Computer Engineering (VIT Mumbai)'
    : candidateClass.includes('INFT')
    ? 'B.E. Information Technology (VIT Mumbai)'
    : candidateClass.includes('EXTC')
    ? 'B.E. Electronics & Telecommunication (VIT Mumbai)'
    : candidateClass.includes('ECS')
    ? 'B.E. Electronics & Computer Science (VIT Mumbai)'
    : candidateClass.includes('BIOM')
    ? 'B.E. Biomedical Engineering (VIT Mumbai)'
    : 'B.E. Engineering Programme (VIT Mumbai)';

  const filteredEntries = useMemo(() => {
    return (timetable || []).filter((item) => {
      if (!item) return false;
      const q = (searchQuery || '').toLowerCase();
      const code = (item.subjectCode || '').toLowerCase();
      const name = (item.subjectName || '').toLowerCase();
      const room = (item.room || '').toLowerCase();
      const loc = (item.location || '').toLowerCase();
      const day = (item.day || '').toLowerCase();

      const matchesSearch = !q || code.includes(q) || name.includes(q) || room.includes(q) || loc.includes(q);
      const matchesDay = selectedDay === 'all' || day === selectedDay.toLowerCase();
      const matchesSubject = selectedSubject === 'all' || item.subjectCode === selectedSubject;

      return matchesSearch && matchesDay && matchesSubject;
    });
  }, [timetable, searchQuery, selectedDay, selectedSubject]);

  const handlePrint = () => {
    window.print();
  };

  const handleExportCSV = () => {
    try {
      const exportCols = [
        { label: 'Date', key: 'date' },
        { label: 'Day', key: 'day' },
        { label: 'Time Slot', key: 'timeSlot' },
        { label: 'Duration', key: 'duration' },
        { label: 'Subject Code', key: 'subjectCode' },
        { label: 'Subject Name', key: 'subjectName' },
        { label: 'Room / Venue', key: 'room' },
        { label: 'Building Location', key: 'location' },
        { label: 'Assigned Desk', key: 'seatNumber' },
        { label: 'Exam Type', key: 'type' },
      ];
      const filename = `ExamSync_Admit_Card_${candidateName.replace(/\s+/g, '_')}_${candidateId}`;
      exportToCSV(filename, exportCols, filteredEntries);
    } catch (err) {
      console.error('Export error:', err);
    }
  };

  const columns = [
    {
      key: 'date',
      label: 'Exam Date',
      width: '130px',
      render: (val, row) => (
        <div className="table-date-cell">
          <CalendarDaysIcon size={14} className="date-icon" />
          <div>
            <span className="mono-date print-nowrap">{val}</span>
            <div className="date-sub-day">{row.day}</div>
          </div>
        </div>
      ),
    },
    {
      key: 'timeSlot',
      label: 'Time Interval',
      width: '140px',
      render: (val, row) => (
        <div className="table-slot-cell">
          <ClockIcon size={14} className="slot-icon" />
          <div>
            <span className="print-nowrap">{val}</span>
            <div className="slot-sub-dur">{row.duration}</div>
          </div>
        </div>
      ),
    },
    {
      key: 'subject',
      label: 'Subject Code & Title',
      render: (_, row) => (
        <div>
          <span className="mono-id">{row.subjectCode}</span>
          <div className="subject-tbl-name">{row.subjectName}</div>
        </div>
      ),
    },
    {
      key: 'room',
      label: 'Assigned Venue',
      width: '190px',
      render: (val, row) => (
        <div className="table-room-pill">
          <DoorIcon size={14} />
          <div>
            <strong className="print-nowrap">{val}</strong>
            <div className="room-sub-loc">{row.location}</div>
          </div>
        </div>
      ),
    },
    {
      key: 'seatNumber',
      label: 'Assigned Desk',
      width: '130px',
      render: (val) => (
        <span className="student-desk-badge print-nowrap">
          {val}
        </span>
      ),
    },
    {
      key: 'type',
      label: 'Module Type',
      width: '110px',
      render: (val) => <span className="venue-type-tag">{val}</span>,
    },
    {
      key: 'status',
      label: 'Status',
      width: '120px',
      render: (val) => {
        const displayVal = isPublished ? 'Published' : (val || 'Scheduled');
        return (
          <Badge variant={displayVal.toLowerCase()}>
            {displayVal}
          </Badge>
        );
      },
    },
  ];

  return (
    <div className="admin-page-content student-timetable-page">
      <PageHeader
        title="My Examination Timetable & Admit Card"
        subtitle={`Official examination schedule for ${candidateName} (${candidateId}) • ${candidateClass} (${candidateDivision})`}
        category="Examinations"
        badge={
          <span className={`publication-badge-pill ${isPublished ? 'published' : 'draft'}`}>
            <span className="dot" />
            {isPublished ? 'Official Published Timetable' : 'Draft / Under Academic Review'}
          </span>
        }
        actions={
          <div className="header-action-group">
            <Button
              variant="secondary"
              size="sm"
              icon={<DownloadIcon size={15} />}
              onClick={handleExportCSV}
            >
              Export CSV
            </Button>
            <Button
              variant="primary"
              size="sm"
              icon={<PrinterIcon size={15} />}
              onClick={handlePrint}
            >
              Print / Save Admit Card
            </Button>
          </div>
        }
      />

      {/* Candidate Verification Strip */}
      <div className="admin-banner info-banner" style={{ borderLeft: '4px solid #10b981', marginBottom: 20 }}>
        <ShieldCheckIcon size={18} className="banner-icon" style={{ color: '#10b981' }} />
        <div className="banner-content">
          <strong>Official Hall Ticket Record</strong> — Candidate: <strong>{candidateName}</strong> | Roll/ID: <strong>{candidateId}</strong> | Cohort: <strong>{candidateClass} ({candidateDivision})</strong>. Verify paper schedule and desk assignments below.
        </div>
      </div>

      {/* Filter and Search Bar */}
      <FilterBar
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        searchPlaceholder="Filter by course code, name, or room..."
        totalResults={filteredEntries.length}
        onClearAll={() => {
          setSearchQuery('');
          setSelectedDay('all');
          setSelectedSubject('all');
        }}
        filters={[
          {
            id: 'day-filter',
            value: selectedDay,
            onChange: setSelectedDay,
            ariaLabel: 'Filter by Day',
            options: [
              { label: 'All Days', value: 'all' },
              { label: 'Monday', value: 'monday' },
              { label: 'Wednesday', value: 'wednesday' },
              { label: 'Friday', value: 'friday' },
            ],
          },
        ]}
      />

      {/* Timetable Data Display */}
      {viewMode === 'table' ? (
        <DataTable
          columns={columns}
          data={filteredEntries}
          idKey="id"
          totalItems={filteredEntries.length}
          emptyTitle="No examinations match your filter"
          emptySubtitle="Try selecting All Days or clearing your search term."
        />
      ) : (
        <div className="student-grid-view">
          {filteredEntries.map((entry) => (
            <div key={entry.id} className="student-grid-card">
              <div className="student-grid-header">
                <span className="grid-course-code">{entry.subjectCode}</span>
                <Badge variant={entry.status === 'Optimized' ? 'optimized' : 'scheduled'}>
                  {entry.status}
                </Badge>
              </div>

              <h4 className="student-grid-title">{entry.subjectName}</h4>

              <div className="student-grid-details">
                <div className="student-grid-date-badge">
                  <CalendarDaysIcon size={14} />
                  <span>{entry.date} ({entry.day})</span>
                </div>

                <div className="student-grid-meta-box">
                  <div className="student-grid-time-row">
                    <ClockIcon size={14} />
                    <span>{entry.timeSlot}</span>
                    <span className="grid-dur-pill">{entry.duration}</span>
                  </div>

                  <div className="student-grid-venue-box">
                    <div className="grid-venue-row">
                      <DoorIcon size={14} />
                      <strong>{entry.room}</strong>
                    </div>
                    <span className="grid-loc-text">{entry.location}</span>
                  </div>

                  <div className="student-grid-desk-row">
                    <span className="desk-lbl">Assigned Seat:</span>
                    <span className="desk-val">{entry.seatNumber}</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Official Student Admit Card & Timetable Format (Active on window.print) */}
      <div className="student-admit-card-print student-printable-doc print-only">
        <OfficialPrintHeader
          documentTitle="OFFICIAL STUDENT EXAMINATION ADMIT CARD & TIMETABLE"
          sessionTitle="Spring 2026 Final Examinations"
          academicYear="2025–2026"
          referenceNo={`VIT-ADM-2026-${candidateId.replace(/[^A-Za-z0-9]/g, '').slice(-6).toUpperCase()}`}
        />

        {/* Candidate Identity Strip (DYNAMICALLY FETCHED FROM LOGIN SESSION) */}
        <div className="student-candidate-card">
          <div className="candidate-details-grid">
            <div className="candidate-detail-item">
              <span className="cd-label">Candidate Name:</span>
              <strong className="cd-val" style={{ color: '#0f172a', fontSize: '15px' }}>{candidateName}</strong>
            </div>
            <div className="candidate-detail-item">
              <span className="cd-label">Roll / Reg No:</span>
              <strong className="cd-val" style={{ fontFamily: 'monospace', fontSize: '14px' }}>{candidateId}</strong>
            </div>
            <div className="candidate-detail-item">
              <span className="cd-label">Academic Program:</span>
              <span className="cd-val">{candidateProgram}</span>
            </div>
            <div className="candidate-detail-item">
              <span className="cd-label">Cohort & Section:</span>
              <span className="cd-val">{candidateClass} — {candidateDivision}</span>
            </div>
            <div className="candidate-detail-item">
              <span className="cd-label">Exam Center:</span>
              <span className="cd-val">{getInstitutionSettings()?.campus || 'Vidyalankar Educational Campus, Wadala (East), Mumbai 400037'}</span>
            </div>
            <div className="candidate-detail-item">
              <span className="cd-label">Reporting Time:</span>
              <span className="cd-val">30 mins prior to paper commencement</span>
            </div>
          </div>

          <div className="candidate-photo-box">
            AFFIX PASSPORT SIZE PHOTOGRAPH HERE
          </div>
        </div>

        {/* Examination Papers Table */}
        <table className="printable-official-table">
          <thead>
            <tr>
              <th style={{ width: '115px' }}>Date & Day</th>
              <th style={{ width: '135px' }}>Time Slot</th>
              <th style={{ width: '85px' }}>Course Code</th>
              <th>Course / Subject Title</th>
              <th style={{ width: '130px' }}>Assigned Venue</th>
              <th style={{ width: '65px' }}>Desk</th>
              <th style={{ width: '75px' }}>Duration</th>
              <th style={{ width: '85px' }}>Invigilator</th>
            </tr>
          </thead>
          <tbody>
            {filteredEntries.map((row) => (
              <tr key={row.id}>
                <td className="print-nowrap" style={{ fontWeight: 600 }}>{row.date} ({row.day ? row.day.slice(0, 3) : ''})</td>
                <td className="print-nowrap">{row.timeSlot}</td>
                <td className="mono-id print-nowrap">{row.subjectCode}</td>
                <td className="subject-tbl-name">{row.subjectName}</td>
                <td className="print-nowrap">{row.room}</td>
                <td className="print-nowrap" style={{ fontWeight: 700, textAlign: 'center' }}>{row.seatNumber}</td>
                <td className="print-nowrap">{row.duration}</td>
                <td style={{ textAlign: 'center', color: '#94a3b8' }}>________</td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Candidate Rules and Instructions */}
        <div className="student-instructions-card">
          <div className="student-instructions-title">IMPORTANT INSTRUCTIONS FOR EXAMINEES:</div>
          <ol className="student-instructions-list">
            <li>Candidates must present this authenticated Admit Card alongside valid Institutional Photo ID at the examination hall portal.</li>
            <li>Possession of smartphones, wearable tech, unauthorized books, programmable calculators, or revision notes inside the hall is strictly prohibited.</li>
            <li>Candidates must strictly occupy their assigned desk number only. Late admittance will not be permitted 15 minutes after session commencement.</li>
            <li>Examinees are not permitted to exit the examination hall during the initial 60 minutes or final 15 minutes of the paper.</li>
          </ol>
        </div>

        {/* Signatures and Verification */}
        <div className="student-signature-row">
          <div className="student-sig-block">
            <div className="print-signature-line" />
            <div className="print-signature-name">Candidate's Signature</div>
            <div className="print-signature-title">({candidateName})</div>
          </div>

          <div className="student-sig-block">
            <div className="print-seal-box">
              OFFICIAL<br />EXAM CELL<br />SEAL
            </div>
          </div>

          <div className="student-sig-block">
            <div className="print-signature-line" />
            <div className="print-signature-name">Controller of Examinations</div>
            <div className="print-signature-title">VIT Examination Cell, Wadala</div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default StudentTimetablePage;
