import React, { useEffect, useState } from 'react';
import { 
  Car, 
  Clock, 
  Users, 
  AlertTriangle, 
  TrendingUp, 
  Timer, 
  IndianRupee, 
  Crown, 
  Zap, 
  Star, 
  MapPin,
  ChevronDown,
  Search,
  Plus
} from 'lucide-react';
import { vehicleService } from '../../services/vehicleService';
import { useAuth } from '../../context/AuthContext';
import CheckInModal from '../../components/valet/CheckInModal';
import { supabase } from '../../lib/supabase';
import { staffService } from '../../services/staffService';

// Styled Square P icon for Parking
const ParkingIcon = ({ size = 20, color = 'currentColor' }) => (
  <div style={{ 
    fontWeight: '800', 
    fontSize: `${size * 0.5}px`, 
    border: `2px solid ${color}`, 
    width: `${size}px`, 
    height: `${size}px`, 
    display: 'flex', 
    alignItems: 'center', 
    justifyContent: 'center', 
    borderRadius: '4px',
    lineHeight: 1
  }}>
    P
  </div>
);

// Stat Card component matching screenshot styles
const StatCard = ({ title, value, icon: Icon, iconColor = '#3b82f6', iconBg = 'rgba(59, 130, 246, 0.1)' }) => {
  return (
    <div style={{
      backgroundColor: 'var(--bg-card)',
      border: '1px solid var(--border-color)',
      borderRadius: '12px',
      padding: '1.25rem 1rem',
      display: 'flex',
      flexDirection: 'column',
      gap: '0.75rem',
      flex: '1 1 150px',
      minWidth: '150px'
    }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
        <div style={{ 
          width: '32px', 
          height: '32px', 
          borderRadius: '8px', 
          backgroundColor: iconBg, 
          color: iconColor, 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center',
          flexShrink: 0
        }}>
          {React.isValidElement(Icon) ? Icon : <Icon size={18} />}
        </div>
        <span style={{ 
          fontSize: '0.65rem', 
          color: 'var(--text-muted)', 
          fontWeight: '700', 
          textTransform: 'uppercase', 
          letterSpacing: '0.05em',
          textAlign: 'right'
        }}>
          {title}
        </span>
      </div>
      <div style={{ fontSize: '1.5rem', fontWeight: '800', color: '#ffffff', lineHeight: 1.1 }}>
        {value}
      </div>
    </div>
  );
};

// Zone Card component
const ZoneCard = ({ zoneName, current, max, type, subtitle, color, percentage }) => {
  return (
    <div style={{
      backgroundColor: 'var(--bg-card)',
      border: '1px solid var(--border-color)',
      borderRadius: '12px',
      padding: '1rem',
      display: 'flex',
      flexDirection: 'column',
      gap: '0.75rem',
      flex: 1,
      minWidth: '160px'
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={{ fontSize: '0.85rem', fontWeight: '700', color: '#ffffff' }}>{zoneName}</span>
        <span style={{ 
          fontSize: '0.65rem', 
          fontWeight: '700', 
          padding: '0.15rem 0.4rem', 
          borderRadius: '4px',
          backgroundColor: type === 'EV' ? 'rgba(59, 130, 246, 0.15)' : type === 'VIP' ? 'rgba(251, 191, 36, 0.15)' : 'rgba(255, 255, 255, 0.05)',
          color: type === 'EV' ? '#3b82f6' : type === 'VIP' ? '#fbbf24' : '#64748b',
          border: `1px solid ${type === 'EV' ? 'rgba(59, 130, 246, 0.2)' : type === 'VIP' ? 'rgba(251, 191, 36, 0.2)' : 'rgba(255, 255, 255, 0.1)'}`
        }}>
          {type}
        </span>
      </div>
      <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.15rem' }}>
        <span style={{ fontSize: '1.4rem', fontWeight: '800', color: '#ffffff' }}>{current}</span>
        <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>/{max}</span>
      </div>
      <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', lineHeight: 1 }}>{subtitle}</div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem', marginTop: 'auto' }}>
        <div style={{ width: '100%', height: '6px', backgroundColor: 'rgba(255, 255, 255, 0.05)', borderRadius: '3px', overflow: 'hidden' }}>
          <div style={{ width: `${percentage}%`, height: '100%', backgroundColor: color, borderRadius: '3px' }} />
        </div>
        <div style={{ display: 'flex', justifyContent: 'flex-end', fontSize: '0.65rem', color: 'var(--text-muted)' }}>
          {percentage}% full
        </div>
      </div>
    </div>
  );
};

const ValetDashboard = () => {
  const { locationId, locations } = useAuth();
  const [stats, setStats] = useState({ received: 0, parked: 0, requested: 0 });
  const [activities, setActivities] = useState([]);
  const [staff, setStaff] = useState([]);
  const [incidents, setIncidents] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isCheckinModalOpen, setIsCheckinModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const fetchData = async () => {
    if (!locationId) {
      setLoading(false);
      return;
    }
    try {
      setLoading(true);
      
      // 1. Fetch active vehicles
      const { data: vehicleData } = await vehicleService.getActiveVehicles(locationId);
      if (vehicleData) setActivities(vehicleData);

      // 2. Fetch stats
      const { data: statsData } = await vehicleService.getStats(locationId);
      if (statsData) setStats(statsData);

      // 3. Fetch staff
      const { data: staffData } = await staffService.getStaff(locationId);
      if (staffData) setStaff(staffData);

      // 4. Fetch incidents
      const { data: incidentsData } = await supabase
        .from('incidents')
        .select('*')
        .eq('location_id', locationId);
      if (incidentsData) setIncidents(incidentsData);

      // 5. Fetch customers
      const { data: customerData } = await supabase
        .from('customers')
        .select('*')
        .eq('location_id', locationId);
      if (customerData) setCustomers(customerData);

    } catch (err) {
      console.error('Error fetching dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();

    if (!locationId) return;

    const subscription = vehicleService.subscribeToVehicles(locationId, () => {
      fetchData();
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [locationId]);

  const activeLocation = (locations || []).find(loc => loc && loc.id === locationId);
  const activeLocationName = activeLocation ? (activeLocation.name || activeLocation.hotelName) : 'Grand Hyatt Chennai';

  const formatTime = (dateStr) => {
    if (!dateStr) return '';
    try {
      const d = new Date(dateStr);
      if (isNaN(d.getTime())) return '';
      return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } catch (e) {
      return '';
    }
  };

  // Helper to resolve customer info from phone or plate number
  const getCustomerInfo = (phone, plate) => {
    const matched = (customers || []).find(c => 
      (phone && c.phone === phone) || 
      (plate && c.vehicles && c.vehicles.includes(plate))
    );
    return matched || null;
  };

  // 1. Dynamic Metric Computations
  const displayActiveVehicles = (activities || []).filter(v => v && v.status !== 'Returned').length;
  const displayParkedToday = (activities || []).filter(v => v && v.status === 'Parked').length;
  const displayPendingReturns = (activities || []).filter(v => v && v.status === 'Ready').length;
  
  // Count staff whose status is On Shift
  const displayStaffOnDuty = (staff || []).filter(s => s && s.status === 'On Shift').length;

  // Occupancy percentage based on 54 slots capacity
  const totalCapacity = 54;
  const displayOccupancy = totalCapacity > 0 
    ? `${Math.round((displayActiveVehicles / totalCapacity) * 100)}%` 
    : '0%';

  // Incidents reported today
  const todayStart = new Date(new Date().setHours(0, 0, 0, 0));
  const displayIncidentsToday = (incidents || []).filter(i => i && new Date(i.created_at) >= todayStart).length;

  // Average retrieval time: delivered_at - requested_at
  const returnedVehicles = (activities || []).filter(v => v && v.status === 'Returned' && v.requested_at && v.delivered_at);
  const totalRetrievalSeconds = returnedVehicles.reduce((sum, v) => {
    const diffMs = new Date(v.delivered_at) - new Date(v.requested_at);
    return sum + (diffMs > 0 ? diffMs / 1000 : 0);
  }, 0);
  const avgRetrievalSeconds = returnedVehicles.length > 0 ? totalRetrievalSeconds / returnedVehicles.length : 0;
  
  const formatSeconds = (totalSecs) => {
    if (totalSecs <= 0) return '—';
    const m = Math.floor(totalSecs / 60);
    const s = Math.round(totalSecs % 60);
    return m > 0 ? `${m}m ${s}s` : `${s}s`;
  };
  const displayAvgRetrieval = formatSeconds(avgRetrievalSeconds);

  // Total Revenue: Standard 200 INR per parked/returned vehicle + tip_amount + payment_amount
  const displayRevenueToday = (activities || []).reduce((sum, v) => {
    const fare = Number(v.payment_amount) || (v.status === 'Returned' || v.status === 'Parked' ? 200 : 0);
    const tip = Number(v.tip_amount) || 0;
    return sum + fare + tip;
  }, 0);

  // Total Tips collected today
  const displayTipsToday = (activities || []).reduce((sum, v) => sum + (Number(v.tip_amount) || 0), 0);

  // VIP Guests checked in today (Platinum/Gold customers)
  const displayVipGuests = (activities || []).filter(v => {
    if (v.status === 'Returned') return false;
    const cust = getCustomerInfo(v.phone_number, v.plate_number);
    return cust?.is_vip || cust?.tier === 'Platinum' || cust?.tier === 'Gold';
  }).length;

  // EV charging count (active vehicles parked in standard EV slot or EV zone)
  const displayEvCharging = (activities || []).filter(v => 
    v.status !== 'Returned' && 
    (String(v.zone).toUpperCase() === 'EV' || String(v.slot_id).toUpperCase().startsWith('EV-'))
  ).length;

  // Customer rating average
  const activeRatings = (customers || []).map(c => Number(c.rating)).filter(r => r > 0);
  const avgRating = activeRatings.length > 0 
    ? (activeRatings.reduce((sum, r) => sum + r, 0) / activeRatings.length).toFixed(1) 
    : '5.0';

  // Zone capacities & occupancies
  const getZoneOccupants = (zoneCode) => {
    return (activities || []).filter(v => 
      v.status !== 'Returned' && 
      (String(v.zone).toUpperCase() === String(zoneCode).toUpperCase() || 
       String(v.slot_id).toUpperCase().startsWith(`${String(zoneCode).toUpperCase()}-`))
    ).length;
  };
  
  const zoneOccupancy = {
    A: { current: getZoneOccupants('A'), max: 18, type: 'Standard', subtitle: 'Ground - 1 reserved', pct: Math.round((getZoneOccupants('A') / 18) * 100), color: '#f59e0b' },
    B: { current: getZoneOccupants('B'), max: 16, type: 'Standard', subtitle: 'Ground - 2 reserved', pct: Math.round((getZoneOccupants('B') / 16) * 100), color: '#f59e0b' },
    C: { current: getZoneOccupants('C'), max: 12, type: 'Standard', subtitle: 'Basement 1 - 0 reserved', pct: Math.round((getZoneOccupants('C') / 12) * 100), color: '#f59e0b' },
    EV: { current: getZoneOccupants('EV'), max: 4, type: 'EV', subtitle: 'Basement 1 - 1 reserved', pct: Math.round((getZoneOccupants('EV') / 4) * 100), color: '#3b82f6' },
    VIP: { current: getZoneOccupants('VIP'), max: 4, type: 'VIP', subtitle: 'Ground - 2 reserved', pct: Math.round((getZoneOccupants('VIP') / 4) * 100), color: '#fbbf24' }
  };

  // Dynamic audit timeline generated from live activities
  const getDynamicTimeline = () => {
    const events = [];
    (activities || []).forEach(v => {
      const cust = getCustomerInfo(v.phone_number, v.plate_number);
      const tokenStr = v.token || `TKN-${v.id.slice(0, 4).toUpperCase()}`;
      
      if (v.received_at) {
        events.push({
          title: 'Vehicle checked in',
          detail: `${v.model || 'Vehicle'} - ${v.plate_number}`,
          time: formatTime(v.received_at),
          timestamp: new Date(v.received_at).getTime(),
          driver: v.driver_name || 'Unassigned',
          token: tokenStr
        });
      }
      if (v.parked_at) {
        events.push({
          title: cust?.is_vip ? 'VIP guest received' : 'Vehicle parked',
          detail: `${v.model || 'Vehicle'} parked in ${v.slot_id || 'Unassigned'}`,
          time: formatTime(v.parked_at),
          timestamp: new Date(v.parked_at).getTime(),
          driver: v.driver_name || 'Unassigned',
          token: tokenStr
        });
      }
      if (v.requested_at) {
        events.push({
          title: 'Retrieval requested',
          detail: `${v.model || 'Vehicle'} requested by ${cust?.name || 'Guest'}`,
          time: formatTime(v.requested_at),
          timestamp: new Date(v.requested_at).getTime(),
          driver: v.driver_name || 'Unassigned',
          token: tokenStr
        });
      }
      if (v.delivered_at) {
        events.push({
          title: 'Vehicle returned',
          detail: `${v.model || 'Vehicle'} delivered to guest`,
          time: formatTime(v.delivered_at),
          timestamp: new Date(v.delivered_at).getTime(),
          driver: v.driver_name || 'Unassigned',
          token: tokenStr
        });
      }
    });

    events.sort((a, b) => b.timestamp - a.timestamp);
    return events.slice(0, 4);
  };
  const timelineData = getDynamicTimeline();

  // Dynamic payments list generated from returned/paid vehicles today
  const getDynamicPayments = () => {
    const list = (activities || []).filter(v => v.status === 'Returned' || Number(v.payment_amount) > 0).map(v => {
      const cust = getCustomerInfo(v.phone_number, v.plate_number);
      const payMethod = ['Upi', 'Card', 'Cash', 'Wallet'][v.id.charCodeAt(0) % 4];
      const timeStr = v.delivered_at ? formatTime(v.delivered_at) : 'Today';
      
      return {
        name: cust?.name || v.owner_name || 'Guest',
        token: v.token || `TKN-${v.id.slice(0, 4).toUpperCase()}`,
        detail: `${payMethod} - INV-${v.id.slice(0, 4).toUpperCase()} - ${timeStr}`,
        amount: String(Number(v.payment_amount) || 200),
        tip: v.tip_amount ? `+${v.tip_amount}` : '',
        status: 'PAID'
      };
    });
    return list.slice(0, 6);
  };
  const paymentsData = getDynamicPayments();

  // Dynamic incidents list from incidents database
  const getDynamicIncidents = () => {
    return (incidents || []).slice(0, 6).map(i => {
      return {
        type: i.title || 'DAMAGE',
        severity: i.priority || 'MEDIUM',
        text: i.description || 'No description.',
        sub: `${i.plate_number || 'Unknown'} - ${i.reported_by || 'Runner'} → ${i.assigned_to || 'Supervisor'}`,
        time: formatTime(i.created_at)
      };
    });
  };
  const incidentsData = getDynamicIncidents();

  // Average park duration
  const parkedVehicles = (activities || []).filter(v => v.parked_at && v.received_at);
  const totalParkMinutes = parkedVehicles.reduce((sum, v) => {
    const diffMs = new Date(v.parked_at) - new Date(v.received_at);
    return sum + (diffMs > 0 ? diffMs / (1000 * 60) : 0);
  }, 0);
  const avgParkMins = parkedVehicles.length > 0 ? totalParkMinutes / parkedVehicles.length : 0;
  
  const formatMins = (totalMins) => {
    if (totalMins <= 0) return '—';
    const h = Math.floor(totalMins / 60);
    const m = Math.round(totalMins % 60);
    return h > 0 ? `${h}h ${m}m` : `${m}m`;
  };
  const displayAvgParkDuration = formatMins(avgParkMins);

  // Fastest retrieval duration
  const retrievalSeconds = returnedVehicles.map(v => {
    const diffMs = new Date(v.delivered_at) - new Date(v.requested_at);
    return diffMs > 0 ? diffMs / 1000 : null;
  }).filter(Boolean);
  const minRetrievalSeconds = retrievalSeconds.length > 0 ? Math.min(...retrievalSeconds) : 0;
  const displayFastestRetrieval = minRetrievalSeconds > 0 ? formatSeconds(minRetrievalSeconds) : '—';

  // Live Vehicle Feed filtered list (matching search query if any)
  const displayFeed = (activities || [])
    .filter(v => {
      if (!v) return false;
      const query = searchQuery.toLowerCase();
      return (
        v.plate_number.toLowerCase().includes(query) ||
        (v.model || '').toLowerCase().includes(query) ||
        (v.owner_name || '').toLowerCase().includes(query)
      );
    })
    .slice(0, 4)
    .map(v => {
      const cust = getCustomerInfo(v.phone_number, v.plate_number);
      const isReady = v.status === 'Ready';
      const isParked = v.status === 'Parked';
      const isDelivering = v.status === 'Delivering';
      
      let statusStr = 'CHECKED IN';
      if (isParked) statusStr = 'PARKED';
      else if (isReady) statusStr = 'READY';
      else if (isDelivering) statusStr = 'BEING RETRIEVED';
      else if (v.status === 'Returned') statusStr = 'RETURNED';

      return {
        badge: (v.model || 'V')[0].toUpperCase(),
        badgeBg: isReady ? 'rgba(245, 158, 11, 0.15)' : 'rgba(59, 130, 246, 0.15)',
        badgeColor: isReady ? '#f59e0b' : '#3b82f6',
        title: `${v.plate_number} - ${v.model || 'Vehicle'}`,
        subtitle: `${cust?.name || v.owner_name || 'Guest'} - ${v.slot_id || 'Unassigned'} - ${v.driver_name || 'Runner'}`,
        time: formatTime(v.received_at),
        status: statusStr,
        statusType: isParked ? 'green' : 'orange'
      };
    });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Top Title & Controls Row */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.85rem', fontWeight: '800', color: '#ffffff', marginBottom: '0.25rem' }}>Dashboard</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', fontWeight: '500' }}>
            {activeLocationName} · Thursday, 4 June 2026 · Peak: 10:00 AM - 11:00 AM
          </p>
        </div>
        <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
          <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
            <Search size={16} style={{ position: 'absolute', left: '0.85rem', color: 'var(--text-muted)' }} />
            <input 
              type="text" 
              placeholder="Search Plate Number..." 
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
            onClick={() => setIsCheckinModalOpen(true)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              backgroundColor: '#fbbf24',
              color: '#080c14',
              padding: '0.55rem 1rem',
              borderRadius: '10px',
              fontWeight: '700',
              fontSize: '0.8rem',
              transition: 'background-color 0.2s'
            }}
          >
            <Plus size={16} />
            <span>New Check-in</span>
          </button>
        </div>
      </div>

      {/* Stats Panel (12 KPI Cards in 2 Rows) */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '1rem' }}>
        <StatCard title="Active Vehicles" value={displayActiveVehicles} icon={Car} iconColor="#3b82f6" iconBg="rgba(59, 130, 246, 0.1)" />
        <StatCard title="Parked Today" value={displayParkedToday} icon={<ParkingIcon size={20} color="#10b981" />} iconColor="#10b981" iconBg="rgba(16, 185, 129, 0.1)" />
        <StatCard title="Pending Returns" value={displayPendingReturns} icon={Clock} iconColor="#f59e0b" iconBg="rgba(245, 158, 11, 0.1)" />
        <StatCard title="Staff On Duty" value={displayStaffOnDuty} icon={Users} iconColor="#3b82f6" iconBg="rgba(59, 130, 246, 0.1)" />
        <StatCard title="Occupancy" value={displayOccupancy} icon={TrendingUp} iconColor="#fbbf24" iconBg="rgba(251, 191, 36, 0.1)" />
        <StatCard title="Incidents Today" value={displayIncidentsToday} icon={AlertTriangle} iconColor="#ef4444" iconBg="rgba(239, 68, 68, 0.1)" />
        
        <StatCard title="Avg Retrieval" value={displayAvgRetrieval} icon={Timer} iconColor="#3b82f6" iconBg="rgba(59, 130, 246, 0.1)" />
        <StatCard title="Today Revenue" value={new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(displayRevenueToday)} icon={IndianRupee} iconColor="#10b981" iconBg="rgba(16, 185, 129, 0.1)" />
        <StatCard title="Tips Today" value={new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(displayTipsToday)} icon={TrendingUp} iconColor="#10b981" iconBg="rgba(16, 185, 129, 0.1)" />
        <StatCard title="VIP Guests" value={displayVipGuests} icon={Crown} iconColor="#fbbf24" iconBg="rgba(251, 191, 36, 0.1)" />
        <StatCard title="EV Charging" value={displayEvCharging} icon={Zap} iconColor="#3b82f6" iconBg="rgba(59, 130, 246, 0.1)" />
        <StatCard title="Customer Rating" value={avgRating} icon={Star} iconColor="#fbbf24" iconBg="rgba(251, 191, 36, 0.1)" />
      </div>

      {/* Zone Occupancy Panel */}
      <div style={{
        backgroundColor: 'var(--bg-card)',
        border: '1px solid var(--border-color)',
        borderRadius: '12px',
        padding: '1.25rem'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
          <h3 style={{ fontSize: '0.95rem', fontWeight: '800', color: '#ffffff' }}>Zone Occupancy</h3>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: '600' }}>{displayActiveVehicles} / {totalCapacity} slots</span>
        </div>
        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
          <ZoneCard zoneName="Zone A" current={zoneOccupancy.A.current} max={zoneOccupancy.A.max} type={zoneOccupancy.A.type} subtitle={zoneOccupancy.A.subtitle} percentage={zoneOccupancy.A.pct} color={zoneOccupancy.A.color} />
          <ZoneCard zoneName="Zone B" current={zoneOccupancy.B.current} max={zoneOccupancy.B.max} type={zoneOccupancy.B.type} subtitle={zoneOccupancy.B.subtitle} percentage={zoneOccupancy.B.pct} color={zoneOccupancy.B.color} />
          <ZoneCard zoneName="Zone C" current={zoneOccupancy.C.current} max={zoneOccupancy.C.max} type={zoneOccupancy.C.type} subtitle={zoneOccupancy.C.subtitle} percentage={zoneOccupancy.C.pct} color={zoneOccupancy.C.color} />
          <ZoneCard zoneName="Zone EV" current={zoneOccupancy.EV.current} max={zoneOccupancy.EV.max} type={zoneOccupancy.EV.type} subtitle={zoneOccupancy.EV.subtitle} percentage={zoneOccupancy.EV.pct} color={zoneOccupancy.EV.color} />
          <ZoneCard zoneName="Zone VIP" current={zoneOccupancy.VIP.current} max={zoneOccupancy.VIP.max} type={zoneOccupancy.VIP.type} subtitle={zoneOccupancy.VIP.subtitle} percentage={zoneOccupancy.VIP.pct} color={zoneOccupancy.VIP.color} />
        </div>
      </div>

      {/* Live Vehicle Feed & Audit Timeline split */}
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '1.5rem', alignItems: 'stretch', flexWrap: 'wrap' }}>
        {/* Live Vehicle Feed Card */}
        <div style={{
          backgroundColor: 'var(--bg-card)',
          border: '1px solid var(--border-color)',
          borderRadius: '12px',
          padding: '1.25rem',
          display: 'flex',
          flexDirection: 'column'
        }}>
          <h3 style={{ fontSize: '0.95rem', fontWeight: '800', color: '#ffffff', marginBottom: '1.25rem' }}>Live Vehicle Feed</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {displayFeed.map((item, index) => (
              <div 
                key={index} 
                style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: '1rem', 
                  paddingBottom: '0.85rem', 
                  borderBottom: index < displayFeed.length - 1 ? '1px solid var(--border-color)' : 'none' 
                }}
              >
                <div style={{ 
                  width: '36px', 
                  height: '36px', 
                  borderRadius: '50%', 
                  backgroundColor: item.badgeBg, 
                  color: item.badgeColor, 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center', 
                  fontWeight: '700',
                  fontSize: '0.85rem',
                  flexShrink: 0
                }}>
                  {item.badge}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: '0.85rem', fontWeight: '700', color: '#ffffff', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {item.title}
                  </div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {item.subtitle}
                  </div>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '0.25rem', flexShrink: 0 }}>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: '500' }}>{item.time}</span>
                  <span style={{
                    fontSize: '0.65rem',
                    fontWeight: '700',
                    padding: '0.15rem 0.4rem',
                    borderRadius: '4px',
                    backgroundColor: item.statusType === 'green' ? 'rgba(16, 185, 129, 0.15)' : 'rgba(245, 158, 11, 0.15)',
                    color: item.statusType === 'green' ? '#10b981' : '#f59e0b',
                    border: `1px solid ${item.statusType === 'green' ? 'rgba(16, 185, 129, 0.2)' : 'rgba(245, 158, 11, 0.2)'}`
                  }}>
                    {item.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Audit Timeline Card */}
        <div style={{
          backgroundColor: 'var(--bg-card)',
          border: '1px solid var(--border-color)',
          borderRadius: '12px',
          padding: '1.25rem',
          display: 'flex',
          flexDirection: 'column'
        }}>
          <h3 style={{ fontSize: '0.95rem', fontWeight: '800', color: '#ffffff', marginBottom: '1.25rem' }}>Audit Timeline</h3>
          <div style={{ 
            display: 'flex', 
            flexDirection: 'column', 
            gap: '1.15rem', 
            maxHeight: '280px', 
            overflowY: 'auto',
            paddingRight: '6px'
          }}>
            {timelineData.length > 0 ? timelineData.map((item, index) => (
              <div key={index} style={{ display: 'flex', gap: '0.75rem', position: 'relative' }}>
                {/* Visual line */}
                {index < timelineData.length - 1 && (
                  <div style={{
                    position: 'absolute',
                    left: '6px',
                    top: '16px',
                    bottom: '-16px',
                    width: '1px',
                    backgroundColor: '#1c2438'
                  }} />
                )}
                
                {/* Yellow diamond list marker */}
                <div style={{
                  width: '13px',
                  height: '13px',
                  backgroundColor: '#fbbf24',
                  borderRadius: '3px',
                  transform: 'rotate(45deg)',
                  marginTop: '4px',
                  flexShrink: 0
                }} />

                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.15rem', minWidth: 0 }}>
                  <span style={{ fontSize: '0.8rem', fontWeight: '700', color: '#ffffff' }}>{item.title}</span>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-main)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {item.detail}
                  </span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', flexWrap: 'wrap', marginTop: '0.1rem' }}>
                    <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>{item.time}</span>
                    <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>·</span>
                    <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>{item.driver}</span>
                    <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>·</span>
                    <span style={{ 
                      fontSize: '0.65rem', 
                      fontWeight: '700',
                      backgroundColor: 'rgba(251, 191, 36, 0.12)', 
                      color: '#fbbf24', 
                      padding: '0.05rem 0.25rem', 
                      borderRadius: '3px'
                    }}>
                      {item.token}
                    </span>
                  </div>
                </div>
              </div>
            )) : (
              <div style={{ color: 'var(--text-muted)', fontSize: '0.75rem', textAlign: 'center', padding: '2.5rem 0' }}>
                No events logged today.
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Recent Payments & Recent Incidents Split */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', alignItems: 'stretch', flexWrap: 'wrap' }}>
        {/* Recent Payments Card */}
        <div style={{
          backgroundColor: 'var(--bg-card)',
          border: '1px solid var(--border-color)',
          borderRadius: '12px',
          padding: '1.25rem',
          display: 'flex',
          flexDirection: 'column'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
            <h3 style={{ fontSize: '0.95rem', fontWeight: '800', color: '#ffffff' }}>Recent Payments</h3>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: '600' }}>{paymentsData.length} transactions</span>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.95rem' }}>
            {paymentsData.length > 0 ? paymentsData.map((item, index) => (
              <div 
                key={index} 
                style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'space-between',
                  paddingBottom: '0.75rem', 
                  borderBottom: index < paymentsData.length - 1 ? '1px solid var(--border-color)' : 'none' 
                }}
              >
                <div style={{ minWidth: 0, flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.4rem', flexWrap: 'wrap' }}>
                    <span style={{ fontSize: '0.8rem', fontWeight: '700', color: '#ffffff', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {item.name}
                    </span>
                    <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)', fontWeight: '600' }}>{item.token}</span>
                  </div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', marginTop: '0.1rem' }}>
                    {item.detail}
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexShrink: 0 }}>
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
                    <span style={{ fontSize: '0.85rem', fontWeight: '800', color: '#ffffff' }}>
                      ₹ {item.amount}
                    </span>
                    {item.tip && (
                      <span style={{ fontSize: '0.65rem', color: '#10b981', fontWeight: '700' }}>
                        {item.tip} tip
                      </span>
                    )}
                  </div>
                  <span style={{
                    fontSize: '0.65rem',
                    fontWeight: '700',
                    padding: '0.15rem 0.4rem',
                    borderRadius: '4px',
                    backgroundColor: item.status === 'PAID' ? 'rgba(16, 185, 129, 0.08)' : item.status === 'PENDING' ? 'rgba(245, 158, 11, 0.08)' : 'rgba(59, 130, 246, 0.08)',
                    color: item.status === 'PAID' ? '#10b981' : item.status === 'PENDING' ? '#f59e0b' : '#3b82f6',
                    border: `1px solid ${item.status === 'PAID' ? 'rgba(16, 185, 129, 0.15)' : item.status === 'PENDING' ? 'rgba(245, 158, 11, 0.15)' : 'rgba(59, 130, 246, 0.15)'}`
                  }}>
                    {item.status}
                  </span>
                </div>
              </div>
            )) : (
              <div style={{ color: 'var(--text-muted)', fontSize: '0.75rem', textAlign: 'center', padding: '2.5rem 0' }}>
                No payments recorded today.
              </div>
            )}
          </div>
        </div>

        {/* Recent Incidents Card */}
        <div style={{
          backgroundColor: 'var(--bg-card)',
          border: '1px solid var(--border-color)',
          borderRadius: '12px',
          padding: '1.25rem',
          display: 'flex',
          flexDirection: 'column'
        }}>
          <h3 style={{ fontSize: '0.95rem', fontWeight: '800', color: '#ffffff', marginBottom: '1.25rem' }}>Recent Incidents</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.95rem', overflowY: 'auto', maxHeight: '360px', paddingRight: '4px' }}>
            {incidentsData.length > 0 ? incidentsData.map((item, index) => {
              const badgeColor = item.severity === 'HIGH' ? '#ef4444' : item.severity === 'MEDIUM' ? '#f59e0b' : '#10b981';
              const badgeBg = item.severity === 'HIGH' ? 'rgba(239, 68, 68, 0.1)' : item.severity === 'MEDIUM' ? 'rgba(245, 158, 11, 0.1)' : 'rgba(16, 185, 129, 0.1)';
              const badgeBorder = item.severity === 'HIGH' ? 'rgba(239, 68, 68, 0.15)' : item.severity === 'MEDIUM' ? 'rgba(245, 158, 11, 0.15)' : 'rgba(16, 185, 129, 0.15)';
              
              return (
                <div 
                  key={index} 
                  style={{ 
                    display: 'flex', 
                    flexDirection: 'column',
                    gap: '0.35rem',
                    paddingBottom: '0.75rem', 
                    borderBottom: index < incidentsData.length - 1 ? '1px solid var(--border-color)' : 'none' 
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ display: 'flex', gap: '0.35rem' }}>
                      <span style={{ 
                        fontSize: '0.6rem', 
                        fontWeight: '800', 
                        padding: '0.1rem 0.35rem', 
                        borderRadius: '3px',
                        backgroundColor: '#1e293b',
                        color: '#94a3b8',
                        border: '1px solid #334155'
                      }}>{item.type}</span>
                      <span style={{ 
                        fontSize: '0.6rem', 
                        fontWeight: '800', 
                        padding: '0.1rem 0.35rem', 
                        borderRadius: '3px',
                        backgroundColor: badgeBg,
                        color: badgeColor,
                        border: `1px solid ${badgeBorder}`
                      }}>{item.severity}</span>
                    </div>
                    <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>{item.time}</span>
                  </div>
                  <div style={{ fontSize: '0.78rem', color: '#ffffff', fontWeight: '500', lineHeight: 1.3 }}>
                    {item.text}
                  </div>
                  <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                    {item.sub}
                  </div>
                </div>
              );
            }) : (
              <div style={{ color: 'var(--text-muted)', fontSize: '0.75rem', textAlign: 'center', padding: '2.5rem 0' }}>
                No incidents reported today.
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Bottom Operational Performance Card */}
      <div style={{
        backgroundColor: 'var(--bg-card)',
        border: '1px solid var(--border-color)',
        borderRadius: '12px',
        padding: '1.25rem'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <TrendingUp size={16} style={{ color: '#fbbf24' }} />
            <h3 style={{ fontSize: '0.95rem', fontWeight: '800', color: '#ffffff' }}>Operational Performance</h3>
          </div>
          <span style={{ fontSize: '0.75rem', color: '#fbbf24', fontWeight: '600' }}>Fastest retrieval today: {displayFastestRetrieval}</span>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1.5rem', padding: '0.5rem 0' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
            <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Avg Park Duration
            </span>
            <span style={{ fontSize: '1.25rem', fontWeight: '800', color: '#ffffff' }}>{displayAvgParkDuration}</span>
          </div>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
            <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Avg Retrieval
            </span>
            <span style={{ fontSize: '1.25rem', fontWeight: '800', color: '#ffffff' }}>{displayAvgRetrieval}</span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
            <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Peak Hour
            </span>
            <span style={{ fontSize: '1.25rem', fontWeight: '800', color: '#ffffff' }}>10:00 AM - 11:00 AM</span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
            <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Customer Rating
            </span>
            <span style={{ fontSize: '1.25rem', fontWeight: '800', color: '#fbbf24', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
              ★ {avgRating}
            </span>
          </div>
        </div>
      </div>

      <CheckInModal 
        isOpen={isCheckinModalOpen} 
        onClose={() => setIsCheckinModalOpen(false)} 
        locationId={locationId}
      />
    </div>
  );
};

export default ValetDashboard;
