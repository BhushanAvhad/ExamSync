import { supabase } from '../lib/supabase';
import { INITIAL_ROOMS } from '../data/adminDemoData';

const STORAGE_KEY = 'examsync_rooms';

function getStoredRooms() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_ROOMS));
  } catch (e) {
    // ignore
  }
  return [...INITIAL_ROOMS];
}

function saveStoredRooms(list) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
  } catch (e) {
    // ignore
  }
}

export const roomsService = {
  /**
   * Fetch all exam rooms from Supabase with fallback to persistent storage.
   */
  async getRooms() {
    const local = getStoredRooms();
    if (!supabase) return { data: local, error: null };

    try {
      const { data, error } = await supabase
        .from('exam_rooms')
        .select('*')
        .order('room_number', { ascending: true });

      if (error || !data || data.length === 0) {
        return { data: local, error: null };
      }

      const mapped = data.map((r) => ({
        id: r.id,
        roomNumber: r.room_number,
        location: r.location,
        capacity: r.capacity,
        type: r.type,
        status: r.status,
      }));

      saveStoredRooms(mapped);
      return { data: mapped, error: null };
    } catch (e) {
      return { data: local, error: null };
    }
  },

  /**
   * Create a new exam room.
   */
  async createRoom(room) {
    const current = getStoredRooms();
    const newRoom = {
      id: room.id || `RM-${String(current.length + 1).padStart(2, '0')}`,
      roomNumber: room.roomNumber.trim(),
      location: room.location.trim(),
      capacity: Number(room.capacity),
      type: room.type || 'Standard Classroom',
      status: room.status || 'Available',
    };

    const updated = [newRoom, ...current];
    saveStoredRooms(updated);

    if (supabase) {
      try {
        await supabase.from('exam_rooms').insert({
          room_number: newRoom.roomNumber,
          location: newRoom.location,
          capacity: newRoom.capacity,
          type: newRoom.type,
          status: newRoom.status,
        });
      } catch (e) {
        // ignore
      }
    }

    return newRoom;
  },

  /**
   * Update an existing exam room.
   */
  async updateRoom(id, room) {
    const current = getStoredRooms();
    const updated = current.map((r) => (r.id === id ? { ...r, ...room, capacity: Number(room.capacity) } : r));
    saveStoredRooms(updated);

    if (supabase) {
      try {
        await supabase
          .from('exam_rooms')
          .update({
            room_number: room.roomNumber.trim(),
            location: room.location.trim(),
            capacity: Number(room.capacity),
            type: room.type,
            status: room.status,
          })
          .eq('id', id);
      } catch (e) {
        // ignore
      }
    }

    return room;
  },

  /**
   * Delete an exam room by ID.
   */
  async deleteRoom(id) {
    const current = getStoredRooms();
    const updated = current.filter((r) => r.id !== id);
    saveStoredRooms(updated);

    if (supabase) {
      try {
        await supabase.from('exam_rooms').delete().eq('id', id);
      } catch (e) {
        // ignore
      }
    }

    return true;
  },
};

export default roomsService;
