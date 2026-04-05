import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Trash2, ChevronDown, ChevronUp, Trophy, Clock, Flame, Dumbbell } from 'lucide-react';
import { useWorkoutStore, useExerciseStore, useSettingsStore } from '../store';
import { format, parseISO } from 'date-fns';

function getDuration(session) {
  if (!session.endTime) return '—';
  const mins = Math.round((new Date(session.endTime) - new Date(session.startTime)) / 60000);
  return mins < 60 ? `${mins}m` : `${Math.floor(mins / 60)}h ${mins % 60}m`;
}

function SessionCard({ session, onDelete }) {
  const [expanded, setExpanded] = useState(false);
  const { getExercise } = useExerciseStore();
  const { unit } = useSettingsStore();

  const completedSets = session.exercises.reduce((t, e) => t + e.sets.filter(s => s.completed && !s.isWarmup).length, 0);
  const prs = session.exercises.reduce((t, e) => t + e.sets.filter(s => s.isPR).length, 0);
  const dateStr = (() => {
    try { return format(parseISO(session.date), 'EEE, MMM d yyyy'); }
    catch { return session.date; }
  })();

  return (
    <motion.div className="card mb-10" layout>
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div style={{ flex: 1 }}>
          <div className="font-bold">{session.name}</div>
          <div className="text-xs text-muted" style={{ marginTop: 2 }}>{dateStr}</div>
        </div>
        <div className="flex items-center gap-8">
          {prs > 0 && (
            <span className="badge badge-pr"><Trophy size={10} /> {prs} PR</span>
          )}
          <button className="btn-icon" onClick={() => setExpanded(!expanded)}>
            {expanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          </button>
          <button className="btn-icon" onClick={() => onDelete(session.id)} style={{ color: 'var(--color-danger)' }}>
            <Trash2 size={15} />
          </button>
        </div>
      </div>

      {/* Stats Row */}
      <div className="flex gap-12" style={{ marginBottom: expanded ? 12 : 0 }}>
        <div className="flex items-center gap-4 text-xs text-muted">
          <Clock size={12} /> {getDuration(session)}
        </div>
        <div className="flex items-center gap-4 text-xs text-muted">
          <Dumbbell size={12} /> {session.exercises.length} exercises
        </div>
        <div className="flex items-center gap-4 text-xs text-accent font-semibold">
          <Flame size={12} color="var(--color-accent)" /> {session.totalVolume?.toLocaleString()} {unit}
        </div>
      </div>

      {/* Expanded exercise list */}
      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            style={{ overflow: 'hidden' }}
          >
            <div className="divider" style={{ margin: '10px 0' }} />
            {session.exercises.map(ex => {
              const exData = getExercise(ex.exerciseId);
              const completedW = ex.sets.filter(s => s.completed && !s.isWarmup);
              const maxWeight = completedW.length ? Math.max(...completedW.map(s => s.weight)) : 0;
              const hasPR = ex.sets.some(s => s.isPR);
              return (
                <div key={ex.exerciseId} className="flex items-center justify-between" style={{ padding: '8px 0', borderBottom: '1px solid var(--color-border)' }}>
                  <div className="flex items-center gap-8">
                    {hasPR && <Trophy size={12} color="var(--color-pr)" />}
                    <div>
                      <div className="text-sm font-semibold">{exData?.name ?? 'Unknown'}</div>
                      <div className="text-xs text-muted">
                        {completedW.length} sets · best {maxWeight}{unit}
                      </div>
                    </div>
                  </div>
                  <div className="text-xs text-muted">
                    {completedW.reduce((t, s) => t + s.weight * s.reps, 0).toLocaleString()} {unit}
                  </div>
                </div>
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

export default function HistoryPage() {
  const { sessions, deleteSession } = useWorkoutStore();
  const [search, setSearch] = useState('');

  const filtered = sessions.filter(s => s.name.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="page-content">
      {/* Topbar */}
      <div className="topbar">
        <span className="topbar-title">History</span>
      </div>

      {sessions.length > 0 && (
        <div className="search-wrapper mb-16" style={{ marginTop: 4 }}>
          <input className="input" placeholder="Search workouts..." value={search} onChange={e => setSearch(e.target.value)} />
        </div>
      )}

      {filtered.length === 0 && sessions.length === 0 && (
        <div className="empty-state">
          <Clock size={48} color="var(--color-text-muted)" style={{ opacity: 0.4 }} />
          <h3>No workouts yet</h3>
          <p>Complete your first session to see it here</p>
        </div>
      )}

      {filtered.length === 0 && sessions.length > 0 && (
        <div className="empty-state">
          <p>No workouts match "{search}"</p>
        </div>
      )}

      <AnimatePresence>
        {filtered.map((s, i) => (
          <motion.div key={s.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }} exit={{ opacity: 0 }}>
            <SessionCard session={s} onDelete={deleteSession} />
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
