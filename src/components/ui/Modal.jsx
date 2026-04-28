import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import Button from './Button';

const Modal = ({ isOpen, onClose, title, children }) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <div 
          style={{ 
            position: 'fixed', 
            inset: 0, 
            zIndex: 50, 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center', 
            padding: '1rem' 
          }}
        >
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            style={{ 
              position: 'absolute', 
              inset: 0, 
              backgroundColor: 'rgba(0, 0, 0, 0.4)', 
              backdropFilter: 'blur(4px)' 
            }}
          />
          
          {/* Modal Content */}
          <motion.div
            initial={{ scale: 0.95, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.95, opacity: 0, y: 20 }}
            className="glass"
            style={{ 
              position: 'relative', 
              width: '100%', 
              maxWidth: '600px', 
              backgroundColor: 'var(--bg-card)', 
              borderRadius: '20px', 
              boxShadow: 'var(--shadow-lg)',
              border: '1px solid var(--border-color)',
              overflow: 'hidden'
            }}
          >
            <div style={{ padding: '1.5rem', borderBottom: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 style={{ fontSize: '1.25rem', fontWeight: '700' }}>{title}</h3>
              <Button variant="ghost" onClick={onClose} style={{ padding: '0.25rem' }}>
                <X size={20} />
              </Button>
            </div>
            
            <div style={{ padding: '1.5rem', maxHeight: '70vh', overflowY: 'auto' }}>
              {children}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default Modal;
