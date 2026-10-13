import { supabase } from '../lib/supabase';
import {
  STUDENT_PROFILE,
  STUDENT_TIMETABLE_ENTRIES,
  STUDENT_SUBJECTS,
  INITIAL_STUDENT_NOTIFICATIONS,
} from '../data/studentDemoData';

export const studentPortalService = {
  /**
   * Get student profile, merging Supabase profile with sensible fallbacks.
   */
  async getProfile(userId, fallbackEmail = null) {
    if (!supabase || !userId) return { data: STUDENT_PROFILE, error: null };

    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .maybeSingle();

    if (error || !data) {
      if (error) console.warn('[studentPortalService] getProfile error:', error.message);
      return { data: STUDENT_PROFILE, error };
    }

    const name = data.full_name || fallbackEmail?.split('@')[0] || 'Student';
    const initials = name
      .split(' ')
      .map((part) => part[0])
      .join('')
      .slice(0, 2)
      .toUpperCase();

    return {
      data: {
        id: data.id,
        name,
        initials,
        email: data.email,
        phone: data.phone || '+1 (555) 234-8901',
        className: data.department || 'CS-Year 3',
        division: 'Division A',
        academicYear: '2025–2026',
        term: 'Spring 2026',
        department: data.department || 'Faculty of Computing & Information Systems',
        advisor: 'Dr. Eleanor Vance',
        enrollmentStatus: 'Active / Eligible',
      },
      error: null,
    };
  },

  /**
   * Update student profile in Supabase.
   */
  async updateProfile(userId, updates) {
    if (!supabase || !userId) throw new Error('Supabase is not configured or user is missing');

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
  },

  /**
   * Fetch personalized student exam timetable for enrolled subjects.
   */
  async getStudentTimetable(userId) {
    if (!supabase || !userId) return { data: STUDENT_TIMETABLE_ENTRIES, error: null };

    // Query published exam timetables
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

    if (error || !data || data.length === 0) {
      if (error) console.warn('[studentPortalService] getStudentTimetable error:', error.message);
      return { data: STUDENT_TIMETABLE_ENTRIES, error };
    }

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
        subjectCode: t.subjects?.code || 'CS-101',
        subjectName: t.subjects?.name || 'Examination Subject',
        startTime: startFmt,
        endTime: endFmt,
        timeSlot: `${startFmt} — ${endFmt}`,
        room: t.exam_rooms?.room_number || 'Exam Hall',
        location: t.exam_rooms?.location || 'Campus Center',
        duration: `${(t.duration_minutes / 60).toFixed(1)} Hours`,
        type: t.subjects?.type || 'Core',
        status: t.status,
        seatNumber: 'Assigned on Entrance',
      };
    });

    return { data: mapped, error: null };
  },

  /**
   * Fetch registered subjects for this student.
   */
  async getRegisteredSubjects(userId) {
    if (!supabase || !userId) return { data: STUDENT_SUBJECTS, error: null };

    const { data, error } = await supabase
      .from('subjects')
      .select('*')
      .order('code', { ascending: true });

    if (error || !data || data.length === 0) {
      if (error) console.warn('[studentPortalService] getRegisteredSubjects error:', error.message);
      return { data: STUDENT_SUBJECTS, error };
    }

    const mapped = data.map((s) => ({
      id: s.id,
      code: s.code,
      name: s.name,
      type: s.type || 'Core Academic Unit',
      credits: s.credits || 3,
      instructor: s.instructor || 'Faculty Member',
      examDate: 'Scheduled in Session',
      examTime: 'Check Timetable',
      venue: 'Assigned Hall',
      seatNumber: 'Desk TBD',
      status: 'Confirmed',
    }));

    return { data: mapped, error: null };
  },

  /**
   * Fetch notifications for this student.
   */
  async getNotifications(userId) {
    if (!supabase || !userId) return { data: INITIAL_STUDENT_NOTIFICATIONS, error: null };

    const { data, error } = await supabase
      .from('student_notifications')
      .select('*')
      .eq('student_id', userId)
      .order('created_at', { ascending: false });

    if (error || !data || data.length === 0) {
      if (error) console.warn('[studentPortalService] getNotifications error:', error.message);
      return { data: INITIAL_STUDENT_NOTIFICATIONS, error };
    }

    const mapped = data.map((n) => ({
      id: n.id,
      title: n.title,
      category: n.category,
      message: n.message,
      time: new Date(n.created_at).toLocaleDateString(),
      urgent: n.urgent,
      read: n.is_read,
    }));

    return { data: mapped, error: null };
  },

  /**
   * Mark a notification as read.
   */
  async markNotificationRead(notificationId) {
    if (!supabase) return;
    await supabase
      .from('student_notifications')
      .update({ is_read: true })
      .eq('id', notificationId);
  },
};

export default studentPortalService;
