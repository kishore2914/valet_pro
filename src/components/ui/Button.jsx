import React from 'react';
import { motion } from 'framer-motion';

const Button = ({ children, variant = 'primary', className = '', ...props }) => {
  const variants = {
    primary: {
      backgroundColor: 'var(--blue-500)',
      color: 'white',
      boxShadow: '0 4px 12px rgba(37, 99, 235, 0.25)',
      border: 'none',
    },
    secondary: {
      background: 'var(--slate-200)',
      color: 'var(--slate-800)',
    },
    accent: {
      backgroundColor: 'var(--amber-gold)',
      color: 'var(--obsidian-black)',
      boxShadow: '0 4px 12px rgba(245, 158, 11, 0.2)',
      border: 'none',
    },
    outline: {
      border: '1px solid var(--border-color)',
      color: 'inherit',
      background: 'transparent',
    },
    ghost: {
      background: 'transparent',
      color: 'inherit',
    }
  };

  const styleBase = {
    padding: '0.625rem 1.5rem',
    borderRadius: '12px',
    fontWeight: '600',
    fontSize: '0.95rem',
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '0.75rem',
    cursor: 'pointer',
    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
    border: '1px solid transparent',
    lineHeight: '1',
  };

  return (
    <motion.button
      whileTap={{ scale: 0.96 }}
      whileHover={{ scale: 1.02 }}
      className={`btn-${variant} ${className}`}
      style={{ ...styleBase, ...variants[variant], ...props.style }}
      {...props}
    >
      {children}
    </motion.button>
  );
};

export default Button;
