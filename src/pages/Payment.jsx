import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  CreditCard, 
  ShieldCheck, 
  Check, 
  Globe, 
  CreditCard as CardIcon,
  Smartphone,
  ArrowRight,
  CheckCircle2,
  Lock,
  QrCode,
  Info
} from 'lucide-react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabase';
import GlassCard from '../components/ui/GlassCard';
import Logo from '../components/ui/Logo';
import Button from '../components/ui/Button';
import { useLocale } from '../context/LocaleContext';
import { formatCurrency } from '../lib/utils';
import heroBg from '../assets/hero-bg.png';

const Payment = () => {
  const [searchParams] = useSearchParams();
  const plan = searchParams.get('plan') || 'starter';
  const navigate = useNavigate();
  const { signUp } = useAuth();
  const { currentCountry, platformSettings } = useLocale();
  
  React.useEffect(() => {
    const signupData = sessionStorage.getItem('pending_signup');
    if (!signupData) {
      navigate('/signup');
    }
  }, [navigate]);

  const [method, setMethod] = useState('card');
  const [isProcessing, setIsProcessing] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [error, setError] = useState('');

  // Form State
  const [cardName, setCardName] = useState('');
  const [cardNumber, setCardNumber] = useState('');
  const [expiry, setExpiry] = useState('');
  const [cvv, setCvv] = useState('');
  const [upiId, setUpiId] = useState('');

  const plans = {
    starter: { 
      name: 'Starter', 
      price: formatCurrency(platformSettings.pricing_starter, currentCountry), 
      amount: platformSettings.pricing_starter 
    },
    pro: { 
      name: 'Pro', 
      price: formatCurrency(platformSettings.pricing_pro, currentCountry), 
      amount: platformSettings.pricing_pro 
    },
    enterprise: { name: 'Enterprise', price: 'Custom', amount: 0 }
  };

  const selectedPlan = plans[plan.toLowerCase()] || plans.starter;
  
  const handlePayment = async () => {
    // Basic Validation
    if (method === 'card' && (!cardName || !cardNumber || !expiry || !cvv)) {
      setError('Please fill in all card details');
      return;
    }
    if (method === 'upi' && !upiId) {
      setError('Please enter your UPI ID');
      return;
    }

    setIsProcessing(true);
    setError('');

    try {
      // 1. Get pending signup data from sessionStorage
      const signupDataRaw = sessionStorage.getItem('pending_signup');
      if (!signupDataRaw) {
        throw new Error('Registration session expired. Please start the signup process again.');
      }
      const signupData = JSON.parse(signupDataRaw);

      // 2. Create the user in Supabase Auth
      const { data: authData, error: authError } = await signUp(signupData.email, signupData.password, {
        full_name: signupData.fullName,
        role: 'valet',
        plan: selectedPlan.name
      });

      if (authError) throw authError;

      if (authData.user) {
        let newLocationId = null;

        // 3. Create the location record via RPC (Security Definer) if locations list is provided
        if (signupData.locationsList && signupData.locationsList.length > 0 && signupData.locationsList.some(l => l.hotelName)) {
          const { data: createdLocationId, error: locationError } = await supabase.rpc(
            'setup_multi_locations',
            {
              p_user_id:   authData.user.id,
              p_locations: signupData.locationsList.filter(l => l.hotelName && l.companyName)
            }
          );

          if (locationError) {
            console.error('Location creation error:', locationError);
            throw new Error('Payment was successful but location setup failed. Please contact support.');
          }
          
          newLocationId = createdLocationId;
        }

        // 4. Record the payment in the database
        const { error: paymentError } = await supabase.from('payments').insert([{
          location_id: newLocationId,
          amount: selectedPlan.amount,
          plan: selectedPlan.name,
          payment_method: method,
          status: 'completed',
          metadata: {
            card_holder: cardName,
            upi_id: upiId,
            timestamp: new Date().toISOString()
          }
        }]);

        if (paymentError) console.warn('Payment record failed:', paymentError);

        // 5. Activate the location subscription
        if (newLocationId) {
          await supabase.from('locations').update({
            subscription_status: 'active',
            selected_plan: selectedPlan.name,
            last_payment_at: new Date().toISOString()
          }).eq('id', newLocationId);
        }

        // 6. Finalize user metadata for instant dashboard access
        await supabase.auth.updateUser({
          data: { 
            location_id: newLocationId,
            role: 'valet',
            subscription_status: 'active',
            payment_completed: true 
          }
        });

        // 7. Success! Clear session storage and show success state
        sessionStorage.removeItem('pending_signup');

        setTimeout(() => {
          setIsProcessing(false);
          setShowSuccess(true);
          setTimeout(() => {
            navigate('/valet');
          }, 3500);
        }, 2000);
      }
    } catch (err) {
      console.error('Transaction flow failed:', err);
      setError(err.message || 'Payment processing failed. Please try again.');
      setIsProcessing(false);
    }
  };

  return (
    <div style={{ 
      minHeight: '100vh', 
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'center', 
      backgroundImage: `linear-gradient(to bottom, rgba(2, 6, 23, 0.85) 0%, rgba(2, 6, 23, 0.98) 100%), url(${heroBg})`,
      backgroundSize: 'cover',
      backgroundPosition: 'center',
      padding: '2rem'
    }}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        style={{ width: '100%', maxWidth: '960px' }}
      >
        <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
          <h1 style={{ fontSize: '2.5rem', fontWeight: '900', color: 'white', marginBottom: '0.5rem' }}>Secure Checkout</h1>
          <p style={{ color: 'var(--slate-400)' }}>Complete your registration for the {selectedPlan.name} plan</p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: '2rem' }}>
          <GlassCard style={{ padding: '2rem', backgroundColor: 'rgba(2, 6, 23, 0.4)', border: '1px solid rgba(255,255,255,0.1)' }}>
            <h3 style={{ fontSize: '1.25rem', fontWeight: '800', color: 'white', marginBottom: '2rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <ShieldCheck size={24} color="var(--blue-500)" />
              Payment Method
            </h3>

            {error && (
              <div style={{ padding: '0.75rem', borderRadius: '8px', backgroundColor: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', fontSize: '0.875rem', border: '1px solid rgba(239, 68, 68, 0.2)', marginBottom: '1.5rem' }}>
                {error}
              </div>
            )}

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div 
                onClick={() => setMethod('card')}
                style={{ 
                  padding: '1.25rem', 
                  borderRadius: '16px', 
                  backgroundColor: method === 'card' ? 'rgba(37, 99, 235, 0.15)' : 'rgba(255,255,255,0.02)', 
                  border: method === 'card' ? '2px solid var(--blue-500)' : '1px solid rgba(255,255,255,0.05)',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '1.25rem',
                  transition: 'all 0.2s ease'
                }}
              >
                <div style={{ width: '48px', height: '48px', borderRadius: '12px', backgroundColor: 'rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <CardIcon size={24} color={method === 'card' ? 'var(--blue-500)' : 'var(--slate-400)'} />
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ color: 'white', fontWeight: '700' }}>Credit / Debit Card</div>
                  <div style={{ color: 'var(--slate-400)', fontSize: '0.8rem' }}>Supports International Payments</div>
                </div>
                {method === 'card' && <Check size={20} color="var(--blue-500)" />}
              </div>

              <div 
                onClick={() => setMethod('upi')}
                style={{ 
                  padding: '1.25rem', 
                  borderRadius: '16px', 
                  backgroundColor: method === 'upi' ? 'rgba(245, 158, 11, 0.15)' : 'rgba(255,255,255,0.02)', 
                  border: method === 'upi' ? '2px solid var(--amber-gold)' : '1px solid rgba(255,255,255,0.05)',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '1.25rem',
                  transition: 'all 0.2s ease'
                }}
              >
                <div style={{ width: '48px', height: '48px', borderRadius: '12px', backgroundColor: 'rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Smartphone size={24} color={method === 'upi' ? 'var(--amber-gold)' : 'var(--slate-400)'} />
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ color: 'white', fontWeight: '700' }}>UPI / Net Banking</div>
                  <div style={{ color: 'var(--slate-400)', fontSize: '0.8rem' }}>Optimized for Indian Venues</div>
                </div>
                {method === 'upi' && <Check size={20} color="var(--amber-gold)" />}
              </div>

              <div 
                onClick={() => setMethod('paypal')}
                style={{ 
                  padding: '1.25rem', 
                  borderRadius: '16px', 
                  backgroundColor: method === 'paypal' ? 'rgba(56, 189, 248, 0.15)' : 'rgba(255,255,255,0.02)', 
                  border: method === 'paypal' ? '2px solid #38bdf8' : '1px solid rgba(255,255,255,0.05)',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '1.25rem',
                  transition: 'all 0.2s ease'
                }}
              >
                <div style={{ width: '48px', height: '48px', borderRadius: '12px', backgroundColor: 'rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Globe size={24} color={method === 'paypal' ? '#38bdf8' : 'var(--slate-400)'} />
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ color: 'white', fontWeight: '700' }}>Global Express Pay</div>
                  <div style={{ color: 'var(--slate-400)', fontSize: '0.8rem' }}>Seamless cross-border billing</div>
                </div>
                {method === 'paypal' && <Check size={20} color="#38bdf8" />}
              </div>
            </div>

            <div style={{ marginTop: '2.5rem' }}>
              <AnimatePresence mode="wait">
                {method === 'card' && (
                  <motion.div
                    key="card"
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                  >
                    <label style={{ display: 'block', color: 'white', fontSize: '0.85rem', fontWeight: '600', marginBottom: '0.75rem' }}>Cardholder Name</label>
                    <input 
                      type="text" 
                      value={cardName}
                      onChange={(e) => setCardName(e.target.value)}
                      placeholder="Name as on card"
                      style={{ width: '100%', padding: '0.85rem 1rem', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.1)', backgroundColor: 'rgba(255,255,255,0.03)', color: 'white', outline: 'none', marginBottom: '1.5rem' }} 
                    />
                    <label style={{ display: 'block', color: 'white', fontSize: '0.85rem', fontWeight: '600', marginBottom: '0.75rem' }}>Card Number</label>
                    <input 
                      type="text" 
                      value={cardNumber}
                      onChange={(e) => setCardNumber(e.target.value)}
                      placeholder="0000 0000 0000 0000"
                      style={{ width: '100%', padding: '0.85rem 1rem', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.1)', backgroundColor: 'rgba(255,255,255,0.03)', color: 'white', outline: 'none', marginBottom: '1.5rem' }} 
                    />
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                       <div>
                        <label style={{ display: 'block', color: 'white', fontSize: '0.85rem', fontWeight: '600', marginBottom: '0.75rem' }}>Expiry Date</label>
                        <input 
                          type="text" 
                          value={expiry}
                          onChange={(e) => setExpiry(e.target.value)}
                          placeholder="MM/YY" 
                          style={{ width: '100%', padding: '0.85rem 1rem', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.1)', backgroundColor: 'rgba(255,255,255,0.03)', color: 'white', outline: 'none' }} 
                        />
                      </div>
                      <div>
                        <label style={{ display: 'block', color: 'white', fontSize: '0.85rem', fontWeight: '600', marginBottom: '0.75rem' }}>CVV</label>
                        <input 
                          type="password" 
                          value={cvv}
                          onChange={(e) => setCvv(e.target.value)}
                          placeholder="•••" 
                          style={{ width: '100%', padding: '0.85rem 1rem', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.1)', backgroundColor: 'rgba(255,255,255,0.03)', color: 'white', outline: 'none' }} 
                        />
                      </div>
                    </div>
                  </motion.div>
                )}

                {method === 'upi' && (
                  <motion.div
                    key="upi"
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                  >
                    <div style={{ padding: '2rem', borderRadius: '20px', border: '1px dashed var(--amber-gold)', textAlign: 'center', marginBottom: '1.5rem', backgroundColor: 'rgba(245, 158, 11, 0.05)' }}>
                      <QrCode size={120} color="var(--amber-gold)" style={{ margin: '0 auto 1.5rem' }} />
                      <div style={{ color: 'white', fontWeight: '700', marginBottom: '0.5rem' }}>Scan QR to Pay</div>
                      <div style={{ color: 'var(--slate-400)', fontSize: '0.85rem' }}>Open any UPI app to complete the transaction</div>
                    </div>
                    <label style={{ display: 'block', color: 'white', fontSize: '0.85rem', fontWeight: '600', marginBottom: '0.75rem' }}>Or enter UPI ID</label>
                    <input 
                      type="text" 
                      value={upiId}
                      onChange={(e) => setUpiId(e.target.value)}
                      placeholder="username@upi"
                      style={{ width: '100%', padding: '0.85rem 1rem', borderRadius: '12px', border: '1px solid var(--amber-gold)', backgroundColor: 'rgba(245, 158, 11, 0.03)', color: 'white', outline: 'none' }} 
                    />
                  </motion.div>
                )}

                {method === 'paypal' && (
                  <motion.div
                    key="paypal"
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                  >
                    <div style={{ padding: '2rem', borderRadius: '20px', border: '1px solid rgba(56, 189, 248, 0.3)', backgroundColor: 'rgba(56, 189, 248, 0.05)', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem', textAlign: 'center' }}>
                      <Globe size={48} color="#38bdf8" />
                      <div style={{ color: 'white', fontWeight: '700' }}>Global Currency Support</div>
                      <div style={{ color: 'var(--slate-400)', fontSize: '0.85rem' }}>You will be redirected to our secure international payment gateway.</div>
                      <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', justifyContent: 'center' }}>
                         {['USD', 'EUR', 'GBP', 'AED'].map(curr => (
                           <span key={curr} style={{ padding: '4px 10px', borderRadius: '6px', backgroundColor: 'rgba(255,255,255,0.05)', color: 'var(--slate-300)', fontSize: '0.75rem', fontWeight: '700' }}>{curr}</span>
                         ))}
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </GlassCard>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <GlassCard style={{ padding: '2rem', backgroundColor: 'rgba(2, 6, 23, 0.4)', border: '1px solid rgba(255,255,255,0.1)' }}>
              <h3 style={{ fontSize: '1.1rem', fontWeight: '800', color: 'white', marginBottom: '1.5rem' }}>Order Summary</h3>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
                <span style={{ color: 'var(--slate-400)' }}>{selectedPlan.name} Plan</span>
                <span style={{ color: 'white', fontWeight: '600' }}>{selectedPlan.price}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
                <span style={{ color: 'var(--slate-400)' }}>Tax (GST/VAT)</span>
                <span style={{ color: 'white', fontWeight: '600' }}>{selectedPlan.name === 'Enterprise' ? '-' : formatCurrency(0, currentCountry)}</span>
              </div>
              <div style={{ height: '1px', backgroundColor: 'rgba(255,255,255,0.1)', margin: '1.5rem 0' }}></div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                <span style={{ color: 'white', fontWeight: '800', fontSize: '1.25rem' }}>Total Due</span>
                <span style={{ color: 'var(--blue-500)', fontWeight: '900', fontSize: '1.5rem' }}>{selectedPlan.price}</span>
              </div>
              <div style={{ display: 'flex', gap: '0.5rem', marginTop: '1.5rem', padding: '0.75rem', borderRadius: '10px', backgroundColor: 'rgba(37, 99, 235, 0.05)', border: '1px solid rgba(37, 99, 235, 0.1)' }}>
                <Info size={16} color="var(--blue-500)" style={{ flexShrink: 0 }} />
                <p style={{ color: 'var(--slate-400)', fontSize: '0.75rem', lineHeight: '1.4', margin: 0 }}>
                  Subscription will be billed annually. By paying, you agree to automatic renewal and our terms.
                </p>
              </div>
            </GlassCard>

            <Button 
              onClick={handlePayment}
              disabled={isProcessing}
              style={{ 
                width: '100%', 
                padding: '1.25rem', 
                borderRadius: '16px', 
                backgroundColor: 'var(--blue-500)', 
                color: 'white', 
                fontSize: '1.1rem', 
                fontWeight: '800',
                boxShadow: '0 20px 25px -5px rgba(37, 99, 235, 0.3)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '1rem'
              }}
            >
              {isProcessing ? 'Verifying Transaction...' : `Pay ${selectedPlan.price}`}
              {!isProcessing && <ArrowRight size={20} />}
            </Button>

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', color: 'var(--slate-500)', fontSize: '0.85rem' }}>
              <Lock size={14} />
              Bank-grade 256-bit SSL encrypted
            </div>
          </div>
        </div>
      </motion.div>

      {showSuccess && (
        <div style={{ 
          position: 'fixed', 
          inset: 0, 
          zIndex: 1000, 
          backgroundColor: 'rgba(0,0,0,0.8)', 
          backdropFilter: 'blur(12px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}>
          <motion.div 
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            style={{ 
              backgroundColor: 'var(--obsidian-black)', 
              padding: '4rem', 
              borderRadius: '32px', 
              textAlign: 'center', 
              border: '1px solid rgba(255,255,255,0.1)',
              maxWidth: '520px',
              width: '90%',
              boxShadow: '0 0 50px rgba(34, 197, 94, 0.15)'
            }}
          >
            <div style={{ width: '90px', height: '90px', borderRadius: '100px', backgroundColor: 'rgba(34, 197, 94, 0.1)', color: '#22c55e', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 2.5rem' }}>
              <CheckCircle2 size={56} />
            </div>
            <h2 style={{ fontSize: '2.25rem', fontWeight: '900', color: 'white', marginBottom: '1.25rem' }}>Payment Successful!</h2>
            <p style={{ color: 'var(--slate-400)', fontSize: '1.15rem', lineHeight: '1.7' }}>
              Welcome to the elite tier of Valet Parking. Your account has been activated and your dashboard is ready.
            </p>
            <div style={{ marginTop: '2.5rem', color: '#22c55e', fontWeight: '700', fontSize: '0.9rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
              <div style={{ width: '8px', height: '8px', borderRadius: '10px', backgroundColor: '#22c55e' }}></div>
              Redirecting to dashboard in a moment...
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default Payment;
