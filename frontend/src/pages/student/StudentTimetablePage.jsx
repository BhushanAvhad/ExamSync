import { useState, useMemo, useEffect } from 'react';
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
  InfoIcon,
} from '../../components/ui/Icons';
import {
  STUDENT_PROFILE,
  STUDENT_TIMETABLE_ENTRIES,
} from '../../data/studentDemoData';
import { useAuth } from '../../context/useAuth';
import { studentPortalService } from '../../services/studentPortalService';

export function StudentTimetablePage() {
  const { user } = useAuth();
  const [timetable, setTimetable] = useState(STUDENT_TIMETABLE_ENTRIES);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDay, setSelectedDay] = useState('all');
  const [selectedSubject, setSelectedSubject] = useState('all');
  const [viewMode, setViewMode] = useState('table'); // 'table' | 'grid'

  useEffect(() => {
    async function load() {
      try {
        setLoading(true);
        const { data } = await studentPortalService.getStudentTimetable(user?.id);
        if (data && data.length > 0) setTimetable(data);
      } catch (err) {
        console.error('Failed to load student timetable:', err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [user]);

  const filteredEntries = useMemo(() => {
    return timetable.filter((item) => {
      const q = searchQuery.toLowerCase();
      const matchesSearch =
        !q ||
        item.subjectCode.toLowerCase().includes(q) ||
        item.subjectName.toLowerCase().includes(q) ||
        item.room.toLowerCase().includes(q) ||
        item.location.toLowerCase().includes(q);

      const matchesDay = selectedDay === 'all' || item.day.toLowerCase() === selectedDay.toLowerCase();
      const matchesSubject = selectedSubject === 'all' || item.subjectCode === selectedSubject;

      return matchesSearch && matchesDay && matchesSubject;
    });
  }, [timetable, searchQuery, selectedDay, selectedSubject]);

  const handlePrint = () => {
    window.print();
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
            <span className="mono-date">{val}</span>
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
            <span>{val}</span>
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
            <strong>{val}</strong>
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
        <span className="student-desk-badge">
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
      render: (val) => (
        <Badge variant={val === 'Optimized' ? 'optimized' : 'scheduled'}>
          {val}
        </Badge>
      ),
    },
  ];

  return (
    <div className="admin-page-content student-timetable-page">
      <PageHeader
        title="My Examination Timetable"
        subtitle={`Official examination schedule for ${STUDENT_PROFILE.name} (${STUDENT_PROFILE.id}) • ${STUDENT_PROFILE.className} (${STUDENT_PROFILE.division})`}
        category="Examinations"
        badge={
          <span className="publication-badge-pill published">
            <span className="dot" />
            Official Published Timetable
          </span>
        }
        actions={
          <Button
            variant="primary"
            size="sm"
            icon={<PrinterIcon size={15} />}
            onClick={handlePrint}
          >
            Print / Save PDF
          </Button>
        }
      />

      {/* Info notice */}
      <div className="admin-banner info-banner">
        <InfoIcon size={18} className="banner-icon" />
        <div className="banner-content">
          <strong>Individual Student Examination Schedule</strong> — The schedule reflects your enrolled curriculum modules for <strong>{STUDENT_PROFILE.term}</strong>. Desk allocations are fixed by central invigilation rules.
        </div>
      </div>

      {/* Filter and View Bar */}
      <div className="timetable-session-bar">
        <div className="session-select-inline">
          <span className="inline-label">Academic Session:</span>
          <span className="student-session-tag">Spring 2026 Final Examinations</span>
        </div>

        <div className="view-toggle-group">
          <button
            type="button"
            className={`view-toggle-btn ${viewMode === 'table' ? 'is-active' : ''}`}
            onClick={() => setViewMode('table')}
          >
            List View
          </button>
          <button
            type="button"
            className={`view-toggle-btn ${viewMode === 'grid' ? 'is-active' : ''}`}
            onClick={() => setViewMode('grid')}
          >
            Daily Slot Grid
          </button>
        </div>
      </div>

      {/* Filters and Search Bar */}
      <FilterBar
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        searchPlaceholder="Filter your examinations by subject code, title, or room..."
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
              { label: 'Thursday', value: 'thursday' },
            ],
          },
          {
            id: 'subject-filter',
            value: selectedSubject,
            onChange: setSelectedSubject,
            ariaLabel: 'Filter by Subject',
            options: [
              { label: 'All Subjects', value: 'all' },
              { label: 'CS-301 Operating Systems', value: 'CS-301' },
              { label: 'CS-401 Algorithmic Graph Theory', value: 'CS-401' },
              { label: 'SE-205 Software Architecture', value: 'SE-205' },
              { label: 'DS-310 Machine Learning', value: 'DS-310' },
            ],
          },
        ]}
      />

      {/* View 1: List View (Table with Glass Headers) */}
      {viewMode === 'table' && (
        <DataTable
          columns={columns}
          data={filteredEntries}
          idKey="id"
          pageSize={10}
          emptyTitle="No examinations match your filter"
          emptySubtitle="Try resetting search keywords or day filters."
        />
      )}

      {/* View 2: Daily Slot Grid */}
      {viewMode === 'grid' && (
        <div className="timetable-slot-grid student-slot-grid">
          {filteredEntries.map((entry) => (
            <div key={entry.id} className="slot-day-column student-slot-col">
              <div className="slot-day-header">
                <span className="slot-day-title">{entry.day}, {entry.date}</span>
                <Badge variant={entry.status === 'Optimized' ? 'optimized' : 'scheduled'}>
                  {entry.status}
                </Badge>
              </div>

              <div className="slot-day-cards">
                <div className="slot-exam-card student-grid-card">
                  <div className="slot-exam-time">
                    <ClockIcon size={14} />
                    <span>{entry.timeSlot} ({entry.duration})</span>
                  </div>

                  <div className="slot-exam-code">{entry.subjectCode}</div>
                  <h4 className="student-grid-exam-name">{entry.subjectName}</h4>

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

      {/* Printable Area Format (used when window.print() is called) */}
      <div className="student-printable-doc">
        <div className="printable-header">
          <h2>ExamSync — Personal Examination Timetable</h2>
          <p>
            Candidate: <strong>{STUDENT_PROFILE.name}</strong> ({STUDENT_PROFILE.id}) • {STUDENT_PROFILE.className} ({STUDENT_PROFILE.division})
          </p>
          <p>Session: Spring 2026 Final Examinations • Official Student Copy</p>
        </div>

        <table className="printable-table">
          <thead>
            <tr>
              <th>Date & Day</th>
              <th>Time Slot</th>
              <th>Subject</th>
              <th>Venue</th>
              <th>Desk</th>
              <th>Duration</th>
            </tr>
          </thead>
          <tbody>
            {filteredEntries.map((row) => (
              <tr key={row.id}>
                <td>{row.day}, {row.date}</td>
                <td>{row.timeSlot}</td>
                <td><strong>{row.subjectCode}</strong>: {row.subjectName}</td>
                <td>{row.room}</td>
                <td>{row.seatNumber}</td>
                <td>{row.duration}</td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className="printable-footer">
          Candidate Instructions: Photo ID verification required at entrance. Doors close 10 minutes prior to exam commencement.
        </div>
      </div>
    </div>
  );
}

export default StudentTimetablePage;
