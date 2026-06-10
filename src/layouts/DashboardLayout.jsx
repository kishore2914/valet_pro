import React, { useState } from 'react';
import { Outlet, Link, useLocation, useNavigate, useOutlet } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Car, 
  Map, 
  Crown, 
  Users, 
  Calendar, 
  ClipboardCheck, 
  MessageSquare, 
  TrendingUp, 
  AlertTriangle, 
  BarChart3, 
  Settings, 
  LogOut,
  ChevronDown,
  MapPin,
  Moon,
  Sun,
  Bell,
  Activity
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import { locationService } from '../services/locationService';

const DashboardLayout = ({ role }) => {
  const { theme, toggleTheme } = useTheme();
  const { user, profile, signOut, locationId, setLocationId, locations } = useAuth();
  const [currentLocation, setCurrentLocation] = useState(null);
  const [toastMessage, setToastMessage] = useState(null);
  const location = useLocation();
  const navigate = useNavigate();
  const currentOutlet = useOutlet();

  React.useEffect(() => {
    if (locationId && role.startsWith('valet')) {
      locationService.getLocationById(locationId).then(({ data }) => {
        if (data) setCurrentLocation(data);
      });
    }
  }, [locationId, role]);

  const handleLogout = async () => {
    await signOut();
    navigate('/login');
  };

  const showToast = (message) => {
    setToastMessage(message);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // Nav menu matching the exact structure from the screenshot
  const menuItems = [
    { name: 'Dashboard', path: '/valet', icon: LayoutDashboard, implemented: true },
    { name: 'Live Vehicles', path: '/valet/pipeline', icon: Car, implemented: true },
    { name: 'Floor Map', path: '/valet/floor-map', icon: Map, implemented: true },
    { name: 'Customers', path: '/valet/customers', icon: Crown, implemented: true },
    { name: 'Staff', path: '/valet/staff', icon: Users, implemented: true },
    { name: 'Schedule & Payroll', path: '/valet/schedule', icon: Calendar, implemented: true },
    { name: 'Bookings', path: '/valet/bookings', icon: ClipboardCheck, implemented: true },
    { name: 'Messaging', path: '/valet/messaging', icon: MessageSquare, implemented: true },
    { name: 'Forecast', path: '/valet/forecast', icon: TrendingUp, implemented: true },
    { name: 'Incidents', path: '/valet/incidents', icon: AlertTriangle, implemented: true },
    { name: 'Reports', path: '/valet/reports', icon: BarChart3, implemented: true },
    { name: 'Settings', path: '/valet/settings', icon: Settings, implemented: true },
  ];

  const selectedLocation = (locations || []).find(loc => loc && loc.id === locationId) || currentLocation;

  // Profile data
  const userEmail = profile?.email || user?.email || '';
  const displayName = profile?.full_name || user?.user_metadata?.full_name || 'Valet User';
  const initials = displayName
    ? displayName.split(' ').filter(Boolean).map(n => n ? n[0] : '').join('').toUpperCase().slice(0, 2)
    : 'VU';
  const mobileNumber = profile?.mobile_number || user?.phone || '';

  const [showProfileDetails, setShowProfileDetails] = useState(false);

  const isAdmin = role === 'admin';

  if (isAdmin) {
    return (
      <div style={{ 
        display: 'flex', 
        flexDirection: 'column',
        height: '100vh', 
        width: '100vw', 
        overflow: 'hidden', 
        backgroundColor: 'var(--bg-app)' 
      }}>
        {/* Top Navbar for Admin */}
        <header style={{
          height: '70px',
          borderBottom: '1px solid var(--border-color)',
          backgroundColor: 'var(--bg-surface)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '0 2rem',
          flexShrink: 0,
          zIndex: 30
        }}>
          {/* Brand */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{
              width: '36px',
              height: '36px',
              borderRadius: '8px',
              backgroundColor: 'rgba(251, 191, 36, 0.1)',
              border: '1.5px solid #fbbf24',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#fbbf24'
            }}>
              <svg width="18" height="20" viewBox="0 0 20 22" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M10 1L1 5V11C1 16.52 4.84 20.62 10 21C15.16 20.62 19 16.52 19 11V5L10 1Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="rgba(251, 191, 36, 0.1)"/>
              </svg>
            </div>
            <span style={{ fontSize: '1rem', fontWeight: '850', color: '#fbbf24', letterSpacing: '0.05em' }}>VALET PRO</span>
            <span style={{
              fontSize: '0.65rem',
              fontWeight: '800',
              color: '#ffffff',
              backgroundColor: '#ef4444',
              padding: '0.15rem 0.5rem',
              borderRadius: '100px',
              letterSpacing: '0.04em',
              textTransform: 'uppercase',
              marginLeft: '0.25rem'
            }}>
              Super Admin
            </span>
          </div>

          {/* Right Header items */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
            <button style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.45rem',
              backgroundColor: theme === 'dark' ? 'rgba(255, 255, 255, 0.03)' : 'rgba(0, 0, 0, 0.03)',
              border: '1px solid var(--border-color)',
              borderRadius: '8px',
              padding: '0.45rem 0.85rem',
              color: 'var(--text-main)',
              fontSize: '0.75rem',
              fontWeight: '700',
              cursor: 'pointer'
            }}>
              <Activity size={14} />
              <span>System Flow</span>
            </button>

            {/* Notification Bell */}
            <div style={{ position: 'relative', cursor: 'pointer', color: 'var(--text-muted)' }}>
              <Bell size={18} />
              <div style={{
                position: 'absolute',
                top: '-2px',
                right: '-2px',
                width: '6px',
                height: '6px',
                borderRadius: '50%',
                backgroundColor: '#ef4444'
              }} />
            </div>

            {/* Settings Icon */}
            <div style={{ cursor: 'pointer', color: 'var(--text-muted)' }} onClick={() => navigate('/admin/settings')}>
              <Settings size={18} />
            </div>

            {/* User Profile Info */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', borderLeft: '1px solid var(--border-color)', paddingLeft: '1.25rem' }}>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
                <span style={{ fontSize: '0.8rem', fontWeight: '800', color: 'var(--text-main)' }}>{displayName}</span>
                <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)', fontWeight: '500' }}>
                  {profile?.role === 'admin' ? 'Platform Owner' : (profile?.role || 'Platform Owner')}
                </span>
              </div>
              <div style={{ 
                width: '32px', 
                height: '32px', 
                borderRadius: '50%', 
                backgroundColor: '#fbbf24', 
                color: '#080c14', 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center', 
                fontWeight: 'bold',
                fontSize: '0.8rem'
              }}>
                {initials}
              </div>
            </div>

            {/* Sign Out */}
            <button 
              onClick={handleLogout}
              style={{
                backgroundColor: 'transparent',
                border: 'none',
                color: '#ef4444',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                padding: '0.25rem'
              }}
            >
              <LogOut size={18} />
            </button>
          </div>
        </header>

        {/* Content */}
        <main style={{ flex: 1, overflowY: 'auto', padding: '2rem' }}>
          <AnimatePresence mode="wait">
            <motion.div
              key={location.pathname}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >
              {currentOutlet}
            </motion.div>
          </AnimatePresence>
        </main>

        {/* Coming Soon Toast Notification */}
        <AnimatePresence>
          {toastMessage && (
            <motion.div
              initial={{ opacity: 0, y: 50, x: '-50%' }}
              animate={{ opacity: 1, y: 0, x: '-50%' }}
              exit={{ opacity: 0, y: 20, x: '-50%' }}
              style={{
                position: 'fixed',
                bottom: '2rem',
                left: '50%',
                backgroundColor: '#111726',
                border: '1px solid #fbbf24',
                color: '#ffffff',
                padding: '0.75rem 1.5rem',
                borderRadius: '12px',
                zIndex: 9999,
                boxShadow: '0 10px 25px -5px rgba(0,0,0,0.5)',
                fontSize: '0.85rem',
                fontWeight: '600',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem'
              }}
            >
              <span style={{ color: '#fbbf24' }}>★</span> {toastMessage}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  }

  return (
    <div style={{ 
      display: 'flex', 
      height: '100vh', 
      width: '100vw', 
      overflow: 'hidden', 
      backgroundColor: 'var(--bg-app)' 
    }}>
      {/* Sidebar - Fixed 280px Width */}
      <aside
        style={{
          width: '280px',
          height: '100%',
          zIndex: 20,
          borderRight: '1px solid var(--border-color)',
          display: 'flex',
          flexDirection: 'column',
          backgroundColor: 'var(--bg-surface)',
          padding: '1.5rem 1rem 1rem 1rem',
          flexShrink: 0
        }}
      >
        {/* Branding header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div style={{
              width: '40px',
              height: '40px',
              borderRadius: '10px',
              backgroundColor: 'rgba(251, 191, 36, 0.1)',
              border: '1.5px solid #fbbf24',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#fbbf24',
              flexShrink: 0
            }}>
              <svg width="20" height="22" viewBox="0 0 20 22" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M10 1L1 5V11C1 16.52 4.84 20.62 10 21C15.16 20.62 19 16.52 19 11V5L10 1Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="rgba(251, 191, 36, 0.1)"/>
              </svg>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <span style={{ fontSize: '1.05rem', fontWeight: '800', color: '#fbbf24', letterSpacing: '0.05em', lineHeight: 1.1 }}>VALET PRO</span>
              <span style={{ fontSize: '0.7rem', color: '#64748b', fontWeight: '500' }}>Parking Management</span>
            </div>
          </div>
          <button 
            onClick={toggleTheme}
            style={{ 
              color: 'var(--text-muted)', 
              padding: '0.25rem', 
              borderRadius: '8px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: theme === 'dark' ? 'rgba(255, 255, 255, 0.03)' : 'rgba(0, 0, 0, 0.03)'
            }}
          >
            {theme === 'light' ? <Moon size={18} /> : <Sun size={18} />}
          </button>
        </div>

        {/* Active Branch Select Box Container */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem', marginBottom: '1.5rem' }}>
          <span style={{ fontSize: '0.7rem', color: '#64748b', fontWeight: '700', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
            Active Branch
          </span>
          <div style={{
            position: 'relative',
            display: 'flex',
            alignItems: 'center',
            padding: '0.65rem 0.85rem',
            backgroundColor: theme === 'dark' ? '#111726' : '#f0f7ff',
            borderRadius: '12px',
            border: theme === 'dark' ? '1px solid #1c2438' : '1px solid rgba(37, 99, 235, 0.15)',
            gap: '0.75rem',
            cursor: 'pointer'
          }}>
            <div style={{
              width: '32px',
              height: '32px',
              borderRadius: '8px',
              backgroundColor: theme === 'dark' ? 'rgba(251, 191, 36, 0.1)' : 'rgba(37, 99, 235, 0.1)',
              color: theme === 'dark' ? '#fbbf24' : '#2563eb',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0
            }}>
              <MapPin size={16} />
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: '0.8rem', fontWeight: '700', color: theme === 'dark' ? '#ffffff' : '#1e3a8a', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', lineHeight: 1.2 }}>
                {selectedLocation ? (selectedLocation.name || selectedLocation.hotelName) : 'ITC Grand Chola'}
              </div>
              <div style={{ fontSize: '0.65rem', color: theme === 'dark' ? '#64748b' : '#3b82f6', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', lineHeight: 1.2 }}>
                {selectedLocation?.city_name ? `${selectedLocation.city_name} - ${selectedLocation.company_name || 'ITC Hotels'}` : 'Chennai - ITC Hotels'}
              </div>
            </div>
            <ChevronDown size={14} style={{ color: theme === 'dark' ? '#64748b' : '#3b82f6', flexShrink: 0 }} />
            
            {locations && locations.length > 0 && (
              <select
                value={locationId || ''}
                onChange={(e) => setLocationId(e.target.value)}
                style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  width: '100%',
                  height: '100%',
                  opacity: 0,
                  cursor: 'pointer'
                }}
              >
                {(locations || []).map(loc => {
                  if (!loc) return null;
                  return (
                    <option key={loc.id} value={loc.id} style={{ color: theme === 'dark' ? '#ffffff' : 'var(--text-main)', backgroundColor: theme === 'dark' ? '#0d1321' : '#ffffff' }}>
                      {loc.name || loc.hotelName} {loc.city_name ? `- ${loc.city_name}` : ''}
                    </option>
                  );
                })}
              </select>
            )}
          </div>
        </div>

        {/* Navigation items scrollable area */}
        <nav style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '0.35rem', overflowY: 'auto', paddingRight: '4px' }}>
          {menuItems.map((item) => {
            const isActive = location.pathname === item.path;
            const Icon = item.icon;
            
            const content = (
              <div 
                style={{ 
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.85rem',
                  padding: '0.65rem 0.85rem',
                  color: isActive ? (theme === 'dark' ? '#fbbf24' : '#2563eb') : 'var(--text-muted)',
                  cursor: 'pointer',
                  borderRadius: '10px',
                  backgroundColor: isActive ? (theme === 'dark' ? '#161e2e' : 'rgba(37, 99, 235, 0.08)') : 'transparent',
                  border: isActive ? (theme === 'dark' ? '1px solid rgba(251, 191, 36, 0.15)' : '1px solid rgba(37, 99, 235, 0.15)') : '1px solid transparent',
                  transition: 'all 0.2s ease',
                  width: '100%'
                }}
                onClick={() => {
                  if (!item.implemented) {
                    showToast(`${item.name} module is coming soon!`);
                  }
                }}
              >
                <Icon size={18} style={{ color: isActive ? (theme === 'dark' ? '#fbbf24' : '#2563eb') : 'inherit' }} />
                <span style={{ fontWeight: isActive ? '600' : '500', fontSize: '0.85rem' }}>
                  {item.name}
                </span>
              </div>
            );

            if (item.implemented) {
              return (
                <Link key={item.name} to={item.path} style={{ textDecoration: 'none' }}>
                  {content}
                </Link>
              );
            } else {
              return (
                <div key={item.name}>
                  {content}
                </div>
              );
            }
          })}
        </nav>

        {/* User profile & Logout at the bottom */}
        <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '1rem', marginTop: '0.5rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          <div 
            onMouseEnter={() => setShowProfileDetails(true)}
            onMouseLeave={() => setShowProfileDetails(false)}
            style={{ position: 'relative' }}
          >
            {showProfileDetails && (
              <div style={{
                position: 'absolute',
                bottom: 'calc(100% + 8px)',
                left: '0',
                right: '0',
                backgroundColor: theme === 'dark' ? '#111726' : '#ffffff',
                border: theme === 'dark' ? '1px solid #1c2438' : '1px solid #bfdbfe',
                borderRadius: '12px',
                padding: '1rem',
                boxShadow: theme === 'dark' ? '0 10px 25px -5px rgba(0,0,0,0.5)' : '0 10px 25px -5px rgba(37, 99, 235, 0.1)',
                zIndex: 100,
                display: 'flex',
                flexDirection: 'column',
                gap: '0.5rem'
              }}>
                <div style={{ fontWeight: '700', fontSize: '0.85rem', color: theme === 'dark' ? '#ffffff' : '#1e3a8a' }}>Profile Details</div>
                <div style={{ height: '1px', backgroundColor: theme === 'dark' ? 'var(--border-color)' : '#bfdbfe', margin: '0.25rem 0' }} />
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.15rem' }}>
                  <div style={{ fontSize: '0.7rem', color: '#64748b', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Name</div>
                  <div style={{ fontSize: '0.8rem', color: theme === 'dark' ? '#ffffff' : 'var(--text-main)', fontWeight: '500' }}>{displayName}</div>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.15rem' }}>
                  <div style={{ fontSize: '0.7rem', color: '#64748b', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Role</div>
                  <div style={{ fontSize: '0.8rem', color: theme === 'dark' ? '#ffffff' : 'var(--text-main)', fontWeight: '500' }}>
                    {role === 'valet' ? 'Valet In-Charge' : role === 'valet_staff' ? 'Valet Staff' : 'Global Admin'}
                  </div>
                </div>
                {userEmail && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.15rem' }}>
                    <div style={{ fontSize: '0.7rem', color: '#64748b', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Email</div>
                    <div style={{ fontSize: '0.8rem', color: theme === 'dark' ? '#ffffff' : 'var(--text-main)', fontWeight: '500', wordBreak: 'break-all' }}>{userEmail}</div>
                  </div>
                )}
                {mobileNumber && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.15rem' }}>
                    <div style={{ fontSize: '0.7rem', color: '#64748b', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Phone</div>
                    <div style={{ fontSize: '0.8rem', color: theme === 'dark' ? '#ffffff' : 'var(--text-main)', fontWeight: '500' }}>{mobileNumber}</div>
                  </div>
                )}
              </div>
            )}

            <div style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: '0.75rem', 
              padding: '0.5rem 0.75rem', 
              borderRadius: '12px', 
              backgroundColor: theme === 'dark' ? '#111726' : '#f0f7ff',
              border: theme === 'dark' ? '1px solid #1c2438' : '1px solid rgba(37, 99, 235, 0.15)'
            }}>
              <div style={{ 
                width: '36px', 
                height: '36px', 
                borderRadius: '50%', 
                backgroundColor: theme === 'dark' ? '#fbbf24' : '#2563eb', 
                color: theme === 'dark' ? '#080c14' : '#ffffff', 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center', 
                fontWeight: 'bold',
                fontSize: '0.85rem',
                flexShrink: 0
              }}>
                {initials}
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', minWidth: 0 }}>
                <span style={{ fontSize: '0.8rem', fontWeight: '700', color: theme === 'dark' ? '#ffffff' : '#1e3a8a', textTransform: 'capitalize', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {displayName}
                </span>
                <span style={{ fontSize: '0.65rem', color: theme === 'dark' ? '#64748b' : '#3b82f6', fontWeight: '500' }}>
                  {role === 'valet' ? 'Valet In-Charge' : role === 'valet_staff' ? 'Valet Staff' : 'Global Admin'}
                </span>
              </div>
            </div>
          </div>

          <button 
            onClick={handleLogout}
            style={{ 
              width: '100%', 
              display: 'flex',
              alignItems: 'center',
              gap: '0.85rem',
              padding: '0.65rem 0.85rem',
              color: '#ef4444', 
              borderRadius: '10px',
              backgroundColor: 'rgba(239, 68, 68, 0.05)',
              border: '1px solid rgba(239, 68, 68, 0.1)',
              transition: 'all 0.2s ease',
              fontSize: '0.85rem',
              fontWeight: '600'
            }}
          >
            <LogOut size={18} />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', position: 'relative' }}>
        <main style={{ flex: 1, overflowY: 'auto', padding: '2rem' }}>
          <AnimatePresence mode="wait">
            <motion.div
              key={location.pathname}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >
              {currentOutlet}
            </motion.div>
          </AnimatePresence>
        </main>
      </div>

      {/* Coming Soon Toast Notification */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div
            initial={{ opacity: 0, y: 50, x: '-50%' }}
            animate={{ opacity: 1, y: 0, x: '-50%' }}
            exit={{ opacity: 0, y: 20, x: '-50%' }}
            style={{
              position: 'fixed',
              bottom: '2rem',
              left: '50%',
              backgroundColor: '#111726',
              border: '1px solid #fbbf24',
              color: '#ffffff',
              padding: '0.75rem 1.5rem',
              borderRadius: '12px',
              zIndex: 9999,
              boxShadow: '0 10px 25px -5px rgba(0,0,0,0.5)',
              fontSize: '0.85rem',
              fontWeight: '600',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem'
            }}
          >
            <span style={{ color: '#fbbf24' }}>★</span> {toastMessage}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default DashboardLayout;
