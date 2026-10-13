import React from 'react';
import { Link } from 'react-router-dom';
import { useLanguage } from '../../context/LanguageContext';
import { useAuth } from '../../context/AuthContext';
import { Shield, Phone, Heart, Activity } from 'lucide-react';

export const Footer: React.FC = () => {
  const { t, lang } = useLanguage();
  const { isAuthenticated } = useAuth();

  return (
    <footer className="main-footer no-print">
      <div className="footer-container">
        <div className="footer-grid">
          <div className="footer-col">
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '14px' }}>
              <span style={{ fontSize: '1.8rem' }}>🏥</span>
              <div>
                <h4 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 800 }}>MediSlot</h4>
                <p style={{ margin: 0, fontSize: '0.75rem', color: '#94b8e3' }}>{t.brandDept}</p>
              </div>
            </div>
            <p style={{ color: '#94b8e3', fontSize: '0.82rem', lineHeight: 1.6, maxWidth: '320px' }}>
              {lang === 'te'
                ? 'ఆంధ్రప్రదేశ్ ప్రజల కోసం రూపొందించబడిన డిజిటల్ ఓపీడీ అపాయింట్‌మెంట్ మరియు టోకెన్ నిర్వహణ వ్యవస్థ. ప్రభుత్వ ఆసుపత్రులలో ఉచిత మరియు వేగవంతమైన వైద్య సేవలు.'
                : 'Digital Outpatient OPD Appointment & Sequential Token Management Portal for Government Hospitals and Community Health Centres across Andhra Pradesh.'}
            </p>
          </div>

          {isAuthenticated ? (
            <div className="footer-col">
              <h4>{lang === 'te' ? 'త్వరిత లింకులు' : 'Quick Links'}</h4>
              <ul>
                <li><Link to="/doctors">{t.navDoctors}</Link></li>
                <li><Link to="/hospitals">{t.navHospitals}</Link></li>
                <li><Link to="/grievance">{t.navGrievance}</Link></li>
              </ul>
            </div>
          ) : (
            <div className="footer-col">
              <h4>{lang === 'te' ? 'భద్రత & ప్రవేశం' : 'Security & Access'}</h4>
              <p style={{ color: '#94b8e3', fontSize: '0.8rem', lineHeight: 1.5 }}>
                {lang === 'te'
                  ? 'వైద్య రికార్డులు & ఆసుపత్రి క్యూ సమాచారం సురక్షిత లాగిన్ ద్వారా మాత్రమే లభ్యమవుతుంది.'
                  : 'Medical records and hospital queue rosters are strictly secured behind verified role authentication.'}
              </p>
            </div>
          )}

          <div className="footer-col">
            <h4>{lang === 'te' ? 'పోర్టల్ ప్రవేశం' : 'Portal Access'}</h4>
            <ul>
              <li><Link to="/">{lang === 'te' ? 'పోర్టల్ లాగిన్' : 'Sign In'}</Link></li>
              <li><Link to="/patient/register">{lang === 'te' ? 'రోగి రిజిస్ట్రేషన్' : 'Patient Registration'}</Link></li>
              <li><Link to="/doctor/register">{lang === 'te' ? 'వైద్యుల రిజిస్ట్రేషన్' : 'Doctor Registration'}</Link></li>
            </ul>
          </div>

          <div className="footer-col">
            <h4>{lang === 'te' ? 'అత్యవసర హెల్ప్‌లైన్‌లు' : 'Emergency Hotlines'}</h4>
            <ul>
              <li style={{ color: '#fed7aa', fontWeight: 700 }}>🚑 108 - Ambulance</li>
              <li style={{ color: '#fed7aa', fontWeight: 700 }}>🩺 104 - Medical Advice</li>
              <li style={{ color: '#fed7aa', fontWeight: 700 }}>🚨 112 - National Emergency</li>
              <li style={{ color: '#94b8e3', marginTop: '6px' }}>District Hospital, Bhimavaram</li>
            </ul>
          </div>
        </div>

        <div className="footer-bottom">
          <p>© {new Date().getFullYear()} Department of Health, Medical & Family Welfare, Govt. of Andhra Pradesh. All rights reserved.</p>
          <p style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Shield size={13} />
            Secure Role-Based Access · ISO 27001 Healthcare Standards
          </p>
        </div>
      </div>
    </footer>
  );
};
