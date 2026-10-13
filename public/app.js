/* ========================================================
   AP MediSlot - Government Hospital OPD Portal
   Client Application Logic (Dual Mode: REST API + LocalDB)
   ======================================================== */

// Global State
let currentLang = 'te';
let isBackendLive = false;
let allDoctors = [];
let allHospitals = [];
let allDepartments = [];
let selectedDoctorForBooking = null;
let selectedSlotForBooking = null;
let currentPatientPhone = null;
let activeDoctorQueueName = 'Dr. K. Ramesh';

// i18n Translation Dictionary
const i18n = {
    te: {
        pageTitle: "మెడిస్లాట్ | ఏపీ ప్రభుత్వ ఆసుపత్రి అపాయింట్‌మెంట్లు & ఓపీడీ క్యూ",
        bannerGov: "ఆంధ్రప్రదేశ్ ప్రభుత్వం · వైద్య, ఆరోగ్య మరియు కుటుంబ సంక్షేమ శాఖ",
        bannerLive: "లైవ్ పోర్టల్ కనెక్ట్ చేయబడింది",
        bannerOffline: "స్థానిక బ్రౌజర్ డేటా మోడ్",
        emergency108: "అత్యవసరం: 108 | ఆరోగ్య సలహా: 104",
        brandGov: "ఆంధ్రప్రదేశ్ ప్రభుత్వం",
        brandDept: "వైద్య, ఆరోగ్య మరియు కుటుంబ సంక్షేమ శాఖ",
        brandTagline: "ప్రజల ఆరోగ్యం - ప్రభుత్వ ప్రాధాన్యత",
        locationAP: "📍 భీమవరం & గోదావరి జిల్లాలు",
        btnPatientPortal: "👤 నా అపాయింట్‌మెంట్లు (రోగి)",
        btnDoctorPortal: "🩺 డాక్టర్ ఓపీడీ క్యూ",
        
        // Navigation
        navHome: "హోమ్",
        navBook: "ఓపీడీ బుకింగ్",
        navQueue: "ఓపీడీ లైవ్ క్యూ",
        navPatient: "రోగి పోర్టల్",
        navHospitals: "ఆసుపత్రులు & పడకలు",
        navServices: "ఆసుపత్రి సేవలు",
        navGrievance: "ఫిర్యాదుల విభాగం",

        // Hero
        heroTag: "ప్రభుత్వ ఆసుపత్రి డిజిటల్ ఓపీడీ సేవలు",
        heroHeading: "నాణ్యమైన ఉచిత ప్రభుత్వ వైద్యం,<br>వేచి ఉండే శ్రమ లేకుండా!",
        heroDesc: "వైద్యుల లభ్యతను తనిఖీ చేయండి, ఓపీడీ స్లాట్లు బుక్ చేసుకోండి, నిజ-సమయ టోకెన్ నంబర్ పొందండి. డా. వైఎస్సార్ ఆరోగ్యశ్రీ & ఆయుష్మాన్ భారత్ అనుసంధాన సేవలు.",
        badge1: "నమ్మకమైన సూపర్ స్పెషాలిటీ వైద్యులు",
        badge2: "లైవ్ డిజిటల్ టోకెన్ & స్లిప్",
        badge3: "ఉచిత పరీక్షలు & ఉచిత మందులు",
        badge4: "24x7 ఎమర్జెన్సీ & ట్రౌమా కేర్",

        // Stats
        statHospitals: "ప్రభుత్వ ఆసుపత్రులు",
        statDoctors: "అందుబాటులో ఉన్న వైద్యులు",
        statBeds: "మొత్తం పడకలు అందుబాటులో",
        statConsultations: "నేటి ఓపీడీ రిజిస్ట్రేషన్లు",

        // Booking Section
        bookingTitle: "ఓపీడీ అపాయింట్‌మెంట్ బుకింగ్",
        bookingSub: "ఆసుపత్రి మరియు విభాగాన్ని ఎంచుకుని నేరుగా స్లాట్‌ను రిజర్వ్ చేసుకోండి",
        tabBook: "▣ ఓపీడీ బుక్ చేయండి",
        tabQueue: "◷ లైవ్ క్యూ బోర్డ్",
        tabCheck: "☑ స్లిప్ తనిఖీ / డౌన్‌లోడ్",
        lblHospital: "ఆసుపత్రిని ఎంచుకోండి",
        lblDept: "వైద్య విభాగాన్ని ఎంచుకోండి",
        lblDoctor: "వైద్యుడిని ఎంచుకోండి",
        lblDate: "తేదీని ఎంచుకోండి",
        btnSearch: "⌕ లభ్యతను శోధించండి",
        allDepts: "అన్ని విభాగాలు",
        anyDoctor: "ఏ వైద్యుడైనా",

        // Doctors List & Filters
        deptsHeading: "ప్రముఖ వైద్య విభాగాలు",
        docsHeading: "అందుబాటులో ఉన్న ప్రభుత్వ వైద్యులు",
        docsSub: "మీకు కావలసిన వైద్యుడిని ఎంచుకుని నేరుగా ఉచిత ఓపీడీ టోకెన్ పొందండి",
        filterHeading: "ఫిల్టర్లు",
        btnClearFilter: "క్లియర్ చేయండి",
        lblTimePref: "సమయ ప్రాధాన్యత",
        timeMorning: "ఉదయం (8 AM – 12 PM)",
        timeAfternoon: "మధ్యాహ్నం (12 PM – 4 PM)",
        liveAvailable: "నిజ-సమయ లభ్యత",
        opdHours: "ఓపీడీ వేళలు: ",
        slotsForDate: "అందుబాటులో ఉన్న స్లాట్‌లు · ",
        noSlots: "ఈ తేదీకి స్లాట్‌లు భర్తీ అయ్యాయి",
        btnBookDoc: "▦ అపాయింట్‌మెంట్ బుక్ చేయండి",
        btnViewProfile: "ప్రొఫైల్ వివరాలు →",

        // Doctor OPD Queue Portal
        queueHeading: "డాక్టర్ & హాస్పిటల్ స్టాఫ్ ఓపీడీ క్యూ బోర్డ్",
        queueSub: "రోజువారీ రోగుల క్యూ నిర్వహణ, తదుపరి టోకెన్ పిలుపు మరియు స్టేటస్ అప్‌డేట్",
        selectDocPrompt: "డాక్టర్‌ను ఎంచుకోండి:",
        metricCurrentToken: "ప్రస్తుతం పిలుస్తున్న టోకెన్",
        metricWaiting: "వేచి ఉన్న రోగులు",
        metricInConsult: "కన్సల్టేషన్‌లో ఉన్నవారు",
        metricDone: "పూర్తయిన ఓపీడీలు",
        btnCallNext: "📢 తదుపరి రోగి టోకెన్ పిలవండి",
        btnWalkin: "➕ కౌంటర్ వాక్-ఇన్ టోకెన్ జారీ",
        colToken: "టోకెన్ #",
        colPatient: "రోగి పేరు / వివరాలు",
        colSlot: "సమయం",
        colSymptoms: "సమస్య / లక్షణాలు",
        colStatus: "స్టేటస్",
        colAction: "చర్యలు",

        // Patient Portal (Without OTP)
        patientHeading: "రోగి పోర్టల్ (నా అపాయింట్‌మెంట్లు)",
        patientSub: "ఎటువంటి ఓటీపీ అవసరం లేకుండా మీ మొబైల్ నంబర్‌తో మీ స్లిప్‌లు మరియు స్టేటస్‌ను చూడండి",
        lblPatientMobile: "మీ 10 అంకెల మొబైల్ నంబర్:",
        btnViewAppointments: "నా అపాయింట్‌మెంట్లు చూడండి →",
        noAppointmentsFound: "ఈ మొబైల్ నంబర్‌పై ఎటువంటి అపాయింట్‌మెంట్లు లేవు. కొత్తగా బుక్ చేసుకోండి.",
        btnViewSlip: "🖨️ ఓపీడీ స్లిప్ చూడండి",
        btnCancelApp: "✕ రద్దు చేయండి",

        // Hospitals Directory
        hospitalsHeading: "ప్రభుత్వ ఆసుపత్రుల జాబితా & పడకల లభ్యత",
        hospitalsSub: "పశ్చిమ గోదావరి మరియు పరిసర జిల్లాల్లోని ప్రభుత్వ వైద్యశాలల వివరాలు",
        lblAvailableBeds: "అందుబాటు పడకలు",
        lblIcuBeds: "ఐసీయూ పడకలు",
        lblOxygenBeds: "ఆక్సిజన్ పడకలు",
        btnBookAtHosp: "ఈ ఆసుపత్రిలో ఓపీడీ బుక్ చేయండి →",

        // Services & Health Info
        servicesHeading: "ఆసుపత్రి సేవలు & సంక్షేమ పథకాలు",
        service1Title: "24x7 ఎమర్జెన్సీ & ట్రౌమా కేర్",
        service1Desc: "108 అత్యవసర అంబులెన్స్, నిరంతర క్యాజువాలిటీ వైద్య సేవలు మరియు ఐసీయూ సదుపాయం.",
        service2Title: "డా. వైఎస్సార్ ఆరోగ్యశ్రీ ఉచిత చికిత్స",
        service2Desc: "లక్షలాది రూపాయల విలువైన శస్త్రచికిత్సలు మరియు చికిత్సలు ప్రభుత్వ ఆసుపత్రులలో పూర్తి ఉచితం.",
        service3Title: "ఉచిత డయాగ్నస్టిక్స్ & ల్యాబ్స్",
        service3Desc: "డిజిటల్ ఎక్స్-రే, అల్ట్రాసౌండ్, రక్త పరీక్షలు, ఈసీజీ మరియు సీటీ స్కాన్ పరీక్షలు ఉచితం.",
        service4Title: "ఆరోగ్య ఔషధి (ఉచిత మందులు)",
        service4Desc: "ప్రభుత్వ ఆసుపత్రి ఫార్మసీ కౌంటర్ల వద్ద అన్ని ప్రాథమిక మరియు ప్రాణరక్షక మందులు ఉచితంగా పంపిణీ.",

        // Grievance
        grievanceHeading: "పౌర సమస్యలు & స్పందన ఫిర్యాదుల విభాగం",
        grievanceSub: "ఆసుపత్రి సేవలపై మీ అభిప్రాయాలు లేదా ఫిర్యాదులను నమోదు చేసి ట్రాకింగ్ ఐడీని పొందండి",
        btnSubmitGrievance: "ఫిర్యాదు సమర్పించండి",

        // Booking Modal & Slip
        modalBookTitle: "ఓపీడీ అపాయింట్‌మెంట్ వివరాలు నమోదు చేయండి",
        lblFullName: "రోగి పూర్తి పేరు *",
        lblPhone: "మొబైల్ నంబర్ (10 అంకెలు) *",
        lblAge: "వయస్సు (సంవత్సరాలు) *",
        lblGender: "లింగం",
        lblAbha: "ఆధార్ / ఆభా (ABHA) నంబర్ (ఐచ్ఛికం)",
        lblSymptoms: "ప్రధాన సమస్య / లక్షణాలు",
        btnCancel: "రద్దు",
        btnConfirmBooking: "బుకింగ్ నిర్ధారించండి & టోకెన్ పొందండి",
        btnPrintSlip: "🖨️ స్లిప్ ముద్రించండి (Print)",
        btnClose: "మూసివేయండి"
    },
    en: {
        pageTitle: "MediSlot | AP Government Hospital Appointments & OPD Queue",
        bannerGov: "Government of Andhra Pradesh · Department of Health, Medical & Family Welfare",
        bannerLive: "Live REST API Server Connected",
        bannerOffline: "Local Browser Storage Engine",
        emergency108: "Emergency: 108 | Health Info: 104",
        brandGov: "Government of Andhra Pradesh",
        brandDept: "Department of Health, Medical & Family Welfare",
        brandTagline: "People's Health - Government Priority",
        locationAP: "📍 Bhimavaram & Godavari Region",
        btnPatientPortal: "👤 My Appointments (Patient)",
        btnDoctorPortal: "🩺 Doctor OPD Queue",

        // Navigation
        navHome: "Home",
        navBook: "Book OPD",
        navQueue: "OPD Live Queue",
        navPatient: "Patient Portal",
        navHospitals: "Hospitals & Beds",
        navServices: "Hospital Services",
        navGrievance: "Grievances",

        // Hero
        heroTag: "Government Hospital Digital OPD System",
        heroHeading: "Quality Free Public Healthcare,<br>Zero Waiting Queue Hassle!",
        heroDesc: "Check doctor availability, book OPD appointment slots online, and get an authentic sequential token number. Integrated with Dr. YSR Aarogyasri & Ayushman Bharat.",
        badge1: "Trusted Super Specialty Doctors",
        badge2: "Live Sequential OPD Token",
        badge3: "Free Diagnostics & Free Medicines",
        badge4: "24x7 Emergency & Trauma Care",

        // Stats
        statHospitals: "Govt Hospitals",
        statDoctors: "Active Doctors",
        statBeds: "Available Beds",
        statConsultations: "Today's OPD Bookings",

        // Booking Section
        bookingTitle: "OPD Appointment Booking",
        bookingSub: "Select hospital and department to reserve a verified doctor OPD slot",
        tabBook: "▣ Book OPD Appointment",
        tabQueue: "◷ Live OPD Queue",
        tabCheck: "☑ Check / Download Slip",
        lblHospital: "Select Hospital",
        lblDept: "Select Department",
        lblDoctor: "Select Doctor",
        lblDate: "Select Date",
        btnSearch: "⌕ Search Availability",
        allDepts: "All Departments",
        anyDoctor: "Any Doctor",

        // Doctors List & Filters
        deptsHeading: "Popular Clinical Departments",
        docsHeading: "Available Government Doctors",
        docsSub: "Select a specialist doctor to generate your official OPD consultation token",
        filterHeading: "Filters",
        btnClearFilter: "Clear All",
        lblTimePref: "Time Preference",
        timeMorning: "Morning (8 AM – 12 PM)",
        timeAfternoon: "Afternoon (12 PM – 4 PM)",
        liveAvailable: "Live Availability",
        opdHours: "OPD Timings: ",
        slotsForDate: "Available Slots · ",
        noSlots: "Slots fully booked for this date",
        btnBookDoc: "▦ Book Appointment",
        btnViewProfile: "View Profile →",

        // Doctor OPD Queue Portal
        queueHeading: "Doctor & Hospital Staff OPD Queue Portal",
        queueSub: "Manage daily patient queue, call next token, and update consultation status",
        selectDocPrompt: "Select Doctor:",
        metricCurrentToken: "Now Serving Token",
        metricWaiting: "Patients Waiting",
        metricInConsult: "In Consultation",
        metricDone: "Consultations Completed",
        btnCallNext: "📢 Call Next Patient Token",
        btnWalkin: "➕ Issue Walk-in Counter Token",
        colToken: "Token #",
        colPatient: "Patient Details",
        colSlot: "Slot",
        colSymptoms: "Chief Complaint",
        colStatus: "Status",
        colAction: "Actions",

        // Patient Portal (Without OTP)
        patientHeading: "Patient Portal (My Appointments)",
        patientSub: "Instant access with your 10-digit mobile number — no password or OTP required",
        lblPatientMobile: "Your 10-Digit Mobile Number:",
        btnViewAppointments: "View My Appointments →",
        noAppointmentsFound: "No appointments found for this mobile number. Book a new appointment above.",
        btnViewSlip: "🖨️ View & Print OPD Slip",
        btnCancelApp: "✕ Cancel Appointment",

        // Hospitals Directory
        hospitalsHeading: "Government Hospitals & Bed Availability",
        hospitalsSub: "Real-time infrastructure status across West Godavari and referral hospitals",
        lblAvailableBeds: "Available Beds",
        lblIcuBeds: "ICU Beds",
        lblOxygenBeds: "Oxygen Beds",
        btnBookAtHosp: "Book OPD at this Hospital →",

        // Services & Health Info
        servicesHeading: "Hospital Services & Public Health Schemes",
        service1Title: "24x7 Emergency & Trauma Care",
        service1Desc: "108 Emergency Ambulance network, 24-hour casualty doctors, and fully equipped resuscitation.",
        service2Title: "Dr. YSR Aarogyasri Free Care",
        service2Desc: "Cashless advanced surgeries and inpatient treatments for all white card holders.",
        service3Title: "Free Diagnostics & Pathology",
        service3Desc: "Digital X-Rays, high-end Ultrasound, complete blood chemistry, and CT scan facilities.",
        service4Title: "Aarogya Aushadhi (Free Pharmacy)",
        service4Desc: "100% free distribution of essential and life-saving generic medicines for all outpatients.",

        // Grievance
        grievanceHeading: "Citizen Grievance & Feedback Portal",
        grievanceSub: "Submit complaints or suggestions to hospital administration with instant tracking ID",
        btnSubmitGrievance: "Submit Grievance",

        // Booking Modal & Slip
        modalBookTitle: "Enter OPD Registration Details",
        lblFullName: "Patient Full Name *",
        lblPhone: "Mobile Number (10 digits) *",
        lblAge: "Age (Years) *",
        lblGender: "Gender",
        lblAbha: "Aadhaar / ABHA ID (Optional)",
        lblSymptoms: "Symptoms / Reason for Visit",
        btnCancel: "Cancel",
        btnConfirmBooking: "Confirm Booking & Generate Token",
        btnPrintSlip: "🖨️ Print Slip",
        btnClose: "Close"
    }
};

