import React, { useState } from 'react';
import { 
  Settings as SettingsIcon, 
  MapPin, 
  Palette, 
  Clock, 
  Bell, 
  Shield, 
  ChevronRight,
  ParkingCircle,
  Loader2,
  Check,
  Upload,
  Zap,
  Info
} from 'lucide-react';
import GlassCard from '../../components/ui/GlassCard';
import Button from '../../components/ui/Button';
import Modal from '../../components/ui/Modal';

const Settings = () => {
  const [activeSetting, setActiveSetting] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  const sections = [
    { 
      title: 'Location Configuration', 
      icon: MapPin, 
      desc: 'Parking zones, slot IDs, and capacity limits',
      items: ['Manage Parking Zones', 'Slot Mapping', 'Valet Station Locations']
    },
    { 
      title: 'Branding & Aesthetics', 
      icon: Palette, 
      desc: 'Custom logos, colors, and digital ticket themes',
      items: ['Upload Logo', 'Theme Colors', 'QR Code Styles']
    },
    { 
      title: 'Operational Rules', 
      icon: Clock, 
      desc: 'Service timers, late fees, and operating hours',
      items: ['Response Time Targets', 'Standard Operating Hours', 'Fee Configuration']
    },
    { 
      title: 'Notification Settings', 
      icon: Bell, 
      desc: 'SMS/Email alerts and staff notifications',
      items: ['Customer SMS Templates', 'Internal Staff Alerts']
    }
  ];

  const handleSave = () => {
    setIsSaving(true);
    // Simulate API call
    setTimeout(() => {
      setIsSaving(false);
      setSaveSuccess(true);
      setTimeout(() => {
        setSaveSuccess(false);
        setActiveSetting(null);
      }, 1500);
    }, 1000);
  };

  const renderSettingContent = (item) => {
    const inputStyle = {
      width: '100%',
      padding: '0.75rem',
      borderRadius: '8px',
      border: '1px solid var(--border-color)',
      backgroundColor: 'var(--bg-app)',
      color: 'var(--text-main)',
      outline: 'none',
      fontSize: '0.9rem'
    };

    const labelStyle = {
      display: 'block',
      fontSize: '0.85rem',
      fontWeight: '600',
      marginBottom: '0.5rem',
      color: 'var(--text-muted)'
    };

    switch (item) {
      case 'Billing Details':
        return (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <div style={{ padding: '1rem', borderRadius: '12px', background: 'linear-gradient(135deg, var(--bg-card), var(--bg-subtle))', border: '1px solid var(--primary)', position: 'relative', overflow: 'hidden' }}>
               <div style={{ position: 'absolute', top: '-10px', right: '-10px', width: '60px', height: '60px', backgroundColor: 'rgba(37, 99, 235, 0.1)', borderRadius: '50%' }}></div>
               <div style={{ fontSize: '0.75rem', color: 'var(--primary)', fontWeight: '700', textTransform: 'uppercase', marginBottom: '0.5rem' }}>Active Plan</div>
               <div style={{ fontSize: '1.25rem', fontWeight: '700' }}>Valet Pro Enterprise</div>
               <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>Next renewal on June 12, 2024</div>
            </div>
            
            <div>
              <label style={labelStyle}>Payment Method</label>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '0.75rem', border: '1px solid var(--border-color)', borderRadius: '10px', backgroundColor: 'var(--bg-app)' }}>
                <div style={{ width: '40px', height: '24px', backgroundColor: '#000', borderRadius: '4px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: '0.5rem' }}>VISA</div>
                <div style={{ flex: 1, fontSize: '0.9rem' }}>•••• •••• •••• 4412</div>
                <Button variant="ghost" style={{ fontSize: '0.75rem', padding: '0.2rem' }}>Edit</Button>
              </div>
            </div>

            <div>
              <label style={labelStyle}>Recent Invoices</label>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                {['INV-2024-001', 'INV-2024-002'].map(inv => (
                  <div key={inv} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.8rem', padding: '0.5rem 0', borderBottom: '1px solid var(--border-color)' }}>
                    <span>{inv} - May 2024</span>
                    <span style={{ fontWeight: '600' }}>₹14,999.00</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        );
      case 'Slot Mapping':
        return (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Map physical parking slots to digital IDs for precise tracking.</p>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div>
                <label style={labelStyle}>Prefix</label>
                <input style={inputStyle} defaultValue="A-" />
              </div>
              <div>
                <label style={labelStyle}>Range Start</label>
                <input style={inputStyle} type="number" defaultValue="1" />
              </div>
            </div>
            <div style={{ padding: '1rem', border: '1px solid var(--border-color)', borderRadius: '10px', backgroundColor: 'var(--bg-app)', fontSize: '0.8rem' }}>
              <strong>Preview:</strong> A-1, A-2, A-3 ... A-50
            </div>
          </div>
        );
      case 'Valet Station Locations':
        return (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Define physical check-in kiosks and pickup points.</p>
            <div>
              <label style={labelStyle}>Main Entrance Station</label>
              <input style={inputStyle} defaultValue="Main Lobby East" />
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', color: 'var(--primary)', fontSize: '0.8rem', fontWeight: '500' }}>
              <MapPin size={16} />
              <span>Gps Coordinates: 12.9716° N, 77.5946° E</span>
            </div>
          </div>
        );
      case 'Theme Colors':
        return (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Set your location's digital branding colors.</p>
            <div style={{ display: 'flex', gap: '1rem' }}>
              <div style={{ flex: 1 }}>
                <label style={labelStyle}>Primary Color</label>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <div style={{ width: '38px', height: '38px', borderRadius: '8px', backgroundColor: '#2563eb', border: '2px solid white' }}></div>
                  <input style={inputStyle} defaultValue="#2563eb" />
                </div>
              </div>
              <div style={{ flex: 1 }}>
                <label style={labelStyle}>Header Style</label>
                <select style={inputStyle}><option>Glassmorphism</option><option>Solid</option></select>
              </div>
            </div>
          </div>
        );
      case 'QR Code Styles':
        return (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem' }}>
            <div style={{ width: '120px', height: '120px', backgroundColor: 'white', padding: '1rem', borderRadius: '12px' }}>
              {/* QR Mockup */}
              <div style={{ width: '100%', height: '100%', backgroundImage: 'linear-gradient(45deg, #000 25%, transparent 25%, transparent 75%, #000 75%, #000), linear-gradient(45deg, #000 25%, transparent 25%, transparent 75%, #000 75%, #000)', backgroundSize: '10px 10px', backgroundPosition: '0 0, 5px 5px', opacity: 0.1 }}></div>
            </div>
            <div style={{ width: '100%' }}>
              <label style={labelStyle}>QR Corner Style</label>
              <select style={inputStyle}><option>Rounded</option><option>Square</option><option>Dots</option></select>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Check size={16} color="#16a34a" />
              <span style={{ fontSize: '0.8rem' }}>Location logo embedded in center</span>
            </div>
          </div>
        );
      case 'Standard Operating Hours':
        return (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {['Weekdays', 'Saturday', 'Sunday'].map(day => (
              <div key={day} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span style={{ fontSize: '0.85rem', fontWeight: '500', width: '80px' }}>{day}</span>
                <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                  <input style={{ ...inputStyle, width: '80px', padding: '0.4rem' }} defaultValue="09:00" />
                  <span>-</span>
                  <input style={{ ...inputStyle, width: '80px', padding: '0.4rem' }} defaultValue="23:00" />
                </div>
              </div>
            ))}
          </div>
        );
      case 'Fee Configuration':
        return (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
             <div>
              <label style={labelStyle}>Base Valet Fee (₹)</label>
              <input style={inputStyle} type="number" defaultValue="200" />
            </div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span style={{ fontSize: '0.85rem' }}>Automate overtime billing</span>
              <div style={{ width: '36px', height: '18px', backgroundColor: 'var(--primary)', borderRadius: '9px' }}></div>
            </div>
          </div>
        );
      case 'Internal Staff Alerts':
        return (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.75rem', backgroundColor: 'var(--bg-app)', borderRadius: '10px' }}>
                <span style={{ fontSize: '0.85rem' }}>New Check-in Alert</span>
                <div style={{ width: '36px', height: '18px', backgroundColor: 'var(--primary)', borderRadius: '9px' }}></div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.75rem', backgroundColor: 'var(--bg-app)', borderRadius: '10px' }}>
                <span style={{ fontSize: '0.85rem' }}>Key Misplacement Alert</span>
                <div style={{ width: '36px', height: '18px', backgroundColor: '#ef4444', borderRadius: '9px' }}></div>
              </div>
            </div>
          </div>
        );
      case 'Manage Parking Zones':
        return (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <div>
              <label style={labelStyle}>Zone Name</label>
              <input style={inputStyle} defaultValue="Premium North" />
            </div>
            <div>
              <label style={labelStyle}>Total Slots</label>
              <input style={inputStyle} type="number" defaultValue="50" />
            </div>
            <div style={{ display: 'flex', gap: '1rem' }}>
              <Button variant="ghost" style={{ flex: 1, border: '1px dashed var(--border-color)' }}>+ Add New Zone</Button>
            </div>
          </div>
        );
      case 'Upload Logo':
        return (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1.5rem', padding: '1rem' }}>
            <div style={{ width: '120px', height: '120px', borderRadius: '20px', border: '2px dashed var(--border-color)', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: 'var(--bg-subtle)' }}>
              <Upload size={32} color="var(--text-muted)" />
            </div>
            <div style={{ textAlign: 'center' }}>
              <p style={{ fontSize: '0.9rem', fontWeight: '500' }}>Drop your logo here</p>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>PNG or SVG, max 5MB</p>
            </div>
            <Button variant="primary">Choose File</Button>
          </div>
        );
      case 'Response Time Targets':
        return (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <div style={{ padding: '0.75rem', borderRadius: '10px', backgroundColor: 'rgba(37, 99, 235, 0.05)', border: '1px solid rgba(37, 99, 235, 0.1)', display: 'flex', gap: '0.75rem' }}>
              <Zap size={20} color="var(--primary)" />
              <p style={{ fontSize: '0.8rem', color: 'var(--primary)', fontWeight: '500' }}>Current Average: 4.2 Minutes</p>
            </div>
            <div>
              <label style={labelStyle}>Target Retrieval Time (Min)</label>
              <input style={inputStyle} type="number" defaultValue="5" />
            </div>
            <div>
              <label style={labelStyle}>Alert threshold (Min)</label>
              <input style={inputStyle} type="number" defaultValue="8" />
            </div>
          </div>
        );
      case 'Customer SMS Templates':
        return (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <div>
              <label style={labelStyle}>Welcome Message</label>
              <textarea style={{ ...inputStyle, minHeight: '100px', resize: 'vertical' }} defaultValue="Welcome to {location}! Your valet ticket is ready: {link}" />
            </div>
            <div>
              <label style={labelStyle}>Ready Message</label>
              <textarea style={{ ...inputStyle, minHeight: '100px', resize: 'vertical' }} defaultValue="Your vehicle {model} ({plate}) is now at the entrance. Thank you for using Valet Pro!" />
            </div>
          </div>
        );
      default:
        return (
          <div style={{ textAlign: 'center', padding: '2rem' }}>
            <Info size={40} color="var(--primary)" style={{ marginBottom: '1rem', opacity: 0.5 }} />
            <p style={{ fontWeight: '500' }}>{item} Interface Coming Soon</p>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.5rem' }}>We are finalizing the local configuration for this module.</p>
          </div>
        );
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      <div>
        <h1 style={{ fontSize: '1.875rem' }}>Location Settings</h1>
        <p style={{ color: 'var(--text-muted)' }}>Configure your local valet operations and branding</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1.5rem' }}>
        {sections.map((section) => (
          <GlassCard key={section.title} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <div style={{ padding: '0.75rem', borderRadius: '12px', backgroundColor: 'var(--bg-subtle)', color: 'var(--primary)', border: '1px solid var(--border-subtle)' }}>
                <section.icon size={24} />
              </div>
              <div>
                <h3 style={{ fontSize: '1.1rem' }}>{section.title}</h3>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{section.desc}</p>
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              {section.items.map(item => (
                <div 
                  key={item} 
                  onClick={() => setActiveSetting(item)}
                  style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'space-between', 
                    padding: '0.75rem 1rem', 
                    backgroundColor: 'var(--bg-app)', 
                    borderRadius: '10px',
                    cursor: 'pointer',
                    border: '1px solid var(--border-subtle)',
                    transition: 'all 0.2s ease'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = 'var(--bg-subtle)';
                    e.currentTarget.style.borderColor = 'var(--primary)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = 'var(--bg-app)';
                    e.currentTarget.style.borderColor = 'var(--border-subtle)';
                  }}
                >
                  <span style={{ fontSize: '0.9rem', fontWeight: '500' }}>{item}</span>
                  <ChevronRight size={16} color="var(--text-muted)" />
                </div>
              ))}
            </div>
          </GlassCard>
        ))}
      </div>

      <GlassCard style={{ borderLeft: '4px solid var(--primary)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <ParkingCircle size={28} color="var(--primary)" />
            <div>
              <h3 style={{ fontSize: '1.1rem' }}>Current Plan: Valet Pro Enterprise</h3>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Your location is currently on the high-performance tier.</p>
            </div>
          </div>
          <Button variant="outline" onClick={() => setActiveSetting('Billing Details')}>Billing Details</Button>
        </div>
      </GlassCard>

      <Modal
        isOpen={!!activeSetting}
        onClose={() => !isSaving && setActiveSetting(null)}
        title={activeSetting}
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          {renderSettingContent(activeSetting)}
          
          <div style={{ display: 'flex', gap: '1rem', borderTop: '1px solid var(--border-color)', paddingTop: '1.5rem' }}>
            <Button 
              variant="outline" 
              style={{ flex: 1 }} 
              onClick={() => setActiveSetting(null)}
              disabled={isSaving}
            >
              Cancel
            </Button>
            <Button 
              variant="primary" 
              style={{ 
                flex: 2, 
                backgroundColor: saveSuccess ? '#16a34a' : 'var(--primary)',
                borderColor: saveSuccess ? '#16a34a' : 'var(--primary)'
              }} 
              onClick={handleSave}
              disabled={isSaving || saveSuccess}
            >
              {isSaving ? (
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <Loader2 size={18} className="animate-spin" />
                  <span>Saving...</span>
                </div>
              ) : saveSuccess ? (
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <Check size={18} />
                  <span>Configured!</span>
                </div>
              ) : (
                'Save Settings'
              )}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default Settings;
