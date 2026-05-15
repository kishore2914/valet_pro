import React, { useEffect, useState } from 'react';
import { 
  Plus, 
  ArrowUpRight, 
  ArrowDownRight, 
  Clock, 
  Car, 
  Navigation, 
  Key, 
  Search,
  CheckCircle2,
  Loader2,
  TrendingUp
} from 'lucide-react';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer 
} from 'recharts';
import GlassCard from '../../components/ui/GlassCard';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';
import { vehicleService } from '../../services/vehicleService';
import { useAuth } from '../../context/AuthContext';
import { formatNumber } from '../../lib/utils';
import CheckInModal from '../../components/valet/CheckInModal';


const StatCard = ({ title, value, icon: Icon, trend, trendValue, color, loading }) => (
  <GlassCard className="flex-1">
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
      <div style={{ padding: '0.75rem', borderRadius: '12px', backgroundColor: `rgba(${color}, 0.1)`, color: `rgb(${color})` }}>
        <Icon size={24} />
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', color: trend === 'up' ? '#16a34a' : '#dc2626', fontSize: '0.875rem', fontWeight: '600' }}>
        {trend === 'up' ? <ArrowUpRight size={16} /> : <ArrowDownRight size={16} />}
        {trendValue}
      </div>
    </div>
    <div style={{ fontSize: '0.875rem', color: 'var(--text-muted)', fontWeight: '500' }}>{title}</div>
    {loading ? (
      <Loader2 size={24} className="animate-spin" style={{ marginTop: '0.5rem', color: 'var(--text-muted)' }} />
    ) : (
      <div style={{ fontSize: '2rem', fontWeight: '800', marginTop: '0.25rem' }}>{value}</div>
    )}
  </GlassCard>
);