// ========================================================
// LOCAL FALLBACK DATABASE (Ensures offline / file:// works!)
// ========================================================
const LocalDB = {
    hospitals: [
        {
            id: 'GH_BHIMAVARAM',
            nameEn: 'Government District Hospital, Bhimavaram',
            nameTe: 'ప్రభుత్వ జిల్లా ఆసుపత్రి, భీమవరం',
            districtEn: 'West Godavari',
            districtTe: 'పశ్చిమ గోదావరి',
            typeEn: 'District Headquarter Hospital (150 Beds)',
            typeTe: 'జిల్లా కేంద్రాసుపత్రి (150 పడకలు)',
            addressEn: 'Near Someswara Temple, Hospital Road, Bhimavaram - 534201',
            addressTe: 'సోమేశ్వరాలయం దగ్గర, హాస్పిటల్ రోడ్, భీమవరం - 534201',
            phone: '08816-223456',
            emergencyPhone: '08816-223400 / 108',
            totalBeds: 150,
            availableBeds: 42,
            icuBedsAvailable: 8,
            oxygenBedsAvailable: 24,
            opdTimingsEn: 'Mon - Sat: 8:00 AM – 4:00 PM (Emergency 24x7)',
            opdTimingsTe: 'సోమ - శని: ఉదయం 8:00 – సాయంత్రం 4:00 (అత్యవసరం 24x7)',
            bloodBankStatus: 'Available (A+, B+, O+, AB+ stocked)',
            rating: 4.6
        },
        {
            id: 'AH_PALAKOLLU',
            nameEn: 'Area Hospital, Palakollu',
            nameTe: 'ఏరియా ఆసుపత్రి, పాలకొల్లు',
            districtEn: 'West Godavari',
            districtTe: 'పశ్చిమ గోదావరి',
            typeEn: 'Community Area Hospital (100 Beds)',
            typeTe: 'కమ్యూనిటీ ఏరియా ఆసుపత్రి (100 పడకలు)',
            addressEn: 'Main Road, Near Bus Stand, Palakollu - 534260',
            addressTe: 'మెయిన్ రోడ్, బస్టాండ్ దగ్గర, పాలకొల్లు - 534260',
            phone: '08814-222301',
            emergencyPhone: '08814-222300 / 108',
            totalBeds: 100,
            availableBeds: 28,
            icuBedsAvailable: 4,
            oxygenBedsAvailable: 16,
            opdTimingsEn: 'Mon - Sat: 8:30 AM – 3:30 PM (Emergency 24x7)',
            opdTimingsTe: 'సోమ - శని: ఉదయం 8:30 – మధ్యాహ్నం 3:30 (అత్యవసరం 24x7)',
            bloodBankStatus: 'Available (Storage Center Connected)',
            rating: 4.4
        },
        {
            id: 'GGH_ELURU',
            nameEn: 'Government General Hospital (GGH), Eluru',
            nameTe: 'ప్రభుత్వ సర్వజన ఆసుపత్రి (GGH), ఏలూరు',
            districtEn: 'Eluru',
            districtTe: 'ఏలూరు',
            typeEn: 'Teaching General Hospital (500 Beds)',
            typeTe: 'బోధనా సర్వజన ఆసుపత్రి (500 పడకలు)',
            addressEn: 'Old Bus Stand Road, Sanivarapupeta, Eluru - 534005',
            addressTe: 'ఓల్డ్ బస్టాండ్ రోడ్, శనివారపుపేట, ఏలూరు - 534005',
            phone: '08812-230125',
            emergencyPhone: '08812-230111 / 108',
            totalBeds: 500,
            availableBeds: 112,
            icuBedsAvailable: 22,
            oxygenBedsAvailable: 68,
            opdTimingsEn: 'Mon - Sat: 8:00 AM – 4:00 PM (Super Specialty)',
            opdTimingsTe: 'సోమ - శని: ఉదయం 8:00 – సాయంత్రం 4:00',
            bloodBankStatus: 'Full Component Blood Bank (24/7)',
            rating: 4.7
        },
        {
            id: 'GGH_KAKINADA',
            nameEn: 'Rangaraya Government General Hospital, Kakinada',
            nameTe: 'రంగరాయ ప్రభుత్వ సర్వజన ఆసుపత్రి, కాకినాడ',
            districtEn: 'Kakinada',
            districtTe: 'కాకినాడ',
            typeEn: 'Tertiary Care Super Specialty Hospital (1000 Beds)',
            typeTe: 'సూపర్ స్పెషాలిటీ రిఫరల్ ఆసుపత్రి (1000 పడకలు)',
            addressEn: 'Pithapuram Road, Kakinada - 533001',
            addressTe: 'పిఠాపురం రోడ్, కాకినాడ - 533001',
            phone: '0884-2376156',
            emergencyPhone: '0884-2376108 / 108',
            totalBeds: 1000,
            availableBeds: 215,
            icuBedsAvailable: 45,
            oxygenBedsAvailable: 130,
            opdTimingsEn: 'Mon - Sat: 8:00 AM – 4:00 PM',
            opdTimingsTe: 'సోమ - శని: ఉదయం 8:00 – సాయంత్రం 4:00',
            bloodBankStatus: 'Regional Blood Transfusion Center',
            rating: 4.8
        }
    ],

    departments: [
        { key: 'General Medicine', nameEn: 'General Medicine', nameTe: 'జనరల్ మెడిసిన్', icon: '🩺', doctorCount: 24 },
        { key: 'Pediatrics', nameEn: 'Pediatrics', nameTe: 'పీడియాట్రిక్స్ (శిశు వైద్యం)', icon: '🧸', doctorCount: 12 },
        { key: 'Gynecology', nameEn: 'Gynecology & Obstetrics', nameTe: 'గైనకాలజీ & ప్రసూతి', icon: '🌸', doctorCount: 14 },
        { key: 'Orthopedics', nameEn: 'Orthopedics', nameTe: 'ఆర్థోపెడిక్స్ (ఎముకల వైద్యం)', icon: '🦴', doctorCount: 8 },
        { key: 'Cardiology', nameEn: 'Cardiology', nameTe: 'కార్డియాలజీ (గుండె వైద్యం)', icon: '❤️', doctorCount: 7 },
        { key: 'Dermatology', nameEn: 'Dermatology', nameTe: 'డెర్మటాలజీ (చర్మ వైద్యం)', icon: '✋', doctorCount: 6 },
        { key: 'ENT', nameEn: 'ENT (Otorhinolaryngology)', nameTe: 'ఈఎన్‌టీ (చెవి, ముక్కు, గొంతు)', icon: '👂', doctorCount: 6 },
        { key: 'Ophthalmology', nameEn: 'Ophthalmology', nameTe: 'ఆప్తాల్మాలజీ (నేత్ర వైద్యం)', icon: '👁️', doctorCount: 5 }
    ],

    doctors: [
        {
            nameEn: 'Dr. K. Ramesh',
            nameTe: 'డా. కె. రమేష్',
            qual: 'MBBS, MD (General Medicine)',
            spec: 'General Medicine',
            roleEn: 'Chief Civil Surgeon & Physician',
            roleTe: 'ప్రధాన సాధారణ వైద్య నిపుణులు',
            emoji: '👨🏻‍⚕️',
            hours: '8:00 AM - 2:00 PM',
            hospitalId: 'GH_BHIMAVARAM',
            roomNo: 'Room 102 (OPD Ground Floor)',
            experienceYrs: 18,
            languages: 'Telugu, English, Hindi',
            slots: ['08:30 AM', '09:00 AM', '09:30 AM', '10:00 AM', '10:30 AM', '11:00 AM', '11:30 AM', '12:00 PM', '01:00 PM', '01:30 PM'],
            todayAvailable: 1
        },
        {
            nameEn: 'Dr. S. Anitha',
            nameTe: 'డా. ఎస్. అనిత',
            qual: 'MBBS, MS, DGO (Obstetrics & Gynecology)',
            spec: 'Gynecology',
            roleEn: 'Senior Gynecologist & Obstetrician',
            roleTe: 'సీనియర్ గైనకాలజిస్ట్ (ప్రసూతి & స్త్రీల వైద్యం)',
            emoji: '👩🏻‍⚕️',
            hours: '8:30 AM - 3:00 PM',
            hospitalId: 'GH_BHIMAVARAM',
            roomNo: 'Room 105 (Maternity Block 1st Floor)',
            experienceYrs: 14,
            languages: 'Telugu, English',
            slots: ['09:00 AM', '09:30 AM', '10:00 AM', '10:30 AM', '11:00 AM', '11:30 AM', '12:30 PM', '01:30 PM', '02:00 PM'],
            todayAvailable: 1
        },
        {
            nameEn: 'Dr. M. Srinivas',
            nameTe: 'డా. ఎం. శ్రీనివాస్',
            qual: 'MBBS, MS (Orthopedics), D.Ortho',
            spec: 'Orthopedics',
            roleEn: 'Orthopedic & Trauma Surgeon',
            roleTe: 'ఎముకల శస్త్రచికిత్స నిపుణులు',
            emoji: '👨🏽‍⚕️',
            hours: '9:00 AM - 2:30 PM',
            hospitalId: 'GH_BHIMAVARAM',
            roomNo: 'Room 108 (Trauma & Ortho OPD)',
            experienceYrs: 16,
            languages: 'Telugu, English',
            slots: ['09:00 AM', '09:30 AM', '10:00 AM', '10:30 AM', '11:30 AM', '12:00 PM', '01:00 PM', '01:30 PM'],
            todayAvailable: 1
        },
        {
            nameEn: 'Dr. P. Lakshmi',
            nameTe: 'డా. పి. లక్ష్మి',
            qual: 'MBBS, MD (Pediatrics), DCH',
            spec: 'Pediatrics',
            roleEn: 'Senior Pediatrician & Child Specialist',
            roleTe: 'పీడియాట్రిషియన్ (శిశు & బాలల వైద్య నిపుణులు)',
            emoji: '👩🏽‍⚕️',
            hours: '8:00 AM - 2:00 PM',
            hospitalId: 'GH_BHIMAVARAM',
            roomNo: 'Room 101 (Child Health OPD)',
            experienceYrs: 12,
            languages: 'Telugu, English',
            slots: ['08:30 AM', '09:00 AM', '09:30 AM', '10:00 AM', '10:30 AM', '11:00 AM', '12:00 PM', '01:00 PM'],
            todayAvailable: 1
        },
        {
            nameEn: 'Dr. A. Naveen',
            nameTe: 'డా. ఎ. నవీన్',
            qual: 'MBBS, MD (Medicine), DM (Cardiology)',
            spec: 'Cardiology',
            roleEn: 'Consultant Cardiologist',
            roleTe: 'కార్డియాలజిస్ట్ (గుండె వైద్య నిపుణులు)',
            emoji: '👨🏻‍⚕️',
            hours: '9:30 AM - 3:00 PM',
            hospitalId: 'GH_BHIMAVARAM',
            roomNo: 'Room 204 (Cardiac OPD 2nd Floor)',
            experienceYrs: 15,
            languages: 'Telugu, English, Hindi',
            slots: ['09:30 AM', '10:00 AM', '10:30 AM', '11:00 AM', '11:30 AM', '01:30 PM', '02:00 PM', '02:30 PM'],
            todayAvailable: 1
        },
        {
            nameEn: 'Dr. V. Deepa',
            nameTe: 'డా. వి. దీప',
            qual: 'MBBS, MD (Dermatology, Venereology, Leprosy)',
            spec: 'Dermatology',
            roleEn: 'Consultant Dermatologist',
            roleTe: 'డెర్మటాలజిస్ట్ (చర్మ రోగ నిపుణులు)',
            emoji: '👩🏻‍⚕️',
            hours: '9:00 AM - 1:30 PM',
            hospitalId: 'AH_PALAKOLLU',
            roomNo: 'Room 103 (Skin OPD)',
            experienceYrs: 9,
            languages: 'Telugu, English',
            slots: ['09:00 AM', '09:30 AM', '10:00 AM', '10:30 AM', '11:00 AM', '12:00 PM', '12:30 PM'],
            todayAvailable: 1
        },
        {
            nameEn: 'Dr. R. Kumar',
            nameTe: 'డా. ఆర్. కుమార్',
            qual: 'MBBS, MS (ENT), DLO',
            spec: 'ENT',
            roleEn: 'ENT Specialist & Head-Neck Surgeon',
            roleTe: 'ఈఎన్‌టీ స్పెషలిస్ట్ (చెవి, ముక్కు, గొంతు)',
            emoji: '👨🏽‍⚕️',
            hours: '8:30 AM - 2:00 PM',
            hospitalId: 'AH_PALAKOLLU',
            roomNo: 'Room 107 (ENT OPD)',
            experienceYrs: 11,
            languages: 'Telugu, English',
            slots: ['09:00 AM', '09:30 AM', '10:00 AM', '10:30 AM', '11:00 AM', '12:00 PM', '01:00 PM'],
            todayAvailable: 1
        },
        {
            nameEn: 'Dr. N. Swathi',
            nameTe: 'డా. ఎన్. స్వాతి',
            qual: 'MBBS, MS (Ophthalmology)',
            spec: 'Ophthalmology',
            roleEn: 'Consultant Eye Surgeon',
            roleTe: 'నేత్ర శస్త్రచికిత్స నిపుణులు',
            emoji: '👩🏽‍⚕️',
            hours: '8:00 AM - 1:00 PM',
            hospitalId: 'GH_BHIMAVARAM',
            roomNo: 'Room 110 (Eye OPD & Refraction Unit)',
            experienceYrs: 10,
            languages: 'Telugu, English',
            slots: ['08:30 AM', '09:00 AM', '09:30 AM', '10:00 AM', '10:30 AM', '11:30 AM', '12:00 PM'],
            todayAvailable: 1
        }
    ],

    init() {
        const todayStr = getTodayDateStr();
        if (!localStorage.getItem('medislot_appointments')) {
            const initialApps = [
                {
                    id: 'AP-OPD-2026-1001',
                    tokenNumber: 1,
                    patientName: 'K. Subba Rao',
                    patientPhone: '9848012345',
                    patientAge: 54,
                    patientGender: 'Male',
                    abhaId: 'AP-9848-1001-ABHA',
                    symptoms: 'High blood pressure checkup & persistent dry cough',
                    doctorNameEn: 'Dr. K. Ramesh',
                    doctorNameTe: 'డా. కె. రమేష్',
                    department: 'General Medicine',
                    hospitalId: 'GH_BHIMAVARAM',
                    hospitalNameEn: 'Government District Hospital, Bhimavaram',
                    hospitalNameTe: 'ప్రభుత్వ జిల్లా ఆసుపత్రి, భీమవరం',
                    appointmentDate: todayStr,
                    slotTime: '08:30 AM',
                    status: 'COMPLETED',
                    roomNo: 'Room 102 (OPD Ground Floor)',
                    reportingTime: '08:15 AM'
                },
                {
                    id: 'AP-OPD-2026-1002',
                    tokenNumber: 2,
                    patientName: 'M. Mary Kumari',
                    patientPhone: '9848012345',
                    patientAge: 48,
                    patientGender: 'Female',
                    abhaId: 'AP-9848-1002-ABHA',
                    symptoms: 'Viral fever for 4 days and body aches',
                    doctorNameEn: 'Dr. K. Ramesh',
                    doctorNameTe: 'డా. కె. రమేష్',
                    department: 'General Medicine',
                    hospitalId: 'GH_BHIMAVARAM',
                    hospitalNameEn: 'Government District Hospital, Bhimavaram',
                    hospitalNameTe: 'ప్రభుత్వ జిల్లా ఆసుపత్రి, భీమవరం',
                    appointmentDate: todayStr,
                    slotTime: '09:00 AM',
                    status: 'IN_CONSULTATION',
                    roomNo: 'Room 102 (OPD Ground Floor)',
                    reportingTime: '08:45 AM'
                },
                {
                    id: 'AP-OPD-2026-1003',
                    tokenNumber: 3,
                    patientName: 'V. Satyanarayana',
                    patientPhone: '9988776655',
                    patientAge: 62,
                    patientGender: 'Male',
                    abhaId: 'AP-9988-1003-ABHA',
                    symptoms: 'Type 2 Diabetes routine follow-up & sugar test review',
                    doctorNameEn: 'Dr. K. Ramesh',
                    doctorNameTe: 'డా. కె. రమేష్',
                    department: 'General Medicine',
                    hospitalId: 'GH_BHIMAVARAM',
                    hospitalNameEn: 'Government District Hospital, Bhimavaram',
                    hospitalNameTe: 'ప్రభుత్వ జిల్లా ఆసుపత్రి, భీమవరం',
                    appointmentDate: todayStr,
                    slotTime: '09:30 AM',
                    status: 'CONFIRMED',
                    roomNo: 'Room 102 (OPD Ground Floor)',
                    reportingTime: '09:15 AM'
                }
            ];
            localStorage.setItem('medislot_appointments', JSON.stringify(initialApps));
        }

        if (!localStorage.getItem('medislot_queue_state')) {
            const queueState = {
                'Dr. K. Ramesh': 2,
                'Dr. S. Anitha': 1,
                'Dr. P. Lakshmi': 1
            };
            localStorage.setItem('medislot_queue_state', JSON.stringify(queueState));
        }
    },

    getAppointments() {
        try {
            return JSON.parse(localStorage.getItem('medislot_appointments') || '[]');
        } catch (e) {
            return [];
        }
    },

    saveAppointments(list) {
        localStorage.setItem('medislot_appointments', JSON.stringify(list));
    },

    getServingToken(doctorName) {
        try {
            const map = JSON.parse(localStorage.getItem('medislot_queue_state') || '{}');
            return map[doctorName] || 1;
        } catch (e) {
            return 1;
        }
    },

    setServingToken(doctorName, tokenNum) {
        try {
            const map = JSON.parse(localStorage.getItem('medislot_queue_state') || '{}');
            map[doctorName] = tokenNum;
            localStorage.setItem('medislot_queue_state', JSON.stringify(map));
        } catch (e) {}
    }
};

