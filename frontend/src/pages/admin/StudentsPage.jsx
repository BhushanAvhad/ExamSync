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
import { PlusIcon, EditIcon, TrashIcon } from '../../components/ui/Icons';
import { INITIAL_STUDENTS } from '../../data/adminDemoData';

export function StudentsPage() {
  const [students, setStudents] = useState(INITIAL_STUDENTS);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedClass, setSelectedClass] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 8;

  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingStudent, setEditingStudent] = useState(null);
  const [formData, setFormData] = useState({
    id: '',
    name: '',
    email: '',
    className: 'CS-Year 1',
    division: 'A',
    status: 'Active',
  });
  const [formErrors, setFormErrors] = useState({});

  // Confirm delete dialog
  const [deleteTarget, setDeleteTarget] = useState(null);

  // Toast feedback
  const [toastMessage, setToastMessage] = useState(null);

  // Filter students
  const filteredStudents = useMemo(() => {
    return students.filter((s) => {
      const q = searchQuery.toLowerCase();
      const matchesSearch =
        !q ||
        s.name.toLowerCase().includes(q) ||
        s.id.toLowerCase().includes(q) ||
        s.email.toLowerCase().includes(q);

      const matchesClass =
        selectedClass === 'all' || s.className === selectedClass;

      const matchesStatus =
        selectedStatus === 'all' || s.status.toLowerCase() === selectedStatus.toLowerCase();

      return matchesSearch && matchesClass && matchesStatus;
    });
  }, [students, searchQuery, selectedClass, selectedStatus]);

  // Open add modal
  const handleOpenAdd = () => {
    const nextNum = students.length + 1;
    const padded = nextNum.toString().padStart(3, '0');
    setEditingStudent(null);
    setFormData({
      id: `STU-2026-${padded}`,
      name: '',
      email: '',
      className: 'CS-Year 1',
      division: 'A',
      status: 'Active',
    });
    setFormErrors({});
    setIsModalOpen(true);
  };

  // Open edit modal
  const handleOpenEdit = (student) => {
    setEditingStudent(student);
    setFormData({
      id: student.id,
      name: student.name,
      email: student.email,
      className: student.className,
      division: student.division,
      status: student.status,
    });
    setFormErrors({});
    setIsModalOpen(true);
  };

  // Validate form
  const validate = () => {
    const errors = {};
    if (!formData.name.trim()) errors.name = 'Full name is required';
    if (!formData.email.trim()) {
      errors.email = 'Email address is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      errors.email = 'Please enter a valid academic email address';
    }
    if (!formData.className) errors.className = 'Please select a class';
    if (!formData.division) errors.division = 'Please select a division';
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Handle form submission
  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate()) return;

    if (editingStudent) {
      setStudents((prev) =>
        prev.map((s) => (s.id === editingStudent.id ? { ...formData } : s))
      );
      setToastMessage(`Student ${formData.name} updated successfully (Session demo)`);
    } else {
      setStudents((prev) => [formData, ...prev]);
      setToastMessage(`Student ${formData.name} added to roster (Session demo)`);
    }

    setIsModalOpen(false);
  };

  // Confirm delete
  const handleConfirmDelete = () => {
    if (!deleteTarget) return;
    setStudents((prev) => prev.filter((s) => s.id !== deleteTarget.id));
    setToastMessage(`Student record for ${deleteTarget.name} removed (Session demo)`);
    setDeleteTarget(null);
  };

  const columns = [
    {
      key: 'id',
      label: 'Student ID',
      width: '140px',
      render: (val) => <span className="mono-id">{val}</span>,
    },
    {
      key: 'name',
      label: 'Student Name',
      render: (val, row) => (
        <div className="table-user-cell">
          <div className="user-avatar-mini">{val.charAt(0)}</div>
          <div className="user-name-box">
            <span className="user-full-name">{val}</span>
            <span className="user-sub-email">{row.email}</span>
          </div>
        </div>
      ),
    },
    {
      key: 'className',
      label: 'Cohort & Division',
      render: (val, row) => (
        <span className="table-cell-cohort">
          {val} — Div {row.division}
        </span>
      ),
    },
    {
      key: 'status',
      label: 'Status',
      width: '120px',
      render: (val) => (
        <Badge variant={val === 'Active' ? 'available' : 'unavailable'}>
          {val}
        </Badge>
      ),
    },
    {
      key: 'actions',
      label: 'Actions',
      width: '110px',
      align: 'right',
      render: (_, row) => (
        <div className="table-action-btns">
          <button
            type="button"
            className="action-icon-btn"
            onClick={(e) => {
              e.stopPropagation();
              handleOpenEdit(row);
            }}
            aria-label={`Edit ${row.name}`}
            title="Edit student"
          >
            <EditIcon size={14} />
          </button>
          <button
            type="button"
            className="action-icon-btn danger"
            onClick={(e) => {
              e.stopPropagation();
              setDeleteTarget(row);
            }}
            aria-label={`Delete ${row.name}`}
            title="Delete student"
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
        title="Student Management"
        subtitle="Maintain enrolled student rosters, cohort groupings, and eligibility for examination cycles."
        category="Workspace"
        actions={
          <Button
            variant="primary"
            size="sm"
            icon={<PlusIcon size={16} />}
            onClick={handleOpenAdd}
          >
            Add Student
          </Button>
        }
      />

      {/* Filter and Search Bar */}
      <FilterBar
        searchQuery={searchQuery}
        onSearchChange={(q) => {
          setSearchQuery(q);
          setCurrentPage(1);
        }}
        searchPlaceholder="Search student by name, ID, or email..."
        totalResults={filteredStudents.length}
        onClearAll={() => {
          setSearchQuery('');
          setSelectedClass('all');
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
            ariaLabel: 'Filter by Academic Class',
            options: [
              { label: 'All Classes', value: 'all' },
              { label: 'CS-Year 1', value: 'CS-Year 1' },
              { label: 'CS-Year 2', value: 'CS-Year 2' },
              { label: 'CS-Year 3', value: 'CS-Year 3' },
              { label: 'SE-Year 2', value: 'SE-Year 2' },
              { label: 'DS-Year 3', value: 'DS-Year 3' },
              { label: 'EE-Year 2', value: 'EE-Year 2' },
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
              { label: 'All Statuses', value: 'all' },
              { label: 'Active', value: 'active' },
              { label: 'Inactive', value: 'inactive' },
            ],
          },
        ]}
      />

      {/* Students Data Table */}
      <DataTable
        columns={columns}
        data={filteredStudents}
        idKey="id"
        currentPage={currentPage}
        pageSize={pageSize}
        onPageChange={setCurrentPage}
        totalItems={filteredStudents.length}
        emptyTitle="No students found"
        emptySubtitle="Try refining your search keyword or cohort filter."
      />

      {/* Add / Edit Student Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingStudent ? 'Edit Student Record' : 'Register New Student'}
        subtitle="Client-side validation active. Changes apply to the current UI session."
        footer={
          <div className="modal-form-actions">
            <Button
              variant="secondary"
              size="sm"
              onClick={() => setIsModalOpen(false)}
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              size="sm"
              onClick={handleSubmit}
            >
              {editingStudent ? 'Save Changes' : 'Create Student'}
            </Button>
          </div>
        }
      >
        <form onSubmit={handleSubmit} className="admin-modal-form">
          <Input
            label="Student ID"
            id="student-id"
            value={formData.id}
            readOnly
            helper="Institutional student identifier (System assigned)"
          />

          <Input
            label="Full Name"
            id="student-name"
            placeholder="e.g. Jane Doe"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            error={formErrors.name}
            required
          />

          <Input
            label="Academic Email"
            id="student-email"
            type="email"
            placeholder="e.g. j.doe@university.edu"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            error={formErrors.email}
            required
          />

          <div className="form-row-2col">
            <div className="input-group">
              <label htmlFor="student-class" className="input-label">Academic Class</label>
              <select
                id="student-class"
                className="input-field"
                value={formData.className}
                onChange={(e) => setFormData({ ...formData, className: e.target.value })}
              >
                <option value="CS-Year 1">CS-Year 1</option>
                <option value="CS-Year 2">CS-Year 2</option>
                <option value="CS-Year 3">CS-Year 3</option>
                <option value="SE-Year 2">SE-Year 2</option>
                <option value="DS-Year 3">DS-Year 3</option>
                <option value="EE-Year 2">EE-Year 2</option>
              </select>
            </div>

            <div className="input-group">
              <label htmlFor="student-div" className="input-label">Division</label>
              <select
                id="student-div"
                className="input-field"
                value={formData.division}
                onChange={(e) => setFormData({ ...formData, division: e.target.value })}
              >
                <option value="A">Division A</option>
                <option value="B">Division B</option>
                <option value="C">Division C</option>
              </select>
            </div>
          </div>

          <div className="input-group">
            <label htmlFor="student-status" className="input-label">Enrollment Status</label>
            <select
              id="student-status"
              className="input-field"
              value={formData.status}
              onChange={(e) => setFormData({ ...formData, status: e.target.value })}
            >
              <option value="Active">Active (Eligible for Exams)</option>
              <option value="Inactive">Inactive (Suspended / On Leave)</option>
            </select>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={Boolean(deleteTarget)}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleConfirmDelete}
        title="Delete Student Record"
        message={`Are you sure you want to remove ${deleteTarget?.name} (${deleteTarget?.id}) from the academic database?`}
        confirmText="Delete Record"
        variant="danger"
      />
    </div>
  );
}

export default StudentsPage;
