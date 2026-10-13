import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { LanguageProvider } from './context/LanguageContext';
import { ToastProvider } from './context/ToastContext';
import { Navbar } from './components/common/Navbar';
import { Footer } from './components/common/Footer';
import { ProtectedRoute } from './components/common/ProtectedRoute';

// Public Pages
import { Home } from './pages/public/Home';
import { DoctorsDirectory } from './pages/public/DoctorsDirectory';
import { HospitalsDirectory } from './pages/public/HospitalsDirectory';
import { Grievances } from './pages/public/Grievances';

// Unified Role Authentication
import { UnifiedLogin } from './pages/auth/UnifiedLogin';

// Patient Pages
import { PatientLogin } from './pages/patient/PatientLogin';
import { PatientRegister } from './pages/patient/PatientRegister';
import { PatientDashboard } from './pages/patient/PatientDashboard';
import { BookAppointment } from './pages/patient/BookAppointment';
import { PatientProfile } from './pages/patient/PatientProfile';

// Doctor Pages
import { DoctorLogin } from './pages/doctor/DoctorLogin';
import { DoctorRegister } from './pages/doctor/DoctorRegister';
import { DoctorPending } from './pages/doctor/DoctorPending';
import { DoctorDashboard } from './pages/doctor/DoctorDashboard';
import { DoctorAvailability } from './pages/doctor/DoctorAvailability';

// Admin Pages
import { AdminLogin } from './pages/admin/AdminLogin';
import { AdminDashboard } from './pages/admin/AdminDashboard';
import { DoctorVerification } from './pages/admin/DoctorVerification';
import { OpdManagement } from './pages/admin/OpdManagement';
import { PatientManagement } from './pages/admin/PatientManagement';
import { AppointmentManagement } from './pages/admin/AppointmentManagement';
import { AuditLogs } from './pages/admin/AuditLogs';

export const App: React.FC = () => {
  return (
    <Router>
      <LanguageProvider>
        <AuthProvider>
          <ToastProvider>
            <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
              <Navbar />

              <main style={{ flex: 1 }}>
                <Routes>
                  {/* Root directly renders Unified Login */}
                  <Route path="/" element={<UnifiedLogin />} />
                  <Route path="/login" element={<UnifiedLogin />} />
                  <Route path="/home" element={<Home />} />
                  <Route path="/doctors" element={<DoctorsDirectory />} />
                  <Route path="/hospitals" element={<HospitalsDirectory />} />
                  <Route path="/grievance" element={<Grievances />} />

                  {/* Authentication Routes (all point to UnifiedLogin for role-based auto-redirection) */}
                  <Route path="/patient/login" element={<UnifiedLogin />} />
                  <Route path="/patient/register" element={<PatientRegister />} />

                  <Route path="/doctor/login" element={<UnifiedLogin />} />
                  <Route path="/doctor/register" element={<DoctorRegister />} />
                  <Route path="/doctor/pending" element={<DoctorPending />} />

                  {/* Dedicated Hidden Administrator Login Route */}
                  <Route path="/control-center/login" element={<AdminLogin />} />

                  {/* Patient Protected Portal */}
                  <Route
                    path="/patient/dashboard"
                    element={
                      <ProtectedRoute allowedRoles={['PATIENT']}>
                        <PatientDashboard />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/patient/book"
                    element={
                      <ProtectedRoute allowedRoles={['PATIENT']}>
                        <BookAppointment />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/patient/profile"
                    element={
                      <ProtectedRoute allowedRoles={['PATIENT']}>
                        <PatientProfile />
                      </ProtectedRoute>
                    }
                  />

                  {/* Doctor Protected Portal */}
                  <Route
                    path="/doctor/dashboard"
                    element={
                      <ProtectedRoute allowedRoles={['DOCTOR']}>
                        <DoctorDashboard />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/doctor/availability"
                    element={
                      <ProtectedRoute allowedRoles={['DOCTOR']}>
                        <DoctorAvailability />
                      </ProtectedRoute>
                    }
                  />

                  {/* Admin Protected Control Center */}
                  <Route
                    path="/admin/dashboard"
                    element={
                      <ProtectedRoute allowedRoles={['ADMIN']}>
                        <AdminDashboard />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/admin/doctors"
                    element={
                      <ProtectedRoute allowedRoles={['ADMIN']}>
                        <DoctorVerification />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/admin/opd"
                    element={
                      <ProtectedRoute allowedRoles={['ADMIN']}>
                        <OpdManagement />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/admin/patients"
                    element={
                      <ProtectedRoute allowedRoles={['ADMIN']}>
                        <PatientManagement />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/admin/appointments"
                    element={
                      <ProtectedRoute allowedRoles={['ADMIN']}>
                        <AppointmentManagement />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/admin/audit-logs"
                    element={
                      <ProtectedRoute allowedRoles={['ADMIN']}>
                        <AuditLogs />
                      </ProtectedRoute>
                    }
                  />

                  {/* Fallback */}
                  <Route path="*" element={<Navigate to="/" replace />} />
                </Routes>
              </main>

              <Footer />
            </div>
          </ToastProvider>
        </AuthProvider>
      </LanguageProvider>
    </Router>
  );
};

export default App;
