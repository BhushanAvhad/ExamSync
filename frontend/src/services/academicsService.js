import { supabase } from '../lib/supabase';
import { INITIAL_CLASSES, INITIAL_SUBJECTS, INITIAL_ASSIGNMENTS } from '../data/adminDemoData';
import {
  parseYearAndDept,
  inferSubjectYear,
  inferSubjectDept,
  cleanSubjectCode,
} from '../utils/academicStructure';

const STORAGE_CLASSES = 'examsync_classes';
const STORAGE_SUBJECTS = 'examsync_subjects';
const STORAGE_ASSIGNMENTS = 'examsync_assignments';
const STORAGE_ROSTER = 'examsync_students_roster';

function getStored(key, initial) {
  try {
    const raw = localStorage.getItem(key);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        if (key === STORAGE_SUBJECTS) {
          return parsed.map((s) => {
            const code = cleanSubjectCode(s.code);
            const initMatch = INITIAL_SUBJECTS.find(
              (init) => cleanSubjectCode(init.code) === code || init.name.toLowerCase() === (s.name || '').toLowerCase()
            );
            const year = s.year || initMatch?.year || inferSubjectYear({ ...s, code });
            const department = s.department || initMatch?.department || inferSubjectDept({ ...s, code });
            const applicableClasses = s.applicableClasses && s.applicableClasses.length > 0 && !s.applicableClasses.includes('All Cohorts')
              ? s.applicableClasses
              : initMatch?.applicableClasses || [year === 'FE' ? 'FE' : `${year} ${department}`];
            return {
              ...s,
              code,
              year,
              department,
              applicableClasses,
            };
          });
        }
        return parsed;
      }
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

/**
 * Reads dynamic students roster to calculate live cohort headcounts.
 */
function getLiveRoster() {
  try {
    const raw = localStorage.getItem(STORAGE_ROSTER);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) return parsed;
    }
  } catch (_) {}
  return [];
}

/**
 * Checks if a student belongs to a given class/cohort.
 */
function studentMatchesClass(student, cls) {
  if (!student || !cls) return false;
  const sClass = (student.className || '').trim().toUpperCase();
  const cName = (cls.name || '').trim().toUpperCase();

  if (sClass === cName) return true;

  const cleanC = cName.replace(/\s*\([A-Z0-9&\s,–-]+\)/i, '').trim();
  const cleanS = sClass.replace(/\s*\([A-Z0-9&\s,–-]+\)/i, '').trim();
  if (cleanC && cleanS && cleanC === cleanS) {
    const cDiv = (cls.division || '').trim().toUpperCase();
    const sDiv = (student.division || '').replace(/^DIV(ISION)?\s*/i, '').trim().toUpperCase();
    if (sDiv && cDiv && sDiv !== cDiv && !['A', 'ALL', ''].includes(cDiv)) {
      return false;
    }
    return true;
  }

  // Also check year and department matching
  const pS = parseYearAndDept(sClass);
  const pC = parseYearAndDept(cName);
  if (pS.year && pC.year && pS.year === pC.year) {
    if (pS.year === 'FE') return true;
    const deptS = pS.department.replace(/[^A-Z]/g, '');
    const deptC = pC.department.replace(/[^A-Z]/g, '');
    const matchesDept =
      deptS === deptC ||
      (deptS.includes('INFT') && (deptC.includes('INFT') || deptC.includes('IT'))) ||
      (deptS.includes('IT') && (deptC.includes('INFT') || deptC.includes('IT'))) ||
      (deptS.includes('CMPN') && (deptC.includes('CMPN') || deptC.includes('CS') || deptC.includes('COMP'))) ||
      (deptS.includes('EXTC') && (deptC.includes('EXTC') || deptC.includes('EX') || deptC.includes('ELEC'))) ||
      (deptS.includes('BIOM') && (deptC.includes('BIOM') || deptC.includes('BM') || deptC.includes('BME')));

    if (matchesDept) {
      const cDiv = (cls.division || '').trim().toUpperCase();
      const sDiv = (student.division || '').replace(/^DIV(ISION)?\s*/i, '').trim().toUpperCase();
      if (sDiv && cDiv && sDiv !== cDiv && !['A', 'ALL', ''].includes(cDiv)) {
        return false;
      }
      return true;
    }
  }

  return false;
}

