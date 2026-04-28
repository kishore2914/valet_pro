import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';

const AuthContext = createContext({});

export const AuthProvider = ({ children }) => {
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const [userRole, setUserRole] = useState(null);
  const [locationId, setLocationId] = useState(null);

  const resolveLocationId = async (user) => {
    if (!user) return null;

    // 1. Try user_metadata first (fastest, no DB call)
    const metaLocationId = user.user_metadata?.location_id || user.user_metadata?.venue_id;
    if (metaLocationId) {
      setLocationId(metaLocationId);
      return metaLocationId;
    }

    // 2. Fall back to profiles table with a 5s timeout so login never hangs
    try {
      const profileFetch = supabase
        .from('profiles')
        .select('location_id')
        .eq('id', user.id)
        .single();

      const timeout = new Promise((_, reject) =>
        setTimeout(() => reject(new Error('timeout')), 5000)
      );

      const { data: profile } = await Promise.race([profileFetch, timeout]);

      if (profile?.location_id) {
        setLocationId(profile.location_id);
        // Sync back to metadata for instant resolution next login
        supabase.auth.updateUser({ data: { location_id: profile.location_id } });
        return profile.location_id;
      }
    } catch (e) {
      console.warn('resolveLocationId: profiles query failed or timed out', e.message);
    }

    // 3. Last resort: grab any location
    try {
      const { data: loc } = await supabase.from('locations').select('id').limit(1).single();
      if (loc?.id) {
        setLocationId(loc.id);
        return loc.id;
      }
    } catch (e) {
      console.warn('resolveLocationId: locations query failed', e.message);
    }

    return null;
  };

  useEffect(() => {
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      setSession(session);
      if (session) {
        setUserRole(session.user.user_metadata?.role || 'valet');
        setLoading(false); // Unblock the app immediately
        resolveLocationId(session.user); // Resolve in background
      } else {
        setLoading(false);
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      setSession(session);
      if (session) {
        setUserRole(session.user.user_metadata?.role || 'valet');
        setLoading(false); // Unblock the app immediately
        resolveLocationId(session.user); // Resolve in background
      } else {
        setUserRole(null);
        setLocationId(null);
        setLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const signIn = async (email, password) => {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    return { data, error };
  };

  const signUp = async (email, password, metadata) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: metadata }
    });
    return { data, error };
  };

  const signOut = async () => {
    const { error } = await supabase.auth.signOut();
    return { error };
  };

  return (
    <AuthContext.Provider value={{ 
      session, 
      user: session?.user, 
      userRole, 
      locationId,
      loading, 
      signIn, 
      signUp, 
      signOut 
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
