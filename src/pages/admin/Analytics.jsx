import React, { useState, useEffect } from 'react';
import { 
  Building2, 
  Globe, 
  Car, 
  TrendingUp, 
  ShieldAlert, 
  Activity, 
  Search, 
  Plus, 
  Download, 
  ChevronDown, 
  ChevronUp, 
  Database, 
  Wifi, 
  Zap, 
  Server,
  User,
  Users,
  Clock,
  Settings,
  Bell,
  CheckCircle,
  AlertCircle,
  X,
  Loader2,
  UserCheck
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { supabase } from '../../lib/supabase';

// Helper to format currency
const formatINR = (val) => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0
  }).format(val);
};

const initialChains = [
  {
    id: 'ch-1',
    name: 'Taj Hotels Group',
    initials: 'TG',
    isChain: true,
    branchCount: 4,
    subtext: 'Chennai · Mumbai · Bengaluru · 42 staff · 2,44,120 vehicles processed',
    mrr: '₹55K',
    live: 42,
    branches: [
      { id: 'br-1', name: 'Taj Coromandel', city: 'Chennai', staff: 6, tier: 'Professional', live: 4, fee: '₹9,999/mo', status: 'active' },
      { id: 'br-2', name: 'Taj Connemara', city: 'Chennai', staff: 8, tier: 'Professional', live: 7, fee: '₹9,999/mo', status: 'active' },
      { id: 'br-3', name: 'Taj Mahal Palace, Mumbai', city: 'Mumbai', staff: 18, tier: 'Enterprise', live: 22, fee: '₹24,999/mo', status: 'active' },
      { id: 'br-4', name: 'Taj West End, Bengaluru', city: 'Bengaluru', staff: 10, tier: 'Professional', live: 9, fee: '₹9,999/mo', status: 'active' }
    ]
  },
  {
    id: 'ch-2',
    name: 'ITC Hotels',
    initials: 'ITC',
    isChain: true,
    branchCount: 3,
    subtext: 'Chennai · Bengaluru · New Delhi · 47 staff · 4,73,600 vehicles processed',
    mrr: '₹80K',
    live: 53,
    branches: [
      { id: 'br-5', name: 'ITC Grand Chola', city: 'Chennai', staff: 18, tier: 'Enterprise', live: 24, fee: '₹24,999/mo', status: 'active' },
      { id: 'br-6', name: 'ITC Gardenia', city: 'Bengaluru', staff: 14, tier: 'Professional', live: 18, fee: '₹9,999/mo', status: 'active' },
      { id: 'br-7', name: 'ITC Maurya', city: 'New Delhi', staff: 15, tier: 'Professional', live: 11, fee: '₹9,999/mo', status: 'active' }
    ]
  },
  {
    id: 'ch-3',
    name: 'Phoenix Mills Ltd',
    initials: 'PX',
    isChain: true,
    branchCount: 3,
    subtext: 'Chennai · Mumbai · Pune · 74 staff · 6,73,080 vehicles processed',
    mrr: '₹80K',
    live: 126,
    branches: [
      { id: 'br-8', name: 'Phoenix MarketCity, Chennai', city: 'Chennai', staff: 24, tier: 'Enterprise', live: 45, fee: '₹24,999/mo', status: 'active' },
      { id: 'br-9', name: 'Phoenix Palladium, Mumbai', city: 'Mumbai', staff: 30, tier: 'Enterprise', live: 55, fee: '₹24,999/mo', status: 'active' },
      { id: 'br-10', name: 'Phoenix MarketCity, Pune', city: 'Pune', staff: 20, tier: 'Professional', live: 26, fee: '₹9,999/mo', status: 'active' }
    ]
  },
  {
    id: 'ch-4',
    name: 'Apollo Hospitals Enterprise',
    initials: 'AH',
    isChain: true,
    branchCount: 3,
    subtext: 'Chennai · Hyderabad · 60 staff · 6,05,110 vehicles processed',
    mrr: '₹88K',
    live: 69,
    branches: [
      { id: 'br-11', name: 'Apollo Greams Road', city: 'Chennai', staff: 22, tier: 'Enterprise', live: 30, fee: '₹24,999/mo', status: 'active' },
      { id: 'br-12', name: 'Apollo Specialty, Chennai', city: 'Chennai', staff: 18, tier: 'Professional', live: 19, fee: '₹9,999/mo', status: 'active' },
      { id: 'br-13', name: 'Apollo Health City, Hyderabad', city: 'Hyderabad', staff: 20, tier: 'Enterprise', live: 20, fee: '₹24,999/mo', status: 'active' }
    ]
  }
];

const initialStandalone = [
  { id: 'st-1', name: 'Grand Hyatt Chennai', city: 'Chennai', staff: 8, tier: 'Professional', live: 6, fee: '₹9,999/mo', status: 'active' },
  { id: 'st-2', name: 'VR Mall', city: 'Chennai', staff: 5, tier: 'Starter', live: 12, fee: '₹4,999/mo', status: 'active' },
  { id: 'st-3', name: 'Express Avenue', city: 'Chennai', staff: 8, tier: 'Professional', live: 0, fee: '₹9,999/mo', status: 'inactive' },
  { id: 'st-4', name: 'TIDEL Park', city: 'Chennai', staff: 4, tier: 'Starter', live: 3, fee: 'Free Trial', status: 'trial' }
];

const initialAuditLogs = [
  { id: 'log-1', title: 'Client onboarded', desc: 'Radisson Blu - Bengaluru', time: '2 hours ago · Admin' },
  { id: 'log-2', title: 'Plan upgraded', desc: 'VR Mall: Starter → Professional', time: '5 hours ago · Admin' },
  { id: 'log-3', title: 'Security alert resolved', desc: 'Unauthorized access attempt at ITC Grand Chola', time: '1 day ago · System' },
  { id: 'log-4', title: 'New location added', desc: 'Phoenix MarketCity - Velachery Branch', time: '2 days ago · Client Admin' },
  { id: 'log-5', title: 'Payment received', desc: 'Apollo Hospital - ₹39,999 cleared', time: '3 days ago · System' },
  { id: 'log-6', title: 'Feature flag toggled', desc: 'API Access enabled for ITC Grand Chola', time: '4 days ago · Admin' }
];