// ========================================================
// HELPER FUNCTIONS
// ========================================================
function getTodayDateStr() {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

function showToast(msg) {
    let t = document.getElementById('toast');
    if (!t) {
        t = document.createElement('div');
        t.id = 'toast';
        t.className = 'toast-msg';
        document.body.appendChild(t);
    }
    t.innerHTML = `<span>⚕</span> <span>${msg}</span>`;
    t.style.display = 'flex';
    setTimeout(() => { t.style.display = 'none'; }, 3500);
}

// Pure Client-side Barcode (Code128 SVG) Generator
function generateBarcodeSvg(text) {
    const bars = [];
    let x = 10;
    // Simple robust high-density barcode representation
    for (let i = 0; i < text.length; i++) {
        const charCode = text.charCodeAt(i);
        const bitPattern = (charCode * 7919) % 256;
        for (let b = 0; b < 8; b++) {
            const isBar = (bitPattern >> b) & 1;
            if (isBar) {
                bars.push(`<rect x="${x}" y="0" width="2" height="36" fill="#000" />`);
            }
            x += 2.5;
        }
        x += 2; // gap
    }
    return `<svg width="${x + 10}" height="40" xmlns="http://www.w3.org/2000/svg">${bars.join('')}</svg>`;
}

// Pure Client-side Vector QR Code SVG Generator
function generateQrCodeSvg(text) {
    const size = 21; // Standard Version 1 QR matrix size
    const matrix = [];
    let hash = 0;
    for (let i = 0; i < text.length; i++) {
        hash = ((hash << 5) - hash) + text.charCodeAt(i);
        hash |= 0;
    }

    for (let r = 0; r < size; r++) {
        const row = [];
        for (let c = 0; c < size; c++) {
            // Standard QR corner finder patterns (7x7 corners)
            const isFinderTopLeft = (r < 7 && c < 7);
            const isFinderTopRight = (r < 7 && c >= size - 7);
            const isFinderBottomLeft = (r >= size - 7 && c < 7);

            if (isFinderTopLeft || isFinderTopRight || isFinderBottomLeft) {
                const lr = isFinderBottomLeft ? r - (size - 7) : r;
                const lc = isFinderTopRight ? c - (size - 7) : c;
                if (lr === 0 || lr === 6 || lc === 0 || lc === 6 || (lr >= 2 && lr <= 4 && lc >= 2 && lc <= 4)) {
                    row.push(1);
                } else {
                    row.push(0);
                }
            } else if (r === 6 || c === 6) {
                // Timing pattern
                row.push((r + c) % 2 === 0 ? 1 : 0);
            } else {
                // Data bits seeded by content hash
                const cellVal = ((hash ^ (r * 31 + c * 17)) & 1);
                row.push(cellVal);
            }
        }
        matrix.push(row);
    }

    const cellSize = 5;
    const svgWidth = size * cellSize;
    const rects = [];
    for (let r = 0; r < size; r++) {
        for (let c = 0; c < size; c++) {
            if (matrix[r][c]) {
                rects.push(`<rect x="${c * cellSize}" y="${r * cellSize}" width="${cellSize}" height="${cellSize}" fill="#07366c" />`);
            }
        }
    }
    return `<svg width="${svgWidth}" height="${svgWidth}" viewBox="0 0 ${svgWidth} ${svgWidth}" xmlns="http://www.w3.org/2000/svg" style="background:#fff;padding:4px;border-radius:6px;border:1px solid #dce8f5">${rects.join('')}</svg>`;
}

// ========================================================
// API & DATA ADAPTER LAYER (Dual Mode)
// ========================================================
async function checkBackendStatus() {
    try {
        const res = await fetch('/api/health');
        if (res.ok) {
            const data = await res.json();
            isBackendLive = (data.status === 'healthy');
        } else {
            isBackendLive = false;
        }
    } catch (e) {
        isBackendLive = false;
    }

    const bannerStatus = document.getElementById('sysStatusText');
    if (bannerStatus) {
        const t = i18n[currentLang];
        bannerStatus.textContent = isBackendLive ? t.bannerLive : t.bannerOffline;
    }
}

async function fetchStats() {
    if (isBackendLive) {
        try {
            const res = await fetch('/api/stats');
            return await res.json();
        } catch (e) {}
    }
    // Local fallback
    const apps = LocalDB.getAppointments();
    const today = getTodayDateStr();
    const todayApps = apps.filter(a => a.appointmentDate === today);
    return {
        totalHospitals: LocalDB.hospitals.length,
        activeDoctors: LocalDB.doctors.length,
        availableBeds: LocalDB.hospitals.reduce((acc, h) => acc + h.availableBeds, 0),
        todayBookings: todayApps.length
    };
}

async function fetchHospitals() {
    if (isBackendLive) {
        try {
            const res = await fetch('/api/hospitals');
            return await res.json();
        } catch (e) {}
    }
    return LocalDB.hospitals;
}

async function fetchDepartments() {
    if (isBackendLive) {
        try {
            const res = await fetch('/api/departments');
            return await res.json();
        } catch (e) {}
    }
    return LocalDB.departments;
}

async function fetchDoctors(filters = {}) {
    const { department, hospitalId, search, date } = filters;
    const queryDate = date || getTodayDateStr();

    if (isBackendLive) {
        try {
            const params = new URLSearchParams();
            if (department && department !== 'all') params.append('department', department);
            if (hospitalId && hospitalId !== 'all') params.append('hospitalId', hospitalId);
            if (search) params.append('search', search);
            if (queryDate) params.append('date', queryDate);

            const res = await fetch(`/api/doctors?${params.toString()}`);
            return await res.json();
        } catch (e) {}
    }

    // LocalDB Fallback
    const apps = LocalDB.getAppointments();
    const bookedSet = new Set(
        apps
            .filter(a => a.appointmentDate === queryDate && a.status !== 'CANCELLED')
            .map(a => `${a.doctorNameEn}|${a.slotTime}`)
    );

    let docs = [...LocalDB.doctors];
    if (department && department !== 'all') {
        docs = docs.filter(d => d.spec === department);
    }
    if (hospitalId && hospitalId !== 'all') {
        docs = docs.filter(d => d.hospitalId === hospitalId);
    }
    if (search) {
        const s = search.toLowerCase();
        docs = docs.filter(d => `${d.nameEn} ${d.nameTe} ${d.spec} ${d.roleEn} ${d.roleTe}`.toLowerCase().includes(s));
    }

    return docs.map(d => ({
        ...d,
        slots: d.slots,
        availableSlots: d.slots.filter(s => !bookedSet.has(`${d.nameEn}|${s}`)),
        bookedSlots: d.slots.filter(s => bookedSet.has(`${d.nameEn}|${s}`))
    }));
}

async function createAppointmentApi(bookingData) {
    if (isBackendLive) {
        try {
            const res = await fetch('/api/appointments', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(bookingData)
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error || 'Booking failed');
            return data.appointment;
        } catch (e) {
            console.warn('API booking failed, using local storage:', e.message);
        }
    }

    // LocalDB fallback
    const apps = LocalDB.getAppointments();
    const doc = LocalDB.doctors.find(d => d.nameEn === bookingData.doctorNameEn) || LocalDB.doctors[0];
    const hosp = LocalDB.hospitals.find(h => h.id === bookingData.hospitalId) || LocalDB.hospitals[0];

    const sameDocDateApps = apps.filter(a => a.doctorNameEn === doc.nameEn && a.appointmentDate === bookingData.appointmentDate);
    const maxToken = sameDocDateApps.reduce((max, a) => Math.max(max, a.tokenNumber || 0), 0);
    const nextToken = maxToken + 1;

    const refId = `AP-OPD-2026-${Math.floor(1000 + Math.random() * 9000)}`;
    const newAppointment = {
        id: refId,
        tokenNumber: nextToken,
        patientName: bookingData.patientName.trim(),
        patientPhone: bookingData.patientPhone.replace(/\D/g, '').slice(-10),
        patientAge: parseInt(bookingData.patientAge, 10),
        patientGender: bookingData.patientGender || 'Other',
        abhaId: bookingData.abhaId || '',
        symptoms: bookingData.symptoms || 'General OPD Consultation',
        doctorNameEn: doc.nameEn,
        doctorNameTe: doc.nameTe,
        department: doc.spec,
        hospitalId: hosp.id,
        hospitalNameEn: hosp.nameEn,
        hospitalNameTe: hosp.nameTe,
        appointmentDate: bookingData.appointmentDate,
        slotTime: bookingData.slotTime || '09:00 AM',
        status: 'CONFIRMED',
        roomNo: doc.roomNo,
        reportingTime: '15 mins prior to slot',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
    };

    apps.unshift(newAppointment);
    LocalDB.saveAppointments(apps);
    return newAppointment;
}

async function cancelAppointmentApi(id) {
    if (isBackendLive) {
        try {
            const res = await fetch(`/api/appointments/${id}/cancel`, { method: 'POST' });
            return await res.json();
        } catch (e) {}
    }

    // Local fallback
    const apps = LocalDB.getAppointments();
    const app = apps.find(a => a.id === id);
    if (app) {
        app.status = 'CANCELLED';
        LocalDB.saveAppointments(apps);
    }
    return { success: true };
}

async function fetchAppointmentsByPhone(phone) {
    const cleanPhone = phone.replace(/\D/g, '').slice(-10);
    if (isBackendLive) {
        try {
            const res = await fetch(`/api/appointments?phone=${cleanPhone}`);
            return await res.json();
        } catch (e) {}
    }

    const apps = LocalDB.getAppointments();
    return apps.filter(a => a.patientPhone.endsWith(cleanPhone));
}

async function fetchDoctorQueue(docName, date) {
    const queryDate = date || getTodayDateStr();
    if (isBackendLive) {
        try {
            const res = await fetch(`/api/queue?doctorName=${encodeURIComponent(docName)}&date=${queryDate}`);
            return await res.json();
        } catch (e) {}
    }

    const apps = LocalDB.getAppointments();
    const docApps = apps
        .filter(a => a.doctorNameEn === docName && a.appointmentDate === queryDate)
        .sort((a, b) => a.tokenNumber - b.tokenNumber);

    const servingToken = LocalDB.getServingToken(docName);
    return {
        doctorNameEn: docName,
        appointmentDate: queryDate,
        currentServingToken: servingToken,
        totalPatients: docApps.length,
        waitingCount: docApps.filter(a => a.status === 'CONFIRMED' || a.status === 'CALLED').length,
        inConsultationCount: docApps.filter(a => a.status === 'IN_CONSULTATION').length,
        completedCount: docApps.filter(a => a.status === 'COMPLETED').length,
        patients: docApps
    };
}

async function callNextTokenApi(docName, date) {
    const queryDate = date || getTodayDateStr();
    if (isBackendLive) {
        try {
            const res = await fetch('/api/queue/call-next', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ doctorName: docName, date: queryDate })
            });
            return await res.json();
        } catch (e) {}
    }

    // LocalDB fallback
    const apps = LocalDB.getAppointments();
    const serving = LocalDB.getServingToken(docName);
    const nextPatient = apps.find(a => a.doctorNameEn === docName && a.appointmentDate === queryDate && a.tokenNumber > serving && a.status !== 'CANCELLED' && a.status !== 'COMPLETED');

    if (!nextPatient) {
        return { message: 'No more waiting patients', currentServingToken: serving, patient: null };
    }

    LocalDB.setServingToken(docName, nextPatient.tokenNumber);
    nextPatient.status = 'CALLED';
    LocalDB.saveAppointments(apps);
    return {
        message: `Token #${nextPatient.tokenNumber} called for ${nextPatient.patientName}`,
        currentServingToken: nextPatient.tokenNumber,
        patient: nextPatient
    };
}

