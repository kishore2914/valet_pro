import React, { useState, useEffect } from 'react';
import { 
  AlertTriangle, 
  Camera, 
  Search, 
  Filter, 
  MoreVertical, 
  Calendar,
  User,
  ExternalLink,
  CheckCircle,
  Eye,
  Loader2,
  Car
} from 'lucide-react';
import GlassCard from '../../components/ui/GlassCard';
import Table from '../../components/ui/Table';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';
import Modal from '../../components/ui/Modal';
import { useAuth } from '../../context/AuthContext';
import { incidentService } from '../../services/staffService';

const IncidentTracker = () => {
  const { locationId } = useAuth();
  const [incidents, setIncidents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedIncident, setSelectedIncident] = useState(null);
  
  useEffect(() => {
    if (locationId) {
      fetchIncidents();
    } else {
      setLoading(false);
    }
  }, [locationId]);

  const fetchIncidents = async () => {
    if (!locationId) {
      setLoading(false);
      return;
    }
    
    try {
      setLoading(true);
      const { data } = await incidentService.getIncidents(locationId);
      if (data) setIncidents(data);
    } catch (err) {
      console.error('Error fetching incidents:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleResolve = async (id) => {
    await incidentService.updateIncidentStatus(id, 'Resolved');
    setSelectedIncident(null);
    fetchIncidents();
  };

  const headers = ['Incident ID', 'Date', 'Vehicle', 'Reported By', 'Type', 'Status', 'Priority', 'Actions'];

  const formattedData = incidents.map(inc => ({
    id: <span style={{ fontWeight: '600' }}>INC-{inc.id.slice(0, 8).toUpperCase()}</span>,
    date: new Date(inc.created_at).toLocaleDateString(),
    car: inc.vehicle ? `${inc.vehicle.model} (${inc.vehicle.plate_number})` : 'Unknown Vehicle',
    reportedBy: inc.reported_by || 'Anonymous',
    type: inc.title,
    status: (
      <Badge variant={inc.status === 'Resolved' ? 'green' : inc.status === 'High' ? 'red' : 'gold'}>
        {inc.status}
      </Badge>
    ),
    priority: (
      <Badge variant={inc.priority === 'High' || inc.priority === 'Critical' ? 'red' : inc.priority === 'Medium' ? 'blue' : 'gray'}>
        {inc.priority}
      </Badge>
    ),
    actions: (
      <Button variant="ghost" onClick={() => setSelectedIncident(inc)}>
        <Eye size={18} />
      </Button>
    )
  }));

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ fontSize: '1.875rem' }}>Incident Tracker</h1>
          <p style={{ color: 'var(--text-muted)' }}>Monitor and resolve vehicle damage reports</p>
        </div>
        <Button variant="accent">
          <Camera size={20} />
          <span>New Report</span>
        </Button>
      </div>

      <div style={{ display: 'flex', gap: '1.5rem' }}>
        <GlassCard style={{ flex: 1, borderLeft: '4px solid #ef4444', backgroundColor: 'var(--bg-card)' }}>
          <div style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>High Priority</div>
          <div style={{ fontSize: '1.5rem', fontWeight: '800' }}>
            {incidents.filter(i => i.priority === 'High' || i.priority === 'Critical').length} Reports
          </div>
        </GlassCard>
        <GlassCard style={{ flex: 1, borderLeft: '4px solid #f59e0b', backgroundColor: 'var(--bg-card)' }}>
          <div style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>Open Issues</div>
          <div style={{ fontSize: '1.5rem', fontWeight: '800' }}>
            {incidents.filter(i => i.status !== 'Resolved').length} Reports
          </div>
        </GlassCard>
        <GlassCard style={{ flex: 1, borderLeft: '4px solid #10b981', backgroundColor: 'var(--bg-card)' }}>
          <div style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>Resolved</div>
          <div style={{ fontSize: '1.5rem', fontWeight: '800' }}>
            {incidents.filter(i => i.status === 'Resolved').length} Reports
          </div>
        </GlassCard>
      </div>

      <GlassCard style={{ padding: '0' }}>
        <div style={{ padding: '1.5rem', borderBottom: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h3 style={{ fontSize: '1.1rem' }}>All Logs</h3>
          <div style={{ display: 'flex', gap: '0.75rem' }}>
             <Button variant="outline" size="sm" style={{ padding: '4px 12px' }} onClick={fetchIncidents}>
               {loading ? <Loader2 size={14} className="animate-spin" /> : <Filter size={14} />} <span>Refresh</span>
             </Button>
          </div>
        </div>
        {loading ? (
          <div style={{ padding: '3rem', textAlign: 'center' }}><Loader2 size={32} className="animate-spin" style={{ margin: '0 auto' }} /></div>
        ) : (
          <Table headers={headers} data={formattedData} />
        )}
      </GlassCard>

      <Modal 
        isOpen={!!selectedIncident} 
        onClose={() => setSelectedIncident(null)}
        title={`Incident Details: INC-${selectedIncident?.id.slice(0, 8).toUpperCase()}`}
      >
        {selectedIncident && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
              <div style={{ backgroundColor: 'var(--bg-app)', padding: '1.25rem', borderRadius: '12px', border: '1px solid var(--border-subtle)' }}>
                <h4 style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '1rem', textTransform: 'uppercase' }}>Vehicle Info</h4>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
                  <div style={{ width: '40px', height: '40px', borderRadius: '8px', backgroundColor: 'var(--bg-surface)', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid var(--border-color)' }}>
                    <Car size={20} color="var(--primary)" />
                  </div>
                  <div>
                    <div style={{ fontWeight: '700' }}>{selectedIncident.vehicle?.model || 'Unknown'}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{selectedIncident.vehicle?.plate_number || 'N/A'}</div>
                  </div>
                </div>
              </div>

              <div style={{ backgroundColor: 'var(--bg-app)', padding: '1.25rem', borderRadius: '12px', border: '1px solid var(--border-subtle)' }}>
                <h4 style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '1rem', textTransform: 'uppercase' }}>Reporter</h4>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  <div style={{ width: '40px', height: '40px', borderRadius: '20px', backgroundColor: 'var(--primary)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold' }}>
                    {selectedIncident.reported_by?.[0] || 'A'}
                  </div>
                  <div>
                    <div style={{ fontWeight: '700' }}>{selectedIncident.reported_by || 'Anonymous'}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Valet Staff</div>
                  </div>
                </div>
              </div>
            </div>

            <div>
              <h4 style={{ fontSize: '0.9rem', marginBottom: '0.75rem' }}>Description</h4>
              <p style={{ fontSize: '0.9rem', color: 'var(--text-main)', lineHeight: '1.6' }}>{selectedIncident.description || 'No description provided.'}</p>
            </div>

            <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem', borderTop: '1px solid var(--border-color)', paddingTop: '1.5rem' }}>
              <Button variant="outline" style={{ flex: 1 }} onClick={() => setSelectedIncident(null)}>Close</Button>
              {selectedIncident.status !== 'Resolved' && (
                <Button variant="primary" style={{ flex: 1 }} onClick={() => handleResolve(selectedIncident.id)}>Mark as Resolved</Button>
              )}
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default IncidentTracker;
