import { create } from 'zustand';
import { EXERCISES } from '../data/exercises';
import { TEMPLATES } from '../data/templates';

// ─── HELPERS ─────────────────────────────────────────────
const loadLS = (key, fallback) => {
  try { const v = localStorage.getItem(key); return v ? JSON.parse(v) : fallback; }
  catch { return fallback; }
};
const saveLS = (key, value) => {
  try { localStorage.setItem(key, JSON.stringify(value)); } catch {}
};
const genId = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 6);

// ─── EXERCISE STORE ───────────────────────────────────────
export const useExerciseStore = create((set, get) => ({
  exercises: loadLS('forge_exercises', EXERCISES),

  addExercise: (ex) => {
    const newEx = { ...ex, id: genId(), isCustom: true };
    const updated = [...get().exercises, newEx];
    saveLS('forge_exercises', updated);
    set({ exercises: updated });
    return newEx.id;
  },

  removeCustomExercise: (id) => {
    const updated = get().exercises.filter(e => e.id !== id || !e.isCustom);
    saveLS('forge_exercises', updated);
    set({ exercises: updated });
  },

  getExercise: (id) => get().exercises.find(e => e.id === id),
}));

// ─── TEMPLATE STORE ───────────────────────────────────────
export const useTemplateStore = create((set, get) => ({
  templates: loadLS('forge_templates', TEMPLATES),

  addTemplate: (t) => {
    const newT = { ...t, id: genId(), createdAt: new Date().toISOString(), isCustom: true };
    const updated = [...get().templates, newT];
    saveLS('forge_templates', updated);
    set({ templates: updated });
    return newT.id;
  },

  updateTemplate: (id, changes) => {
    const updated = get().templates.map(t => t.id === id ? { ...t, ...changes } : t);
    saveLS('forge_templates', updated);
    set({ templates: updated });
  },

  deleteTemplate: (id) => {
    const updated = get().templates.filter(t => t.id !== id || !t.isCustom);
    saveLS('forge_templates', updated);
    set({ templates: updated });
  },
}));

