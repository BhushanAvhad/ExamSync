import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { AuthContext } from './authContextDef';

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [session, setSession] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(() => Boolean(supabase));

  // Helper to fetch user's profile from database
  const fetchProfile = useCallback(async (userId, userMetadata = null, email = null) => {
    if (!supabase || !userId) return null;
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .maybeSingle();

      if (error) {
        console.warn('[ExamSync Auth] Profile fetch error:', error.message);
        return null;
      }

      if (data) {
        setProfile(data);
        return data;
      }

      // Fallback: If user exists in Auth but profile row is not yet created,
      // create default student profile
      if (email) {
        const fallback = {
          id: userId,
          full_name: userMetadata?.full_name || email.split('@')[0] || 'User',
          email,
          role: 'student',
        };
        const { data: created, error: insertErr } = await supabase
          .from('profiles')
          .insert(fallback)
          .select()
          .maybeSingle();

        if (!insertErr && created) {
          setProfile(created);
          return created;
        }
      }

      return null;
    } catch (err) {
      console.error('[ExamSync Auth] Unexpected error fetching profile:', err);
      return null;
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

      if (newSession?.user) {
        setSession(newSession);
        setUser(newSession.user);
        await fetchProfile(newSession.user.id, newSession.user.user_metadata, newSession.user.email);
      } else {
        setSession(null);
        setUser(null);
        setProfile(null);
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
   * Note: The role is strictly assigned to 'student' by backend trigger / policy.
   */
  const signUpStudent = async (fullName, email, password) => {
    if (!supabase) throw new Error('Supabase client is not configured.');

    const cleanEmail = email.trim().toLowerCase();
    const cleanName = fullName.trim();

    const { data, error } = await supabase.auth.signUp({
      email: cleanEmail,
      password,
      options: {
        data: {
          full_name: cleanName,
        },
      },
    });

    if (error) {
      return { success: false, error: error.message };
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
   * If the account lacks the required role (e.g. Student attempting Admin sign-in),
   * the session is immediately terminated.
   */
  const signIn = async (email, password, expectedRole) => {
    if (!supabase) throw new Error('Supabase client is not configured.');

    const cleanEmail = email.trim().toLowerCase();

    const { data, error } = await supabase.auth.signInWithPassword({
      email: cleanEmail,
      password,
    });

    if (error) {
      return { success: false, error: error.message };
    }

    if (!data.user) {
      return { success: false, error: 'Sign in succeeded but no user data was returned.' };
    }

    // Retrieve verified profile role directly from PostgreSQL database
    const userProfile = await fetchProfile(data.user.id, data.user.user_metadata, data.user.email);

    if (!userProfile) {
      await supabase.auth.signOut();
      return {
        success: false,
        error: 'Account profile could not be loaded. Please ensure registration was completed.',
      };
    }

    // Role Verification & Strict Boundary Protection
    if (expectedRole) {
      if (expectedRole === 'admin' && userProfile.role !== 'admin') {
        // Immediately terminate session if a non-admin attempts admin sign in
        await supabase.auth.signOut();
        setSession(null);
        setUser(null);
        setProfile(null);
        return {
          success: false,
          error: 'Access denied: This account does not possess institutional administrator privileges.',
        };
      }

      if (expectedRole === 'student' && userProfile.role !== 'student') {
        // Administrator attempting student portal sign in: redirect to Admin console
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
