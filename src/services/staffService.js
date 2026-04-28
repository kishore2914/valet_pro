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
    const { data, error } = await supabase
      .from('staff')
      .insert([staffData])
      .select();
    return { data, error };
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
