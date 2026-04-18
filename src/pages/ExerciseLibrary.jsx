import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Plus, X, Check, Dumbbell } from 'lucide-react';
import { useExerciseStore } from '../store';
import { CATEGORIES, EQUIPMENT } from '../data/exercises';
import CustomSelect from '../components/CustomSelect';

const MUSCLE_COLORS = {
  Push: '#FF6B00', Pull: '#3B82F6', Legs: '#22C55E',
  Core: '#A855F7', Olympic: '#FFD700', Cardio: '#EF4444',
};

function ExerciseDetailSheet({ ex, onClose }) {
  return (
    <div className="modal-overlay animate-fadeIn" onClick={onClose}>
      <motion.div
        className="modal-sheet"
        onClick={e => e.stopPropagation()}
        initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }}
        transition={{ type: 'spring', damping: 30, stiffness: 300 }}
      >
        <div className="modal-handle" />
        <div className="flex items-center justify-between mb-4">
          <h3 style={{ flex: 1 }}>{ex.name}</h3>
          <button className="btn-icon" onClick={onClose}><X size={18} /></button>
        </div>

        <div className="flex gap-8 mb-16">
          <span className="badge badge-accent">{ex.category}</span>
          <span className="badge badge-muted">{ex.equipment}</span>
          {ex.isCustom && <span className="badge badge-success">Custom</span>}
        </div>

        <div className="section-title mb-8">Muscle Groups</div>
        <div className="flex gap-8 mb-16" style={{ flexWrap: 'wrap' }}>
          {ex.muscleGroups.map(m => (
            <span key={m} className="chip active" style={{ fontSize: '0.78rem' }}>{m}</span>
          ))}
        </div>
      </motion.div>
    </div>
  );
}

function AddExerciseSheet({ onClose }) {
  const { addExercise } = useExerciseStore();
  const [form, setForm] = useState({
    name: '', category: 'Push', equipment: 'Barbell', muscleGroups: [],
  });
  const [saved, setSaved] = useState(false);

  const toggleMuscle = (m) => {
    setForm(f => ({
      ...f,
      muscleGroups: f.muscleGroups.includes(m)
        ? f.muscleGroups.filter(x => x !== m)
        : [...f.muscleGroups, m],
    }));
  };

  const handleSave = () => {
    if (!form.name.trim()) return;
    addExercise(form);
    setSaved(true);
    setTimeout(onClose, 800);
  };

  const muscles = ['Chest','Back','Shoulders','Biceps','Triceps','Quads','Hamstrings','Glutes','Calves','Core','Abs','Obliques','Traps','Forearms'];

  return (
    <div className="modal-overlay animate-fadeIn" onClick={onClose}>
      <motion.div
        className="modal-sheet"
        onClick={e => e.stopPropagation()}
        initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }}
        transition={{ type: 'spring', damping: 30, stiffness: 300 }}
      >
        <div className="modal-handle" />
        <div className="flex items-center justify-between mb-16">
          <h3>New Exercise</h3>
          <button className="btn-icon" onClick={onClose}><X size={18} /></button>
        </div>

        <div className="input-group mb-12">
          <label className="input-label">Exercise Name</label>
          <input className="input" placeholder="e.g. Paused Squat" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} />
        </div>

        <div className="flex gap-12 mb-12">
          <div className="input-group" style={{ flex: 1 }}>
            <label className="input-label">Category</label>
            <CustomSelect
              value={form.category}
              options={CATEGORIES.filter(c => c !== 'All').map(c => ({ label: c, value: c }))}
              onChange={val => setForm(f => ({ ...f, category: val }))}
            />
          </div>
          <div className="input-group" style={{ flex: 1 }}>
            <label className="input-label">Equipment</label>
            <CustomSelect
              value={form.equipment}
              options={EQUIPMENT.filter(e => e !== 'All').map(e => ({ label: e, value: e }))}
              onChange={val => setForm(f => ({ ...f, equipment: val }))}
            />
          </div>
        </div>

        <div className="input-group mb-16">
          <label className="input-label">Muscle Groups</label>
          <div className="chip-scroll" style={{ flexWrap: 'wrap', gap: 6, overflowX: 'unset' }}>
            {muscles.map(m => (
              <button key={m} className={`chip${form.muscleGroups.includes(m) ? ' active' : ''}`} onClick={() => toggleMuscle(m)}>{m}</button>
            ))}
          </div>
        </div>

        <button className="btn btn-primary btn-full" onClick={handleSave} disabled={!form.name.trim()}>
          {saved ? <><Check size={16} /> Saved!</> : 'Create Exercise'}
        </button>
      </motion.div>
    </div>
  );
}

