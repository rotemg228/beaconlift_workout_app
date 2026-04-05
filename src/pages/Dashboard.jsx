import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Flame, Dumbbell, Clock, TrendingUp, ChevronRight, Plus, Zap, Trophy, Wrench } from 'lucide-react';
import { useWorkoutStore, useTemplateStore, useExerciseStore, useSettingsStore } from '../store';
import { format, parseISO, isToday, isYesterday, differenceInDays } from 'date-fns';

function StreakCount(sessions) {
  if (!sessions.length) return 0;
  const dates = [...new Set(sessions.map(s => s.date))].sort((a, b) => b.localeCompare(a));
  let streak = 0;
  let current = new Date();
  current.setHours(0, 0, 0, 0);
  for (const d of dates) {
    const day = new Date(d + 'T00:00:00');
    const diff = differenceInDays(current, day);
    if (diff <= 1) { streak++; current = day; }
    else break;
  }
  return streak;
}

function getRelativeDate(dateStr) {
  try {
    const d = parseISO(dateStr);
    if (isToday(d)) return 'Today';
    if (isYesterday(d)) return 'Yesterday';
    return format(d, 'MMM d');
  } catch { return dateStr; }
}

function getDuration(session) {
  if (!session.endTime) return '—';
  const mins = Math.round((new Date(session.endTime) - new Date(session.startTime)) / 60000);
  return mins < 60 ? `${mins}m` : `${Math.floor(mins / 60)}h ${mins % 60}m`;
}

export default function Dashboard() {
  const { sessions, activeSession, startWorkout } = useWorkoutStore();
  const { templates } = useTemplateStore();
  const { exercises } = useExerciseStore();
  const { unit, name } = useSettingsStore();
  const navigate = useNavigate();

  const streak = StreakCount(sessions);
  const totalSessions = sessions.length;
  const totalVolume = sessions.reduce((t, s) => t + (s.totalVolume || 0), 0);
  const recent = sessions.slice(0, 3);
  const quickTemplates = templates.slice(0, 4);

  const handleStartBlank = () => {
    startWorkout(null);
    navigate('/workout');
  };

  const handleStartTemplate = (template) => {
    startWorkout(template);
    navigate('/workout');
  };

  return (
    <div className="page-content">
      {/* ── Header ── */}
      <div className="flex items-center justify-between mb-16" style={{ marginTop: 8 }}>
        <div>
          <div className="topbar-logo" style={{ fontSize: '2rem', lineHeight: 1 }}>FORGE</div>
          <p className="text-xs text-muted" style={{ marginTop: 2 }}>
            {name ? `Welcome back, ${name}` : 'Train harder. Track smarter.'}
          </p>
        </div>
        <Link to="/tools" className="btn-icon" title="Tools">
          <Wrench size={18} />
        </Link>
      </div>

      {/* ── Active Workout Banner ── */}
      {activeSession && (
        <motion.div
          className="card card-accent mb-16"
          initial={{ scale: 0.97, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          style={{ animation: 'pulse-glow 2s infinite' }}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-8">
              <Dumbbell size={20} className="text-accent" color="var(--color-accent)" />
              <div>
                <div className="font-semibold text-sm">Workout in Progress</div>
                <div className="text-xs text-muted">{activeSession.name}</div>
              </div>
            </div>
            <Link to="/workout" className="btn btn-primary btn-sm">Resume</Link>
          </div>
        </motion.div>
      )}

      {/* ── Stats Row ── */}
      <div className="stat-grid mb-16">
        <motion.div className="stat-box" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}>
          <div className="flex items-center justify-center gap-4 mb-4">
            <Flame size={14} color="var(--color-accent)" />
          </div>
          <div className="stat-value text-accent">{streak}</div>
          <div className="stat-label">Day Streak</div>
        </motion.div>
        <motion.div className="stat-box" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <div className="flex items-center justify-center gap-4 mb-4">
            <Dumbbell size={14} color="var(--color-text-muted)" />
          </div>
          <div className="stat-value">{totalSessions}</div>
          <div className="stat-label">Workouts</div>
        </motion.div>
        <motion.div className="stat-box" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
          <div className="flex items-center justify-center gap-4 mb-4">
            <TrendingUp size={14} color="var(--color-text-muted)" />
          </div>
          <div className="stat-value" style={{ fontSize: '1rem' }}>
            {totalVolume >= 1000 ? `${(totalVolume / 1000).toFixed(1)}k` : totalVolume}
          </div>
          <div className="stat-label">Volume ({unit})</div>
        </motion.div>
      </div>

      {/* ── Quick Start ── */}
      <div className="section-header">
        <span className="section-title">Quick Start</span>
      </div>

      <div className="flex gap-8 mb-16">
        <motion.button
          className="btn btn-primary"
          style={{ flex: 1 }}
          onClick={handleStartBlank}
          whileTap={{ scale: 0.97 }}
        >
          <Plus size={18} /> Empty Workout
        </motion.button>
        <Link to="/exercises" className="btn btn-secondary btn-icon" style={{ padding: '12px 16px' }}>
          <Dumbbell size={18} />
        </Link>
      </div>

      {/* ── Templates ── */}
      <div className="section-header mb-8">
        <span className="section-title">Templates</span>
        <Link to="/workout" className="text-xs text-accent font-semibold" style={{ textDecoration: 'none' }}>See all</Link>
      </div>

      <div className="flex-col gap-8 mb-16">
        {quickTemplates.map((t, i) => (
          <motion.button
            key={t.id}
            className="card card-sm w-full"
            style={{ textAlign: 'left', cursor: 'pointer', background: 'var(--color-surface)', border: '1px solid var(--color-border)' }}
            onClick={() => handleStartTemplate(t)}
            initial={{ opacity: 0, x: -12 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.06 }}
            whileTap={{ scale: 0.98 }}
          >
            <div className="flex items-center justify-between">
              <div>
                <div className="font-semibold text-sm">{t.name}</div>
                <div className="text-xs text-muted" style={{ marginTop: 2 }}>
                  {t.exercises.length} exercises · {t.tag}
                </div>
              </div>
              <div className="flex items-center gap-8">
                <span className="badge badge-accent">{t.tag}</span>
                <ChevronRight size={16} color="var(--color-text-muted)" />
              </div>
            </div>
          </motion.button>
        ))}
      </div>

      {/* ── Recent Workouts ── */}
      {recent.length > 0 && (
        <>
          <div className="section-header mb-8">
            <span className="section-title">Recent Sessions</span>
            <Link to="/history" className="text-xs text-accent font-semibold" style={{ textDecoration: 'none' }}>See all</Link>
          </div>
          <div className="flex-col gap-8 mb-16">
            {recent.map((s, i) => (
              <motion.div
                key={s.id}
                className="card card-sm"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.06 }}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-semibold text-sm">{s.name}</div>
                    <div className="text-xs text-muted" style={{ marginTop: 2 }}>
                      {getRelativeDate(s.date)} · {getDuration(s)} · {s.exercises.length} exercises
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-bold text-accent">{s.totalVolume?.toLocaleString()}</div>
                    <div className="text-xs text-muted">{unit} vol</div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </>
      )}

      {/* ── Empty State ── */}
      {sessions.length === 0 && (
        <motion.div
          className="empty-state"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          <Zap size={48} className="empty-state-icon" color="var(--color-text-muted)" />
          <h3>No workouts yet</h3>
          <p>Start your first session to build your history</p>
          <button className="btn btn-primary mt-12" onClick={handleStartBlank}>
            <Plus size={18} /> Start Workout
          </button>
        </motion.div>
      )}
    </div>
  );
}
