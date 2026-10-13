import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiClient } from '../../api/client';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { ShieldCheck, Lock, Mail, ArrowRight, ShieldAlert } from 'lucide-react';

export const AdminLogin: React.FC = () => {
  const { login } = useAuth();
  const { success, error } = useToast();
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password) {
      error('Please enter administrator credentials.');
      return;
    }

    setLoading(true);
    try {
      const res = await apiClient.post('/auth/admin/login', { email, password });
      login(res.data.user, res.data.token);
      success('Chief Medical Administrator authenticated successfully.');
      navigate('/admin/dashboard', { replace: true });
    } catch (err: any) {
      error(err.response?.data?.error || 'Authentication denied. Access logged.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="main-content" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '75vh' }}>
      <div className="med-card" style={{ maxWidth: '440px', width: '100%', padding: '38px', border: '1px solid #1e293b' }}>
        <div style={{ textAlign: 'center', marginBottom: '24px' }}>
          <div style={{ width: '60px', height: '60px', borderRadius: '50%', background: '#0f172a', color: '#38bdf8', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 12px', boxShadow: '0 0 15px rgba(56, 189, 248, 0.2)' }}>
            <ShieldAlert size={30} />
          </div>
          <h2 style={{ fontSize: '1.45rem', fontWeight: 900, color: 'var(--navy-900)' }}>
            Control Center Gateway
          </h2>
          <p style={{ fontSize: '0.8rem', color: 'var(--slate-500)', marginTop: '4px' }}>
            Authorized Medical Officers & Hospital Administration Only
          </p>
        </div>

        <div style={{ background: '#f8fafc', padding: '10px 14px', borderRadius: '6px', fontSize: '0.75rem', color: 'var(--slate-500)', marginBottom: '18px', border: '1px solid var(--slate-200)', lineHeight: 1.4 }}>
          <strong>Notice:</strong> This hidden administrative route is restricted. All login attempts, source IP addresses, and actions are cryptographically recorded in the platform security audit trail.
        </div>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Administrator ID / Email</label>
            <input
              type="email"
              className="form-input"
              required
              placeholder="admin@medislot.gov.in"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Security Passphrase</label>
            <input
              type="password"
              className="form-input"
              required
              placeholder="••••••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          <button type="submit" className="btn btn-primary" disabled={loading} style={{ width: '100%', marginTop: '12px', background: 'linear-gradient(135deg, #0f172a 0%, #0369a1 100%)' }}>
            <Lock size={15} />
            {loading ? 'Authenticating...' : 'Authenticate Control Center'}
          </button>
        </form>
      </div>
    </div>
  );
};
