import React, { createContext, useContext, useState } from 'react';
import { transliterateNameToTelugu } from '../utils/teluguTransliteration';

export type Language = 'te' | 'en';

export const translations = {
  te: {
    // Brand & Banner
    pageTitle: "మెడిస్లాట్ | ఏపీ ప్రభుత్వ ఆసుపత్రి అపాయింట్‌మెంట్లు & ఓపీడీ క్యూ",
    bannerGov: "ఆంధ్రప్రదేశ్ ప్రభుత్వం · వైద్య, ఆరోగ్య మరియు కుటుంబ సంక్షేమ శాఖ",
    emergency108: "అత్యవసరం: 108 | ఆరోగ్య సమాచారం: 104",
    brandGov: "ఆంధ్రప్రదేశ్ ప్రభుత్వం",
    brandDept: "వైద్య, ఆరోగ్య మరియు కుటుంబ సంక్షేమ శాఖ",
    brandTagline: "ఆంధ్రప్రదేశ్ స్మార్ట్ ఓపీడీ & క్యూ నిర్వహణ వ్యవస్థ",
    locationAP: "📍 పశ్చిమ గోదావరి & ఏపీ జిల్లాలు",
    livePortal: "ప్రత్యక్ష పోర్టల్",
    brandName: "మెడిస్లాట్",

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
    controlCenter: "కంట్రోల్ సెంటర్",
    manageOpds: "ఓపీడీ నిర్వహణ",
    doctorLicensure: "వైద్యుల పరిశీలన",
    patients: "రోగులు",
    appointments: "అపాయింట్‌మెంట్లు",
    opdQueueBoard: "ఓపీడీ క్యూ బోర్డ్",
    dutySchedule: "డ్యూటీ షెడ్యూల్",
    bookOpdSlot: "స్లాట్ బుకింగ్",

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

    // Home sections
    popularDepts: "ప్రత్యేక వైద్య విభాగాలు",
    popularDeptsDesc: "అనుభవజ్ఞులైన నిపుణులతో సమగ్ర ఉచిత ప్రభుత్వ వైద్య సంప్రదింపులు",
    viewAllDepts: "అన్ని విభాగాలు చూడండి",
    consultSpecialist: "నిపుణులను సంప్రదించండి",
    activeGovDoctors: "అందుబాటులో ఉన్న ప్రభుత్వ వైద్యులు",
    activeGovDoctorsDesc: "క్రమ సంఖ్య డిజిటల్ టోకెన్ ఓపీడీ కోసం పరిశీలించబడిన నిపుణులు",
    fullDoctorDir: "పూర్తి వైద్యుల జాబితా",
    bookAppointment: "అపాయింట్‌మెంట్ బుక్ చేయండి",

    // OPD Booking & Directory
    bookingTitle: "ఓపీడీ అపాయింట్‌మెంట్ బుకింగ్",
    bookingSubtitle: "పరిశీలించబడిన ఆసుపత్రి నిపుణుడిని ఎంచుకోండి, తెరిచి ఉన్న స్లాట్‌ను ఎంచుకుని అధికారిక డిజిటల్ టోకెన్ పొందండి.",
    lblHospital: "ఆసుపత్రిని ఎంచుకోండి",
    lblDept: "వైద్య విభాగాన్ని ఎంచుకోండి",
    lblDoctor: "వైద్యుడిని ఎంచుకోండి",
    lblDate: "తేదీని ఎంచుకోండి",
    lblSlot: "స్లాట్ సమయం",
    lblSymptoms: "ప్రధాన సమస్య / లక్షణాలు",
    allDepts: "అన్ని విభాగాలు",
    allHospitals: "అన్ని ఆసుపత్రులు",
    allHospitalsOption: "అన్ని ప్రభుత్వ ఆసుపత్రులు",
    anyDoctor: "ఏ వైద్యుడైనా",
    searchAvailability: "లభ్యతను శోధించండి",
    btnConfirmBooking: "బుకింగ్ నిర్ధారించండి & టోకెన్ పొందండి",
    noSlots: "ఈ తేదీకి స్లాట్‌లు భర్తీ అయ్యాయి",
    noSpecialistsAvail: "ఈ విభాగానికి/తేదీకి అందుబాటులో ఉన్న నిపుణులు లేరు",
    searchNameRole: "పేరు లేదా స్పెషాలిటీతో వెతకండి",
    searchNamePlaceholder: "డాక్టర్ పేరు, కార్డియాలజీ...",
    clinicalSpecialty: "వైద్య విభాగం",
    hospitalFacility: "ఆసుపత్రి కేంద్రం",
    consultationDate: "సంప్రదింపుల తేదీ",
    clearFilters: "ఫిల్టర్లు తొలగించండి",
    resetFilters: "ఫిల్టర్లు రీసెట్ చేయండి",
    loadingDoctors: "అందుబాటులో ఉన్న నిపుణులను లోడ్ చేస్తోంది...",
    noDoctorsMatched: "ఎంచుకున్న తేదీకి మీ శోధనకు సరిపోయే వైద్యులు లేరు.",
    noDoctorsMatchedDesc: "దయచేసి స్పెషాలిటీ మార్చి లేదా వేరొక తేదీని ఎంచుకుని ప్రయత్నించండి.",
    expYears: "సంవత్సరాల అనుభవం",
    opdHours: "ఓపీడీ సమయం",
    availableSlotsCount: "అందుబాటు స్లాట్లు",
    allSlotsBookedDate: "ఈ తేదీకి అన్ని స్లాట్‌లు బుక్ అయ్యాయి",
    moreSlots: "మరిన్ని",
    bookOpdAppointment: "ఓపీడీ అపాయింట్‌మెంట్ బుక్ చేయండి",
    directoryTitle: "ప్రభుత్వ వైద్యుల జాబితా & స్లాట్ లభ్యత",
    directorySubtitle: "మీకు కావలసిన విభాగాన్ని లేదా ఆసుపత్రిని ఎంచుకుని లైవ్ ఓపీడీ స్లాట్లను తనిఖీ చేయండి",

    // Patient Form
    patientConsultDetails: "రోగి సంప్రదింపు వివరాలు",
    patientAge: "రోగి వయస్సు (సంవత్సరాలు) *",
    patientGender: "లింగం *",
    genderFemale: "స్త్రీ",
    genderMale: "పురుషుడు",
    genderOther: "ఇతర",
    arogyasriIdOptional: "ఆరోగ్యశ్రీ / ఆభా ఐడీ (ఐచ్ఛికం)",
    symptomsPlaceholder: "రాకకు కారణం (ఉదా: 3 రోజులుగా జ్వరం, కీళ్ల నొప్పులు, బీపీ పరీక్ష)...",
    confirmingBooking: "ఆసుపత్రి క్యూతో నిర్ధారిస్తోంది...",
    confirmBookingIssueSlip: "బుకింగ్ నిర్ధారించండి & టోకెన్ స్లిప్ పొందండి",
    allSlotsBookedPickAnother: "ఈ నిపుణుడికి ఎంచుకున్న తేదీకి అన్ని స్లాట్లు బుక్ అయ్యాయి. దయచేసి వేరే తేదీని ఎంచుకోండి.",

    // Hospitals Directory
    hospitalsTitle: "ప్రభుత్వ ఆసుపత్రులు & పడకల లభ్యత",
    hospitalsSubtitle: "పశ్చిమ గోదావరి మరియు పరిసర జిల్లాల్లోని ప్రభుత్వ వైద్య మౌలిక వసతులు మరియు ఐసీయూ పడకల సమాచారం",
    loadingHospitals: "ఆసుపత్రుల నెట్‌వర్క్‌ను లోడ్ చేస్తోంది...",
    districtSuffix: "జిల్లా",
    generalBeds: "సాధారణ పడకలు",
    icuBeds: "ఐసీయూ పడకలు",
    oxygenBeds: "ఆక్సిజన్ పడకలు",
    opdTimings: "ఓపీడీ వేళలు",
    emergency: "అత్యవసరం",
    bookOpdAtHospital: "ఈ ఆసుపత్రిలో ఓపీడీ బుక్ చేయండి",

    // Grievance Redressal
    grievanceTitle: "పౌర సమస్యలు & స్పందన ఫిర్యాదుల విభాగం",
    grievanceSubtitle: "ప్రభుత్వ ఆసుపత్రి సేవల నాణ్యత, మందుల లభ్యత మరియు వేచి ఉండే సమయంపై మీ అభిప్రాయాన్ని నమోదు చేయండి",
    fullName: "పూర్తి పేరు *",
    fullNamePlaceholder: "పౌరుడి పూర్తి పేరు",
    mobile10Digits: "మొబైల్ నంబర్ (10 అంకెలు) *",
    categoryLabel: "సమస్య విభాగం",
    detailedFeedback: "వివరణాత్మక సమస్య / సూచన *",
    detailedFeedbackPlaceholder: "దయచేసి మీ అనుభవాన్ని లేదా సమస్యను వివరంగా వివరించండి...",
    submittingGrievance: "ఫిర్యాదును సమర్పిస్తోంది...",
    submitGrievanceBtn: "జిల్లా వైద్య అధికారి (డీఎంహెచ్‌ఓ) కు ఫిర్యాదు సమర్పించండి",
    grievanceSuccessTitle: "ఫిర్యాదు విజయవంతంగా నమోదైంది",
    grievanceSuccessDesc: "మీ అభిప్రాయం తక్షణ చర్యల నిమిత్తం జిల్లా వైద్య మరియు ఆరోగ్య అధికారి (డీఎంహెచ్‌ఓ) పర్యవేక్షణ డెస్క్‌కు పంపబడింది.",
    trackingRefId: "ట్రాకింగ్ రిఫరెన్స్ ఐడీ:",
    submitAnotherGrievance: "మరొక ఫిర్యాదును సమర్పించండి",
    catOpdWaiting: "ఓపీడీ వేచి ఉండే సమయం & క్యూ నిర్వహణ",
    catMedicineAvail: "ఫార్మసీ / ఉచిత మందుల లభ్యత",
    catSanitation: "పరిశుభ్రత & శానిటేషన్",
    catDoctorAvail: "వైద్యులు / స్పెషలిస్ట్ లభ్యత",
    catDiagnosticsLab: "ఉచిత ల్యాబ్ / రోగనిర్ధారణ పరికరాలు",
    catOtherSuggestion: "ఇతర సూచనలు",
    grievanceAccountRequiredTitle: "ఫిర్యాదు సమర్పించడానికి ఖాతా తప్పనిసరి",
    grievanceAccountRequiredDesc: "ప్రభుత్వ నిబంధనల ప్రకారం, అధికారిక విచారణ మరియు పరిష్కార ట్రాకింగ్ కొరకు నమోదైన పౌరులు మాత్రమే ఫిర్యాదులు దాఖలు చేయగలరు. దయచేసి మీ ఖాతాతో లాగిన్ అవ్వండి లేదా కొత్త రోగి ఖాతాను నమోదు చేసుకోండి.",
    grievanceSignInPrompt: "లాగిన్ అవ్వండి",
    grievanceRegisterPrompt: "కొత్త రోగి ఖాతా నమోదు చేసుకోండి",
    grievanceLoggedInAs: "లాగిన్ అయిన పౌరుడు:",
    grievanceSubmitNotice: "మీ ఫిర్యాదు సంబంధిత జిల్లా వైద్య మరియు ఆరోగ్య అధికారి (డీఎంహెచ్‌ఓ) పర్యవేక్షణకు పంపబడుతుంది.",
    pleaseCompleteFields: "దయచేసి అన్ని అవసరమైన వివరాలను నమోదు చేయండి.",
    grievanceSubmitSuccess: "ఫిర్యాదు విజయవంతంగా నమోదైంది.",
    grievanceSubmitFail: "ఫిర్యాదు సమర్పించడం విఫలమైంది.",

    // Patient Dashboard
    patientDashboard: "రోగి డ్యాష్‌బోర్డ్",
    myAppointments: "నా అపాయింట్‌మెంట్లు",
    welcomeGreeting: "నమస్కారం",
    patientPortalSub: "రోగి పోర్టల్ · మొబైల్:",
    myProfileAbha: "నా ప్రొఫైల్ & ఆభా గుర్తింపు",
    bookNew: "కొత్త అపాయింట్‌మెంట్ బుక్ చేయండి",
    activeUpcomingVisits: "యాక్టివ్ రాబోయే సంప్రదింపులు",
    completedConsultations: "పూర్తయిన సంప్రదింపులు",
    totalOpdRecords: "మొత్తం ఓపీడీ రికార్డులు",
    upcomingVisits: "రాబోయే సంప్రదింపులు",
    bookAnother: "+ మరొక అపాయింట్‌మెంట్ బుక్ చేయండి",
    loadingAppointments: "అపాయింట్‌మెంట్లను లోడ్ చేస్తోంది...",
    noUpcomingAppointments: "రాబోయే అపాయింట్‌మెంట్లు ఏవీ లేవు.",
    needToVisitHospital: "ఆసుపత్రికి వెళ్లాలా? నిపుణులైన వైద్యుడిని ఎంచుకుని ఉచిత ఓపీడీ టోకెన్ పొందండి.",
    bookOpdAppointmentBtn: "ఓపీడీ అపాయింట్‌మెంట్ బుక్ చేయండి",
    tokenBadge: "టోకెన్",
    reportPrefix: "రిపోర్ట్:",
    viewSlip: "స్లిప్ చూడండి",
    cancelAppt: "రద్దు చేయండి",
    rescheduleAppt: "పునఃషెడ్యూల్",
    bookAgain: "మళ్లీ బుక్ చేయండి",
    myActiveTokenTitle: "నా యాక్టివ్ ఓపీడీ టోకెన్ & లైవ్ క్యూ స్థితి",
    liveQueueEstimate: "అంచనా వేచి ఉండే సమయం",
    tokensAhead: "ముందున్న టోకెన్లు",
    nowCalling: "ప్రస్తుతం పిలుస్తున్న టోకెన్",
    rescheduleModalTitle: "అపాయింట్‌మెంట్‌ను పునఃషెడ్యూల్ చేయండి",
    selectNewDate: "కొత్త తేదీని ఎంచుకోండి",
    selectNewSlot: "కొత్త సమయ స్లాట్‌ను ఎంచుకోండి",
    confirmReschedule: "పునఃషెడ్యూల్ నిర్ధారించండి",
    rescheduling: "పునఃషెడ్యూల్ చేస్తోంది...",
    emergencyHelpBtn: "అత్యవసర సహాయం (108/104)",
    pastVisits: "గత సంప్రదింపుల చరిత్ర",
    noPastVisits: "గత సంప్రదింపుల రికార్డులు ఏవీ లేవు.",
    colRefId: "రిఫరెన్స్ ఐడీ",
    colDoctor: "వైద్యుడు",
    colDept: "విభాగం",
    colDateTime: "తేదీ & సమయం",
    colStatusText: "స్టేటస్",
    colActionText: "చర్య",
    slipBtn: "స్లిప్",
    confirmCancelPrompt: "మీరు ఖచ్చితంగా ఈ అపాయింట్‌మెంట్‌ను రద్దు చేయాలనుకుంటున్నారా? మీ రిజర్వ్ చేసిన స్లాట్ విడుదల చేయబడుతుంది.",

    // Patient Profile
    patientProfileTitle: "రోగి ప్రొఫైల్ & ఆరోగ్య గుర్తింపు సంఖ్య",
    patientProfileSubtitle: "మీ వ్యక్తిగత వివరాలు, ఆభా ఆరోగ్య గుర్తింపు మరియు చిరునామాను నిర్వహించండి.",
    emailPrimary: "ఈమెయిల్ (ఖాతా ప్రాథమికం)",
    mobileNumber: "మొబైల్ నంబర్",
    ageYears: "వయస్సు (సంవత్సరాలు)",
    genderLabel: "లింగం",
    arogyasriAbhaId: "ఆరోగ్యశ్రీ / ఆభా హెల్త్ ఐడీ",
    residentialAddress: "నివాస చిరునామా",
    saveProfileChanges: "ప్రొఫైల్ మార్పులను సేవ్ చేయండి",
    savingProfile: "సేవ్ చేస్తోంది...",

    // Patient Register
    createPatientAccount: "కొత్త రోగి ఖాతా సృష్టించండి",
    createPatientAccountSub: "డిజిటల్ ఓపీడీ స్లాట్‌లు మరియు అధికారిక క్యూ టోకెన్ల కోసం సైన్ అప్ చేయండి",
    agreeTermsLabel: "నేను ఏపీ పబ్లిక్ హెల్త్ గోప్యతా విధానం మరియు డిజిటల్ నిబంధనలను అంగీకరిస్తున్నాను.",
    alreadyAccount: "ఇప్పటికే ఖాతా ఉందా?",
    loginHere: "ఇక్కడ లాగిన్ అవ్వండి",
    registerPatientBtn: "రోగిగా రిజిస్టర్ అవ్వండి",
    confirmPassword: "పాస్‌వర్డ్‌ను నిర్ధారించండి *",
    reEnterPassword: "పాస్‌వర్డ్‌ను తిరిగి నమోదు చేయండి",
    atLeast8Chars: "కనీసం 8 అక్షరాలు",
    creatingAccount: "ఖాతా సృష్టిస్తోంది...",
    completePatientReg: "రోగి రిజిస్ట్రేషన్ పూర్తి చేయండి",
    passWeak: "బలహీనం",
    passModerate: "మధ్యస్థం",
    passStrong: "బలంగా ఉంది",
    passVeryStrong: "చాలా బలంగా ఉంది",

    // Patient Login
    patientLoginTitle: "రోగి పోర్టల్ లాగిన్",
    patientLoginSub: "మీ ఓపీడీ కన్సల్టేషన్ స్లిప్పులు & టోకెన్ రికార్డులను యాక్సెస్ చేయండి",
    signInAsPatient: "రోగిగా లాగిన్ అవ్వండి",
    noAccountYet: "ఇంకా రోగి ఖాతా లేదా?",
    registerHere: "ఇక్కడ రిజిస్టర్ అవ్వండి",
    apEncryptedNotice: "ఏపీ హెల్త్ ఎన్‌క్రిప్టెడ్ ప్రామాణీకరణతో రక్షించబడింది",

    // Doctor Login & Pending
    doctorLoginTitle: "వైద్యుల పోర్టల్ లాగిన్",
    doctorLoginSub: "రోజువారీ ఓపీడీ క్యూలు, రోగి సంప్రదింపులు మరియు రోస్టర్ షెడ్యూల్‌లను నిర్వహించండి",
    doctorOfficialEmail: "డాక్టర్ అధికారిక ఇమెయిల్",
    authenticatingDoctor: "డాక్టర్‌ను ధృవీకరిస్తోంది...",
    signInAsDoctor: "డాక్టర్‌గా లాగిన్ అవ్వండి",
    newPhysicianQuestion: "కొత్త వైద్యుడిగా చేరుతున్నారా?",
    applyRegisterHere: "ఇక్కడ దరఖాస్తు / రిజిస్టర్ చేయండి",
    appPendingVerification: "దరఖాస్తు స్థితి: పరిశీలన పెండింగ్‌లో ఉంది",
    doctorCredentialsReview: "వైద్యుల ఆధారాల పరిశీలన జరుగుతోంది",
    doctorPendingNotice: "మీ క్లినికల్ ప్రొఫైల్ మరియు వైద్య ఆధారాలు సురక్షితంగా అందాయి. ఆంధ్రప్రదేశ్ ప్రభుత్వ ఆరోగ్య కేంద్రాలలో రోగుల భద్రత మరియు వైద్య పాలనను కాపాడటానికి, మీ ఓపీడీ క్యూ సక్రియం కావడానికి ముందు సిస్టమ్ నిర్వాహకుడు మీ లైసెన్స్‌ను ధృవీకరించాలి.",
    registeredDoctorLabel: "నమోదైన డాక్టర్:",
    officialEmailLabel: "అధికారిక ఇమెయిల్:",
    mobileLabel: "మొబైల్:",
    verificationOfficeLabel: "పరిశీలన కార్యాలయం:",
    dmhoOffice: "డీఎంహెచ్‌ఓ / ఆసుపత్రి పరిపాలన విభాగం",
    checkVerificationStatus: "పరిశీలన స్థితిని తనిఖీ చేయండి",

    // Doctor Register
    doctorPortalRegTitle: "డాక్టర్ క్లినికల్ పోర్టల్ రిజిస్ట్రేషన్",
    doctorPortalRegSub: "ఆంధ్రప్రదేశ్ ప్రభుత్వ ఓపీడీ సంప్రదింపుల వ్యవస్థలో చేరండి",
    doctorVerifyNoticeTitle: "డాక్టర్ ధృవీకరణపై గమనిక:",
    doctorVerifyNoticeText: "డాక్టర్ ఖాతాలు డిఫాల్ట్‌గా 'పరిశీలన పెండింగ్‌లో ఉంది' స్థితితో సృష్టించబడతాయి. మీరు బుక్ చేయగల ప్రొవైడర్‌గా కనిపించడానికి ముందు ప్లాట్‌ఫారమ్ నిర్వాహకుడు మీ వైద్య లైసెన్స్‌ను పరిశీలిస్తారు.",
    doctorNameWithTitle: "డాక్టర్ పూర్తి పేరు (హోదాతో) *",
    medSpecialization: "వైద్య విభాగం (స్పెషలైజేషన్) *",
    yearsExperience: "క్లినికల్ అనుభవ సంవత్సరాలు *",
    medQualifications: "వైద్య అర్హతలు *",
    assignedHospital: "కేటాయించిన ఆసుపత్రి కేంద్రం *",
    submittingApplication: "దరఖాస్తును సమర్పిస్తోంది...",
    submitDoctorApp: "డాక్టర్ దరఖాస్తును సమర్పించండి",
    alreadyRegistered: "ఇప్పటికే రిజిస్టర్ అయ్యారా?",

    // Doctor Dashboard & Queue
    doctorDashboard: "డాక్టర్ ఓపీడీ క్యూ బోర్డ్",
    doctorLiveQueueTitle: "డాక్టర్ ఓపీడీ లైవ్ క్యూ బోర్డ్",
    physicianLabel: "వైద్యుడు:",
    deptLabel: "విభాగం:",
    roomLabel: "గది:",
    manageAvailability: "లభ్యత నిర్వహణ",
    callingNextPatient: "పిలుస్తోంది...",
    btnCallNext: "📢 తదుపరి రోగి టోకెన్ పిలవండి",
    btnWalkin: "➕ కౌంటర్ వాక్-ఇన్ టోకెన్ జారీ",
    metricCurrentToken: "ప్రస్తుతం పిలుస్తున్న టోకెన్",
    metricWaiting: "వేచి ఉన్న రోగులు",
    metricInConsult: "కన్సల్టేషన్‌లో ఉన్నవారు",
    metricDone: "పూర్తయిన ఓపీడీలు",
    todaysQueueTitle: "నేటి రోగుల సంప్రదింపుల క్యూ",
    autoRefreshing: "ప్రతి 15 సెకన్లకు ఆటో-రిఫ్రెష్ అవుతుంది · మొత్తం:",
    patientsCount: "రోగులు",
    loadingOpdQueue: "ఓపీడీ క్యూను లోడ్ చేస్తోంది...",
    noPatientsInQueue: "నేటి క్యూలో ఇంకా రోగులు బుక్ కాలేదు.",
    walkinNotice: "ఆసుపత్రికి నేరుగా వచ్చిన కౌంటర్ రోగులను నమోదు చేయడానికి 'వాక్-ఇన్ టోకెన్ జారీ' బటన్‌ను ఉపయోగించండి.",
    colToken: "టోకెన్ #",
    colPatient: "రోగి వివరాలు",
    colAgeGender: "వయస్సు / లింగం",
    colSlot: "స్లాట్ సమయం",
    colSymptoms: "సమస్య / లక్షణాలు",
    colStatus: "స్టేటస్",
    colAction: "చర్యలు",
    ageYrs: "సంవత్సరాలు",
    repShort: "రిపోర్ట్:",
    printTokenSlip: "టోకెన్ స్లిప్ ప్రింట్ చేయండి",
    issueWalkinTitle: "కౌంటర్ వాక్-ఇన్ టోకెన్ జారీ చేయండి",
    patientFullNameReq: "రోగి పూర్తి పేరు *",
    contactPhoneOptional: "సంప్రదింపు ఫోన్",
    ageYearsOptional: "వయస్సు (సంవత్సరాలు)",
    symptomsComplaint: "లక్షణాలు / సమస్య",
    generatingToken: "టోకెన్ జారీ చేస్తోంది...",
    generatePrintWalkin: "వాక్-ఇన్ టోకెన్ జారీ & ప్రింట్",

    // Doctor Availability
    opdAvailabilityTitle: "ఓపీడీ సంప్రదింపుల లభ్యత & రోస్టర్",
    opdAvailabilitySubtitle: "మీ క్లినికల్ షిఫ్ట్ వేళలు, డ్యూటీ స్థితి మరియు అపాయింట్‌మెంట్ స్లాట్‌లను నిర్వహించండి.",
    opdDutyStatusToday: "నేటి ఓపీడీ డ్యూటీ స్థితి",
    dutyToggleDesc: "సెలవులో ఉన్నా, అత్యవసర ఆపరేషన్ థియేటర్‌లో ఉన్నా లేదా అందుబాటులో లేకుంటే ఆఫ్ చేయండి.",
    onDutyActive: "డ్యూటీలో ఉన్నారు (యాక్టివ్)",
    offDutyInactive: "సెలవులో ఉన్నారు (అందుబాటులో లేరు)",
    availSlotsForPatients: "రోగులకు అందుబాటులో ఉన్న సమయ స్లాట్‌లు",
    newSlotPlaceholder: "ఉదా: 02:00 PM",
    addSlotBtn: "స్లాట్ జోడించండి",
    saveRosterSchedule: "షెడ్యూల్ రోస్టర్‌ను సేవ్ చేయండి",
    savingSchedule: "సేవ్ చేస్తోంది...",

    // Unified Sign In
    portalLoginTitle: "మెడిస్లాట్ పోర్టల్ లాగిన్",
    portalLoginSub: "ఆంధ్రప్రదేశ్ ప్రభుత్వ ఆసుపత్రి అపాయింట్‌మెంట్లు & డిజిటల్ ఓపీడీ క్యూ",
    singleGateway: "రోగులు, వైద్యులు & అడ్మిన్ కోసం ఏకైక ప్రవేశ ద్వారం",
    quickTestCredentials: "శీఘ్ర పరీక్ష ఆధారాలు (1-క్లిక్ ఫిల్):",
    doctorRole: "వైద్యుడు",
    patientRole: "రోగి",
    adminRole: "అడ్మిన్",
    emailAddress: "ఇమెయిల్ చిరునామా",
    passwordLabel: "పాస్‌వర్డ్",
    signInBtn: "లాగిన్ చేయండి",
    authenticating: "ధృవీకరిస్తోంది...",
    autoRedirectNotice: "ఆటోమేటిక్ రోల్ రీడైరెక్షన్: రోగి ఆధారాలను నమోదు చేస్తే రోగి డ్యాష్‌బోర్డ్ తెరుచుకుంటుంది. డాక్టర్ ఆధారాలను నమోదు చేస్తే డాక్టర్ ఓపీడీ క్యూ తెరుచుకుంటుంది.",
    newPatientQuestion: "కొత్త రోగిగా నమోదు కావాలా?",
    registerAsPatient: "రోగిగా నమోదు చేసుకోండి",
    doctorJoiningQuestion: "ఆసుపత్రి వైద్యుడిగా చేరాలా?",
    registerAsDoctor: "డాక్టర్‌గా నమోదు చేసుకోండి",

    // Token Slip Modal
    tokenSlipTitle: "అధికారిక ఓపీడీ టోకెన్ స్లిప్",
    printSlipBtn: "ప్రింట్ స్లిప్",
    govtHeader: "ఆంధ్రప్రదేశ్ ప్రభుత్వం · వైద్య మరియు కుటుంబ సంక్షేమ శాఖ",
    outpatientSlipSubtitle: "అవుట్‌పేషెంట్ విభాగం (ఓపీడీ) సంప్రదింపుల టోకెన్ స్లిప్",
    yourTokenNumber: "మీ క్రమ సంఖ్య టోకెన్",
    opdRefIdLabel: "ఓపీడీ రిఫరెన్స్ ఐడీ:",
    patientNameLabel: "రోగి పేరు",
    contactPhoneLabel: "సంప్రదింపు ఫోన్",
    ageGenderLabel: "వయస్సు & లింగం",
    arogyasriLabel: "ఆరోగ్యశ్రీ ఐడీ",
    specialistDoctorLabel: "స్పెషలిస్ట్ డాక్టర్",
    clinicalDeptLabel: "వైద్య విభాగం",
    opdDateLabel: "ఓపీడీ తేదీ",
    slotReportingLabel: "స్లాట్ & రిపోర్టింగ్ సమయం",
    roomCounterLabel: "గది / కౌంటర్ సంఖ్య",
    complaintNotesLabel: "ప్రధాన సమస్య / నోట్స్",
    slipInstruction1: "• దయచేసి మీ కేటాయించిన స్లాట్ సమయానికి 15 నిమిషాల ముందు ఓపీడీ కౌంటర్‌కు చేరుకోండి.",
    slipInstruction2: "• ఓపీడీ ప్రవేశ డెస్క్ వద్ద బార్‌కోడ్/క్యూఆర్‌తో కూడిన ఈ డిజిటల్ లేదా ప్రింటెడ్ స్లిప్‌ను చూపించండి.",
    slipInstruction3: "• ప్రభుత్వ ఆసుపత్రిలో సంప్రదింపులు, ప్రాథమిక రక్త పరీక్షలు మరియు మందులు 100% ఉచితం.",

    // Footer
    quickLinks: "త్వరిత లింకులు",
    securityAccess: "భద్రత & ప్రవేశం",
    securityAccessDesc: "వైద్య రికార్డులు & ఆసుపత్రి క్యూ సమాచారం సురక్షిత లాగిన్ ద్వారా మాత్రమే లభ్యమవుతుంది.",
    portalAccess: "పోర్టల్ ప్రవేశం",
    emergencyHotlines: "అత్యవసర హెల్ప్‌లైన్‌లు",
    ambulance108: "🚑 108 - అంబులెన్స్",
    medicalAdvice104: "🩺 104 - ఆరోగ్య సలహా",
    nationalEmergency112: "🚨 112 - జాతీయ అత్యవసరం",
    hospitalLocation: "జిల్లా ఆసుపత్రి, భీమవరం",
    copyrightText: "వైద్య, ఆరోగ్య మరియు కుటుంబ సంక్షేమ శాఖ, ఆంధ్రప్రదేశ్ ప్రభుత్వం. సర్వహక్కులు ప్రత్యేకించబడ్డాయి.",
    isoStandards: "సురక్షిత పాత్ర-ఆధారిత ప్రవేశం · అంతర్జాతీయ ఆరోగ్య ప్రమాణాలు",

    // Common
    loading: "లోడ్ అవుతోంది...",
    save: "సేవ్ చేయండి",
    cancel: "రద్దు",
    statusConfirmed: "ధృవీకరించబడింది",
    statusCalled: "పిలవబడింది",
    statusInConsult: "కన్సల్టేషన్‌లో",
    statusCompleted: "పూర్తయింది",
    statusCancelled: "రద్దు చేయబడింది",
    statusNoShow: "హాజరుకాలేదు",
    statusPending: "పరిశీలనలో ఉంది",
    statusSubmitted: "సమర్పించబడింది",
    statusActive: "యాక్టివ్",
    statusInactive: "నిష్క్రియం",
    autoTeluguPreview: "తెలుగు లిపిలో (ఆటోమేటిక్):"
  },
  en: {
    // Brand & Banner
    pageTitle: "MediSlot | AP Government Hospital Appointments & OPD Queue",
    bannerGov: "Government of Andhra Pradesh · Department of Health, Medical & Family Welfare",
    emergency108: "Emergency: 108 | Health Info: 104",
    brandGov: "Government of Andhra Pradesh",
    brandDept: "Department of Health, Medical & Family Welfare",
    brandTagline: "Andhra Pradesh Smart OPD & Queue Management System",
    locationAP: "📍 West Godavari & AP Region",
    livePortal: "LIVE PORTAL",
    brandName: "MediSlot",

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
    controlCenter: "Control Center",
    manageOpds: "Manage OPDs",
    doctorLicensure: "Doctor Licensure",
    patients: "Patients",
    appointments: "Appointments",
    opdQueueBoard: "OPD Queue Board",
    dutySchedule: "Duty Schedule",
    bookOpdSlot: "Book OPD Slot",

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

    // Home sections
    popularDepts: "Specialized Clinical Departments",
    popularDeptsDesc: "Comprehensive OPD care provided across West Godavari and referral institutions",
    viewAllDepts: "View All Departments",
    consultSpecialist: "Consult Specialist",
    activeGovDoctors: "Active Duty Government Physicians",
    activeGovDoctorsDesc: "Verified clinical doctors available for sequential token OPD booking",
    fullDoctorDir: "Full Doctor Directory",
    bookAppointment: "Book Appointment",

    // OPD Booking & Directory
    bookingTitle: "OPD Appointment Booking",
    bookingSubtitle: "Select a verified hospital specialist, choose an open roster slot, and receive your official digital queue token.",
    lblHospital: "Select Hospital",
    lblDept: "Select Department",
    lblDoctor: "Select Doctor",
    lblDate: "Select Date",
    lblSlot: "Select Slot Time",
    lblSymptoms: "Chief Complaint / Symptoms",
    allDepts: "All Departments",
    allHospitals: "All Hospitals",
    allHospitalsOption: "All AP Government Hospitals",
    anyDoctor: "Any Doctor",
    searchAvailability: "Search OPD Availability",
    btnConfirmBooking: "Confirm Booking & Generate Token",
    noSlots: "Slots fully booked for this date",
    noSpecialistsAvail: "No active specialists available for this department/date",
    searchNameRole: "Search Name / Role",
    searchNamePlaceholder: "Dr. Ramesh, Cardiology...",
    clinicalSpecialty: "Clinical Specialty",
    hospitalFacility: "Hospital Facility",
    consultationDate: "Consultation Date",
    clearFilters: "Clear Filters",
    resetFilters: "Reset Filters",
    loadingDoctors: "Loading active specialists...",
    noDoctorsMatched: "No doctors matched your criteria for the selected date.",
    noDoctorsMatchedDesc: "Try adjusting your specialty filter or picking a different date.",
    expYears: "Yrs Exp",
    opdHours: "OPD Hours",
    availableSlotsCount: "Available Slots",
    allSlotsBookedDate: "All slots booked for this date",
    moreSlots: "more",
    bookOpdAppointment: "Book OPD Appointment",
    directoryTitle: "Specialist Doctor Directory & Availability",
    directorySubtitle: "Explore active clinical departments and reserve verified OPD slots with sequential token tracking",

    // Patient Form
    patientConsultDetails: "Patient Consultation Details",
    patientAge: "Patient Age (Years) *",
    patientGender: "Gender *",
    genderFemale: "Female",
    genderMale: "Male",
    genderOther: "Other",
    arogyasriIdOptional: "Arogyasri / ABHA ID (Optional)",
    symptomsPlaceholder: "Brief reason for visit (e.g. fever for 3 days, joint pain, routine BP checkup)...",
    confirmingBooking: "Confirming with Hospital Queue...",
    confirmBookingIssueSlip: "Confirm Booking & Issue Token Slip",
    allSlotsBookedPickAnother: "All slots are booked for this specialist on the selected date. Please pick another date.",

    // Hospitals Directory
    hospitalsTitle: "AP Government Hospitals & Live Bed Tracker",
    hospitalsSubtitle: "Real-time hospital bed status, ICU capacity, oxygen beds, and emergency care facilities across West Godavari and AP",
    loadingHospitals: "Loading hospital networks...",
    districtSuffix: "District",
    generalBeds: "General Beds",
    icuBeds: "ICU Beds",
    oxygenBeds: "Oxygen Beds",
    opdTimings: "OPD Timings",
    emergency: "Emergency",
    bookOpdAtHospital: "Book OPD at this Hospital",

    // Grievance Redressal
    grievanceTitle: "Citizen Grievance & Feedback Redressal",
    grievanceSubtitle: "Official Andhra Pradesh healthcare feedback portal for prompt resolution and oversight",
    fullName: "Full Name *",
    fullNamePlaceholder: "Citizen full name",
    mobile10Digits: "Mobile Number (10 Digits) *",
    categoryLabel: "Category",
    detailedFeedback: "Detailed Feedback / Issue *",
    detailedFeedbackPlaceholder: "Please describe your experience or grievance in detail...",
    submittingGrievance: "Submitting Grievance...",
    submitGrievanceBtn: "Submit Grievance to DMHO",
    grievanceSuccessTitle: "Grievance Lodged Successfully",
    grievanceSuccessDesc: "Your feedback has been routed to the District Medical & Health Officer (DMHO) oversight desk.",
    trackingRefId: "Tracking Reference ID:",
    submitAnotherGrievance: "Submit Another Grievance",
    catOpdWaiting: "OPD Waiting Time & Queue Management",
    catMedicineAvail: "Pharmacy / Free Medicine Availability",
    catSanitation: "Cleanliness & Sanitation",
    catDoctorAvail: "Doctor / Specialist Availability",
    catDiagnosticsLab: "Free Lab / Diagnostic Equipment",
    catOtherSuggestion: "Other Suggestions",
    grievanceAccountRequiredTitle: "Account Required to Lodge Grievance",
    grievanceAccountRequiredDesc: "Under government regulations, only registered citizens with an account can file grievances for official investigation and tracking. Please sign in or register a patient account to proceed.",
    grievanceSignInPrompt: "Sign In to Lodge Grievance",
    grievanceRegisterPrompt: "Register New Patient Account",
    grievanceLoggedInAs: "Logged in Citizen:",
    grievanceSubmitNotice: "Your grievance will be forwarded to the District Medical and Health Officer (DMHO) for review.",
    pleaseCompleteFields: "Please complete all required fields.",
    grievanceSubmitSuccess: "Grievance submitted successfully.",
    grievanceSubmitFail: "Failed to submit grievance.",

    // Patient Dashboard
    patientDashboard: "Patient Dashboard",
    myAppointments: "My Appointments",
    welcomeGreeting: "Welcome back",
    patientPortalSub: "Patient Portal · Mobile:",
    myProfileAbha: "My Profile & ABHA",
    bookNew: "Book New Appointment",
    activeUpcomingVisits: "Active Upcoming Visits",
    completedConsultations: "Completed Consultations",
    totalOpdRecords: "Total OPD Records",
    upcomingVisits: "Upcoming Consultations",
    bookAnother: "+ Book another appointment",
    loadingAppointments: "Loading appointments...",
    noUpcomingAppointments: "No active upcoming appointments.",
    needToVisitHospital: "Need to visit a hospital? Choose a specialist doctor and book your free OPD token.",
    bookOpdAppointmentBtn: "Book OPD Appointment",
    tokenBadge: "TOKEN",
    reportPrefix: "Report:",
    viewSlip: "View Slip",
    cancelAppt: "Cancel",
    rescheduleAppt: "Reschedule",
    bookAgain: "Book Again",
    myActiveTokenTitle: "My Active OPD Token & Live Queue Status",
    liveQueueEstimate: "Estimated Wait Time",
    tokensAhead: "Tokens Ahead",
    nowCalling: "Now Calling",
    rescheduleModalTitle: "Reschedule Appointment",
    selectNewDate: "Select New Date",
    selectNewSlot: "Select New Time Slot",
    confirmReschedule: "Confirm Reschedule",
    rescheduling: "Rescheduling...",
    emergencyHelpBtn: "Emergency Help (108/104)",
    pastVisits: "Past Consultation History",
    noPastVisits: "No past consultations recorded.",
    colRefId: "REF ID",
    colDoctor: "DOCTOR",
    colDept: "DEPARTMENT",
    colDateTime: "DATE & TIME",
    colStatusText: "STATUS",
    colActionText: "ACTION",
    slipBtn: "Slip",
    confirmCancelPrompt: "Are you sure you want to cancel this appointment? Your reserved slot will be freed.",

    // Patient Profile
    patientProfileTitle: "Patient Profile & Health ID",
    patientProfileSubtitle: "Manage your personal details, ABHA identification, and contact information.",
    emailPrimary: "Email (Account Primary)",
    mobileNumber: "Mobile Number",
    ageYears: "Age (Years)",
    genderLabel: "Gender",
    arogyasriAbhaId: "Arogyasri / ABHA Health ID",
    residentialAddress: "Residential Address",
    saveProfileChanges: "Save Profile Changes",
    savingProfile: "Saving...",

    // Patient Register
    createPatientAccount: "Create Patient Account",
    createPatientAccountSub: "Sign up for digital OPD slots and official queue tokens",
    agreeTermsLabel: "I accept the AP Public Health Privacy Policy & Terms.",
    alreadyAccount: "Already have an account?",
    loginHere: "Sign In here",
    registerPatientBtn: "Register as Patient",
    confirmPassword: "Confirm Password *",
    reEnterPassword: "Re-enter password",
    atLeast8Chars: "At least 8 chars",
    creatingAccount: "Creating Account...",
    completePatientReg: "Complete Patient Registration",
    passWeak: "Weak",
    passModerate: "Moderate",
    passStrong: "Strong",
    passVeryStrong: "Very Strong",

    // Patient Login
    patientLoginTitle: "Patient Portal Sign In",
    patientLoginSub: "Access your OPD consultation slips & token records",
    signInAsPatient: "Sign In as Patient",
    noAccountYet: "Don't have a patient account yet?",
    registerHere: "Register here",
    apEncryptedNotice: "Protected by AP Health encrypted authentication",

    // Doctor Login & Pending
    doctorLoginTitle: "Doctor OPD Portal Sign In",
    doctorLoginSub: "Manage daily OPD queues, patient consultations, and roster schedules",
    doctorOfficialEmail: "Doctor Email (Official / Registered)",
    authenticatingDoctor: "Authenticating Doctor...",
    signInAsDoctor: "Sign In as Doctor",
    newPhysicianQuestion: "New physician joining the platform?",
    applyRegisterHere: "Apply / Register here",
    appPendingVerification: "Application Status: PENDING VERIFICATION",
    doctorCredentialsReview: "Doctor Credentials Under Review",
    doctorPendingNotice: "Your clinical profile and medical credentials have been securely received. To maintain patient safety and medical governance across Andhra Pradesh Government health facilities, a system administrator must verify your license before your OPD queue is activated.",
    registeredDoctorLabel: "Registered Doctor:",
    officialEmailLabel: "Official Email:",
    mobileLabel: "Mobile:",
    verificationOfficeLabel: "Verification Office:",
    dmhoOffice: "DMHO / Hospital Administration",
    checkVerificationStatus: "Check Verification Status",

    // Doctor Register
    doctorPortalRegTitle: "Doctor Clinical Portal Registration",
    doctorPortalRegSub: "Join the Andhra Pradesh Government OPD Consultation System",
    doctorVerifyNoticeTitle: "Notice on Doctor Verification:",
    doctorVerifyNoticeText: "Doctor accounts are created with a Pending Verification status by default. The platform administrator will verify your medical license before you can appear as an active bookable provider.",
    doctorNameWithTitle: "Doctor Full Name (with Title) *",
    medSpecialization: "Medical Specialization *",
    yearsExperience: "Years of Clinical Experience *",
    medQualifications: "Medical Qualifications *",
    assignedHospital: "Assigned Hospital Facility *",
    submittingApplication: "Submitting Application...",
    submitDoctorApp: "Submit Doctor Application",
    alreadyRegistered: "Already registered?",

    // Doctor Dashboard & Queue
    doctorDashboard: "Doctor OPD Queue Board",
    doctorLiveQueueTitle: "Doctor OPD Live Queue Board",
    physicianLabel: "Physician:",
    deptLabel: "Department:",
    roomLabel: "Room:",
    manageAvailability: "Manage Availability",
    callingNextPatient: "Calling...",
    btnCallNext: "📢 Call Next Patient Token",
    btnWalkin: "➕ Issue Walk-in Token",
    metricCurrentToken: "Now Serving Token",
    metricWaiting: "Waiting Patients",
    metricInConsult: "In Consultation",
    metricDone: "Consultations Completed",
    todaysQueueTitle: "Today's Patient Consultation Queue",
    autoRefreshing: "Auto-refreshing every 15s · Total:",
    patientsCount: "Patients",
    loadingOpdQueue: "Loading OPD queue...",
    noPatientsInQueue: "No patients booked in queue for today yet.",
    walkinNotice: "Use the 'Issue Walk-in Token' button to register counter patients arriving directly at the hospital.",
    colToken: "Token #",
    colPatient: "Patient Details",
    colAgeGender: "AGE / GENDER",
    colSlot: "Slot",
    colSymptoms: "Chief Complaint",
    colStatus: "Status",
    colAction: "Actions",
    ageYrs: "Yrs",
    repShort: "Rep:",
    printTokenSlip: "Print Token Slip",
    issueWalkinTitle: "Issue Counter Walk-in Token",
    patientFullNameReq: "Patient Full Name *",
    contactPhoneOptional: "Contact Phone",
    ageYearsOptional: "Age (Years)",
    symptomsComplaint: "Symptoms / Complaint",
    generatingToken: "Generating Token...",
    generatePrintWalkin: "Generate & Print Walk-in Token",

    // Doctor Availability
    opdAvailabilityTitle: "OPD Consultation Availability & Roster",
    opdAvailabilitySubtitle: "Manage your active clinical shift hours, duty toggle, and appointment time slots.",
    opdDutyStatusToday: "OPD Duty Status for Today",
    dutyToggleDesc: "Toggle OFF if on leave, on emergency OT duty, or unavailable for consultations.",
    onDutyActive: "ON DUTY (Active)",
    offDutyInactive: "OFF DUTY (Unavailable)",
    availSlotsForPatients: "Available Time Slots for Patients",
    newSlotPlaceholder: "e.g. 02:00 PM",
    addSlotBtn: "Add Slot",
    saveRosterSchedule: "Save Schedule Roster",
    savingSchedule: "Saving...",

    // Unified Sign In
    portalLoginTitle: "MediSlot Healthcare Sign In",
    portalLoginSub: "Government Hospital OPD Appointments & Digital Queue Portal",
    singleGateway: "Single Gateway for Patients, Doctors & Admin",
    quickTestCredentials: "Quick Test Credentials (1-Click Fill):",
    doctorRole: "Doctor",
    patientRole: "Patient",
    adminRole: "Admin",
    emailAddress: "Email Address",
    passwordLabel: "Password",
    signInBtn: "Sign In",
    authenticating: "Authenticating...",
    autoRedirectNotice: "Automatic Role Redirection: Entering patient credentials opens the Patient Dashboard. Entering doctor credentials immediately opens the Doctor OPD Queue Dashboard.",
    newPatientQuestion: "New patient seeking care?",
    registerAsPatient: "Register as Patient",
    doctorJoiningQuestion: "Hospital doctor joining roster?",
    registerAsDoctor: "Register as Doctor",

    // Token Slip Modal
    tokenSlipTitle: "Official OPD Token Slip",
    printSlipBtn: "Print Slip",
    govtHeader: "Government of Andhra Pradesh · Department of Health & Family Welfare",
    outpatientSlipSubtitle: "Outpatient Department (OPD) Consultation Token Slip",
    yourTokenNumber: "Your Sequential Token Number",
    opdRefIdLabel: "OPD Reference ID:",
    patientNameLabel: "Patient Name",
    contactPhoneLabel: "Contact / Phone",
    ageGenderLabel: "Age & Gender",
    arogyasriLabel: "Arogyasri ID",
    specialistDoctorLabel: "Specialist Doctor",
    clinicalDeptLabel: "Clinical Department",
    opdDateLabel: "OPD Consultation Date",
    slotReportingLabel: "Slot & Reporting Time",
    roomCounterLabel: "Room / Counter Number",
    complaintNotesLabel: "Chief Complaint / Notes",
    slipInstruction1: "• Please arrive at the OPD Counter 15 minutes before your scheduled slot time.",
    slipInstruction2: "• Present this digital or printed slip with barcode/QR code at the OPD entrance desk.",
    slipInstruction3: "• Consultations, basic diagnostic blood tests, and government formulary medicines are 100% free of charge.",

    // Footer
    quickLinks: "Quick Links",
    securityAccess: "Security & Access",
    securityAccessDesc: "Medical records and hospital queue rosters are strictly secured behind verified role authentication.",
    portalAccess: "Portal Access",
    emergencyHotlines: "Emergency Hotlines",
    ambulance108: "🚑 108 - Ambulance",
    medicalAdvice104: "🩺 104 - Medical Advice",
    nationalEmergency112: "🚨 112 - National Emergency",
    hospitalLocation: "District Hospital, Bhimavaram",
    copyrightText: "Department of Health, Medical & Family Welfare, Govt. of Andhra Pradesh. All rights reserved.",
    isoStandards: "Secure Role-Based Access · ISO 27001 Healthcare Standards",

    // Common
    loading: "Loading...",
    save: "Save Changes",
    cancel: "Cancel",
    statusConfirmed: "Confirmed",
    statusCalled: "Called",
    statusInConsult: "In Consultation",
    statusCompleted: "Completed",
    statusCancelled: "Cancelled",
    statusNoShow: "No Show",
    statusPending: "Pending Verification",
    statusSubmitted: "Submitted",
    statusActive: "Active",
    statusInactive: "Inactive",
    autoTeluguPreview: "In Telugu Script (Automatic):"
  }
};

