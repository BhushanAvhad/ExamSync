import { supabase } from '../lib/supabase';
import { INITIAL_EXAM_SESSIONS } from '../data/adminDemoData';

export const sessionsService = {
  async getExamSessions() {
    if (!supabase) return { data: INITIAL_EXAM_SESSIONS, error: null };

    const { data, error } = await supabase
      .from('exam_sessions')
      .select('*')
      .order('start_date', { ascending: false });

    if (error || !data || data.length === 0) {
      if (error) console.warn('[sessionsService] getExamSessions error, using fallback:', error.message);
      return { data: INITIAL_EXAM_SESSIONS, error };
    }

    const mapped = data.map((s) => ({
      id: s.id,
      name: s.name,
      term: s.academic_term,
      startDate: s.start_date,
      endDate: s.end_date,
      status: s.status,
      description: s.description || '',
      timeSlots: s.time_slots || ['Morning (09:00 — 12:00)', 'Afternoon (14:00 — 17:00)'],
      applicableClasses: ['All Departments'],
    }));

    return { data: mapped, error: null };
  },

  async createExamSession(session) {
    if (!supabase) throw new Error('Supabase is not configured');

    const payload = {
      name: session.name.trim(),
      academic_term: session.term.trim(),
      start_date: session.startDate,
      end_date: session.endDate,
      status: session.status || 'Draft',
      description: session.description || '',
      time_slots: session.timeSlots || ['Morning (09:00 — 12:00)', 'Afternoon (14:00 — 17:00)'],
    };

    const { data, error } = await supabase
      .from('exam_sessions')
      .insert(payload)
      .select()
      .single();

    if (error) throw error;

    return {
      id: data.id,
      name: data.name,
      term: data.academic_term,
      startDate: data.start_date,
      endDate: data.end_date,
      status: data.status,
      description: data.description,
      timeSlots: data.time_slots,
      applicableClasses: ['All Departments'],
    };
  },

  async updateExamSession(id, session) {
    if (!supabase) throw new Error('Supabase is not configured');

    const payload = {
      name: session.name.trim(),
      academic_term: session.term.trim(),
      start_date: session.startDate,
      end_date: session.endDate,
      status: session.status,
      description: session.description || '',
    };

    const { data, error } = await supabase
      .from('exam_sessions')
      .update(payload)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    return {
      id: data.id,
      name: data.name,
      term: data.academic_term,
      startDate: data.start_date,
      endDate: data.end_date,
      status: data.status,
      description: data.description,
      timeSlots: data.time_slots,
      applicableClasses: ['All Departments'],
    };
  },

  async deleteExamSession(id) {
    if (!supabase) throw new Error('Supabase is not configured');
    const { error } = await supabase.from('exam_sessions').delete().eq('id', id);
    if (error) throw error;
    return true;
  },
};

export default sessionsService;
