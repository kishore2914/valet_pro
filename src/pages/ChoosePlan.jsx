import React from 'react';
import { motion } from 'framer-motion';
import { Check, ArrowRight, ArrowLeft } from 'lucide-react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import GlassCard from '../components/ui/GlassCard';
import Button from '../components/ui/Button';
import heroBg from '../assets/hero-bg.png';
import Logo from '../components/ui/Logo';

const ChoosePlan = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  
  React.useEffect(() => {
    const signupData = sessionStorage.getItem('pending_signup');
    if (!signupData) {
      navigate('/signup');
    }
  }, [navigate]);

  const plans = [
    { 
      tier: 'Starter', 
      price: '₹7,999', 
      desc: 'For small boutiques and restaurants.', 
      features: ['Up to 500 cars/mo', 'Digital SMS Tokens', 'Basic Analytics', 'Standard Support'] 
    },
    { 
      tier: 'Pro', 
      price: '₹14,999', 
      desc: 'For hotels and major shopping malls.', 
      featured: true,
      features: ['Unlimited cars/mo', 'Advanced Real-time Tracking', 'Custom Branding', 'Email & Chat Support'] 
    },
    { 
      tier: 'Enterprise', 
      price: 'Custom', 
      desc: 'For multi-venue hotel chains.', 
      features: ['Multi-tenant Management', 'API Access', 'White-label Mobile App', 'Dedicated Account Manager'] 
    },
  ];

  const handleSelectPlan = (planTier) => {
    navigate(`/payment?plan=${planTier.toLowerCase()}`);
  };

  return (
    <div style={{ 
      minHeight: '100vh', 
      display: 'flex', 
      flexDirection: 'column',
      alignItems: 'center', 
      backgroundImage: `linear-gradient(to bottom, rgba(2, 6, 23, 0.85) 0%, rgba(2, 6, 23, 0.98) 100%), url(${heroBg})`,
      backgroundSize: 'cover',
      backgroundPosition: 'center',
      padding: '4rem 2rem'
    }}>
      <div style={{ textAlign: 'center', marginBottom: '4rem' }}>
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '2rem' }}>
          <Logo size={60} showText={false} />
        </div>
        <h1 style={{ fontSize: '3rem', fontWeight: '900', color: 'white', marginBottom: '1rem' }}>
          Choose Your Plan
        </h1>
        <p style={{ color: 'var(--slate-400)', fontSize: '1.25rem', maxWidth: '600px', margin: '0 auto' }}>
          Select the perfect subscription for your venue's requirements.
        </p>
      </div>

      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', 
        gap: '2rem', 
        maxWidth: '1200px', 
        width: '100%',
        margin: '0 auto' 
      }}>
        {plans.map((plan, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            style={{ position: 'relative' }}
          >
            <GlassCard style={{ 
              height: '100%', 
              padding: '3rem 2rem', 
              border: plan.featured ? '2px solid var(--blue-500)' : '1px solid rgba(255,255,255,0.05)',
              backgroundColor: plan.featured ? 'rgba(37, 99, 235, 0.1)' : 'rgba(2, 6, 23, 0.4)',
              backdropFilter: 'blur(16px)',
              display: 'flex',
              flexDirection: 'column'
            }}>
              {plan.featured && (
                <div style={{ 
                  position: 'absolute', 
                  top: '-15px', 
                  left: '50%', 
                  transform: 'translateX(-50%)', 
                  backgroundColor: 'var(--blue-500)', 
                  color: 'white', 
                  padding: '4px 16px', 
                  borderRadius: '100px', 
                  fontSize: '0.75rem', 
                  fontWeight: '800',
                  textTransform: 'uppercase'
                }}>
                  Most Popular
                </div>
              )}
              <h3 style={{ fontSize: '1.5rem', fontWeight: '800', marginBottom: '0.5rem', color: 'white' }}>{plan.tier}</h3>
              <p style={{ color: 'var(--slate-400)', fontSize: '0.9rem', marginBottom: '2rem' }}>{plan.desc}</p>
              <div style={{ marginBottom: '2.5rem' }}>
                <span style={{ fontSize: '3rem', fontWeight: '800', color: 'white' }}>{plan.price}</span>
                {plan.price !== 'Custom' && <span style={{ color: 'var(--slate-500)' }}>/month</span>}
              </div>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '2.5rem', flex: 1 }}>
                {plan.features.map((feat, idx) => (
                  <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', fontSize: '0.95rem' }}>
                    <Check size={18} color="var(--blue-500)" />
                    <span style={{ color: 'var(--slate-300)' }}>{feat}</span>
                  </div>
                ))}
              </div>

              <Button 
                onClick={() => handleSelectPlan(plan.tier)}
                variant={plan.featured ? 'primary' : 'outline'} 
                style={{ 
                  width: '100%', 
                  borderRadius: '12px', 
                  padding: '1rem',
                  color: 'white',
                  borderColor: plan.featured ? 'transparent' : 'rgba(255,255,255,0.1)',
                  fontWeight: '700',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.75rem'
                }}
              >
                Choose {plan.tier}
                <ArrowRight size={18} />
              </Button>
            </GlassCard>
          </motion.div>
        ))}
      </div>

      <div style={{ marginTop: '4rem' }}>
        <Link 
          to="/signup" 
          style={{ 
            color: 'var(--slate-400)', 
            textDecoration: 'none', 
            display: 'flex', 
            alignItems: 'center', 
            gap: '0.5rem',
            fontWeight: '600',
            transition: 'color 0.2s'
          }}
          onMouseOver={e => e.target.style.color = 'white'}
          onMouseOut={e => e.target.style.color = 'var(--slate-400)'}
        >
          <ArrowLeft size={18} />
          Back to registration
        </Link>
      </div>
    </div>
  );
};

export default ChoosePlan;
