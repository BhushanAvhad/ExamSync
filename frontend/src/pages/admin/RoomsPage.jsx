import { useState, useMemo, useEffect, useCallback } from 'react';
import { PageHeader } from '../../components/admin/PageHeader';
import { StatCard } from '../../components/admin/StatCard';
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
  DoorIcon,
  BuildingIcon,
  CheckCircleIcon,
  InfoIcon,
} from '../../components/ui/Icons';
import { INITIAL_ROOMS } from '../../data/adminDemoData';
import { roomsService } from '../../services/roomsService';

export function RoomsPage() {
  const [rooms, setRooms] = useState(INITIAL_ROOMS);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [selectedType, setSelectedType] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 8;

  const loadRooms = useCallback(async () => {
    try {
      setLoading(true);
      const { data } = await roomsService.getRooms();
      if (data) setRooms(data);
    } catch (err) {
      console.error('Failed to load rooms:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadRooms();
  }, [loadRooms]);

  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingRoom, setEditingRoom] = useState(null);
  const [roomForm, setRoomForm] = useState({
    id: '',
    roomNumber: '',
    location: '',
    capacity: 60,
    type: 'Lecture Hall',
    status: 'Available',
  });
  const [formErrors, setFormErrors] = useState({});

  // Delete dialog
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [toastMessage, setToastMessage] = useState(null);

  // Derived metrics
  const totalRooms = rooms.length;
  const availableRooms = rooms.filter((r) => r.status === 'Available').length;
  const totalCapacity = rooms.reduce((acc, r) => acc + (Number(r.capacity) || 0), 0);

  // Filtered rooms
  const filteredRooms = useMemo(() => {
    return rooms.filter((r) => {
      const q = searchQuery.toLowerCase();
      const matchesSearch =
        !q ||
        r.roomNumber.toLowerCase().includes(q) ||
        r.location.toLowerCase().includes(q) ||
        r.type.toLowerCase().includes(q);

      const matchesStatus =
        selectedStatus === 'all' || r.status.toLowerCase() === selectedStatus.toLowerCase();

      const matchesType =
        selectedType === 'all' || r.type === selectedType;

      return matchesSearch && matchesStatus && matchesType;
    });
  }, [rooms, searchQuery, selectedStatus, selectedType]);

  const handleOpenAdd = () => {
    const nextId = `RM-${(rooms.length + 1).toString().padStart(2, '0')}`;
    setEditingRoom(null);
    setRoomForm({
      id: nextId,
      roomNumber: '',
      location: '',
      capacity: 60,
      type: 'Lecture Hall',
      status: 'Available',
    });
    setFormErrors({});
    setIsModalOpen(true);
  };

  const handleOpenEdit = (room) => {
    setEditingRoom(room);
    setRoomForm({ ...room });
    setFormErrors({});
    setIsModalOpen(true);
  };

  const validate = () => {
    const errors = {};
    if (!roomForm.roomNumber.trim()) errors.roomNumber = 'Room name / number is required';
    if (!roomForm.location.trim()) errors.location = 'Campus location is required';
    const capNum = Number(roomForm.capacity);
    if (!roomForm.capacity || isNaN(capNum) || capNum <= 0 || !Number.isInteger(capNum)) {
      errors.capacity = 'Capacity must be a positive integer';
    }
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    const payload = {
      ...roomForm,
      capacity: Number(roomForm.capacity),
    };

    try {
      if (editingRoom) {
        const updated = await roomsService.updateRoom(editingRoom.id, payload);
        setRooms((prev) => prev.map((r) => (r.id === editingRoom.id ? updated : r)));
        setToastMessage(`Venue ${payload.roomNumber} updated in database`);
      } else {
        const created = await roomsService.createRoom(payload);
        setRooms((prev) => [created, ...prev]);
        setToastMessage(`Venue ${payload.roomNumber} created in database`);
      }
      setIsModalOpen(false);
    } catch (err) {
      console.error('Error saving venue:', err);
      // Fallback update in state if backend RLS prevents write
      if (editingRoom) {
        setRooms((prev) => prev.map((r) => (r.id === editingRoom.id ? payload : r)));
      } else {
        setRooms((prev) => [payload, ...prev]);
      }
      setToastMessage(`Venue ${payload.roomNumber} saved locally (${err.message})`);
      setIsModalOpen(false);
    }
  };

  const handleConfirmDelete = async () => {
    if (!deleteTarget) return;
    try {
      await roomsService.deleteRoom(deleteTarget.id);
      setRooms((prev) => prev.filter((r) => r.id !== deleteTarget.id));
      setToastMessage(`Venue ${deleteTarget.roomNumber} removed from database`);
    } catch (err) {
      console.error('Error deleting venue:', err);
      setRooms((prev) => prev.filter((r) => r.id !== deleteTarget.id));
      setToastMessage(`Venue ${deleteTarget.roomNumber} removed locally (${err.message})`);
    } finally {
      setDeleteTarget(null);
    }
  };

  const columns = [
    {
      key: 'roomNumber',
      label: 'Exam Room / Hall',
      render: (val) => (
        <div className="table-room-cell">
          <DoorIcon size={16} className="room-icon" />
          <strong className="room-title">{val}</strong>
        </div>
      ),
    },
    {
      key: 'location',
      label: 'Campus Location',
      render: (val) => <span className="table-location-text">{val}</span>,
    },
    {
      key: 'capacity',
      label: 'Seating Capacity',
      width: '150px',
      render: (val) => (
        <span className="capacity-badge">
          <strong>{val}</strong> seats
        </span>
      ),
    },
    {
      key: 'type',
      label: 'Venue Type',
      width: '150px',
      render: (val) => <span className="venue-type-tag">{val}</span>,
    },
    {
      key: 'status',
      label: 'Availability',
      width: '130px',
      render: (val) => (
        <Badge
          variant={
            val === 'Available'
              ? 'available'
              : val === 'Maintenance'
              ? 'conflict'
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
      width: '100px',
      align: 'right',
      render: (_, row) => (
        <div className="table-action-btns">
          <button
            type="button"
            className="action-icon-btn"
            onClick={() => handleOpenEdit(row)}
            title="Edit room"
            aria-label={`Edit ${row.roomNumber}`}
          >
            <EditIcon size={14} />
          </button>
          <button
            type="button"
            className="action-icon-btn danger"
            onClick={() => setDeleteTarget(row)}
            title="Delete room"
            aria-label={`Delete ${row.roomNumber}`}
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
        title="Exam Venues & Rooms"
        subtitle="Manage examination halls, computer testing labs, seating capacities, and room suitability."
        category="Workspace"
        actions={
          <Button
            variant="primary"
            size="sm"
            icon={<PlusIcon size={16} />}
            onClick={handleOpenAdd}
          >
            Add Venue
          </Button>
        }
      />

      {/* Metrics Strip */}
      <div className="admin-stat-grid" style={{ marginBottom: 24 }}>
        <StatCard
          label="Total Registered Venues"
          value={totalRooms}
          icon={<DoorIcon size={20} />}
          helperText="Standard halls and specialty labs"
          accent="indigo"
        />
        <StatCard
          label="Available Venues"
          value={`${availableRooms} / ${totalRooms}`}
          icon={<CheckCircleIcon size={20} />}
          helperText="Ready for examination allocation"
          accent="emerald"
        />
        <StatCard
          label="Total Seating Capacity"
          value={`${totalCapacity} Desks`}
          icon={<BuildingIcon size={20} />}
          helperText="Aggregate spaced seating desks"
          accent="cyan"
        />
      </div>

      {/* Demo Notice */}
      <div className="admin-banner info-banner" style={{ marginBottom: 20 }}>
        <InfoIcon size={18} className="banner-icon" />
        <div className="banner-content">
          <strong>Illustrative Venue Data</strong> — Seating capacities and availability statuses are part of the UI preview environment. Algorithm enforces max desk limitations per room during timetable generation.
        </div>
      </div>

      {/* Filters and Search Bar */}
      <FilterBar
        searchQuery={searchQuery}
        onSearchChange={(q) => {
          setSearchQuery(q);
          setCurrentPage(1);
        }}
        searchPlaceholder="Search venue by name, location, or type..."
        totalResults={filteredRooms.length}
        onClearAll={() => {
          setSearchQuery('');
          setSelectedStatus('all');
          setSelectedType('all');
          setCurrentPage(1);
        }}
        filters={[
          {
            id: 'room-status-filter',
            value: selectedStatus,
            onChange: (val) => {
              setSelectedStatus(val);
              setCurrentPage(1);
            },
            ariaLabel: 'Filter by Room Status',
            options: [
              { label: 'All Statuses', value: 'all' },
              { label: 'Available', value: 'available' },
              { label: 'Maintenance', value: 'maintenance' },
              { label: 'Reserved', value: 'reserved' },
            ],
          },
          {
            id: 'room-type-filter',
            value: selectedType,
            onChange: (val) => {
              setSelectedType(val);
              setCurrentPage(1);
            },
            ariaLabel: 'Filter by Venue Type',
            options: [
              { label: 'All Venue Types', value: 'all' },
              { label: 'Lecture Hall', value: 'Lecture Hall' },
              { label: 'Computer Lab', value: 'Computer Lab' },
              { label: 'Standard Classroom', value: 'Standard Classroom' },
              { label: 'Auditorium', value: 'Auditorium' },
              { label: 'Seminar Room', value: 'Seminar Room' },
            ],
          },
        ]}
      />

      {/* Rooms Table */}
      <DataTable
        columns={columns}
        data={filteredRooms}
        idKey="id"
        currentPage={currentPage}
        pageSize={pageSize}
        onPageChange={setCurrentPage}
        totalItems={filteredRooms.length}
        emptyTitle="No rooms match your filter criteria"
        emptySubtitle="Check venue search keywords or add a new exam room."
      />

      {/* Modal: Add/Edit Room */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingRoom ? 'Edit Venue Specification' : 'Add Examination Venue'}
        subtitle="Specify room number, physical location, seating capacity, and type"
        footer={
          <div className="modal-form-actions">
            <Button variant="secondary" size="sm" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" size="sm" onClick={handleSubmit}>
              {editingRoom ? 'Save Changes' : 'Create Room'}
            </Button>
          </div>
        }
      >
        <form onSubmit={handleSubmit} className="admin-modal-form">
          <Input
            label="Room / Hall Name"
            id="room-number"
            placeholder="e.g. Hall 101, Lab 204, Turing Auditorium"
            value={roomForm.roomNumber}
            onChange={(e) => setRoomForm({ ...roomForm, roomNumber: e.target.value })}
            error={formErrors.roomNumber}
            required
          />

          <Input
            label="Campus Location / Building"
            id="room-location"
            placeholder="e.g. Science Complex, Ground Floor"
            value={roomForm.location}
            onChange={(e) => setRoomForm({ ...roomForm, location: e.target.value })}
            error={formErrors.location}
            required
          />

          <div className="form-row-2col">
            <Input
              label="Seating Capacity (Desks)"
              id="room-capacity"
              type="number"
              min="1"
              value={roomForm.capacity}
              onChange={(e) => setRoomForm({ ...roomForm, capacity: e.target.value })}
              error={formErrors.capacity}
              required
            />

            <div className="input-group">
              <label htmlFor="room-type" className="input-label">Venue Type</label>
              <select
                id="room-type"
                className="input-field"
                value={roomForm.type}
                onChange={(e) => setRoomForm({ ...roomForm, type: e.target.value })}
              >
                <option value="Lecture Hall">Lecture Hall</option>
                <option value="Computer Lab">Computer Lab</option>
                <option value="Standard Classroom">Standard Classroom</option>
                <option value="Auditorium">Auditorium</option>
                <option value="Seminar Room">Seminar Room</option>
              </select>
            </div>
          </div>

          <div className="input-group">
            <label htmlFor="room-status" className="input-label">Availability Status</label>
            <select
              id="room-status"
              className="input-field"
              value={roomForm.status}
              onChange={(e) => setRoomForm({ ...roomForm, status: e.target.value })}
            >
              <option value="Available">Available (Ready for Scheduling)</option>
              <option value="Maintenance">Maintenance (Off Limits)</option>
              <option value="Reserved">Reserved (Special Accommodations)</option>
            </select>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={Boolean(deleteTarget)}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleConfirmDelete}
        title="Remove Examination Venue"
        message={`Are you sure you want to remove ${deleteTarget?.roomNumber} from the venue register? Any scheduled exams in this hall will require reallocation.`}
        confirmText="Remove Venue"
      />
    </div>
  );
}

export default RoomsPage;
