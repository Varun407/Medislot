import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { apiClient } from '../../api/client';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { useLanguage } from '../../context/LanguageContext';
import {
  Lock,
  Mail,
  ArrowRight,
  ShieldCheck,
  Building2,
  Stethoscope,
  User as UserIcon,
  Eye,
  EyeOff,
  Sparkles,
  Globe
} from 'lucide-react';

export const UnifiedLogin: React.FC = () => {
  const { user, isAuthenticated, role, login } = useAuth();
  const { success, error } = useToast();
  const { lang, t, toggleLang } = useLanguage();
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  // If already authenticated, redirect directly to role dashboard
  useEffect(() => {
    if (isAuthenticated && user && role) {
      if (role === 'DOCTOR') {
        if (user.verificationStatus === 'PENDING') {
          navigate('/doctor/pending', { replace: true });
        } else {
          navigate('/doctor/dashboard', { replace: true });
        }
      } else if (role === 'ADMIN') {
        navigate('/admin/dashboard', { replace: true });
      } else {
        navigate('/patient/dashboard', { replace: true });
      }
    }
  }, [isAuthenticated, user, role, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password) {
      error(lang === 'te' ? 'దయచేసి మీ ఇమెయిల్ మరియు పాస్‌వర్డ్ నమోదు చేయండి.' : 'Please enter your email and password.');
      return;
    }

    setLoading(true);
    try {
      // Calls unified login endpoint that identifies DOCTOR, PATIENT, or ADMIN
      const res = await apiClient.post('/auth/login', { email: email.trim().toLowerCase(), password });
      const authUser = res.data.user;
      login(authUser, res.data.token);

      if (authUser.role === 'DOCTOR') {
        if (authUser.verificationStatus === 'PENDING') {
          success(lang === 'te' ? `స్వాగతం డాక్టర్ ${authUser.fullName}! మీ ధృవీకరణ పెండింగ్‌లో ఉంది.` : `Welcome Dr. ${authUser.fullName}! Your verification is pending.`);
          navigate('/doctor/pending', { replace: true });
        } else {
          success(lang === 'te' ? `స్వాగతం డాక్టర్ ${authUser.fullName}! ఓపీడీ క్యూ తెరవబడుతోంది.` : `Welcome Dr. ${authUser.fullName}! Opening Doctor OPD Queue.`);
          navigate('/doctor/dashboard', { replace: true });
        }
      } else if (authUser.role === 'PATIENT') {
        success(lang === 'te' ? `స్వాగతం, ${authUser.fullName}! రోగి పోర్టల్ తెరవబడుతోంది.` : `Welcome back, ${authUser.fullName}! Opening Patient Portal.`);
        navigate('/patient/dashboard', { replace: true });
      } else if (authUser.role === 'ADMIN') {
        success(lang === 'te' ? 'చీఫ్ మెడికల్ అడ్మినిస్ట్రేటర్ ప్రామాణీకరించబడ్డారు.' : `Chief Medical Administrator authenticated.`);
        navigate('/admin/dashboard', { replace: true });
      } else {
        navigate('/patient/dashboard', { replace: true });
      }
    } catch (err: any) {
      error(err.response?.data?.error || (lang === 'te' ? 'సరైన ఇమెయిల్ లేదా పాస్‌వర్డ్ కాదు.' : 'Invalid email or password.'));
    } finally {
      setLoading(false);
    }
  };

  const fillDoctorDemo = () => {
    setEmail('dr.ramesh@medislot.gov.in');
    setPassword('DoctorPass@2026');
  };

  const fillPatientDemo = () => {
    setEmail('patient@medislot.gov.in');
    setPassword('PatientPass@2026');
  };

  const fillAdminDemo = () => {
    setEmail('admin@medislot.gov.in');
    setPassword('AdminSecure@2026');
  };

  return (
    <div className="main-content" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '80vh', padding: '24px 16px' }}>
      {/* Top minimal bar with Language Toggle only */}
      <div style={{ maxWidth: '480px', width: '100%', display: 'flex', justifyContent: 'flex-end', alignItems: 'center', marginBottom: '14px' }}>
        <button
          type="button"
          onClick={toggleLang}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            background: 'var(--slate-100)',
            border: '1px solid var(--slate-300)',
            borderRadius: '20px',
            padding: '5px 12px',
            fontSize: '0.78rem',
            fontWeight: 700,
            color: 'var(--navy-900)',
            cursor: 'pointer'
          }}
          title="Toggle Language"
        >
          <Globe size={13} color="var(--blue-600)" />
          {lang === 'en' ? 'తెలుగు' : 'English'}
        </button>
      </div>

      <div className="med-card" style={{ maxWidth: '480px', width: '100%', padding: '38px 32px', boxShadow: 'var(--shadow-xl)', border: '1px solid var(--slate-200)' }}>
        {/* Emblem & Branding Header */}
        <div style={{ textAlign: 'center', marginBottom: '26px' }}>
          <div style={{ fontSize: '3rem', lineHeight: 1, marginBottom: '8px' }}>
            🏥
          </div>
          <h2 style={{ fontSize: '1.6rem', fontWeight: 900, color: 'var(--navy-900)', letterSpacing: '-0.3px', margin: 0 }}>
            {t.portalLoginTitle}
          </h2>
          <p style={{ fontSize: '0.82rem', color: 'var(--slate-500)', marginTop: '5px' }}>
            {t.portalLoginSub}
          </p>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: 'var(--blue-50)', color: 'var(--blue-600)', padding: '4px 12px', borderRadius: '12px', fontSize: '0.74rem', fontWeight: 700, marginTop: '10px' }}>
            <span className="pulse-dot" style={{ width: '6px', height: '6px' }} />
            {t.singleGateway}
          </div>
        </div>

        {/* Quick Demo Credentials Autofill */}
        <div style={{ background: 'var(--slate-50)', border: '1px solid var(--slate-200)', borderRadius: '8px', padding: '10px 14px', marginBottom: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.74rem', fontWeight: 700, color: 'var(--slate-600)', marginBottom: '8px' }}>
            <Sparkles size={13} color="var(--blue-600)" />
            <span>{t.quickTestCredentials}</span>
          </div>
          <div style={{ display: 'flex', gap: '6px' }}>
            <button
              type="button"
              onClick={fillDoctorDemo}
              className="btn btn-outline btn-sm"
              style={{ flex: 1, fontSize: '0.74rem', padding: '6px 4px', justifyContent: 'center' }}
            >
              <Stethoscope size={12} color="var(--emerald-600)" />
              {t.doctorRole}
            </button>
            <button
              type="button"
              onClick={fillPatientDemo}
              className="btn btn-outline btn-sm"
              style={{ flex: 1, fontSize: '0.74rem', padding: '6px 4px', justifyContent: 'center' }}
            >
              <UserIcon size={12} color="var(--blue-600)" />
              {t.patientRole}
            </button>
            <button
              type="button"
              onClick={fillAdminDemo}
              className="btn btn-outline btn-sm"
              style={{ flex: 1, fontSize: '0.74rem', padding: '6px 4px', justifyContent: 'center' }}
            >
              <ShieldCheck size={12} color="var(--navy-700)" />
              {t.adminRole}
            </button>
          </div>
        </div>

        {/* Unified Login Form */}
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">{t.emailAddress}</label>
            <div style={{ position: 'relative' }}>
              <input
                type="email"
                className="form-input"
                required
                placeholder="your.email@medislot.gov.in"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="email"
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">{t.passwordLabel}</label>
            <div style={{ position: 'relative' }}>
              <input
                type={showPassword ? 'text' : 'password'}
                className="form-input"
                required
                placeholder="••••••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="current-password"
                style={{ paddingRight: '40px' }}
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
                title={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            className="btn btn-primary"
            disabled={loading}
            style={{ width: '100%', marginTop: '12px', padding: '12px', fontSize: '0.98rem' }}
          >
            {loading ? t.authenticating : t.signInBtn}
            <ArrowRight size={17} />
          </button>
        </form>

        {/* Role Helper Info */}
        <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: '8px', padding: '10px 14px', marginTop: '20px', fontSize: '0.78rem', color: '#166534', lineHeight: 1.45 }}>
          {t.autoRedirectNotice}
        </div>

        {/* Registration Options */}
        <div style={{ borderTop: '1px solid var(--slate-200)', marginTop: '22px', paddingTop: '18px', display: 'flex', flexDirection: 'column', gap: '8px', textAlign: 'center', fontSize: '0.84rem' }}>
          <div>
            <span style={{ color: 'var(--slate-500)' }}>{t.newPatientQuestion} </span>
            <Link to="/patient/register" style={{ fontWeight: 700, color: 'var(--blue-600)' }}>
              {t.registerAsPatient}
            </Link>
          </div>
          <div>
            <span style={{ color: 'var(--slate-500)' }}>{t.doctorJoiningQuestion} </span>
            <Link to="/doctor/register" style={{ fontWeight: 700, color: 'var(--emerald-600)' }}>
              {t.registerAsDoctor}
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

