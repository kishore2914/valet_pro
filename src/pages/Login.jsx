import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Car, Lock, Mail, ArrowRight, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';
import Button from '../components/ui/Button';
import GlassCard from '../components/ui/GlassCard';
import { useAuth } from '../context/AuthContext';

const Login = () => {
  const [email, setEmail] = useState('admin@valetpro.com');
  const [password, setPassword] = useState('password123');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const { signIn } = useAuth();

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const { data, error: signInError } = await signIn(email, password);
    
    if (signInError) {
      setError(signInError.message);
      setLoading(false);
      return;
    }

    // Role-based redirect logic (determined by AuthContext session)
    const role = data.user.user_metadata?.role || 'valet';
    navigate(role === 'admin' ? '/admin' : '/valet');
    setLoading(false);
  };

  return (
    <div style={{ 
      minHeight: '100vh', 
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'center', 
      background: 'linear-gradient(135deg, var(--slate-950) 0%, var(--slate-900) 100%)',
      padding: '2rem'
    }}>
      <div className="ticks" style={{ position: 'fixed', inset: 0, opacity: 0.1 }}></div>
      
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        style={{ width: '100%', maxWidth: '440px' }}
      >
        <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
          <div style={{ 
            width: '64px', 
            height: '64px', 
            borderRadius: '16px', 
            backgroundColor: 'var(--primary)', 
            color: 'white', 
            display: 'inline-flex', 
            alignItems: 'center', 
            justifyContent: 'center',
            marginBottom: '1rem',
            boxShadow: '0 8px 16px rgba(37, 99, 235, 0.3)'
          }}>
            <Car size={32} />
          </div>
          <h1 style={{ color: 'white', fontSize: '2rem', fontWeight: '800' }}>
            Valet<span style={{ color: 'var(--accent)' }}>Pro</span>
          </h1>
          <p style={{ color: 'var(--slate-400)', marginTop: '0.5rem' }}>Digital Valet Management System</p>
        </div>

        <GlassCard style={{ padding: '2.5rem' }} hover={false}>
          {error && (
            <div style={{ 
              padding: '1rem', 
              backgroundColor: 'rgba(239, 68, 68, 0.1)', 
              border: '1px solid rgba(239, 68, 68, 0.2)', 
              borderRadius: '12px', 
              color: '#ef4444', 
              fontSize: '0.875rem', 
              marginBottom: '1.5rem',
              textAlign: 'center'
            }}>
              {error}
            </div>
          )}

          <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <div>
              <label style={{ display: 'block', color: 'var(--text-main)', fontSize: '0.875rem', fontWeight: '600', marginBottom: '0.5rem' }}>Email Address</label>
              <div style={{ position: 'relative' }}>
                <Mail size={18} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                <input 
                  type="email" 
                  value={email}
                  disabled={loading}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@company.com" 
                  style={{ 
                    width: '100%', 
                    padding: '0.875rem 1rem 0.875rem 3rem', 
                    borderRadius: '12px', 
                    border: '1px solid var(--border-color)',
                    backgroundColor: 'rgba(255,255,255,0.05)',
                    color: 'var(--text-main)',
                    outline: 'none',
                    opacity: loading ? 0.7 : 1
                  }} 
                />
              </div>
            </div>

            <div>
              <label style={{ display: 'block', color: 'var(--text-main)', fontSize: '0.875rem', fontWeight: '600', marginBottom: '0.5rem' }}>Password</label>
              <div style={{ position: 'relative' }}>
                <Lock size={18} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                <input 
                  type="password" 
                  value={password}
                  disabled={loading}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••" 
                  style={{ 
                    width: '100%', 
                    padding: '0.875rem 1rem 0.875rem 3rem', 
                    borderRadius: '12px', 
                    border: '1px solid var(--border-color)',
                    backgroundColor: 'rgba(255,255,255,0.05)',
                    color: 'var(--text-main)',
                    outline: 'none',
                    opacity: loading ? 0.7 : 1
                  }} 
                />
              </div>
            </div>

            <Button variant="primary" type="submit" disabled={loading} style={{ padding: '1rem', fontSize: '1rem', marginTop: '0.5rem' }}>
              {loading ? (
                <>
                  <Loader2 size={20} className="animate-spin" />
                  <span>Signing In...</span>
                </>
              ) : (
                <>
                  <span>Sign In to Dashboard</span>
                  <ArrowRight size={20} />
                </>
              )}
            </Button>

            <div style={{ textAlign: 'center' }}>
              <a href="#" style={{ fontSize: '0.875rem', color: 'var(--primary)', fontWeight: '600' }}>Forgot password?</a>
            </div>
          </form>
        </GlassCard>

        <div style={{ textAlign: 'center', marginTop: '2.5rem', paddingTop: '1.5rem', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
          <p style={{ color: 'var(--slate-400)', fontSize: '0.875rem', marginBottom: '1rem' }}>
            New to Valet Pro?
          </p>
          <Link to="/signup" style={{ textDecoration: 'none' }}>
            <Button variant="outline" style={{ width: '100%', borderRadius: '12px', borderColor: 'rgba(255,255,255,0.1)', color: 'white' }}>
              Register Your Location
            </Button>
          </Link>
        </div>
      </motion.div>
    </div>
  );
};

export default Login;
