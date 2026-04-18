import { BrowserRouter, Routes, Route, useLocation, Link, Navigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Home, Dumbbell, History, TrendingUp, User, Plus, Wrench } from 'lucide-react';
import { useWorkoutStore, useUserStore, useTemplateStore, useMeasurementStore } from './store';
import { supabase } from './supabase';
import Dashboard from './pages/Dashboard';
import ActiveWorkout from './pages/ActiveWorkout';
import HistoryPage from './pages/HistoryPage';
import ExerciseLibrary from './pages/ExerciseLibrary';
import Progress from './pages/Progress';
import ProfilePage from './pages/ProfilePage';
import Tools from './pages/Tools';
import Login from './pages/Login';
import Pricing from './pages/Pricing';
import PrivacyPolicy from './pages/PrivacyPolicy';
import RefundPolicy from './pages/RefundPolicy';
import TermsOfService from './pages/TermsOfService';
import ProModal from './components/ProModal';
import './styles/index.css';

const PUBLIC_PATHS = ['/login', '/pricing', '/privacy', '/refunds', '/terms'];

const pageVariants = {
  initial: { opacity: 0, y: 10 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.22, ease: 'easeOut' } },
  exit:    { opacity: 0, y: -6, transition: { duration: 0.15 } },
};

function NavBar() {
  const location = useLocation();
  const { activeSession } = useWorkoutStore();
  const path = location.pathname;

  if (PUBLIC_PATHS.includes(path)) return null;

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
  const { user, setUser, syncProfile } = useUserStore();
  const { syncSessions } = useWorkoutStore();
  const { syncTemplates } = useTemplateStore();
  const { syncMeasurements } = useMeasurementStore();
  const [isGuest, setIsGuest] = useState(false);
  const [authReady, setAuthReady] = useState(false);
  const location = useLocation();

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      const u = session?.user ?? null;
      setUser(u);
      if (u) {
        syncProfile(u);
        syncSessions(u);
        syncTemplates(u);
        syncMeasurements(u);
      } else {
        syncProfile(null);
      }
      setAuthReady(true);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      const u = session?.user ?? null;
      setUser(u);
      if (u) {
        syncProfile(u);
        syncSessions(u);
        syncTemplates(u);
        syncMeasurements(u);
      } else {
        syncProfile(null);
      }
      setAuthReady(true);
    });

    return () => subscription.unsubscribe();
  }, [setUser, syncProfile, syncSessions, syncTemplates, syncMeasurements]);

  if (!authReady) {
    return null;
  }

  if ((user || isGuest) && location.pathname === '/login') {
    return <Navigate to="/" replace />;
  }

  if (!user && !isGuest && !PUBLIC_PATHS.includes(location.pathname)) {
    return <Navigate to="/login" replace />;
  }

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
          <Route path="/login"       element={<Login onFinish={() => setIsGuest(true)} />} />
          <Route path="/pricing"     element={<Pricing />} />
          <Route path="/privacy"     element={<PrivacyPolicy />} />
          <Route path="/refunds"     element={<RefundPolicy />} />
          <Route path="/terms"       element={<TermsOfService />} />
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
        <ProModal />
      </div>
    </BrowserRouter>
  );
}