// --------------------------------------------------------------------------
// Multi-Language Translation Mapping Dictionaries
// --------------------------------------------------------------------------
export const DEPT_MAP: Record<string, { en: string; te: string }> = {
  'General Medicine': { en: 'General Medicine', te: 'సాధారణ వైద్య విభాగం' },
  'Cardiology': { en: 'Cardiology', te: 'గుండె వైద్య విభాగం' },
  'Pediatrics': { en: 'Pediatrics', te: 'శిశు & పిల్లల వైద్య విభాగం' },
  'Orthopedics': { en: 'Orthopedics', te: 'ఎముకల వైద్య విభాగం' },
  'Gynecology': { en: 'Gynecology', te: 'స్త్రీల వైద్య విభాగం' },
  'Ophthalmology': { en: 'Ophthalmology', te: 'కంటి వైద్య విభాగం' },
  'Dermatology': { en: 'Dermatology', te: 'చర్మ వైద్య విభాగం' },
  'ENT': { en: 'ENT', te: 'ఇ.ఎన్.టి (చెవి, ముక్కు, గొంతు) విభాగం' },
  'Neurology': { en: 'Neurology', te: 'నాడీ సంబంధిత వైద్య విభాగం' },
  'Pulmonology': { en: 'Pulmonology', te: 'శ్వాసకోశ వైద్య విభాగం' },
  'General Surgery': { en: 'General Surgery', te: 'సాధారణ శస్త్రచికిత్స విభాగం' },
  'Dental': { en: 'Dental', te: 'దంత వైద్య విభాగం' },
  'Emergency & Trauma': { en: 'Emergency & Trauma', te: 'అత్యవసర & ట్రౌమా విభాగం' },
  'Psychiatry': { en: 'Psychiatry', te: 'మానసిక వైద్య విభాగం' }
};

