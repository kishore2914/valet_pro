import React, { useState } from 'react';
import { 
  Globe, 
  ShieldCheck, 
  Server, 
  Database, 
  BellRing, 
  Users, 
  Key, 
  ChevronRight,
  Settings as SettingsIcon,
  Activity,
  Lock,
  Loader2,
  Check,
  Zap,
  Shield,
  Cpu,
  Mail,
  Smartphone,
  Globe2,
  ListFilter,
  Tag,
  IndianRupee
} from 'lucide-react';
import { adminService } from '../../services/adminService';
import Badge from '../../components/ui/Badge';

import GlassCard from '../../components/ui/GlassCard';
import Button from '../../components/ui/Button';
import Modal from '../../components/ui/Modal';

const GlobalSettings = () => {
  const [activeItem, setActiveItem] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [starterPrice, setStarterPrice] = useState('3999');
  const [proPrice, setProPrice] = useState('7999');

  React.useEffect(() => {
    const fetchSettings = async () => {
      const { data } = await adminService.getPlatformSettings();
      if (data) {
        const starter = data.find(s => s.key === 'pricing_starter');
        const pro = data.find(s => s.key === 'pricing_pro');
        if (starter) setStarterPrice(starter.value);
        if (pro) setProPrice(pro.value);
      }
    };
    fetchSettings();
  }, []);


  const sections = [
    { 
      title: 'Platform Infrastructure', 
      icon: Server, 
      desc: 'System maintenance, global scaling, and API gateways',
      items: ['Cluster Health', 'Maintenance Window', 'CDN Purge']
    },
    { 
      title: 'Global Security', 
      icon: ShieldCheck, 
      desc: 'MFA enforcement, IP whitelisting, and audit logging',
      items: ['Authentication Policies', 'Audit Logs', 'MFA Management']
    },
    { 
      title: 'System Access Keys', 
      icon: Key, 
      desc: 'Manage service accounts and third-party integrations',
      items: ['API Key Management', 'Webhooks', 'Partner Integration']
    },
    { 
      title: 'Messaging Gateway', 
      icon: BellRing, 
      desc: 'SMS/Email providers and global alert templates',
      items: ['Gateway Configuration', 'Global SMS Providers', 'Email Templates']
    },
    { 
      title: 'Pricing & Plans', 
      icon: Tag, 
      desc: 'Update platform-wide subscription costs and tier limits',
      items: ['Subscription Prices', 'Plan Features']
    }
  ];


  const handleSave = async () => {
    setIsSaving(true);
    
    try {
      if (activeItem === 'Subscription Prices') {
        await adminService.updatePlatformSetting('pricing_starter', starterPrice);
        await adminService.updatePlatformSetting('pricing_pro', proPrice);
      }
      
      setTimeout(() => {
        setIsSaving(false);
        setSaveSuccess(true);
        setTimeout(() => {
          setSaveSuccess(false);
          setActiveItem(null);
        }, 1500);
      }, 1000);
    } catch (error) {
      console.error('Failed to save settings:', error);
      setIsSaving(false);
    }
  };


  const renderGlobalSettingContent = (item) => {
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
      case 'Maintenance Window':
        return (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Schedule platform-wide updates and downtime periods.</p>
            <div>
              <label style={labelStyle}>Next Window Start</label>
              <input style={inputStyle} type="datetime-local" defaultValue="2026-05-01T02:00" />
            </div>
            <div>
              <label style={labelStyle}>Duration (Hours)</label>
              <input style={inputStyle} type="number" defaultValue="2" />
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.75rem', backgroundColor: 'rgba(245, 158, 11, 0.1)', borderRadius: '10px' }}>
              <BellRing size={18} color="var(--amber-gold)" />
              <span style={{ fontSize: '0.8rem', color: 'var(--amber-gold)', fontWeight: '500' }}>Notify all 450+ venues via email</span>
            </div>
          </div>
        );
      case 'CDN Purge':
        return (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Force refresh global assets across all edge locations.</p>
            <div>
              <label style={labelStyle}>Purge Scope</label>
              <select style={inputStyle}>
                <option>All Assets (Everything)</option>
                <option>Selected Locations Only</option>
                <option>Static Images & CSS</option>
              </select>
            </div>
            <Button variant="outline" style={{ display: 'flex', gap: '0.5rem', justifyContent: 'center' }}>
              <Zap size={16} />
              <span>Instant Global Purge</span>
            </Button>
          </div>
        );
      case 'Audit Logs':
        return (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
             <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Platform-wide administrative activity trail.</p>
             {[1, 2, 3].map(i => (
               <div key={i} style={{ padding: '0.75rem', borderBottom: '1px solid var(--border-color)', fontSize: '0.8rem' }}>
                 <div style={{ fontWeight: '600', marginBottom: '0.25rem' }}>Root Login from 192.168.1.1</div>
                 <div style={{ color: 'var(--text-muted)' }}>2 minutes ago • Severity: Low</div>
               </div>
             ))}
             <Button variant="ghost" style={{ fontSize: '0.85rem', color: 'var(--primary)' }}>View Full Audit Trail →</Button>
          </div>
        );
      case 'MFA Management':
        return (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <div>
              <label style={labelStyle}>Preferred MFA Method</label>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                <div style={{ padding: '1rem', border: '2px solid var(--primary)', borderRadius: '10px', textAlign: 'center', backgroundColor: 'rgba(37, 99, 235, 0.05)' }}>
                  <Smartphone size={20} style={{ marginBottom: '0.5rem' }} />
                  <div style={{ fontSize: '0.8rem', fontWeight: '600' }}>Authenticator App</div>
                </div>
                <div style={{ padding: '1rem', border: '1px solid var(--border-color)', borderRadius: '10px', textAlign: 'center' }}>
                  <Mail size={20} style={{ marginBottom: '0.5rem' }} />
                  <div style={{ fontSize: '0.8rem', fontWeight: '600' }}>Email Logic</div>
                </div>
              </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span style={{ fontSize: '0.85rem' }}>Allow recovery codes</span>
              <div style={{ width: '36px', height: '18px', backgroundColor: 'var(--primary)', borderRadius: '9px' }}></div>
            </div>
          </div>
        );
      case 'Webhooks':
        return (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
             <div>
              <label style={labelStyle}>Endpoint URL</label>
              <input style={inputStyle} placeholder="https://your-api.com/webhooks" defaultValue="https://events.valetpro.io/ingest" />
            </div>
            <div>
              <label style={labelStyle}>Events to Trigger</label>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                <Badge variant="blue">vehicle_checkin</Badge>
                <Badge variant="blue">incident_reported</Badge>
                <Badge variant="outline">staff_login</Badge>
              </div>
            </div>
          </div>
        );
      case 'Partner Integration':
        return (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '1rem', border: '1px solid var(--border-color)', borderRadius: '12px' }}>
              <div style={{ width: '40px', height: '40px', backgroundColor: '#eee', borderRadius: '8px' }}></div>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: '600', fontSize: '0.9rem' }}>Stripe Connect</div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Connected & Live</div>
              </div>
              <Button variant="ghost" style={{ fontSize: '0.8rem' }}>Configure</Button>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '1rem', border: '1px solid var(--border-color)', borderRadius: '12px', opacity: 0.6 }}>
              <div style={{ width: '40px', height: '40px', backgroundColor: '#eee', borderRadius: '8px' }}></div>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: '600', fontSize: '0.9rem' }}>Zendesk Support</div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Not Integrated</div>
              </div>
              <Button variant="ghost" style={{ fontSize: '0.8rem' }}>Connect</Button>
            </div>
          </div>
        );
      case 'Gateway Configuration':
        return (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <div>
              <label style={labelStyle}>SMTP Server</label>
              <input style={inputStyle} placeholder="smtp.sendgrid.net" defaultValue="mail.valetsafeguard.com" />
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div>
                <label style={labelStyle}>Port</label>
                <input style={inputStyle} type="number" defaultValue="587" />
              </div>
              <div>
                <label style={labelStyle}>Encryption</label>
                <select style={inputStyle}><option>TLS</option><option>SSL</option></select>
              </div>
            </div>
          </div>
        );
      case 'Email Templates':
        return (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <div style={{ border: '1px solid var(--border-color)', borderRadius: '10px' }}>
              {['Welcome Email', 'Client Invoiced', 'System Alert'].map(t => (
                <div key={t} style={{ padding: '0.75rem 1rem', borderBottom: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '0.85rem' }}>{t}</span>
                  <Button variant="ghost" style={{ fontSize: '0.75rem', color: 'var(--primary)', fontWeight: '600' }}>Edit HTML</Button>
                </div>
              ))}
            </div>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textAlign: 'center' }}>Global templates apply to all location-level sub-templates.</p>
          </div>
        );
      case 'Cluster Health':
        return (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem' }}>
              <div style={{ padding: '0.75rem', borderRadius: '10px', backgroundColor: 'rgba(22, 163, 74, 0.1)', textAlign: 'center' }}>
                <div style={{ fontSize: '0.75rem', color: '#16a34a', fontWeight: '600' }}>US-East-1</div>
                <div style={{ fontSize: '1.1rem', fontWeight: '700' }}>99.9%</div>
              </div>
              <div style={{ padding: '0.75rem', borderRadius: '10px', backgroundColor: 'rgba(22, 163, 74, 0.1)', textAlign: 'center' }}>
                <div style={{ fontSize: '0.75rem', color: '#16a34a', fontWeight: '600' }}>EU-West-1</div>
                <div style={{ fontSize: '1.1rem', fontWeight: '700' }}>100%</div>
              </div>
              <div style={{ padding: '0.75rem', borderRadius: '10px', backgroundColor: 'rgba(22, 163, 74, 0.1)', textAlign: 'center' }}>
                <div style={{ fontSize: '0.75rem', color: '#16a34a', fontWeight: '600' }}>AP-South-1</div>
                <div style={{ fontSize: '1.1rem', fontWeight: '700' }}>99.8%</div>
              </div>
            </div>
            <div>
              <label style={labelStyle}>Replication Factor</label>
              <input style={inputStyle} type="number" defaultValue="3" />
            </div>
          </div>
        );
      case 'Authentication Policies':
        return (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.75rem', backgroundColor: 'var(--bg-app)', borderRadius: '10px' }}>
              <span style={{ fontSize: '0.9rem' }}>Enforce Strong Passwords</span>
              <div style={{ width: '40px', height: '20px', backgroundColor: 'var(--primary)', borderRadius: '10px' }}></div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.75rem', backgroundColor: 'var(--bg-app)', borderRadius: '10px' }}>
              <span style={{ fontSize: '0.9rem' }}>Require MFA for Admins</span>
              <div style={{ width: '40px', height: '20px', backgroundColor: 'var(--primary)', borderRadius: '10px' }}></div>
            </div>
            <div>
              <label style={labelStyle}>Session Timeout (Hours)</label>
              <input style={inputStyle} type="number" defaultValue="12" />
            </div>
          </div>
        );
      case 'API Key Management':
        return (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <div style={{ padding: '1rem', borderRadius: '10px', border: '1px solid var(--border-color)', backgroundColor: 'var(--bg-app)', fontFamily: 'monospace', fontSize: '0.85rem', position: 'relative' }}>
              pk_live_51P7x2S...33qW
              <Button variant="ghost" style={{ position: 'absolute', right: '0.5rem', top: '50%', transform: 'translateY(-50%)', padding: '0.2rem' }}>Copy</Button>
            </div>
            <Button variant="outline" style={{ borderStyle: 'dashed' }}>+ Generate New Secret Key</Button>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Use keys to authenticate third-party POS integrations.</p>
          </div>
        );
      case 'Global SMS Providers':
        return (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <div>
              <label style={labelStyle}>Primary Gateway</label>
              <select style={inputStyle}>
                <option>Twilio Global</option>
                <option>AWS Pinpoint</option>
                <option>MessageBird</option>
              </select>
            </div>
            <div>
              <label style={labelStyle}>Twilio Account SID</label>
              <input style={inputStyle} placeholder="ACXXXXXXXXXXXXXXXXXXXX" />
            </div>
            <div>
              <label style={labelStyle}>Twilio Auth Token</label>
              <input style={inputStyle} type="password" placeholder="••••••••••••••••" />
            </div>
          </div>
        );
      case 'Subscription Prices':
        return (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Set the base monthly subscription price in INR. These will be automatically converted to other currencies for global users.</p>
            <div>
              <label style={labelStyle}>Starter Plan (Monthly)</label>
              <div style={{ position: 'relative' }}>
                <IndianRupee size={16} style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                <input 
                  style={{ ...inputStyle, paddingLeft: '2.5rem' }} 
                  type="number" 
                  value={starterPrice} 
                  onChange={(e) => setStarterPrice(e.target.value)} 
                />
              </div>
            </div>
            <div>
              <label style={labelStyle}>Pro Plan (Monthly)</label>
              <div style={{ position: 'relative' }}>
                <IndianRupee size={16} style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                <input 
                  style={{ ...inputStyle, paddingLeft: '2.5rem' }} 
                  type="number" 
                  value={proPrice} 
                  onChange={(e) => setProPrice(e.target.value)} 
                />
              </div>
            </div>
            <div style={{ padding: '1rem', backgroundColor: 'rgba(37, 99, 235, 0.05)', borderRadius: '12px', border: '1px solid rgba(37, 99, 235, 0.1)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem', color: 'var(--primary)', fontWeight: '600', fontSize: '0.85rem' }}>
                <Globe size={16} />
                <span>Global Price Preview</span>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.5rem' }}>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                  USD: ${(starterPrice * 0.012).toFixed(0)}
                </div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                  GBP: £{(starterPrice * 0.0094).toFixed(0)}
                </div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                  AED: {(starterPrice * 0.044).toFixed(0)} AED
                </div>
              </div>
            </div>
          </div>
        );
      case 'Plan Features':
        return (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
             <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Manage usage limits and feature access for each tier.</p>
             <div style={{ padding: '1rem', border: '1px solid var(--border-color)', borderRadius: '12px' }}>
               <div style={{ fontWeight: '700', marginBottom: '0.5rem' }}>Starter</div>
               <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Max 100 vehicles/mo</div>
             </div>
             <div style={{ padding: '1rem', border: '1px solid var(--border-color)', borderRadius: '12px' }}>
               <div style={{ fontWeight: '700', marginBottom: '0.5rem' }}>Pro</div>
               <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Max 250 vehicles/mo • Custom Branding</div>
             </div>
          </div>
        );
      default:
        return (
          <div style={{ textAlign: 'center', padding: '2rem' }}>
            <Shield size={40} color="var(--primary)" style={{ marginBottom: '1rem', opacity: 0.5 }} />
            <p style={{ fontWeight: '600' }}>Platform Control for {item}</p>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.5rem' }}>Global configuration module is locked. Re-authenticate to access write permissions.</p>
          </div>
        );
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ fontSize: '1.875rem' }}>Global Settings</h1>
          <p style={{ color: 'var(--text-muted)' }}>Platform-wide configuration and infrastructure management</p>
        </div>
        <Button variant="accent">
          <Activity size={18} />
          <span>System Status: Healthy</span>
        </Button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1.5rem' }}>
        {sections.map((section) => (
          <GlassCard key={section.title} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <div style={{ 
                padding: '0.75rem', 
                borderRadius: '12px', 
                backgroundColor: 'rgba(37, 99, 235, 0.1)', 
                color: 'var(--primary)', 
                border: '1px solid rgba(37, 99, 235, 0.2)' 
              }}>
                <section.icon size={24} />
              </div>
              <div>
                <h3 style={{ fontSize: '1.1rem', fontWeight: '700' }}>{section.title}</h3>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{section.desc}</p>
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              {section.items.map(item => (
                <div 
                  key={item} 
                  onClick={() => setActiveItem(item)}
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

      <GlassCard style={{ borderLeft: '4px solid var(--accent)', background: 'linear-gradient(to right, rgba(245, 158, 11, 0.05), transparent)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
            <div style={{ padding: '0.75rem', borderRadius: '50%', backgroundColor: 'rgba(245, 158, 11, 0.1)', color: 'var(--amber-gold)' }}>
              <Lock size={24} />
            </div>
            <div>
              <h3 style={{ fontSize: '1.1rem', fontWeight: '700' }}>Root Access & Compliance</h3>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Your session has top-level platform privileges. Audit trails are active.</p>
            </div>
          </div>
          <div style={{ display: 'flex', gap: '1rem' }}>
            <Button variant="outline">Security Policy</Button>
            <Button variant="primary">Export Audit Log</Button>
          </div>
        </div>
      </GlassCard>

      <Modal
        isOpen={!!activeItem}
        onClose={() => !isSaving && setActiveItem(null)}
        title={activeItem}
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          {renderGlobalSettingContent(activeItem)}
          
          <div style={{ display: 'flex', gap: '1rem', borderTop: '1px solid var(--border-color)', paddingTop: '1.5rem' }}>
            <Button 
              variant="outline" 
              style={{ flex: 1 }} 
              onClick={() => setActiveItem(null)}
              disabled={isSaving}
            >
              Cancel
            </Button>
            <Button 
              variant="accent" 
              style={{ 
                flex: 2, 
                backgroundColor: saveSuccess ? '#16a34a' : 'var(--accent)',
                borderColor: saveSuccess ? '#16a34a' : 'var(--accent)'
              }} 
              onClick={handleSave}
              disabled={isSaving || saveSuccess}
            >
              {isSaving ? (
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <Loader2 size={18} className="animate-spin" />
                  <span>Updating Platform...</span>
                </div>
              ) : saveSuccess ? (
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <Check size={18} />
                  <span>Success</span>
                </div>
              ) : (
                'Save Changes'
              )}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default GlobalSettings;