const ValetDashboard = () => {
  const { locationId } = useAuth();
  const [stats, setStats] = useState({ received: 0, parked: 0, requested: 0 });
  const [activities, setActivities] = useState([]);
  const [chartData, setChartData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isCheckinModalOpen, setIsCheckinModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  
  useEffect(() => {
    if (!locationId) {
      setLoading(false);
      return;
    }

    const fetchData = async () => {
      try {
        setLoading(true);
        const { data: statsData } = await vehicleService.getStats(locationId);
        if (statsData) setStats(statsData);

        const { data: vehicleData } = await vehicleService.getActiveVehicles(locationId);
        if (vehicleData) setActivities(vehicleData.slice(0, 5));
        
        // Placeholder chart data until time-series logs are implemented
        setChartData([
          { time: '08:00', in: 0, out: 0 },
          { time: '12:00', in: statsData?.received || 0, out: 0 },
          { time: '18:00', in: 0, out: statsData?.parked || 0 },
        ]);
      } catch (err) {
        console.error('Error fetching dashboard data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();

    const subscription = vehicleService.subscribeToVehicles(locationId, () => {
      fetchData();
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [locationId]);

  const handleNewCheckin = () => {
    setIsCheckinModalOpen(true);
  };


  const getStatusIcon = (status) => {
    switch (status) {
      case 'Parked': return CheckCircle2;
      case 'Ready': return Clock;
      case 'Delivering': return Navigation;
      case 'Returned': return CheckCircle2;
      default: return Car;
    }
  };

  const filteredActivities = activities.filter(activity => 
    (activity.plate_number?.toLowerCase().includes(searchQuery.toLowerCase())) ||
    (activity.model?.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ fontSize: '1.875rem' }}>Operations Control</h1>
          <p style={{ color: 'var(--text-muted)' }}>Real-time vehicle management for your location</p>
        </div>
        <div style={{ display: 'flex', gap: '1rem' }}>
          <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
            <Search size={18} style={{ position: 'absolute', left: '1rem', color: 'var(--text-muted)' }} />
            <input 
              type="text" 
              placeholder="Search Plate Number..." 
              style={{ 
                padding: '0.75rem 1rem 0.75rem 2.75rem', 
                borderRadius: '12px', 
                border: '1px solid var(--border-color)',
                backgroundColor: 'var(--bg-card)',
                width: '300px',
                outline: 'none',
                color: 'var(--text-main)'
              }} 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <Button variant="primary" onClick={handleNewCheckin}>
            <Plus size={20} />
            <span>New Check-in</span>
          </Button>
        </div>
      </div>

      <div style={{ display: 'flex', gap: '1.5rem', flexWrap: 'wrap' }}>
        <StatCard title="Active Vehicles" value={stats.received} icon={Car} trend="up" trendValue="Live" color="37, 99, 235" loading={loading} />
        <StatCard title="In Parking" value={stats.parked} icon={Navigation} trend="up" trendValue="Live" color="249, 115, 22" loading={loading} />
        <StatCard title="Retrieval Queue" value={stats.requested} icon={Key} trend="up" trendValue="Live" color="220, 38, 38" loading={loading} />
        <StatCard title="Location Rating" value="4.8" icon={TrendingUp} trend="up" trendValue="+0.2" color="14, 165, 233" loading={false} />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '1.5rem' }}>
        <GlassCard style={{ padding: '1.5rem 2rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
            <h3 style={{ fontSize: '1.25rem' }}>Vehicle Traffic Flow</h3>
            <div style={{ display: 'flex', gap: '1rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.875rem' }}>
                <div style={{ width: '12px', height: '12px', borderRadius: '50%', backgroundColor: 'var(--primary)' }}></div>
                <span>Inbound</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.875rem' }}>
                <div style={{ width: '12px', height: '12px', borderRadius: '50%', backgroundColor: 'var(--accent)' }}></div>
                <span>Outbound</span>
              </div>
            </div>
          </div>
          <div style={{ height: '300px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="colorIn" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="var(--primary)" stopOpacity={0.1}/>
                    <stop offset="95%" stopColor="var(--primary)" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorOut" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="var(--accent)" stopOpacity={0.1}/>
                    <stop offset="95%" stopColor="var(--accent)" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border-color)" />
                <XAxis dataKey="time" axisLine={false} tickLine={false} tick={{ fill: 'var(--text-muted)', fontSize: 12 }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: 'var(--text-muted)', fontSize: 12 }} />
                <Tooltip 
                   contentStyle={{ backgroundColor: 'var(--bg-surface)', borderRadius: '12px', border: '1px solid var(--border-color)', boxShadow: 'var(--shadow-lg)', color: 'var(--text-main)' }}
                />
                <Area type="monotone" dataKey="in" stroke="var(--primary)" strokeWidth={3} fillOpacity={1} fill="url(#colorIn)" />
                <Area type="monotone" dataKey="out" stroke="var(--accent)" strokeWidth={3} fillOpacity={1} fill="url(#colorOut)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </GlassCard>

        <GlassCard>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
            <h3 style={{ fontSize: '1.25rem' }}>Live Feed</h3>
            <Button variant="ghost" style={{ fontSize: '0.875rem', padding: '4px 8px' }}>Syncing...</Button>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            {filteredActivities.length === 0 && (
              <div style={{ textAlign: 'center', padding: '3rem 1rem', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem' }}>
                <Car size={48} strokeWidth={1} style={{ opacity: 0.2 }} />
                <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>
                  {searchQuery ? `No vehicles matching "${searchQuery}"` : 'No active vehicles. Start check-in to see activity.'}
                </p>
              </div>
            )}
            {filteredActivities.map((item) => {
              const Icon = getStatusIcon(item.status);
              return (
                <div key={item.id} style={{ display: 'flex', alignItems: 'center', gap: '1rem', paddingBottom: '1rem', borderBottom: '1px solid var(--border-color)' }}>
                  <div style={{ width: '40px', height: '40px', borderRadius: '10px', backgroundColor: 'var(--bg-subtle)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--primary)', border: '1px solid var(--border-subtle)' }}>
                    <Icon size={20} />
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: '600', fontSize: '0.9rem' }}>{item.model || 'Unnamed Vehicle'}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{item.plate_number}</div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <Badge variant={item.status === 'Ready' ? 'red' : item.status === 'Parked' ? 'green' : 'blue'}>{item.status}</Badge>
                    <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                      {new Date(item.received_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </GlassCard>
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