export const HOSP_MAP: Record<string, { en: string; te: string }> = {
  'GH_BHIMAVARAM': { en: 'Government District Hospital, Bhimavaram', te: 'ప్రభుత్వ జిల్లా ఆసుపత్రి, భీమవరం' },
  'AH_PALAKOLLU': { en: 'Area Hospital, Palakollu', te: 'ఏరియా ఆసుపత్రి, పాలకొల్లు' },
  'AH_TADEPALLIGUDEM': { en: 'Area Hospital, Tadepalligudem', te: 'ఏరియా ఆసుపత్రి, తాడేపల్లిగూడెం' },
  'CH_NARASAPURAM': { en: 'Community Health Centre, Narasapuram', te: 'సామాజిక ఆరోగ్య కేంద్రం, నరసాపురం' },
  'GGH_ELURU': { en: 'Government General Hospital (GGH), Eluru', te: 'ప్రభుత్వ సర్వజన ఆసుపత్రి (GGH), ఏలూరు' },
  'GGH_KAKINADA': { en: 'Rangaraya Government General Hospital, Kakinada', te: 'రంగరాయ ప్రభుత్వ సర్వజన ఆసుపత్రి, కాకినాడ' },
  'RGGH_KAKINADA': { en: 'Rangaraya Government General Hospital, Kakinada', te: 'రంగరాయ ప్రభుత్వ సర్వజన ఆసుపత్రి, కాకినాడ' },
  'Government District Hospital, Bhimavaram': { en: 'Government District Hospital, Bhimavaram', te: 'ప్రభుత్వ జిల్లా ఆసుపత్రి, భీమవరం' },
  'Area Hospital, Palakollu': { en: 'Area Hospital, Palakollu', te: 'ఏరియా ఆసుపత్రి, పాలకొల్లు' },
  'Government General Hospital (GGH), Eluru': { en: 'Government General Hospital (GGH), Eluru', te: 'ప్రభుత్వ సర్వజన ఆసుపత్రి (GGH), ఏలూరు' },
  'Rangaraya Government General Hospital, Kakinada': { en: 'Rangaraya Government General Hospital, Kakinada', te: 'రంగరాయ ప్రభుత్వ సర్వజన ఆసుపత్రి, కాకినాడ' },
  'District Hospital, Bhimavaram': { en: 'District Hospital, Bhimavaram', te: 'జిల్లా ఆసుపత్రి, భీమవరం' }
};

