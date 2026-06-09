import React, { useState } from 'react';
import { Car, Smartphone, Palette, FileText, Loader2, AlertCircle, MapPin, LayoutGrid, User } from 'lucide-react';
import Modal from '../ui/Modal';
import Button from '../ui/Button';
import { vehicleService } from '../../services/vehicleService';
import { supabase } from '../../lib/supabase';

const inputStyle = {
  width: '100%',
  padding: '0.75rem 1rem 0.75rem 2.75rem',
  borderRadius: '12px',
  border: '1px solid var(--border-color)',
  backgroundColor: 'var(--bg-subtle)',
  color: 'var(--text-main)',
  outline: 'none',
  fontSize: '0.9rem'
};

const Field = ({ label, required, icon: Icon, children }) => (
  <div>
    <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '600', marginBottom: '0.5rem', color: 'var(--text-main)' }}>
      {label} {required && <span style={{ color: '#ef4444' }}>*</span>}
    </label>
    <div style={{ position: 'relative' }}>
      <Icon size={18} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
      {children}
    </div>
  </div>
);

const CheckInModal = ({ isOpen, onClose, locationId }) => {
  const [formData, setFormData] = useState({
    plate_number: '',
    model: '',
    color: '',
    phone_number: '',
    slot_id: '',
    zone: '',
    customer_name: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.plate_number) {
      setError('Plate number is required');
      return;
    }

    setLoading(true);
    setError('');

    try {
      // 1. Upsert customer info if name and phone are provided
      if (formData.phone_number && formData.customer_name) {
        const { error: custError } = await supabase
          .from('customers')
          .upsert([{
            location_id: locationId,
            name: formData.customer_name,
            phone: formData.phone_number,
            vehicles: [formData.plate_number]
          }], { onConflict: 'location_id,phone' });
        
        if (custError) console.warn('Customer upsert failed:', custError.message);
      }

      // 2. Add vehicle (excluding customer_name field to avoid DB errors)
      const { customer_name, ...vehiclePayload } = formData;
      const { error: submitError } = await vehicleService.addVehicle({
        ...vehiclePayload,
        location_id: locationId,
        status: 'Received'
      });

      if (submitError) throw submitError;

      setFormData({ plate_number: '', model: '', color: '', phone_number: '', slot_id: '', zone: '', customer_name: '' });
      onClose();
    } catch (err) {
      setError(err.message || 'Failed to check in vehicle');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Vehicle Check-in" glass={false}>
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>

        {error && (
          <div style={{
            padding: '0.75rem', borderRadius: '10px',
            backgroundColor: 'rgba(239, 68, 68, 0.1)', color: '#ef4444',
            fontSize: '0.875rem', display: 'flex', alignItems: 'center',
            gap: '0.5rem', border: '1px solid rgba(239, 68, 68, 0.2)'
          }}>
            <AlertCircle size={16} />
            {error}
          </div>
        )}

        {/* Plate Number */}
        <Field label="Plate Number" required icon={FileText}>
          <input
            type="text" name="plate_number" required
            value={formData.plate_number} onChange={handleChange}
            placeholder="e.g. TN-01-AB-1234"
            style={inputStyle}
          />
        </Field>

        {/* Model + Color */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
          <Field label="Vehicle Model" icon={Car}>
            <input
              type="text" name="model"
              value={formData.model} onChange={handleChange}
              placeholder="e.g. Toyota Fortuner"
              style={inputStyle}
            />
          </Field>
          <Field label="Color" icon={Palette}>
            <input
              type="text" name="color"
              value={formData.color} onChange={handleChange}
              placeholder="e.g. White"
              style={inputStyle}
            />
          </Field>
        </div>

        {/* Zone + Slot */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
          <Field label="Zone" icon={LayoutGrid}>
            <input
              type="text" name="zone"
              value={formData.zone} onChange={handleChange}
              placeholder="e.g. A, B, Ground"
              style={inputStyle}
            />
          </Field>
          <Field label="Slot Number" icon={MapPin}>
            <input
              type="text" name="slot_id"
              value={formData.slot_id} onChange={handleChange}
              placeholder="e.g. A-12"
              style={inputStyle}
            />
          </Field>
        </div>

        {/* Customer Name + Phone */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
          <Field label="Customer Name" icon={User}>
            <input
              type="text" name="customer_name"
              value={formData.customer_name} onChange={handleChange}
              placeholder="e.g. John Doe"
              style={inputStyle}
            />
          </Field>
          <Field label="Customer Phone Number" icon={Smartphone}>
            <input
              type="tel" name="phone_number"
              value={formData.phone_number} onChange={handleChange}
              placeholder="e.g. +91 98765 43210"
              style={inputStyle}
            />
          </Field>
        </div>

        {/* Actions */}
        <div style={{ display: 'flex', gap: '1rem', marginTop: '0.5rem' }}>
          <Button variant="outline" type="button" onClick={onClose} style={{ flex: 1 }}>
            Cancel
          </Button>
          <Button variant="primary" type="submit" disabled={loading} style={{ flex: 2 }}>
            {loading ? <Loader2 size={20} className="animate-spin" /> : 'Complete Check-in'}
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default CheckInModal;
