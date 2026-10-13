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
    };
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    } else {
      // In development test mode, pass local test header
      headers['x-admin-test-override'] = 'true';
    }

    const res = await fetch(`${BACKEND_URL}/api/timetable/generate`, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        sessionId,
        settings,
        saveAsDraft,
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
    };
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    } else {
      headers['x-admin-test-override'] = 'true';
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
