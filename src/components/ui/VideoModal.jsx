import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';

const VideoModal = ({ isOpen, onClose, videoUrl = "https://www.youtube.com/embed/dQw4w9WgXcQ" }) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <div style={{
          position: 'fixed',
          inset: 0,
          zIndex: 1000,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '2rem',
          backdropFilter: 'blur(12px)',
          backgroundColor: 'rgba(2, 6, 23, 0.8)'
        }}>
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            style={{
              position: 'relative',
              width: '100%',
              maxWidth: '1000px',
              aspectRatio: '16/9',
              background: 'var(--obsidian-elevated)',
              borderRadius: '24px',
              overflow: 'hidden',
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
              border: '1px solid rgba(255, 255, 255, 0.1)'
            }}
          >
            <button
              onClick={onClose}
              style={{
                position: 'absolute',
                top: '1.5rem',
                right: '1.5rem',
                zIndex: 10,
                backgroundColor: 'rgba(2, 6, 23, 0.6)',
                color: 'white',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                borderRadius: '50%',
                width: '40px',
                height: '40px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                transition: 'all 0.2s ease'
              }}
              onMouseOver={e => e.currentTarget.style.backgroundColor = 'rgba(2, 6, 23, 0.9)'}
              onMouseOut={e => e.currentTarget.style.backgroundColor = 'rgba(2, 6, 23, 0.6)'}
            >
              <X size={20} />
            </button>

            <iframe
              width="100%"
              height="100%"
              src={videoUrl}
              title="Valet Pro Demo"
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              style={{ border: 'none' }}
            ></iframe>
          </motion.div>
          
          <div 
            onClick={onClose}
            style={{
              position: 'absolute',
              inset: 0,
              zIndex: -1,
              cursor: 'pointer'
            }}
          ></div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default VideoModal;
