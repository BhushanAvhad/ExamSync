import { supabase } from '../lib/supabase';
import { INITIAL_ROOMS } from '../data/adminDemoData';

export const roomsService = {
  /**
   * Fetch all exam rooms from Supabase.
   * Maps snake_case database schema to component data model.
   */
  async getRooms() {
    if (!supabase) return { data: INITIAL_ROOMS, error: null };

    const { data, error } = await supabase
      .from('exam_rooms')
      .select('*')
      .order('room_number', { ascending: true });

    if (error) {
      console.warn('[roomsService] getRooms error, using initial data:', error.message);
      return { data: INITIAL_ROOMS, error };
    }

    if (!data || data.length === 0) {
      return { data: INITIAL_ROOMS, error: null };
    }

    const mapped = data.map((r) => ({
      id: r.id,
      roomNumber: r.room_number,
      location: r.location,
      capacity: r.capacity,
      type: r.type,
      status: r.status,
    }));

    return { data: mapped, error: null };
  },

  /**
   * Create a new exam room.
   */
  async createRoom(room) {
    if (!supabase) throw new Error('Supabase is not configured');

    const payload = {
      room_number: room.roomNumber.trim(),
      location: room.location.trim(),
      capacity: Number(room.capacity),
      type: room.type,
      status: room.status || 'Available',
    };

    const { data, error } = await supabase
      .from('exam_rooms')
      .insert(payload)
      .select()
      .single();

    if (error) throw error;

    return {
      id: data.id,
      roomNumber: data.room_number,
      location: data.location,
      capacity: data.capacity,
      type: data.type,
      status: data.status,
    };
  },

  /**
   * Update an existing exam room.
   */
  async updateRoom(id, room) {
    if (!supabase) throw new Error('Supabase is not configured');

    const payload = {
      room_number: room.roomNumber.trim(),
      location: room.location.trim(),
      capacity: Number(room.capacity),
      type: room.type,
      status: room.status,
    };

    const { data, error } = await supabase
      .from('exam_rooms')
      .update(payload)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    return {
      id: data.id,
      roomNumber: data.room_number,
      location: data.location,
      capacity: data.capacity,
      type: data.type,
      status: data.status,
    };
  },

  /**
   * Delete an exam room by ID.
   */
  async deleteRoom(id) {
    if (!supabase) throw new Error('Supabase is not configured');

    const { error } = await supabase
      .from('exam_rooms')
      .delete()
      .eq('id', id);

    if (error) throw error;
    return true;
  },
};

export default roomsService;
