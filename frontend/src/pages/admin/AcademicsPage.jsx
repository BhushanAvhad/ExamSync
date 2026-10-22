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
  ClockIcon,
} from '../../components/ui/Icons';
import {
  INITIAL_CLASSES,
  INITIAL_SUBJECTS,
  INITIAL_ASSIGNMENTS,
} from '../../data/adminDemoData';
import { academicsService } from '../../services/academicsService';

export function AcademicsPage() {
  const [activeTab, setActiveTab] = useState('classes'); // 'classes' | 'subjects' | 'assignments'

  // Local state initialized with cached storage for instantaneous dynamic loading
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

  const [subjects, setSubjects] = useState(() => {
    try {
      const raw = localStorage.getItem('examsync_subjects');
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {}
    return INITIAL_SUBJECTS;
  });

  const [assignments, setAssignments] = useState(() => {
    try {
      const raw = localStorage.getItem('examsync_assignments');
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {}
    return INITIAL_ASSIGNMENTS;
  });

  const [loading, setLoading] = useState(true);

  // Load latest dynamic datasets from service
  const loadAcademics = useCallback(async () => {
    try {
      setLoading(true);
      const [classesRes, subjectsRes, assignmentsRes] = await Promise.all([
        academicsService.getClasses(),
        academicsService.getSubjects(),
        academicsService.getAssignments(),
      ]);
      if (classesRes.data) setClasses(classesRes.data);
      if (subjectsRes.data) setSubjects(subjectsRes.data);
      if (assignmentsRes.data) setAssignments(assignmentsRes.data);
    } catch (err) {
      console.error('Failed to load academics data:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadAcademics();

    const handleSync = () => {
      loadAcademics();
    };

    window.addEventListener('examsync_students_updated', handleSync);
    window.addEventListener('examsync_classes_updated', handleSync);
    window.addEventListener('examsync_subjects_updated', handleSync);
    window.addEventListener('examsync_assignments_updated', handleSync);
    window.addEventListener('storage', handleSync);

    return () => {
      window.removeEventListener('examsync_students_updated', handleSync);
      window.removeEventListener('examsync_classes_updated', handleSync);
      window.removeEventListener('examsync_subjects_updated', handleSync);
      window.removeEventListener('examsync_assignments_updated', handleSync);
      window.removeEventListener('storage', handleSync);
    };
  }, [loadAcademics]);

  // Search and filter
  const [searchQuery, setSearchQuery] = useState('');
  const [toastMessage, setToastMessage] = useState(null);

  // Modals for Class
  const [isClassModalOpen, setIsClassModalOpen] = useState(false);
  const [editingClass, setEditingClass] = useState(null);
  const [classForm, setClassForm] = useState({ id: '', name: '', division: 'A', academicYear: '2025–2026', studentCount: 60 });
  const [classErrors, setClassErrors] = useState({});
  const [deleteClassTarget, setDeleteClassTarget] = useState(null);

  // Modals for Subject
  const [isSubjectModalOpen, setIsSubjectModalOpen] = useState(false);
  const [editingSubject, setEditingSubject] = useState(null);
  const [subjectForm, setSubjectForm] = useState({ id: '', code: '', name: '', applicableClasses: 'FE (A)', duration: '3.0 Hours' });
  const [subjectErrors, setSubjectErrors] = useState({});
  const [deleteSubjectTarget, setDeleteSubjectTarget] = useState(null);

  // Filtered lists
  const filteredClasses = useMemo(() => {
    const q = searchQuery.toLowerCase();
    return classes.filter(
      (c) =>
        !q ||
        c.name.toLowerCase().includes(q) ||
        c.division.toLowerCase().includes(q) ||
        c.academicYear.toLowerCase().includes(q)
    );
  }, [classes, searchQuery]);

  const filteredSubjects = useMemo(() => {
    const q = searchQuery.toLowerCase();
    return subjects.filter(
      (s) =>
        !q ||
        s.code.toLowerCase().includes(q) ||
        s.name.toLowerCase().includes(q)
    );
  }, [subjects, searchQuery]);

  const filteredAssignments = useMemo(() => {
    const q = searchQuery.toLowerCase();
    return assignments.filter(
      (a) =>
        !q ||
        a.className.toLowerCase().includes(q) ||
        a.subjectCodes.some((code) => code.toLowerCase().includes(q))
    );
  }, [assignments, searchQuery]);

  // Handle Class Modal
  const handleOpenAddClass = () => {
    const nextId = `CLS-${(classes.length + 1).toString().padStart(2, '0')}`;
    setEditingClass(null);
    setClassForm({ id: nextId, name: '', division: 'A', academicYear: '2025–2026', studentCount: 60 });
    setClassErrors({});
    setIsClassModalOpen(true);
  };

  const handleOpenEditClass = (c) => {
    setEditingClass(c);
    setClassForm({ ...c });
    setClassErrors({});
    setIsClassModalOpen(true);
  };

  const handleClassSubmit = async (e) => {
    e.preventDefault();
    const errors = {};
    if (!classForm.name.trim()) errors.name = 'Class name is required (e.g. FE, SE CMPN, TE INFT, BE EXTC)';
    if (!classForm.studentCount || Number(classForm.studentCount) <= 0) {
      errors.studentCount = 'Student count must be a positive number';
    }
    if (Object.keys(errors).length > 0) {
      setClassErrors(errors);
      return;
    }

    try {
      if (editingClass) {
        const updated = await academicsService.updateClass(editingClass.id, classForm);
        setClasses((prev) =>
          prev.map((item) => (item.id === editingClass.id ? updated : item))
        );
        setToastMessage(`Class ${classForm.name} updated in database`);
      } else {
        const created = await academicsService.createClass(classForm);
        setClasses((prev) => [...prev, created]);
        setToastMessage(`Class ${classForm.name} created in database`);
      }
      setIsClassModalOpen(false);
    } catch (err) {
      console.error('Error saving class:', err);
      // Local fallback
      if (editingClass) {
        setClasses((prev) =>
          prev.map((item) => (item.id === editingClass.id ? { ...classForm, studentCount: Number(classForm.studentCount) } : item))
        );
      } else {
        setClasses((prev) => [...prev, { ...classForm, studentCount: Number(classForm.studentCount) }]);
      }
      setToastMessage(`Class ${classForm.name} saved locally (${err.message})`);
      setIsClassModalOpen(false);
    }
  };

  const handleConfirmDeleteClass = async () => {
    if (!deleteClassTarget) return;
    try {
      await academicsService.deleteClass(deleteClassTarget.id);
      setClasses((prev) => prev.filter((c) => c.id !== deleteClassTarget.id));
      setToastMessage(`Class ${deleteClassTarget.name} removed from database`);
    } catch (err) {
      console.error('Error deleting class:', err);
      setClasses((prev) => prev.filter((c) => c.id !== deleteClassTarget.id));
      setToastMessage(`Class ${deleteClassTarget.name} removed locally (${err.message})`);
    } finally {
      setDeleteClassTarget(null);
    }
  };

  // Handle Subject Modal
  const handleOpenAddSubject = () => {
    const nextId = `SUB-${(subjects.length + 1).toString().padStart(2, '0')}`;
    setEditingSubject(null);
    setSubjectForm({ id: nextId, code: '', name: '', applicableClasses: 'TE INFT', duration: '3.0 Hours' });
    setSubjectErrors({});
    setIsSubjectModalOpen(true);
  };

  const handleOpenEditSubject = (s) => {
    setEditingSubject(s);
    setSubjectForm({
      ...s,
      applicableClasses: Array.isArray(s.applicableClasses) ? s.applicableClasses.join(', ') : s.applicableClasses,
    });
    setSubjectErrors({});
    setIsSubjectModalOpen(true);
  };

  const handleSubjectSubmit = async (e) => {
    e.preventDefault();
    const errors = {};
    if (!subjectForm.code.trim()) errors.code = 'Subject code is required (e.g. CSC301, FEC101)';
    if (!subjectForm.name.trim()) errors.name = 'Subject title is required';
    if (Object.keys(errors).length > 0) {
      setSubjectErrors(errors);
      return;
    }

    const formattedClasses = typeof subjectForm.applicableClasses === 'string'
      ? subjectForm.applicableClasses.split(',').map((c) => c.trim()).filter(Boolean)
      : subjectForm.applicableClasses;

    const payload = {
      ...subjectForm,
      applicableClasses: formattedClasses,
    };

    try {
      if (editingSubject) {
        const updated = await academicsService.updateSubject(editingSubject.id, payload);
        setSubjects((prev) => prev.map((item) => (item.id === editingSubject.id ? updated : item)));
        setToastMessage(`Subject ${subjectForm.code} updated in database`);
      } else {
        const created = await academicsService.createSubject(payload);
        setSubjects((prev) => [...prev, created]);
        setToastMessage(`Subject ${subjectForm.code} created in database`);
      }
      setIsSubjectModalOpen(false);
    } catch (err) {
      console.error('Error saving subject:', err);
      if (editingSubject) {
        setSubjects((prev) => prev.map((item) => (item.id === editingSubject.id ? payload : item)));
      } else {
        setSubjects((prev) => [...prev, payload]);
      }
      setToastMessage(`Subject ${subjectForm.code} saved locally (${err.message})`);
      setIsSubjectModalOpen(false);
    }
  };

  const handleConfirmDeleteSubject = async () => {
    if (!deleteSubjectTarget) return;
    try {
      await academicsService.deleteSubject(deleteSubjectTarget.id);
      setSubjects((prev) => prev.filter((s) => s.id !== deleteSubjectTarget.id));
      setToastMessage(`Subject ${deleteSubjectTarget.code} removed from database`);
    } catch (err) {
      console.error('Error deleting subject:', err);
      setSubjects((prev) => prev.filter((s) => s.id !== deleteSubjectTarget.id));
      setToastMessage(`Subject ${deleteSubjectTarget.code} removed locally (${err.message})`);
    } finally {
      setDeleteSubjectTarget(null);
    }
  };

  // Columns for Classes Table
  const classColumns = [
    { key: 'name', label: 'Class / Program', render: (val) => <strong>{val}</strong> },
    { key: 'division', label: 'Division', width: '120px', render: (val) => <span className="mono-badge">Div {val}</span> },
    { key: 'academicYear', label: 'Academic Year', width: '160px' },
    {
      key: 'studentCount',
      label: 'Enrolled Examinees',
      width: '180px',
      render: (val, row) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <span>{val} Students</span>
          {row?.actualEnrolledCount > 0 && (
            <Badge variant="available">Live Enrolled</Badge>
          )}
        </div>
      ),
    },
    {
      key: 'actions',
      label: 'Actions',
      width: '100px',
      align: 'right',
      render: (_, row) => (
        <div className="table-action-btns">
          <button
            type="button"
            className="action-icon-btn"
            onClick={() => handleOpenEditClass(row)}
            title="Edit class"
            aria-label={`Edit ${row.name}`}
          >
            <EditIcon size={14} />
          </button>
          <button
            type="button"
            className="action-icon-btn danger"
            onClick={() => setDeleteClassTarget(row)}
            title="Delete class"
            aria-label={`Delete ${row.name}`}
          >
            <TrashIcon size={14} />
          </button>
        </div>
      ),
    },
  ];

  // Columns for Subjects Table
  const subjectColumns = [
    {
      key: 'code',
      label: 'Subject Code',
      width: '140px',
      render: (val) => <span className="mono-id">{val}</span>,
    },
    {
      key: 'name',
      label: 'Subject Title',
      render: (val) => <strong>{val}</strong>,
    },
    {
      key: 'applicableClasses',
      label: 'Applicable Cohorts',
      render: (val) => (
        <div className="pill-wrap-container">
          {(Array.isArray(val) ? val : [val]).map((c, i) => (
            <span key={i} className="cohort-tag">{c}</span>
          ))}
        </div>
      ),
    },
    {
      key: 'duration',
      label: 'Exam Duration',
      width: '140px',
      render: (val) => (
        <div className="duration-pill">
          <ClockIcon size={14} />
          <span>{val}</span>
        </div>
      ),
    },
    {
      key: 'actions',
      label: 'Actions',
      width: '100px',
      align: 'right',
      render: (_, row) => (
        <div className="table-action-btns">
          <button
            type="button"
            className="action-icon-btn"
            onClick={() => handleOpenEditSubject(row)}
            title="Edit subject"
            aria-label={`Edit ${row.code}`}
          >
            <EditIcon size={14} />
          </button>
          <button
            type="button"
            className="action-icon-btn danger"
            onClick={() => setDeleteSubjectTarget(row)}
            title="Delete subject"
            aria-label={`Delete ${row.code}`}
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
        title="Classes & Subjects"
        subtitle="Organize academic programs, examination subjects, and curriculum cohort assignments."
        category="Workspace"
        actions={
          <div className="header-action-group">
            {activeTab === 'classes' && (
              <Button
                variant="primary"
                size="sm"
                icon={<PlusIcon size={16} />}
                onClick={handleOpenAddClass}
              >
                Add Class
              </Button>
            )}
            {activeTab === 'subjects' && (
              <Button
                variant="primary"
                size="sm"
                icon={<PlusIcon size={16} />}
                onClick={handleOpenAddSubject}
              >
                Add Subject
              </Button>
            )}
          </div>
        }
      />

      {/* Tab Navigation */}
      <div className="admin-tabs-nav">
        <button
          type="button"
          className={`admin-tab-btn ${activeTab === 'classes' ? 'is-active' : ''}`}
          onClick={() => {
            setActiveTab('classes');
            setSearchQuery('');
          }}
        >
          <span>Classes & Divisions</span>
          <span className="tab-counter">{classes.length}</span>
        </button>

        <button
          type="button"
          className={`admin-tab-btn ${activeTab === 'subjects' ? 'is-active' : ''}`}
          onClick={() => {
            setActiveTab('subjects');
            setSearchQuery('');
          }}
        >
          <span>Subjects & Syllabi</span>
          <span className="tab-counter">{subjects.length}</span>
        </button>

        <button
          type="button"
          className={`admin-tab-btn ${activeTab === 'assignments' ? 'is-active' : ''}`}
          onClick={() => {
            setActiveTab('assignments');
            setSearchQuery('');
          }}
        >
          <span>Class–Subject Assignments</span>
          <span className="tab-counter">{assignments.length}</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <FilterBar
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        searchPlaceholder={
          activeTab === 'classes'
            ? 'Search classes, division, or academic year...'
            : activeTab === 'subjects'
            ? 'Search subject code or title...'
            : 'Search cohort assignments...'
        }
        totalResults={
          activeTab === 'classes'
            ? filteredClasses.length
            : activeTab === 'subjects'
            ? filteredSubjects.length
            : filteredAssignments.length
        }
        onClearAll={() => setSearchQuery('')}
      />

      {/* Tab 1: Classes & Divisions Table */}
      {activeTab === 'classes' && (
        <DataTable
          columns={classColumns}
          data={filteredClasses}
          idKey="id"
          pageSize={10}
          emptyTitle="No classes match your search"
          emptySubtitle="Create a new class division or clear filter query."
        />
      )}

      {/* Tab 2: Subjects Table */}
      {activeTab === 'subjects' && (
        <DataTable
          columns={subjectColumns}
          data={filteredSubjects}
          idKey="id"
          pageSize={10}
          emptyTitle="No subjects match your search"
          emptySubtitle="Add a new examination subject or clear search query."
        />
      )}

      {/* Tab 3: Class-Subject Assignments View */}
      {activeTab === 'assignments' && (
        <div className="assignments-matrix-grid">
          {filteredAssignments.map((assign) => (
            <div key={assign.classId} className="admin-card assignment-card">
              <div className="assignment-card-header">
                <div>
                  <h4 className="assignment-cohort-name">{assign.className}</h4>
                  <span className="assignment-examinee-badge">
                    {assign.totalExaminees} Examinees Enrolled
                  </span>
                </div>
                <div className="assignment-count-tag">
                  {assign.subjectCodes.length} Subjects
                </div>
              </div>

              <div className="assignment-subjects-list">
                {assign.subjectCodes.map((code) => {
                  const subObj = subjects.find((s) => s.code === code);
                  return (
                    <div key={code} className="assignment-subject-pill">
                      <span className="sub-code">{code}</span>
                      <span className="sub-name">{subObj ? subObj.name : 'Curriculum Unit'}</span>
                    </div>
                  );
                })}
              </div>

              <div className="assignment-card-footer">
                <span className="assignment-hint-text">
                  Algorithmic scheduler automatically enforces zero-clash constraint for this cohort.
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal: Add/Edit Class */}
      <Modal
        isOpen={isClassModalOpen}
        onClose={() => setIsClassModalOpen(false)}
        title={editingClass ? 'Edit Academic Class' : 'Create Academic Class'}
        subtitle="Manage program cohort division and student headcount"
        footer={
          <div className="modal-form-actions">
            <Button variant="secondary" size="sm" onClick={() => setIsClassModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" size="sm" onClick={handleClassSubmit}>
              {editingClass ? 'Save Changes' : 'Create Class'}
            </Button>
          </div>
        }
      >
        <form onSubmit={handleClassSubmit} className="admin-modal-form">
          <Input
            label="Class / Program Name"
            id="class-name"
            placeholder="e.g. FE, SE CMPN, TE INFT, BE EXTC"
            value={classForm.name}
            onChange={(e) => setClassForm({ ...classForm, name: e.target.value })}
            error={classErrors.name}
            required
          />

          <div className="form-row-2col">
            <div className="input-group">
              <label htmlFor="class-division" className="input-label">Division</label>
              <select
                id="class-division"
                className="input-field"
                value={classForm.division}
                onChange={(e) => setClassForm({ ...classForm, division: e.target.value })}
              >
                <option value="A">Division A</option>
                <option value="B">Division B</option>
                <option value="C">Division C</option>
              </select>
            </div>

            <Input
              label="Academic Year"
              id="class-ay"
              value={classForm.academicYear}
              onChange={(e) => setClassForm({ ...classForm, academicYear: e.target.value })}
              required
            />
          </div>

          <Input
            label="Student Headcount (Examinees)"
            id="class-count"
            type="number"
            min="1"
            value={classForm.studentCount}
            onChange={(e) => setClassForm({ ...classForm, studentCount: e.target.value })}
            error={classErrors.studentCount}
            required
          />
        </form>
      </Modal>

      {/* Modal: Add/Edit Subject */}
      <Modal
        isOpen={isSubjectModalOpen}
        onClose={() => setIsSubjectModalOpen(false)}
        title={editingSubject ? 'Edit Examination Subject' : 'Add New Subject'}
        subtitle="Define course unit code, exam duration, and applicable cohorts"
        footer={
          <div className="modal-form-actions">
            <Button variant="secondary" size="sm" onClick={() => setIsSubjectModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" size="sm" onClick={handleSubjectSubmit}>
              {editingSubject ? 'Save Changes' : 'Add Subject'}
            </Button>
          </div>
        }
      >
        <form onSubmit={handleSubjectSubmit} className="admin-modal-form">
          <Input
            label="Subject Code"
            id="subject-code"
            placeholder="e.g. FEC101, CSC301, CSC501, CSC701"
            value={subjectForm.code}
            onChange={(e) => setSubjectForm({ ...subjectForm, code: e.target.value })}
            error={subjectErrors.code}
            required
          />

          <Input
            label="Subject Title"
            id="subject-name"
            placeholder="e.g. Applied Mathematics - I, Theoretical Computer Science"
            value={subjectForm.name}
            onChange={(e) => setSubjectForm({ ...subjectForm, name: e.target.value })}
            error={subjectErrors.name}
            required
          />

          <div className="form-row-2col">
            <div className="input-group">
              <label htmlFor="subject-duration" className="input-label">Exam Duration</label>
              <select
                id="subject-duration"
                className="input-field"
                value={subjectForm.duration}
                onChange={(e) => setSubjectForm({ ...subjectForm, duration: e.target.value })}
              >
                <option value="2.0 Hours">2.0 Hours</option>
                <option value="2.5 Hours">2.5 Hours</option>
                <option value="3.0 Hours">3.0 Hours</option>
                <option value="3.5 Hours">3.5 Hours</option>
              </select>
            </div>

            <Input
              label="Applicable Cohorts (Comma-separated)"
              id="subject-cohorts"
              placeholder="e.g. FE, SE CMPN, TE INFT, BE EXTC"
              value={subjectForm.applicableClasses}
              onChange={(e) => setSubjectForm({ ...subjectForm, applicableClasses: e.target.value })}
            />
          </div>
        </form>
      </Modal>

      {/* Delete Dialogs */}
      <ConfirmDialog
        isOpen={Boolean(deleteClassTarget)}
        onClose={() => setDeleteClassTarget(null)}
        onConfirm={handleConfirmDeleteClass}
        title="Delete Academic Class"
        message={`Are you sure you want to delete ${deleteClassTarget?.name} (Div ${deleteClassTarget?.division})?`}
        confirmText="Delete Class"
      />

      <ConfirmDialog
        isOpen={Boolean(deleteSubjectTarget)}
        onClose={() => setDeleteSubjectTarget(null)}
        onConfirm={handleConfirmDeleteSubject}
        title="Delete Examination Subject"
        message={`Are you sure you want to delete subject ${deleteSubjectTarget?.code}: ${deleteSubjectTarget?.name}?`}
        confirmText="Delete Subject"
      />
    </div>
  );
}

export default AcademicsPage;
