'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { User as UserIcon, LogIn, Sparkles, X, AlertCircle, CheckCircle, Scale, Shield, Eye, EyeOff } from 'lucide-react';
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
  const [successMessage, setSuccessMessage] = useState('');

  useEffect(() => {
    setMode(initialMode);
    setError('');
    setSuccessMessage('');
  }, [initialMode, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccessMessage('');

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

        // Đăng ký thành công - yêu cầu Admin phê duyệt mới được đăng nhập
        setSuccessMessage(data.message || 'Đăng ký thành công! Tài khoản của bạn đang chờ Quản trị viên duyệt để có thể đăng nhập.');
        setMode('login');
        setPassword('');
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
            onClick={() => { setMode('login'); setError(''); setSuccessMessage(''); }}
            className={`py-2 text-xs font-bold rounded-lg transition-all ${mode === 'login' ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30' : 'text-slate-400 hover:text-white'}`}
          >
            Đăng nhập
          </button>
          <button
            type="button"
            onClick={() => { setMode('register'); setError(''); setSuccessMessage(''); }}
            className={`py-2 text-xs font-bold rounded-lg transition-all ${mode === 'register' ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30' : 'text-slate-400 hover:text-white'}`}
          >
            Đăng ký thành viên
          </button>
        </div>

        {successMessage && (
          <div className="p-3 mb-4 rounded-xl text-xs flex items-start gap-2 border border-emerald-500/30 text-emerald-300 bg-emerald-500/10">
            <CheckCircle size={16} className="shrink-0 text-emerald-400 mt-0.5" />
            <span>{successMessage}</span>
          </div>
        )}

        {error && (
          <div className="p-3 mb-4 rounded-xl text-xs flex items-start gap-2 border border-red-500/30 text-red-300 bg-red-500/10">
            <AlertCircle size={16} className="shrink-0 text-red-400 mt-0.5" />
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
              placeholder="tenban@email.com"
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
            <>
              <div className="pt-2 border-t border-white/10">
                <div className="text-xs font-semibold text-cyan-400 flex items-center gap-1.5 mb-2.5">
                  <Scale size={14} />
                  <span>Thông tin thể trạng (Tính toán BMI)</span>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] text-slate-400 mb-1">Chiều cao (cm)</label>
                    <input
                      type="number"
                      step="0.5"
                      placeholder="VD: 165"
                      className="input-dark"
                      value={height}
                      onChange={(e) => setHeight(e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] text-slate-400 mb-1">Cân nặng (kg)</label>
                    <input
                      type="number"
                      step="0.1"
                      placeholder="VD: 60"
                      className="input-dark"
                      value={weight}
                      onChange={(e) => setWeight(e.target.value)}
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] text-slate-400 mb-1">Mục tiêu cân nặng (kg)</label>
                  <input
                    type="number"
                    step="0.1"
                    placeholder="VD: 55"
                    className="input-dark"
                    value={targetWeight}
                    onChange={(e) => setTargetWeight(e.target.value)}
                  />
                </div>
                <div>
                  <label className="block text-[11px] text-slate-400 mb-1">Tuổi</label>
                  <input
                    type="number"
                    placeholder="VD: 25"
                    className="input-dark"
                    value={age}
                    onChange={(e) => setAge(e.target.value)}
                  />
                </div>
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

              <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-[11px] text-amber-300 flex items-center gap-2">
                <Shield size={14} className="shrink-0 text-amber-400" />
                <span>Lưu ý: Tài khoản sau khi đăng ký cần được Quản trị viên phê duyệt trước khi đăng nhập.</span>
              </div>
            </>
          )}

          <div className="pt-2">
            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full justify-center py-2.5 text-xs font-bold"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : mode === 'login' ? (
                <>
                  <LogIn size={15} /> Đăng nhập
                </>
              ) : (
                <>
                  <Sparkles size={15} /> Đăng ký tài khoản
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
