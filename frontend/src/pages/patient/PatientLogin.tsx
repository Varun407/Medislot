import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { apiClient } from '../../api/client';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { useLanguage } from '../../context/LanguageContext';
import { User, Lock, Mail, ArrowRight, ShieldCheck } from 'lucide-react';

export const PatientLogin: React.FC = () => {
  const { login } = useAuth();
  const { success, error } = useToast();
  const { lang } = useLanguage();
  const navigate = useNavigate();
  const location = useLocation();

  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!identifier.trim() || !password) {
      error(lang === 'te' ? 'దయచేసి మీ ఇమెయిల్, ఫోన్ లేదా ఆధార్ నంబర్ మరియు పాస్‌వర్డ్ నమోదు చేయండి.' : 'Please enter your email, phone, or Aadhaar number and password.');
      return;
    }

    setLoading(true);
    try {
      const res = await apiClient.post('/auth/patient/login', {
        identifier: identifier.trim(),
        email: identifier.trim(), // backward compat
        password
      });
      login(res.data.user, res.data.token);
      success(lang === 'te' ? 'రోగిగా విజయవంతంగా లాగిన్ అయ్యారు.' : 'Logged in successfully as Patient.');

      const destination = (location.state as any)?.from?.pathname || '/patient/dashboard';
      navigate(destination, { replace: true });
    } catch (err: any) {
      error(err.response?.data?.error || (lang === 'te' ? 'సరైన వివరాలు లేదా పాస్‌వర్డ్ కాదు.' : 'Invalid email, phone, Aadhaar, or password.'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="main-content" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '70vh' }}>
      <div className="med-card" style={{ maxWidth: '440px', width: '100%', padding: '36px' }}>
        <div style={{ textAlign: 'center', marginBottom: '24px' }}>
          <div style={{ width: '56px', height: '56px', borderRadius: '50%', background: 'var(--blue-50)', color: 'var(--blue-600)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 12px' }}>
            <User size={28} />
          </div>
          <h2 style={{ fontSize: '1.45rem', fontWeight: 800, color: 'var(--navy-900)' }}>
            {lang === 'te' ? 'రోగి పోర్టల్ లాగిన్' : 'Patient Portal Sign In'}
          </h2>
          <p style={{ fontSize: '0.84rem', color: 'var(--slate-500)', marginTop: '4px' }}>
            Access your OPD consultation slips & token records
          </p>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">
              {lang === 'te' ? 'ఇమెయిల్ / ఫోన్ / ఆధార్ నంబర్' : 'Email / Phone / Aadhaar Number'}
            </label>
            <div style={{ position: 'relative' }}>
              <input
                type="text"
                className="form-input"
                required
                placeholder={lang === 'te' ? 'ఇమెయిల్, 10 అంకెల మొబైల్ లేదా 12 అంకెల ఆధార్' : 'Email, 10-digit mobile, or 12-digit Aadhaar'}
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                autoComplete="username"
              />
            </div>
            <div style={{ display: 'flex', gap: '8px', fontSize: '0.72rem', color: 'var(--slate-500)', marginTop: '4px' }}>
              <span>📧 Email</span>
              <span>·</span>
              <span>📱 10-digit Mobile</span>
              <span>·</span>
              <span>🪪 12-digit Aadhaar</span>
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Password</label>
            <div style={{ position: 'relative' }}>
              <input
                type="password"
                className="form-input"
                required
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </div>

          <button type="submit" className="btn btn-primary" disabled={loading} style={{ width: '100%', marginTop: '10px' }}>
            {loading ? 'Authenticating...' : 'Sign In as Patient'}
            <ArrowRight size={16} />
          </button>
        </form>

        <div style={{ borderTop: '1px solid var(--slate-200)', marginTop: '24px', paddingTop: '18px', textAlign: 'center', fontSize: '0.85rem' }}>
          <span style={{ color: 'var(--slate-500)' }}>Don't have a patient account yet? </span>
          <Link to="/patient/register" style={{ fontWeight: 700, color: 'var(--blue-600)' }}>
            Register here
          </Link>
        </div>

        <div style={{ marginTop: '16px', textAlign: 'center', fontSize: '0.78rem', color: 'var(--slate-400)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '5px' }}>
          <ShieldCheck size={14} color="var(--emerald-600)" />
          Protected by AP Health encrypted authentication
        </div>
      </div>
    </div>
  );
};
