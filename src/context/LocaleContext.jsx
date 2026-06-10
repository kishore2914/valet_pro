import React, { createContext, useContext, useState, useEffect } from 'react';
import i18n from '../i18n';
import { supabase } from '../lib/supabase';

const LocaleContext = createContext();

export const countries = [
  { 
    code: 'IN', 
    name: 'India', 
    language: 'en', 
    currency: 'INR', 
    symbol: '₹',
    locale: 'en-IN'
  },
  { 
    code: 'US', 
    name: 'USA', 
    language: 'en', 
    currency: 'USD', 
    symbol: '$',
    locale: 'en-US'
  },
  { 
    code: 'AE', 
    name: 'UAE', 
    language: 'en', 
    currency: 'AED', 
    symbol: 'د.إ',
    locale: 'en-AE'
  },
  { 
    code: 'GB', 
    name: 'UK', 
    language: 'en', 
    currency: 'GBP', 
    symbol: '£',
    locale: 'en-GB'
  }
];

export const LocaleProvider = ({ children }) => {
  const [currentCountry, setCurrentCountry] = useState(() => {
    const saved = localStorage.getItem('valet_pro_country');
    return saved ? JSON.parse(saved) : countries[0];
  });

  const [platformSettings, setPlatformSettings] = useState({
    pricing_starter: 3999,
    pricing_pro: 7999,
    pricing_enterprise: 24999
  });

  useEffect(() => {
    localStorage.setItem('valet_pro_country', JSON.stringify(currentCountry));
    // Update i18n language if necessary
    if (i18n.language !== currentCountry.language) {
      i18n.changeLanguage(currentCountry.language);
    }
  }, [currentCountry]);

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const { data, error } = await supabase.from('platform_settings').select('*');
        if (!error && data) {
          const settingsObj = {};
          data.forEach(item => {
            settingsObj[item.key] = item.value;
          });
          setPlatformSettings(prev => ({ ...prev, ...settingsObj }));
        }
      } catch (err) {
        console.warn('Failed to fetch platform settings, using defaults');
      }
    };
    fetchSettings();
  }, []);

  const setCountryByCode = (code) => {
    const country = countries.find(c => c.code === code);
    if (country) {
      setCurrentCountry(country);
    }
  };

  return (
    <LocaleContext.Provider value={{ 
      currentCountry, 
      setCountry: setCountryByCode,
      countries,
      platformSettings
    }}>
      {children}
    </LocaleContext.Provider>
  );
};

export const useLocale = () => {
  const context = useContext(LocaleContext);
  if (!context) {
    throw new Error('useLocale must be used within a LocaleProvider');
  }
  return context;
};
