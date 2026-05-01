import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Flame, Dumbbell, TrendingUp, ChevronRight, Plus, Zap, Wrench, Crown, Lock, Sparkles } from 'lucide-react';
import { useWorkoutStore, useTemplateStore, useSettingsStore, useUserStore } from '../store';
import { format, parseISO, isToday, isYesterday, differenceInDays } from 'date-fns';
import { EXERCISES } from '../data/exercises';

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

function getSessionVolume(session) {
  if (session?.totalVolume) return session.totalVolume;
  return (session?.exercises || []).reduce(
    (sessionTotal, exercise) =>
      sessionTotal +
      (exercise.sets || []).reduce((setTotal, setItem) => {
        if (!setItem.completed || setItem.isWarmup) return setTotal;
        return setTotal + (setItem.weight || 0) * (setItem.reps || 0);
      }, 0),
    0,
  );
}

export default function Dashboard() {
  const { sessions, activeSession, startWorkout } = useWorkoutStore();
  const { templates } = useTemplateStore();
  const { unit, name } = useSettingsStore();
  const { profile, setProModalOpen } = useUserStore();
  const navigate = useNavigate();

  const streak = StreakCount(sessions);
  const totalSessions = sessions.length;
  const totalVolume = sessions.reduce((t, s) => t + (s.totalVolume || 0), 0);
  const recent = sessions.slice(0, 3);
  const quickTemplates = templates.slice(0, 4);
  const exerciseMap = EXERCISES.reduce((acc, ex) => {
    acc[ex.id] = ex;
    return acc;
  }, {});

  const now = new Date();
  const weekly = sessions.reduce(
    (acc, session) => {
      const sessionDate = new Date(`${session.date}T00:00:00`);
      const diff = differenceInDays(now, sessionDate);
      const volume = getSessionVolume(session);
      if (diff <= 6) {
        acc.current += volume;
      } else if (diff <= 13) {
        acc.previous += volume;
      }
      return acc;
    },
    { current: 0, previous: 0 },
  );
  const weeklyChange = weekly.previous > 0 ? Math.round(((weekly.current - weekly.previous) / weekly.previous) * 100) : 0;

  const muscleBuckets = sessions.slice(0, 10).reduce(
    (acc, session) => {
      session.exercises.forEach((exercise) => {
        const meta = exerciseMap[exercise.exerciseId];
        const groups = meta?.muscleGroups?.length ? meta.muscleGroups : ['Other'];
        const exerciseVolume = (exercise.sets || []).reduce((sum, setItem) => {
          if (!setItem.completed || setItem.isWarmup) return sum;
          return sum + (setItem.weight || 0) * (setItem.reps || 0);
        }, 0);
        groups.forEach((group) => {
          acc[group] = (acc[group] || 0) + exerciseVolume;
        });
      });
      return acc;
    },
    {},
  );

  const muscleValues = Object.values(muscleBuckets).filter((v) => v > 0);
  const muscleBalanceScore = muscleValues.length < 2
    ? 100
    : Math.max(40, Math.round((Math.min(...muscleValues) / Math.max(...muscleValues)) * 100));
  const topMuscle = Object.entries(muscleBuckets).sort((a, b) => b[1] - a[1])[0]?.[0] || 'Full body';

  const recentWindow = sessions.slice(0, 6);
  const recentAvg = recentWindow.slice(0, 3).reduce((sum, s) => sum + getSessionVolume(s), 0) / Math.max(1, recentWindow.slice(0, 3).length);
  const baselineAvg = recentWindow.slice(3, 6).reduce((sum, s) => sum + getSessionVolume(s), 0) / Math.max(1, recentWindow.slice(3, 6).length);
  let progressionNudge = 'Log one workout today to keep momentum building.';
  if (recentWindow.length >= 3) {
    if (baselineAvg > 0 && recentAvg > baselineAvg * 1.08) progressionNudge = 'Performance is trending up. Add 1-2 reps on your top lift today.';
    else if (baselineAvg > 0 && recentAvg < baselineAvg * 0.92) progressionNudge = 'Volume dipped this week. Consider a lighter day with strict form to bounce back.';
    else progressionNudge = 'You are stable week-to-week. Nudge one compound lift by +2.5% load.';
  }

  // Quick-start: find the template used in the most recent session
  const lastUsedTemplate = (() => {
    for (const s of sessions) {
      if (s.templateId) {
        const t = templates.find(tmpl => tmpl.id === s.templateId);
        if (t) return t;
      }
    }
    return null;
  })();

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
          <div className="topbar-logo" style={{ fontSize: '2rem', lineHeight: 1 }}>BeaconLift</div>
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

      <div className="section-header">
        <span className="section-title">Plus Insights</span>
        {profile.isPro ? <span className="badge badge-accent">Active</span> : <span className="badge badge-muted">Preview</span>}
      </div>

      {profile.isPro ? (
        <motion.div className="card mb-16 plus-insights-card" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
          <div className="plus-insights-grid mb-12">
            <div className="plus-insights-item">
              <div className="text-xs text-muted mb-4">7-day volume</div>
              <div className="text-sm font-bold">{Math.round(weekly.current).toLocaleString()} {unit}</div>
              <div className={`text-xs mt-4 ${weeklyChange >= 0 ? 'text-success' : 'text-danger'}`}>
                {weeklyChange >= 0 ? '+' : ''}{weeklyChange}% vs last week
              </div>
            </div>
            <div className="plus-insights-item">
              <div className="text-xs text-muted mb-4">Muscle balance score</div>
              <div className="text-sm font-bold">{muscleBalanceScore}/100</div>
              <div className="text-xs text-muted mt-4">Top focus: {topMuscle}</div>
            </div>
          </div>
          <div className="plus-nudge-row">
            <Sparkles size={14} color="var(--color-accent)" />
            <span className="text-xs">{progressionNudge}</span>
          </div>
        </motion.div>
      ) : (
        <motion.div className="card mb-16 plus-preview-card" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-8">
              <Crown size={16} color="var(--color-accent)" />
              <div className="font-semibold text-sm">Unlock BeaconLift Plus Insights</div>
            </div>
            <Lock size={14} color="var(--color-text-muted)" />
          </div>
          <div className="text-xs text-muted mb-12">
            Weekly trend, muscle balance score, and progression nudges are ready when you upgrade.
          </div>
          <button className="btn btn-primary btn-full btn-sm" onClick={() => setProModalOpen(true)}>
            Upgrade to Plus
          </button>
        </motion.div>
      )}

      {/* ── Quick Start ── */}
      <div className="section-header">
        <span className="section-title">Quick Start</span>
      </div>

      {/* Last routine shortcut — only shown when there's a previously used template */}
      {lastUsedTemplate && !activeSession && (
        <motion.button
          className="card card-sm w-full mb-8"
          style={{
            textAlign: 'left', cursor: 'pointer',
            background: 'linear-gradient(135deg, rgba(255,122,0,0.12), rgba(255,122,0,0.04))',
            border: '1px solid rgba(255,122,0,0.25)',
          }}
          onClick={() => handleStartTemplate(lastUsedTemplate)}
          initial={{ opacity: 0, y: -6 }}
          animate={{ opacity: 1, y: 0 }}
          whileTap={{ scale: 0.98 }}
        >
          <div className="flex items-center gap-10">
            <Zap size={18} color="var(--color-accent)" />
            <div style={{ flex: 1 }}>
              <div className="text-xs text-muted" style={{ marginBottom: 1 }}>Resume last routine</div>
              <div className="font-bold text-sm">{lastUsedTemplate.name}</div>
            </div>
            <span className="badge badge-accent">Go</span>
          </div>
        </motion.button>
      )}

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
        <div className="flex gap-12 items-center">
          {!profile.isPro && (
            <span className="text-xs text-muted">
              {templates.filter(t => t.isCustom).length}/3
            </span>
          )}
          <Link to="/workout" className="text-xs text-accent font-semibold" style={{ textDecoration: 'none' }}>See all</Link>
        </div>
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
