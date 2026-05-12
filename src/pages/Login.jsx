import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Car, Lock, Mail, ArrowRight, Loader2, Eye, EyeOff } from 'lucide-react';
import { motion } from 'framer-motion';
import Button from '../components/ui/Button';
import Logo from '../components/ui/Logo';

import GlassCard from '../components/ui/GlassCard';
import { useAuth } from '../context/AuthContext';
import heroBg from '../assets/hero-bg.png';

const Login = () => {
  const [email, setEmail] = useState('admin@valetpro.com');
  const [password, setPassword] = useState('password123');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [showPassword, setShowPassword] = useState(false);
  const [isForgotPassword, setIsForgotPassword] = useState(false);
  const [isRecoveryMode, setIsRecoveryMode] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const navigate = useNavigate();
  const { signIn, resetPassword, updatePassword } = useAuth();

  useEffect(() => {
    // Check if we are in recovery mode (user clicked a reset link)
    const hash = window.location.hash;
    if (hash && hash.includes('type=recovery')) {
      setIsRecoveryMode(true);
    }
  }, []);

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
    if (role === 'admin') {
      navigate('/admin');
    } else {
      navigate('/valet');
    }
    setLoading(false);
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);

    const { error: resetError } = await resetPassword(email);
    
    if (resetError) {
      setError(resetError.message);
    } else {
      setSuccess('Password reset link has been sent to your email.');
    }
    setLoading(false);
  };

  const handleUpdatePassword = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);

    const { error: updateError } = await updatePassword(newPassword);
    
    if (updateError) {
      setError(updateError.message);
    } else {
      setSuccess('Password updated successfully! You can now sign in.');
      setIsRecoveryMode(false);
    }
    setLoading(false);
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
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        style={{ width: '100%', maxWidth: '440px' }}
      >
        <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '1.5rem' }}>
            <Logo size={80} showText={false} />
          </div>
          <h1 style={{ color: 'white', fontSize: '2rem', fontWeight: '800', marginBottom: '0.5rem' }}>
            {isRecoveryMode ? 'Update' : (isForgotPassword ? 'Reset' : 'Valet')}<span style={{ color: 'var(--accent)' }}> {isRecoveryMode ? 'Password' : (isForgotPassword ? 'Password' : 'Parking')}</span>
          </h1>


          <p style={{ color: 'var(--slate-400)', marginTop: '0.5rem' }}>
            {isRecoveryMode ? 'Choose a strong new password' : (isForgotPassword ? 'Enter your email to receive a reset link' : 'Digital Valet Management System')}
          </p>
        </div>

        <GlassCard style={{ padding: '2.5rem', border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(255,255,255,0.02)' }} hover={false}>
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

          {success && (
            <div style={{ 
              padding: '1rem', 
              backgroundColor: 'rgba(34, 197, 94, 0.1)', 
              border: '1px solid rgba(34, 197, 94, 0.2)', 
              borderRadius: '12px', 
              color: '#22c55e', 
              fontSize: '0.875rem', 
              marginBottom: '1.5rem',
              textAlign: 'center'
            }}>
              {success}
            </div>
          )}

          <form onSubmit={isRecoveryMode ? handleUpdatePassword : (isForgotPassword ? handleResetPassword : handleLogin)} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            {!isRecoveryMode && (
              <div>
                <label style={{ display: 'block', color: 'white', fontSize: '0.875rem', fontWeight: '600', marginBottom: '0.5rem' }}>Email Address</label>
                <div style={{ position: 'relative' }}>
                  <Mail size={18} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                  <input 
                    type="email" 
                    value={email}
                    required
                    disabled={loading}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@company.com" 
                    style={{ 
                      width: '100%', 
                      padding: '0.875rem 1rem 0.875rem 3rem', 
                      borderRadius: '12px', 
                      border: '1px solid var(--border-color)',
                      backgroundColor: 'rgba(255,255,255,0.05)',
                      color: 'white',
                      outline: 'none',
                      opacity: loading ? 0.7 : 1
                    }} 
                  />
                </div>
              </div>
            )}

            {(isRecoveryMode || (!isForgotPassword)) && (
              <div>
                <label style={{ display: 'block', color: 'white', fontSize: '0.875rem', fontWeight: '600', marginBottom: '0.5rem' }}>
                  {isRecoveryMode ? 'New Password' : 'Password'}
                </label>
                <div style={{ position: 'relative' }}>
                  <Lock size={18} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                  <input 
                    type={showPassword ? "text" : "password"} 
                    value={isRecoveryMode ? newPassword : password}
                    required
                    disabled={loading}
                    onChange={(e) => isRecoveryMode ? setNewPassword(e.target.value) : setPassword(e.target.value)}
                    placeholder="••••••••" 
                    style={{ 
                      width: '100%', 
                      padding: '0.875rem 3rem 0.875rem 3rem', 
                      borderRadius: '12px', 
                      border: '1px solid var(--border-color)',
                      backgroundColor: 'rgba(255,255,255,0.05)',
                      color: 'white',
                      outline: 'none',
                      opacity: loading ? 0.7 : 1
                    }} 
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    style={{ position: 'absolute', right: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>
            )}

            <Button 
              variant="primary" 
              type="submit" 
              disabled={loading} 
              style={{ 
                padding: '1rem', 
                fontSize: '1rem', 
                marginTop: '0.5rem',
                backgroundColor: 'var(--blue-500)',
                color: 'white',
                borderRadius: '12px'
              }}
            >
              {loading ? (
                <>
                  <Loader2 size={20} className="animate-spin" />
                  <span>{isRecoveryMode ? 'Updating...' : (isForgotPassword ? 'Sending...' : 'Signing In...')}</span>
                </>
              ) : (
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.75rem', width: '100%' }}>
                  <span style={{ lineHeight: '1' }}>
                    {isRecoveryMode ? 'Update Password' : (isForgotPassword ? 'Send Reset Link' : 'Sign In to Dashboard')}
                  </span>
                  <ArrowRight size={20} style={{ display: 'block' }} />
                </div>
              )}
            </Button>

            {!isRecoveryMode && (
              <div style={{ textAlign: 'center' }}>
                <button 
                  type="button"
                  onClick={() => {
                    setIsForgotPassword(!isForgotPassword);
                    setError(null);
                    setSuccess(null);
                  }}
                  style={{ fontSize: '0.875rem', color: 'var(--primary)', fontWeight: '600', cursor: 'pointer' }}
                >
                  {isForgotPassword ? 'Back to Login' : 'Forgot password?'}
                </button>
              </div>
            )}
          </form>
        </GlassCard>

        <div style={{ textAlign: 'center', marginTop: '2.5rem', paddingTop: '1.5rem', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
          <p style={{ color: 'var(--slate-400)', fontSize: '0.875rem', marginBottom: '1rem' }}>
            New to Valet Parking?
          </p>
          <Button 
            variant="outline" 
            onClick={() => navigate('/signup')}
            style={{ width: '100%', borderRadius: '12px', borderColor: 'rgba(255,255,255,0.1)', color: 'white' }}
          >
            Register Your Location
          </Button>

        </div>
      </motion.div>
    </div>
  );
};

export default Login;
