import { supabase } from '../lib/supabase';
import { INITIAL_STUDENTS } from '../data/adminDemoData';

const STORAGE_KEY = 'examsync_students_roster';
const ACTIVITIES_KEY = 'examsync_recent_activities';

/**
 * Generate standardized short roll number / registration identifier
 * Format: 26FE01, 25CP02, 25IT01, 24EX01, 23CP01
 */
export function generateShortRollNo(className = 'FE', existingRoster = [], indexOffset = 0) {
  const cls = (className || 'FE').toUpperCase();
  const deptCode = cls.includes('CMPN') ? 'CP' : cls.includes('INFT') ? 'IT' : cls.includes('EXTC') ? 'EX' : cls.includes('BIOM') ? 'BM' : 'FE';
  const yrCode = cls.startsWith('FE') ? '26' : cls.startsWith('SE') ? '25' : cls.startsWith('TE') ? '24' : '23';
  const prefix = `${yrCode}${deptCode}`;

  const matching = (existingRoster || []).filter((s) => {
    const id = s.rollNo || s.id || '';
    return id.startsWith(prefix);
  });

  const nextSeq = matching.length + 1 + indexOffset;
  return `${prefix}${String(nextSeq).padStart(2, '0')}`;
}

function normalizeRoster(list) {
  if (!Array.isArray(list)) return [];
  return list.map((s, idx) => {
    let roll = s.rollNo || s.id;
    if (!roll || roll.startsWith('STU-') || roll.length > 8) {
      roll = generateShortRollNo(s.className || 'FE', list.slice(0, idx), 0);
    }
    return {
      ...s,
      id: roll,
      rollNo: roll,
    };
  });
}

/**
 * Helper to get roster from localStorage with fallback to INITIAL_STUDENTS
 */
function getStoredRoster() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        const hasLegacy = parsed.some(
          (s) => (s.id && s.id.startsWith('STU-')) || (s.rollNo && s.rollNo.startsWith('STU-')) || (s.id && s.id.length > 8)
        );
        if (hasLegacy) {
          const normalized = normalizeRoster(parsed);
          localStorage.setItem(STORAGE_KEY, JSON.stringify(normalized));
          return normalized;
        }
        return parsed;
      }
    }
  } catch (e) {
    console.warn('[studentsService] Failed to read from localStorage:', e);
  }
  // Initialize with verified VIT students and persist
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_STUDENTS));
  } catch (e) {
    // ignore
  }
  return [...INITIAL_STUDENTS];
}

/**
 * Helper to save roster to localStorage and dispatch update event
 */
function saveRoster(list) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
    window.dispatchEvent(
      new CustomEvent('examsync_students_updated', {
        detail: { count: list.length, roster: list },
      })
    );
  } catch (e) {
    console.warn('[studentsService] Failed to save to localStorage:', e);
  }
}

/**
 * Helper to record activity log
 */
function logActivity(action, detail) {
  try {
    const raw = localStorage.getItem(ACTIVITIES_KEY);
    const list = raw ? JSON.parse(raw) : [];
    const newEntry = {
      id: `ACT-${Date.now()}`,
      action,
      detail,
      time: 'Just now',
    };
    const updated = [newEntry, ...list.slice(0, 19)];
    localStorage.setItem(ACTIVITIES_KEY, JSON.stringify(updated));
    window.dispatchEvent(
      new CustomEvent('examsync_activity_logged', { detail: newEntry })
    );
  } catch (e) {
    // ignore
  }
}