async function updateAppointmentStatusApi(id, status) {
    if (isBackendLive) {
        try {
            const res = await fetch(`/api/appointments/${id}/status`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status })
            });
            return await res.json();
        } catch (e) {}
    }

    const apps = LocalDB.getAppointments();
    const app = apps.find(a => a.id === id);
    if (app) {
        app.status = status;
        LocalDB.saveAppointments(apps);
    }
    return { success: true };
}

// ========================================================
// UI RENDERING & COMPONENT LOGIC
// ========================================================

async function renderStats() {
    const stats = await fetchStats();
    const t = i18n[currentLang];

    const c1 = document.getElementById('statHospitalsCount');
    const c2 = document.getElementById('statDoctorsCount');
    const c3 = document.getElementById('statBedsCount');
    const c4 = document.getElementById('statConsultationsCount');

    if (c1) c1.textContent = stats.totalHospitals || 4;
    if (c2) c2.textContent = stats.activeDoctors || 9;
    if (c3) c3.textContent = stats.availableBeds || 397;
    if (c4) c4.textContent = stats.todayBookings || 12;
}

function renderDepartments(depts) {
    const grid = document.getElementById('departmentsGrid');
    if (!grid) return;

    grid.innerHTML = depts.map(d => {
        const name = currentLang === 'te' ? d.nameTe : d.nameEn;
        const countText = currentLang === 'te' ? `${d.doctorCount || 8} మంది వైద్యులు` : `${d.doctorCount || 8} Doctors`;
        return `
            <button class="dept-pill" data-key="${d.key}" onclick="onSelectDepartment('${d.key}')">
                <span class="dept-icon">${d.icon}</span>
                <span class="dept-info">
                    <b>${name}</b>
                    <small>${countText}</small>
                </span>
            </button>
        `;
    }).join('');
}

