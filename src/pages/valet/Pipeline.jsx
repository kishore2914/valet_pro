import React, { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Car, 
  MapPin, 
  User, 
  Clock, 
  MoreVertical,
  CheckCircle2,
  Loader2,
  ArrowRightCircle,
  UserCheck,
  UserX,
  LayoutGrid,
  ChevronDown
} from 'lucide-react';
import Badge from '../../components/ui/Badge';
import Button from '../../components/ui/Button';
import { vehicleService } from '../../services/vehicleService';
import { staffService } from '../../services/staffService';
import { useAuth } from '../../context/AuthContext';

const stages = [
  { id: 'Received',   name: 'Received',   icon: Car,          next: 'Parking' },
  { id: 'Parking',    name: 'Parking',    icon: Loader2,      next: 'Parked' },
  { id: 'Parked',     name: 'Parked',     icon: CheckCircle2, next: 'Ready' },
  { id: 'Ready',      name: 'Requested',  icon: Clock,        next: 'Delivering' },
  { id: 'Delivering', name: 'Delivering', icon: Loader2,      next: 'Returned' },
  { id: 'Returned',   name: 'Returned',   icon: CheckCircle2, next: null },
];

// ── Context Menu ────────────────────────────────────────────────────────────
const ContextMenu = ({ car, staff, onAssign, onUnassign, onClose }) => {
  const ref = useRef(null);

  // Close on outside click
  useEffect(() => {
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) onClose(); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [onClose]);

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, scale: 0.95, y: -4 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95, y: -4 }}
      transition={{ duration: 0.12 }}
      style={{
        position: 'absolute',
        top: '2.25rem',
        right: 0,
        zIndex: 100,
        minWidth: '210px',
        backgroundColor: 'var(--bg-surface)',
        border: '1px solid var(--border-color)',
        borderRadius: '12px',
        boxShadow: 'var(--shadow-lg)',
        zIndex: 1000,
        overflow: 'hidden'
      }}
    >
      {/* Header */}
      <div style={{ padding: '0.6rem 1rem', borderBottom: '1px solid var(--border-color)', fontSize: '0.7rem', fontWeight: '700', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
        Assign Driver
      </div>

      {/* Staff list */}
      {staff.length === 0 ? (
        <div style={{ padding: '1rem', fontSize: '0.8rem', color: 'var(--text-muted)', textAlign: 'center' }}>
          No staff onboarded yet
        </div>
      ) : (
        <div style={{ maxHeight: '220px', overflowY: 'auto' }}>
          {staff.map(member => {
            const isAssigned = car.driver_id === member.id;
            return (
              <button
                key={member.id}
                onClick={() => isAssigned ? onUnassign(car.id) : onAssign(car.id, member.id, member.name)}
                style={{
                  width: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.75rem',
                  padding: '0.65rem 1rem',
                  border: 'none',
                  background: isAssigned ? 'rgba(37, 99, 235, 0.06)' : 'transparent',
                  cursor: 'pointer',
                  textAlign: 'left',
                  transition: 'background 0.15s',
                  color: 'var(--text-main)'
                }}
                onMouseEnter={e => { if (!isAssigned) e.currentTarget.style.background = 'var(--bg-subtle)'; }}
                onMouseLeave={e => { if (!isAssigned) e.currentTarget.style.background = 'transparent'; }}
              >
                {/* Avatar */}
                <div style={{
                  width: '30px', height: '30px', borderRadius: '50%',
                  backgroundColor: isAssigned ? 'rgba(37,99,235,0.15)' : 'var(--bg-subtle)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '0.75rem', fontWeight: '700', flexShrink: 0,
                  color: isAssigned ? 'var(--primary)' : 'var(--text-muted)',
                  border: isAssigned ? '1px solid rgba(37,99,235,0.3)' : '1px solid var(--border-color)'
                }}>
                  {member.name?.charAt(0).toUpperCase()}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: '0.85rem', fontWeight: '600' }}>{member.name}</div>
                  {member.role && <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>{member.role}</div>}
                </div>
                {isAssigned && (
                  <UserCheck size={14} style={{ color: 'var(--primary)', flexShrink: 0 }} />
                )}
              </button>
            );
          })}
        </div>
      )}

      {/* Unassign option — only if someone is currently assigned */}
      {car.driver_name && (
        <>
          <div style={{ borderTop: '1px solid var(--border-color)' }} />
          <button
            onClick={() => onUnassign(car.id)}
            style={{
              width: '100%', display: 'flex', alignItems: 'center', gap: '0.75rem',
              padding: '0.65rem 1rem', border: 'none', background: 'transparent',
              cursor: 'pointer', color: '#ef4444', fontSize: '0.85rem'
            }}
            onMouseEnter={e => e.currentTarget.style.background = 'rgba(239,68,68,0.06)'}
            onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
          >
            <UserX size={14} />
            Remove Assignment
          </button>
        </>
      )}
    </motion.div>
  );
};

