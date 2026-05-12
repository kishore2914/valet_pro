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
            role: role.toLowerCase().includes('admin') ? 'admin' : 'valet_staff',
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

      // 3. Profile Sync (Resilient - ignores conflicts)
      try {
        await supabase.from('profiles').upsert({
          id: authData.user.id,
          full_name: name,
          email,
          role: role.toLowerCase().includes('admin') ? 'admin' : 'valet_staff',
          location_id
        }, { onConflict: 'id' });
      } catch (e) {
        console.warn('Profile sync handled by trigger or skipped:', e);
      }

      // 4. Staff Record Sync (Resilient - ignores conflicts)
      try {
        const { data: staffRecord, error: staffError } = await supabase.from('staff').upsert({
          id: authData.user.id,
          name,
          email,
          role,
          phone,
          location_id,
          status: 'On Shift',
          handled_count: 0,
          rating: 5.0
        }, { onConflict: 'id' }).select();
        
        if (staffError) {
          console.warn('Staff record sync warning:', staffError);
        }
        
        return { data: staffRecord || [{ id: authData.user.id, name }], error: null };
      } catch (e) {
        console.warn('Staff sync error ignored:', e);
        return { data: [{ id: authData.user.id, name }], error: null };
      }
    } catch (err) {
      console.error('Critical error in addStaff:', err);
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
