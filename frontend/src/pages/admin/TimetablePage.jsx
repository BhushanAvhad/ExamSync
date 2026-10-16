import { useState, useMemo, useEffect, useCallback } from 'react';
import { PageHeader } from '../../components/admin/PageHeader';
import { FilterBar } from '../../components/admin/FilterBar';
import { DataTable } from '../../components/admin/DataTable';
import { Modal } from '../../components/admin/Modal';
import { ConfirmDialog } from '../../components/admin/ConfirmDialog';
import { Toast } from '../../components/admin/Toast';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Badge } from '../../components/ui/Badge';
import {
  CalendarDaysIcon,
  ClockIcon,
  DoorIcon,
  EditIcon,
  PrinterIcon,
  EyeIcon,
  CheckCircleIcon,
  DownloadIcon,
} from '../../components/ui/Icons';
import {
  INITIAL_TIMETABLE,
  INITIAL_EXAM_SESSIONS,
} from '../../data/adminDemoData';
import { timetablesService } from '../../services/timetablesService';
import { sessionsService } from '../../services/sessionsService';
import { exportToCSV } from '../../utils/exportUtils';
import { OfficialPrintHeader } from '../../components/common/OfficialPrintHeader';
import { OfficialPrintFooter } from '../../components/common/OfficialPrintFooter';
import {
  parseYearAndDept,
  groupTimetableByYearAndDept,
  YEAR_FILTER_OPTIONS,
  getDepartmentFilterOptions,
} from '../../utils/academicStructure';

