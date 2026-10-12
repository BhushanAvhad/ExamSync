import { useState, useMemo } from 'react';
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
} from '../../components/ui/Icons';
import {
  INITIAL_TIMETABLE,
  INITIAL_EXAM_SESSIONS,
} from '../../data/adminDemoData';

export function TimetablePage() {
  const [timetable, setTimetable] = useState(INITIAL_TIMETABLE);
  const [selectedSessionId, setSelectedSessionId] = useState('SESS-2026-02');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedClass, setSelectedClass] = useState('all');
  const [selectedRoom, setSelectedRoom] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [viewMode, setViewMode] = useState('table'); // 'table' | 'grid'
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;

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

  // Publish confirmation modal
  const [showPublishDialog, setShowPublishDialog] = useState(false);
  const [isPublished, setIsPublished] = useState(false);

  // Preview printable modal
  const [showPreviewModal, setShowPreviewModal] = useState(false);

  // Toast feedback
  const [toastMessage, setToastMessage] = useState(null);

  // Filtered timetable entries
  const filteredEntries = useMemo(() => {
    return timetable.filter((item) => {
      const q = searchQuery.toLowerCase();
      const matchesSearch =
        !q ||
        item.subjectCode.toLowerCase().includes(q) ||
        item.subjectName.toLowerCase().includes(q) ||
        item.className.toLowerCase().includes(q) ||
        item.room.toLowerCase().includes(q);

      const matchesClass =
        selectedClass === 'all' || item.className.includes(selectedClass);

      const matchesRoom =
        selectedRoom === 'all' || item.room.includes(selectedRoom);

      const matchesStatus =
        selectedStatus === 'all' || item.status.toLowerCase() === selectedStatus.toLowerCase();

      return matchesSearch && matchesClass && matchesRoom && matchesStatus;
    });
  }, [timetable, searchQuery, selectedClass, selectedRoom, selectedStatus]);

  // Handle Edit Modal
  const handleOpenEdit = (entry) => {
    setEditingEntry(entry);
    setEditForm({ ...entry });
    setEditErrors({});
  };

  const handleEditSubmit = (e) => {
    e.preventDefault();
    const errors = {};
    if (!editForm.date) errors.date = 'Examination date is required';
    if (!editForm.timeSlot) errors.timeSlot = 'Time slot is required';
    if (!editForm.room) errors.room = 'Venue assignment is required';

    if (Object.keys(errors).length > 0) {
      setEditErrors(errors);
      return;
    }

    setTimetable((prev) =>
      prev.map((item) => (item.id === editingEntry.id ? { ...editForm } : item))
    );
    setToastMessage(`Timetable slot for ${editForm.subjectCode} updated (Session demo)`);
    setEditingEntry(null);
  };

  // Handle Publish action
  const handlePublishConfirm = () => {
    setIsPublished(true);
    setToastMessage('Timetable publication initiated (UI demonstration only)');
  };

  const columns = [
    {
      key: 'date',
      label: 'Exam Date',
      width: '130px',
      render: (val) => (
        <div className="table-date-cell">
          <CalendarDaysIcon size={14} className="date-icon" />
          <span className="mono-date">{val}</span>
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
          <span>{val}</span>
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
      key: 'className',
      label: 'Cohort & Div',
      width: '140px',
      render: (val, row) => (
        <span className="cohort-tag">{val} ({row.division})</span>
      ),
    },
    {
      key: 'room',
      label: 'Assigned Venue',
      width: '180px',
      render: (val) => (
        <div className="table-room-pill">
          <DoorIcon size={14} />
          <span>{val}</span>
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
      render: (val) => (
        <Badge variant={val === 'Optimized' ? 'optimized' : 'scheduled'}>
          {val}
        </Badge>
      ),
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
            {isPublished ? 'Published to Students (Demo)' : 'Draft v1.4 (Unpublished)'}
          </span>
        }
        actions={
          <div className="header-action-group">
            <Button
              variant="secondary"
              size="sm"
              icon={<PrinterIcon size={15} />}
              onClick={() => setShowPreviewModal(true)}
            >
              Print / Preview
            </Button>
            <Button
              variant="primary"
              size="sm"
              icon={<CheckCircleIcon size={15} />}
              onClick={() => setShowPublishDialog(true)}
            >
              Publish Timetable
            </Button>
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
            {INITIAL_EXAM_SESSIONS.map((s) => (
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
        searchPlaceholder="Filter by subject code, name, cohort, or room..."
        totalResults={filteredEntries.length}
        onClearAll={() => {
          setSearchQuery('');
          setSelectedClass('all');
          setSelectedRoom('all');
          setSelectedStatus('all');
          setCurrentPage(1);
        }}
        filters={[
          {
            id: 'class-filter',
            value: selectedClass,
            onChange: (val) => {
              setSelectedClass(val);
              setCurrentPage(1);
            },
            ariaLabel: 'Filter by Cohort',
            options: [
              { label: 'All Cohorts', value: 'all' },
              { label: 'CS-Year 1', value: 'CS-Year 1' },
              { label: 'CS-Year 2', value: 'CS-Year 2' },
              { label: 'CS-Year 3', value: 'CS-Year 3' },
              { label: 'SE-Year 2', value: 'SE-Year 2' },
              { label: 'DS-Year 3', value: 'DS-Year 3' },
              { label: 'EE-Year 2', value: 'EE-Year 2' },
            ],
          },
          {
            id: 'room-filter',
            value: selectedRoom,
            onChange: (val) => {
              setSelectedRoom(val);
              setCurrentPage(1);
            },
            ariaLabel: 'Filter by Room',
            options: [
              { label: 'All Venues', value: 'all' },
              { label: 'Turing Auditorium', value: 'Turing Auditorium' },
              { label: 'Hall 101', value: 'Hall 101' },
              { label: 'Hall 201', value: 'Hall 201' },
              { label: 'Lab 204', value: 'Lab 204' },
              { label: 'Annex 210', value: 'Annex 210' },
            ],
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
                        <div className="slot-exam-cohort">{e.className} ({e.division})</div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

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
                  <option value="Turing Auditorium">Turing Auditorium (200 Cap)</option>
                  <option value="Hall 101">Hall 101 (120 Cap)</option>
                  <option value="Hall 201">Hall 201 (90 Cap)</option>
                  <option value="Lab 204">Lab 204 (45 Cap)</option>
                  <option value="Annex 210">Annex 210 (75 Cap)</option>
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
              <span className="inspect-label">Assigned Cohort</span>
              <p className="inspect-text">{viewEntry.className} — Division {viewEntry.division}</p>
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
          subtitle="Official institutional examination draft format"
          maxWidth={750}
          footer={
            <div className="modal-form-actions">
              <Button variant="secondary" size="sm" onClick={() => setShowPreviewModal(false)}>
                Close Preview
              </Button>
              <Button
                variant="primary"
                size="sm"
                icon={<PrinterIcon size={14} />}
                onClick={() => window.print()}
              >
                Print / Save PDF
              </Button>
            </div>
          }
        >
          <div className="printable-preview-area">
            <div className="printable-header">
              <h2>ExamSync Institutional Examination Schedule</h2>
              <p>Spring 2026 Final Examinations • Master Schedule Draft v1.4</p>
            </div>

            <table className="printable-table">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Time Slot</th>
                  <th>Subject</th>
                  <th>Class</th>
                  <th>Venue</th>
                </tr>
              </thead>
              <tbody>
                {filteredEntries.map((row) => (
                  <tr key={row.id}>
                    <td>{row.date}</td>
                    <td>{row.timeSlot}</td>
                    <td><strong>{row.subjectCode}</strong>: {row.subjectName}</td>
                    <td>{row.className} ({row.division})</td>
                    <td>{row.room}</td>
                  </tr>
                ))}
              </tbody>
            </table>

            <div className="printable-footer">
              Generated by ExamSync Administrative Console. Institutional governance copy only.
            </div>
          </div>
        </Modal>
      )}

      {/* Publish Timetable Confirmation Dialog */}
      <ConfirmDialog
        isOpen={showPublishDialog}
        onClose={() => setShowPublishDialog(false)}
        onConfirm={handlePublishConfirm}
        title="Publish Examination Timetable"
        message="This is a UI demonstration. Timetable publication to student accounts and database will be connected in Phase 3. Are you ready to simulate publishing?"
        confirmText="Simulate Publish"
        variant="primary"
      />
    </div>
  );
}

export default TimetablePage;
