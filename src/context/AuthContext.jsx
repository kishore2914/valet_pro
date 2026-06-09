import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';

const AuthContext = createContext({});

export const AuthProvider = ({ children }) => {
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const [userRole, setUserRole] = useState(null);
  const [locationId, setLocationId] = useState(null);
  const [locations, setLocations] = useState([]);
  const [profile, setProfile] = useState(null);

  const fetchUserProfile = async (currentUser) => {
    if (!currentUser) {
      setProfile(null);
      return;
    }
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', currentUser.id)
        .single();
      if (!error && data) {
        setProfile(data);
        if (data.role) {
          setUserRole(data.role);
        }
      }
    } catch (e) {
      console.warn('fetchUserProfile failed', e.message);
    }
  };

  const resolveLocationId = async (user) => {
    if (!user) return null;

    try {
      // Fetch all assigned locations for the user
      const { data: userLocs, error } = await supabase
        .from('user_locations')
        .select(`
          location_id,
          locations (
            id,
            name,
            companies ( company_name ),
            cities ( city_name )
          )
        `)
        .eq('user_id', user.id);

      if (userLocs && userLocs.length > 0) {
        // Flatten the data
        const assignedLocations = userLocs.map(ul => ({
          id: ul.locations.id,
          name: ul.locations.name,
          company_name: ul.locations.companies?.company_name,
          city_name: ul.locations.cities?.city_name
        }));
        
        setLocations(assignedLocations);

        // Determine default location: check metadata first, else use the first one
        const metaLocationId = user.user_metadata?.location_id || user.user_metadata?.venue_id;
        const defaultLoc = assignedLocations.find(l => l.id === metaLocationId) || assignedLocations[0];

        setLocationId(defaultLoc.id);
        
        // Sync back to metadata for instant resolution next login if it changed
        if (metaLocationId !== defaultLoc.id) {
            supabase.auth.updateUser({ data: { location_id: defaultLoc.id } });
        }
        return defaultLoc.id;
      } else {
        // Fallback for legacy users who haven't been migrated or have no locations
        const { data: profile } = await supabase
          .from('profiles')
          .select('location_id')
          .eq('id', user.id)
          .single();

        if (profile?.location_id) {
           setLocationId(profile.location_id);
           return profile.location_id;
        }
      }
    } catch (e) {
      console.warn('resolveLocationId: multi-branch query failed', e.message);
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
        fetchUserProfile(session.user); // Resolve in background
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
        fetchUserProfile(session.user); // Resolve in background
      } else {
        setUserRole(null);
        setLocationId(null);
        setProfile(null);
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

  const resetPassword = async (email) => {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/login`,
    });
    return { error };
  };

  const updatePassword = async (newPassword) => {
    const { error } = await supabase.auth.updateUser({ password: newPassword });
    return { error };
  };

  return (
    <AuthContext.Provider value={{ 
      session, 
      user: session?.user, 
      profile,
      userRole, 
      locationId,
      setLocationId,
      locations,
      loading, 
      signIn, 
      signUp, 
      signOut,
      resetPassword,
      updatePassword 
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
