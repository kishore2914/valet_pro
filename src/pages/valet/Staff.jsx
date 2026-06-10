import React, { useState, useEffect } from 'react';
import { 
  Users, 
  Search, 
  Plus, 
  Star,
  Shield,
  Clock,
  Loader2,
  Mail,
  Lock,
  Phone,
  Calendar,
  X,
  FileText
} from 'lucide-react';

import { useAuth } from '../../context/AuthContext';
import { staffService } from '../../services/staffService';
import { locationService } from '../../services/locationService';
import { supabase } from '../../lib/supabase';

// Base mock staff profiles matching screenshot details
const mockStaff = [
  {
    id: 'staff-1',
    name: 'Arun M',
    role: 'Valet',
    zone: 'Zone A',
    status: 'On Duty',
    today_vehicles: 12,
    hours: 5.2,
    tips: 850,
    rating: 4.8,
    trips: 2480,
    shift: '6AM - 2PM',
    phone: '+91 90000 11111',
    joined: 'Jun 2023',
    speaks: 'Tamil, English',
    license: 'TN-DL-2020-7740',
    clock_in: '06:02 AM',
    clock_out: '—'
  },
  {
    id: 'staff-2',
    name: 'Karthik R',
    role: 'Valet',
    zone: 'Zone B',
    status: 'On Duty',
    today_vehicles: 9,
    hours: 5.1,
    tips: 620,
    rating: 4.6,
    trips: 1980,
    shift: '6AM - 2PM',
    phone: '+91 90000 22222',
    joined: 'Feb 2024',
    speaks: 'Tamil, Hindi',
    license: 'TN-DL-2021-3360',
    clock_in: '06:05 AM',
    clock_out: '—'
  },
  {
    id: 'staff-3',
    name: 'Suresh P',
    role: 'Supervisor',
    zone: 'Zone All',
    status: 'On Duty',
    today_vehicles: 5,
    hours: 5.5,
    tips: 400,
    rating: 4.9,
    trips: 4920,
    shift: '6AM - 2PM',
    phone: '+91 90000 33333',
    joined: 'Nov 2022',
    speaks: 'Tamil, English',
    license: 'TN-DL-2017-8829',
    clock_in: '05:58 AM',
    clock_out: '—'
  },
  {
    id: 'staff-4',
    name: 'Mani T',
    role: 'Valet',
    zone: 'Zone C',
    status: 'Off Duty',
    today_vehicles: 0,
    hours: 0,
    tips: 0,
    rating: 4.4,
    trips: 740,
    shift: '10PM - 6AM',
    phone: '+91 90000 77777',
    joined: 'Sep 2023',
    speaks: 'Tamil',
    license: 'TN-DL-2022-5510',
    clock_in: '—',
    clock_out: '—'
  },
  {
    id: 'staff-5',
    name: 'Bala N',
    role: 'Supervisor',
    zone: 'Zone All',
    status: 'Off Duty',
    today_vehicles: 0,
    hours: 0,
    tips: 0,
    rating: 4.8,
    trips: 5820,
    shift: '2PM - 10PM',
    phone: '+91 90000 88888',
    joined: 'Apr 2020',
    speaks: 'Tamil, English, Malayalam',
    license: 'TN-DL-2014-2288',
    clock_in: '—',
    clock_out: '—'
  }
];

