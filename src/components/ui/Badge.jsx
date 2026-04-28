import React from 'react';

const Badge = ({ children, variant = 'gray', className = '' }) => {
  const variants = {
    gray: { bg: 'var(--badge-gray-bg)', text: 'var(--badge-gray-text)', border: 'var(--border-subtle)' },
    blue: { bg: 'rgba(59, 130, 246, 0.1)', text: 'var(--blue-600)', border: 'rgba(59, 130, 246, 0.2)' },
    gold: { bg: 'rgba(245, 158, 11, 0.1)', text: 'var(--gold-600)', border: 'rgba(245, 158, 11, 0.2)' },
    green: { bg: 'rgba(34, 197, 94, 0.1)', text: '#16a34a', border: 'rgba(34, 197, 94, 0.2)' },
    red: { bg: 'rgba(239, 68, 68, 0.1)', text: '#dc2626', border: 'rgba(239, 68, 68, 0.2)' },
  };

  const currentVariant = variants[variant] || variants.gray;

  return (
    <span
      className={`badge ${className}`}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        padding: '0.2rem 0.6rem',
        borderRadius: '20px',
        fontSize: '0.75rem',
        fontWeight: '600',
        backgroundColor: currentVariant.bg,
        color: currentVariant.text,
        border: `1px solid ${currentVariant.border}`,
        textTransform: 'uppercase',
        letterSpacing: '0.025em',
      }}
    >
      {children}
    </span>
  );
};

export default Badge;
