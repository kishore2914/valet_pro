import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Car, 
  Lock, 
  Mail, 
  ArrowRight, 
  Loader2,
  Building2,
  MapPin,
  User,
  Eye,
  EyeOff
} from 'lucide-react';
import { useNavigate, Link, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabase';
import GlassCard from '../components/ui/GlassCard';
import Button from '../components/ui/Button';
import Logo from '../components/ui/Logo';

import heroBg from '../assets/hero-bg.png';

const Signup = () => {
  const [searchParams] = useSearchParams();
  const plan = searchParams.get('plan');
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [venueName, setVenueName] = useState('');
  const [location, setLocation] = useState('');
  
  // Admin fields
  const [isAdminMode, setIsAdminMode] = useState(false);
  const [adminCode, setAdminCode] = useState('');
  const [adminExists, setAdminExists] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showAdminCode, setShowAdminCode] = useState(false);

  useEffect(() => {
    const checkAdminStatus = async () => {
      try {
        // Check profiles table directly for any existing admin
        const { data: adminUser, error: adminError } = await supabase
          .from('profiles')
          .select('id')
          .eq('role', 'admin')
          .limit(1)
          .maybeSingle();

        if (!adminError && adminUser) {
          setAdminExists(true);
        }
      } catch (err) {
        console.error('Error checking admin status:', err);
      }
    };
    checkAdminStatus();
  }, []);
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { signUp } = useAuth();
  const navigate = useNavigate();

  const handleSignup = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // 1. Single Admin Enforcement Check
      if (isAdminMode) {
        if (adminCode !== 'ADMIN_VALET_PRO') {
          throw new Error('Invalid Admin Access Code');
        }

        // Check if an admin already exists in the system_config table
        const { data: config, error: configError } = await supabase
          .from('system_config')
          .select('value')
          .eq('key', 'super_admin_exists')
          .single();

        if (!configError && config?.value === true) {
          throw new Error('Platform Admin already registered. Only one Super Admin is allowed.');
        }
      }

      // 2. Sign up the user
      const { data: authData, error: authError } = await signUp(email, password, {
        full_name: fullName,
        role: isAdminMode ? 'admin' : 'valet'
      });

      if (authError) throw authError;

      if (authData.user) {
        if (isAdminMode) {
          // 3a. Initialize Super Admin status in DB
          await supabase.from('profiles').insert([{ 
            id: authData.user.id, 
            full_name: fullName, 
            email: email, 
            role: 'admin' 
          }]);

          const { error: updateError } = await supabase
            .from('system_config')
            .upsert({ key: 'super_admin_exists', value: true });

          if (updateError) {
            console.warn('System config update failed, but user was created:', updateError);
          }
          
          navigate('/admin');
        }
      }
    } catch (err) {
      setError(err.message || 'An error occurred during signup');
    } finally {
      setLoading(false);
    }
  };

  const handleNextStep = (e) => {
    e.preventDefault();
    setLoading(true);
    
    // Validate fields
    if (!email || !password || !fullName || !venueName || !location) {
      setError('Please fill in all fields');
      setLoading(false);
      return;
    }

    // Store signup data for later
    const signupData = {
      email,
      password,
      fullName,
      venueName,
      location,
      role: 'valet'
    };
    
    sessionStorage.setItem('pending_signup', JSON.stringify(signupData));
    
    // Navigate to next step
    if (plan) {
      navigate(`/payment?plan=${plan}`);
    } else {
      navigate('/choose-plan');
    }
  };

  return (
    <div style={{ 
      minHeight: '100vh', 
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'center', 
      backgroundImage: `linear-gradient(to bottom, rgba(2, 6, 23, 0.6) 0%, rgba(2, 6, 23, 0.8) 100%), url(${heroBg})`,
      backgroundSize: 'cover',
      backgroundPosition: 'center',
      padding: '2rem'
    }}>
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        style={{ width: '100%', maxWidth: '480px' }}
      >
        <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '1.5rem' }}>
            <Logo size={80} showText={false} />
          </div>

          <h1 style={{ fontSize: '2rem', fontWeight: '800', color: 'white', marginBottom: '0.5rem' }}>
            {isAdminMode ? 'Admin Registration' : 'Create Account'}
          </h1>
          {plan && !isAdminMode && (
            <div style={{ 
              display: 'inline-block', 
              padding: '4px 12px', 
              borderRadius: '100px', 
              backgroundColor: 'rgba(37, 99, 235, 0.2)', 
              color: 'var(--blue-500)', 
              fontSize: '0.75rem', 
              fontWeight: '800',
              textTransform: 'uppercase',
              marginBottom: '1rem',
              letterSpacing: '0.05em',
              border: '1px solid rgba(37, 99, 235, 0.3)'
            }}>
              Selected Plan: {plan}
            </div>
          )}
          <p style={{ color: 'var(--slate-400)' }}>
            {isAdminMode ? 'Claim the platform administrator account' : 'Join Valet Parking and start managing your location'}
          </p>
        </div>

        <GlassCard style={{ padding: '2.5rem', border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(255,255,255,0.02)' }}>
          <form onSubmit={isAdminMode ? handleSignup : handleNextStep} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            {error && (
              <div style={{ padding: '0.75rem', borderRadius: '8px', backgroundColor: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', fontSize: '0.875rem', border: '1px solid rgba(239, 68, 68, 0.2)' }}>
                {error}
              </div>
            )}

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
               <div>
                <label style={{ display: 'block', color: 'white', fontSize: '0.85rem', fontWeight: '600', marginBottom: '0.4rem' }}>Full Name</label>
                <div style={{ position: 'relative' }}>
                  <User size={16} style={{ position: 'absolute', left: '0.875rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--slate-500)' }} />
                  <input 
                    type="text" 
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="John Doe" 
                        style={{ width: '100%', padding: '0.7rem 0.75rem 0.7rem 2.5rem', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.1)', backgroundColor: 'rgba(255,255,255,0.05)', color: 'white', outline: 'none' }} 
                  />
                </div>
              </div>
              <div>
                <label style={{ display: 'block', color: 'white', fontSize: '0.85rem', fontWeight: '600', marginBottom: '0.4rem' }}>Email Address</label>
                <div style={{ position: 'relative' }}>
                  <Mail size={16} style={{ position: 'absolute', left: '0.875rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--slate-500)' }} />
                  <input 
                    type="email" 
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@company.com" 
                        style={{ width: '100%', padding: '0.7rem 0.75rem 0.7rem 2.5rem', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.1)', backgroundColor: 'rgba(255,255,255,0.05)', color: 'white', outline: 'none' }} 
                  />
                </div>
              </div>
            </div>

            <div>
              <label style={{ display: 'block', color: 'white', fontSize: '0.85rem', fontWeight: '600', marginBottom: '0.4rem' }}>Password</label>
              <div style={{ position: 'relative' }}>
                <Lock size={16} style={{ position: 'absolute', left: '0.875rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--slate-500)' }} />
                <input 
                  type={showPassword ? "text" : "password"} 
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••" 
                  style={{ width: '100%', padding: '0.7rem 2.5rem 0.7rem 2.5rem', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.1)', backgroundColor: 'rgba(255,255,255,0.03)', color: 'white', outline: 'none' }} 
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  style={{ position: 'absolute', right: '0.875rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--slate-500)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {!plan && !adminExists && (
              <div style={{ 
                padding: '1.25rem', 
                borderRadius: '12px', 
                background: isAdminMode ? 'rgba(245, 158, 11, 0.1)' : 'rgba(37, 99, 235, 0.08)', 
                border: isAdminMode ? '1px solid var(--amber-gold)' : '1px dashed rgba(37, 99, 235, 0.3)', 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'space-between',
                transition: 'all 0.3s ease'
              }}>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: '0.95rem', fontWeight: '800', color: isAdminMode ? 'var(--amber-gold)' : 'white', marginBottom: '0.2rem' }}>Platform Administrator?</div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--slate-300)', lineHeight: '1.4' }}>Enable for platform-wide oversight and management</div>
                </div>
                <div style={{ position: 'relative', width: '24px', height: '24px' }}>
                  <input 
                    type="checkbox" 
                    id="adminToggle"
                    checked={isAdminMode} 
                    onChange={(e) => setIsAdminMode(e.target.checked)}
                    style={{ width: '24px', height: '24px', cursor: 'pointer', opacity: 0, position: 'absolute', zIndex: 2 }}
                  />
                  <div style={{ 
                    width: '24px', 
                    height: '24px', 
                    borderRadius: '6px', 
                    backgroundColor: isAdminMode ? 'var(--amber-gold)' : 'rgba(255,255,255,0.1)',
                    border: '1px solid rgba(255,255,255,0.2)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'var(--obsidian-black)',
                    fontSize: '12px',
                    fontWeight: 'bold'
                  }}>
                    {isAdminMode && '✓'}
                  </div>
                </div>
              </div>
            )}

            <AnimatePresence mode="wait">
              {isAdminMode ? (
                <motion.div
                  key="admin"
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                >
                  <label style={{ display: 'block', color: 'var(--amber-gold)', fontSize: '0.85rem', fontWeight: '700', marginBottom: '0.5rem' }}>Secret Admin Access Code</label>
                  <div style={{ position: 'relative' }}>
                    <Lock size={16} style={{ position: 'absolute', left: '0.875rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--amber-gold)' }} />
                    <input 
                      type={showAdminCode ? "text" : "password"} 
                      required={isAdminMode}
                      value={adminCode}
                      onChange={(e) => setAdminCode(e.target.value)}
                      placeholder="Enter secret code" 
                      style={{ width: '100%', padding: '0.75rem 2.5rem 0.75rem 2.5rem', borderRadius: '10px', border: '1px solid var(--amber-gold)', backgroundColor: 'rgba(245, 158, 11, 0.03)', color: 'white', outline: 'none' }} 
                    />
                    <button
                      type="button"
                      onClick={() => setShowAdminCode(!showAdminCode)}
                      style={{ position: 'absolute', right: '0.875rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--amber-gold)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                    >
                      {showAdminCode ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </motion.div>
              ) : (
                <motion.div
                  key="valet"
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}
                >
                  <div style={{ height: '1px', backgroundColor: 'rgba(255,255,255,0.05)', margin: '0.2rem 0' }}></div>
                  <div>
                    <label style={{ display: 'block', color: 'white', fontSize: '0.85rem', fontWeight: '600', marginBottom: '0.4rem' }}>Location Name</label>
                    <div style={{ position: 'relative' }}>
                      <Building2 size={16} style={{ position: 'absolute', left: '0.875rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--slate-500)' }} />
                      <input 
                        type="text" 
                        required={!isAdminMode}
                        value={venueName}
                        onChange={(e) => setVenueName(e.target.value)}
                        placeholder="e.g. Grand Plaza Hotel" 
                            style={{ width: '100%', padding: '0.7rem 0.75rem 0.7rem 2.5rem', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.1)', backgroundColor: 'rgba(255,255,255,0.05)', color: 'white', outline: 'none' }} 
                      />
                    </div>
                  </div>
                  <div>
                    <label style={{ display: 'block', color: 'white', fontSize: '0.85rem', fontWeight: '600', marginBottom: '0.4rem' }}>Location</label>
                    <div style={{ position: 'relative' }}>
                      <MapPin size={16} style={{ position: 'absolute', left: '0.875rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--slate-500)' }} />
                      <input 
                        type="text" 
                        required={!isAdminMode}
                        value={location}
                        onChange={(e) => setLocation(e.target.value)}
                        placeholder="e.g. Dubai, UAE" 
                        style={{ width: '100%', padding: '0.7rem 0.75rem 0.7rem 2.5rem', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.1)', backgroundColor: 'rgba(255,255,255,0.03)', color: 'white', outline: 'none' }} 
                      />
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <Button 
              variant={isAdminMode ? 'accent' : 'primary'} 
              type="submit" 
              disabled={loading} 
              style={{ 
                padding: '1rem', 
                marginTop: '1rem', 
                borderRadius: '12px',
                backgroundColor: isAdminMode ? 'var(--amber-gold)' : 'var(--blue-500)',
                color: isAdminMode ? 'var(--obsidian-black)' : 'white'
               }}
            >
              {loading ? (
                <Loader2 size={20} className="animate-spin" />
              ) : (
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.75rem', width: '100%' }}>
                  <span style={{ lineHeight: '1' }}>{isAdminMode ? 'Register Platform Admin' : 'Next: Choose Plan'}</span>
                  <ArrowRight size={20} style={{ display: 'block' }} />
                </div>
              )}
            </Button>
          </form>
        </GlassCard>

        <p style={{ textAlign: 'center', marginTop: '2rem', color: 'var(--slate-400)', fontSize: '0.875rem' }}>
          Already have an account? <Link to="/login" style={{ color: 'var(--blue-500)', fontWeight: '700', textDecoration: 'none' }}>Sign In</Link>
        </p>
      </motion.div>
    </div>
  );
};

export default Signup;
