'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { startOfWeek, addDays, getWeek, getYear } from 'date-fns';
import { Shield, Settings, UserPlus, ArrowRight } from 'lucide-react';
import { DayPlan, UserProfile } from '@/types';
import Navbar from '@/components/Navbar';
import GuestHero from '@/components/GuestHero';
import UserDailyMenu from '@/components/UserDailyMenu';
import AuthModal from '@/components/AuthModal';
import ProfileModal from '@/components/ProfileModal';
import ChangePasswordModal from '@/components/ChangePasswordModal';

function getWeekKey(date: Date) {
  return `${getYear(date)}-W${String(getWeek(date, { weekStartsOn: 1 })).padStart(2, '0')}`;
}

function getWeekDays(weekStart: Date) {
  return Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));
}

export default function HomePage() {
  const router = useRouter();
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);

  // Modals
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authModalMode, setAuthModalMode] = useState<'login' | 'register'>('login');
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [showChangePasswordModal, setShowChangePasswordModal] = useState(false);

  // Planner State
  const [currentWeekStart, setCurrentWeekStart] = useState<Date | null>(null);
  const [dietType, setDietType] = useState<'1000kcal' | '1200kcal'>('1000kcal');
  const [dayPlans, setDayPlans] = useState<DayPlan[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Set week start on client
  useEffect(() => {
    setCurrentWeekStart(startOfWeek(new Date(), { weekStartsOn: 1 }));
  }, []);

  const weekDays = currentWeekStart ? getWeekDays(currentWeekStart) : [];
  const weekKey = currentWeekStart ? getWeekKey(currentWeekStart) : '';

  // Check auth session
  const checkSession = useCallback(async () => {
    try {
      const res = await fetch('/api/auth/me');
      const data = await res.json();
      if (data.success && data.user) {
        setCurrentUser(data.user);
      } else {
        setCurrentUser(null);
      }
    } catch (err) {
      console.error('Session check failed', err);
    } finally {
      setIsCheckingAuth(false);
    }
  }, []);

  useEffect(() => {
    checkSession();
  }, [checkSession]);

  // Tự động phân bổ mức calo theo tuần mà Admin chỉ định cho User (User không tự ý đổi)
  useEffect(() => {
    if (currentUser && currentUser.role !== 'admin' && weekKey) {
      const assignedDiet =
        currentUser.weeklyDietPreferences?.[weekKey] ||
        currentUser.dietPreference ||
        '1000kcal';
      setDietType(assignedDiet);
    }
  }, [currentUser, weekKey]);

  // Auto redirect admin to /admin dashboard
  useEffect(() => {
    if (currentUser?.role === 'admin') {
      router.push('/admin');
    }
  }, [currentUser, router]);

  // Load day plans for current week & current regular user (always fresh)
  const loadDayPlans = useCallback(async (forceRefresh = false) => {
    if (!currentUser || currentUser.role === 'admin' || !weekKey) return;

    try {
      if (forceRefresh) setIsLoading(true);
      const res = await fetch(`/api/dayplans?userId=${currentUser._id}&weekKey=${weekKey}`);
      const data = await res.json();
      if (data.success) {
        setDayPlans(data.data || []);
      }
    } catch (err) {
      console.error('Failed to load day plans', err);
    } finally {
      setIsLoading(false);
    }
  }, [weekKey, currentUser]);

  // Load day plans whenever weekKey or currentUser changes
  useEffect(() => {
    if (currentUser && currentUser.role !== 'admin') {
      loadDayPlans(true);
    }
  }, [currentUser, weekKey, loadDayPlans]);

  // Tự động tải lại thực đơn khi người dùng chuyển lại tab (sau khi Admin vừa lên thực đơn)
  useEffect(() => {
    const handleFocus = () => {
      if (currentUser && currentUser.role !== 'admin') {
        loadDayPlans();
      }
    };
    window.addEventListener('focus', handleFocus);
    return () => window.removeEventListener('focus', handleFocus);
  }, [currentUser, loadDayPlans]);

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
      setCurrentUser(null);
      setDayPlans([]);
    } catch (err) {
      console.error('Logout error', err);
    }
  };

  if (isCheckingAuth) {
    return (
      <div className="hero-bg min-h-screen flex items-center justify-center p-4">
        <div className="w-10 h-10 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="hero-bg min-h-screen pb-16">
      {/* Top Navbar */}
      <Navbar
        currentUser={currentUser}
        dietType={dietType}
        onOpenProfile={() => setShowProfileModal(true)}
        onOpenChangePassword={() => setShowChangePasswordModal(true)}
        onOpenLogin={() => {
          setAuthModalMode('login');
          setShowAuthModal(true);
        }}
        onOpenRegister={() => {
          setAuthModalMode('register');
          setShowAuthModal(true);
        }}
        onLogout={handleLogout}
      />

      {/* Main Content Area */}
      <main className="max-w-screen-2xl mx-auto p-4">
        {!currentUser ? (
          /* Khi chưa đăng nhập: Hiển thị trang giới thiệu, không có thực đơn hay thông tin chi tiết */
          <GuestHero
            onOpenLogin={() => {
              setAuthModalMode('login');
              setShowAuthModal(true);
            }}
            onOpenRegister={() => {
              setAuthModalMode('register');
              setShowAuthModal(true);
            }}
          />
        ) : currentUser.role === 'admin' ? (
          /* Đối với quản trị viên: Chuyển hướng tới trang Quản Trị */
          <div className="max-w-2xl mx-auto py-12 px-4 text-center animate-fade-in">
            <div className="glass-card p-8 sm:p-10 border-purple-500/20">
              <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-5 bg-purple-500/10 text-purple-400 border border-purple-500/20">
                <Shield size={32} />
              </div>
              <h2 className="text-xl sm:text-2xl font-bold text-white mb-2">
                Xin chào Quản trị viên, {currentUser.fullName}!
              </h2>
              <p className="text-sm text-slate-400 mb-8 max-w-lg mx-auto leading-relaxed">
                Tài khoản quản trị viên không có màn hình tự chọn món ăn. Vui lòng chuyển tới bảng điều khiển Quản Trị để quản lý thực đơn dinh dưỡng và lên thực đơn hàng ngày cho các thành viên.
              </p>
              <div className="flex flex-wrap items-center justify-center gap-3">
                <Link
                  href="/admin"
                  className="btn-primary text-xs py-2.5 px-5 flex items-center gap-2 bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-600 hover:to-indigo-700 shadow-lg shadow-purple-500/20"
                >
                  <Settings size={16} />
                  <span>Vào Trang Quản Trị Hệ Thống</span>
                  <ArrowRight size={14} />
                </Link>
                <Link
                  href="/admin/create-admin"
                  className="btn-ghost text-xs py-2.5 px-4 flex items-center gap-1.5 text-purple-300 border-purple-500/30 bg-purple-500/5 hover:bg-purple-500/15"
                >
                  <UserPlus size={16} />
                  <span>Tạo Quản Trị Viên Mới</span>
                </Link>
              </div>
            </div>
          </div>
        ) : (
          /* Khi là thành viên đã đăng nhập: Giao diện trực quan "Hôm nay ăn gì?", định lượng, nguyên liệu và hướng dẫn */
          <UserDailyMenu
            currentWeekStart={currentWeekStart}
            onPrevWeek={() => currentWeekStart && setCurrentWeekStart(addDays(currentWeekStart, -7))}
            onNextWeek={() => currentWeekStart && setCurrentWeekStart(addDays(currentWeekStart, 7))}
            weekDays={weekDays}
            weekKey={weekKey}
            dietType={dietType}
            dayPlans={dayPlans}
            isLoading={isLoading}
            currentUser={currentUser}
            onRefresh={() => loadDayPlans(true)}
          />
        )}
      </main>

      {/* Modals */}
      <AuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        initialMode={authModalMode}
        onSuccess={(u) => {
          setCurrentUser(u);
          const assigned = u.weeklyDietPreferences?.[weekKey] || u.dietPreference || '1000kcal';
          setDietType(assigned);
        }}
      />

      <ProfileModal
        isOpen={showProfileModal}
        onClose={() => setShowProfileModal(false)}
        user={currentUser}
        onUpdateSuccess={(u) => {
          setCurrentUser(u);
          const assigned = u.weeklyDietPreferences?.[weekKey] || u.dietPreference || '1000kcal';
          setDietType(assigned);
        }}
      />

      <ChangePasswordModal
        isOpen={showChangePasswordModal}
        onClose={() => setShowChangePasswordModal(false)}
      />
    </div>
  );
}
