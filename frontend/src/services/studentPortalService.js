import { supabase } from '../lib/supabase';
import {
  STUDENT_PROFILE,
  STUDENT_TIMETABLE_ENTRIES,
  STUDENT_SUBJECTS,
  INITIAL_STUDENT_NOTIFICATIONS,
} from '../data/studentDemoData';
import { INITIAL_TIMETABLE, INITIAL_SUBJECTS } from '../data/adminDemoData';
import {
  parseYearAndDept,
  inferSubjectYear,
  inferSubjectDept,
  cleanSubjectCode,
} from '../utils/academicStructure';

/**
 * Format an email address into a human-readable title-cased name.
 * e.g. "bhushan.avhad@vit.edu.in" -> "Bhushan Avhad"
 */
function nameFromEmail(email) {
  if (!email || !email.includes('@')) return 'Enrolled Student';
  const prefix = email.split('@')[0];
  const cleaned = prefix.replace(/[0-9._-]+/g, ' ').trim();
  if (!cleaned) return 'Enrolled Student';
  return cleaned
    .split(/\s+/)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');
}

export const studentPortalService = {
  /**
   * Get student profile dynamically derived from:
   * 1. Supabase profiles table
   * 2. Active student CSV roster in localStorage
   * 3. Authenticated session email and user metadata
   */
  async getProfile(userId, fallbackEmail = null, userMetadata = null) {
    const rawRoster = localStorage.getItem('examsync_students_roster');
    let storedRoster = [];
    if (rawRoster) {
      try {
        storedRoster = JSON.parse(rawRoster);
      } catch (e) {
        // ignore
      }
    }

    // Try finding a matching student record from the imported roster
    const emailToMatch = (fallbackEmail || '').trim().toLowerCase();
    const matchedRoster = storedRoster.find((s) => {
      if (s.id && userId && s.id === userId) return true;
      if (emailToMatch && s.email && s.email.toLowerCase() === emailToMatch) return true;
      return false;
    });

    let dbProfile = null;
    if (supabase && userId) {
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', userId)
          .maybeSingle();

        if (!error && data) {
          dbProfile = data;
        }
      } catch (err) {
        console.warn('[studentPortalService] Profile fetch notice:', err.message);
      }
    }

    // Derive candidate name dynamically: NEVER use a static hardcoded name!
    const resolvedName =
      dbProfile?.full_name?.trim() ||
      userMetadata?.full_name?.trim() ||
      userMetadata?.name?.trim() ||
      matchedRoster?.name?.trim() ||
      (fallbackEmail ? nameFromEmail(fallbackEmail) : 'Enrolled Student');

    const resolvedEmail =
      dbProfile?.email ||
      matchedRoster?.email ||
      fallbackEmail ||
      'student@vit.edu.in';

    const resolvedClass =
      matchedRoster?.className ||
      userMetadata?.class_name ||
      (userMetadata?.academic_year && userMetadata?.branch
        ? (userMetadata.academic_year === 'FE' ? 'FE' : `${userMetadata.academic_year} ${userMetadata.branch}`)
        : null) ||
      dbProfile?.department ||
      userMetadata?.department ||
      'TE INFT';

    const rawDiv = matchedRoster?.division || userMetadata?.division;
    const resolvedDiv = rawDiv
      ? (rawDiv.startsWith('Div') ? rawDiv : `Division ${rawDiv}`)
      : '';

    const resolvedId =
      matchedRoster?.id ||
      userMetadata?.roll_no ||
      dbProfile?.id ||
      (userId ? `VIT-${userId.slice(0, 8).toUpperCase()}` : 'VIT-2026-001');

    const resolvedPhone =
      dbProfile?.phone ||
      matchedRoster?.phone ||
      '+91 98201 23456';

    const initials = resolvedName
      .split(/\s+/)
      .filter(Boolean)
      .map((part) => part[0])
      .slice(0, 2)
      .join('')
      .toUpperCase() || 'ST';

    return {
      data: {
        id: resolvedId,
        name: resolvedName,
        initials,
        email: resolvedEmail,
        phone: resolvedPhone,
        className: resolvedClass,
        division: resolvedDiv,
        academicYear: '2025–2026',
        term: 'Even Semester 2025–2026',
        department: `Department of ${resolvedClass.includes('CMPN') ? 'Computer' : resolvedClass.includes('INFT') ? 'Information Technology' : resolvedClass.includes('EXTC') ? 'Electronics & Telecommunication' : 'Engineering'}, VIT`,
        advisor: 'Prof. S. R. Kulkarni',
        enrollmentStatus: 'Active / Eligible',
      },
      error: null,
    };
  },

  /**
   * Update student profile in Supabase and local storage
   */
  async updateProfile(userId, updates) {
    if (!updates.name) throw new Error('Name is required');

    // Update in local roster if present
    try {
      const rawRoster = localStorage.getItem('examsync_students_roster');
      if (rawRoster) {
        const roster = JSON.parse(rawRoster);
        const updated = roster.map((s) => {
          if (s.id === userId || (updates.email && s.email?.toLowerCase() === updates.email.toLowerCase())) {
            return { ...s, name: updates.name.trim(), phone: updates.phone || s.phone };
          }
          return s;
        });
        localStorage.setItem('examsync_students_roster', JSON.stringify(updated));
      }
    } catch (e) {
      // ignore
    }

    if (supabase && userId) {
      const payload = {
        full_name: updates.name.trim(),
        phone: updates.phone?.trim() || null,
        updated_at: new Date().toISOString(),
      };

      const { data, error } = await supabase
        .from('profiles')
        .update(payload)
        .eq('id', userId)
        .select()
        .single();

      if (error) throw error;
      return data;
    }

    return updates;
  },

  /**
   * Fetch personalized student exam timetable strictly for enrolled cohort.
   * Reflects newly generated institutional timetable immediately.
   */
  async getStudentTimetable(userId, fallbackEmail = null, userMetadata = null) {
    let studentClass = 'TE INFT';
    let studentYear = 'TE';
    let studentDept = 'INFT';

    try {
      const profileRes = await this.getProfile(userId, fallbackEmail, userMetadata);
      if (profileRes.data?.className) {
        studentClass = profileRes.data.className;
      }
      const parsed = parseYearAndDept(studentClass);
      studentYear = parsed.year;
      studentDept = parsed.department;
    } catch (_) {}

    const matchesCohort = (item) => {
      if (!item) return false;
      const rawCode = item.subjectCode || item.code || '';
      const cleanCode = cleanSubjectCode(rawCode);
      const parsedItem = parseYearAndDept(item.className || item.cohort || '');
      const itemYear = (item.year || parsedItem.year || inferSubjectYear({ ...item, code: cleanCode }) || '').toUpperCase();
      const itemDept = (item.department || parsedItem.department || inferSubjectDept({ ...item, code: cleanCode }) || '').toUpperCase();
      const sYear = (studentYear || '').toUpperCase();
      const sDept = (studentDept || '').toUpperCase();

      // If student is FE
      if (sYear === 'FE') {
        return itemYear === 'FE' || cleanCode.startsWith('FE');
      }

      // If student is NOT FE, exclude FE
      if (itemYear === 'FE' || cleanCode.startsWith('FE')) {
        return false;
      }

      // Year check (SE, TE, BE)
      if (itemYear && sYear && itemYear !== sYear) {
        return false;
      }

      // Department check
      const deptMatches =
        itemDept === sDept ||
        (sDept.includes('INFT') && (itemDept.includes('INFT') || itemDept.includes('IT') || cleanCode.includes('IT'))) ||
        (sDept.includes('CMPN') && (itemDept.includes('CMPN') || itemDept.includes('CP') || itemDept.includes('CS') || cleanCode.includes('CMPN') || cleanCode.includes('CSC'))) ||
        (sDept.includes('EXTC') && (itemDept.includes('EXTC') || itemDept.includes('EX') || cleanCode.includes('EXTC'))) ||
        (sDept.includes('BIOM') && (itemDept.includes('BIOM') || itemDept.includes('BM') || cleanCode.includes('BIOM'))) ||
        (item.className && item.className.toUpperCase().includes(sYear) && item.className.toUpperCase().includes(sDept));

      return deptMatches;
    };

    const daysOfWeek = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

    // 1. Check generated timetable from localStorage so newly generated timetable reflects on student login
    try {
      const activePub = localStorage.getItem('examsync_active_timetable_published');
      const isPublished = activePub ? JSON.parse(activePub).isPublished : true;
      const rawLocal = localStorage.getItem('examsync_timetable_data');

      if (rawLocal) {
        const parsed = JSON.parse(rawLocal);
        if (Array.isArray(parsed) && parsed.length > 0) {
          const matching = parsed.filter(matchesCohort);
          if (matching.length > 0) {
            const mapped = matching.map((t) => {
              const examDateObj = new Date(t.date);
              const dayName = isNaN(examDateObj) ? 'Exam Day' : (daysOfWeek[examDateObj.getDay()] || 'Exam Day');
              const startFmt = t.timeSlot ? t.timeSlot.split('—')[0].trim() : '09:00';
              const endFmt = t.timeSlot ? (t.timeSlot.split('—')[1]?.trim() || '12:00') : '12:00';
              const cleanCode = cleanSubjectCode(t.subjectCode);

              return {
                id: t.id,
                date: t.date,
                day: dayName,
                subjectCode: cleanCode || 'CSC301',
                subjectName: t.subjectName || 'Course Unit',
                startTime: startFmt,
                endTime: endFmt,
                timeSlot: t.timeSlot || `${startFmt} — ${endFmt}`,
                room: t.room || 'A101',
                location: 'Academic Hall / Laboratory',
                duration: t.duration || '3.0 Hours',
                type: 'Core',
                status: isPublished ? 'Published' : (t.status || 'Scheduled'),
                seatNumber: 'Assigned on Entrance',
                isPublished,
                className: t.className || studentClass,
              };
            });

            return { data: mapped, error: null };
          }
        }
      }
    } catch (_) {}

    // 2. Check Supabase if available
    if (supabase && userId) {
      try {
        const { data, error } = await supabase
          .from('exam_timetables')
          .select(`
            id,
            exam_date,
            start_time,
            end_time,
            duration_minutes,
            status,
            is_published,
            subjects ( id, code, name, type ),
            classes ( id, name, division, academic_year ),
            exam_rooms ( id, room_number, location )
          `)
          .eq('is_published', true)
          .order('exam_date', { ascending: true });

        if (!error && data && data.length > 0) {
          const supabaseFiltered = data.filter((t) => {
            const item = {
              subjectCode: t.subjects?.code,
              className: t.classes?.name,
              year: t.classes?.academic_year,
            };
            return matchesCohort(item);
          });

          if (supabaseFiltered.length > 0) {
            const mapped = supabaseFiltered.map((t) => {
              const examDateObj = new Date(t.exam_date);
              const dayName = daysOfWeek[examDateObj.getDay()] || 'Exam Day';
              const startFmt = t.start_time?.slice(0, 5) || '09:00';
              const endFmt = t.end_time?.slice(0, 5) || '12:00';
              const cleanCode = cleanSubjectCode(t.subjects?.code);

              return {
                id: t.id,
                date: t.exam_date,
                day: dayName,
                subjectCode: cleanCode || 'FEC101',
                subjectName: t.subjects?.name || 'Examination Subject',
                startTime: startFmt,
                endTime: endFmt,
                timeSlot: `${startFmt} — ${endFmt}`,
                room: t.exam_rooms?.room_number || 'A101',
                location: t.exam_rooms?.location || 'Block A, 1st Floor',
                duration: `${(t.duration_minutes / 60).toFixed(1)} Hours`,
                type: t.subjects?.type || 'Core',
                status: t.status || 'Published',
                seatNumber: 'Assigned on Entrance',
                isPublished: true,
                className: t.classes?.name || studentClass,
              };
            });

            return { data: mapped, error: null };
          }
        }
      } catch (e) {
        // Fall back below
      }
    }

    // 3. Fallback to INITIAL_TIMETABLE strictly filtered by student's cohort!
    const initialMatches = INITIAL_TIMETABLE.filter(matchesCohort);
    if (initialMatches.length > 0) {
      const fallbackMapped = initialMatches.map((t, idx) => {
        const examDateObj = new Date(t.date);
        const dayName = isNaN(examDateObj) ? 'Exam Day' : (daysOfWeek[examDateObj.getDay()] || 'Exam Day');
        const startFmt = t.timeSlot ? t.timeSlot.split('—')[0].trim() : '09:00';
        const endFmt = t.timeSlot ? (t.timeSlot.split('—')[1]?.trim() || '12:00') : '12:00';
        const cleanCode = cleanSubjectCode(t.subjectCode);

        return {
          id: t.id || `STT-${idx + 1}`,
          date: t.date,
          day: dayName,
          subjectCode: cleanCode || 'FEC101',
          subjectName: t.subjectName || 'Course Unit',
          startTime: startFmt,
          endTime: endFmt,
          timeSlot: t.timeSlot || `${startFmt} — ${endFmt}`,
          room: t.room || 'A101',
          location: 'Academic Hall / Laboratory',
          duration: t.duration || '3.0 Hours',
          type: 'Core',
          status: 'Published',
          seatNumber: 'Assigned on Entrance',
          isPublished: true,
          className: t.className || studentClass,
        };
      });

      return { data: fallbackMapped, error: null };
    }

    return { data: [], error: null };
  },

  /**
   * Fetch registered subjects for this student based on year, branch, and curriculum.
   */
  async getRegisteredSubjects(userId, fallbackEmail = null, userMetadata = null) {
    let studentClass = 'TE INFT';
    let studentYear = 'TE';
    let studentDept = 'INFT';

    try {
      const prof = await this.getProfile(userId, fallbackEmail, userMetadata);
      if (prof.data?.className) studentClass = prof.data.className;
      const parsed = parseYearAndDept(studentClass);
      studentYear = parsed.year;
      studentDept = parsed.department;
    } catch (_) {}

    const matchesCohort = (s) => {
      if (!s) return false;
      const cleanCode = cleanSubjectCode(s.code);
      const itemYear = (s.year || inferSubjectYear({ ...s, code: cleanCode }) || '').toUpperCase();
      const itemDept = (s.department || inferSubjectDept({ ...s, code: cleanCode }) || '').toUpperCase();
      const sYear = (studentYear || '').toUpperCase();
      const sDept = (studentDept || '').toUpperCase();

      if (sYear === 'FE') return itemYear === 'FE' || cleanCode.startsWith('FE');
      if (itemYear === 'FE' || cleanCode.startsWith('FE')) return false;
      if (itemYear && sYear && itemYear !== sYear) return false;

      return (
        itemDept === sDept ||
        (sDept.includes('INFT') && (itemDept.includes('INFT') || itemDept.includes('IT') || cleanCode.includes('IT'))) ||
        (sDept.includes('CMPN') && (itemDept.includes('CMPN') || itemDept.includes('CP') || itemDept.includes('CS') || cleanCode.includes('CMPN'))) ||
        (sDept.includes('EXTC') && (itemDept.includes('EXTC') || itemDept.includes('EX') || cleanCode.includes('EXTC'))) ||
        (sDept.includes('BIOM') && (itemDept.includes('BIOM') || itemDept.includes('BM') || cleanCode.includes('BIOM'))) ||
        (s.applicableClasses && s.applicableClasses.some((ac) => ac.toUpperCase().includes(sYear) && ac.toUpperCase().includes(sDept)))
      );
    };

    // 1. Check local subjects store if available
    try {
      const rawSubjects = localStorage.getItem('examsync_subjects');
      if (rawSubjects) {
        const parsed = JSON.parse(rawSubjects);
        if (Array.isArray(parsed) && parsed.length > 0) {
          const matching = parsed.filter(matchesCohort);
          if (matching.length > 0) {
            const mapped = matching.map((s, idx) => ({
              id: s.id || `SUB-${idx + 1}`,
              code: cleanSubjectCode(s.code),
              name: s.name,
              type: s.type || 'Core Academic Unit',
              credits: s.credits || 3,
              instructor: s.instructor || 'VIT Faculty',
              examDate: 'Scheduled in Session',
              examTime: s.duration || 'Check Timetable',
              venue: 'Assigned Hall',
              seatNumber: 'Desk TBD',
              status: 'Confirmed',
            }));
            return { data: mapped, error: null };
          }
        }
      }
    } catch (_) {}

    // 2. Check Supabase
    if (supabase && userId) {
      try {
        const { data, error } = await supabase
          .from('subjects')
          .select('*')
          .order('code', { ascending: true });

        if (!error && data && data.length > 0) {
          const matching = data.filter(matchesCohort);
          if (matching.length > 0) {
            const mapped = matching.map((s) => ({
              id: s.id,
              code: cleanSubjectCode(s.code),
              name: s.name,
              type: s.type || 'Core Academic Unit',
              credits: s.credits || 3,
              instructor: s.instructor || 'VIT Faculty',
              examDate: 'Scheduled in Session',
              examTime: 'Check Timetable',
              venue: 'Assigned Hall',
              seatNumber: 'Desk TBD',
              status: 'Confirmed',
            }));
            return { data: mapped, error: null };
          }
        }
      } catch (e) {
        // Fall back below
      }
    }

    // 3. Fallback to INITIAL_SUBJECTS strictly matching cohort
    const fallbackSubjects = INITIAL_SUBJECTS.filter(matchesCohort);
    return {
      data: fallbackSubjects.map((s, idx) => ({
        id: s.id || `SUB-${idx + 1}`,
        code: cleanSubjectCode(s.code),
        name: s.name,
        type: s.type || 'Core Academic Unit',
        credits: s.credits || 3,
        instructor: s.instructor || 'VIT Faculty',
        examDate: 'Scheduled in Session',
        examTime: s.duration || 'Check Timetable',
        venue: 'Assigned Hall',
        seatNumber: 'Desk TBD',
        status: 'Confirmed',
      })),
      error: null,
    };
  },

  /**
   * Fetch notifications for this student with dynamic local simulation support.
   */
  async getNotifications(userId) {
    let baseList = INITIAL_STUDENT_NOTIFICATIONS;

    if (supabase && userId) {
      try {
        const { data, error } = await supabase
          .from('student_notifications')
          .select('*')
          .eq('student_id', userId)
          .order('created_at', { ascending: false });

        if (!error && data && data.length > 0) {
          baseList = data.map((n) => ({
            id: n.id,
            title: n.title,
            category: n.category,
            message: n.message,
            time: new Date(n.created_at).toLocaleDateString(),
            urgent: n.urgent,
            read: n.is_read,
          }));
        }
      } catch (e) {
        // ignore
      }
    }

    // Merge dynamic local simulation notifications
    try {
      const rawLocal = localStorage.getItem('examsync_local_notifications');
      if (rawLocal) {
        const localList = JSON.parse(rawLocal);
        if (Array.isArray(localList) && localList.length > 0) {
          const merged = [...localList, ...baseList];
          const seen = new Set();
          return {
            data: merged.filter((item) => {
              const k = `${item.title}-${item.message}`;
              if (seen.has(k)) return false;
              seen.add(k);
              return true;
            }),
            error: null,
          };
        }
      }
    } catch (e) {
      // ignore
    }

    return { data: baseList, error: null };
  },

  /**
   * Mark a notification as read.
   */
  async markNotificationRead(notificationId) {
    if (!supabase) return;
    try {
      await supabase
        .from('student_notifications')
        .update({ is_read: true })
        .eq('id', notificationId);
    } catch (e) {
      // ignore
    }
  },
};

export default studentPortalService;
