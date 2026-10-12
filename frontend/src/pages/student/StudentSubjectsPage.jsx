import { useState, useMemo } from 'react';
import { PageHeader } from '../../components/admin/PageHeader';
import { FilterBar } from '../../components/admin/FilterBar';
import { DataTable } from '../../components/admin/DataTable';
import { Badge } from '../../components/ui/Badge';
import {
  ClockIcon,
  DoorIcon,
  CalendarDaysIcon,
  UserIcon,
} from '../../components/ui/Icons';
import {
  STUDENT_PROFILE,
  STUDENT_SUBJECTS,
} from '../../data/studentDemoData';

export function StudentSubjectsPage() {
  const [subjects] = useState(STUDENT_SUBJECTS);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState('all');
  const [viewMode, setViewMode] = useState('cards'); // 'cards' | 'table'

  const filteredSubjects = useMemo(() => {
    return subjects.filter((s) => {
      const q = searchQuery.toLowerCase();
      const matchesSearch =
        !q ||
        s.code.toLowerCase().includes(q) ||
        s.name.toLowerCase().includes(q) ||
        s.instructor.toLowerCase().includes(q);

      const matchesType =
        selectedType === 'all' || s.type.toLowerCase().includes(selectedType.toLowerCase());

      return matchesSearch && matchesType;
    });
  }, [subjects, searchQuery, selectedType]);

  const columns = [
    {
      key: 'code',
      label: 'Subject Code',
      width: '130px',
      render: (val) => <span className="mono-id">{val}</span>,
    },
    {
      key: 'name',
      label: 'Subject Title',
      render: (val, row) => (
        <div>
          <strong className="subject-tbl-name">{val}</strong>
          <div className="subject-sub-type">{row.type}</div>
        </div>
      ),
    },
    {
      key: 'credits',
      label: 'Credits',
      width: '100px',
      render: (val) => <span>{val} Credits</span>,
    },
    {
      key: 'instructor',
      label: 'Lead Instructor',
      width: '180px',
      render: (val) => (
        <div className="table-user-cell">
          <UserIcon size={14} className="user-icon-subtle" />
          <span>{val}</span>
        </div>
      ),
    },
    {
      key: 'examDate',
      label: 'Exam Schedule',
      width: '190px',
      render: (val, row) => (
        <div>
          <span className="mono-date">{val}</span>
          <div className="date-sub-day">{row.examTime}</div>
        </div>
      ),
    },
    {
      key: 'venue',
      label: 'Allocated Venue',
      width: '150px',
      render: (val) => (
        <div className="table-room-pill">
          <DoorIcon size={13} />
          <span>{val}</span>
        </div>
      ),
    },
    {
      key: 'examStatus',
      label: 'Status',
      width: '130px',
      render: (val) => (
        <Badge variant={val === 'Scheduled' ? 'scheduled' : 'available'}>
          {val}
        </Badge>
      ),
    },
  ];

  return (
    <div className="admin-page-content student-subjects-page">
      <PageHeader
        title="My Registered Subjects"
        subtitle={`Academic curriculum modules enrolled for ${STUDENT_PROFILE.term} • ${STUDENT_PROFILE.className} (${STUDENT_PROFILE.division})`}
        category="Curriculum"
        actions={
          <div className="view-toggle-group">
            <button
              type="button"
              className={`view-toggle-btn ${viewMode === 'cards' ? 'is-active' : ''}`}
              onClick={() => setViewMode('cards')}
            >
              Card Grid
            </button>
            <button
              type="button"
              className={`view-toggle-btn ${viewMode === 'table' ? 'is-active' : ''}`}
              onClick={() => setViewMode('table')}
            >
              Table View
            </button>
          </div>
        }
      />

      {/* Filter and Search Bar */}
      <FilterBar
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        searchPlaceholder="Search enrolled subjects by code, title, or instructor..."
        totalResults={filteredSubjects.length}
        onClearAll={() => {
          setSearchQuery('');
          setSelectedType('all');
        }}
        filters={[
          {
            id: 'type-filter',
            value: selectedType,
            onChange: setSelectedType,
            ariaLabel: 'Filter by Course Type',
            options: [
              { label: 'All Units', value: 'all' },
              { label: 'Core Units', value: 'core' },
              { label: 'Electives', value: 'elective' },
              { label: 'Seminars', value: 'seminar' },
            ],
          },
        ]}
      />

      {/* View 1: Card Grid */}
      {viewMode === 'cards' && (
        <div className="student-subjects-grid">
          {filteredSubjects.map((sub) => (
            <div key={sub.id} className="admin-card student-subject-card">
              <div className="subject-card-top">
                <div className="subject-code-box">
                  <span className="sc-code-badge">{sub.code}</span>
                  <span className="sc-credits-badge">{sub.credits} Credits</span>
                </div>
                <Badge variant={sub.examStatus === 'Scheduled' ? 'scheduled' : 'available'}>
                  {sub.examStatus}
                </Badge>
              </div>

              <h3 className="subject-card-title">{sub.name}</h3>
              <span className="subject-card-type">{sub.type}</span>

              <div className="subject-card-details">
                <div className="sc-detail-item">
                  <UserIcon size={14} />
                  <span>{sub.instructor}</span>
                </div>
                <div className="sc-detail-item">
                  <CalendarDaysIcon size={14} />
                  <span>{sub.examDate}</span>
                </div>
                <div className="sc-detail-item">
                  <ClockIcon size={14} />
                  <span>{sub.examTime} {sub.duration !== 'N/A' && `(${sub.duration})`}</span>
                </div>
                <div className="sc-detail-item">
                  <DoorIcon size={14} />
                  <span>{sub.venue}</span>
                </div>
              </div>

              <div className="subject-card-footer">
                <span className="cohort-tag">{STUDENT_PROFILE.className} ({STUDENT_PROFILE.division})</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* View 2: Table View */}
      {viewMode === 'table' && (
        <DataTable
          columns={columns}
          data={filteredSubjects}
          idKey="id"
          pageSize={10}
          emptyTitle="No curriculum subjects found"
          emptySubtitle="Try adjusting search terms or unit filters."
        />
      )}
    </div>
  );
}

export default StudentSubjectsPage;