// ─── WORKOUT STORE ────────────────────────────────────────
export const useWorkoutStore = create((set, get) => ({
  sessions: loadLS('forge_sessions', []),
  activeSession: null,

  // ── Start a workout ────────────────────────────────────
  startWorkout: (template = null) => {
    const session = {
      id: genId(),
      templateId: template?.id ?? null,
      name: template?.name ?? 'Quick Workout',
      date: new Date().toISOString().split('T')[0],
      startTime: new Date().toISOString(),
      endTime: null,
      exercises: template
        ? template.exercises.map(te => ({
            exerciseId: te.exerciseId,
            sets: Array.from({ length: te.defaultSets }, () => ({
              id: genId(),
              reps: te.defaultReps,
              weight: te.defaultWeight,
              rpe: null,
              completed: false,
              isWarmup: false,
              isPR: false,
            })),
            restSeconds: te.restSeconds,
            notes: '',
          }))
        : [],
      notes: '',
      totalVolume: 0,
    };
    set({ activeSession: session });
  },

  // ── Add exercise to active session ─────────────────────
  addExerciseToSession: (exerciseId, restSeconds = 90) => {
    const { activeSession } = get();
    if (!activeSession) return;
    const updated = {
      ...activeSession,
      exercises: [
        ...activeSession.exercises,
        { exerciseId, sets: [{ id: genId(), reps: 10, weight: 0, rpe: null, completed: false, isWarmup: false, isPR: false }], restSeconds, notes: '' }
      ],
    };
    set({ activeSession: updated });
  },

  // ── Remove exercise from session ───────────────────────
  removeExerciseFromSession: (exerciseId) => {
    const { activeSession } = get();
    if (!activeSession) return;
    const updated = { ...activeSession, exercises: activeSession.exercises.filter(e => e.exerciseId !== exerciseId) };
    set({ activeSession: updated });
  },

  // ── Add set ────────────────────────────────────────────
  addSet: (exerciseId) => {
    const { activeSession } = get();
    if (!activeSession) return;
    const lastSet = activeSession.exercises.find(e => e.exerciseId === exerciseId)?.sets.at(-1);
    const updated = {
      ...activeSession,
      exercises: activeSession.exercises.map(e =>
        e.exerciseId === exerciseId
          ? { ...e, sets: [...e.sets, { id: genId(), reps: lastSet?.reps ?? 10, weight: lastSet?.weight ?? 0, rpe: null, completed: false, isWarmup: false, isPR: false }] }
          : e
      ),
    };
    set({ activeSession: updated });
  },

  // ── Remove set ─────────────────────────────────────────
  removeSet: (exerciseId, setId) => {
    const { activeSession } = get();
    if (!activeSession) return;
    const updated = {
      ...activeSession,
      exercises: activeSession.exercises.map(e =>
        e.exerciseId === exerciseId
          ? { ...e, sets: e.sets.filter(s => s.id !== setId) }
          : e
      ),
    };
    set({ activeSession: updated });
  },

  // ── Update set field ───────────────────────────────────
  updateSet: (exerciseId, setId, field, value) => {
    const { activeSession } = get();
    if (!activeSession) return;
    const updated = {
      ...activeSession,
      exercises: activeSession.exercises.map(e =>
        e.exerciseId === exerciseId
          ? { ...e, sets: e.sets.map(s => s.id === setId ? { ...s, [field]: value } : s) }
          : e
      ),
    };
    set({ activeSession: updated });
  },

  // ── Toggle set complete + PR check ─────────────────────
  toggleSetComplete: (exerciseId, setId) => {
    const { activeSession, sessions } = get();
    if (!activeSession) return false;

    const exercise = activeSession.exercises.find(e => e.exerciseId === exerciseId);
    const theSet = exercise?.sets.find(s => s.id === setId);
    if (!theSet) return false;

    const nowComplete = !theSet.completed;
    let isPR = false;

    if (nowComplete && !theSet.isWarmup) {
      // Check if this is a PR (best weight × reps e1RM)
      const current1RM = theSet.weight * (1 + theSet.reps / 30);
      const pastBest = sessions
        .flatMap(s => s.exercises.filter(e => e.exerciseId === exerciseId).flatMap(e => e.sets))
        .reduce((best, s) => Math.max(best, s.weight * (1 + s.reps / 30)), 0);
      isPR = current1RM > pastBest && theSet.weight > 0;
    }

    const updated = {
      ...activeSession,
      exercises: activeSession.exercises.map(e =>
        e.exerciseId === exerciseId
          ? { ...e, sets: e.sets.map(s => s.id === setId ? { ...s, completed: nowComplete, isPR } : s) }
          : e
      ),
    };
    set({ activeSession: updated });
    return isPR;
  },

  // ── Finish workout ─────────────────────────────────────
  finishWorkout: () => {
    const { activeSession, sessions } = get();
    if (!activeSession) return null;

    const totalVolume = activeSession.exercises.reduce((total, e) =>
      total + e.sets.filter(s => s.completed && !s.isWarmup).reduce((t, s) => t + s.weight * s.reps, 0), 0
    );

    const finished = { ...activeSession, endTime: new Date().toISOString(), totalVolume };
    const updated = [finished, ...sessions];
    saveLS('forge_sessions', updated);
    set({ sessions: updated, activeSession: null });
    return finished;
  },

  // ── Cancel workout ─────────────────────────────────────
  cancelWorkout: () => set({ activeSession: null }),

  // ── Delete session ─────────────────────────────────────
  deleteSession: (id) => {
    const updated = get().sessions.filter(s => s.id !== id);
    saveLS('forge_sessions', updated);
    set({ sessions: updated });
  },

  // ── Get best sets per exercise (for progress) ──────────
  getBestSets: (exerciseId) => {
    return get().sessions
      .flatMap(s => ({ date: s.date, sets: s.exercises.find(e => e.exerciseId === exerciseId)?.sets ?? [] }))
      .filter(s => s.sets.length > 0)
      .map(s => ({
        date: s.date,
        bestWeight: Math.max(...s.sets.map(set => set.weight)),
        totalVolume: s.sets.filter(set => !set.isWarmup && set.completed).reduce((t, set) => t + set.weight * set.reps, 0),
        best1RM: Math.max(...s.sets.map(set => +(set.weight * (1 + set.reps / 30)).toFixed(1))),
      }))
      .sort((a, b) => a.date.localeCompare(b.date));
  },

  // ── Get all PRs ────────────────────────────────────────
  getAllPRs: () => {
    const { sessions } = get();
    const prMap = {};
    sessions.forEach(session => {
      session.exercises.forEach(e => {
        e.sets.filter(s => s.isPR).forEach(s => {
          const existing = prMap[e.exerciseId];
          const e1rm = s.weight * (1 + s.reps / 30);
          if (!existing || e1rm > existing.e1rm) {
            prMap[e.exerciseId] = { exerciseId: e.exerciseId, weight: s.weight, reps: s.reps, date: session.date, e1rm };
          }
        });
      });
    });
    return Object.values(prMap).sort((a, b) => b.e1rm - a.e1rm);
  },
}));

// ─── MEASUREMENT STORE ────────────────────────────────────
export const useMeasurementStore = create((set, get) => ({
  measurements: loadLS('forge_measurements', []),
  unit: loadLS('forge_unit', 'kg'), // 'kg' | 'lbs'

  setUnit: (unit) => {
    saveLS('forge_unit', unit);
    set({ unit });
  },

  addMeasurement: (m) => {
    const entry = { ...m, id: genId(), date: m.date ?? new Date().toISOString().split('T')[0] };
    const updated = [entry, ...get().measurements].sort((a, b) => b.date.localeCompare(a.date));
    saveLS('forge_measurements', updated);
    set({ measurements: updated });
  },

  updateMeasurement: (id, changes) => {
    const updated = get().measurements.map(m => m.id === id ? { ...m, ...changes } : m);
    saveLS('forge_measurements', updated);
    set({ measurements: updated });
  },

  deleteMeasurement: (id) => {
    const updated = get().measurements.filter(m => m.id !== id);
    saveLS('forge_measurements', updated);
    set({ measurements: updated });
  },

  getLatest: () => get().measurements[0] ?? null,

  getWeightHistory: () =>
    get().measurements
      .filter(m => m.weight != null)
      .map(m => ({ date: m.date, weight: m.weight }))
      .sort((a, b) => a.date.localeCompare(b.date)),
}));

// ─── SETTINGS STORE ───────────────────────────────────────
export const useSettingsStore = create((set) => ({
  unit: loadLS('forge_unit', 'kg'),
  name: loadLS('forge_name', ''),
  defaultRest: loadLS('forge_default_rest', 90),

  setUnit: (unit) => { saveLS('forge_unit', unit); set({ unit }); },
  setName: (name) => { saveLS('forge_name', name); set({ name }); },
  setDefaultRest: (s) => { saveLS('forge_default_rest', s); set({ defaultRest: s }); },
}));
