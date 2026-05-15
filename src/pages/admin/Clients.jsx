import React, { useState, useEffect } from 'react';
import { 
  Building2, 
  Search, 
  Plus, 
  Filter, 
  MoreVertical, 
  UserPlus, 
  IndianRupee,
  MapPin,
  Mail,
  Loader2,
  AlertTriangle,
  Globe
} from 'lucide-react';

import { formatCurrency, formatNumber } from '../../lib/utils';
import GlassCard from '../../components/ui/GlassCard';
import Table from '../../components/ui/Table';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';
import Modal from '../../components/ui/Modal';
import { adminService } from '../../services/adminService';
import { useLocale } from '../../context/LocaleContext';


const ClientManagement = () => {
  const { currentCountry } = useLocale();
  const [isModalOpen, setModalOpen] = useState(false);

  const [locations, setLocations] = useState([]);
  const [stats, setStats] = useState({ locationCount: 0, vehicleCount: 0, revenue: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const { data: locationsData, error: locationsError } = await adminService.getAllLocations();
      if (locationsError) throw locationsError;
      if (locationsData) setLocations(locationsData);
      
      const { data: statsData, error: statsError } = await adminService.getGlobalStats();
      if (statsError) throw statsError;
      if (statsData) setStats(statsData);
    } catch (err) {
      console.error('Error fetching admin data:', err);
      setError(err.message || 'Failed to fetch platform data');
    } finally {
      setLoading(false);
    }
  };

  const clientHeaders = ['Client / Location', 'ID', 'Status', 'Zones', 'Joined', 'Actions'];

  const formattedClients = locations.map(location => ({
    client: (
      <div>
        <div style={{ fontWeight: '600', fontSize: '1rem' }}>{location.name}</div>
        <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
          {location.owner?.full_name || 'No Owner'} ({location.owner?.email || 'No Email'})
        </div>
      </div>
    ),
    id: (
      <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontFamily: 'monospace' }}>
        {location.id.slice(0, 8)}...
      </div>
    ),
    status: <Badge variant="green">Active</Badge>,
    locations: 1, 
    joined: new Date(location.created_at).toLocaleDateString('en-IN'),
    actions: (
      <div style={{ display: 'flex', gap: '0.5rem' }}>
        <Button variant="ghost" style={{ padding: '0.25rem' }}><MoreVertical size={16} /></Button>
      </div>
    )
  }));

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ fontSize: '1.875rem' }}>Client Management</h1>
          <p style={{ color: 'var(--text-muted)' }}>Onboard and manage multi-tenant venue subscriptions</p>
        </div>
        <Button variant="primary" onClick={() => setModalOpen(true)}>
          <Plus size={20} />
          <span>Onboard New Client</span>
        </Button>
      </div>

      {error && (
        <div style={{ 
          padding: '1rem', 
          backgroundColor: 'rgba(239, 68, 68, 0.1)', 
          border: '1px solid #ef4444', 
          borderRadius: '12px', 
          color: '#ef4444',
          display: 'flex',
          alignItems: 'center',
          gap: '0.75rem'
        }}>
          <AlertTriangle size={20} />
          <span><strong>Database Error:</strong> {error}</span>
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1.5rem' }}>
        <GlassCard>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div style={{ padding: '0.75rem', borderRadius: '12px', backgroundColor: 'rgba(37, 99, 235, 0.1)', color: 'var(--primary)' }}>
              <Building2 size={24} />
            </div>
            <div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Total Subscriptions</div>
              <div style={{ fontSize: '1.25rem', fontWeight: '700' }}>
                {loading ? <Loader2 size={16} className="animate-spin" /> : `${stats.locationCount} Clients`}
              </div>
            </div>
          </div>
        </GlassCard>
        <GlassCard>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div style={{ padding: '0.75rem', borderRadius: '12px', backgroundColor: 'rgba(245, 158, 11, 0.1)', color: 'var(--gold-600)' }}>
              <Globe size={24} />
            </div>
            <div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Annual Revenue</div>
              <div style={{ fontSize: '1.25rem', fontWeight: '700' }}>
                {formatCurrency(stats.revenue, currentCountry)}
              </div>
            </div>

          </div>
        </GlassCard>
        <GlassCard>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div style={{ padding: '0.75rem', borderRadius: '12px', backgroundColor: 'rgba(16, 185, 129, 0.1)', color: '#10b981' }}>
              <UserPlus size={24} />
            </div>
            <div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>System Load</div>
              <div style={{ fontSize: '1.25rem', fontWeight: '700' }}>
                 {loading ? <Loader2 size={16} className="animate-spin" /> : `${stats.vehicleCount} Active Cars`}
              </div>
            </div>
          </div>
        </GlassCard>
        <GlassCard>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
             <div style={{ padding: '0.75rem', borderRadius: '12px', backgroundColor: 'rgba(124, 58, 237, 0.1)', color: '#7c3aed' }}>
              <MapPin size={24} />
            </div>
            <div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Success Rate</div>
              <div style={{ fontSize: '1.25rem', fontWeight: '700' }}>100%</div>
            </div>
          </div>
        </GlassCard>
      </div>

      <GlassCard style={{ padding: '0' }}>
         <div style={{ padding: '1.5rem', borderBottom: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <h3 style={{ fontSize: '1.1rem' }}>All Valet In-Charge Signups</h3>
            {!loading && <Badge variant="blue">{locations.length} total</Badge>}
          </div>
          <div style={{ position: 'relative' }}>
            <Search size={16} style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
            <input 
              type="text" 
              placeholder="Search clients..." 
              style={{ 
                padding: '0.5rem 1rem 0.5rem 2.5rem', 
                borderRadius: '8px', 
                border: '1px solid var(--border-color)',
                outline: 'none',
                fontSize: '0.9rem',
                width: '250px',
                backgroundColor: 'var(--bg-app)',
                color: 'var(--text-main)'
              }} 
            />
          </div>
        </div>
        {loading ? (
          <div style={{ padding: '3rem', textAlign: 'center' }}><Loader2 size={32} className="animate-spin" style={{ margin: '0 auto' }} /></div>
        ) : (
          <Table headers={clientHeaders} data={formattedClients} />
        )}
      </GlassCard>

      {/* Onboarding Modal */}
      <Modal 
        isOpen={isModalOpen} 
        onClose={() => setModalOpen(false)} 
        title="Onboard New Client"
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '600', marginBottom: '0.5rem' }}>Client Name</label>
              <input type="text" placeholder="e.g. Hilton Group" style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid var(--border-color)', backgroundColor: 'var(--bg-app)', color: 'var(--text-main)' }} />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '600', marginBottom: '0.5rem' }}>Industry</label>
              <select style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid var(--border-color)', backgroundColor: 'var(--bg-app)', color: 'var(--text-main)' }}>
                <option>Hospitality</option>
                <option>Retail</option>
                <option>Healthcare</option>
                <option>Entertainment</option>
              </select>
            </div>
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '600', marginBottom: '0.5rem' }}>Admin Contact Email</label>
            <div style={{ position: 'relative' }}>
              <Mail size={16} style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
              <input type="email" placeholder="admin@client.com" style={{ width: '100%', padding: '0.75rem 1rem 0.75rem 2.5rem', borderRadius: '8px', border: '1px solid var(--border-color)', backgroundColor: 'var(--bg-app)', color: 'var(--text-main)' }} />
            </div>
          </div>
          <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
            <Button variant="outline" style={{ flex: 1 }} onClick={() => setModalOpen(false)}>Cancel</Button>
            <Button variant="primary" style={{ flex: 2 }}>Create Client Account</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default ClientManagement;
