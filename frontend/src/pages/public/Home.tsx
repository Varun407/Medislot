import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { apiClient } from '../../api/client';
import { Hospital, Department, Doctor, PublicStats } from '../../types';
import { useLanguage } from '../../context/LanguageContext';
import {
  Calendar,
  Building2,
  Stethoscope,
  Activity,
  BedDouble,
  ShieldCheck,
  Clock,
  ArrowRight,
  Search,
  CheckCircle2,
  PhoneCall
} from 'lucide-react';

export const Home: React.FC = () => {
  const { t, lang } = useLanguage();
  const navigate = useNavigate();

  const [stats, setStats] = useState<PublicStats | null>(null);
  const [hospitals, setHospitals] = useState<Hospital[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  // Quick search form state
  const [selectedHosp, setSelectedHosp] = useState<string>('all');
  const [selectedDept, setSelectedDept] = useState<string>('all');
  const [selectedDate, setSelectedDate] = useState<string>(() => {
    return new Date().toISOString().split('T')[0];
  });

  useEffect(() => {
    async function loadData() {
      try {
        const [statsRes, hospRes, deptRes, docRes] = await Promise.all([
          apiClient.get('/public/stats'),
          apiClient.get('/public/hospitals'),
          apiClient.get('/public/departments'),
          apiClient.get('/public/doctors')
        ]);
        setStats(statsRes.data);
        setHospitals(hospRes.data);
        setDepartments(deptRes.data);
        setDoctors(docRes.data.slice(0, 6)); // Top 6 doctors
      } catch (err) {
        console.error('Failed to load home page data:', err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const handleQuickSearch = (e: React.FormEvent) => {
    e.preventDefault();
    navigate(`/doctors?hospitalId=${selectedHosp}&department=${selectedDept}&date=${selectedDate}`);
  };

  return (
    <div>
      {/* Hero Section */}
      <section className="hero-section">
        <div className="hero-container">
          <div>
            <div className="hero-tag">
              <ShieldCheck size={14} />
              {t.heroTag}
            </div>
            <h1 className="hero-title" dangerouslySetInnerHTML={{ __html: t.heroHeading }} />
            <p className="hero-desc">{t.heroDesc}</p>

            <div style={{ display: 'flex', gap: '14px', flexWrap: 'wrap' }}>
              <Link to="/patient/register" className="btn btn-primary btn-lg">
                <Calendar size={18} />
                {t.btnBookNow}
              </Link>
              <Link to="/doctors" className="btn btn-secondary btn-lg" style={{ background: 'rgba(255,255,255,0.15)', color: '#fff', borderColor: 'rgba(255,255,255,0.3)' }}>
                <Search size={18} />
                {t.btnFindDoctor}
              </Link>
            </div>

            <div className="hero-badges-grid">
              <div className="hero-badge-item">
                <CheckCircle2 size={16} color="#34d399" />
                {t.badge1}
              </div>
              <div className="hero-badge-item">
                <CheckCircle2 size={16} color="#34d399" />
                {t.badge2}
              </div>
              <div className="hero-badge-item">
                <CheckCircle2 size={16} color="#34d399" />
                {t.badge3}
              </div>
              <div className="hero-badge-item">
                <CheckCircle2 size={16} color="#34d399" />
                {t.badge4}
              </div>
            </div>
          </div>

          {/* Quick OPD Slot Reservation Widget */}
          <div className="med-card" style={{ padding: '28px', border: '1px solid rgba(255,255,255,0.3)', boxShadow: 'var(--shadow-xl)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
              <Calendar size={22} color="var(--blue-600)" />
              <div>
                <h3 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 800, color: 'var(--navy-900)' }}>
                  {t.bookingTitle}
                </h3>
                <p style={{ margin: 0, fontSize: '0.78rem', color: 'var(--slate-500)' }}>
                  {lang === 'te' ? 'నేరుగా ఓపీడీ స్లాట్ లభ్యతను తనిఖీ చేయండి' : 'Check real-time OPD availability'}
                </p>
              </div>
            </div>

            <form onSubmit={handleQuickSearch}>
              <div className="form-group">
                <label className="form-label">{t.lblHospital}</label>
                <select
                  className="form-select"
                  value={selectedHosp}
                  onChange={(e) => setSelectedHosp(e.target.value)}
                >
                  <option value="all">{lang === 'te' ? 'అన్ని ప్రభుత్వ ఆసుపత్రులు' : 'All AP Government Hospitals'}</option>
                  {hospitals.map((h) => (
                    <option key={h.id} value={h.id}>
                      {lang === 'te' ? h.nameTe : h.nameEn}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">{t.lblDept}</label>
                <select
                  className="form-select"
                  value={selectedDept}
                  onChange={(e) => setSelectedDept(e.target.value)}
                >
                  <option value="all">{t.allDepts}</option>
                  {departments.map((d) => (
                    <option key={d.key} value={d.key}>
                      {d.icon} {lang === 'te' ? d.nameTe : d.nameEn}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">{t.lblDate}</label>
                <input
                  type="date"
                  className="form-input"
                  min={new Date().toISOString().split('T')[0]}
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                />
              </div>

              <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '8px' }}>
                <Search size={16} />
                {lang === 'te' ? 'లభ్యతను శోధించండి' : 'Search OPD Availability'}
              </button>
            </form>
          </div>
        </div>
      </section>

      {/* Live Health Stats Strip */}
      <section className="stats-strip">
        <div className="stats-grid">
          <div className="stat-box">
            <div className="stat-icon"><Building2 /></div>
            <div>
              <div className="stat-val">{stats?.totalHospitals || 4}</div>
              <div className="stat-lbl">{t.statHospitals}</div>
            </div>
          </div>
          <div className="stat-box">
            <div className="stat-icon"><Stethoscope /></div>
            <div>
              <div className="stat-val">{stats?.activeDoctors || 9}+</div>
              <div className="stat-lbl">{t.statDoctors}</div>
            </div>
          </div>
          <div className="stat-box">
            <div className="stat-icon"><BedDouble /></div>
            <div>
              <div className="stat-val">{stats?.availableBeds || 397}</div>
              <div className="stat-lbl">{t.statBeds}</div>
            </div>
          </div>
          <div className="stat-box">
            <div className="stat-icon"><Activity /></div>
            <div>
              <div className="stat-val">{stats?.todayBookings || 5}+</div>
              <div className="stat-lbl">{t.statBookings}</div>
            </div>
          </div>
        </div>
      </section>

      {/* Popular Clinical Departments */}
      <section className="main-content">
        <div className="section-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
          <div>
            <h2 className="section-title">
              {lang === 'te' ? 'ప్రముఖ వైద్య విభాగాలు' : 'Specialized Clinical Departments'}
            </h2>
            <p className="section-subtitle">
              {lang === 'te' ? 'అనుభవజ్ఞులైన నిపుణులతో ఉచిత ప్రభుత్వ వైద్య సంప్రదింపులు' : 'Comprehensive OPD care provided across West Godavari and referral institutions'}
            </p>
          </div>
          <Link to="/doctors" className="btn btn-outline btn-sm">
            {lang === 'te' ? 'అన్ని విభాగాలు' : 'View All Departments'}
            <ArrowRight size={14} />
          </Link>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '20px' }}>
          {departments.slice(0, 6).map((d) => (
            <div key={d.key} className="med-card" style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <div style={{ fontSize: '2.2rem' }}>{d.icon}</div>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: 'var(--navy-900)' }}>
                {lang === 'te' ? d.nameTe : d.nameEn}
              </h3>
              <p style={{ fontSize: '0.82rem', color: 'var(--slate-500)', flex: 1 }}>
                {lang === 'te' ? d.descriptionTe : d.descriptionEn}
              </p>
              <Link to={`/doctors?department=${encodeURIComponent(d.key)}`} style={{ fontSize: '0.82rem', fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                {lang === 'te' ? 'వైద్యులను చూడండి' : 'Consult Specialist'} →
              </Link>
            </div>
          ))}
        </div>
      </section>

      {/* Featured Verified Doctors */}
      <section style={{ backgroundColor: 'var(--slate-50)', borderTop: '1px solid var(--slate-200)', borderBottom: '1px solid var(--slate-200)', padding: '48px 24px' }}>
        <div style={{ maxWidth: '1280px', margin: '0 auto' }}>
          <div className="section-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
            <div>
              <h2 className="section-title">
                {lang === 'te' ? 'అందుబాటులో ఉన్న ప్రభుత్వ వైద్యులు' : 'Active Duty Government Physicians'}
              </h2>
              <p className="section-subtitle">
                {lang === 'te' ? 'పరిశీలించబడిన మరియు అధికారికంగా కేటాయించబడిన నిపుణులు' : 'Verified clinical doctors available for sequential token OPD booking'}
              </p>
            </div>
            <Link to="/doctors" className="btn btn-primary btn-sm">
              {lang === 'te' ? 'అన్ని ప్రొఫైల్స్ చూడండి' : 'Full Doctor Directory'}
              <ArrowRight size={14} />
            </Link>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '20px' }}>
            {doctors.map((doc) => (
              <div key={doc.id} className="med-card" style={{ display: 'flex', flexDirection: 'column' }}>
                <div style={{ display: 'flex', gap: '14px', alignItems: 'flex-start', marginBottom: '14px' }}>
                  <span style={{ fontSize: '2.5rem' }}>{doc.emoji || '👨🏻‍⚕️'}</span>
                  <div>
                    <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--navy-900)', margin: 0 }}>
                      {lang === 'te' ? doc.nameTe : doc.nameEn}
                    </h3>
                    <p style={{ fontSize: '0.8rem', color: 'var(--blue-600)', fontWeight: 600, margin: '2px 0' }}>
                      {doc.qual}
                    </p>
                    <span className="status-pill status-verified" style={{ fontSize: '0.7rem' }}>
                      {doc.spec}
                    </span>
                  </div>
                </div>

                <div style={{ fontSize: '0.82rem', color: 'var(--slate-600)', margin: '10px 0', borderTop: '1px solid var(--slate-100)', paddingTop: '10px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px' }}>
                    <Building2 size={13} color="var(--slate-400)" />
                    <span>{doc.hospitalId}</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px' }}>
                    <Clock size={13} color="var(--slate-400)" />
                    <span>OPD: {doc.hours}</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Activity size={13} color="var(--slate-400)" />
                    <span>{doc.roomNo}</span>
                  </div>
                </div>

                <div style={{ marginTop: 'auto', paddingTop: '12px' }}>
                  <Link to={`/patient/book?doctor=${encodeURIComponent(doc.nameEn)}`} className="btn btn-primary btn-sm" style={{ width: '100%' }}>
                    <Calendar size={14} />
                    {lang === 'te' ? 'అపాయింట్‌మెంట్ బుక్ చేయండి' : 'Book Appointment'}
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};
