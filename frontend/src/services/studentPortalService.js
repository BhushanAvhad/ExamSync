import { supabase } from '../lib/supabase';
import {
  STUDENT_PROFILE,
  STUDENT_TIMETABLE_ENTRIES,
  STUDENT_SUBJECTS,
  INITIAL_STUDENT_NOTIFICATIONS,
} from '../data/studentDemoData';
import { INITIAL_TIMETABLE } from '../data/adminDemoData';

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
      userMetadata?.department ||
      dbProfile?.department ||
      'TE CMPN';

    const resolvedDiv =
      matchedRoster?.division
        ? (matchedRoster.division.startsWith('Div') ? matchedRoster.division : `Division ${matchedRoster.division}`)
        : userMetadata?.division
        ? (userMetadata.division.startsWith('Div') ? userMetadata.division : `Division ${userMetadata.division}`)
        : 'Division A';

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
   * Fetch personalized student exam timetable for enrolled subjects.
   */
  async getStudentTimetable(userId, fallbackEmail = null) {
    // 1. Try Supabase first if available
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
            exam_rooms ( id, room_number, location )
          `)
          .eq('is_published', true)
          .order('exam_date', { ascending: true });

        if (!error && data && data.length > 0) {
          const daysOfWeek = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
          const mapped = data.map((t) => {
            const examDateObj = new Date(t.exam_date);
            const dayName = daysOfWeek[examDateObj.getDay()] || 'Exam Day';
            const startFmt = t.start_time?.slice(0, 5) || '09:00';
            const endFmt = t.end_time?.slice(0, 5) || '12:00';

            return {
              id: t.id,
              date: t.exam_date,
              day: dayName,
              subjectCode: t.subjects?.code || 'FEC101',
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
            };
          });

          return { data: mapped, error: null };
        }
      } catch (e) {
        // Fall back to local preview
      }
    }

    // 2. Check local preview published session data
    try {
      const activePub = localStorage.getItem('examsync_active_timetable_published');
      const isPublished = activePub ? JSON.parse(activePub).isPublished : false;
      const rawLocal = localStorage.getItem('examsync_timetable_data');

      if (rawLocal) {
        const parsed = JSON.parse(rawLocal);
        if (Array.isArray(parsed) && parsed.length > 0) {
          // Resolve student class to personalize the timetable if possible
          let targetClass = 'TE CMPN';
          try {
            const profileRes = await this.getProfile(userId, fallbackEmail);
            if (profileRes.data?.className) {
              targetClass = profileRes.data.className;
            }
          } catch (_) {}

          // Filter for student's class if cohort tagging exists
          const matchingCohort = parsed.filter((t) => {
            if (!t.className) return true;
            return t.className.includes(targetClass) || targetClass.includes(t.className);
          });

          const pool = matchingCohort.length > 0 ? matchingCohort : parsed;
          const daysOfWeek = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
          const mapped = pool.map((t) => {
            const examDateObj = new Date(t.date);
            const dayName = isNaN(examDateObj) ? 'Exam Day' : (daysOfWeek[examDateObj.getDay()] || 'Exam Day');
            const startFmt = t.timeSlot ? t.timeSlot.split('—')[0].trim() : '09:00';
            const endFmt = t.timeSlot ? (t.timeSlot.split('—')[1]?.trim() || '12:00') : '12:00';

            return {
              id: t.id,
              date: t.date,
              day: dayName,
              subjectCode: t.subjectCode || 'CSC301',
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
            };
          });

          if (mapped.length > 0) {
            return { data: mapped, error: null };
          }
        }
      }

      // Fallback to INITIAL_TIMETABLE filtered by student's class
      let targetClass = 'TE CMPN';
      try {
        const profileRes = await this.getProfile(userId, fallbackEmail);
        if (profileRes.data?.className) {
          targetClass = profileRes.data.className;
        }
      } catch (_) {}

      const initialMatches = INITIAL_TIMETABLE.filter((t) => {
        if (!t.className) return true;
        return t.className.toLowerCase().includes(targetClass.toLowerCase()) ||
               targetClass.toLowerCase().includes(t.className.toLowerCase());
      });

      const fallbackPool = initialMatches.length > 0 ? initialMatches : INITIAL_TIMETABLE;
      const daysOfWeek = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
      const fallbackMapped = fallbackPool.map((t, idx) => {
        const examDateObj = new Date(t.date);
        const dayName = isNaN(examDateObj) ? 'Exam Day' : (daysOfWeek[examDateObj.getDay()] || 'Exam Day');
        const startFmt = t.timeSlot ? t.timeSlot.split('—')[0].trim() : '09:00';
        const endFmt = t.timeSlot ? (t.timeSlot.split('—')[1]?.trim() || '12:00') : '12:00';

        return {
          id: t.id || `STT-${idx + 1}`,
          date: t.date,
          day: dayName,
          subjectCode: t.subjectCode || 'FEC101',
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
        };
      });

      return {
        data: fallbackMapped,
        error: null,
      };
    } catch (err) {
      // ignore
    }

    return { data: STUDENT_TIMETABLE_ENTRIES, error: null };
  },

  /**
   * Fetch registered subjects for this student based on year, branch, and timetable.
   */
  async getRegisteredSubjects(userId, fallbackEmail = null) {
    let resolvedClass = 'TE CMPN';
    try {
      const prof = await this.getProfile(userId, fallbackEmail);
      if (prof.data?.className) resolvedClass = prof.data.className;
    } catch (_) {}

    // 1. Check local subjects store if available
    try {
      const rawSubjects = localStorage.getItem('examsync_subjects');
      if (rawSubjects) {
        const parsed = JSON.parse(rawSubjects);
        if (Array.isArray(parsed) && parsed.length > 0) {
          const matching = parsed.filter((s) => {
            if (!s.applicableClasses || s.applicableClasses.length === 0) return true;
            return s.applicableClasses.some((ac) => ac.includes(resolvedClass) || resolvedClass.includes(ac.replace(/\s*\([A-Z]\)/, '').trim()));
          });

          const pool = matching.length > 0 ? matching : parsed;
          const mapped = pool.map((s, idx) => ({
            id: s.id || `SUB-${idx + 1}`,
            code: s.code,
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
    } catch (_) {}

    if (supabase && userId) {
      try {
        const { data, error } = await supabase
          .from('subjects')
          .select('*')
          .order('code', { ascending: true });

        if (!error && data && data.length > 0) {
          const mapped = data.map((s) => ({
            id: s.id,
            code: s.code,
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
      } catch (e) {
        // Fall back below
      }
    }

    return { data: STUDENT_SUBJECTS, error: null };
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
