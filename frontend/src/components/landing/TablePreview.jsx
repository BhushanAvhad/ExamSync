import { useState } from 'react';
import { Table } from '../ui/Table';
import { Badge } from '../ui/Badge';
import { CalendarIcon, ClockIcon, BuildingIcon, FilterIcon } from '../ui/Icons';

/**
 * ExamSync Table Preview (Section 6 & 20 & 22)
 * Demonstrates the floating glass header with backdrop blur,
 * comfortable spacing, subtle separators, hover/selected states,
 * and responsive table behavior.
 */
export function TablePreview() {
  const [selectedExamId, setSelectedExamId] = useState('ex-101');
  const [filterDepartment, setFilterDepartment] = useState('ALL');

  const examData = [
    {
      id: 'ex-101',
      course: 'Theoretical Computer Science',
      code: 'CSC501',
      dept: 'CMPN',
      date: '2026-05-18',
      time: '13:30 — 16:30',
      venue: 'Block A, Lecture Hall A204',
      capacity: '76 / 90',
      status: 'optimized',
      statusText: 'Optimized',
    },
    {
      id: 'ex-102',
      course: 'Digital Communication',
      code: 'ECC501',
      dept: 'EXTC',
      date: '2026-05-19',
      time: '09:00 — 12:00',
      venue: 'Block B, Classroom B201',
      capacity: '58 / 65',
      status: 'scheduled',
      statusText: 'Scheduled',
    },
    {
      id: 'ex-103',
      course: 'Applied Mathematics - I',
      code: 'FEC101',
      dept: 'FE',
      date: '2026-05-20',
      time: '09:00 — 12:00',
      venue: 'Block F, Auditorium F101',
      capacity: '133 / 220',
      status: 'optimized',
      statusText: 'Optimized',
    },
    {
      id: 'ex-104',
      course: 'Internet Programming',
      code: 'ITC501',
      dept: 'INFT',
      date: '2026-05-21',
      time: '13:30 — 16:30',
      venue: 'Block C, Lecture Hall C101',
      capacity: '68 / 85',
      status: 'scheduled',
      statusText: 'Scheduled',
    },
    {
      id: 'ex-105',
      course: 'Data Structures & Algorithms',
      code: 'CSC303',
      dept: 'CMPN',
      date: '2026-05-22',
      time: '09:00 — 12:00',
      venue: 'Block A, Lecture Hall A202',
      capacity: '72 / 80',
      status: 'pending',
      statusText: 'Pending Approval',
    },
    {
      id: 'ex-106',
      course: 'Machine Learning',
      code: 'CSC701',
      dept: 'CMPN',
      date: '2026-05-23',
      time: '13:30 — 16:30',
      venue: 'Block A, Lecture Hall A301',
      capacity: '74 / 100',
      status: 'completed',
      statusText: 'Verified',
    },
    {
      id: 'ex-107',
      course: 'Electronic Devices & Circuits',
      code: 'ECC301',
      dept: 'EXTC',
      date: '2026-05-25',
      time: '09:00 — 12:00',
      venue: 'Block M, Lecture Hall M101',
      capacity: '55 / 120',
      status: 'scheduled',
      statusText: 'Scheduled',
    },
  ];

  const filteredData = filterDepartment === 'ALL'
    ? examData
    : examData.filter((e) => e.dept === filterDepartment);

  const columns = [
    {
      key: 'course',
      label: 'Subject / Course',
      render: (val, row) => (
        <div>
          <div style={{ fontWeight: 600, color: 'var(--text-primary)', marginBottom: 2 }}>
            {val}
          </div>
          <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
            <span style={{ fontSize: '0.75rem', fontFamily: 'var(--font-mono)', color: 'var(--accent)' }}>
              {row.code}
            </span>
            <span style={{ color: 'var(--border-hover)', fontSize: '0.75rem' }}>•</span>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
              {row.dept === 'FE' ? 'First Year (FE)' : `Dept of ${row.dept}`}
            </span>
          </div>
        </div>
      ),
    },
    {
      key: 'date',
      label: 'Date',
      render: (val) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: 'var(--text-secondary)' }}>
          <CalendarIcon size={14} />
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.8125rem' }}>{val}</span>
        </div>
      ),
    },
    {
      key: 'time',
      label: 'Time Window',
      render: (val) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: 'var(--text-secondary)' }}>
          <ClockIcon size={14} />
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.8125rem' }}>{val}</span>
        </div>
      ),
    },
    {
      key: 'venue',
      label: 'Assigned Hall',
      render: (val) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <BuildingIcon size={14} style={{ color: 'var(--text-muted)' }} />
          <span style={{ fontSize: '0.8125rem' }}>{val}</span>
        </div>
      ),
    },
    {
      key: 'capacity',
      label: 'Seating Load',
      render: (val) => (
        <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>
          {val}
        </span>
      ),
    },
    {
      key: 'status',
      label: 'Optimization Status',
      render: (val, row) => (
        <Badge variant={val}>{row.statusText}</Badge>
      ),
    },
  ];

  return (
    <section className="section-wrapper" id="timetable-table">
      <div className="container">
        <div className="section-header">
          <span className="section-tag">Interactive Component Spec</span>
          <h2 className="section-title">Examination Schedule Matrix</h2>
          <p className="section-description">
            Featuring our floating glass header with backdrop blur, subtle row separation,
            responsive scrolling, and state interactions.
          </p>
        </div>

        {/* Filter Bar */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: 12,
            marginBottom: 16,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
            <span style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: 4 }}>
              <FilterIcon size={14} /> Filter:
            </span>
            {['ALL', 'CMPN', 'INFT', 'EXTC', 'FE'].map((dept) => (
              <button
                key={dept}
                type="button"
                onClick={() => setFilterDepartment(dept)}
                className={`btn btn-sm ${filterDepartment === dept ? 'btn-primary' : 'btn-secondary'}`}
                style={{ padding: '4px 12px' }}
              >
                {dept === 'ALL' ? 'All Departments' : dept === 'FE' ? 'First Year (FE)' : `Dept of ${dept}`}
              </button>
            ))}
          </div>

          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
            Showing {filteredData.length} records • Click any row to inspect
          </div>
        </div>

        {/* The Glass Table */}
        <Table
          columns={columns}
          data={filteredData}
          selectedId={selectedExamId}
          onRowClick={(row) => setSelectedExamId(row.id)}
          stickyHeader={true}
          ariaLabel="Master Examination Schedule Table"
        />

        {/* Table Spec Note */}
        <div
          style={{
            marginTop: 14,
            padding: '12px 18px',
            background: 'var(--surface-secondary)',
            borderRadius: 'var(--radius-sm)',
            border: '1px solid var(--border-subtle)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            fontSize: '0.75rem',
            color: 'var(--text-muted)',
            flexWrap: 'wrap',
            gap: 10,
          }}
        >
          <div>
            <strong style={{ color: 'var(--text-primary)' }}>Header Glass Effect:</strong>{' '}
            <code style={{ background: 'var(--surface)', padding: '2px 6px', borderRadius: 4 }}>
              backdrop-filter: blur(16px)
            </code>{' '}
            +{' '}
            <code style={{ background: 'var(--surface)', padding: '2px 6px', borderRadius: 4 }}>
              background: rgba(14, 20, 38, 0.82)
            </code>
          </div>
          <div>Selected Row ID: <span style={{ fontFamily: 'var(--font-mono)', color: 'var(--accent)' }}>{selectedExamId || 'None'}</span></div>
        </div>
      </div>
    </section>
  );
}

export default TablePreview;
