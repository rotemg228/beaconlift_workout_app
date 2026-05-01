import { differenceInDays } from 'date-fns';

/** Total training volume for a session (uses totalVolume if set, else sums completed working sets). */
export function getSessionVolume(session) {
  if (!session) return 0;
  if (session.totalVolume != null) return session.totalVolume;
  return (session.exercises || []).reduce(
    (sessionTotal, exercise) =>
      sessionTotal +
      (exercise.sets || []).reduce((setTotal, setItem) => {
        if (!setItem.completed || setItem.isWarmup) return setTotal;
        return setTotal + (setItem.weight || 0) * (setItem.reps || 0);
      }, 0),
    0,
  );
}

/**
 * 0–100 score: consistency (unique days trained in last 7d), volume vs prior week, light PR bonus.
 */
export function computeWeeklyTrainingScore(sessions, getAllPRs) {
  const now = new Date();
  const days = new Set();
  let vol7 = 0;
  let volPrev7 = 0;

  for (const s of sessions) {
    const sessionDate = new Date(`${s.date}T00:00:00`);
    const diff = differenceInDays(now, sessionDate);
    const v = getSessionVolume(s);
    if (diff <= 6) {
      days.add(s.date);
      vol7 += v;
    } else if (diff <= 13) {
      volPrev7 += v;
    }
  }

  const consistency = Math.min(100, Math.round((days.size / 4) * 100));
  let volumeTrend = 50;
  if (volPrev7 > 0) {
    const ratio = vol7 / volPrev7;
    volumeTrend = Math.round(Math.min(1.2, Math.max(0.8, ratio)) * 50 + 25);
  } else if (vol7 > 0) {
    volumeTrend = 70;
  }

  const prCount = typeof getAllPRs === 'function' ? getAllPRs().length : 0;
  const prBonus = Math.min(15, prCount * 2);

  const raw = consistency * 0.45 + volumeTrend * 0.45 + prBonus;
  const score = Math.max(0, Math.min(100, Math.round(raw)));

  return {
    score,
    daysTrainedThisWeek: days.size,
    volumeThisWeek: vol7,
    volumePrevWeek: volPrev7,
    label:
      score >= 75 ? 'Strong week'
        : score >= 55 ? 'Solid momentum'
          : score >= 35 ? 'Room to push'
            : 'Build the habit',
  };
}

/** Best working-set weight for an exercise from most recent past session (before optional excludeSessionId). */
export function getLastSessionBestWeight(sessions, exerciseId, excludeSessionId = null) {
  for (const s of sessions) {
    if (excludeSessionId && s.id === excludeSessionId) continue;
    const block = s.exercises?.find((e) => e.exerciseId === exerciseId);
    if (!block?.sets?.length) continue;
    const completedWorkingSets = block.sets.filter((st) => st.completed && !st.isWarmup);
    const candidateSets = completedWorkingSets.length
      ? completedWorkingSets
      : block.sets.filter((st) => !st.isWarmup);
    const best = candidateSets
      .reduce((m, st) => Math.max(m, st.weight || 0), 0);
    if (best > 0) {
      const topSet = candidateSets.find((st) => (st.weight || 0) === best);
      return { weight: best, reps: topSet?.reps ?? null, sessionName: s.name, date: s.date };
    }
  }
  return null;
}
