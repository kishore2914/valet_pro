import React, { useEffect, useState } from 'react';
import { 
  Car, 
  Search, 
  MapPin, 
  Layers, 
  Loader2, 
  Smartphone, 
  Key, 
  Clock, 
  Fuel,
  ArrowRightCircle
} from 'lucide-react';
import { vehicleService } from '../../services/vehicleService';
import { useAuth } from '../../context/AuthContext';
import { supabase } from '../../lib/supabase';

// Helper for status colors
const getStatusDetails = (status) => {
  const s = (status || '').toLowerCase();
  if (s === 'parked') {
    return { label: 'Parked', color: '#10b981', bg: 'rgba(16, 185, 129, 0.15)' };
  } else if (s === 'parking' || s === 'being parked') {
    return { label: 'Being Parked', color: '#f59e0b', bg: 'rgba(245, 158, 11, 0.15)' };
  } else if (s === 'ready' || s === 'ready for return') {
    return { label: 'Ready', color: '#3b82f6', bg: 'rgba(59, 130, 246, 0.15)' };
  } else if (s === 'delivering' || s === 'out for delivery') {
    return { label: 'Out', color: '#fbbf24', bg: 'rgba(251, 191, 36, 0.15)' };
  } else if (s === 'received') {
    return { label: 'Received', color: '#8b5cf6', bg: 'rgba(139, 92, 246, 0.15)' };
  }
  return { label: 'Empty', color: '#64748b', bg: 'rgba(100, 116, 139, 0.1)' };
};

// Safe slot ID parsing helpers
const getSlotNumber = (slotId) => {
  if (!slotId) return null;
  const slotStr = String(slotId).replace(/\s+/g, '');
  const parts = slotStr.split('-');
  const numPart = parts.length > 1 ? parts[1] : parts[0];
  const num = parseInt(numPart, 10);
  return isNaN(num) ? null : num;
};

const getSlotZone = (slotId, defaultZone = '') => {
  if (!slotId) {
    if (defaultZone) {
      const cleaned = String(defaultZone).replace(/\s+/g, '').toUpperCase();
      if (cleaned.startsWith('EV')) return 'EV';
      if (cleaned.startsWith('VIP')) return 'VIP';
      return cleaned[0] || 'A';
    }
    return 'A';
  }
  const slotStr = String(slotId).replace(/\s+/g, '');
  const parts = slotStr.split('-');
  if (parts.length > 1) {
    return parts[0].toUpperCase();
  }
  if (defaultZone) {
    const cleaned = String(defaultZone).replace(/\s+/g, '').toUpperCase();
    if (cleaned.startsWith('EV')) return 'EV';
    if (cleaned.startsWith('VIP')) return 'VIP';
    return cleaned[0] || 'A';
  }
  return 'A';
};

