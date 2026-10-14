export type UserRole = 'PATIENT' | 'DOCTOR' | 'ADMIN';
export type UserStatus = 'ACTIVE' | 'PENDING' | 'SUSPENDED' | 'INACTIVE';
export type VerificationStatus = 'PENDING' | 'VERIFIED' | 'REJECTED' | 'SUSPENDED';

export type AppointmentStatus =
  | 'CONFIRMED'
  | 'CALLED'
  | 'IN_CONSULTATION'
  | 'COMPLETED'
  | 'CANCELLED'
  | 'NO_SHOW';

export interface User {
  id: string;
  email: string;
  phone: string;
  fullName: string;
  role: UserRole;
  status: UserStatus;
  verificationStatus?: VerificationStatus;
  profile?: PatientProfile | DoctorProfile | null;
}

export interface PatientProfile {
  userId: string;
  fullName: string;
  phone: string;
  age?: number | null;
  gender?: string | null;
  abhaId?: string | null;
  address?: string | null;
  updatedAt?: string;
}

export interface DoctorProfile {
  userId: string;
  fullName: string;
  phone: string;
  specialization: string;
  qualifications: string;
  experienceYears: number;
  hospitalId: string;
  hospitalName?: string;
  roomNo?: string;
  consultationHours?: string;
  languages?: string;
  verificationStatus: VerificationStatus;
  verifiedAt?: string | null;
  verifiedBy?: string | null;
  rejectionReason?: string | null;
  todayAvailable: number;
  slotsJson?: string;
  slots?: string[];
  updatedAt?: string;
}

export interface Hospital {
  id: string;
  nameEn: string;
  nameTe: string;
  districtEn: string;
  districtTe: string;
  typeEn: string;
  typeTe: string;
  addressEn: string;
  addressTe: string;
  phone: string;
  emergencyPhone: string;
  totalBeds: number;
  availableBeds: number;
  icuBedsAvailable: number;
  oxygenBedsAvailable: number;
  opdTimingsEn: string;
  opdTimingsTe: string;
  bloodBankStatus: string;
  rating: number;
}

export interface Department {
  key: string;
  nameEn: string;
  nameTe: string;
  icon: string;
  descriptionEn?: string;
  descriptionTe?: string;
  doctorCount: number;
}

export interface Doctor {
  id: number;
  nameEn: string;
  nameTe: string;
  qual: string;
  spec: string;
  roleEn: string;
  roleTe: string;
  emoji: string;
  hours: string;
  hospitalId: string;
  roomNo: string;
  experienceYrs: number;
  languages: string;
  slotsJson: string;
  slots: string[];
  availableSlots?: string[];
  bookedSlots?: string[];
  todayAvailable: number;
}

export interface Appointment {
  id: string;
  tokenNumber: number;
  patientName: string;
  patientPhone: string;
  patientAge: number;
  patientGender: string;
  abhaId?: string;
  symptoms?: string;
  doctorNameEn: string;
  doctorNameTe?: string;
  department: string;
  hospitalId: string;
  hospitalNameEn: string;
  hospitalNameTe?: string;
  appointmentDate: string;
  slotTime: string;
  status: AppointmentStatus;
  roomNo: string;
  reportingTime: string;
  patientUserId?: string;
  doctorUserId?: string;
  createdAt: string;
  updatedAt: string;
  currentServingToken?: number;
}

export interface DoctorQueueState {
  doctorNameEn: string;
  appointmentDate: string;
  currentServingToken: number;
  totalPatients: number;
  waitingCount: number;
  inConsultationCount: number;
  completedCount: number;
  patients: Appointment[];
}

export interface PlatformStats {
  patients: { total: number };
  doctors: { total: number; verified: number; pending: number; suspended: number };
  appointments: { total: number; todayTotal: number; completed: number; cancelled: number };
  hospitals: { total: number; availableBeds: number; icuBeds: number; oxygenBeds: number };
  grievances?: { total: number; submitted: number; inReview: number; resolved: number; rejected: number };
  recentAudits: AuditLog[];
}

export interface PublicStats {
  totalHospitals: number;
  availableBeds: number;
  icuBeds: number;
  activeDoctors: number;
  todayBookings: number;
  todayCompleted: number;
}

export interface AuditLog {
  id: string;
  actorUserId: string;
  actorRole: string;
  action: string;
  resource?: string;
  resourceId?: string;
  details?: string;
  ipAddress?: string;
  createdAt: string;
}

export interface Grievance {
  id: string;
  citizenName: string;
  citizenPhone: string;
  hospitalName: string;
  category: string;
  message: string;
  status: string;
  createdAt: string;
}
