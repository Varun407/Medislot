import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { apiClient } from '../../api/client';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { useLanguage } from '../../context/LanguageContext';
import { Stethoscope, ArrowRight, Eye, EyeOff } from 'lucide-react';

export const DoctorLogin: React.FC = () => {
  const { login } = useAuth();
  const { success, error } = useToast();
  const { lang, t } = useLanguage();
  const navigate = useNavigate();
  const location = useLocation();

  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!identifier.trim() || !password) {
      error(
        lang === 'te'
          ? 'దయచేసి మీ ఇమెయిల్, ఫోన్ లేదా ఆధార్ నంబర్ మరియు పాస్‌వర్డ్ నమోదు చేయండి.'
          : 'Please enter your medical email, phone, or Aadhaar and password.'
      );
      return;
    }

    setLoading(true);
    try {
      const res = await apiClient.post('/auth/doctor/login', {
        identifier: identifier.trim(),
        email: identifier.trim(), // backward compat
        password
      });
      login(res.data.user, res.data.token);

      if (res.data.user.verificationStatus === 'PENDING') {
        success(
          lang === 'te'
            ? 'లాగిన్ విజయవంతమైంది. గమనిక: మీ ఖాతా ప్రస్తుతం అడ్మినిస్ట్రేటర్ పరిశీలనలో ఉంది.'
            : 'Logged in. Note: Your doctor account is currently pending administrator verification.'
        );
        navigate('/doctor/pending', { replace: true });
      } else {
        success(
          lang === 'te'
            ? `స్వాగతం, ${res.data.user.fullName}! ఓపీడీ క్యూ యాక్టివ్‌గా ఉంది.`
            : `Welcome, ${res.data.user.fullName}! Doctor OPD Queue active.`
        );
        const destination = (location.state as any)?.from?.pathname || '/doctor/dashboard';
        navigate(destination, { replace: true });
      }
    } catch (err: any) {
      error(
        err.response?.data?.error ||
          (lang === 'te' ? 'సరైన డాక్టర్ / సిబ్బంది ఆధారాలు కావు.' : 'Invalid doctor or staff credentials.')
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="main-content" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '70vh', padding: '24px 16px' }}>
      <div className="med-card" style={{ maxWidth: '440px', width: '100%', padding: '36px' }}>
        <div style={{ textAlign: 'center', marginBottom: '24px' }}>
          <div style={{ width: '56px', height: '56px', borderRadius: '50%', background: 'var(--emerald-50)', color: 'var(--emerald-600)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 12px', boxShadow: '0 4px 12px rgba(5, 150, 105, 0.12)' }}>
            <Stethoscope size={28} />
          </div>
          <h2 style={{ fontSize: '1.45rem', fontWeight: 800, color: 'var(--navy-900)', margin: 0 }}>
            {lang === 'te' ? 'డాక్టర్ / సిబ్బంది పోర్టల్ లాగిన్' : 'Doctor & Staff Sign In'}
          </h2>
          <p style={{ fontSize: '0.84rem', color: 'var(--slate-500)', marginTop: '6px' }}>
            {lang === 'te'
              ? 'రోజువారీ ఓపీడీ క్యూలు, రోగి సంప్రదింపులు మరియు డ్యూటీ రోస్టర్‌ను నిర్వహించండి'
              : 'Manage daily OPD queues, patient consultations, and roster schedules'}
          </p>
        </div>

        <form onSubmit={handleSubmit} noValidate>
          <div className="form-group">
            <label className="form-label" style={{ fontWeight: 700 }}>
              {lang === 'te' ? 'అధికారిక ఇమెయిల్ / ఫోన్ / ఆధార్ *' : 'Official Email / Phone / Aadhaar *'}
            </label>
            <input
              type="text"
              className="form-input"
              required
              placeholder={lang === 'te' ? 'dr.name@medislot.gov.in, ఫోన్ లేదా ఆధార్' : 'dr.name@medislot.gov.in, phone, or Aadhaar'}
              value={identifier}
              onChange={(e) => setIdentifier(e.target.value)}
              autoComplete="username"
            />
            <div style={{ display: 'flex', gap: '8px', fontSize: '0.72rem', color: 'var(--slate-500)', marginTop: '4px' }}>
              <span>📧 {lang === 'te' ? 'అధికారిక ఇమెయిల్' : 'Official Email'}</span>
              <span>·</span>
              <span>📱 {lang === 'te' ? 'నమోదిత ఫోన్' : 'Registered Phone'}</span>
              <span>·</span>
              <span>🪪 {lang === 'te' ? 'ఆధార్' : 'Aadhaar'}</span>
            </div>
          </div>

          <div className="form-group">
            <label className="form-label" style={{ fontWeight: 700 }}>
              {lang === 'te' ? 'పాస్‌వర్డ్ *' : 'Password *'}
            </label>
            <div style={{ position: 'relative' }}>
              <input
                type={showPassword ? 'text' : 'password'}
                className="form-input"
                required
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="current-password"
                style={{ paddingRight: '38px' }}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                style={{
                  position: 'absolute',
                  right: '12px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'none',
                  border: 'none',
                  color: 'var(--slate-400)',
                  cursor: 'pointer',
                  padding: 0
                }}
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            className="btn btn-primary"
            disabled={loading}
            style={{ width: '100%', height: '46px', marginTop: '12px', fontSize: '0.94rem', fontWeight: 700, background: 'linear-gradient(135deg, #059669 0%, #047857 100%)' }}
          >
            {loading
              ? (lang === 'te' ? 'ధృవీకరిస్తోంది...' : 'Authenticating Doctor...')
              : (lang === 'te' ? 'డాక్టర్ / సిబ్బందిగా సైన్ ఇన్' : 'Sign In as Doctor / Staff')}
            <ArrowRight size={16} />
          </button>
        </form>

        <div style={{ borderTop: '1px solid var(--slate-200)', marginTop: '24px', paddingTop: '18px', textAlign: 'center', fontSize: '0.85rem' }}>
          <span style={{ color: 'var(--slate-500)' }}>
            {lang === 'te' ? 'కొత్త డాక్టర్ / సిబ్బంది సభ్యులా? ' : 'New doctor/staff member? '}
          </span>
          <Link to="/doctor/register" style={{ fontWeight: 700, color: 'var(--emerald-600)' }}>
            {lang === 'te' ? 'డాక్టర్ / సిబ్బంది రిజిస్ట్రేషన్' : 'Doctor/Staff Registration'}
          </Link>
        </div>
      </div>
    </div>
  );
};
export default DoctorLogin;
