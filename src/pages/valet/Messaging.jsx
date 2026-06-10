import React, { useState, useEffect } from 'react';
import { 
  Send, 
  Check, 
  CheckCheck, 
  Clock, 
  MessageSquare, 
  Smartphone, 
  Plus, 
  Zap, 
  Loader2, 
  X,
  FileText
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { supabase } from '../../lib/supabase';

const initialTemplates = [
  {
    id: 't-1',
    name: 'Vehicle Received',
    channel: 'WhatsApp',
    trigger: 'ON CHECK-IN',
    text: 'Hi {name}, your {vehicle} is securely parked. Token: {token}. Track at {link}',
    active: true
  },
  {
    id: 't-2',
    name: 'Ready for Pickup',
    channel: 'WhatsApp',
    trigger: 'ON RETURN REQUEST',
    text: 'Your {vehicle} is being brought to the entrance. ETA: {eta} mins.',
    active: true
  },
  {
    id: 't-3',
    name: 'OTP for Handover',
    channel: 'SMS',
    trigger: 'ON REQUEST RETURN',
    text: 'Your Valet Pro pickup OTP is {otp}. Valid 5 min. Share only with staff.',
    active: true
  },
  {
    id: 't-4',
    name: 'Thank You & Tip',
    channel: 'WhatsApp',
    trigger: 'AFTER HANDOVER',
    text: 'Thanks {name}! Rate your experience and tip your valet: {tip_link}',
    active: false
  },
  {
    id: 't-5',
    name: 'Forgot Item Reminder',
    channel: 'SMS',
    trigger: 'MANUAL',
    text: '{name}, a {item} was found in your vehicle ({vehicle}). Reply YES to confirm if you want us to keep it at the front desk.',
    active: true
  }
];

const initialMessages = [
  {
    id: 'm-1',
    name: 'Rajesh Kumar',
    phone: '+91 98765 43210',
    type: 'Vehicle Received',
    channel: 'WhatsApp',
    status: 'Delivered',
    time: '2 min ago'
  },
  {
    id: 'm-2',
    name: 'Priya Sharma',
    phone: '+91 98887 12345',
    type: 'OTP for Handover',
    channel: 'SMS',
    status: 'Delivered',
    time: '4 min ago'
  },
  {
    id: 'm-3',
    name: 'Anand Mehta',
    phone: '+91 98123 99001',
    type: 'Ready for Pickup',
    channel: 'WhatsApp',
    status: 'Read',
    time: '7 min ago'
  },
  {
    id: 'm-4',
    name: 'Sneha Kapoor',
    phone: '+91 98765 11223',
    type: 'Vehicle Received',
    channel: 'WhatsApp',
    status: 'Delivered',
    time: '12 min ago'
  },
  {
    id: 'm-5',
    name: 'Vikram Iyer',
    phone: '+91 90011 23456',
    type: 'OTP for Handover',
    channel: 'SMS',
    status: 'Pending',
    time: '15 min ago'
  }
];

const Messaging = () => {
  const { locationId } = useAuth();
  const [templates, setTemplates] = useState(initialTemplates);
  const [dbMessages, setDbMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showComposeModal, setShowComposeModal] = useState(false);
  const [showTemplateModal, setShowTemplateModal] = useState(false);
  const [toast, setToast] = useState(null);

  // Compose Message State
  const [composeForm, setComposeForm] = useState({
    name: '',
    phone: '',
    channel: 'WhatsApp',
    text: ''
  });
  const [isSending, setIsSending] = useState(false);

  // New Template State
  const [newTemplate, setNewTemplate] = useState({
    name: '',
    channel: 'WhatsApp',
    trigger: 'MANUAL',
    text: ''
  });

  const showToastMsg = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  };

  const fetchMessages = async () => {
    if (!locationId) {
      setLoading(false);
      return;
    }
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .eq('location_id', locationId)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching notifications:', error);
      } else if (data) {
        const mapped = data.map(n => {
          let name = 'Guest';
          let type = 'Custom Message';
          let phone = '+91 99999 88888';
          let channel = 'WhatsApp';
          let status = 'Delivered';

          if (n.title && n.title.includes(' | ')) {
            const parts = n.title.split(' | ');
            name = parts[0] || name;
            type = parts[1] || type;
            phone = parts[2] || phone;
            channel = parts[3] || channel;
            status = parts[4] || status;
          } else {
            name = n.title || name;
            const msg = n.message || '';
            if (msg.includes('OTP')) type = 'OTP for Handover';
            else if (msg.includes('parked')) type = 'Vehicle Received';
            else if (msg.includes('entrance')) type = 'Ready for Pickup';
          }

          // Compute human-friendly relative time
          const timeDiff = Date.now() - new Date(n.created_at).getTime();
          const mins = Math.floor(timeDiff / 60000);
          let timeStr = 'Just now';
          if (mins > 0 && mins < 60) timeStr = `${mins} min ago`;
          else if (mins >= 60) timeStr = `${Math.floor(mins / 60)}h ago`;

          return {
            id: n.id,
            name,
            phone,
            type,
            channel,
            status,
            time: timeStr
          };
        });
        setDbMessages(mapped);
      }
    } catch (e) {
      console.error('Error fetching messages from DB:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMessages();
  }, [locationId]);

  const handleSeedMessages = async () => {
    setLoading(true);
    try {
      await supabase.from('notifications').delete().eq('location_id', locationId);

      const payload = initialMessages.map(m => {
        let messageText = '';
        if (m.type === 'Vehicle Received') {
          messageText = `Hi ${m.name}, your BMW X5 - Black is securely parked. Token: #1024. Track at valetpro.in/t/1024`;
        } else if (m.type === 'OTP for Handover') {
          messageText = `Your Valet Pro pickup OTP is 5829. Valid 5 min. Share only with staff.`;
        } else if (m.type === 'Ready for Pickup') {
          messageText = `Your Audi A6 - White is being brought to the entrance. ETA: 5 mins.`;
        } else {
          messageText = `Hi ${m.name}, a phone was found in your vehicle. Reply YES to confirm if you want us to keep it at the front desk.`;
        }

        return {
          location_id: locationId,
          title: `${m.name} | ${m.type} | ${m.phone} | ${m.channel} | ${m.status}`,
          message: messageText,
          is_read: m.status === 'Read'
        };
      });

      const { error } = await supabase.from('notifications').insert(payload);
      if (error) throw error;
      fetchMessages();
      showToastMsg('Demo messages seeded successfully!');
    } catch (err) {
      console.error('Error seeding messages:', err);
      alert('Failed to seed messages.');
      setLoading(false);
    }
  };

  const handleClearMessages = async () => {
    setLoading(true);
    try {
      await supabase.from('notifications').delete().eq('location_id', locationId);
      setDbMessages([]);
      showToastMsg('Database messages cleared.');
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleTemplate = (id) => {
    setTemplates(prev => prev.map(t => {
      if (t.id === id) {
        const nextState = !t.active;
        showToastMsg(`Template "${t.name}" ${nextState ? 'enabled' : 'disabled'}`);
        return { ...t, active: nextState };
      }
      return t;
    }));
  };

  const handleComposeSubmit = async (e) => {
    e.preventDefault();
    if (!composeForm.name.trim() || !composeForm.phone.trim() || !composeForm.text.trim()) return;

    setIsSending(true);
    try {
      const payload = {
        location_id: locationId,
        title: `${composeForm.name} | Custom Message | ${composeForm.phone} | ${composeForm.channel} | Delivered`,
        message: composeForm.text,
        is_read: false
      };

      const { error } = await supabase.from('notifications').insert([payload]);
      if (error) throw error;

      setShowComposeModal(false);
      setComposeForm({ name: '', phone: '', channel: 'WhatsApp', text: '' });
      fetchMessages();
      showToastMsg(`Message sent to ${composeForm.name} successfully!`);
    } catch (err) {
      console.error(err);
      alert('Failed to send message.');
    } finally {
      setIsSending(false);
    }
  };

  const handleTemplateSubmit = (e) => {
    e.preventDefault();
    if (!newTemplate.name.trim() || !newTemplate.text.trim()) return;

    const created = {
      id: `t-${Date.now()}`,
      name: newTemplate.name,
      channel: newTemplate.channel,
      trigger: newTemplate.trigger,
      text: newTemplate.text,
      active: true
    };

    setTemplates(prev => [...prev, created]);
    setShowTemplateModal(false);
    setNewTemplate({ name: '', channel: 'WhatsApp', trigger: 'MANUAL', text: '' });
    showToastMsg(`Template "${created.name}" created!`);
  };

  const handleTemplateTextChange = (id, newText) => {
    setTemplates(prev => prev.map(t => {
      if (t.id === id) {
        return { ...t, text: newText };
      }
      return t;
    }));
  };

  const activeMessages = dbMessages.length > 0 ? dbMessages : initialMessages;
  const sentCount = 247 + dbMessages.length;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', width: '100%' }}>
      
      {/* Title Header Section */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.85rem', fontWeight: '800', color: 'var(--text-main)', marginBottom: '0.25rem' }}>Messaging Center</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', fontWeight: '500' }}>
            Automated SMS & WhatsApp for every milestone
          </p>
        </div>
        <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
          {dbMessages.length === 0 && (
            <button
              onClick={handleSeedMessages}
              disabled={loading}
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
              {loading ? 'Seeding...' : 'Seed Demo Data'}
            </button>
          )}
          <button
            onClick={() => setShowComposeModal(true)}
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
            <Send size={15} />
            <span>Compose</span>
          </button>
        </div>
      </div>

      {/* Metrics Row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem' }}>
        
        {/* Sent Today */}
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
              Sent Today
            </span>
            <span style={{ fontSize: '1.85rem', fontWeight: '800', color: 'var(--text-main)' }}>
              {sentCount}
            </span>
          </div>
          <div style={{ color: 'var(--text-muted)', opacity: 0.7 }}><Send size={18} /></div>
        </div>

        {/* Delivery Rate */}
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
              Delivery Rate
            </span>
            <span style={{ fontSize: '1.85rem', fontWeight: '800', color: '#10b981' }}>
              98.4%
            </span>
          </div>
          <div style={{ color: '#10b981', opacity: 0.8 }}><CheckCheck size={18} /></div>
        </div>

        {/* Response Rate */}
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
              Response Rate
            </span>
            <span style={{ fontSize: '1.85rem', fontWeight: '800', color: 'var(--text-main)' }}>
              64%
            </span>
          </div>
          <div style={{ color: 'var(--text-muted)', opacity: 0.7 }}><MessageSquare size={18} /></div>
        </div>

        {/* Active Templates */}
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
              Active Templates
            </span>
            <span style={{ fontSize: '1.85rem', fontWeight: '800', color: 'var(--text-main)' }}>
              {templates.filter(t => t.active).length}
            </span>
          </div>
          <div style={{ color: 'var(--text-muted)', opacity: 0.7 }}><Zap size={18} /></div>
        </div>

      </div>

      {/* Main Grid Panel Split */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: '1.4fr 1fr',
        gap: '1.5rem',
        alignItems: 'flex-start',
        width: '100%'
      }}>
        
        {/* Left Column: Automated Templates */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h2 style={{ fontSize: '1.1rem', fontWeight: '800', color: 'var(--text-main)' }}>Automated Templates</h2>
            <button
              onClick={() => setShowTemplateModal(true)}
              style={{
                fontSize: '0.75rem',
                fontWeight: '700',
                color: '#fbbf24',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '0.25rem'
              }}
            >
              <Plus size={14} />
              <span>New</span>
            </button>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {templates.map((t) => (
              <div 
                key={t.id}
                style={{
                  backgroundColor: 'var(--bg-card)',
                  border: '1px solid var(--border-color)',
                  borderRadius: '12px',
                  padding: '1.25rem',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.65rem'
                }}
              >
                {/* Header elements inside template card */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <span style={{ fontSize: '0.9rem', fontWeight: '700', color: 'var(--text-main)' }}>{t.name}</span>
                    <span style={{
                      padding: '0.15rem 0.45rem',
                      borderRadius: '4px',
                      fontSize: '0.6rem',
                      fontWeight: '700',
                      backgroundColor: t.channel === 'WhatsApp' ? 'rgba(16, 185, 129, 0.08)' : 'rgba(59, 130, 246, 0.08)',
                      color: t.channel === 'WhatsApp' ? '#10b981' : '#3b82f6',
                      border: t.channel === 'WhatsApp' ? '1px solid rgba(16, 185, 129, 0.15)' : '1px solid rgba(59, 130, 246, 0.15)'
                    }}>
                      {t.channel}
                    </span>
                  </div>

                  {/* iOS Style Custom Toggle Switch */}
                  <div 
                    onClick={() => handleToggleTemplate(t.id)}
                    style={{
                      width: '42px',
                      height: '24px',
                      borderRadius: '100px',
                      backgroundColor: t.active ? 'var(--accent)' : 'var(--bg-toggle-inactive)',
                      border: t.active ? '1px solid var(--accent)' : '1px solid var(--border-color)',
                      padding: '2px',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: t.active ? 'flex-end' : 'flex-start',
                      transition: 'all 0.2s ease-in-out'
                    }}
                  >
                    <div style={{
                      width: '18px',
                      height: '18px',
                      borderRadius: '50%',
                      backgroundColor: t.active ? 'var(--accent-text)' : '#64748b',
                      transition: 'all 0.2s ease-in-out'
                    }} />
                  </div>
                </div>

                {/* Trigger description text */}
                <span style={{ fontSize: '0.65rem', fontWeight: '700', color: 'var(--text-muted)', letterSpacing: '0.04em' }}>
                  TRIGGER: {t.trigger}
                </span>

                {/* Editable Mono Text Area */}
                <textarea
                  value={t.text}
                  onChange={(e) => handleTemplateTextChange(t.id, e.target.value)}
                  style={{
                    backgroundColor: '#111726',
                    border: '1px solid var(--border-color)',
                    borderRadius: '8px',
                    color: '#ffffff',
                    fontFamily: 'monospace',
                    fontSize: '0.8rem',
                    padding: '0.75rem',
                    resize: 'vertical',
                    minHeight: '60px',
                    width: '100%',
                    outline: 'none',
                    lineHeight: '1.4'
                  }}
                />
              </div>
            ))}
          </div>
        </div>

        {/* Right Column: Recent Messages */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <h2 style={{ fontSize: '1.1rem', fontWeight: '800', color: 'var(--text-main)' }}>Recent Messages</h2>

          <div style={{
            backgroundColor: 'var(--bg-card)',
            border: '1px solid var(--border-color)',
            borderRadius: '12px',
            padding: '0.5rem',
            display: 'flex',
            flexDirection: 'column'
          }}>
            {activeMessages.map((m, index) => {
              const isLast = index === activeMessages.length - 1;
              return (
                <div 
                  key={m.id}
                  style={{
                    padding: '1rem',
                    borderBottom: isLast ? 'none' : '1px solid var(--border-color)',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    gap: '0.75rem'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    {/* Icon indicator */}
                    <div style={{
                      width: '36px',
                      height: '36px',
                      borderRadius: '8px',
                      backgroundColor: m.channel === 'WhatsApp' ? 'rgba(16, 185, 129, 0.08)' : 'rgba(59, 130, 246, 0.08)',
                      color: m.channel === 'WhatsApp' ? '#10b981' : '#3b82f6',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0
                    }}>
                      {m.channel === 'WhatsApp' ? <MessageSquare size={16} /> : <Smartphone size={16} />}
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                      <span style={{ fontSize: '0.85rem', fontWeight: '800', color: 'var(--text-main)' }}>{m.name}</span>
                      <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '0.15rem' }}>
                        {m.type} · {m.phone}
                      </span>
                    </div>
                  </div>

                  {/* Status elements on the right */}
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '0.15rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', fontSize: '0.7rem', fontWeight: '700' }}>
                      {m.status === 'Read' ? (
                        <>
                          <CheckCheck size={13} style={{ color: '#3b82f6' }} />
                          <span style={{ color: '#3b82f6' }}>Read</span>
                        </>
                      ) : m.status === 'Delivered' ? (
                        <>
                          <Check size={13} style={{ color: '#10b981' }} />
                          <span style={{ color: '#10b981' }}>Delivered</span>
                        </>
                      ) : (
                        <>
                          <Clock size={13} style={{ color: '#fb923c' }} />
                          <span style={{ color: '#fb923c' }}>Pending</span>
                        </>
                      )}
                    </div>
                    <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>{m.time}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

      </div>

      {/* Compose Custom Message Modal Overlay */}
      {showComposeModal && (
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
            width: '420px',
            maxWidth: '90%',
            display: 'flex',
            flexDirection: 'column',
            gap: '1.25rem',
            boxShadow: '0 20px 40px rgba(0,0,0,0.5)'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 style={{ fontSize: '1.1rem', fontWeight: '800', color: 'var(--text-main)' }}>Compose Message</h3>
              <button 
                onClick={() => setShowComposeModal(false)}
                style={{ backgroundColor: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleComposeSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                <label style={{ fontSize: '0.65rem', fontWeight: '700', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Guest Name *</label>
                <input
                  type="text"
                  required
                  value={composeForm.name}
                  onChange={(e) => setComposeForm(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="e.g. Rajesh Kumar"
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

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                <label style={{ fontSize: '0.65rem', fontWeight: '700', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Phone Number *</label>
                <input
                  type="text"
                  required
                  value={composeForm.phone}
                  onChange={(e) => setComposeForm(prev => ({ ...prev, phone: e.target.value }))}
                  placeholder="e.g. +91 98765 43210"
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

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                <label style={{ fontSize: '0.65rem', fontWeight: '700', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Messaging Channel</label>
                <select
                  value={composeForm.channel}
                  onChange={(e) => setComposeForm(prev => ({ ...prev, channel: e.target.value }))}
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
                >
                  <option value="WhatsApp">WhatsApp</option>
                  <option value="SMS">SMS</option>
                </select>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                <label style={{ fontSize: '0.65rem', fontWeight: '700', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Message Body *</label>
                <textarea
                  required
                  rows="3"
                  value={composeForm.text}
                  onChange={(e) => setComposeForm(prev => ({ ...prev, text: e.target.value }))}
                  placeholder="Type your message text here..."
                  style={{
                    padding: '0.55rem 0.85rem',
                    borderRadius: '8px',
                    border: '1px solid var(--border-color)',
                    backgroundColor: 'var(--bg-subtle)',
                    color: 'var(--text-main)',
                    fontSize: '0.8rem',
                    outline: 'none',
                    width: '100%',
                    resize: 'none'
                  }}
                />
              </div>

              <button
                type="submit"
                disabled={isSending}
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
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.5rem',
                  boxShadow: '0 4px 15px var(--accent-shadow)'
                }}
              >
                {isSending && <Loader2 size={14} className="animate-spin" />}
                <span>Send Message</span>
              </button>

            </form>
          </div>
        </div>
      )}

      {/* New Template Modal Overlay */}
      {showTemplateModal && (
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
            width: '420px',
            maxWidth: '90%',
            display: 'flex',
            flexDirection: 'column',
            gap: '1.25rem',
            boxShadow: '0 20px 40px rgba(0,0,0,0.5)'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 style={{ fontSize: '1.1rem', fontWeight: '800', color: 'var(--text-main)' }}>Create Template</h3>
              <button 
                onClick={() => setShowTemplateModal(false)}
                style={{ backgroundColor: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleTemplateSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                <label style={{ fontSize: '0.65rem', fontWeight: '700', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Template Name *</label>
                <input
                  type="text"
                  required
                  value={newTemplate.name}
                  onChange={(e) => setNewTemplate(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="e.g. Check-out greeting"
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

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                <label style={{ fontSize: '0.65rem', fontWeight: '700', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Channel Type</label>
                <select
                  value={newTemplate.channel}
                  onChange={(e) => setNewTemplate(prev => ({ ...prev, channel: e.target.value }))}
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
                >
                  <option value="WhatsApp">WhatsApp</option>
                  <option value="SMS">SMS</option>
                </select>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                <label style={{ fontSize: '0.65rem', fontWeight: '700', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Trigger Stage</label>
                <select
                  value={newTemplate.trigger}
                  onChange={(e) => setNewTemplate(prev => ({ ...prev, trigger: e.target.value }))}
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
                >
                  <option value="ON CHECK-IN">ON CHECK-IN</option>
                  <option value="ON RETURN REQUEST">ON RETURN REQUEST</option>
                  <option value="ON REQUEST RETURN">ON REQUEST RETURN</option>
                  <option value="AFTER HANDOVER">AFTER HANDOVER</option>
                  <option value="MANUAL">MANUAL</option>
                </select>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                <label style={{ fontSize: '0.65rem', fontWeight: '700', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Template Text *</label>
                <textarea
                  required
                  rows="3"
                  value={newTemplate.text}
                  onChange={(e) => setNewTemplate(prev => ({ ...prev, text: e.target.value }))}
                  placeholder="e.g. Hi {name}, thanks for visiting!"
                  style={{
                    padding: '0.55rem 0.85rem',
                    borderRadius: '8px',
                    border: '1px solid var(--border-color)',
                    backgroundColor: 'var(--bg-subtle)',
                    color: 'var(--text-main)',
                    fontSize: '0.8rem',
                    outline: 'none',
                    width: '100%',
                    resize: 'none'
                  }}
                />
              </div>

              <button
                type="submit"
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
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.5rem',
                  boxShadow: '0 4px 15px var(--accent-shadow)'
                }}
              >
                <span>Create Template</span>
              </button>

            </form>
          </div>
        </div>
      )}

      {/* Floated Warning/Toast Indicator */}
      {toast && (
        <div style={{
          position: 'fixed',
          bottom: '2rem',
          left: '50%',
          transform: 'translateX(-50%)',
          backgroundColor: '#111726',
          border: '1px solid #fbbf24',
          color: '#ffffff',
          padding: '0.75rem 1.5rem',
          borderRadius: '12px',
          zIndex: 999999,
          boxShadow: '0 10px 25px -5px rgba(0,0,0,0.5)',
          fontSize: '0.85rem',
          fontWeight: '600'
        }}>
          ★ {toast}
        </div>
      )}

    </div>
  );
};

export default Messaging;
