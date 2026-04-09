import { create } from 'zustand';
import { supabase } from '../supabase';
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

// ─── USER STORE ──────────────────────────────────────────
export const useUserStore = create((set, get) => ({
  user: loadLS('forge_user', null),
  profile: loadLS('forge_profile', { isPro: false, plan: 'free', username: '', joinedAt: new Date().toISOString() }),
  isProModalOpen: false,

  setUser: (user) => {
    saveLS('forge_user', user);
    set({ user });
  },

  setProModalOpen: (open) => set({ isProModalOpen: open }),

  syncProfile: async (user) => {
    if (!user) {
      const fallback = { isPro: false, plan: 'free', username: '', joinedAt: new Date().toISOString() };
      saveLS('forge_profile', fallback);
      set({ profile: fallback });
      return;
    }
    const { data, error } = await supabase.from('profiles').select('*').eq('id', user.id).maybeSingle();
    const profile = !error && data
      ? {
          ...get().profile,
          username: data.username || user.user_metadata?.username || '',
          isPro: !!(data.is_pro || data.is_plus),
          plan: data.plan || ((data.is_pro || data.is_plus) ? 'plus' : 'free'),
        }
      : {
          ...get().profile,
          username: user.user_metadata?.username || '',
          isPro: false,
          plan: 'free',
        };
    saveLS('forge_profile', profile);
    set({ profile });
  },

  updateProfile: (changes) => {
    const updated = { ...get().profile, ...changes };
    saveLS('forge_profile', updated);
    set({ profile: updated });
  },

  logout: () => {
    localStorage.removeItem('forge_user');
    localStorage.removeItem('forge_profile');
    set({ user: null, profile: { isPro: false, plan: 'free', username: '', joinedAt: new Date().toISOString() } });
  },
}));

// ─── TEMPLATE STORE ───────────────────────────────────────
export const useTemplateStore = create((set, get) => ({
  templates: loadLS('forge_templates', TEMPLATES),

  syncTemplates: async (user) => {
    if (!user) return;
    const { data, error } = await supabase.from('templates').select('*').eq('user_id', user.id);
    if (!error && data) {
      const formatted = data.map(t => ({
        id: t.id,
        name: t.name,
        category: t.category,
        exercises: t.exercises,
        isCustom: true,
      }));
      set({ templates: [...TEMPLATES, ...formatted] });
      saveLS('forge_templates', get().templates);
    }
  },

  canAddTemplate: () => {
    const { profile } = useUserStore.getState();
    const { templates } = get();
    if (profile.isPro) return true;
    const customCount = templates.filter(t => t.isCustom).length;
    return customCount < 3;
  },

  addTemplate: async (t) => {
    if (!get().canAddTemplate()) {
      useUserStore.getState().setProModalOpen(true);
      return null;
    }

    const newT = { ...t, id: genId(), createdAt: new Date().toISOString(), isCustom: true };
    const updated = [...get().templates, newT];
    saveLS('forge_templates', updated);
    set({ templates: updated });

    const user = useUserStore.getState().user;
    if (user) {
      await supabase.from('templates').upsert({
        user_id: user.id,
        name: newT.name,
        category: newT.category,
        exercises: newT.exercises,
      });
    }
    return newT.id;
  },

  updateTemplate: async (id, changes) => {
    const updated = get().templates.map(t => t.id === id ? { ...t, ...changes } : t);
    saveLS('forge_templates', updated);
    set({ templates: updated });

    const user = useUserStore.getState().user;
    if (user && id.length > 30) {
      await supabase.from('templates').update({
        name: changes.name,
        category: changes.category,
        exercises: changes.exercises,
      }).eq('id', id).eq('user_id', user.id);
    }
  },

  deleteTemplate: async (id) => {
    const updated = get().templates.filter(t => t.id !== id || !t.isCustom);
    saveLS('forge_templates', updated);
    set({ templates: updated });

    const user = useUserStore.getState().user;
    if (user && id.length > 30) {
      await supabase.from('templates').delete().eq('id', id).eq('user_id', user.id);
    }
  },
}));