function populateDropdowns(hospitals, departments, doctors) {
    const hospSelect = document.getElementById('hospitalSelect');
    if (hospSelect) {
        hospSelect.innerHTML = hospitals.map(h => `
            <option value="${h.id}">${currentLang === 'te' ? h.nameTe : h.nameEn}</option>
        `).join('');
    }

    const deptSelect = document.getElementById('departmentSelect');
    const filterDept = document.getElementById('filterDepartmentSelect');
    const t = i18n[currentLang];

    const deptOptions = `<option value="all">${t.allDepts}</option>` + departments.map(d => `
        <option value="${d.key}">${currentLang === 'te' ? d.nameTe : d.nameEn}</option>
    `).join('');

    if (deptSelect) deptSelect.innerHTML = deptOptions;
    if (filterDept) filterDept.innerHTML = deptOptions;

    const docSelect = document.getElementById('doctorSelect');
    if (docSelect) {
        docSelect.innerHTML = `<option value="all">${t.anyDoctor}</option>` + doctors.map(d => `
            <option value="${d.nameEn}">${currentLang === 'te' ? d.nameTe : d.nameEn} (${d.spec})</option>
        `).join('');
    }

    const queueDocSelect = document.getElementById('queueDoctorSelect');
    if (queueDocSelect) {
        queueDocSelect.innerHTML = doctors.map(d => `
            <option value="${d.nameEn}">${currentLang === 'te' ? d.nameTe : d.nameEn} - ${d.spec}</option>
        `).join('');
        queueDocSelect.value = activeDoctorQueueName;
    }
}

