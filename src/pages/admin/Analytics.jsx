import React, { useEffect, useState } from 'react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line
} from 'recharts';
import { 
  TrendingUp, 
  Users, 
  Building2, 
  IndianRupee,
  Download,
  Calendar,
  Globe,
  Activity,
  Loader2,
  X,
  MapPin,
  Shield,
  User
} from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { formatCurrency, formatNumber } from '../../lib/utils';
import GlassCard from '../../components/ui/GlassCard';
import Button from '../../components/ui/Button';
import Table from '../../components/ui/Table';
import Badge from '../../components/ui/Badge';
import Modal from '../../components/ui/Modal';

const COLORS = ['#2563eb', '#f59e0b', '#10b981', '#ef4444'];

const Analytics = () => {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalRevenue: 0,
    activeLocations: 0,
    totalUsers: 0,
    health: '99.9%'
  });
  const [locations, setLocations] = useState([]);
  const [revenueHistory, setRevenueHistory] = useState([]);
  const [typeDistribution, setTypeDistribution] = useState([]);
  const [usersModalOpen, setUsersModalOpen] = useState(false);
  const [allUsers, setAllUsers] = useState([]);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      // 1. Fetch Locations Count
      const { count: locationCount } = await supabase
        .from('locations')
        .select('*', { count: 'exact', head: true });

      // 2. Fetch user counts: profiles (valet in-charges) + staff members
      const { count: profileCount } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true });

      const { count: staffCount } = await supabase
        .from('staff')
        .select('*', { count: 'exact', head: true });

      const totalUsers = (profileCount || 0) + (staffCount || 0);

      // 3. Fetch Locations Table with profile count per location
      const { data: locationsData } = await supabase
        .from('locations')
        .select(`
          id,
          name,
          location,
          vehicles(id, status),
          profiles(id)
        `)
        .order('name');

      // Process locations for table
      const processedLocations = (locationsData || []).map(v => {
        const vehicles = v.vehicles || [];
        const activeCount = vehicles.filter(veh => veh.status !== 'Delivered').length;
        const valetCount = (v.profiles || []).length;
        return {
          name: <div style={{ fontWeight: '600' }}>{v.name}</div>,
          type: 'Standard',
          status: <Badge variant="green">Active</Badge>,
          revenue: formatCurrency(0),
          valets: valetCount,
          util: (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <div style={{ flex: 1, height: '6px', width: '60px', backgroundColor: 'var(--slate-200)', borderRadius: '3px', position: 'relative' }}>
                <div style={{ position: 'absolute', top: 0, left: 0, height: '100%', width: `${Math.min(activeCount * 10, 100)}%`, backgroundColor: 'var(--primary)', borderRadius: '3px' }}></div>
              </div>
              <span style={{ fontSize: '0.8rem' }}>{activeCount} active</span>
            </div>
          )
        };
      });

      setStats(prev => ({
        ...prev,
        activeLocations: locationCount || 0,
        totalUsers
      }));
      setLocations(processedLocations);

      // 4. Fetch all user details for the modal
      const { data: profilesData } = await supabase
        .from('profiles')
        .select('id, full_name, email, role, location_id, locations(name)');

      const { data: staffData } = await supabase
        .from('staff')
        .select('id, name, role, email, phone, status, location_id, locations(name)');

      const inCharges = (profilesData || []).map(p => ({
        id: p.id,
        name: p.full_name || p.email || 'Unknown',
        type: 'Valet In-Charge',
        role: p.role,
        location: p.locations?.name || 'N/A',
        email: p.email,
        status: 'Active'
      }));

      const runners = (staffData || []).map(s => ({
        id: s.id,
        name: s.name || 'Unknown',
        type: 'Staff Runner',
        role: s.role || 'Valet Runner',
        location: s.locations?.name || 'N/A',
        email: s.email || '-',
        status: s.status || 'On Shift'
      }));

      setAllUsers([...inCharges, ...runners]);

      setRevenueHistory([{ month: 'Current', revenue: 0 }]);
      setTypeDistribution([{ name: 'Active', value: locationCount || 0 }]);

    } catch (error) {
      console.error('Error fetching analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  const locationHeaders = ['Location Name', 'Type', 'Status', 'Daily Revenue', 'Active Valets', 'Utilization'];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ fontSize: '1.875rem' }}>Global Analytics</h1>
          <p style={{ color: 'var(--text-muted)' }}>Cross-tenant performance overview across all locations</p>
        </div>
        <div style={{ display: 'flex', gap: '1rem' }}>
          <Button variant="outline">
            <Calendar size={18} />
            <span>Last 30 Days</span>
          </Button>
          <Button variant="primary">
            <Download size={18} />
            <span>Export Report</span>
          </Button>
        </div>
      </div>

      {/* Top Stats */}
      <div style={{ display: 'flex', gap: '1.5rem' }}>
        <GlassCard style={{ flex: 1 }}>
          <div style={{ color: 'var(--text-muted)', fontSize: '0.875rem', marginBottom: '0.5rem' }}>Total System Revenue</div>
          <div style={{ fontSize: '2rem', fontWeight: '800', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <IndianRupee size={24} color="var(--primary)" />
            <span>{formatNumber(stats.totalRevenue)}</span>
          </div>
          <div style={{ fontSize: '0.8rem', color: '#16a34a', marginTop: '0.5rem', fontWeight: '600' }}>Live Data</div>
        </GlassCard>
        <GlassCard style={{ flex: 1 }}>
          <div style={{ color: 'var(--text-muted)', fontSize: '0.875rem', marginBottom: '0.5rem' }}>Active Locations</div>
          <div style={{ fontSize: '2rem', fontWeight: '800', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Building2 size={24} color="var(--primary)" />
            <span>{stats.activeLocations}</span>
          </div>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.5rem' }}>Manage all venues</div>
        </GlassCard>
        <GlassCard style={{ flex: 1, cursor: 'pointer' }} onClick={() => setUsersModalOpen(true)}>
          <div style={{ color: 'var(--text-muted)', fontSize: '0.875rem', marginBottom: '0.5rem' }}>Daily Active Users</div>
          <div style={{ fontSize: '2rem', fontWeight: '800', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Users size={24} color="var(--primary)" />
            <span>{stats.totalUsers}</span>
          </div>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.5rem' }}>Staff &amp; In-Charges → View Details</div>
        </GlassCard>
        <GlassCard style={{ flex: 1 }}>
          <div style={{ color: 'var(--text-muted)', fontSize: '0.875rem', marginBottom: '0.5rem' }}>System Health</div>
          <div style={{ fontSize: '2rem', fontWeight: '800', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Activity size={24} color="#16a34a" />
            <span>{stats.health}</span>
          </div>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.5rem' }}>Connected to Supabase</div>
        </GlassCard>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '1.5rem' }}>
        <GlassCard>
          <h3 style={{ marginBottom: '1.5rem' }}>Revenue Growth</h3>
          <div style={{ height: '350px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={revenueHistory}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border-color)" />
                <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fill: 'var(--text-muted)' }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: 'var(--text-muted)' }} />
                <Tooltip 
                  formatter={(value) => formatCurrency(value)}
                  contentStyle={{ backgroundColor: 'var(--bg-card)', borderRadius: '12px', border: '1px solid var(--border-color)' }}
                />
                <Line type="monotone" dataKey="revenue" stroke="var(--primary)" strokeWidth={4} dot={{ r: 6, fill: 'var(--primary)' }} activeDot={{ r: 8 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </GlassCard>

        <GlassCard>
          <h3 style={{ marginBottom: '1.5rem' }}>Venue Distribution</h3>
          <div style={{ height: '350px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={typeDistribution}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {typeDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', justifyContent: 'center', marginTop: '1rem' }}>
            {typeDistribution.map((entry, index) => (
              <div key={entry.name} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.8rem' }}>
                <div style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: COLORS[index % COLORS.length] }}></div>
                <span>{entry.name} : {entry.value}</span>
              </div>
            ))}
          </div>
        </GlassCard>
      </div>

      <GlassCard style={{ padding: '0' }}>
        <div style={{ padding: '1.5rem', borderBottom: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h3 style={{ fontSize: '1.1rem' }}>Active Location Performance</h3>
          <Button variant="ghost" style={{ color: 'var(--primary)', fontWeight: '600' }}>
            {loading ? <Loader2 className="animate-spin" /> : 'Real-Time Sync'}
          </Button>
        </div>
        <Table headers={locationHeaders} data={locations} emptyMessage="No locations registered yet. New signups will appear here." />
      </GlassCard>
      {/* Users Detail Modal */}
      <Modal isOpen={usersModalOpen} onClose={() => setUsersModalOpen(false)} title={`All Users (${allUsers.length})`}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', maxHeight: '60vh', overflowY: 'auto' }}>
          {allUsers.length === 0 ? (
            <div style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '2rem' }}>No users found</div>
          ) : allUsers.map(u => (
            <div key={u.id} style={{
              display: 'flex', alignItems: 'center', gap: '1rem',
              padding: '0.875rem 1rem', borderRadius: '12px',
              border: '1px solid var(--border-color)', backgroundColor: 'var(--bg-subtle)'
            }}>
              {/* Avatar */}
              <div style={{
                width: '40px', height: '40px', borderRadius: '50%', flexShrink: 0,
                backgroundColor: u.type === 'Valet In-Charge' ? 'rgba(37,99,235,0.12)' : 'rgba(16,185,129,0.12)',
                color: u.type === 'Valet In-Charge' ? 'var(--primary)' : '#10b981',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontWeight: '700', fontSize: '1rem'
              }}>
                {u.name?.charAt(0).toUpperCase()}
              </div>
              {/* Info */}
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontWeight: '700', fontSize: '0.95rem' }}>{u.name}</div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'flex', gap: '0.75rem', flexWrap: 'wrap', marginTop: '0.2rem' }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                    <MapPin size={11} /> {u.location}
                  </span>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                    <Shield size={11} /> {u.role}
                  </span>
                </div>
              </div>
              {/* Badges */}
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '0.4rem', flexShrink: 0 }}>
                <Badge variant={u.type === 'Valet In-Charge' ? 'blue' : 'green'} style={{ fontSize: '0.65rem' }}>
                  {u.type}
                </Badge>
                <Badge variant={u.status === 'Active' || u.status === 'On Shift' ? 'green' : 'gray'} style={{ fontSize: '0.65rem' }}>
                  {u.status}
                </Badge>
              </div>
            </div>
          ))}
        </div>
      </Modal>
    </div>
  );
};

export default Analytics;

