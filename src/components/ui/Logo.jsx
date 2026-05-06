import React from 'react';
import { Link } from 'react-router-dom';
import logoImg from '../../assets/logo.png';

const Logo = ({ size = 40, showText = true, className = "", to = "/" }) => {
  const content = (
    <div 
      className={className}
      style={{ 
        display: 'flex', 
        alignItems: 'center', 
        gap: '0.75rem',
        cursor: 'pointer'
      }}
    >
      <img 
        src={logoImg} 
        alt="Valet Parking Logo" 
        style={{ 
          height: `${size}px`, 
          width: 'auto',
          objectFit: 'contain'
        }} 
      />
      {showText && (
        <span style={{ 
          fontSize: `${size * 0.5}px`, 
          fontWeight: '800', 
          color: 'white',
          display: 'flex',
          alignItems: 'center'
        }}>
          Valet<span style={{ color: 'var(--accent)' }}> Parking</span>
        </span>

      )}

    </div>
  );

  if (to) {
    return <Link to={to} style={{ textDecoration: 'none' }}>{content}</Link>;
  }

  return content;
};

export default Logo;