export const STATUS_MAP: Record<string, { en: string; te: string }> = {
  'WAITING': { en: 'Waiting in Queue', te: 'క్యూలో వేచి ఉన్నారు' },
  'CONFIRMED': { en: 'Confirmed', te: 'ధృవీకరించబడింది' },
  'CALLED': { en: 'Called', te: 'పిలవబడింది' },
  'IN_CONSULTATION': { en: 'In Consultation', te: 'కన్సల్టేషన్‌లో' },
  'INCONSULT': { en: 'In Consultation', te: 'కన్సల్టేషన్‌లో' },
  'SKIPPED': { en: 'Skipped / Delayed', te: 'వాయిదా వేయబడింది' },
  'COMPLETED': { en: 'Completed', te: 'పూర్తయింది' },
  'CANCELLED': { en: 'Cancelled', te: 'రద్దు చేయబడింది' },
  'NO_SHOW': { en: 'No Show', te: 'హాజరుకాలేదు' },
  'NOSHOW': { en: 'No Show', te: 'హాజరుకాలేదు' },
  'SUBMITTED': { en: 'Submitted', te: 'సమర్పించబడింది' },
  'PENDING': { en: 'Pending Verification', te: 'పరిశీలనలో ఉంది' },
  'VERIFIED': { en: 'Verified', te: 'ధృవీకరించబడింది' },
  'REJECTED': { en: 'Rejected', te: 'తిరస్కరించబడింది' },
  'ACTIVE': { en: 'Active', te: 'యాక్టివ్' },
  'INACTIVE': { en: 'Inactive', te: 'నిష్క్రియం' }
};

