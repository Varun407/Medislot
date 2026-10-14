import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import { useToast } from '../../context/ToastContext';
import { EmergencyModal } from './EmergencyModal';
import {
  Activity,
  User as UserIcon,
  Stethoscope,
  ShieldAlert,
  LogOut,
  LogIn,
  Globe,
  PhoneCall,
  Calendar,
  Building2,
  FileText,
  AlertTriangle
} from 'lucide-react';

export const Navbar: React.FC = () => {
  const { user, isAuthenticated, role, logout } = useAuth();
  const { lang, toggleLang, t, localizeName, localizeRole } = useLanguage();
  const { success } = useToast();
  const navigate = useNavigate();
  const location = useLocation();
  const [showEmergency, setShowEmergency] = useState(false);

  // Hide Navbar completely on sign-in / authentication routes
  const hideOnAuthRoutes = [
    '/login',
    '/patient/login',
    '/doctor/login',
    '/control-center/login',
    '/admin/login',
    '/patient/register',
    '/doctor/register',
    '/doctor/pending'
  ];
  const normalizedPath = location.pathname.replace(/\/+$/, '') || '/';
  if (hideOnAuthRoutes.includes(normalizedPath) || hideOnAuthRoutes.some((r) => location.pathname.startsWith(r + '/'))) {
    return null;
  }

  const handleLogout = async () => {
    await logout();
    success(lang === 'te' ? 'విజయవంతంగా లాగౌట్ అయ్యారు' : 'Logged out successfully');
    navigate('/');
  };

  const getDashboardPath = () => {
    if (role === 'ADMIN') return '/admin/dashboard';
    if (role === 'DOCTOR') return '/doctor/dashboard';
    return '/patient/dashboard';
  };

  return (
    <header className="main-header-root">
      {/* Top Andhra Pradesh Government System Strip */}
      <div className="sys-banner">
        <div className="sys-banner-left">
          <span>{t.bannerGov}</span>
          <span className="sys-pulse-badge">
            <span className="pulse-dot" />
            {lang === 'te' ? 'ప్రత్యక్ష పోర్టల్' : 'LIVE PORTAL'}
          </span>
        </div>
        <div className="sys-banner-right">
          <button
            type="button"
            className="sys-hotline"
            onClick={() => setShowEmergency(true)}
            style={{
              background: 'rgba(239, 68, 68, 0.15)',
              border: '1px solid rgba(239, 68, 68, 0.3)',
              color: '#fca5a5',
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '2px 8px',
              borderRadius: '6px',
              fontSize: '0.74rem'
            }}
            title={lang === 'te' ? '24x7 అత్యవసర సహాయం పొందండి' : 'Access 24x7 Emergency Helplines'}
          >
            <PhoneCall size={12} />
            {t.emergency108}
          </button>
          <button className="lang-toggle-btn" onClick={toggleLang} title="Toggle Language">
            <Globe size={13} />
            {lang === 'en' ? 'తెలుగు' : 'English'}
          </button>
        </div>
      </div>

      {/* Main Navbar */}
      <nav className="main-header">
        <div className="header-container">
          <Link to="/" className="brand-wrapper">
            <span className="emblem-icon">🏥</span>
            <div className="brand-text">
              <h1>{lang === 'te' ? 'మెడిస్లాట్' : 'MediSlot'}</h1>
              <p>{t.brandTagline}</p>
            </div>
          </Link>

          {isAuthenticated ? (
            <ul className="nav-links">
              {role === 'PATIENT' && (
                <>
                  <li>
                    <Link to="/patient/dashboard" className={`nav-link ${location.pathname === '/patient/dashboard' ? 'active' : ''}`}>
                      <Activity size={16} />
                      {t.patientDashboard}
                    </Link>
                  </li>
                  <li>
                    <Link to="/patient/book" className={`nav-link ${location.pathname === '/patient/book' ? 'active' : ''}`}>
                      <Calendar size={16} />
                      {t.bookOpdSlot}
                    </Link>
                  </li>
                  <li>
                    <Link to="/doctors" className={`nav-link ${location.pathname === '/doctors' ? 'active' : ''}`}>
                      <Stethoscope size={16} />
                      {t.navDoctors}
                    </Link>
                  </li>
                  <li>
                    <Link to="/hospitals" className={`nav-link ${location.pathname === '/hospitals' ? 'active' : ''}`}>
                      <Building2 size={16} />
                      {t.navHospitals}
                    </Link>
                  </li>
                  <li>
                    <Link to="/grievance" className={`nav-link ${location.pathname === '/grievance' ? 'active' : ''}`}>
                      <FileText size={16} />
                      {t.navGrievance}
                    </Link>
                  </li>
                </>
              )}

              {role === 'DOCTOR' && (
                <>
                  <li>
                    <Link to="/doctor/dashboard" className={`nav-link ${location.pathname === '/doctor/dashboard' ? 'active' : ''}`}>
                      <Activity size={16} />
                      {t.opdQueueBoard}
                    </Link>
                  </li>
                  <li>
                    <Link to="/doctor/availability" className={`nav-link ${location.pathname === '/doctor/availability' ? 'active' : ''}`}>
                      <Calendar size={16} />
                      {t.dutySchedule}
                    </Link>
                  </li>
                  <li>
                    <Link to="/hospitals" className={`nav-link ${location.pathname === '/hospitals' ? 'active' : ''}`}>
                      <Building2 size={16} />
                      {t.navHospitals}
                    </Link>
                  </li>
                </>
              )}

              {role === 'ADMIN' && (
                <>
                  <li>
                    <Link to="/admin/dashboard" className={`nav-link ${location.pathname === '/admin/dashboard' ? 'active' : ''}`}>
                      <Activity size={16} />
                      {t.controlCenter}
                    </Link>
                  </li>
                  <li>
                    <Link to="/admin/opd" className={`nav-link ${location.pathname === '/admin/opd' ? 'active' : ''}`}>
                      <Stethoscope size={16} />
                      {t.manageOpds}
                    </Link>
                  </li>
                  <li>
                    <Link to="/admin/doctors" className={`nav-link ${location.pathname === '/admin/doctors' ? 'active' : ''}`}>
                      <UserIcon size={16} />
                      {t.doctorLicensure}
                    </Link>
                  </li>
                  <li>
                    <Link to="/admin/patients" className={`nav-link ${location.pathname === '/admin/patients' ? 'active' : ''}`}>
                      <UserIcon size={16} />
                      {t.patients}
                    </Link>
                  </li>
                  <li>
                    <Link to="/admin/appointments" className={`nav-link ${location.pathname === '/admin/appointments' ? 'active' : ''}`}>
                      <Calendar size={16} />
                      {t.appointments}
                    </Link>
                  </li>
                </>
              )}
            </ul>
          ) : (
            <ul className="nav-links">
              <li>
                <Link to="/" className={`nav-link ${location.pathname === '/' ? 'active' : ''}`}>
                  <Activity size={16} />
                  {t.navHome || 'Home'}
                </Link>
              </li>
              <li>
                <Link to="/doctors" className={`nav-link ${location.pathname === '/doctors' ? 'active' : ''}`}>
                  <Stethoscope size={16} />
                  {t.navDoctors || 'Doctors'}
                </Link>
              </li>
              <li>
                <Link to="/hospitals" className={`nav-link ${location.pathname === '/hospitals' ? 'active' : ''}`}>
                  <Building2 size={16} />
                  {t.navHospitals || 'Hospitals & Beds'}
                </Link>
              </li>
              <li>
                <a href="/#how-it-works" className="nav-link">
                  <Calendar size={16} />
                  {lang === 'te' ? 'ఎలా పనిచేస్తుంది?' : 'How It Works'}
                </a>
              </li>
              <li>
                <Link to="/grievance" className={`nav-link ${location.pathname === '/grievance' ? 'active' : ''}`}>
                  <FileText size={16} />
                  {t.navGrievance || 'Grievances'}
                </Link>
              </li>
            </ul>
          )}

          <div className="header-actions">
            {isAuthenticated && user ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <Link to={getDashboardPath()} className="btn btn-primary btn-sm">
                  <UserIcon size={14} />
                  {localizeName(user.fullName.split(' ')[0])} ({localizeRole(role)})
                </Link>
                <button onClick={handleLogout} className="btn btn-secondary btn-sm" title={t.btnLogout}>
                  <LogOut size={14} />
                  {t.btnLogout}
                </button>
              </div>
            ) : (
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Link to="/login" className="btn btn-primary btn-sm">
                  <LogIn size={14} />
                  {t.btnLogin}
                </Link>
                <Link to="/patient/register" className="btn btn-secondary btn-sm">
                  <UserIcon size={14} />
                  {t.btnRegister}
                </Link>
              </div>
            )}
          </div>
        </div>
      </nav>
      <EmergencyModal isOpen={showEmergency} onClose={() => setShowEmergency(false)} />
    </header>
  );
};
