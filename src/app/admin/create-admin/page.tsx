'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Shield, KeyRound, ArrowLeft, Check, AlertCircle, Sparkles, Eye, EyeOff } from 'lucide-react';

export default function CreateAdminPage() {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [secretKey, setSecretKey] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [showSecretKey, setShowSecretKey] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage('');
    setError('');

    if (password !== confirmPassword) {
      setError('Mật khẩu xác nhận không khớp');
      return;
    }

    if (password.length < 6) {
      setError('Mật khẩu phải có ít nhất 6 ký tự');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/auth/create-admin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fullName,
          email,
          password,
          secretKey,
        }),
      });

      const data = await res.json();
      if (!data.success) {
        throw new Error(data.error || 'Tạo tài khoản quản trị thất bại');
      }

      setMessage(data.message || 'Tạo tài khoản Quản trị viên thành công!');
      setFullName('');
      setEmail('');
      setPassword('');
      setConfirmPassword('');
      setSecretKey('');
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : 'Đã có lỗi xảy ra';
      setError(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="hero-bg min-h-screen flex items-center justify-center p-4">
      <div className="glass-card max-w-md w-full p-6 sm:p-8 space-y-6 animate-fade-in border-purple-500/30">
        {/* Back Link */}
        <Link
          href="/admin"
          className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-white transition-colors"
        >
          <ArrowLeft size={14} /> Trở về trang Quản trị
        </Link>

        {/* Header */}
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-2xl flex items-center justify-center bg-purple-500/20 text-purple-300 border border-purple-500/30 mx-auto">
            <Shield size={24} />
          </div>
          <h1 className="text-xl font-bold text-white">Khởi Tạo Tài Khoản Quản Trị Viên</h1>
          <p className="text-xs text-slate-400">
            Trang dành riêng để cấp quyền Quản trị viên (Admin) cho hệ thống LogFood
          </p>
        </div>

        {message && (
          <div className="p-3.5 rounded-xl text-xs flex items-center gap-2 border border-emerald-500/30 text-emerald-300 bg-emerald-500/10">
            <Check size={16} className="text-emerald-400 shrink-0" />
            <div>
              <p className="font-bold">{message}</p>
              <Link href="/" className="underline text-cyan-300 mt-1 inline-block">
                Quay về trang chủ để đăng nhập &rarr;
              </Link>
            </div>
          </div>
        )}

        {error && (
          <div className="p-3.5 rounded-xl text-xs flex items-center gap-2 border border-red-500/30 text-red-300 bg-red-500/10">
            <AlertCircle size={16} className="text-red-400 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1">Họ và tên Quản trị viên *</label>
            <input
              required
              type="text"
              placeholder="VD: Quản Trị Viên 1"
              className="input-dark"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1">Email đăng nhập *</label>
            <input
              required
              type="email"
              placeholder="admin@logfood.vn"
              className="input-dark"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
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
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1">Xác nhận mật khẩu *</label>
              <div className="relative">
                <input
                  required
                  type={showConfirmPassword ? 'text' : 'password'}
                  placeholder="Nhập lại mật khẩu"
                  className="input-dark pr-10"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white transition-colors cursor-pointer"
                  title={showConfirmPassword ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}
                >
                  {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>
          </div>

          <div className="pt-2 border-t border-white/10">
            <label className="block text-xs font-medium text-slate-300 mb-1 flex items-center gap-1.5">
              <KeyRound size={13} className="text-purple-400" />
              <span>Mã bảo mật hệ thống (Secret Key) *</span>
            </label>
            <div className="relative">
              <input
                required
                type={showSecretKey ? 'text' : 'password'}
                placeholder="Nhập mã bảo mật hệ thống..."
                className="input-dark pr-10"
                value={secretKey}
                onChange={(e) => setSecretKey(e.target.value)}
              />
              <button
                type="button"
                onClick={() => setShowSecretKey(!showSecretKey)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white transition-colors cursor-pointer"
                title={showSecretKey ? 'Ẩn mã bảo mật' : 'Hiện mã bảo mật'}
              >
                {showSecretKey ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
            <p className="text-[11px] text-slate-400 mt-1">
              Bắt buộc: Chỉ người có mã bảo mật hệ thống mới được phép thêm tài khoản Quản trị viên.
            </p>
          </div>

          <div className="pt-2">
            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full justify-center py-2.5 text-xs font-bold"
              style={{ background: 'linear-gradient(135deg, #a855f7, #7e22ce)' }}
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <Sparkles size={16} /> Xác nhận tạo tài khoản Quản trị viên
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
