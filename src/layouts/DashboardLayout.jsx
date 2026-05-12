import React, { useState } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Car, 
  Users, 
  AlertTriangle, 
  Settings, 
  BarChart3, 
  ShieldCheck, 
  LogOut,
  Menu,
  X,
  Moon,
  Sun,
  ChevronRight,
  ClipboardList
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import Button from '../components/ui/Button';
import { locationService } from '../services/locationService';
import { MapPin } from 'lucide-react';
import dashboardBg from '../assets/dashboard-bg.png';
import Logo from '../components/ui/Logo';


const DashboardLayout = ({ role }) => {
  const [isSidebarOpen, setSidebarOpen] = useState(true);
  const { theme, toggleTheme } = useTheme();
  const { user, signOut, locationId } = useAuth();
  const [currentLocation, setCurrentLocation] = useState(null);
  const location = useLocation();
  const navigate = useNavigate();

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

  const navigation = {
    valet: [
      { name: 'Dashboard', path: '/valet', icon: LayoutDashboard },
      { name: 'Live Pipeline', path: '/valet/pipeline', icon: ClipboardList },
      { name: 'Staff Module', path: '/valet/staff', icon: Users },
      { name: 'Incident Tracker', path: '/valet/incidents', icon: AlertTriangle },
      { name: 'Settings', path: '/valet/settings', icon: Settings },
    ],
    valet_staff: [
      { name: 'Dashboard', path: '/valet', icon: LayoutDashboard },
      { name: 'Live Pipeline', path: '/valet/pipeline', icon: ClipboardList },
      { name: 'Staff Module', path: '/valet/staff', icon: Users },
      { name: 'Incident Tracker', path: '/valet/incidents', icon: AlertTriangle },
      { name: 'Settings', path: '/valet/settings', icon: Settings },
    ],
    admin: [
      { name: 'Analytics', path: '/admin', icon: BarChart3 },
      { name: 'Clients', path: '/admin/clients', icon: Users },
      { name: 'Security & Logs', path: '/admin/security', icon: ShieldCheck },
      { name: 'Global Settings', path: '/admin/settings', icon: Settings },
    ]
  };

  const navItems = navigation[role] || [];
  
  // Get initials for profile picture
  const userEmail = user?.email || 'User';
  const displayName = user?.user_metadata?.full_name || userEmail.split('@')[0];
  const initials = displayName.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);

  return (
    <div style={{ 
      display: 'flex', 
      height: '100vh', 
      width: '100vw', 
      overflow: 'hidden', 
      backgroundColor: 'var(--bg-app)' 
    }}>
      {/* Sidebar */}
      <motion.aside
        initial={false}
        animate={{ width: isSidebarOpen ? 280 : 80 }}
        style={{
          height: '100%',
          zIndex: 20,
          borderRight: '1px solid var(--border-color)',
          display: 'flex',
          flexDirection: 'column',
          backgroundColor: 'var(--bg-surface)',
          backdropFilter: 'none',
          transition: 'background-color var(--transition-normal), border-color var(--transition-normal)'
        }}
      >
        <div style={{ padding: '1.5rem', display: 'flex', alignItems: 'center', justifyContent: isSidebarOpen ? 'space-between' : 'center', height: '80px' }}>
          {isSidebarOpen ? (
            <>
              <Logo size={32} to={role === 'admin' ? '/admin' : '/valet'} />
              <Button variant="ghost" onClick={() => setSidebarOpen(false)} style={{ padding: '0.25rem' }}>
                <X size={20} />
              </Button>
            </>
          ) : (
            <Button variant="ghost" onClick={() => setSidebarOpen(true)} style={{ padding: '0.25rem' }}>
              <Menu size={20} />
            </Button>
          )}
        </div>

        <nav style={{ flex: 1, padding: '1rem', display: 'flex', flexDirection: 'column', gap: '0.5rem', overflowY: 'auto' }}>
          {navItems.map((item) => {
            const isActive = location.pathname === item.path;
            const Icon = item.icon;
            
            return (
              <Link key={item.name} to={item.path} style={{ textDecoration: 'none' }}>
                <motion.div
                  whileHover={{ x: 4 }}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '1rem',
                    padding: '0.75rem 1rem',
                    borderRadius: '12px',
                    backgroundColor: isActive ? 'var(--primary)' : 'transparent',
                    color: isActive ? 'white' : 'var(--text-muted)',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease'
                  }}
                >
                  <Icon size={24} />
                  {isSidebarOpen && (
                    <motion.span
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      style={{ fontWeight: isActive ? '600' : '500', fontSize: '0.9rem' }}
                    >
                      {item.name}
                    </motion.span>
                  )}
                  {isActive && isSidebarOpen && <div style={{ marginLeft: 'auto' }}><ChevronRight size={16} /></div>}
                </motion.div>
              </Link>
            );
          })}
        </nav>

        <div style={{ padding: '1rem', borderTop: '1px solid var(--border-color)' }}>
          <Button 
            variant="ghost" 
            onClick={handleLogout}
            style={{ width: '100%', justifyContent: isSidebarOpen ? 'flex-start' : 'center', color: '#ef4444', gap: '1rem' }}
          >
            <LogOut size={24} />
            {isSidebarOpen && <span>Sign Out</span>}
          </Button>
        </div>
      </motion.aside>

      {/* Main Content */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        {/* Top Navbar */}
        <header style={{ 
          height: '80px', 
          padding: '0 2rem', 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'space-between', 
          borderBottom: '1px solid var(--border-color)', 
          backgroundColor: 'var(--bg-surface)',
          backdropFilter: 'none',
          zIndex: 10,
          transition: 'background-color var(--transition-normal), border-color var(--transition-normal)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
            {!isSidebarOpen && <Logo size={28} showText={false} to={role === 'admin' ? '/admin' : '/valet'} />}
            
            {role.startsWith('valet') && currentLocation && (
              <div style={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: '0.5rem', 
                padding: '0.4rem 0.75rem', 
                backgroundColor: 'rgba(37, 99, 235, 0.1)', 
                borderRadius: '10px',
                color: 'var(--primary)',
                fontSize: '0.875rem',
                fontWeight: '600'
              }}>
                <MapPin size={16} />
                <span>Location: {currentLocation.name}</span>
              </div>
            )}
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
            <Button variant="ghost" onClick={toggleTheme}>
              {theme === 'light' ? <Moon size={22} /> : <Sun size={22} />}
            </Button>
            
            <div style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: '0.75rem', 
              padding: '0.5rem 1rem', 
              borderRadius: '12px', 
              backgroundColor: 'var(--bg-subtle)',
              border: '1px solid var(--border-subtle)',
              transition: 'all var(--transition-normal)'
            }}>
              <div style={{ 
                width: '36px', 
                height: '36px', 
                borderRadius: '50%', 
                backgroundColor: 'var(--primary)', 
                color: 'white', 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center', 
                fontWeight: 'bold',
                fontSize: '0.875rem'
              }}>
                {initials}
              </div>
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <span style={{ fontSize: '0.875rem', fontWeight: '700', color: 'var(--text-main)', textTransform: 'capitalize' }}>{displayName}</span>
                <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: '500' }}>
                  {role === 'valet' ? 'Valet In-Charge' : role === 'valet_staff' ? 'Valet Staff' : 'Global Admin'}
                </span>
              </div>
            </div>
          </div>
        </header>

        {/* Dynamic Page Content */}
        <main style={{ flex: 1, overflowY: 'auto', padding: '2rem' }}>
          <AnimatePresence mode="wait">
            <motion.div
              key={location.pathname}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3 }}
            >
              <Outlet />
            </motion.div>
          </AnimatePresence>
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
