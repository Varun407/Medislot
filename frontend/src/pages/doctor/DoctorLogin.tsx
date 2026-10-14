import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { apiClient } from '../../api/client';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { useLanguage } from '../../context/LanguageContext';
import { Stethoscope, ArrowRight, ShieldAlert } from 'lucide-react';

export const DoctorLogin: React.FC = () => {
  const { login } = useAuth();
  const { success, error } = useToast();
  const { lang } = useLanguage();
  const navigate = useNavigate();
  const location = useLocation();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password) {
      error('Please enter your medical email and password.');
      return;
    }

    setLoading(true);
    try {
      const res = await apiClient.post('/auth/doctor/login', { email, password });
      login(res.data.user, res.data.token);

      if (res.data.user.verificationStatus === 'PENDING') {
        success('Logged in. Note: Your doctor account is currently pending administrator verification.');
        navigate('/doctor/pending', { replace: true });
      } else {
        success(`Welcome, ${res.data.user.fullName}! Doctor OPD Queue active.`);
        const destination = (location.state as any)?.from?.pathname || '/doctor/dashboard';
        navigate(destination, { replace: true });
      }
    } catch (err: any) {
      error(err.response?.data?.error || 'Invalid doctor credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="main-content" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '70vh' }}>
      <div className="med-card" style={{ maxWidth: '440px', width: '100%', padding: '36px' }}>
        <div style={{ textAlign: 'center', marginBottom: '24px' }}>
          <div style={{ width: '56px', height: '56px', borderRadius: '50%', background: 'var(--emerald-50)', color: 'var(--emerald-600)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 12px' }}>
            <Stethoscope size={28} />
          </div>
          <h2 style={{ fontSize: '1.45rem', fontWeight: 800, color: 'var(--navy-900)' }}>
            {lang === 'te' ? 'వైద్యుల పోర్టల్ లాగిన్' : 'Doctor OPD Portal Sign In'}
          </h2>
          <p style={{ fontSize: '0.84rem', color: 'var(--slate-500)', marginTop: '4px' }}>
            Manage daily OPD queues, patient consultations, and roster schedules
          </p>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Doctor Email (Official / Registered)</label>
            <input
              type="email"
              className="form-input"
              required
              placeholder="dr.name@medislot.gov.in"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Password</label>
            <input
              type="password"
              className="form-input"
              required
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          <button type="submit" className="btn btn-primary" disabled={loading} style={{ width: '100%', marginTop: '10px' }}>
            {loading ? 'Authenticating Doctor...' : 'Sign In as Doctor'}
            <ArrowRight size={16} />
          </button>
        </form>

        <div style={{ borderTop: '1px solid var(--slate-200)', marginTop: '24px', paddingTop: '18px', textAlign: 'center', fontSize: '0.85rem' }}>
          <span style={{ color: 'var(--slate-500)' }}>New physician joining the platform? </span>
          <Link to="/doctor/register" style={{ fontWeight: 700, color: 'var(--emerald-600)' }}>
            Apply / Register here
          </Link>
        </div>
      </div>
    </div>
  );
};
