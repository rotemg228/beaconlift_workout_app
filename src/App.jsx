import { BrowserRouter, Routes, Route, useLocation, Link } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { Home, Dumbbell, History, TrendingUp, User, Plus, Wrench } from 'lucide-react';
import { useWorkoutStore } from './store';
import Dashboard from './pages/Dashboard';
import ActiveWorkout from './pages/ActiveWorkout';
import HistoryPage from './pages/HistoryPage';
import ExerciseLibrary from './pages/ExerciseLibrary';
import Progress from './pages/Progress';
import ProfilePage from './pages/ProfilePage';
import Tools from './pages/Tools';
import './styles/index.css';

const pageVariants = {
  initial: { opacity: 0, y: 10 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.22, ease: 'easeOut' } },
  exit:    { opacity: 0, y: -6, transition: { duration: 0.15 } },
};

function NavBar() {
  const location = useLocation();
  const { activeSession } = useWorkoutStore();
  const path = location.pathname;

  const navItems = [
    { to: '/',          icon: Home,       label: 'Home'     },
    { to: '/history',   icon: History,    label: 'History'  },
    { to: '/workout',   icon: Plus,       label: 'Train',   center: true },
    { to: '/progress',  icon: TrendingUp, label: 'Progress' },
    { to: '/profile',   icon: User,       label: 'Profile'  },
  ];

  return (
    <nav className="bottom-nav">
      {navItems.map(({ to, icon: Icon, label, center }) => (
        <Link
          key={to}
          to={to}
          className={`nav-item${center ? ' nav-item-center' : ''}${path === to && !center ? ' active' : ''}`}
        >
          {center && activeSession ? (
            <>
              <Dumbbell size={20} />
              <span style={{ fontSize: '0.6rem' }}>Active</span>
            </>
          ) : (
            <>
              <Icon size={center ? 22 : 20} />
              {!center && <span>{label}</span>}
            </>
          )}
        </Link>
      ))}
    </nav>
  );
}

function AppRoutes() {
  const location = useLocation();
  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={location.pathname}
        variants={pageVariants}
        initial="initial"
        animate="animate"
        exit="exit"
        style={{ flex: 1, display: 'flex', flexDirection: 'column' }}
      >
        <Routes location={location}>
          <Route path="/"            element={<Dashboard />} />
          <Route path="/workout"     element={<ActiveWorkout />} />
          <Route path="/history"     element={<HistoryPage />} />
          <Route path="/exercises"   element={<ExerciseLibrary />} />
          <Route path="/progress"    element={<Progress />} />
          <Route path="/profile"     element={<ProfilePage />} />
          <Route path="/tools"       element={<Tools />} />
        </Routes>
      </motion.div>
    </AnimatePresence>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <div className="app-shell">
        <AppRoutes />
        <NavBar />
      </div>
    </BrowserRouter>
  );
}
