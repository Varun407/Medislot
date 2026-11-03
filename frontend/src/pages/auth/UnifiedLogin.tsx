import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { apiClient } from '../../api/client';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { useLanguage } from '../../context/LanguageContext';
import {
  LogIn,
  ArrowRight,
  ShieldCheck,
  Eye,
  EyeOff,
  User as UserIcon,
  Stethoscope,
  Globe,
  Sparkles,
  Phone,
  KeyRound,
  Lock
} from 'lucide-react';

export const UnifiedLogin: React.FC = () => {
  const { user, isAuthenticated, role, login } = useAuth();
  const { success, error } = useToast();
  const { lang, t, toggleLang } = useLanguage();
  const navigate = useNavigate();

  // Mode: 'PATIENT' | 'STAFF' (Doctor/Admin)
  const [activeTab, setActiveTab] = useState<'PATIENT' | 'STAFF'>('PATIENT');

  // Patient inputs
  const [patientPhone, setPatientPhone] = useState('');
  const [patientMpin, setPatientMpin] = useState('');
  const [showMpin, setShowMpin] = useState(false);

  // Staff (Doctor/Admin) inputs
  const [staffIdentifier, setStaffIdentifier] = useState('');
  const [staffPassword, setStaffPassword] = useState('');
  const [showStaffPassword, setShowStaffPassword] = useState(false);

  const [loading, setLoading] = useState(false);

  // Redirect if already authenticated
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

  // Demo autofill handlers
  const fillPatientDemo = () => {
    setActiveTab('PATIENT');
    setPatientPhone('9849012345');
    setPatientMpin('123456');
  };

  const fillDoctorDemo = () => {
    setActiveTab('STAFF');
    setStaffIdentifier('dr.ramesh@medislot.gov.in');
    setStaffPassword('DoctorPass@2026');
  };

  const fillAdminDemo = () => {
    setActiveTab('STAFF');
    setStaffIdentifier('admin@medislot.gov.in');
    setStaffPassword('AdminSecure@2026');
  };

  const handlePatientSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanPhone = patientPhone.replace(/\D/g, '').slice(-10);

    if (!cleanPhone || cleanPhone.length !== 10) {
      error(lang === 'te' ? 'దయచేసి 10 అంకెల మొబైల్ నంబర్ నమోదు చేయండి.' : 'Please enter a valid 10-digit mobile number.');
      return;
    }

    if (!patientMpin || patientMpin.length !== 6 || !/^\d{6}$/.test(patientMpin)) {
      error(lang === 'te' ? 'ఎంపిన్ ఖచ్చితంగా 6 అంకెలు ఉండాలి.' : 'Please enter your 6-digit MPIN.');
      return;
    }

    setLoading(true);
    try {
      const res = await apiClient.post('/auth/patient/login', {
        phone: cleanPhone,
        mpin: patientMpin
      });

      const authUser = res.data.user;
      login(authUser, res.data.token);
      success(lang === 'te' ? `స్వాగతం, ${authUser.fullName}!` : `Welcome back, ${authUser.fullName}!`);
      navigate('/patient/dashboard', { replace: true });
    } catch (err: any) {
      error(
        err.response?.data?.error ||
          (lang === 'te'
            ? 'సరైన మొబైల్ నంబర్ లేదా 6 అంకెల ఎంపిన్ కాదు.'
            : 'Invalid mobile number or 6-digit MPIN.')
      );
    } finally {
      setLoading(false);
    }
  };

  const handleStaffSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!staffIdentifier.trim() || !staffPassword) {
      error(lang === 'te' ? 'దయచేసి ఇమెయిల్ మరియు పాస్‌వర్డ్ నమోదు చేయండి.' : 'Please enter email/phone and password.');
      return;
    }

    setLoading(true);
    try {
      const res = await apiClient.post('/auth/login', {
        identifier: staffIdentifier.trim(),
        password: staffPassword
      });

      const authUser = res.data.user;
      login(authUser, res.data.token);

      if (authUser.role === 'DOCTOR') {
        if (authUser.verificationStatus === 'PENDING') {
          success(lang === 'te' ? `స్వాగతం డాక్టర్ ${authUser.fullName}! మీ ఖాతా పరిశీలనలో ఉంది.` : `Welcome Dr. ${authUser.fullName}! Application pending verification.`);
          navigate('/doctor/pending', { replace: true });
        } else {
          success(lang === 'te' ? `స్వాగతం డాక్టర్ ${authUser.fullName}!` : `Welcome Dr. ${authUser.fullName}!`);
          navigate('/doctor/dashboard', { replace: true });
        }
      } else if (authUser.role === 'ADMIN') {
        success(lang === 'te' ? 'చీఫ్ అడ్మినిస్ట్రేటర్ ప్రామాణీకరించబడ్డారు.' : 'Chief Administrator authenticated.');
        navigate('/admin/dashboard', { replace: true });
      } else {
        navigate('/patient/dashboard', { replace: true });
      }
    } catch (err: any) {
      error(
        err.response?.data?.error ||
          (lang === 'te' ? 'సరైన వివరాలు లేదా పాస్‌వర్డ్ కాదు.' : 'Invalid credentials.')
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="main-content"
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '85vh',
        padding: '24px 16px'
      }}
    >
      {/* Top minimal bar */}
      <div
        style={{
          maxWidth: '460px',
          width: '100%',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '14px'
        }}
      >
        <Link
          to="/"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            fontSize: '0.82rem',
            fontWeight: 700,
            color: 'var(--blue-600)',
            textDecoration: 'none'
          }}
        >
          ← {lang === 'te' ? 'హోమ్‌కు తిరిగి వెళ్ళండి' : 'Back to MediSlot Home'}
        </Link>
        <button
          type="button"
          onClick={toggleLang}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            fontSize: '0.78rem',
            fontWeight: 700,
            background: 'var(--slate-100)',
            border: '1px solid var(--slate-300)',
            padding: '4px 10px',
            borderRadius: '20px',
            cursor: 'pointer',
            color: 'var(--slate-700)'
          }}
        >
          <Globe size={13} />
          {lang === 'en' ? 'తెలుగు' : 'English'}
        </button>
      </div>

      {/* Main Card */}
      <div className="med-card" style={{ maxWidth: '460px', width: '100%', padding: '32px 28px' }}>
        {/* Brand Header */}
        <div style={{ textAlign: 'center', marginBottom: '20px' }}>
          <div
            style={{
              width: '52px',
              height: '52px',
              borderRadius: '16px',
              background: 'linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%)',
              color: 'var(--blue-600)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 12px',
              boxShadow: '0 4px 14px rgba(37, 99, 235, 0.12)'
            }}
          >
            <LogIn size={24} />
          </div>
          <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--navy-900)', margin: 0 }}>
            {lang === 'te' ? 'మెడిస్లాట్ పోర్టల్ లాగిన్' : 'MediSlot Portal Sign In'}
          </h2>
          <p style={{ fontSize: '0.82rem', color: 'var(--slate-500)', marginTop: '4px' }}>
            {lang === 'te'
              ? 'ఆంధ్రప్రదేశ్ ప్రజా ఆరోగ్య సేవలు & ఆసుపత్రి ఓపీడీ వ్యవస్థ'
              : 'Smart Healthcare Access & OPD Management Platform'}
          </p>
        </div>

        {/* Role Tabs */}
        <div
          style={{
            display: 'flex',
            background: 'var(--slate-100)',
            borderRadius: '10px',
            padding: '4px',
            marginBottom: '18px',
            border: '1px solid var(--slate-200)'
          }}
        >
          <button
            type="button"
            onClick={() => setActiveTab('PATIENT')}
            style={{
              flex: 1,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px',
              padding: '8px 12px',
              fontSize: '0.82rem',
              fontWeight: 700,
              borderRadius: '8px',
              border: 'none',
              cursor: 'pointer',
              background: activeTab === 'PATIENT' ? '#ffffff' : 'transparent',
              color: activeTab === 'PATIENT' ? 'var(--blue-700)' : 'var(--slate-600)',
              boxShadow: activeTab === 'PATIENT' ? '0 2px 6px rgba(0,0,0,0.06)' : 'none',
              transition: 'all 0.15s ease'
            }}
          >
            <UserIcon size={14} />
            {lang === 'te' ? 'రోగులు & పౌరులు' : 'Patient / Citizen'}
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('STAFF')}
            style={{
              flex: 1,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px',
              padding: '8px 12px',
              fontSize: '0.82rem',
              fontWeight: 700,
              borderRadius: '8px',
              border: 'none',
              cursor: 'pointer',
              background: activeTab === 'STAFF' ? '#ffffff' : 'transparent',
              color: activeTab === 'STAFF' ? 'var(--emerald-700)' : 'var(--slate-600)',
              boxShadow: activeTab === 'STAFF' ? '0 2px 6px rgba(0,0,0,0.06)' : 'none',
              transition: 'all 0.15s ease'
            }}
          >
            <Stethoscope size={14} />
            {lang === 'te' ? 'వైద్యులు / అడ్మిన్' : 'Doctor / Staff'}
          </button>
        </div>

        {/* Quick Test Demo Credentials */}
        <div
          style={{
            background: 'var(--slate-50)',
            border: '1px solid var(--slate-200)',
            borderRadius: '8px',
            padding: '10px 12px',
            marginBottom: '18px'
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              fontSize: '0.74rem',
              fontWeight: 700,
              color: 'var(--slate-600)',
              marginBottom: '6px'
            }}
          >
            <Sparkles size={12} color="var(--blue-600)" />
            <span>{lang === 'te' ? 'త్వరిత టెస్ట్ డెమో ఖాతాలు:' : 'Quick Test Demo Credentials:'}</span>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '6px' }}>
            <button
              type="button"
              onClick={fillPatientDemo}
              className="btn btn-outline btn-sm"
              style={{ fontSize: '0.72rem', padding: '5px 4px', justifyContent: 'center' }}
              title="Test Patient (9849012345 / MPIN: 123456)"
            >
              <UserIcon size={12} color="var(--blue-600)" />
              Patient
            </button>
            <button
              type="button"
              onClick={fillDoctorDemo}
              className="btn btn-outline btn-sm"
              style={{ fontSize: '0.72rem', padding: '5px 4px', justifyContent: 'center' }}
              title="Test Doctor (dr.ramesh@medislot.gov.in)"
            >
              <Stethoscope size={12} color="var(--emerald-600)" />
              Doctor
            </button>
            <button
              type="button"
              onClick={fillAdminDemo}
              className="btn btn-outline btn-sm"
              style={{ fontSize: '0.72rem', padding: '5px 4px', justifyContent: 'center' }}
              title="Test Administrator"
            >
              <ShieldCheck size={12} color="var(--indigo-600)" />
              Admin
            </button>
          </div>
        </div>

        {/* Patient Form (Mobile Number + 6-Digit MPIN) */}
        {activeTab === 'PATIENT' && (
          <form onSubmit={handlePatientSubmit} noValidate>
            <div className="form-group">
              <label className="form-label" style={{ fontWeight: 700 }}>
                {lang === 'te' ? 'మొబైల్ నంబర్ *' : 'Mobile Number *'}
              </label>
              <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                    background: 'var(--slate-100)',
                    border: '1px solid var(--slate-300)',
                    borderRadius: '8px',
                    padding: '9px 12px',
                    fontSize: '0.88rem',
                    fontWeight: 700,
                    color: 'var(--slate-700)',
                    userSelect: 'none'
                  }}
                >
                  <span>🇮🇳</span>
                  <span>+91</span>
                </div>
                <input
                  type="tel"
                  inputMode="numeric"
                  className="form-input"
                  required
                  maxLength={10}
                  placeholder="9848012345"
                  value={patientPhone}
                  onChange={(e) => setPatientPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
                  autoComplete="username"
                  style={{ flex: 1 }}
                />
              </div>
            </div>

            <div className="form-group">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                <label className="form-label" style={{ margin: 0, fontWeight: 700 }}>
                  {lang === 'te' ? '6 అంకెల ఎంపిన్ (MPIN) *' : '6-Digit MPIN *'}
                </label>
                <Link
                  to="/patient/login"
                  style={{ fontSize: '0.74rem', color: 'var(--blue-600)', textDecoration: 'none', fontWeight: 600 }}
                >
                  {lang === 'te' ? 'రీసెట్ చేయాలా?' : 'Forgot MPIN?'}
                </Link>
              </div>
              <div style={{ position: 'relative' }}>
                <input
                  type={showMpin ? 'text' : 'password'}
                  inputMode="numeric"
                  pattern="\d*"
                  maxLength={6}
                  className="form-input"
                  required
                  placeholder="••••••"
                  value={patientMpin}
                  onChange={(e) => setPatientMpin(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  autoComplete="current-password"
                  style={{
                    letterSpacing: patientMpin.length > 0 ? '6px' : 'normal',
                    fontWeight: 700,
                    paddingRight: '38px',
                    fontSize: '1.05rem'
                  }}
                />
                <button
                  type="button"
                  onClick={() => setShowMpin(!showMpin)}
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
                  title={showMpin ? 'Hide MPIN' : 'Show MPIN'}
                >
                  {showMpin ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              <div style={{ fontSize: '0.72rem', color: 'var(--slate-500)', marginTop: '4px' }}>
                {lang === 'te' ? '6 అంకెల వ్యక్తిగత భద్రతా కోడ్' : '6-digit numeric security code'}
              </div>
            </div>

            <button
              type="submit"
              className="btn btn-primary"
              disabled={loading || patientPhone.length !== 10 || patientMpin.length !== 6}
              style={{ width: '100%', height: '46px', marginTop: '10px', fontSize: '0.94rem', fontWeight: 700 }}
            >
              {loading ? (lang === 'te' ? 'సైన్ ఇన్ చేస్తోంది...' : 'Signing In...') : (lang === 'te' ? 'సైన్ ఇన్' : 'Sign In')}
              <ArrowRight size={16} />
            </button>

            <div style={{ borderTop: '1px solid var(--slate-200)', marginTop: '22px', paddingTop: '16px', textAlign: 'center', fontSize: '0.85rem' }}>
              <span style={{ color: 'var(--slate-500)' }}>
                {lang === 'te' ? 'మెడిస్లాట్‌కు కొత్తవారా? ' : 'New to MediSlot? '}
              </span>
              <Link to="/patient/register" style={{ fontWeight: 700, color: 'var(--blue-600)' }}>
                {lang === 'te' ? 'ఖాతాను సృష్టించండి' : 'Create an account'}
              </Link>
            </div>
          </form>
        )}

        {/* Staff Form (Doctor / Admin) */}
        {activeTab === 'STAFF' && (
          <form onSubmit={handleStaffSubmit} noValidate>
            <div className="form-group">
              <label className="form-label" style={{ fontWeight: 700 }}>
                {lang === 'te' ? 'అధికారిక ఇమెయిల్ లేదా ఫోన్ *' : 'Official Email or Phone *'}
              </label>
              <input
                type="text"
                className="form-input"
                required
                placeholder="dr.name@medislot.gov.in"
                value={staffIdentifier}
                onChange={(e) => setStaffIdentifier(e.target.value)}
                autoComplete="username"
              />
            </div>

            <div className="form-group">
              <label className="form-label" style={{ fontWeight: 700 }}>
                {lang === 'te' ? 'పాస్‌వర్డ్ *' : 'Password *'}
              </label>
              <div style={{ position: 'relative' }}>
                <input
                  type={showStaffPassword ? 'text' : 'password'}
                  className="form-input"
                  required
                  placeholder="••••••••••••"
                  value={staffPassword}
                  onChange={(e) => setStaffPassword(e.target.value)}
                  autoComplete="current-password"
                  style={{ paddingRight: '38px' }}
                />
                <button
                  type="button"
                  onClick={() => setShowStaffPassword(!showStaffPassword)}
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
                  {showStaffPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              className="btn btn-primary"
              disabled={loading || !staffIdentifier.trim() || !staffPassword}
              style={{ width: '100%', height: '46px', marginTop: '10px', fontSize: '0.94rem', fontWeight: 700, background: 'linear-gradient(135deg, #059669 0%, #047857 100%)' }}
            >
              {loading ? (lang === 'te' ? 'ధృవీకరిస్తోంది...' : 'Authenticating...') : (lang === 'te' ? 'స్టాఫ్ సైన్ ఇన్' : 'Staff Sign In')}
              <ArrowRight size={16} />
            </button>

            <div style={{ borderTop: '1px solid var(--slate-200)', marginTop: '22px', paddingTop: '16px', textAlign: 'center', fontSize: '0.85rem' }}>
              <span style={{ color: 'var(--slate-500)' }}>
                {lang === 'te' ? 'కొత్త డాక్టర్ / సిబ్బంది సభ్యులా? ' : 'New doctor/staff member? '}
              </span>
              <Link to="/doctor/register" style={{ fontWeight: 700, color: 'var(--emerald-600)' }}>
                {lang === 'te' ? 'డాక్టర్ / సిబ్బంది రిజిస్ట్రేషన్' : 'Doctor/Staff Registration'}
              </Link>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
export default UnifiedLogin;
