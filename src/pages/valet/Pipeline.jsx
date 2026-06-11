import React, { useEffect, useRef, useState } from 'react';
import { 
  Car, 
  Smartphone, 
  Key, 
  Fuel, 
  Clock, 
  Search, 
  Filter, 
  Loader2, 
  MapPin, 
  User, 
  ChevronDown, 
  MoreVertical,
  UserCheck,
  UserX,
  CheckCircle2,
  Trash2
} from 'lucide-react';
import { vehicleService } from '../../services/vehicleService';
import { staffService } from '../../services/staffService';
import { useAuth } from '../../context/AuthContext';
import { supabase } from '../../lib/supabase';

// Helper to determine tier badge styles
const getTierStyle = (tier) => {
  const t = (tier || '').toLowerCase();
  if (t === 'gold') {
    return { bg: 'rgba(251, 191, 36, 0.08)', color: '#fbbf24', border: '1px solid rgba(251, 191, 36, 0.15)' };
  } else if (t === 'platinum') {
    return { bg: 'rgba(168, 85, 247, 0.08)', color: '#a855f7', border: '1px solid rgba(168, 85, 247, 0.15)' };
  } else if (t === 'silver') {
    return { bg: 'rgba(156, 163, 175, 0.08)', color: '#9ca3af', border: '1px solid rgba(156, 163, 175, 0.15)' };
  }
  return { bg: 'rgba(100, 116, 139, 0.08)', color: '#64748b', border: '1px solid rgba(100, 116, 139, 0.15)' };
};

// Stage mapping to match screenshot statuses
const STATUS_LABELS = {
  Received: 'RECEIVED',
  Parking: 'BEING PARKED',
  Parked: 'PARKED',
  Ready: 'READY',
  Delivering: 'OUT FOR DELIVERY',
  Returned: 'RETURNED'
};

const NEXT_STATUS = {
  Received: 'Parking',
  Parking: 'Parked',
  Parked: 'Ready',
  Ready: 'Delivering',
  Delivering: 'Returned',
  Returned: null
};

