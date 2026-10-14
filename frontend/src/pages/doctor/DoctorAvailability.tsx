import React, { useState, useEffect } from 'react';
import { apiClient } from '../../api/client';
import { useToast } from '../../context/ToastContext';
import { useLanguage } from '../../context/LanguageContext';
import { Clock, Check, Plus, Trash2, Save } from 'lucide-react';

export const DoctorAvailability: React.FC = () => {
  const { success, error } = useToast();
  const { lang, t, localizeTime } = useLanguage();

  const [todayAvailable, setTodayAvailable] = useState<boolean>(true);
  const [consultationHours, setConsultationHours] = useState('8:30 AM - 2:00 PM');
  const [slots, setSlots] = useState<string[]>([]);
  const [newSlot, setNewSlot] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    async function fetchAvailability() {
      try {
        const res = await apiClient.get('/doctors/availability');
        setTodayAvailable(res.data.todayAvailable === 1);
        setConsultationHours(res.data.consultationHours || '8:30 AM - 2:00 PM');
        setSlots(res.data.slots || []);
      } catch (err) {
        console.error('Failed to load availability:', err);
      } finally {
        setLoading(false);
      }
    }
    fetchAvailability();
  }, []);

  const handleAddSlot = () => {
    if (!newSlot.trim()) return;
    if (slots.includes(newSlot.trim())) {
      error(lang === 'te' ? 'స్లాట్ ఇప్పటికే ఉంది.' : 'Slot already exists.');
      return;
    }
    setSlots([...slots, newSlot.trim()]);
    setNewSlot('');
  };

  const handleRemoveSlot = (slotToRemove: string) => {
    setSlots(slots.filter((s) => s !== slotToRemove));
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await apiClient.put('/doctors/availability', {
        todayAvailable,
        slots
      });
      success(lang === 'te' ? 'లభ్యత రోస్టర్ షెడ్యూల్ విజయవంతంగా సేవ్ చేయబడింది.' : 'Availability roster schedule updated successfully.');
    } catch (err: any) {
      error(err.response?.data?.error || (lang === 'te' ? 'షెడ్యూల్ సేవ్ చేయడం విఫలమైంది.' : 'Failed to save schedule.'));
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="main-content" style={{ maxWidth: '700px' }}>
      <div className="section-header">
        <h1 className="section-title">{t.opdAvailabilityTitle}</h1>
        <p className="section-subtitle">
          {t.opdAvailabilitySubtitle}
        </p>
      </div>

      <div className="med-card" style={{ padding: '30px' }}>
        <form onSubmit={handleSave}>
          {/* Duty Toggle */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'var(--slate-50)', padding: '16px', borderRadius: '10px', marginBottom: '24px', border: '1px solid var(--slate-200)' }}>
            <div>
              <div style={{ fontWeight: 700, color: 'var(--navy-900)' }}>{t.opdDutyStatusToday}</div>
              <div style={{ fontSize: '0.8rem', color: 'var(--slate-500)', marginTop: '2px' }}>
                {t.dutyToggleDesc}
              </div>
            </div>
            <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer', gap: '8px' }}>
              <input
                type="checkbox"
                checked={todayAvailable}
                onChange={(e) => setTodayAvailable(e.target.checked)}
                style={{ width: '18px', height: '18px', cursor: 'pointer' }}
              />
              <span style={{ fontWeight: 700, color: todayAvailable ? 'var(--emerald-600)' : 'var(--rose-600)', fontSize: '0.88rem' }}>
                {todayAvailable ? t.onDutyActive : t.offDutyInactive}
              </span>
            </label>
          </div>

          {/* Time Slots */}
          <div className="form-group" style={{ marginBottom: '20px' }}>
            <label className="form-label">{t.availSlotsForPatients}</label>
            <div style={{ display: 'flex', gap: '8px', marginBottom: '14px' }}>
              <input
                type="text"
                className="form-input"
                placeholder={t.newSlotPlaceholder}
                value={newSlot}
                onChange={(e) => setNewSlot(e.target.value)}
                style={{ maxWidth: '180px' }}
              />
              <button type="button" className="btn btn-secondary btn-sm" onClick={handleAddSlot}>
                <Plus size={14} />
                {t.addSlotBtn}
              </button>
            </div>

            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
              {slots.map((slot) => (
                <div
                  key={slot}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    background: 'var(--blue-50)',
                    color: 'var(--blue-600)',
                    padding: '6px 12px',
                    borderRadius: '6px',
                    border: '1px solid var(--blue-100)',
                    fontWeight: 700,
                    fontSize: '0.84rem'
                  }}
                >
                  <span>{localizeTime(slot)}</span>
                  <button
                    type="button"
                    onClick={() => handleRemoveSlot(slot)}
                    style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--rose-600)', display: 'flex', alignItems: 'center' }}
                  >
                    <Trash2 size={13} />
                  </button>
                </div>
              ))}
            </div>
          </div>

          <button type="submit" className="btn btn-primary" disabled={saving} style={{ width: '100%', marginTop: '16px' }}>
            <Save size={16} />
            {saving ? t.savingSchedule : t.saveRosterSchedule}
          </button>
        </form>
      </div>
    </div>
  );
};