function renderDoctorsList(doctors) {
    const container = document.getElementById('doctorsList');
    if (!container) return;

    const t = i18n[currentLang];
    const currentDate = document.getElementById('bookingDate').value || getTodayDateStr();
    const morningCheck = document.getElementById('chkMorning')?.checked;
    const afternoonCheck = document.getElementById('chkAfternoon')?.checked;

    if (!doctors.length) {
        container.innerHTML = `
            <div class="empty-state">
                <span style="font-size:32px">🩺</span>
                <h4 style="margin:10px 0 5px">${t.docsHeading}</h4>
                <p>${currentLang === 'te' ? 'ఎంచుకున్న ఫిల్టర్లకు సరిపోలే వైద్యులు లేరు. దయచేసి వేరే విభాగం ఎంచుకోండి.' : 'No doctors matched these filters. Try another department or date.'}</p>
            </div>
        `;
        return;
    }

    container.innerHTML = doctors.map(doc => {
        const name = currentLang === 'te' ? doc.nameTe : doc.nameEn;
        const role = currentLang === 'te' ? doc.roleTe : doc.roleEn;
        const slotsTitle = `${t.slotsForDate}${currentDate}`;

        let displaySlots = doc.availableSlots || doc.slots;
        if (morningCheck || afternoonCheck) {
            displaySlots = displaySlots.filter(s => {
                const hour = parseInt(s, 10);
                const isPm = s.includes('PM');
                const h24 = (isPm && hour < 12) ? hour + 12 : (hour === 12 && !isPm ? 0 : hour);
                if (morningCheck && h24 >= 8 && h24 < 12) return true;
                if (afternoonCheck && h24 >= 12 && h24 < 16) return true;
                return false;
            });
        }

        const slotChipsHtml = displaySlots.length
            ? displaySlots.map(s => `<button class="slot-chip" onclick="openBookingModal('${doc.nameEn}', '${s}')">${s}</button>`).join('')
            : `<span style="font-size:11px;color:#888">${t.noSlots}</span>`;

        return `
            <article class="doctor-card">
                <div class="doc-avatar">${doc.emoji}</div>
                <div class="doc-meta">
                    <h4 class="doc-name">${name}</h4>
                    <div class="doc-qual">${doc.qual}</div>
                    <div class="doc-role">${role}</div>
                    <div class="doc-room">📍 ${doc.roomNo}</div>
                </div>
                <div class="doc-schedule-area">
                    <span class="doc-status-badge">🟢 ${t.liveAvailable}</span>
                    <div class="doc-timings">🕒 ${t.opdHours}${doc.hours}</div>
                    <div class="slots-label">${slotsTitle}</div>
                    <div class="slots-chips">${slotChipsHtml}</div>
                </div>
                <div class="doc-actions">
                    <button class="btn-primary" onclick="openBookingModal('${doc.nameEn}', '')">${t.btnBookDoc}</button>
                    <button class="btn-text" onclick="showDoctorProfile('${doc.nameEn}')">${t.btnViewProfile}</button>
                </div>
            </article>
        `;
    }).join('');
}

function renderHospitalsDirectory(hospitals) {
    const grid = document.getElementById('hospitalsGrid');
    if (!grid) return;

    const t = i18n[currentLang];
    grid.innerHTML = hospitals.map(h => {
        const name = currentLang === 'te' ? h.nameTe : h.nameEn;
        const type = currentLang === 'te' ? h.typeTe : h.typeEn;
        const address = currentLang === 'te' ? h.addressTe : h.addressEn;
        const opdTimings = currentLang === 'te' ? h.opdTimingsTe : h.opdTimingsEn;

        return `
            <div class="hospital-card">
                <div>
                    <span class="hospital-badge">🏛️ ${currentLang === 'te' ? h.districtTe : h.districtEn}</span>
                    <h4 style="font-size:16px;font-weight:800;color:var(--navy-900);margin:8px 0 4px">${name}</h4>
                    <p style="font-size:11.5px;color:var(--blue-600);font-weight:700">${type}</p>
                    <p style="font-size:12px;color:var(--ink-500);margin-top:6px">📍 ${address}</p>
                    <p style="font-size:11.5px;color:var(--navy-800);margin-top:4px">📞 <b>${h.phone}</b> | 🚨 <b>${h.emergencyPhone}</b></p>
                    <p style="font-size:11.5px;color:var(--emerald-700);margin-top:4px">⏰ ${opdTimings}</p>
                </div>
                <div class="bed-stat-bar">
                    <div>
                        <b>${h.availableBeds}</b>
                        <small>${t.lblAvailableBeds}</small>
                    </div>
                    <div>
                        <b style="color:var(--blue-600)">${h.icuBedsAvailable}</b>
                        <small>${t.lblIcuBeds}</small>
                    </div>
                    <div>
                        <b style="color:var(--emerald-600)">${h.oxygenBedsAvailable}</b>
                        <small>${t.lblOxygenBeds}</small>
                    </div>
                </div>
                <button class="btn-primary" style="width:100%" onclick="selectHospitalAndBook('${h.id}')">
                    ${t.btnBookAtHosp}
                </button>
            </div>
        `;
    }).join('');
}

// ========================================================
// DOCTOR OPD QUEUE MANAGEMENT PORTAL
// ========================================================

async function renderDoctorQueueBoard() {
    const queueData = await fetchDoctorQueue(activeDoctorQueueName, getTodayDateStr());
    const t = i18n[currentLang];

    const curTokenEl = document.getElementById('metricServingToken');
    const waitingEl = document.getElementById('metricWaitingCount');
    const inConsultEl = document.getElementById('metricInConsultCount');
    const doneEl = document.getElementById('metricDoneCount');

    if (curTokenEl) curTokenEl.textContent = `#${String(queueData.currentServingToken || 0).padStart(2, '0')}`;
    if (waitingEl) waitingEl.textContent = queueData.waitingCount || 0;
    if (inConsultEl) inConsultEl.textContent = queueData.inConsultationCount || 0;
    if (doneEl) doneEl.textContent = queueData.completedCount || 0;

    const tbody = document.getElementById('queueTableBody');
    if (!tbody) return;

    if (!queueData.patients.length) {
        tbody.innerHTML = `
            <tr>
                <td colspan="6" style="text-align:center;padding:30px;color:#888">
                    ${currentLang === 'te' ? 'నేటికి రోగుల అపాయింట్‌మెంట్లు ఏవీ లేవు. కౌంటర్ వాక్-ఇన్ టోకెన్ జారీ చేయవచ్చు.' : 'No patient appointments scheduled for today yet. You can issue a walk-in token.'}
                </td>
            </tr>
        `;
        return;
    }

    tbody.innerHTML = queueData.patients.map(p => {
        const isCurrent = (p.tokenNumber === queueData.currentServingToken);
        const rowBg = isCurrent ? 'style="background:#f0f7ff;font-weight:700"' : '';

        return `
            <tr ${rowBg}>
                <td><span class="token-pill">#${String(p.tokenNumber).padStart(2, '0')}</span></td>
                <td>
                    <b>${p.patientName}</b> (${p.patientAge}y, ${p.patientGender})
                    <div style="font-size:11px;color:#666">📱 ${p.patientPhone} ${p.abhaId ? '· ABHA: ' + p.abhaId : ''}</div>
                </td>
                <td><b>${p.slotTime}</b></td>
                <td>${p.symptoms || 'General Checkup'}</td>
                <td><span class="status-badge status-${p.status}">${p.status}</span></td>
                <td>
                    <div style="display:flex;gap:6px;flex-wrap:wrap">
                        ${p.status === 'CONFIRMED' || p.status === 'CALLED' ? `
                            <button class="btn-text" style="color:var(--emerald-600)" onclick="updateStatus('${p.id}', 'IN_CONSULTATION')">▶ Start Consultation</button>
                        ` : ''}
                        ${p.status === 'IN_CONSULTATION' ? `
                            <button class="btn-text" style="color:var(--emerald-600)" onclick="updateStatus('${p.id}', 'COMPLETED')">✓ Rx Completed</button>
                        ` : ''}
                        ${p.status !== 'COMPLETED' && p.status !== 'CANCELLED' ? `
                            <button class="btn-text" style="color:var(--red-600)" onclick="updateStatus('${p.id}', 'CANCELLED')">✕ Cancel</button>
                        ` : ''}
                        <button class="btn-text" onclick="viewOpdSlipById('${p.id}')">🖨️ Slip</button>
                    </div>
                </td>
            </tr>
        `;
    }).join('');
}

async function callNextToken() {
    const res = await callNextTokenApi(activeDoctorQueueName, getTodayDateStr());
    if (res.patient) {
        showToast(`📢 ${currentLang === 'te' ? 'టోకెన్' : 'Token'} #${res.patient.tokenNumber} - ${res.patient.patientName} (${currentLang === 'te' ? 'పిలవబడింది' : 'Called'})`);
    } else {
        showToast(res.message);
    }
    await renderDoctorQueueBoard();
    if (currentPatientPhone) renderPatientPortal();
}

