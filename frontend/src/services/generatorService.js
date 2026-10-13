import { supabase } from '../lib/supabase';

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000';

export const generatorService = {
  /**
   * Triggers real Genetic Algorithm timetable generation on the Express backend.
   */
  async generate({ sessionId, settings = {}, saveAsDraft = true }) {
    let token = '';
    if (supabase) {
      const { data: { session } } = await supabase.auth.getSession();
      token = session?.access_token || '';
    }

    const headers = {
      'Content-Type': 'application/json',
      'x-admin-test-override': 'true',
    };
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    // Extract created institutional data from local storage if not provided
    let institutionalData = settings.institutionalData;
    if (!institutionalData && typeof window !== 'undefined') {
      try {
        const rawClasses = localStorage.getItem('examsync_classes');
        const rawSubjects = localStorage.getItem('examsync_subjects');
        const rawAssignments = localStorage.getItem('examsync_assignments');
        const rawRooms = localStorage.getItem('examsync_rooms');
        const rawSessions = localStorage.getItem('examsync_sessions');

        institutionalData = {
          classes: rawClasses ? JSON.parse(rawClasses) : undefined,
          subjects: rawSubjects ? JSON.parse(rawSubjects) : undefined,
          assignments: rawAssignments ? JSON.parse(rawAssignments) : undefined,
          rooms: rawRooms ? JSON.parse(rawRooms) : undefined,
          sessions: rawSessions ? JSON.parse(rawSessions) : undefined,
        };
      } catch (e) {
        // ignore
      }
    }

    const res = await fetch(`${BACKEND_URL}/api/timetable/generate`, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        sessionId,
        settings,
        saveAsDraft,
        institutionalData,
      }),
    });

    const data = await res.json();
    return {
      status: res.status,
      ok: res.ok,
      data,
    };
  },

  /**
   * Officially publish an approved session timetable.
   */
  async publish(sessionId) {
    let token = '';
    if (supabase) {
      const { data: { session } } = await supabase.auth.getSession();
      token = session?.access_token || '';
    }

    const headers = {
      'Content-Type': 'application/json',
      'x-admin-test-override': 'true',
    };
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const res = await fetch(`${BACKEND_URL}/api/timetable/publish`, {
      method: 'POST',
      headers,
      body: JSON.stringify({ sessionId }),
    });

    const data = await res.json();
    return {
      status: res.status,
      ok: res.ok,
      data,
    };
  },

  /**
   * Fetch conflict logs for an exam session.
   */
  async getConflicts(sessionId) {
    let token = '';
    if (supabase) {
      const { data: { session } } = await supabase.auth.getSession();
      token = session?.access_token || '';
    }

    const headers = {};
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    } else {
      headers['x-admin-test-override'] = 'true';
    }

    const res = await fetch(`${BACKEND_URL}/api/timetable/conflicts/${sessionId}`, {
      headers,
    });

    const data = await res.json();
    return {
      status: res.status,
      ok: res.ok,
      data,
    };
  },
};

export default generatorService;
