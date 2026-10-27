'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  UtensilsCrossed,
  Scale,
  User as UserIcon,
  Shield,
  KeyRound,
  LogOut,
  LogIn,
  Sparkles,
  Settings,
  ChevronDown,
  Check,
} from 'lucide-react';
import { UserProfile } from '@/types';

interface NavbarProps {
  currentUser: UserProfile | null;
  dietType: string;
  onSelectDietType?: (type: '1000kcal' | '1200kcal') => void;
  saveMessage?: string;
  isSaving?: boolean;
  onOpenProfile: () => void;
  onOpenChangePassword: () => void;
  onOpenLogin: () => void;
  onOpenRegister: () => void;
  onLogout: () => void;
}

export default function Navbar({
  currentUser,
  dietType,
  saveMessage,
  isSaving,
  onOpenProfile,
  onOpenChangePassword,
  onOpenLogin,
  onOpenRegister,
  onLogout,
}: NavbarProps) {
  const [showUserMenu, setShowUserMenu] = useState(false);

  return (
    <header className="sticky top-0 z-40 navbar-solid px-4 py-3">
      <div className="max-w-screen-2xl mx-auto flex items-center justify-between gap-4">
        {/* Logo */}
        <Link href={currentUser?.role === 'admin' ? '/admin' : '/'} className="flex items-center gap-3 group">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center transition-transform group-hover:scale-105" style={{ background: 'linear-gradient(135deg, #22d3ee, #a855f7)' }}>
            <UtensilsCrossed size={20} className="text-white" />
          </div>
          <div>
            <h1 className="text-lg font-bold gradient-text">LogFood</h1>
            <p className="text-[11px] text-slate-400">Quản Lý Chế Độ Dinh Dưỡng</p>
          </div>
        </Link>

        {/* Chế độ dinh dưỡng của user: Chỉ hiển thị do Admin/Bác sĩ cấp quyền, user không được tự chọn */}
        {currentUser && currentUser.role !== 'admin' && (
          <div className="hidden sm:flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-cyan-500/10 border border-cyan-500/25 text-xs text-cyan-300 font-medium">
            <Sparkles size={14} className="text-cyan-400" />
            <span>
              Chế độ dinh dưỡng: <strong className="text-white font-bold uppercase">{dietType}</strong>
              <span className="text-[11px] text-slate-400 ml-1.5 hidden md:inline">(Admin/Bác sĩ chỉ định)</span>
            </span>
          </div>
        )}

        {/* Right Actions */}
        <div className="flex items-center gap-2.5">
          {saveMessage && (
            <span className="text-xs text-emerald-400 flex items-center gap-1 animate-fade-in font-medium">
              <Check size={14} /> {saveMessage}
            </span>
          )}
          {isSaving && <span className="text-xs text-cyan-400 font-medium animate-pulse">Đang lưu...</span>}

          {currentUser ? (
            <div className="flex items-center gap-2 relative">
              {/* Quick Health Pill for regular members */}
              {currentUser.role !== 'admin' && (
                <button
                  onClick={onOpenProfile}
                  className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs bg-white/5 hover:bg-white/10 border border-white/10 transition-all text-slate-300"
                  title="Cập nhật chỉ số BMI, chiều cao, cân nặng"
                >
                  <Scale size={14} className="text-cyan-400" />
                  {currentUser.height && currentUser.weight ? (
                    <span>
                      {currentUser.height}cm • {currentUser.weight}kg
                      {currentUser.bmiInfo && <strong className="ml-1 font-bold" style={{ color: currentUser.bmiInfo.color }}>({currentUser.bmiInfo.status})</strong>}
                    </span>
                  ) : (
                    <span className="text-amber-400 font-medium">Nhập chiều cao, cân nặng</span>
                  )}
                </button>
              )}

              {/* Admin Button directly in navbar if admin */}
              {currentUser.role === 'admin' && (
                <Link
                  href="/admin"
                  className="btn-ghost flex items-center gap-1.5 text-xs py-1.5 px-3 text-purple-300 border-purple-500/30 bg-purple-500/10 hover:bg-purple-500/20"
                >
                  <Settings size={14} />
                  <span className="hidden sm:inline">Quản trị</span>
                </Link>
              )}

              {/* User Dropdown Trigger */}
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setShowUserMenu(!showUserMenu)}
                  className="flex items-center gap-2 px-2.5 py-1.5 rounded-xl bg-white/5 border border-white/10 hover:border-cyan-400/40 transition-all"
                >
                  <div className={`w-6 h-6 rounded-lg flex items-center justify-center text-xs font-bold ${
                    currentUser.role === 'admin' ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30' : 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30'
                  }`}>
                    {currentUser.role === 'admin' ? <Shield size={12} /> : <UserIcon size={12} />}
                  </div>
                  <span className="text-xs font-bold text-white hidden sm:block">{currentUser.fullName}</span>
                  <ChevronDown size={14} className="text-slate-400" />
                </button>

                {/* Dropdown Menu */}
                {showUserMenu && (
                  <div className="absolute right-0 mt-2 w-60 rounded-2xl dropdown-solid p-2 z-50 animate-fade-in">
                    <div className="px-3 py-2 border-b border-white/10 mb-1">
                      <div className="text-xs font-bold text-white truncate">{currentUser.fullName}</div>
                      <div className="text-[11px] text-slate-400 truncate">{currentUser.email}</div>
                      <div className="mt-1">
                        <span className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          currentUser.role === 'admin' ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30' : 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30'
                        }`}>
                          {currentUser.role === 'admin' ? 'Quản trị viên' : 'Thành viên'}
                        </span>
                      </div>
                    </div>

                    <button
                      onClick={() => {
                        setShowUserMenu(false);
                        onOpenProfile();
                      }}
                      className="w-full flex items-center gap-2 px-3 py-2 text-xs rounded-xl text-slate-300 hover:text-white hover:bg-white/10 transition-all"
                    >
                      <UserIcon size={14} />
                      <span>Hồ sơ thể trạng (BMI)</span>
                    </button>

                    <button
                      onClick={() => {
                        setShowUserMenu(false);
                        onOpenChangePassword();
                      }}
                      className="w-full flex items-center gap-2 px-3 py-2 text-xs rounded-xl text-slate-300 hover:text-white hover:bg-white/10 transition-all"
                    >
                      <KeyRound size={14} />
                      <span>Đổi mật khẩu</span>
                    </button>

                    <button
                      onClick={() => {
                        setShowUserMenu(false);
                        onLogout();
                      }}
                      className="w-full flex items-center gap-2 px-3 py-2 text-xs rounded-xl text-red-400 hover:bg-red-500/10 transition-all mt-1 border-t border-white/5"
                    >
                      <LogOut size={14} />
                      <span>Đăng xuất</span>
                    </button>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <button
                onClick={onOpenLogin}
                className="btn-ghost flex items-center gap-1.5 text-xs py-1.5 px-3"
              >
                <LogIn size={14} />
                <span>Đăng nhập</span>
              </button>
              <button
                onClick={onOpenRegister}
                className="btn-primary flex items-center gap-1.5 text-xs py-1.5 px-3"
              >
                <Sparkles size={14} />
                <span className="hidden sm:inline">Đăng ký</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