// ─── WORKOUT STORE ────────────────────────────────────────
export const useWorkoutStore = create((set, get) => ({
  sessions: loadLS('forge_sessions', []),
  activeSession: null,

  syncSessions: async (user) => {
    if (!user) return;
    const { data, error } = await supabase.from('workouts').select('*').eq('user_id', user.id).order('date', { ascending: false });
    if (!error && data) {
      const formatted = data.map(w => ({
        id: w.id,
        templateId: w.template_id,
        name: w.name,
        date: w.date,
        startTime: w.start_time,
        endTime: w.end_time,
        exercises: w.exercises,
        notes: w.notes,
        totalVolume: +w.total_volume,
      }));
      set({ sessions: formatted });
      saveLS('forge_sessions', formatted);
    }
  },

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

  removeExerciseFromSession: (exerciseId) => {
    const { activeSession } = get();
    if (!activeSession) return;
    const updated = { ...activeSession, exercises: activeSession.exercises.filter(e => e.exerciseId !== exerciseId) };
    set({ activeSession: updated });
  },

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

  toggleSetComplete: (exerciseId, setId) => {
    const { activeSession, sessions } = get();
    if (!activeSession) return false;

    const exercise = activeSession.exercises.find(e => e.exerciseId === exerciseId);
    const theSet = exercise?.sets.find(s => s.id === setId);
    if (!theSet) return false;

    const nowComplete = !theSet.completed;
    let isPR = false;

    if (nowComplete && !theSet.isWarmup) {
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

  finishWorkout: async () => {
    const { activeSession, sessions } = get();
    if (!activeSession) return null;

    const totalVolume = activeSession.exercises.reduce((total, e) =>
      total + e.sets.filter(s => s.completed && !s.isWarmup).reduce((t, s) => t + s.weight * s.reps, 0), 0
    );

    const finished = { ...activeSession, endTime: new Date().toISOString(), totalVolume };
    const updated = [finished, ...sessions];
    saveLS('forge_sessions', updated);
    set({ sessions: updated, activeSession: null });

    const user = useUserStore.getState().user;
    if (user) {
      await supabase.from('workouts').upsert({
        user_id: user.id,
        template_id: finished.templateId,
        name: finished.name,
        date: finished.date,
        start_time: finished.startTime,
        end_time: finished.endTime,
        exercises: finished.exercises,
        notes: finished.notes,
        total_volume: finished.totalVolume,
      });
    }
    return finished;
  },

  cancelWorkout: () => {
    set({ activeSession: null });
  },

  deleteSession: async (id) => {
    const updated = get().sessions.filter(s => s.id !== id);
    saveLS('forge_sessions', updated);
    set({ sessions: updated });

    const user = useUserStore.getState().user;
    if (user && id.length > 30) {
      await supabase.from('workouts').delete().eq('id', id).eq('user_id', user.id);
    }
  },

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

  syncMeasurements: async (user) => {
    if (!user) return;
    const { data, error } = await supabase.from('measurements').select('*').eq('user_id', user.id).order('date', { ascending: false });
    if (!error && data) {
      const formatted = data.map(m => ({
        id: m.id,
        date: m.date,
        weight: +m.weight,
        bodyFat: +m.body_fat,
        measurements: m.measurements,
      }));
      set({ measurements: formatted });
      saveLS('forge_measurements', formatted);
    }
  },

  addMeasurement: async (m) => {
    const entry = { ...m, id: genId(), date: m.date ?? new Date().toISOString().split('T')[0] };
    const updated = [entry, ...get().measurements].sort((a, b) => b.date.localeCompare(a.date));
    saveLS('forge_measurements', updated);
    set({ measurements: updated });

    const user = useUserStore.getState().user;
    if (user) {
      await supabase.from('measurements').upsert({
        user_id: user.id,
        date: entry.date,
        weight: entry.weight,
        body_fat: entry.bodyFat,
        measurements: entry.measurements,
      });
    }
  },

  deleteMeasurement: async (id) => {
    const updated = get().measurements.filter(m => m.id !== id);
    saveLS('forge_measurements', updated);
    set({ measurements: updated });

    const user = useUserStore.getState().user;
    if (user && id.length > 30) {
      await supabase.from('measurements').delete().eq('id', id).eq('user_id', user.id);
    }
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
