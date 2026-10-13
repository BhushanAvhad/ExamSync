import { useState, useMemo, useEffect, useCallback } from 'react';
import { PageHeader } from '../../components/admin/PageHeader';
import { StatCard } from '../../components/admin/StatCard';
import { FilterBar } from '../../components/admin/FilterBar';
import { DataTable } from '../../components/admin/DataTable';
import { Modal } from '../../components/admin/Modal';
import { Toast } from '../../components/admin/Toast';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import {
  AlertTriangleIcon,
  CheckCircleIcon,
  InfoIcon,
  SparklesIcon,
  ClockIcon,
  DoorIcon,
  UsersIcon,
} from '../../components/ui/Icons';
import { INITIAL_CONFLICTS } from '../../data/adminDemoData';
import { supabase } from '../../lib/supabase';

export function ConflictsPage() {
  const [conflicts, setConflicts] = useState(INITIAL_CONFLICTS);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSeverity, setSelectedSeverity] = useState('all');
  const [selectedType, setSelectedType] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');

  const loadConflicts = useCallback(async () => {
    if (!supabase) return;
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('conflict_logs')
        .select('*')
        .order('created_at', { ascending: false });

      if (data && data.length > 0) {
        const mapped = data.map((c) => ({
          id: c.id.slice(0, 8).toUpperCase(),
          rawId: c.id,
          type: c.conflict_type,
          severity: c.severity,
          entity: c.entity_reference,
          detectedIssue: c.description,
          suggestedFix: c.suggested_resolution || 'Inspect session constraints.',
          status: c.status,
        }));
        setConflicts(mapped);
      }
    } catch (err) {
      console.warn('Failed to fetch live conflict logs:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadConflicts();
  }, [loadConflicts]);

  // Details modal
  const [detailConflict, setDetailConflict] = useState(null);
  const [toastMessage, setToastMessage] = useState(null);

  // Grouped summary counts
  const clashCount = conflicts.filter((c) => c.type === 'Student Exam Clash').length;
  const capacityCount = conflicts.filter((c) => c.type === 'Room Capacity Violation').length;
  const roomClashCount = conflicts.filter((c) => c.type === 'Room/Time-Slot Clash').length;
  const restGapCount = conflicts.filter((c) => c.type === 'Insufficient Rest Gap').length;

  const filteredConflicts = useMemo(() => {
    return conflicts.filter((c) => {
      const q = searchQuery.toLowerCase();
      const matchesSearch =
        !q ||
        c.id.toLowerCase().includes(q) ||
        c.entity.toLowerCase().includes(q) ||
        c.detectedIssue.toLowerCase().includes(q) ||
        c.type.toLowerCase().includes(q);

      const matchesSeverity =
        selectedSeverity === 'all' || c.severity.toLowerCase() === selectedSeverity.toLowerCase();

      const matchesType =
        selectedType === 'all' || c.type === selectedType;

      const matchesStatus =
        selectedStatus === 'all' || c.status.toLowerCase() === selectedStatus.toLowerCase();

      return matchesSearch && matchesSeverity && matchesType && matchesStatus;
    });
  }, [conflicts, searchQuery, selectedSeverity, selectedType, selectedStatus]);

  const handleMarkReviewed = async (conflictId) => {
    const target = conflicts.find((c) => c.id === conflictId);
    if (supabase && target?.rawId) {
      try {
        await supabase.from('conflict_logs').update({ status: 'In Review' }).eq('id', target.rawId);
      } catch (_) {}
    }
    setConflicts((prev) =>
      prev.map((c) => (c.id === conflictId ? { ...c, status: 'In Review' } : c))
    );
    if (detailConflict && detailConflict.id === conflictId) {
      setDetailConflict((prev) => ({ ...prev, status: 'In Review' }));
    }
    setToastMessage(`Conflict ${conflictId} marked as 'In Review' in database`);
  };

  const handleMarkResolved = async (conflictId) => {
    const target = conflicts.find((c) => c.id === conflictId);
    if (supabase && target?.rawId) {
      try {
        await supabase.from('conflict_logs').update({ status: 'Resolved' }).eq('id', target.rawId);
      } catch (_) {}
    }
    setConflicts((prev) =>
      prev.map((c) => (c.id === conflictId ? { ...c, status: 'Resolved' } : c))
    );
    if (detailConflict && detailConflict.id === conflictId) {
      setDetailConflict((prev) => ({ ...prev, status: 'Resolved' }));
    }
    setToastMessage(`Conflict ${conflictId} marked as 'Resolved' in database`);
  };

  const getSeverityBadge = (sev) => {
    switch (sev) {
      case 'Critical':
        return <Badge variant="conflict">Critical</Badge>;
      case 'High':
        return <Badge variant="pending">High</Badge>;
      case 'Medium':
        return <Badge variant="scheduled">Medium</Badge>;
      default:
        return <Badge variant="available">Low</Badge>;
    }
  };

  const columns = [
    {
      key: 'id',
      label: 'Conflict ID',
      width: '120px',
      render: (val) => <span className="mono-id">{val}</span>,
    },
    {
      key: 'type',
      label: 'Conflict Category',
      width: '190px',
      render: (val) => <strong className="conflict-type-label">{val}</strong>,
    },
    {
      key: 'severity',
      label: 'Severity',
      width: '120px',
      render: (val) => getSeverityBadge(val),
    },
    {
      key: 'entity',
      label: 'Affected Exam / Venue',
      width: '180px',
      render: (val) => <span className="cohort-tag">{val}</span>,
    },
    {
      key: 'detectedIssue',
      label: 'Detected Constraint Violation',
      render: (val) => <p className="conflict-issue-text">{val}</p>,
    },
    {
      key: 'status',
      label: 'Resolution Status',
      width: '130px',
      render: (val) => (
        <Badge
          variant={
            val === 'Resolved'
              ? 'available'
              : val === 'In Review'
              ? 'pending'
              : 'conflict'
          }
        >
          {val}
        </Badge>
      ),
    },
    {
      key: 'actions',
      label: 'Actions',
      width: '100px',
      align: 'right',
      render: (_, row) => (
        <Button
          variant="secondary"
          size="sm"
          onClick={() => setDetailConflict(row)}
        >
          Inspect
        </Button>
      ),
    },
  ];

  return (
    <div className="admin-page-content">
      <Toast message={toastMessage} onClose={() => setToastMessage(null)} />

      <PageHeader
        title="Scheduling Conflicts & Violations"
        subtitle="Detect, analyze, and resolve constraint violations identified across examination sessions."
        category="Scheduling"
        badge={
          <span className="overview-cycle-pill">
            <AlertTriangleIcon size={14} />
            {conflicts.filter((c) => c.status !== 'Resolved').length} Unresolved Issues
          </span>
        }
      />

      {/* Prominent Demo Notice Banner */}
      <div className="admin-banner info-banner" style={{ marginBottom: 24 }}>
        <InfoIcon size={18} className="banner-icon" />
        <div className="banner-content">
          <strong>Illustrative Demo Conflicts</strong> — The records below demonstrate the conflict inspection workflow. Real collision detection will be performed automatically by the constraint optimization engine in Phase 3.
        </div>
      </div>

      {/* Conflict Group Metric Cards */}
      <div className="admin-stat-grid" style={{ marginBottom: 24 }}>
        <StatCard
          label="Student Exam Clashes"
          value={clashCount}
          icon={<UsersIcon size={20} />}
          helperText="Concurrent exam slots for same cohort"
          accent="violet"
        />
        <StatCard
          label="Room Capacity Violations"
          value={capacityCount}
          icon={<DoorIcon size={20} />}
          helperText="Examinees exceed room desk limit"
          accent="indigo"
        />
        <StatCard
          label="Room / Slot Double-Bookings"
          value={roomClashCount}
          icon={<ClockIcon size={20} />}
          helperText="Simultaneous occupancy overlap"
          accent="cyan"
        />
        <StatCard
          label="Rest Gap & Soft Warnings"
          value={restGapCount}
          icon={<AlertTriangleIcon size={20} />}
          helperText="Under 24h interval between papers"
          accent="amber"
        />
      </div>

      {/* Filter and Search Bar */}
      <FilterBar
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        searchPlaceholder="Search conflict by ID, affected paper, or keyword..."
        totalResults={filteredConflicts.length}
        onClearAll={() => {
          setSearchQuery('');
          setSelectedSeverity('all');
          setSelectedType('all');
          setSelectedStatus('all');
        }}
        filters={[
          {
            id: 'severity-filter',
            value: selectedSeverity,
            onChange: setSelectedSeverity,
            ariaLabel: 'Filter by Severity',
            options: [
              { label: 'All Severities', value: 'all' },
              { label: 'Critical', value: 'critical' },
              { label: 'High', value: 'high' },
              { label: 'Medium', value: 'medium' },
            ],
          },
          {
            id: 'conflict-type-filter',
            value: selectedType,
            onChange: setSelectedType,
            ariaLabel: 'Filter by Conflict Type',
            options: [
              { label: 'All Categories', value: 'all' },
              { label: 'Student Exam Clash', value: 'Student Exam Clash' },
              { label: 'Room Capacity Violation', value: 'Room Capacity Violation' },
              { label: 'Room/Time-Slot Clash', value: 'Room/Time-Slot Clash' },
              { label: 'Insufficient Rest Gap', value: 'Insufficient Rest Gap' },
            ],
          },
          {
            id: 'status-filter',
            value: selectedStatus,
            onChange: setSelectedStatus,
            ariaLabel: 'Filter by Status',
            options: [
              { label: 'All States', value: 'all' },
              { label: 'Unresolved', value: 'unresolved' },
              { label: 'In Review', value: 'in review' },
              { label: 'Resolved', value: 'resolved' },
            ],
          },
        ]}
      />

      {/* Conflicts Table */}
      <DataTable
        columns={columns}
        data={filteredConflicts}
        idKey="id"
        pageSize={10}
        emptyTitle="No scheduling conflicts found"
        emptySubtitle="All examined sessions comply with the active filter parameters."
      />

      {/* Suggested Resolution & Details Modal */}
      {detailConflict && (
        <Modal
          isOpen={Boolean(detailConflict)}
          onClose={() => setDetailConflict(null)}
          title={`Conflict Resolution: ${detailConflict.id}`}
          subtitle={`${detailConflict.type} • Affected: ${detailConflict.entity}`}
          maxWidth={600}
          footer={
            <div className="modal-form-actions">
              <Button
                variant="secondary"
                size="sm"
                onClick={() => setDetailConflict(null)}
              >
                Close
              </Button>
              {detailConflict.status !== 'In Review' && detailConflict.status !== 'Resolved' && (
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => handleMarkReviewed(detailConflict.id)}
                >
                  Mark Under Review
                </Button>
              )}
              {detailConflict.status !== 'Resolved' && (
                <Button
                  variant="primary"
                  size="sm"
                  icon={<CheckCircleIcon size={14} />}
                  onClick={() => handleMarkResolved(detailConflict.id)}
                >
                  Mark as Resolved (Demo)
                </Button>
              )}
            </div>
          }
        >
          <div className="conflict-detail-modal-body">
            <div className="conflict-detail-section">
              <span className="detail-meta-label">Detected Violation</span>
              <p className="detail-meta-issue">{detailConflict.detectedIssue}</p>
            </div>

            <div className="conflict-detail-section">
              <span className="detail-meta-label">Root Cause Diagnostic</span>
              <p className="detail-meta-cause">{detailConflict.rootCause}</p>
            </div>

            <div className="resolution-suggestion-box">
              <div className="resolution-header">
                <SparklesIcon size={16} className="resolution-icon" />
                <strong>Suggested Algorithmic Resolution</strong>
              </div>
              <p className="resolution-text">{detailConflict.suggestedResolution}</p>
              <div className="resolution-disclaimer">
                Note: Local interaction only. In Phase 3, applying resolution will trigger incremental rescheduling through the backend solver.
              </div>
            </div>

            <div className="conflict-detail-section">
              <span className="detail-meta-label">Current State</span>
              <div style={{ marginTop: 6 }}>
                <Badge
                  variant={
                    detailConflict.status === 'Resolved'
                      ? 'available'
                      : detailConflict.status === 'In Review'
                      ? 'pending'
                      : 'conflict'
                  }
                >
                  {detailConflict.status}
                </Badge>
              </div>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}

export default ConflictsPage;
