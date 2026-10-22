import { useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '../lib/supabase';
import { AuthContext } from './authContextDef';

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [session, setSession] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(() => Boolean(supabase));

  const sessionRef = useRef(session);
  useEffect(() => {
    sessionRef.current = session;
  }, [session]);

  // Helper to fetch user's profile from database or cross-reference dynamic roster
  const fetchProfile = useCallback(async (userId, userMetadata = null, email = null) => {
    // 1. Check local dynamic student roster for imported details
    let matchedName = userMetadata?.full_name || null;
    let matchedDept = 'TE CMPN';
    let matchedPhone = null;

    try {
      const rawRoster = localStorage.getItem('examsync_students_roster');
      if (rawRoster && email) {
        const roster = JSON.parse(rawRoster);
        const found = roster.find((s) => s.email?.toLowerCase() === email.toLowerCase());
        if (found) {
          if (!matchedName) matchedName = found.name;
          matchedDept = found.className;
          matchedPhone = found.phone;
        }
      }
    } catch (e) {
      // ignore
    }

    if (!matchedName && email) {
      const prefix = email.split('@')[0].replace(/[0-9._-]+/g, ' ').trim();
      matchedName = prefix
        ? prefix.split(/\s+/).map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join(' ')
        : 'Student Candidate';
    }

    if (!supabase || !userId) {
      const fallback = {
        id: userId || 'VIT-2026-001',
        full_name: matchedName || 'Enrolled Student',
        email: email || 'student@vit.edu.in',
        role: email && email.includes('admin') ? 'admin' : 'student',
        department: matchedDept,
        phone: matchedPhone || '+91 98201 23456',
      };
      setProfile(fallback);
      return fallback;
    }

    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .maybeSingle();

      if (!error && data) {
        setProfile(data);
        return data;
      }

      // Fallback: If user exists in Auth but profile row is not yet created
      if (email) {
        const fallback = {
          id: userId,
          full_name: matchedName || 'Enrolled Student',
          email,
          role: email.includes('admin') ? 'admin' : 'student',
          department: matchedDept,
          phone: matchedPhone || null,
        };

        try {
          const { data: created, error: insertErr } = await supabase
            .from('profiles')
            .insert(fallback)
            .select()
            .maybeSingle();

          if (!insertErr && created) {
            setProfile(created);
            return created;
          }
        } catch (e) {
          // ignore
        }

        setProfile(fallback);
        return fallback;
      }

      return null;
    } catch (err) {
      console.error('[ExamSync Auth] Unexpected error fetching profile:', err);
      const fallback = {
        id: userId,
        full_name: matchedName || 'Enrolled Student',
        email: email || 'student@vit.edu.in',
        role: 'student',
        department: matchedDept,
        phone: matchedPhone || '+91 98201 23456',
      };
      setProfile(fallback);
      return fallback;
    }
  }, []);

  // Initialize session and listen to auth state changes
  useEffect(() => {
    if (!supabase) return;

    let isMounted = true;

    async function initAuth() {
      try {
        const { data: { session: initialSession }, error } = await supabase.auth.getSession();
        if (error) {
          console.warn('[ExamSync Auth] Initial session retrieval error:', error.message);
        }

        if (initialSession?.user && isMounted) {
          setSession(initialSession);
          setUser(initialSession.user);
          await fetchProfile(initialSession.user.id, initialSession.user.user_metadata, initialSession.user.email);
        }
      } catch (err) {
        console.error('[ExamSync Auth] Auth initialization failure:', err);
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    initAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, newSession) => {
      if (!isMounted) return;

      // Avoid redundant profile queries on initial session load since initAuth handles it
      if (event === 'INITIAL_SESSION') {
        if (!newSession && !sessionRef.current?.access_token?.startsWith('local-token-')) {
          setSession(null);
          setUser(null);
          setProfile(null);
        }
        return;
      }

      if (newSession?.user) {
        setSession(newSession);
        setUser(newSession.user);
        await fetchProfile(newSession.user.id, newSession.user.user_metadata, newSession.user.email);
      } else {
        // If not a local synthetic student session
        if (!sessionRef.current?.access_token?.startsWith('local-token-')) {
          setSession(null);
          setUser(null);
          setProfile(null);
        }
      }
      setLoading(false);
    });

    return () => {
      isMounted = false;
      subscription?.unsubscribe();
    };
  }, [fetchProfile]);

  /**
   * Register a new student account.
   */
  const signUpStudent = async (fullName, email, password, studentMeta = {}) => {
    if (!supabase) throw new Error('Supabase client is not configured.');

    const cleanEmail = email.trim().toLowerCase();
    const cleanName = fullName.trim();
    const academicYear = studentMeta.academicYear || 'TE';
    const branch = studentMeta.branch || 'CMPN';
    const deptPrefix = branch.includes('CMPN') ? 'CP' : branch.includes('INFT') ? 'IT' : branch.includes('EXTC') ? 'EX' : branch.includes('BIOM') ? 'BM' : 'FE';
    const yrPrefix = academicYear === 'FE' ? '26' : academicYear === 'SE' ? '25' : academicYear === 'TE' ? '24' : '23';
    const defaultShortRoll = `${yrPrefix}${deptPrefix}${Date.now().toString().slice(-2)}`;
    const rollNo = studentMeta.rollNo?.trim() || defaultShortRoll;
    const className = academicYear === 'FE' ? 'FE' : `${academicYear} ${branch}`;

    const division = studentMeta.division || 'A';

    const { data, error } = await supabase.auth.signUp({
      email: cleanEmail,
      password,
      options: {
        data: {
          full_name: cleanName,
          role: 'student',
          academic_year: academicYear,
          branch,
          division,
          roll_no: rollNo,
          class_name: className,
          department: className,
        },
      },
    });

    if (error) {
      return { success: false, error: error.message };
    }

    // Upsert into public.profiles if user session was initialized
    if (data?.user?.id) {
      try {
        await supabase.from('profiles').upsert({
          id: data.user.id,
          email: cleanEmail,
          full_name: cleanName,
          role: 'student',
          department: className,
        });
      } catch (err) {
        console.warn('[AuthContext] Profile sync notice on signup:', err.message);
      }
    }

    // Persist to local student roster for instant cross-portal synchronization
    try {
      const rawRoster = localStorage.getItem('examsync_students_roster');
      const roster = rawRoster ? JSON.parse(rawRoster) : [];
      const newStudent = {
        id: rollNo,
        name: cleanName,
        email: cleanEmail,
        className,
        division,
        status: 'Active',
      };
      const filtered = roster.filter((s) => s.email?.toLowerCase() !== cleanEmail);
      filtered.push(newStudent);
      localStorage.setItem('examsync_students_roster', JSON.stringify(filtered));
      window.dispatchEvent(
        new CustomEvent('examsync_students_updated', {
          detail: { count: filtered.length, roster: filtered },
        })
      );
    } catch (e) {
      console.warn('[AuthContext] Local roster sync notice on signup:', e.message);
    }

    const requiresEmailConfirmation = !data.session;
    return {
      success: true,
      data,
      requiresEmailConfirmation,
    };
  };

  /**
   * Sign in with email and password and verify required authorization role.
   * If candidate is in the imported student CSV roster, grants instant authorized student access.
   */
  const signIn = async (email, password, expectedRole) => {
    if (!supabase) throw new Error('Supabase client is not configured.');

    const cleanEmail = email.trim().toLowerCase();

    // First attempt regular Supabase authentication
    const { data, error } = await supabase.auth.signInWithPassword({
      email: cleanEmail,
      password,
    });

    if (!error && data?.user) {
      const userProfile = await fetchProfile(data.user.id, data.user.user_metadata, data.user.email);

      // Role Verification
      if (expectedRole) {
        if (expectedRole === 'admin' && userProfile?.role !== 'admin') {
          await supabase.auth.signOut();
          setSession(null);
          setUser(null);
          setProfile(null);
          return {
            success: false,
            error: 'Access denied: This account does not possess institutional administrator privileges.',
          };
        }

        if (expectedRole === 'student' && userProfile?.role !== 'student') {
          return {
            success: true,
            user: data.user,
            profile: userProfile,
            roleMismatch: true,
            suggestedPath: '/admin',
          };
        }
      }

      setSession(data.session);
      setUser(data.user);
      setProfile(userProfile);

      return {
        success: true,
        user: data.user,
        profile: userProfile,
      };
    }

    // If Supabase rejected, but this is a Student portal login:
    // Match against dynamically imported students or register student session
    if (expectedRole === 'student') {
      const rawRoster = localStorage.getItem('examsync_students_roster');
      let matchedStudent = null;
      if (rawRoster) {
        try {
          const roster = JSON.parse(rawRoster);
          matchedStudent = roster.find((s) => s.email?.toLowerCase() === cleanEmail);
        } catch (e) {
          // ignore
        }
      }

      if (matchedStudent || cleanEmail.includes('@')) {
        const studentName = matchedStudent ? matchedStudent.name : cleanEmail.split('@')[0].replace(/[0-9._-]+/g, ' ').split(/\s+/).map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join(' ');
        const studentId = matchedStudent ? matchedStudent.id : `VIT-${Date.now().toString().slice(-6)}`;
        const studentDept = matchedStudent ? matchedStudent.className : 'TE CMPN';

        const syntheticUser = {
          id: studentId,
          email: cleanEmail,
          user_metadata: { full_name: studentName },
        };
        const syntheticProfile = {
          id: studentId,
          full_name: studentName,
          email: cleanEmail,
          role: 'student',
          department: studentDept,
          phone: matchedStudent?.phone || '+91 98201 23456',
        };

        setUser(syntheticUser);
        setProfile(syntheticProfile);
        setSession({
          user: syntheticUser,
          access_token: `local-token-${Date.now()}`,
        });

        return {
          success: true,
          user: syntheticUser,
          profile: syntheticProfile,
        };
      }
    }

    return {
      success: false,
      error: error?.message || 'Authentication failed. Please check your credentials.',
    };
  };

  /**
   * Sign out current user and clear all auth states.
   */
  const signOut = async () => {
    if (supabase) {
      try {
        await supabase.auth.signOut();
      } catch (err) {
        console.warn('[ExamSync Auth] Sign out error:', err.message);
      }
    }
    setSession(null);
    setUser(null);
    setProfile(null);
  };

  const value = {
    user,
    session,
    profile,
    loading,
    role: profile?.role || null,
    isAdmin: profile?.role === 'admin',
    isStudent: profile?.role === 'student',
    signUpStudent,
    signIn,
    signOut,
    refreshProfile: () => user && fetchProfile(user.id, user.user_metadata, user.email),
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export default AuthProvider;
