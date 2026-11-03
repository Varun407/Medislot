import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { apiClient } from '../../api/client';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { useLanguage } from '../../context/LanguageContext';
import {
  LogIn,
  ArrowRight,
  Eye,
  EyeOff,
  UserCheck,
  KeyRound,
  Sparkles
} from 'lucide-react';

export const PatientLogin: React.FC = () => {
  const { login } = useAuth();
  const { success, error } = useToast();
  const { lang, t } = useLanguage();
  const navigate = useNavigate();
  const location = useLocation();

  const [phone, setPhone] = useState('');
  const [mpin, setMpin] = useState('');
  const [showMpin, setShowMpin] = useState(false);
  const [loading, setLoading] = useState(false);

  // MPIN Reset / Setup State
  const [showResetModal, setShowResetModal] = useState(false);
  const [resetPhone, setResetPhone] = useState('');
  const [newMpin, setNewMpin] = useState('');
  const [confirmNewMpin, setConfirmNewMpin] = useState('');
  const [showNewMpin, setShowNewMpin] = useState(false);
  const [resetLoading, setResetLoading] = useState(false);

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value.replace(/\D/g, '');
    setPhone(raw.slice(0, 10));
  };

  const handleMpinChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value.replace(/\D/g, '');
    setMpin(raw.slice(0, 6));
  };

  const fillDemoPatient = () => {
    setPhone('9849012345');
    setMpin('123456');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const cleanPhone = phone.replace(/\D/g, '').slice(-10);
    if (!cleanPhone || cleanPhone.length !== 10) {
      error(
        lang === 'te'
          ? 'దయచేసి చెల్లుబాటు అయ్యే 10 అంకెల మొబైల్ నంబర్‌ను నమోదు చేయండి.'
          : 'Please enter a valid 10-digit mobile number.'
      );
      return;
    }

    if (!mpin || mpin.length !== 6 || !/^\d{6}$/.test(mpin)) {
      error(
        lang === 'te'
          ? 'ఎంపిన్ ఖచ్చితంగా 6 అంకెలు (0-9) ఉండాలి.'
          : 'Please enter your 6-digit numeric MPIN.'
      );
      return;
    }

    setLoading(true);
    try {
      const res = await apiClient.post('/auth/patient/login', {
        phone: cleanPhone,
        mpin
      });

      login(res.data.user, res.data.token);
      success(
        lang === 'te'
          ? 'రోగిగా విజయవంతంగా సైన్ ఇన్ అయ్యారు.'
          : 'Signed in successfully as Patient.'
      );

      const destination = (location.state as any)?.from?.pathname || '/patient/dashboard';
      navigate(destination, { replace: true });
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

  const handleResetMpin = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanPhone = resetPhone.replace(/\D/g, '').slice(-10);

    if (!cleanPhone || cleanPhone.length !== 10) {
      error(lang === 'te' ? 'దయచేసి 10 అంకెల మొబైల్ నంబర్ ఇవ్వండి.' : 'Please enter valid 10-digit phone number.');
      return;
    }
    if (!newMpin || !/^\d{6}$/.test(newMpin)) {
      error(lang === 'te' ? 'కొత్త ఎంపిన్ ఖచ్చితంగా 6 అంకెలు ఉండాలి.' : 'New MPIN must be exactly 6 numeric digits.');
      return;
    }
    if (newMpin !== confirmNewMpin) {
      error(lang === 'te' ? 'ఎంపిన్‌లు సరిపోలడం లేదు.' : 'MPINs do not match.');
      return;
    }

    setResetLoading(true);
    try {
      const res = await apiClient.post('/auth/patient/reset-mpin', {
        phone: cleanPhone,
        newMpin,
        confirmMpin: confirmNewMpin
      });
      success(res.data.message || (lang === 'te' ? 'ఎంపిన్ విజయవంతంగా నవీకరించబడింది.' : 'MPIN updated successfully.'));
      setPhone(cleanPhone);
      setMpin(newMpin);
      setShowResetModal(false);
    } catch (err: any) {
      error(err.response?.data?.error || (lang === 'te' ? 'ఎంపిన్ రీసెట్ విఫలమైంది.' : 'Failed to reset MPIN.'));
    } finally {
      setResetLoading(false);
    }
  };

  return (
    <div
      className="main-content"
      style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '80vh',
        padding: '32px 16px'
      }}
    >
      <div className="med-card" style={{ maxWidth: '460px', width: '100%', padding: '36px 32px' }}>
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '22px' }}>
          <div
            style={{
              width: '56px',
              height: '56px',
              borderRadius: '16px',
              background: 'linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%)',
              color: 'var(--blue-600)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 12px',
              boxShadow: '0 4px 12px rgba(37, 99, 235, 0.12)'
            }}
          >
            <UserCheck size={28} />
          </div>
          <h2 style={{ fontSize: '1.45rem', fontWeight: 800, color: 'var(--navy-900)', margin: 0 }}>
            {lang === 'te' ? 'రోగి పోర్టల్ లాగిన్' : 'Patient Sign In'}
          </h2>
          <p style={{ fontSize: '0.84rem', color: 'var(--slate-500)', marginTop: '6px' }}>
            {lang === 'te'
              ? 'మీ నమోదిత మొబైల్ నంబర్ మరియు 6 అంకెల ఎంపిన్‌తో ప్రవేశించండి'
              : 'Enter your 10-digit mobile number and 6-digit MPIN'}
          </p>
        </div>

        {/* Quick Demo Autofill */}
        <div
          style={{
            background: 'var(--slate-50)',
            border: '1px solid var(--slate-200)',
            borderRadius: '10px',
            padding: '10px 14px',
            marginBottom: '20px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.76rem', color: 'var(--slate-600)' }}>
            <Sparkles size={13} color="var(--blue-600)" />
            <span>{lang === 'te' ? 'డెమో ఖాతా (టెస్ట్):' : 'Demo Test Account:'}</span>
          </div>
          <button
            type="button"
            onClick={fillDemoPatient}
            className="btn btn-outline btn-sm"
            style={{ fontSize: '0.74rem', padding: '4px 10px', fontWeight: 600 }}
          >
            9849012345 · MPIN: 123456
          </button>
        </div>

        {/* Patient Login Form */}
        <form onSubmit={handleSubmit} noValidate>
          {/* Mobile Number */}
          <div className="form-group">
            <label className="form-label" style={{ fontWeight: 700 }}>
              {lang === 'te' ? 'మొబైల్ సంఖ్య (10 అంకెలు) *' : 'Mobile Number (10 digits) *'}
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
                value={phone}
                onChange={handlePhoneChange}
                autoComplete="username"
                style={{ flex: 1 }}
              />
            </div>
            <div style={{ fontSize: '0.72rem', color: 'var(--slate-500)', marginTop: '4px' }}>
              {lang === 'te' ? '10 అంకెల నమోదిత మొబైల్ సంఖ్య' : '10-digit registered Indian mobile number'}
            </div>
          </div>

          {/* 6-Digit MPIN */}
          <div className="form-group">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
              <label className="form-label" style={{ margin: 0, fontWeight: 700 }}>
                {lang === 'te' ? '6 అంకెల ఎంపిన్ (MPIN) *' : '6-Digit MPIN *'}
              </label>
              <button
                type="button"
                onClick={() => {
                  setResetPhone(phone);
                  setShowResetModal(true);
                }}
                style={{
                  background: 'none',
                  border: 'none',
                  padding: 0,
                  fontSize: '0.74rem',
                  fontWeight: 600,
                  color: 'var(--blue-600)',
                  cursor: 'pointer'
                }}
              >
                {lang === 'te' ? 'ఎంపిన్ రీసెట్ చేయాలా?' : 'Forgot MPIN?'}
              </button>
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
                value={mpin}
                onChange={handleMpinChange}
                autoComplete="current-password"
                style={{
                  letterSpacing: mpin.length > 0 ? '6px' : 'normal',
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
              {lang === 'te' ? 'మీ వ్యక్తిగత 6 అంకెల భద్రతా పిన్' : 'Your secret 6-digit numeric security PIN'}
            </div>
          </div>

          {/* Sign In Button */}
          <button
            type="submit"
            className="btn btn-primary"
            disabled={loading || phone.length !== 10 || mpin.length !== 6}
            style={{ width: '100%', height: '46px', marginTop: '12px', fontSize: '0.94rem', fontWeight: 700 }}
          >
            {loading ? (lang === 'te' ? 'ధృవీకరిస్తోంది...' : 'Signing In...') : (lang === 'te' ? 'సైన్ ఇన్' : 'Sign In')}
            <ArrowRight size={16} />
          </button>
        </form>

        {/* Registration Link */}
        <div style={{ borderTop: '1px solid var(--slate-200)', marginTop: '24px', paddingTop: '18px', textAlign: 'center', fontSize: '0.85rem' }}>
          <span style={{ color: 'var(--slate-500)' }}>
            {lang === 'te' ? 'మెడిస్లాట్‌కు కొత్తవారా? ' : 'New to MediSlot? '}
          </span>
          <Link to="/patient/register" style={{ fontWeight: 700, color: 'var(--blue-600)' }}>
            {lang === 'te' ? 'ఖాతాను సృష్టించండి' : 'Create an account'}
          </Link>
        </div>
      </div>

      {/* MPIN Recovery & Setup Modal */}
      {showResetModal && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(15, 23, 42, 0.6)',
            backdropFilter: 'blur(3px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 9999,
            padding: '16px'
          }}
        >
          <div className="med-card" style={{ maxWidth: '420px', width: '100%', padding: '28px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '14px' }}>
              <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: '#eff6ff', color: 'var(--blue-600)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <KeyRound size={20} />
              </div>
              <div>
                <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 800 }}>
                  {lang === 'te' ? '6 అంకెల ఎంపిన్ సెట్ / రీసెట్ చేయండి' : 'Set / Reset 6-Digit MPIN'}
                </h3>
                <p style={{ margin: 0, fontSize: '0.75rem', color: 'var(--slate-500)' }}>
                  {lang === 'te' ? 'మీ నమోదిత మొబైల్ నంబర్‌తో కొత్త ఎంపిన్ సృష్టించండి' : 'Update your MPIN using registered phone number'}
                </p>
              </div>
            </div>

            <form onSubmit={handleResetMpin} noValidate>
              <div className="form-group">
                <label className="form-label" style={{ fontWeight: 600 }}>
                  {lang === 'te' ? 'నమోదిత మొబైల్ సంఖ్య *' : 'Registered Mobile Number *'}
                </label>
                <input
                  type="tel"
                  maxLength={10}
                  className="form-input"
                  required
                  placeholder="9848012345"
                  value={resetPhone}
                  onChange={(e) => setResetPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
                />
              </div>

              <div className="form-group">
                <label className="form-label" style={{ fontWeight: 600 }}>
                  {lang === 'te' ? 'కొత్త 6 అంకెల ఎంపిన్ *' : 'New 6-Digit MPIN *'}
                </label>
                <div style={{ position: 'relative' }}>
                  <input
                    type={showNewMpin ? 'text' : 'password'}
                    inputMode="numeric"
                    maxLength={6}
                    className="form-input"
                    required
                    placeholder="••••••"
                    value={newMpin}
                    onChange={(e) => setNewMpin(e.target.value.replace(/\D/g, '').slice(0, 6))}
                    style={{ letterSpacing: '4px', fontWeight: 700 }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewMpin(!showNewMpin)}
                    style={{
                      position: 'absolute',
                      right: '10px',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      background: 'none',
                      border: 'none',
                      color: 'var(--slate-400)',
                      cursor: 'pointer'
                    }}
                  >
                    {showNewMpin ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>
                </div>
              </div>

              <div className="form-group">
                <label className="form-label" style={{ fontWeight: 600 }}>
                  {lang === 'te' ? 'కొత్త ఎంపిన్‌ను నిర్ధారించండి *' : 'Confirm New MPIN *'}
                </label>
                <input
                  type="password"
                  inputMode="numeric"
                  maxLength={6}
                  className="form-input"
                  required
                  placeholder="••••••"
                  value={confirmNewMpin}
                  onChange={(e) => setConfirmNewMpin(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  style={{ letterSpacing: '4px', fontWeight: 700 }}
                />
              </div>

              <div style={{ display: 'flex', gap: '8px', marginTop: '16px' }}>
                <button
                  type="button"
                  onClick={() => setShowResetModal(false)}
                  className="btn btn-outline"
                  style={{ flex: 1 }}
                >
                  {lang === 'te' ? 'రద్దు చేయండి' : 'Cancel'}
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={resetLoading || resetPhone.length !== 10 || newMpin.length !== 6 || newMpin !== confirmNewMpin}
                  style={{ flex: 1 }}
                >
                  {resetLoading ? (lang === 'te' ? 'నవీకరిస్తోంది...' : 'Saving...') : (lang === 'te' ? 'ఎంపిన్ సేవ్ చేయండి' : 'Save MPIN')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
export default PatientLogin;
