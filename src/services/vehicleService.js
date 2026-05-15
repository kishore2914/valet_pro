import { supabase } from '../lib/supabase';

export const vehicleService = {
  // Fetch all active vehicles for a location
  async getActiveVehicles(locationId) {
    const { data, error } = await supabase
      .from('vehicles')
      .select('*')
      .eq('location_id', locationId)
      .is('delivered_at', null)
      .order('received_at', { ascending: false });
    return { data, error };
  },

  // Get operational stats
  async getStats(locationId) {
    const { data, error } = await supabase
      .from('vehicles')
      .select('status')
      .eq('location_id', locationId)
      .is('delivered_at', null);
      
    if (error) return { error };

    const stats = {
      received: data?.length || 0,
      parked: data?.filter(v => v.status === 'Parked').length || 0,
      requested: data?.filter(v => v.status === 'Ready').length || 0,
    };
    
    return { data: stats, error: null };
  },

  // Subscribe to vehicle changes
  subscribeToVehicles(locationId, callback) {
    return supabase
      .channel('vehicles_changes')
      .on(
        'postgres_changes', 
        { 
          event: '*', 
          schema: 'public', 
          table: 'vehicles',
          filter: `location_id=eq.${locationId}`
        }, 
        (payload) => callback(payload)
      )
      .subscribe();
  },

  // Add new vehicle
  async addVehicle(vehicleData) {
    const { data, error } = await supabase
      .from('vehicles')
      .insert([vehicleData])
      .select();
    return { data, error };
  },

  // Update vehicle status
  async updateStatus(id, status, extraData = {}) {
    const update = { status, ...extraData };
    if (status === 'Parked') update.parked_at = new Date().toISOString();
    if (status === 'Ready') update.requested_at = new Date().toISOString();
    if (status === 'Returned') update.delivered_at = new Date().toISOString();

    const { data, error } = await supabase
      .from('vehicles')
      .update(update)
      .eq('id', id)
      .select();
    return { data, error };
  },

  // Assign a staff member as driver
  async assignDriver(vehicleId, staffId, staffName) {
    const { data, error } = await supabase
      .from('vehicles')
      .update({ driver_id: staffId, driver_name: staffName })
      .eq('id', vehicleId)
      .select();
    return { data, error };
  }
};
