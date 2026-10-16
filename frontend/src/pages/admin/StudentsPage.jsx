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
import { PlusIcon, EditIcon, TrashIcon, UploadIcon, DownloadIcon } from '../../components/ui/Icons';
import { studentsService, generateShortRollNo } from '../../services/studentsService';
import { exportToCSV } from '../../utils/exportUtils';

export function StudentsPage() {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedClass, setSelectedClass] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 8;

  const loadStudents = useCallback(async () => {
    try {
      setLoading(true);
      const { data } = await studentsService.getStudents();
      if (data) setStudents(data);
    } catch (err) {
      console.error('Failed to load students:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadStudents();
  }, [loadStudents]);

  // Reactive listener for roster updates dispatched from any service or tab
  useEffect(() => {
    const handleRosterUpdate = (e) => {
      if (e.detail?.roster) {
        setStudents(e.detail.roster);
      } else {
        loadStudents();
      }
    };
    window.addEventListener('examsync_students_updated', handleRosterUpdate);
    return () => window.removeEventListener('examsync_students_updated', handleRosterUpdate);
  }, [loadStudents]);

  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingStudent, setEditingStudent] = useState(null);
  const [formData, setFormData] = useState({
    id: '',
    name: '',
    email: '',
    className: 'FE',
    division: 'A',
    status: 'Active',
    phone: '',
  });
  const [formErrors, setFormErrors] = useState({});

  // Dynamic class options reflecting VIT academic structure
  const standardVITClasses = useMemo(() => [
    'FE',
    'SE CMPN', 'SE INFT', 'SE EXTC', 'SE ECS', 'SE BIOM',
    'TE CMPN', 'TE INFT', 'TE EXTC', 'TE ECS', 'TE BIOM',
    'BE CMPN', 'BE INFT', 'BE EXTC', 'BE ECS', 'BE BIOM'
  ], []);

  const classOptionsList = useMemo(() => {
    const set = new Set([...standardVITClasses, ...students.map((s) => s.className).filter(Boolean)]);
    return Array.from(set);
  }, [standardVITClasses, students]);

  // Confirm delete dialog
  const [deleteTarget, setDeleteTarget] = useState(null);

  // Toast feedback
  const [toastMessage, setToastMessage] = useState(null);

  // Filter students
  const filteredStudents = useMemo(() => {
    return students.filter((s) => {
      const q = searchQuery.toLowerCase().trim();
      const roll = (s.rollNo || s.id || '').toLowerCase();
      const matchesSearch =
        !q ||
        s.name.toLowerCase().includes(q) ||
        roll.includes(q) ||
        (s.email && s.email.toLowerCase().includes(q));

      const matchesClass =
        selectedClass === 'all' || s.className === selectedClass;

      const matchesStatus =
        selectedStatus === 'all' || s.status.toLowerCase() === selectedStatus.toLowerCase();

      return matchesSearch && matchesClass && matchesStatus;
    });
  }, [students, searchQuery, selectedClass, selectedStatus]);

  // Open add modal
  const handleOpenAdd = () => {
    const defaultClass = 'FE';
    const autoRoll = generateShortRollNo(defaultClass, students);
    setEditingStudent(null);
    setFormData({
      id: autoRoll,
      rollNo: autoRoll,
      name: '',
      email: '',
      className: defaultClass,
      division: 'A',
      status: 'Active',
      phone: '',
    });
    setFormErrors({});
    setIsModalOpen(true);
  };

  // Open edit modal
  const handleOpenEdit = (student) => {
    setEditingStudent(student);
    const roll = student.rollNo || student.id;
    setFormData({
      id: roll,
      rollNo: roll,
      name: student.name,
      email: student.email,
      className: student.className,
      division: student.division,
      status: student.status,
      phone: student.phone || '',
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

  // Handle form submission with real persistent write
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    try {
      if (editingStudent) {
        await studentsService.updateStudent(editingStudent.id, formData);
        setToastMessage(`Student ${formData.name} updated successfully`);
      } else {
        await studentsService.addStudent(formData);
        setToastMessage(`Student ${formData.name} added to roster`);
      }
      const { data } = await studentsService.getStudents();
      if (data) setStudents(data);
      setIsModalOpen(false);
    } catch (err) {
      console.error('Error saving student:', err);
      setToastMessage(`Error: ${err.message}`);
    }
  };

  // Confirm delete with real persistence
  const handleConfirmDelete = async () => {
    if (!deleteTarget) return;
    try {
      await studentsService.deleteStudent(deleteTarget.id);
      const { data } = await studentsService.getStudents();
      if (data) setStudents(data);
      setToastMessage(`Student record for ${deleteTarget.name} removed`);
    } catch (err) {
      console.error('Delete error:', err);
      setToastMessage(`Failed to delete student: ${err.message}`);
    } finally {
      setDeleteTarget(null);
    }
  };

  // Bulk CSV Import handlers
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [importRows, setImportRows] = useState([]);
  const [importFileName, setImportFileName] = useState('');
  const [importing, setImporting] = useState(false);
  const [importError, setImportError] = useState(null);

  const handleDownloadTemplate = () => {
    const cols = [
      { label: 'Full Name', key: 'name' },
      { label: 'Email', key: 'email' },
      { label: 'Cohort Class', key: 'className' },
      { label: 'Division', key: 'division' },
      { label: 'Phone', key: 'phone' },
    ];
    const sampleRows = [
      { name: 'Aarav Sharma', email: 'aarav.sharma@vit.edu.in', className: 'TE CMPN', division: 'A', phone: '+91 98201 23456' },
      { name: 'Rhea Kulkarni', email: 'rhea.kulkarni@vit.edu.in', className: 'TE CMPN', division: 'A', phone: '+91 98201 23457' },
      { name: 'Siddharth Deshmukh', email: 'siddharth.d@vit.edu.in', className: 'SE CMPN', division: 'B', phone: '+91 98201 23458' },
      { name: 'Ananya Iyer', email: 'ananya.iyer@vit.edu.in', className: 'FE', division: 'A', phone: '+91 98201 23459' },
    ];
    exportToCSV('ExamSync_VIT_Student_Import_Template', cols, sampleRows);
    setToastMessage('Downloaded VIT student CSV roster template.');
  };

  // Smart parser for student CSV files (flexible headers and delimiters)
  const handleFileSelect = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setImportFileName(file.name);
    setImportError(null);

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const text = event.target?.result;
        if (typeof text !== 'string') return;

        const lines = text.split(/\r?\n/).map((l) => l.trim()).filter(Boolean);
        if (lines.length <= 1) {
          setImportError('The selected file contains no student data rows.');
          return;
        }

        // Determine separator: comma or semicolon or tab
        const firstLine = lines[0];
        const separator = firstLine.includes(';') ? ';' : firstLine.includes('\t') ? '\t' : ',';

        // Parse header row
        const headers = firstLine
          .split(separator)
          .map((h) => h.replace(/^["']|["']$/g, '').trim().toLowerCase());

        let nameIdx = -1;
        let emailIdx = -1;
        let classIdx = -1;
        let divIdx = -1;
        let idIdx = -1;
        let phoneIdx = -1;

        headers.forEach((h, idx) => {
          const clean = h.replace(/[^a-z0-9]/g, '');
          if (clean.includes('name') && !clean.includes('class') && !clean.includes('room')) nameIdx = idx;
          else if (clean.includes('email') || clean.includes('mail')) emailIdx = idx;
          else if (clean.includes('class') || clean.includes('cohort') || clean.includes('dept') || clean.includes('branch') || clean.includes('prog')) classIdx = idx;
          else if (clean.includes('div') || clean.includes('sec')) divIdx = idx;
          else if (clean.includes('roll') || clean.includes('reg') || clean.includes('id') || clean.includes('seat')) idIdx = idx;
          else if (clean.includes('phone') || clean.includes('mobile') || clean.includes('contact')) phoneIdx = idx;
        });

        // Default positions if headers are unspecified
        if (nameIdx === -1 && emailIdx === -1) {
          nameIdx = 0;
          emailIdx = 1;
          classIdx = 2;
          divIdx = 3;
          phoneIdx = 4;
        } else {
          if (nameIdx === -1) nameIdx = headers.findIndex((_, idx) => idx !== emailIdx && idx !== classIdx && idx !== divIdx);
          if (emailIdx === -1) emailIdx = headers.findIndex((_, idx) => idx !== nameIdx);
        }

        const parsed = [];
        for (let i = 1; i < lines.length; i++) {
          const row = lines[i]
            .split(separator)
            .map((val) => val.replace(/^["']|["']$/g, '').trim());

          if (row.length === 0 || row.every((c) => !c)) continue;

          let rowEmail = emailIdx !== -1 && row[emailIdx] ? row[emailIdx] : '';
          let rowName = nameIdx !== -1 && row[nameIdx] ? row[nameIdx] : '';

          // If email column does not have an '@', search columns
          if (!rowEmail.includes('@')) {
            const foundIdx = row.findIndex((c) => c.includes('@'));
            if (foundIdx !== -1) {
              rowEmail = row[foundIdx];
              if (nameIdx === foundIdx) {
                rowName = row[0] === rowEmail ? row[1] || 'Candidate' : row[0];
              }
            }
          }

          const rowId = idIdx !== -1 && row[idIdx] ? row[idIdx] : null;
          const rowClass = classIdx !== -1 && row[classIdx] ? row[classIdx] : 'FE';
          const rowDiv = divIdx !== -1 && row[divIdx] ? row[divIdx] : 'A';
          const rowPhone = phoneIdx !== -1 && row[phoneIdx] ? row[phoneIdx] : '';

          if (rowName || rowEmail) {
            parsed.push({
              id: rowId,
              name: rowName || rowEmail.split('@')[0],
              email: rowEmail,
              className: rowClass,
              division: rowDiv,
              phone: rowPhone,
              status: 'Active',
              isValid: rowEmail.includes('@') && Boolean(rowName),
            });
          }
        }

        if (parsed.length === 0) {
          setImportError('Could not find any student records. Ensure the CSV contains student full names and emails.');
        } else {
          setImportRows(parsed);
        }
      } catch (err) {
        setImportError(`Failed to parse CSV file: ${err.message}`);
      }
    };
    reader.readAsText(file);
  };

  const handleExecuteImport = async () => {
    const validRows = importRows.filter((r) => r.isValid);
    if (validRows.length === 0) {
      setImportError('No valid rows available to import.');
      return;
    }

    setImporting(true);
    try {
      const { data: updatedList } = await studentsService.bulkCreateStudents(validRows);
      if (updatedList && updatedList.length > 0) {
        setStudents(updatedList);
      } else {
        const refreshed = await studentsService.getStudents();
        if (refreshed.data) setStudents(refreshed.data);
      }

      setToastMessage(`Successfully imported and enrolled ${validRows.length} students!`);
      setIsImportModalOpen(false);
      setImportRows([]);
      setImportFileName('');
    } catch (err) {
      console.error('Import error:', err);
      setImportError(`Import failed: ${err.message}`);
    } finally {
      setImporting(false);
    }
  };

  const handleResetBaseline = () => {
    if (window.confirm('Reset student roster to Vidyalankar Institute of Technology (VIT) standard baseline?')) {
      const reset = studentsService.resetToVITDefaults();
      setStudents(reset);
      setToastMessage('Student roster reset to verified VIT baseline.');
    }
  };

  const columns = [
    {
      key: 'id',
      label: 'Roll / Reg No',
      width: '130px',
      render: (val, row) => <span className="mono-id">{row.rollNo || val}</span>,
    },
    {
      key: 'name',
      label: 'Student Name',
      render: (val, row) => (
        <div className="table-user-cell">
          <div className="user-avatar-mini">{val ? val.charAt(0).toUpperCase() : 'S'}</div>
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
        subtitle={`Active institutional cohort roster (${students.length} students enrolled) • Synchronized dynamically.`}
        category="Workspace"
        actions={
          <div className="header-action-group">
            <Button
              variant="secondary"
              size="sm"
              icon={<DownloadIcon size={14} />}
              onClick={handleResetBaseline}
              title="Reset roster to VIT defaults"
            >
              Reset Baseline
            </Button>
            <Button
              variant="secondary"
              size="sm"
              icon={<UploadIcon size={15} />}
              onClick={() => {
                setImportRows([]);
                setImportFileName('');
                setImportError(null);
                setIsImportModalOpen(true);
              }}
            >
              Import CSV
            </Button>
            <Button
              variant="primary"
              size="sm"
              icon={<PlusIcon size={16} />}
              onClick={handleOpenAdd}
            >
              Add Student
            </Button>
          </div>
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
              ...classOptionsList.map((c) => ({ label: c, value: c })),
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
        emptySubtitle="Import a student CSV file or add a student to begin."
      />

      {/* Add / Edit Student Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingStudent ? 'Edit Student Record' : 'Register New Student'}
        subtitle="Changes are saved dynamically and update dashboard totals."
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
            label="Roll / Registration No"
            id="student-id"
            value={formData.id}
            onChange={(e) => setFormData({ ...formData, id: e.target.value, rollNo: e.target.value })}
            helper="Standard short roll / registration identifier (e.g. 26FE01, 25CP02)"
          />

          <Input
            label="Full Name"
            id="student-name"
            placeholder="e.g. Rhea Kulkarni"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            error={formErrors.name}
            required
          />

          <Input
            label="Academic Email"
            id="student-email"
            type="email"
            placeholder="e.g. rhea.kulkarni@vit.edu.in"
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
                onChange={(e) => {
                  const newClass = e.target.value;
                  // If not editing, auto suggest short roll matching the new class
                  if (!editingStudent) {
                    const autoRoll = generateShortRollNo(newClass, students);
                    setFormData({ ...formData, className: newClass, id: autoRoll, rollNo: autoRoll });
                  } else {
                    setFormData({ ...formData, className: newClass });
                  }
                }}
              >
                {classOptionsList.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
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

      {/* Bulk CSV Import Modal */}
      {isImportModalOpen && (
        <Modal
          isOpen={isImportModalOpen}
          onClose={() => setIsImportModalOpen(false)}
          title="Bulk Student Enrollment via CSV"
          subtitle="Upload a roster spreadsheet to enroll candidates in batch"
          maxWidth={680}
          footer={
            <div className="modal-form-actions">
              <Button variant="secondary" size="sm" onClick={() => setIsImportModalOpen(false)}>
                Cancel
              </Button>
              <Button
                variant="primary"
                size="sm"
                icon={<UploadIcon size={14} />}
                onClick={handleExecuteImport}
                disabled={importing || importRows.filter((r) => r.isValid).length === 0}
              >
                {importing ? 'Enrolling Students...' : `Enroll ${importRows.filter((r) => r.isValid).length} Students`}
              </Button>
            </div>
          }
        >
          <div className="import-modal-content">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16, padding: '12px 14px', background: 'var(--surface-secondary)', borderRadius: 8, border: '1px solid var(--border)' }}>
              <div>
                <strong style={{ fontSize: 13, color: 'var(--text-primary)' }}>Standard Format Template</strong>
                <p style={{ fontSize: 12, color: 'var(--text-secondary)', margin: 0 }}>Accepts Full Name, Email, Cohort Class, Division, Phone</p>
              </div>
              <Button
                variant="secondary"
                size="sm"
                icon={<DownloadIcon size={14} />}
                onClick={handleDownloadTemplate}
              >
                Sample Template
              </Button>
            </div>

            <div style={{ border: '2px dashed var(--border-hover)', borderRadius: 10, padding: 24, textAlign: 'center', marginBottom: 16, background: 'var(--surface-elevated)' }}>
              <input
                type="file"
                id="csv-file-input"
                accept=".csv"
                style={{ display: 'none' }}
                onChange={handleFileSelect}
              />
              <label htmlFor="csv-file-input" style={{ cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
                <div style={{ width: 44, height: 44, borderRadius: '50%', background: 'var(--primary-subtle)', color: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <UploadIcon size={20} />
                </div>
                <strong style={{ fontSize: 14, color: 'var(--text-primary)' }}>
                  {importFileName ? importFileName : 'Click to select student CSV roster file'}
                </strong>
                <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                  Supports CSV exports from Excel, Google Sheets, or College SIS
                </span>
              </label>
            </div>

            {importError && (
              <div style={{ padding: '10px 12px', background: 'rgba(239, 68, 68, 0.1)', border: '1px solid var(--danger)', borderRadius: 6, color: 'var(--danger)', fontSize: 12, marginBottom: 14 }}>
                {importError}
              </div>
            )}

            {importRows.length > 0 && (
              <div style={{ marginTop: 12 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8, fontSize: 12, color: 'var(--text-secondary)' }}>
                  <span>Parsed Roster Preview ({importRows.length} candidates found)</span>
                  <span style={{ color: 'var(--success)', fontWeight: 600 }}>{importRows.filter((r) => r.isValid).length} Valid for Import</span>
                </div>
                <div style={{ maxHeight: 200, overflowY: 'auto', border: '1px solid var(--border)', borderRadius: 6 }}>
                  <table style={{ width: '100%', fontSize: 12, borderCollapse: 'collapse' }}>
                    <thead>
                      <tr style={{ background: 'var(--surface-secondary)', borderBottom: '1px solid var(--border)' }}>
                        <th style={{ padding: '6px 8px', textAlign: 'left' }}>Candidate Name</th>
                        <th style={{ padding: '6px 8px', textAlign: 'left' }}>Email</th>
                        <th style={{ padding: '6px 8px', textAlign: 'left' }}>Cohort</th>
                        <th style={{ padding: '6px 8px', textAlign: 'center' }}>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {importRows.slice(0, 15).map((row, idx) => (
                        <tr key={idx} style={{ borderBottom: '1px solid var(--border)' }}>
                          <td style={{ padding: '6px 8px' }}>{row.name}</td>
                          <td style={{ padding: '6px 8px', fontFamily: 'monospace' }}>{row.email}</td>
                          <td style={{ padding: '6px 8px' }}>{row.className} ({row.division})</td>
                          <td style={{ padding: '6px 8px', textAlign: 'center' }}>
                            <span style={{ color: row.isValid ? 'var(--success)' : 'var(--danger)', fontWeight: 600 }}>
                              {row.isValid ? '✓ Valid' : '✗ Invalid Email'}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                {importRows.length > 15 && (
                  <div style={{ textAlign: 'center', fontSize: 11, color: 'var(--text-muted)', marginTop: 4 }}>
                    + {importRows.length - 15} additional student rows ready for batch import
                  </div>
                )}
              </div>
            )}
          </div>
        </Modal>
      )}
    </div>
  );
}

export default StudentsPage;
