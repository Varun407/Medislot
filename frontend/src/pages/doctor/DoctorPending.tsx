import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { Clock, ShieldCheck, LogOut, RefreshCw } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const DoctorPending: React.FC = () => {
  const { user, refreshUser, logout } = useAuth();
  const navigate = useNavigate();

  const handleRefresh = async () => {
    await refreshUser();
    if (user?.verificationStatus === 'VERIFIED') {
      navigate('/doctor/dashboard');
    }
  };

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  return (
    <div className="main-content" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '70vh' }}>
      <div className="med-card" style={{ maxWidth: '580px', width: '100%', padding: '40px', textAlign: 'center' }}>
        <div style={{ width: '68px', height: '68px', borderRadius: '50%', background: '#fef3c7', color: '#d97706', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
          <Clock size={36} />
        </div>

        <span className="status-pill status-pending" style={{ fontSize: '0.8rem', padding: '4px 12px', marginBottom: '14px' }}>
          Application Status: PENDING VERIFICATION
        </span>

        <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--navy-900)', marginTop: '8px' }}>
          Doctor Credentials Under Review
        </h2>

        <p style={{ color: 'var(--slate-600)', fontSize: '0.92rem', lineHeight: 1.6, margin: '14px 0 24px' }}>
          Thank you, <strong>{user?.fullName}</strong>. Your clinical profile and medical credentials have been securely received. To maintain patient safety and medical governance across Andhra Pradesh Government health facilities, a system administrator must verify your license before your OPD queue is activated.
        </p>

        <div style={{ background: 'var(--slate-50)', padding: '16px', borderRadius: '10px', textAlign: 'left', fontSize: '0.82rem', color: 'var(--slate-700)', marginBottom: '24px', border: '1px solid var(--slate-200)' }}>
          <div style={{ marginBottom: '6px' }}><strong>Registered Doctor:</strong> {user?.fullName}</div>
          <div style={{ marginBottom: '6px' }}><strong>Official Email:</strong> {user?.email}</div>
          <div style={{ marginBottom: '6px' }}><strong>Mobile:</strong> +91 {user?.phone}</div>
          <div><strong>Verification Office:</strong> DMHO / Hospital Administration</div>
        </div>

        <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
          <button className="btn btn-primary btn-sm" onClick={handleRefresh}>
            <RefreshCw size={14} />
            Check Verification Status
          </button>
          <button className="btn btn-secondary btn-sm" onClick={handleLogout}>
            <LogOut size={14} />
            Sign Out
          </button>
        </div>
      </div>
    </div>
  );
};