export const QUAL_MAP: Record<string, { en: string; te: string }> = {
  'MBBS, MD (General Medicine)': { en: 'MBBS, MD (General Medicine)', te: 'ఎంబీబీఎస్, ఎండీ (సాధారణ వైద్యం)' },
  'MBBS, DCH, MD (Pediatrics)': { en: 'MBBS, DCH, MD (Pediatrics)', te: 'ఎంబీబీఎస్, డీసీహెచ్, ఎండీ (పీడియాట్రిక్స్)' },
  'MBBS, MS (Orthopedics)': { en: 'MBBS, MS (Orthopedics)', te: 'ఎంబీబీఎస్, ఎంఎస్ (ఆర్థోపెడిక్స్)' },
  'MBBS, MS, DGO (Gynecology)': { en: 'MBBS, MS, DGO (Gynecology)', te: 'ఎంబీబీఎస్, ఎంఎస్, డీజీఓ (గైనకాలజీ)' },
  'MBBS, MD, DM (Cardiology)': { en: 'MBBS, MD, DM (Cardiology)', te: 'ఎంబీబీఎస్, ఎండీ, డీఎం (కార్డియాలజీ)' },
  'MBBS, MS (Ophthalmology)': { en: 'MBBS, MS (Ophthalmology)', te: 'ఎంబీబీఎస్, ఎంఎస్ (ఆప్తాల్మాలజీ)' },
  'MBBS, MD (Dermatology)': { en: 'MBBS, MD (Dermatology)', te: 'ఎంబీబీఎస్, ఎండీ (డెర్మటాలజీ)' },
  'MBBS, MS (ENT)': { en: 'MBBS, MS (ENT)', te: 'ఎంబీబీఎస్, ఎంఎస్ (ఈఎన్‌టీ)' },
  'MBBS, MD (Internal Medicine)': { en: 'MBBS, MD (Internal Medicine)', te: 'ఎంబీబీఎస్, ఎండీ (ఇంటర్నల్ మెడిసిన్)' },
  'MBBS, MD': { en: 'MBBS, MD', te: 'ఎంబీబీఎస్, ఎండీ' },
  'MBBS, MS': { en: 'MBBS, MS', te: 'ఎంబీబీఎస్, ఎంఎస్' },
  'MBBS, MD (Medicine), DM (Cardiology)': { en: 'MBBS, MD (Medicine), DM (Cardiology)', te: 'ఎంబీబీఎస్, ఎండీ (వైద్యం), డీఎం (కార్డియాలజీ)' },
  'MBBS, MD (Medicine)': { en: 'MBBS, MD (Medicine)', te: 'ఎంబీబీఎస్, ఎండీ (వైద్యం)' },
  'DM (Cardiology)': { en: 'DM (Cardiology)', te: 'డీఎం (కార్డియాలజీ)' },
  'MBBS': { en: 'MBBS', te: 'ఎంబీబీఎస్' }
};

