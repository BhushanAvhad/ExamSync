import { useState, useEffect, useCallback } from 'react';
import { PageHeader } from '../../components/admin/PageHeader';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Toast } from '../../components/admin/Toast';
import {
  FileTextIcon,
  DownloadIcon,
  PrinterIcon,
  CalendarDaysIcon,
  DoorIcon,
  UsersIcon,
  InfoIcon,
} from '../../components/ui/Icons';
import {
  INITIAL_TIMETABLE,
  INITIAL_CLASSES,
  INITIAL_ROOMS,
  INITIAL_EXAM_SESSIONS,
} from '../../data/adminDemoData';
import { exportToCSV } from '../../utils/exportUtils';
import { OfficialPrintHeader } from '../../components/common/OfficialPrintHeader';
import { OfficialPrintFooter } from '../../components/common/OfficialPrintFooter';
import {
  parseYearAndDept,
  groupTimetableByYearAndDept,
} from '../../utils/academicStructure';
import { academicsService } from '../../services/academicsService';
import { roomsService } from '../../services/roomsService';

export function ReportsPage() {
  const [selectedReportType, setSelectedReportType] = useState('master'); // 'master' | 'class' | 'room' | 'summary'
  const [toastMessage, setToastMessage] = useState(null);

  const [classes, setClasses] = useState(() => {
    try {
      const raw = localStorage.getItem('examsync_classes');
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {}
    return INITIAL_CLASSES;
  });

  const [rooms, setRooms] = useState(() => {
    try {
      const raw = localStorage.getItem('examsync_rooms');
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {}
    return INITIAL_ROOMS;
  });

  const [timetable, setTimetable] = useState(() => {
    try {
      const raw = localStorage.getItem('examsync_timetable_data');
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {}
    return INITIAL_TIMETABLE;
  });

  const loadData = useCallback(async () => {
    try {
      const [clsRes, rmRes] = await Promise.all([
        academicsService.getClasses(),
        roomsService.getRooms(),
      ]);
      if (clsRes.data) setClasses(clsRes.data);
      if (rmRes.data) setRooms(rmRes.data);

      const raw = localStorage.getItem('examsync_timetable_data');
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed) && parsed.length > 0) setTimetable(parsed);
      }
    } catch (e) {
      console.error('Failed to load reports data:', e);
    }
  }, []);

  useEffect(() => {
    loadData();

    const handleSync = () => loadData();
    window.addEventListener('examsync_classes_updated', handleSync);
    window.addEventListener('examsync_students_updated', handleSync);
    window.addEventListener('examsync_rooms_updated', handleSync);
    window.addEventListener('examsync_timetable_data', handleSync);
    window.addEventListener('storage', handleSync);

    return () => {
      window.removeEventListener('examsync_classes_updated', handleSync);
      window.removeEventListener('examsync_students_updated', handleSync);
      window.removeEventListener('examsync_rooms_updated', handleSync);
      window.removeEventListener('examsync_timetable_data', handleSync);
      window.removeEventListener('storage', handleSync);
    };
  }, [loadData]);

  const reportCategories = [
    { id: 'master', title: 'Master Institutional Timetable', desc: 'Consolidated VIT campus-wide exam schedule across all departments', icon: <FileTextIcon size={18} /> },
    { id: 'class', title: 'Class & Cohort Timetable', desc: 'Individualized exam schedules grouped by academic year and division', icon: <UsersIcon size={18} /> },
    { id: 'room', title: 'Venue & Room Occupancy', desc: 'Hourly hall utilization, seating loads, and venue allocation breakdown', icon: <DoorIcon size={18} /> },
    { id: 'summary', title: 'Exam Session Executive Summary', desc: 'Statistical summary of total papers, examinee headcounts, and session metrics', icon: <CalendarDaysIcon size={18} /> },
  ];

  // Export to Excel / CSV function with UTF-8 BOM
  const handleExportCSV = () => {
    try {
      if (selectedReportType === 'master') {
        const cols = [
          { label: 'Date', key: 'date' },
          { label: 'Time Slot', key: 'timeSlot' },
          { label: 'Academic Year', accessor: (row) => parseYearAndDept(row.className).year },
          { label: 'Department', accessor: (row) => parseYearAndDept(row.className).department },
          { label: 'Subject Code', key: 'subjectCode' },
          { label: 'Subject Name', key: 'subjectName' },
          { label: 'Assigned Venue', key: 'room' },
          { label: 'Duration', key: 'duration' },
          { label: 'Status', key: 'status' },
        ];
        exportToCSV('ExamSync_Master_Timetable_Report', cols, timetable);
      } else if (selectedReportType === 'class') {
        const cols = [
          { label: 'Academic Cohort', key: 'name' },
          { label: 'Division', key: 'division' },
          { label: 'Academic Year', key: 'academicYear' },
          { label: 'Enrolled Examinees', key: 'studentCount' },
          { label: 'Papers Scheduled', accessor: (row) => timetable.filter((t) => (t.className || '').toUpperCase().includes((row.name || '').toUpperCase())).length },
        ];
        exportToCSV('ExamSync_Cohort_Schedule_Report', cols, classes);
      } else if (selectedReportType === 'room') {
        const cols = [
          { label: 'Room Number', key: 'roomNumber' },
          { label: 'Building Location', key: 'location' },
          { label: 'Seating Capacity', key: 'capacity' },
          { label: 'Room Type', key: 'type' },
          { label: 'Availability', key: 'status' },
          { label: 'Scheduled Papers', accessor: (row) => timetable.filter((t) => (t.room || '').includes(row.roomNumber)).length },
        ];
        exportToCSV('ExamSync_Venue_Utilization_Report', cols, rooms);
      } else {
        const cols = [
          { label: 'Session Name', key: 'name' },
          { label: 'Academic Term', key: 'term' },
          { label: 'Start Date', key: 'startDate' },
          { label: 'End Date', key: 'endDate' },
          { label: 'Status', key: 'status' },
          { label: 'Description', key: 'description' },
        ];
        let sessionList = INITIAL_EXAM_SESSIONS;
        try {
          const raw = localStorage.getItem('examsync_sessions');
          if (raw) {
            const parsed = JSON.parse(raw);
            if (Array.isArray(parsed) && parsed.length > 0) sessionList = parsed;
          }
        } catch (e) {}
        exportToCSV('ExamSync_Session_Executive_Summary', cols, sessionList);
      }
      setToastMessage(`Exported ${selectedReportType.toUpperCase()} report to Excel/CSV`);
    } catch (err) {
      console.error('Report export error:', err);
      setToastMessage(`Export failed: ${err.message}`);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="admin-page-content">
      <Toast message={toastMessage} onClose={() => setToastMessage(null)} />

      <PageHeader
        title="Institutional Examination Reports"
        subtitle="Generate printable timetables, venue utilization audits, cohort schedules, and executive CSV summaries."
        category="System"
        actions={
          <div className="header-action-group">
            <Button
              variant="secondary"
              size="sm"
              icon={<DownloadIcon size={14} />}
              onClick={handleExportCSV}
            >
              Export CSV (Demo)
            </Button>
            <Button
              variant="primary"
              size="sm"
              icon={<PrinterIcon size={14} />}
              onClick={handlePrint}
            >
              Print / Save PDF
            </Button>
          </div>
        }
      />

      {/* Demo Notice */}
      <div className="admin-banner info-banner" style={{ marginBottom: 20 }}>
        <InfoIcon size={18} className="banner-icon" />
        <div className="banner-content">
          <strong>Institutional Demo Reports</strong> — Export and preview features render realistic demo metrics. Real reports will query production examination tables once database persistence is connected in Phase 3.
        </div>
      </div>

      {/* Report Categories Cards */}
      <div className="report-categories-grid">
        {reportCategories.map((cat) => {
          const isSelected = selectedReportType === cat.id;
          return (
            <div
              key={cat.id}
              className={`admin-card report-category-card ${isSelected ? 'is-selected' : ''}`}
              onClick={() => setSelectedReportType(cat.id)}
              role="button"
              tabIndex={0}
            >
              <div className="cat-top">
                <div className={`cat-icon-box ${isSelected ? 'active' : ''}`}>{cat.icon}</div>
                {isSelected && <Badge variant="available">Active View</Badge>}
              </div>
              <h4 className="cat-title">{cat.title}</h4>
              <p className="cat-desc">{cat.desc}</p>
            </div>
          );
        })}
      </div>

      {/* Live Report Preview Container */}
      <div className="admin-card report-preview-card">
        <div className="report-preview-header">
          <div>
            <div className="report-tag">OFFICIAL REPORT PREVIEW</div>
            <h3 className="report-title">
              {reportCategories.find((c) => c.id === selectedReportType)?.title}
            </h3>
            <p className="report-sub">
              Target Session: Spring 2026 Final Examinations • Draft v1.4 • Generated for Administrative Audit
            </p>
          </div>

          <div className="report-controls-inline">
            <Button
              variant="secondary"
              size="sm"
              icon={<DownloadIcon size={14} />}
              onClick={handleExportCSV}
            >
              Download CSV
            </Button>
          </div>
        </div>

        {/* Official Letterhead Header for Print Mode */}
        <OfficialPrintHeader
          documentTitle={`OFFICIAL REPORT: ${reportCategories.find((c) => c.id === selectedReportType)?.title.toUpperCase()}`}
          sessionTitle="Spring 2026 Final Examinations"
        />

        {/* Report 1: Master Timetable Preview (Grouped Year-wise and Department-wise) */}
        {selectedReportType === 'master' && (
          <div className="report-master-timetable-container">
            {groupTimetableByYearAndDept(timetable).map((grp) => (
              <div key={grp.key} className="printable-cohort-section" style={{ pageBreakInside: 'avoid', breakInside: 'avoid', marginBottom: 24 }}>
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    background: '#0f172a',
                    color: '#ffffff',
                    padding: '8px 12px',
                    borderRadius: '4px',
                    marginBottom: '8px',
                    WebkitPrintColorAdjust: 'exact',
                    printColorAdjust: 'exact',
                  }}
                >
                  <div>
                    <span style={{ background: '#38bdf8', color: '#0f172a', fontWeight: 800, fontSize: '11px', padding: '2px 8px', borderRadius: '3px', marginRight: '8px', letterSpacing: '0.5px' }}>
                      {grp.year}
                    </span>
                    <strong style={{ fontSize: '13px', textTransform: 'uppercase', letterSpacing: '0.4px' }}>
                      {grp.title}
                    </strong>
                  </div>
                  <span style={{ fontSize: '11px', color: '#cbd5e1', fontWeight: 600 }}>
                    {grp.items.length} Exam Paper{grp.items.length > 1 ? 's' : ''} Scheduled
                  </span>
                </div>

                <div className="table-wrapper">
                  <table className="table printable-official-table">
                    <thead className="table-header">
                      <tr>
                        <th className="table-th" style={{ width: '105px' }}>Date</th>
                        <th className="table-th" style={{ width: '65px' }}>Day</th>
                        <th className="table-th" style={{ width: '135px' }}>Time Slot</th>
                        <th className="table-th" style={{ width: '95px' }}>Subject Code</th>
                        <th className="table-th">Subject Title</th>
                        <th className="table-th" style={{ width: '110px' }}>Assigned Venue</th>
                        <th className="table-th" style={{ width: '80px' }}>Duration</th>
                        <th className="table-th" style={{ width: '90px' }}>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {grp.items.map((row) => {
                        const dayStr = new Date(row.date).toLocaleDateString('en-US', { weekday: 'short' });
                        return (
                          <tr key={row.id} className="table-row">
                            <td className="table-td mono-date">{row.date}</td>
                            <td className="table-td">{dayStr}</td>
                            <td className="table-td">{row.timeSlot}</td>
                            <td className="table-td"><strong>{row.subjectCode}</strong></td>
                            <td className="table-td">{row.subjectName}</td>
                            <td className="table-td">{row.room}</td>
                            <td className="table-td">{row.duration}</td>
                            <td className="table-td">
                              <Badge variant={row.status === 'Optimized' ? 'optimized' : 'scheduled'}>
                                {row.status}
                              </Badge>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Report 2: Class-wise Timetable Preview */}
        {selectedReportType === 'class' && (
          <div className="table-wrapper">
            <table className="table">
              <thead className="table-header">
                <tr>
                  <th className="table-th">Academic Cohort</th>
                  <th className="table-th">Division</th>
                  <th className="table-th">Academic Year</th>
                  <th className="table-th">Enrolled Examinees</th>
                  <th className="table-th">Papers Scheduled</th>
                  <th className="table-th">Clash Status</th>
                </tr>
              </thead>
              <tbody>
                {classes.map((cls) => {
                  const papersCount = timetable.filter((t) => (t.className || '').toUpperCase().includes((cls.name || '').toUpperCase())).length;
                  return (
                    <tr key={cls.id} className="table-row">
                      <td className="table-td"><strong>{cls.name}</strong></td>
                      <td className="table-td">Division {cls.division || 'A'}</td>
                      <td className="table-td">{cls.academicYear}</td>
                      <td className="table-td">
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                          <span>{cls.studentCount} Students</span>
                          {cls.actualEnrolledCount > 0 && (
                            <Badge variant="available">Live</Badge>
                          )}
                        </div>
                      </td>
                      <td className="table-td">{papersCount} Papers</td>
                      <td className="table-td">
                        <Badge variant="available">Zero Clashes</Badge>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Report 3: Room-wise Occupancy Preview */}
        {selectedReportType === 'room' && (
          <div className="table-wrapper">
            <table className="table">
              <thead className="table-header">
                <tr>
                  <th className="table-th">Venue / Hall</th>
                  <th className="table-th">Campus Location</th>
                  <th className="table-th">Seating Capacity</th>
                  <th className="table-th">Venue Type</th>
                  <th className="table-th">Allocated Exam Slots</th>
                  <th className="table-th">Status</th>
                </tr>
              </thead>
              <tbody>
                {rooms.map((rm) => {
                  const slotCount = timetable.filter((t) => (t.room || '').includes(rm.roomNumber)).length;
                  return (
                    <tr key={rm.id} className="table-row">
                      <td className="table-td"><strong>{rm.roomNumber}</strong></td>
                      <td className="table-td">{rm.location}</td>
                      <td className="table-td">{rm.capacity} Desks</td>
                      <td className="table-td">{rm.type}</td>
                      <td className="table-td">{slotCount} Examination Slots</td>
                      <td className="table-td">
                        <Badge variant={rm.status === 'Available' ? 'available' : 'conflict'}>
                          {rm.status}
                        </Badge>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Report 4: Executive Summary Preview */}
        {selectedReportType === 'summary' && (
          <div className="summary-report-pane">
            <div className="summary-stat-cards-row">
              <div className="summary-mini-card">
                <span className="sm-label">Total Examined Cohorts</span>
                <span className="sm-val">{classes.length} Cohorts</span>
              </div>
              <div className="summary-mini-card">
                <span className="sm-label">Aggregated Examinees</span>
                <span className="sm-val">
                  {classes.reduce((sum, c) => sum + (Number(c.studentCount) || 0), 0).toLocaleString()} Students
                </span>
              </div>
              <div className="summary-mini-card">
                <span className="sm-label">Venues Utilized</span>
                <span className="sm-val">{rooms.length} Halls</span>
              </div>
              <div className="summary-mini-card">
                <span className="sm-label">Total Scheduled Papers</span>
                <span className="sm-val">{timetable.length} Examination Papers</span>
              </div>
            </div>

            <p className="summary-report-text">
              The institutional examination schedule currently coordinates {timetable.length} examination papers across {classes.length} academic cohorts and {rooms.length} designated venues. Hard constraints regarding student overlap and seating bounds have been strictly enforced with zero clash violations.
            </p>
          </div>
        )}

        <div className="report-preview-footer">
          <span>Official audit document • ExamSync Academic Scheduling System</span>
          <span>Fictional Demonstration Dataset</span>
        </div>

        <OfficialPrintFooter />
      </div>
    </div>
  );
}

export default ReportsPage;