export function TimetablePage() {
  const [timetable, setTimetable] = useState(INITIAL_TIMETABLE);
  const [sessions, setSessions] = useState(() => {
    try {
      const raw = localStorage.getItem('examsync_sessions');
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {}
    return INITIAL_EXAM_SESSIONS;
  });
  const [selectedSessionId, setSelectedSessionId] = useState(() => {
    try {
      const raw = localStorage.getItem('examsync_sessions');
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed[0].id;
      }
    } catch (e) {}
    return 'SESS-2026-02';
  });
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedYear, setSelectedYear] = useState('all');
  const [selectedDepartment, setSelectedDepartment] = useState('all');
  const [selectedPrintScope, setSelectedPrintScope] = useState('all');
  const [selectedRoom, setSelectedRoom] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [viewMode, setViewMode] = useState('table'); // 'table' | 'grid'
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;

  // Publish confirmation modal state initialized dynamically from preview store
  const [showPublishDialog, setShowPublishDialog] = useState(false);
  const [isPublished, setIsPublished] = useState(() => {
    try {
      const activePub = localStorage.getItem('examsync_session_published_active');
      if (activePub) return JSON.parse(activePub).isPublished;
      const sessPub = localStorage.getItem('examsync_session_published_SESS-2026-02');
      if (sessPub) return JSON.parse(sessPub).isPublished;
    } catch (e) {
      // ignore
    }
    return false;
  });

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      const [ttRes, sessRes] = await Promise.all([
        timetablesService.getTimetables(selectedSessionId),
        sessionsService.getExamSessions(),
      ]);
      if (ttRes.data) setTimetable(ttRes.data);
      if (sessRes.data) setSessions(sessRes.data);
    } catch (err) {
      console.error('Failed to load timetable:', err);
    } finally {
      setLoading(false);
    }
  }, [selectedSessionId]);

  useEffect(() => {
    loadData();
    const handleSessionsUpdate = () => loadData();
    window.addEventListener('examsync_sessions_updated', handleSessionsUpdate);
    return () => window.removeEventListener('examsync_sessions_updated', handleSessionsUpdate);
  }, [loadData]);

  // Synchronize published state when session changes
  useEffect(() => {
    try {
      const sessPub = localStorage.getItem(`examsync_session_published_${selectedSessionId}`);
      if (sessPub) {
        setIsPublished(JSON.parse(sessPub).isPublished);
      } else {
        const activePub = localStorage.getItem('examsync_session_published_active');
        if (activePub) {
          const parsed = JSON.parse(activePub);
          setIsPublished(parsed.sessionId === selectedSessionId ? parsed.isPublished : false);
        } else {
          setIsPublished(false);
        }
      }
    } catch (e) {
      // ignore
    }
  }, [selectedSessionId]);

  // Edit entry modal
  const [editingEntry, setEditingEntry] = useState(null);
  const [editForm, setEditForm] = useState({
    id: '',
    date: '',
    timeSlot: '',
    subjectCode: '',
    subjectName: '',
    className: '',
    division: '',
    room: '',
    duration: '',
    status: 'Scheduled',
  });
  const [editErrors, setEditErrors] = useState({});

  // View details modal
  const [viewEntry, setViewEntry] = useState(null);

  // Preview printable modal
  const [showPreviewModal, setShowPreviewModal] = useState(false);

  // Toast feedback
  const [toastMessage, setToastMessage] = useState(null);

  // Filtered timetable entries (Year-wise and Department-wise, not division-wise)
  const filteredEntries = useMemo(() => {
    return timetable.filter((item) => {
      const { year, department, departmentLabel } = parseYearAndDept(item.className || '');
      const q = searchQuery.toLowerCase();
      const matchesSearch =
        !q ||
        item.subjectCode.toLowerCase().includes(q) ||
        item.subjectName.toLowerCase().includes(q) ||
        (item.className && item.className.toLowerCase().includes(q)) ||
        (item.room && item.room.toLowerCase().includes(q)) ||
        year.toLowerCase().includes(q) ||
        department.toLowerCase().includes(q) ||
        departmentLabel.toLowerCase().includes(q);

      const matchesYear =
        selectedYear === 'all' || year.toUpperCase() === selectedYear.toUpperCase();

      const matchesDept =
        selectedDepartment === 'all' || department.toUpperCase() === selectedDepartment.toUpperCase();

      const matchesRoom =
        selectedRoom === 'all' || item.room.includes(selectedRoom);

      const matchesStatus =
        selectedStatus === 'all' || item.status.toLowerCase() === selectedStatus.toLowerCase();

      return matchesSearch && matchesYear && matchesDept && matchesRoom && matchesStatus;
    });
  }, [timetable, searchQuery, selectedYear, selectedDepartment, selectedRoom, selectedStatus]);

  // Dynamic filter options derived from academic structure
  const departmentFilterOptions = useMemo(() => {
    return getDepartmentFilterOptions(timetable);
  }, [timetable]);

  const roomFilterOptions = useMemo(() => {
    const list = Array.from(new Set(timetable.map((t) => t.room).filter(Boolean))).sort();
    return [{ label: 'All Venues', value: 'all' }, ...list.map((r) => ({ label: r, value: r }))];
  }, [timetable]);

  const editVenueOptions = useMemo(() => {
    const set = new Set([...timetable.map((t) => t.room).filter(Boolean), 'A101', 'A201', 'A202', 'A204', 'A301', 'B201', 'C101', 'F101', 'M101', 'L01', 'L02']);
    return Array.from(set).sort();
  }, [timetable]);

  // Grouped entries strictly Year-wise and Department-wise for unmixed printing
  const groupedPrintEntries = useMemo(() => {
    let list = filteredEntries;
    if (selectedPrintScope !== 'all') {
      list = filteredEntries.filter((item) => {
        const { year } = parseYearAndDept(item.className || '');
        return year.toUpperCase() === selectedPrintScope.toUpperCase();
      });
    }
    return groupTimetableByYearAndDept(list);
  }, [filteredEntries, selectedPrintScope]);

  // Handle Edit Modal
  const handleOpenEdit = (entry) => {
    setEditingEntry(entry);
    setEditForm({ ...entry });
    setEditErrors({});
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    const errors = {};
    if (!editForm.date) errors.date = 'Examination date is required';
    if (!editForm.timeSlot) errors.timeSlot = 'Time slot is required';
    if (!editForm.room) errors.room = 'Venue assignment is required';

    if (Object.keys(errors).length > 0) {
      setEditErrors(errors);
      return;
    }

    try {
      await timetablesService.updateTimetableEntry(editingEntry.id, {
        date: editForm.date,
        status: editForm.status,
      });
      setTimetable((prev) => {
        const next = prev.map((item) => (item.id === editingEntry.id ? { ...editForm } : item));
        try {
          const sessionKey = selectedSessionId || 'default';
          localStorage.setItem(`examsync_timetable_data_${sessionKey}`, JSON.stringify(next));
          localStorage.setItem('examsync_timetable_data', JSON.stringify(next));
        } catch (err) {}
        return next;
      });
      setToastMessage(`Timetable slot for ${editForm.subjectCode} updated in database`);
    } catch (err) {
      console.error('Error updating timetable:', err);
      setTimetable((prev) => {
        const next = prev.map((item) => (item.id === editingEntry.id ? { ...editForm } : item));
        try {
          const sessionKey = selectedSessionId || 'default';
          localStorage.setItem(`examsync_timetable_data_${sessionKey}`, JSON.stringify(next));
          localStorage.setItem('examsync_timetable_data', JSON.stringify(next));
        } catch (storageErr) {}
        return next;
      });
      setToastMessage(`Timetable slot for ${editForm.subjectCode} updated locally (${err.message})`);
    } finally {
      setEditingEntry(null);
    }
  };

  // Handle Publish action - dynamically alters local preview session data
  const handlePublishConfirm = async () => {
    const nextPublishedState = !isPublished;
    setShowPublishDialog(false);

    try {
      await timetablesService.publishTimetables(selectedSessionId, nextPublishedState);
    } catch (err) {
      console.warn('Publish note:', err.message);
    }

    // Dynamically update active timetable rows in state
    setTimetable((prev) => {
      const nextList = prev.map((item) => ({
        ...item,
        status: nextPublishedState ? 'Published' : 'Scheduled',
        isPublished: nextPublishedState,
      }));
      return nextList;
    });

    setIsPublished(nextPublishedState);

    if (nextPublishedState) {
      setToastMessage('Official examination timetable published! Student portals & admit cards are active.');
    } else {
      setToastMessage('Timetable reverted to Unpublished Draft status across local preview sessions.');
    }
  };

  const handleExportCSV = () => {
    try {
      const exportCols = [
        { label: 'Exam Date', key: 'date' },
        { label: 'Time Slot', key: 'timeSlot' },
        { label: 'Academic Year', accessor: (row) => parseYearAndDept(row.className).year },
        { label: 'Department', accessor: (row) => parseYearAndDept(row.className).department },
        { label: 'Subject Code', key: 'subjectCode' },
        { label: 'Subject Name', key: 'subjectName' },
        { label: 'Assigned Venue', key: 'room' },
        { label: 'Duration', key: 'duration' },
        { label: 'Status', key: 'status' },
      ];
      const currentSess = sessions.find((s) => s.id === selectedSessionId);
      const sessionLabel = currentSess ? currentSess.name.replace(/[^a-zA-Z0-9_-]/g, '_') : 'Spring_2026';
      const filename = `ExamSync_Master_Timetable_${sessionLabel}`;
      exportToCSV(filename, exportCols, filteredEntries);
      setToastMessage(`Exported ${filteredEntries.length} timetable records to Excel/CSV.`);
    } catch (err) {
      console.error('Export error:', err);
      setToastMessage(`Export failed: ${err.message}`);
    }
  };

  const columns = [
    {
      key: 'date',
      label: 'Exam Date',
      width: '130px',
      render: (val) => (
        <div className="table-date-cell">
          <CalendarDaysIcon size={14} className="date-icon" />
          <span className="mono-date print-nowrap">{val}</span>
        </div>
      ),
    },
    {
      key: 'timeSlot',
      label: 'Time Interval',
      width: '140px',
      render: (val) => (
        <div className="table-slot-cell">
          <ClockIcon size={14} className="slot-icon" />
          <span className="print-nowrap">{val}</span>
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
      key: 'year',
      label: 'Academic Year',
      width: '120px',
      render: (_, row) => {
        const { year } = parseYearAndDept(row.className);
        return (
          <span className="overview-cycle-pill" style={{ fontWeight: 700, padding: '3px 8px' }}>
            {year}
          </span>
        );
      },
    },
    {
      key: 'department',
      label: 'Department',
      width: '170px',
      render: (_, row) => {
        const { department, departmentLabel } = parseYearAndDept(row.className);
        return (
          <div>
            <strong style={{ color: 'var(--text-primary)', fontSize: 13 }}>{department}</strong>
            <div style={{ color: 'var(--text-secondary)', fontSize: 11 }}>{departmentLabel}</div>
          </div>
        );
      },
    },
    {
      key: 'room',
      label: 'Assigned Venue',
      width: '180px',
      render: (val) => (
        <div className="table-room-pill">
          <DoorIcon size={14} />
          <span className="print-nowrap">{val}</span>
        </div>
      ),
    },
    {
      key: 'duration',
      label: 'Duration',
      width: '110px',
      render: (val) => <span className="duration-text">{val}</span>,
    },
    {
      key: 'status',
      label: 'Slot Status',
      width: '120px',
      render: (val, row) => {
        const isLive = isPublished || row.isPublished;
        const displayVal = isLive ? 'Published' : val;
        return (
          <Badge variant={displayVal.toLowerCase()}>
            {displayVal}
          </Badge>
        );
      },
    },
    {
      key: 'actions',
      label: 'Actions',
      width: '90px',
      align: 'right',
      render: (_, row) => (
        <div className="table-action-btns">
          <button
            type="button"
            className="action-icon-btn"
            onClick={() => setViewEntry(row)}
            title="Inspect slot details"
            aria-label="Inspect details"
          >
            <EyeIcon size={14} />
          </button>
          <button
            type="button"
            className="action-icon-btn"
            onClick={() => handleOpenEdit(row)}
            title="Edit exam allocation"
            aria-label="Edit entry"
          >
            <EditIcon size={14} />
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="admin-page-content">
      <Toast message={toastMessage} onClose={() => setToastMessage(null)} />

      <PageHeader
        title="Master Examination Timetable"
        subtitle="View, inspect, and adjust institutional examination schedules and venue allocations."
        category="Scheduling"
        badge={
          <span className={`publication-badge-pill ${isPublished ? 'published' : 'draft'}`}>
            <span className="dot" />
            {isPublished ? 'Live & Published to Students' : 'Draft v1.4 (Unpublished)'}
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
              Export Excel / CSV
            </Button>
            <Button
              variant="secondary"
              size="sm"
              icon={<PrinterIcon size={15} />}
              onClick={() => setShowPreviewModal(true)}
            >
              Print / Preview
            </Button>
            {isPublished ? (
              <Button
                variant="secondary"
                size="sm"
                icon={<CheckCircleIcon size={15} style={{ color: 'var(--success)' }} />}
                onClick={() => setShowPublishDialog(true)}
                title="Click to revert or unpublish this timetable session"
              >
                Published (Revert to Draft)
              </Button>
            ) : (
              <Button
                variant="primary"
                size="sm"
                icon={<CheckCircleIcon size={15} />}
                onClick={() => setShowPublishDialog(true)}
              >
                Publish Timetable
              </Button>
            )}
          </div>
        }
      />

      {/* Session Selector Strip */}
      <div className="timetable-session-bar">
        <div className="session-select-inline">
          <label htmlFor="tt-session" className="inline-label">Active Exam Session:</label>
          <select
            id="tt-session"
            className="filter-select inline-select"
            value={selectedSessionId}
            onChange={(e) => setSelectedSessionId(e.target.value)}
          >
            {sessions.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name} ({s.term})
              </option>
            ))}
          </select>
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

      {/* Filter and Search Bar */}
      <FilterBar
        searchQuery={searchQuery}
        onSearchChange={(q) => {
          setSearchQuery(q);
          setCurrentPage(1);
        }}
        searchPlaceholder="Filter by course code, name, year, department, or venue..."
        totalResults={filteredEntries.length}
        onClearAll={() => {
          setSearchQuery('');
          setSelectedYear('all');
          setSelectedDepartment('all');
          setSelectedRoom('all');
          setSelectedStatus('all');
          setCurrentPage(1);
        }}
        filters={[
          {
            id: 'year-filter',
            value: selectedYear,
            onChange: (val) => {
              setSelectedYear(val);
              setCurrentPage(1);
            },
            ariaLabel: 'Filter by Academic Year',
            options: YEAR_FILTER_OPTIONS,
          },
          {
            id: 'dept-filter',
            value: selectedDepartment,
            onChange: (val) => {
              setSelectedDepartment(val);
              setCurrentPage(1);
            },
            ariaLabel: 'Filter by Department',
            options: departmentFilterOptions,
          },
          {
            id: 'room-filter',
            value: selectedRoom,
            onChange: (val) => {
              setSelectedRoom(val);
              setCurrentPage(1);
            },
            ariaLabel: 'Filter by Room',
            options: roomFilterOptions,
          },
          {
            id: 'status-filter',
            value: selectedStatus,
            onChange: (val) => {
              setSelectedStatus(val);
              setCurrentPage(1);
            },
            ariaLabel: 'Filter by Status',
            options: [
              { label: 'All States', value: 'all' },
              { label: 'Scheduled', value: 'scheduled' },
              { label: 'Optimized', value: 'optimized' },
            ],
          },
        ]}
      />

      {/* View 1: List / Table View */}
      {viewMode === 'table' && (
        <DataTable
          columns={columns}
          data={filteredEntries}
          idKey="id"
          currentPage={currentPage}
          pageSize={pageSize}
          onPageChange={setCurrentPage}
          totalItems={filteredEntries.length}
          emptyTitle="No timetable records found"
          emptySubtitle="Try adjusting the cohort, venue, or keyword filters."
        />
      )}

      {/* View 2: Daily Slot Grid */}
      {viewMode === 'grid' && (
        <div className="timetable-slot-grid">
          {['2026-05-18', '2026-05-19', '2026-05-20', '2026-05-21', '2026-05-22'].map((dateStr) => {
            const dayEntries = filteredEntries.filter((item) => item.date === dateStr);
            const dateObj = new Date(dateStr);
            const dayLabel = dateObj.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });

            return (
              <div key={dateStr} className="slot-day-column">
                <div className="slot-day-header">
                  <span className="slot-day-title">{dayLabel}</span>
                  <span className="slot-day-count">{dayEntries.length} Papers</span>
                </div>

                <div className="slot-day-cards">
                  {dayEntries.length === 0 ? (
                    <div className="slot-empty-card">No exams scheduled</div>
                  ) : (
                    dayEntries.map((e) => (
                      <div
                        key={e.id}
                        className="slot-exam-card"
                        onClick={() => setViewEntry(e)}
                        role="button"
                        tabIndex={0}
                      >
                        <div className="slot-exam-time">
                          <ClockIcon size={13} />
                          <span>{e.timeSlot}</span>
                        </div>
                        <div className="slot-exam-code">{e.subjectCode}</div>
                        <div className="slot-exam-name">{e.subjectName}</div>
                        <div className="slot-exam-venue">
                          <DoorIcon size={12} />
                          <span>{e.room}</span>
                        </div>
                        <div className="slot-exam-cohort">
                          <span style={{ fontWeight: 700 }}>{parseYearAndDept(e.className).year}</span>
                          <span> • </span>
                          <span>{parseYearAndDept(e.className).department}</span>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Official Printable Master Timetable (Rendered cleanly Year-wise and Department-wise) */}
      <div className="admin-printable-doc print-only">
        <OfficialPrintHeader
          documentTitle="OFFICIAL MASTER EXAMINATION TIMETABLE"
          sessionTitle={sessions.find((s) => s.id === selectedSessionId)?.name}
        />

        {groupedPrintEntries.map((grp) => (
          <div
            key={grp.key}
            className="printable-cohort-section"
            style={{ pageBreakInside: 'avoid', breakInside: 'avoid', marginBottom: 28 }}
          >
            <div
              className="printable-cohort-header"
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                borderBottom: '2px solid #0f172a',
                paddingBottom: '4px',
                marginBottom: '10px',
              }}
            >
              <div>
                <span
                  style={{
                    fontSize: '11px',
                    fontWeight: 800,
                    background: '#0f172a',
                    color: '#ffffff',
                    padding: '2px 8px',
                    borderRadius: '3px',
                    marginRight: '8px',
                    letterSpacing: '0.5px',
                  }}
                >
                  {grp.year}
                </span>
                <strong style={{ fontSize: '13px', textTransform: 'uppercase', color: '#0f172a', letterSpacing: '0.4px' }}>
                  {grp.title}
                </strong>
              </div>
              <span style={{ fontSize: '11px', color: '#475569', fontWeight: 600 }}>
                {grp.items.length} Examination Paper{grp.items.length > 1 ? 's' : ''}
              </span>
            </div>

            <table className="printable-official-table" style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '16px' }}>
              <thead>
                <tr style={{ background: '#f1f5f9' }}>
                  <th style={{ width: '105px' }}>Date</th>
                  <th style={{ width: '65px' }}>Day</th>
                  <th style={{ width: '135px' }}>Time Slot</th>
                  <th style={{ width: '90px' }}>Course Code</th>
                  <th>Course / Subject Title</th>
                  <th style={{ width: '115px' }}>Assigned Venue</th>
                  <th style={{ width: '80px' }}>Duration</th>
                </tr>
              </thead>
              <tbody>
                {grp.items.map((row) => {
                  const dayStr = new Date(row.date).toLocaleDateString('en-US', { weekday: 'short' });
                  return (
                    <tr key={row.id}>
                      <td className="print-nowrap" style={{ fontWeight: 600 }}>{row.date}</td>
                      <td className="print-nowrap">{dayStr}</td>
                      <td className="print-nowrap">{row.timeSlot}</td>
                      <td className="mono-id print-nowrap">{row.subjectCode}</td>
                      <td className="subject-tbl-name">{row.subjectName}</td>
                      <td className="print-nowrap">{row.room}</td>
                      <td className="print-nowrap">{row.duration}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ))}

        <OfficialPrintFooter />
      </div>

      {/* Edit Entry Modal */}
      {editingEntry && (
        <Modal
          isOpen={Boolean(editingEntry)}
          onClose={() => setEditingEntry(null)}
          title={`Edit Schedule: ${editingEntry.subjectCode}`}
          subtitle="Manually override scheduled examination slot and venue"
          footer={
            <div className="modal-form-actions">
              <Button variant="secondary" size="sm" onClick={() => setEditingEntry(null)}>
                Cancel
              </Button>
              <Button variant="primary" size="sm" onClick={handleEditSubmit}>
                Save Changes
              </Button>
            </div>
          }
        >
          <form onSubmit={handleEditSubmit} className="admin-modal-form">
            <Input
              label="Subject Code & Title"
              id="edit-sub"
              value={`${editForm.subjectCode} — ${editForm.subjectName}`}
              readOnly
            />

            <div className="form-row-2col">
              <Input
                label="Examination Date"
                id="edit-date"
                type="date"
                value={editForm.date}
                onChange={(e) => setEditForm({ ...editForm, date: e.target.value })}
                error={editErrors.date}
                required
              />

              <div className="input-group">
                <label htmlFor="edit-timeslot" className="input-label">Time Interval</label>
                <select
                  id="edit-timeslot"
                  className="input-field"
                  value={editForm.timeSlot}
                  onChange={(e) => setEditForm({ ...editForm, timeSlot: e.target.value })}
                >
                  <option value="09:00 — 12:00">09:00 — 12:00 (Morning)</option>
                  <option value="13:30 — 16:30">13:30 — 16:30 (Afternoon)</option>
                  <option value="17:30 — 20:30">17:30 — 20:30 (Evening)</option>
                </select>
              </div>
            </div>

            <div className="form-row-2col">
              <div className="input-group">
                <label htmlFor="edit-venue" className="input-label">Assigned Venue</label>
                <select
                  id="edit-venue"
                  className="input-field"
                  value={editForm.room}
                  onChange={(e) => setEditForm({ ...editForm, room: e.target.value })}
                >
                  {editVenueOptions.map((v) => (
                    <option key={v} value={v}>
                      {v}
                    </option>
                  ))}
                </select>
              </div>

              <div className="input-group">
                <label htmlFor="edit-status" className="input-label">Status Override</label>
                <select
                  id="edit-status"
                  className="input-field"
                  value={editForm.status}
                  onChange={(e) => setEditForm({ ...editForm, status: e.target.value })}
                >
                  <option value="Scheduled">Scheduled</option>
                  <option value="Optimized">Optimized</option>
                </select>
              </div>
            </div>
          </form>
        </Modal>
      )}

      {/* Inspect Entry Modal */}
      {viewEntry && (
        <Modal
          isOpen={Boolean(viewEntry)}
          onClose={() => setViewEntry(null)}
          title={`Slot Details: ${viewEntry.subjectCode}`}
          subtitle={viewEntry.subjectName}
          footer={
            <Button variant="secondary" size="sm" onClick={() => setViewEntry(null)}>
              Close
            </Button>
          }
        >
          <div className="inspect-session-body">
            <div className="inspect-item">
              <span className="inspect-label">Date & Timing</span>
              <p className="inspect-text">{viewEntry.date} • {viewEntry.timeSlot} ({viewEntry.duration})</p>
            </div>
            <div className="inspect-item">
              <span className="inspect-label">Academic Cohort</span>
              <p className="inspect-text">{parseYearAndDept(viewEntry.className).cohortLabel}</p>
            </div>
            <div className="inspect-item">
              <span className="inspect-label">Venue</span>
              <p className="inspect-text">{viewEntry.room}</p>
            </div>
            <div className="inspect-item">
              <span className="inspect-label">Optimization State</span>
              <Badge variant={viewEntry.status === 'Optimized' ? 'optimized' : 'scheduled'}>
                {viewEntry.status}
              </Badge>
            </div>
          </div>
        </Modal>
      )}

      {/* Print / Preview Modal */}
      {showPreviewModal && (
        <Modal
          isOpen={showPreviewModal}
          onClose={() => setShowPreviewModal(false)}
          title="Printable Timetable Schedule Preview"
          subtitle="Official institutional examination publication format"
          maxWidth={820}
          footer={
            <div className="modal-form-actions">
              <Button variant="secondary" size="sm" onClick={() => setShowPreviewModal(false)}>
                Close Preview
              </Button>
              <Button
                variant="primary"
                size="sm"
                icon={<PrinterIcon size={14} />}
                onClick={() => {
                  setShowPreviewModal(false);
                  setTimeout(() => window.print(), 180);
                }}
              >
                Print / Save PDF
              </Button>
            </div>
          }
        >
          <div className="printable-preview-area" style={{ background: '#ffffff', color: '#0f172a', padding: '20px 24px', borderRadius: '8px' }}>
            <div className="no-print" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px', background: '#f8fafc', padding: '10px 14px', borderRadius: '6px', border: '1px solid #e2e8f0' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <label htmlFor="preview-scope" style={{ fontSize: '13px', fontWeight: 700, color: '#334155' }}>
                  Print Scope:
                </label>
                <select
                  id="preview-scope"
                  className="filter-select inline-select"
                  value={selectedPrintScope}
                  onChange={(e) => setSelectedPrintScope(e.target.value)}
                  style={{ minWidth: '220px' }}
                >
                  <option value="all">All Academic Years & Depts (Grouped)</option>
                  <option value="FE">First Year (FE) Only</option>
                  <option value="SE">Second Year (SE) Only</option>
                  <option value="TE">Third Year (TE) Only</option>
                  <option value="BE">Final Year (BE) Only</option>
                </select>
              </div>
              <span style={{ fontSize: '12px', color: '#64748b', fontWeight: 500 }}>
                {groupedPrintEntries.length} Departmental Cohort Schedule{groupedPrintEntries.length > 1 ? 's' : ''}
              </span>
            </div>

            <OfficialPrintHeader
              documentTitle="OFFICIAL MASTER EXAMINATION TIMETABLE"
              sessionTitle={sessions.find((s) => s.id === selectedSessionId)?.name}
            />

            {groupedPrintEntries.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '30px 16px', color: '#64748b' }}>
                No timetable slots match the selected scope.
              </div>
            ) : (
              groupedPrintEntries.map((grp) => (
                <div key={grp.key} className="printable-cohort-section" style={{ pageBreakInside: 'avoid', breakInside: 'avoid', marginBottom: '24px' }}>
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      borderBottom: '2px solid #0f172a',
                      paddingBottom: '4px',
                      marginBottom: '10px',
                    }}
                  >
                    <div>
                      <span
                        style={{
                          fontSize: '11px',
                          fontWeight: 800,
                          background: '#0f172a',
                          color: '#ffffff',
                          padding: '2px 8px',
                          borderRadius: '3px',
                          marginRight: '8px',
                          letterSpacing: '0.5px',
                        }}
                      >
                        {grp.year}
                      </span>
                      <strong style={{ fontSize: '13px', textTransform: 'uppercase', color: '#0f172a', letterSpacing: '0.4px' }}>
                        {grp.title}
                      </strong>
                    </div>
                    <span style={{ fontSize: '11px', color: '#475569', fontWeight: 600 }}>
                      {grp.items.length} Examination Paper{grp.items.length > 1 ? 's' : ''}
                    </span>
                  </div>

                  <table className="printable-official-table" style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '14px' }}>
                    <thead>
                      <tr style={{ background: '#f1f5f9' }}>
                        <th style={{ padding: '7px 10px', border: '1px solid #1e293b', textAlign: 'left', fontSize: 11, width: '105px' }}>Date</th>
                        <th style={{ padding: '7px 10px', border: '1px solid #1e293b', textAlign: 'left', fontSize: 11, width: '65px' }}>Day</th>
                        <th style={{ padding: '7px 10px', border: '1px solid #1e293b', textAlign: 'left', fontSize: 11, width: '135px' }}>Time</th>
                        <th style={{ padding: '7px 10px', border: '1px solid #1e293b', textAlign: 'left', fontSize: 11, width: '90px' }}>Course</th>
                        <th style={{ padding: '7px 10px', border: '1px solid #1e293b', textAlign: 'left', fontSize: 11 }}>Course Title</th>
                        <th style={{ padding: '7px 10px', border: '1px solid #1e293b', textAlign: 'left', fontSize: 11, width: '110px' }}>Venue</th>
                        <th style={{ padding: '7px 10px', border: '1px solid #1e293b', textAlign: 'left', fontSize: 11, width: '80px' }}>Duration</th>
                      </tr>
                    </thead>
                    <tbody>
                      {grp.items.map((row) => {
                        const dayStr = new Date(row.date).toLocaleDateString('en-US', { weekday: 'short' });
                        return (
                          <tr key={row.id}>
                            <td style={{ padding: '7px 10px', border: '1px solid #cbd5e1', fontSize: 11, fontWeight: 600, whiteSpace: 'nowrap' }}>{row.date}</td>
                            <td style={{ padding: '7px 10px', border: '1px solid #cbd5e1', fontSize: 11, whiteSpace: 'nowrap' }}>{dayStr}</td>
                            <td style={{ padding: '7px 10px', border: '1px solid #cbd5e1', fontSize: 11, whiteSpace: 'nowrap' }}>{row.timeSlot}</td>
                            <td style={{ padding: '7px 10px', border: '1px solid #cbd5e1', fontSize: 11, fontWeight: 700, fontFamily: 'monospace' }}>{row.subjectCode}</td>
                            <td style={{ padding: '7px 10px', border: '1px solid #cbd5e1', fontSize: 11 }}>{row.subjectName}</td>
                            <td style={{ padding: '7px 10px', border: '1px solid #cbd5e1', fontSize: 11, whiteSpace: 'nowrap' }}>{row.room}</td>
                            <td style={{ padding: '7px 10px', border: '1px solid #cbd5e1', fontSize: 11, whiteSpace: 'nowrap' }}>{row.duration}</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              ))
            )}

            <OfficialPrintFooter />
          </div>
        </Modal>
      )}

      {/* Publish Timetable Confirmation Dialog */}
      <ConfirmDialog
        isOpen={showPublishDialog}
        onClose={() => setShowPublishDialog(false)}
        onConfirm={handlePublishConfirm}
        title={isPublished ? "Revert Timetable to Draft" : "Publish Examination Timetable"}
        message={
          isPublished
            ? "This action will revert the active examination timetable back to Unpublished Draft status across local preview sessions. Are you ready to revert to draft?"
            : "This is a UI demonstration. Timetable publication will dynamically update all local preview session data, active schedules, and student admit cards. Are you ready to simulate publishing?"
        }
        confirmText={isPublished ? "Revert to Draft" : "Simulate Publish"}
        variant={isPublished ? "warning" : "primary"}
      />
    </div>
  );
}

export default TimetablePage;
