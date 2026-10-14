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
  const { lang, t } = useLanguage();
  const navigate = useNavigate();
  const location = useLocation();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password) {
      error(lang === 'te' ? 'దయచేసి మీ ఈమెయిల్ మరియు పాస్‌వర్డ్‌ను నమోదు చేయండి.' : 'Please enter your email and password.');
      return;
    }

    setLoading(true);
    try {
      const res = await apiClient.post('/auth/patient/login', { email, password });
      login(res.data.user, res.data.token);
      success(lang === 'te' ? 'రోగిగా విజయవంతంగా లాగిన్ అయ్యారు.' : 'Logged in successfully as Patient.');

      const destination = (location.state as any)?.from?.pathname || '/patient/dashboard';
      navigate(destination, { replace: true });
    } catch (err: any) {
      error(err.response?.data?.error || (lang === 'te' ? 'చెల్లని ఇమెయిల్ లేదా పాస్‌వర్డ్.' : 'Invalid email or password.'));
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
            {t.patientLoginTitle}
          </h2>
          <p style={{ fontSize: '0.84rem', color: 'var(--slate-500)', marginTop: '4px' }}>
            {t.patientLoginSub}
          </p>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">{t.emailAddress}</label>
            <div style={{ position: 'relative' }}>
              <input
                type="email"
                className="form-input"
                required
                placeholder={lang === 'te' ? 'మీ.ఈమెయిల్@example.com' : 'your.email@example.com'}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">{t.passwordLabel}</label>
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
            {loading ? t.authenticating : t.signInAsPatient}
            <ArrowRight size={16} />
          </button>
        </form>

        <div style={{ borderTop: '1px solid var(--slate-200)', marginTop: '24px', paddingTop: '18px', textAlign: 'center', fontSize: '0.85rem' }}>
          <span style={{ color: 'var(--slate-500)' }}>{t.noAccountYet} </span>
          <Link to="/patient/register" style={{ fontWeight: 700, color: 'var(--blue-600)' }}>
            {t.registerHere}
          </Link>
        </div>

        <div style={{ marginTop: '16px', textAlign: 'center', fontSize: '0.78rem', color: 'var(--slate-400)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '5px' }}>
          <ShieldCheck size={14} color="var(--emerald-600)" />
          {t.apEncryptedNotice}
        </div>
      </div>
    </div>
  );
};
