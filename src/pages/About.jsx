import React from 'react';
import { motion } from 'framer-motion';
import { Shield, Zap, Users, Globe } from 'lucide-react';
import Logo from '../components/ui/Logo';
import GlassCard from '../components/ui/GlassCard';
import Button from '../components/ui/Button';
import { useNavigate } from 'react-router-dom';
import heroBg from '../assets/hero-bg.png';

const About = () => {
  const navigate = useNavigate();

  return (
    <div style={{ 
      minHeight: '100vh', 
      backgroundColor: 'var(--obsidian-black)', 
      color: 'white',
      backgroundImage: `linear-gradient(to bottom, rgba(2, 6, 23, 0.9), rgba(2, 6, 23, 0.95)), url(${heroBg})`,
      backgroundSize: 'cover',
      backgroundPosition: 'center',
      padding: '4rem 5vw'
    }}>
      <header style={{ marginBottom: '4rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Logo size={40} />
        <Button variant="ghost" onClick={() => navigate('/')} style={{ color: 'white' }}>Back to Home</Button>
      </header>

      <main style={{ maxWidth: '1000px', margin: '0 auto' }}>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <h1 style={{ fontSize: 'clamp(2.5rem, 6vw, 4rem)', fontWeight: '900', marginBottom: '1.5rem', background: 'var(--text-gradient)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
            Elevating the Art of <br />
            <span style={{ color: 'var(--amber-gold)', WebkitTextFillColor: 'var(--amber-gold)' }}>Valet Parking.</span>
          </h1>
          <p style={{ fontSize: '1.25rem', color: 'var(--slate-400)', lineHeight: '1.7', marginBottom: '3rem', maxWidth: '800px' }}>
            Valet Parking is a next-generation digital platform designed for elite venues that demand perfection. 
            We replace outdated paper tickets with a seamless, real-time tracking experience that delights guests 
            and empowers management.
          </p>
        </motion.div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem', marginBottom: '6rem' }}>
          {[
            { icon: Shield, title: 'Security First', desc: 'Every vehicle movement is logged with photo evidence and digital timestamps for 100% accountability.' },
            { icon: Zap, title: 'Instant Speed', desc: 'Our real-time retrieval request system eliminates wait times and ensures a smooth guest exit.' },
            { icon: Users, title: 'Guest Focused', desc: 'No apps to download. Guests receive a link via SMS to track their vehicle and request retrieval.' },
            { icon: Globe, title: 'Global Scale', desc: 'Built to manage everything from boutique restaurants to multi-location international hotel chains.' }
          ].map((item, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: i * 0.1 }}
            >
              <GlassCard style={{ padding: '2rem', height: '100%' }}>
                <div style={{ color: 'var(--amber-gold)', marginBottom: '1rem' }}>
                  <item.icon size={32} />
                </div>
                <h3 style={{ fontSize: '1.25rem', fontWeight: '800', marginBottom: '0.75rem' }}>{item.title}</h3>
                <p style={{ color: 'var(--slate-400)', lineHeight: '1.6' }}>{item.desc}</p>
              </GlassCard>
            </motion.div>
          ))}
        </div>

        <section style={{ textAlign: 'center', padding: '6rem 2rem', borderRadius: '32px', backgroundColor: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)' }}>
          <h2 style={{ fontSize: '2.5rem', fontWeight: '800', marginBottom: '1.5rem' }}>Ready to transform your venue?</h2>
          <p style={{ color: 'var(--slate-400)', marginBottom: '2.5rem', fontSize: '1.1rem' }}>Join the hundreds of luxury establishments already using Valet Parking.</p>
          <Button variant="accent" onClick={() => navigate('/signup')} style={{ padding: '1rem 3rem', fontSize: '1.1rem', borderRadius: '100px' }}>
            Get Started Today
          </Button>
        </section>
      </main>

      <footer style={{ marginTop: '8rem', textAlign: 'center', color: 'var(--slate-600)', fontSize: '0.9rem' }}>
        © 2024 Valet Parking Technologies. All rights reserved.
      </footer>
    </div>
  );
};

export default About;