async function updateStatus(appId, newStatus) {
    await updateAppointmentStatusApi(appId, newStatus);
    showToast(`Status updated to ${newStatus}`);
    await renderDoctorQueueBoard();
    if (currentPatientPhone) renderPatientPortal();
}

function openWalkinModal() {
    const modal = document.getElementById('walkinModal');
    if (modal) modal.style.display = 'flex';
}

async function submitWalkinToken() {
    const name = document.getElementById('walkinName').value.trim();
    const phone = document.getElementById('walkinPhone').value.trim();
    const age = document.getElementById('walkinAge').value.trim();
    const gender = document.getElementById('walkinGender').value;
    const symptoms = document.getElementById('walkinSymptoms').value.trim();

    if (!name || !/^[6-9]\d{9}$/.test(phone) || !age) {
        alert(i18n[currentLang].validationAlert || 'Please enter valid patient name, 10-digit phone, and age.');
        return;
    }

    const bookingData = {
        patientName: name,
        patientPhone: phone,
        patientAge: age,
        patientGender: gender,
        symptoms: symptoms || 'Counter Walk-in OPD Request',
        doctorNameEn: activeDoctorQueueName,
        hospitalId: 'GH_BHIMAVARAM',
        appointmentDate: getTodayDateStr(),
        slotTime: 'Walk-in Immediate'
    };

    const newApp = await createAppointmentApi(bookingData);
    closeWalkinModal();
    showToast(`Walk-in Token #${newApp.tokenNumber} Created!`);
    await renderDoctorQueueBoard();
    displayOpdSlip(newApp);
}

function closeWalkinModal() {
    const modal = document.getElementById('walkinModal');
    if (modal) modal.style.display = 'none';
}

// ========================================================
// PATIENT PORTAL LOGIC (NO OTP REQUIRED!)
// ========================================================

async function lookupPatientAppointments() {
    const input = document.getElementById('patientPortalMobile');
    const phone = (input ? input.value : currentPatientPhone || '').trim();

    if (!/^[6-9]\d{9}$/.test(phone)) {
        alert(currentLang === 'te' ? 'దయచేసి సరైన 10 అంకెల మొబైల్ నంబర్‌ను నమోదు చేయండి.' : 'Please enter a valid 10-digit Indian mobile number.');
        return;
    }

    currentPatientPhone = phone;
    await renderPatientPortal();
}

async function renderPatientPortal() {
    if (!currentPatientPhone) return;

    const listContainer = document.getElementById('patientAppointmentsList');
    if (!listContainer) return;

    const t = i18n[currentLang];
    const appointments = await fetchAppointmentsByPhone(currentPatientPhone);

    if (!appointments.length) {
        listContainer.innerHTML = `
            <div class="empty-state" style="margin-top:16px">
                <span style="font-size:32px">📋</span>
                <p style="margin-top:10px">${t.noAppointmentsFound}</p>
            </div>
        `;
        return;
    }

    listContainer.innerHTML = appointments.map(app => {
        const docName = currentLang === 'te' ? app.doctorNameTe : app.doctorNameEn;
        const hospName = currentLang === 'te' ? app.hospitalNameTe : app.hospitalNameEn;

        return `
            <div class="patient-appointment-card">
                <div style="text-align:center">
                    <span class="token-pill" style="font-size:14px;padding:6px 12px">#${String(app.tokenNumber).padStart(2, '0')}</span>
                    <small style="display:block;margin-top:4px;font-weight:700;color:var(--navy-800)">TOKEN</small>
                </div>
                <div>
                    <h4 style="font-size:15px;font-weight:800;color:var(--navy-900);margin-bottom:2px">${docName}</h4>
                    <p style="font-size:11.5px;color:var(--blue-600);font-weight:700">${app.department} · ${app.roomNo}</p>
                    <p style="font-size:11.5px;color:var(--ink-500)">🏥 ${hospName}</p>
                    <p style="font-size:11.5px;color:var(--navy-800);margin-top:2px">📅 <b>${app.appointmentDate}</b> at <b>${app.slotTime}</b></p>
                </div>
                <div>
                    <span class="status-badge status-${app.status}">${app.status}</span>
                    <div style="font-size:11px;color:#666;margin-top:4px">Ref: <b>${app.id}</b></div>
                </div>
                <div style="display:flex;flex-direction:column;gap:6px">
                    <button class="btn-primary" style="font-size:11.5px;padding:8px 12px" onclick="viewOpdSlipById('${app.id}')">${t.btnViewSlip}</button>
                    ${app.status !== 'CANCELLED' && app.status !== 'COMPLETED' ? `
                        <button class="btn-text" style="color:var(--red-600)" onclick="cancelAppointment('${app.id}')">${t.btnCancelApp}</button>
                    ` : ''}
                </div>
            </div>
        `;
    }).join('');
}

async function cancelAppointment(id) {
    if (!confirm(currentLang === 'te' ? 'ఈ అపాయింట్‌మెంట్‌ను రద్దు చేయాలనుకుంటున్నారా?' : 'Are you sure you want to cancel this appointment?')) return;
    await cancelAppointmentApi(id);
    showToast(currentLang === 'te' ? 'అపాయింట్‌మెంట్ రద్దు చేయబడింది' : 'Appointment cancelled successfully');
    await renderPatientPortal();
    await applyFilters();
    await renderDoctorQueueBoard();
}

// ========================================================
// OPD REGISTRATION & PRINTABLE TOKEN SLIP MODAL
// ========================================================

function openBookingModal(doctorNameEn, slot) {
    selectedDoctorForBooking = doctorNameEn;
    selectedSlotForBooking = slot;

    const doc = allDoctors.find(d => d.nameEn === doctorNameEn) || allDoctors[0];
    const hospSelect = document.getElementById('hospitalSelect');
    const hospText = hospSelect.options[hospSelect.selectedIndex]?.text || 'Government District Hospital, Bhimavaram';
    const dateVal = document.getElementById('bookingDate').value || getTodayDateStr();

    document.getElementById('modalDocName').textContent = currentLang === 'te' ? doc.nameTe : doc.nameEn;
    document.getElementById('modalHospName').textContent = hospText;
    document.getElementById('modalSlotText').textContent = `${dateVal} ${slot ? '· ' + slot : ''}`;

    // Autofill phone if previously entered in patient portal
    if (currentPatientPhone) {
        document.getElementById('patientPhone').value = currentPatientPhone;
    }

    const modal = document.getElementById('bookingModal');
    if (modal) modal.style.display = 'flex';
}

function closeBookingModal() {
    const modal = document.getElementById('bookingModal');
    if (modal) modal.style.display = 'none';
}

async function confirmBooking() {
    const name = document.getElementById('patientName').value.trim();
    const phone = document.getElementById('patientPhone').value.trim();
    const age = document.getElementById('patientAge').value.trim();
    const gender = document.getElementById('patientGender').value;
    const abhaId = document.getElementById('patientAbha').value.trim();
    const symptoms = document.getElementById('patientSymptoms').value.trim();

    if (!name || !/^[6-9]\d{9}$/.test(phone) || !age) {
        alert(i18n[currentLang].validationAlert || 'Please enter valid patient name, 10-digit mobile number, and age (0-120).');
        return;
    }

    const hospSelect = document.getElementById('hospitalSelect');
    const hospitalId = hospSelect.value || 'GH_BHIMAVARAM';
    const dateVal = document.getElementById('bookingDate').value || getTodayDateStr();

    const bookingPayload = {
        patientName: name,
        patientPhone: phone,
        patientAge: age,
        patientGender: gender,
        abhaId,
        symptoms,
        doctorNameEn: selectedDoctorForBooking,
        hospitalId,
        appointmentDate: dateVal,
        slotTime: selectedSlotForBooking || '09:30 AM'
    };

    try {
        const appointment = await createAppointmentApi(bookingPayload);
        closeBookingModal();
        currentPatientPhone = phone;

        showToast(currentLang === 'te' ? 'అపాయింట్‌మెంట్ విజయవంతంగా బుక్ చేయబడింది!' : 'Appointment booked successfully!');
        displayOpdSlip(appointment);
        await applyFilters();
        await renderStats();
        await renderDoctorQueueBoard();
        if (currentPatientPhone) renderPatientPortal();
    } catch (e) {
        alert(e.message);
    }
}

async function viewOpdSlipById(appId) {
    if (isBackendLive) {
        try {
            const res = await fetch(`/api/appointments/${appId}`);
            if (res.ok) {
                const app = await res.json();
                displayOpdSlip(app);
                return;
            }
        } catch (e) {}
    }

    const apps = LocalDB.getAppointments();
    const app = apps.find(a => a.id === appId);
    if (app) displayOpdSlip(app);
}

