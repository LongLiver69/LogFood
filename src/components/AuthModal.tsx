'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { User as UserIcon, LogIn, Sparkles, X, AlertCircle, Scale, Shield, Eye, EyeOff } from 'lucide-react';
import { UserProfile } from '@/types';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialMode?: 'login' | 'register';
  onSuccess: (user: UserProfile) => void;
}

export default function AuthModal({
  isOpen,
  onClose,
  initialMode = 'login',
  onSuccess,
}: AuthModalProps) {
  const [mode, setMode] = useState<'login' | 'register'>(initialMode);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [fullName, setFullName] = useState('');
  const [height, setHeight] = useState('');
  const [weight, setWeight] = useState('');
  const [targetWeight, setTargetWeight] = useState('');
  const [gender, setGender] = useState<'male' | 'female'>('female');
  const [age, setAge] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    setMode(initialMode);
    setError('');
  }, [initialMode, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      if (mode === 'login') {
        const res = await fetch('/api/auth/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, password }),
        });
        const data = await res.json();
        if (!data.success) {
          throw new Error(data.error || 'Đăng nhập không thành công');
        }
        onSuccess(data.data);
        onClose();
      } else {
        const res = await fetch('/api/auth/register', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email,
            password,
            fullName,
            height: height ? Number(height) : undefined,
            weight: weight ? Number(weight) : undefined,
            targetWeight: targetWeight ? Number(targetWeight) : undefined,
            gender,
            age: age ? Number(age) : undefined,
          }),
        });
        const data = await res.json();
        if (!data.success) {
          throw new Error(data.error || 'Đăng ký không thành công');
        }
        onSuccess(data.data);
        onClose();
      }
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : 'Đã có lỗi xảy ra';
      setError(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(8px)' }}>
      <div className="glass-card w-full max-w-md animate-fade-in p-6" style={{ maxHeight: '90vh', overflowY: 'auto' }}>
        <div className="flex items-center justify-between pb-4 border-b border-white/10 mb-5">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #22d3ee, #a855f7)' }}>
              <UserIcon size={18} className="text-white" />
            </div>
            <h2 className="text-base font-bold text-white">
              {mode === 'login' ? 'Đăng Nhập Tài Khoản' : 'Đăng Ký Thành Viên'}
            </h2>
          </div>
          <button onClick={onClose} className="p-1 rounded-lg hover:bg-white/10 text-slate-400 hover:text-white">
            <X size={20} />
          </button>
        </div>

        {/* Tab switch */}
        <div className="grid grid-cols-2 p-1 rounded-xl bg-white/5 mb-5 border border-white/10">
          <button
            type="button"
            onClick={() => { setMode('login'); setError(''); }}
            className={`py-2 text-xs font-bold rounded-lg transition-all ${mode === 'login' ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30' : 'text-slate-400 hover:text-white'}`}
          >
            Đăng nhập
          </button>
          <button
            type="button"
            onClick={() => { setMode('register'); setError(''); }}
            className={`py-2 text-xs font-bold rounded-lg transition-all ${mode === 'register' ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30' : 'text-slate-400 hover:text-white'}`}
          >
            Đăng ký thành viên
          </button>
        </div>

        {error && (
          <div className="p-3 mb-4 rounded-xl text-xs flex items-center gap-2 border border-red-500/30 text-red-300 bg-red-500/10">
            <AlertCircle size={16} className="shrink-0 text-red-400" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-3.5 text-xs">
          {mode === 'register' && (
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1">Họ và tên *</label>
              <input
                required
                type="text"
                placeholder="Ví dụ: Nguyễn Văn A"
                className="input-dark"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
              />
            </div>
          )}

          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1">Email đăng nhập *</label>
            <input
              required
              type="email"
              placeholder="name@example.com"
              className="input-dark"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1">Mật khẩu *</label>
            <div className="relative">
              <input
                required
                type={showPassword ? 'text' : 'password'}
                placeholder="Tối thiểu 6 ký tự"
                className="input-dark pr-10"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white transition-colors cursor-pointer"
                title={showPassword ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          {mode === 'register' && (
            <div className="pt-2 border-t border-white/10">
              <div className="flex items-center gap-1.5 mb-2.5 text-cyan-400 font-semibold text-xs">
                <Scale size={14} />
                <span>Thông tin thể trạng (Tự động tính BMI)</span>
              </div>
              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="block text-[11px] text-slate-400 mb-1">Chiều cao (cm)</label>
                  <input
                    type="number"
                    placeholder="165"
                    className="input-dark"
                    value={height}
                    onChange={(e) => setHeight(e.target.value)}
                  />
                </div>
                <div>
                  <label className="block text-[11px] text-slate-400 mb-1">Cân nặng (kg)</label>
                  <input
                    type="number"
                    placeholder="60"
                    className="input-dark"
                    value={weight}
                    onChange={(e) => setWeight(e.target.value)}
                  />
                </div>
                <div>
                  <label className="block text-[11px] text-slate-400 mb-1">Mục tiêu (kg)</label>
                  <input
                    type="number"
                    placeholder="55"
                    className="input-dark"
                    value={targetWeight}
                    onChange={(e) => setTargetWeight(e.target.value)}
                  />
                </div>
                <div>
                  <label className="block text-[11px] text-slate-400 mb-1">Giới tính</label>
                  <select
                    className="input-dark"
                    value={gender}
                    onChange={(e) => setGender(e.target.value as 'male' | 'female')}
                  >
                    <option value="female" style={{ background: '#1e293b' }}>Nữ</option>
                    <option value="male" style={{ background: '#1e293b' }}>Nam</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          <div className="pt-3">
            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full justify-center py-2.5 text-xs font-bold"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : mode === 'login' ? (
                <>
                  <LogIn size={16} /> Đăng nhập
                </>
              ) : (
                <>
                  <Sparkles size={16} /> Hoàn tất đăng ký
                </>
              )}
            </button>
          </div>

          <div className="pt-2 text-center border-t border-white/5">
            <Link
              href="/admin/create-admin"
              onClick={onClose}
              className="inline-flex items-center gap-1 text-[11px] text-purple-400 hover:text-purple-300 transition-colors"
            >
              <Shield size={12} /> Trang tạo tài khoản Quản trị viên (Admin)
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}
