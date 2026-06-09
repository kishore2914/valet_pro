import React, { useState, useEffect } from 'react';
import { 
  Search, 
  Plus, 
  Star, 
  Crown, 
  TrendingUp, 
  Smartphone, 
  Mail, 
  Car, 
  User,
  X,
  MessageSquare
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { vehicleService } from '../../services/vehicleService';
import { supabase } from '../../lib/supabase';

// Helpers to get tier styling
const getTierStyle = (tier) => {
  const t = (tier || '').toLowerCase();
  if (t === 'platinum') {
    return {
      bg: 'rgba(251, 191, 36, 0.04)',
      color: '#fbbf24',
      border: '1px solid rgba(251, 191, 36, 0.2)'
    };
  } else if (t === 'gold') {
    return {
      bg: 'rgba(251, 191, 36, 0.04)',
      color: '#fbbf24',
      border: '1px solid rgba(251, 191, 36, 0.2)'
    };
  } else if (t === 'silver') {
    return {
      bg: 'rgba(156, 163, 175, 0.04)',
      color: '#9ca3af',
      border: '1px solid rgba(156, 163, 175, 0.2)'
    };
  }
  return {
    bg: 'rgba(100, 116, 139, 0.04)',
    color: '#64748b',
    border: '1px solid rgba(100, 116, 139, 0.2)'
  };
};

const initialMockCustomers = [
  {
    id: 'cust-1',
    name: 'Vikram Mehta',
    phone: '+91 99987 65432',
    email: 'vikram.mehta@gmail.com',
    tier: 'Platinum',
    visits: 47,
    spend: 28400,
    rating: 4.9,
    is_vip: true,
    notes: 'Prefers slot A-12. Likes premium tissue box in the vehicle.',
    vehicles: ['TN 01 AB 1234', 'TN 01 XY 9999']
  },
  {
    id: 'cust-2',
    name: 'Priya Sharma',
    phone: '+91 87654 32109',
    email: 'priya.sharma@yahoo.com',
    tier: 'Platinum',
    visits: 1,
    spend: 350,
    rating: 4.5,
    is_vip: true,
    notes: 'No specific instructions.',
    vehicles: ['KA 05 CD 5678']
  },
  {
    id: 'cust-3',
    name: 'Vikram Singh',
    phone: '+91 54321 09876',
    email: 'vsingh@outlook.com',
    tier: 'Platinum',
    visits: 1,
    spend: 0,
    rating: 4.5,
    is_vip: true,
    notes: 'Valet VIP member.',
    vehicles: ['MH 12 EF 9012']
  },
  {
    id: 'cust-4',
    name: 'Karan Mehta',
    phone: '+91 99987 12345',
    email: 'karan.mehta@hotmail.com',
    tier: 'Platinum',
    visits: 1,
    spend: 500,
    rating: 4.5,
    is_vip: true,
    notes: 'Prefers parking in EV charging slots.',
    vehicles: ['KA 51 ME 5432']
  },
  {
    id: 'cust-5',
    name: 'Nisha Kapoor',
    phone: '+91 88776 54321',
    email: 'nisha.k@gmail.com',
    tier: 'Platinum',
    visits: 1,
    spend: 800,
    rating: 4.5,
    is_vip: true,
    notes: 'VIP customer.',
    vehicles: ['DL 03 AP 7654']
  },
  {
    id: 'cust-6',
    name: 'Sneha Kapoor',
    phone: '+91 98765 11223',
    email: 'sneha.kapoor@gmail.com',
    tier: 'Gold',
    visits: 23,
    spend: 12800,
    rating: 4.7,
    is_vip: true,
    notes: 'Frequent guest. Prefers shaded parking spots.',
    vehicles: ['MH 02 BG 4321']
  },
  {
    id: 'cust-7',
    name: 'Rajesh Kumar',
    phone: '+91 98765 43210',
    email: 'rajesh.kumar@gmail.com',
    tier: 'Gold',
    visits: 1,
    spend: 350,
    rating: 4.5,
    is_vip: true,
    notes: 'No specific notes.',
    vehicles: ['TN 07 CD 8765']
  },
  {
    id: 'cust-8',
    name: 'Arjun Menon',
    phone: '+91 32109 87654',
    email: 'arjun.menon@gmail.com',
    tier: 'Gold',
    visits: 1,
    spend: 600,
    rating: 4.5,
    is_vip: true,
    notes: 'No specific notes.',
    vehicles: ['KL 07 BG 9876']
  },
  {
    id: 'cust-9',
    name: 'Amit Patel',
    phone: '+91 78543 21098',
    email: 'amit.patel@gmail.com',
    tier: 'Silver',
    visits: 1,
    spend: 450,
    rating: 4.5,
    is_vip: false,
    notes: 'Guest user.',
    vehicles: ['MH 12 EF 9012']
  },
  {
    id: 'cust-10',
    name: 'Suresh Kumar',
    phone: '+91 91234 56789',
    email: 'suresh.k@gmail.com',
    tier: 'Gold',
    visits: 15,
    spend: 5400,
    rating: 4.8,
    is_vip: true,
    notes: 'VIP customer.',
    vehicles: ['TN 01 AB 8888']
  },
  {
    id: 'cust-11',
    name: 'Rohan Joshi',
    phone: '+91 98761 23456',
    email: 'rohan.j@gmail.com',
    tier: 'Gold',
    visits: 11,
    spend: 4200,
    rating: 4.6,
    is_vip: true,
    notes: 'Frequent hotel diner.',
    vehicles: ['KA 03 MN 4444']
  },
  {
    id: 'cust-12',
    name: 'Kiran Rao',
    phone: '+91 94421 87654',
    email: 'kiran.rao@gmail.com',
    tier: 'Silver',
    visits: 6,
    spend: 2100,
    rating: 4.4,
    is_vip: false,
    notes: 'Regular diner.',
    vehicles: ['KA 04 CD 1212']
  },
  {
    id: 'cust-13',
    name: 'Meera Nair',
    phone: '+91 90031 98765',
    email: 'meera.nair@gmail.com',
    tier: 'Standard',
    visits: 2,
    spend: 700,
    rating: 4.2,
    is_vip: false,
    notes: 'Standard runner.',
    vehicles: ['KL 01 XY 3333']
  },
  {
    id: 'cust-14',
    name: 'Deepak Gill',
    phone: '+91 98401 23456',
    email: 'deepak.gill@gmail.com',
    tier: 'Standard',
    visits: 4,
    spend: 1400,
    rating: 4.3,
    is_vip: false,
    notes: 'Standard runner.',
    vehicles: ['HR 26 AZ 4567']
  }
];

const Customers = () => {
  const { locationId } = useAuth();
  const [vehicles, setVehicles] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTierTab, setActiveTierTab] = useState('All');
  const [selectedCustomerId, setSelectedCustomerId] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [loading, setLoading] = useState(true);

  // New Customer Form State
  const [newCustName, setNewCustName] = useState('');
  const [newCustPhone, setNewCustPhone] = useState('');
  const [newCustEmail, setNewCustEmail] = useState('');
  const [newCustTier, setNewCustTier] = useState('Standard');
  const [newCustIsVIP, setNewCustIsVIP] = useState(false);

  // Customer state, starts empty and resolves to Supabase on load
  const [customCustomers, setCustomCustomers] = useState([]);

  // Fetch live checked-in vehicles and customers from Supabase customers table
  const fetchData = async () => {
    if (!locationId) { setLoading(false); return; }
    try {
      // 1. Fetch active vehicles
      const { data: vData } = await vehicleService.getActiveVehicles(locationId);
      if (vData) setVehicles(vData);

      // 2. Fetch customers from Supabase customers table
      const { data: dbCusts, error: dbErr } = await supabase
        .from('customers')
        .select('*')
        .eq('location_id', locationId);

      if (dbErr) {
        console.error('Error fetching customers from DB:', dbErr);
      } else if (dbCusts) {
        const mappedCusts = dbCusts.map(c => ({
          id: c.id,
          name: c.name,
          phone: c.phone,
          email: c.email || '',
          tier: c.tier || 'Standard',
          visits: c.visits || 1,
          spend: Number(c.spend) || 0,
          rating: Number(c.rating) || 5.0,
          is_vip: c.is_vip || false,
          notes: c.notes || '',
          vehicles: c.vehicles || []
        }));
        setCustomCustomers(mappedCusts);
      }
    } catch (err) {
      console.error('Error fetching customers:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [locationId]);

  // Seed mock customer entries into the database manually
  const handleSeedCustomers = async () => {
    setLoading(true);
    try {
      const seedPayload = initialMockCustomers.map(c => ({
        location_id: locationId,
        name: c.name,
        phone: c.phone,
        email: c.email,
        tier: c.tier,
        visits: c.visits,
        spend: c.spend,
        rating: c.rating,
        is_vip: c.is_vip,
        notes: c.notes,
        vehicles: c.vehicles
      }));

      const { data, error } = await supabase
        .from('customers')
        .insert(seedPayload)
        .select();

      if (error) throw error;
      if (data) {
        const mapped = data.map(c => ({
          id: c.id,
          name: c.name,
          phone: c.phone,
          email: c.email || '',
          tier: c.tier || 'Standard',
          visits: c.visits || 1,
          spend: Number(c.spend) || 0,
          rating: Number(c.rating) || 5.0,
          is_vip: c.is_vip || false,
          notes: c.notes || '',
          vehicles: c.vehicles || []
        }));
        setCustomCustomers(mapped);
      }
    } catch (err) {
      console.error('Error seeding customers:', err);
      alert('Failed to seed customers: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  // Clear all customer entries for the current location from the database
  const handleClearCustomers = async () => {
    if (!window.confirm('Are you sure you want to clear all customer profiles from the database?')) return;
    setLoading(true);
    try {
      const { error } = await supabase
        .from('customers')
        .delete()
        .eq('location_id', locationId);

      if (error) throw error;
      setCustomCustomers([]);
      setSelectedCustomerId(null);
    } catch (err) {
      console.error('Error clearing customers:', err);
      alert('Failed to clear customers: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  // Aggregate dynamic customer data from Supabase vehicles list
  const getAggregatedCustomers = () => {
    const custMap = {};

    // First initialize with the static/seeded ones
    customCustomers.forEach(c => {
      custMap[c.phone] = { ...c };
    });

    // Merge with live database checks
    if (vehicles && vehicles.length > 0) {
      vehicles.forEach(v => {
        const phone = v.phone_number || v.customer_mobile;
        if (!phone) return;
        const name = v.owner_name || 'Guest';

        if (custMap[phone]) {
          if (!custMap[phone].vehicles.includes(v.plate_number)) {
            custMap[phone].vehicles.push(v.plate_number);
          }
        } else {
          // Create new customer
          custMap[phone] = {
            id: `db-${v.id}`,
            name: name,
            phone: phone,
            email: v.customer_email || `${name.toLowerCase().replace(/\s+/g, '')}@gmail.com`,
            tier: 'Standard',
            visits: 1,
            spend: 350,
            rating: 5.0,
            is_vip: false,
            notes: 'No specific notes recorded.',
            vehicles: [v.plate_number]
          };
        }
      });
    }

    return Object.values(custMap);
  };

  const allCustomers = getAggregatedCustomers();

  // Handle adding a new customer manually
  const handleAddCustomer = async (e) => {
    e.preventDefault();
    if (!newCustName || !newCustPhone) return;

    const newCustomerPayload = {
      location_id: locationId,
      name: newCustName,
      phone: newCustPhone,
      email: newCustEmail || `${newCustName.toLowerCase().replace(/\s+/g, '')}@gmail.com`,
      tier: newCustTier,
      visits: 1,
      spend: 350,
      rating: 5.0,
      is_vip: newCustIsVIP,
      notes: 'Manually added customer profile.',
      vehicles: []
    };

    try {
      const { data, error } = await supabase
        .from('customers')
        .insert([newCustomerPayload])
        .select();

      if (error) {
        console.error('Error inserting customer into DB:', error);
        // Fallback locally
        const fallbackId = `custom-${Date.now()}`;
        setCustomCustomers(prev => [{ id: fallbackId, ...newCustomerPayload }, ...prev]);
        setSelectedCustomerId(fallbackId);
      } else if (data && data.length > 0) {
        const created = data[0];
        const mappedCreated = {
          id: created.id,
          name: created.name,
          phone: created.phone,
          email: created.email || '',
          tier: created.tier || 'Standard',
          visits: created.visits || 1,
          spend: Number(created.spend) || 0,
          rating: Number(created.rating) || 5.0,
          is_vip: created.is_vip || false,
          notes: created.notes || '',
          vehicles: created.vehicles || []
        };
        setCustomCustomers(prev => [mappedCreated, ...prev]);
        setSelectedCustomerId(mappedCreated.id);
      }
    } catch (err) {
      console.error('Exception adding customer:', err);
      const fallbackId = `custom-${Date.now()}`;
      setCustomCustomers(prev => [{ id: fallbackId, ...newCustomerPayload }, ...prev]);
      setSelectedCustomerId(fallbackId);
    }

    setShowAddModal(false);

    // Reset fields
    setNewCustName('');
    setNewCustPhone('');
    setNewCustEmail('');
    setNewCustTier('Standard');
    setNewCustIsVIP(false);
  };

  // Search and Tier Filter Logic
  const filteredCustomers = allCustomers.filter(c => {
    const matchesSearch = 
      c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.phone.includes(searchQuery) ||
      c.vehicles.some(plate => plate.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesTier = activeTierTab === 'All' || c.tier.toLowerCase() === activeTierTab.toLowerCase();

    return matchesSearch && matchesTier;
  });

  // Calculate high-fidelity totals matching the screenshot
  const totalCount = allCustomers.length;
  const vipCount = allCustomers.filter(c => c.is_vip).length;
  const totalRevenue = allCustomers.reduce((sum, c) => sum + c.spend, 0);
  const avgRating = totalCount > 0 
    ? (allCustomers.reduce((sum, c) => sum + c.rating, 0) / totalCount).toFixed(1)
    : '0.0';

  // Selected Customer details
  const selectedCustomer = allCustomers.find(c => c.id === selectedCustomerId);

  // Format currency
  const formatCurrency = (val) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(val);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', width: '100%' }}>
      {/* Title Header Section */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.85rem', fontWeight: '800', color: '#ffffff', marginBottom: '0.25rem' }}>Customers & VIPs</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', fontWeight: '500' }}>
            {totalCount} customers · {vipCount} VIPs
          </p>
        </div>
        <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
          {customCustomers.length > 0 && (
            <button
              onClick={handleClearCustomers}
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
          {customCustomers.length === 0 && (
            <button
              onClick={handleSeedCustomers}
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
              Seed Demo Data
            </button>
          )}
          <button
            onClick={() => setShowAddModal(true)}
            style={{
              backgroundColor: '#fbbf24',
              color: '#080c14',
              border: 'none',
              borderRadius: '10px',
              padding: '0.65rem 1.15rem',
              fontSize: '0.85rem',
              fontWeight: '700',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              boxShadow: '0 4px 15px rgba(251, 191, 36, 0.15)',
              transition: 'all 0.15s ease'
            }}
            onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-1px)'}
            onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
          >
            <Plus size={16} />
            <span>Add Customer</span>
          </button>
        </div>
      </div>

      {/* Analytics KPI Row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem' }}>
        {/* Total Customers */}
        <div style={{
          backgroundColor: 'var(--bg-card)',
          border: '1px solid var(--border-color)',
          borderRadius: '12px',
          padding: '1.25rem',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start'
        }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            <span style={{ fontSize: '0.65rem', fontWeight: '800', color: 'var(--text-muted)', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
              Total
            </span>
            <span style={{ fontSize: '1.85rem', fontWeight: '800', color: '#ffffff' }}>{totalCount}</span>
          </div>
          <div style={{ color: 'var(--text-muted)', opacity: 0.7 }}><Star size={20} /></div>
        </div>

        {/* VIPs */}
        <div style={{
          backgroundColor: 'var(--bg-card)',
          border: '1px solid var(--border-color)',
          borderRadius: '12px',
          padding: '1.25rem',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start'
        }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            <span style={{ fontSize: '0.65rem', fontWeight: '800', color: 'var(--text-muted)', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
              VIPs
            </span>
            <span style={{ fontSize: '1.85rem', fontWeight: '800', color: '#fbbf24' }}>{vipCount}</span>
          </div>
          <div style={{ color: '#fbbf24', opacity: 0.8 }}><Crown size={20} /></div>
        </div>

        {/* Lifetime Revenue */}
        <div style={{
          backgroundColor: 'var(--bg-card)',
          border: '1px solid var(--border-color)',
          borderRadius: '12px',
          padding: '1.25rem',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start'
        }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            <span style={{ fontSize: '0.65rem', fontWeight: '800', color: 'var(--text-muted)', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
              Lifetime Revenue
            </span>
            <span style={{ fontSize: '1.85rem', fontWeight: '800', color: '#ffffff' }}>
              ₹{(totalRevenue / 1000).toFixed(1)}K
            </span>
          </div>
          <span style={{ fontSize: '1.25rem', fontWeight: '700', color: 'var(--text-muted)', opacity: 0.8 }}>₹</span>
        </div>

        {/* Average Rating */}
        <div style={{
          backgroundColor: 'var(--bg-card)',
          border: '1px solid var(--border-color)',
          borderRadius: '12px',
          padding: '1.25rem',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start'
        }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            <span style={{ fontSize: '0.65rem', fontWeight: '800', color: 'var(--text-muted)', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
              Avg Rating
            </span>
            <span style={{ fontSize: '1.85rem', fontWeight: '800', color: '#ffffff', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
              <span style={{ color: '#fbbf24' }}>★</span> {avgRating}
            </span>
          </div>
          <div style={{ color: 'var(--text-muted)', opacity: 0.7 }}><TrendingUp size={20} /></div>
        </div>
      </div>

      {/* Filter and Search Bar Section */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
        <div style={{ position: 'relative', display: 'flex', alignItems: 'center', flex: 1, maxWidth: '400px' }}>
          <Search size={16} style={{ position: 'absolute', left: '0.85rem', color: 'var(--text-muted)' }} />
          <input 
            type="text" 
            placeholder="Search name, phone, or plate..." 
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
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        {/* Tier selector pills */}
        <div style={{ display: 'flex', gap: '0.35rem', overflowX: 'auto', paddingBottom: '2px' }}>
          {['All', 'Platinum', 'Gold', 'Silver', 'Standard'].map(tierName => {
            const isActive = activeTierTab === tierName;
            return (
              <button
                key={tierName}
                onClick={() => setActiveTierTab(tierName)}
                style={{
                  padding: '0.45rem 0.85rem',
                  borderRadius: '8px',
                  fontSize: '0.75rem',
                  fontWeight: '700',
                  border: isActive ? '1px solid #fbbf24' : '1px solid var(--border-color)',
                  backgroundColor: isActive ? '#fbbf24' : 'var(--bg-card)',
                  color: isActive ? '#080c14' : 'var(--text-muted)',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease'
                }}
              >
                {tierName}
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Split Layout: Customer Table & Profile Details */}
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '1.5rem', alignItems: 'stretch', flexWrap: 'wrap' }}>
        
        {/* Table Panel */}
        <div style={{
          backgroundColor: 'var(--bg-card)',
          border: '1px solid var(--border-color)',
          borderRadius: '12px',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column'
        }}>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border-color)' }}>
                  <th style={{ padding: '1rem', fontSize: '0.7rem', fontWeight: '800', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Customer</th>
                  <th style={{ padding: '1rem', fontSize: '0.7rem', fontWeight: '800', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Tier</th>
                  <th style={{ padding: '1rem', fontSize: '0.7rem', fontWeight: '800', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Visits</th>
                  <th style={{ padding: '1rem', fontSize: '0.7rem', fontWeight: '800', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Spend</th>
                  <th style={{ padding: '1rem', fontSize: '0.7rem', fontWeight: '800', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Rating</th>
                </tr>
              </thead>
              <tbody>
                {filteredCustomers.length > 0 ? (
                  filteredCustomers.map(cust => {
                    const isSelected = selectedCustomerId === cust.id;
                    const badge = getTierStyle(cust.tier);
                    
                    return (
                      <tr 
                        key={cust.id}
                        onClick={() => setSelectedCustomerId(cust.id)}
                        style={{
                          borderBottom: '1px solid var(--border-color)',
                          backgroundColor: isSelected ? 'rgba(251, 191, 36, 0.03)' : 'transparent',
                          cursor: 'pointer',
                          transition: 'all 0.15s ease'
                        }}
                        onMouseEnter={(e) => {
                          if (!isSelected) e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.01)';
                        }}
                        onMouseLeave={(e) => {
                          if (!isSelected) e.currentTarget.style.backgroundColor = 'transparent';
                        }}
                      >
                        {/* Customer Info */}
                        <td style={{ padding: '1rem' }}>
                          <div style={{ display: 'flex', flexDirection: 'column' }}>
                            <span style={{ fontSize: '0.85rem', fontWeight: '700', color: isSelected ? '#fbbf24' : '#ffffff' }}>
                              {cust.name}
                            </span>
                            <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '0.15rem' }}>
                              {cust.phone}
                            </span>
                          </div>
                        </td>

                        {/* Tier Badge */}
                        <td style={{ padding: '1rem' }}>
                          <span style={{
                            padding: '0.2rem 0.5rem',
                            borderRadius: '6px',
                            fontSize: '0.65rem',
                            fontWeight: '700',
                            backgroundColor: badge.bg,
                            color: badge.color,
                            border: badge.border,
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '0.25rem'
                          }}>
                            {cust.tier !== 'Standard' && <Star size={10} fill="currentColor" />}
                            {cust.tier}
                          </span>
                        </td>

                        {/* Visits */}
                        <td style={{ padding: '1rem', fontSize: '0.8rem', fontWeight: '600', color: '#ffffff' }}>
                          {cust.visits}
                        </td>

                        {/* Spend */}
                        <td style={{ padding: '1rem', fontSize: '0.8rem', fontWeight: '600', color: '#ffffff' }}>
                          {formatCurrency(cust.spend)}
                        </td>

                        {/* Rating */}
                        <td style={{ padding: '1rem', fontSize: '0.8rem', fontWeight: '700', color: '#fbbf24' }}>
                          ★ {cust.rating}
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan="5" style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                      <User size={32} style={{ opacity: 0.3, marginBottom: '0.5rem' }} />
                      <p style={{ fontSize: '0.8rem', fontWeight: '600' }}>No customer match found</p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right Details Panel */}
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
          {selectedCustomer ? (
            <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', gap: '1.25rem', justifyContent: 'flex-start' }}>
              {/* Header profile details */}
              <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', borderBottom: '1px solid var(--border-color)', paddingBottom: '1.25rem' }}>
                <div style={{
                  width: '50px',
                  height: '50px',
                  borderRadius: '50%',
                  backgroundColor: 'rgba(251, 191, 36, 0.1)',
                  border: '1.5px solid #fbbf24',
                  color: '#fbbf24',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: '800',
                  fontSize: '1.1rem',
                  textTransform: 'uppercase'
                }}>
                  {selectedCustomer.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                  <span style={{ fontSize: '1rem', fontWeight: '800', color: '#ffffff' }}>
                    {selectedCustomer.name}
                  </span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <span style={{
                      padding: '0.15rem 0.45rem',
                      borderRadius: '4px',
                      fontSize: '0.6rem',
                      fontWeight: '700',
                      backgroundColor: getTierStyle(selectedCustomer.tier).bg,
                      color: getTierStyle(selectedCustomer.tier).color,
                      border: getTierStyle(selectedCustomer.tier).border,
                    }}>
                      {selectedCustomer.tier.toUpperCase()}
                    </span>
                    {selectedCustomer.is_vip && (
                      <span style={{ fontSize: '0.6rem', fontWeight: '700', color: '#fbbf24', display: 'flex', alignItems: 'center', gap: '0.15rem' }}>
                        <Crown size={10} fill="currentColor" /> VIP
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Info details grid */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.15rem', flex: 1 }}>
                
                {/* Contact info */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <Smartphone size={15} style={{ color: 'var(--text-muted)' }} />
                    <span style={{ fontSize: '0.8rem', color: '#ffffff', fontWeight: '600' }}>{selectedCustomer.phone}</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <Mail size={15} style={{ color: 'var(--text-muted)' }} />
                    <span style={{ fontSize: '0.8rem', color: '#ffffff', fontWeight: '600' }}>{selectedCustomer.email}</span>
                  </div>
                </div>

                <hr style={{ border: 'none', borderTop: '1px solid var(--border-color)', margin: '0' }} />

                {/* Score analytics metrics */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.5rem', textAlign: 'center' }}>
                  <div style={{ padding: '0.65rem 0.35rem', backgroundColor: 'rgba(255,255,255,0.01)', border: '1px solid var(--border-color)', borderRadius: '8px' }}>
                    <div style={{ fontSize: '0.6rem', color: 'var(--text-muted)', fontWeight: '700', textTransform: 'uppercase', marginBottom: '0.25rem' }}>Visits</div>
                    <div style={{ fontSize: '0.95rem', fontWeight: '800', color: '#ffffff' }}>{selectedCustomer.visits}</div>
                  </div>
                  <div style={{ padding: '0.65rem 0.35rem', backgroundColor: 'rgba(255,255,255,0.01)', border: '1px solid var(--border-color)', borderRadius: '8px' }}>
                    <div style={{ fontSize: '0.6rem', color: 'var(--text-muted)', fontWeight: '700', textTransform: 'uppercase', marginBottom: '0.25rem' }}>Spend</div>
                    <div style={{ fontSize: '0.95rem', fontWeight: '800', color: '#ffffff' }}>₹{(selectedCustomer.spend / 1000).toFixed(1)}K</div>
                  </div>
                  <div style={{ padding: '0.65rem 0.35rem', backgroundColor: 'rgba(255,255,255,0.01)', border: '1px solid var(--border-color)', borderRadius: '8px' }}>
                    <div style={{ fontSize: '0.6rem', color: 'var(--text-muted)', fontWeight: '700', textTransform: 'uppercase', marginBottom: '0.25rem' }}>Rating</div>
                    <div style={{ fontSize: '0.95rem', fontWeight: '800', color: '#fbbf24' }}>★ {selectedCustomer.rating}</div>
                  </div>
                </div>

                {/* Associated Vehicles list */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                  <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)', fontWeight: '700', textTransform: 'uppercase' }}>Registered Vehicles</span>
                  {selectedCustomer.vehicles.length > 0 ? (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                      {selectedCustomer.vehicles.map((plate) => (
                        <div 
                          key={plate} 
                          style={{ 
                            display: 'flex', 
                            alignItems: 'center', 
                            gap: '0.5rem', 
                            padding: '0.45rem 0.65rem', 
                            backgroundColor: 'rgba(255,255,255,0.02)', 
                            border: '1px solid var(--border-color)',
                            borderRadius: '8px'
                          }}
                        >
                          <Car size={14} style={{ color: 'var(--text-muted)' }} />
                          <span style={{ fontSize: '0.75rem', fontWeight: '700', color: '#ffffff' }}>{plate}</span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontStyle: 'italic' }}>No vehicles linked.</span>
                  )}
                </div>

                {/* Guest preferences notes */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                  <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)', fontWeight: '700', textTransform: 'uppercase' }}>Notes & Preferences</span>
                  <div style={{ 
                    padding: '0.65rem 0.85rem', 
                    borderRadius: '8px', 
                    backgroundColor: 'rgba(251, 191, 36, 0.02)', 
                    border: '1px solid rgba(251, 191, 36, 0.08)',
                    fontSize: '0.75rem',
                    color: 'var(--text-muted)',
                    lineHeight: 1.4
                  }}>
                    {selectedCustomer.notes}
                  </div>
                </div>
              </div>

              {/* Messaging Trigger */}
              <div style={{ display: 'flex', gap: '0.5rem', marginTop: 'auto' }}>
                <button
                  onClick={() => alert(`Opening chat channel with ${selectedCustomer.name}...`)}
                  style={{
                    flex: 1,
                    backgroundColor: '#161e2e',
                    color: '#ffffff',
                    border: '1px solid var(--border-color)',
                    borderRadius: '8px',
                    padding: '0.55rem',
                    fontSize: '0.75rem',
                    fontWeight: '700',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '0.45rem',
                    transition: 'all 0.15s'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.03)'}
                  onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#161e2e'}
                >
                  <MessageSquare size={14} />
                  <span>Send Message</span>
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
                <Crown size={28} style={{ opacity: 0.3 }} />
              </div>
              <div>
                <p style={{ fontSize: '0.85rem', fontWeight: '700', color: '#ffffff', marginBottom: '0.25rem' }}>
                  Select a customer to view profile
                </p>
                <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', maxWidth: '200px', margin: '0 auto', lineHeight: 1.3 }}>
                  Tap a customer row on the table list to see detailed metrics, check-in history, and notes.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Add Customer Modal Overlay */}
      {showAddModal && (
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
            backgroundColor: '#0d1321',
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
            {/* Modal Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 style={{ fontSize: '1.1rem', fontWeight: '800', color: '#ffffff' }}>Add New Customer</h3>
              <button 
                onClick={() => setShowAddModal(false)}
                style={{ backgroundColor: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}
              >
                <X size={18} />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleAddCustomer} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                <label style={{ fontSize: '0.65rem', fontWeight: '700', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Full Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Vikram Mehta"
                  value={newCustName}
                  onChange={(e) => setNewCustName(e.target.value)}
                  style={{
                    padding: '0.55rem 0.85rem',
                    borderRadius: '8px',
                    border: '1px solid var(--border-color)',
                    backgroundColor: '#111726',
                    color: '#ffffff',
                    fontSize: '0.8rem',
                    outline: 'none'
                  }}
                />
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                <label style={{ fontSize: '0.65rem', fontWeight: '700', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Phone Number *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. +91 99987 65432"
                  value={newCustPhone}
                  onChange={(e) => setNewCustPhone(e.target.value)}
                  style={{
                    padding: '0.55rem 0.85rem',
                    borderRadius: '8px',
                    border: '1px solid var(--border-color)',
                    backgroundColor: '#111726',
                    color: '#ffffff',
                    fontSize: '0.8rem',
                    outline: 'none'
                  }}
                />
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                <label style={{ fontSize: '0.65rem', fontWeight: '700', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Email Address</label>
                <input
                  type="email"
                  placeholder="e.g. vikram.mehta@gmail.com"
                  value={newCustEmail}
                  onChange={(e) => setNewCustEmail(e.target.value)}
                  style={{
                    padding: '0.55rem 0.85rem',
                    borderRadius: '8px',
                    border: '1px solid var(--border-color)',
                    backgroundColor: '#111726',
                    color: '#ffffff',
                    fontSize: '0.8rem',
                    outline: 'none'
                  }}
                />
              </div>

              <div style={{ display: 'flex', gap: '1rem' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem', flex: 1 }}>
                  <label style={{ fontSize: '0.65rem', fontWeight: '700', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Tier</label>
                  <select
                    value={newCustTier}
                    onChange={(e) => setNewCustTier(e.target.value)}
                    style={{
                      padding: '0.55rem 0.85rem',
                      borderRadius: '8px',
                      border: '1px solid var(--border-color)',
                      backgroundColor: '#111726',
                      color: '#ffffff',
                      fontSize: '0.8rem',
                      outline: 'none'
                    }}
                  >
                    <option value="Standard">Standard</option>
                    <option value="Silver">Silver</option>
                    <option value="Gold">Gold</option>
                    <option value="Platinum">Platinum</option>
                  </select>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '1rem' }}>
                  <input
                    type="checkbox"
                    id="newCustVIP"
                    checked={newCustIsVIP}
                    onChange={(e) => setNewCustIsVIP(e.target.checked)}
                    style={{ cursor: 'pointer', width: '15px', height: '15px', accentColor: '#fbbf24' }}
                  />
                  <label htmlFor="newCustVIP" style={{ fontSize: '0.75rem', fontWeight: '700', color: '#ffffff', cursor: 'pointer' }}>VIP Customer</label>
                </div>
              </div>

              {/* Submit */}
              <button
                type="submit"
                style={{
                  backgroundColor: '#fbbf24',
                  color: '#080c14',
                  border: 'none',
                  borderRadius: '8px',
                  padding: '0.65rem',
                  fontSize: '0.8rem',
                  fontWeight: '700',
                  cursor: 'pointer',
                  marginTop: '0.5rem',
                  boxShadow: '0 4px 15px rgba(251, 191, 36, 0.15)'
                }}
              >
                Create Profile
              </button>

            </form>
          </div>
        </div>
      )}

    </div>
  );
};

export default Customers;
