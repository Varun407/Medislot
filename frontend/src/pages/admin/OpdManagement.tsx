import React, { useState, useEffect } from 'react';
import { apiClient } from '../../api/client';
import { useToast } from '../../context/ToastContext';
import {
  Stethoscope,
  Clock,
  Building2,
  Calendar,
  CheckCircle2,
  XCircle,
  AlertCircle,
  ArrowRight,
  Radio,
  Search,
  Filter,
  Volume2,
  Check,
  Edit2,
  Save,
  Users
} from 'lucide-react';

interface OpdDoctor {
  userId: string;
  fullName: string;
  phone: string;
  email: string;
  specialization: string;
  qualifications: string;
  hospitalId: string;
  hospitalName: string;
  roomNo: string | null;
  consultationHours: string;
  todayAvailable: number;
  slots: string[];
  todayStats: {
    total: number;
    completed: number;
    cancelled: number;
    waiting: number;
    currentServingToken: number;
  };
}

interface QueuePatient {
  id: string;
  tokenNumber: number;
  patientName: string;
  patientPhone: string;
  patientAge: number;
  patientGender: string;
  abhaId: string | null;
  slotTime: string;
  status: string;
  symptoms: string;
}

export const OpdManagement: React.FC = () => {
  const { success, error } = useToast();

  const [activeTab, setActiveTab] = useState<'rosters' | 'queue'>('rosters');
  const [doctors, setDoctors] = useState<OpdDoctor[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDept, setSelectedDept] = useState('ALL');

  // Edit Doctor Modal / State
  const [editingDoc, setEditingDoc] = useState<OpdDoctor | null>(null);
  const [editRoom, setEditRoom] = useState('');
  const [editHours, setEditHours] = useState('');
  const [editAvailable, setEditAvailable] = useState(1);
  const [editSlots, setEditSlots] = useState<string[]>([]);
  const [newSlotInput, setNewSlotInput] = useState('');
  const [savingEdit, setSavingEdit] = useState(false);

  // Live Queue Desk State
  const [selectedQueueDoc, setSelectedQueueDoc] = useState<string>('');
  const [queueDate, setQueueDate] = useState<string>(() => new Date().toISOString().split('T')[0]);
  const [queueData, setQueueData] = useState<{
    currentServingToken: number;
    totalPatients: number;
    waitingCount: number;
    inConsultationCount: number;
    completedCount: number;
    patients: QueuePatient[];
  } | null>(null);
  const [loadingQueue, setLoadingQueue] = useState(false);
  const [callingNext, setCallingNext] = useState(false);

  // Fetch all OPD doctors
  const fetchDoctors = async () => {
    setLoading(true);
    try {
      const res = await apiClient.get('/admin/opd/doctors');
      setDoctors(res.data);
      if (res.data.length > 0 && !selectedQueueDoc) {
        setSelectedQueueDoc(res.data[0].fullName);
      }
    } catch (err: any) {
      error(err.response?.data?.error || 'Failed to load doctor OPD schedules.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDoctors();
  }, []);

  // Fetch Queue when activeTab is 'queue' or selectedQueueDoc changes
  const fetchQueue = async () => {
    if (!selectedQueueDoc) return;
    setLoadingQueue(true);
    try {
      const res = await apiClient.get('/admin/opd/queue', {
        params: { doctorName: selectedQueueDoc, date: queueDate }
      });
      setQueueData(res.data);
    } catch (err: any) {
      error(err.response?.data?.error || 'Failed to fetch doctor live queue.');
    } finally {
      setLoadingQueue(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'queue' && selectedQueueDoc) {
      fetchQueue();
    }
  }, [activeTab, selectedQueueDoc, queueDate]);

  // Quick toggle doctor duty availability directly from table
  const handleQuickToggleDuty = async (doc: OpdDoctor) => {
    const newStatus = doc.todayAvailable === 1 ? 0 : 1;
    try {
      await apiClient.put(`/admin/opd/doctors/${doc.userId}`, {
        todayAvailable: newStatus,
        roomNo: doc.roomNo || 'Room 101',
        consultationHours: doc.consultationHours || '8:30 AM - 2:00 PM',
        slots: doc.slots
      });
      success(
        `${doc.fullName} OPD status changed to ${newStatus === 1 ? 'AVAILABLE (On-Duty)' : 'CLOSED (Off-Duty)'}.`
      );
      fetchDoctors();
    } catch (err: any) {
      error(err.response?.data?.error || 'Failed to toggle doctor duty status.');
    }
  };

  // Open edit modal for a doctor
  const startEditing = (doc: OpdDoctor) => {
    setEditingDoc(doc);
    setEditRoom(doc.roomNo || 'Room 101');
    setEditHours(doc.consultationHours || '8:30 AM - 2:00 PM');
    setEditAvailable(doc.todayAvailable);
    setEditSlots(doc.slots && doc.slots.length > 0 ? [...doc.slots] : ['09:00 AM', '09:30 AM', '10:00 AM', '10:30 AM', '11:00 AM', '11:30 AM']);
  };

  const handleSaveOpdConfig = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingDoc) return;

    setSavingEdit(true);
    try {
      await apiClient.put(`/admin/opd/doctors/${editingDoc.userId}`, {
        todayAvailable: editAvailable,
        roomNo: editRoom,
        consultationHours: editHours,
        slots: editSlots
      });
      success(`Updated OPD schedule & room allocation for ${editingDoc.fullName}.`);
      setEditingDoc(null);
      fetchDoctors();
      if (selectedQueueDoc === editingDoc.fullName) {
        fetchQueue();
      }
    } catch (err: any) {
      error(err.response?.data?.error || 'Failed to save doctor OPD configuration.');
    } finally {
      setSavingEdit(false);
    }
  };

  const removeSlot = (slotToRemove: string) => {
    setEditSlots(editSlots.filter((s) => s !== slotToRemove));
  };

  const addSlot = () => {
    if (!newSlotInput.trim()) return;
    if (editSlots.includes(newSlotInput.trim())) {
      error('Slot already exists.');
      return;
    }
    setEditSlots([...editSlots, newSlotInput.trim()]);
    setNewSlotInput('');
  };

  // Call Next Patient Token
  const handleCallNextToken = async () => {
    if (!selectedQueueDoc) return;
    setCallingNext(true);
    try {
      const res = await apiClient.post('/admin/opd/queue/call-next', {
        doctorName: selectedQueueDoc,
        date: queueDate
      });
      success(res.data.message);
      fetchQueue();
      fetchDoctors();
    } catch (err: any) {
      error(err.response?.data?.error || 'Failed to call next token.');
    } finally {
      setCallingNext(false);
    }
  };

  // Update Specific Appointment Status
  const handleUpdateApptStatus = async (appointmentId: string, newStatus: string) => {
    try {
      await apiClient.patch('/admin/opd/queue/status', {
        appointmentId,
        status: newStatus
      });
      success(`Appointment status updated to ${newStatus}.`);
      fetchQueue();
      fetchDoctors();
    } catch (err: any) {
      error(err.response?.data?.error || 'Failed to update appointment status.');
    }
  };

  // Filtered doctors list
  const departments = ['ALL', ...Array.from(new Set(doctors.map((d) => d.specialization)))];
  const filteredDoctors = doctors.filter((doc) => {
    const matchesSearch =
      doc.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      doc.specialization.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (doc.roomNo && doc.roomNo.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesDept = selectedDept === 'ALL' || doc.specialization === selectedDept;
    return matchesSearch && matchesDept;
  });

  const totalDutyDoctors = doctors.filter((d) => d.todayAvailable === 1).length;
  const totalTodayPatients = doctors.reduce((acc, d) => acc + (d.todayStats?.total || 0), 0);
  const totalWaitingPatients = doctors.reduce((acc, d) => acc + (d.todayStats?.waiting || 0), 0);

  return (
    <div className="main-content">
      {/* Page Header */}
      <div className="section-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: 'var(--blue-50)', color: 'var(--blue-600)', padding: '3px 10px', borderRadius: '12px', fontSize: '0.74rem', fontWeight: 700, marginBottom: '6px' }}>
            <Radio size={12} className="pulse-dot" />
            Centralized Hospital Administration
          </div>
          <h1 className="section-title">Doctor OPD & Queue Management</h1>
          <p className="section-subtitle">
            Configure room allocations, duty rosters, slot capacities, and advance live consultation queues for all hospital doctors
          </p>
        </div>

        {/* Tab Toggle */}
        <div style={{ display: 'flex', background: 'var(--slate-100)', padding: '4px', borderRadius: '8px', border: '1px solid var(--slate-200)' }}>
          <button
            type="button"
            className={`btn btn-sm ${activeTab === 'rosters' ? 'btn-primary' : 'btn-outline'}`}
            style={{ border: 'none', background: activeTab === 'rosters' ? 'var(--blue-600)' : 'transparent', color: activeTab === 'rosters' ? '#fff' : 'var(--slate-600)' }}
            onClick={() => setActiveTab('rosters')}
          >
            <Stethoscope size={14} />
            Doctor Rosters & Schedules
          </button>
          <button
            type="button"
            className={`btn btn-sm ${activeTab === 'queue' ? 'btn-primary' : 'btn-outline'}`}
            style={{ border: 'none', background: activeTab === 'queue' ? 'var(--blue-600)' : 'transparent', color: activeTab === 'queue' ? '#fff' : 'var(--slate-600)' }}
            onClick={() => setActiveTab('queue')}
          >
            <Volume2 size={14} />
            Live Queue Desk & Token Caller
          </button>
        </div>
      </div>

      {/* Top Real-time Summary Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px', marginBottom: '24px' }}>
        <div className="med-card" style={{ padding: '16px 20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div className="stat-icon" style={{ background: 'var(--emerald-100)', color: 'var(--emerald-600)' }}>
              <Stethoscope />
            </div>
            <div>
              <div style={{ fontSize: '1.6rem', fontWeight: 900, color: 'var(--emerald-600)' }}>
                {totalDutyDoctors} / {doctors.length}
              </div>
              <div style={{ fontSize: '0.76rem', color: 'var(--slate-500)', fontWeight: 600 }}>Active On-Duty Doctors</div>
            </div>
          </div>
        </div>

        <div className="med-card" style={{ padding: '16px 20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div className="stat-icon" style={{ background: 'var(--blue-50)', color: 'var(--blue-600)' }}>
              <Users />
            </div>
            <div>
              <div style={{ fontSize: '1.6rem', fontWeight: 900, color: 'var(--navy-900)' }}>
                {totalTodayPatients}
              </div>
              <div style={{ fontSize: '0.76rem', color: 'var(--slate-500)', fontWeight: 600 }}>Total OPD Bookings Today</div>
            </div>
          </div>
        </div>

        <div className="med-card" style={{ padding: '16px 20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div className="stat-icon" style={{ background: 'var(--amber-100)', color: 'var(--amber-600)' }}>
              <Clock />
            </div>
            <div>
              <div style={{ fontSize: '1.6rem', fontWeight: 900, color: 'var(--amber-600)' }}>
                {totalWaitingPatients}
              </div>
              <div style={{ fontSize: '0.76rem', color: 'var(--slate-500)', fontWeight: 600 }}>Patients in Waiting Queues</div>
            </div>
          </div>
        </div>
      </div>

      {/* ================= TAB 1: DOCTOR ROSTERS & SCHEDULES ================= */}
      {activeTab === 'rosters' && (
        <div className="med-card" style={{ padding: '24px' }}>
          {/* Filter Bar */}
          <div style={{ display: 'flex', justifyContent: 'space-between', gap: '16px', flexWrap: 'wrap', marginBottom: '20px' }}>
            <div style={{ position: 'relative', flex: 1, minWidth: '240px' }}>
              <Search size={15} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--slate-400)' }} />
              <input
                type="text"
                className="form-input"
                style={{ paddingLeft: '36px' }}
                placeholder="Search by doctor name, specialization, or room number..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Filter size={15} color="var(--slate-400)" />
              <select
                className="form-select"
                style={{ width: 'auto' }}
                value={selectedDept}
                onChange={(e) => setSelectedDept(e.target.value)}
              >
                {departments.map((dept) => (
                  <option key={dept} value={dept}>
                    {dept === 'ALL' ? 'All Specializations' : dept}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Doctors Roster Table */}
          {loading ? (
            <div style={{ textAlign: 'center', padding: '40px' }}>
              <div className="pulse-dot" style={{ margin: '0 auto 8px' }} />
              <p style={{ color: 'var(--slate-500)', fontSize: '0.85rem' }}>Loading verified doctor rosters...</p>
            </div>
          ) : filteredDoctors.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px', color: 'var(--slate-500)' }}>
              No doctor profiles found matching the filter criteria.
            </div>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.86rem' }}>
                <thead>
                  <tr style={{ borderBottom: '2px solid var(--slate-200)', textAlign: 'left', color: 'var(--slate-500)', fontSize: '0.76rem' }}>
                    <th style={{ padding: '10px 12px' }}>DOCTOR NAME & QUALIFICATIONS</th>
                    <th style={{ padding: '10px 12px' }}>SPECIALIZATION</th>
                    <th style={{ padding: '10px 12px' }}>OPD ROOM NO</th>
                    <th style={{ padding: '10px 12px' }}>HOURS & SLOTS</th>
                    <th style={{ padding: '10px 12px' }}>TODAY'S QUEUE</th>
                    <th style={{ padding: '10px 12px' }}>DUTY STATUS</th>
                    <th style={{ padding: '10px 12px', textAlign: 'right' }}>ACTIONS</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredDoctors.map((doc) => (
                    <tr key={doc.userId} style={{ borderBottom: '1px solid var(--slate-100)' }}>
                      <td style={{ padding: '14px 12px' }}>
                        <div style={{ fontWeight: 800, color: 'var(--navy-900)' }}>{doc.fullName}</div>
                        <div style={{ fontSize: '0.78rem', color: 'var(--blue-600)', fontWeight: 600 }}>{doc.qualifications}</div>
                        <div style={{ fontSize: '0.72rem', color: 'var(--slate-400)' }}>{doc.hospitalName || doc.hospitalId}</div>
                      </td>
                      <td style={{ padding: '14px 12px' }}>
                        <span className="status-pill status-verified" style={{ fontSize: '0.72rem' }}>
                          {doc.specialization}
                        </span>
                      </td>
                      <td style={{ padding: '14px 12px', fontWeight: 600, color: 'var(--slate-700)' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                          <Building2 size={13} color="var(--slate-400)" />
                          <span>{doc.roomNo || 'Room 101 (OPD)'}</span>
                        </div>
                      </td>
                      <td style={{ padding: '14px 12px' }}>
                        <div style={{ fontWeight: 600, color: 'var(--navy-900)', fontSize: '0.82rem' }}>
                          {doc.consultationHours || '8:30 AM - 2:00 PM'}
                        </div>
                        <div style={{ fontSize: '0.74rem', color: 'var(--slate-500)' }}>
                          {doc.slots?.length || 0} active slot intervals
                        </div>
                      </td>
                      <td style={{ padding: '14px 12px' }}>
                        <div style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--navy-900)' }}>
                          {doc.todayStats?.total || 0} Booked
                        </div>
                        <div style={{ fontSize: '0.74rem', color: 'var(--emerald-600)' }}>
                          Serving Token #{String(doc.todayStats?.currentServingToken || 0).padStart(2, '0')}
                        </div>
                      </td>
                      <td style={{ padding: '14px 12px' }}>
                        <button
                          type="button"
                          onClick={() => handleQuickToggleDuty(doc)}
                          className={`status-pill ${doc.todayAvailable === 1 ? 'status-confirmed' : 'status-cancelled'}`}
                          style={{ cursor: 'pointer', border: 'none', display: 'inline-flex', alignItems: 'center', gap: '4px', fontSize: '0.76rem' }}
                          title="Click to toggle OPD duty availability"
                        >
                          {doc.todayAvailable === 1 ? (
                            <>
                              <CheckCircle2 size={12} />
                              On Duty (Available)
                            </>
                          ) : (
                            <>
                              <XCircle size={12} />
                              Off Duty (Closed)
                            </>
                          )}
                        </button>
                      </td>
                      <td style={{ padding: '14px 12px', textAlign: 'right' }}>
                        <div style={{ display: 'inline-flex', gap: '8px' }}>
                          <button
                            type="button"
                            className="btn btn-outline btn-sm"
                            style={{ padding: '5px 10px', fontSize: '0.78rem' }}
                            onClick={() => startEditing(doc)}
                          >
                            <Edit2 size={12} />
                            Manage OPD
                          </button>
                          <button
                            type="button"
                            className="btn btn-primary btn-sm"
                            style={{ padding: '5px 10px', fontSize: '0.78rem' }}
                            onClick={() => {
                              setSelectedQueueDoc(doc.fullName);
                              setActiveTab('queue');
                            }}
                          >
                            <Volume2 size={12} />
                            Queue Desk
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* ================= TAB 2: LIVE OPD QUEUE & TOKEN CALLER ================= */}
      {activeTab === 'queue' && (
        <div>
          {/* Controls Bar */}
          <div className="med-card" style={{ padding: '20px', marginBottom: '24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
                <div>
                  <label className="form-label" style={{ marginBottom: '4px' }}>Select Doctor OPD</label>
                  <select
                    className="form-select"
                    style={{ minWidth: '260px' }}
                    value={selectedQueueDoc}
                    onChange={(e) => setSelectedQueueDoc(e.target.value)}
                  >
                    {doctors.map((d) => (
                      <option key={d.userId} value={d.fullName}>
                        {d.fullName} ({d.specialization}) - {d.roomNo || 'Room 101'}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="form-label" style={{ marginBottom: '4px' }}>Queue Date</label>
                  <input
                    type="date"
                    className="form-input"
                    value={queueDate}
                    onChange={(e) => setQueueDate(e.target.value)}
                  />
                </div>
              </div>

              {/* Call Next Token Action */}
              <button
                type="button"
                className="btn btn-primary btn-lg"
                disabled={callingNext || !queueData || queueData.waitingCount === 0}
                onClick={handleCallNextToken}
                style={{ padding: '12px 24px', fontSize: '1rem', background: 'var(--emerald-600)', borderColor: 'var(--emerald-600)' }}
              >
                <Volume2 size={20} />
                {callingNext ? 'Calling Token...' : 'Call Next Token'}
              </button>
            </div>
          </div>

          {/* Live Queue Banner */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginBottom: '24px' }}>
            <div className="med-card" style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', padding: '18px 22px', textAlign: 'center' }}>
              <div style={{ fontSize: '0.76rem', color: '#166534', fontWeight: 800, textTransform: 'uppercase' }}>
                CURRENT SERVING TOKEN
              </div>
              <div style={{ fontSize: '2.8rem', fontWeight: 900, color: '#15803d', lineHeight: 1.1, margin: '6px 0' }}>
                #{String(queueData?.currentServingToken || 0).padStart(2, '0')}
              </div>
              <div style={{ fontSize: '0.78rem', color: '#166534' }}>
                Active in consultation room
              </div>
            </div>

            <div className="med-card" style={{ padding: '18px 22px', textAlign: 'center' }}>
              <div style={{ fontSize: '0.76rem', color: 'var(--slate-500)', fontWeight: 800, textTransform: 'uppercase' }}>
                TOTAL APPOINTMENTS
              </div>
              <div style={{ fontSize: '2.4rem', fontWeight: 900, color: 'var(--navy-900)', lineHeight: 1.1, margin: '6px 0' }}>
                {queueData?.totalPatients || 0}
              </div>
              <div style={{ fontSize: '0.78rem', color: 'var(--slate-500)' }}>
                Registered on {queueDate}
              </div>
            </div>

            <div className="med-card" style={{ padding: '18px 22px', textAlign: 'center' }}>
              <div style={{ fontSize: '0.76rem', color: 'var(--amber-700)', fontWeight: 800, textTransform: 'uppercase' }}>
                PATIENTS WAITING
              </div>
              <div style={{ fontSize: '2.4rem', fontWeight: 900, color: 'var(--amber-600)', lineHeight: 1.1, margin: '6px 0' }}>
                {queueData?.waitingCount || 0}
              </div>
              <div style={{ fontSize: '0.78rem', color: 'var(--amber-700)' }}>
                Awaiting turn in waiting lounge
              </div>
            </div>

            <div className="med-card" style={{ padding: '18px 22px', textAlign: 'center' }}>
              <div style={{ fontSize: '0.76rem', color: 'var(--blue-700)', fontWeight: 800, textTransform: 'uppercase' }}>
                COMPLETED
              </div>
              <div style={{ fontSize: '2.4rem', fontWeight: 900, color: 'var(--blue-600)', lineHeight: 1.1, margin: '6px 0' }}>
                {queueData?.completedCount || 0}
              </div>
              <div style={{ fontSize: '0.78rem', color: 'var(--blue-700)' }}>
                Consultations finished
              </div>
            </div>
          </div>

          {/* Patients Queue Table */}
          <div className="med-card" style={{ padding: '24px' }}>
            <h3 style={{ margin: '0 0 16px', fontSize: '1.1rem', fontWeight: 800, color: 'var(--navy-900)' }}>
              Queue Roster for {selectedQueueDoc} ({queueDate})
            </h3>

            {loadingQueue ? (
              <div style={{ textAlign: 'center', padding: '40px' }}>
                <div className="pulse-dot" style={{ margin: '0 auto 8px' }} />
                <p style={{ color: 'var(--slate-500)', fontSize: '0.85rem' }}>Loading live patient token list...</p>
              </div>
            ) : !queueData || queueData.patients.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '40px', color: 'var(--slate-500)' }}>
                No patient appointments booked for this doctor on {queueDate}.
              </div>
            ) : (
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.86rem' }}>
                  <thead>
                    <tr style={{ borderBottom: '2px solid var(--slate-200)', textAlign: 'left', color: 'var(--slate-500)', fontSize: '0.76rem' }}>
                      <th style={{ padding: '10px 12px' }}>TOKEN #</th>
                      <th style={{ padding: '10px 12px' }}>PATIENT NAME</th>
                      <th style={{ padding: '10px 12px' }}>CONTACT / PHONE</th>
                      <th style={{ padding: '10px 12px' }}>AROGYASRI ID</th>
                      <th style={{ padding: '10px 12px' }}>SLOT TIME</th>
                      <th style={{ padding: '10px 12px' }}>QUEUE STATUS</th>
                      <th style={{ padding: '10px 12px', textAlign: 'right' }}>ACTIONS</th>
                    </tr>
                  </thead>
                  <tbody>
                    {queueData.patients.map((p) => (
                      <tr key={p.id} style={{ borderBottom: '1px solid var(--slate-100)', background: p.status === 'CALLED' ? '#f0fdf4' : 'transparent' }}>
                        <td style={{ padding: '12px', fontWeight: 900, fontSize: '1.1rem', color: p.status === 'CALLED' ? '#15803d' : 'var(--blue-600)' }}>
                          #{String(p.tokenNumber).padStart(2, '0')}
                        </td>
                        <td style={{ padding: '12px' }}>
                          <div style={{ fontWeight: 800, color: 'var(--navy-900)' }}>{p.patientName}</div>
                          <div style={{ fontSize: '0.76rem', color: 'var(--slate-500)' }}>
                            {p.patientAge ? `${p.patientAge} Yrs` : 'Age N/A'} · {p.patientGender || 'Unspecified'}
                          </div>
                        </td>
                        <td style={{ padding: '12px', color: 'var(--slate-600)' }}>
                          +91 {p.patientPhone}
                        </td>
                        <td style={{ padding: '12px', color: 'var(--slate-600)' }}>
                          {p.abhaId || 'Standard Citizen'}
                        </td>
                        <td style={{ padding: '12px', fontWeight: 600, color: 'var(--navy-900)' }}>
                          {p.slotTime}
                        </td>
                        <td style={{ padding: '12px' }}>
                          <span className={`status-pill status-${p.status.toLowerCase()}`}>
                            {p.status}
                          </span>
                        </td>
                        <td style={{ padding: '12px', textAlign: 'right' }}>
                          <div style={{ display: 'inline-flex', gap: '6px' }}>
                            {p.status !== 'COMPLETED' && p.status !== 'CANCELLED' && (
                              <>
                                <button
                                  type="button"
                                  className="btn btn-outline btn-sm"
                                  style={{ padding: '4px 8px', fontSize: '0.74rem' }}
                                  onClick={() => handleUpdateApptStatus(p.id, 'IN_CONSULTATION')}
                                  title="Mark In Consultation"
                                >
                                  In Consultation
                                </button>
                                <button
                                  type="button"
                                  className="btn btn-primary btn-sm"
                                  style={{ padding: '4px 8px', fontSize: '0.74rem', background: 'var(--emerald-600)', borderColor: 'var(--emerald-600)' }}
                                  onClick={() => handleUpdateApptStatus(p.id, 'COMPLETED')}
                                  title="Mark Finished"
                                >
                                  <Check size={12} />
                                  Complete
                                </button>
                              </>
                            )}
                            {p.status !== 'CANCELLED' && (
                              <button
                                type="button"
                                className="btn btn-secondary btn-sm"
                                style={{ padding: '4px 8px', fontSize: '0.74rem', color: 'var(--rose-600)' }}
                                onClick={() => handleUpdateApptStatus(p.id, 'CANCELLED')}
                                title="Mark Cancelled / No-show"
                              >
                                Cancel
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ================= MODAL: EDIT DOCTOR OPD CONFIGURATION ================= */}
      {editingDoc && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(15, 23, 42, 0.6)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '20px' }}>
          <div className="med-card" style={{ maxWidth: '580px', width: '100%', maxHeight: '90vh', overflowY: 'auto', padding: '28px', boxShadow: 'var(--shadow-xl)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', borderBottom: '1px solid var(--slate-200)', paddingBottom: '14px' }}>
              <div>
                <h3 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 800, color: 'var(--navy-900)' }}>
                  Manage OPD Configuration
                </h3>
                <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--blue-600)', fontWeight: 600 }}>
                  {editingDoc.fullName} ({editingDoc.specialization})
                </p>
              </div>
              <button
                type="button"
                onClick={() => setEditingDoc(null)}
                style={{ background: 'none', border: 'none', fontSize: '1.4rem', cursor: 'pointer', color: 'var(--slate-400)' }}
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveOpdConfig}>
              {/* Duty Toggle */}
              <div className="form-group">
                <label className="form-label">OPD Duty Status</label>
                <div style={{ display: 'flex', gap: '10px' }}>
                  <button
                    type="button"
                    className={`btn btn-sm ${editAvailable === 1 ? 'btn-primary' : 'btn-outline'}`}
                    style={{ flex: 1, justifyContent: 'center' }}
                    onClick={() => setEditAvailable(1)}
                  >
                    <CheckCircle2 size={15} />
                    On Duty (OPD Open)
                  </button>
                  <button
                    type="button"
                    className={`btn btn-sm ${editAvailable === 0 ? 'btn-secondary' : 'btn-outline'}`}
                    style={{ flex: 1, justifyContent: 'center', color: editAvailable === 0 ? 'var(--rose-600)' : undefined }}
                    onClick={() => setEditAvailable(0)}
                  >
                    <XCircle size={15} />
                    Off Duty (OPD Closed / On Leave)
                  </button>
                </div>
              </div>

              {/* Room Allocation */}
              <div className="form-group">
                <label className="form-label">OPD Room Number / Location</label>
                <input
                  type="text"
                  className="form-input"
                  required
                  placeholder="e.g. Room 102 (OPD Ground Floor)"
                  value={editRoom}
                  onChange={(e) => setEditRoom(e.target.value)}
                />
              </div>

              {/* Consultation Hours */}
              <div className="form-group">
                <label className="form-label">Consultation Hours</label>
                <input
                  type="text"
                  className="form-input"
                  required
                  placeholder="e.g. 8:30 AM - 2:00 PM"
                  value={editHours}
                  onChange={(e) => setEditHours(e.target.value)}
                />
              </div>

              {/* Slots Management */}
              <div className="form-group">
                <label className="form-label">Consultation Slots Interval ({editSlots.length} Active)</label>
                <div style={{ display: 'flex', gap: '8px', marginBottom: '10px' }}>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="e.g. 02:00 PM or 09:15 AM"
                    value={newSlotInput}
                    onChange={(e) => setNewSlotInput(e.target.value)}
                  />
                  <button
                    type="button"
                    className="btn btn-secondary btn-sm"
                    onClick={addSlot}
                    style={{ whiteSpace: 'nowrap' }}
                  >
                    + Add Slot
                  </button>
                </div>

                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', maxHeight: '140px', overflowY: 'auto', background: 'var(--slate-50)', padding: '10px', borderRadius: '8px', border: '1px solid var(--slate-200)' }}>
                  {editSlots.map((slot) => (
                    <span
                      key={slot}
                      style={{ background: '#ffffff', border: '1px solid var(--slate-300)', padding: '4px 10px', borderRadius: '16px', fontSize: '0.78rem', display: 'inline-flex', alignItems: 'center', gap: '6px', fontWeight: 600 }}
                    >
                      {slot}
                      <button
                        type="button"
                        onClick={() => removeSlot(slot)}
                        style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--rose-500)', padding: 0, fontSize: '0.9rem' }}
                        title="Remove slot"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
              </div>

              {/* Form Action Buttons */}
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '24px' }}>
                <button
                  type="button"
                  className="btn btn-outline"
                  onClick={() => setEditingDoc(null)}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={savingEdit}
                >
                  <Save size={15} />
                  {savingEdit ? 'Saving Changes...' : 'Save OPD Configuration'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
