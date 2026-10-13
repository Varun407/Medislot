import React, { createContext, useContext, useState, useEffect } from 'react';

export type Language = 'te' | 'en';

export const translations = {
  te: {
    // Brand & Banner
    pageTitle: "మెడిస్లాట్ | ఏపీ ప్రభుత్వ ఆసుపత్రి అపాయింట్‌మెంట్లు & ఓపీడీ క్యూ",
    bannerGov: "ఆంధ్రప్రదేశ్ ప్రభుత్వం · వైద్య, ఆరోగ్య మరియు కుటుంబ సంక్షేమ శాఖ",
    emergency108: "అత్యవసరం: 108 | ఆరోగ్య సలహా: 104",
    brandGov: "ఆంధ్రప్రదేశ్ ప్రభుత్వం",
    brandDept: "వైద్య, ఆరోగ్య మరియు కుటుంబ సంక్షేమ శాఖ",
    brandTagline: "ప్రజల ఆరోగ్యం - ప్రభుత్వ ప్రాధాన్యత",
    locationAP: "📍 పశ్చిమ గోదావరి & ఏపీ జిల్లాలు",

    // Navigation
    navHome: "హోమ్",
    navDoctors: "వైద్యులు",
    navHospitals: "ఆసుపత్రులు & పడకలు",
    navGrievance: "ఫిర్యాదులు",
    navPatientPortal: "రోగి పోర్టల్",
    navDoctorPortal: "డాక్టర్ పోర్టల్",
    btnLogin: "లాగిన్",
    btnRegister: "రిజిస్టర్",
    btnLogout: "లాగౌట్",
    dashboard: "డ్యాష్‌బోర్డ్",

    // Hero & Stats
    heroTag: "ప్రభుత్వ ఆసుపత్రి డిజిటల్ ఓపీడీ సేవలు",
    heroHeading: "నాణ్యమైన ఉచిత ప్రభుత్వ వైద్యం,<br/>వేచి ఉండే శ్రమ లేకుండా!",
    heroDesc: "వైద్యుల లభ్యతను తనిఖీ చేయండి, ఓపీడీ స్లాట్లు బుక్ చేసుకోండి, నిజ-సమయ డిజిటల్ టోకెన్ పొందండి. ఆరోగ్యశ్రీ & ఆయుష్మాన్ భారత్ అనుసంధాన సేవలు.",
    btnBookNow: "ఓపీడీ స్లాట్ బుక్ చేయండి",
    btnFindDoctor: "వైద్యులను వెతకండి",
    statHospitals: "ప్రభుత్వ ఆసుపత్రులు",
    statDoctors: "అందుబాటు వైద్యులు",
    statBeds: "లభ్యమయ్యే పడకలు",
    statBookings: "నేటి ఓపీడీ బుకింగ్‌లు",

    // Features / Badges
    badge1: "నమ్మకమైన సూపర్ స్పెషాలిటీ వైద్యులు",
    badge2: "లైవ్ డిజిటల్ టోకెన్ & స్లిప్",
    badge3: "ఉచిత పరీక్షలు & ఉచిత మందులు",
    badge4: "24x7 ఎమర్జెన్సీ & ట్రౌమా కేర్",

    // OPD Booking
    bookingTitle: "ఓపీడీ అపాయింట్‌మెంట్ బుకింగ్",
    lblHospital: "ఆసుపత్రిని ఎంచుకోండి",
    lblDept: "వైద్య విభాగాన్ని ఎంచుకోండి",
    lblDoctor: "వైద్యుడిని ఎంచుకోండి",
    lblDate: "తేదీని ఎంచుకోండి",
    lblSlot: "స్లాట్ సమయం",
    lblSymptoms: "ప్రధాన సమస్య / లక్షణాలు",
    allDepts: "అన్ని విభాగాలు",
    anyDoctor: "ఏ వైద్యుడైనా",
    btnConfirmBooking: "బుకింగ్ నిర్ధారించండి & టోకెన్ పొందండి",
    noSlots: "ఈ తేదీకి స్లాట్‌లు భర్తీ అయ్యాయి",

    // Patient
    patientDashboard: "రోగి డ్యాష్‌బోర్డ్",
    myAppointments: "నా అపాయింట్‌మెంట్లు",
    bookNew: "కొత్త అపాయింట్‌మెంట్ బుక్ చేయండి",
    upcomingVisits: "రాబోయే సంప్రదింపులు",
    pastVisits: "గత సంప్రదింపుల చరిత్ర",
    btnPrintSlip: "🖨️ ఓపీడీ స్లిప్ చూడండి & ప్రింట్",
    btnCancelApp: "రద్దు చేయండి",

    // Doctor
    doctorDashboard: "డాక్టర్ ఓపీడీ క్యూ బోర్డ్",
    metricCurrentToken: "ప్రస్తుతం పిలుస్తున్న టోకెన్",
    metricWaiting: "వేచి ఉన్న రోగులు",
    metricInConsult: "కన్సల్టేషన్‌లో ఉన్నవారు",
    metricDone: "పూర్తయిన ఓపీడీలు",
    btnCallNext: "📢 తదుపరి రోగి టోకెన్ పిలవండి",
    btnWalkin: "➕ కౌంటర్ వాక్-ఇన్ టోకెన్ జారీ",
    colToken: "టోకెన్ #",
    colPatient: "రోగి వివరాలు",
    colSlot: "స్లాట్ సమయం",
    colSymptoms: "సమస్య / లక్షణాలు",
    colStatus: "స్టేటస్",
    colAction: "చర్యలు",

    // Common
    loading: "లోడ్ అవుతోంది...",
    save: "సేవ్ చేయండి",
    cancel: "రద్దు"
  },
  en: {
    // Brand & Banner
    pageTitle: "MediSlot | AP Government Hospital Appointments & OPD Queue",
    bannerGov: "Government of Andhra Pradesh · Department of Health, Medical & Family Welfare",
    emergency108: "Emergency: 108 | Health Info: 104",
    brandGov: "Government of Andhra Pradesh",
    brandDept: "Department of Health, Medical & Family Welfare",
    brandTagline: "People's Health - Government Priority",
    locationAP: "📍 West Godavari & AP Region",

    // Navigation
    navHome: "Home",
    navDoctors: "Doctors",
    navHospitals: "Hospitals & Beds",
    navGrievance: "Grievances",
    navPatientPortal: "Patient Portal",
    navDoctorPortal: "Doctor Portal",
    btnLogin: "Sign In",
    btnRegister: "Register",
    btnLogout: "Sign Out",
    dashboard: "Dashboard",

    // Hero & Stats
    heroTag: "Government Hospital Digital OPD System",
    heroHeading: "Quality Free Public Healthcare,<br/>Zero Waiting Queue Hassle!",
    heroDesc: "Check doctor availability, reserve OPD slots online, and get an authentic sequential digital token. Integrated with Aarogyasri & Ayushman Bharat.",
    btnBookNow: "Book OPD Appointment",
    btnFindDoctor: "Find Doctors",
    statHospitals: "Govt Hospitals",
    statDoctors: "Active Doctors",
    statBeds: "Available Beds",
    statBookings: "Today's OPD Bookings",

    // Features / Badges
    badge1: "Trusted Super Specialty Doctors",
    badge2: "Live Sequential OPD Token",
    badge3: "Free Diagnostics & Free Medicines",
    badge4: "24x7 Emergency & Trauma Care",

    // OPD Booking
    bookingTitle: "OPD Appointment Booking",
    lblHospital: "Select Hospital",
    lblDept: "Select Department",
    lblDoctor: "Select Doctor",
    lblDate: "Select Date",
    lblSlot: "Select Slot Time",
    lblSymptoms: "Chief Complaint / Symptoms",
    allDepts: "All Departments",
    anyDoctor: "Any Doctor",
    btnConfirmBooking: "Confirm Booking & Generate Token",
    noSlots: "Slots fully booked for this date",

    // Patient
    patientDashboard: "Patient Dashboard",
    myAppointments: "My Appointments",
    bookNew: "Book New Appointment",
    upcomingVisits: "Upcoming Consultations",
    pastVisits: "Past Consultation History",
    btnPrintSlip: "🖨️ View & Print OPD Slip",
    btnCancelApp: "Cancel",

    // Doctor
    doctorDashboard: "Doctor OPD Queue Board",
    metricCurrentToken: "Now Serving Token",
    metricWaiting: "Waiting Patients",
    metricInConsult: "In Consultation",
    metricDone: "Consultations Completed",
    btnCallNext: "📢 Call Next Patient Token",
    btnWalkin: "➕ Issue Walk-in Token",
    colToken: "Token #",
    colPatient: "Patient Details",
    colSlot: "Slot",
    colSymptoms: "Chief Complaint",
    colStatus: "Status",
    colAction: "Actions",

    // Common
    loading: "Loading...",
    save: "Save Changes",
    cancel: "Cancel"
  }
};

interface LanguageContextType {
  lang: Language;
  setLang: (lang: Language) => void;
  t: typeof translations['en'];
  toggleLang: () => void;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [lang, setLangState] = useState<Language>(() => {
    const saved = localStorage.getItem('medislot_lang') as Language;
    return saved === 'te' || saved === 'en' ? saved : 'en';
  });

  const setLang = (newLang: Language) => {
    setLangState(newLang);
    localStorage.setItem('medislot_lang', newLang);
  };

  const toggleLang = () => {
    setLang(lang === 'en' ? 'te' : 'en');
  };

  const t = translations[lang];

  return (
    <LanguageContext.Provider value={{ lang, setLang, t, toggleLang }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};
