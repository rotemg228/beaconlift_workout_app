import { useState } from 'react';
import { motion } from 'framer-motion';
import { Calculator, Layers, Timer as TimerIcon, RotateCcw, Play, Pause } from 'lucide-react';
import { useRestTimer } from '../hooks';
import { Link } from 'react-router-dom';
import CustomSelect from '../components/CustomSelect';

// ─── 1RM CALCULATOR ──────────────────────────────────────
function OneRMCalc() {
  const [weight, setWeight] = useState('');
  const [reps, setReps] = useState('');

  const w = parseFloat(weight) || 0;
  const r = parseInt(reps) || 0;

  const formulas = r > 0 && w > 0 ? [
    { name: 'Epley',    value: +(w * (1 + r / 30)).toFixed(1) },
    { name: 'Brzycki',  value: +(w * (36 / (37 - r))).toFixed(1) },
    { name: 'Lombardi', value: +(w * Math.pow(r, 0.10)).toFixed(1) },
    { name: 'O\'Conner',value: +(w * (1 + r / 40)).toFixed(1) },
  ] : [];

  const best = formulas.length ? Math.round(formulas.reduce((a, b) => a + b.value, 0) / formulas.length) : 0;

  const percentages = best > 0 ? [
    { pct: 100, reps: '1',  weight: best },
    { pct: 95,  reps: '2',  weight: +(best * 0.95).toFixed(1) },
    { pct: 90,  reps: '3',  weight: +(best * 0.90).toFixed(1) },
    { pct: 85,  reps: '5',  weight: +(best * 0.85).toFixed(1) },
    { pct: 80,  reps: '6',  weight: +(best * 0.80).toFixed(1) },
    { pct: 75,  reps: '8',  weight: +(best * 0.75).toFixed(1) },
    { pct: 70,  reps: '10', weight: +(best * 0.70).toFixed(1) },
    { pct: 65,  reps: '12', weight: +(best * 0.65).toFixed(1) },
    { pct: 60,  reps: '15', weight: +(best * 0.60).toFixed(1) },
  ] : [];

  return (
    <div>
      <div className="flex gap-12 mb-16">
        <div className="input-group" style={{ flex: 1 }}>
          <label className="input-label">Weight (kg)</label>
          <input type="number" className="input" placeholder="100" value={weight} onChange={e => setWeight(e.target.value)} onFocus={e => e.target.select()} min="0" step="2.5" />
        </div>
        <div className="input-group" style={{ flex: 1 }}>
          <label className="input-label">Reps</label>
          <input type="number" className="input" placeholder="5" value={reps} onChange={e => setReps(e.target.value)} onFocus={e => e.target.select()} min="1" max="30" />
        </div>
      </div>

      {best > 0 && (
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
          {/* Big 1RM display */}
          <div className="card card-accent mb-16 text-center">
            <div className="text-muted text-xs font-semibold mb-4" style={{ letterSpacing: '0.1em', textTransform: 'uppercase' }}>Estimated 1RM</div>
            <div style={{ fontFamily: 'var(--font-display)', fontSize: '4rem', color: 'var(--color-accent)', lineHeight: 1 }}>{best}</div>
            <div className="text-muted text-sm">kg (average of 4 formulas)</div>
          </div>

          {/* Formula breakdown */}
          <div className="section-title mb-8">Formula Breakdown</div>
          <div className="flex gap-8 mb-16" style={{ flexWrap: 'wrap' }}>
            {formulas.map(f => (
              <div key={f.name} className="stat-box" style={{ flex: '1 1 80px' }}>
                <div className="stat-value" style={{ fontSize: '1.1rem' }}>{f.value}</div>
                <div className="stat-label">{f.name}</div>
              </div>
            ))}
          </div>

          {/* Percentage table */}
          <div className="section-title mb-8">Training Percentages</div>
          <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
            {percentages.map((row, i) => (
              <div key={row.pct} style={{
                display: 'grid', gridTemplateColumns: '1fr 1fr 1fr',
                padding: '10px 16px',
                background: i % 2 === 0 ? 'transparent' : 'var(--color-surface-2)',
                borderBottom: i < percentages.length - 1 ? '1px solid var(--color-border)' : 'none',
              }}>
                <span className="text-sm" style={{ color: row.pct === 100 ? 'var(--color-accent)' : 'var(--color-text-secondary)' }}>
                  {row.pct}%
                </span>
                <span className="text-sm font-bold text-center">{row.weight} kg</span>
                <span className="text-sm text-muted text-center">~{row.reps} reps</span>
              </div>
            ))}
          </div>
        </motion.div>
      )}
    </div>
  );
}