export const academicsService = {
  /**
   * Fetch classes dynamically enriched with live enrolled student headcounts.
   * Auto-discovers cohorts from registered students.
   */
  async getClasses() {
    let baseClasses = getStored(STORAGE_CLASSES, INITIAL_CLASSES);

    // If Supabase has classes, merge them
    if (supabase) {
      try {
        const { data, error } = await supabase
          .from('classes')
          .select('*')
          .order('name', { ascending: true });

        if (!error && data && data.length > 0) {
          const supabaseMapped = data.map((c) => ({
            id: c.id,
            name: c.name,
            division: c.division || 'A',
            academicYear: c.academic_year || '2025–2026',
            studentCount: 60,
          }));

          // Merge by name & division
          const map = new Map();
          baseClasses.forEach((cls) => map.set(`${cls.name}_${cls.division}`, cls));
          supabaseMapped.forEach((cls) => map.set(`${cls.name}_${cls.division}`, { ...map.get(`${cls.name}_${cls.division}`), ...cls }));
          baseClasses = Array.from(map.values());
        }
      } catch (_) {}
    }

    // Auto-discover any new cohorts from dynamic student registrations
    const roster = getLiveRoster();
    const existingNames = new Set(baseClasses.map((c) => (c.name || '').trim().toUpperCase()));

    roster.forEach((s) => {
      const sName = (s.className || '').trim();
      if (sName && !existingNames.has(sName.toUpperCase())) {
        existingNames.add(sName.toUpperCase());
        baseClasses.push({
          id: `CLS-DYN-${sName.replace(/\s+/g, '-').toUpperCase()}`,
          name: sName,
          division: s.division ? s.division.replace(/^DIV(ISION)?\s*/i, '').trim() : 'A',
          academicYear: '2025–2026',
          studentCount: 60,
        });
      }
    });

    // Dynamically calculate examinee count from actual enrolled students
    const dynamicClasses = baseClasses.map((cls) => {
      const dynamicCount = roster.filter((s) => studentMatchesClass(s, cls)).length;
      return {
        ...cls,
        studentCount: dynamicCount > 0 ? dynamicCount : (Number(cls.studentCount) || 60),
        actualEnrolledCount: dynamicCount,
      };
    });

    saveStored(STORAGE_CLASSES, dynamicClasses);
    return { data: dynamicClasses, error: null };
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

    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('examsync_classes_updated', { detail: { classes: updated } }));
    }

    this.getAssignments().catch(() => {});

    if (supabase) {
      try {
        await supabase.from('classes').insert({
          name: newClass.name,
          division: newClass.division,
          academic_year: newClass.academicYear,
        });
      } catch (_) {}
    }

    return newClass;
  },

  async updateClass(id, cls) {
    const current = getStored(STORAGE_CLASSES, INITIAL_CLASSES);
    const updated = current.map((c) => (c.id === id ? { ...c, ...cls } : c));
    saveStored(STORAGE_CLASSES, updated);

    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('examsync_classes_updated', { detail: { classes: updated } }));
    }

    this.getAssignments().catch(() => {});

    if (supabase) {
      try {
        await supabase
          .from('classes')
          .update({
            name: cls.name.trim(),
            division: cls.division ? cls.division.trim() : 'A',
            academic_year: cls.academicYear ? cls.academicYear.trim() : '2025–2026',
          })
          .eq('id', id);
      } catch (_) {}
    }

    return cls;
  },

  async deleteClass(id) {
    const current = getStored(STORAGE_CLASSES, INITIAL_CLASSES);
    const updated = current.filter((c) => c.id !== id);
    saveStored(STORAGE_CLASSES, updated);

    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('examsync_classes_updated', { detail: { classes: updated } }));
    }

    this.getAssignments().catch(() => {});

    if (supabase) {
      try {
        await supabase.from('classes').delete().eq('id', id);
      } catch (_) {}
    }

    return true;
  },

  /**
   * Fetch subjects enriched with standardized year, department, and clean code.
   */
  async getSubjects() {
    let local = getStored(STORAGE_SUBJECTS, INITIAL_SUBJECTS);

    if (supabase) {
      try {
        const { data, error } = await supabase
          .from('subjects')
          .select('*')
          .order('code', { ascending: true });

        if (!error && data && data.length > 0) {
          const supabaseMapped = data.map((s) => {
            const cleanCode = cleanSubjectCode(s.code);
            const initMatch = INITIAL_SUBJECTS.find(
              (init) => cleanSubjectCode(init.code) === cleanCode || init.name.toLowerCase() === (s.name || '').toLowerCase()
            );
            const year = s.year || initMatch?.year || inferSubjectYear({ ...s, code: cleanCode });
            const department = s.department || initMatch?.department || inferSubjectDept({ ...s, code: cleanCode });
            const applicableClasses = (s.applicable_classes && s.applicable_classes.length > 0)
              ? s.applicable_classes
              : (initMatch?.applicableClasses || [year === 'FE' ? 'FE' : `${year} ${department}`]);

            return {
              id: s.id,
              code: cleanCode,
              name: s.name,
              type: s.type || initMatch?.type || 'Theory',
              credits: s.credits || initMatch?.credits || 3,
              duration: s.duration_minutes ? `${(s.duration_minutes / 60).toFixed(1)} Hours` : (initMatch?.duration || '3.0 Hours'),
              year,
              department,
              applicableClasses,
            };
          });

          // Merge by clean code to preserve any locally created subjects
          const map = new Map();
          local.forEach((s) => map.set(cleanSubjectCode(s.code), s));
          supabaseMapped.forEach((s) => map.set(cleanSubjectCode(s.code), { ...map.get(cleanSubjectCode(s.code)), ...s }));
          local = Array.from(map.values());
        }
      } catch (_) {}
    }

    saveStored(STORAGE_SUBJECTS, local);
    return { data: local, error: null };
  },

  async createSubject(sub) {
    const current = getStored(STORAGE_SUBJECTS, INITIAL_SUBJECTS);
    let durationMins = 180;
    if (sub.duration) {
      const match = sub.duration.match(/([\d.]+)/);
      if (match) durationMins = Math.round(parseFloat(match[1]) * 60);
    }

    const cleanCode = cleanSubjectCode(sub.code).toUpperCase();
    const inferredYear = sub.year || inferSubjectYear({ ...sub, code: cleanCode });
    const inferredDept = sub.department || inferSubjectDept({ ...sub, code: cleanCode });
    const formattedClasses = Array.isArray(sub.applicableClasses)
      ? sub.applicableClasses
      : typeof sub.applicableClasses === 'string'
      ? sub.applicableClasses.split(',').map((c) => c.trim()).filter(Boolean)
      : [inferredYear === 'FE' ? 'FE' : `${inferredYear} ${inferredDept}`];

    const newSub = {
      id: sub.id || `SUB-${cleanCode}-${Date.now().toString().slice(-4)}`,
      code: cleanCode,
      name: sub.name.trim(),
      type: sub.type || 'Theory',
      duration: sub.duration || `${(durationMins / 60).toFixed(1)} Hours`,
      year: inferredYear,
      department: inferredDept,
      applicableClasses: formattedClasses,
      credits: Number(sub.credits) || 3,
    };

    const updated = [...current.filter((s) => cleanSubjectCode(s.code) !== cleanCode), newSub];
    saveStored(STORAGE_SUBJECTS, updated);

    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('examsync_subjects_updated', { detail: { subjects: updated } }));
    }

    this.getAssignments().catch(() => {});

    if (supabase) {
      try {
        await supabase.from('subjects').insert({
          code: newSub.code,
          name: newSub.name,
          duration_minutes: durationMins,
          type: newSub.type,
          credits: newSub.credits,
        });
      } catch (_) {}
    }

    return newSub;
  },

  async updateSubject(id, sub) {
    const current = getStored(STORAGE_SUBJECTS, INITIAL_SUBJECTS);
    const cleanCode = cleanSubjectCode(sub.code).toUpperCase();
    const inferredYear = sub.year || inferSubjectYear({ ...sub, code: cleanCode });
    const inferredDept = sub.department || inferSubjectDept({ ...sub, code: cleanCode });
    const formattedClasses = Array.isArray(sub.applicableClasses)
      ? sub.applicableClasses
      : typeof sub.applicableClasses === 'string'
      ? sub.applicableClasses.split(',').map((c) => c.trim()).filter(Boolean)
      : [inferredYear === 'FE' ? 'FE' : `${inferredYear} ${inferredDept}`];

    const updatedObj = {
      ...sub,
      code: cleanCode,
      name: sub.name.trim(),
      year: inferredYear,
      department: inferredDept,
      applicableClasses: formattedClasses,
    };

    const updated = current.map((s) => (s.id === id ? { ...s, ...updatedObj } : s));
    saveStored(STORAGE_SUBJECTS, updated);

    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('examsync_subjects_updated', { detail: { subjects: updated } }));
    }

    this.getAssignments().catch(() => {});

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
            code: cleanCode,
            name: updatedObj.name,
            duration_minutes: durationMins,
          })
          .eq('id', id);
      } catch (_) {}
    }

    return updatedObj;
  },

  async deleteSubject(id) {
    const current = getStored(STORAGE_SUBJECTS, INITIAL_SUBJECTS);
    const updated = current.filter((s) => s.id !== id);
    saveStored(STORAGE_SUBJECTS, updated);

    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('examsync_subjects_updated', { detail: { subjects: updated } }));
    }

    this.getAssignments().catch(() => {});

    if (supabase) {
      try {
        await supabase.from('subjects').delete().eq('id', id);
      } catch (_) {}
    }

    return true;
  },

  /**
   * Fetch curriculum assignments dynamically linked to active classes and subjects.
   */
  async getAssignments() {
    const [clsRes, subRes] = await Promise.all([
      this.getClasses(),
      this.getSubjects(),
    ]);

    const activeClasses = clsRes.data || [];
    const activeSubjects = subRes.data || [];

    // Dynamically generate class-subject matrix
    const dynamicAssignments = activeClasses.map((cls) => {
      const cName = (cls.name || '').trim().toUpperCase();
      const parsedCls = parseYearAndDept(cls.name || '');

      const matchingSubjects = activeSubjects.filter((sub) => {
        const sYear = (sub.year || inferSubjectYear(sub) || '').toUpperCase();
        const sDept = (sub.department || inferSubjectDept(sub) || '').toUpperCase();

        // Check explicit applicableClasses array
        if (Array.isArray(sub.applicableClasses) && sub.applicableClasses.length > 0) {
          const directMatch = sub.applicableClasses.some((ac) => {
            const cleanAc = ac.replace(/\s*\([A-Z0-9&\s,–-]+\)/i, '').trim().toUpperCase();
            return cleanAc === cName || cName.includes(cleanAc);
          });
          if (directMatch) return true;
        }

        // Match by Year and Department
        if (parsedCls.year === 'FE') {
          return sYear === 'FE';
        }
        return sYear === parsedCls.year && (sDept === parsedCls.department || parsedCls.department.includes(sDept));
      });

      return {
        classId: cls.id,
        className: cls.name,
        subjectCodes: matchingSubjects.map((s) => s.code),
        totalExaminees: cls.studentCount || 60,
      };
    });

    saveStored(STORAGE_ASSIGNMENTS, dynamicAssignments);

    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('examsync_assignments_updated', { detail: { assignments: dynamicAssignments } }));
    }

    return { data: dynamicAssignments, error: null };
  },
};

export default academicsService;