export const studentsService = {
  /**
   * Fetch all active students.
   * Checks Supabase first; if empty or errors, falls back to persistent localStorage roster.
   */
  async getStudents() {
    const localRoster = getStoredRoster();

    if (!supabase) {
      return { data: localRoster, error: null };
    }

    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('role', 'student')
        .order('created_at', { ascending: false });

      if (error || !data || data.length === 0) {
        // Return local roster if Supabase returned no students
        return { data: localRoster, error: null };
      }

      // Map Supabase profile rows to UI format
      const mapped = data.map((p, idx) => ({
        id: p.id,
        name: p.full_name || 'Student Candidate',
        email: p.email,
        className: p.department || 'TE CMPN',
        division: 'A',
        status: 'Active',
        phone: p.phone || '+91 98201 23456',
      }));

      // Merge any locally imported students that may not be in Supabase yet
      const combined = [...mapped];
      for (const localStu of localRoster) {
        if (!combined.some((s) => s.email?.toLowerCase() === localStu.email?.toLowerCase())) {
          combined.push(localStu);
        }
      }

      saveRoster(combined);
      return { data: combined, error: null };
    } catch (err) {
      console.warn('[studentsService] getStudents error, returning local roster:', err);
      return { data: localRoster, error: null };
    }
  },

  /**
   * Add a single new student
   */
  async addStudent(studentData) {
    const current = getStoredRoster();
    const roll = studentData.rollNo || studentData.id || generateShortRollNo(studentData.className, current);
    const newStudent = {
      id: roll,
      rollNo: roll,
      name: studentData.name.trim(),
      email: studentData.email.trim().toLowerCase(),
      className: studentData.className || 'FE',
      division: studentData.division || 'A',
      phone: studentData.phone || '',
      status: studentData.status || 'Active',
    };

    const updated = [newStudent, ...current.filter((s) => s.email.toLowerCase() !== newStudent.email.toLowerCase())];
    saveRoster(updated);
    logActivity('Student Enrolled', `${newStudent.name} added to ${newStudent.className} (${newStudent.division})`);

    // Best effort Supabase write
    if (supabase) {
      try {
        await supabase.from('profiles').upsert([
          {
            full_name: newStudent.name,
            email: newStudent.email,
            role: 'student',
            department: newStudent.className,
            phone: newStudent.phone || null,
          },
        ], { onConflict: 'email' });
      } catch (e) {
        // ignore
      }
    }

    return newStudent;
  },

  /**
   * Update an existing student record
   */
  async updateStudent(id, studentData) {
    const current = getStoredRoster();
    const updated = current.map((s) => {
      if (s.id === id) {
        return {
          ...s,
          name: studentData.name.trim(),
          email: studentData.email.trim().toLowerCase(),
          className: studentData.className || s.className,
          division: studentData.division || s.division,
          phone: studentData.phone !== undefined ? studentData.phone : s.phone,
          status: studentData.status || s.status,
        };
      }
      return s;
    });

    saveRoster(updated);
    logActivity('Student Updated', `Updated details for ${studentData.name}`);

    if (supabase) {
      try {
        await supabase
          .from('profiles')
          .update({
            full_name: studentData.name.trim(),
            department: studentData.className,
            phone: studentData.phone || null,
          })
          .eq('id', id);
      } catch (e) {
        // ignore
      }
    }

    const modified = updated.find((s) => s.id === id);
    return modified || studentData;
  },

  /**
   * Bulk import students from CSV rows
   */
  async bulkCreateStudents(studentsList) {
    if (!studentsList || studentsList.length === 0) return { data: [], error: null };

    const current = getStoredRoster();
    const normalizedNew = studentsList.map((s, idx) => {
      const roll = s.rollNo || s.id || generateShortRollNo(s.className || 'FE', current, idx);
      return {
        id: roll,
        rollNo: roll,
        name: s.name.trim(),
        email: s.email.trim().toLowerCase(),
        className: s.className || 'FE',
        division: s.division || 'A',
        phone: s.phone || '',
        status: s.status || 'Active',
      };
    });

    // Merge without duplicates by email
    const emailMap = new Map();
    // First put existing
    for (const stu of current) {
      emailMap.set(stu.email.toLowerCase(), stu);
    }
    // Upsert newly imported
    for (const stu of normalizedNew) {
      emailMap.set(stu.email.toLowerCase(), stu);
    }

    const mergedList = Array.from(emailMap.values());
    saveRoster(mergedList);

    logActivity(
      'CSV Roster Imported',
      `Imported ${normalizedNew.length} student records into active database`
    );

    // Best-effort Supabase sync
    if (supabase) {
      try {
        const rows = normalizedNew.map((s) => ({
          full_name: s.name,
          email: s.email,
          role: 'student',
          department: s.className,
          phone: s.phone || null,
        }));
        await supabase.from('profiles').upsert(rows, { onConflict: 'email' });
      } catch (err) {
        console.warn('[studentsService] Supabase sync notice:', err.message);
      }
    }

    return { data: mergedList, error: null };
  },

  /**
   * Delete student record by ID
   */
  async deleteStudent(id) {
    const current = getStoredRoster();
    const removed = current.find((s) => s.id === id);
    const updated = current.filter((s) => s.id !== id);
    saveRoster(updated);

    if (removed) {
      logActivity('Student Removed', `Removed record for ${removed.name}`);
    }

    if (supabase) {
      try {
        await supabase.from('profiles').delete().eq('id', id);
      } catch (e) {
        // ignore
      }
    }

    return true;
  },

  /**
   * Reset roster back to verified VIT defaults (useful for testing/demo reset)
   */
  resetToVITDefaults() {
    saveRoster(INITIAL_STUDENTS);
    logActivity('Roster Reset', 'Student roster restored to verified VIT baseline');
    return INITIAL_STUDENTS;
  },
};

export default studentsService;