// ─── PLATES CALCULATOR ───────────────────────────────────
const PLATES_KG  = [25, 20, 15, 10, 5, 2.5, 1.25];
const PLATES_LBS = [45, 35, 25, 10, 5, 2.5];
const BAR_WEIGHTS = { kg: [20, 15, 10], lbs: [45, 35, 25] };

const PLATE_COLORS = {
  25: '#EF4444', 45: '#EF4444',
  20: '#3B82F6', 35: '#3B82F6',
  15: '#FFD700',
  10: '#22C55E',
  5:  '#A855F7',
  2.5:'#F59E0B',
  1.25:'#6B7280',
};

function PlatesCalc() {
  const [target, setTarget] = useState('');
  const [unit, setUnit] = useState('kg');
  const [barWeight, setBarWeight] = useState(20);

  const t = parseFloat(target) || 0;
  const plates = unit === 'kg' ? PLATES_KG : PLATES_LBS;
  const barOpts = BAR_WEIGHTS[unit];

  let remaining = Math.max(0, t - barWeight) / 2;
  const result = [];
  for (const plate of plates) {
    const count = Math.floor(remaining / plate);
    if (count > 0) { result.push({ plate, count }); remaining -= plate * count; }
  }
  const totalLoaded = barWeight + result.reduce((s, r) => s + r.plate * r.count * 2, 0);
  const remainder = +(remaining * 2).toFixed(2);

  return (
    <div>
      <div className="flex gap-8 mb-12">
        <button className={`chip${unit === 'kg' ? ' active' : ''}`} onClick={() => { setUnit('kg'); setBarWeight(20); }}>kg</button>
        <button className={`chip${unit === 'lbs' ? ' active' : ''}`} onClick={() => { setUnit('lbs'); setBarWeight(45); }}>lbs</button>
      </div>

      <div className="flex gap-12 mb-16">
        <div className="input-group" style={{ flex: 2 }}>
          <label className="input-label">Target Weight ({unit})</label>
          <input type="number" className="input" placeholder="100" value={target} onChange={e => setTarget(e.target.value)} onFocus={e => e.target.select()} min="0" step="2.5" />
        </div>
        <div className="input-group" style={{ flex: 1 }}>
          <label className="input-label">Bar ({unit})</label>
          <CustomSelect
            value={barWeight}
            options={barOpts.map(b => ({ label: `${b} ${unit}`, value: b }))}
            onChange={val => setBarWeight(+val)}
          />
        </div>
      </div>

      {t > 0 && (
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
          {/* Bar visualizer */}
          <div className="card mb-16" style={{ overflow: 'hidden' }}>
            <div className="text-xs text-muted mb-10" style={{ textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 700 }}>
              Plate Visualizer (per side)
            </div>
            <div className="flex items-center" style={{ gap: 3, overflowX: 'auto', padding: '8px 0' }}>
              {/* Bar center */}
              <div style={{ width: 40, height: 10, background: 'var(--color-surface-3)', borderRadius: 2, flexShrink: 0 }} />
              {/* Plates */}
              {result.map(({ plate, count }) =>
                Array.from({ length: count }, (_, i) => (
                  <div key={`${plate}-${i}`} style={{
                    width: 18,
                    height: Math.min(80, 24 + plate * 1.5),
                    background: PLATE_COLORS[plate] ?? '#888',
                    borderRadius: 3,
                    flexShrink: 0,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: '0.5rem', color: 'white', fontWeight: 700, writingMode: 'vertical-rl',
                  }}>
                    {plate}
                  </div>
                ))
              )}
              {result.length === 0 && (
                <div className="text-xs text-muted" style={{ marginLeft: 8 }}>No plates needed</div>
              )}
            </div>
          </div>

          {/* Plate list */}
          {result.length > 0 && (
            <>
              <div className="section-title mb-8">Plates per side</div>
              <div className="flex-col gap-6 mb-16">
                {result.map(({ plate, count }) => (
                  <div key={plate} className="card card-sm flex items-center justify-between">
                    <div className="flex items-center gap-12">
                      <div style={{
                        width: 36, height: 36, borderRadius: '50%',
                        background: PLATE_COLORS[plate] ?? '#888',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        color: 'white', fontSize: '0.7rem', fontWeight: 700,
                      }}>{plate}</div>
                      <span className="font-semibold">{plate} {unit}</span>
                    </div>
                    <span className="badge badge-muted">× {count}</span>
                  </div>
                ))}
              </div>
            </>
          )}

          <div className="card text-center">
            <div className="text-muted text-xs mb-4">Total on bar</div>
            <div style={{ fontFamily: 'var(--font-display)', fontSize: '2.5rem', color: Math.abs(totalLoaded - t) < 0.1 ? 'var(--color-success)' : 'var(--color-accent)' }}>
              {totalLoaded} {unit}
            </div>
            {remainder > 0 && <div className="text-xs text-danger mt-4">⚠️ {remainder}{unit} unloadable with standard plates</div>}
          </div>
        </motion.div>
      )}
    </div>
  );
}

