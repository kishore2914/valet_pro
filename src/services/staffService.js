import { supabase } from '../lib/supabase';

export const staffService = {
  async getStaff(locationId) {
    const { data, error } = await supabase
      .from('staff')
      .select('*')
      .eq('location_id', locationId)
      .order('name');
    return { data, error };
  },

  async updateStaffStatus(id, status) {
    const { data, error } = await supabase
      .from('staff')
      .update({ status })
      .eq('id', id)
      .select();
    return { data, error };
  },

  async addStaff(staffData) {
    const { name, email, password, role, phone, location_id } = staffData;
    
    try {
      // 1. Create a temporary Supabase client to sign up the staff member
      // This avoids logging out the current admin user
      const { createClient } = await import('@supabase/supabase-js');
      const tempClient = createClient(
        import.meta.env.VITE_SUPABASE_URL,
        import.meta.env.VITE_SUPABASE_ANON_KEY,
        { auth: { persistSession: false } }
      );

      // 2. Create the Auth user
      const { data: authData, error: authError } = await tempClient.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: name,
            role: role.toLowerCase().includes('admin') ? 'admin' : 'valet',
            location_id: location_id,
            display_role: role
          }
        }
      });

      if (authError) {
        if (authError.message.includes('already registered')) {
          throw new Error('This email address is already registered as a user.');
        }
        throw authError;
      }

      if (!authData?.user) {
        throw new Error('Failed to create authentication account.');
      }

      // 3. Add to the profiles table (CRITICAL for RLS and Location resolution)
      // Use upsert to handle cases where a DB trigger might have already created the profile
      const { error: profileError } = await supabase
        .from('profiles')
        .upsert([{
          id: authData.user.id,
          full_name: name,
          email,
          role: role.toLowerCase().includes('admin') ? 'admin' : 'valet',
          location_id
        }], { onConflict: 'id' });

      if (profileError) {
        console.error('Profile creation error:', profileError);
        throw new Error(`Profile creation failed: ${profileError.message}`);
      }

      // 4. Add to the staff table for management/tracking
      // Use upsert to handle potential duplicates or re-onboarding
      const { data, error: staffError } = await supabase
        .from('staff')
        .upsert([{
          id: authData.user.id,
          name,
          email,
          role,
          phone,
          location_id,
          status: 'On Shift',
          handled_count: 0,
          rating: 5.0
        }], { onConflict: 'id' })
        .select();

      if (staffError) {
        console.error('Staff table upsert error:', staffError);
        throw new Error(`Staff record creation failed: ${staffError.message}`);
      }

      return { data, error: null };
    } catch (err) {
      console.error('Error in addStaff:', err);
      return { data: null, error: err };
    }
  }

};

export const incidentService = {
  async getIncidents(locationId) {
    const { data, error } = await supabase
      .from('incidents')
      .select('*, vehicle:vehicles(plate_number, model)')
      .eq('location_id', locationId)
      .order('created_at', { ascending: false });
    return { data, error };
  },

  async updateIncidentStatus(id, status) {
    const { data, error } = await supabase
      .from('incidents')
      .update({ status })
      .eq('id', id)
      .select();
    return { data, error };
  },

  async addIncident(incidentData) {
    const { data, error } = await supabase
      .from('incidents')
      .insert([incidentData])
      .select();
    return { data, error };
  }
};

export const bookingService = {
  async getBookings(locationId) {
    const { data, error } = await supabase
      .from('bookings')
      .select('*')
      .eq('location_id', locationId)
      .order('created_at', { ascending: false });
    return { data, error };
  }
};

export const notificationService = {
  async getNotifications(locationId) {
    const { data, error } = await supabase
      .from('notifications')
      .select('*')
      .eq('location_id', locationId)
      .order('created_at', { ascending: false });
    return { data, error };
  }
};
