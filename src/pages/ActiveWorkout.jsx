import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Plus, CheckCircle2, Circle, ChevronDown, ChevronUp, Trash2, Timer, Trophy, Search, Dumbbell } from 'lucide-react';
import { useWorkoutStore, useExerciseStore, useTemplateStore, useSettingsStore, useUserStore } from '../store';
import { useRestTimer, useWorkoutTimer } from '../hooks';
import { CATEGORIES } from '../data/exercises';
import CustomSelect from '../components/CustomSelect';

// ─── PR TOAST ────────────────────────────────────────────
function PRToast({ exercise, onClose }) {
  useEffect(() => { const t = setTimeout(onClose, 3000); return () => clearTimeout(t); }, [onClose]);
  return (
    <motion.div
      initial={{ y: -60, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      exit={{ y: -60, opacity: 0 }}
      style={{
        position: 'fixed', top: 16, left: '50%', transform: 'translateX(-50%)',
        background: 'linear-gradient(135deg, #1a1200, #2a1f00)',
        border: '1px solid rgba(255,215,0,0.4)',
        borderRadius: 'var(--radius-md)',
        padding: '10px 18px',
        display: 'flex', alignItems: 'center', gap: 10,
        zIndex: 999, boxShadow: 'var(--shadow-pr)',
        maxWidth: 320,
      }}
    >
      <Trophy size={18} color="var(--color-pr)" />
      <div>
        <div style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--color-pr)' }}>NEW PERSONAL RECORD! 🔥</div>
        <div style={{ fontSize: '0.72rem', color: 'var(--color-text-secondary)' }}>{exercise}</div>
      </div>
    </motion.div>
  );
}

// ─── REST TIMER OVERLAY ──────────────────────────────────
function RestTimerOverlay({ timer, onClose }) {
  const progress = timer.progress;
  const circumference = 2 * Math.PI * 54;
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      style={{
        position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.85)',
        backdropFilter: 'blur(8px)', zIndex: 300,
        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
      }}
      onClick={onClose}
    >
      <motion.div
        onClick={e => e.stopPropagation()}
        initial={{ scale: 0.8 }} animate={{ scale: 1 }}
        style={{ textAlign: 'center', padding: 32, background: 'var(--color-surface)', borderRadius: 'var(--radius-xl)', border: '1px solid var(--color-border)', minWidth: 260 }}
      >
        <div className="text-muted text-sm font-semibold mb-16" style={{ textTransform: 'uppercase', letterSpacing: '0.1em' }}>Rest Timer</div>

        <svg width="120" height="120" style={{ transform: 'rotate(-90deg)', display: 'block', margin: '0 auto 16px' }}>
          <circle cx="60" cy="60" r="54" fill="none" stroke="var(--color-surface-2)" strokeWidth="8" />
          <circle
            cx="60" cy="60" r="54" fill="none"
            stroke="var(--color-accent)" strokeWidth="8"
            strokeDasharray={circumference}
            strokeDashoffset={circumference * (1 - progress)}
            strokeLinecap="round"
            style={{ transition: 'stroke-dashoffset 0.9s linear' }}
          />
        </svg>

        <div style={{ fontFamily: 'var(--font-display)', fontSize: '3.5rem', color: 'var(--color-text-primary)', lineHeight: 1, marginBottom: 20 }}>
          {timer.format}
        </div>

        <div className="flex gap-8 justify-center mb-16">
          <button className="btn btn-secondary btn-sm" onClick={() => timer.addTime(15)}>+15s</button>
          <button className="btn btn-secondary btn-sm" onClick={() => timer.addTime(30)}>+30s</button>
          <button className="btn btn-secondary btn-sm" onClick={() => timer.addTime(60)}>+1m</button>
        </div>

        <button className="btn btn-primary btn-full" onClick={onClose}>Skip Rest</button>
      </motion.div>
    </motion.div>
  );
}

