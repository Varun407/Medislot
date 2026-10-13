import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import { useToast } from '../../context/ToastContext';
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
  FileText
} from 'lucide-react';

export const Navbar: React.FC = () => {
  const { user, isAuthenticated, role, logout } = useAuth();
  const { lang, toggleLang, t } = useLanguage();
  const { success } = useToast();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = async () => {
    await logout();
    success('Logged out successfully');
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
            LIVE PORTAL
          </span>
        </div>
        <div className="sys-banner-right">
          <span className="sys-hotline">
            <PhoneCall size={12} />
            {t.emergency108}
          </span>
          <button className="lang-toggle-btn" onClick={toggleLang} title="Toggle Language">
            <Globe size={13} />
            {lang === 'en' ? 'తెలుగు (Telugu)' : 'English'}
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

          <ul className="nav-links">
            <li>
              <Link to="/" className={`nav-link ${location.pathname === '/' ? 'active' : ''}`}>
                <Activity size={16} />
                {t.navHome}
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
          </ul>

          <div className="header-actions">
            {isAuthenticated && user ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <Link to={getDashboardPath()} className="btn btn-primary btn-sm">
                  <UserIcon size={14} />
                  {user.fullName.split(' ')[0]} ({role})
                </Link>
                <button onClick={handleLogout} className="btn btn-secondary btn-sm" title="Sign Out">
                  <LogOut size={14} />
                  {t.btnLogout}
                </button>
              </div>
            ) : location.pathname !== '/' ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Link to="/" className="btn btn-primary btn-sm">
                  <LogIn size={14} />
                  {lang === 'te' ? 'లాగిన్' : 'Sign In'}
                </Link>
              </div>
            ) : null}
          </div>
        </div>
      </nav>
    </header>
  );
};
