import { supabase } from '../lib/supabase';

export const adminService = {
  // Fetch all locations (clients) registered on the platform
  async getAllLocations() {
    const { data, error } = await supabase
      .from('locations')
      .select('*, owner:owner_id(full_name, email)')
      .order('created_at', { ascending: false });
    
    // Fallback if rename hasn't happened
    if (error) {
      return supabase
        .from('venues')
        .select('*, owner:owner_id(full_name, email)')
        .order('created_at', { ascending: false });
    }
    return { data, error };
  },

  // Get global platform stats
  async getGlobalStats() {
    try {
      // Total locations
      let { count: locationCount, error: vError } = await supabase.from('locations').select('*', { count: 'exact', head: true });
      
      // Fallback if rename hasn't happened
      if (vError) {
        const { count, error: vErrorFallback } = await supabase.from('venues').select('*', { count: 'exact', head: true });
        if (vErrorFallback) throw vErrorFallback;
        locationCount = count;
      }

      // Total active vehicles across all locations
      const { count: vehicleCount, error: carError } = await supabase.from('vehicles').select('*', { count: 'exact', head: true }).is('delivered_at', null);
      if (carError) throw carError;

      // Sum all completed payments
      const { data: payments } = await supabase
        .from('payments')
        .select('amount')
        .eq('status', 'completed');
      
      let totalRevenue = 0;
      if (payments && payments.length > 0) {
        totalRevenue = payments.reduce((sum, p) => sum + Number(p.amount), 0);
      } else {
        // Fallback: sum active locations' monthly fees
        const { data: activeLocs } = await supabase.from('locations').select('monthly_fee').eq('status', 'active');
        if (activeLocs) {
          activeLocs.forEach(loc => {
            totalRevenue += parseInt((loc.monthly_fee || '').replace(/[^0-9]/g, '')) || 0;
          });
        }
      }

      return { 
        data: {
          locationCount: locationCount || 0,
          vehicleCount: vehicleCount || 0,
          revenue: totalRevenue
        },
        error: null
      };
    } catch (err) {
      console.error('Supabase Error (getGlobalStats):', err);
      return { data: null, error: err };
    }
  },

  // Fetch all platform settings
  async getPlatformSettings() {
    const { data, error } = await supabase
      .from('platform_settings')
      .select('*');
    return { data, error };
  },

  // Update a specific platform setting
  async updatePlatformSetting(key, value) {
    const { data, error } = await supabase
      .from('platform_settings')
      .update({ value, updated_at: new Date().toISOString() })
      .eq('key', key);
    return { data, error };
  }
};
