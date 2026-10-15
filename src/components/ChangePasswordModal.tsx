'use client';

import { useState } from 'react';
import { KeyRound, X, Check, AlertCircle, Eye, EyeOff } from 'lucide-react';

interface ChangePasswordModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function ChangePasswordModal({ isOpen, onClose }: ChangePasswordModalProps) {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage('');
    setError('');

    if (newPassword !== confirmPassword) {
      setError('Mật khẩu mới xác nhận không khớp');
      return;
    }

    if (newPassword.length < 6) {
      setError('Mật khẩu mới phải có ít nhất 6 ký tự');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/auth/change-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ currentPassword, newPassword }),
      });
      const data = await res.json();
      if (!data.success) {
        throw new Error(data.error || 'Đổi mật khẩu thất bại');
      }

      setMessage(data.message || 'Đã đổi mật khẩu thành công!');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setTimeout(() => {
        setMessage('');
        onClose();
      }, 1500);
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : 'Đã có lỗi xảy ra';
      setError(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(8px)' }}>
      <div className="glass-card w-full max-w-md animate-fade-in p-6">
        <div className="flex items-center justify-between pb-4 border-b border-white/10 mb-5">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center bg-cyan-500/20 text-cyan-400 border border-cyan-500/30">
              <KeyRound size={18} />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">Đổi Mật Khẩu</h2>
              <p className="text-xs text-slate-400">Cập nhật mật khẩu bảo mật tài khoản</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1 rounded-lg hover:bg-white/10 text-slate-400 hover:text-white">
            <X size={20} />
          </button>
        </div>

        {message && (
          <div className="p-3 mb-4 rounded-xl text-xs flex items-center gap-2 border border-emerald-500/30 text-emerald-300 bg-emerald-500/10">
            <Check size={16} className="text-emerald-400" />
            <span>{message}</span>
          </div>
        )}

        {error && (
          <div className="p-3 mb-4 rounded-xl text-xs flex items-center gap-2 border border-red-500/30 text-red-300 bg-red-500/10">
            <AlertCircle size={16} className="text-red-400" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 text-sm">
          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1">Mật khẩu hiện tại *</label>
            <div className="relative">
              <input
                required
                type={showCurrentPassword ? 'text' : 'password'}
                placeholder="Nhập mật khẩu đang dùng"
                className="input-dark pr-10"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
              />
              <button
                type="button"
                onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white transition-colors cursor-pointer"
                title={showCurrentPassword ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}
              >
                {showCurrentPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1">Mật khẩu mới *</label>
            <div className="relative">
              <input
                required
                type={showNewPassword ? 'text' : 'password'}
                placeholder="Tối thiểu 6 ký tự"
                className="input-dark pr-10"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
              />
              <button
                type="button"
                onClick={() => setShowNewPassword(!showNewPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white transition-colors cursor-pointer"
                title={showNewPassword ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}
              >
                {showNewPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1">Xác nhận mật khẩu mới *</label>
            <div className="relative">
              <input
                required
                type={showConfirmPassword ? 'text' : 'password'}
                placeholder="Nhập lại mật khẩu mới"
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

          <div className="pt-2 flex gap-3">
            <button
              type="submit"
              disabled={loading}
              className="btn-primary flex-1 justify-center py-2.5 text-xs font-bold"
            >
              {loading ? 'Đang cập nhật...' : 'Xác nhận đổi mật khẩu'}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="btn-ghost px-4 text-xs font-medium"
            >
              Hủy
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