const FloorMap = () => {
  const { locationId } = useAuth();
  const [vehicles, setVehicles] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeZoneTab, setActiveZoneTab] = useState('A');
  const [selectedSlotNum, setSelectedSlotNum] = useState(null);

  const fetchData = async () => {
    if (!locationId) { setLoading(false); return; }
    try {
      const [{ data: vData }, { data: cData }] = await Promise.all([
        vehicleService.getActiveVehicles(locationId),
        supabase.from('customers').select('*').eq('location_id', locationId)
      ]);
      if (vData) setVehicles(vData);
      if (cData) setCustomers(cData);
    } catch (err) {
      console.error('Error fetching floor map data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (locationId) {
      fetchData();
      const sub = vehicleService.subscribeToVehicles(locationId, fetchData);
      return () => sub.unsubscribe();
    } else {
      setLoading(false);
    }
  }, [locationId]);

  // Helper to resolve customer info from phone or plate number
  const getCustomerInfo = (phone, plate) => {
    const matched = (customers || []).find(c => 
      (phone && c.phone === phone) || 
      (plate && c.vehicles && c.vehicles.includes(plate))
    );
    return matched || null;
  };

  // Merge live checked-in vehicles into the zone map
  const allMapVehicles = (vehicles || []).map((v, i) => {
    // If it's a real vehicle, compute duration
    const diffMs = v.received_at ? Date.now() - new Date(v.received_at).getTime() : 0;
    const computedDuration = diffMs > 0 ? Math.floor(diffMs / (60 * 1000)) : 10;
    
    // Normalise slot formatting: if slot_id is 'A-12', extract zone 'A' and number '12'
    const rawSlotId = v.slot_id !== null && v.slot_id !== undefined ? String(v.slot_id) : '';
    const zone = getSlotZone(rawSlotId, v.zone || 'A');
    const slotNum = getSlotNumber(rawSlotId);
    
    let slot_id = 'A-12';
    if (slotNum !== null) {
      const formattedNum = slotNum < 10 ? '0' + slotNum : slotNum;
      slot_id = `${zone}-${formattedNum}`;
    } else {
      slot_id = `${zone}-12`;
    }
    
    const cust = getCustomerInfo(v.phone_number, v.plate_number);

    return {
      id: v.id,
      plate_number: v.plate_number || 'UNKNOWN',
      model: v.model || 'Vehicle',
      color: v.color || 'Unknown',
      owner_name: cust?.name || v.owner_name || 'Guest',
      phone_number: v.phone_number || '+91 99999 88888',
      status: v.status || 'Parked',
      zone: zone,
      slot_id: slot_id,
      driver_name: v.driver_name || 'Unassigned',
      key_code: v.key_code || `K-${v.id.slice(0, 3).toUpperCase()}`,
      fuel: parseInt(v.fuel_level) || 75,
      duration_mins: computedDuration,
      received_at: v.received_at
    };
  });

  // Search logic
  const searchedVehicles = allMapVehicles.filter(v => {
    const query = searchQuery.toLowerCase();
    const plate = (v.plate_number || '').toLowerCase();
    const model = (v.model || '').toLowerCase();
    const owner = (v.owner_name || '').toLowerCase();
    const slot = (v.slot_id || '').toLowerCase();
    return (
      plate.includes(query) ||
      model.includes(query) ||
      owner.includes(query) ||
      slot.includes(query)
    );
  });

  // Calculate occupants per zone
  const getOccupancyCount = (zoneName) => {
    return searchedVehicles.filter(v => v.zone === zoneName && v.status !== 'Returned').length;
  };

  const zoneOccupancy = {
    A: getOccupancyCount('A'),
    B: getOccupancyCount('B'),
    C: getOccupancyCount('C'),
    D: getOccupancyCount('D')
  };

  // Find vehicle in currently active slot selection
  const activeSlotId = selectedSlotNum 
    ? `${activeZoneTab}-${selectedSlotNum < 10 ? '0' + selectedSlotNum : selectedSlotNum}`
    : '';

  const selectedVehicle = searchedVehicles.find(v => {
    const sZone = getSlotZone(v.slot_id);
    const sNum = getSlotNumber(v.slot_id);
    return sZone === activeZoneTab && sNum === selectedSlotNum && v.status !== 'Returned';
  });

  const formatReceivedTime = (dateStr) => {
    if (!dateStr) return '';
    try {
      const d = new Date(dateStr);
      if (isNaN(d.getTime())) return '';
      return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } catch (e) {
      return '';
    }
  };

  // Render a single slot card
  const renderSlot = (num) => {
    const isSelected = selectedSlotNum === num;
    const vehicleInSlot = searchedVehicles.find(v => {
      const sZone = getSlotZone(v.slot_id);
      const sNum = getSlotNumber(v.slot_id);
      return sZone === activeZoneTab && sNum === num && v.status !== 'Returned';
    });
    const details = getStatusDetails(vehicleInSlot ? vehicleInSlot.status : 'empty');
    
    return (
      <div
        key={num}
        onClick={() => setSelectedSlotNum(num)}
        style={{
          backgroundColor: isSelected ? 'var(--bg-subtle)' : 'transparent',
          border: isSelected ? '1.5px solid #fbbf24' : '1px solid var(--border-color)',
          borderRadius: '10px',
          padding: '0.65rem 0.85rem',
          cursor: 'pointer',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          minHeight: '80px',
          transition: 'all 0.15s ease',
          boxShadow: isSelected ? '0 0 10px rgba(251, 191, 36, 0.15)' : 'none'
        }}
        onMouseEnter={(e) => { if (!isSelected) e.currentTarget.style.backgroundColor = 'var(--bg-subtle)'; }}
        onMouseLeave={(e) => { if (!isSelected) e.currentTarget.style.backgroundColor = 'transparent'; }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
          <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)', fontWeight: '700' }}>
            {num < 10 ? '0' + num : num}
          </span>
          {vehicleInSlot && (
            <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: details.color }} />
          )}
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', marginTop: '0.35rem' }}>
          {vehicleInSlot ? (
            <>
              <span style={{ fontSize: '0.8rem', fontWeight: '700', color: 'var(--text-main)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {vehicleInSlot.plate_number}
              </span>
              <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {vehicleInSlot.model}
              </span>
            </>
          ) : (
            <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)', fontStyle: 'italic', textTransform: 'lowercase', textAlign: 'center', width: '100%', display: 'block', margin: 'auto' }}>
              empty
            </span>
          )}
        </div>
      </div>
    );
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', width: '100%' }}>
      {/* Title & Controls Row */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.85rem', fontWeight: '800', color: 'var(--text-main)', marginBottom: '0.25rem' }}>Live Floor Map</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', fontWeight: '500' }}>
            Real-time view of every zone and slot
          </p>
        </div>
        <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
          <Search size={16} style={{ position: 'absolute', left: '0.85rem', color: 'var(--text-muted)' }} />
          <input 
            type="text" 
            placeholder="Find by plate, token, or customer..." 
            style={{ 
              padding: '0.55rem 0.85rem 0.55rem 2.25rem', 
              borderRadius: '10px', 
              border: '1px solid var(--border-color)',
              backgroundColor: 'var(--bg-card)',
              width: '280px',
              outline: 'none',
              color: 'var(--text-main)',
              fontSize: '0.8rem'
            }} 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {/* Zone Overview Cards Row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
        {['A', 'B', 'C', 'D'].map(zoneName => {
          const occ = zoneOccupancy[zoneName];
          const pct = Math.round((occ / 24) * 100);
          return (
            <div 
              key={zoneName} 
              onClick={() => { setActiveZoneTab(zoneName); setSelectedSlotNum(null); }}
              style={{
                backgroundColor: 'var(--bg-card)',
                border: activeZoneTab === zoneName ? '1.5px solid #fbbf24' : '1px solid var(--border-color)',
                borderRadius: '12px',
                padding: '1.15rem 1rem',
                cursor: 'pointer',
                display: 'flex',
                flexDirection: 'column',
                gap: '0.65rem',
                transition: 'all 0.15s ease',
                boxShadow: activeZoneTab === zoneName ? '0 4px 15px rgba(251, 191, 36, 0.08)' : 'none'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '0.75rem', fontWeight: '800', color: activeZoneTab === zoneName ? '#fbbf24' : 'var(--text-muted)' }}>
                  ZONE {zoneName}
                </span>
                <Layers size={14} style={{ color: activeZoneTab === zoneName ? '#fbbf24' : 'var(--text-muted)' }} />
              </div>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.15rem' }}>
                <span style={{ fontSize: '1.4rem', fontWeight: '800', color: 'var(--text-main)' }}>{occ}</span>
                <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>/24</span>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                <div style={{ width: '100%', height: '5px', backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: '2px', overflow: 'hidden' }}>
                  <div style={{ width: `${pct}%`, height: '100%', backgroundColor: '#10b981', borderRadius: '2px' }} />
                </div>
                <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>{pct}% occupied</div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Legend dot row */}
      <div style={{ display: 'flex', gap: '1.25rem', alignItems: 'center', flexWrap: 'wrap', padding: '0.25rem 0' }}>
        {['Parked', 'Being Parked', 'Ready', 'Out', 'Received', 'Empty'].map(status => {
          const details = getStatusDetails(status);
          return (
            <div key={status} style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
              <div style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: details.color }} />
              <span style={{ fontSize: '0.75rem', fontWeight: '600', color: 'var(--text-muted)' }}>{status}</span>
            </div>
          );
        })}
      </div>

      {/* Main Floor Plan Grid Split */}
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '1.5rem', alignItems: 'stretch', flexWrap: 'wrap' }}>
        {/* Floor Plan Card */}
        <div style={{
          backgroundColor: 'var(--bg-card)',
          border: '1px solid var(--border-color)',
          borderRadius: '12px',
          padding: '1.25rem',
          display: 'flex',
          flexDirection: 'column',
          gap: '1rem'
        }}>
          {/* Floor Plan Header */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h3 style={{ fontSize: '0.95rem', fontWeight: '800', color: 'var(--text-main)' }}>
              Zone {activeZoneTab} — Floor Plan
            </h3>
            {/* Zone Selector Buttons */}
            <div style={{ display: 'flex', gap: '0.35rem' }}>
              {['A', 'B', 'C', 'D'].map(letter => (
                <button
                  key={letter}
                  onClick={() => { setActiveZoneTab(letter); setSelectedSlotNum(null); }}
                  style={{
                    width: '28px',
                    height: '28px',
                    borderRadius: '6px',
                    fontSize: '0.75rem',
                    fontWeight: '700',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    backgroundColor: activeZoneTab === letter ? '#fbbf24' : 'var(--bg-subtle)',
                    color: activeZoneTab === letter ? '#080c14' : 'var(--text-muted)',
                    border: '1px solid var(--border-color)',
                    transition: 'all 0.15s'
                  }}
                >
                  {letter}
                </button>
              ))}
            </div>
          </div>

          {/* Grid Layout containing Drive Lane Divider */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {/* Rows 1-2 (Slots 1-12) */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: '0.75rem' }}>
              {[1, 2, 3, 4, 5, 6].map(renderSlot)}
              {[7, 8, 9, 10, 11, 12].map(renderSlot)}
            </div>

            {/* Drive Lane Divider */}
            <div style={{
              width: '100%',
              padding: '0.35rem 0',
              backgroundColor: 'rgba(0,0,0,0.15)',
              borderRadius: '6px',
              border: '1px dashed var(--border-color)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <span style={{ fontSize: '0.6rem', fontWeight: '800', color: 'var(--text-muted)', letterSpacing: '0.15em', textTransform: 'uppercase' }}>
                Drive Lane
              </span>
            </div>

            {/* Rows 3-4 (Slots 13-24) */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: '0.75rem' }}>
              {[13, 14, 15, 16, 17, 18].map(renderSlot)}
              {[19, 20, 21, 22, 23, 24].map(renderSlot)}
            </div>
          </div>
        </div>

        {/* Right Detail Card */}
        <div style={{
          backgroundColor: 'var(--bg-card)',
          border: '1px solid var(--border-color)',
          borderRadius: '12px',
          padding: '1.5rem',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          minHeight: '400px'
        }}>
          {selectedVehicle ? (
            <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', gap: '1.25rem', justifyContent: 'flex-start' }}>
              {/* Header */}
              <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', borderBottom: '1px solid var(--border-color)', paddingBottom: '1rem' }}>
                <div style={{
                  width: '40px',
                  height: '40px',
                  borderRadius: '10px',
                  backgroundColor: 'rgba(251, 191, 36, 0.1)',
                  color: '#fbbf24',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <Car size={22} />
                </div>
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                  <span style={{ fontSize: '0.9rem', fontWeight: '800', color: 'var(--text-main)' }}>
                    {selectedVehicle.plate_number}
                  </span>
                  <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                    Slot: {selectedVehicle.slot_id}
                  </span>
                </div>
              </div>

              {/* Vehicle Detail list */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <MapPin size={16} style={{ color: 'var(--text-muted)' }} />
                  <div style={{ display: 'flex', flexDirection: 'column' }}>
                    <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)', fontWeight: '700', textTransform: 'uppercase' }}>Model / Color</span>
                    <span style={{ fontSize: '0.8rem', color: 'var(--text-main)', fontWeight: '600' }}>{selectedVehicle.model} ({selectedVehicle.color})</span>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <Smartphone size={16} style={{ color: 'var(--text-muted)' }} />
                  <div style={{ display: 'flex', flexDirection: 'column' }}>
                    <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)', fontWeight: '700', textTransform: 'uppercase' }}>Customer</span>
                    <span style={{ fontSize: '0.8rem', color: 'var(--text-main)', fontWeight: '600' }}>{selectedVehicle.owner_name} · {selectedVehicle.phone_number}</span>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <Key size={16} style={{ color: 'var(--text-muted)' }} />
                  <div style={{ display: 'flex', flexDirection: 'column' }}>
                    <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)', fontWeight: '700', textTransform: 'uppercase' }}>Driver / Key</span>
                    <span style={{ fontSize: '0.8rem', color: 'var(--text-main)', fontWeight: '600' }}>{selectedVehicle.driver_name} ({selectedVehicle.key_code})</span>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <Fuel size={16} style={{ color: 'var(--text-muted)' }} />
                  <div style={{ display: 'flex', flexDirection: 'column', width: '100%' }}>
                    <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)', fontWeight: '700', textTransform: 'uppercase' }}>Fuel Level</span>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.15rem' }}>
                      <div style={{ width: '80px', height: '6px', backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: '3px', overflow: 'hidden' }}>
                        <div style={{ width: `${selectedVehicle.fuel}%`, height: '100%', backgroundColor: '#fbbf24', borderRadius: '3px' }} />
                      </div>
                      <span style={{ fontSize: '0.75rem', fontWeight: '600', color: 'var(--text-main)' }}>{selectedVehicle.fuel}%</span>
                    </div>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <Clock size={16} style={{ color: 'var(--text-muted)' }} />
                  <div style={{ display: 'flex', flexDirection: 'column' }}>
                    <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)', fontWeight: '700', textTransform: 'uppercase' }}>Duration / Received</span>
                    <span style={{ fontSize: '0.8rem', color: 'var(--text-main)', fontWeight: '600' }}>
                      {selectedVehicle.duration_mins} mins (Checked in @ {formatReceivedTime(selectedVehicle.received_at)})
                    </span>
                  </div>
                </div>
              </div>

              {/* Status Badge Action display */}
              <div style={{ 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'space-between',
                padding: '0.75rem 1rem', 
                backgroundColor: 'rgba(251, 191, 36, 0.05)', 
                border: '1px solid rgba(251, 191, 36, 0.1)', 
                borderRadius: '10px',
                marginTop: 'auto'
              }}>
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                  <span style={{ fontSize: '0.6rem', color: 'var(--text-muted)', fontWeight: '700', textTransform: 'uppercase' }}>Status</span>
                  <span style={{ fontSize: '0.8rem', fontWeight: '700', color: '#fbbf24' }}>
                    {selectedVehicle.status.toUpperCase()}
                  </span>
                </div>
                <button
                  style={{
                    backgroundColor: 'var(--accent)',
                    color: 'var(--accent-text)',
                    border: 'none',
                    borderRadius: '8px',
                    padding: '0.45rem 0.85rem',
                    fontSize: '0.75rem',
                    fontWeight: '700',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.35rem'
                  }}
                >
                  <ArrowRightCircle size={14} />
                  <span>Retrieve</span>
                </button>
              </div>
            </div>
          ) : (
            <div style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem', color: 'var(--text-muted)' }}>
              <div style={{ 
                width: '60px', 
                height: '60px', 
                borderRadius: '50%', 
                backgroundColor: 'rgba(255,255,255,0.02)', 
                border: '1.5px solid var(--border-color)', 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center',
                color: 'var(--text-muted)'
              }}>
                <Car size={28} style={{ opacity: 0.3 }} />
              </div>
              <div>
                <p style={{ fontSize: '0.85rem', fontWeight: '700', color: 'var(--text-main)', marginBottom: '0.25rem' }}>
                  {selectedSlotNum ? `Slot ${activeZoneTab}-${selectedSlotNum < 10 ? '0' + selectedSlotNum : selectedSlotNum} is Empty` : 'No Slot Selected'}
                </p>
                <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', maxWidth: '200px', margin: '0 auto', lineHeight: 1.3 }}>
                  {selectedSlotNum 
                    ? 'Select an active vehicle in the live feed or pipeline to assign it to this parking slot.' 
                    : 'Tap a parking slot on the floor plan map to view vehicle assignment and check-in details.'}
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default FloorMap;
