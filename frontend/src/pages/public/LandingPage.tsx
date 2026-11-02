import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { apiClient } from '../../api/client';
import { Hospital, Department, Doctor, PublicStats } from '../../types';
import { useLanguage } from '../../context/LanguageContext';
import { useAuth } from '../../context/AuthContext';
import { EmergencyModal } from '../../components/common/EmergencyModal';
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
  PhoneCall,
  Users,
  ChevronDown,
  Sparkles,
  HelpCircle,
  UserCheck,
  HeartPulse,
  Award,
  Zap,
  Lock,
  MapPin,
  AlertTriangle
} from 'lucide-react';

export const LandingPage: React.FC = () => {
  const {
    lang,
    t,
    localizeDoctor,
    localizeDept,
    localizeHospital,
    localizeQual,
    localizeRoom,
    localizeTime
  } = useLanguage();
  const { isAuthenticated, role } = useAuth();
  const navigate = useNavigate();

  // Data states
  const [stats, setStats] = useState<PublicStats | null>(null);
  const [hospitals, setHospitals] = useState<Hospital[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [showEmergencyModal, setShowEmergencyModal] = useState<boolean>(false);

  // Quick OPD Search state
  const [selectedHosp, setSelectedHosp] = useState<string>('all');
  const [selectedDept, setSelectedDept] = useState<string>('all');
  const [selectedDate, setSelectedDate] = useState<string>(() => {
    return new Date().toISOString().split('T')[0];
  });

  // FAQ Accordion open index
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0);

  useEffect(() => {
    async function loadLandingData() {
      try {
        const [statsRes, hospRes, deptRes, docRes] = await Promise.all([
          apiClient.get('/public/stats').catch(() => ({ data: null })),
          apiClient.get('/public/hospitals').catch(() => ({ data: [] })),
          apiClient.get('/public/departments').catch(() => ({ data: [] })),
          apiClient.get('/public/doctors').catch(() => ({ data: [] }))
        ]);

        if (statsRes.data) setStats(statsRes.data);
        if (hospRes.data) setHospitals(hospRes.data);
        if (deptRes.data) setDepartments(deptRes.data);
        if (docRes.data) setDoctors(docRes.data.slice(0, 6));
      } catch (err) {
        console.error('Error loading landing page data:', err);
      } finally {
        setLoading(false);
      }
    }
    loadLandingData();
  }, []);

  const handleQuickSearch = (e: React.FormEvent) => {
    e.preventDefault();
    navigate(`/doctors?hospitalId=${selectedHosp}&department=${selectedDept}&date=${selectedDate}`);
  };

  const getBookingLink = () => {
    if (isAuthenticated) {
      if (role === 'PATIENT') return '/patient/book';
      if (role === 'DOCTOR') return '/doctor/dashboard';
      if (role === 'ADMIN') return '/admin/dashboard';
    }
    return '/patient/register';
  };

  const toggleFaq = (index: number) => {
    setOpenFaqIndex(openFaqIndex === index ? null : index);
  };

  // FAQs bilingual data
  const faqs = [
    {
      qEn: "Is booking an OPD appointment on MediSlot completely free?",
      qTe: "మెడిస్లాట్‌లో ఓపీడీ అపాయింట్‌మెంట్ బుకింగ్ పూర్తిగా ఉచితమా?",
      aEn: "Yes, 100% free! Under the Government of Andhra Pradesh public health initiatives and Dr. YSR Aarogyasri / Ayushman Bharat, all OPD registrations, clinical doctor consultations, diagnostic tests, and prescribed generic medications in government hospitals are provided completely free of charge.",
      aTe: "అవును, నూరు శాతం ఉచితం! ఆంధ్రప్రదేశ్ ప్రభుత్వం మరియు డాక్టర్ వైఎస్సార్ ఆరోగ్యశ్రీ / ఆయుష్మాన్ భారత్ మార్గదర్శకాల ప్రకారం, ప్రభుత్వ ఆసుపత్రులలో అన్ని ఓపీడీ రిజిస్ట్రేషన్లు, నిపుణుల సంప్రదింపులు, వైద్య పరీక్షలు మరియు మందులు ప్రజలకు పూర్తిగా ఉచితంగా అందించబడతాయి."
    },
    {
      qEn: "How do I show my digital token when I reach the government hospital?",
      qTe: "ప్రభుత్వ ఆసుపత్రికి చేరుకున్నప్పుడు డిజిటల్ టోకెన్‌ను ఎలా చూపించాలి?",
      aEn: "Once you book an appointment, a digital OPD token slip with your unique reference ID and QR code is generated. You can show this slip directly on your mobile screen or take a printout at the hospital OPD verification desk to proceed straight to the doctor's consultation room without waiting in registration lines.",
      aTe: "స్లాట్ బుక్ చేయగానే క్యూఆర్ కోడ్ మరియు రిఫరెన్స్ ఐడీతో కూడిన డిజిటల్ టోకెన్ స్లిప్ లభిస్తుంది. ఆసుపత్రి ప్రవేశ డెస్క్ వద్ద మొబైల్ స్క్రీన్‌పై లేదా ప్రింటౌట్ రూపంలో చూపించి, టిక్కెట్ కౌంటర్ల వద్ద నిలబడకుండా నేరుగా డాక్టర్ సంప్రదింపుల గదికి వెళ్లవచ్చు."
    },
    {
      qEn: "Can I book an OPD token for family members (parents, children)?",
      qTe: "కుటుంబ సభ్యుల (తల్లిదండ్రులు, పిల్లలు) కోసం ఓపీడీ టోకెన్ బుక్ చేయవచ్చా?",
      aEn: "Yes. Registered patients can easily reserve OPD slots for their family members by specifying the patient's age, gender, and chief symptoms during the booking step. Each patient receives an individual sequential token slip.",
      aTe: "ఖచ్చితంగా బుక్ చేయవచ్చు. నమోదైన రోగి తన ఖాతా ద్వారా కుటుంబ సభ్యుల వయస్సు, లింగం మరియు ఆరోగ్య సమస్య వివరాలను నమోదు చేసి వారి పేరిట వ్యక్తిగత ఓపీడీ టోకెన్ స్లిప్ పొందవచ్చు."
    },
    {
      qEn: "What happens if I arrive late for my scheduled OPD slot?",
      qTe: "కేటాయించిన స్లాట్ సమయానికి ఆలస్యంగా చేరుకుంటే ఏమి జరుగుతుంది?",
      aEn: "Your token remains registered in the hospital's daily OPD session queue. If your token number has passed, the duty physician or nurse counter will re-call or place your token in the active queue once you arrive at the consultation room.",
      aTe: "మీ టోకెన్ ఆ రోజు ఓపీడీ సెషన్ ముగిసే వరకు చెల్లుబాటులో ఉంటుంది. మీ టోకెన్ నంబర్ దాటిపోతే, మీరు హాజరైనప్పుడు డ్యూటీ డాక్టర్ లేదా నర్సింగ్ డెస్క్ మిమ్మల్ని తదుపరి యాక్టివ్ క్యూలో సర్దుబాటు చేసి పరిశీలిస్తారు."
    },
    {
      qEn: "How are 24x7 emergencies and trauma cases handled?",
      qTe: "24x7 అత్యవసర మరియు ట్రౌమా కేసులు ఎలా నిర్వహించబడతాయి?",
      aEn: "Emergency casualties do not require any prior OPD booking. All government general and district hospitals operate 24x7 Emergency & Trauma Care departments with immediate triage admission. MediSlot provides direct 108 Ambulance and 104 health advice dispatch hotline integration.",
      aTe: "అత్యవసర మరియు ప్రమాద బాధితులకు ఎలాంటి ముందస్తు ఓపీడీ బుకింగ్ అవసరం లేదు. అన్ని ప్రభుత్వ మరియు జిల్లా ఆసుపత్రులు 24x7 ఎమర్జెన్సీ మరియు ట్రౌమా విభాగాలను నిర్వహిస్తాయి. తక్షణ సహాయం కోసం 108 అంబులెన్స్ మరియు 104 ఆరోగ్య సలహా హెల్ప్‌లైన్‌లు అందుబాటులో ఉన్నాయి."
    }
  ];

  return (
    <div className="landing-root">
      {/* =========================================================================
          HERO SECTION - High impact AP Govt Smart Healthcare
          ========================================================================= */}
      <section className="landing-hero-section">
        <div className="landing-hero-backdrop-glow" />
        <div className="landing-hero-container">
          {/* Left Column: Mission, Headings & Direct CTAs */}
          <div className="landing-hero-left">
            <div className="landing-hero-badge">
              <span className="live-pulse-ring" />
              <ShieldCheck size={16} color="#34d399" />
              <span>{t.bannerGov || 'Government of Andhra Pradesh · Health & Family Welfare'}</span>
            </div>

            <h1 className="landing-hero-title">
              {lang === 'te' ? (
                <>
                  నాణ్యమైన ఉచిత <span className="gradient-highlight">ప్రభుత్వ వైద్యం</span>,<br />
                  వేచి ఉండే శ్రమ లేకుండా!
                </>
              ) : (
                <>
                  Transforming <span className="gradient-highlight">Public Healthcare</span>,<br />
                  Zero Waiting Queue Hassle!
                </>
              )}
            </h1>

            <p className="landing-hero-subtitle">
              {lang === 'te'
                ? 'ఆంధ్రప్రదేశ్ ప్రభుత్వ ఆసుపత్రులలో అనుభవజ్ఞులైన నిపుణుల లభ్యతను తనిఖీ చేయండి, సెకన్లలో ఓపీడీ స్లాట్ బుక్ చేసుకోండి, లైవ్ డిజిటల్ టోకెన్ పొందండి. ఆరోగ్యశ్రీ & ఆయుష్మాన్ భారత్ ద్వారా 100% ఉచిత సేవలు.'
                : 'Check real-time specialist doctor rosters, book OPD consultation slots from home, and receive verified digital tokens. Eliminate long morning queues across West Godavari and AP referral hospitals.'}
            </p>

            {/* Hero Action Buttons */}
            <div className="landing-hero-ctas">
              <Link to={getBookingLink()} className="btn btn-primary btn-lg landing-cta-glow">
                <Calendar size={18} />
                {isAuthenticated
                  ? (role === 'PATIENT' ? (lang === 'te' ? 'ఓపీడీ స్లాట్ బుక్ చేయండి' : 'Book OPD Slot') : (lang === 'te' ? 'డ్యాష్‌బోర్డ్‌కు వెళ్ళండి' : 'Open Dashboard'))
                  : (lang === 'te' ? 'ఉచిత ఓపీడీ స్లాట్ బుక్ చేయండి' : 'Book Free OPD Appointment')}
                <ArrowRight size={16} />
              </Link>
              <Link to="/doctors" className="btn btn-outline btn-lg landing-cta-glass">
                <Search size={18} />
                {lang === 'te' ? 'వైద్యుల జాబితా' : 'Explore Doctors'}
              </Link>
              <Link to="/hospitals" className="btn btn-outline btn-lg landing-cta-glass">
                <BedDouble size={18} />
                {lang === 'te' ? 'పడకల లభ్యత' : 'Hospital Beds'}
              </Link>
            </div>

            {/* Trust Badges Bar */}
            <div className="landing-trust-grid">
              <div className="landing-trust-pill">
                <CheckCircle2 size={15} color="#34d399" />
                <span>{lang === 'te' ? '100% ఉచిత సంప్రదింపులు' : '100% Free Consultations'}</span>
              </div>
              <div className="landing-trust-pill">
                <CheckCircle2 size={15} color="#34d399" />
                <span>{lang === 'te' ? 'నిజ-సమయ డిజిటల్ టోకెన్' : 'Live Sequential Digital Token'}</span>
              </div>
              <div className="landing-trust-pill">
                <CheckCircle2 size={15} color="#34d399" />
                <span>{lang === 'te' ? 'ఆరోగ్యశ్రీ & ఆభా అనుసంధానం' : 'Aarogyasri & ABHA Integrated'}</span>
              </div>
              <div className="landing-trust-pill">
                <CheckCircle2 size={15} color="#34d399" />
                <span>{lang === 'te' ? '24x7 ఎమర్జెన్సీ ట్రౌమా కేర్' : '24x7 Emergency Hotline'}</span>
              </div>
            </div>
          </div>

          {/* Right Column: 3D Visual & Interactive Real-Time Queue Telemetry Showcase */}
          <div className="landing-hero-right">
            <div className="landing-visual-card">
              <img
                src="/medislot-hero.jpg"
                alt="MediSlot Smart Hospital OPD Queue System"
                className="landing-visual-image"
                loading="eager"
              />

              {/* Floating Live Telemetry Overlay Card 1: Calling Token */}
              <div className="floating-telemetry-badge badge-top-right">
                <div className="telemetry-icon-pulse">
                  <Activity size={18} color="#0875e8" />
                </div>
                <div>
                  <div className="telemetry-status-tag">
                    <span className="pulse-dot" />
                    {lang === 'te' ? 'ప్రస్తుత ఓపీడీ టోకెన్' : 'NOW CALLING OPD'}
                  </div>
                  <div className="telemetry-value">#A-105</div>
                  <div className="telemetry-sub">Dr. A. Sharma · Room 12</div>
                </div>
              </div>

              {/* Floating Live Telemetry Overlay Card 2: Wait Time Saved */}
              <div className="floating-telemetry-badge badge-bottom-left">
                <div className="telemetry-icon-emerald">
                  <Zap size={18} color="#10b981" />
                </div>
                <div>
                  <div className="telemetry-value" style={{ color: '#065f38' }}>85% Faster</div>
                  <div className="telemetry-sub">{lang === 'te' ? 'క్యూలో నిలబడకుండా నేరుగా ప్రవేశం' : 'Zero 4 AM counter queue'}</div>
                </div>
              </div>

              {/* Floating Live Telemetry Overlay Card 3: Free Healthcare */}
              <div className="floating-telemetry-badge badge-bottom-right">
                <div className="telemetry-icon-cyan">
                  <HeartPulse size={18} color="#0284c7" />
                </div>
                <div>
                  <div className="telemetry-value" style={{ fontSize: '0.86rem' }}>Dr. YSR Aarogyasri</div>
                  <div className="telemetry-sub">{lang === 'te' ? 'ఉచిత పరీక్షలు & మందులు' : '100% Free Govt Care'}</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================================
          INTERACTIVE OPD AVAILABILITY SEARCH WIDGET
          ========================================================================= */}
      <section className="landing-search-widget-section">
        <div className="landing-search-card">
          <div className="landing-search-header">
            <div className="landing-search-title-wrap">
              <div className="landing-search-icon">
                <Search size={22} color="#0875e8" />
              </div>
              <div>
                <h3 className="landing-search-title">
                  {lang === 'te' ? 'ఓపీడీ స్లాట్ లభ్యత శోధన' : 'Instant OPD Slot & Doctor Availability Check'}
                </h3>
                <p className="landing-search-subtitle">
                  {lang === 'te'
                    ? 'ఆసుపత్రి మరియు విభాగాన్ని ఎంచుకుని నేటి ఓపీడీ వేళలు మరియు ఖాళీ స్లాట్లను తనిఖీ చేయండి'
                    : 'Select hospital, clinical department, and date to check open government consultation slots'}
                </p>
              </div>
            </div>
            <div className="landing-search-badge">
              <span className="pulse-dot" />
              {lang === 'te' ? 'లైవ్ అప్‌డేట్' : 'Real-time Sync'}
            </div>
          </div>

          <form onSubmit={handleQuickSearch} className="landing-search-form">
            <div className="landing-form-field">
              <label className="form-label">
                <Building2 size={14} color="var(--blue-600)" />
                {t.lblHospital || 'Hospital Facility'}
              </label>
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

            <div className="landing-form-field">
              <label className="form-label">
                <Stethoscope size={14} color="var(--blue-600)" />
                {t.lblDept || 'Clinical Department'}
              </label>
              <select
                className="form-select"
                value={selectedDept}
                onChange={(e) => setSelectedDept(e.target.value)}
              >
                <option value="all">{t.allDepts || 'All Clinical Specialties'}</option>
                {departments.map((d) => (
                  <option key={d.key} value={d.key}>
                    {d.icon} {lang === 'te' ? d.nameTe : d.nameEn}
                  </option>
                ))}
              </select>
            </div>

            <div className="landing-form-field">
              <label className="form-label">
                <Calendar size={14} color="var(--blue-600)" />
                {t.lblDate || 'Consultation Date'}
              </label>
              <input
                type="date"
                className="form-input"
                min={new Date().toISOString().split('T')[0]}
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
              />
            </div>

            <div className="landing-form-submit-wrap">
              <button type="submit" className="btn btn-primary landing-search-btn">
                <Search size={16} />
                {lang === 'te' ? 'లభ్యతను శోధించండి' : 'Check Availability'}
              </button>
            </div>
          </form>
        </div>
      </section>

      {/* =========================================================================
          LIVE TELEMETRY STATS & EMERGENCY HOTLINES STRIP
          ========================================================================= */}
      <section className="landing-telemetry-strip">
        <div className="landing-container">
          <div className="landing-stats-grid">
            <div className="landing-stat-card">
              <div className="landing-stat-icon-wrap icon-blue">
                <Building2 size={24} />
              </div>
              <div className="landing-stat-content">
                <div className="landing-stat-number">{stats?.totalHospitals || 4}</div>
                <div className="landing-stat-label">{t.statHospitals || 'Govt Hospitals'}</div>
                <div className="landing-stat-note">{lang === 'te' ? 'పశ్చిమ గోదావరి & ఏపీ' : 'West Godavari & AP'}</div>
              </div>
            </div>

            <div className="landing-stat-card">
              <div className="landing-stat-icon-wrap icon-emerald">
                <Stethoscope size={24} />
              </div>
              <div className="landing-stat-content">
                <div className="landing-stat-number">{stats?.activeDoctors || 15}+</div>
                <div className="landing-stat-label">{t.statDoctors || 'Active Specialists'}</div>
                <div className="landing-stat-note">{lang === 'te' ? '9 క్లినికల్ విభాగాలు' : '9 Clinical Specialties'}</div>
              </div>
            </div>

            <div className="landing-stat-card">
              <div className="landing-stat-icon-wrap icon-amber">
                <BedDouble size={24} />
              </div>
              <div className="landing-stat-content">
                <div className="landing-stat-number">{stats?.availableBeds || 397}</div>
                <div className="landing-stat-label">{t.statBeds || 'Available Beds'}</div>
                <div className="landing-stat-note">{lang === 'te' ? 'సాధారణ, ఆక్సిజన్ & ఐసీయూ' : 'General, Oxygen & ICU'}</div>
              </div>
            </div>

            <div className="landing-stat-card">
              <div className="landing-stat-icon-wrap icon-purple">
                <Activity size={24} />
              </div>
              <div className="landing-stat-content">
                <div className="landing-stat-number">{stats?.todayBookings || 128}+</div>
                <div className="landing-stat-label">{t.statBookings || 'Today\'s OPD Tokens'}</div>
                <div className="landing-stat-note">{lang === 'te' ? 'డిజిటల్ క్యూ నిర్వహణ' : 'Sequential Digital Queue'}</div>
              </div>
            </div>
          </div>

          {/* Emergency Hotline Bar */}
          <div className="landing-emergency-bar">
            <div className="emergency-bar-left">
              <PhoneCall size={20} className="emergency-icon-bounce" />
              <div>
                <strong>{lang === 'te' ? '24x7 ప్రభుత్వ అత్యవసర హెల్ప్‌లైన్‌లు:' : '24x7 Andhra Pradesh Emergency Response:'}</strong>
                <span> {lang === 'te' ? 'ఏ సమయంలోనైనా ఉచిత వైద్య సహాయం మరియు అంబులెన్స్ సేవలు' : 'Immediate toll-free medical dispatch and emergency transit'}</span>
              </div>
            </div>
            <div className="emergency-bar-pills">
              <button
                type="button"
                onClick={() => setShowEmergencyModal(true)}
                className="emergency-pill red-pill"
                style={{ cursor: 'pointer', border: '1px solid rgba(239, 68, 68, 0.4)' }}
              >
                🚨 <strong>{lang === 'te' ? 'అత్యవసర డైరెక్టరీ' : 'Emergency Directory'}</strong>
              </button>
              <a href="tel:108" className="emergency-pill red-pill">
                🚑 <strong>108</strong> (Ambulance)
              </a>
              <a href="tel:104" className="emergency-pill blue-pill">
                🩺 <strong>104</strong> (Health Advice)
              </a>
              <a href="tel:102" className="emergency-pill green-pill">
                👶 <strong>102</strong> (Mother & Child)
              </a>
              <a href="tel:112" className="emergency-pill purple-pill">
                🚨 <strong>112</strong> (National)
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================================
          HOW MEDISLOT WORKS - 4-Step Visual Journey
          ========================================================================= */}
      <section id="how-it-works" className="landing-section bg-white">
        <div className="landing-container">
          <div className="section-center-header">
            <span className="section-pill">
              <Sparkles size={13} />
              {lang === 'te' ? 'సులభమైన ప్రక్రియ' : 'Step-by-Step Guide'}
            </span>
            <h2 className="section-title-large">
              {t.howItWorksTitle || 'How MediSlot Works'}
            </h2>
            <p className="section-subtitle-large">
              {t.howItWorksSub || 'Four seamless steps from home booking to hassle-free specialist consultation'}
            </p>
          </div>

          <div className="how-it-works-grid">
            <div className="how-step-card">
              <div className="how-step-number">01</div>
              <div className="how-step-icon">
                <Search size={26} color="#0875e8" />
              </div>
              <h3 className="how-step-title">{t.step1Title || 'Select Hospital & Doctor'}</h3>
              <p className="how-step-desc">
                {t.step1Desc || 'Browse verified doctors across 9 clinical specialties in West Godavari & AP government hospitals.'}
              </p>
              <div className="how-step-badge">
                <CheckCircle2 size={13} color="#10b981" />
                <span>{lang === 'te' ? 'పూర్తిగా ఉచితం' : 'Zero Cost'}</span>
              </div>
            </div>

            <div className="how-step-card">
              <div className="how-step-number">02</div>
              <div className="how-step-icon">
                <Calendar size={26} color="#0875e8" />
              </div>
              <h3 className="how-step-title">{t.step2Title || 'Reserve OPD Time Slot'}</h3>
              <p className="how-step-desc">
                {t.step2Desc || 'Pick your preferred consultation slot online and receive an instant digital QR token slip.'}
              </p>
              <div className="how-step-badge">
                <CheckCircle2 size={13} color="#10b981" />
                <span>{lang === 'te' ? 'తక్షణ డిజిటల్ స్లిప్' : 'Instant QR Slip'}</span>
              </div>
            </div>

            <div className="how-step-card">
              <div className="how-step-number">03</div>
              <div className="how-step-icon">
                <Users size={26} color="#0875e8" />
              </div>
              <h3 className="how-step-title">{t.step3Title || 'Skip Morning Queue Lines'}</h3>
              <p className="how-step-desc">
                {t.step3Desc || 'Arrive 15 mins prior to your slot. No 4 AM counter lines—your sequential token is displayed on live monitors.'}
              </p>
              <div className="how-step-badge">
                <CheckCircle2 size={13} color="#10b981" />
                <span>{lang === 'te' ? '85% వేచి ఉండే సమయం ఆదా' : 'Skip 4 AM Lines'}</span>
              </div>
            </div>

            <div className="how-step-card">
              <div className="how-step-number">04</div>
              <div className="how-step-icon">
                <HeartPulse size={26} color="#0875e8" />
              </div>
              <h3 className="how-step-title">{t.step4Title || 'Free Care & Medicines'}</h3>
              <p className="how-step-desc">
                {t.step4Desc || 'Consult specialist physician, complete free diagnostic tests, and receive generic medicines under Aarogyasri.'}
              </p>
              <div className="how-step-badge">
                <CheckCircle2 size={13} color="#10b981" />
                <span>{lang === 'te' ? 'ఆరోగ్యశ్రీ సేవలు' : 'Dr. YSR Aarogyasri'}</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================================
          SPECIALIZED CLINICAL DEPARTMENTS
          ========================================================================= */}
      <section className="landing-section bg-slate">
        <div className="landing-container">
          <div className="section-header-split">
            <div>
              <span className="section-pill">
                <Stethoscope size={13} />
                {lang === 'te' ? 'క్లినికల్ విభాగాలు' : 'Comprehensive Specialties'}
              </span>
              <h2 className="section-title-large">
                {t.popularDepts || 'Specialized Clinical Departments'}
              </h2>
              <p className="section-subtitle-large">
                {t.popularDeptsDesc || 'Comprehensive OPD care provided across West Godavari and referral institutions'}
              </p>
            </div>
            <Link to="/doctors" className="btn btn-outline btn-md">
              {t.viewAllDepts || 'View All Specialists'}
              <ArrowRight size={15} />
            </Link>
          </div>

          {/* Department Cards Grid */}
          <div className="department-cards-grid">
            {departments.slice(0, 8).map((dept) => (
              <div key={dept.key} className="dept-showcase-card">
                <div className="dept-icon-circle">{dept.icon}</div>
                <h3 className="dept-card-title">
                  {lang === 'te' ? dept.nameTe : dept.nameEn}
                </h3>
                <p className="dept-card-desc">
                  {lang === 'te' ? dept.descriptionTe : dept.descriptionEn}
                </p>
                <div className="dept-card-footer">
                  <span className="dept-status-badge">
                    <span className="pulse-dot" />
                    {lang === 'te' ? 'ఓపీడీ తెరిచి ఉంది' : 'OPD Active'}
                  </span>
                  <Link
                    to={`/doctors?department=${encodeURIComponent(dept.key)}`}
                    className="dept-link"
                  >
                    {lang === 'te' ? 'వైద్యులను చూడండి' : 'Consult'} →
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* =========================================================================
          ACTIVE DUTY GOVERNMENT PHYSICIANS (VERIFIED DOCTORS ROSTER)
          ========================================================================= */}
      <section className="landing-section bg-white">
        <div className="landing-container">
          <div className="section-header-split">
            <div>
              <span className="section-pill">
                <UserCheck size={13} />
                {lang === 'te' ? 'ప్రభుత్వ వైద్యులు' : 'Verified Specialists'}
              </span>
              <h2 className="section-title-large">
                {lang === 'te' ? 'అందుబాటులో ఉన్న ప్రభుత్వ వైద్యులు' : 'Active Duty Government Physicians'}
              </h2>
              <p className="section-subtitle-large">
                {lang === 'te'
                  ? 'ఆంధ్రప్రదేశ్ ప్రభుత్వ ఆసుపత్రులలో ధృవీకరించబడిన నిపుణులు, తక్షణ ఓపీడీ స్లాట్ రిజర్వేషన్'
                  : 'Verified clinical specialists across West Godavari and AP government referral hospitals'}
              </p>
            </div>
            <Link to="/doctors" className="btn btn-outline btn-md">
              {lang === 'te' ? 'పూర్తి వైద్యుల డైరెక్టరీ' : 'Full Doctor Directory'}
              <ArrowRight size={15} />
            </Link>
          </div>

          <div className="doctor-cards-modern-grid">
            {doctors.map((doc) => (
              <div key={doc.id} className="doctor-card-modern">
                <div className="doctor-card-top">
                  <div className="doctor-avatar-circle">{doc.emoji || '👨🏻‍⚕️'}</div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <h3 className="doctor-name-modern">
                      {localizeDoctor(doc.nameEn, doc.nameTe)}
                    </h3>
                    <div className="doctor-qual-tag">
                      {localizeQual(doc.qual)}
                    </div>
                    <div className="doctor-pill-row">
                      <span className="status-pill status-verified" style={{ fontSize: '0.72rem' }}>
                        {localizeDept(doc.spec)}
                      </span>
                      {doc.experienceYrs && (
                        <span className="status-pill status-completed" style={{ fontSize: '0.72rem' }}>
                          {doc.experienceYrs} {t.expYears || (lang === 'te' ? 'సం. అనుభవం' : 'yrs exp')}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="doctor-info-box">
                  <div className="doctor-info-row">
                    <Building2 size={14} color="var(--blue-600)" />
                    <span>{localizeHospital(doc.hospitalId)}</span>
                  </div>
                  <div className="doctor-info-row">
                    <Clock size={14} color="var(--emerald-600)" />
                    <span>{t.opdHours || 'OPD Hours'}: {localizeTime(doc.hours)}</span>
                  </div>
                  <div className="doctor-info-row">
                    <Activity size={14} color="var(--purple-600)" />
                    <span>{localizeRoom(doc.roomNo)}</span>
                  </div>
                </div>

                <div style={{ marginTop: 'auto' }}>
                  <Link
                    to={`/patient/book?doctor=${encodeURIComponent(doc.nameEn)}`}
                    className="btn btn-primary btn-sm"
                    style={{ width: '100%', justifyContent: 'center' }}
                  >
                    <Calendar size={14} />
                    {lang === 'te' ? 'ఓపీడీ స్లాట్ బుక్ చేయండి' : 'Book OPD Appointment'}
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* =========================================================================
          LIVE HOSPITAL NETWORK & BED AVAILABILITY
          ========================================================================= */}
      <section className="landing-section bg-slate">
        <div className="landing-container">
          <div className="section-header-split">
            <div>
              <span className="section-pill">
                <Building2 size={13} />
                {lang === 'te' ? 'ఆసుపత్రుల నెట్‌వర్క్' : 'Hospital Network'}
              </span>
              <h2 className="section-title-large">
                {t.hospitalsTitle || 'AP Government Hospitals & Bed Tracker'}
              </h2>
              <p className="section-subtitle-large">
                {t.hospitalsSubtitle || 'Real-time hospital bed status, ICU capacity, oxygen beds, and emergency care facilities'}
              </p>
            </div>
            <Link to="/hospitals" className="btn btn-primary btn-md">
              {lang === 'te' ? 'పూర్తి పడకల ట్రాకర్' : 'Full Live Bed Tracker'}
              <ArrowRight size={15} />
            </Link>
          </div>

          <div className="hospital-cards-grid">
            {hospitals.map((hosp) => (
              <div key={hosp.id} className="hospital-card-modern">
                <div className="hosp-card-head">
                  <div>
                    <h3 className="hosp-name">{lang === 'te' ? hosp.nameTe : hosp.nameEn}</h3>
                    <div className="hosp-location">
                      <MapPin size={13} />
                      <span>{lang === 'te' ? hosp.addressTe : hosp.addressEn} · {lang === 'te' ? hosp.districtTe : hosp.districtEn}</span>
                    </div>
                  </div>
                  <span className="status-pill status-verified" style={{ fontSize: '0.74rem' }}>
                    {lang === 'te' ? hosp.typeTe : hosp.typeEn}
                  </span>
                </div>

                <div className="hosp-bed-metrics">
                  <div className="hosp-bed-metric">
                    <span className="bed-metric-lbl">{lang === 'te' ? 'లభ్యమయ్యే పడకలు' : 'Available Beds'}</span>
                    <strong className="bed-metric-val">{hosp.availableBeds}</strong>
                  </div>
                  <div className="hosp-bed-metric">
                    <span className="bed-metric-lbl">{lang === 'te' ? 'ఐసీయూ పడకలు' : 'ICU Beds'}</span>
                    <strong className="bed-metric-val" style={{ color: '#0875e8' }}>{hosp.icuBedsAvailable}</strong>
                  </div>
                  <div className="hosp-bed-metric">
                    <span className="bed-metric-lbl">{lang === 'te' ? 'ఆక్సిజన్ పడకలు' : 'Oxygen Beds'}</span>
                    <strong className="bed-metric-val" style={{ color: '#10b981' }}>{hosp.oxygenBedsAvailable}</strong>
                  </div>
                </div>

                <div className="hosp-card-actions">
                  <div className="hosp-hours">
                    <Clock size={13} />
                    <span>{lang === 'te' ? hosp.opdTimingsTe : hosp.opdTimingsEn}</span>
                  </div>
                  <Link
                    to={`/doctors?hospitalId=${encodeURIComponent(hosp.id)}`}
                    className="btn btn-outline btn-sm"
                  >
                    {lang === 'te' ? 'ఓపీడీ బుక్ చేయండి' : 'Book at Hospital'}
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* =========================================================================
          THREE DEDICATED STAKEHOLDER PORTALS (ROLE GATEWAYS)
          ========================================================================= */}
      <section className="landing-section bg-gradient-navy">
        <div className="landing-container">
          <div className="section-center-header text-white">
            <span className="section-pill-glass">
              <Lock size={13} />
              {lang === 'te' ? 'సురక్షిత పాత్ర-ఆధారిత ప్రవేశం' : 'Role-Based Ecosystem'}
            </span>
            <h2 className="section-title-large text-white">
              {t.roleGatewaysTitle || 'Dedicated Stakeholder Portals'}
            </h2>
            <p className="section-subtitle-large text-blue-100">
              {t.roleGatewaysSub || 'Tailored workspaces designed for citizens, active physicians, and hospital administrators'}
            </p>
          </div>

          <div className="role-portals-grid">
            {/* 1. Patient Portal */}
            <div className="role-portal-card border-blue">
              <div className="role-icon-wrap bg-blue-100 text-blue-600">
                <Users size={28} />
              </div>
              <h3 className="role-portal-title">{t.forPatientsTitle || 'Citizens & Patients'}</h3>
              <p className="role-portal-desc">
                {t.forPatientsDesc || 'Book OPD appointments from home, track live token position, and download digital slips.'}
              </p>
              <ul className="role-features-list">
                <li><CheckCircle2 size={15} color="#0875e8" /> {lang === 'te' ? 'ఆన్‌లైన్ స్లాట్ రిజర్వేషన్' : 'Online OPD Token Reservation'}</li>
                <li><CheckCircle2 size={15} color="#0875e8" /> {lang === 'te' ? 'క్యూఆర్ కోడ్‌తో డిజిటల్ స్లిప్' : 'Digital QR Token Slips'}</li>
                <li><CheckCircle2 size={15} color="#0875e8" /> {lang === 'te' ? 'ఆరోగ్యశ్రీ / ఆభా ఐడీ అనుసంధానం' : 'ABHA Health Profile Management'}</li>
                <li><CheckCircle2 size={15} color="#0875e8" /> {lang === 'te' ? 'పౌర సమస్యలు & స్పందన ఫిర్యాదులు' : 'Citizen Grievance Redressal'}</li>
              </ul>
              <div className="role-portal-cta">
                <Link to="/patient/register" className="btn btn-primary" style={{ width: '100%' }}>
                  <UserCheck size={16} />
                  {lang === 'te' ? 'రోగిగా రిజిస్టర్ అవ్వండి' : 'Register as Patient'}
                </Link>
                <Link to="/login" className="btn btn-outline" style={{ width: '100%', marginTop: '8px' }}>
                  {lang === 'te' ? 'రోగి లాగిన్' : 'Citizen Sign In'}
                </Link>
              </div>
            </div>

            {/* 2. Doctor Portal */}
            <div className="role-portal-card border-emerald">
              <div className="role-icon-wrap bg-emerald-100 text-emerald-600">
                <Stethoscope size={28} />
              </div>
              <h3 className="role-portal-title">{t.forDoctorsTitle || 'Government Physicians'}</h3>
              <p className="role-portal-desc">
                {t.forDoctorsDesc || 'Real-time consultation queue board, 1-click token call chime, and duty shift management.'}
              </p>
              <ul className="role-features-list">
                <li><CheckCircle2 size={15} color="#10b981" /> {lang === 'te' ? 'లైవ్ ఓపీడీ రోగుల క్యూ బోర్డ్' : 'Interactive Patient Queue Board'}</li>
                <li><CheckCircle2 size={15} color="#10b981" /> {lang === 'te' ? 'ఒకే క్లిక్‌తో తదుపరి రోగి పిలుపు' : '1-Click Audio-Visual Token Call'}</li>
                <li><CheckCircle2 size={15} color="#10b981" /> {lang === 'te' ? 'కౌంటర్ వాక్-ఇన్ టోకెన్ జారీ' : 'Instant Counter Walk-in Tokens'}</li>
                <li><CheckCircle2 size={15} color="#10b981" /> {lang === 'te' ? 'డ్యూటీ రోస్టర్ & స్లాట్ నిర్వహణ' : 'Shift Schedule & Leave Toggles'}</li>
              </ul>
              <div className="role-portal-cta">
                <Link to="/login" className="btn btn-success" style={{ width: '100%' }}>
                  <Stethoscope size={16} />
                  {lang === 'te' ? 'డాక్టర్ పోర్టల్ లాగిన్' : 'Doctor OPD Login'}
                </Link>
                <Link to="/doctor/register" className="btn btn-outline" style={{ width: '100%', marginTop: '8px' }}>
                  {lang === 'te' ? 'కొత్త వైద్యుల దరఖాస్తు' : 'Apply as Govt Doctor'}
                </Link>
              </div>
            </div>

            {/* 3. Hospital Admin Portal */}
            <div className="role-portal-card border-purple">
              <div className="role-icon-wrap bg-purple-100 text-purple-600">
                <ShieldCheck size={28} />
              </div>
              <h3 className="role-portal-title">{t.forAdminsTitle || 'Hospital Administrators'}</h3>
              <p className="role-portal-desc">
                {t.forAdminsDesc || 'Real-time bed tracker audits, doctor credential approvals, and citizen grievance resolution.'}
              </p>
              <ul className="role-features-list">
                <li><CheckCircle2 size={15} color="#8b5cf6" /> {lang === 'te' ? 'డాక్టర్ లైసెన్స్ పరిశీలన & ఆమోదం' : 'Doctor Credential Verification'}</li>
                <li><CheckCircle2 size={15} color="#8b5cf6" /> {lang === 'te' ? 'నిజ-సమయ ఓపీడీ ఫుట్‌ఫాల్ విశ్లేషణ' : 'Real-time OPD Footfall Analytics'}</li>
                <li><CheckCircle2 size={15} color="#8b5cf6" /> {lang === 'te' ? 'పడకల లభ్యత & ఆక్సిజన్ పర్యవేక్షణ' : 'Live Bed & ICU Occupancy Control'}</li>
                <li><CheckCircle2 size={15} color="#8b5cf6" /> {lang === 'te' ? 'జిల్లా అధికారి (డీఎంహెచ్‌ఓ) లాగ్స్' : 'DMHO Grievance Redressal Audit'}</li>
              </ul>
              <div className="role-portal-cta">
                <Link to="/control-center/login" className="btn btn-primary" style={{ width: '100%', background: 'linear-gradient(135deg, #4338ca 0%, #312e81 100%)' }}>
                  <Lock size={16} />
                  {lang === 'te' ? 'అడ్మిన్ కంట్రోల్ సెంటర్' : 'Admin Control Center'}
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================================
          WHY MEDISLOT - HEALTHCARE INNOVATIONS
          ========================================================================= */}
      <section className="landing-section bg-slate">
        <div className="landing-container">
          <div className="section-center-header">
            <span className="section-pill">
              <Award size={13} />
              {lang === 'te' ? 'డిజిటల్ పరిపాలన' : 'Public Health Innovations'}
            </span>
            <h2 className="section-title-large">
              {t.whyMediSlotTitle || 'Why MediSlot?'}
            </h2>
            <p className="section-subtitle-large">
              {t.whyMediSlotSub || 'Pioneering smart digital healthcare delivery across Andhra Pradesh public hospitals'}
            </p>
          </div>

          <div className="innovations-grid">
            <div className="innovation-card">
              <div className="inno-icon-box">⚡</div>
              <h3 className="inno-title">{t.whyFeature1Title || '85% Less Waiting Time'}</h3>
              <p className="inno-desc">
                {t.whyFeature1Desc || 'Eliminates pre-dawn queues outside hospital registration counters with fast-track digital slots.'}
              </p>
            </div>

            <div className="innovation-card">
              <div className="inno-icon-box">📺</div>
              <h3 className="inno-title">{t.whyFeature2Title || 'Live Digital Queue Board'}</h3>
              <p className="inno-desc">
                {t.whyFeature2Desc || 'Know exactly which token is inside the doctor room in real-time, displayed on waiting area monitors.'}
              </p>
            </div>

            <div className="innovation-card">
              <div className="inno-icon-box">🛡️</div>
              <h3 className="inno-title">{t.whyFeature3Title || 'Aarogyasri & ABHA Linked'}</h3>
              <p className="inno-desc">
                {t.whyFeature3Desc || 'Seamless health history integration under government healthcare schemes for comprehensive continuum of care.'}
              </p>
            </div>

            <div className="innovation-card">
              <div className="inno-icon-box">⚖️</div>
              <h3 className="inno-title">{t.whyFeature4Title || 'Fair Sequential Queues'}</h3>
              <p className="inno-desc">
                {t.whyFeature4Desc || 'Tamper-proof chronological calling ensures equitable patient access with zero queue jumping.'}
              </p>
            </div>

            <div className="innovation-card">
              <div className="inno-icon-box">🌐</div>
              <h3 className="inno-title">{t.whyFeature5Title || 'Bilingual Experience'}</h3>
              <p className="inno-desc">
                {t.whyFeature5Desc || 'Full accessibility in both Telugu (తెలుగు) and English designed with care for every citizen.'}
              </p>
            </div>

            <div className="innovation-card">
              <div className="inno-icon-box">📢</div>
              <h3 className="inno-title">{t.whyFeature6Title || 'Direct DMHO Oversight'}</h3>
              <p className="inno-desc">
                {t.whyFeature6Desc || 'Official citizen feedback routed directly to District Medical Officers for accountability and rapid action.'}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================================
          CITIZEN TESTIMONIALS & COMMUNITY IMPACT
          ========================================================================= */}
      <section className="landing-section bg-white">
        <div className="landing-container">
          <div className="section-center-header">
            <span className="section-pill">
              <HeartPulse size={13} />
              {lang === 'te' ? 'పౌరుల అనుభవాలు' : 'Citizen Stories'}
            </span>
            <h2 className="section-title-large">
              {lang === 'te' ? 'ప్రజల అనుభవాలు & స్పందన' : 'Real Impact Across Andhra Pradesh'}
            </h2>
            <p className="section-subtitle-large">
              {lang === 'te'
                ? 'మెడిస్లాట్ ద్వారా ఆసుపత్రి వేచి ఉండే సమయాన్ని ఆదా చేసుకున్న పౌరుల మాటల్లో'
                : 'See how digital OPD queue tokens are restoring dignity and convenience to public healthcare'}
            </p>
          </div>

          <div className="testimonials-grid">
            <div className="testimonial-card">
              <div className="testi-stars">★★★★★</div>
              <p className="testi-quote">
                {lang === 'te'
                  ? '"గతంలో భీమవరం ప్రభుత్వ ఆసుపత్రిలో ఓపీడీ టోకెన్ కోసం ఉదయం 5 గంటలకే వెళ్ళి నిలబడేవాళ్ళం. ఇప్పుడు ఇంట్లో కూర్చుని మొబైల్‌లో స్లాట్ బుక్ చేసుకుని డాక్టర్ గది వద్దకు నేరుగా వెళ్తున్నాము. చాలా అద్భుతమైన సదుపాయం!"'
                  : '"Earlier we had to queue up at 5 AM at Bhimavaram District Hospital just for an OPD slip. Now I booked my cardiology slot from home and walked straight to Room 12 at 10 AM. True digital governance!"'}
              </p>
              <div className="testi-author">
                <div className="testi-avatar">SR</div>
                <div>
                  <strong>{lang === 'te' ? 'ఎస్. రాధాకృష్ణ' : 'S. Radhakrishna'}</strong>
                  <div className="testi-location">📍 Bhimavaram, West Godavari</div>
                </div>
              </div>
            </div>

            <div className="testimonial-card">
              <div className="testi-stars">★★★★★</div>
              <p className="testi-quote">
                {lang === 'te'
                  ? '"నా చిన్న పాపకి పీడియాట్రిక్స్ సంప్రదింపుల కోసం స్లాట్ బుక్ చేశాను. లైవ్ స్క్రీన్‌పై టోకెన్ నంబర్ చూసుకుని వెళ్ళడం వల్ల పాపతో రద్దీలో వేచి ఉండే అవసరం తప్పింది. డాక్టర్ గారు చాలా చక్కగా పరీక్షించారు."'
                  : '"Booked a pediatric consultation for my 4-year-old daughter. The live OPD board outside the room made it so effortless, saving my child from hours of waiting in crowded hallways."'}
              </p>
              <div className="testi-author">
                <div className="testi-avatar">LV</div>
                <div>
                  <strong>{lang === 'te' ? 'లక్ష్మి విజయ' : 'Lakshmi Vijaya'}</strong>
                  <div className="testi-location">📍 Palakollu, West Godavari</div>
                </div>
              </div>
            </div>

            <div className="testimonial-card">
              <div className="testi-stars">★★★★★</div>
              <p className="testi-quote">
                {lang === 'te'
                  ? '"ఏలూరు జీజీహెచ్‌లో ఆర్థోపెడిక్ డాక్టర్ గారిని సంప్రదించడానికి మెడిస్లాట్ చాలా ఉపయోగపడింది. టోకెన్ స్లిప్‌పై క్యూఆర్ కోడ్ చూపించగానే తక్షణమే రికార్డు వెరిఫై అయింది. ఉచిత మందులు కూడా అందాయి."'
                  : '"Consulted Orthopedics at GGH Eluru. Showing the digital token QR code on my phone was all that was needed. Consulted the specialist and collected free medicines in under an hour."'}
              </p>
              <div className="testi-author">
                <div className="testi-avatar">KV</div>
                <div>
                  <strong>{lang === 'te' ? 'కె. వెంకటేశ్వరరావు' : 'K. Venkateswara Rao'}</strong>
                  <div className="testi-location">📍 Eluru, Andhra Pradesh</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================================
          INTERACTIVE FAQ ACCORDION SECTION
          ========================================================================= */}
      <section className="landing-section bg-slate">
        <div className="landing-container" style={{ maxWidth: '900px' }}>
          <div className="section-center-header">
            <span className="section-pill">
              <HelpCircle size={13} />
              {lang === 'te' ? 'సందేహాలు & సమాధానాలు' : 'Questions Answered'}
            </span>
            <h2 className="section-title-large">
              {t.faqSectionTitle || 'Frequently Asked Questions'}
            </h2>
            <p className="section-subtitle-large">
              {t.faqSectionSub || 'Clear answers on government OPD tokens, hospital beds, and consultation procedures'}
            </p>
          </div>

          <div className="faq-accordion-wrap">
            {faqs.map((faq, idx) => {
              const isOpen = openFaqIndex === idx;
              return (
                <div key={idx} className={`faq-card-modern ${isOpen ? 'active' : ''}`}>
                  <button
                    className="faq-question-btn"
                    onClick={() => toggleFaq(idx)}
                    aria-expanded={isOpen}
                  >
                    <span className="faq-q-text">
                      {lang === 'te' ? faq.qTe : faq.qEn}
                    </span>
                    <ChevronDown
                      size={18}
                      className={`faq-icon-arrow ${isOpen ? 'rotate-180' : ''}`}
                    />
                  </button>
                  {isOpen && (
                    <div className="faq-answer-body">
                      <p>{lang === 'te' ? faq.aTe : faq.aEn}</p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* =========================================================================
          CONVERSION CTA BANNER
          ========================================================================= */}
      <section className="landing-cta-banner-section">
        <div className="landing-container">
          <div className="cta-banner-card">
            <div className="cta-banner-content">
              <span className="cta-banner-tag">
                <Sparkles size={14} />
                {lang === 'te' ? 'ఆంధ్రప్రదేశ్ ప్రజా ఆరోగ్య సేవలు' : 'Quality Public Healthcare For All'}
              </span>
              <h2 className="cta-banner-title">
                {lang === 'te'
                  ? 'ఆసుపత్రి క్యూలలో వేచి ఉండే శ్రమ లేకుండా ఉచిత వైద్యం పొందండి'
                  : 'Ready to Experience Queue-Free Government Healthcare?'}
              </h2>
              <p className="cta-banner-subtitle">
                {lang === 'te'
                  ? 'ఈరోజే మీ ఓపీడీ స్లాట్‌ను ఆన్‌లైన్‌లో బుక్ చేసుకోండి లేదా మీ ఖాతాతో సైన్ ఇన్ చేయండి.'
                  : 'Reserve your specialist consultation slot in less than 60 seconds with instant digital token.'}
              </p>
              <div className="cta-banner-buttons">
                <Link to={getBookingLink()} className="btn btn-primary btn-lg landing-cta-glow">
                  <Calendar size={18} />
                  {lang === 'te' ? 'ఓపీడీ అపాయింట్‌మెంట్ బుక్ చేయండి' : 'Book OPD Appointment Now'}
                  <ArrowRight size={16} />
                </Link>
                <Link to="/login" className="btn btn-secondary btn-lg" style={{ background: '#ffffff', color: 'var(--navy-900)' }}>
                  <UserCheck size={18} />
                  {lang === 'te' ? 'పోర్టల్ సైన్ ఇన్' : 'Sign In to Portal'}
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Emergency Modal Integration */}
      <EmergencyModal isOpen={showEmergencyModal} onClose={() => setShowEmergencyModal(false)} />
    </div>
  );
};

export default LandingPage;
