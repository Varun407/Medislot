import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { apiClient } from '../../api/client';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import { useToast } from '../../context/ToastContext';
import { FileText, Send, CheckCircle2, ShieldAlert, ShieldCheck, LogIn, UserPlus } from 'lucide-react';

export const Grievances: React.FC = () => {
  const { user, isAuthenticated } = useAuth();
  const { lang, t, localizeHospital } = useLanguage();
  const { success, error } = useToast();

  const [citizenName, setCitizenName] = useState(user?.fullName || '');
  const [citizenPhone, setCitizenPhone] = useState(user?.phone || '');
  const [hospitalName, setHospitalName] = useState('Government District Hospital, Bhimavaram');
  const [category, setCategory] = useState('OPD Waiting Time');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [submittedId, setSubmittedId] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      if (user.fullName) setCitizenName(user.fullName);
      if (user.phone) setCitizenPhone(user.phone);
    }
  }, [user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!isAuthenticated) {
      error(lang === 'te' ? 'ఫిర్యాదు సమర్పించడానికి దయచేసి రోగి ఖాతాతో లాగిన్ అవ్వండి.' : 'Please sign in with a patient account to lodge a grievance.');
      return;
    }

    if (!citizenName.trim() || !citizenPhone.trim() || !message.trim()) {
      error(lang === 'te' ? 'దయచేసి అన్ని అవసరమైన ఫీల్డులను పూర్తి చేయండి.' : 'Please complete all required fields.');
      return;
    }

    setLoading(true);
    try {
      const res = await apiClient.post('/public/grievances', {
        citizenName,
        citizenPhone,
        hospitalName,
        category,
        message
      });
      setSubmittedId(res.data.grievanceId);
      success(res.data.message || (lang === 'te' ? 'ఫిర్యాదు విజయవంతంగా సమర్పించబడింది.' : 'Grievance submitted successfully.'));
      setMessage('');
    } catch (err: any) {
      error(err.response?.data?.error || (lang === 'te' ? 'ఫిర్యాదు సమర్పించడం విఫలమైంది.' : 'Failed to submit grievance.'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="main-content" style={{ maxWidth: '800px' }}>
      <div className="section-header">
        <h1 className="section-title">
          {t.grievanceTitle}
        </h1>
        <p className="section-subtitle">
          {t.grievanceSubtitle}
        </p>
      </div>

      {!isAuthenticated ? (
        /* Authentication Gate: Only citizens with an account can lodge grievances */
        <div className="med-card" style={{ padding: '42px 32px', textAlign: 'center', border: '1px solid var(--slate-200)', boxShadow: 'var(--shadow-lg)' }}>
          <div style={{ width: '68px', height: '68px', borderRadius: '50%', background: '#fef3c7', color: '#d97706', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
            <ShieldAlert size={36} />
          </div>
          <h2 style={{ fontSize: '1.45rem', fontWeight: 800, color: 'var(--navy-900)', marginBottom: '10px' }}>
            {t.grievanceAccountRequiredTitle}
          </h2>
          <p style={{ color: 'var(--slate-600)', fontSize: '0.92rem', lineHeight: 1.6, maxWidth: '600px', margin: '0 auto 26px' }}>
            {t.grievanceAccountRequiredDesc}
          </p>

          <div style={{ display: 'flex', gap: '14px', justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link to="/login" className="btn btn-primary btn-lg" style={{ padding: '12px 24px', fontSize: '0.95rem' }}>
              <LogIn size={17} />
              {t.grievanceSignInPrompt}
            </Link>
            <Link to="/patient/register" className="btn btn-secondary btn-lg" style={{ padding: '12px 24px', fontSize: '0.95rem' }}>
              <UserPlus size={17} />
              {t.grievanceRegisterPrompt}
            </Link>
          </div>

          <div style={{ marginTop: '28px', paddingTop: '18px', borderTop: '1px solid var(--slate-200)', fontSize: '0.82rem', color: 'var(--slate-500)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
            <ShieldCheck size={15} color="var(--blue-600)" />
            <span>{t.grievanceSubmitNotice}</span>
          </div>
        </div>
      ) : submittedId ? (
        /* Success Screen with Tracking Reference */
        <div className="med-card" style={{ textAlign: 'center', padding: '44px 24px', border: '2px solid var(--emerald-600)', boxShadow: 'var(--shadow-lg)' }}>
          <CheckCircle2 size={52} color="var(--emerald-600)" style={{ margin: '0 auto 14px' }} />
          <h2 style={{ fontSize: '1.45rem', fontWeight: 800, color: 'var(--navy-900)' }}>
            {t.grievanceSuccessTitle}
          </h2>
          <p style={{ color: 'var(--slate-600)', margin: '8px 0 22px', fontSize: '0.92rem', lineHeight: 1.5 }}>
            {t.grievanceSuccessDesc}
          </p>
          <div style={{ background: 'var(--blue-50)', padding: '16px 24px', borderRadius: '8px', display: 'inline-block', border: '1px solid var(--blue-200)' }}>
            <span style={{ fontSize: '0.82rem', color: 'var(--slate-500)', fontWeight: 700, textTransform: 'uppercase' }}>{t.trackingRefId}</span>
            <div style={{ fontSize: '1.6rem', fontWeight: 900, color: 'var(--blue-600)', letterSpacing: '1px', marginTop: '2px' }}>
              {submittedId}
            </div>
          </div>
          <div style={{ marginTop: '26px' }}>
            <button className="btn btn-secondary btn-sm" onClick={() => setSubmittedId(null)}>
              {t.submitAnotherGrievance}
            </button>
          </div>
        </div>
      ) : (
        /* Authenticated Grievance Lodge Form */
        <div className="med-card" style={{ padding: '32px', boxShadow: 'var(--shadow-md)' }}>
          {/* Verified Citizen Indicator */}
          <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', color: '#166534', padding: '12px 16px', borderRadius: '8px', marginBottom: '22px', display: 'flex', alignItems: 'center', gap: '10px', fontSize: '0.86rem', fontWeight: 600 }}>
            <ShieldCheck size={18} color="#16a34a" />
            <span>{t.grievanceLoggedInAs} <strong>{user?.fullName}</strong> · +91 {user?.phone}</span>
          </div>

          <form onSubmit={handleSubmit}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <div className="form-group">
                <label className="form-label">{t.fullName}</label>
                <input
                  type="text"
                  className="form-input"
                  required
                  placeholder={t.fullNamePlaceholder}
                  value={citizenName}
                  onChange={(e) => setCitizenName(e.target.value)}
                />
              </div>

              <div className="form-group">
                <label className="form-label">{t.mobile10Digits}</label>
                <input
                  type="tel"
                  className="form-input"
                  required
                  placeholder="98480XXXXX"
                  value={citizenPhone}
                  onChange={(e) => setCitizenPhone(e.target.value)}
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">{t.hospitalFacility}</label>
              <select className="form-select" value={hospitalName} onChange={(e) => setHospitalName(e.target.value)}>
                <option value="Government District Hospital, Bhimavaram">
                  {localizeHospital('Government District Hospital, Bhimavaram')}
                </option>
                <option value="Area Hospital, Palakollu">
                  {localizeHospital('Area Hospital, Palakollu')}
                </option>
                <option value="Government General Hospital (GGH), Eluru">
                  {localizeHospital('Government General Hospital (GGH), Eluru')}
                </option>
                <option value="Rangaraya Government General Hospital, Kakinada">
                  {localizeHospital('Rangaraya Government General Hospital, Kakinada')}
                </option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">{t.categoryLabel}</label>
              <select className="form-select" value={category} onChange={(e) => setCategory(e.target.value)}>
                <option value="OPD Waiting Time">{t.catOpdWaiting}</option>
                <option value="Medicine Availability">{t.catMedicineAvail}</option>
                <option value="Hospital Sanitation">{t.catSanitation}</option>
                <option value="Doctor Availability">{t.catDoctorAvail}</option>
                <option value="Diagnostics & Lab">{t.catDiagnosticsLab}</option>
                <option value="Other Suggestion">{t.catOtherSuggestion}</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">{t.detailedFeedback}</label>
              <textarea
                className="form-textarea"
                rows={4}
                required
                placeholder={t.detailedFeedbackPlaceholder}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
              />
            </div>

            <button type="submit" className="btn btn-primary" disabled={loading} style={{ width: '100%', marginTop: '6px', padding: '12px' }}>
              <Send size={16} />
              {loading ? t.submittingGrievance : t.submitGrievanceBtn}
            </button>
          </form>
        </div>
      )}
    </div>
  );
};