// ─── STANDALONE REST TIMER ───────────────────────────────
function StandaloneTimer() {
  const timer = useRestTimer();
  const presets = [60, 90, 120, 180, 240, 300];
  const circumference = 2 * Math.PI * 54;

  return (
    <div className="text-center">
      <svg width="140" height="140" style={{ transform: 'rotate(-90deg)', display: 'block', margin: '0 auto 20px' }}>
        <circle cx="70" cy="70" r="54" fill="none" stroke="var(--color-surface-2)" strokeWidth="10" />
        <circle
          cx="70" cy="70" r="54" fill="none"
          stroke="var(--color-accent)" strokeWidth="10"
          strokeDasharray={circumference}
          strokeDashoffset={circumference * (1 - timer.progress)}
          strokeLinecap="round"
          style={{ transition: 'stroke-dashoffset 0.9s linear' }}
        />
      </svg>

      <div style={{ fontFamily: 'var(--font-display)', fontSize: '4rem', lineHeight: 1, marginBottom: 24 }}>
        {timer.format}
      </div>

      <div className="flex gap-8 justify-center mb-20">
        {presets.map(s => (
          <button key={s} className="chip" onClick={() => timer.start(s)} style={{ fontSize: '0.75rem' }}>
            {s >= 60 ? `${s / 60}m` : `${s}s`}
          </button>
        ))}
      </div>

      <div className="flex gap-12 justify-center">
        {timer.isRunning ? (
          <button className="btn btn-secondary" onClick={timer.stop}><Pause size={18} /> Stop</button>
        ) : (
          <button className="btn btn-primary" onClick={() => timer.start(timer.timeLeft || 90)}><Play size={18} /> Start</button>
        )}
        <button className="btn btn-ghost" onClick={timer.stop}><RotateCcw size={18} /></button>
      </div>
    </div>
  );
}

// ─── MAIN TOOLS PAGE ──────────────────────────────────────
const TOOLS = [
  { id: 'calc1rm', label: '1RM Calculator', icon: Calculator, desc: '4 formulas + training %' },
  { id: 'plates',  label: 'Plates Calc',    icon: Layers,     desc: 'Load your bar perfectly' },
  { id: 'timer',   label: 'Rest Timer',     icon: TimerIcon,  desc: 'Standalone countdown timer' },
];

export default function Tools() {
  const [active, setActive] = useState('calc1rm');

  return (
    <div className="page-content">
      <div className="topbar">
        <span className="topbar-title">Tools</span>
      </div>

      {/* Tool selector */}
      <div className="flex gap-8 mb-20" style={{ marginTop: 4, overflowX: 'auto' }}>
        {TOOLS.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            className={`chip${active === id ? ' active' : ''}`}
            onClick={() => setActive(id)}
            style={{ flexShrink: 0 }}
          >
            <Icon size={13} style={{ marginRight: 4 }} /> {label}
          </button>
        ))}
      </div>

      <motion.div key={active} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
        {active === 'calc1rm' && <OneRMCalc />}
        {active === 'plates'  && <PlatesCalc />}
        {active === 'timer'   && <StandaloneTimer />}
      </motion.div>
    </div>
  );
}