const Analytics = () => {
  const [loading, setLoading] = useState(false);
  const [showOnboardModal, setShowOnboardModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('All'); // 'All', 'Active', 'Trial', 'Inactive'
  
  // Expanded chain IDs
  const [expandedChains, setExpandedChains] = useState({ 'ch-1': true });

  // Onboard client form state
  const [clientForm, setClientForm] = useState({
    name: '',
    chainName: '',
    city: 'Chennai',
    tier: 'Professional',
    mrr: '9999',
    status: 'active'
  });

  // Dynamic chains and standalone lists
  const [chains, setChains] = useState(initialChains);
  const [standalone, setStandalone] = useState(initialStandalone);
  const [auditLogs, setAuditLogs] = useState(initialAuditLogs);
  const [dbLocsCount, setDbLocsCount] = useState(0);

  // Synchronize new locations from database and merge
  const fetchDatabaseLocations = async () => {
    try {
      setLoading(true);
      // Query locations table
      const { data: dbLocs } = await supabase.from('locations').select('*');
      
      if (dbLocs) {
        setDbLocsCount(dbLocs.length);
        
        if (dbLocs.length > 0) {
          const chainGroups = {};
          const standaloneClients = [];

          dbLocs.forEach(loc => {
            const isStandalone = !loc.company_id || loc.company_name === 'Standalone' || !loc.company_name;
            
            const mapped = {
              id: loc.id,
              name: loc.name,
              city: loc.city || 'Chennai',
              staff: loc.staff_count || 8,
              tier: loc.tier || 'Professional',
              live: Math.floor(Math.random() * 25), // Mock live vehicles dynamically
              fee: loc.monthly_fee || '₹9,999/mo',
              status: loc.status || 'active'
            };

            if (isStandalone) {
              standaloneClients.push(mapped);
            } else {
              const chainName = loc.company_name;
              if (!chainGroups[chainName]) {
                chainGroups[chainName] = {
                  id: loc.company_id || `ch-${chainName.toLowerCase().replace(/\s/g, '-')}`,
                  name: chainName,
                  initials: chainName.substring(0, 3).toUpperCase(),
                  isChain: true,
                  branchCount: 0,
                  branches: [],
                  mrr: 0,
                  live: 0
                };
              }
              chainGroups[chainName].branches.push(mapped);
              chainGroups[chainName].branchCount += 1;
              chainGroups[chainName].live += mapped.live;
              
              // Accumulate MRR
              const feeNum = parseInt(mapped.fee.replace(/[^0-9]/g, '')) || 0;
              chainGroups[chainName].mrr += feeNum;
            }
          });

          // Format chains for rendering
          const formattedChains = Object.values(chainGroups).map(c => ({
            ...c,
            subtext: `${c.branches.map(b => b.city).filter((v, i, a) => a.indexOf(v) === i).join(' · ')} · ${c.branchCount * 8} staff`,
            mrr: `₹${(c.mrr / 1000).toFixed(0)}K`
          }));

          setChains(formattedChains);
          setStandalone(standaloneClients);
        } else {
          setChains(initialChains);
          setStandalone(initialStandalone);
        }
      }

      // Fetch audit logs
      const { data: dbLogs } = await supabase
        .from('platform_audit_logs')
        .select('*')
        .order('created_at', { ascending: false });

      if (dbLogs && dbLogs.length > 0) {
        const mappedLogs = dbLogs.map(l => {
          // Compute friendly timing
          const diff = Date.now() - new Date(l.created_at).getTime();
          const mins = Math.floor(diff / 60000);
          let timeStr = 'Just now · Admin';
          if (mins > 0 && mins < 60) timeStr = `${mins}m ago · Admin`;
          else if (mins >= 60 && mins < 1440) timeStr = `${Math.floor(mins / 60)}h ago · Admin`;
          else if (mins >= 1440) timeStr = `${Math.floor(mins / 1440)} days ago · Admin`;

          return {
            id: l.id,
            title: l.title,
            desc: l.description,
            time: timeStr
          };
        });
        setAuditLogs(mappedLogs);
      } else {
        setAuditLogs(initialAuditLogs);
      }

    } catch (e) {
      console.error('Error fetching database locations:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDatabaseLocations();
  }, []);

  const handleToggleChain = (chainId) => {
    setExpandedChains(prev => ({
      ...prev,
      [chainId]: !prev[chainId]
    }));
  };

  const handleOnboardSubmit = async (e) => {
    e.preventDefault();
    if (!clientForm.name.trim()) return;

    setLoading(true);
    try {
      // 1. Insert into Supabase locations table
      const { data, error } = await supabase
        .from('locations')
        .insert([{
          name: clientForm.name,
          company_name: clientForm.chainName || 'Standalone',
          city: clientForm.city,
          country: 'India',
          tier: clientForm.tier,
          status: clientForm.status,
          staff_count: 8,
          vehicles_processed: 120000,
          monthly_fee: clientForm.tier === 'Enterprise' ? '₹24,999/mo' : clientForm.tier === 'Starter' ? '₹4,999/mo' : '₹9,999/mo'
        }])
        .select();

      if (error) throw error;

      // Add to platform audit logs in Supabase
      await supabase.from('platform_audit_logs').insert([{
        title: 'Client onboarded',
        description: `${clientForm.name} - ${clientForm.city}`
      }]);

      setShowOnboardModal(false);
      setClientForm({ name: '', chainName: '', city: 'Chennai', tier: 'Professional', mrr: '9999', status: 'active' });
      fetchDatabaseLocations();
      alert('Client onboarded successfully!');
    } catch (err) {
      console.error(err);
      alert('Failed to onboard client: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSeedDatabase = async () => {
    setLoading(true);
    try {
      // Clear database
      await supabase.from('locations').delete().neq('id', '00000000-0000-0000-0000-000000000000');
      await supabase.from('companies').delete().neq('id', '00000000-0000-0000-0000-000000000000');
      await supabase.from('cities').delete().neq('id', '00000000-0000-0000-0000-000000000000');
      await supabase.from('platform_audit_logs').delete().neq('id', '00000000-0000-0000-0000-000000000000');

      // Seed cities
      const seededCities = {};
      const cityList = ['Chennai', 'Mumbai', 'Bengaluru', 'New Delhi', 'Pune', 'Hyderabad'];
      for (const cityName of cityList) {
        const { data: cData } = await supabase.from('cities').insert([{ city_name: cityName }]).select();
        if (cData?.[0]) seededCities[cityName] = cData[0].id;
      }

      // Seed companies
      const seededCompanies = {};
      const companyList = ['Taj Hotels Group', 'ITC Hotels', 'Phoenix Mills Ltd', 'Apollo Hospitals Enterprise'];
      for (const compName of companyList) {
        const { data: coData } = await supabase.from('companies').insert([{ company_name: compName }]).select();
        if (coData?.[0]) seededCompanies[compName] = coData[0].id;
      }

      // Seed locations
      // taj branches
      const tajBranches = [
        { name: 'Taj Coromandel', city: 'Chennai', tier: 'Professional', status: 'active', staff_count: 6, vehicles_processed: 62000, monthly_fee: '₹9,999/mo' },
        { name: 'Taj Connemara', city: 'Chennai', tier: 'Professional', status: 'active', staff_count: 8, vehicles_processed: 48000, monthly_fee: '₹9,999/mo' },
        { name: 'Taj Mahal Palace, Mumbai', city: 'Mumbai', tier: 'Enterprise', status: 'active', staff_count: 18, vehicles_processed: 92000, monthly_fee: '₹24,999/mo' },
        { name: 'Taj West End, Bengaluru', city: 'Bengaluru', tier: 'Professional', status: 'active', staff_count: 10, vehicles_processed: 42120, monthly_fee: '₹9,999/mo' }
      ];
      for (const b of tajBranches) {
        await supabase.from('locations').insert([{
          name: b.name,
          company_name: 'Taj Hotels Group',
          company_id: seededCompanies['Taj Hotels Group'],
          city: b.city,
          city_id: seededCities[b.city],
          tier: b.tier,
          status: b.status,
          staff_count: b.staff_count,
          vehicles_processed: b.vehicles_processed,
          monthly_fee: b.monthly_fee
        }]);
      }

      // itc branches
      const itcBranches = [
        { name: 'ITC Grand Chola', city: 'Chennai', tier: 'Enterprise', status: 'active', staff_count: 18, vehicles_processed: 220000, monthly_fee: '₹24,999/mo' },
        { name: 'ITC Gardenia', city: 'Bengaluru', tier: 'Professional', status: 'active', staff_count: 14, vehicles_processed: 150000, monthly_fee: '₹9,999/mo' },
        { name: 'ITC Maurya', city: 'New Delhi', tier: 'Professional', status: 'active', staff_count: 15, vehicles_processed: 103600, monthly_fee: '₹9,999/mo' }
      ];
      for (const b of itcBranches) {
        await supabase.from('locations').insert([{
          name: b.name,
          company_name: 'ITC Hotels',
          company_id: seededCompanies['ITC Hotels'],
          city: b.city,
          city_id: seededCities[b.city],
          tier: b.tier,
          status: b.status,
          staff_count: b.staff_count,
          vehicles_processed: b.vehicles_processed,
          monthly_fee: b.monthly_fee
        }]);
      }

      // phoenix branches
      const phoenixBranches = [
        { name: 'Phoenix MarketCity, Chennai', city: 'Chennai', tier: 'Enterprise', status: 'active', staff_count: 24, vehicles_processed: 210080, monthly_fee: '₹24,999/mo' },
        { name: 'Phoenix Palladium, Mumbai', city: 'Mumbai', tier: 'Enterprise', status: 'active', staff_count: 30, vehicles_processed: 263000, monthly_fee: '₹24,999/mo' },
        { name: 'Phoenix MarketCity, Pune', city: 'Pune', tier: 'Professional', status: 'active', staff_count: 20, vehicles_processed: 200000, monthly_fee: '₹9,999/mo' }
      ];
      for (const b of phoenixBranches) {
        await supabase.from('locations').insert([{
          name: b.name,
          company_name: 'Phoenix Mills Ltd',
          company_id: seededCompanies['Phoenix Mills Ltd'],
          city: b.city,
          city_id: seededCities[b.city],
          tier: b.tier,
          status: b.status,
          staff_count: b.staff_count,
          vehicles_processed: b.vehicles_processed,
          monthly_fee: b.monthly_fee
        }]);
      }

      // apollo branches
      const apolloBranches = [
        { name: 'Apollo Greams Road', city: 'Chennai', tier: 'Enterprise', status: 'active', staff_count: 22, vehicles_processed: 205110, monthly_fee: '₹24,999/mo' },
        { name: 'Apollo Specialty, Chennai', city: 'Chennai', tier: 'Professional', status: 'active', staff_count: 18, vehicles_processed: 150000, monthly_fee: '₹9,999/mo' },
        { name: 'Apollo Health City, Hyderabad', city: 'Hyderabad', tier: 'Enterprise', status: 'active', staff_count: 20, vehicles_processed: 250000, monthly_fee: '₹24,999/mo' }
      ];
      for (const b of apolloBranches) {
        await supabase.from('locations').insert([{
          name: b.name,
          company_name: 'Apollo Hospitals Enterprise',
          company_id: seededCompanies['Apollo Hospitals Enterprise'],
          city: b.city,
          city_id: seededCities[b.city],
          tier: b.tier,
          status: b.status,
          staff_count: b.staff_count,
          vehicles_processed: b.vehicles_processed,
          monthly_fee: b.monthly_fee
        }]);
      }

      // standalones
      const standalones = [
        { name: 'Grand Hyatt Chennai', city: 'Chennai', tier: 'Professional', status: 'active', staff_count: 8, vehicles_processed: 125000, monthly_fee: '₹9,999/mo' },
        { name: 'VR Mall', city: 'Chennai', tier: 'Starter', status: 'active', staff_count: 5, vehicles_processed: 45000, monthly_fee: '₹4,999/mo' },
        { name: 'Express Avenue', city: 'Chennai', tier: 'Professional', status: 'inactive', staff_count: 8, vehicles_processed: 0, monthly_fee: '₹9,999/mo' },
        { name: 'TIDEL Park', city: 'Chennai', tier: 'Starter', status: 'trial', staff_count: 4, vehicles_processed: 3000, monthly_fee: 'Free Trial' }
      ];
      for (const b of standalones) {
        await supabase.from('locations').insert([{
          name: b.name,
          company_name: 'Standalone',
          company_id: null,
          city: b.city,
          city_id: seededCities[b.city],
          tier: b.tier,
          status: b.status,
          staff_count: b.staff_count,
          vehicles_processed: b.vehicles_processed,
          monthly_fee: b.monthly_fee
        }]);
      }

      // Seed audit logs
      const auditPayload = initialAuditLogs.map(l => ({
        title: l.title,
        description: l.desc
      }));
      await supabase.from('platform_audit_logs').insert(auditPayload);

      fetchDatabaseLocations();
      alert('Database seeded with platform overview data!');
    } catch (e) {
      console.error(e);
      alert('Failed to seed platform overview: ' + e.message);
    } finally {
      setLoading(false);
    }
  };

  const handleClearDatabase = async () => {
    setLoading(true);
    try {
      await supabase.from('locations').delete().neq('id', '00000000-0000-0000-0000-000000000000');
      await supabase.from('companies').delete().neq('id', '00000000-0000-0000-0000-000000000000');
      await supabase.from('cities').delete().neq('id', '00000000-0000-0000-0000-000000000000');
      await supabase.from('platform_audit_logs').delete().neq('id', '00000000-0000-0000-0000-000000000000');
      
      setChains([]);
      setStandalone([]);
      setAuditLogs([]);
      setDbLocsCount(0);
      alert('Database cleared!');
    } catch (e) {
      console.error(e);
      alert('Failed to clear database: ' + e.message);
    } finally {
      setLoading(false);
    }
  };

  const handleExport = () => {
    const csvContent = [
      ['Platform Admin Overview Report'],
      ['Generated At', new Date().toLocaleString()],
      [],
      ['Metric Summary'],
      ['Chain Groups', 24],
      ['Total Clients', 152],
      ['Active Branches', 287],
      ['Vehicles Today', '3,841'],
      ['Monthly Revenue', '₹18.5L'],
      ['Fraud Blocked', 23],
      [],
      ['Standalone Clients'],
      ['Name', 'City', 'Staff', 'Tier', 'Live Count', 'MRR', 'Status'],
      ...standalone.map(s => [s.name, s.city, s.staff, s.tier, s.live, s.fee, s.status])
    ].map(e => e.join(",")).join("\n");

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", `platform_overview_report_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Filter chains & standalone clients
  const filterMatches = (name, city) => {
    const q = searchQuery.toLowerCase();
    return name.toLowerCase().includes(q) || city.toLowerCase().includes(q);
  };

  const filteredChains = chains.map(c => {
    const matchedBranches = c.branches.filter(b => {
      const matchSearch = filterMatches(b.name, b.city);
      const matchStatus = statusFilter === 'All' || b.status.toLowerCase() === statusFilter.toLowerCase();
      return matchSearch && matchStatus;
    });

    if (matchedBranches.length > 0 || filterMatches(c.name, '')) {
      return {
        ...c,
        branches: matchedBranches,
        branchCount: matchedBranches.length
      };
    }
    return null;
  }).filter(Boolean);

  const filteredStandalone = standalone.filter(s => {
    const matchSearch = filterMatches(s.name, s.city);
    const matchStatus = statusFilter === 'All' || s.status.toLowerCase() === statusFilter.toLowerCase();
    return matchSearch && matchStatus;
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', width: '100%' }}>
      
      {/* Title Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.85rem', fontWeight: '800', color: '#ffffff', marginBottom: '0.25rem' }}>Platform Overview</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', fontWeight: '500' }}>
            System-wide metrics, clients, billing & health
          </p>
        </div>
        <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
          {dbLocsCount > 0 && (
            <button
              onClick={handleClearDatabase}
              disabled={loading}
              style={{
                backgroundColor: 'rgba(239, 68, 68, 0.08)',
                color: '#ef4444',
                border: '1px solid rgba(239, 68, 68, 0.15)',
                borderRadius: '10px',
                padding: '0.65rem 1rem',
                fontSize: '0.85rem',
                fontWeight: '700',
                cursor: 'pointer',
                transition: 'all 0.15s ease'
              }}
            >
              Clear Database
            </button>
          )}
          {dbLocsCount === 0 && (
            <button
              onClick={handleSeedDatabase}
              disabled={loading}
              style={{
                backgroundColor: 'rgba(255, 255, 255, 0.03)',
                color: 'var(--text-muted)',
                border: '1px solid var(--border-color)',
                borderRadius: '10px',
                padding: '0.65rem 1rem',
                fontSize: '0.85rem',
                fontWeight: '700',
                cursor: 'pointer',
                transition: 'all 0.15s ease'
              }}
            >
              {loading ? 'Seeding...' : 'Seed Demo Data'}
            </button>
          )}
          <button 
            onClick={handleExport}
            style={{
              backgroundColor: 'rgba(255,255,255,0.03)',
              color: 'var(--text-muted)',
              border: '1px solid var(--border-color)',
              borderRadius: '10px',
              padding: '0.65rem 1.15rem',
              fontSize: '0.85rem',
              fontWeight: '700',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem'
            }}
          >
            <Download size={15} />
            <span>Export</span>
          </button>
          <button
            onClick={() => setShowOnboardModal(true)}
            style={{
              backgroundColor: '#fbbf24',
              color: '#080c14',
              border: 'none',
              borderRadius: '10px',
              padding: '0.65rem 1.15rem',
              fontSize: '0.85rem',
              fontWeight: '700',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              boxShadow: '0 4px 15px rgba(251, 191, 36, 0.15)',
              transition: 'all 0.15s ease'
            }}
            onMouseEnter={(e) => e.currentTarget.style.filter = 'brightness(1.1)'}
            onMouseLeave={(e) => e.currentTarget.style.filter = 'none'}
          >
            <Plus size={15} />
            <span>Onboard Client</span>
          </button>
        </div>
      </div>

      {/* KPI Stats Row (6 Cards) */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
        gap: '1rem'
      }}>
        {/* Chain Groups */}
        <div style={statCardStyle}>
          <div style={cardHeaderStyle}>
            <span style={statLabelStyle}>Chain Groups</span>
            <div style={{ color: 'var(--text-muted)' }}><Building2 size={16} /></div>
          </div>
          <div style={statNumStyle}>24</div>
          <div style={{ ...trendSubtextStyle, color: '#10b981' }}>↗ +2 this quarter</div>
        </div>

        {/* Total Clients */}
        <div style={statCardStyle}>
          <div style={cardHeaderStyle}>
            <span style={statLabelStyle}>Total Clients</span>
            <div style={{ color: 'var(--text-muted)' }}><Users size={16} /></div>
          </div>
          <div style={statNumStyle}>152</div>
          <div style={{ ...trendSubtextStyle, color: '#10b981' }}>↗ +8 this month</div>
        </div>

        {/* Active Branches */}
        <div style={statCardStyle}>
          <div style={cardHeaderStyle}>
            <span style={statLabelStyle}>Active Branches</span>
            <div style={{ color: 'var(--text-muted)' }}><Globe size={16} /></div>
          </div>
          <div style={statNumStyle}>287</div>
          <div style={{ ...trendSubtextStyle, color: '#10b981' }}>↗ +14 this month</div>
        </div>

        {/* Vehicles Today */}
        <div style={statCardStyle}>
          <div style={cardHeaderStyle}>
            <span style={statLabelStyle}>Vehicles Today</span>
            <div style={{ color: 'var(--text-muted)' }}><Car size={16} /></div>
          </div>
          <div style={statNumStyle}>3,841</div>
          <div style={{ ...trendSubtextStyle, color: '#10b981' }}>↗ +12% vs yesterday</div>
        </div>

        {/* Monthly Revenue */}
        <div style={statCardStyle}>
          <div style={cardHeaderStyle}>
            <span style={statLabelStyle}>Monthly Revenue</span>
            <div style={{ color: 'var(--text-muted)' }}><TrendingUp size={16} /></div>
          </div>
          <div style={statNumStyle}>₹18.5L</div>
          <div style={{ ...trendSubtextStyle, color: '#10b981' }}>↗ +18.4% MoM</div>
        </div>

        {/* Fraud Blocked */}
        <div style={statCardStyle}>
          <div style={cardHeaderStyle}>
            <span style={statLabelStyle}>Fraud Blocked</span>
            <div style={{ color: '#ef4444' }}><ShieldAlert size={16} /></div>
          </div>
          <div style={statNumStyle}>23</div>
          <div style={{ ...trendSubtextStyle, color: '#10b981' }}>↗ ₹4.2L savings</div>
        </div>
      </div>

      {/* System Health Status Bar */}
      <div style={{
        backgroundColor: 'var(--bg-card)',
        border: '1px solid var(--border-color)',
        borderRadius: '12px',
        padding: '1rem 1.25rem',
        display: 'flex',
        flexDirection: 'column',
        gap: '0.85rem'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontSize: '0.75rem', fontWeight: '800', color: '#ffffff', letterSpacing: '0.04em', textTransform: 'uppercase' }}>
            System Health
          </span>
          <span style={{ fontSize: '0.7rem', fontWeight: '800', color: '#10b981', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
            ● ALL SYSTEMS OPERATIONAL
          </span>
        </div>

        {/* 4 Health Metrics Indicators */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1rem' }}>
          
          <div style={healthCardStyle}>
            <Server size={14} style={{ color: 'var(--text-muted)' }} />
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <span style={healthNameStyle}>API Gateway</span>
              <span style={healthValStyle}>99.98%</span>
            </div>
            <div style={{ ...healthStatusStyle, backgroundColor: '#10b981' }} />
          </div>

          <div style={healthCardStyle}>
            <Database size={14} style={{ color: 'var(--text-muted)' }} />
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <span style={healthNameStyle}>Database</span>
              <span style={healthValStyle}>12ms avg</span>
            </div>
            <div style={{ ...healthStatusStyle, backgroundColor: '#10b981' }} />
          </div>

          <div style={healthCardStyle}>
            <Wifi size={14} style={{ color: 'var(--text-muted)' }} />
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <span style={healthNameStyle}>Real-time</span>
              <span style={healthValStyle}>Live</span>
            </div>
            <div style={{ ...healthStatusStyle, backgroundColor: '#10b981' }} />
          </div>

          <div style={healthCardStyle}>
            <Zap size={14} style={{ color: 'var(--text-muted)' }} />
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <span style={healthNameStyle}>AI Services</span>
              <span style={healthValStyle}>Operational</span>
            </div>
            <div style={{ ...healthStatusStyle, backgroundColor: '#10b981' }} />
          </div>

        </div>
      </div>

      {/* Mid Section split: Chain & Client Management vs Audit Logs */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: '1.7fr 1fr',
        gap: '1.5rem',
        alignItems: 'stretch'
      }}>
        
        {/* Chain & Client Management Panel */}
        <div style={panelStyle}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h2 style={panelTitleStyle}>Chain & Client Management</h2>
            <span style={{ fontSize: '0.75rem', fontWeight: '500', color: 'var(--text-muted)' }}>
              {filteredChains.length} chains · {filteredStandalone.length + filteredChains.reduce((sum, c) => sum + c.branchCount, 0)} branches
            </span>
          </div>

          {/* Controls Filter bar */}
          <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
            {/* Search Input */}
            <div style={{
              position: 'relative',
              flexGrow: 1,
              display: 'flex',
              alignItems: 'center'
            }}>
              <Search size={15} style={{ position: 'absolute', left: '0.85rem', color: 'var(--text-muted)' }} />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search chains, branches or cities..."
                style={{
                  width: '100%',
                  padding: '0.55rem 0.85rem 0.55rem 2.25rem',
                  borderRadius: '10px',
                  border: '1px solid var(--border-color)',
                  backgroundColor: '#111726',
                  color: '#ffffff',
                  fontSize: '0.8rem',
                  outline: 'none'
                }}
              />
            </div>

            {/* Filter tab pills */}
            <div style={{ display: 'flex', gap: '0.35rem', backgroundColor: '#111726', padding: '3px', borderRadius: '10px', border: '1px solid var(--border-color)' }}>
              {['All', 'Active', 'Trial', 'Inactive'].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setStatusFilter(tab)}
                  style={{
                    padding: '0.4rem 0.8rem',
                    borderRadius: '8px',
                    border: 'none',
                    backgroundColor: statusFilter === tab ? '#fbbf24' : 'transparent',
                    color: statusFilter === tab ? '#080c14' : 'var(--text-muted)',
                    fontSize: '0.75rem',
                    fontWeight: '700',
                    cursor: 'pointer',
                    transition: 'all 0.15s ease'
                  }}
                >
                  {tab}
                </button>
              ))}
            </div>
          </div>

          {/* Groups list */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginTop: '0.5rem' }}>
            
            {/* Chain Groups */}
            {filteredChains.map((c) => {
              const isExpanded = expandedChains[c.id];
              return (
                <div 
                  key={c.id}
                  style={{
                    backgroundColor: '#111726',
                    border: '1px solid var(--border-color)',
                    borderRadius: '12px',
                    overflow: 'hidden'
                  }}
                >
                  {/* Chain Row Header */}
                  <div 
                    onClick={() => handleToggleChain(c.id)}
                    style={{
                      padding: '1rem',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.85rem',
                      cursor: 'pointer',
                      borderBottom: isExpanded ? '1px solid var(--border-color)' : 'none',
                      backgroundColor: 'rgba(255,255,255,0.01)'
                    }}
                  >
                    {/* initials avatar */}
                    <div style={{
                      width: '32px',
                      height: '32px',
                      borderRadius: '8px',
                      backgroundColor: 'rgba(251, 191, 36, 0.08)',
                      color: '#fbbf24',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '0.75rem',
                      fontWeight: '800',
                      border: '1px solid rgba(251, 191, 36, 0.15)',
                      flexShrink: 0
                    }}>
                      {c.initials}
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', flexGrow: 1, minWidth: 0 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <span style={{ fontSize: '0.85rem', fontWeight: '800', color: '#ffffff' }}>{c.name}</span>
                        <span style={{ fontSize: '0.55rem', fontWeight: '800', color: '#fbbf24', border: '1px solid rgba(251, 191, 36, 0.25)', padding: '0.1rem 0.35rem', borderRadius: '4px' }}>CHAIN</span>
                        <span style={{ fontSize: '0.65rem', fontWeight: '700', backgroundColor: 'rgba(255,255,255,0.03)', color: 'var(--text-muted)', padding: '0.1rem 0.35rem', borderRadius: '4px' }}>{c.branchCount} branches</span>
                      </div>
                      <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap', marginTop: '0.15rem' }}>
                        {c.subtext}
                      </span>
                    </div>

                    {/* Right side stats */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', flexShrink: 0 }}>
                      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
                        <span style={{ fontSize: '0.6rem', fontWeight: '800', color: 'var(--text-muted)' }}>GROUP MRR</span>
                        <span style={{ fontSize: '0.8rem', fontWeight: '800', color: '#ffffff' }}>{c.mrr}</span>
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
                        <span style={{ fontSize: '0.6rem', fontWeight: '800', color: 'var(--text-muted)' }}>LIVE</span>
                        <span style={{ fontSize: '0.8rem', fontWeight: '800', color: '#10b981' }}>{c.live}</span>
                      </div>
                      <button style={{
                        backgroundColor: 'transparent',
                        border: 'none',
                        color: '#fbbf24',
                        fontSize: '0.75rem',
                        fontWeight: '700',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.25rem',
                        cursor: 'pointer'
                      }}>
                        <span>Group</span>
                        {isExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                      </button>
                    </div>
                  </div>

                  {/* Branches List (Accordion Children) */}
                  {isExpanded && (
                    <div style={{ display: 'flex', flexDirection: 'column', backgroundColor: 'rgba(0,0,0,0.1)' }}>
                      {c.branches.map((b) => (
                        <div 
                          key={b.id}
                          style={{
                            padding: '0.75rem 1rem 0.75rem 3.25rem',
                            borderBottom: '1px solid rgba(255,255,255,0.03)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between'
                          }}
                        >
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.15rem' }}>
                            <span style={{ fontSize: '0.8rem', fontWeight: '800', color: '#ffffff' }}>{b.name}</span>
                            <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>
                              {b.city} · {b.staff} staff
                            </span>
                          </div>

                          <div style={{ display: 'flex', alignItems: 'center', gap: '2rem' }}>
                            {/* Tier Badge */}
                            <span style={{
                              fontSize: '0.6rem',
                              fontWeight: '800',
                              color: b.tier === 'Enterprise' ? '#fbbf24' : '#3b82f6',
                              backgroundColor: b.tier === 'Enterprise' ? 'rgba(251,191,36,0.06)' : 'rgba(59,130,246,0.06)',
                              border: b.tier === 'Enterprise' ? '1px solid rgba(251,191,36,0.15)' : '1px solid rgba(59,130,246,0.15)',
                              padding: '0.15rem 0.45rem',
                              borderRadius: '4px'
                            }}>
                              {b.tier}
                            </span>

                            {/* Live vehicles */}
                            <span style={{ fontSize: '0.8rem', fontWeight: '800', color: '#ffffff', width: '20px', textAlign: 'center' }}>
                              {b.live}
                            </span>

                            {/* Monthly Fee */}
                            <span style={{ fontSize: '0.75rem', fontWeight: '700', color: 'var(--text-muted)', width: '65px', textAlign: 'right' }}>
                              {b.fee}
                            </span>

                            {/* Status */}
                            <span style={{
                              fontSize: '0.7rem',
                              fontWeight: '700',
                              color: b.status === 'active' ? '#10b981' : b.status === 'trial' ? '#3b82f6' : '#64748b',
                              width: '55px'
                            }}>
                              ● {b.status}
                            </span>

                            {/* Action */}
                            <button style={{
                              backgroundColor: 'transparent',
                              border: 'none',
                              color: '#fbbf24',
                              fontSize: '0.75rem',
                              fontWeight: '700',
                              cursor: 'pointer'
                            }}>
                              View
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}

            {/* Standalone Clients Title */}
            {filteredStandalone.length > 0 && (
              <div style={{
                fontSize: '0.65rem',
                fontWeight: '800',
                color: 'var(--text-muted)',
                letterSpacing: '0.08em',
                textTransform: 'uppercase',
                marginTop: '0.5rem',
                marginBottom: '0.25rem'
              }}>
                Standalone Clients ({filteredStandalone.length})
              </div>
            )}

            {/* Standalone Clients Cards */}
            {filteredStandalone.map((s) => (
              <div 
                key={s.id}
                style={{
                  backgroundColor: '#111726',
                  border: '1px solid var(--border-color)',
                  borderRadius: '12px',
                  padding: '0.85rem 1rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
                  <div style={{
                    width: '32px',
                    height: '32px',
                    borderRadius: '8px',
                    backgroundColor: 'rgba(255, 255, 255, 0.02)',
                    border: '1px solid var(--border-color)',
                    color: 'var(--text-muted)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}><Building2 size={15} /></div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.15rem' }}>
                    <span style={{ fontSize: '0.8rem', fontWeight: '800', color: '#ffffff' }}>{s.name}</span>
                    <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>
                      {s.city} · {s.staff} staff
                    </span>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '2rem' }}>
                  {/* Tier */}
                  <span style={{
                    fontSize: '0.6rem',
                    fontWeight: '800',
                    color: s.tier === 'Enterprise' ? '#fbbf24' : s.tier === 'Starter' ? '#9ca3af' : '#3b82f6',
                    backgroundColor: s.tier === 'Enterprise' ? 'rgba(251,191,36,0.06)' : s.tier === 'Starter' ? 'rgba(156,163,175,0.06)' : 'rgba(59,130,246,0.06)',
                    border: s.tier === 'Enterprise' ? '1px solid rgba(251,191,36,0.15)' : s.tier === 'Starter' ? '1px solid rgba(156,163,175,0.15)' : '1px solid rgba(59,130,246,0.15)',
                    padding: '0.15rem 0.45rem',
                    borderRadius: '4px'
                  }}>
                    {s.tier}
                  </span>

                  {/* Live */}
                  <span style={{ fontSize: '0.8rem', fontWeight: '800', color: '#ffffff', width: '20px', textAlign: 'center' }}>
                    {s.live}
                  </span>

                  {/* Fee */}
                  <span style={{ fontSize: '0.75rem', fontWeight: '700', color: 'var(--text-muted)', width: '65px', textAlign: 'right' }}>
                    {s.fee}
                  </span>

                  {/* Status */}
                  <span style={{
                    fontSize: '0.7rem',
                    fontWeight: '700',
                    color: s.status === 'active' ? '#10b981' : s.status === 'trial' ? '#3b82f6' : '#64748b',
                    width: '55px'
                  }}>
                    ● {s.status}
                  </span>

                  {/* View Action */}
                  <button style={{
                    backgroundColor: 'transparent',
                    border: 'none',
                    color: '#fbbf24',
                    fontSize: '0.75rem',
                    fontWeight: '700',
                    cursor: 'pointer'
                  }}>
                    View
                  </button>
                </div>
              </div>
            ))}

            {filteredChains.length === 0 && filteredStandalone.length === 0 && (
              <div style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '2rem', fontSize: '0.8rem' }}>
                No clients found matching the search/filter criteria.
              </div>
            )}

          </div>
        </div>

        {/* Audit Logs Panel */}
        <div style={panelStyle}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h2 style={panelTitleStyle}>Audit Logs</h2>
            <span style={{ fontSize: '0.75rem', fontWeight: '700', color: '#fbbf24', cursor: 'pointer' }}>View all</span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem', height: '100%', justifyContent: 'space-around' }}>
            {auditLogs.map((log) => (
              <div 
                key={log.id}
                style={{
                  display: 'flex',
                  gap: '0.75rem',
                  padding: '0.75rem',
                  backgroundColor: '#111726',
                  borderRadius: '12px',
                  border: '1px solid var(--border-color)',
                  alignItems: 'flex-start'
                }}
              >
                {/* Icon wrapper based on log title */}
                <div style={{
                  width: '28px',
                  height: '28px',
                  borderRadius: '6px',
                  backgroundColor: log.title.toLowerCase().includes('alert') ? 'rgba(239, 68, 68, 0.08)' : 'rgba(255, 255, 255, 0.03)',
                  color: log.title.toLowerCase().includes('alert') ? '#ef4444' : 'var(--text-muted)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0
                }}>
                  {log.title.toLowerCase().includes('onboard') ? <Plus size={14} /> :
                   log.title.toLowerCase().includes('upgrade') ? <TrendingUp size={14} /> :
                   log.title.toLowerCase().includes('alert') ? <ShieldAlert size={14} /> : <Clock size={14} />}
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.15rem' }}>
                  <span style={{ fontSize: '0.8rem', fontWeight: '800', color: '#ffffff' }}>
                    {log.title}
                  </span>
                  <span style={{ fontSize: '0.75rem', fontWeight: '600', color: 'var(--text-muted)' }}>
                    {log.desc}
                  </span>
                  <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)', opacity: 0.7, marginTop: '0.15rem' }}>
                    {log.time}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* Bottom row: Subscription Distribution vs Revenue by City */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: '1.5rem',
        alignItems: 'stretch'
      }}>
        
        {/* Subscription Distribution Card */}
        <div style={panelStyle}>
          <h2 style={panelTitleStyle}>Subscription Distribution</h2>
          
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem', marginTop: '0.5rem' }}>
            
            {/* Starter */}
            <div style={subCardStyle}>
              <span style={subNumStyle}>42</span>
              <span style={subLabelStyle}>Starter</span>
              <span style={subCostStyle}>₹2.1L/mo</span>
            </div>

            {/* Professional */}
            <div style={subCardStyle}>
              <span style={subNumStyle}>78</span>
              <span style={subLabelStyle}>Professional</span>
              <span style={subCostStyle}>₹7.8L/mo</span>
            </div>

            {/* Enterprise */}
            <div style={subCardStyle}>
              <span style={subNumStyle}>32</span>
              <span style={subLabelStyle}>Enterprise</span>
              <span style={subCostStyle}>₹8.6L/mo</span>
            </div>

          </div>
        </div>

        {/* Revenue by City Card */}
        <div style={panelStyle}>
          <h2 style={panelTitleStyle}>Revenue by City</h2>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginTop: '0.5rem' }}>
            
            {/* Chennai */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
              <div style={cityHeaderStyle}>
                <span>Chennai <span style={{ color: 'var(--text-muted)', fontWeight: '500' }}>· 48 clients</span></span>
                <span style={{ color: '#ffffff' }}>₹8.7L</span>
              </div>
              <div style={cityBarContainerStyle}>
                <div style={{ ...cityBarFillStyle, width: '80%' }} />
              </div>
            </div>

            {/* Bengaluru */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
              <div style={cityHeaderStyle}>
                <span>Bengaluru <span style={{ color: 'var(--text-muted)', fontWeight: '500' }}>· 32 clients</span></span>
                <span style={{ color: '#ffffff' }}>₹5.4L</span>
              </div>
              <div style={cityBarContainerStyle}>
                <div style={{ ...cityBarFillStyle, width: '50%' }} />
              </div>
            </div>

            {/* Mumbai */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
              <div style={cityHeaderStyle}>
                <span>Mumbai <span style={{ color: 'var(--text-muted)', fontWeight: '500' }}>· 22 clients</span></span>
                <span style={{ color: '#ffffff' }}>₹3.2L</span>
              </div>
              <div style={cityBarContainerStyle}>
                <div style={{ ...cityBarFillStyle, width: '35%' }} />
              </div>
            </div>

            {/* Hyderabad */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
              <div style={cityHeaderStyle}>
                <span>Hyderabad <span style={{ color: 'var(--text-muted)', fontWeight: '500' }}>· 18 clients</span></span>
                <span style={{ color: '#ffffff' }}>₹1.2L</span>
              </div>
              <div style={cityBarContainerStyle}>
                <div style={{ ...cityBarFillStyle, width: '15%' }} />
              </div>
            </div>

          </div>
        </div>

      </div>

      {/* Onboard Client Modal */}
      {showOnboardModal && (
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
            backgroundColor: '#0d1321',
            border: '1.5px solid var(--border-color)',
            borderRadius: '16px',
            padding: '1.5rem',
            width: '420px',
            maxWidth: '90%',
            display: 'flex',
            flexDirection: 'column',
            gap: '1.25rem',
            boxShadow: '0 20px 40px rgba(0,0,0,0.5)'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 style={{ fontSize: '1.1rem', fontWeight: '800', color: '#ffffff' }}>Onboard Client</h3>
              <button 
                onClick={() => setShowOnboardModal(false)}
                style={{ backgroundColor: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleOnboardSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                <label style={{ fontSize: '0.65rem', fontWeight: '700', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Branch Name *</label>
                <input
                  type="text"
                  required
                  value={clientForm.name}
                  onChange={(e) => setClientForm(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="e.g. Radisson Blu"
                  style={inputStyle}
                />
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                <label style={{ fontSize: '0.65rem', fontWeight: '700', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Chain Name (leave blank if standalone)</label>
                <input
                  type="text"
                  value={clientForm.chainName}
                  onChange={(e) => setClientForm(prev => ({ ...prev, chainName: e.target.value }))}
                  placeholder="e.g. Taj Hotels Group"
                  style={inputStyle}
                />
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                <label style={{ fontSize: '0.65rem', fontWeight: '700', color: 'var(--text-muted)', textTransform: 'uppercase' }}>City</label>
                <input
                  type="text"
                  value={clientForm.city}
                  onChange={(e) => setClientForm(prev => ({ ...prev, city: e.target.value }))}
                  placeholder="e.g. Chennai"
                  style={inputStyle}
                />
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                <label style={{ fontSize: '0.65rem', fontWeight: '700', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Subscription Tier</label>
                <select
                  value={clientForm.tier}
                  onChange={(e) => setClientForm(prev => ({ ...prev, tier: e.target.value }))}
                  style={inputStyle}
                >
                  <option value="Starter">Starter (₹4,999/mo)</option>
                  <option value="Professional">Professional (₹9,999/mo)</option>
                  <option value="Enterprise">Enterprise (₹24,999/mo)</option>
                </select>
              </div>

              <button
                type="submit"
                disabled={loading}
                style={{
                  backgroundColor: '#fbbf24',
                  color: '#080c14',
                  border: 'none',
                  borderRadius: '8px',
                  padding: '0.65rem',
                  fontSize: '0.8rem',
                  fontWeight: '700',
                  cursor: 'pointer',
                  marginTop: '0.5rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.5rem',
                  boxShadow: '0 4px 15px rgba(251, 191, 36, 0.15)'
                }}
              >
                {loading && <Loader2 size={14} className="animate-spin" />}
                <span>Onboard Client</span>
              </button>

            </form>
          </div>
        </div>
      )}

    </div>
  );
};

// CSS style configurations
const statCardStyle = {
  backgroundColor: 'var(--bg-card)',
  border: '1px solid var(--border-color)',
  borderRadius: '12px',
  padding: '1.15rem',
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'space-between',
  gap: '0.25rem'
};

const cardHeaderStyle = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  width: '100%'
};

const statLabelStyle = {
  fontSize: '0.65rem',
  fontWeight: '800',
  color: 'var(--text-muted)',
  letterSpacing: '0.04em',
  textTransform: 'uppercase'
};

const statNumStyle = {
  fontSize: '1.65rem',
  fontWeight: '850',
  color: '#ffffff',
  marginTop: '0.15rem',
  lineHeight: 1.1
};

const trendSubtextStyle = {
  fontSize: '0.65rem',
  fontWeight: '700',
  marginTop: '0.15rem'
};

const healthCardStyle = {
  display: 'flex',
  alignItems: 'center',
  gap: '0.65rem',
  backgroundColor: '#111726',
  border: '1px solid var(--border-color)',
  borderRadius: '8px',
  padding: '0.5rem 0.75rem',
  position: 'relative'
};

const healthNameStyle = {
  fontSize: '0.65rem',
  fontWeight: '800',
  color: 'var(--text-muted)'
};

const healthValStyle = {
  fontSize: '0.75rem',
  fontWeight: '800',
  color: '#ffffff',
  marginTop: '0.05rem'
};

const healthStatusStyle = {
  width: '5px',
  height: '5px',
  borderRadius: '50%',
  position: 'absolute',
  top: '50%',
  right: '0.75rem',
  transform: 'translateY(-50%)'
};

const panelStyle = {
  backgroundColor: 'var(--bg-card)',
  border: '1px solid var(--border-color)',
  borderRadius: '16px',
  padding: '1.5rem',
  display: 'flex',
  flexDirection: 'column',
  gap: '1.15rem'
};

const panelTitleStyle = {
  fontSize: '1.1rem',
  fontWeight: '800',
  color: '#ffffff'
};

const subCardStyle = {
  backgroundColor: '#111726',
  border: '1px solid var(--border-color)',
  borderRadius: '12px',
  padding: '1rem',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  gap: '0.25rem'
};

const subNumStyle = {
  fontSize: '1.5rem',
  fontWeight: '850',
  color: '#ffffff'
};

const subLabelStyle = {
  fontSize: '0.7rem',
  fontWeight: '700',
  color: 'var(--text-muted)'
};

const subCostStyle = {
  fontSize: '0.75rem',
  fontWeight: '800',
  color: '#fbbf24',
  marginTop: '0.15rem'
};

const cityHeaderStyle = {
  display: 'flex',
  justifyContent: 'space-between',
  fontSize: '0.75rem',
  fontWeight: '800',
  color: '#ffffff'
};

const cityBarContainerStyle = {
  width: '100%',
  height: '6px',
  backgroundColor: '#111726',
  borderRadius: '100px',
  overflow: 'hidden'
};

const cityBarFillStyle = {
  height: '100%',
  backgroundColor: '#fbbf24',
  borderRadius: '100px',
  boxShadow: '0 0 8px rgba(251,191,36,0.3)'
};

const inputStyle = {
  padding: '0.55rem 0.85rem',
  borderRadius: '8px',
  border: '1px solid var(--border-color)',
  backgroundColor: '#111726',
  color: '#ffffff',
  fontSize: '0.8rem',
  outline: 'none',
  width: '100%'
};

export default Analytics;
