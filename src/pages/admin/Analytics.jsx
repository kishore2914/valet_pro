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
  UserCheck,
  Phone,
  Mail,
  MapPin,
  Star,
  FileText,
  Check,
  Ban
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { supabase } from '../../lib/supabase';
import { useLocale } from '../../context/LocaleContext';

// Helper to format currency
const formatINR = (val) => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0
  }).format(val);
};

// Helper to format revenue in lakhs or normal INR
const formatRevenue = (val) => {
  if (val >= 100000) {
    return `₹${(val / 100000).toFixed(1)}L`;
  }
  return formatINR(val);
};

const defaultMockLogs = [
  { id: 'mock-1', title: 'Client onboarded', desc: 'Radisson Blu - Bengaluru', time: '2h ago · Admin' },
  { id: 'mock-2', title: 'Plan upgraded', desc: 'VR Mall: Starter → Professional', time: '5h ago · Admin' },
  { id: 'mock-3', title: 'Security alert resolved', desc: 'Unauthorized access attempt at ITC Grand Chola', time: '1d ago · Admin' },
  { id: 'mock-4', title: 'New location added', desc: 'Phoenix MarketCity - Velachery Branch', time: '2d ago · Admin' },
  { id: 'mock-5', title: 'Payment received', desc: 'Apollo Hospital - ₹39,999 cleared', time: '3d ago · Admin' },
  { id: 'mock-6', title: 'Feature flag toggled', desc: 'API Access enabled for ITC Grand Chola', time: '4d ago · Admin' }
];

