import { supabase } from '../lib/supabase';
import { INITIAL_TIMETABLE } from '../data/adminDemoData';

export const timetablesService = {
  async getTimetables(sessionId = null) {
    if (!supabase) return { data: INITIAL_TIMETABLE, error: null };

    let query = supabase
      .from('exam_timetables')
      .select(`
        id,
        exam_session_id,
        exam_date,
        start_time,
        end_time,
        duration_minutes,
        status,
        is_published,
        subjects ( id, code, name ),
        classes ( id, name, division ),
        exam_rooms ( id, room_number )
      `)
      .order('exam_date', { ascending: true })
      .order('start_time', { ascending: true });

    if (sessionId) {
      query = query.eq('exam_session_id', sessionId);
    }

    const { data, error } = await query;

    if (error || !data || data.length === 0) {
      if (error) console.warn('[timetablesService] getTimetables error, using fallback:', error.message);
      return { data: INITIAL_TIMETABLE, error };
    }

    const mapped = data.map((row) => ({
      id: row.id,
      sessionId: row.exam_session_id,
      date: row.exam_date,
      timeSlot: `${row.start_time.slice(0, 5)} — ${row.end_time.slice(0, 5)}`,
      subjectCode: row.subjects?.code || '—',
      subjectName: row.subjects?.name || '—',
      className: row.classes?.name || '—',
      division: row.classes?.division || '—',
      room: row.exam_rooms?.room_number || '—',
      duration: `${(row.duration_minutes / 60).toFixed(1)} Hours`,
      status: row.status,
      isPublished: row.is_published,
    }));

    return { data: mapped, error: null };
  },

  async updateTimetableEntry(id, updateData) {
    if (!supabase) throw new Error('Supabase is not configured');

    const payload = {};
    if (updateData.status) payload.status = updateData.status;
    if (updateData.date) payload.exam_date = updateData.date;
    if (updateData.isPublished !== undefined) payload.is_published = updateData.isPublished;

    const { data, error } = await supabase
      .from('exam_timetables')
      .update(payload)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async publishTimetables(sessionId, isPublished = true) {
    if (!supabase) throw new Error('Supabase is not configured');

    let query = supabase
      .from('exam_timetables')
      .update({ is_published: isPublished });

    if (sessionId) {
      query = query.eq('exam_session_id', sessionId);
    }

    const { data, error } = await query;
    if (error) throw error;
    return data;
  },

  async deleteTimetableEntry(id) {
    if (!supabase) throw new Error('Supabase is not configured');
    const { error } = await supabase.from('exam_timetables').delete().eq('id', id);
    if (error) throw error;
    return true;
  },
};

export default timetablesService;