// ─── EXERCISE PICKER SHEET ───────────────────────────────
function ExercisePicker({ onSelect, onClose }) {
  const { exercises } = useExerciseStore();
  const [query, setQuery] = useState('');
  const [cat, setCat] = useState('All');

  const filtered = exercises.filter(e =>
    (cat === 'All' || e.category === cat) &&
    e.name.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <div className="modal-overlay animate-fadeIn" onClick={onClose}>
      <motion.div
        className="modal-sheet"
        onClick={e => e.stopPropagation()}
        initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }}
        transition={{ type: 'spring', damping: 30, stiffness: 300 }}
      >
        <div className="modal-handle" />
        <h3 className="mb-12">Add Exercise</h3>

        <div className="search-wrapper mb-12">
          <Search size={16} className="search-icon" />
          <input
            className="input"
            placeholder="Search exercises..."
            value={query}
            onChange={e => setQuery(e.target.value)}
            autoFocus
          />
        </div>

        <div className="chip-scroll mb-12">
          {CATEGORIES.map(c => (
            <button key={c} className={`chip${cat === c ? ' active' : ''}`} onClick={() => setCat(c)}>{c}</button>
          ))}
        </div>

        <div className="flex-col gap-4" style={{ maxHeight: '55vh', overflowY: 'auto' }}>
          {filtered.map(ex => (
            <button
              key={ex.id}
              className="card card-sm w-full"
              style={{ textAlign: 'left', cursor: 'pointer' }}
              onClick={() => { onSelect(ex.id); onClose(); }}
            >
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm font-semibold">{ex.name}</div>
                  <div className="text-xs text-muted">{ex.muscleGroups.join(' · ')}</div>
                </div>
                <span className="badge badge-muted">{ex.equipment}</span>
              </div>
            </button>
          ))}
          {filtered.length === 0 && (
            <div className="text-center text-muted text-sm" style={{ padding: '32px 0' }}>No exercises found</div>
          )}
        </div>
      </motion.div>
    </div>
  );
}

// ─── SET ROW ──────────────────────────────────────────────
function SetRow({ set, index, exerciseId, onUpdate, onRemove, onComplete, isCompleted }) {
  return (
    <motion.div
      layout
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 20, height: 0 }}
      style={{
        display: 'grid',
        gridTemplateColumns: '28px 1fr 1fr 1fr 36px',
        alignItems: 'center',
        gap: 8,
        padding: '10px 0',
        borderBottom: '1px solid var(--color-border)',
        opacity: set.isWarmup ? 0.65 : 1,
      }}
    >
      {/* Set # */}
      <div style={{ textAlign: 'center', fontSize: '0.78rem', color: 'var(--color-text-muted)', fontWeight: 600 }}>
        {set.isWarmup ? 'W' : index + 1}
        {set.isPR && <span style={{ display: 'block', fontSize: '0.6rem', color: 'var(--color-pr)' }}>PR</span>}
      </div>

      {/* Weight */}
      <input
        type="number"
        className="input-number"
        style={{ width: '100%' }}
        value={set.weight || ''}
        onChange={e => onUpdate('weight', e.target.value === '' ? 0 : +e.target.value)}
        onFocus={e => e.target.select()}
        placeholder="0"
        min="0"
        step="2.5"
      />

      {/* Reps */}
      <input
        type="number"
        className="input-number"
        style={{ width: '100%' }}
        value={set.reps || ''}
        onChange={e => onUpdate('reps', e.target.value === '' ? 0 : +e.target.value)}
        onFocus={e => e.target.select()}
        placeholder="0"
        min="0"
      />

      {/* RPE */}
      <CustomSelect
        className="input-number"
        style={{ width: '100%', fontSize: '0.8rem' }}
        value={set.rpe ?? ''}
        placeholder="—"
        options={[
          { label: '—', value: '' },
          ...[6,6.5,7,7.5,8,8.5,9,9.5,10].map(r => ({ label: r.toString(), value: r }))
        ]}
        onChange={val => onUpdate('rpe', val ? +val : null)}
      />

      {/* Complete */}
      <motion.button
        whileTap={{ scale: 0.85 }}
        onClick={() => onComplete(set.id)}
        style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4, color: set.completed ? 'var(--color-success)' : 'var(--color-text-muted)' }}
      >
        {set.completed ? <CheckCircle2 size={22} /> : <Circle size={22} />}
      </motion.button>
    </motion.div>
  );
}

