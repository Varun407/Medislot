import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { apiClient } from '../../api/client';
import { PlatformStats, Grievance } from '../../types';
import { useToast } from '../../context/ToastContext';
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
  FileText,
  Stethoscope,
  Phone,
  Search,
  RefreshCw,
  Eye,
  AlertCircle,
  XCircle,
  X,
  MessageSquare,
  Tag
} from 'lucide-react';

export const AdminDashboard: React.FC = () => {
  const { success, error } = useToast();

  const [stats, setStats] = useState<PlatformStats | null>(null);
  const [loading, setLoading] = useState(true);

  // Grievance states
  const [grievances, setGrievances] = useState<Grievance[]>([]);
  const [loadingGrievances, setLoadingGrievances] = useState(true);
  const [grievanceFilterStatus, setGrievanceFilterStatus] = useState<string>('ALL');
  const [grievanceFilterCategory, setGrievanceFilterCategory] = useState<string>('ALL');
  const [grievanceSearch, setGrievanceSearch] = useState<string>('');
  const [selectedGrievance, setSelectedGrievance] = useState<Grievance | null>(null);
  const [updatingStatusId, setUpdatingStatusId] = useState<string | null>(null);

  const loadStats = async () => {
    try {
      const res = await apiClient.get('/admin/dashboard');
      setStats(res.data);
    } catch (err) {
      console.error('Failed to load admin stats:', err);
    } finally {
      setLoading(false);
    }
  };

  const loadGrievances = async () => {
    setLoadingGrievances(true);
    try {
      const params: Record<string, string> = {};
      if (grievanceFilterStatus !== 'ALL') params.status = grievanceFilterStatus;
      if (grievanceFilterCategory !== 'ALL') params.category = grievanceFilterCategory;
      if (grievanceSearch.trim()) params.search = grievanceSearch.trim();

      const res = await apiClient.get('/admin/grievances', { params });
      setGrievances(res.data);
    } catch (err) {
      console.error('Failed to load grievances:', err);
    } finally {
      setLoadingGrievances(false);
    }
  };

  useEffect(() => {
    loadStats();
    loadGrievances();
  }, []);

  useEffect(() => {
    loadGrievances();
  }, [grievanceFilterStatus, grievanceFilterCategory]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    loadGrievances();
  };

  const handleUpdateStatus = async (id: string, newStatus: string) => {
    setUpdatingStatusId(id);
    try {
      await apiClient.patch(`/admin/grievances/${id}/status`, { status: newStatus });
      success(`Grievance ${id} status updated to ${newStatus}`);
      await Promise.all([loadGrievances(), loadStats()]);
      if (selectedGrievance && selectedGrievance.id === id) {
        setSelectedGrievance({ ...selectedGrievance, status: newStatus });
      }
    } catch (err: any) {
      error(err.response?.data?.error || 'Failed to update grievance status');
    } finally {
      setUpdatingStatusId(null);
    }
  };

  const getStatusBadge = (status: string) => {
    const s = (status || '').toUpperCase();
    if (s === 'SUBMITTED') {
      return (
        <span
          className="status-pill"
          style={{ background: '#fef3c7', color: '#92400e', borderColor: '#fde68a', display: 'inline-flex', alignItems: 'center', gap: '4px', fontSize: '0.74rem' }}
        >
          <AlertCircle size={12} color="#b45309" />
          Pending Review
        </span>
      );
    }
    if (s === 'IN_REVIEW') {
      return (
        <span
          className="status-pill"
          style={{ background: '#dbeafe', color: '#1e40af', borderColor: '#bfdbfe', display: 'inline-flex', alignItems: 'center', gap: '4px', fontSize: '0.74rem' }}
        >
          <Clock size={12} color="#2563eb" />
          In Review
        </span>
      );
    }
    if (s === 'RESOLVED') {
      return (
        <span
          className="status-pill status-verified"
          style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', fontSize: '0.74rem' }}
        >
          <CheckCircle size={12} color="#10b981" />
          Resolved
        </span>
      );
    }
    if (s === 'REJECTED') {
      return (
        <span
          className="status-pill"
          style={{ background: '#f1f5f9', color: '#475569', borderColor: '#e2e8f0', display: 'inline-flex', alignItems: 'center', gap: '4px', fontSize: '0.74rem' }}
        >
          <XCircle size={12} color="#64748b" />
          Closed / Rejected
        </span>
      );
    }
    return <span className="status-pill">{status}</span>;
  };

  return (
    <div className="main-content">
      {/* Header Bar */}
      <div className="section-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <h1 className="section-title">Healthcare Platform Control Center</h1>
          <p className="section-subtitle">
            Department of Health & Family Welfare · Oversight & Governance Dashboard
          </p>
        </div>

        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
          <a
            href="#grievances-section"
            className="btn btn-outline btn-sm"
            style={{
              borderColor: '#f59e0b',
              color: '#b45309',
              background: 'rgba(245, 158, 11, 0.08)',
              fontWeight: 700
            }}
          >
            <FileText size={14} color="#d97706" />
            Citizen Grievances ({stats?.grievances?.submitted || 0} Pending)
          </a>
          <Link to="/admin/opd" className="btn btn-primary btn-sm" style={{ background: 'var(--emerald-600)', borderColor: 'var(--emerald-600)' }}>
            <Stethoscope size={14} />
            Manage Doctor OPDs & Queues
          </Link>
          <Link to="/admin/doctors" className="btn btn-outline btn-sm">
            <UserCheck size={14} />
            Doctor Approvals ({stats?.doctors.pending || 0})
          </Link>
          <Link to="/admin/audit-logs" className="btn btn-secondary btn-sm">
            <ShieldAlert size={14} />
            Audit Logs
          </Link>
        </div>
      </div>

      {/* Metrics Row (5 Cards) */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))', gap: '16px', marginBottom: '28px' }}>
        {/* Patients */}
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

        {/* Pending Doctors */}
        <div className="med-card" style={{ padding: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '10px' }}>
            <div className="stat-icon" style={{ background: 'var(--amber-100)', color: 'var(--amber-600)' }}><Clock /></div>
            <div>
              <div style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--amber-600)' }}>{stats?.doctors.pending || 0}</div>
              <div style={{ fontSize: '0.78rem', color: 'var(--slate-500)', fontWeight: 600 }}>Doctor Approvals</div>
            </div>
          </div>
          <Link to="/admin/doctors" style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--amber-600)', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
            Review pending queue →
          </Link>
        </div>

        {/* Verified Doctors */}
        <div className="med-card" style={{ padding: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '10px' }}>
            <div className="stat-icon" style={{ background: 'var(--emerald-100)', color: 'var(--emerald-600)' }}><UserCheck /></div>
            <div>
              <div style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--emerald-600)' }}>{stats?.doctors.verified || 0}</div>
              <div style={{ fontSize: '0.78rem', color: 'var(--slate-500)', fontWeight: 600 }}>Active Doctors</div>
            </div>
          </div>
          <span style={{ fontSize: '0.78rem', color: 'var(--slate-400)' }}>
            Total physicians: {stats?.doctors.total || 0}
          </span>
        </div>

        {/* Appointments */}
        <div className="med-card" style={{ padding: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '10px' }}>
            <div className="stat-icon" style={{ background: '#ede9fe', color: '#6d28d9' }}><Calendar /></div>
            <div>
              <div style={{ fontSize: '1.75rem', fontWeight: 800, color: '#6d28d9' }}>{stats?.appointments.total || 0}</div>
              <div style={{ fontSize: '0.78rem', color: 'var(--slate-500)', fontWeight: 600 }}>OPD Bookings</div>
            </div>
          </div>
          <Link to="/admin/appointments" style={{ fontSize: '0.8rem', fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
            Today: {stats?.appointments.todayTotal || 0} →
          </Link>
        </div>

        {/* Citizen Grievances */}
        <div className="med-card" style={{ padding: '20px', borderLeft: '4px solid #f59e0b' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '10px' }}>
            <div className="stat-icon" style={{ background: '#fef3c7', color: '#b45309' }}><FileText /></div>
            <div>
              <div style={{ fontSize: '1.75rem', fontWeight: 800, color: '#b45309' }}>
                {stats?.grievances?.total || 0}
              </div>
              <div style={{ fontSize: '0.78rem', color: 'var(--slate-500)', fontWeight: 600 }}>Citizen Grievances</div>
            </div>
          </div>
          <div style={{ fontSize: '0.76rem', color: 'var(--slate-500)', display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '6px' }}>
            <span style={{ color: '#b45309', fontWeight: 700 }}>{stats?.grievances?.submitted || 0} Pending</span>
            <span>·</span>
            <span style={{ color: '#2563eb', fontWeight: 600 }}>{stats?.grievances?.inReview || 0} In Review</span>
            <span>·</span>
            <span style={{ color: '#059669', fontWeight: 600 }}>{stats?.grievances?.resolved || 0} Resolved</span>
          </div>
          <a href="#grievances-section" style={{ fontSize: '0.8rem', fontWeight: 700, color: '#b45309', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
            Review submitted forms →
          </a>
        </div>
      </div>

      {/* Grid: Fast Actions & Audit Stream */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: '24px', marginBottom: '28px' }}>
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
                  stats.recentAudits.slice(0, 5).map((log) => (
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
              <Link to="/admin/opd" className="btn btn-primary btn-sm" style={{ justifyContent: 'space-between', background: 'var(--blue-600)' }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Stethoscope size={14} />
                  Doctor OPD Rosters & Queue Control
                </span>
                <ArrowRight size={14} />
              </Link>
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

      {/* =========================================================================
          CITIZEN GRIEVANCE FORMS & FEEDBACK OVERSIGHT (NEW SECTION)
          ========================================================================= */}
      <div id="grievances-section" className="med-card" style={{ padding: '24px', border: '1px solid var(--slate-200)', boxShadow: 'var(--shadow-sm)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '14px', marginBottom: '20px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div style={{ width: '38px', height: '38px', borderRadius: '10px', background: '#fef3c7', color: '#b45309', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <FileText size={20} />
              </div>
              <div>
                <h3 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 800, color: 'var(--navy-900)' }}>
                  Citizen Grievances & Redressal Stream
                </h3>
                <p style={{ margin: 0, fontSize: '0.82rem', color: 'var(--slate-500)' }}>
                  Submitted feedback and complaints from citizens across AP government hospitals
                </p>
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <button
              onClick={() => { loadGrievances(); loadStats(); }}
              className="btn btn-secondary btn-sm"
              style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}
              title="Refresh Grievances"
            >
              <RefreshCw size={13} className={loadingGrievances ? 'animate-spin' : ''} />
              Refresh
            </button>
            <span className="status-pill status-verified" style={{ fontSize: '0.76rem' }}>
              Total: {grievances.length}
            </span>
          </div>
        </div>

        {/* Filter Toolbar */}
        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', alignItems: 'center', marginBottom: '18px', background: 'var(--slate-50)', padding: '14px', borderRadius: '12px', border: '1px solid var(--slate-200)' }}>
          {/* Search Box */}
          <form onSubmit={handleSearchSubmit} style={{ flex: '1 1 240px', display: 'flex', gap: '8px' }}>
            <div style={{ position: 'relative', width: '100%' }}>
              <input
                type="text"
                className="form-input"
                placeholder="Search citizen name, phone, tracking ID (#AP-GRV-...), or keyword..."
                value={grievanceSearch}
                onChange={(e) => setGrievanceSearch(e.target.value)}
                style={{ paddingLeft: '34px', fontSize: '0.84rem' }}
              />
              <Search size={15} color="var(--slate-400)" style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)' }} />
            </div>
            <button type="submit" className="btn btn-primary btn-sm">
              Search
            </button>
          </form>

          {/* Status Tabs */}
          <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
            {[
              { id: 'ALL', label: 'All Status' },
              { id: 'SUBMITTED', label: 'Pending Review' },
              { id: 'IN_REVIEW', label: 'In Review' },
              { id: 'RESOLVED', label: 'Resolved' },
              { id: 'REJECTED', label: 'Rejected' }
            ].map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setGrievanceFilterStatus(tab.id)}
                className={`btn btn-sm ${grievanceFilterStatus === tab.id ? 'btn-primary' : 'btn-outline'}`}
                style={{ fontSize: '0.76rem', padding: '5px 10px' }}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Category Filter */}
          <div>
            <select
              className="form-select"
              value={grievanceFilterCategory}
              onChange={(e) => setGrievanceFilterCategory(e.target.value)}
              style={{ fontSize: '0.8rem', padding: '6px 12px', minWidth: '160px' }}
            >
              <option value="ALL">All Categories</option>
              <option value="OPD Waiting Time">OPD Waiting Time</option>
              <option value="Medicine Availability">Medicine Availability</option>
              <option value="Hospital Sanitation">Hospital Sanitation</option>
              <option value="Doctor Availability">Doctor Availability</option>
              <option value="Diagnostics & Lab">Diagnostics & Lab</option>
              <option value="Other Suggestion">Other Suggestion</option>
            </select>
          </div>
        </div>

        {/* Grievance Table / Roster */}
        {loadingGrievances ? (
          <div style={{ textAlign: 'center', padding: '40px 20px', color: 'var(--slate-500)' }}>
            <div className="pulse-dot" style={{ margin: '0 auto 10px' }} />
            Loading submitted grievance forms...
          </div>
        ) : grievances.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '48px 20px', background: 'var(--slate-50)', borderRadius: '12px', border: '1px dashed var(--slate-300)' }}>
            <FileText size={40} color="var(--slate-400)" style={{ margin: '0 auto 10px' }} />
            <p style={{ margin: 0, fontWeight: 700, color: 'var(--navy-900)', fontSize: '1rem' }}>
              No submitted grievance forms matched the current filters.
            </p>
            <p style={{ margin: '4px 0 16px', fontSize: '0.82rem', color: 'var(--slate-500)' }}>
              Try clearing filters or search keywords to view all citizen submissions.
            </p>
            <button
              onClick={() => { setGrievanceFilterStatus('ALL'); setGrievanceFilterCategory('ALL'); setGrievanceSearch(''); }}
              className="btn btn-secondary btn-sm"
            >
              Reset Filters
            </button>
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.84rem' }}>
              <thead>
                <tr style={{ borderBottom: '2px solid var(--slate-200)', textAlign: 'left', color: 'var(--slate-500)', fontSize: '0.74rem' }}>
                  <th style={{ padding: '10px 12px' }}>TRACKING ID</th>
                  <th style={{ padding: '10px 12px' }}>CITIZEN DETAILS</th>
                  <th style={{ padding: '10px 12px' }}>HOSPITAL & CATEGORY</th>
                  <th style={{ padding: '10px 12px' }}>GRIEVANCE MESSAGE</th>
                  <th style={{ padding: '10px 12px' }}>SUBMITTED AT</th>
                  <th style={{ padding: '10px 12px' }}>STATUS</th>
                  <th style={{ padding: '10px 12px', textAlign: 'right' }}>ACTIONS</th>
                </tr>
              </thead>
              <tbody>
                {grievances.map((grv) => (
                  <tr key={grv.id} style={{ borderBottom: '1px solid var(--slate-100)', transition: 'background 0.15s' }}>
                    {/* Tracking ID */}
                    <td style={{ padding: '12px', whiteSpace: 'nowrap' }}>
                      <span
                        style={{
                          fontWeight: 800,
                          color: 'var(--blue-700)',
                          background: 'var(--blue-50)',
                          padding: '3px 8px',
                          borderRadius: '6px',
                          border: '1px solid var(--blue-200)',
                          fontSize: '0.78rem'
                        }}
                      >
                        {grv.id}
                      </span>
                    </td>

                    {/* Citizen Name & Phone */}
                    <td style={{ padding: '12px' }}>
                      <div style={{ fontWeight: 700, color: 'var(--navy-900)' }}>{grv.citizenName}</div>
                      <div style={{ fontSize: '0.78rem', color: 'var(--slate-500)', display: 'flex', alignItems: 'center', gap: '4px', marginTop: '2px' }}>
                        <Phone size={11} color="var(--blue-600)" />
                        <a href={`tel:${grv.citizenPhone}`} style={{ color: 'var(--slate-600)', textDecoration: 'none' }}>
                          +91 {grv.citizenPhone}
                        </a>
                      </div>
                    </td>

                    {/* Hospital & Category */}
                    <td style={{ padding: '12px' }}>
                      <div style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--navy-900)', maxWidth: '220px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }} title={grv.hospitalName}>
                        <Building2 size={12} color="var(--slate-400)" style={{ display: 'inline', marginRight: '4px' }} />
                        {grv.hospitalName || 'General Hospital'}
                      </div>
                      <div style={{ marginTop: '4px' }}>
                        <span className="status-pill status-completed" style={{ fontSize: '0.7rem' }}>
                          <Tag size={10} style={{ display: 'inline', marginRight: '3px' }} />
                          {grv.category || 'Feedback'}
                        </span>
                      </div>
                    </td>

                    {/* Message Preview */}
                    <td style={{ padding: '12px', maxWidth: '280px' }}>
                      <p
                        style={{
                          margin: 0,
                          fontSize: '0.82rem',
                          color: 'var(--slate-600)',
                          display: '-webkit-box',
                          WebkitLineClamp: 2,
                          WebkitBoxOrient: 'vertical',
                          overflow: 'hidden',
                          lineHeight: 1.4
                        }}
                        title={grv.message}
                      >
                        {grv.message}
                      </p>
                    </td>

                    {/* Submitted At */}
                    <td style={{ padding: '12px', whiteSpace: 'nowrap', color: 'var(--slate-500)', fontSize: '0.78rem' }}>
                      {grv.createdAt ? (
                        <>
                          <div>{new Date(grv.createdAt).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' })}</div>
                          <div style={{ fontSize: '0.72rem', color: 'var(--slate-400)' }}>
                            {new Date(grv.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </div>
                        </>
                      ) : '-'}
                    </td>

                    {/* Status Pill */}
                    <td style={{ padding: '12px', whiteSpace: 'nowrap' }}>
                      {getStatusBadge(grv.status)}
                    </td>

                    {/* Actions */}
                    <td style={{ padding: '12px', textAlign: 'right', whiteSpace: 'nowrap' }}>
                      <div style={{ display: 'inline-flex', gap: '6px', alignItems: 'center' }}>
                        <button
                          onClick={() => setSelectedGrievance(grv)}
                          className="btn btn-outline btn-sm"
                          style={{ padding: '4px 8px', fontSize: '0.76rem', display: 'inline-flex', alignItems: 'center', gap: '4px' }}
                          title="View Full Grievance Form & Manage Status"
                        >
                          <Eye size={13} />
                          Review Form
                        </button>

                        {grv.status === 'SUBMITTED' && (
                          <button
                            onClick={() => handleUpdateStatus(grv.id, 'IN_REVIEW')}
                            disabled={updatingStatusId === grv.id}
                            className="btn btn-secondary btn-sm"
                            style={{ padding: '4px 8px', fontSize: '0.72rem', color: '#1e40af', borderColor: '#bfdbfe' }}
                            title="Acknowledge and mark In Review"
                          >
                            Mark In Review
                          </button>
                        )}

                        {(grv.status === 'SUBMITTED' || grv.status === 'IN_REVIEW') && (
                          <button
                            onClick={() => handleUpdateStatus(grv.id, 'RESOLVED')}
                            disabled={updatingStatusId === grv.id}
                            className="btn btn-primary btn-sm"
                            style={{ padding: '4px 8px', fontSize: '0.72rem', background: 'var(--emerald-600)', borderColor: 'var(--emerald-600)' }}
                            title="Resolve citizen grievance"
                          >
                            Resolve
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* =========================================================================
          DETAILED GRIEVANCE MODAL FOR ADMIN ACTION
          ========================================================================= */}
      {selectedGrievance && (
        <div className="modal-overlay" onClick={() => setSelectedGrievance(null)}>
          <div
            className="modal-content"
            style={{ maxWidth: '640px', width: '90%' }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="modal-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <h3 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 800, color: 'var(--navy-900)' }}>
                    Citizen Grievance Form
                  </h3>
                  <span style={{ fontSize: '0.8rem', fontWeight: 800, color: 'var(--blue-600)', background: 'var(--blue-50)', padding: '2px 8px', borderRadius: '4px' }}>
                    #{selectedGrievance.id}
                  </span>
                </div>
                <p style={{ margin: '4px 0 0', fontSize: '0.78rem', color: 'var(--slate-500)' }}>
                  Submitted on {new Date(selectedGrievance.createdAt).toLocaleString()}
                </p>
              </div>
              <button
                type="button"
                className="btn btn-secondary btn-sm"
                onClick={() => setSelectedGrievance(null)}
                style={{ padding: '4px 8px' }}
              >
                <X size={16} />
              </button>
            </div>

            {/* Modal Body */}
            <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {/* Status Header Bar */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'var(--slate-50)', padding: '12px 16px', borderRadius: '8px', border: '1px solid var(--slate-200)' }}>
                <span style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--slate-600)' }}>Current Redressal Status:</span>
                <div>{getStatusBadge(selectedGrievance.status)}</div>
              </div>

              {/* Citizen & Facility Details Grid */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px', fontSize: '0.84rem' }}>
                <div style={{ background: 'var(--slate-50)', padding: '12px', borderRadius: '8px' }}>
                  <div style={{ fontSize: '0.72rem', color: 'var(--slate-500)', fontWeight: 600, textTransform: 'uppercase', marginBottom: '4px' }}>
                    Citizen Name
                  </div>
                  <div style={{ fontWeight: 800, color: 'var(--navy-900)' }}>{selectedGrievance.citizenName}</div>
                </div>

                <div style={{ background: 'var(--slate-50)', padding: '12px', borderRadius: '8px' }}>
                  <div style={{ fontSize: '0.72rem', color: 'var(--slate-500)', fontWeight: 600, textTransform: 'uppercase', marginBottom: '4px' }}>
                    Mobile Phone
                  </div>
                  <div style={{ fontWeight: 700, color: 'var(--blue-600)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Phone size={13} />
                    <a href={`tel:${selectedGrievance.citizenPhone}`} style={{ color: 'var(--blue-600)', textDecoration: 'none' }}>
                      +91 {selectedGrievance.citizenPhone}
                    </a>
                  </div>
                </div>

                <div style={{ background: 'var(--slate-50)', padding: '12px', borderRadius: '8px', gridColumn: 'span 2' }}>
                  <div style={{ fontSize: '0.72rem', color: 'var(--slate-500)', fontWeight: 600, textTransform: 'uppercase', marginBottom: '4px' }}>
                    Hospital Facility
                  </div>
                  <div style={{ fontWeight: 700, color: 'var(--navy-900)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Building2 size={14} color="var(--blue-600)" />
                    {selectedGrievance.hospitalName}
                  </div>
                </div>

                <div style={{ background: 'var(--slate-50)', padding: '12px', borderRadius: '8px', gridColumn: 'span 2' }}>
                  <div style={{ fontSize: '0.72rem', color: 'var(--slate-500)', fontWeight: 600, textTransform: 'uppercase', marginBottom: '4px' }}>
                    Category of Issue
                  </div>
                  <div style={{ fontWeight: 700, color: 'var(--navy-900)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Tag size={14} color="var(--purple-600)" />
                    {selectedGrievance.category}
                  </div>
                </div>
              </div>

              {/* Citizen Message */}
              <div>
                <div style={{ fontSize: '0.76rem', color: 'var(--slate-500)', fontWeight: 700, textTransform: 'uppercase', marginBottom: '6px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <MessageSquare size={14} color="var(--navy-900)" />
                  Citizen's Detailed Statement / Complaint:
                </div>
                <div
                  style={{
                    background: '#ffffff',
                    border: '1px solid var(--slate-200)',
                    borderRadius: '8px',
                    padding: '16px',
                    fontSize: '0.9rem',
                    lineHeight: 1.6,
                    color: 'var(--navy-900)',
                    whiteSpace: 'pre-wrap',
                    boxShadow: 'var(--shadow-xs)'
                  }}
                >
                  {selectedGrievance.message}
                </div>
              </div>

              {/* Status Update Actions */}
              <div style={{ borderTop: '1px solid var(--slate-200)', paddingTop: '16px', marginTop: '8px' }}>
                <div style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--navy-900)', marginBottom: '10px' }}>
                  Take Administrative Redressal Action:
                </div>
                <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                  {selectedGrievance.status !== 'IN_REVIEW' && (
                    <button
                      type="button"
                      disabled={updatingStatusId === selectedGrievance.id}
                      onClick={() => handleUpdateStatus(selectedGrievance.id, 'IN_REVIEW')}
                      className="btn btn-outline"
                      style={{ flex: 1, borderColor: '#2563eb', color: '#1e40af' }}
                    >
                      <Clock size={15} />
                      Set to "In Review"
                    </button>
                  )}

                  {selectedGrievance.status !== 'RESOLVED' && (
                    <button
                      type="button"
                      disabled={updatingStatusId === selectedGrievance.id}
                      onClick={() => handleUpdateStatus(selectedGrievance.id, 'RESOLVED')}
                      className="btn btn-primary"
                      style={{ flex: 1, background: 'var(--emerald-600)', borderColor: 'var(--emerald-600)' }}
                    >
                      <CheckCircle size={15} />
                      Mark Resolved
                    </button>
                  )}

                  {selectedGrievance.status !== 'REJECTED' && (
                    <button
                      type="button"
                      disabled={updatingStatusId === selectedGrievance.id}
                      onClick={() => handleUpdateStatus(selectedGrievance.id, 'REJECTED')}
                      className="btn btn-secondary"
                      style={{ flex: 1, color: '#dc2626' }}
                    >
                      <XCircle size={15} />
                      Reject / Close
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