const Analytics = () => {
  const { platformSettings } = useLocale();

  const getMonthlyFeeString = (tier, status) => {
    if (status === 'trial') return 'Free Trial';
    const starterVal = platformSettings?.pricing_starter || 4999;
    const proVal = platformSettings?.pricing_pro || 9999;
    const enterpriseVal = platformSettings?.pricing_enterprise || 24999;

    if (tier === 'Starter') {
      return `₹${Number(starterVal).toLocaleString('en-IN')}/mo`;
    } else if (tier === 'Enterprise') {
      return `₹${Number(enterpriseVal).toLocaleString('en-IN')}/mo`;
    } else {
      return `₹${Number(proVal).toLocaleString('en-IN')}/mo`;
    }
  };

  const [loading, setLoading] = useState(false);
  const [showOnboardModal, setShowOnboardModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('All'); // 'All', 'Active', 'Trial', 'Inactive'
  
  // Expanded chain IDs
  const [expandedChains, setExpandedChains] = useState({ 'ch-1': true });

  const [selectedDetail, setSelectedDetail] = useState(null);

  // Helper functions for mock data matching the 2nd image design
  const getPrimaryContact = (name) => {
    const contacts = {
      'Taj Hotels Group': {
        name: 'Meera Iyer',
        email: 'meera.i@tajhotels.com',
        phone: '+91 44 6600 2827',
        address: '37, Mahatma Gandhi Rd, Nungambakkam'
      },
      'ITC Hotels': {
        name: 'Meera Iyer', // matching the ITC hotels example if we click it
        email: 'meera.i@itchotels.com',
        phone: '+91 44 6600 2827',
        address: '37, Mahatma Gandhi Rd, Nungambakkam'
      },
      'Phoenix Mills Ltd': {
        name: 'Rohan Mehta',
        email: 'rohan.mehta@phoenixmills.com',
        phone: '+91 22 6622 7000',
        address: '142, Velachery Main Rd, Velachery'
      },
      'Apollo Hospitals Enterprise': {
        name: 'Dr. Ramya Reddy',
        email: 'dr.ramya@apollohospitals.com',
        phone: '+91 44 2829 0200',
        address: '21, Greams Lane, Off Greams Road'
      },
      'Grand Hyatt Chennai': {
        name: 'Suresh Menon',
        email: 'suresh.menon@hyatt.com',
        phone: '+91 44 6100 1234',
        address: '365, Anna Salai, Teynampet'
      },
      'VR Mall': {
        name: 'Anish Kumar',
        email: 'anish@vrmall.in',
        phone: '+91 44 3008 2777',
        address: '100 Feet Rd, Koyambedu'
      },
      'Express Avenue': {
        name: 'Deepak Raj',
        email: 'deepak@expressavenue.in',
        phone: '+91 44 2846 4444',
        address: '49, 50L, Whites Rd, Royapettah'
      },
      'TIDEL Park': {
        name: 'Venkatesh S',
        email: 'venkatesh@tidelpark.com',
        phone: '+91 44 2254 0500',
        address: '4, Rajiv Gandhi Salai, Taramani'
      }
    };
    return contacts[name] || {
      name: 'Operations Manager',
      email: `ops@${(name || '').toLowerCase().replace(/[^a-z0-9]/g, '') || 'valetpro'}.com`,
      phone: '+91 98765 43210',
      address: 'Chennai, Tamil Nadu'
    };
  };

  const getAvgRating = (name) => {
    const ratings = {
      'Taj Hotels Group': '4.9',
      'ITC Hotels': '4.8',
      'Phoenix Mills Ltd': '4.7',
      'Apollo Hospitals Enterprise': '4.6',
      'Grand Hyatt Chennai': '4.8',
      'VR Mall': '4.5'
    };
    return ratings[name] || '4.8';
  };

  const getAccountManager = (name) => {
    const ams = {
      'Taj Hotels Group': 'Priya N',
      'ITC Hotels': 'Priya N',
      'Phoenix Mills Ltd': 'Rahul S',
      'Apollo Hospitals Enterprise': 'Amit P',
      'Grand Hyatt Chennai': 'Karan S'
    };
    return ams[name] || 'Priya N';
  };

  const getUptime = (name) => {
    const uptimes = {
      'Taj Hotels Group': '99.91%',
      'ITC Hotels': '99.95%',
      'Phoenix Mills Ltd': '99.88%',
      'Apollo Hospitals Enterprise': '99.99%',
      'Grand Hyatt Chennai': '99.92%'
    };
    return uptimes[name] || '99.91%';
  };

  // Onboard client form state
  const [clientForm, setClientForm] = useState({
    name: '',
    chainName: '',
    city: 'Chennai',
    tier: 'Professional',
    mrr: '9999',
    status: 'active',
    ownerName: '',
    ownerEmail: '',
    ownerPhone: '',
    ownerPassword: ''
  });

  // Dynamic chains and standalone lists
  const [chains, setChains] = useState([]);
  const [standalone, setStandalone] = useState([]);
  const [auditLogs, setAuditLogs] = useState(defaultMockLogs);
  const [dbLocsCount, setDbLocsCount] = useState(0);

  // States for platform metrics
  const [stats, setStats] = useState({
    chainGroups: 0,
    chainGroupsTrend: '↗ +0 this quarter',
    totalClients: 0,
    totalClientsTrend: '↗ +0 this month',
    activeBranches: 0,
    activeBranchesTrend: '↗ +0 this month',
    vehiclesToday: 0,
    vehiclesTodayTrend: '↗ +0% vs yesterday',
    monthlyRevenue: 0,
    monthlyRevenueTrend: '↗ +0% MoM',
    fraudBlocked: 0,
    fraudBlockedTrend: '↗ ₹0 savings'
  });

  // State for subscription distribution
  const [subDistribution, setSubDistribution] = useState({
    starter: { count: 0, revenue: 0 },
    professional: { count: 0, revenue: 0 },
    enterprise: { count: 0, revenue: 0 }
  });

  // State for city-wise revenue distribution
  const [cityRevenue, setCityRevenue] = useState([]);

  // Synchronize locations from database and calculate metrics
  const fetchDatabaseLocations = async () => {
    try {
      setLoading(true);

      // 1. Fetch live vehicles to count active parked/retrieved vehicles per branch
      const { data: activeVehicles } = await supabase
        .from('vehicles')
        .select('location_id')
        .is('delivered_at', null);

      const liveCountsByLocation = {};
      if (activeVehicles) {
        activeVehicles.forEach(v => {
          liveCountsByLocation[v.location_id] = (liveCountsByLocation[v.location_id] || 0) + 1;
        });
      }

      // 2. Query locations table and staff table to count staff dynamically
      const [{ data: dbLocs }, { data: dbStaffMembers }] = await Promise.all([
        supabase.from('locations').select('*, companies(company_name), cities(city_name)'),
        supabase.from('staff').select('location_id')
      ]);

      const staffCountsByLocation = {};
      if (dbStaffMembers) {
        dbStaffMembers.forEach(s => {
          if (s.location_id) {
            staffCountsByLocation[s.location_id] = (staffCountsByLocation[s.location_id] || 0) + 1;
          }
        });
      }
      
      let formattedChains = [];
      let standaloneClients = [];
      let totalLocationsCount = 0;
      let activeBranchesCount = 0;
      
      const subDist = {
        starter: { count: 0, revenue: 0 },
        professional: { count: 0, revenue: 0 },
        enterprise: { count: 0, revenue: 0 }
      };

      const cityRevMap = {};

      if (dbLocs && dbLocs.length > 0) {
        totalLocationsCount = dbLocs.length;
        const chainGroups = {};

        dbLocs.forEach(loc => {
          const statusVal = loc.status || loc.subscription_status || 'active';
          if (statusVal === 'active') {
            activeBranchesCount += 1;
          }

          const companyName = loc.companies?.company_name || loc.company_name;
          const isStandalone = !loc.company_id || companyName === 'Standalone' || !companyName;
          const tierVal = loc.tier || (loc.selected_plan === 'Pro' ? 'Professional' : loc.selected_plan) || 'Professional';
          const monthlyFeeVal = loc.monthly_fee || getMonthlyFeeString(tierVal, statusVal);

          let feeVal = parseInt((monthlyFeeVal || '').replace(/[^0-9]/g, '')) || 0;
          if (feeVal === 0 && statusVal !== 'trial') {
            const starterVal = platformSettings?.pricing_starter || 4999;
            const proVal = platformSettings?.pricing_pro || 9999;
            const enterpriseVal = platformSettings?.pricing_enterprise || 24999;
            feeVal = (tierVal === 'Starter') ? starterVal : (tierVal === 'Enterprise') ? enterpriseVal : proVal;
          }
          const liveCount = liveCountsByLocation[loc.id] || 0;

          const mapped = {
            id: loc.id,
            name: loc.name,
            city: loc.cities?.city_name || loc.city || 'Chennai',
            staff: staffCountsByLocation[loc.id] || 0,
            tier: tierVal,
            live: liveCount,
            fee: monthlyFeeVal,
            status: statusVal,
            primary_contact_name: loc.primary_contact_name,
            primary_contact_email: loc.primary_contact_email,
            primary_contact_phone: loc.primary_contact_phone,
            primary_contact_address: loc.primary_contact_address,
            billing_outstanding: loc.billing_outstanding,
            billing_method: loc.billing_method,
            next_bill_date: loc.next_bill_date,
            last_payment_date: loc.last_payment_date,
            renewal_date: loc.renewal_date,
            uptime_percent: loc.uptime_percent,
            account_manager: loc.account_manager,
            open_tickets_count: loc.open_tickets_count,
            enabled_features: loc.enabled_features
          };

          // Accumulate subscription distributions (only for active/trial clients)
          if (statusVal === 'active' || statusVal === 'trial') {
            const tierLower = (tierVal || '').toLowerCase();
            if (tierLower.includes('starter')) {
              subDist.starter.count += 1;
              subDist.starter.revenue += feeVal;
            } else if (tierLower.includes('enterprise')) {
              subDist.enterprise.count += 1;
              subDist.enterprise.revenue += feeVal;
            } else {
              subDist.professional.count += 1;
              subDist.professional.revenue += feeVal;
            }
          }

          // Accumulate City-wise clients and revenue
          const cityName = loc.cities?.city_name || loc.city || 'Chennai';
          if (!cityRevMap[cityName]) {
            cityRevMap[cityName] = { city: cityName, clientCount: 0, revenue: 0 };
          }
          cityRevMap[cityName].clientCount += 1;
          if (statusVal === 'active' || statusVal === 'trial') {
            cityRevMap[cityName].revenue += feeVal;
          }

          if (isStandalone) {
            standaloneClients.push(mapped);
          } else {
            const chainName = companyName;
            if (!chainGroups[chainName]) {
              chainGroups[chainName] = {
                id: loc.company_id || `ch-${chainName.toLowerCase().replace(/\s/g, '-')}`,
                name: chainName,
                initials: chainName.substring(0, 3).toUpperCase(),
                isChain: true,
                branchCount: 0,
                branches: [],
                mrr: 0,
                live: 0,
                vehiclesProcessed: 0
              };
            }
            chainGroups[chainName].branches.push(mapped);
            chainGroups[chainName].branchCount += 1;
            chainGroups[chainName].live += mapped.live;
            chainGroups[chainName].mrr += feeVal;
            chainGroups[chainName].vehiclesProcessed += loc.vehicles_processed || 0;
          }
        });

        // Format chains for rendering
        formattedChains = Object.values(chainGroups).map(c => ({
          ...c,
          subtext: `${c.branches.map(b => b.city).filter((v, i, a) => a.indexOf(v) === i).join(' · ')} · ${c.branches.reduce((acc, b) => acc + b.staff, 0)} staff · ${c.vehiclesProcessed.toLocaleString('en-IN')} vehicles processed`,
          mrr: `₹${(c.mrr / 1000).toFixed(0)}K`
        }));
      }

      setChains(formattedChains);
      setStandalone(standaloneClients);
      setDbLocsCount(totalLocationsCount);
      setSubDistribution(subDist);

      // Compute City Revenue Array
      const cityRevArray = Object.values(cityRevMap);
      const maxCityRevenue = Math.max(...cityRevArray.map(c => c.revenue), 1);
      const formattedCityRevenue = cityRevArray
        .map(c => ({
          ...c,
          percentage: Math.min(100, Math.round((c.revenue / maxCityRevenue) * 100))
        }))
        .sort((a, b) => b.revenue - a.revenue);
      setCityRevenue(formattedCityRevenue);

      // 3. Fetch Platform Audit Logs (limit to 6)
      const { data: dbLogs } = await supabase
        .from('platform_audit_logs')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(6);

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
        console.log("Audit Logs loaded successfully from Supabase:", mappedLogs);
        setAuditLogs(mappedLogs);
      } else {
        console.log("Audit Logs: Falling back to local mock data (table empty or missing)");
        setAuditLogs(defaultMockLogs);
      }

      // 4. Query vehicles count for Today and Yesterday
      const todayStart = new Date();
      todayStart.setHours(0, 0, 0, 0);
      const todayStartISO = todayStart.toISOString();

      const yesterdayStart = new Date();
      yesterdayStart.setDate(yesterdayStart.getDate() - 1);
      yesterdayStart.setHours(0, 0, 0, 0);
      const yesterdayStartISO = yesterdayStart.toISOString();

      const { count: vehiclesTodayCount } = await supabase
        .from('vehicles')
        .select('*', { count: 'exact', head: true })
        .gte('received_at', todayStartISO);

      const { count: vehiclesYesterdayCount } = await supabase
        .from('vehicles')
        .select('*', { count: 'exact', head: true })
        .gte('received_at', yesterdayStartISO)
        .lt('received_at', todayStartISO);

      const todayCount = vehiclesTodayCount || 0;
      const yesterdayCount = vehiclesYesterdayCount || 0;
      let vehicleTrend = '↗ +0% vs yesterday';
      if (yesterdayCount > 0) {
        const pct = ((todayCount - yesterdayCount) / yesterdayCount) * 100;
        vehicleTrend = `${pct >= 0 ? '↗ +' : '↘ '}${pct.toFixed(1)}% vs yesterday`;
      } else if (todayCount > 0) {
        vehicleTrend = `↗ +100% vs yesterday`;
      }

      // 5. Query Completed Payments for Revenue
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      const thirtyDaysAgoISO = thirtyDaysAgo.toISOString();

      const sixtyDaysAgo = new Date();
      sixtyDaysAgo.setDate(sixtyDaysAgo.getDate() - 60);
      const sixtyDaysAgoISO = sixtyDaysAgo.toISOString();

      const { data: paymentsLast30Days } = await supabase
        .from('payments')
        .select('amount')
        .eq('status', 'completed')
        .gte('created_at', thirtyDaysAgoISO);

      const { data: paymentsPrev30Days } = await supabase
        .from('payments')
        .select('amount')
        .eq('status', 'completed')
        .gte('created_at', sixtyDaysAgoISO)
        .lt('created_at', thirtyDaysAgoISO);

      let revenueLast30 = 0;
      if (paymentsLast30Days && paymentsLast30Days.length > 0) {
        revenueLast30 = paymentsLast30Days.reduce((acc, p) => acc + Number(p.amount), 0);
      } else {
        // Fallback: If no payments exist in the database, calculate revenue from active branches' fees
        dbLocs?.forEach(loc => {
          const statusVal = loc.status || loc.subscription_status || 'active';
          if (statusVal === 'active' || statusVal === 'trial') {
            const tierVal = loc.tier || (loc.selected_plan === 'Pro' ? 'Professional' : loc.selected_plan) || 'Professional';
            const monthlyFeeVal = loc.monthly_fee || getMonthlyFeeString(tierVal, statusVal);
            let feeVal = parseInt((monthlyFeeVal || '').replace(/[^0-9]/g, '')) || 0;
            if (feeVal === 0 && statusVal !== 'trial') {
              const starterVal = platformSettings?.pricing_starter || 4999;
              const proVal = platformSettings?.pricing_pro || 9999;
              const enterpriseVal = platformSettings?.pricing_enterprise || 24999;
              feeVal = (tierVal === 'Starter') ? starterVal : (tierVal === 'Enterprise') ? enterpriseVal : proVal;
            }
            revenueLast30 += feeVal;
          }
        });
      }

      let revenuePrev30 = 0;
      if (paymentsPrev30Days && paymentsPrev30Days.length > 0) {
        revenuePrev30 = paymentsPrev30Days.reduce((acc, p) => acc + Number(p.amount), 0);
      }

      let revenueTrend = '↗ +0% MoM';
      if (revenuePrev30 > 0) {
        const pct = ((revenueLast30 - revenuePrev30) / revenuePrev30) * 100;
        revenueTrend = `${pct >= 0 ? '↗ +' : '↘ '}${pct.toFixed(1)}% MoM`;
      } else if (revenueLast30 > 0) {
        revenueTrend = '↗ +100% MoM';
      }

      // 6. Query Fraud Blocked (SUSPICIOUS incidents)
      const { count: fraudCount } = await supabase
        .from('incidents')
        .select('*', { count: 'exact', head: true })
        .eq('title', 'SUSPICIOUS');

      const suspIncidents = fraudCount || 0;
      // 3.5 Lakh savings per blocked incident
      const savingsVal = suspIncidents * 3.5;
      const fraudTrend = `↗ ₹${savingsVal.toFixed(1)}L savings`;

      // 7. Calculate trends for Chain Groups, Total Clients, Active Branches
      const { count: newCompanies } = await supabase
        .from('companies')
        .select('*', { count: 'exact', head: true })
        .gte('created_at', thirtyDaysAgoISO);

      const { count: newBranches } = await supabase
        .from('locations')
        .select('*', { count: 'exact', head: true })
        .gte('created_at', thirtyDaysAgoISO);

      const { count: totalCompaniesCount } = await supabase
        .from('companies')
        .select('*', { count: 'exact', head: true });

      const uniqueChainsCount = totalCompaniesCount || 0;
      const standaloneCount = standaloneClients.length;
      const totalClientsCount = uniqueChainsCount + standaloneCount;

      setStats({
        chainGroups: uniqueChainsCount,
        chainGroupsTrend: `↗ +${newCompanies || 0} this quarter`,
        totalClients: totalClientsCount,
        totalClientsTrend: `↗ +${(newCompanies || 0) + (newBranches || 0)} this month`,
        activeBranches: activeBranchesCount,
        activeBranchesTrend: `↗ +${newBranches || 0} this month`,
        vehiclesToday: todayCount,
        vehiclesTodayTrend: vehicleTrend,
        monthlyRevenue: revenueLast30,
        monthlyRevenueTrend: revenueTrend,
        fraudBlocked: suspIncidents,
        fraudBlockedTrend: fraudTrend
      });

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

  const handleOpenDetails = (client, parentChain = null) => {
    setSelectedDetail({
      ...client,
      parentChain: parentChain
    });
  };

  const handleToggleSuspend = async () => {
    if (!selectedDetail) return;
    const isSuspended = selectedDetail.status === 'suspended' || selectedDetail.status === 'inactive';
    const newStatus = isSuspended ? 'active' : 'inactive';
    
    setLoading(true);
    try {
      const { error } = await supabase
        .from('locations')
        .update({ status: newStatus })
        .eq('id', selectedDetail.id);
        
      if (error) throw error;
      
      // Also add an audit log
      await supabase.from('platform_audit_logs').insert([{
        title: newStatus === 'inactive' ? 'Client suspended' : 'Client reactivated',
        description: `${selectedDetail.name} status updated to ${newStatus}`
      }]);
      
      // Update local selectedDetail
      setSelectedDetail(prev => ({
        ...prev,
        status: newStatus
      }));
      
      // Re-fetch list
      fetchDatabaseLocations();
      alert(`Client ${newStatus === 'inactive' ? 'suspended' : 'reactivated'} successfully!`);
    } catch (err) {
      console.error(err);
      alert('Failed to update status: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleUpgradePlan = async () => {
    if (!selectedDetail) return;
    const currentTier = selectedDetail.tier;
    const nextTier = currentTier === 'Starter' ? 'Professional' : 'Enterprise';
    if (currentTier === 'Enterprise') {
      alert('Client is already on the highest plan (Enterprise).');
      return;
    }
    
    if (window.confirm(`Upgrade plan from ${currentTier} to ${nextTier}?`)) {
      setLoading(true);
      try {
        const { error } = await supabase
          .from('locations')
          .update({ 
            tier: nextTier,
            monthly_fee: getMonthlyFeeString(nextTier, selectedDetail.status)
          })
          .eq('id', selectedDetail.id);
          
        if (error) throw error;
        
        await supabase.from('platform_audit_logs').insert([{
          title: 'Plan upgraded',
          description: `${selectedDetail.name}: ${currentTier} → ${nextTier}`
        }]);
        
        setSelectedDetail(prev => ({
          ...prev,
          tier: nextTier,
          fee: getMonthlyFeeString(nextTier, selectedDetail.status)
        }));
        
        fetchDatabaseLocations();
        alert('Plan upgraded successfully!');
      } catch (err) {
        console.error(err);
        alert('Failed to upgrade plan: ' + err.message);
      } finally {
        setLoading(false);
      }
    }
  };

  const handleSendInvoice = () => {
    if (!selectedDetail) return;
    const contact = getPrimaryContact(selectedDetail.parentChain ? selectedDetail.parentChain.name : selectedDetail.name);
    alert(`Invoice generated and dispatched successfully to ${contact.email}!`);
  };

  const handleSendEmail = () => {
    if (!selectedDetail) return;
    const contact = getPrimaryContact(selectedDetail.parentChain ? selectedDetail.parentChain.name : selectedDetail.name);
    window.location.href = `mailto:${contact.email}?subject=ValetPro Support & Billing Inquiry`;
  };

  const handleImpersonate = () => {
    if (!selectedDetail) return;
    alert(`Starting secure impersonation session for ${selectedDetail.name}... Redirecting to client portal.`);
  };

  const handleOnboardSubmit = async (e) => {
    e.preventDefault();
    if (!clientForm.name.trim()) return;
    if (!clientForm.ownerName.trim() || !clientForm.ownerEmail.trim() || !clientForm.ownerPassword.trim()) {
      alert('Please fill out all Owner Credentials fields.');
      return;
    }

    setLoading(true);
    try {
      let companyId = null;
      const chainName = clientForm.chainName ? clientForm.chainName.trim() : '';

      // 1. Find or create company
      if (chainName && chainName.toLowerCase() !== 'standalone') {
        const { data: compData } = await supabase
          .from('companies')
          .select('id')
          .eq('company_name', chainName)
          .maybeSingle();
          
        if (compData) {
          companyId = compData.id;
        } else {
          const { data: newComp } = await supabase
            .from('companies')
            .insert([{ company_name: chainName }])
            .select();
          if (newComp?.[0]) {
            companyId = newComp[0].id;
          }
        }
      }

      // 2. Find or create city
      let cityId = null;
      const cityName = clientForm.city ? clientForm.city.trim() : 'Chennai';
      const { data: cityData } = await supabase
        .from('cities')
        .select('id')
        .eq('city_name', cityName)
        .maybeSingle();

      if (cityData) {
        cityId = cityData.id;
      } else {
        const { data: newCity } = await supabase
          .from('cities')
          .insert([{ city_name: cityName }])
          .select();
        if (newCity?.[0]) {
          cityId = newCity[0].id;
        }
      }

      // 3. Insert into Supabase locations table
      const { data, error } = await supabase
        .from('locations')
        .insert([{
          name: clientForm.name,
          company_name: chainName || 'Standalone',
          company_id: companyId,
          city: cityName,
          city_id: cityId,
          country: 'India',
          tier: clientForm.tier,
          status: clientForm.status,
          staff_count: 0,
          vehicles_processed: 0,
          monthly_fee: getMonthlyFeeString(clientForm.tier, clientForm.status),
          primary_contact_name: clientForm.ownerName,
          primary_contact_email: clientForm.ownerEmail,
          primary_contact_phone: clientForm.ownerPhone,
          primary_contact_address: `${clientForm.city}, India`
        }])
        .select();

      if (error) throw error;

      if (!data?.[0]?.id) {
        throw new Error('No location ID returned from location creation.');
      }
      const newLocationId = data[0].id;

      // 4. Create secondary Supabase client to sign up user without logging out the current admin
      const { createClient } = await import('@supabase/supabase-js');
      const tempClient = createClient(
        import.meta.env.VITE_SUPABASE_URL,
        import.meta.env.VITE_SUPABASE_ANON_KEY,
        { auth: { persistSession: false } }
      );

      const { data: authData, error: authError } = await tempClient.auth.signUp({
        email: clientForm.ownerEmail,
        password: clientForm.ownerPassword,
        options: {
          data: {
            full_name: clientForm.ownerName,
            role: 'valet',
            location_id: newLocationId
          }
        }
      });

      if (authError) {
        // Rollback location creation on auth failure to maintain consistent state
        await supabase.from('locations').delete().eq('id', newLocationId);
        if (authError.message.includes('already registered')) {
          throw new Error('This email address is already registered as a user.');
        }
        throw authError;
      }

      if (!authData?.user) {
        // Rollback
        await supabase.from('locations').delete().eq('id', newLocationId);
        throw new Error('Failed to create authentication account.');
      }
      const newUserId = authData.user.id;

      // 5. Profile Sync
      try {
        await supabase.from('profiles').upsert({
          id: newUserId,
          full_name: clientForm.ownerName,
          email: clientForm.ownerEmail,
          role: 'valet',
          location_id: newLocationId
        }, { onConflict: 'id' });
      } catch (e) {
        console.warn('Profile sync handled by trigger or skipped:', e);
      }

      // 6. Map the owner user to the location
      try {
        await supabase.from('user_locations').insert([{
          user_id: newUserId,
          location_id: newLocationId
        }]);
      } catch (e) {
        console.warn('user_locations mapping warning:', e);
      }

      // 7. Update locations table with owner_id reference
      try {
        await supabase
          .from('locations')
          .update({ owner_id: newUserId })
          .eq('id', newLocationId);
      } catch (e) {
        console.warn('Updating locations owner_id warning:', e);
      }

      // Add to platform audit logs in Supabase
      await supabase.from('platform_audit_logs').insert([{
        title: 'Client onboarded',
        description: `${clientForm.name} - ${clientForm.city}`
      }]);

      setShowOnboardModal(false);
      setClientForm({
        name: '',
        chainName: '',
        city: 'Chennai',
        tier: 'Professional',
        mrr: '9999',
        status: 'active',
        ownerName: '',
        ownerEmail: '',
        ownerPhone: '',
        ownerPassword: ''
      });
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
      await supabase.from('payments').delete().neq('id', '00000000-0000-0000-0000-000000000000');
      await supabase.from('incidents').delete().neq('id', '00000000-0000-0000-0000-000000000000');
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

      // Seed locations and save records for payment seeding
      const seededLocations = [];

      // taj branches
      const tajBranches = [
        { name: 'Taj Coromandel', city: 'Chennai', tier: 'Professional', status: 'active', staff_count: 6, vehicles_processed: 62000, monthly_fee: '₹9,999/mo' },
        { name: 'Taj Connemara', city: 'Chennai', tier: 'Professional', status: 'active', staff_count: 8, vehicles_processed: 48000, monthly_fee: '₹9,999/mo' },
        { name: 'Taj Mahal Palace, Mumbai', city: 'Mumbai', tier: 'Enterprise', status: 'active', staff_count: 18, vehicles_processed: 92000, monthly_fee: '₹24,999/mo' },
        { name: 'Taj West End, Bengaluru', city: 'Bengaluru', tier: 'Professional', status: 'active', staff_count: 10, vehicles_processed: 42120, monthly_fee: '₹9,999/mo' }
      ];
      for (const b of tajBranches) {
        const { data } = await supabase.from('locations').insert([{
          name: b.name,
          company_name: 'Taj Hotels Group',
          company_id: seededCompanies['Taj Hotels Group'],
          city: b.city,
          city_id: seededCities[b.city],
          tier: b.tier,
          status: b.status,
          staff_count: b.staff_count,
          vehicles_processed: b.vehicles_processed,
          monthly_fee: getMonthlyFeeString(b.tier, b.status)
        }]).select();
        if (data?.[0]) seededLocations.push(data[0]);
      }

      // itc branches
      const itcBranches = [
        { name: 'ITC Grand Chola', city: 'Chennai', tier: 'Enterprise', status: 'active', staff_count: 18, vehicles_processed: 220000, monthly_fee: '₹24,999/mo' },
        { name: 'ITC Gardenia', city: 'Bengaluru', tier: 'Professional', status: 'active', staff_count: 14, vehicles_processed: 150000, monthly_fee: '₹9,999/mo' },
        { name: 'ITC Maurya', city: 'New Delhi', tier: 'Professional', status: 'active', staff_count: 15, vehicles_processed: 103600, monthly_fee: '₹9,999/mo' }
      ];
      for (const b of itcBranches) {
        const { data } = await supabase.from('locations').insert([{
          name: b.name,
          company_name: 'ITC Hotels',
          company_id: seededCompanies['ITC Hotels'],
          city: b.city,
          city_id: seededCities[b.city],
          tier: b.tier,
          status: b.status,
          staff_count: b.staff_count,
          vehicles_processed: b.vehicles_processed,
          monthly_fee: getMonthlyFeeString(b.tier, b.status)
        }]).select();
        if (data?.[0]) seededLocations.push(data[0]);
      }

      // phoenix branches
      const phoenixBranches = [
        { name: 'Phoenix MarketCity, Chennai', city: 'Chennai', tier: 'Enterprise', status: 'active', staff_count: 24, vehicles_processed: 210080, monthly_fee: '₹24,999/mo' },
        { name: 'Phoenix Palladium, Mumbai', city: 'Mumbai', tier: 'Enterprise', status: 'active', staff_count: 30, vehicles_processed: 263000, monthly_fee: '₹24,999/mo' },
        { name: 'Phoenix MarketCity, Pune', city: 'Pune', tier: 'Professional', status: 'active', staff_count: 20, vehicles_processed: 200000, monthly_fee: '₹9,999/mo' }
      ];
      for (const b of phoenixBranches) {
        const { data } = await supabase.from('locations').insert([{
          name: b.name,
          company_name: 'Phoenix Mills Ltd',
          company_id: seededCompanies['Phoenix Mills Ltd'],
          city: b.city,
          city_id: seededCities[b.city],
          tier: b.tier,
          status: b.status,
          staff_count: b.staff_count,
          vehicles_processed: b.vehicles_processed,
          monthly_fee: getMonthlyFeeString(b.tier, b.status)
        }]).select();
        if (data?.[0]) seededLocations.push(data[0]);
      }

      // apollo branches
      const apolloBranches = [
        { name: 'Apollo Greams Road', city: 'Chennai', tier: 'Enterprise', status: 'active', staff_count: 22, vehicles_processed: 205110, monthly_fee: '₹24,999/mo' },
        { name: 'Apollo Specialty, Chennai', city: 'Chennai', tier: 'Professional', status: 'active', staff_count: 18, vehicles_processed: 150000, monthly_fee: '₹9,999/mo' },
        { name: 'Apollo Health City, Hyderabad', city: 'Hyderabad', tier: 'Enterprise', status: 'active', staff_count: 20, vehicles_processed: 250000, monthly_fee: '₹24,999/mo' }
      ];
      for (const b of apolloBranches) {
        const { data } = await supabase.from('locations').insert([{
          name: b.name,
          company_name: 'Apollo Hospitals Enterprise',
          company_id: seededCompanies['Apollo Hospitals Enterprise'],
          city: b.city,
          city_id: seededCities[b.city],
          tier: b.tier,
          status: b.status,
          staff_count: b.staff_count,
          vehicles_processed: b.vehicles_processed,
          monthly_fee: getMonthlyFeeString(b.tier, b.status)
        }]).select();
        if (data?.[0]) seededLocations.push(data[0]);
      }

      // standalones
      const standalones = [
        { name: 'Grand Hyatt Chennai', city: 'Chennai', tier: 'Professional', status: 'active', staff_count: 8, vehicles_processed: 125000, monthly_fee: '₹9,999/mo' },
        { name: 'VR Mall', city: 'Chennai', tier: 'Starter', status: 'active', staff_count: 5, vehicles_processed: 45000, monthly_fee: '₹4,999/mo' },
        { name: 'Express Avenue', city: 'Chennai', tier: 'Professional', status: 'inactive', staff_count: 8, vehicles_processed: 0, monthly_fee: '₹9,999/mo' },
        { name: 'TIDEL Park', city: 'Chennai', tier: 'Starter', status: 'trial', staff_count: 4, vehicles_processed: 3000, monthly_fee: 'Free Trial' }
      ];
      for (const b of standalones) {
        const { data } = await supabase.from('locations').insert([{
          name: b.name,
          company_name: 'Standalone',
          company_id: null,
          city: b.city,
          city_id: seededCities[b.city],
          tier: b.tier,
          status: b.status,
          staff_count: b.staff_count,
          vehicles_processed: b.vehicles_processed,
          monthly_fee: getMonthlyFeeString(b.tier, b.status)
        }]).select();
        if (data?.[0]) seededLocations.push(data[0]);
      }

      // Seed payments for the seeded locations (last 30 days and 30-60 days ago for MoM trend)
      const paymentPayloads = [];
      seededLocations.forEach(loc => {
        const statusVal = loc.status || loc.subscription_status || 'active';
        const tierVal = loc.tier || (loc.selected_plan === 'Pro' ? 'Professional' : loc.selected_plan) || 'Professional';
        const monthlyFeeVal = loc.monthly_fee || getMonthlyFeeString(tierVal, statusVal);
        if (statusVal === 'active' || statusVal === 'trial') {
          const feeVal = parseInt((monthlyFeeVal || '').replace(/[^0-9]/g, '')) || 0;
          if (feeVal > 0) {
            // Payment in the last 30 days (completed)
            paymentPayloads.push({
              location_id: loc.id,
              amount: feeVal,
              plan: tierVal,
              payment_method: 'UPI',
              status: 'completed',
              created_at: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString() // 10 days ago
            });
            // Payment between 30-60 days ago (completed)
            paymentPayloads.push({
              location_id: loc.id,
              amount: feeVal,
              plan: tierVal,
              payment_method: 'UPI',
              status: 'completed',
              created_at: new Date(Date.now() - 40 * 24 * 60 * 60 * 1000).toISOString() // 40 days ago
            });
          }
        }
      });
      if (paymentPayloads.length > 0) {
        await supabase.from('payments').insert(paymentPayloads);
      }

      // Seed some incidents for the seeded locations (including SUSPICIOUS for fraud cards)
      const incidentPayloads = [];
      seededLocations.forEach((loc, index) => {
        incidentPayloads.push({
          location_id: loc.id,
          title: 'DAMAGE',
          priority: 'MEDIUM',
          status: 'INVESTIGATING',
          description: `Minor scratch on rear bumper noticed during check-in at ${loc.name}.`,
          plate_number: `TN 0${index + 1} AB 1234`,
          reported_by: 'Arun M',
          assigned_to: 'Suresh P',
          zone: 'Zone A entry',
          time: '10:20 AM',
          estimated_cost: 2500
        });

        if (index % 2 === 0) {
          incidentPayloads.push({
            location_id: loc.id,
            title: 'SUSPICIOUS',
            priority: 'HIGH',
            status: 'OPEN',
            description: `Unauthorized person attempted to claim vehicle with mismatched token at ${loc.name}. Security called.`,
            plate_number: `MH 12 EF ${9000 + index}`,
            reported_by: 'Suresh P',
            assigned_to: 'Hotel Security',
            zone: 'Lobby valet desk',
            time: '09:30 AM',
            estimated_cost: 0
          });
        }
      });
      if (incidentPayloads.length > 0) {
        await supabase.from('incidents').insert(incidentPayloads);
      }

      // Seed audit logs
      try {
        const auditPayload = [
          { title: 'Client onboarded', description: 'Radisson Blu - Bengaluru' },
          { title: 'Plan upgraded', description: 'VR Mall: Starter → Professional' },
          { title: 'Security alert resolved', description: 'Unauthorized access attempt at ITC Grand Chola' },
          { title: 'New location added', description: 'Phoenix MarketCity - Velachery Branch' },
          { title: 'Payment received', description: 'Apollo Hospital - ₹39,999 cleared' },
          { title: 'Feature flag toggled', description: 'API Access enabled for ITC Grand Chola' }
        ];
        await supabase.from('platform_audit_logs').insert(auditPayload);
      } catch (logErr) {
        console.warn('Could not seed platform_audit_logs table:', logErr);
      }

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
      await supabase.from('payments').delete().neq('id', '00000000-0000-0000-0000-000000000000');
      await supabase.from('incidents').delete().neq('id', '00000000-0000-0000-0000-000000000000');
      await supabase.from('locations').delete().neq('id', '00000000-0000-0000-0000-000000000000');
      await supabase.from('companies').delete().neq('id', '00000000-0000-0000-0000-000000000000');
      await supabase.from('cities').delete().neq('id', '00000000-0000-0000-0000-000000000000');
      try {
        await supabase.from('platform_audit_logs').delete().neq('id', '00000000-0000-0000-0000-000000000000');
      } catch (logErr) {
        console.warn('Could not clear platform_audit_logs table:', logErr);
      }
      
      setChains([]);
      setStandalone([]);
      setAuditLogs(defaultMockLogs);
      setDbLocsCount(0);
      setCityRevenue([]);
      setSubDistribution({
        starter: { count: 0, revenue: 0 },
        professional: { count: 0, revenue: 0 },
        enterprise: { count: 0, revenue: 0 }
      });
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
      ['Chain Groups', stats.chainGroups],
      ['Total Clients', stats.totalClients],
      ['Active Branches', stats.activeBranches],
      ['Vehicles Today', stats.vehiclesToday],
      ['Monthly Revenue', formatRevenue(stats.monthlyRevenue)],
      ['Fraud Blocked', stats.fraudBlocked],
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
          <h1 style={{ fontSize: '1.85rem', fontWeight: '800', color: 'var(--text-main)', marginBottom: '0.25rem' }}>Platform Overview</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', fontWeight: '500' }}>
            System-wide metrics, clients, billing & health
          </p>
        </div>
        <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
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
          <div style={statNumStyle}>{stats.chainGroups}</div>
          <div style={{ ...trendSubtextStyle, color: '#10b981' }}>{stats.chainGroupsTrend}</div>
        </div>

        {/* Total Clients */}
        <div style={statCardStyle}>
          <div style={cardHeaderStyle}>
            <span style={statLabelStyle}>Total Clients</span>
            <div style={{ color: 'var(--text-muted)' }}><Users size={16} /></div>
          </div>
          <div style={statNumStyle}>{stats.totalClients}</div>
          <div style={{ ...trendSubtextStyle, color: '#10b981' }}>{stats.totalClientsTrend}</div>
        </div>

        {/* Active Branches */}
        <div style={statCardStyle}>
          <div style={cardHeaderStyle}>
            <span style={statLabelStyle}>Active Branches</span>
            <div style={{ color: 'var(--text-muted)' }}><Globe size={16} /></div>
          </div>
          <div style={statNumStyle}>{stats.activeBranches}</div>
          <div style={{ ...trendSubtextStyle, color: '#10b981' }}>{stats.activeBranchesTrend}</div>
        </div>

        {/* Vehicles Today */}
        <div style={statCardStyle}>
          <div style={cardHeaderStyle}>
            <span style={statLabelStyle}>Vehicles Today</span>
            <div style={{ color: 'var(--text-muted)' }}><Car size={16} /></div>
          </div>
          <div style={statNumStyle}>{stats.vehiclesToday.toLocaleString('en-IN')}</div>
          <div style={{ ...trendSubtextStyle, color: '#10b981' }}>{stats.vehiclesTodayTrend}</div>
        </div>

        {/* Monthly Revenue */}
        <div style={statCardStyle}>
          <div style={cardHeaderStyle}>
            <span style={statLabelStyle}>Monthly Revenue</span>
            <div style={{ color: 'var(--text-muted)' }}><TrendingUp size={16} /></div>
          </div>
          <div style={statNumStyle}>{formatRevenue(stats.monthlyRevenue)}</div>
          <div style={{ ...trendSubtextStyle, color: '#10b981' }}>{stats.monthlyRevenueTrend}</div>
        </div>

        {/* Fraud Blocked */}
        <div style={statCardStyle}>
          <div style={cardHeaderStyle}>
            <span style={statLabelStyle}>Fraud Blocked</span>
            <div style={{ color: '#ef4444' }}><ShieldAlert size={16} /></div>
          </div>
          <div style={statNumStyle}>{stats.fraudBlocked}</div>
          <div style={{ ...trendSubtextStyle, color: '#10b981' }}>{stats.fraudBlockedTrend}</div>
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
          <span style={{ fontSize: '0.75rem', fontWeight: '800', color: 'var(--text-main)', letterSpacing: '0.04em', textTransform: 'uppercase' }}>
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
                  backgroundColor: 'var(--bg-subtle)',
                  color: 'var(--text-main)',
                  fontSize: '0.8rem',
                  outline: 'none'
                }}
              />
            </div>

            {/* Filter tab pills */}
            <div style={{ display: 'flex', gap: '0.35rem', backgroundColor: 'var(--bg-subtle)', padding: '3px', borderRadius: '10px', border: '1px solid var(--border-color)' }}>
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
                    backgroundColor: 'var(--bg-subtle)',
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
                        <span style={{ fontSize: '0.85rem', fontWeight: '800', color: 'var(--text-main)' }}>{c.name}</span>
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
                        <span style={{ fontSize: '0.8rem', fontWeight: '800', color: 'var(--text-main)' }}>{c.mrr}</span>
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
                            <span style={{ fontSize: '0.8rem', fontWeight: '800', color: 'var(--text-main)' }}>{b.name}</span>
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
                            <span style={{ fontSize: '0.8rem', fontWeight: '800', color: 'var(--text-main)', width: '20px', textAlign: 'center' }}>
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
                            <button
                              onClick={() => handleOpenDetails(b, c)}
                              style={{
                                backgroundColor: 'transparent',
                                border: 'none',
                                color: '#fbbf24',
                                fontSize: '0.75rem',
                                fontWeight: '700',
                                cursor: 'pointer'
                              }}
                            >
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
                  backgroundColor: 'var(--bg-subtle)',
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
                    <span style={{ fontSize: '0.8rem', fontWeight: '800', color: 'var(--text-main)' }}>{s.name}</span>
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
                  <span style={{ fontSize: '0.8rem', fontWeight: '800', color: 'var(--text-main)', width: '20px', textAlign: 'center' }}>
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
                  <button 
                    onClick={() => handleOpenDetails(s, null)}
                    style={{
                      backgroundColor: 'transparent',
                      border: 'none',
                      color: '#fbbf24',
                      fontSize: '0.75rem',
                      fontWeight: '700',
                      cursor: 'pointer'
                    }}
                  >
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
                  backgroundColor: 'var(--bg-subtle)',
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
                  backgroundColor: log.title.toLowerCase().includes('alert') ? 'rgba(239, 68, 68, 0.08)' : 'var(--bg-app)',
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
                  <span style={{ fontSize: '0.8rem', fontWeight: '800', color: 'var(--text-main)' }}>
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
              <span style={subNumStyle}>{subDistribution.starter.count}</span>
              <span style={subLabelStyle}>Starter</span>
              <span style={subCostStyle}>{formatRevenue(subDistribution.starter.revenue)}/mo</span>
            </div>

            {/* Professional */}
            <div style={subCardStyle}>
              <span style={subNumStyle}>{subDistribution.professional.count}</span>
              <span style={subLabelStyle}>Professional</span>
              <span style={subCostStyle}>{formatRevenue(subDistribution.professional.revenue)}/mo</span>
            </div>

            {/* Enterprise */}
            <div style={subCardStyle}>
              <span style={subNumStyle}>{subDistribution.enterprise.count}</span>
              <span style={subLabelStyle}>Enterprise</span>
              <span style={subCostStyle}>{formatRevenue(subDistribution.enterprise.revenue)}/mo</span>
            </div>

          </div>
        </div>

        {/* Revenue by City Card */}
        <div style={panelStyle}>
          <h2 style={panelTitleStyle}>Revenue by City</h2>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginTop: '0.5rem' }}>
            
            {cityRevenue.map((item) => (
              <div key={item.city} style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                <div style={cityHeaderStyle}>
                  <span>{item.city} <span style={{ color: 'var(--text-muted)', fontWeight: '500' }}>· {item.clientCount} {item.clientCount === 1 ? 'client' : 'clients'}</span></span>
                  <span style={{ color: 'var(--text-main)' }}>{formatRevenue(item.revenue)}</span>
                </div>
                <div style={cityBarContainerStyle}>
                  <div style={{ ...cityBarFillStyle, width: `${item.percentage}%` }} />
                </div>
              </div>
            ))}

            {cityRevenue.length === 0 && (
              <div style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '2rem', fontSize: '0.8rem' }}>
                No city revenue data found.
              </div>
            )}

          </div>
        </div>

      </div>

      {/* Client Detail Modal */}
      {selectedDetail && (() => {
        const detailContact = getPrimaryContact(selectedDetail.parentChain ? selectedDetail.parentChain.name : selectedDetail.name);
        const detailRating = getAvgRating(selectedDetail.parentChain ? selectedDetail.parentChain.name : selectedDetail.name);
        const detailAM = getAccountManager(selectedDetail.parentChain ? selectedDetail.parentChain.name : selectedDetail.name);
        const detailUptime = getUptime(selectedDetail.parentChain ? selectedDetail.parentChain.name : selectedDetail.name);
        
        return (
          <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100vw',
            height: '100vh',
            backgroundColor: 'rgba(5, 8, 16, 0.75)',
            zIndex: 99999,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            backdropFilter: 'blur(6px)',
            padding: '1rem'
          }}>
            <div style={{
              backgroundColor: '#0a0e1a',
              border: '1px solid #1e293b',
              borderRadius: '16px',
              padding: '2rem',
              width: '640px',
              maxWidth: '100%',
              maxHeight: '90vh',
              overflowY: 'auto',
              display: 'flex',
              flexDirection: 'column',
              gap: '1.5rem',
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.6)',
              position: 'relative'
            }}>
              {/* Close Button */}
              <button 
                onClick={() => setSelectedDetail(null)}
                style={{
                  position: 'absolute',
                  top: '1.5rem',
                  right: '1.5rem',
                  backgroundColor: 'transparent',
                  border: 'none',
                  color: 'var(--text-muted)',
                  cursor: 'pointer',
                  transition: 'color 0.15s ease'
                }}
                onMouseEnter={(e) => e.currentTarget.style.color = 'var(--text-main)'}
                onMouseLeave={(e) => e.currentTarget.style.color = 'var(--text-muted)'}
              >
                <X size={20} />
              </button>

              {/* Title & Badges Header */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                <h2 style={{ fontSize: '1.55rem', fontWeight: '855', color: '#fbbf24', margin: 0, letterSpacing: '-0.02em' }}>
                  {selectedDetail.parentChain ? selectedDetail.parentChain.name : selectedDetail.name}
                </h2>
                {selectedDetail.parentChain && (
                  <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: '600', marginTop: '-0.25rem' }}>
                    {selectedDetail.name}
                  </div>
                )}
                
                <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginTop: '0.15rem' }}>
                  {/* Tier Badge */}
                  <span style={{
                    fontSize: '0.65rem',
                    fontWeight: '800',
                    textTransform: 'uppercase',
                    letterSpacing: '0.04em',
                    backgroundColor: selectedDetail.tier === 'Enterprise' ? 'rgba(251,191,36,0.06)' : 'rgba(59,130,246,0.06)',
                    color: selectedDetail.tier === 'Enterprise' ? '#fbbf24' : '#3b82f6',
                    border: selectedDetail.tier === 'Enterprise' ? '1px solid rgba(251,191,36,0.15)' : '1px solid rgba(59,130,246,0.15)',
                    padding: '0.2rem 0.55rem',
                    borderRadius: '4px'
                  }}>
                    {selectedDetail.tier}
                  </span>
                  
                  {/* Vertical Badge */}
                  <span style={{
                    fontSize: '0.65rem',
                    fontWeight: '800',
                    textTransform: 'uppercase',
                    letterSpacing: '0.04em',
                    backgroundColor: 'rgba(255,255,255,0.02)',
                    color: 'var(--text-muted)',
                    border: '1px solid var(--border-color)',
                    padding: '0.2rem 0.55rem',
                    borderRadius: '4px'
                  }}>
                    {(selectedDetail.parentChain ? selectedDetail.parentChain.name : selectedDetail.name).toLowerCase().includes('hospital') ? 'Healthcare' : (selectedDetail.parentChain ? selectedDetail.parentChain.name : selectedDetail.name).toLowerCase().includes('mall') ? 'Retail' : 'Hospitality'}
                  </span>

                  {/* Status Badge */}
                  <span style={{
                    fontSize: '0.65rem',
                    fontWeight: '800',
                    textTransform: 'uppercase',
                    letterSpacing: '0.04em',
                    backgroundColor: selectedDetail.status === 'active' ? 'rgba(16,185,129,0.06)' : selectedDetail.status === 'trial' ? 'rgba(59,130,246,0.06)' : 'rgba(239,68,68,0.06)',
                    color: selectedDetail.status === 'active' ? '#10b981' : selectedDetail.status === 'trial' ? '#3b82f6' : '#ef4444',
                    border: selectedDetail.status === 'active' ? '1px solid rgba(16,185,129,0.15)' : selectedDetail.status === 'trial' ? '1px solid rgba(59,130,246,0.15)' : '1px solid rgba(239,68,68,0.15)',
                    padding: '0.2rem 0.55rem',
                    borderRadius: '4px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.25rem'
                  }}>
                    <span style={{ fontSize: '0.5rem' }}>●</span>
                    {selectedDetail.status}
                  </span>
                </div>
              </div>

              {/* KPI Grid */}
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(4, 1fr)',
                gap: '0.75rem'
              }}>
                <div style={detailKpiCardStyle}>
                  <span style={detailKpiLabelStyle}>LOCATIONS</span>
                  <span style={detailKpiValStyle}>{selectedDetail.parentChain ? selectedDetail.parentChain.branchCount : 1}</span>
                </div>
                
                <div style={detailKpiCardStyle}>
                  <span style={detailKpiLabelStyle}>ACTIVE VEHICLES</span>
                  <span style={detailKpiValStyle}>{selectedDetail.parentChain ? selectedDetail.parentChain.live : selectedDetail.live}</span>
                </div>
                
                <div style={detailKpiCardStyle}>
                  <span style={detailKpiLabelStyle}>TOTAL PROCESSED</span>
                  <span style={detailKpiValStyle}>
                    {selectedDetail.parentChain 
                      ? selectedDetail.parentChain.vehiclesProcessed.toLocaleString('en-IN') 
                      : (selectedDetail.vehiclesProcessed || selectedDetail.staff * 4000 + 1200).toLocaleString('en-IN')}
                  </span>
                </div>
                
                <div style={detailKpiCardStyle}>
                  <span style={detailKpiLabelStyle}>AVG RATING</span>
                  <span style={{ ...detailKpiValStyle, color: '#fbbf24', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                    {detailRating} <Star size={14} fill="#fbbf24" stroke="none" />
                  </span>
                </div>
              </div>

              {/* Primary Contact Section */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                <h3 style={detailSectionTitleStyle}>PRIMARY CONTACT</h3>
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: '1fr 1fr',
                  gap: '0.75rem 1.5rem',
                  backgroundColor: 'var(--bg-subtle)',
                  border: '1px solid var(--border-color)',
                  borderRadius: '12px',
                  padding: '1rem'
                }}>
                  <div style={detailContactItemStyle}>
                    <User size={15} style={{ color: 'var(--text-muted)' }} />
                    <span style={{ fontSize: '0.8rem', fontWeight: '800', color: 'var(--text-main)' }}>{selectedDetail.primary_contact_name || detailContact.name}</span>
                  </div>
                  
                  <div style={detailContactItemStyle}>
                    <Mail size={15} style={{ color: 'var(--text-muted)' }} />
                    <span style={{ fontSize: '0.8rem', fontWeight: '600', color: 'var(--text-main)' }}>{selectedDetail.primary_contact_email || detailContact.email}</span>
                  </div>
                  
                  <div style={detailContactItemStyle}>
                    <Phone size={15} style={{ color: 'var(--text-muted)' }} />
                    <span style={{ fontSize: '0.8rem', fontWeight: '800', color: 'var(--text-main)' }}>{selectedDetail.primary_contact_phone || detailContact.phone}</span>
                  </div>
                  
                  <div style={detailContactItemStyle}>
                    <MapPin size={15} style={{ color: 'var(--text-muted)' }} />
                    <span style={{ fontSize: '0.8rem', fontWeight: '600', color: 'var(--text-main)', lineHeight: 1.25 }}>{selectedDetail.primary_contact_address || detailContact.address}</span>
                  </div>
                </div>
              </div>

              {/* Billing & Subscription Section */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                <h3 style={detailSectionTitleStyle}>BILLING & SUBSCRIPTION</h3>
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: '1fr 1fr',
                  gap: '0.75rem'
                }}>
                  <div style={detailBillingCardStyle}>
                    <span style={{ fontSize: '0.75rem', fontWeight: '600', color: 'var(--text-muted)' }}>Monthly</span>
                    <span style={{ fontSize: '0.8rem', fontWeight: '800', color: '#fbbf24' }}>
                      {selectedDetail.fee === 'Free Trial' ? 'Free Trial' : selectedDetail.fee}
                    </span>
                  </div>
                  
                  <div style={detailBillingCardStyle}>
                    <span style={{ fontSize: '0.75rem', fontWeight: '600', color: 'var(--text-muted)' }}>Outstanding</span>
                    <span style={{ fontSize: '0.8rem', fontWeight: '800', color: '#10b981' }}>{selectedDetail.billing_outstanding || '₹0'}</span>
                  </div>
                  
                  <div style={detailBillingCardStyle}>
                    <span style={{ fontSize: '0.75rem', fontWeight: '600', color: 'var(--text-muted)' }}>Method</span>
                    <span style={{ fontSize: '0.8rem', fontWeight: '800', color: 'var(--text-main)' }}>
                      {selectedDetail.billing_method || (selectedDetail.tier === 'Enterprise' ? 'Group ACH' : 'UPI')}
                    </span>
                  </div>
                  
                  <div style={detailBillingCardStyle}>
                    <span style={{ fontSize: '0.75rem', fontWeight: '600', color: 'var(--text-muted)' }}>Next Bill</span>
                    <span style={{ fontSize: '0.8rem', fontWeight: '800', color: 'var(--text-main)' }}>{selectedDetail.next_bill_date || '01 Jul 2026'}</span>
                  </div>
                  
                  <div style={detailBillingCardStyle}>
                    <span style={{ fontSize: '0.75rem', fontWeight: '600', color: 'var(--text-muted)' }}>Last Payment</span>
                    <span style={{ fontSize: '0.8rem', fontWeight: '800', color: 'var(--text-main)' }}>{selectedDetail.last_payment_date || '01 Jun 2026'}</span>
                  </div>
                  
                  <div style={detailBillingCardStyle}>
                    <span style={{ fontSize: '0.75rem', fontWeight: '600', color: 'var(--text-muted)' }}>Renewal</span>
                    <span style={{ fontSize: '0.8rem', fontWeight: '800', color: 'var(--text-main)' }}>{selectedDetail.renewal_date || '31 Dec 2026'}</span>
                  </div>
                </div>
              </div>

              {/* Operations Section */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                <h3 style={detailSectionTitleStyle}>OPERATIONS</h3>
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(3, 1fr)',
                  gap: '0.75rem'
                }}>
                  <div style={detailKpiCardStyle}>
                    <span style={detailKpiLabelStyle}>Uptime (30d)</span>
                    <span style={{ ...detailKpiValStyle, fontSize: '0.95rem', marginTop: '0.2rem' }}>{selectedDetail.uptime_percent || detailUptime}</span>
                  </div>
                  
                  <div style={detailKpiCardStyle}>
                    <span style={detailKpiLabelStyle}>Account Manager</span>
                    <span style={{ ...detailKpiValStyle, fontSize: '0.95rem', marginTop: '0.2rem' }}>{selectedDetail.account_manager || detailAM}</span>
                  </div>
                  
                  <div style={detailKpiCardStyle}>
                    <span style={detailKpiLabelStyle}>Open Tickets</span>
                    <span style={{ ...detailKpiValStyle, fontSize: '0.95rem', marginTop: '0.2rem' }}>{selectedDetail.open_tickets_count !== undefined ? selectedDetail.open_tickets_count : 1}</span>
                  </div>
                </div>
              </div>

              {/* Enabled Features Section */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                <h3 style={detailSectionTitleStyle}>ENABLED FEATURES</h3>
                <div style={{
                  display: 'flex',
                  flexWrap: 'wrap',
                  gap: '0.5rem'
                }}>
                  {(selectedDetail.enabled_features || ['QR Tokens', 'OTP Return', 'Live Tracking', 'Damage Reports', 'Audit Trail']).map((feat) => (
                    <span 
                      key={feat}
                      style={{
                        fontSize: '0.7rem',
                        fontWeight: '800',
                        border: '1px solid rgba(251, 191, 36, 0.25)',
                        color: '#fbbf24',
                        padding: '0.25rem 0.55rem',
                        borderRadius: '6px',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '0.35rem',
                        backgroundColor: 'rgba(251, 191, 36, 0.03)'
                      }}
                    >
                      <div style={{
                        width: '12px',
                        height: '12px',
                        borderRadius: '50%',
                        backgroundColor: 'rgba(16, 185, 129, 0.15)',
                        border: '1px solid rgba(16, 185, 129, 0.3)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: '#10b981'
                      }}>
                        <Check size={8} strokeWidth={4} />
                      </div>
                      {feat}
                    </span>
                  ))}
                </div>
              </div>

              {/* Actions Footer */}
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.65rem',
                marginTop: '0.5rem',
                flexWrap: 'wrap'
              }}>
                <button
                  onClick={handleSendInvoice}
                  style={{
                    backgroundColor: 'var(--accent)',
                    color: 'var(--accent-text)',
                    border: 'none',
                    borderRadius: '8px',
                    padding: '0.65rem 1.15rem',
                    fontSize: '0.8rem',
                    fontWeight: '700',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    boxShadow: '0 4px 12px var(--accent-shadow)',
                    transition: 'all 0.15s ease'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.filter = 'brightness(1.1)'}
                  onMouseLeave={(e) => e.currentTarget.style.filter = 'none'}
                >
                  <FileText size={14} />
                  <span>Send Invoice</span>
                </button>
                
                <button
                  onClick={handleUpgradePlan}
                  style={detailOutlineBtnStyle}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.03)';
                    e.currentTarget.style.borderColor = 'rgba(255,255,255,0.2)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = 'transparent';
                    e.currentTarget.style.borderColor = 'var(--border-color)';
                  }}
                >
                  Upgrade Plan
                </button>
                
                <button
                  onClick={handleImpersonate}
                  style={detailOutlineBtnStyle}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.03)';
                    e.currentTarget.style.borderColor = 'rgba(255,255,255,0.2)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = 'transparent';
                    e.currentTarget.style.borderColor = 'var(--border-color)';
                  }}
                >
                  Impersonate
                </button>
                
                <button
                  onClick={handleSendEmail}
                  style={{
                    ...detailOutlineBtnStyle,
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.35rem'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.03)';
                    e.currentTarget.style.borderColor = 'rgba(255,255,255,0.2)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = 'transparent';
                    e.currentTarget.style.borderColor = 'var(--border-color)';
                  }}
                >
                  <Mail size={14} />
                  <span>Email</span>
                </button>
                
                <button
                  onClick={handleToggleSuspend}
                  style={{
                    ...detailOutlineBtnStyle,
                    borderColor: 'rgba(239, 68, 68, 0.3)',
                    color: '#ef4444'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = 'rgba(239,68,68,0.06)';
                    e.currentTarget.style.borderColor = 'rgba(239,68,68,0.5)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = 'transparent';
                    e.currentTarget.style.borderColor = 'rgba(239, 68, 68, 0.3)';
                  }}
                >
                  {(selectedDetail.status === 'suspended' || selectedDetail.status === 'inactive') ? 'Reactivate' : 'Suspend'}
                </button>
              </div>

            </div>
          </div>
        );
      })()}

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
            backgroundColor: 'var(--bg-card)',
            border: '1.5px solid var(--border-color)',
            borderRadius: '16px',
            padding: '1.5rem',
            width: '450px',
            maxWidth: '95%',
            maxHeight: '90vh',
            overflowY: 'auto',
            display: 'flex',
            flexDirection: 'column',
            gap: '1.25rem',
            boxShadow: '0 20px 40px rgba(0,0,0,0.5)'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 style={{ fontSize: '1.1rem', fontWeight: '800', color: 'var(--text-main)' }}>Onboard Client</h3>
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
                  <option value="Starter">Starter (₹{(platformSettings?.pricing_starter || 4999).toLocaleString('en-IN')}/mo)</option>
                  <option value="Professional">Professional (₹{(platformSettings?.pricing_pro || 9999).toLocaleString('en-IN')}/mo)</option>
                  <option value="Enterprise">Enterprise (₹{(platformSettings?.pricing_enterprise || 24999).toLocaleString('en-IN')}/mo)</option>
                </select>
              </div>

              <div style={{ height: '1px', backgroundColor: 'var(--border-color)', margin: '0.4rem 0' }}></div>
              <h4 style={{ fontSize: '0.75rem', fontWeight: '800', color: 'var(--accent)', margin: 0, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Owner Credentials</h4>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                <label style={{ fontSize: '0.65rem', fontWeight: '700', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Owner Name *</label>
                <input
                  type="text"
                  required
                  value={clientForm.ownerName}
                  onChange={(e) => setClientForm(prev => ({ ...prev, ownerName: e.target.value }))}
                  placeholder="e.g. Jane Doe"
                  style={inputStyle}
                />
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                <label style={{ fontSize: '0.65rem', fontWeight: '700', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Email ID *</label>
                <input
                  type="email"
                  required
                  value={clientForm.ownerEmail}
                  onChange={(e) => setClientForm(prev => ({ ...prev, ownerEmail: e.target.value }))}
                  placeholder="e.g. jane@company.com"
                  style={inputStyle}
                />
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                <label style={{ fontSize: '0.65rem', fontWeight: '700', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Mobile Number *</label>
                <input
                  type="tel"
                  required
                  value={clientForm.ownerPhone}
                  onChange={(e) => setClientForm(prev => ({ ...prev, ownerPhone: e.target.value }))}
                  placeholder="e.g. +91 98765 43210"
                  style={inputStyle}
                />
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                <label style={{ fontSize: '0.65rem', fontWeight: '700', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Password *</label>
                <input
                  type="password"
                  required
                  value={clientForm.ownerPassword}
                  onChange={(e) => setClientForm(prev => ({ ...prev, ownerPassword: e.target.value }))}
                  placeholder="Minimum 6 characters"
                  style={inputStyle}
                />
              </div>

              <button
                type="submit"
                disabled={loading}
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
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.5rem',
                  boxShadow: '0 4px 15px var(--accent-shadow)'
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
  color: 'var(--text-main)',
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
  backgroundColor: 'var(--bg-subtle)',
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
  color: 'var(--text-main)',
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
  color: 'var(--text-main)'
};

const subCardStyle = {
  backgroundColor: 'var(--bg-subtle)',
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
  color: 'var(--text-main)'
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
  color: 'var(--text-main)'
};

const cityBarContainerStyle = {
  width: '100%',
  height: '6px',
  backgroundColor: 'var(--bg-subtle)',
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
  backgroundColor: 'var(--bg-subtle)',
  color: 'var(--text-main)',
  fontSize: '0.8rem',
  outline: 'none',
  width: '100%'
};

const detailKpiCardStyle = {
  backgroundColor: 'var(--bg-subtle)',
  border: '1px solid var(--border-color)',
  borderRadius: '8px',
  padding: '0.75rem 1rem',
  display: 'flex',
  flexDirection: 'column',
  gap: '0.15rem'
};

const detailKpiLabelStyle = {
  fontSize: '0.6rem',
  fontWeight: '800',
  color: 'var(--text-muted)',
  letterSpacing: '0.04em'
};

const detailKpiValStyle = {
  fontSize: '1.25rem',
  fontWeight: '850',
  color: 'var(--text-main)'
};

const detailSectionTitleStyle = {
  fontSize: '0.75rem',
  fontWeight: '800',
  color: 'var(--text-muted)',
  letterSpacing: '0.06em',
  marginBottom: '0.5rem',
  textTransform: 'uppercase'
};

const detailContactItemStyle = {
  display: 'flex',
  alignItems: 'center',
  gap: '0.65rem'
};

const detailBillingCardStyle = {
  backgroundColor: 'var(--bg-subtle)',
  border: '1px solid var(--border-color)',
  borderRadius: '8px',
  padding: '0.55rem 0.85rem',
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center'
};

const detailOutlineBtnStyle = {
  backgroundColor: 'transparent',
  border: '1px solid var(--border-color)',
  color: 'var(--text-main)',
  borderRadius: '8px',
  padding: '0.65rem 1.15rem',
  fontSize: '0.8rem',
  fontWeight: '700',
  cursor: 'pointer',
  transition: 'all 0.15s ease'
};

export default Analytics;
