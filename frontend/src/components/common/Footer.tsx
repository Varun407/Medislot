import React from 'react';
import { Link } from 'react-router-dom';
import { useLanguage } from '../../context/LanguageContext';
import { useAuth } from '../../context/AuthContext';
import { Shield } from 'lucide-react';

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
                <h4 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 800 }}>{t.brandName || (lang === 'te' ? 'మెడిస్లాట్' : 'MediSlot')}</h4>
                <p style={{ margin: 0, fontSize: '0.75rem', color: '#94b8e3' }}>{t.brandDept}</p>
              </div>
            </div>
            <p style={{ color: '#94b8e3', fontSize: '0.82rem', lineHeight: 1.6, maxWidth: '320px' }}>
              {lang === 'te'
                ? 'ఆంధ్రప్రదేశ్ ప్రజల కోసం రూపొందించబడిన డిజిటల్ ఓపీడీ అపాయింట్‌మెంట్ మరియు టోకెన్ నిర్వహణ వ్యవస్థ. ప్రభుత్వ ఆసుపత్రులలో ఉచిత మరియు వేగవంతమైన వైద్య సేవలు.'
                : 'Digital Outpatient OPD Appointment & Sequential Token Management Portal for Government Hospitals and Community Health Centres across Andhra Pradesh.'}
            </p>
          </div>

          <div className="footer-col">
            <h4>{t.quickLinks}</h4>
            <ul>
              <li><Link to="/">{t.navHome}</Link></li>
              <li><Link to="/doctors">{t.navDoctors}</Link></li>
              <li><Link to="/hospitals">{t.navHospitals}</Link></li>
              <li><Link to="/grievance">{t.navGrievance}</Link></li>
            </ul>
          </div>

          <div className="footer-col">
            <h4>{t.portalAccess}</h4>
            <ul>
              <li><Link to="/login">{t.btnLogin}</Link></li>
              <li><Link to="/patient/register">{t.registerPatientBtn}</Link></li>
              <li><Link to="/doctor/register">{t.registerAsDoctor}</Link></li>
            </ul>
          </div>

          <div className="footer-col">
            <h4>{t.emergencyHotlines}</h4>
            <ul>
              <li style={{ color: '#fed7aa', fontWeight: 700 }}>{t.ambulance108}</li>
              <li style={{ color: '#fed7aa', fontWeight: 700 }}>{t.medicalAdvice104}</li>
              <li style={{ color: '#fed7aa', fontWeight: 700 }}>{t.nationalEmergency112}</li>
              <li style={{ color: '#94b8e3', marginTop: '6px' }}>{t.hospitalLocation}</li>
            </ul>
          </div>
        </div>

        <div className="footer-bottom">
          <p>© {new Date().getFullYear()} {t.copyrightText}</p>
          <p style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Shield size={13} />
            {t.isoStandards}
          </p>
        </div>
      </div>
    </footer>
  );
};
