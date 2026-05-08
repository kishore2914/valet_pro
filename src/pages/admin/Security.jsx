import React from 'react';
import { 
  ShieldCheck, 
  Lock, 
  Eye, 
  Activity, 
  AlertCircle,
  FileText,
  Clock,
  UserCheck,
  ChevronRight
} from 'lucide-react';
import GlassCard from '../../components/ui/GlassCard';
import Table from '../../components/ui/Table';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';

const Security = () => {
  const auditHeaders = ['Timestamp', 'Event', 'User', 'Location / Target', 'Severity', 'IP Address'];
  
  const logs = [
    { time: '2026-04-17 11:45:22', event: 'Global Admin Login', user: 'Admin User', target: 'System', severity: 'Low', ip: '192.168.1.1' },
    { time: '2026-04-17 11:32:10', event: 'Subscription Tier Update', user: 'Billing Dept', target: 'Grand Plaza', severity: 'Medium', ip: '192.168.1.45' },
    { time: '2026-04-17 11:15:05', event: 'Denied API Access', user: 'Unknown', target: 'Auth-Service', severity: 'High', ip: '203.0.113.1' },
    { time: '2026-04-17 11:00:00', event: 'New Location Onboarded', user: 'Admin User', target: 'City Mall', severity: 'Low', ip: '192.168.1.1' },
  ];

  const formattedLogs = logs.map(log => ({
    time: <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{log.time}</div>,
    event: <div style={{ fontWeight: '600' }}>{log.event}</div>,
    user: log.user,
    target: log.target,
    severity: <Badge variant={log.severity === 'High' ? 'red' : log.severity === 'Medium' ? 'gold' : 'blue'}>{log.severity}</Badge>,
    ip: log.ip
  }));

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ fontSize: '1.875rem' }}>Security & Audit Logs</h1>
          <p style={{ color: 'var(--text-muted)' }}>Centralized monitoring of all system-wide activities</p>
        </div>
        <Button variant="primary">
          <FileText size={18} />
          <span>Export Audit Log</span>
        </Button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1.5rem' }}>
        <GlassCard style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
          <div style={{ padding: '1rem', borderRadius: '12px', backgroundColor: 'rgba(34, 197, 94, 0.1)', color: '#16a34a' }}>
            <ShieldCheck size={28} />
          </div>
          <div>
            <div style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>Firewall Status</div>
            <div style={{ fontSize: '1.5rem', fontWeight: '700' }}>Active & Secure</div>
          </div>
        </GlassCard>
        <GlassCard style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
          <div style={{ padding: '1rem', borderRadius: '12px', backgroundColor: 'rgba(59, 130, 246, 0.1)', color: 'var(--primary)' }}>
            <Lock size={28} />
          </div>
          <div>
            <div style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>Failed Requests</div>
            <div style={{ fontSize: '1.5rem', fontWeight: '700' }}>12 (Global)</div>
          </div>
        </GlassCard>
        <GlassCard style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
          <div style={{ padding: '1rem', borderRadius: '12px', backgroundColor: 'rgba(239, 68, 68, 0.1)', color: '#ef4444' }}>
            <AlertCircle size={28} />
          </div>
          <div>
            <div style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>High Priority Alerts</div>
            <div style={{ fontSize: '1.5rem', fontWeight: '700' }}>1 Active</div>
          </div>
        </GlassCard>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '1.5rem' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <GlassCard>
             <h3 style={{ fontSize: '1.1rem', marginBottom: '1.25rem' }}>Security Quick Actions</h3>
             <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                <Button variant="outline" style={{ justifyContent: 'space-between', width: '100%' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <Lock size={18} /> <span>Rotate API Keys</span>
                  </div>
                  <ChevronRight size={16} />
                </Button>
                <Button variant="outline" style={{ justifyContent: 'space-between', width: '100%' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <UserCheck size={18} /> <span>MFA Enforcement</span>
                  </div>
                  <ChevronRight size={16} />
                </Button>
                <Button variant="outline" style={{ justifyContent: 'space-between', width: '100%' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <Activity size={18} /> <span>System Performance</span>
                  </div>
                  <ChevronRight size={16} />
                </Button>
             </div>
          </GlassCard>

          <GlassCard style={{ backgroundColor: 'var(--bg-app)', color: 'var(--text-main)', border: '1px solid var(--border-subtle)' }}>
             <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
               <ShieldCheck size={20} color="var(--primary)" />
               <span style={{ fontWeight: '600' }}>Compliance Status</span>
             </div>
             <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '1.5rem' }}>
               System is currently compliant with GDPR and PCI-DSS standards.
             </div>
             <div style={{ height: '4px', width: '100%', backgroundColor: 'var(--bg-subtle)', borderRadius: '2px' }}>
                <div style={{ width: '85%', height: '100%', backgroundColor: 'var(--primary)', borderRadius: '2px' }}></div>
             </div>
             <div style={{ marginTop: '0.5rem', fontSize: '0.75rem', textAlign: 'right', color: 'var(--text-muted)' }}>Audit Score: 85/100</div>
          </GlassCard>
        </div>

        <GlassCard style={{ padding: '0' }}>
            <div style={{ padding: '1.5rem', borderBottom: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 style={{ fontSize: '1.1rem' }}>Recent Audit Logs</h3>
              <Button variant="ghost" style={{ fontSize: '0.85rem' }}>Filter by Severity</Button>
            </div>
            <Table headers={auditHeaders} data={formattedLogs} />
        </GlassCard>
      </div>
    </div>
  );
};

export default Security;