export default function ExerciseLibrary() {
  const { exercises } = useExerciseStore();
  const [query, setQuery] = useState('');
  const [catFilter, setCatFilter] = useState('All');
  const [equipFilter, setEquipFilter] = useState('All');
  const [selected, setSelected] = useState(null);
  const [showAdd, setShowAdd] = useState(false);

  const filtered = exercises.filter(e =>
    (catFilter === 'All' || e.category === catFilter) &&
    (equipFilter === 'All' || e.equipment === equipFilter) &&
    e.name.toLowerCase().includes(query.toLowerCase())
  );

  // Group by category
  const grouped = filtered.reduce((acc, ex) => {
    if (!acc[ex.category]) acc[ex.category] = [];
    acc[ex.category].push(ex);
    return acc;
  }, {});

  return (
    <div className="page-content">
      <div className="topbar">
        <span className="topbar-title">Exercises</span>
        <button className="topbar-action" onClick={() => setShowAdd(true)}><Plus size={20} /></button>
      </div>

      {/* Search */}
      <div className="search-wrapper mb-12" style={{ marginTop: 4 }}>
        <Search size={16} className="search-icon" />
        <input className="input" placeholder="Search exercises..." value={query} onChange={e => setQuery(e.target.value)} />
      </div>

      {/* Category filter */}
      <div className="chip-scroll mb-8">
        {CATEGORIES.map(c => (
          <button key={c} className={`chip${catFilter === c ? ' active' : ''}`} onClick={() => setCatFilter(c)}>{c}</button>
        ))}
      </div>

      {/* Equipment filter */}
      <div className="chip-scroll mb-16">
        {EQUIPMENT.map(e => (
          <button key={e} className={`chip${equipFilter === e ? ' active' : ''}`} style={{ fontSize: '0.72rem' }} onClick={() => setEquipFilter(e)}>{e}</button>
        ))}
      </div>

      {/* Exercise count */}
      <div className="text-xs text-muted mb-12">{filtered.length} exercises</div>

      {/* Grouped list */}
      {Object.entries(grouped).map(([cat, exs]) => (
        <div key={cat} className="mb-16">
          <div className="section-title mb-8" style={{ color: MUSCLE_COLORS[cat] ?? 'var(--color-text-muted)' }}>
            {cat} ({exs.length})
          </div>
          <div className="flex-col gap-6">
            {exs.map((ex, i) => (
              <motion.div
                key={ex.id}
                className="card card-sm"
                initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }}
                style={{ cursor: 'pointer' }}
                onClick={() => setSelected(ex)}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-sm font-semibold flex items-center gap-8">
                      {ex.name}
                      {ex.isCustom && <span className="badge badge-success" style={{ fontSize: '0.6rem' }}>Custom</span>}
                    </div>
                    <div className="text-xs text-muted">{ex.muscleGroups.slice(0, 3).join(' · ')}</div>
                  </div>
                  <span className="badge badge-muted">{ex.equipment}</span>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      ))}

      {filtered.length === 0 && (
        <div className="empty-state">
          <Dumbbell size={40} color="var(--color-text-muted)" style={{ opacity: 0.4 }} />
          <p>No exercises match your search</p>
        </div>
      )}

      <AnimatePresence>
        {selected && <ExerciseDetailSheet ex={selected} onClose={() => setSelected(null)} />}
      </AnimatePresence>
      <AnimatePresence>
        {showAdd && <AddExerciseSheet onClose={() => setShowAdd(false)} />}
      </AnimatePresence>
    </div>
  );
}