// ─── EXERCISE CARD ───────────────────────────────────────
function ExerciseCard({ sessionEx, onAddSet, onRemoveSet, onUpdateSet, onCompleteSet, onRemoveExercise, restTimer }) {
  const { getExercise } = useExerciseStore();
  const { activeSession } = useWorkoutStore();
  const ex = getExercise(sessionEx.exerciseId);
  const [collapsed, setCollapsed] = useState(false);

  const completedSets  = sessionEx.sets.filter(s => s.completed && !s.isWarmup).length;
  const totalSets = sessionEx.sets.filter(s => !s.isWarmup).length;

  if (!ex) return null;

  return (
    <motion.div className="card mb-12" layout>
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <div className="font-bold">{ex.name}</div>
          <div className="text-xs text-muted">{ex.muscleGroups.slice(0, 2).join(' · ')}</div>
        </div>
        <div className="flex items-center gap-8">
          {totalSets > 0 && (
            <span className="badge badge-success" style={{ fontSize: '0.7rem' }}>{completedSets}/{totalSets}</span>
          )}
          <button className="btn-icon" onClick={() => setCollapsed(!collapsed)}>
            {collapsed ? <ChevronDown size={16} /> : <ChevronUp size={16} />}
          </button>
          <button className="btn-icon" onClick={() => onRemoveExercise(sessionEx.exerciseId)} style={{ color: 'var(--color-danger)' }}>
            <Trash2 size={16} />
          </button>
        </div>
      </div>

      <AnimatePresence>
        {!collapsed && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} style={{ overflow: 'hidden' }}>
            {/* Column headers */}
            <div style={{
              display: 'grid', gridTemplateColumns: '28px 1fr 1fr 1fr 36px',
              gap: 8, paddingBottom: 6, borderBottom: '1px solid var(--color-border)'
            }}>
              {['Set', 'kg', 'Reps', 'RPE', '✓'].map(h => (
                <div key={h} style={{ fontSize: '0.68rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--color-text-muted)', textAlign: 'center', letterSpacing: '0.06em' }}>{h}</div>
              ))}
            </div>

            {/* Sets */}
            <AnimatePresence>
              {sessionEx.sets.map((set, i) => {
                const workingIdx = sessionEx.sets.filter((s, si) => si < i && !s.isWarmup).length;
                return (
                  <SetRow
                    key={set.id}
                    set={set}
                    index={workingIdx}
                    exerciseId={sessionEx.exerciseId}
                    onUpdate={(field, val) => onUpdateSet(sessionEx.exerciseId, set.id, field, val)}
                    onRemove={() => onRemoveSet(sessionEx.exerciseId, set.id)}
                    onComplete={() => onCompleteSet(sessionEx.exerciseId, set.id)}
                  />
                );
              })}
            </AnimatePresence>

            {/* Add Set buttons */}
            <div className="flex gap-8 mt-10">
              <button className="btn btn-ghost btn-sm" style={{ flex: 1 }} onClick={() => onAddSet(sessionEx.exerciseId)}>
                <Plus size={14} /> Add Set
              </button>
              <button
                className="btn btn-ghost btn-sm"
                onClick={() => onAddSet(sessionEx.exerciseId)}
                title="Add set"
                style={{ minWidth: 36 }}
              >
                +
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

// ─── FINISH MODAL ────────────────────────────────────────
function FinishModal({ session, onConfirm, onCancel }) {
  const [saveAsTemplate, setSaveAsTemplate] = useState(false);
  const completedSets = session.exercises.reduce((t, e) => t + e.sets.filter(s => s.completed && !s.isWarmup).length, 0);
  const totalSets = session.exercises.reduce((t, e) => t + e.sets.filter(s => !s.isWarmup).length, 0);
  const prs = session.exercises.reduce((t, e) => t + e.sets.filter(s => s.isPR).length, 0);
  const { unit } = useSettingsStore.getState();

  const handleFinish = () => {
    onConfirm(saveAsTemplate);
  };

  return (
    <div className="modal-overlay animate-fadeIn modal-center">
      <motion.div className="modal-box" initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}>
        <div className="text-center mb-16">
          <div style={{ fontSize: '3rem', marginBottom: 8 }}>💪</div>
          <h2>Workout Complete!</h2>
          <p className="text-sm text-muted">Great work — here's your summary</p>
        </div>

        <div className="stat-grid mb-24">
          <div className="stat-box">
            <div className="stat-value">{completedSets}/{totalSets}</div>
            <div className="stat-label">Sets Done</div>
          </div>
          <div className="stat-box">
            <div className="stat-value">{session.exercises.length}</div>
            <div className="stat-label">Exercises</div>
          </div>
          <div className="stat-box">
            <div className="stat-value text-accent">{prs}</div>
            <div className="stat-label">PRs 🏆</div>
          </div>
        </div>

        <div className="card mb-24" style={{ cursor: 'pointer', border: saveAsTemplate ? '1px solid var(--color-accent)' : '1px solid var(--color-border)' }} onClick={() => setSaveAsTemplate(!saveAsTemplate)}>
          <div className="flex items-center gap-12">
            <div className={`icon-circle ${saveAsTemplate ? 'bg-accent' : 'bg-surface-2'}`} style={{ width: 24, height: 24 }}>
              {saveAsTemplate ? <CheckCircle2 size={16} color="#000" /> : <Circle size={16} />}
            </div>
            <div style={{ flex: 1 }}>
              <div className="text-sm font-semibold">Save as Template</div>
              <div className="text-xs text-muted">Add this routine to your templates</div>
            </div>
          </div>
        </div>

        <div className="flex gap-8">
          <button className="btn btn-secondary" style={{ flex: 1 }} onClick={onCancel}>Back</button>
          <button className="btn btn-primary" style={{ flex: 2 }} onClick={handleFinish}>Save Workout</button>
        </div>
      </motion.div>
    </div>
  );
}

// ─── TEMPLATE PICKER ────────────────────────────────────
function TemplatePicker({ onSelect, onStartBlank, onClose }) {
  const { templates } = useTemplateStore();
  const { profile } = useUserStore();
  const customCount = templates.filter(t => t.isCustom).length;

  return (
    <div className="modal-overlay animate-fadeIn" onClick={onClose}>
      <motion.div className="modal-sheet" onClick={e => e.stopPropagation()}
        initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }}
        transition={{ type: 'spring', damping: 30, stiffness: 300 }}>
        <div className="modal-handle" />
        <h3 className="mb-16">Start Workout</h3>

        <button className="btn btn-primary btn-full mb-12" onClick={onStartBlank}>
          <Plus size={18} /> Empty Workout
        </button>

        <div className="section-header mb-12">
          <span className="section-title">Templates</span>
          {!profile.isPro && (
            <span className="text-xs text-muted">Usage: {customCount}/3</span>
          )}
        </div>
        <div className="flex-col gap-8" style={{ maxHeight: '60vh', overflowY: 'auto' }}>
          {templates.map(t => (
            <button key={t.id} className="card card-sm w-full" style={{ textAlign: 'left', cursor: 'pointer' }} onClick={() => onSelect(t)}>
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm font-semibold">{t.name}</div>
                  <div className="text-xs text-muted">{t.exercises.length} exercises · {t.tag ?? 'Custom'}</div>
                </div>
                <span className="badge badge-accent">{t.tag ?? 'Custom'}</span>
              </div>
            </button>
          ))}
        </div>
      </motion.div>
    </div>
  );
}

