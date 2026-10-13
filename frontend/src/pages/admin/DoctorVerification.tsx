import React, { useState, useEffect } from 'react';
import { apiClient } from '../../api/client';
import { useToast } from '../../context/ToastContext';
import { DoctorProfile } from '../../types';
import { UserCheck, ShieldAlert, Check, X, Search, Filter, AlertTriangle } from 'lucide-react';

export const DoctorVerification: React.FC = () => {
  const { success, error } = useToast();
  const [doctors, setDoctors] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [searchTerm, setSearchTerm] = useState('');
  const [actionInProgress, setActionInProgress] = useState<string | null>(null);

  const fetchDoctors = async () => {
    setLoading(true);
    try {
      const params: Record<string, string> = {};
      if (statusFilter !== 'ALL') params.status = statusFilter;
      if (searchTerm.trim()) params.search = searchTerm.trim();

      const res = await apiClient.get('/admin/doctors', { params });
      setDoctors(res.data);
    } catch (err) {
      console.error('Failed to load doctors for verification:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDoctors();
  }, [statusFilter]);

  const handleUpdateStatus = async (userId: string, newStatus: 'VERIFIED' | 'REJECTED' | 'SUSPENDED') => {
    setActionInProgress(userId);
    try {
      await apiClient.patch(`/admin/doctors/${userId}/status`, { status: newStatus });
      success(`Doctor status updated to ${newStatus}. Public catalog synchronized.`);
      fetchDoctors();
    } catch (err: any) {
      error(err.response?.data?.error || 'Failed to update doctor verification status.');
    } finally {
      setActionInProgress(null);
    }
  };

  return (
    <div className="main-content">
      <div className="section-header">
        <h1 className="section-title">Doctor Verification & Clinical Approval Queue</h1>
        <p className="section-subtitle">
          Medical license oversight: Review doctor registrations, verify clinical credentials, and control booking catalog authorization.
        </p>
      </div>

      {/* Filter Bar */}
      <div className="med-card" style={{ marginBottom: '24px', padding: '18px' }}>
        <div style={{ display: 'flex', gap: '14px', flexWrap: 'wrap', alignItems: 'center' }}>
          <div style={{ flex: 1, minWidth: '240px' }}>
            <input
              type="text"
              className="form-input"
              placeholder="Search doctor by name, email, or specialty..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && fetchDoctors()}
            />
          </div>

          <div style={{ display: 'flex', gap: '8px' }}>
            {['ALL', 'PENDING', 'VERIFIED', 'SUSPENDED'].map((st) => (
              <button
                key={st}
                className={`btn btn-sm ${statusFilter === st ? 'btn-primary' : 'btn-secondary'}`}
                onClick={() => setStatusFilter(st)}
              >
                {st}
              </button>
            ))}
          </div>

          <button className="btn btn-secondary btn-sm" onClick={fetchDoctors}>
            <Search size={14} />
            Search
          </button>
        </div>
      </div>

      {/* Doctor Cards / Table */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '50px' }}>
          <div className="pulse-dot" style={{ margin: '0 auto 8px' }} />
          <p style={{ color: 'var(--slate-500)', fontSize: '0.85rem' }}>Loading doctor applications...</p>
        </div>
      ) : doctors.length === 0 ? (
        <div className="med-card" style={{ textAlign: 'center', padding: '40px' }}>
          <p style={{ color: 'var(--slate-600)', fontWeight: 600 }}>No doctor records found matching criteria.</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {doctors.map((doc) => (
            <div
              key={doc.userId}
              className="med-card"
              style={{
                display: 'grid',
                gridTemplateColumns: '1.2fr 1.2fr 1fr auto',
                gap: '16px',
                alignItems: 'center',
                borderLeft: doc.verificationStatus === 'PENDING'
                  ? '4px solid var(--amber-500)'
                  : doc.verificationStatus === 'VERIFIED'
                  ? '4px solid var(--emerald-500)'
                  : '4px solid var(--rose-500)'
              }}
            >
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 800, color: 'var(--navy-900)' }}>
                    {doc.fullName}
                  </h3>
                  <span className={`status-pill status-${doc.verificationStatus.toLowerCase()}`}>
                    {doc.verificationStatus}
                  </span>
                </div>
                <div style={{ fontSize: '0.8rem', color: 'var(--blue-600)', fontWeight: 600, marginTop: '2px' }}>
                  {doc.specialization} · {doc.qualifications}
                </div>
                <div style={{ fontSize: '0.78rem', color: 'var(--slate-500)', marginTop: '4px' }}>
                  Email: {doc.email} · Phone: +91 {doc.phone}
                </div>
              </div>

              <div>
                <div style={{ fontSize: '0.82rem', color: 'var(--slate-700)' }}>
                  <strong>Assigned Facility:</strong> {doc.hospitalName || doc.hospitalId}
                </div>
                <div style={{ fontSize: '0.82rem', color: 'var(--slate-700)', marginTop: '2px' }}>
                  <strong>Clinical Experience:</strong> {doc.experienceYears} Years
                </div>
                <div style={{ fontSize: '0.76rem', color: 'var(--slate-400)', marginTop: '4px' }}>
                  Applied: {doc.registeredAt ? new Date(doc.registeredAt).toLocaleDateString() : '-'}
                </div>
              </div>

              <div>
                {doc.verificationStatus === 'VERIFIED' && (
                  <div style={{ fontSize: '0.75rem', color: 'var(--emerald-700)', background: 'var(--emerald-50)', padding: '6px 10px', borderRadius: '6px' }}>
                    ✓ Active in public OPD booking catalog
                  </div>
                )}
                {doc.verificationStatus === 'PENDING' && (
                  <div style={{ fontSize: '0.75rem', color: '#b45309', background: '#fef3c7', padding: '6px 10px', borderRadius: '6px' }}>
                    ⏳ Awaiting DMHO license check
                  </div>
                )}
                {doc.verificationStatus === 'SUSPENDED' && (
                  <div style={{ fontSize: '0.75rem', color: 'var(--rose-700)', background: 'var(--rose-50)', padding: '6px 10px', borderRadius: '6px' }}>
                    ✕ Suspended / Inactive
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div style={{ display: 'flex', gap: '8px' }}>
                {doc.verificationStatus !== 'VERIFIED' && (
                  <button
                    className="btn btn-success btn-sm"
                    disabled={actionInProgress === doc.userId}
                    onClick={() => handleUpdateStatus(doc.userId, 'VERIFIED')}
                  >
                    <Check size={14} />
                    Approve Doctor
                  </button>
                )}

                {doc.verificationStatus === 'PENDING' && (
                  <button
                    className="btn btn-secondary btn-sm"
                    disabled={actionInProgress === doc.userId}
                    onClick={() => handleUpdateStatus(doc.userId, 'REJECTED')}
                    style={{ color: 'var(--rose-600)' }}
                  >
                    <X size={14} />
                    Reject
                  </button>
                )}

                {doc.verificationStatus === 'VERIFIED' && (
                  <button
                    className="btn btn-secondary btn-sm"
                    disabled={actionInProgress === doc.userId}
                    onClick={() => handleUpdateStatus(doc.userId, 'SUSPENDED')}
                    style={{ color: 'var(--rose-600)' }}
                  >
                    Suspend
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