const Staff = () => {
  const { locationId, locations } = useAuth();
  const [staffData, setStaffData] = useState([]);
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setModalOpen] = useState(false);
  const [currentLocation, setCurrentLocation] = useState(null);
  
  // Tab selector for Branch Access Requests
  const [activeRequestTab, setActiveRequestTab] = useState('Pending');

  // Pending branch access requests
  const [accessRequests, setAccessRequests] = useState([
    {
      id: 'req-1',
      name: 'Priya Sundaram',
      role: 'Valet Staff',
      email: 'priya.s@valetpro.in',
      requestedBranch: 'ITC Gardenia',
      requestedTime: 'requested 1d ago',
      quote: 'Covering weekend shifts in Bengaluru next month.'
    },
    {
      id: 'req-2',
      name: 'Karthik Raja',
      role: 'Valet Staff',
      email: 'karthik.r@valetpro.in',
      requestedBranch: 'ITC Maurya',
      requestedTime: 'requested 2d ago',
      quote: 'Relocating to Delhi, requesting transfer.'
    }
  ]);

  const [historyRequests, setHistoryRequests] = useState([]);

  // New Staff onboard Form State
  const [newStaff, setNewStaff] = useState({ 
    name: '', 
    role: 'Valet',
    zone: 'Zone A',
    shift: '6AM - 2PM',
    email: '',
    password: '',
    phone: '',
    speaks: 'Tamil, English',
    license: 'TN-DL-2026-1111'
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Fetch active branch info
  useEffect(() => {
    if (locationId) {
      locationService.getLocationById(locationId).then(({ data }) => {
        if (data) setCurrentLocation(data);
      });
      fetchStaff();
    } else {
      setLoading(false);
    }
  }, [locationId]);

  const fetchStaff = async () => {
    if (!locationId) { setLoading(false); return; }
    try {
      setLoading(true);
      const [{ data: sData }, { data: vData }] = await Promise.all([
        staffService.getStaff(locationId),
        supabase
          .from('vehicles')
          .select('id, driver_id, driver_name, tip_amount, status, received_at')
          .eq('location_id', locationId)
      ]);
      if (sData) setStaffData(sData);
      if (vData) setVehicles(vData);
    } catch (err) {
      console.error('Error fetching staff and vehicles data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddStaff = async (e) => {
    e.preventDefault();
    if (!newStaff.name.trim() || !locationId) return;

    try {
      setIsSubmitting(true);
      const { error } = await staffService.addStaff({
        ...newStaff,
        location_id: locationId,
        status: 'On Shift',
        handled_count: 0,
        rating: 5.0
      });

      if (error) throw error;

      setModalOpen(false);
      setNewStaff({ 
        name: '', 
        role: 'Valet',
        zone: 'Zone A',
        shift: '6AM - 2PM',
        email: '',
        password: '',
        phone: '',
        speaks: 'Tamil, English',
        license: 'TN-DL-2026-1111'
      });

      fetchStaff();
    } catch (err) {
      console.error('Error adding staff:', err);
      alert(err.message || 'Failed to add staff member.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Approve / Reject actions
  const handleApproveRequest = (id) => {
    const request = accessRequests.find(r => r.id === id);
    if (!request) return;
    setAccessRequests(prev => prev.filter(r => r.id !== id));
    setHistoryRequests(prev => [{ ...request, status: 'Approved', actionTime: 'Just now' }, ...prev]);
  };

  const handleRejectRequest = (id) => {
    const request = accessRequests.find(r => r.id === id);
    if (!request) return;
    setAccessRequests(prev => prev.filter(r => r.id !== id));
    setHistoryRequests(prev => [{ ...request, status: 'Rejected', actionTime: 'Just now' }, ...prev]);
  };

  // Merge database staff
  const allStaff = staffData.map((s) => {
    let statusLabel = s.status === 'On Shift' ? 'On Duty' : 'Off Duty';
    
    // Find all vehicles handled by this staff member
    const staffVehicles = (vehicles || []).filter(v => v.driver_id === s.id);
    
    const todayVehiclesCount = staffVehicles.length;
    const tipsSum = staffVehicles.reduce((sum, v) => sum + (Number(v.tip_amount) || 0), 0);
    
    return {
      id: s.id,
      name: s.name,
      role: s.role || 'Valet',
      zone: s.zone || 'Zone A',
      status: statusLabel,
      today_vehicles: todayVehiclesCount,
      hours: s.hours || (statusLabel === 'On Duty' ? 5.2 : 0),
      tips: tipsSum,
      rating: s.rating || 5.0,
      trips: s.handled_count || todayVehiclesCount,
      shift: s.shift || '6AM - 2PM',
      phone: s.phone || '+91 90000 99999',
      joined: s.created_at ? new Date(s.created_at).toLocaleDateString([], { year: 'numeric', month: 'short' }) : 'May 2026',
      speaks: s.speaks || 'Tamil, English',
      license: s.license || 'TN-DL-2026-9999',
      clock_in: statusLabel === 'On Duty' ? '06:15 AM' : '—',
      clock_out: '—'
    };
  });

  const filteredStaff = allStaff.filter(s => 
    s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.role.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.phone.includes(searchTerm)
  );

  // Stats aggregation
  const onDutyCount = filteredStaff.filter(s => s.status === 'On Duty').length;
  const vehiclesHandledCount = filteredStaff.reduce((sum, s) => sum + s.today_vehicles, 0);
  const totalTipsToday = filteredStaff.reduce((sum, s) => sum + s.tips, 0);

  // Active branch details
  const activeLocation = (locations || []).find(loc => loc.id === locationId) || currentLocation;
  const companyName = activeLocation?.company_name || 'ITC Hotels';

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', width: '100%' }}>
      
      {/* Title & Controls */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.85rem', fontWeight: '800', color: 'var(--text-main)', marginBottom: '0.25rem' }}>Staff Management</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', fontWeight: '500' }}>
            {onDutyCount} on duty · {vehiclesHandledCount} vehicles handled · ₹{totalTipsToday} in tips today
          </p>
        </div>
        <button
          onClick={() => setModalOpen(true)}
          style={{
            backgroundColor: 'var(--accent)',
            color: 'var(--accent-text)',
            border: 'none',
            borderRadius: '10px',
            padding: '0.65rem 1.15rem',
            fontSize: '0.85rem',
            fontWeight: '700',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            boxShadow: '0 4px 15px var(--accent-shadow)',
            transition: 'all 0.15s ease'
          }}
          onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-1px)'}
          onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
        >
          <Plus size={16} />
          <span>Add Staff</span>
        </button>
      </div>

      {/* Branch Access Requests Section */}
      <div style={{
        backgroundColor: 'var(--bg-card)',
        border: '1px solid var(--border-color)',
        borderRadius: '12px',
        padding: '1.25rem',
        display: 'flex',
        flexDirection: 'column',
        gap: '1rem'
      }}>
        {/* Section Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Users size={16} style={{ color: '#fbbf24' }} />
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <span style={{ fontSize: '0.9rem', fontWeight: '800', color: 'var(--text-main)' }}>Branch Access Requests</span>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                Staff requesting access to branches within <strong style={{ color: 'var(--text-main)' }}>{companyName}</strong>
              </span>
            </div>
          </div>
          {accessRequests.length > 0 && (
            <div style={{
              padding: '0.2rem 0.6rem',
              borderRadius: '6px',
              backgroundColor: 'rgba(251, 191, 36, 0.15)',
              color: '#fbbf24',
              fontSize: '0.65rem',
              fontWeight: '800',
              letterSpacing: '0.05em'
            }}>
              {accessRequests.length} PENDING
            </div>
          )}
        </div>

        {/* Sub Navigation Tabs */}
        <div style={{ display: 'flex', gap: '0.35rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem' }}>
          <button
            onClick={() => setActiveRequestTab('Pending')}
            style={{
              padding: '0.35rem 0.85rem',
              fontSize: '0.75rem',
              fontWeight: '700',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer',
              backgroundColor: activeRequestTab === 'Pending' ? 'var(--accent)' : 'transparent',
              color: activeRequestTab === 'Pending' ? 'var(--accent-text)' : 'var(--text-muted)',
              transition: 'all 0.15s ease'
            }}
          >
            Pending ({accessRequests.length})
          </button>
          <button
            onClick={() => setActiveRequestTab('History')}
            style={{
              padding: '0.35rem 0.85rem',
              fontSize: '0.75rem',
              fontWeight: '700',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer',
              backgroundColor: activeRequestTab === 'History' ? 'var(--accent)' : 'transparent',
              color: activeRequestTab === 'History' ? 'var(--accent-text)' : 'var(--text-muted)',
              transition: 'all 0.15s ease'
            }}
          >
            History ({historyRequests.length})
          </button>
        </div>

        {/* Requests Content */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {activeRequestTab === 'Pending' ? (
            accessRequests.length > 0 ? (
              accessRequests.map((req) => (
                <div 
                  key={req.id} 
                  style={{ 
                    borderBottom: '1px solid var(--border-color)', 
                    paddingBottom: '0.75rem', 
                    display: 'flex', 
                    flexDirection: 'column', 
                    gap: '0.5rem' 
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
                      <div style={{
                        width: '36px',
                        height: '36px',
                        borderRadius: '50%',
                        backgroundColor: 'rgba(255, 255, 255, 0.05)',
                        color: 'var(--text-muted)',
                        border: '1px solid var(--border-color)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontWeight: '800',
                        fontSize: '0.8rem'
                      }}>
                        {req.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                          <span style={{ fontSize: '0.85rem', fontWeight: '800', color: 'var(--text-main)' }}>{req.name}</span>
                          <span style={{ 
                            fontSize: '0.6rem', 
                            color: '#64748b', 
                            backgroundColor: 'rgba(255,255,255,0.03)', 
                            border: '1px solid var(--border-color)',
                            padding: '0.15rem 0.35rem', 
                            borderRadius: '4px',
                            fontWeight: '600'
                          }}>{req.role}</span>
                          <span style={{
                            padding: '0.15rem 0.35rem',
                            borderRadius: '4px',
                            backgroundColor: 'rgba(251, 191, 36, 0.1)',
                            color: '#fbbf24',
                            fontSize: '0.6rem',
                            fontWeight: '700'
                          }}>Pending</span>
                        </div>
                        <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                          {req.email} · <span style={{ color: '#fbbf24', fontWeight: '600' }}>{req.requestedBranch}</span> - {req.requestedTime}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Quote block */}
                  <div style={{
                    backgroundColor: 'rgba(0, 0, 0, 0.15)',
                    borderLeft: '3px solid #fbbf24',
                    padding: '0.5rem 0.75rem',
                    borderRadius: '0 8px 8px 0',
                    fontSize: '0.75rem',
                    color: 'var(--text-muted)',
                    fontStyle: 'italic',
                    marginLeft: '2.75rem'
                  }}>
                    "{req.quote}"
                  </div>

                  {/* Actions */}
                  <div style={{ display: 'flex', gap: '0.5rem', marginLeft: '2.75rem', marginTop: '0.25rem' }}>
                    <button
                      onClick={() => handleApproveRequest(req.id)}
                      style={{
                        backgroundColor: 'var(--accent)',
                        color: 'var(--accent-text)',
                        border: 'none',
                        borderRadius: '6px',
                        padding: '0.35rem 0.75rem',
                        fontSize: '0.7rem',
                        fontWeight: '700',
                        cursor: 'pointer'
                      }}
                    >
                      Approve
                    </button>
                    <button
                      onClick={() => handleRejectRequest(req.id)}
                      style={{
                        backgroundColor: 'transparent',
                        border: '1px solid #ef4444',
                        color: '#ef4444',
                        borderRadius: '6px',
                        padding: '0.35rem 0.75rem',
                        fontSize: '0.7rem',
                        fontWeight: '700',
                        cursor: 'pointer'
                      }}
                    >
                      Reject
                    </button>
                    <button
                      style={{
                        backgroundColor: 'transparent',
                        border: 'none',
                        color: 'var(--text-muted)',
                        fontSize: '0.7rem',
                        fontWeight: '600',
                        cursor: 'pointer'
                      }}
                    >
                      Add note
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontStyle: 'italic', textAlign: 'center', display: 'block', padding: '1rem 0' }}>
                No pending access requests.
              </span>
            )
          ) : (
            historyRequests.length > 0 ? (
              historyRequests.map((req) => (
                <div key={req.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem' }}>
                  <div style={{ display: 'flex', flexDirection: 'column' }}>
                    <span style={{ fontSize: '0.8rem', fontWeight: '700', color: 'var(--text-main)' }}>{req.name} ({req.email})</span>
                    <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>
                      Requested {req.requestedBranch} · {req.actionTime}
                    </span>
                  </div>
                  <span style={{
                    fontSize: '0.65rem',
                    fontWeight: '800',
                    color: req.status === 'Approved' ? '#10b981' : '#ef4444'
                  }}>{req.status.toUpperCase()}</span>
                </div>
              ))
            ) : (
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontStyle: 'italic', textAlign: 'center', display: 'block', padding: '1rem 0' }}>
                No history logs.
              </span>
            )
          )}
        </div>
      </div>

      {/* Search Input Filter */}
      <div style={{ position: 'relative', display: 'flex', alignItems: 'center', maxWidth: '350px' }}>
        <Search size={16} style={{ position: 'absolute', left: '0.85rem', color: 'var(--text-muted)' }} />
        <input 
          type="text" 
          placeholder="Search name, role, phone..." 
          style={{ 
            padding: '0.55rem 0.85rem 0.55rem 2.25rem', 
            borderRadius: '10px', 
            border: '1px solid var(--border-color)',
            backgroundColor: 'var(--bg-card)',
            width: '100%',
            outline: 'none',
            color: 'var(--text-main)',
            fontSize: '0.8rem'
          }} 
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {/* Staff Details Grid */}
      {filteredStaff.length === 0 ? (
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '4rem 2rem',
          backgroundColor: 'var(--bg-card)',
          border: '1px dashed var(--border-color)',
          borderRadius: '16px',
          textAlign: 'center',
          gap: '1rem',
          color: 'var(--text-muted)'
        }}>
          <Users size={48} style={{ opacity: 0.3, color: '#fbbf24' }} />
          <div>
            <h3 style={{ fontSize: '1.1rem', fontWeight: '700', color: 'var(--text-main)', marginBottom: '0.25rem' }}>No Staff Found</h3>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', maxWidth: '300px', margin: '0 auto', lineHeight: '1.4' }}>
              Add a new staff member to manage your valet runners.
            </p>
          </div>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.25rem' }}>
          {filteredStaff.map((staff) => (
            <div
              key={staff.id}
              style={{
                backgroundColor: 'var(--bg-card)',
                border: '1px solid var(--border-color)',
                borderRadius: '12px',
                padding: '1.25rem',
                display: 'flex',
                flexDirection: 'column',
                gap: '1rem'
              }}
            >
              {/* Header: Initials, Name & Status */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
                  <div style={{
                    width: '40px',
                    height: '40px',
                    borderRadius: '50%',
                    backgroundColor: 'rgba(251, 191, 36, 0.05)',
                    border: '1.5px solid #fbbf24',
                    color: '#fbbf24',
                    fontWeight: '800',
                    fontSize: '0.9rem',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    textTransform: 'uppercase'
                  }}>
                    {staff.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)}
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column' }}>
                    <span style={{ fontSize: '0.9rem', fontWeight: '800', color: 'var(--text-main)' }}>{staff.name}</span>
                    <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>{staff.role} · {staff.zone}</span>
                  </div>
                </div>

                {/* Status Badge */}
                <span style={{
                  padding: '0.2rem 0.5rem',
                  borderRadius: '6px',
                  fontSize: '0.6rem',
                  fontWeight: '800',
                  letterSpacing: '0.04em',
                  backgroundColor: staff.status === 'On Duty' ? 'rgba(16, 185, 129, 0.12)' : 'rgba(100, 116, 139, 0.12)',
                  color: staff.status === 'On Duty' ? '#10b981' : '#64748b',
                  border: staff.status === 'On Duty' ? '1px solid rgba(16, 185, 129, 0.2)' : '1px solid rgba(100, 116, 139, 0.2)',
                  textTransform: 'uppercase'
                }}>
                  {staff.status}
                </span>
              </div>

              {/* KPI statistics cards row */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.5rem', textAlign: 'center' }}>
                <div style={{ padding: '0.5rem', backgroundColor: 'rgba(0, 0, 0, 0.15)', border: '1px solid var(--border-color)', borderRadius: '8px' }}>
                  <div style={{ fontSize: '0.55rem', color: 'var(--text-muted)', fontWeight: '700', textTransform: 'uppercase', marginBottom: '0.25rem' }}>Today</div>
                  <div style={{ fontSize: '0.95rem', fontWeight: '800', color: 'var(--text-main)' }}>{staff.today_vehicles}</div>
                </div>
                <div style={{ padding: '0.5rem', backgroundColor: 'rgba(0, 0, 0, 0.15)', border: '1px solid var(--border-color)', borderRadius: '8px' }}>
                  <div style={{ fontSize: '0.55rem', color: 'var(--text-muted)', fontWeight: '700', textTransform: 'uppercase', marginBottom: '0.25rem' }}>Hours</div>
                  <div style={{ fontSize: '0.95rem', fontWeight: '800', color: 'var(--text-main)' }}>{staff.hours}h</div>
                </div>
                <div style={{ padding: '0.5rem', backgroundColor: 'rgba(0, 0, 0, 0.15)', border: '1px solid var(--border-color)', borderRadius: '8px' }}>
                  <div style={{ fontSize: '0.55rem', color: 'var(--text-muted)', fontWeight: '700', textTransform: 'uppercase', marginBottom: '0.25rem' }}>Tips</div>
                  <div style={{ fontSize: '0.95rem', fontWeight: '800', color: '#fbbf24' }}>₹{staff.tips}</div>
                </div>
              </div>

              {/* Detailed stats list */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.55rem', fontSize: '0.75rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                    <Star size={12} style={{ color: '#fbbf24' }} fill="#fbbf24" /> Rating
                  </span>
                  <span style={{ color: 'var(--text-main)', fontWeight: '700' }}>{staff.rating} ({staff.trips} trips)</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                    <Clock size={12} /> Shift
                  </span>
                  <span style={{ color: 'var(--text-main)', fontWeight: '600' }}>{staff.shift}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                    <Phone size={12} /> Phone
                  </span>
                  <span style={{ color: 'var(--text-main)', fontWeight: '600' }}>{staff.phone}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                    <Calendar size={12} /> Joined
                  </span>
                  <span style={{ color: 'var(--text-main)', fontWeight: '600' }}>{staff.joined}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                    <Users size={12} /> Speaks
                  </span>
                  <span style={{ color: 'var(--text-main)', fontWeight: '600' }}>{staff.speaks}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                    <FileText size={12} /> License
                  </span>
                  <span style={{ color: 'var(--text-main)', fontWeight: '600' }}>{staff.license}</span>
                </div>
              </div>

            </div>
          ))}
        </div>
      )}

      {/* Shift Log Table Panel */}
      <div style={{
        backgroundColor: 'var(--bg-card)',
        border: '1px solid var(--border-color)',
        borderRadius: '12px',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
        marginTop: '1rem'
      }}>
        {/* Table Header */}
        <div style={{ padding: '1rem', borderBottom: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h3 style={{ fontSize: '0.95rem', fontWeight: '800', color: 'var(--text-main)' }}>Shift Log</h3>
          <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
            {filteredStaff.filter(s => s.status === 'On Duty').length} active shifts
          </span>
        </div>

        {/* Table Scrollable Container */}
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border-color)', backgroundColor: 'rgba(255,255,255,0.01)' }}>
                <th style={{ padding: '0.85rem 1rem', fontSize: '0.65rem', fontWeight: '800', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Staff</th>
                <th style={{ padding: '0.85rem 1rem', fontSize: '0.65rem', fontWeight: '800', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Date</th>
                <th style={{ padding: '0.85rem 1rem', fontSize: '0.65rem', fontWeight: '800', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Clock-In</th>
                <th style={{ padding: '0.85rem 1rem', fontSize: '0.65rem', fontWeight: '800', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Clock-Out</th>
                <th style={{ padding: '0.85rem 1rem', fontSize: '0.65rem', fontWeight: '800', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Hours</th>
                <th style={{ padding: '0.85rem 1rem', fontSize: '0.65rem', fontWeight: '800', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Vehicles</th>
                <th style={{ padding: '0.85rem 1rem', fontSize: '0.65rem', fontWeight: '800', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Tips</th>
                <th style={{ padding: '0.85rem 1rem', fontSize: '0.65rem', fontWeight: '800', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Status</th>
              </tr>
            </thead>
            <tbody>
              {filteredStaff.map((staff) => {
                const isActive = staff.status === 'On Duty';
                return (
                  <tr
                    key={staff.id}
                    style={{
                      borderBottom: '1px solid var(--border-color)',
                      transition: 'all 0.15s ease'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.01)'}
                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                  >
                    <td style={{ padding: '1rem', fontSize: '0.8rem', fontWeight: '700', color: 'var(--text-main)' }}>
                      {staff.name}
                    </td>
                    <td style={{ padding: '1rem', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                      Today
                    </td>
                    <td style={{ padding: '1rem', fontSize: '0.75rem', color: 'var(--text-main)', fontWeight: '600' }}>
                      {staff.clock_in}
                    </td>
                    <td style={{ padding: '1rem', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                      {staff.clock_out}
                    </td>
                    <td style={{ padding: '1rem', fontSize: '0.75rem', color: 'var(--text-main)', fontWeight: '600' }}>
                      {staff.hours > 0 ? `${staff.hours}h` : '0h'}
                    </td>
                    <td style={{ padding: '1rem', fontSize: '0.75rem', color: 'var(--text-main)', fontWeight: '600' }}>
                      {staff.today_vehicles}
                    </td>
                    <td style={{ padding: '1rem', fontSize: '0.75rem', color: '#fbbf24', fontWeight: '600' }}>
                      ₹{staff.tips}
                    </td>
                    <td style={{ padding: '1rem' }}>
                      <span style={{
                        padding: '0.15rem 0.45rem',
                        borderRadius: '4px',
                        fontSize: '0.6rem',
                        fontWeight: '700',
                        backgroundColor: isActive ? 'rgba(16, 185, 129, 0.12)' : 'rgba(59, 130, 246, 0.12)',
                        color: isActive ? '#10b981' : '#3b82f6',
                        textTransform: 'uppercase'
                      }}>
                        {isActive ? 'Active' : 'Scheduled'}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Onboard Staff Modal Overlay */}
      {isModalOpen && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100vw',
          height: '100vh',
          backgroundColor: 'rgba(0,0,0,0.65)',
          zIndex: 99999,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backdropFilter: 'blur(4px)'
        }}>
          <div style={{
            backgroundColor: 'var(--bg-surface)',
            border: '1.5px solid var(--border-color)',
            borderRadius: '16px',
            padding: '1.5rem',
            width: '420px',
            maxWidth: '90%',
            display: 'flex',
            flexDirection: 'column',
            gap: '1.25rem',
            boxShadow: '0 20px 40px rgba(0,0,0,0.5)'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 style={{ fontSize: '1.1rem', fontWeight: '800', color: 'var(--text-main)' }}>Onboard New Staff Member</h3>
              <button 
                onClick={() => setModalOpen(false)}
                style={{ backgroundColor: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleAddStaff} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                <label style={{ fontSize: '0.65rem', fontWeight: '700', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Full Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Rahul Sharma"
                  value={newStaff.name}
                  onChange={(e) => setNewStaff({ ...newStaff, name: e.target.value })}
                  style={{
                    padding: '0.55rem 0.85rem',
                    borderRadius: '8px',
                    border: '1px solid var(--border-color)',
                    backgroundColor: 'var(--bg-subtle)',
                    color: 'var(--text-main)',
                    fontSize: '0.8rem',
                    outline: 'none'
                  }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                  <label style={{ fontSize: '0.65rem', fontWeight: '700', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Assign Role</label>
                  <select
                    value={newStaff.role}
                    onChange={(e) => setNewStaff({ ...newStaff, role: e.target.value })}
                    style={{
                      padding: '0.55rem 0.85rem',
                      borderRadius: '8px',
                      border: '1px solid var(--border-color)',
                      backgroundColor: 'var(--bg-subtle)',
                      color: 'var(--text-main)',
                      fontSize: '0.8rem',
                      outline: 'none'
                    }}
                  >
                    <option value="Valet">Valet</option>
                    <option value="Supervisor">Supervisor</option>
                    <option value="Shift Lead">Shift Lead</option>
                    <option value="Manager">Manager</option>
                  </select>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                  <label style={{ fontSize: '0.65rem', fontWeight: '700', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Zone Assignment</label>
                  <input
                    type="text"
                    placeholder="e.g. Zone A"
                    value={newStaff.zone}
                    onChange={(e) => setNewStaff({ ...newStaff, zone: e.target.value })}
                    style={{
                      padding: '0.55rem 0.85rem',
                      borderRadius: '8px',
                      border: '1px solid var(--border-color)',
                      backgroundColor: 'var(--bg-subtle)',
                      color: 'var(--text-main)',
                      fontSize: '0.8rem',
                      outline: 'none'
                    }}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                  <label style={{ fontSize: '0.65rem', fontWeight: '700', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Phone Number</label>
                  <input
                    type="text"
                    placeholder="e.g. +91 90000 11111"
                    value={newStaff.phone}
                    onChange={(e) => setNewStaff({ ...newStaff, phone: e.target.value })}
                    style={{
                      padding: '0.55rem 0.85rem',
                      borderRadius: '8px',
                      border: '1px solid var(--border-color)',
                      backgroundColor: 'var(--bg-subtle)',
                      color: 'var(--text-main)',
                      fontSize: '0.8rem',
                      outline: 'none'
                    }}
                  />
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                  <label style={{ fontSize: '0.65rem', fontWeight: '700', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Speaks</label>
                  <input
                    type="text"
                    placeholder="e.g. Tamil, English"
                    value={newStaff.speaks}
                    onChange={(e) => setNewStaff({ ...newStaff, speaks: e.target.value })}
                    style={{
                      padding: '0.55rem 0.85rem',
                      borderRadius: '8px',
                      border: '1px solid var(--border-color)',
                      backgroundColor: 'var(--bg-subtle)',
                      color: 'var(--text-main)',
                      fontSize: '0.8rem',
                      outline: 'none'
                    }}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                  <label style={{ fontSize: '0.65rem', fontWeight: '700', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Shift Duration</label>
                  <input
                    type="text"
                    placeholder="e.g. 6AM - 2PM"
                    value={newStaff.shift}
                    onChange={(e) => setNewStaff({ ...newStaff, shift: e.target.value })}
                    style={{
                      padding: '0.55rem 0.85rem',
                      borderRadius: '8px',
                      border: '1px solid var(--border-color)',
                      backgroundColor: 'var(--bg-subtle)',
                      color: 'var(--text-main)',
                      fontSize: '0.8rem',
                      outline: 'none'
                    }}
                  />
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                  <label style={{ fontSize: '0.65rem', fontWeight: '700', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Driver License</label>
                  <input
                    type="text"
                    placeholder="e.g. TN-DL-2020-7740"
                    value={newStaff.license}
                    onChange={(e) => setNewStaff({ ...newStaff, license: e.target.value })}
                    style={{
                      padding: '0.55rem 0.85rem',
                      borderRadius: '8px',
                      border: '1px solid var(--border-color)',
                      backgroundColor: 'var(--bg-subtle)',
                      color: 'var(--text-main)',
                      fontSize: '0.8rem',
                      outline: 'none'
                    }}
                  />
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                <label style={{ fontSize: '0.65rem', fontWeight: '700', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Email Address *</label>
                <input
                  type="email"
                  required
                  placeholder="e.g. staff@valetpro.com"
                  value={newStaff.email}
                  onChange={(e) => setNewStaff({ ...newStaff, email: e.target.value })}
                  style={{
                    padding: '0.55rem 0.85rem',
                    borderRadius: '8px',
                    border: '1px solid var(--border-color)',
                    backgroundColor: 'var(--bg-subtle)',
                    color: 'var(--text-main)',
                    fontSize: '0.8rem',
                    outline: 'none'
                  }}
                />
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                <label style={{ fontSize: '0.65rem', fontWeight: '700', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Create Password *</label>
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  value={newStaff.password}
                  onChange={(e) => setNewStaff({ ...newStaff, password: e.target.value })}
                  style={{
                    padding: '0.55rem 0.85rem',
                    borderRadius: '8px',
                    border: '1px solid var(--border-color)',
                    backgroundColor: 'var(--bg-subtle)',
                    color: 'var(--text-main)',
                    fontSize: '0.8rem',
                    outline: 'none'
                  }}
                />
                <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>Staff will use this password to log in.</span>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                style={{
                  backgroundColor: 'var(--accent)',
                  color: 'var(--accent-text)',
                  border: 'none',
                  borderRadius: '8px',
                  padding: '0.65rem',
                  fontSize: '0.8rem',
                  fontWeight: '700',
                  cursor: 'pointer',
                  marginTop: '0.5rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: '0 4px 15px var(--accent-shadow)'
                }}
              >
                {isSubmitting ? <Loader2 size={16} className="animate-spin" /> : 'Onboard Staff'}
              </button>

            </form>
          </div>
        </div>
      )}

    </div>
  );
};

export default Staff;