const Pipeline = () => {
  const { locationId } = useAuth();
  const [vehicles, setVehicles] = useState([]);
  const [staff, setStaff] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('All');
  
  // Row action menu states
  const [actionMenuOpenId, setActionMenuOpenId] = useState(null);
  const [driverMenuOpenId, setDriverMenuOpenId] = useState(null);
  const actionMenuRef = useRef(null);
  const driverMenuRef = useRef(null);

  // Close menus on outside click
  useEffect(() => {
    const handler = (e) => {
      if (actionMenuRef.current && !actionMenuRef.current.contains(e.target)) {
        setActionMenuOpenId(null);
      }
      if (driverMenuRef.current && !driverMenuRef.current.contains(e.target)) {
        setDriverMenuOpenId(null);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const fetchData = async () => {
    if (!locationId) { setLoading(false); return; }
    try {
      const [{ data: vData }, { data: sData }, { data: cData }] = await Promise.all([
        vehicleService.getActiveVehicles(locationId),
        staffService.getStaff(locationId),
        supabase.from('customers').select('*').eq('location_id', locationId)
      ]);
      if (vData) setVehicles(vData);
      if (sData) setStaff(sData);
      if (cData) setCustomers(cData);
    } catch (err) {
      console.error('Error fetching pipeline data:', err);
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

  const handleStatusChange = async (id, newStatus) => {
    setActionMenuOpenId(null);
    // Optimistic Update
    setVehicles(prev => prev.map(v => v.id === id ? { ...v, status: newStatus } : v));
    await vehicleService.updateStatus(id, newStatus);
    fetchData();
  };

  const handleAssignDriver = async (vehicleId, staffId, staffName) => {
    setDriverMenuOpenId(null);
    setActionMenuOpenId(null);
    
    // Determine status update: if Received, move to Parking automatically
    const vehicle = vehicles.find(v => v.id === vehicleId);
    const shouldMoveToParking = vehicle?.status === 'Received';
    
    setVehicles(prev => prev.map(v => v.id === vehicleId ? {
      ...v,
      driver_id: staffId,
      driver_name: staffName,
      status: shouldMoveToParking ? 'Parking' : v.status
    } : v));

    await vehicleService.assignDriver(vehicleId, staffId, staffName);
    if (shouldMoveToParking) {
      await vehicleService.updateStatus(vehicleId, 'Parking');
    }
    fetchData();
  };

  const handleUnassignDriver = async (vehicleId) => {
    setDriverMenuOpenId(null);
    setActionMenuOpenId(null);
    setVehicles(prev => prev.map(v => v.id === vehicleId ? { ...v, driver_id: null, driver_name: null } : v));
    await vehicleService.assignDriver(vehicleId, null, null);
    fetchData();
  };

  // Screenshot mock entries to fallback or supplement when DB has fewer elements
  const sampleList = [
    {
      id: 'mock-1',
      token: 'TKN-4821',
      tier: 'Gold',
      plate_number: 'TN 01 AB 1234',
      model: 'BMW 5 Series',
      color: 'Black',
      owner_name: 'Rajesh Kumar',
      phone_number: '+91 98765 43210',
      status: 'Parked',
      zone: 'A',
      slot_id: 'A-12',
      driver_name: 'Arun M',
      key_code: 'K-112',
      fuel: 78,
      duration_mins: 92,
      received_at: new Date(Date.now() - 92 * 60 * 1000).toISOString(),
      amount: 350,
      payment_status: 'Pending'
    },
    {
      id: 'mock-2',
      token: 'TKN-4822',
      tier: 'Platinum',
      plate_number: 'KA 05 CD 5678',
      model: 'Mercedes E-Class',
      color: 'White',
      owner_name: 'Priya Sharma',
      phone_number: '+91 87654 32109',
      status: 'Parking',
      zone: 'B',
      slot_id: 'B-03',
      driver_name: 'Karthik R',
      key_code: 'K-113',
      fuel: 45,
      duration_mins: 75,
      received_at: new Date(Date.now() - 75 * 60 * 1000).toISOString(),
      amount: 350,
      payment_status: 'Pending'
    },
    {
      id: 'mock-3',
      token: 'TKN-4823',
      tier: 'Silver',
      plate_number: 'MH 12 EF 9012',
      model: 'Audi Q7',
      color: 'Grey',
      owner_name: 'Amit Patel',
      phone_number: '+91 78543 21098',
      status: 'Parked',
      zone: 'A',
      slot_id: 'A-07',
      driver_name: 'Suresh P',
      key_code: 'K-114',
      fuel: 60,
      duration_mins: 122,
      received_at: new Date(Date.now() - 122 * 60 * 1000).toISOString(),
      amount: 450,
      payment_status: 'Pending'
    },
    {
      id: 'mock-4',
      token: 'TKN-4824',
      tier: 'Standard',
      plate_number: 'AP 09 GH 3456',
      model: 'Toyota Fortuner',
      color: 'Silver',
      owner_name: 'Sneha Reddy',
      phone_number: '+91 85432 10987',
      status: 'Delivering',
      zone: 'C',
      slot_id: 'C-01',
      driver_name: 'Vijay K',
      key_code: 'K-115',
      fuel: 82,
      duration_mins: 167,
      received_at: new Date(Date.now() - 167 * 60 * 1000).toISOString(),
      amount: 500,
      payment_status: 'Paid'
    },
    {
      id: 'mock-5',
      token: 'TKN-4825',
      tier: 'Platinum',
      plate_number: 'DL 03 IJ 7890',
      model: 'Range Rover Velar',
      color: 'Blue',
      owner_name: 'Vikram Singh',
      phone_number: '+91 54321 09876',
      status: 'Received',
      zone: '',
      slot_id: '—',
      driver_name: 'Arun M',
      key_code: 'K-116',
      fuel: 90,
      duration_mins: 5,
      received_at: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
      amount: 0,
      payment_status: 'Complimentary'
    },
    {
      id: 'mock-6',
      token: 'TKN-4826',
      tier: 'Standard',
      plate_number: 'KL 07 KL 2345',
      model: 'Volvo XC90',
      color: 'Red',
      owner_name: 'Meera Nair',
      phone_number: '+91 43210 98765',
      status: 'Parked',
      zone: 'B',
      slot_id: 'B-11',
      driver_name: 'Karthik R',
      key_code: 'K-117',
      fuel: 55,
      duration_mins: 158,
      received_at: new Date(Date.now() - 158 * 60 * 1000).toISOString(),
      amount: 400,
      payment_status: 'Pending'
    },
    {
      id: 'mock-7',
      token: 'TKN-4827',
      tier: 'Gold',
      plate_number: 'TN 09 MN 6789',
      model: 'Jaguar F-Pace',
      color: 'Green',
      owner_name: 'Arjun Menon',
      phone_number: '+91 32109 87654',
      status: 'Ready',
      zone: 'A',
      slot_id: 'A-03',
      driver_name: 'Suresh P',
      key_code: 'K-118',
      fuel: 38,
      duration_mins: 213,
      received_at: new Date(Date.now() - 213 * 60 * 1000).toISOString(),
      amount: 600,
      payment_status: 'Pending'
    },
    {
      id: 'mock-8',
      token: 'TKN-4828',
      tier: 'Standard',
      plate_number: 'TN 22 OP 0123',
      model: 'Honda City',
      color: 'White',
      owner_name: 'Divya Iyer',
      phone_number: '+91 21098 76543',
      status: 'Returned',
      zone: '',
      slot_id: '—',
      driver_name: 'Vijay K',
      key_code: 'K-119',
      fuel: 65,
      duration_mins: 135,
      received_at: new Date(Date.now() - 135 * 60 * 1000).toISOString(),
      amount: 250,
      payment_status: 'Paid'
    },
    {
      id: 'mock-9',
      token: 'TKN-4829',
      tier: 'Platinum',
      plate_number: 'GJ 01 RS 4567',
      model: 'Tesla Model Y',
      color: 'Pearl White',
      owner_name: 'Karan Mehta',
      phone_number: '+91 99887 12345',
      status: 'Parked',
      zone: 'EV',
      slot_id: 'EV-02',
      driver_name: 'Karthik R',
      key_code: 'K-119',
      fuel: 88,
      duration_mins: 40,
      received_at: new Date(Date.now() - 40 * 60 * 1000).toISOString(),
      amount: 500,
      payment_status: 'Pending'
    },
    {
      id: 'mock-10',
      token: 'TKN-4830',
      tier: 'Gold',
      plate_number: 'MH 02 TU 8901',
      model: 'Jeep Compass',
      color: 'Black',
      owner_name: 'Nisha Kapoor',
      phone_number: '+91 88776 54321',
      status: 'Parked',
      zone: 'VIP',
      slot_id: 'VIP-01',
      driver_name: 'Suresh P',
      key_code: 'K-120',
      fuel: 70,
      duration_mins: 30,
      received_at: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
      amount: 800,
      payment_status: 'Pending'
    }
  ];

  // Helper to resolve customer info from phone or plate number
  const getCustomerInfo = (phone, plate) => {
    const matched = (customers || []).find(c => 
      (phone && c.phone === phone) || 
      (plate && c.vehicles && c.vehicles.includes(plate))
    );
    return matched || null;
  };

  // Merge Supabase entries
  const mergedVehicles = (vehicles || []).map((v, i) => {
    const cust = getCustomerInfo(v.phone_number, v.plate_number);
    
    // Compute duration in mins since check-in
    const diffMs = Date.now() - new Date(v.received_at).getTime();
    const computedDuration = diffMs > 0 ? Math.floor(diffMs / (60 * 1000)) : 0;

    return {
      id: v.id,
      token: v.token || `TKN-${v.id.slice(0, 4).toUpperCase()}`,
      tier: cust?.tier || 'Standard',
      plate_number: v.plate_number,
      model: v.model || 'Vehicle',
      color: v.color || 'Unknown',
      owner_name: cust?.name || v.owner_name || 'Guest',
      phone_number: v.phone_number || '+91 99999 88888',
      status: v.status,
      zone: v.zone || 'A',
      slot_id: v.slot_id || '—',
      driver_name: v.driver_name || 'Unassigned',
      key_code: v.key_code || `K-${v.id.slice(0, 3).toUpperCase()}`,
      fuel: parseInt(v.fuel_level) || 50,
      duration_mins: computedDuration,
      received_at: v.received_at,
      amount: Number(v.payment_amount) || (v.status === 'Returned' ? 200 : 0),
      payment_status: v.payment_status || (v.status === 'Returned' ? 'Paid' : 'Pending')
    };
  });

  // Filter tab list configuration
  const tabConfig = [
    { label: 'All', count: mergedVehicles.filter(v => v.status !== 'Returned').length },
    { label: 'Received', count: mergedVehicles.filter(v => v.status === 'Received').length, stage: 'Received' },
    { label: 'Being Parked', count: mergedVehicles.filter(v => v.status === 'Parking').length, stage: 'Parking' },
    { label: 'Parked', count: mergedVehicles.filter(v => v.status === 'Parked').length, stage: 'Parked' },
    { label: 'Ready For Return', count: mergedVehicles.filter(v => v.status === 'Ready').length, stage: 'Ready' },
    { label: 'Out For Delivery', count: mergedVehicles.filter(v => v.status === 'Delivering').length, stage: 'Delivering' },
    { label: 'Returned', count: mergedVehicles.filter(v => v.status === 'Returned').length, stage: 'Returned' }
  ];

  // Apply tab filters and search queries
  const searchedVehicles = mergedVehicles.filter(v => {
    const query = searchQuery.toLowerCase();
    return (
      (v.plate_number || '').toLowerCase().includes(query) ||
      (v.model || '').toLowerCase().includes(query) ||
      (v.owner_name || '').toLowerCase().includes(query) ||
      (v.token || '').toLowerCase().includes(query)
    );
  });

  const finalFilteredList = searchedVehicles.filter(v => {
    if (activeTab === 'All') {
      return v.status !== 'Returned'; // Exclude returned from 'All' active list
    }
    const currentTab = tabConfig.find(tab => tab.label === activeTab);
    return v.status === currentTab?.stage;
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

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', width: '100%' }}>
      {/* Title & Controls Row */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.85rem', fontWeight: '800', color: 'var(--text-main)', marginBottom: '0.25rem' }}>Live Vehicles</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', fontWeight: '500' }}>
            {mergedVehicles.filter(v => v.status !== 'Returned').length} active · {mergedVehicles.length} total today
          </p>
        </div>
        <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
          <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
            <Search size={16} style={{ position: 'absolute', left: '0.85rem', color: 'var(--text-muted)' }} />
            <input 
              type="text" 
              placeholder="Search vehicles..." 
              style={{ 
                padding: '0.55rem 0.85rem 0.55rem 2.25rem', 
                borderRadius: '10px', 
                border: '1px solid var(--border-color)',
                backgroundColor: 'var(--bg-card)',
                width: '240px',
                outline: 'none',
                color: 'var(--text-main)',
                fontSize: '0.8rem'
              }} 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <button 
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              backgroundColor: 'var(--bg-card)',
              border: '1px solid var(--border-color)',
              color: 'var(--text-main)',
              padding: '0.55rem 1rem',
              borderRadius: '10px',
              fontWeight: '700',
              fontSize: '0.8rem',
              cursor: 'pointer'
            }}
          >
            <Filter size={14} />
            <span>Filter</span>
          </button>
        </div>
      </div>

      {/* Pill Filters Navigation Row */}
      <div style={{ display: 'flex', gap: '0.5rem', overflowX: 'auto', paddingBottom: '0.5rem' }}>
        {tabConfig.map(tab => (
          <button
            key={tab.label}
            onClick={() => setActiveTab(tab.label)}
            style={{
              padding: '0.45rem 1rem',
              borderRadius: '20px',
              fontSize: '0.75rem',
              fontWeight: '700',
              cursor: 'pointer',
              backgroundColor: activeTab === tab.label ? 'var(--accent-alpha)' : 'var(--bg-card)',
              color: activeTab === tab.label ? 'var(--accent)' : 'var(--text-muted)',
              border: activeTab === tab.label ? '1px solid var(--accent)' : '1px solid var(--border-color)',
              whiteSpace: 'nowrap',
              transition: 'all 0.2s ease'
            }}
          >
            {tab.label} ({tab.count})
          </button>
        ))}
      </div>

      {/* Live Vehicles Table */}
      <div style={{ 
        backgroundColor: 'var(--bg-card)', 
        border: '1px solid var(--border-color)', 
        borderRadius: '12px',
        overflow: 'hidden'
      }}>
        {loading ? (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '4rem' }}>
            <Loader2 size={36} className="animate-spin" style={{ color: 'var(--accent)' }} />
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border-color)', backgroundColor: 'rgba(0,0,0,0.1)' }}>
                  <th style={{ padding: '1rem', fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Token / Tier</th>
                  <th style={{ padding: '1rem', fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Vehicle</th>
                  <th style={{ padding: '1rem', fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Customer</th>
                  <th style={{ padding: '1rem', fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Status</th>
                  <th style={{ padding: '1rem', fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Zone/Slot</th>
                  <th style={{ padding: '1rem', fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Staff / Key</th>
                  <th style={{ padding: '1rem', fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Fuel</th>
                  <th style={{ padding: '1rem', fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Duration</th>
                  <th style={{ padding: '1rem', fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Amount</th>
                  <th style={{ padding: '1.25rem 1rem', width: '40px' }}></th>
                </tr>
              </thead>
              <tbody>
                {finalFilteredList.map((item) => {
                  const tierStyle = getTierStyle(item.tier);
                  const displayStatus = STATUS_LABELS[item.status] || item.status.toUpperCase();
                  
                  // Status badge colors
                  let statusBg = 'rgba(100, 116, 139, 0.08)';
                  let statusColor = '#94a3b8';
                  if (item.status === 'Parked') {
                    statusBg = 'rgba(16, 185, 129, 0.08)';
                    statusColor = '#10b981';
                  } else if (item.status === 'Parking' || item.status === 'Delivering') {
                    statusBg = 'rgba(245, 158, 11, 0.08)';
                    statusColor = '#f59e0b';
                  } else if (item.status === 'Received') {
                    statusBg = 'rgba(59, 130, 246, 0.08)';
                    statusColor = '#3b82f6';
                  } else if (item.status === 'Ready') {
                    statusBg = 'rgba(251, 191, 36, 0.08)';
                    statusColor = '#fbbf24';
                  }

                  return (
                    <tr 
                      key={item.id} 
                      style={{ 
                        borderBottom: '1px solid var(--border-color)',
                        transition: 'background-color 0.2s'
                      }}
                      onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.01)'}
                      onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                    >
                      {/* Token / Tier */}
                      <td style={{ padding: '1rem', verticalAlign: 'middle' }}>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem', alignItems: 'flex-start' }}>
                          <span style={{ fontSize: '0.85rem', fontWeight: '700', color: '#fbbf24' }}>{item.token}</span>
                          <span style={{ 
                            fontSize: '0.6rem', 
                            fontWeight: '700', 
                            padding: '0.1rem 0.35rem', 
                            borderRadius: '4px',
                            backgroundColor: tierStyle.bg,
                            color: tierStyle.color,
                            border: tierStyle.border
                          }}>
                            {item.tier}
                          </span>
                        </div>
                      </td>

                      {/* Vehicle */}
                      <td style={{ padding: '1rem', verticalAlign: 'middle' }}>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.15rem' }}>
                          <span style={{ fontSize: '0.85rem', fontWeight: '700', color: 'var(--text-main)' }}>{item.plate_number}</span>
                          <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>{item.model} · {item.color}</span>
                        </div>
                      </td>

                      {/* Customer */}
                      <td style={{ padding: '1rem', verticalAlign: 'middle' }}>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.15rem' }}>
                          <span style={{ fontSize: '0.85rem', fontWeight: '700', color: 'var(--text-main)' }}>{item.owner_name}</span>
                          <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                            <Smartphone size={11} style={{ opacity: 0.8 }} />
                            {item.phone_number}
                          </span>
                        </div>
                      </td>

                      {/* Status */}
                      <td style={{ padding: '1rem', verticalAlign: 'middle' }}>
                        <span style={{
                          fontSize: '0.65rem',
                          fontWeight: '700',
                          padding: '0.2rem 0.5rem',
                          borderRadius: '4px',
                          backgroundColor: statusBg,
                          color: statusColor,
                          border: `1px solid ${statusBg.replace('0.08', '0.15')}`
                        }}>
                          {displayStatus}
                        </span>
                      </td>

                      {/* Zone / Slot */}
                      <td style={{ padding: '1rem', verticalAlign: 'middle', fontSize: '0.85rem', fontWeight: '700', color: 'var(--text-main)' }}>
                        {item.zone && item.slot_id ? `${item.zone} / ${item.slot_id}` : '—'}
                      </td>

                      {/* Staff / Key */}
                      <td style={{ padding: '1rem', verticalAlign: 'middle' }}>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.15rem' }}>
                          <span style={{ fontSize: '0.85rem', fontWeight: '600', color: 'var(--text-main)' }}>{item.driver_name}</span>
                          <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                            <Key size={11} style={{ opacity: 0.8 }} />
                            {item.key_code}
                          </span>
                        </div>
                      </td>

                      {/* Fuel */}
                      <td style={{ padding: '1rem', verticalAlign: 'middle' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                          <Fuel size={14} style={{ color: 'var(--text-muted)' }} />
                          <div style={{ width: '60px', height: '6px', backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: '3px', overflow: 'hidden' }}>
                            <div style={{ width: `${item.fuel}%`, height: '100%', backgroundColor: '#fbbf24', borderRadius: '3px' }} />
                          </div>
                          <span style={{ fontSize: '0.75rem', fontWeight: '600', color: 'var(--text-muted)' }}>{item.fuel}%</span>
                        </div>
                      </td>

                      {/* Duration */}
                      <td style={{ padding: '1rem', verticalAlign: 'middle' }}>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.15rem' }}>
                          <span style={{ fontSize: '0.85rem', fontWeight: '700', color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                            <Clock size={12} style={{ opacity: 0.8 }} />
                            {item.duration_mins}m
                          </span>
                          <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>
                            in @ {formatReceivedTime(item.received_at)}
                          </span>
                        </div>
                      </td>

                      {/* Amount */}
                      <td style={{ padding: '1rem', verticalAlign: 'middle' }}>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.15rem' }}>
                          <span style={{ fontSize: '0.85rem', fontWeight: '700', color: 'var(--text-main)' }}>
                            ₹ {item.amount}
                          </span>
                          <span style={{ 
                            fontSize: '0.65rem', 
                            color: item.payment_status === 'Paid' ? '#10b981' : item.payment_status === 'Complimentary' ? '#3b82f6' : 'var(--text-muted)',
                            fontWeight: '600'
                          }}>
                            {item.payment_status}
                          </span>
                        </div>
                      </td>

                      {/* Actions Menu Trigger */}
                      <td style={{ padding: '1rem', verticalAlign: 'middle', position: 'relative' }}>
                        <button 
                          onClick={() => setActionMenuOpenId(actionMenuOpenId === item.id ? null : item.id)}
                          style={{ color: 'var(--text-muted)', cursor: 'pointer', padding: '0.25rem', borderRadius: '6px' }}
                        >
                          <MoreVertical size={16} />
                        </button>

                        {/* Interactive Context Menu */}
                        {actionMenuOpenId === item.id && (
                          <div 
                            ref={actionMenuRef}
                            style={{
                              position: 'absolute',
                              top: '2.5rem',
                              right: '1rem',
                              backgroundColor: '#0f1524',
                              border: '1px solid var(--border-color)',
                              borderRadius: '10px',
                              boxShadow: '0 10px 25px -5px rgba(0,0,0,0.5)',
                              zIndex: 1000,
                              minWidth: '180px',
                              overflow: 'visible'
                            }}
                          >
                            <div style={{ padding: '0.5rem 0.75rem', fontSize: '0.65rem', fontWeight: '700', color: 'var(--text-muted)', textTransform: 'uppercase', borderBottom: '1px solid var(--border-color)' }}>
                              Actions
                            </div>
                            
                            {/* Stage progression */}
                            {NEXT_STATUS[item.status] && NEXT_STATUS[item.status] !== 'Parking' && (
                              <button
                                onClick={() => handleStatusChange(item.id, NEXT_STATUS[item.status])}
                                style={{
                                  width: '100%',
                                  padding: '0.6rem 0.75rem',
                                  fontSize: '0.75rem',
                                  color: '#ffffff',
                                  textAlign: 'left',
                                  backgroundColor: 'transparent',
                                  border: 'none',
                                  cursor: 'pointer',
                                  display: 'flex',
                                  alignItems: 'center',
                                  gap: '0.5rem'
                                }}
                                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.03)'}
                                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                              >
                                <CheckCircle2 size={13} style={{ color: '#10b981' }} />
                                <span>Move to {STATUS_LABELS[NEXT_STATUS[item.status]]}</span>
                              </button>
                            )}

                            {/* Driver Assign trigger */}
                            <button
                              onClick={() => setDriverMenuOpenId(driverMenuOpenId === item.id ? null : item.id)}
                              style={{
                                width: '100%',
                                padding: '0.6rem 0.75rem',
                                fontSize: '0.75rem',
                                color: '#ffffff',
                                textAlign: 'left',
                                backgroundColor: 'transparent',
                                border: 'none',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.5rem',
                                justifyContent: 'space-between'
                              }}
                              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.03)'}
                              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                            >
                              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                <User size={13} style={{ color: '#fbbf24' }} />
                                <span>Assign Driver</span>
                              </div>
                              <span style={{ fontSize: '0.6rem' }}>▶</span>
                            </button>

                            {/* Driver sub-menu */}
                            {driverMenuOpenId === item.id && (
                              <div 
                                ref={driverMenuRef}
                                style={{
                                  position: 'absolute',
                                  top: '2.5rem',
                                  right: '11.5rem',
                                  backgroundColor: '#0f1524',
                                  border: '1px solid var(--border-color)',
                                  borderRadius: '10px',
                                  boxShadow: '0 10px 25px -5px rgba(0,0,0,0.5)',
                                  zIndex: 1001,
                                  minWidth: '160px',
                                  maxHeight: '200px',
                                  overflowY: 'auto'
                                }}
                              >
                                <div style={{ padding: '0.5rem 0.75rem', fontSize: '0.65rem', fontWeight: '700', color: 'var(--text-muted)', textTransform: 'uppercase', borderBottom: '1px solid var(--border-color)' }}>
                                  Drivers
                                </div>
                                {staff.map(member => (
                                  <button
                                    key={member.id}
                                    onClick={() => handleAssignDriver(item.id, member.id, member.name)}
                                    style={{
                                      width: '100%',
                                      padding: '0.55rem 0.75rem',
                                      fontSize: '0.75rem',
                                      color: '#ffffff',
                                      textAlign: 'left',
                                      backgroundColor: item.driver_name === member.name ? 'rgba(251, 191, 36, 0.08)' : 'transparent',
                                      border: 'none',
                                      cursor: 'pointer',
                                      display: 'flex',
                                      alignItems: 'center',
                                      gap: '0.5rem'
                                    }}
                                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.03)'}
                                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                                  >
                                    <UserCheck size={12} style={{ color: '#10b981' }} />
                                    <span>{member.name}</span>
                                  </button>
                                ))}
                                {item.driver_name !== 'Unassigned' && (
                                  <button
                                    onClick={() => handleUnassignDriver(item.id)}
                                    style={{
                                      width: '100%',
                                      padding: '0.55rem 0.75rem',
                                      fontSize: '0.75rem',
                                      color: '#ef4444',
                                      textAlign: 'left',
                                      backgroundColor: 'transparent',
                                      border: 'none',
                                      cursor: 'pointer',
                                      display: 'flex',
                                      alignItems: 'center',
                                      gap: '0.5rem',
                                      borderTop: '1px solid var(--border-color)'
                                    }}
                                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(239, 68, 68, 0.05)'}
                                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                                  >
                                    <UserX size={12} />
                                    <span>Remove Driver</span>
                                  </button>
                                )}
                              </div>
                            )}
                          </div>
                        )}
                      </td>
                    </tr>
                  );
                })}
                {finalFilteredList.length === 0 && (
                  <tr>
                    <td colSpan="10" style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                      No vehicles found matching criteria.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default Pipeline;
