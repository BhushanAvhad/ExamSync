import { supabase } from '../lib/supabase';
import { INITIAL_EXAM_SESSIONS } from '../data/adminDemoData';

const STORAGE_KEY = 'examsync_sessions';

function getStoredSessions() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_EXAM_SESSIONS));
  } catch (e) {
    console.warn('[sessionsService] Failed to read from localStorage:', e);
  }
  return [...INITIAL_EXAM_SESSIONS];
}

function saveStoredSessions(list) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
    if (typeof window !== 'undefined') {
      window.dispatchEvent(
        new CustomEvent('examsync_sessions_updated', {
          detail: { sessions: list },
        })
      );
    }
  } catch (e) {
    console.warn('[sessionsService] Failed to save to localStorage:', e);
  }
}

export const sessionsService = {
  /**
   * Fetch exam sessions from Supabase with fallback & sync to persistent localStorage.
   */
  async getExamSessions() {
    const local = getStoredSessions();
    if (!supabase) return { data: local, error: null };

    try {
      const { data, error } = await supabase
        .from('exam_sessions')
        .select('*')
        .order('start_date', { ascending: false });

      if (error || !data || data.length === 0) {
        if (error) {
          console.warn('[sessionsService] getExamSessions error, using local fallback:', error.message);
        }
        return { data: local, error: null };
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

      // Merge and save to localStorage
      saveStoredSessions(mapped);
      return { data: mapped, error: null };
    } catch (err) {
      console.warn('[sessionsService] Network or Supabase fetch failed, returning local sessions:', err);
      return { data: local, error: null };
    }
  },

  /**
   * Create a new exam session, saving locally and persisting to Supabase when possible.
   */
  async createExamSession(session) {
    const newSession = {
      id: session.id || `SESS-${Date.now()}`,
      name: session.name.trim(),
      term: session.term?.trim() || 'Even Semester 2025–2026',
      startDate: session.startDate,
      endDate: session.endDate,
      status: session.status || 'Draft',
      description: session.description || '',
      timeSlots: Array.isArray(session.timeSlots)
        ? session.timeSlots
        : ['Morning (09:00 — 12:00)', 'Afternoon (14:00 — 17:00)'],
      applicableClasses: Array.isArray(session.applicableClasses)
        ? session.applicableClasses
        : ['All Departments'],
    };

    // Store in local storage first
    const currentList = getStoredSessions();
    const updatedList = [newSession, ...currentList.filter((s) => s.id !== newSession.id)];
    saveStoredSessions(updatedList);

    if (supabase) {
      try {
        const payload = {
          name: newSession.name,
          academic_term: newSession.term,
          start_date: newSession.startDate,
          end_date: newSession.endDate,
          status: newSession.status,
          description: newSession.description,
          time_slots: newSession.timeSlots,
        };

        const { data, error } = await supabase
          .from('exam_sessions')
          .insert(payload)
          .select()
          .single();

        if (!error && data) {
          const syncedSession = {
            ...newSession,
            id: data.id,
            startDate: data.start_date,
            endDate: data.end_date,
            term: data.academic_term,
          };
          const syncedList = updatedList.map((s) => (s.id === newSession.id ? syncedSession : s));
          saveStoredSessions(syncedList);
          return syncedSession;
        }
      } catch (err) {
        console.warn('[sessionsService] Supabase insert warning (persisted locally):', err.message);
      }
    }

    return newSession;
  },

  /**
   * Update an existing exam session, syncing both local storage and database.
   */
  async updateExamSession(id, session) {
    const currentList = getStoredSessions();
    const existing = currentList.find((s) => s.id === id) || {};
    const updatedSession = {
      ...existing,
      ...session,
      id,
      name: session.name?.trim() || existing.name,
      term: session.term?.trim() || existing.term,
      startDate: session.startDate || existing.startDate,
      endDate: session.endDate || existing.endDate,
      status: session.status || existing.status,
      description: session.description !== undefined ? session.description : existing.description,
      timeSlots: session.timeSlots || existing.timeSlots || ['Morning (09:00 — 12:00)', 'Afternoon (14:00 — 17:00)'],
    };

    const updatedList = currentList.map((s) => (s.id === id ? updatedSession : s));
    saveStoredSessions(updatedList);

    if (supabase) {
      try {
        const payload = {
          name: updatedSession.name,
          academic_term: updatedSession.term,
          start_date: updatedSession.startDate,
          end_date: updatedSession.endDate,
          status: updatedSession.status,
          description: updatedSession.description,
        };

        await supabase
          .from('exam_sessions')
          .update(payload)
          .eq('id', id);
      } catch (err) {
        console.warn('[sessionsService] Supabase update warning (persisted locally):', err.message);
      }
    }

    return updatedSession;
  },

  /**
   * Delete an exam session from local storage and Supabase.
   */
  async deleteExamSession(id) {
    const currentList = getStoredSessions();
    const filtered = currentList.filter((s) => s.id !== id);
    saveStoredSessions(filtered);

    if (supabase) {
      try {
        await supabase.from('exam_sessions').delete().eq('id', id);
      } catch (err) {
        console.warn('[sessionsService] Supabase delete warning (deleted locally):', err.message);
      }
    }
    return true;
  },
};

export default sessionsService;