// ── Pipeline Card ────────────────────────────────────────────────────────────
const PipelineCard = ({ car, staff, onStatusChange, onAssign, onUnassign }) => {
  const [updating, setUpdating] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const nextStage = stages.find(s => s.id === car.status)?.next;

  const handleNext = async () => {
    if (!nextStage) return;
    setUpdating(true);
    await onStatusChange(car.id, nextStage);
    setUpdating(false);
  };

  const handleAssign = async (vehicleId, staffId, staffName) => {
    setMenuOpen(false);
    await onAssign(vehicleId, staffId, staffName);
  };

  const handleUnassign = async (vehicleId) => {
    setMenuOpen(false);
    await onUnassign(vehicleId);
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      whileHover={{ y: -3, boxShadow: 'var(--shadow-lg)' }}
      style={{
        backgroundColor: 'var(--bg-card)',
        borderRadius: '12px',
        padding: '1rem',
        border: '1px solid var(--border-color)',
        boxShadow: 'var(--shadow-sm)',
        position: 'relative',
        opacity: updating ? 0.7 : 1
      }}
    >
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem' }}>
        <div>
          <div style={{ fontSize: '0.9rem', fontWeight: '700' }}>{car.model || 'Unknown Model'}</div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{car.plate_number}</div>
        </div>

        {/* 3-dot menu */}
        <div style={{ position: 'relative' }}>
          <Button
            variant="ghost"
            style={{ padding: '0.25rem' }}
            onClick={() => setMenuOpen(o => !o)}
          >
            <MoreVertical size={16} />
          </Button>

          <AnimatePresence>
            {menuOpen && (
              <ContextMenu
                car={car}
                staff={staff}
                onAssign={handleAssign}
                onUnassign={handleUnassign}
                onClose={() => setMenuOpen(false)}
              />
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Details */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginBottom: '1rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.75rem', color: car.driver_name ? 'var(--primary)' : 'var(--text-muted)' }}>
          <User size={14} />
          <span style={{ fontWeight: car.driver_name ? '600' : '400' }}>
            Driver: {car.driver_name || 'Unassigned'}
          </span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
          <MapPin size={14} />
          <span>Slot: {car.slot_id || 'N/A'}</span>
        </div>
      </div>

      {/* Footer */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', fontSize: '0.7rem', color: 'var(--text-muted)' }}>
          <Clock size={12} />
          <span>{new Date(car.received_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
        </div>
        {nextStage && (
          <Button
            variant="ghost"
            size="sm"
            onClick={handleNext}
            disabled={updating}
            style={{ padding: '2px 8px', fontSize: '0.75rem', gap: '4px', color: 'var(--primary)' }}
          >
            {updating ? <Loader2 size={12} className="animate-spin" /> : <ArrowRightCircle size={14} />}
            Move to {nextStage}
          </Button>
        )}
      </div>
    </motion.div>
  );
};

// ── Pipeline Page ────────────────────────────────────────────────────────────
const Pipeline = () => {
  const { locationId } = useAuth();
  const [vehicles, setVehicles] = useState([]);
  const [staff, setStaff] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedZone, setSelectedZone] = useState('all');
  const [zoneMenuOpen, setZoneMenuOpen] = useState(false);
  const zoneMenuRef = useRef(null);

  // Close zone dropdown on outside click
  useEffect(() => {
    const handler = (e) => {
      if (zoneMenuRef.current && !zoneMenuRef.current.contains(e.target)) {
        setZoneMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  // Derive unique zones from loaded vehicles
  const zones = ['all', ...Array.from(new Set(vehicles.map(v => v.zone).filter(Boolean))).sort()];

  // Apply zone filter
  const filteredVehicles = selectedZone === 'all'
    ? vehicles
    : vehicles.filter(v => v.zone === selectedZone);

  const fetchData = async (isManual = false) => {
    if (!locationId) { setLoading(false); return; }
    if (isManual) setRefreshing(true);
    
    // Ensure the loading state is visible for at least 600ms to provide clear visual feedback
    const minDelay = isManual ? new Promise(resolve => setTimeout(resolve, 600)) : Promise.resolve();

    try {
      const [{ data: vData }, { data: sData }] = await Promise.all([
        vehicleService.getActiveVehicles(locationId),
        staffService.getStaff(locationId),
        minDelay
      ]);
      if (vData) setVehicles(vData);
      if (sData) setStaff(sData);
    } catch (err) {
      console.error('Error fetching pipeline data:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
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
    await vehicleService.updateStatus(id, newStatus);
  };

  const handleAssign = async (vehicleId, staffId, staffName) => {
    // Optimistic: update UI immediately
    setVehicles(prev =>
      prev.map(v => v.id === vehicleId ? { ...v, driver_id: staffId, driver_name: staffName } : v)
    );
    const { error } = await vehicleService.assignDriver(vehicleId, staffId, staffName);
    if (error) console.error('assignDriver DB error (columns may be missing):', error.message);
  };

  const handleUnassign = async (vehicleId) => {
    // Optimistic: clear driver immediately
    setVehicles(prev =>
      prev.map(v => v.id === vehicleId ? { ...v, driver_id: null, driver_name: null } : v)
    );
    const { error } = await vehicleService.assignDriver(vehicleId, null, null);
    if (error) console.error('unassignDriver DB error:', error.message);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: 'calc(100vh - 160px)' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <div>
          <h1 style={{ fontSize: '1.875rem' }}>Live Pipeline</h1>
          <p style={{ color: 'var(--text-muted)' }}>Track vehicle lifecycle from arrival to departure</p>
        </div>
        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
          <Button 
            variant="outline" 
            onClick={() => fetchData(true)}
            disabled={refreshing}
            style={{ minWidth: '130px' }}
          >
            {refreshing ? <Loader2 size={16} className="animate-spin" /> : null}
            {refreshing ? 'Refreshing...' : 'Refresh Data'}
          </Button>

          {/* Zone Filter Dropdown */}
          <div ref={zoneMenuRef} style={{ position: 'relative' }}>
            <Button
              variant="primary"
              onClick={() => setZoneMenuOpen(o => !o)}
              style={{ gap: '0.75rem', padding: '0.6rem 1.25rem' }}
            >
              <LayoutGrid size={16} />
              <div style={{ display: 'flex', gap: '0.35rem', alignItems: 'center' }}>
                <span style={{ fontSize: '0.7rem', opacity: 0.8, textTransform: 'uppercase', fontWeight: '500', letterSpacing: '0.05em' }}>Filter:</span>
                <span style={{ fontSize: '0.9rem', fontWeight: '700' }}>{selectedZone === 'all' ? 'All Zones' : selectedZone}</span>
              </div>
              <ChevronDown size={14} style={{ transition: 'transform 0.2s', transform: zoneMenuOpen ? 'rotate(180deg)' : 'rotate(0deg)' }} />
            </Button>

            <AnimatePresence>
              {zoneMenuOpen && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95, y: -4 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95, y: -4 }}
                  transition={{ duration: 0.12 }}
                  style={{
                    position: 'absolute', top: '110%', right: 0, zIndex: 1000,
                    minWidth: '240px', backgroundColor: 'var(--bg-surface)',
                    border: '1px solid var(--border-color)', borderRadius: '12px',
                    boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)', 
                    overflow: 'hidden'
                  }}
                >
                  <div style={{ padding: '0.6rem 1rem', fontSize: '0.7rem', fontWeight: '700', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', borderBottom: '1px solid var(--border-color)' }}>
                    Filter by Zone
                  </div>
                  {zones.map(zone => (
                    <button
                      key={zone}
                      onClick={() => { setSelectedZone(zone); setZoneMenuOpen(false); }}
                       style={{
                        width: '100%', display: 'flex', alignItems: 'center', gap: '0.75rem',
                        padding: '0.8rem 1.2rem', border: 'none', cursor: 'pointer', fontSize: '0.875rem',
                        background: selectedZone === zone ? 'rgba(37,99,235,0.08)' : 'transparent',
                        color: selectedZone === zone ? 'var(--primary)' : 'var(--text-main)',
                        fontWeight: selectedZone === zone ? '700' : '400',
                        textAlign: 'left'
                      }}
                      onMouseEnter={e => { if (selectedZone !== zone) e.currentTarget.style.background = 'var(--bg-subtle)'; }}
                      onMouseLeave={e => { if (selectedZone !== zone) e.currentTarget.style.background = 'transparent'; }}
                    >
                      <span style={{ flex: 1, letterSpacing: '0.01em' }}>{zone === 'all' ? 'All Zones' : zone}</span>
                      {selectedZone === zone && <span style={{ fontSize: '0.75rem', flexShrink: 0 }}>✓</span>}
                    </button>
                  ))}
                  {zones.length === 1 && (
                    <div style={{ padding: '0.75rem 1rem', fontSize: '0.8rem', color: 'var(--text-muted)', textAlign: 'center' }}>
                      No zones assigned yet
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>

      {loading ? (
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Loader2 size={48} className="animate-spin" style={{ color: 'var(--primary)' }} />
        </div>
      ) : (
        <div style={{ flex: 1, display: 'flex', gap: '1.25rem', overflowX: 'auto', paddingBottom: '1rem' }}>
          {stages.map(stage => {
            const stageVehicles = filteredVehicles.filter(v => v.status === stage.id);
            return (
              <div key={stage.id} style={{ minWidth: '300px', width: '300px', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {/* Stage Header */}
                <div style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  padding: '1rem', backgroundColor: 'var(--bg-subtle)',
                  borderRadius: '12px', border: '1px solid var(--border-color)'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <stage.icon size={20} color="var(--primary)" />
                    <span style={{ fontWeight: '700', fontSize: '1rem' }}>{stage.name}</span>
                  </div>
                  <Badge variant="gray">{stageVehicles.length}</Badge>
                </div>

                {/* Cards */}
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '1rem', overflowY: 'auto', padding: '0.25rem' }}>
                  {stageVehicles.map(car => (
                    <PipelineCard
                      key={car.id}
                      car={car}
                      staff={staff}
                      onStatusChange={handleStatusChange}
                      onAssign={handleAssign}
                      onUnassign={handleUnassign}
                    />
                  ))}
                  {stageVehicles.length === 0 && (
                    <div style={{
                      flex: 1, display: 'flex', flexDirection: 'column',
                      alignItems: 'center', justifyContent: 'center',
                      border: '2px dashed var(--border-color)', borderRadius: '16px',
                      color: 'var(--text-muted)', fontSize: '0.875rem',
                      padding: '2rem', textAlign: 'center', minHeight: '120px'
                    }}>
                      No vehicles in this stage
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default Pipeline;