export const DOC_MAP: Record<string, { en: string; te: string }> = {
  'Dr. Ramesh Babu': { en: 'Dr. Ramesh Babu', te: 'డాక్టర్ రమేష్ బాబు' },
  'Dr. K. Sita Devi': { en: 'Dr. K. Sita Devi', te: 'డాక్టర్ కె. సీతాదేవి' },
  'Dr. M. Srinivasa Rao': { en: 'Dr. M. Srinivasa Rao', te: 'డాక్టర్ ఎం. శ్రీనివాసరావు' },
  'Dr. P. Lakshmi': { en: 'Dr. P. Lakshmi', te: 'డాక్టర్ పి. లక్ష్మి' },
  'Dr. V. Suresh Kumar': { en: 'Dr. V. Suresh Kumar', te: 'డాక్టర్ వి. సురేష్ కుమార్' },
  'Dr. A. Madhavi': { en: 'Dr. A. Madhavi', te: 'డాక్టర్ ఎ. మాధవి' },
  'Dr. T. Venkat': { en: 'Dr. T. Venkat', te: 'డాక్టర్ టి. వెంకట్' },
  'Dr. S. Radhika': { en: 'Dr. S. Radhika', te: 'డాక్టర్ ఎస్. రాధిక' },
  'Dr. Ch. Prasad': { en: 'Dr. Ch. Prasad', te: 'డాక్టర్ సిహెచ్. ప్రసాద్' },
  'Dr. G. Anitha': { en: 'Dr. G. Anitha', te: 'డాక్టర్ జి. అనిత' },
  'Dr. Ch. Vijay Kumar': { en: 'Dr. Ch. Vijay Kumar', te: 'డాక్టర్ సిహెచ్. విజయ్ కుమార్' },
  'Dr. Ch Vijay Kumar': { en: 'Dr. Ch. Vijay Kumar', te: 'డాక్టర్ సిహెచ్. విజయ్ కుమార్' },
  'Dr. Ch.Vijay Kumar': { en: 'Dr. Ch. Vijay Kumar', te: 'డాక్టర్ సిహెచ్. విజయ్ కుమార్' },
  'Dr. Vijay Kumar': { en: 'Dr. Vijay Kumar', te: 'డాక్టర్ విజయ్ కుమార్' },
  'Ch. Vijay Kumar': { en: 'Dr. Ch. Vijay Kumar', te: 'డాక్టర్ సిహెచ్. విజయ్ కుమార్' },
  'Vijay Kumar': { en: 'Vijay Kumar', te: 'విజయ్ కుమార్' }
};

