import { supabase } from '../lib/supabase';
import { INITIAL_STUDENTS } from '../data/adminDemoData';

export const studentsService = {
  async getStudents() {
    if (!supabase) return { data: INITIAL_STUDENTS, error: null };

    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('role', 'student')
      .order('created_at', { ascending: false });

    if (error || !data || data.length === 0) {
      if (error) console.warn('[studentsService] getStudents error, fallback to initial:', error.message);
      return { data: INITIAL_STUDENTS, error };
    }

    const mapped = data.map((p, idx) => ({
      id: p.id,
      name: p.full_name || 'Student',
      email: p.email,
      className: p.department || 'CS-Year 1',
      division: 'A',
      status: 'Active',
      phone: p.phone,
    }));

    return { data: mapped, error: null };
  },

  async updateStudent(id, studentData) {
    if (!supabase) throw new Error('Supabase is not configured');

    const payload = {
      full_name: studentData.name.trim(),
      department: studentData.className,
      phone: studentData.phone || null,
    };

    const { data, error } = await supabase
      .from('profiles')
      .update(payload)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return {
      id: data.id,
      name: data.full_name,
      email: data.email,
      className: data.department || 'CS-Year 1',
      division: 'A',
      status: 'Active',
    };
  },

  async deleteStudent(id) {
    if (!supabase) throw new Error('Supabase is not configured');
    const { error } = await supabase.from('profiles').delete().eq('id', id);
    if (error) throw error;
    return true;
  },
};

export default studentsService;
