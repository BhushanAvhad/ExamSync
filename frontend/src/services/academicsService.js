import { supabase } from '../lib/supabase';
import { INITIAL_CLASSES, INITIAL_SUBJECTS, INITIAL_ASSIGNMENTS } from '../data/adminDemoData';

const STORAGE_CLASSES = 'examsync_classes';
const STORAGE_SUBJECTS = 'examsync_subjects';
const STORAGE_ASSIGNMENTS = 'examsync_assignments';

function getStored(key, initial) {
  try {
    const raw = localStorage.getItem(key);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
    localStorage.setItem(key, JSON.stringify(initial));
  } catch (e) {
    // ignore
  }
  return [...initial];
}

function saveStored(key, list) {
  try {
    localStorage.setItem(key, JSON.stringify(list));
  } catch (e) {
    // ignore
  }
}

export const academicsService = {
  /**
   * Fetch classes from Supabase with fallback to persistent storage.
   */
  async getClasses() {
    const local = getStored(STORAGE_CLASSES, INITIAL_CLASSES);
    if (!supabase) return { data: local, error: null };

    try {
      const { data, error } = await supabase
        .from('classes')
        .select('*')
        .order('name', { ascending: true });

      if (error || !data || data.length === 0) {
        return { data: local, error: null };
      }

      const mapped = data.map((c) => ({
        id: c.id,
        name: c.name,
        division: c.division,
        academicYear: c.academic_year,
        studentCount: 68,
      }));

      saveStored(STORAGE_CLASSES, mapped);
      return { data: mapped, error: null };
    } catch (e) {
      return { data: local, error: null };
    }
  },

  async createClass(cls) {
    const current = getStored(STORAGE_CLASSES, INITIAL_CLASSES);
    const newClass = {
      id: cls.id || `CLS-${String(current.length + 1).padStart(2, '0')}`,
      name: cls.name.trim(),
      division: cls.division ? cls.division.trim() : 'A',
      academicYear: cls.academicYear ? cls.academicYear.trim() : '2025–2026',
      studentCount: Number(cls.studentCount) || 60,
    };

    const updated = [...current, newClass];
    saveStored(STORAGE_CLASSES, updated);

    if (supabase) {
      try {
        await supabase.from('classes').insert({
          name: newClass.name,
          division: newClass.division,
          academic_year: newClass.academicYear,
        });
      } catch (e) {
        // ignore
      }
    }

    return newClass;
  },

  async updateClass(id, cls) {
    const current = getStored(STORAGE_CLASSES, INITIAL_CLASSES);
    const updated = current.map((c) => (c.id === id ? { ...c, ...cls } : c));
    saveStored(STORAGE_CLASSES, updated);

    if (supabase) {
      try {
        await supabase
          .from('classes')
          .update({
            name: cls.name.trim(),
            division: cls.division.trim(),
            academic_year: cls.academicYear.trim(),
          })
          .eq('id', id);
      } catch (e) {
        // ignore
      }
    }

    return cls;
  },

  async deleteClass(id) {
    const current = getStored(STORAGE_CLASSES, INITIAL_CLASSES);
    const updated = current.filter((c) => c.id !== id);
    saveStored(STORAGE_CLASSES, updated);

    if (supabase) {
      try {
        await supabase.from('classes').delete().eq('id', id);
      } catch (e) {
        // ignore
      }
    }

    return true;
  },

  /**
   * Fetch subjects with fallback to persistent storage.
   */
  async getSubjects() {
    const local = getStored(STORAGE_SUBJECTS, INITIAL_SUBJECTS);
    if (!supabase) return { data: local, error: null };

    try {
      const { data, error } = await supabase
        .from('subjects')
        .select('*')
        .order('code', { ascending: true });

      if (error || !data || data.length === 0) {
        return { data: local, error: null };
      }

      const mapped = data.map((s) => ({
        id: s.id,
        code: s.code,
        name: s.name,
        type: s.type || 'Core',
        credits: s.credits || 3,
        duration: `${(s.duration_minutes / 60).toFixed(1)} Hours`,
        applicableClasses: ['All Cohorts'],
      }));

      saveStored(STORAGE_SUBJECTS, mapped);
      return { data: mapped, error: null };
    } catch (e) {
      return { data: local, error: null };
    }
  },

  async createSubject(sub) {
    const current = getStored(STORAGE_SUBJECTS, INITIAL_SUBJECTS);
    let durationMins = 180;
    if (sub.duration) {
      const match = sub.duration.match(/([\d.]+)/);
      if (match) durationMins = Math.round(parseFloat(match[1]) * 60);
    }

    const newSub = {
      id: sub.id || `SUB-${String(current.length + 1).padStart(2, '0')}`,
      code: sub.code.trim().toUpperCase(),
      name: sub.name.trim(),
      type: 'Core',
      duration: `${(durationMins / 60).toFixed(1)} Hours`,
      applicableClasses: sub.applicableClasses || ['All Cohorts'],
    };

    const updated = [...current, newSub];
    saveStored(STORAGE_SUBJECTS, updated);

    if (supabase) {
      try {
        await supabase.from('subjects').insert({
          code: newSub.code,
          name: newSub.name,
          duration_minutes: durationMins,
          type: 'Core',
          credits: 3,
        });
      } catch (e) {
        // ignore
      }
    }

    return newSub;
  },

  async updateSubject(id, sub) {
    const current = getStored(STORAGE_SUBJECTS, INITIAL_SUBJECTS);
    const updated = current.map((s) => (s.id === id ? { ...s, ...sub } : s));
    saveStored(STORAGE_SUBJECTS, updated);

    let durationMins = 180;
    if (sub.duration) {
      const match = sub.duration.match(/([\d.]+)/);
      if (match) durationMins = Math.round(parseFloat(match[1]) * 60);
    }

    if (supabase) {
      try {
        await supabase
          .from('subjects')
          .update({
            code: sub.code.trim().toUpperCase(),
            name: sub.name.trim(),
            duration_minutes: durationMins,
          })
          .eq('id', id);
      } catch (e) {
        // ignore
      }
    }

    return sub;
  },

  async deleteSubject(id) {
    const current = getStored(STORAGE_SUBJECTS, INITIAL_SUBJECTS);
    const updated = current.filter((s) => s.id !== id);
    saveStored(STORAGE_SUBJECTS, updated);

    if (supabase) {
      try {
        await supabase.from('subjects').delete().eq('id', id);
      } catch (e) {
        // ignore
      }
    }

    return true;
  },

  /**
   * Fetch curriculum assignments.
   */
  async getAssignments() {
    const local = getStored(STORAGE_ASSIGNMENTS, INITIAL_ASSIGNMENTS);
    if (!supabase) return { data: local, error: null };

    try {
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
        return { data: local, error: null };
      }

      const classMap = {};
      data.forEach((row) => {
        if (!row.classes || !row.subjects) return;
        const cId = row.classes.id;
        if (!classMap[cId]) {
          classMap[cId] = {
            classId: cId,
            className: `${row.classes.name} (${row.classes.division})`,
            subjectCodes: [],
            totalExaminees: 68,
          };
        }
        classMap[cId].subjectCodes.push(row.subjects.code);
      });

      const result = Object.values(classMap);
      return { data: result.length > 0 ? result : local, error: null };
    } catch (e) {
      return { data: local, error: null };
    }
  },
};

export default academicsService;
