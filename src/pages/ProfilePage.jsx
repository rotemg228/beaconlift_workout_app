import { useState } from 'react';
import { motion } from 'framer-motion';
import { Plus, Weight, Ruler, Trash2, ChevronDown, ChevronUp, Check, Bug, MessageCircle, LogOut, Crown, ShieldCheck } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { useMeasurementStore, useSettingsStore, useUserStore } from '../store';
import { supabase } from '../supabase';
import { format, parseISO } from 'date-fns';

const MEASUREMENT_FIELDS = [
  { key: 'chest',      label: 'Chest'       },
  { key: 'waist',      label: 'Waist'       },
  { key: 'hips',       label: 'Hips'        },
  { key: 'leftArm',    label: 'Left Arm'    },
  { key: 'rightArm',   label: 'Right Arm'   },
  { key: 'leftThigh',  label: 'Left Thigh'  },
  { key: 'rightThigh', label: 'Right Thigh' },
];

function AddMeasurementSheet({ onClose }) {
  const { addMeasurement } = useMeasurementStore();
  const { unit } = useSettingsStore();
  const [form, setForm] = useState({ weight: '', bodyFat: '', measurements: {}, date: new Date().toISOString().split('T')[0] });
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    const entry = {
      date: form.date,
      weight: form.weight ? +form.weight : undefined,
      bodyFat: form.bodyFat ? +form.bodyFat : undefined,
      measurements: Object.fromEntries(
        Object.entries(form.measurements).filter(([, v]) => v !== '' && v != null).map(([k, v]) => [k, +v])
      ),
    };
    addMeasurement(entry);
    setSaved(true);
    setTimeout(onClose, 700);
  };

  return (
    <div className="modal-overlay animate-fadeIn" onClick={onClose}>
      <motion.div
        className="modal-sheet"
        onClick={e => e.stopPropagation()}
        initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }}
        transition={{ type: 'spring', damping: 30, stiffness: 300 }}
      >
        <div className="modal-handle" />
        <h3 className="mb-16">Log Measurements</h3>

        <div className="input-group mb-12">
          <label className="input-label">Date</label>
          <input type="date" className="input" value={form.date} onChange={e => setForm(f => ({ ...f, date: e.target.value }))} />
        </div>

        <div className="flex gap-12 mb-12">
          <div className="input-group" style={{ flex: 1 }}>
            <label className="input-label">Body Weight ({unit})</label>
            <input type="number" className="input" placeholder="0" value={form.weight} onChange={e => setForm(f => ({ ...f, weight: e.target.value }))} onFocus={e => e.target.select()} min="0" step="0.1" />
          </div>
          <div className="input-group" style={{ flex: 1 }}>
            <label className="input-label">Body Fat %</label>
            <input type="number" className="input" placeholder="0" value={form.bodyFat} onChange={e => setForm(f => ({ ...f, bodyFat: e.target.value }))} onFocus={e => e.target.select()} min="0" max="60" step="0.1" />
          </div>
        </div>

        <div className="section-title mb-10">Body Measurements (cm)</div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 20 }}>
          {MEASUREMENT_FIELDS.map(({ key, label }) => (
            <div key={key} className="input-group">
              <label className="input-label">{label}</label>
              <input
                type="number" className="input" placeholder="0" min="0" step="0.5"
                value={form.measurements[key] ?? ''}
                onChange={e => setForm(f => ({ ...f, measurements: { ...f.measurements, [key]: e.target.value } }))}
                onFocus={e => e.target.select()}
              />
            </div>
          ))}
        </div>

        <button className="btn btn-primary btn-full" onClick={handleSave}>
          {saved ? <><Check size={16} /> Saved!</> : 'Save Measurements'}
        </button>
      </motion.div>
    </div>
  );
}

