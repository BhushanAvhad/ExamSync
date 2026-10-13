import { supabase } from '../lib/supabase';
import { INITIAL_CLASSES, INITIAL_SUBJECTS, INITIAL_ASSIGNMENTS } from '../data/adminDemoData';

export const academicsService = {
  /**
   * Fetch classes from Supabase.
   */
  async getClasses() {
    if (!supabase) return { data: INITIAL_CLASSES, error: null };

    const { data, error } = await supabase
      .from('classes')
      .select('*')
      .order('name', { ascending: true });

    if (error || !data || data.length === 0) {
      if (error) console.warn('[academicsService] getClasses error, fallback to initial:', error.message);
      return { data: INITIAL_CLASSES, error };
    }

    const mapped = data.map((c) => ({
      id: c.id,
      name: c.name,
      division: c.division,
      academicYear: c.academic_year,
      studentCount: 60, // default cohort size estimate
    }));

    return { data: mapped, error: null };
  },

  async createClass(cls) {
    if (!supabase) throw new Error('Supabase is not configured');

    const payload = {
      name: cls.name.trim(),
      division: cls.division.trim(),
      academic_year: cls.academicYear.trim(),
    };

    const { data, error } = await supabase
      .from('classes')
      .insert(payload)
      .select()
      .single();

    if (error) throw error;

    return {
      id: data.id,
      name: data.name,
      division: data.division,
      academicYear: data.academic_year,
      studentCount: cls.studentCount || 60,
    };
  },

  async updateClass(id, cls) {
    if (!supabase) throw new Error('Supabase is not configured');

    const payload = {
      name: cls.name.trim(),
      division: cls.division.trim(),
      academic_year: cls.academicYear.trim(),
    };

    const { data, error } = await supabase
      .from('classes')
      .update(payload)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    return {
      id: data.id,
      name: data.name,
      division: data.division,
      academicYear: data.academic_year,
      studentCount: cls.studentCount || 60,
    };
  },

  async deleteClass(id) {
    if (!supabase) throw new Error('Supabase is not configured');
    const { error } = await supabase.from('classes').delete().eq('id', id);
    if (error) throw error;
    return true;
  },

  /**
   * Fetch subjects from Supabase.
   */
  async getSubjects() {
    if (!supabase) return { data: INITIAL_SUBJECTS, error: null };

    const { data, error } = await supabase
      .from('subjects')
      .select('*')
      .order('code', { ascending: true });

    if (error || !data || data.length === 0) {
      if (error) console.warn('[academicsService] getSubjects error, fallback to initial:', error.message);
      return { data: INITIAL_SUBJECTS, error };
    }

    const mapped = data.map((s) => ({
      id: s.id,
      code: s.code,
      name: s.name,
      type: s.type,
      credits: s.credits,
      duration: `${(s.duration_minutes / 60).toFixed(1)} Hours`,
      applicableClasses: ['All Cohorts'],
    }));

    return { data: mapped, error: null };
  },

  async createSubject(sub) {
    if (!supabase) throw new Error('Supabase is not configured');

    // Parse duration string e.g. "3.0 Hours" -> 180
    let durationMins = 180;
    if (sub.duration) {
      const match = sub.duration.match(/([\d.]+)/);
      if (match) durationMins = Math.round(parseFloat(match[1]) * 60);
    }

    const payload = {
      code: sub.code.trim().toUpperCase(),
      name: sub.name.trim(),
      duration_minutes: durationMins,
      type: 'Core',
      credits: 3,
    };

    const { data, error } = await supabase
      .from('subjects')
      .insert(payload)
      .select()
      .single();

    if (error) throw error;

    return {
      id: data.id,
      code: data.code,
      name: data.name,
      type: data.type,
      duration: `${(data.duration_minutes / 60).toFixed(1)} Hours`,
      applicableClasses: sub.applicableClasses || ['All Cohorts'],
    };
  },

  async updateSubject(id, sub) {
    if (!supabase) throw new Error('Supabase is not configured');

    let durationMins = 180;
    if (sub.duration) {
      const match = sub.duration.match(/([\d.]+)/);
      if (match) durationMins = Math.round(parseFloat(match[1]) * 60);
    }

    const payload = {
      code: sub.code.trim().toUpperCase(),
      name: sub.name.trim(),
      duration_minutes: durationMins,
    };

    const { data, error } = await supabase
      .from('subjects')
      .update(payload)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    return {
      id: data.id,
      code: data.code,
      name: data.name,
      type: data.type,
      duration: `${(data.duration_minutes / 60).toFixed(1)} Hours`,
      applicableClasses: sub.applicableClasses || ['All Cohorts'],
    };
  },

  async deleteSubject(id) {
    if (!supabase) throw new Error('Supabase is not configured');
    const { error } = await supabase.from('subjects').delete().eq('id', id);
    if (error) throw error;
    return true;
  },

  /**
   * Fetch class-subject curriculum assignments.
   */
  async getAssignments() {
    if (!supabase) return { data: INITIAL_ASSIGNMENTS, error: null };

    const { data, error } = await supabase
      .from('class_subject_assignments')
      .select(`
        id,
        class_id,
        subject_id,
        classes ( id, name, division, academic_year ),
        subjects ( id, code, name )
      `);

    if (error || !data || data.length === 0) {
      if (error) console.warn('[academicsService] getAssignments error, fallback to initial:', error.message);
      return { data: INITIAL_ASSIGNMENTS, error };
    }

    // Group subjects by class
    const classMap = {};
    data.forEach((row) => {
      if (!row.classes || !row.subjects) return;
      const cId = row.classes.id;
      if (!classMap[cId]) {
        classMap[cId] = {
          classId: cId,
          className: `${row.classes.name} (${row.classes.division})`,
          subjectCodes: [],
          totalExaminees: 60,
        };
      }
      classMap[cId].subjectCodes.push(row.subjects.code);
    });

    const result = Object.values(classMap);
    return { data: result.length > 0 ? result : INITIAL_ASSIGNMENTS, error: null };
  },
};

export default academicsService;
