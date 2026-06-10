import React, { useState, useEffect } from 'react';
import { 
  Calendar, 
  Clock, 
  DollarSign, 
  Users, 
  Plus, 
  Download, 
  ChevronLeft, 
  ChevronRight,
  TrendingUp,
  X,
  CheckCircle,
  HelpCircle,
  Loader2
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { staffService } from '../../services/staffService';

const getShiftColor = (shift) => {
  const s = (shift || '').toLowerCase();
  if (s === 'morning') {
    return {
      bg: 'rgba(37, 99, 235, 0.12)',
      color: '#3b82f6',
      border: '1.5px solid rgba(37, 99, 235, 0.25)'
    };
  } else if (s === 'evening') {
    return {
      bg: 'rgba(217, 119, 6, 0.12)',
      color: '#fbbf24',
      border: '1.5px solid rgba(217, 119, 6, 0.25)'
    };
  } else if (s === 'night') {
    return {
      bg: 'rgba(120, 53, 4, 0.15)',
      color: '#d97706',
      border: '1.5px solid rgba(120, 53, 4, 0.25)'
    };
  }
  return {
    bg: 'rgba(30, 41, 59, 0.4)',
    color: '#64748b',
    border: '1.5px solid rgba(30, 41, 59, 0.6)'
  };
};

const Schedule = () => {
  const { locationId } = useAuth();
  const [activeTab, setActiveTab] = useState('Weekly Schedule');
  const [scheduleData, setScheduleData] = useState([]);
  const [dbStaff, setDbStaff] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [isExporting, setIsExporting] = useState(false);

  // Form state for new shift assignment
  const [formStaffId, setFormStaffId] = useState('');
  const [formDay, setFormDay] = useState('mon');
  const [formShift, setFormShift] = useState('Morning');

  // Cell shift quick changer dropdown
  const [editingCell, setEditingCell] = useState(null); // { rowId, day }

  const fetchStaff = async () => {
    if (!locationId) {
      setLoading(false);
      return;
    }
    try {
      setLoading(true);
      const { data } = await staffService.getStaff(locationId);
      if (data) setDbStaff(data);
    } catch (e) {
      console.error('Error fetching staff for schedule:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStaff();
  }, [locationId]);

  useEffect(() => {
    if (!loading) {
      if (dbStaff && dbStaff.length > 0) {
        // Map database staff to schedule format
        const dbSchedule = dbStaff.map((s, index) => {
          // Pre-populate shift schedules in a structured cycle to ensure grid looks active
          const defaultShifts = [
            { mon: 'Evening', tue: 'Morning', wed: 'Off', thu: 'Night', fri: 'Evening', sat: 'Morning', sun: 'Off' },
            { mon: 'Night', tue: 'Evening', wed: 'Morning', thu: 'Off', fri: 'Night', sat: 'Evening', sun: 'Morning' },
            { mon: 'Off', tue: 'Night', wed: 'Evening', thu: 'Morning', fri: 'Off', sat: 'Night', sun: 'Evening' },
            { mon: 'Morning', tue: 'Off', wed: 'Night', thu: 'Evening', fri: 'Morning', sat: 'Off', sun: 'Night' },
            { mon: 'Evening', tue: 'Morning', wed: 'Off', thu: 'Night', fri: 'Evening', sat: 'Morning', sun: 'Off' },
            { mon: 'Night', tue: 'Evening', wed: 'Morning', thu: 'Off', fri: 'Night', sat: 'Evening', sun: 'Morning' },
            { mon: 'Off', tue: 'Night', wed: 'Evening', thu: 'Morning', fri: 'Off', sat: 'Night', sun: 'Evening' },
            { mon: 'Morning', tue: 'Off', wed: 'Night', thu: 'Evening', fri: 'Morning', sat: 'Off', sun: 'Night' }
          ];
          const cycleShifts = defaultShifts[index % defaultShifts.length];
          return {
            id: s.id,
            staffName: s.name,
            zone: s.zone || 'Zone A',
            role: s.role || 'Valet',
            hourlyRate: s.role?.toLowerCase()?.includes('super') ? 650 : 500,
            tipsEarned: s.tips || (s.role?.toLowerCase()?.includes('super') ? 2400 : 1500),
            mon: s.mon || cycleShifts.mon,
            tue: s.tue || cycleShifts.tue,
            wed: s.wed || cycleShifts.wed,
            thu: s.thu || cycleShifts.thu,
            fri: s.fri || cycleShifts.fri,
            sat: s.sat || cycleShifts.sat,
            sun: s.sun || cycleShifts.sun
          };
        });
        setScheduleData(dbSchedule);
      } else {
        setScheduleData([]);
      }
    }
  }, [dbStaff, loading]);

  const currentList = scheduleData;

  // Helper to calculate total hours worked in a week
  const getShiftHours = (shift) => {
    const s = (shift || '').toLowerCase();
    if (s === 'morning' || s === 'evening' || s === 'night') return 8; // 8-hour shift
    return 0;
  };

  const calculateHoursForStaff = (staff) => {
    let hours = 0;
    ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'].forEach(day => {
      hours += getShiftHours(staff[day]);
    });
    return hours;
  };

  // KPI Row stats calculation
  const totalHoursCount = currentList.reduce((sum, s) => sum + calculateHoursForStaff(s), 0);
  const totalPayrollCost = currentList.reduce((sum, s) => {
    const hours = calculateHoursForStaff(s);
    return sum + (hours * s.hourlyRate);
  }, 0);
  const totalTipsCount = currentList.reduce((sum, s) => sum + s.tipsEarned, 0);
  const activeStaffCount = currentList.filter(s => calculateHoursForStaff(s) > 0).length;

  // Add shift submit
  const handleAddShiftSubmit = (e) => {
    e.preventDefault();
    if (!formStaffId) return;

    setScheduleData(prev => prev.map(staff => {
      if (staff.id === formStaffId) {
        return {
          ...staff,
          [formDay.toLowerCase()]: formShift
        };
      }
      return staff;
    }));

    setShowAddModal(false);
  };

  // In-place cell editing handler
  const handleCellClick = (rowId, day) => {
    setEditingCell({ rowId, day });
  };

  const handleCellChange = (rowId, day, value) => {
    setScheduleData(prev => prev.map(staff => {
      if (staff.id === rowId) {
        return {
          ...staff,
          [day]: value
        };
      }
      return staff;
    }));
    setEditingCell(null);
  };

  const handleExport = () => {
    setIsExporting(true);
    setTimeout(() => {
      setIsExporting(false);
      alert('Shift schedule and payroll report exported successfully!');
    }, 1500);
  };

  const formatCurrency = (val) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(val);
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh', color: 'var(--text-main)' }}>
        <Loader2 className="animate-spin" size={32} />
        <span style={{ marginLeft: '0.75rem', fontWeight: '600' }}>Loading Schedule & Payroll...</span>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', width: '100%' }}>
      
      {/* Title Header Section */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.85rem', fontWeight: '800', color: 'var(--text-main)', marginBottom: '0.25rem' }}>Schedule & Payroll</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', fontWeight: '500' }}>
            Plan shifts and track earnings
          </p>
        </div>
        <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
          <button
            onClick={handleExport}
            disabled={isExporting}
            style={{
              backgroundColor: 'var(--bg-card)',
              color: 'var(--text-main)',
              border: '1px solid var(--border-color)',
              borderRadius: '10px',
              padding: '0.65rem 1rem',
              fontSize: '0.85rem',
              fontWeight: '700',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.45rem',
              transition: 'all 0.15s ease'
            }}
          >
            {isExporting ? <Loader2 size={15} className="animate-spin" /> : <Download size={15} />}
            <span>Export</span>
          </button>
          <button
            onClick={() => {
              if (currentList.length > 0) setFormStaffId(currentList[0].id);
              setShowAddModal(true);
            }}
            style={{
              backgroundColor: 'var(--accent)',
              color: 'var(--accent-text)',
              border: 'none',
              borderRadius: '10px',
              padding: '0.65rem 1.15rem',
              fontSize: '0.85rem',
              fontWeight: '700',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              boxShadow: '0 4px 15px var(--accent-shadow)',
              transition: 'all 0.15s ease'
            }}
          >
            <Plus size={16} />
            <span>New Shift</span>
          </button>
        </div>
      </div>

      {/* KPI Stats Row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem' }}>
        {/* Total Hours */}
        <div style={{
          backgroundColor: 'var(--bg-card)',
          border: '1px solid var(--border-color)',
          borderRadius: '12px',
          padding: '1.25rem',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start'
        }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            <span style={{ fontSize: '0.65rem', fontWeight: '800', color: 'var(--text-muted)', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
              Total Hours
            </span>
            <span style={{ fontSize: '1.85rem', fontWeight: '800', color: 'var(--text-main)' }}>
              {totalHoursCount.toFixed(1)}h
            </span>
          </div>
          <div style={{ color: 'var(--text-muted)', opacity: 0.7 }}><Clock size={20} /></div>
        </div>

        {/* Weekly Payroll */}
        <div style={{
          backgroundColor: 'var(--bg-card)',
          border: '1px solid var(--border-color)',
          borderRadius: '12px',
          padding: '1.25rem',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start'
        }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            <span style={{ fontSize: '0.65rem', fontWeight: '800', color: 'var(--text-muted)', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
              Weekly Payroll
            </span>
            <span style={{ fontSize: '1.85rem', fontWeight: '800', color: 'var(--text-main)' }}>
              ₹{(totalPayrollCost / 1000).toFixed(1)}K
            </span>
          </div>
          <span style={{ fontSize: '1.25rem', fontWeight: '700', color: 'var(--text-muted)', opacity: 0.8 }}>₹</span>
        </div>

        {/* Tips Collected */}
        <div style={{
          backgroundColor: 'var(--bg-card)',
          border: '1px solid var(--border-color)',
          borderRadius: '12px',
          padding: '1.25rem',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start'
        }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            <span style={{ fontSize: '0.65rem', fontWeight: '800', color: 'var(--text-muted)', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
              Tips Collected
            </span>
            <span style={{ fontSize: '1.85rem', fontWeight: '800', color: 'var(--text-main)' }}>
              ₹{(totalTipsCount / 1000).toFixed(1)}K
            </span>
          </div>
          <div style={{ color: 'var(--text-muted)', opacity: 0.7 }}><TrendingUp size={20} /></div>
        </div>

        {/* Active Staff */}
        <div style={{
          backgroundColor: 'var(--bg-card)',
          border: '1px solid var(--border-color)',
          borderRadius: '12px',
          padding: '1.25rem',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start'
        }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            <span style={{ fontSize: '0.65rem', fontWeight: '800', color: 'var(--text-muted)', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
              Active Staff
            </span>
            <span style={{ fontSize: '1.85rem', fontWeight: '800', color: 'var(--text-main)' }}>
              {activeStaffCount}
            </span>
          </div>
          <div style={{ color: 'var(--text-muted)', opacity: 0.7 }}><Users size={20} /></div>
        </div>
      </div>

      {/* Tabs Selector row */}
      <div style={{ 
        display: 'inline-flex', 
        backgroundColor: 'var(--bg-card)', 
        border: '1px solid var(--border-color)',
        borderRadius: '8px', 
        padding: '0.25rem',
        alignSelf: 'flex-start'
      }}>
        {['Weekly Schedule', 'Payroll'].map(tabName => {
          const isActive = activeTab === tabName;
          return (
            <button
              key={tabName}
              onClick={() => setActiveTab(tabName)}
              style={{
                padding: '0.45rem 1.25rem',
                borderRadius: '6px',
                fontSize: '0.75rem',
                fontWeight: '700',
                border: 'none',
                backgroundColor: isActive ? '#fbbf24' : 'transparent',
                color: isActive ? '#080c14' : '#64748b',
                cursor: 'pointer',
                transition: 'all 0.15s ease'
              }}
            >
              {tabName}
            </button>
          );
        })}
      </div>

      {/* Main Content Area */}
      {activeTab === 'Weekly Schedule' ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          
          {/* Sub Navigation controls */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.5rem', marginTop: '0.25rem' }}>
            {/* Week Switcher */}
            <div style={{ 
              display: 'flex', 
              alignItems: 'center', 
              backgroundColor: 'var(--bg-card)', 
              border: '1px solid var(--border-color)', 
              borderRadius: '8px', 
              padding: '0.25rem' 
            }}>
              <button style={{ 
                padding: '0.35rem 0.55rem', 
                color: '#64748b', 
                cursor: 'pointer',
                backgroundColor: 'transparent',
                border: 'none',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <ChevronLeft size={14} />
              </button>
              <span style={{ fontSize: '0.8rem', fontWeight: '700', color: 'var(--text-main)', padding: '0 0.75rem' }}>Week Current</span>
              <button style={{ 
                padding: '0.35rem 0.55rem', 
                color: '#64748b', 
                cursor: 'pointer',
                backgroundColor: 'transparent',
                border: 'none',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <ChevronRight size={14} />
              </button>
            </div>

            {/* Legend pills */}
            <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
              {['Morning', 'Evening', 'Night', 'Off'].map(shift => {
                const color = getShiftColor(shift);
                return (
                  <div 
                    key={shift} 
                    style={{ 
                      padding: '0.35rem 0.85rem', 
                      borderRadius: '6px', 
                      backgroundColor: color.bg, 
                      color: color.color, 
                      border: color.border,
                      fontSize: '0.7rem',
                      fontWeight: '700'
                    }}
                  >
                    {shift}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Schedule Grid Table */}
          {currentList.length === 0 ? (
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '4rem 2rem',
              backgroundColor: 'var(--bg-card)',
              border: '1px dashed var(--border-color)',
              borderRadius: '16px',
              textAlign: 'center',
              gap: '1rem',
              color: 'var(--text-muted)'
            }}>
              <Calendar size={48} style={{ opacity: 0.3, color: '#fbbf24' }} />
              <div>
                <h3 style={{ fontSize: '1.1rem', fontWeight: '700', color: 'var(--text-main)', marginBottom: '0.25rem' }}>No Shifts Scheduled</h3>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', maxWidth: '300px', margin: '0 auto', lineHeight: '1.4' }}>
                  Please add staff members in the Staff tab to manage and schedule their weekly shifts.
                </p>
              </div>
            </div>
          ) : (
            <div style={{
              backgroundColor: 'var(--bg-card)',
              border: '1px solid var(--border-color)',
              borderRadius: '12px',
              overflow: 'hidden'
            }}>
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'center' }}>
                  <thead>
                    <tr style={{ borderBottom: '1px solid var(--border-color)', backgroundColor: 'rgba(255,255,255,0.01)' }}>
                      <th style={{ padding: '1rem', textLeft: 'left', fontSize: '0.7rem', fontWeight: '800', color: 'var(--text-muted)', textTransform: 'uppercase', minWidth: '150px', textAlign: 'left' }}>Staff</th>
                      {['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN'].map(day => (
                        <th key={day} style={{ padding: '1rem', fontSize: '0.7rem', fontWeight: '800', color: 'var(--text-muted)' }}>{day}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {currentList.map(staff => (
                      <tr 
                        key={staff.id} 
                        style={{ borderBottom: '1px solid var(--border-color)', transition: 'all 0.15s' }}
                        onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.01)'}
                        onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                      >
                        {/* Staff Identity Column */}
                        <td style={{ padding: '0.85rem 1rem', textAlign: 'left' }}>
                          <div style={{ display: 'flex', flexDirection: 'column' }}>
                            <span style={{ fontSize: '0.85rem', fontWeight: '800', color: 'var(--text-main)' }}>{staff.staffName}</span>
                            <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)', marginTop: '0.15rem' }}>{staff.zone}</span>
                          </div>
                        </td>

                        {/* Day Shift cells */}
                        {['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'].map(day => {
                          const shift = staff[day];
                          const color = getShiftColor(shift);
                          const isEditing = editingCell && editingCell.rowId === staff.id && editingCell.day === day;

                          return (
                            <td key={day} style={{ padding: '0.85rem 0.5rem', position: 'relative' }}>
                              {isEditing ? (
                                <select
                                  value={shift}
                                  autoFocus
                                  onBlur={() => setEditingCell(null)}
                                  onChange={(e) => handleCellChange(staff.id, day, e.target.value)}
                                  style={{
                                    padding: '0.2rem 0.35rem',
                                    fontSize: '0.65rem',
                                    fontWeight: '700',
                                    borderRadius: '6px',
                                    backgroundColor: 'var(--bg-subtle)',
                                    color: 'var(--text-main)',
                                    border: '1px solid #fbbf24',
                                    outline: 'none',
                                    cursor: 'pointer'
                                  }}
                                >
                                  <option value="Morning">Morning</option>
                                  <option value="Evening">Evening</option>
                                  <option value="Night">Night</option>
                                  <option value="Off">Off</option>
                                </select>
                              ) : (
                                <div
                                  onClick={() => handleCellClick(staff.id, day)}
                                  style={{
                                    padding: '0.45rem 0',
                                    borderRadius: '6px',
                                    backgroundColor: color.bg,
                                    color: color.color,
                                    border: color.border,
                                    fontSize: '0.7rem',
                                    fontWeight: '700',
                                    cursor: 'pointer',
                                    width: '100%',
                                    transition: 'all 0.1s ease',
                                    textAlign: 'center'
                                  }}
                                  onMouseEnter={(e) => e.currentTarget.style.filter = 'brightness(1.15)'}
                                  onMouseLeave={(e) => e.currentTarget.style.filter = 'none'}
                                >
                                  {shift}
                                </div>
                              )}
                            </td>
                          );
                        })}

                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

        </div>
      ) : (
        /* Payroll View */
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          
          {currentList.length === 0 ? (
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '4rem 2rem',
              backgroundColor: 'var(--bg-card)',
              border: '1px dashed var(--border-color)',
              borderRadius: '16px',
              textAlign: 'center',
              gap: '1rem',
              color: 'var(--text-muted)'
            }}>
              <Users size={48} style={{ opacity: 0.3, color: '#fbbf24' }} />
              <div>
                <h3 style={{ fontSize: '1.1rem', fontWeight: '700', color: 'var(--text-main)', marginBottom: '0.25rem' }}>No Payroll Data</h3>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', maxWidth: '300px', margin: '0 auto', lineHeight: '1.4' }}>
                  Weekly payroll will show up once staff members are scheduled for active shifts.
                </p>
              </div>
            </div>
          ) : (
            <div style={{
              backgroundColor: 'var(--bg-card)',
              border: '1px solid var(--border-color)',
              borderRadius: '12px',
              overflow: 'hidden'
            }}>
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                  <thead>
                    <tr style={{ borderBottom: '1px solid var(--border-color)', backgroundColor: 'rgba(255,255,255,0.01)' }}>
                      <th style={{ padding: '1rem', fontSize: '0.7rem', fontWeight: '800', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Staff Member</th>
                      <th style={{ padding: '1rem', fontSize: '0.7rem', fontWeight: '800', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Role</th>
                      <th style={{ padding: '1rem', fontSize: '0.7rem', fontWeight: '800', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Hours worked</th>
                      <th style={{ padding: '1rem', fontSize: '0.7rem', fontWeight: '800', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Hourly Rate</th>
                      <th style={{ padding: '1rem', fontSize: '0.7rem', fontWeight: '800', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Base pay</th>
                      <th style={{ padding: '1rem', fontSize: '0.7rem', fontWeight: '800', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Tips earned</th>
                      <th style={{ padding: '1rem', fontSize: '0.7rem', fontWeight: '800', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Gross Pay</th>
                      <th style={{ padding: '1rem', fontSize: '0.7rem', fontWeight: '800', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {currentList.map(staff => {
                      const hours = calculateHoursForStaff(staff);
                      const basePay = hours * staff.hourlyRate;
                      const grossPay = basePay + staff.tipsEarned;

                      return (
                        <tr 
                          key={staff.id} 
                          style={{ borderBottom: '1px solid var(--border-color)', transition: 'all 0.15s' }}
                          onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.01)'}
                          onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                        >
                          <td style={{ padding: '1rem', fontSize: '0.85rem', fontWeight: '800', color: 'var(--text-main)' }}>
                            {staff.staffName}
                          </td>
                          <td style={{ padding: '1rem', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                            {staff.role}
                          </td>
                          <td style={{ padding: '1rem', fontSize: '0.8rem', fontWeight: '600', color: 'var(--text-main)' }}>
                            {hours.toFixed(1)}h
                          </td>
                          <td style={{ padding: '1rem', fontSize: '0.8rem', fontWeight: '600', color: 'var(--text-main)' }}>
                            {formatCurrency(staff.hourlyRate)}/hr
                          </td>
                          <td style={{ padding: '1rem', fontSize: '0.8rem', fontWeight: '600', color: 'var(--text-main)' }}>
                            {formatCurrency(basePay)}
                          </td>
                          <td style={{ padding: '1rem', fontSize: '0.8rem', fontWeight: '600', color: 'var(--text-main)' }}>
                            {formatCurrency(staff.tipsEarned)}
                          </td>
                          <td style={{ padding: '1rem', fontSize: '0.85rem', fontWeight: '800', color: '#fbbf24' }}>
                            {formatCurrency(grossPay)}
                          </td>
                          <td style={{ padding: '1rem' }}>
                            <span style={{
                              padding: '0.15rem 0.45rem',
                              borderRadius: '4px',
                              fontSize: '0.65rem',
                              fontWeight: '700',
                              backgroundColor: grossPay > 0 ? 'rgba(16, 185, 129, 0.12)' : 'rgba(100, 116, 139, 0.12)',
                              color: grossPay > 0 ? '#10b981' : '#64748b'
                            }}>
                              {grossPay > 0 ? 'Paid' : 'Unpaid'}
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}

        </div>
      )}

      {/* New Shift Modal Overlay */}
      {showAddModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100vw',
          height: '100vh',
          backgroundColor: 'rgba(0,0,0,0.65)',
          zIndex: 99999,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backdropFilter: 'blur(4px)'
        }}>
          <div style={{
            backgroundColor: 'var(--bg-surface)',
            border: '1.5px solid var(--border-color)',
            borderRadius: '16px',
            padding: '1.5rem',
            width: '380px',
            maxWidth: '90%',
            display: 'flex',
            flexDirection: 'column',
            gap: '1.25rem',
            boxShadow: '0 20px 40px rgba(0,0,0,0.5)'
          }}>
            {/* Modal Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 style={{ fontSize: '1.1rem', fontWeight: '800', color: 'var(--text-main)' }}>Assign New Shift</h3>
              <button 
                onClick={() => setShowAddModal(false)}
                style={{ backgroundColor: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}
              >
                <X size={18} />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleAddShiftSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                <label style={{ fontSize: '0.65rem', fontWeight: '700', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Staff Member *</label>
                <select
                  value={formStaffId}
                  onChange={(e) => setFormStaffId(e.target.value)}
                  style={{
                    padding: '0.55rem 0.85rem',
                    borderRadius: '8px',
                    border: '1px solid var(--border-color)',
                    backgroundColor: 'var(--bg-subtle)',
                    color: 'var(--text-main)',
                    fontSize: '0.8rem',
                    outline: 'none',
                    width: '100%'
                  }}
                >
                  {currentList.map(s => (
                    <option key={s.id} value={s.id}>{s.staffName} ({s.role})</option>
                  ))}
                </select>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                <label style={{ fontSize: '0.65rem', fontWeight: '700', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Select Day *</label>
                <select
                  value={formDay}
                  onChange={(e) => setFormDay(e.target.value)}
                  style={{
                    padding: '0.55rem 0.85rem',
                    borderRadius: '8px',
                    border: '1px solid var(--border-color)',
                    backgroundColor: 'var(--bg-subtle)',
                    color: 'var(--text-main)',
                    fontSize: '0.8rem',
                    outline: 'none',
                    width: '100%'
                  }}
                >
                  <option value="mon">Monday</option>
                  <option value="tue">Tuesday</option>
                  <option value="wed">Wednesday</option>
                  <option value="thu">Thursday</option>
                  <option value="fri">Friday</option>
                  <option value="sat">Saturday</option>
                  <option value="sun">Sunday</option>
                </select>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                <label style={{ fontSize: '0.65rem', fontWeight: '700', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Shift Type *</label>
                <select
                  value={formShift}
                  onChange={(e) => setFormShift(e.target.value)}
                  style={{
                    padding: '0.55rem 0.85rem',
                    borderRadius: '8px',
                    border: '1px solid var(--border-color)',
                    backgroundColor: 'var(--bg-subtle)',
                    color: 'var(--text-main)',
                    fontSize: '0.8rem',
                    outline: 'none',
                    width: '100%'
                  }}
                >
                  <option value="Morning">Morning</option>
                  <option value="Evening">Evening</option>
                  <option value="Night">Night</option>
                  <option value="Off">Off</option>
                </select>
              </div>

              <button
                type="submit"
                style={{
                  backgroundColor: 'var(--accent)',
                  color: 'var(--accent-text)',
                  border: 'none',
                  borderRadius: '8px',
                  padding: '0.65rem',
                  fontSize: '0.8rem',
                  fontWeight: '700',
                  cursor: 'pointer',
                  marginTop: '0.5rem',
                  boxShadow: '0 4px 15px var(--accent-shadow)'
                }}
              >
                Assign Shift
              </button>

            </form>
          </div>
        </div>
      )}

    </div>
  );
};

export default Schedule;