export default function ProfilePage() {
  const { measurements, deleteMeasurement, getLatest, getWeightHistory } = useMeasurementStore();
  const { unit, setUnit, name, setName, defaultRest, setDefaultRest } = useSettingsStore();
  const { user, profile, logout } = useUserStore();
  const [showAdd, setShowAdd] = useState(false);
  const [editName, setEditName] = useState(false);
  const [nameInput, setNameInput] = useState(name);
  const [expanded, setExpanded] = useState(false);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    logout();
  };

  const latest = getLatest();
  const weightHistory = getWeightHistory().map(d => ({
    ...d,
    date: (() => { try { return format(parseISO(d.date), 'MMM d'); } catch { return d.date; } })(),
  }));

  const displayName = user?.user_metadata?.username || profile.username || user?.user_metadata?.full_name || name || 'Athlete';
  const avatarUrl = user?.user_metadata?.avatar_url;
  const { setProModalOpen } = useUserStore();

  return (
    <div className="page-content">
      <div className="topbar">
        <span className="topbar-title">Profile</span>
        <div className="flex gap-12">
          <button className="btn-icon" onClick={handleLogout} style={{ color: 'var(--color-text-muted)' }}>
            <LogOut size={20} />
          </button>
          <button className="topbar-action" onClick={() => setShowAdd(true)}><Plus size={20} /></button>
        </div>
      </div>

      {/* ── User Card ── */}
      <motion.div className="card mb-12" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
        <div className="flex items-center justify-between">
          <div style={{ flex: 1 }}>
            <div className="flex items-center gap-6 mb-4">
              <span className="section-title" style={{ marginBottom: 0 }}>Account</span>
              {profile.isPro && (
                <div className="badge badge-accent flex items-center gap-4" style={{ fontSize: '0.6rem', padding: '2px 6px' }}>
                  <Crown size={10} /> PLUS
                </div>
              )}
            </div>
            
            {editName && !user ? (
              <div className="flex items-center gap-8">
                <input
                  className="input"
                  style={{ padding: '6px 10px', fontSize: '0.9rem' }}
                  value={nameInput}
                  onChange={e => setNameInput(e.target.value)}
                  autoFocus
                  onKeyDown={e => { if (e.key === 'Enter') { setName(nameInput); setEditName(false); } }}
                />
                <button className="btn btn-primary btn-sm" onClick={() => { setName(nameInput); setEditName(false); }}>Save</button>
              </div>
            ) : (
              <div className="font-bold text-lg" onClick={() => !user && setEditName(true)} style={{ cursor: user ? 'default' : 'pointer' }}>
                {displayName}
              </div>
            )}
            <div className="text-xs text-muted">{user?.email || 'Logged in locally'}</div>
          </div>

          <div style={{ position: 'relative' }}>
            {avatarUrl ? (
              <img 
                src={avatarUrl} 
                alt={displayName} 
                style={{ width: 52, height: 52, borderRadius: '50%', objectFit: 'cover', border: '2px solid var(--color-accent)' }} 
              />
            ) : (
              <div style={{
                width: 52, height: 52, borderRadius: '50%',
                background: 'linear-gradient(135deg, var(--color-accent), var(--color-accent-muted))',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '1.4rem', fontFamily: 'var(--font-display)', letterSpacing: '0.05em',
              }}>
                {displayName ? displayName[0].toUpperCase() : '🔥'}
              </div>
            )}
            {profile.isPro && (
              <div style={{ position: 'absolute', bottom: -2, right: -2, background: 'var(--color-accent)', borderRadius: '50%', padding: 3, border: '2px solid var(--color-surface)' }}>
                <ShieldCheck size={12} color="#000" />
              </div>
            )}
          </div>
        </div>
      </motion.div>

      {/* ── BeaconLift Plus Upsell ── */}
      {!profile.isPro && (
        <motion.div 
          className="card mb-12" 
          style={{ 
            background: 'linear-gradient(135deg, rgba(255, 122, 0, 0.15), rgba(255, 122, 0, 0.05))',
            border: '1px solid rgba(255, 122, 0, 0.3)'
          }}
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 }}
        >
          <div className="flex items-center gap-12">
            <div className="icon-circle" style={{ background: 'var(--color-accent)', color: '#000' }}>
              <Crown size={20} />
            </div>
            <div style={{ flex: 1 }}>
              <div className="font-bold">Upgrade to BeaconLift Plus</div>
              <div className="text-xs text-muted">Cloud sync, unlimited templates & charts.</div>
            </div>
            <button className="btn btn-primary btn-sm" onClick={() => setProModalOpen(true)}>Get Plus</button>
          </div>
        </motion.div>
      )}

      {/* ── Latest stats ── */}
      {latest && (
        <motion.div className="card mb-12" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.05 }}>
          <div className="section-title mb-10">Latest Measurements</div>
          <div className="stat-grid">
            {latest.weight && (
              <div className="stat-box">
                <div className="stat-value">{latest.weight}</div>
                <div className="stat-label">{unit}</div>
              </div>
            )}
            {latest.bodyFat && (
              <div className="stat-box">
                <div className="stat-value">{latest.bodyFat}%</div>
                <div className="stat-label">Body Fat</div>
              </div>
            )}
            {latest.measurements?.waist && (
              <div className="stat-box">
                <div className="stat-value">{latest.measurements.waist}</div>
                <div className="stat-label">Waist cm</div>
              </div>
            )}
          </div>
          {Object.keys(latest.measurements ?? {}).length > 0 && (
            <div style={{ marginTop: 10 }}>
              <button className="btn btn-ghost btn-sm btn-full" onClick={() => setExpanded(!expanded)}>
                {expanded ? <><ChevronUp size={14} /> Hide</> : <><ChevronDown size={14} /> All measurements</>}
              </button>
              {expanded && (
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginTop: 10 }}>
                  {MEASUREMENT_FIELDS.filter(f => latest.measurements?.[f.key]).map(f => (
                    <div key={f.key} className="stat-box">
                      <div className="stat-value">{latest.measurements[f.key]}</div>
                      <div className="stat-label">{f.label}</div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </motion.div>
      )}

      {/* ── Weight chart ── */}
      {weightHistory.length >= 2 && (
        <motion.div className="card mb-12" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 }}>
          <div className="section-title mb-10">Weight History</div>
          <ResponsiveContainer width="100%" height={160}>
            <AreaChart data={weightHistory} margin={{ top: 4, right: 4, left: -24, bottom: 0 }}>
              <defs>
                <linearGradient id="weightGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%"  stopColor="#3B82F6" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#3B82F6" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid stroke="var(--color-border)" strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="date" tick={{ fill: 'var(--color-text-muted)', fontSize: 10 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: 'var(--color-text-muted)', fontSize: 10 }} axisLine={false} tickLine={false} domain={['auto', 'auto']} />
              <Tooltip contentStyle={{ background: 'var(--color-surface-2)', border: '1px solid var(--color-border)', borderRadius: 8, fontSize: '0.8rem' }} />
              <Area type="monotone" dataKey="weight" name={`Weight (${unit})`} stroke="#3B82F6" strokeWidth={2.5} fill="url(#weightGrad)" dot={{ fill: '#3B82F6', r: 3 }} />
            </AreaChart>
          </ResponsiveContainer>
        </motion.div>
      )}

      {/* ── Settings ── */}
      <motion.div className="card mb-12" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.12 }}>
        <div className="section-title mb-12">Settings</div>

        <div className="flex items-center justify-between mb-12">
          <div>
            <div className="text-sm font-semibold">Weight Unit</div>
            <div className="text-xs text-muted">Used across the entire app</div>
          </div>
          <div className="tabs" style={{ width: 'auto' }}>
            <button className={`tab${unit === 'kg' ? ' active' : ''}`} onClick={() => setUnit('kg')}>kg</button>
            <button className={`tab${unit === 'lbs' ? ' active' : ''}`} onClick={() => setUnit('lbs')}>lbs</button>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <div>
            <div className="text-sm font-semibold">Default Rest Time</div>
            <div className="text-xs text-muted">{defaultRest}s between sets</div>
          </div>
          <div className="flex gap-6">
            {[60, 90, 120, 180].map(s => (
              <button
                key={s}
                className={`chip${defaultRest === s ? ' active' : ''}`}
                style={{ fontSize: '0.72rem', padding: '4px 10px' }}
                onClick={() => setDefaultRest(s)}
              >
                {s}s
              </button>
            ))}
          </div>
        </div>
      </motion.div>

      {/* ── Support & Feedback ── */}
      <motion.div className="card mb-12" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.14 }}>
        <div className="section-title mb-12">Support & Feedback</div>
        <div className="flex-col gap-8">
          <a
            href="mailto:forgeesupport@proton.me?subject=BeaconLift Bug Report&body=Please describe the bug and steps to reproduce:"
            className="btn btn-ghost btn-sm btn-full items-center gap-8 justify-start"
            style={{ textAlign: 'left', padding: '12px' }}
          >
            <Bug size={16} color="var(--color-danger)" />
            <div>
              <div className="text-sm font-semibold">Report a Bug</div>
              <div className="text-xs text-muted">Help us improve the experience</div>
            </div>
          </a>
          <a
            href="mailto:forgeesupport@proton.me?subject=BeaconLift Feature Request&body=What feature would you like to see?"
            className="btn btn-ghost btn-sm btn-full items-center gap-8 justify-start"
            style={{ textAlign: 'left', padding: '12px' }}
          >
            <MessageCircle size={16} color="var(--color-accent)" />
            <div>
              <div className="text-sm font-semibold">Request a Feature</div>
              <div className="text-xs text-muted">Tell us what's missing</div>
            </div>
          </a>
        </div>
      </motion.div>

      {/* ── Measurement Log ── */}
      {measurements.length > 0 && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.15 }}>
          <div className="section-title mb-10">Measurement Log</div>
          <div className="flex-col gap-8">
            {measurements.map((m, i) => (
              <div key={m.id} className="card card-sm flex items-center justify-between">
                <div>
                  <div className="text-sm font-semibold">
                    {(() => { try { return format(parseISO(m.date), 'MMM d, yyyy'); } catch { return m.date; } })()}
                  </div>
                  <div className="text-xs text-muted">
                    {m.weight && `${m.weight}${unit}`}{m.bodyFat && ` · ${m.bodyFat}% BF`}
                  </div>
                </div>
                <button className="btn-icon" onClick={() => deleteMeasurement(m.id)} style={{ color: 'var(--color-danger)' }}>
                  <Trash2 size={14} />
                </button>
              </div>
            ))}
          </div>
        </motion.div>
      )}

      {measurements.length === 0 && (
        <div className="empty-state">
          <Weight size={40} color="var(--color-text-muted)" style={{ opacity: 0.4 }} />
          <p>No measurements logged yet</p>
          <button className="btn btn-primary btn-sm mt-12" onClick={() => setShowAdd(true)}>
            <Plus size={16} /> Add First Entry
          </button>
        </div>
      )}

      {showAdd && <AddMeasurementSheet onClose={() => setShowAdd(false)} />}
    </div>
  );
}
