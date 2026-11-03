import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { apiClient } from '../../api/client';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { useLanguage } from '../../context/LanguageContext';
import {
  UserPlus,
  ArrowRight,
  Check,
  Eye,
  EyeOff,
  Sparkles
} from 'lucide-react';

export const PatientRegister: React.FC = () => {
  const { login } = useAuth();
  const { success, error } = useToast();
  const { lang, t, localizeName } = useLanguage();
  const navigate = useNavigate();

  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [mpin, setMpin] = useState('');
  const [confirmMpin, setConfirmMpin] = useState('');
  const [showMpin, setShowMpin] = useState(false);
  const [showConfirmMpin, setShowConfirmMpin] = useState(false);
  const [aadhar, setAadhar] = useState('');
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [loading, setLoading] = useState(false);

  // Clean and constrain phone input to 10 digits
  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value.replace(/\D/g, '');
    setPhone(raw.slice(0, 10));
  };

  // Clean and constrain MPIN to 6 numeric digits
  const handleMpinChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value.replace(/\D/g, '');
    setMpin(raw.slice(0, 6));
  };

  const handleConfirmMpinChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value.replace(/\D/g, '');
    setConfirmMpin(raw.slice(0, 6));
  };

  const handleAadharChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value.replace(/\D/g, '');
    setAadhar(raw.slice(0, 12));
  };

  const isPhoneValid = phone.length === 10 && /^[6-9]\d{9}$/.test(phone);
  const isMpinValid = mpin.length === 6 && /^\d{6}$/.test(mpin);
  const isConfirmValid = confirmMpin.length === 6 && mpin === confirmMpin;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!fullName.trim()) {
      error(lang === 'te' ? 'దయచేసి మీ పూర్తి పేరు నమోదు చేయండి.' : 'Please enter your full name.');
      return;
    }

    if (!isPhoneValid) {
      error(
        lang === 'te'
          ? 'దయచేసి చెల్లుబాటు అయ్యే 10 అంకెల భారతీయ మొబైల్ నంబర్‌ను నమోదు చేయండి (6-9 తో ప్రారంభం కావాలి).'
          : 'Please enter a valid 10-digit Indian mobile number (must start with 6-9).'
      );
      return;
    }

    if (!isMpinValid) {
      error(
        lang === 'te'
          ? 'ఎంపిన్ ఖచ్చితంగా 6 అంకెలు (0-9) మాత్రమే ఉండాలి.'
          : 'MPIN must contain exactly 6 numeric digits (0-9).'
      );
      return;
    }

    if (mpin !== confirmMpin) {
      error(lang === 'te' ? 'ఎంపిన్ మరియు కన్ఫర్మ్ ఎంపిన్ సరిపోలడం లేదు.' : 'MPIN and Confirm MPIN do not match.');
      return;
    }

    if (aadhar.trim() && aadhar.length !== 12) {
      error(lang === 'te' ? 'ఆధార్ నంబర్ ఖచ్చితంగా 12 అంకెలు ఉండాలి.' : 'Aadhaar number must be exactly 12 digits.');
      return;
    }

    if (!agreeTerms) {
      error(
        lang === 'te'
          ? 'దయచేసి ఏపీ పబ్లిక్ హెల్త్ నిబంధనలను అంగీకరించండి.'
          : 'Please accept the AP Public Health Privacy Policy & Terms.'
      );
      return;
    }

    setLoading(true);
    try {
      const res = await apiClient.post('/auth/patient/register', {
        fullName: fullName.trim(),
        phone,
        mpin,
        confirmMpin,
        aadhar: aadhar || undefined
      });

      login(res.data.user, res.data.token);
      success(
        lang === 'te'
          ? 'రోగి ఖాతా మరియు 6 అంకెల ఎంపిన్ విజయవంతంగా సృష్టించబడ్డాయి!'
          : 'Patient account & 6-digit MPIN created successfully!'
      );
      navigate('/patient/dashboard');
    } catch (err: any) {
      error(
        err.response?.data?.error ||
          (lang === 'te'
            ? 'రిజిస్ట్రేషన్ విఫలమైంది. దయచేసి మీ వివరాలను తనిఖీ చేయండి.'
            : 'Registration failed. Please verify your details.')
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
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '80vh',
        padding: '32px 16px'
      }}
    >
      <div className="med-card" style={{ maxWidth: '520px', width: '100%', padding: '36px 32px' }}>
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '24px' }}>
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
            <UserPlus size={26} />
          </div>
          <h2 style={{ fontSize: '1.45rem', fontWeight: 800, color: 'var(--navy-900)', margin: 0 }}>
            {lang === 'te' ? 'కొత్త రోగి ఖాతాను సృష్టించండి' : 'Create Patient Account'}
          </h2>
          <p style={{ fontSize: '0.84rem', color: 'var(--slate-500)', marginTop: '6px' }}>
            {lang === 'te'
              ? 'మొబైల్ నంబర్ మరియు 6 అంకెల ఎంపిన్‌తో వేగవంతమైన, సురక్షితమైన ఓపీడీ ఖాతా'
              : 'Fast, secure OPD registration with 10-digit mobile & 6-digit MPIN'}
          </p>
        </div>

        <form onSubmit={handleSubmit} noValidate>
          {/* Full Name */}
          <div className="form-group">
            <label className="form-label" style={{ fontWeight: 700 }}>
              {lang === 'te' ? 'పూర్తి పేరు *' : 'Full Name *'}
            </label>
            <input
              type="text"
              className="form-input"
              required
              placeholder={lang === 'te' ? 'ఉదా: కె. సీతాదేవి' : 'e.g. K. Sita Devi'}
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              autoComplete="name"
            />
            {fullName.trim() && (
              <div
                style={{
                  fontSize: '0.78rem',
                  color: 'var(--blue-600)',
                  marginTop: '4px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px'
                }}
              >
                <Sparkles size={12} />
                <span>
                  {t.autoTeluguPreview} <strong>{localizeName(fullName)}</strong>
                </span>
              </div>
            )}
          </div>

          {/* 10-Digit Mobile Number with Indian +91 Country Interface */}
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
              <div style={{ flex: 1, position: 'relative' }}>
                <input
                  type="tel"
                  inputMode="numeric"
                  className="form-input"
                  required
                  maxLength={10}
                  placeholder="9848012345"
                  value={phone}
                  onChange={handlePhoneChange}
                  autoComplete="tel"
                  style={{
                    borderColor:
                      phone.length > 0 ? (isPhoneValid ? 'var(--emerald-500)' : 'var(--rose-400)') : undefined
                  }}
                />
                {isPhoneValid && (
                  <Check
                    size={16}
                    color="var(--emerald-600)"
                    style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)' }}
                  />
                )}
              </div>
            </div>
            <div style={{ fontSize: '0.74rem', color: 'var(--slate-500)', marginTop: '4px' }}>
              {phone.length > 0 && !isPhoneValid ? (
                <span style={{ color: 'var(--rose-600)' }}>
                  {lang === 'te'
                    ? 'దయచేసి 6, 7, 8 లేదా 9తో ప్రారంభమయ్యే 10 అంకెల మొబైల్ నంబర్‌ను నమోదు చేయండి.'
                    : 'Must be 10 digits starting with 6, 7, 8, or 9.'}
                </span>
              ) : (
                <span>
                  {lang === 'te'
                    ? '💡 ఈ 10 అంకెల మొబైల్ నంబర్‌తోనే భవిష్యత్తులో లాగిన్ చేయవచ్చు.'
                    : '💡 Your 10-digit mobile number will be your permanent sign-in identity.'}
                </span>
              )}
            </div>
          </div>

          {/* 6-Digit MPIN Row */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
            {/* Create MPIN */}
            <div className="form-group">
              <label className="form-label" style={{ fontWeight: 700 }}>
                {lang === 'te' ? '6 అంకెల ఎంపిన్ సృష్టించండి *' : 'Create 6-Digit MPIN *'}
              </label>
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
                  autoComplete="new-password"
                  style={{
                    letterSpacing: mpin.length > 0 ? '4px' : 'normal',
                    fontWeight: 700,
                    paddingRight: '36px'
                  }}
                />
                <button
                  type="button"
                  onClick={() => setShowMpin(!showMpin)}
                  style={{
                    position: 'absolute',
                    right: '10px',
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
                {mpin.length > 0 && mpin.length < 6 ? (
                  <span style={{ color: 'var(--amber-600)' }}>
                    {6 - mpin.length} {lang === 'te' ? 'అంకెలు అవసరం' : 'digits remaining'}
                  </span>
                ) : isMpinValid ? (
                  <span style={{ color: 'var(--emerald-600)' }}>✓ 6 {lang === 'te' ? 'అంకెల ఎంపిన్' : 'digits'}</span>
                ) : (
                  <span>{lang === 'te' ? 'ఖచ్చితంగా 6 అంకెలు (0-9)' : 'Exactly 6 digits (0-9)'}</span>
                )}
              </div>
            </div>

            {/* Confirm MPIN */}
            <div className="form-group">
              <label className="form-label" style={{ fontWeight: 700 }}>
                {lang === 'te' ? 'ఎంపిన్ నిర్ధారించండి *' : 'Confirm 6-Digit MPIN *'}
              </label>
              <div style={{ position: 'relative' }}>
                <input
                  type={showConfirmMpin ? 'text' : 'password'}
                  inputMode="numeric"
                  pattern="\d*"
                  maxLength={6}
                  className="form-input"
                  required
                  placeholder="••••••"
                  value={confirmMpin}
                  onChange={handleConfirmMpinChange}
                  autoComplete="new-password"
                  style={{
                    letterSpacing: confirmMpin.length > 0 ? '4px' : 'normal',
                    fontWeight: 700,
                    paddingRight: '36px'
                  }}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmMpin(!showConfirmMpin)}
                  style={{
                    position: 'absolute',
                    right: '10px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'none',
                    border: 'none',
                    color: 'var(--slate-400)',
                    cursor: 'pointer',
                    padding: 0
                  }}
                  title={showConfirmMpin ? 'Hide MPIN' : 'Show MPIN'}
                >
                  {showConfirmMpin ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              <div style={{ fontSize: '0.72rem', color: 'var(--slate-500)', marginTop: '4px' }}>
                {confirmMpin.length > 0 && (
                  isConfirmValid ? (
                    <span style={{ color: 'var(--emerald-600)', fontWeight: 600 }}>✓ {lang === 'te' ? 'ఎంపిన్‌లు సరిపోయాయి' : 'MPINs match'}</span>
                  ) : (
                    <span style={{ color: 'var(--rose-600)', fontWeight: 600 }}>✗ {lang === 'te' ? 'సరిపోలడం లేదు' : 'Do not match'}</span>
                  )
                )}
              </div>
            </div>
          </div>

          {/* Optional 12-Digit Aadhaar */}
          <div className="form-group">
            <label className="form-label" style={{ fontWeight: 600 }}>
              {lang === 'te' ? 'ఆధార్ సంఖ్య (ఐచ్ఛికం - 12 అంకెలు)' : 'Aadhaar Number (Optional - 12 digits)'}
            </label>
            <input
              type="text"
              inputMode="numeric"
              className="form-input"
              maxLength={12}
              placeholder={lang === 'te' ? 'ఉదా: 5678 9012 3456' : 'e.g. 5678 9012 3456'}
              value={aadhar}
              onChange={handleAadharChange}
            />
            <div style={{ fontSize: '0.74rem', color: 'var(--slate-500)', marginTop: '4px' }}>
              {lang === 'te'
                ? '💡 ఆధార్‌ను అనుసంధానిస్తే వైద్య చరిత్ర మరియు డా. ఎన్టీఆర్ వైద్య సేవ ప్రయోజనాలు వేగంగా లభిస్తాయి.'
                : '💡 Linking Aadhaar enables faster health records and Dr. NTR Vaidya Seva benefits.'}
            </div>
          </div>

          {/* Terms Agreement */}
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', margin: '14px 0 20px' }}>
            <input
              type="checkbox"
              id="termsCheck"
              style={{ marginTop: '3px', cursor: 'pointer' }}
              checked={agreeTerms}
              onChange={(e) => setAgreeTerms(e.target.checked)}
            />
            <label htmlFor="termsCheck" style={{ fontSize: '0.8rem', color: 'var(--slate-600)', cursor: 'pointer', lineHeight: 1.4 }}>
              {lang === 'te'
                ? 'నేను ఏపీ పబ్లిక్ హెల్త్ గోప్యతా విధానం మరియు డిజిటల్ నిబంధనలను అంగీకరిస్తున్నాను.'
                : 'I accept the AP Public Health Privacy Policy & Terms.'}
            </label>
          </div>

          {/* Registration Button */}
          <button
            type="submit"
            className="btn btn-primary"
            disabled={loading || !isPhoneValid || !isMpinValid || !isConfirmValid || !agreeTerms}
            style={{ width: '100%', height: '46px', fontSize: '0.94rem', fontWeight: 700 }}
          >
            {loading ? (lang === 'te' ? 'ఖాతా సృష్టిస్తోంది...' : 'Creating Account...') : (lang === 'te' ? 'ఖాతాను సృష్టించండి' : 'Create Account')}
            <ArrowRight size={16} />
          </button>
        </form>

        {/* Existing Account Footer Link */}
        <div style={{ borderTop: '1px solid var(--slate-200)', marginTop: '24px', paddingTop: '18px', textAlign: 'center', fontSize: '0.85rem' }}>
          <span style={{ color: 'var(--slate-500)' }}>
            {lang === 'te' ? 'ఇప్పటికే ఖాతా ఉందా? ' : 'Already have an account? '}
          </span>
          <Link to="/patient/login" style={{ fontWeight: 700, color: 'var(--blue-600)' }}>
            {lang === 'te' ? 'ఇక్కడ సైన్ ఇన్ చేయండి' : 'Sign In here'}
          </Link>
        </div>
      </div>
    </div>
  );
};
export default PatientRegister;
