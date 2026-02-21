import { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Toaster } from '@/components/ui/sonner';
import { Navigation } from '@/sections/Navigation';
import { Footer } from '@/sections/Footer';
import { HomePage } from '@/pages/HomePage';
import { LibraryPage } from '@/pages/LibraryPage';
import { PlayerPage } from '@/pages/PlayerPage';
import { RewardsPage } from '@/pages/RewardsPage';
import { LoginPage } from '@/pages/LoginPage';
import { RegisterPage } from '@/pages/RegisterPage';
import { AdminPage } from '@/pages/AdminPage';
import { useAuth } from '@/hooks/useAuth';
import { signOut } from '@/lib/supabase';
import { toast } from 'sonner';

gsap.registerPlugin(ScrollTrigger);

function App() {
  const { user, profile, loading } = useAuth();

  useEffect(() => {
    // Refresh ScrollTrigger on route change
    ScrollTrigger.refresh();

    // Handle reduced motion preference
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) {
      gsap.globalTimeline.timeScale(0);
    }

    return () => {
      ScrollTrigger.getAll().forEach(trigger => trigger.kill());
    };
  }, []);

  const handleLogout = async () => {
    try {
      await signOut();
      toast.success('Logged out successfully');
    } catch (error) {
      toast.error('Failed to log out');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#030303] flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-[#FF5A65]/20 border-t-[#FF5A65] rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <Router>
      <div className="min-h-screen bg-[#030303] text-white">
        <Navigation
          user={profile ? { username: profile.username, coins: profile.coins } : null}
          onLogout={handleLogout}
        />

        <main>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/library" element={<LibraryPage user={user} />} />
            <Route path="/player" element={<PlayerPage user={user} />} />
            <Route
              path="/rewards"
              element={
                user ? (
                  <RewardsPage user={user} />
                ) : (
                  <Navigate to="/login" replace />
                )
              }
            />
            <Route
              path="/login"
              element={user ? <Navigate to="/" replace /> : <LoginPage />}
            />
            <Route
              path="/register"
              element={user ? <Navigate to="/" replace /> : <RegisterPage />}
            />
            <Route
              path="/admin"
              element={
                user?.email?.includes('admin') ? (
                  <AdminPage user={user} />
                ) : (
                  <Navigate to="/" replace />
                )
              }
            />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>

        <Footer />
        <Toaster position="top-right" theme="dark" />
      </div>
    </Router>
  );
}

export default App;
