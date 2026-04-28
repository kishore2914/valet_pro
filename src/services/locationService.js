import { supabase } from '../lib/supabase';

export const locationService = {
  async getLocationById(locationId) {
    const { data, error } = await supabase
      .from('locations')
      .select('*')
      .eq('id', locationId)
      .single();
    
    // Fallback to 'venues' if rename hasn't happened yet
    if (error) {
      return supabase
        .from('venues')
        .select('*')
        .eq('id', locationId)
        .single();
    }
    
    return { data, error };
  }
};
