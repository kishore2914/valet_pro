import React, { useState, useEffect } from 'react';
import { 
  Search, 
  Plus, 
  Clock, 
  Car, 
  Users, 
  Phone, 
  Calendar, 
  X, 
  Loader2, 
  Utensils, 
  PartyPopper, 
  Briefcase, 
  Heart, 
  Home, 
  Bookmark,
  Trash2,
  Database
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { supabase } from '../../lib/supabase';

// Helpers to get tier styling (aligns with Customers)
const getTierStyle = (tier) => {
  const t = (tier || '').toLowerCase();
  if (t === 'platinum') {
    return {
      bg: 'rgba(251, 191, 36, 0.04)',
      color: '#fbbf24',
      border: '1px solid rgba(251, 191, 36, 0.25)'
    };
  } else if (t === 'gold') {
    return {
      bg: 'rgba(245, 158, 11, 0.04)',
      color: '#f59e0b',
      border: '1px solid rgba(245, 158, 11, 0.25)'
    };
  } else if (t === 'silver') {
    return {
      bg: 'rgba(156, 163, 175, 0.04)',
      color: '#9ca3af',
      border: '1px solid rgba(156, 163, 175, 0.25)'
    };
  }
  return {
    bg: 'rgba(100, 116, 139, 0.04)',
    color: '#64748b',
    border: '1px solid rgba(100, 116, 139, 0.25)'
  };
};

const getStatusStyle = (status) => {
  const s = (status || '').toLowerCase();
  if (s === 'arrived') {
    return {
      bg: 'rgba(16, 185, 129, 0.08)',
      color: '#10b981',
      border: '1px solid rgba(16, 185, 129, 0.2)'
    };
  } else if (s === 'completed') {
    return {
      bg: 'rgba(148, 163, 184, 0.08)',
      color: '#94a3b8',
      border: '1px solid rgba(148, 163, 184, 0.2)'
    };
  }
  // Upcoming / default
  return {
    bg: 'rgba(59, 130, 246, 0.08)',
    color: '#3b82f6',
    border: '1px solid rgba(59, 130, 246, 0.2)'
  };
};

const getPurposeIcon = (purpose) => {
  const p = (purpose || '').toLowerCase();
  if (p.includes('lunch') || p.includes('dinner') || p.includes('brunch') || p.includes('breakfast') || p.includes('food')) {
    return <Utensils size={14} style={{ color: '#64748b' }} />;
  } else if (p.includes('anniversary') || p.includes('birthday') || p.includes('celebration')) {
    return <PartyPopper size={14} style={{ color: '#64748b' }} />;
  } else if (p.includes('business') || p.includes('corporate') || p.includes('meeting') || p.includes('work')) {
    return <Briefcase size={14} style={{ color: '#64748b' }} />;
  }
  return <Bookmark size={14} style={{ color: '#64748b' }} />;
};

const initialMockBookings = [
  {
    id: 'b-1',
    customerName: 'Sanjay Gupta',
    resId: 'RES-7821',
    status: 'Upcoming',
    time: '11:30 AM',
    hotelName: 'Grand Hyatt',
    plateNumber: 'TN 01 ZZ 9999',
    carModel: 'BMW X5 - Black',
    partySize: 'Party of 4',
    purpose: 'Business Lunch',
    phone: '+91 98123 45678',
    tier: 'Gold',
    preAuth: 500,
    specialRequest: ''
  },
  {
    id: 'b-2',
    customerName: 'Lakshmi V',
    resId: 'RES-7822',
    status: 'Upcoming',
    time: '12:00 PM',
    hotelName: 'Grand Hyatt',
    plateNumber: 'KA 01 AA 1111',
    carModel: 'Audi A6 - White',
    partySize: 'Party of 2',
    purpose: 'Anniversary',
    phone: '+91 98123 11111',
    tier: 'Platinum',
    preAuth: 800,
    specialRequest: 'Champagne welcome arranged'
  },
  {
    id: 'b-3',
    customerName: 'Rahul Dev',
    resId: 'RES-7823',
    status: 'Upcoming',
    time: '12:30 PM',
    hotelName: 'Grand Hyatt',
    plateNumber: 'MH 04 BB 2222',
    carModel: 'Mercedes GLC - Silver',
    partySize: 'Party of 6',
    purpose: 'Family Lunch',
    phone: '+91 98123 22222',
    tier: 'Standard',
    preAuth: 400,
    specialRequest: ''
  },
  {
    id: 'b-4',
    customerName: 'Anita S',
    resId: 'RES-7820',
    status: 'Arrived',
    time: '10:00 AM',
    hotelName: 'Grand Hyatt',
    plateNumber: 'DL 08 CC 3333',
    carModel: 'Toyota Camry - Grey',
    partySize: 'Party of 3',
    purpose: 'Brunch',
    phone: '+91 98123 33333',
    tier: 'Silver',
    preAuth: 350,
    specialRequest: ''
  },
  {
    id: 'b-5',
    customerName: 'Mohan R',
    resId: 'RES-7815',
    status: 'Completed',
    time: '08:00 AM',
    hotelName: 'Grand Hyatt',
    plateNumber: 'TN 07 DD 4444',
    carModel: 'Hyundai Creta - Blue',
    partySize: 'Party of 2',
    purpose: 'Breakfast',
    phone: '+91 98123 44444',
    tier: 'Standard',
    preAuth: 300,
    specialRequest: ''
  },
  {
    id: 'b-6',
    customerName: 'Pooja Iyer',
    resId: 'RES-7825',
    status: 'Upcoming',
    time: '01:00 PM',
    hotelName: 'Grand Hyatt',
    plateNumber: 'KA 09 EE 5555',
    carModel: 'Volvo XC60 - White',
    partySize: 'Party of 5',
    purpose: 'Birthday',
    phone: '+91 98123 55555',
    tier: 'Gold',
    preAuth: 500,
    specialRequest: 'Cake delivery to lobby'
  },
  {
    id: 'b-7',
    customerName: 'Ashok Reddy',
    resId: 'RES-7826',
    status: 'Upcoming',
    time: '07:30 PM',
    hotelName: 'Grand Hyatt',
    plateNumber: 'AP 28 FF 6666',
    carModel: 'Jaguar XF - Black',
    partySize: 'Party of 8',
    purpose: 'Corporate Dinner',
    phone: '+91 98123 66666',
    tier: 'Platinum',
    preAuth: 900,
    specialRequest: ''
  },
  {
    id: 'b-8',
    customerName: 'Kavitha M',
    resId: 'RES-7818',
    status: 'Completed',
    time: '09:00 AM',
    hotelName: 'Grand Hyatt',
    plateNumber: 'TN 14 GG 7777',
    carModel: 'Honda Civic - Red',
    partySize: 'Party of 1',
    purpose: 'Meeting',
    phone: '+91 98123 77777',
    tier: 'Standard',
    preAuth: 250,
    specialRequest: ''
  }
];

const Bookings = () => {
  const { locationId } = useAuth();
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [dbBookings, setDbBookings] = useState([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // New Booking Form State
  const [newBooking, setNewBooking] = useState({
    customerName: '',
    resId: '',
    status: 'Upcoming',
    time: '12:00 PM',
    hotelName: 'Grand Hyatt',
    plateNumber: '',
    carModel: '',
    partySize: 'Party of 2',
    purpose: 'Lunch',
    phone: '',
    tier: 'Standard',
    preAuth: 300,
    specialRequest: ''
  });

  const fetchBookings = async () => {
    if (!locationId) {
      setLoading(false);
      return;
    }
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('bookings')
        .select('*')
        .eq('location_id', locationId)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching bookings:', error);
      } else if (data) {
        // Map database records directly
        const mapped = data.map(b => {
          const name = b.customer_name || 'Guest';
          return {
            id: b.id,
            customerName: name,
            resId: b.res_id || `RES-${b.id.slice(0, 4).toUpperCase()}`,
            status: b.status || 'Upcoming',
            time: b.time || new Date(b.created_at || Date.now()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            hotelName: b.hotel_name || 'Grand Hyatt',
            plateNumber: b.plate_number || 'TN 01 AB 1234',
            carModel: b.car_model || 'Premium Sedan',
            partySize: b.party_size || 'Party of 2',
            purpose: b.purpose || 'Dining',
            phone: b.phone || '+91 99999 88888',
            tier: b.tier || 'Standard',
            preAuth: b.pre_auth !== undefined && b.pre_auth !== null ? b.pre_auth : 300,
            specialRequest: b.special_request || ''
          };
        });
        setDbBookings(mapped);
      }
    } catch (e) {
      console.error('Error in fetchBookings:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, [locationId]);

  const handleSeedBookings = async () => {
    setLoading(true);
    try {
      // Clean up first to avoid duplicates
      await supabase.from('bookings').delete().eq('location_id', locationId);

      // Save all high-fidelity columns to the database
      const payload = initialMockBookings.map(b => ({
        location_id: locationId,
        customer_name: b.customerName,
        res_id: b.resId,
        status: b.status,
        time: b.time,
        hotel_name: b.hotelName,
        plate_number: b.plateNumber,
        car_model: b.carModel,
        party_size: b.partySize,
        purpose: b.purpose,
        phone: b.phone,
        tier: b.tier,
        pre_auth: b.preAuth,
        special_request: b.specialRequest
      }));

      const { error } = await supabase.from('bookings').insert(payload);
      if (error) throw error;
      
      fetchBookings();
    } catch (err) {
      console.error('Error seeding bookings:', err);
      alert('Failed to seed bookings. Make sure the bookings table has all columns added in Supabase.');
      setLoading(false);
    }
  };

  const handleClearBookings = async () => {
    setLoading(true);
    try {
      await supabase.from('bookings').delete().eq('location_id', locationId);
      setDbBookings([]);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleAddBookingSubmit = async (e) => {
    e.preventDefault();
    if (!newBooking.customerName.trim() || !locationId) return;

    try {
      setIsSubmitting(true);
      
      // Save all the specified fields to ensure they persist in Supabase
      const payload = {
        location_id: locationId,
        customer_name: newBooking.customerName,
        res_id: newBooking.resId || `RES-${Math.random().toString(36).substr(2, 4).toUpperCase()}`,
        status: newBooking.status,
        time: newBooking.time,
        hotel_name: newBooking.hotelName || 'Grand Hyatt',
        plate_number: newBooking.plateNumber || 'TN 01 AB 1234',
        car_model: newBooking.carModel || 'Premium Sedan',
        party_size: newBooking.partySize || 'Party of 2',
        purpose: newBooking.purpose || 'Dining',
        phone: newBooking.phone || '+91 99999 88888',
        tier: newBooking.tier || 'Standard',
        pre_auth: newBooking.preAuth || 300,
        special_request: newBooking.specialRequest || ''
      };

      const { error } = await supabase.from('bookings').insert([payload]);
      if (error) throw error;

      setShowAddModal(false);
      setNewBooking({
        customerName: '',
        resId: '',
        status: 'Upcoming',
        time: '12:00 PM',
        hotelName: 'Grand Hyatt',
        plateNumber: '',
        carModel: '',
        partySize: 'Party of 2',
        purpose: 'Lunch',
        phone: '',
        tier: 'Standard',
        preAuth: 300,
        specialRequest: ''
      });
      fetchBookings();
    } catch (err) {
      console.error(err);
      alert('Failed to add booking. Make sure all the bookings columns are added in Supabase.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const allBookings = dbBookings;

  const filteredBookings = allBookings.filter(b => 
    b.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    b.plateNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
    b.resId.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Compute metrics dynamically from visible bookings
  const upcomingCount = filteredBookings.filter(b => b.status === 'Upcoming').length;
  const arrivedCount = filteredBookings.filter(b => b.status === 'Arrived').length;
  const totalPreAuth = filteredBookings.reduce((sum, b) => sum + (Number(b.preAuth) || 0), 0);

  const formatCurrency = (val) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(val);
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh', color: 'var(--text-main)' }}>
        <Loader2 className="animate-spin" size={32} />
        <span style={{ marginLeft: '0.75rem', fontWeight: '600' }}>Loading Bookings...</span>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', width: '100%' }}>
      
      {/* Title Header Row */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.85rem', fontWeight: '800', color: 'var(--text-main)', marginBottom: '0.25rem' }}>Bookings</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', fontWeight: '500' }}>
            {upcomingCount} upcoming · {arrivedCount} arrived · {formatCurrency(totalPreAuth)} pre-authorized
          </p>
        </div>

        {/* Administrative Seeding & Add Booking button */}
        <div style={{ display: 'flex', gap: '0.50rem', alignItems: 'center', flexWrap: 'wrap' }}>
          <button
            onClick={handleSeedBookings}
            style={{
              backgroundColor: 'transparent',
              color: 'var(--text-muted)',
              border: '1px dashed var(--border-color)',
              borderRadius: '8px',
              padding: '0.45rem 0.85rem',
              fontSize: '0.75rem',
              fontWeight: '600',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.35rem',
              transition: 'all 0.15s ease'
            }}
            onMouseEnter={(e) => { e.currentTarget.style.color = '#fbbf24'; e.currentTarget.style.borderColor = '#fbbf24'; }}
            onMouseLeave={(e) => { e.currentTarget.style.color = 'var(--text-muted)'; e.currentTarget.style.borderColor = 'var(--border-color)'; }}
          >
            <Database size={13} />
            <span>Seed Demo</span>
          </button>

          {dbBookings.length > 0 && (
            <button
              onClick={handleClearBookings}
              style={{
                backgroundColor: 'transparent',
                color: 'rgba(239, 68, 68, 0.7)',
                border: '1px solid rgba(239, 68, 68, 0.2)',
                borderRadius: '8px',
                padding: '0.45rem 0.85rem',
                fontSize: '0.75rem',
                fontWeight: '600',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '0.35rem',
                transition: 'all 0.15s ease'
              }}
              onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = 'rgba(239, 68, 68, 0.05)'; e.currentTarget.style.color = '#ef4444'; }}
              onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'transparent'; e.currentTarget.style.color = 'rgba(239, 68, 68, 0.7)'; }}
            >
              <Trash2 size={13} />
              <span>Clear</span>
            </button>
          )}

          <button
            onClick={() => setShowAddModal(true)}
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
            onMouseEnter={(e) => e.currentTarget.style.filter = 'brightness(1.1)'}
            onMouseLeave={(e) => e.currentTarget.style.filter = 'none'}
          >
            <Plus size={16} />
            <span>New Booking</span>
          </button>
        </div>
      </div>

      {/* Search Filter Header */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        backgroundColor: 'var(--bg-card)',
        border: '1px solid var(--border-color)',
        borderRadius: '12px',
        padding: '0.65rem 1rem',
        gap: '0.75rem',
        width: '100%',
        maxWidth: '450px'
      }}>
        <Search size={18} style={{ color: 'var(--text-muted)' }} />
        <input 
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search by guest name, plate or reservation ID..."
          style={{
            background: 'none',
            border: 'none',
            outline: 'none',
            color: 'var(--text-main)',
            fontSize: '0.85rem',
            width: '100%'
          }}
        />
        {searchQuery && (
          <X 
            size={16} 
            style={{ color: 'var(--text-muted)', cursor: 'pointer' }} 
            onClick={() => setSearchQuery('')}
          />
        )}
      </div>

      {/* Grid List */}
      {filteredBookings.length === 0 ? (
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
          <Calendar size={48} style={{ opacity: 0.3, color: '#fbbf24' }} />
          <div>
            <h3 style={{ fontSize: '1.1rem', fontWeight: '700', color: 'var(--text-main)', marginBottom: '0.25rem' }}>No Bookings Found</h3>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', maxWidth: '300px', margin: '0 auto', lineHeight: '1.4' }}>
              Create a new booking reservation or seed demo bookings to get started.
            </p>
          </div>
        </div>
      ) : (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
          gap: '1.25rem'
        }}>
          {filteredBookings.map((b) => {
            const tierStyle = getTierStyle(b.tier);
            const statusStyle = getStatusStyle(b.status);
            const purposeIcon = getPurposeIcon(b.purpose);

            return (
              <div 
                key={b.id}
                style={{
                  backgroundColor: 'var(--bg-card)',
                  border: '1px solid var(--border-color)',
                  borderRadius: '12px',
                  padding: '1.25rem',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.85rem',
                  position: 'relative',
                  transition: 'transform 0.15s ease, border-color 0.15s ease'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-2px)';
                  e.currentTarget.style.borderColor = 'rgba(251, 191, 36, 0.2)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'none';
                  e.currentTarget.style.borderColor = 'var(--border-color)';
                }}
              >
                {/* Card Header */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div>
                    <h3 style={{ fontSize: '1rem', fontWeight: '700', color: 'var(--text-main)', lineHeight: '1.2' }}>{b.customerName}</h3>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{b.resId}</span>
                  </div>
                  <span style={{
                    padding: '0.2rem 0.6rem',
                    borderRadius: '6px',
                    fontSize: '0.65rem',
                    fontWeight: '700',
                    letterSpacing: '0.04em',
                    textTransform: 'uppercase',
                    backgroundColor: statusStyle.bg,
                    color: statusStyle.color,
                    border: statusStyle.border
                  }}>
                    {b.status}
                  </span>
                </div>

                {/* Card Details */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                  
                  {/* Time & Hotel */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                    <Clock size={14} style={{ color: '#64748b' }} />
                    <span>
                      <strong style={{ color: '#fbbf24', fontWeight: '600' }}>{b.time}</strong> · {b.hotelName}
                    </span>
                  </div>

                  {/* License Plate & Car Model */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                    <Car size={14} style={{ color: '#64748b' }} />
                    <span>
                      <strong style={{ color: 'var(--text-main)', fontWeight: '600' }}>{b.plateNumber}</strong> · {b.carModel}
                    </span>
                  </div>

                  {/* Party Size */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                    <Users size={14} style={{ color: '#64748b' }} />
                    <span>{b.partySize}</span>
                  </div>

                  {/* Purpose */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                    {purposeIcon}
                    <span>{b.purpose}</span>
                  </div>

                  {/* Phone */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                    <Phone size={14} style={{ color: '#64748b' }} />
                    <span>{b.phone}</span>
                  </div>

                </div>

                {/* Divider */}
                <div style={{ borderTop: '1px solid var(--border-color)', margin: '0.25rem 0' }}></div>

                {/* Card Footer */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{
                    padding: '0.15rem 0.55rem',
                    borderRadius: '4px',
                    fontSize: '0.65rem',
                    fontWeight: '700',
                    textTransform: 'capitalize',
                    backgroundColor: tierStyle.bg,
                    color: tierStyle.color,
                    border: tierStyle.border
                  }}>
                    {b.tier}
                  </span>

                  <span style={{ fontSize: '0.8rem', fontWeight: '600', color: 'var(--text-muted)' }}>
                    <strong style={{ color: 'var(--text-main)' }}>{formatCurrency(b.preAuth)}</strong> pre-auth
                  </span>
                </div>

                {/* Special Request Quote Box */}
                {b.specialRequest && (
                  <div style={{ 
                    marginTop: '0.25rem', 
                    fontSize: '0.75rem', 
                    fontStyle: 'italic', 
                    color: '#fbbf24', 
                    textAlign: 'left',
                    lineHeight: '1.4'
                  }}>
                    "{b.specialRequest}"
                  </div>
                )}

              </div>
            );
          })}
        </div>
      )}

      {/* Add Booking Modal Overlay */}
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
            backgroundColor: 'var(--bg-surface)',
            border: '1.5px solid var(--border-color)',
            borderRadius: '16px',
            padding: '1.5rem',
            width: '450px',
            maxWidth: '90%',
            display: 'flex',
            flexDirection: 'column',
            gap: '1.25rem',
            boxShadow: '0 20px 40px rgba(0,0,0,0.5)',
            maxHeight: '90vh',
            overflowY: 'auto'
          }}>
            {/* Modal Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 style={{ fontSize: '1.1rem', fontWeight: '800', color: 'var(--text-main)' }}>Add New Booking</h3>
              <button 
                onClick={() => setShowAddModal(false)}
                style={{ backgroundColor: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}
              >
                <X size={18} />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleAddBookingSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              
              {/* Customer Name */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                <label style={{ fontSize: '0.65rem', fontWeight: '700', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Guest Name *</label>
                <input
                  type="text"
                  required
                  value={newBooking.customerName}
                  onChange={(e) => setNewBooking(prev => ({ ...prev, customerName: e.target.value }))}
                  placeholder="e.g. Sanjay Gupta"
                  style={{
                    padding: '0.55rem 0.85rem',
                    borderRadius: '8px',
                    border: '1px solid var(--border-color)',
                    backgroundColor: 'var(--bg-subtle)',
                    color: 'var(--text-main)',
                    fontSize: '0.8rem',
                    outline: 'none',
                    width: '100%'
                  }}
                />
              </div>

              {/* Reservation ID & Status */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                  <label style={{ fontSize: '0.65rem', fontWeight: '700', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Reservation ID</label>
                  <input
                    type="text"
                    value={newBooking.resId}
                    onChange={(e) => setNewBooking(prev => ({ ...prev, resId: e.target.value }))}
                    placeholder="e.g. RES-7821"
                    style={{
                      padding: '0.55rem 0.85rem',
                      borderRadius: '8px',
                      border: '1px solid var(--border-color)',
                      backgroundColor: '#111726',
                      color: '#ffffff',
                      fontSize: '0.8rem',
                      outline: 'none',
                      width: '100%'
                    }}
                  />
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                  <label style={{ fontSize: '0.65rem', fontWeight: '700', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Status</label>
                  <select
                    value={newBooking.status}
                    onChange={(e) => setNewBooking(prev => ({ ...prev, status: e.target.value }))}
                    style={{
                      padding: '0.55rem 0.85rem',
                      borderRadius: '8px',
                      border: '1px solid var(--border-color)',
                      backgroundColor: '#111726',
                      color: '#ffffff',
                      fontSize: '0.8rem',
                      outline: 'none',
                      width: '100%'
                    }}
                  >
                    <option value="Upcoming">Upcoming</option>
                    <option value="Arrived">Arrived</option>
                    <option value="Completed">Completed</option>
                  </select>
                </div>
              </div>

              {/* Time & Hotel */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                  <label style={{ fontSize: '0.65rem', fontWeight: '700', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Arrival Time</label>
                  <input
                    type="text"
                    value={newBooking.time}
                    onChange={(e) => setNewBooking(prev => ({ ...prev, time: e.target.value }))}
                    placeholder="e.g. 11:30 AM"
                    style={{
                      padding: '0.55rem 0.85rem',
                      borderRadius: '8px',
                      border: '1px solid var(--border-color)',
                      backgroundColor: '#111726',
                      color: '#ffffff',
                      fontSize: '0.8rem',
                      outline: 'none',
                      width: '100%'
                    }}
                  />
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                  <label style={{ fontSize: '0.65rem', fontWeight: '700', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Hotel Name</label>
                  <input
                    type="text"
                    value={newBooking.hotelName}
                    onChange={(e) => setNewBooking(prev => ({ ...prev, hotelName: e.target.value }))}
                    placeholder="e.g. Grand Hyatt"
                    style={{
                      padding: '0.55rem 0.85rem',
                      borderRadius: '8px',
                      border: '1px solid var(--border-color)',
                      backgroundColor: '#111726',
                      color: '#ffffff',
                      fontSize: '0.8rem',
                      outline: 'none',
                      width: '100%'
                    }}
                  />
                </div>
              </div>

              {/* Plate Number & Vehicle Model */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                  <label style={{ fontSize: '0.65rem', fontWeight: '700', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Plate Number</label>
                  <input
                    type="text"
                    value={newBooking.plateNumber}
                    onChange={(e) => setNewBooking(prev => ({ ...prev, plateNumber: e.target.value }))}
                    placeholder="e.g. TN 01 ZZ 9999"
                    style={{
                      padding: '0.55rem 0.85rem',
                      borderRadius: '8px',
                      border: '1px solid var(--border-color)',
                      backgroundColor: '#111726',
                      color: '#ffffff',
                      fontSize: '0.8rem',
                      outline: 'none',
                      width: '100%'
                    }}
                  />
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                  <label style={{ fontSize: '0.65rem', fontWeight: '700', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Car Model</label>
                  <input
                    type="text"
                    value={newBooking.carModel}
                    onChange={(e) => setNewBooking(prev => ({ ...prev, carModel: e.target.value }))}
                    placeholder="e.g. BMW X5 - Black"
                    style={{
                      padding: '0.55rem 0.85rem',
                      borderRadius: '8px',
                      border: '1px solid var(--border-color)',
                      backgroundColor: '#111726',
                      color: '#ffffff',
                      fontSize: '0.8rem',
                      outline: 'none',
                      width: '100%'
                    }}
                  />
                </div>
              </div>

              {/* Party Size & Purpose */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                  <label style={{ fontSize: '0.65rem', fontWeight: '700', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Party Size</label>
                  <input
                    type="text"
                    value={newBooking.partySize}
                    onChange={(e) => setNewBooking(prev => ({ ...prev, partySize: e.target.value }))}
                    placeholder="e.g. Party of 4"
                    style={{
                      padding: '0.55rem 0.85rem',
                      borderRadius: '8px',
                      border: '1px solid var(--border-color)',
                      backgroundColor: '#111726',
                      color: '#ffffff',
                      fontSize: '0.8rem',
                      outline: 'none',
                      width: '100%'
                    }}
                  />
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                  <label style={{ fontSize: '0.65rem', fontWeight: '700', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Purpose</label>
                  <input
                    type="text"
                    value={newBooking.purpose}
                    onChange={(e) => setNewBooking(prev => ({ ...prev, purpose: e.target.value }))}
                    placeholder="e.g. Business Lunch"
                    style={{
                      padding: '0.55rem 0.85rem',
                      borderRadius: '8px',
                      border: '1px solid var(--border-color)',
                      backgroundColor: '#111726',
                      color: '#ffffff',
                      fontSize: '0.8rem',
                      outline: 'none',
                      width: '100%'
                    }}
                  />
                </div>
              </div>

              {/* Phone & Pre-Auth Amount */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                  <label style={{ fontSize: '0.65rem', fontWeight: '700', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Guest Phone</label>
                  <input
                    type="text"
                    value={newBooking.phone}
                    onChange={(e) => setNewBooking(prev => ({ ...prev, phone: e.target.value }))}
                    placeholder="e.g. +91 98123 45678"
                    style={{
                      padding: '0.55rem 0.85rem',
                      borderRadius: '8px',
                      border: '1px solid var(--border-color)',
                      backgroundColor: '#111726',
                      color: '#ffffff',
                      fontSize: '0.8rem',
                      outline: 'none',
                      width: '100%'
                    }}
                  />
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                  <label style={{ fontSize: '0.65rem', fontWeight: '700', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Pre-Auth Amount (₹)</label>
                  <input
                    type="number"
                    value={newBooking.preAuth}
                    onChange={(e) => setNewBooking(prev => ({ ...prev, preAuth: Number(e.target.value) }))}
                    placeholder="e.g. 500"
                    style={{
                      padding: '0.55rem 0.85rem',
                      borderRadius: '8px',
                      border: '1px solid var(--border-color)',
                      backgroundColor: '#111726',
                      color: '#ffffff',
                      fontSize: '0.8rem',
                      outline: 'none',
                      width: '100%'
                    }}
                  />
                </div>
              </div>

              {/* Tier & Special Request */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                  <label style={{ fontSize: '0.65rem', fontWeight: '700', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Tier Classification</label>
                  <select
                    value={newBooking.tier}
                    onChange={(e) => setNewBooking(prev => ({ ...prev, tier: e.target.value }))}
                    style={{
                      padding: '0.55rem 0.85rem',
                      borderRadius: '8px',
                      border: '1px solid var(--border-color)',
                      backgroundColor: '#111726',
                      color: '#ffffff',
                      fontSize: '0.8rem',
                      outline: 'none',
                      width: '100%'
                    }}
                  >
                    <option value="Standard">Standard</option>
                    <option value="Silver">Silver</option>
                    <option value="Gold">Gold</option>
                    <option value="Platinum">Platinum</option>
                  </select>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                  <label style={{ fontSize: '0.65rem', fontWeight: '700', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Special Request Notes</label>
                  <input
                    type="text"
                    value={newBooking.specialRequest}
                    onChange={(e) => setNewBooking(prev => ({ ...prev, specialRequest: e.target.value }))}
                    placeholder="e.g. Champagne welcome"
                    style={{
                      padding: '0.55rem 0.85rem',
                      borderRadius: '8px',
                      border: '1px solid var(--border-color)',
                      backgroundColor: '#111726',
                      color: '#ffffff',
                      fontSize: '0.8rem',
                      outline: 'none',
                      width: '100%'
                    }}
                  />
                </div>
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
                  boxShadow: '0 4px 15px var(--accent-shadow)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.5rem'
                }}
              >
                {isSubmitting && <Loader2 size={14} className="animate-spin" />}
                <span>Create Booking</span>
              </button>

            </form>
          </div>
        </div>
      )}

    </div>
  );
};

export default Bookings;