export type Translations = typeof translations['en'];

interface LanguageContextType {
  lang: Language;
  setLang: (lang: Language) => void;
  t: Translations;
  toggleLang: () => void;
  localizeDept: (dept?: string) => string;
  localizeHospital: (hospEn?: string, hospTe?: string) => string;
  localizeDoctor: (nameEn?: string, nameTe?: string) => string;
  localizeName: (name?: string) => string;
  localizeQual: (qual?: string) => string;
  localizeRoom: (room?: string) => string;
  localizeStatus: (status?: string) => string;
  localizeGender: (gender?: string) => string;
  localizeTime: (timeStr?: string) => string;
  localizeRole: (role?: string | null) => string;
  localizeLanguages: (langs?: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [lang, setLangState] = useState<Language>(() => {
    const saved = localStorage.getItem('medislot_lang') as Language;
    return saved === 'te' || saved === 'en' ? saved : 'te'; // Default to Telugu for local AP portal
  });

  const setLang = (newLang: Language) => {
    setLangState(newLang);
    localStorage.setItem('medislot_lang', newLang);
  };

  const toggleLang = () => {
    setLang(lang === 'en' ? 'te' : 'en');
  };

  const t = translations[lang];

  const localizeDept = (dept?: string): string => {
    if (!dept) return '';
    const clean = dept.trim();
    const match = DEPT_MAP[clean] || Object.entries(DEPT_MAP).find(([k]) => k.toLowerCase() === clean.toLowerCase())?.[1];
    if (match) return lang === 'te' ? match.te : match.en;
    return dept;
  };

  const localizeHospital = (hospEn?: string, hospTe?: string): string => {
    if (lang === 'te') {
      if (hospTe && /[\u0C00-\u0C7F]/.test(hospTe)) return hospTe;
      const target = (hospEn || hospTe || '').trim();
      if (!target) return '';
      const match = HOSP_MAP[target] || Object.entries(HOSP_MAP).find(([k]) => k.toLowerCase() === target.toLowerCase())?.[1];
      if (match) return match.te;
      return target;
    } else {
      if (hospEn && /[a-zA-Z]/.test(hospEn)) return hospEn;
      const target = (hospEn || hospTe || '').trim();
      if (!target) return '';
      const match = HOSP_MAP[target] || Object.entries(HOSP_MAP).find(([k]) => k.toLowerCase() === target.toLowerCase())?.[1];
      if (match) return match.en;
      for (const item of Object.values(HOSP_MAP)) {
        if (item.te === target) return item.en;
      }
      return target;
    }
  };

  /**
   * Localizes doctor name: checks whether nameTe has Telugu characters,
   * consults DOC_MAP, or dynamically transliterates into Telugu phonetically.
   */
  const localizeDoctor = (nameEn?: string, nameTe?: string): string => {
    if (lang === 'te') {
      if (nameTe && /[\u0C00-\u0C7F]/.test(nameTe)) {
        return nameTe;
      }
      const target = (nameEn || nameTe || '').trim();
      if (!target) return '';
      const match = DOC_MAP[target] || Object.entries(DOC_MAP).find(([k]) => k.toLowerCase() === target.toLowerCase())?.[1];
      if (match) return match.te;
      return transliterateNameToTelugu(target);
    } else {
      if (nameEn && /[a-zA-Z]/.test(nameEn)) {
        return nameEn;
      }
      const target = (nameEn || nameTe || '').trim();
      if (!target) return '';
      const match = DOC_MAP[target] || Object.entries(DOC_MAP).find(([k]) => k.toLowerCase() === target.toLowerCase())?.[1];
      if (match) return match.en;
      for (const item of Object.values(DOC_MAP)) {
        if (item.te === target) return item.en;
      }
      return target;
    }
  };

  /**
   * Localizes dynamic citizen, patient, or doctor name using phonetic transliteration into Telugu.
   */
  const localizeName = (name?: string): string => {
    if (!name) return '';
    if (lang === 'en') return name;
    return transliterateNameToTelugu(name);
  };

  const localizeQual = (qual?: string): string => {
    if (!qual) return '';
    const clean = qual.trim();
    const match = QUAL_MAP[clean] || Object.entries(QUAL_MAP).find(([k]) => k.toLowerCase() === clean.toLowerCase())?.[1];
    if (match) return lang === 'te' ? match.te : match.en;
    if (lang === 'te') {
      return qual
        .replace(/MBBS/gi, 'ఎంబీబీఎస్')
        .replace(/MD/gi, 'ఎండీ')
        .replace(/MS/gi, 'ఎంఎస్')
        .replace(/DCH/gi, 'డీసీహెచ్')
        .replace(/DM/gi, 'డీఎం')
        .replace(/DGO/gi, 'డీజీఓ')
        .replace(/Medicine/gi, 'వైద్యం')
        .replace(/Cardiology/gi, 'కార్డియాలజీ')
        .replace(/Pediatrics/gi, 'పీడియాట్రిక్స్')
        .replace(/Orthopedics/gi, 'ఆర్థోపెడిక్స్')
        .replace(/Gynecology/gi, 'గైనకాలజీ')
        .replace(/Ophthalmology/gi, 'ఆప్తాల్మాలజీ')
        .replace(/Dermatology/gi, 'డెర్మటాలజీ')
        .replace(/ENT/gi, 'ఈఎన్‌టీ')
        .replace(/Internal/gi, 'ఇంటర్నల్');
    }
    return qual;
  };

  const localizeRoom = (room?: string): string => {
    if (!room) return '';
    if (lang === 'te') {
      return room
        .replace(/Room/gi, 'గది')
        .replace(/Ground Floor/gi, 'గ్రౌండ్ ఫ్లోర్')
        .replace(/First Floor/gi, 'మొదటి అంతస్తు')
        .replace(/Second Floor/gi, 'రెండవ అంతస్తు')
        .replace(/OPD Super-Specialty/gi, 'ఓపీడీ సూపర్ స్పెషాలిటీ')
        .replace(/Super-Specialty/gi, 'సూపర్ స్పెషాలిటీ')
        .replace(/OPD Block/gi, 'ఓపీడీ బ్లాక్')
        .replace(/OPD/gi, 'ఓపీడీ')
        .replace(/Block/gi, 'బ్లాక్');
    }
    return room;
  };

  const localizeStatus = (status?: string): string => {
    if (!status) return '';
    const key = status.toUpperCase().replace(/\s+/g, '_');
    const match = STATUS_MAP[key];
    if (match) return lang === 'te' ? match.te : match.en;
    return status;
  };

  const localizeGender = (gender?: string): string => {
    if (!gender) return '';
    const g = gender.toUpperCase();
    if (g.startsWith('F')) return lang === 'te' ? 'స్త్రీ' : 'Female';
    if (g.startsWith('M')) return lang === 'te' ? 'పురుషుడు' : 'Male';
    return lang === 'te' ? 'ఇతర' : 'Other';
  };

  const localizeTime = (timeStr?: string): string => {
    if (!timeStr) return '';
    if (lang === 'te') {
      return timeStr
        .replace(/0?([0-9]|1[0-1]):([0-5][0-9])\s*AM/gi, 'ఉదయం $1:$2')
        .replace(/12:([0-5][0-9])\s*PM/gi, 'మధ్యాహ్నం 12:$1')
        .replace(/0?([1-4]):([0-5][0-9])\s*PM/gi, 'మధ్యాహ్నం $1:$2')
        .replace(/0?([5-9]|1[0-1]):([0-5][0-9])\s*PM/gi, 'సాయంత్రం $1:$2')
        .replace(/AM/gi, 'ఉదయం')
        .replace(/PM/gi, 'సాయంత్రం');
    }
    return timeStr;
  };

  const localizeRole = (role?: string | null): string => {
    const r = (role || '').toUpperCase();
    if (r === 'DOCTOR') return lang === 'te' ? 'వైద్యుడు' : 'Doctor';
    if (r === 'PATIENT') return lang === 'te' ? 'రోగి' : 'Patient';
    if (r === 'ADMIN') return lang === 'te' ? 'అడ్మిన్' : 'Admin';
    return role || '';
  };

  const localizeLanguages = (langs?: string): string => {
    if (!langs) return '';
    if (lang === 'te') {
      return langs
        .replace(/Telugu/gi, 'తెలుగు')
        .replace(/English/gi, 'ఇంగ్లీష్')
        .replace(/Hindi/gi, 'హిందీ');
    }
    return langs;
  };

  return (
    <LanguageContext.Provider value={{
      lang,
      setLang,
      t,
      toggleLang,
      localizeDept,
      localizeHospital,
      localizeDoctor,
      localizeName,
      localizeQual,
      localizeRoom,
      localizeStatus,
      localizeGender,
      localizeTime,
      localizeRole,
      localizeLanguages
    }}>
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
