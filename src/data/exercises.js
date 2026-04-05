// ─── EXERCISE LIBRARY (60+ exercises) ────────────────────
export const EXERCISES = [
  // CHEST
  { id: 'bench-press', name: 'Bench Press', category: 'Push', muscleGroups: ['Chest', 'Triceps', 'Shoulders'], equipment: 'Barbell', isCustom: false },
  { id: 'incline-bench', name: 'Incline Bench Press', category: 'Push', muscleGroups: ['Upper Chest', 'Triceps'], equipment: 'Barbell', isCustom: false },
  { id: 'decline-bench', name: 'Decline Bench Press', category: 'Push', muscleGroups: ['Lower Chest', 'Triceps'], equipment: 'Barbell', isCustom: false },
  { id: 'db-bench', name: 'Dumbbell Bench Press', category: 'Push', muscleGroups: ['Chest', 'Triceps'], equipment: 'Dumbbell', isCustom: false },
  { id: 'incline-db-bench', name: 'Incline Dumbbell Press', category: 'Push', muscleGroups: ['Upper Chest'], equipment: 'Dumbbell', isCustom: false },
  { id: 'db-fly', name: 'Dumbbell Fly', category: 'Push', muscleGroups: ['Chest'], equipment: 'Dumbbell', isCustom: false },
  { id: 'cable-fly', name: 'Cable Fly', category: 'Push', muscleGroups: ['Chest'], equipment: 'Cable', isCustom: false },
  { id: 'push-up', name: 'Push-Up', category: 'Push', muscleGroups: ['Chest', 'Triceps'], equipment: 'Bodyweight', isCustom: false },
  { id: 'chest-dip', name: 'Chest Dips', category: 'Push', muscleGroups: ['Chest', 'Triceps'], equipment: 'Bodyweight', isCustom: false },
  { id: 'pec-deck', name: 'Pec Deck (Machine Fly)', category: 'Push', muscleGroups: ['Chest'], equipment: 'Machine', isCustom: false },

  // BACK
  { id: 'deadlift', name: 'Deadlift', category: 'Pull', muscleGroups: ['Back', 'Hamstrings', 'Glutes'], equipment: 'Barbell', isCustom: false },
  { id: 'barbell-row', name: 'Barbell Row', category: 'Pull', muscleGroups: ['Back', 'Biceps'], equipment: 'Barbell', isCustom: false },
  { id: 'pull-up', name: 'Pull-Up', category: 'Pull', muscleGroups: ['Back', 'Biceps'], equipment: 'Bodyweight', isCustom: false },
  { id: 'chin-up', name: 'Chin-Up', category: 'Pull', muscleGroups: ['Back', 'Biceps'], equipment: 'Bodyweight', isCustom: false },
  { id: 'lat-pulldown', name: 'Lat Pulldown', category: 'Pull', muscleGroups: ['Back', 'Biceps'], equipment: 'Cable', isCustom: false },
  { id: 'seated-row', name: 'Seated Cable Row', category: 'Pull', muscleGroups: ['Back', 'Biceps'], equipment: 'Cable', isCustom: false },
  { id: 't-bar-row', name: 'T-Bar Row', category: 'Pull', muscleGroups: ['Back'], equipment: 'Barbell', isCustom: false },
  { id: 'db-row', name: 'Dumbbell Row', category: 'Pull', muscleGroups: ['Back', 'Biceps'], equipment: 'Dumbbell', isCustom: false },
  { id: 'face-pull', name: 'Face Pull', category: 'Pull', muscleGroups: ['Rear Delts', 'Upper Back'], equipment: 'Cable', isCustom: false },
  { id: 'hyperextension', name: 'Hyperextension', category: 'Pull', muscleGroups: ['Lower Back', 'Glutes'], equipment: 'Machine', isCustom: false },

  // SHOULDERS
  { id: 'ohp', name: 'Overhead Press', category: 'Push', muscleGroups: ['Shoulders', 'Triceps'], equipment: 'Barbell', isCustom: false },
  { id: 'db-ohp', name: 'Dumbbell Shoulder Press', category: 'Push', muscleGroups: ['Shoulders', 'Triceps'], equipment: 'Dumbbell', isCustom: false },
  { id: 'arnold-press', name: 'Arnold Press', category: 'Push', muscleGroups: ['Shoulders'], equipment: 'Dumbbell', isCustom: false },
  { id: 'lateral-raise', name: 'Lateral Raise', category: 'Push', muscleGroups: ['Side Delts'], equipment: 'Dumbbell', isCustom: false },
  { id: 'front-raise', name: 'Front Raise', category: 'Push', muscleGroups: ['Front Delts'], equipment: 'Dumbbell', isCustom: false },
  { id: 'rear-delt-fly', name: 'Rear Delt Fly', category: 'Pull', muscleGroups: ['Rear Delts'], equipment: 'Dumbbell', isCustom: false },
  { id: 'shrugs', name: 'Barbell Shrugs', category: 'Pull', muscleGroups: ['Traps'], equipment: 'Barbell', isCustom: false },
  { id: 'upright-row', name: 'Upright Row', category: 'Pull', muscleGroups: ['Traps', 'Side Delts'], equipment: 'Barbell', isCustom: false },

  // BICEPS
  { id: 'barbell-curl', name: 'Barbell Curl', category: 'Pull', muscleGroups: ['Biceps'], equipment: 'Barbell', isCustom: false },
  { id: 'db-curl', name: 'Dumbbell Curl', category: 'Pull', muscleGroups: ['Biceps'], equipment: 'Dumbbell', isCustom: false },
  { id: 'hammer-curl', name: 'Hammer Curl', category: 'Pull', muscleGroups: ['Biceps', 'Brachialis'], equipment: 'Dumbbell', isCustom: false },
  { id: 'preacher-curl', name: 'Preacher Curl', category: 'Pull', muscleGroups: ['Biceps'], equipment: 'Barbell', isCustom: false },
  { id: 'cable-curl', name: 'Cable Curl', category: 'Pull', muscleGroups: ['Biceps'], equipment: 'Cable', isCustom: false },
  { id: 'concentration-curl', name: 'Concentration Curl', category: 'Pull', muscleGroups: ['Biceps'], equipment: 'Dumbbell', isCustom: false },

  // TRICEPS
  { id: 'tricep-pushdown', name: 'Tricep Pushdown', category: 'Push', muscleGroups: ['Triceps'], equipment: 'Cable', isCustom: false },
  { id: 'skull-crusher', name: 'Skull Crusher', category: 'Push', muscleGroups: ['Triceps'], equipment: 'Barbell', isCustom: false },
  { id: 'overhead-ext', name: 'Overhead Tricep Extension', category: 'Push', muscleGroups: ['Triceps'], equipment: 'Dumbbell', isCustom: false },
  { id: 'tri-dip', name: 'Tricep Dips', category: 'Push', muscleGroups: ['Triceps'], equipment: 'Bodyweight', isCustom: false },
  { id: 'cg-bench', name: 'Close-Grip Bench Press', category: 'Push', muscleGroups: ['Triceps', 'Chest'], equipment: 'Barbell', isCustom: false },
  { id: 'kickback', name: 'Tricep Kickback', category: 'Push', muscleGroups: ['Triceps'], equipment: 'Dumbbell', isCustom: false },

  // LEGS
  { id: 'squat', name: 'Barbell Squat', category: 'Legs', muscleGroups: ['Quads', 'Glutes', 'Hamstrings'], equipment: 'Barbell', isCustom: false },
  { id: 'front-squat', name: 'Front Squat', category: 'Legs', muscleGroups: ['Quads', 'Glutes'], equipment: 'Barbell', isCustom: false },
  { id: 'leg-press', name: 'Leg Press', category: 'Legs', muscleGroups: ['Quads', 'Glutes'], equipment: 'Machine', isCustom: false },
  { id: 'rdl', name: 'Romanian Deadlift', category: 'Legs', muscleGroups: ['Hamstrings', 'Glutes'], equipment: 'Barbell', isCustom: false },
  { id: 'leg-curl', name: 'Leg Curl', category: 'Legs', muscleGroups: ['Hamstrings'], equipment: 'Machine', isCustom: false },
  { id: 'leg-ext', name: 'Leg Extension', category: 'Legs', muscleGroups: ['Quads'], equipment: 'Machine', isCustom: false },
  { id: 'calf-raise', name: 'Calf Raise', category: 'Legs', muscleGroups: ['Calves'], equipment: 'Machine', isCustom: false },
  { id: 'bss', name: 'Bulgarian Split Squat', category: 'Legs', muscleGroups: ['Quads', 'Glutes'], equipment: 'Dumbbell', isCustom: false },
  { id: 'hack-squat', name: 'Hack Squat', category: 'Legs', muscleGroups: ['Quads'], equipment: 'Machine', isCustom: false },
  { id: 'lunges', name: 'Lunges', category: 'Legs', muscleGroups: ['Quads', 'Glutes'], equipment: 'Dumbbell', isCustom: false },
  { id: 'hip-thrust', name: 'Hip Thrust', category: 'Legs', muscleGroups: ['Glutes', 'Hamstrings'], equipment: 'Barbell', isCustom: false },

  // CORE
  { id: 'plank', name: 'Plank', category: 'Core', muscleGroups: ['Core'], equipment: 'Bodyweight', isCustom: false },
  { id: 'crunches', name: 'Crunches', category: 'Core', muscleGroups: ['Abs'], equipment: 'Bodyweight', isCustom: false },
  { id: 'leg-raise', name: 'Hanging Leg Raise', category: 'Core', muscleGroups: ['Lower Abs'], equipment: 'Bodyweight', isCustom: false },
  { id: 'russian-twist', name: 'Russian Twist', category: 'Core', muscleGroups: ['Obliques'], equipment: 'Bodyweight', isCustom: false },
  { id: 'ab-wheel', name: 'Ab Wheel Rollout', category: 'Core', muscleGroups: ['Core'], equipment: 'Other', isCustom: false },
  { id: 'cable-crunch', name: 'Cable Crunch', category: 'Core', muscleGroups: ['Abs'], equipment: 'Cable', isCustom: false },
  { id: 'situp', name: 'Sit-Up', category: 'Core', muscleGroups: ['Abs'], equipment: 'Bodyweight', isCustom: false },

  // OLYMPIC
  { id: 'clean-jerk', name: 'Clean & Jerk', category: 'Olympic', muscleGroups: ['Full Body'], equipment: 'Barbell', isCustom: false },
  { id: 'snatch', name: 'Snatch', category: 'Olympic', muscleGroups: ['Full Body'], equipment: 'Barbell', isCustom: false },
  { id: 'power-clean', name: 'Power Clean', category: 'Olympic', muscleGroups: ['Full Body'], equipment: 'Barbell', isCustom: false },

  // CARDIO
  { id: 'running', name: 'Running', category: 'Cardio', muscleGroups: ['Legs', 'Cardio'], equipment: 'Other', isCustom: false },
  { id: 'cycling', name: 'Cycling', category: 'Cardio', muscleGroups: ['Legs', 'Cardio'], equipment: 'Machine', isCustom: false },
  { id: 'jump-rope', name: 'Jump Rope', category: 'Cardio', muscleGroups: ['Cardio'], equipment: 'Other', isCustom: false },
  { id: 'rowing', name: 'Rowing Machine', category: 'Cardio', muscleGroups: ['Back', 'Legs', 'Cardio'], equipment: 'Machine', isCustom: false },
];

export const CATEGORIES = ['All', 'Push', 'Pull', 'Legs', 'Core', 'Olympic', 'Cardio'];
export const EQUIPMENT  = ['All', 'Barbell', 'Dumbbell', 'Cable', 'Machine', 'Bodyweight', 'Other'];
export const MUSCLE_GROUPS = [
  'Chest', 'Back', 'Shoulders', 'Biceps', 'Triceps',
  'Quads', 'Hamstrings', 'Glutes', 'Calves', 'Core',
  'Abs', 'Obliques', 'Traps', 'Forearms', 'Full Body'
];
