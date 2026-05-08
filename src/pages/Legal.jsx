import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import Logo from '../components/ui/Logo';
import Button from '../components/ui/Button';
import heroBg from '../assets/hero-bg.png';

const Legal = () => {
  const { type } = useParams();
  const navigate = useNavigate();

  const content = {
    'privacy-policy': {
      title: 'Privacy Policy',
      lastUpdated: 'May 2026',
      sections: [
        { title: '1. Information We Collect', text: 'We collect information you provide directly to us, such as when you create an account, register a venue, or contact support. This includes name, email, and venue location details.' },
        { title: '2. How We Use Information', text: 'We use the information we collect to operate, maintain, and provide the features of our platform, including digital vehicle tracking and reporting.' },
        { title: '3. Data Security', text: 'We implement industry-standard security measures to protect your data. However, no method of transmission over the internet is 100% secure.' }
      ]
    },
    'terms-of-service': {
      title: 'Terms of Service',
      lastUpdated: 'May 2026',
      sections: [
        { title: '1. Acceptance of Terms', text: 'By accessing or using Valet Parking, you agree to be bound by these Terms of Service and all applicable laws and regulations.' },
        { title: '2. Use License', text: 'Permission is granted to use our platform for your venue management. This is the grant of a license, not a transfer of title.' },
        { title: '3. Service Availability', text: 'We strive for 99.99% uptime but do not guarantee uninterrupted service due to maintenance or external factors.' }
      ]
    },
    'cookie-policy': {
      title: 'Cookie Policy',
      lastUpdated: 'May 2026',
      sections: [
        { title: '1. What are Cookies', text: 'Cookies are small text files stored on your device to help us recognize you and improve your experience.' },
        { title: '2. How We Use Cookies', text: 'We use essential cookies for authentication and security, and analytical cookies to understand how users interact with our platform.' },
        { title: '3. Managing Cookies', text: 'Most web browsers allow you to control cookies through their settings. Disabling essential cookies may impact platform functionality.' }
      ]
    }
  };

  const activeContent = content[type] || content['privacy-policy'];

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
        <Logo size={40} color="white" />
        <Button variant="ghost" onClick={() => navigate('/')} style={{ color: 'white' }}>Back to Home</Button>
      </header>

      <main style={{ maxWidth: '800px', margin: '0 auto' }}>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h1 style={{ fontSize: '3rem', fontWeight: '900', marginBottom: '0.5rem', color: 'white' }}>{activeContent.title}</h1>
          <p style={{ color: 'var(--slate-500)', marginBottom: '3rem' }}>Last Updated: {activeContent.lastUpdated}</p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '2.5rem' }}>
            {activeContent.sections.map((section, i) => (
              <div key={i}>
                <h3 style={{ fontSize: '1.25rem', fontWeight: '700', color: 'var(--amber-gold)', marginBottom: '1rem' }}>{section.title}</h3>
                <p style={{ color: 'var(--slate-300)', lineHeight: '1.8', fontSize: '1.05rem' }}>{section.text}</p>
              </div>
            ))}
          </div>
        </motion.div>
      </main>

      <footer style={{ marginTop: '8rem', textAlign: 'center', color: 'var(--slate-600)', fontSize: '0.9rem' }}>
        © 2026 Valet Parking Technologies. All rights reserved.
      </footer>
    </div>
  );
};

export default Legal;
