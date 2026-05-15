import React, { useState, useRef, useEffect } from 'react';
import { Globe, ChevronDown, Check } from 'lucide-react';
import { useLocale } from '../../context/LocaleContext';
import { motion, AnimatePresence } from 'framer-motion';

const CountrySelector = () => {
  const { currentCountry, setCountry, countries } = useLocale();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div style={{ position: 'relative' }} ref={dropdownRef}>
      <button 
        onClick={() => setIsOpen(!isOpen)}
        style={{ 
          display: 'flex', 
          alignItems: 'center', 
          gap: '0.75rem', 
          padding: '0.5rem 1rem', 
          borderRadius: '100px', 
          backgroundColor: 'rgba(255,255,255,0.05)', 
          border: '1px solid rgba(255,255,255,0.1)',
          color: 'white',
          cursor: 'pointer',
          fontSize: '0.85rem',
          fontWeight: '600',
          transition: 'all 0.2s ease'
        }}
        onMouseOver={e => e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.1)'}
        onMouseOut={e => e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.05)'}
      >
        <Globe size={16} className="text-blue-400" />
        <span>{currentCountry.name}</span>
        <span style={{ color: 'var(--slate-500)', fontSize: '0.75rem' }}>{currentCountry.currency}</span>
        <ChevronDown size={14} style={{ transform: isOpen ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }} />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            style={{ 
              position: 'absolute', 
              top: 'calc(100% + 0.5rem)', 
              right: 0, 
              width: '220px', 
              backgroundColor: 'rgba(15, 23, 42, 0.95)', 
              backdropFilter: 'blur(16px)', 
              borderRadius: '16px', 
              border: '1px solid rgba(255,255,255,0.1)', 
              padding: '0.5rem', 
              zIndex: 1000,
              boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.5)'
            }}
          >
            {countries.map((country) => (
              <button
                key={country.code}
                onClick={() => {
                  setCountry(country.code);
                  setIsOpen(false);
                }}
                style={{ 
                  width: '100%', 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'space-between',
                  gap: '0.75rem', 
                  padding: '0.75rem 1rem', 
                  borderRadius: '10px', 
                  backgroundColor: currentCountry.code === country.code ? 'rgba(37, 99, 235, 0.1)' : 'transparent',
                  border: 'none',
                  color: currentCountry.code === country.code ? 'white' : 'var(--slate-400)',
                  cursor: 'pointer',
                  fontSize: '0.9rem',
                  textAlign: 'left',
                  transition: 'all 0.2s ease'
                }}
                onMouseOver={e => {
                  if (currentCountry.code !== country.code) {
                    e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.05)';
                    e.currentTarget.style.color = 'white';
                  }
                }}
                onMouseOut={e => {
                  if (currentCountry.code !== country.code) {
                    e.currentTarget.style.backgroundColor = 'transparent';
                    e.currentTarget.style.color = 'var(--slate-400)';
                  }
                }}
              >
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                  <span style={{ fontWeight: '600' }}>{country.name}</span>
                  <span style={{ fontSize: '0.7rem', opacity: 0.6 }}>{country.currency} ({country.symbol})</span>
                </div>
                {currentCountry.code === country.code && <Check size={16} color="var(--blue-500)" />}
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default CountrySelector;
