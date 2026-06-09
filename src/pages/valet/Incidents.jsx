import React, { useState, useEffect } from 'react';
import { 
  AlertTriangle, 
  Clock, 
  Shield, 
  Archive, 
  CheckCircle, 
  AlertCircle, 
  User, 
  UserCheck, 
  MapPin, 
  Loader2,
  Plus
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { supabase } from '../../lib/supabase';

// Helper to format currency
const formatINR = (val) => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0
  }).format(val);
};

const initialIncidents = [
  {
    id: 'inc-1',
    title: 'DAMAGE',
    priority: 'MEDIUM',
    status: 'INVESTIGATING',
    customer_notified: true,
    description: 'Minor scratch on rear bumper noticed during check-in. 4 photos captured.',
    plate_number: 'TN 01 AB 1234',
    reported_by: 'Arun M',
    assigned_to: 'Suresh P',
    zone: 'Zone A entry',
    time: '10:20 AM',
    estimated_cost: 2500
  },
  {
    id: 'inc-2',
    title: 'DELAY',
    priority: 'LOW',
    status: 'RESOLVED',
    customer_notified: true,
    description: 'Vehicle return delayed by 15 mins due to lot congestion at peak hour.',
    plate_number: 'AP 09 GH 3456',
    reported_by: 'Vijay K',
    assigned_to: 'Suresh P',
    zone: 'Zone C exit',
    time: '09:50 AM',
    estimated_cost: 0
  },
  {
    id: 'inc-3',
    title: 'SUSPICIOUS',
    priority: 'HIGH',
    status: 'OPEN',
    customer_notified: true,
    description: 'Unauthorized person attempted to claim vehicle with mismatched token. Security called.',
    plate_number: 'MH 12 EF 9012',
    reported_by: 'Suresh P',
    assigned_to: 'Hotel Security',
    zone: 'Lobby valet desk',
    time: '09:30 AM',
    estimated_cost: 0
  },
  {
    id: 'inc-4',
    title: 'LOST ITEM',
    priority: 'LOW',
    status: 'OPEN',
    customer_notified: false,
    description: 'Sunglasses (Ray-Ban) found in backseat of returned vehicle. Logged in lost & found.',
    plate_number: 'TN 22 OP 0123',
    reported_by: 'Vijay K',
    assigned_to: 'Bala N',
    zone: 'Vehicle Interior',
    time: '07:00 AM',
    estimated_cost: 0
  },
  {
    id: 'inc-5',
    title: 'COMPLAINT',
    priority: 'MEDIUM',
    status: 'INVESTIGATING',
    customer_notified: true,
    description: 'Customer reported delay in retrieving vehicle key from lock-box. Apology issued.',
    plate_number: 'KL 07 KL 2345',
    reported_by: 'Karthik R',
    assigned_to: 'Suresh P',
    zone: 'Key drop',
    time: '10:05 AM',
    estimated_cost: 0
  },
  {
    id: 'inc-6',
    title: 'DAMAGE',
    priority: 'MEDIUM',
    status: 'OPEN',
    customer_notified: false,
    description: 'Door ding from neighboring vehicle in tight slot. Photo evidence saved.',
    plate_number: 'GJ 01 RS 4567',
    reported_by: 'Karthik R',
    assigned_to: 'Suresh P',
    zone: 'Zone EV slot 02',
    time: '11:00 AM',
    estimated_cost: 4200
  }
];