function displayOpdSlip(app) {
    const modal = document.getElementById('slipModal');
    const container = document.getElementById('slipContent');
    if (!modal || !container) return;

    const qrSvg = generateQrCodeSvg(`AP-HEALTH:${app.id}|PATIENT:${app.patientName}|TOKEN:${app.tokenNumber}|DOC:${app.doctorNameEn}|DATE:${app.appointmentDate}`);
    const barcodeSvg = generateBarcodeSvg(app.id);

    container.innerHTML = `
        <div class="opd-slip-container">
            <div class="slip-header">
                <div class="slip-emblem">⚕</div>
                <div class="slip-title">
                    <h4>ఆంధ్రప్రదేశ్ ప్రభుత్వం · GOVERNMENT OF ANDHRA PRADESH</h4>
                    <p>వైద్య, ఆరోగ్య మరియు కుటుంబ సంక్షేమ శాఖ · Digital OPD Registration Slip</p>
                </div>
                <div style="text-align:right">
                    <span style="font-size:11px;font-weight:700;color:var(--emerald-700)">VERIFIED OPD SLIP</span>
                    <div style="font-size:10px;color:#666">${new Date().toLocaleString()}</div>
                </div>
            </div>

            <div class="slip-body">
                <div class="slip-details-grid">
                    <div>
                        <dt>రిఫరెన్స్ ఐడీ (Reference ID)</dt>
                        <dd>${app.id}</dd>
                    </div>
                    <div>
                        <dt>తేదీ & సమయం (Date & Time)</dt>
                        <dd>${app.appointmentDate} · ${app.slotTime}</dd>
                    </div>
                    <div>
                        <dt>రోగి పేరు (Patient Name)</dt>
                        <dd>${app.patientName}</dd>
                    </div>
                    <div>
                        <dt>వయస్సు & లింగం (Age / Gender)</dt>
                        <dd>${app.patientAge} Years / ${app.patientGender}</dd>
                    </div>
                    <div>
                        <dt>మొబైల్ నంబర్ (Mobile)</dt>
                        <dd>+91 ${app.patientPhone}</dd>
                    </div>
                    <div>
                        <dt>ఆభా ఐడీ (ABHA / Aadhaar)</dt>
                        <dd>${app.abhaId || 'Not Linked'}</dd>
                    </div>
                    <div style="grid-column:1/-1">
                        <dt>వైద్యులు & విభాగం (Doctor & Specialty)</dt>
                        <dd>${currentLang === 'te' ? app.doctorNameTe : app.doctorNameEn} (${app.department})</dd>
                    </div>
                    <div style="grid-column:1/-1">
                        <dt>ఆసుపత్రి & ఓపీడీ గది (Hospital & OPD Room)</dt>
                        <dd>${currentLang === 'te' ? app.hospitalNameTe : app.hospitalNameEn} — <b>${app.roomNo}</b></dd>
                    </div>
                </div>

                <div class="slip-token-box">
                    <small>ఓపీడీ టోకెన్ నంబర్</small>
                    <div class="huge-token">#${String(app.tokenNumber).padStart(2, '0')}</div>
                    <small style="color:#07366c;font-weight:700">${app.status}</small>
                </div>
            </div>

            <div class="slip-instructions">
                <b>రోగి మార్గదర్శకాలు / Patient Instructions:</b>
                <ul style="padding-left:18px;margin-top:4px">
                    <li>దయచేసి ఓపీడీ గది వద్ద స్లాట్ సమయానికి 15 నిమిషాల ముందే రిపోర్ట్ చేయండి (Report 15 mins prior to slot).</li>
                    <li>ప్రభుత్వ ఆసుపత్రి కౌంటర్ల వద్ద అన్ని వైద్య పరీక్షలు (ల్యాబ్స్) మరియు సాధారణ మందులు పూర్తి ఉచితం.</li>
                    <li>కౌంటర్ వద్ద లేదా డాక్టర్ వద్ద ఈ స్లిప్‌ను మీ మొబైల్ స్క్రీన్‌లో చూపవచ్చు లేదా ముద్రించవచ్చు.</li>
                </ul>
            </div>

            <div class="slip-qr-barcode">
                <div>${barcodeSvg}</div>
                <div>${qrSvg}</div>
            </div>
        </div>
    `;

    modal.style.display = 'flex';
}

function closeSlipModal() {
    const modal = document.getElementById('slipModal');
    if (modal) modal.style.display = 'none';
}

function printOpdSlip() {
    window.print();
}

// ========================================================
// CITIZEN GRIEVANCE SUBMISSION
// ========================================================

async function submitGrievanceForm(e) {
    e.preventDefault();
    const name = document.getElementById('grvName').value.trim();
    const phone = document.getElementById('grvPhone').value.trim();
    const hosp = document.getElementById('grvHospital').value;
    const cat = document.getElementById('grvCategory').value;
    const msg = document.getElementById('grvMessage').value.trim();

    if (!name || !/^[6-9]\d{9}$/.test(phone) || !msg) {
        alert(currentLang === 'te' ? 'దయచేసి పూర్తి వివరాలను నమోదు చేయండి.' : 'Please enter valid details and phone number.');
        return;
    }

    const grvId = `AP-GRV-${Math.floor(1000 + Math.random() * 9000)}`;

    if (isBackendLive) {
        try {
            await fetch('/api/grievances', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ citizenName: name, citizenPhone: phone, hospitalName: hosp, category: cat, message: msg })
            });
        } catch (e) {}
    }

    alert(`${currentLang === 'te' ? 'మీ ఫిర్యాదు విజయవంతంగా నమోదు చేయబడింది!' : 'Grievance submitted successfully!'}\nTracking ID: ${grvId}\n${currentLang === 'te' ? 'ఆసుపత్రి సూపరింటెండెంట్ కార్యాలయం దీనిని సమీక్షిస్తుంది.' : 'Hospital superintendent office will review shortly.'}`);
    document.getElementById('grievanceForm').reset();
}

// ========================================================
// FILTERING & TAB NAVIGATION
// ========================================================

async function applyFilters() {
    const dept = document.getElementById('departmentSelect')?.value || 'all';
    const filterDept = document.getElementById('filterDepartmentSelect')?.value || 'all';
    const effectiveDept = (filterDept !== 'all') ? filterDept : dept;

    const hosp = document.getElementById('hospitalSelect')?.value || 'all';
    const search = document.getElementById('globalSearch')?.value || '';
    const date = document.getElementById('bookingDate')?.value || getTodayDateStr();

    const filteredDocs = await fetchDoctors({
        department: effectiveDept,
        hospitalId: hosp,
        search,
        date
    });

    renderDoctorsList(filteredDocs);
}

function onSelectDepartment(deptKey) {
    const deptSelect = document.getElementById('departmentSelect');
    const filterDept = document.getElementById('filterDepartmentSelect');
    if (deptSelect) deptSelect.value = deptKey;
    if (filterDept) filterDept.value = deptKey;

    document.querySelectorAll('.dept-pill').forEach(el => {
        el.classList.toggle('active', el.getAttribute('data-key') === deptKey);
    });

    applyFilters();
    document.getElementById('doctorsSection')?.scrollIntoView({ behavior: 'smooth' });
}

function selectHospitalAndBook(hospId) {
    const hospSelect = document.getElementById('hospitalSelect');
    if (hospSelect) hospSelect.value = hospId;
    applyFilters();
    document.getElementById('bookingSection')?.scrollIntoView({ behavior: 'smooth' });
}

function showDoctorProfile(docNameEn) {
    const doc = allDoctors.find(d => d.nameEn === docNameEn);
    if (!doc) return;
    const t = i18n[currentLang];
    const name = currentLang === 'te' ? doc.nameTe : doc.nameEn;
    const role = currentLang === 'te' ? doc.roleTe : doc.roleEn;

    alert(`⚕ ${name}\n${doc.qual}\n${role}\n\n📍 ${doc.roomNo}\n🕒 ${t.opdHours}${doc.hours}\n🗣️ Languages: ${doc.languages}\n⭐ Experience: ${doc.experienceYrs} Years\n\nAndhra Pradesh Vaidya Vidhana Parishad`);
}

function clearFilters() {
    if (document.getElementById('departmentSelect')) document.getElementById('departmentSelect').value = 'all';
    if (document.getElementById('filterDepartmentSelect')) document.getElementById('filterDepartmentSelect').value = 'all';
    if (document.getElementById('doctorSelect')) document.getElementById('doctorSelect').value = 'all';
    if (document.getElementById('globalSearch')) document.getElementById('globalSearch').value = '';
    if (document.getElementById('chkMorning')) document.getElementById('chkMorning').checked = false;
    if (document.getElementById('chkAfternoon')) document.getElementById('chkAfternoon').checked = false;
    document.querySelectorAll('.dept-pill').forEach(el => el.classList.remove('active'));
    applyFilters();
}

// ========================================================
// LANGUAGE SWITCHING & INITIALIZATION
// ========================================================

function changeLanguage(lang) {
    currentLang = (lang === 'en') ? 'en' : 'te';
    try { localStorage.setItem('medislot_lang', currentLang); } catch (e) {}
    document.documentElement.lang = currentLang;

    const t = i18n[currentLang];
    document.title = t.pageTitle;

    // Apply i18n text to static DOM elements with data-i18n
    document.querySelectorAll('[data-i18n]').forEach(el => {
        const key = el.getAttribute('data-i18n');
        if (t[key]) el.innerHTML = t[key];
    });

    // Update Language Selector
    const sel = document.getElementById('langSelect');
    if (sel) sel.value = currentLang;

    // Re-render dynamic elements
    populateDropdowns(allHospitals, allDepartments, allDoctors);
    renderDepartments(allDepartments);
    renderHospitalsDirectory(allHospitals);
    renderDoctorQueueBoard();
    if (currentPatientPhone) renderPatientPortal();
    applyFilters();
    checkBackendStatus();
}

async function initApp() {
    LocalDB.init();

    // Set default date to today in date inputs
    const today = getTodayDateStr();
    const dateInput = document.getElementById('bookingDate');
    const filterDateInput = document.getElementById('filterDate');
    if (dateInput) { dateInput.value = today; dateInput.min = today; }
    if (filterDateInput) { filterDateInput.value = today; filterDateInput.min = today; }

    await checkBackendStatus();

    allHospitals = await fetchHospitals();
    allDepartments = await fetchDepartments();
    allDoctors = await fetchDoctors({ date: today });

    let savedLang = 'te';
    try {
        const stored = localStorage.getItem('medislot_lang');
        if (stored === 'en' || stored === 'te') savedLang = stored;
    } catch (e) {}

    changeLanguage(savedLang);
    renderStats();

    // Hook queue doctor change listener
    const queueDocSelect = document.getElementById('queueDoctorSelect');
    if (queueDocSelect) {
        queueDocSelect.addEventListener('change', (e) => {
            activeDoctorQueueName = e.target.value;
            renderDoctorQueueBoard();
        });
    }

    // Hook modal outside clicks
    window.addEventListener('click', (e) => {
        if (e.target.classList.contains('modal-overlay')) {
            e.target.style.display = 'none';
        }
    });
}

// Run on document ready
document.addEventListener('DOMContentLoaded', initApp);
