import { supabase } from '../lib/supabase';
import { INITIAL_TIMETABLE } from '../data/adminDemoData';

export const timetablesService = {
  async getTimetables(sessionId = null) {
    let resultData = INITIAL_TIMETABLE;
    let queryError = null;

    if (supabase) {
      try {
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
        if (!error && data && data.length > 0) {
          resultData = data.map((row) => ({
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
        }
      } catch (err) {
        queryError = err;
      }
    }

    // Check local preview session override data
    try {
      const sessionKey = sessionId || 'default';
      const localCustom = localStorage.getItem(`examsync_timetable_data_${sessionKey}`) || localStorage.getItem('examsync_timetable_data');
      if (localCustom) {
        const parsed = JSON.parse(localCustom);
        if (Array.isArray(parsed) && parsed.length > 0) {
          resultData = parsed;
        }
      } else {
        // Check if published state is active
        const pubState = localStorage.getItem(`examsync_session_published_${sessionKey}`) || localStorage.getItem('examsync_active_timetable_published');
        if (pubState && JSON.parse(pubState).isPublished) {
          resultData = resultData.map((e) => ({
            ...e,
            status: 'Published',
            isPublished: true,
          }));
        }
      }
    } catch (e) {
      // ignore
    }

    return { data: resultData, error: queryError };
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
    let dbSuccess = false;

    if (supabase) {
      try {
        let query = supabase
          .from('exam_timetables')
          .update({ is_published: isPublished });

        if (sessionId) {
          query = query.eq('exam_session_id', sessionId);
        }

        const { data, error } = await query;
        if (!error) {
          dbSuccess = true;
          if (isPublished) {
            try {
              const { data: students } = await supabase
                .from('profiles')
                .select('id')
                .eq('role', 'student');

              if (students && students.length > 0) {
                const notifications = students.map((s) => ({
                  student_id: s.id,
                  title: 'Official Timetable Published',
                  category: 'Examinations',
                  message: 'Final examination schedule and room allocations are now officially published. Your examination hall admit card and desk allocations are active.',
                  urgent: true,
                  is_read: false,
                }));

                await supabase.from('student_notifications').insert(notifications);
              }
            } catch (notifErr) {
              // ignore
            }
          }
        }
      } catch (err) {
        console.warn('[timetablesService] DB publish deferred, local preview updated:', err.message);
      }
    }

    // Always update local preview session data dynamically
    try {
      const sessionKey = sessionId || 'default';
      localStorage.setItem(`examsync_session_published_${sessionKey}`, JSON.stringify({ isPublished, timestamp: new Date().toISOString() }));
      localStorage.setItem('examsync_session_published_active', JSON.stringify({ sessionId, isPublished }));
      localStorage.setItem('examsync_active_timetable_published', JSON.stringify({ sessionId, isPublished }));

      // Update local timetable data
      const currentRaw = localStorage.getItem(`examsync_timetable_data_${sessionKey}`) || localStorage.getItem('examsync_timetable_data');
      const baseList = currentRaw ? JSON.parse(currentRaw) : INITIAL_TIMETABLE;
      const updatedList = baseList.map((item) => ({
        ...item,
        status: isPublished ? 'Published' : 'Scheduled',
        isPublished,
      }));
      localStorage.setItem(`examsync_timetable_data_${sessionKey}`, JSON.stringify(updatedList));
      localStorage.setItem('examsync_timetable_data', JSON.stringify(updatedList));

      // Add dynamic student notification
      if (isPublished) {
        const notif = {
          id: `notif-pub-${Date.now()}`,
          title: 'Official Examination Timetable Published',
          category: 'Examinations',
          message: 'Final examination schedule and room allocations are officially published by the Examination Cell. Your exam admit card and hall passes are active.',
          time: 'Just now',
          urgent: true,
          read: false,
        };
        const rawNotifs = localStorage.getItem('examsync_local_notifications');
        const notifList = rawNotifs ? JSON.parse(rawNotifs) : [];
        localStorage.setItem('examsync_local_notifications', JSON.stringify([notif, ...notifList]));
      }
    } catch (e) {
      // ignore
    }

    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('examsync_timetable_published', {
        detail: { sessionId, isPublished, timestamp: Date.now() },
      }));
    }

    return { success: true, isPublished, dbSuccess };
  },

  async deleteTimetableEntry(id) {
    if (!supabase) throw new Error('Supabase is not configured');
    const { error } = await supabase.from('exam_timetables').delete().eq('id', id);
    if (error) throw error;
    return true;
  },
};

export default timetablesService;
