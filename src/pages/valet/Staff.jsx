import React, { useState, useEffect } from 'react';
import { 
  Users, 
  Search, 
  Plus, 
  Filter, 
  MoreHorizontal, 
  Star,
  Shield,
  TrendingUp,
  Clock,
  Loader2,
  Mail,
  Lock,
  Phone
} from 'lucide-react';


import GlassCard from '../../components/ui/GlassCard';
import Table from '../../components/ui/Table';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';
import Modal from '../../components/ui/Modal';
import { useAuth } from '../../context/AuthContext';
import { staffService } from '../../services/staffService';

const Staff = () => {
  const { locationId } = useAuth();
  const [staffData, setStaffData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setModalOpen] = useState(false);
  const [newStaff, setNewStaff] = useState({ 
    name: '', 
    role: 'Valet Runner',
    email: '',
    password: '',
    phone: ''
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (locationId) {
      fetchStaff();
    } else {
      setLoading(false);
    }
  }, [locationId]);

  const fetchStaff = async () => {
    if (!locationId) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const { data } = await staffService.getStaff(locationId);
      if (data) setStaffData(data);
    } catch (err) {
      console.error('Error fetching staff:', err);
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
        role: 'Valet Runner',
        email: '',
        password: '',
        phone: ''
      });

      fetchStaff();
    } catch (err) {
      console.error('Error adding staff:', err);
      alert('Failed to add staff member. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const headers = ['Staff Member', 'Role', 'Status', 'Cars Handled', 'Rating', 'Join Date', 'Actions'];

  const filteredStaff = staffData.filter(s => 
    s.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const formattedData = filteredStaff.map(staff => ({
    name: (
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
        <div style={{ width: '32px', height: '32px', borderRadius: '50%', backgroundColor: 'var(--primary)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', fontSize: '0.8rem' }}>
          {staff.name.split(' ').map(n => n[0]).join('')}
        </div>
        <div style={{ fontWeight: '600' }}>{staff.name}</div>
      </div>
    ),
    role: staff.role,
    status: (
      <Badge variant={staff.status === 'On Shift' ? 'green' : staff.status === 'Break' ? 'gold' : 'gray'}>
        {staff.status}
      </Badge>
    ),
    handled: (
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
        <TrendingUp size={14} color="#16a34a" />
        <span>{staff.handled_count}</span>
      </div>
    ),
    rating: (
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', color: 'var(--gold-600)' }}>
        <Star size={14} fill="var(--gold-600)" />
        <span style={{ fontWeight: '600' }}>{staff.rating}</span>
      </div>
    ),
    joinDate: new Date(staff.created_at).toLocaleDateString(),
    actions: (
      <Button variant="ghost" style={{ padding: '0.25rem' }}>
        <MoreHorizontal size={18} />
      </Button>
    )
  }));

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ fontSize: '1.875rem' }}>Staff Management</h1>
          <p style={{ color: 'var(--text-muted)' }}>Manage staff performance and shift schedules</p>
        </div>
        <div style={{ display: 'flex', gap: '1rem' }}>
          <Button variant="outline">
            <Filter size={18} />
            <span>Filter</span>
          </Button>
          <Button variant="primary" onClick={() => setModalOpen(true)}>
            <Plus size={18} />
            <span>Add Staff</span>
          </Button>
        </div>
      </div>

      {/* Overview Cards */}
      <div style={{ display: 'flex', gap: '1.5rem' }}>
        <GlassCard style={{ flex: 1, display: 'flex', alignItems: 'center', gap: '1.5rem', backgroundColor: 'var(--bg-card)' }}>
          <div style={{ padding: '1rem', borderRadius: '12px', backgroundColor: 'var(--bg-subtle)', color: 'var(--primary)' }}>
            <Users size={24} />
          </div>
          <div>
            <div style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>Total Staff</div>
            <div style={{ fontSize: '1.5rem', fontWeight: '700' }}>
              {loading ? <Loader2 size={20} className="animate-spin" /> : `${staffData.length} Members`}
            </div>
          </div>
        </GlassCard>
        <GlassCard style={{ flex: 1, display: 'flex', alignItems: 'center', gap: '1.5rem', backgroundColor: 'var(--bg-card)' }}>
          <div style={{ padding: '1rem', borderRadius: '12px', backgroundColor: 'var(--bg-subtle)', color: '#16a34a' }}>
            <Shield size={24} />
          </div>
          <div>
            <div style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>Active Shift</div>
            <div style={{ fontSize: '1.5rem', fontWeight: '700' }}>
               {loading ? <Loader2 size={20} className="animate-spin" /> : `${staffData.filter(s => s.status === 'On Shift').length} Active`}
            </div>
          </div>
        </GlassCard>
        <GlassCard style={{ flex: 1, display: 'flex', alignItems: 'center', gap: '1.5rem', backgroundColor: 'var(--bg-card)' }}>
          <div style={{ padding: '1rem', borderRadius: '12px', backgroundColor: 'var(--bg-subtle)', color: 'var(--gold-600)' }}>
            <Clock size={24} />
          </div>
          <div>
            <div style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>Avg. Response</div>
            <div style={{ fontSize: '1.5rem', fontWeight: '700' }}>3.2 mins</div>
          </div>
        </GlassCard>
      </div>

      <GlassCard style={{ padding: '0' }}>
        <div style={{ padding: '1.5rem', borderBottom: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h3 style={{ fontSize: '1.1rem' }}>Active Personnel</h3>
          <div style={{ position: 'relative' }}>
            <Search size={16} style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
            <input 
              type="text" 
              placeholder="Search staff..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
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
          <Table headers={headers} data={formattedData} />
        )}
      </GlassCard>

      {/* Add Staff Modal */}
      <Modal 
        isOpen={isModalOpen} 
        onClose={() => setModalOpen(false)} 
        title="Onboard New Staff Member"
      >
        <form onSubmit={handleAddStaff} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <div>
            <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '600', marginBottom: '0.5rem' }}>Full Name</label>
            <input 
              type="text" 
              required
              placeholder="e.g. Rahul Sharma" 
              value={newStaff.name}
              onChange={(e) => setNewStaff({ ...newStaff, name: e.target.value })}
              style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid var(--border-color)', backgroundColor: 'var(--bg-app)', color: 'var(--text-main)', outline: 'none' }} 
            />
          </div>
          
          <div>
            <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '600', marginBottom: '0.5rem' }}>Assign Role</label>
            <select 
              value={newStaff.role}
              onChange={(e) => setNewStaff({ ...newStaff, role: e.target.value })}
              style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid var(--border-color)', backgroundColor: 'var(--bg-app)', color: 'var(--text-main)', outline: 'none' }}
            >
              <option>Valet Runner</option>
              <option>Shift Lead</option>
              <option>Parking Warden</option>
              <option>Security Liaison</option>
            </select>
          </div>
          
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '600', marginBottom: '0.5rem' }}>Phone Number</label>
              <div style={{ position: 'relative' }}>
                <Phone size={16} style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                <input 
                  type="tel" 
                  placeholder="+91 98765 43210" 
                  value={newStaff.phone}
                  onChange={(e) => setNewStaff({ ...newStaff, phone: e.target.value })}
                  style={{ width: '100%', padding: '0.75rem 0.75rem 0.75rem 2.25rem', borderRadius: '8px', border: '1px solid var(--border-color)', backgroundColor: 'var(--bg-app)', color: 'var(--text-main)', outline: 'none' }} 
                />
              </div>
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '600', marginBottom: '0.5rem' }}>Email Address</label>
              <div style={{ position: 'relative' }}>
                <Mail size={16} style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                <input 
                  type="email" 
                  required
                  placeholder="staff@valetpro.com" 
                  value={newStaff.email}
                  onChange={(e) => setNewStaff({ ...newStaff, email: e.target.value })}
                  style={{ width: '100%', padding: '0.75rem 0.75rem 0.75rem 2.25rem', borderRadius: '8px', border: '1px solid var(--border-color)', backgroundColor: 'var(--bg-app)', color: 'var(--text-main)', outline: 'none' }} 
                />
              </div>
            </div>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '600', marginBottom: '0.5rem' }}>Create Password</label>
            <div style={{ position: 'relative' }}>
              <Lock size={16} style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
              <input 
                type="password" 
                required
                placeholder="••••••••" 
                value={newStaff.password}
                onChange={(e) => setNewStaff({ ...newStaff, password: e.target.value })}
                style={{ width: '100%', padding: '0.75rem 0.75rem 0.75rem 2.25rem', borderRadius: '8px', border: '1px solid var(--border-color)', backgroundColor: 'var(--bg-app)', color: 'var(--text-main)', outline: 'none' }} 
              />
            </div>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.4rem' }}>Staff will use this password to log in to the mobile application.</p>
          </div>


          <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
            <Button variant="outline" type="button" onClick={() => setModalOpen(false)} style={{ flex: 1 }}>
              Cancel
            </Button>
            <Button variant="primary" type="submit" disabled={isSubmitting} style={{ flex: 2 }}>
              {isSubmitting ? <Loader2 size={20} className="animate-spin" /> : 'Onboard Staff'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default Staff;
