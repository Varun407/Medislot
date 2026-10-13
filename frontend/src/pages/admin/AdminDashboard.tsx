import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { apiClient } from '../../api/client';
import { PlatformStats } from '../../types';
import {
  Users,
  UserCheck,
  Calendar,
  Building2,
  ShieldAlert,
  ArrowRight,
  Clock,
  Activity,
  CheckCircle,
  FileText
} from 'lucide-react';

export const AdminDashboard: React.FC = () => {
  const [stats, setStats] = useState<PlatformStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadStats() {
      try {
        const res = await apiClient.get('/admin/dashboard');
        setStats(res.data);
      } catch (err) {
        console.error('Failed to load admin stats:', err);
      } finally {
        setLoading(false);
      }
    }
    loadStats();
  }, []);

  return (
    <div className="main-content">
      <div className="section-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <h1 className="section-title">Healthcare Platform Control Center</h1>
          <p className="section-subtitle">
            Department of Health & Family Welfare · Oversight & Governance Dashboard
          </p>
        </div>

        <div style={{ display: 'flex', gap: '10px' }}>
          <Link to="/admin/doctors" className="btn btn-primary btn-sm">
            <UserCheck size={14} />
            Doctor Verification Queue ({stats?.doctors.pending || 0})
          </Link>
          <Link to="/admin/audit-logs" className="btn btn-secondary btn-sm">
            <ShieldAlert size={14} />
            Security Audit Logs
          </Link>
        </div>
      </div>

      {/* Metrics Row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '16px', marginBottom: '28px' }}>
        <div className="med-card" style={{ padding: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '10px' }}>
            <div className="stat-icon" style={{ background: 'var(--blue-50)', color: 'var(--blue-600)' }}><Users /></div>
            <div>
              <div style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--navy-900)' }}>{stats?.patients.total || 0}</div>
              <div style={{ fontSize: '0.78rem', color: 'var(--slate-500)', fontWeight: 600 }}>Registered Patients</div>
            </div>
          </div>
          <Link to="/admin/patients" style={{ fontSize: '0.8rem', fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
            View all patients →
          </Link>
        </div>

        <div className="med-card" style={{ padding: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '10px' }}>
            <div className="stat-icon" style={{ background: 'var(--amber-100)', color: 'var(--amber-600)' }}><Clock /></div>
            <div>
              <div style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--amber-600)' }}>{stats?.doctors.pending || 0}</div>
              <div style={{ fontSize: '0.78rem', color: 'var(--slate-500)', fontWeight: 600 }}>Pending Doctor Approvals</div>
            </div>
          </div>
          <Link to="/admin/doctors" style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--amber-600)', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
            Review pending queue →
          </Link>
        </div>

        <div className="med-card" style={{ padding: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '10px' }}>
            <div className="stat-icon" style={{ background: 'var(--emerald-100)', color: 'var(--emerald-600)' }}><UserCheck /></div>
            <div>
              <div style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--emerald-600)' }}>{stats?.doctors.verified || 0}</div>
              <div style={{ fontSize: '0.78rem', color: 'var(--slate-500)', fontWeight: 600 }}>Active Verified Doctors</div>
            </div>
          </div>
          <span style={{ fontSize: '0.78rem', color: 'var(--slate-400)' }}>
            Total physicians: {stats?.doctors.total || 0}
          </span>
        </div>

        <div className="med-card" style={{ padding: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '10px' }}>
            <div className="stat-icon" style={{ background: '#ede9fe', color: '#6d28d9' }}><Calendar /></div>
            <div>
              <div style={{ fontSize: '1.75rem', fontWeight: 800, color: '#6d28d9' }}>{stats?.appointments.total || 0}</div>
              <div style={{ fontSize: '0.78rem', color: 'var(--slate-500)', fontWeight: 600 }}>Total OPD Bookings</div>
            </div>
          </div>
          <Link to="/admin/appointments" style={{ fontSize: '0.8rem', fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
            Today: {stats?.appointments.todayTotal || 0} · Monitor appointments →
          </Link>
        </div>
      </div>

      {/* Grid: Fast Actions & Audit Stream */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: '24px' }}>
        {/* Security Audit Log Stream */}
        <div className="med-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <ShieldAlert size={18} color="var(--navy-900)" />
              <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 800 }}>Recent Administrative & Security Events</h3>
            </div>
            <Link to="/admin/audit-logs" style={{ fontSize: '0.8rem', fontWeight: 600 }}>
              Full Log →
            </Link>
          </div>

          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.82rem' }}>
              <thead>
                <tr style={{ borderBottom: '2px solid var(--slate-200)', textAlign: 'left', color: 'var(--slate-500)', fontSize: '0.75rem' }}>
                  <th style={{ padding: '8px 10px' }}>TIMESTAMP</th>
                  <th style={{ padding: '8px 10px' }}>ACTOR</th>
                  <th style={{ padding: '8px 10px' }}>ACTION</th>
                  <th style={{ padding: '8px 10px' }}>RESOURCE</th>
                </tr>
              </thead>
              <tbody>
                {stats?.recentAudits && stats.recentAudits.length > 0 ? (
                  stats.recentAudits.slice(0, 6).map((log) => (
                    <tr key={log.id} style={{ borderBottom: '1px solid var(--slate-100)' }}>
                      <td style={{ padding: '9px 10px', color: 'var(--slate-500)', whiteSpace: 'nowrap' }}>
                        {log.createdAt ? new Date(log.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }) : '-'}
                      </td>
                      <td style={{ padding: '9px 10px', fontWeight: 600 }}>
                        <span className="status-pill status-completed" style={{ fontSize: '0.68rem' }}>
                          {log.actorRole}
                        </span>
                      </td>
                      <td style={{ padding: '9px 10px', fontWeight: 700, color: 'var(--navy-900)' }}>{log.action}</td>
                      <td style={{ padding: '9px 10px', color: 'var(--slate-600)' }}>{log.resource}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={4} style={{ padding: '20px', textAlign: 'center', color: 'var(--slate-400)' }}>
                      No audit events recorded yet.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Platform Quick Links & AP Hospitals Infrastructure Status */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div className="med-card" style={{ background: 'var(--slate-50)' }}>
            <h4 style={{ margin: '0 0 12px', fontSize: '1rem', fontWeight: 800, color: 'var(--navy-900)' }}>
              Hospital Bed Capacity Tracker
            </h4>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px', textAlign: 'center' }}>
              <div style={{ background: '#ffffff', padding: '12px', borderRadius: '8px', border: '1px solid var(--slate-200)' }}>
                <div style={{ fontSize: '1.35rem', fontWeight: 900, color: 'var(--emerald-600)' }}>
                  {stats?.hospitals.availableBeds || 0}
                </div>
                <div style={{ fontSize: '0.7rem', color: 'var(--slate-500)', fontWeight: 600 }}>General Beds</div>
              </div>

              <div style={{ background: '#ffffff', padding: '12px', borderRadius: '8px', border: '1px solid var(--slate-200)' }}>
                <div style={{ fontSize: '1.35rem', fontWeight: 900, color: 'var(--blue-600)' }}>
                  {stats?.hospitals.icuBeds || 0}
                </div>
                <div style={{ fontSize: '0.7rem', color: 'var(--slate-500)', fontWeight: 600 }}>ICU Beds</div>
              </div>

              <div style={{ background: '#ffffff', padding: '12px', borderRadius: '8px', border: '1px solid var(--slate-200)' }}>
                <div style={{ fontSize: '1.35rem', fontWeight: 900, color: 'var(--navy-900)' }}>
                  {stats?.hospitals.oxygenBeds || 0}
                </div>
                <div style={{ fontSize: '0.7rem', color: 'var(--slate-500)', fontWeight: 600 }}>Oxygen Beds</div>
              </div>
            </div>
          </div>

          <div className="med-card">
            <h4 style={{ margin: '0 0 12px', fontSize: '1rem', fontWeight: 800, color: 'var(--navy-900)' }}>
              Administrative Workflows
            </h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <Link to="/admin/doctors" className="btn btn-secondary btn-sm" style={{ justifyContent: 'space-between' }}>
                <span>Doctor Licensure & Verification</span>
                <ArrowRight size={14} />
              </Link>
              <Link to="/admin/patients" className="btn btn-secondary btn-sm" style={{ justifyContent: 'space-between' }}>
                <span>Patient Directory & Access Control</span>
                <ArrowRight size={14} />
              </Link>
              <Link to="/admin/appointments" className="btn btn-secondary btn-sm" style={{ justifyContent: 'space-between' }}>
                <span>Hospital Appointment Roster Monitoring</span>
                <ArrowRight size={14} />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
