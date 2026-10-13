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
  PlusIcon,
  EditIcon,
  TrashIcon,
  CalendarDaysIcon,
  ClockIcon,
  InfoIcon,
} from '../../components/ui/Icons';
import { INITIAL_EXAM_SESSIONS } from '../../data/adminDemoData';
import { sessionsService } from '../../services/sessionsService';

export function ExamSessionsPage() {
  const [sessions, setSessions] = useState(INITIAL_EXAM_SESSIONS);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState('cards'); // 'cards' | 'table'
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('all');

  const loadSessions = useCallback(async () => {
    try {
      setLoading(true);
      const { data } = await sessionsService.getExamSessions();
      if (data) setSessions(data);
    } catch (err) {
      console.error('Failed to load exam sessions:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadSessions();
  }, [loadSessions]);

  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSession, setEditingSession] = useState(null);
  const [sessionForm, setSessionForm] = useState({
    id: '',
    name: '',
    term: 'Spring 2026',
    startDate: '2026-05-15',
    endDate: '2026-05-30',
    applicableClasses: 'All Departments',
    status: 'Draft',
    timeSlots: 'Morning (09:00 — 12:00), Afternoon (14:00 — 17:00)',
    description: '',
  });
  const [formErrors, setFormErrors] = useState({});

  // View details modal
  const [inspectSession, setInspectSession] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [toastMessage, setToastMessage] = useState(null);

  const filteredSessions = useMemo(() => {
    return sessions.filter((s) => {
      const q = searchQuery.toLowerCase();
      const matchesSearch =
        !q ||
        s.name.toLowerCase().includes(q) ||
        s.term.toLowerCase().includes(q);

      const matchesStatus =
        selectedStatus === 'all' || s.status.toLowerCase() === selectedStatus.toLowerCase();

      return matchesSearch && matchesStatus;
    });
  }, [sessions, searchQuery, selectedStatus]);

  const handleOpenAdd = () => {
    const nextId = `SESS-2026-${(sessions.length + 1).toString().padStart(2, '0')}`;
    setEditingSession(null);
    setSessionForm({
      id: nextId,
      name: '',
      term: 'Even Semester 2025–2026',
      startDate: '2026-05-18',
      endDate: '2026-05-30',
      applicableClasses: 'FE, SE CMPN, TE INFT, BE EXTC',
      status: 'Draft',
      timeSlots: 'Morning (09:00 — 12:00), Afternoon (14:00 — 17:00)',
      description: 'Institutional examination period for the scheduled academic cycle.',
    });
    setFormErrors({});
    setIsModalOpen(true);
  };

  const handleOpenEdit = (s) => {
    setEditingSession(s);
    setSessionForm({
      id: s.id,
      name: s.name,
      term: s.term,
      startDate: s.startDate,
      endDate: s.endDate,
      applicableClasses: Array.isArray(s.applicableClasses) ? s.applicableClasses.join(', ') : s.applicableClasses,
      status: s.status,
      timeSlots: Array.isArray(s.timeSlots) ? s.timeSlots.join(', ') : s.timeSlots,
      description: s.description || '',
    });
    setFormErrors({});
    setIsModalOpen(true);
  };

  const validate = () => {
    const errors = {};
    if (!sessionForm.name.trim()) errors.name = 'Session title is required';
    if (!sessionForm.startDate) errors.startDate = 'Start date is required';
    if (!sessionForm.endDate) errors.endDate = 'End date is required';
    if (new Date(sessionForm.startDate) > new Date(sessionForm.endDate)) {
      errors.endDate = 'End date cannot be prior to start date';
    }
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    const payload = {
      ...sessionForm,
      applicableClasses: typeof sessionForm.applicableClasses === 'string'
        ? sessionForm.applicableClasses.split(',').map((c) => c.trim()).filter(Boolean)
        : sessionForm.applicableClasses,
      timeSlots: typeof sessionForm.timeSlots === 'string'
        ? sessionForm.timeSlots.split(',').map((t) => t.trim()).filter(Boolean)
        : sessionForm.timeSlots,
    };

    try {
      if (editingSession) {
        const updated = await sessionsService.updateExamSession(editingSession.id, payload);
        setSessions((prev) => prev.map((s) => (s.id === editingSession.id ? updated : s)));
        setToastMessage(`Exam Session ${payload.name} updated in database`);
      } else {
        const created = await sessionsService.createExamSession(payload);
        setSessions((prev) => [created, ...prev]);
        setToastMessage(`Exam Session ${payload.name} created in database`);
      }
      setIsModalOpen(false);
    } catch (err) {
      console.error('Error saving exam session:', err);
      if (editingSession) {
        setSessions((prev) => prev.map((s) => (s.id === editingSession.id ? payload : s)));
      } else {
        setSessions((prev) => [payload, ...prev]);
      }
      setToastMessage(`Exam Session ${payload.name} saved locally (${err.message})`);
      setIsModalOpen(false);
    }
  };

  const handleConfirmDelete = async () => {
    if (!deleteTarget) return;
    try {
      await sessionsService.deleteExamSession(deleteTarget.id);
      setSessions((prev) => prev.filter((s) => s.id !== deleteTarget.id));
      setToastMessage(`Exam Session ${deleteTarget.name} removed from database`);
    } catch (err) {
      console.error('Error deleting exam session:', err);
      setSessions((prev) => prev.filter((s) => s.id !== deleteTarget.id));
      setToastMessage(`Exam Session ${deleteTarget.name} removed locally (${err.message})`);
    } finally {
      setDeleteTarget(null);
    }
  };

  const columns = [
    {
      key: 'name',
      label: 'Session Name',
      render: (val, row) => (
        <div>
          <strong className="session-table-name">{val}</strong>
          <div className="session-table-term">{row.term}</div>
        </div>
      ),
    },
    {
      key: 'dates',
      label: 'Examination Window',
      render: (_, row) => (
        <span className="mono-date-range">
          {row.startDate} — {row.endDate}
        </span>
      ),
    },
    {
      key: 'applicableClasses',
      label: 'Cohorts Covered',
      render: (val) => (
        <div className="pill-wrap-container">
          {(Array.isArray(val) ? val : [val]).map((c, i) => (
            <span key={i} className="cohort-tag">{c}</span>
          ))}
        </div>
      ),
    },
    {
      key: 'status',
      label: 'Session Status',
      width: '130px',
      render: (val) => (
        <Badge
          variant={
            val === 'Completed'
              ? 'available'
              : val === 'Scheduled'
              ? 'scheduled'
              : 'pending'
          }
        >
          {val}
        </Badge>
      ),
    },
    {
      key: 'actions',
      label: 'Actions',
      width: '140px',
      align: 'right',
      render: (_, row) => (
        <div className="table-action-btns">
          <button
            type="button"
            className="action-icon-btn"
            onClick={() => setInspectSession(row)}
            title="Inspect time slots"
            aria-label="Inspect time slots"
          >
            <ClockIcon size={14} />
          </button>
          <button
            type="button"
            className="action-icon-btn"
            onClick={() => handleOpenEdit(row)}
            title="Edit session"
            aria-label="Edit session"
          >
            <EditIcon size={14} />
          </button>
          <button
            type="button"
            className="action-icon-btn danger"
            onClick={() => setDeleteTarget(row)}
            title="Delete session"
            aria-label="Delete session"
          >
            <TrashIcon size={14} />
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="admin-page-content">
      <Toast message={toastMessage} onClose={() => setToastMessage(null)} />

      <PageHeader
        title="Examination Sessions"
        subtitle="Schedule institutional academic assessment periods, date windows, and permitted examination time slots."
        category="Workspace"
        actions={
          <div className="header-action-group">
            <div className="view-toggle-group">
              <button
                type="button"
                className={`view-toggle-btn ${viewMode === 'cards' ? 'is-active' : ''}`}
                onClick={() => setViewMode('cards')}
              >
                Cards View
              </button>
              <button
                type="button"
                className={`view-toggle-btn ${viewMode === 'table' ? 'is-active' : ''}`}
                onClick={() => setViewMode('table')}
              >
                Table View
              </button>
            </div>

            <Button
              variant="primary"
              size="sm"
              icon={<PlusIcon size={16} />}
              onClick={handleOpenAdd}
            >
              Create Session
            </Button>
          </div>
        }
      />

      {/* Demo Notice */}
      <div className="admin-banner info-banner" style={{ marginBottom: 20 }}>
        <InfoIcon size={18} className="banner-icon" />
        <div className="banner-content">
          <strong>Demonstration Examination Sessions</strong> — Configured sessions establish the scheduling window and time slots used as inputs for the timetable generation engine in Phase 3.
        </div>
      </div>

      {/* Filter and Search Bar */}
      <FilterBar
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        searchPlaceholder="Search exam sessions by name or academic term..."
        totalResults={filteredSessions.length}
        onClearAll={() => {
          setSearchQuery('');
          setSelectedStatus('all');
        }}
        filters={[
          {
            id: 'session-status-filter',
            value: selectedStatus,
            onChange: setSelectedStatus,
            ariaLabel: 'Filter by Session Status',
            options: [
              { label: 'All Statuses', value: 'all' },
              { label: 'Draft', value: 'draft' },
              { label: 'Scheduled', value: 'scheduled' },
              { label: 'Completed', value: 'completed' },
            ],
          },
        ]}
      />

      {/* Cards View */}
      {viewMode === 'cards' && (
        <div className="session-cards-grid">
          {filteredSessions.map((s) => (
            <div key={s.id} className="admin-card session-card">
              <div className="session-card-top">
                <div>
                  <span className="session-term-badge">{s.term}</span>
                  <h3 className="session-card-heading">{s.name}</h3>
                </div>
                <Badge
                  variant={
                    s.status === 'Completed'
                      ? 'available'
                      : s.status === 'Scheduled'
                      ? 'scheduled'
                      : 'pending'
                  }
                >
                  {s.status}
                </Badge>
              </div>

              <div className="session-meta-strip">
                <div className="session-meta-item">
                  <CalendarDaysIcon size={15} />
                  <span>{s.startDate} — {s.endDate}</span>
                </div>
                <div className="session-meta-item">
                  <ClockIcon size={15} />
                  <span>{(s.timeSlots || []).length} Configured Slots</span>
                </div>
              </div>

              <p className="session-card-description">{s.description}</p>

              <div className="session-cohorts-section">
                <span className="section-label">Cohorts Included:</span>
                <div className="pill-wrap-container">
                  {(Array.isArray(s.applicableClasses) ? s.applicableClasses : [s.applicableClasses]).map((c, i) => (
                    <span key={i} className="cohort-tag">{c}</span>
                  ))}
                </div>
              </div>

              <div className="session-card-footer">
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => setInspectSession(s)}
                >
                  View Time Slots
                </Button>
                <div className="footer-action-icons">
                  <button
                    type="button"
                    className="action-icon-btn"
                    onClick={() => handleOpenEdit(s)}
                    title="Edit session"
                    aria-label="Edit session"
                  >
                    <EditIcon size={14} />
                  </button>
                  <button
                    type="button"
                    className="action-icon-btn danger"
                    onClick={() => setDeleteTarget(s)}
                    title="Delete session"
                    aria-label="Delete session"
                  >
                    <TrashIcon size={14} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Table View */}
      {viewMode === 'table' && (
        <DataTable
          columns={columns}
          data={filteredSessions}
          idKey="id"
          pageSize={10}
          emptyTitle="No exam sessions found"
          emptySubtitle="Create a new exam session or clear search filters."
        />
      )}

      {/* Modal: Add/Edit Session */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingSession ? 'Edit Examination Session' : 'Create Examination Session'}
        subtitle="Establish academic assessment window, applicable cohorts, and permitted time slots"
        footer={
          <div className="modal-form-actions">
            <Button variant="secondary" size="sm" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" size="sm" onClick={handleSubmit}>
              {editingSession ? 'Save Changes' : 'Create Session'}
            </Button>
          </div>
        }
      >
        <form onSubmit={handleSubmit} className="admin-modal-form">
          <Input
            label="Session Name"
            id="session-name"
            placeholder="e.g. Spring 2026 Final Examinations"
            value={sessionForm.name}
            onChange={(e) => setSessionForm({ ...sessionForm, name: e.target.value })}
            error={formErrors.name}
            required
          />

          <div className="form-row-2col">
            <Input
              label="Academic Term / Year"
              id="session-term"
              value={sessionForm.term}
              onChange={(e) => setSessionForm({ ...sessionForm, term: e.target.value })}
              required
            />

            <div className="input-group">
              <label htmlFor="session-status" className="input-label">Status</label>
              <select
                id="session-status"
                className="input-field"
                value={sessionForm.status}
                onChange={(e) => setSessionForm({ ...sessionForm, status: e.target.value })}
              >
                <option value="Draft">Draft (Planning Phase)</option>
                <option value="Scheduled">Scheduled (Active Timetable)</option>
                <option value="Completed">Completed (Archived)</option>
              </select>
            </div>
          </div>

          <div className="form-row-2col">
            <Input
              label="Session Start Date"
              id="session-start"
              type="date"
              value={sessionForm.startDate}
              onChange={(e) => setSessionForm({ ...sessionForm, startDate: e.target.value })}
              error={formErrors.startDate}
              required
            />

            <Input
              label="Session End Date"
              id="session-end"
              type="date"
              value={sessionForm.endDate}
              onChange={(e) => setSessionForm({ ...sessionForm, endDate: e.target.value })}
              error={formErrors.endDate}
              required
            />
          </div>

          <Input
            label="Applicable Cohorts (Comma-separated)"
            id="session-classes"
            value={sessionForm.applicableClasses}
            onChange={(e) => setSessionForm({ ...sessionForm, applicableClasses: e.target.value })}
            helper="e.g. FE, SE CMPN, TE INFT, BE EXTC, or All Departments"
          />

          <Input
            label="Daily Exam Time Slots (Comma-separated)"
            id="session-slots"
            value={sessionForm.timeSlots}
            onChange={(e) => setSessionForm({ ...sessionForm, timeSlots: e.target.value })}
            helper="e.g. Morning (09:00 — 12:00), Afternoon (14:00 — 17:00)"
          />

          <div className="input-group">
            <label htmlFor="session-desc" className="input-label">Session Notes</label>
            <textarea
              id="session-desc"
              className="input-field"
              rows="2"
              value={sessionForm.description}
              onChange={(e) => setSessionForm({ ...sessionForm, description: e.target.value })}
              placeholder="Optional notes or institutional instructions..."
            />
          </div>
        </form>
      </Modal>

      {/* Inspect Session Details Modal */}
      {inspectSession && (
        <Modal
          isOpen={Boolean(inspectSession)}
          onClose={() => setInspectSession(null)}
          title={`Session Details: ${inspectSession.name}`}
          subtitle={`${inspectSession.term} (${inspectSession.startDate} to ${inspectSession.endDate})`}
          footer={
            <Button variant="secondary" size="sm" onClick={() => setInspectSession(null)}>
              Close
            </Button>
          }
        >
          <div className="inspect-session-body">
            <div className="inspect-item">
              <span className="inspect-label">Configured Daily Slots</span>
              <div className="inspect-slot-list">
                {(inspectSession.timeSlots || []).map((slot, i) => (
                  <div key={i} className="inspect-slot-pill">
                    <ClockIcon size={14} />
                    <span>{slot}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="inspect-item">
              <span className="inspect-label">Applicable Academic Classes</span>
              <div className="pill-wrap-container">
                {(Array.isArray(inspectSession.applicableClasses) ? inspectSession.applicableClasses : [inspectSession.applicableClasses]).map((c, i) => (
                  <span key={i} className="cohort-tag">{c}</span>
                ))}
              </div>
            </div>

            <div className="inspect-item">
              <span className="inspect-label">Planning Notes</span>
              <p className="inspect-text">{inspectSession.description || 'No additional notes provided.'}</p>
            </div>
          </div>
        </Modal>
      )}

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={Boolean(deleteTarget)}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleConfirmDelete}
        title="Delete Examination Session"
        message={`Are you sure you want to delete session "${deleteTarget?.name}"? Any linked drafts will be invalidated.`}
        confirmText="Delete Session"
      />
    </div>
  );
}

export default ExamSessionsPage;