// ─── MAIN ACTIVE WORKOUT PAGE ────────────────────────────
export default function ActiveWorkout() {
  const navigate = useNavigate();
  const { activeSession, startWorkout, finishWorkout, cancelWorkout, addExerciseToSession, removeExerciseFromSession, addSet, removeSet, updateSet, toggleSetComplete } = useWorkoutStore();
  const { unit } = useSettingsStore();

  const restTimer = useRestTimer();
  const workoutTimer = useWorkoutTimer(activeSession?.startTime);

  const [showPicker, setShowPicker] = useState(false);
  const [showFinish, setShowFinish] = useState(false);
  const [showTemplatePicker, setShowTemplatePicker] = useState(!activeSession);
  const [showRestTimer, setShowRestTimer] = useState(false);
  const [prToast, setPrToast] = useState(null);
  const { getExercise } = useExerciseStore();

  useEffect(() => {
    if (!activeSession && !showTemplatePicker) navigate('/');
  }, [activeSession]);

  const handleCompleteSet = (exerciseId, setId) => {
    const isPR = toggleSetComplete(exerciseId, setId);
    const { activeSession: s } = useWorkoutStore.getState();
    const ex = s?.exercises.find(e => e.exerciseId === exerciseId);
    const theSet = ex?.sets.find(s => s.id === setId);
    if (theSet?.completed) {
      const exData = getExercise(exerciseId);
      // Start rest timer
      const restSecs = ex.restSeconds ?? 90;
      restTimer.start(restSecs);
      setShowRestTimer(true);
      if (isPR && exData) setPrToast(exData.name);
    }
  };

  const handleFinish = async (saveAsTemplate) => {
    const finished = await finishWorkout();
    if (finished && saveAsTemplate) {
      const { addTemplate } = useTemplateStore.getState();
      await addTemplate({
        name: finished.name,
        category: 'Custom',
        exercises: finished.exercises.map(e => ({
          exerciseId: e.exerciseId,
          defaultSets: e.sets.length,
          defaultReps: e.sets[0]?.reps ?? 10,
          defaultWeight: e.sets[0]?.weight ?? 0,
          restSeconds: e.restSeconds ?? 90,
        })),
      });
    }
    navigate('/history');
  };

  // No active session — show template picker
  if (!activeSession) {
    return (
      <AnimatePresence>
        {showTemplatePicker && (
          <TemplatePicker
            onSelect={(t) => { startWorkout(t); setShowTemplatePicker(false); }}
            onStartBlank={() => { startWorkout(null); setShowTemplatePicker(false); }}
            onClose={() => navigate('/')}
          />
        )}
      </AnimatePresence>
    );
  }

  const volume = activeSession.exercises.reduce((t, e) =>
    t + e.sets.filter(s => s.completed && !s.isWarmup).reduce((tt, s) => tt + s.weight * s.reps, 0), 0
  );

  return (
    <div className="page-content no-topbar" style={{ paddingTop: 0 }}>
      {/* ── Sticky Header ── */}
      <div style={{
        position: 'sticky', top: 0, background: 'rgba(10,10,10,0.95)',
        backdropFilter: 'blur(12px)', zIndex: 50, padding: '12px 0', marginBottom: 12
      }}>
        <div className="flex items-center justify-between mb-8">
          <div>
            <div className="font-bold">{activeSession.name}</div>
            <div className="flex items-center gap-12" style={{ marginTop: 4 }}>
              <span className="text-xs text-muted flex items-center gap-4">
                <Timer size={12} /> {workoutTimer.format}
              </span>
              <span className="text-xs text-accent font-semibold">{volume.toLocaleString()} {unit}</span>
            </div>
          </div>
          <div className="flex items-center gap-8">
            <button
              className="btn-icon"
              onClick={() => setShowRestTimer(true)}
              style={{ color: restTimer.isRunning ? 'var(--color-accent)' : 'var(--color-text-muted)' }}
              title="Rest Timer"
            >
              <Timer size={18} />
            </button>
            <button className="btn btn-primary btn-sm" onClick={() => setShowFinish(true)}>Finish</button>
            <button className="btn-icon" onClick={cancelWorkout} title="Cancel workout">
              <X size={18} />
            </button>
          </div>
        </div>
      </div>

      {/* ── Exercises ── */}
      <AnimatePresence>
        {activeSession.exercises.map(ex => (
          <ExerciseCard
            key={ex.exerciseId}
            sessionEx={ex}
            onAddSet={addSet}
            onRemoveSet={removeSet}
            onUpdateSet={updateSet}
            onCompleteSet={(exId, setId) => handleCompleteSet(exId, setId)}
            onRemoveExercise={removeExerciseFromSession}
            restTimer={restTimer}
          />
        ))}
      </AnimatePresence>

      {/* ── Add Exercise Button ── */}
      <motion.button
        className="btn btn-secondary btn-full mb-16"
        onClick={() => setShowPicker(true)}
        whileTap={{ scale: 0.98 }}
      >
        <Plus size={18} /> Add Exercise
      </motion.button>

      {activeSession.exercises.length === 0 && (
        <div className="empty-state">
          <Dumbbell size={40} color="var(--color-text-muted)" style={{ opacity: 0.4 }} />
          <p>Tap "Add Exercise" to get started</p>
        </div>
      )}

      {/* ── Modals ── */}
      <AnimatePresence>
        {showPicker && <ExercisePicker onSelect={addExerciseToSession} onClose={() => setShowPicker(false)} />}
      </AnimatePresence>

      <AnimatePresence>
        {showFinish && (
          <FinishModal
            session={activeSession}
            onConfirm={handleFinish}
            onCancel={() => setShowFinish(false)}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showRestTimer && restTimer.isRunning && (
          <RestTimerOverlay timer={restTimer} onClose={() => setShowRestTimer(false)} />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {prToast && <PRToast exercise={prToast} onClose={() => setPrToast(null)} />}
      </AnimatePresence>
    </div>
  );
}