const IncidentTracker = () => {
  const { locationId } = useAuth();
  const [incidents, setIncidents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState(null);

  const showToastMsg = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  };

  const fetchIncidents = async () => {
    if (!locationId) {
      setLoading(false);
      return;
    }
    
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('incidents')
        .select('*')
        .eq('location_id', locationId)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching incidents:', error);
      } else if (data) {
        const mapped = data.map(inc => ({
          id: inc.id,
          title: inc.title || 'DAMAGE',
          priority: inc.priority || 'MEDIUM',
          status: inc.status || 'OPEN',
          customer_notified: inc.customer_notified || false,
          description: inc.description || '',
          plate_number: inc.plate_number || '',
          reported_by: inc.reported_by || '',
          assigned_to: inc.assigned_to || '',
          zone: inc.zone || '',
          time: inc.time || '12:00 PM',
          estimated_cost: Number(inc.estimated_cost) || 0
        }));
        setIncidents(mapped);
      }
    } catch (err) {
      console.error('Error fetching incidents:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchIncidents();
  }, [locationId]);

  const handleSeedIncidents = async () => {
    setLoading(true);
    try {
      await supabase.from('incidents').delete().eq('location_id', locationId);

      const payload = initialIncidents.map(inc => ({
        location_id: locationId,
        title: inc.title,
        priority: inc.priority,
        status: inc.status,
        customer_notified: inc.customer_notified,
        description: inc.description,
        plate_number: inc.plate_number,
        reported_by: inc.reported_by,
        assigned_to: inc.assigned_to,
        zone: inc.zone,
        time: inc.time,
        estimated_cost: inc.estimated_cost
      }));

      const { error } = await supabase.from('incidents').insert(payload);
      if (error) throw error;
      
      fetchIncidents();
      showToastMsg('Demo incidents seeded successfully!');
    } catch (err) {
      console.error('Error seeding incidents:', err);
      alert('Failed to seed incidents.');
      setLoading(false);
    }
  };

  const handleClearIncidents = async () => {
    setLoading(true);
    try {
      await supabase.from('incidents').delete().eq('location_id', locationId);
      setIncidents([]);
      showToastMsg('Database incidents cleared.');
    } catch (err) {
      console.error(err);
      setLoading(false);
    }
  };

  // Switch between loaded database array and local high fidelity fallback
  const activeIncidents = incidents.length > 0 ? incidents : initialIncidents;

  const openCount = activeIncidents.filter(i => i.status === 'OPEN' || i.status === 'Open').length;
  const totalCount = activeIncidents.length;
  const totalCost = activeIncidents.reduce((sum, i) => sum + (Number(i.estimated_cost) || 0), 0);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', width: '100%' }}>
      
      {/* Title Header Section */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.85rem', fontWeight: '800', color: '#ffffff', marginBottom: '0.25rem' }}>Incidents</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', fontWeight: '500' }}>
            {openCount} open · {totalCount} total · {formatINR(totalCost)} estimated cost
          </p>
        </div>
        <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
          {incidents.length > 0 && (
            <button
              onClick={handleClearIncidents}
              disabled={loading}
              style={{
                backgroundColor: 'rgba(239, 68, 68, 0.08)',
                color: '#ef4444',
                border: '1px solid rgba(239, 68, 68, 0.15)',
                borderRadius: '10px',
                padding: '0.65rem 1rem',
                fontSize: '0.85rem',
                fontWeight: '700',
                cursor: 'pointer',
                transition: 'all 0.15s ease'
              }}
            >
              Clear Database
            </button>
          )}
          {incidents.length === 0 && (
            <button
              onClick={handleSeedIncidents}
              disabled={loading}
              style={{
                backgroundColor: 'rgba(255, 255, 255, 0.03)',
                color: 'var(--text-muted)',
                border: '1px solid var(--border-color)',
                borderRadius: '10px',
                padding: '0.65rem 1rem',
                fontSize: '0.85rem',
                fontWeight: '700',
                cursor: 'pointer',
                transition: 'all 0.15s ease'
              }}
            >
              {loading ? 'Seeding...' : 'Seed Demo Data'}
            </button>
          )}
        </div>
      </div>

      {/* Incident List Cards */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        {activeIncidents.map((inc) => {
          // Determine icon & color based on title (Type)
          const type = (inc.title || '').toUpperCase();
          let iconColor = '#fbbf24';
          let iconBg = 'rgba(251, 191, 36, 0.08)';
          let IconComp = AlertTriangle;

          if (type === 'DELAY') {
            iconColor = '#10b981';
            iconBg = 'rgba(16, 185, 129, 0.08)';
            IconComp = Clock;
          } else if (type === 'SUSPICIOUS') {
            iconColor = '#ef4444';
            iconBg = 'rgba(239, 68, 68, 0.08)';
            IconComp = Shield;
          } else if (type === 'LOST ITEM') {
            iconColor = '#14b8a6';
            iconBg = 'rgba(20, 184, 166, 0.08)';
            IconComp = Archive;
          }

          // Severity styling
          const severity = (inc.priority || '').toUpperCase();
          let severityColor = '#fbbf24';
          let severityBg = 'rgba(251, 191, 36, 0.15)';
          if (severity === 'HIGH' || severity === 'CRITICAL') {
            severityColor = '#ef4444';
            severityBg = 'rgba(239, 68, 68, 0.15)';
          } else if (severity === 'LOW') {
            severityColor = '#10b981';
            severityBg = 'rgba(16, 185, 129, 0.15)';
          }

          // Status styling
          const status = (inc.status || '').toUpperCase();
          let statusColor = '#fbbf24';
          let statusBorder = '1px solid rgba(251, 191, 36, 0.3)';
          if (status === 'RESOLVED') {
            statusColor = '#10b981';
            statusBorder = '1px solid rgba(16, 185, 129, 0.3)';
          } else if (status === 'OPEN') {
            statusColor = '#ef4444';
            statusBorder = '1px solid rgba(239, 68, 68, 0.3)';
          }

          return (
            <div 
              key={inc.id}
              style={{
                backgroundColor: 'var(--bg-card)',
                border: '1px solid var(--border-color)',
                borderRadius: '12px',
                padding: '1.25rem',
                display: 'flex',
                gap: '1.25rem',
                alignItems: 'flex-start',
                transition: 'all 0.15s ease'
              }}
              onMouseEnter={(e) => e.currentTarget.style.borderColor = 'rgba(255,255,255,0.15)'}
              onMouseLeave={(e) => e.currentTarget.style.borderColor = 'var(--border-color)'}
            >
              {/* Left Column: Icon Badge */}
              <div style={{
                width: '42px',
                height: '42px',
                borderRadius: '8px',
                backgroundColor: iconBg,
                color: iconColor,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0
              }}>
                <IconComp size={20} />
              </div>

              {/* Right Column: Info details */}
              <div style={{ display: 'flex', flexDirection: 'column', flexGrow: 1, gap: '0.5rem' }}>
                
                {/* Header row */}
                <div style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: '0.5rem' }}>
                  <span style={{ fontSize: '0.8rem', fontWeight: '800', color: '#ffffff', letterSpacing: '0.04em' }}>
                    {type}
                  </span>
                  
                  {/* Severity Badge */}
                  <span style={{
                    fontSize: '0.6rem',
                    fontWeight: '800',
                    color: severityColor,
                    backgroundColor: severityBg,
                    padding: '0.15rem 0.45rem',
                    borderRadius: '4px',
                    textTransform: 'uppercase'
                  }}>
                    {severity}
                  </span>

                  {/* Status Badge */}
                  <span style={{
                    fontSize: '0.6rem',
                    fontWeight: '800',
                    color: statusColor,
                    border: statusBorder,
                    padding: '0.15rem 0.45rem',
                    borderRadius: '4px',
                    textTransform: 'uppercase'
                  }}>
                    {status}
                  </span>

                  {/* Customer Notified badge */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', fontSize: '0.7rem', fontWeight: '600', marginLeft: '0.25rem' }}>
                    {inc.customer_notified ? (
                      <>
                        <CheckCircle size={12} style={{ color: '#10b981' }} />
                        <span style={{ color: '#10b981' }}>Customer notified</span>
                      </>
                    ) : (
                      <>
                        <AlertCircle size={12} style={{ color: '#64748b' }} />
                        <span style={{ color: '#64748b' }}>Not notified</span>
                      </>
                    )}
                  </div>
                </div>

                {/* Description */}
                <div style={{ fontSize: '0.95rem', fontWeight: '600', color: '#ffffff', lineHeight: '1.4' }}>
                  {inc.description}
                </div>

                {/* Footer details row */}
                <div style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  flexWrap: 'wrap', 
                  gap: '1rem', 
                  fontSize: '0.75rem', 
                  color: 'var(--text-muted)', 
                  fontWeight: '500',
                  marginTop: '0.25rem' 
                }}>
                  {inc.plate_number && (
                    <span style={{ color: '#ffffff', fontWeight: '700' }}>
                      {inc.plate_number}
                    </span>
                  )}

                  {inc.reported_by && (
                    <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                      <User size={13} style={{ opacity: 0.6 }} />
                      Reported: {inc.reported_by}
                    </span>
                  )}

                  {inc.assigned_to && (
                    <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                      <UserCheck size={13} style={{ opacity: 0.6 }} />
                      Assigned: {inc.assigned_to}
                    </span>
                  )}

                  {inc.zone && (
                    <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                      <MapPin size={13} style={{ opacity: 0.6 }} />
                      {inc.zone}
                    </span>
                  )}

                  {inc.time && (
                    <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                      <Clock size={13} style={{ opacity: 0.6 }} />
                      {inc.time}
                    </span>
                  )}

                  {Number(inc.estimated_cost) > 0 && (
                    <span style={{ color: '#fbbf24', fontWeight: '800', marginLeft: 'auto' }}>
                      {formatINR(inc.estimated_cost)}
                    </span>
                  )}
                </div>

              </div>
            </div>
          );
        })}
      </div>

      {/* Floated Warning/Toast Indicator */}
      {toast && (
        <div style={{
          position: 'fixed',
          bottom: '2rem',
          left: '50%',
          transform: 'translateX(-50%)',
          backgroundColor: '#111726',
          border: '1px solid #fbbf24',
          color: '#ffffff',
          padding: '0.75rem 1.5rem',
          borderRadius: '12px',
          zIndex: 999999,
          boxShadow: '0 10px 25px -5px rgba(0,0,0,0.5)',
          fontSize: '0.85rem',
          fontWeight: '600'
        }}>
          ★ {toast}
        </div>
      )}

    </div>
  );
};

export default IncidentTracker;
