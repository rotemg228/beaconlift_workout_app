import { useState } from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, Trophy, Crown, Lock, Sparkles } from 'lucide-react';
import {
  XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Area, AreaChart
} from 'recharts';
import { useWorkoutStore, useExerciseStore, useSettingsStore, useUserStore } from '../store';
import { format, parseISO } from 'date-fns';
import CustomSelect from '../components/CustomSelect';
import { computeWeeklyTrainingScore } from '../utils/trainingInsights';

const CustomTooltip = ({ active, payload, label, unit }) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{
      background: 'var(--color-surface-2)', border: '1px solid var(--color-border)',
      borderRadius: 'var(--radius-md)', padding: '8px 12px', fontSize: '0.8rem',
    }}>
      <div style={{ color: 'var(--color-text-muted)', marginBottom: 4 }}>{label}</div>
      {payload.map(p => (
        <div key={p.dataKey} style={{ color: p.color, fontWeight: 600 }}>
          {p.name}: {p.value} {unit}
        </div>
      ))}
    </div>
  );
};

function PRBoard({ prs, getExercise, unit }) {
  if (!prs.length) return (
    <div className="empty-state" style={{ padding: '24px 0' }}>
      <p className="text-sm">Complete workouts to set PRs</p>
    </div>
  );
  return (
    <div className="flex-col gap-8">
      {prs.slice(0, 10).map((pr, i) => {
        const ex = getExercise(pr.exerciseId);
        return (
          <motion.div
            key={pr.exerciseId}
            className="card card-sm"
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.05 }}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-10">
                <div style={{
                  width: 28, height: 28, borderRadius: '50%',
                  background: i === 0 ? 'var(--color-pr-glow)' : 'var(--color-surface-2)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '0.75rem', fontWeight: 700,
                  color: i === 0 ? 'var(--color-pr)' : 'var(--color-text-muted)',
                  border: `1px solid ${i === 0 ? 'rgba(255,215,0,0.3)' : 'var(--color-border)'}`,
                }}>
                  {i + 1}
                </div>
                <div>
                  <div className="text-sm font-semibold">{ex?.name ?? 'Unknown'}</div>
                  <div className="text-xs text-muted">{format(parseISO(pr.date), 'MMM d, yyyy')}</div>
                </div>
              </div>
              <div className="text-right">
                <div className="font-bold text-accent">{pr.weight}{unit} × {pr.reps}</div>
                <div className="text-xs text-muted">{pr.e1rm.toFixed(1)} e1RM</div>
              </div>
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}

export default function Progress() {
  const { sessions, getBestSets, getAllPRs } = useWorkoutStore();
  const { exercises, getExercise } = useExerciseStore();
  const { unit } = useSettingsStore();
  const { profile, setProModalOpen } = useUserStore();

  const [tab, setTab] = useState('strength'); // 'strength' | 'prs'
  const [selectedEx, setSelectedEx] = useState(exercises[0]?.id ?? null);
  const [chartType, setChartType] = useState('weight'); // 'weight' | 'volume' | 'e1rm'

  const prs = getAllPRs();
  const chartData = selectedEx ? getBestSets(selectedEx).map(d => ({
    ...d,
    date: (() => { try { return format(parseISO(d.date), 'MMM d'); } catch { return d.date; } })(),
  })) : [];

  const exercisesWithData = exercises.filter(ex =>
    sessions.some(s => s.exercises.some(e => e.exerciseId === ex.id))
  );

  const chartConfig = {
    weight: { key: 'bestWeight', name: 'Best Weight', color: 'var(--color-accent)' },
    volume: { key: 'totalVolume', name: 'Volume', color: '#3B82F6' },
    e1rm:   { key: 'best1RM',    name: 'e1RM',   color: 'var(--color-success)' },
  };
  const cfg = chartConfig[chartType];

  const trainingScore = computeWeeklyTrainingScore(sessions, getAllPRs);

  return (
    <div className="page-content">
      <div className="topbar">
        <span className="topbar-title">Progress</span>
      </div>

      <div className="section-header" style={{ marginTop: 4 }}>
        <span className="section-title">Training score</span>
        {profile.isPro ? <span className="badge badge-accent">Plus</span> : <span className="badge badge-muted">Preview</span>}
      </div>

      {profile.isPro ? (
        <motion.div className="card mb-16 plus-insights-card" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
          <div className="flex items-center justify-between mb-10">
            <div className="flex items-center gap-8">
              <Sparkles size={16} color="var(--color-accent)" />
              <span className="font-semibold text-sm">{trainingScore.label}</span>
            </div>
            <span className="text-2xl font-bold display-font text-accent">{trainingScore.score}</span>
          </div>
          <div className="progress-bar-track mb-8">
            <div className="progress-bar-fill" style={{ width: `${trainingScore.score}%` }} />
          </div>
          <div className="flex justify-between text-xs text-muted">
            <span>{trainingScore.daysTrainedThisWeek} days this week</span>
            <span>
              {Math.round(trainingScore.volumeThisWeek).toLocaleString()} {unit} · 7d
            </span>
          </div>
        </motion.div>
      ) : (
        <motion.div className="card mb-16 plus-preview-card" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-8">
              <Crown size={16} color="var(--color-accent)" />
              <span className="font-semibold text-sm">Weekly training score</span>
            </div>
            <Lock size={14} color="var(--color-text-muted)" />
          </div>
          <p className="text-xs text-muted mb-12">
            One number that blends consistency, volume trend, and PR momentum—Plus only.
          </p>
          <button type="button" className="btn btn-primary btn-full btn-sm" onClick={() => setProModalOpen(true)}>
            Unlock with Plus
          </button>
        </motion.div>
      )}

      {/* Tabs */}
      <div className="tabs mb-16" style={{ marginTop: 4 }}>
        <button className={`tab${tab === 'strength' ? ' active' : ''}`} onClick={() => setTab('strength')}>
          Strength
        </button>
        <button className={`tab${tab === 'prs' ? ' active' : ''}`} onClick={() => setTab('prs')}>
          Personal Records
        </button>
      </div>

      {tab === 'strength' && (
        <>
          {/* Exercise Selector */}
          <div className="input-group mb-12">
            <label className="input-label">Exercise</label>
            <CustomSelect
              value={selectedEx ?? ''}
              options={exercisesWithData.map(ex => ({ label: ex.name, value: ex.id }))}
              onChange={val => setSelectedEx(val)}
              placeholder={exercisesWithData.length === 0 ? 'No data yet' : 'Select exercise'}
            />
          </div>

          {/* Chart type toggle */}
          <div className="flex gap-8 mb-16">
            {Object.entries(chartConfig).map(([key, c]) => (
              <button
                key={key}
                className={`chip${chartType === key ? ' active' : ''}`}
                onClick={() => setChartType(key)}
                style={{ fontSize: '0.72rem' }}
              >
                {c.name}
              </button>
            ))}
          </div>

          {/* Chart */}
          {chartData.length >= 2 ? (
            <motion.div
              className="card mb-16"
              initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            >
              <div className="flex items-center justify-between mb-12">
                <div className="font-semibold text-sm">{cfg.name} over time</div>
                {chartData.length > 0 && (
                  <div className="text-right">
                    <div className="font-bold text-accent">{chartData.at(-1)?.[cfg.key]}</div>
                    <div className="text-xs text-muted">{unit}</div>
                  </div>
                )}
              </div>
              <ResponsiveContainer width="100%" height={200}>
                <AreaChart data={chartData} margin={{ top: 4, right: 4, left: -24, bottom: 0 }}>
                  <defs>
                    <linearGradient id="chartGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%"  stopColor={cfg.color} stopOpacity={0.3} />
                      <stop offset="95%" stopColor={cfg.color} stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid stroke="var(--color-border)" strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="date" tick={{ fill: 'var(--color-text-muted)', fontSize: 10 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fill: 'var(--color-text-muted)', fontSize: 10 }} axisLine={false} tickLine={false} />
                  <Tooltip content={<CustomTooltip unit={unit} />} />
                  <Area type="monotone" dataKey={cfg.key} name={cfg.name} stroke={cfg.color} strokeWidth={2.5} fill="url(#chartGrad)" dot={{ fill: cfg.color, r: 3 }} activeDot={{ r: 5 }} />
                </AreaChart>
              </ResponsiveContainer>
            </motion.div>
          ) : (
            <div className="card mb-16">
              <div className="empty-state" style={{ padding: '24px 0' }}>
                <TrendingUp size={32} color="var(--color-text-muted)" style={{ opacity: 0.4 }} />
                <p className="text-sm">Log at least 2 sessions of this exercise to see a chart</p>
              </div>
            </div>
          )}

          {/* Session history for selected exercise */}
          {chartData.length > 0 && (
            <>
              <div className="section-title mb-8">Session History</div>
              <div className="flex-col gap-6">
                {[...chartData].reverse().map((d, i) => (
                  <div key={i} className="card card-sm flex items-center justify-between">
                    <span className="text-sm text-muted">{d.date}</span>
                    <div className="flex gap-16">
                      <div className="text-right">
                        <div className="text-sm font-bold">{d.bestWeight}{unit}</div>
                        <div className="text-xs text-muted">best</div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm font-bold">{d.totalVolume?.toLocaleString()}</div>
                        <div className="text-xs text-muted">vol</div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm font-bold text-accent">{d.best1RM}</div>
                        <div className="text-xs text-muted">e1RM</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </>
      )}

      {tab === 'prs' && (
        <>
          <div className="flex items-center gap-8 mb-16">
            <Trophy size={18} color="var(--color-pr)" />
            <span className="font-semibold">{prs.length} exercises with PRs</span>
          </div>
          <PRBoard prs={prs} getExercise={getExercise} unit={unit} />
        </>
      )}
    </div>
  );
}
