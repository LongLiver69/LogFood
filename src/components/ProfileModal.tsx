'use client';

import { useState, useEffect, useMemo } from 'react';
import { Scale, X, Check, AlertCircle } from 'lucide-react';
import { UserProfile } from '@/types';

interface ProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: UserProfile | null;
  onUpdateSuccess: (updatedUser: UserProfile) => void;
}

export default function ProfileModal({
  isOpen,
  onClose,
  user,
  onUpdateSuccess,
}: ProfileModalProps) {
  const [fullName, setFullName] = useState(user?.fullName || '');
  const [email, setEmail] = useState(user?.email || '');
  const [height, setHeight] = useState(user?.height?.toString() || '');
  const [weight, setWeight] = useState(user?.weight?.toString() || '');
  const [targetWeight, setTargetWeight] = useState(user?.targetWeight?.toString() || '');
  const [gender, setGender] = useState<'male' | 'female' | 'other'>(user?.gender || 'female');
  const [age, setAge] = useState(user?.age?.toString() || '');
  const [dietPreference, setDietPreference] = useState<'1000kcal' | '1200kcal'>(user?.dietPreference || '1000kcal');
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (user) {
      setFullName(user.fullName || '');
      setEmail(user.email || '');
      setHeight(user.height ? String(user.height) : '');
      setWeight(user.weight ? String(user.weight) : '');
      setTargetWeight(user.targetWeight ? String(user.targetWeight) : '');
      setGender(user.gender || 'female');
      setAge(user.age ? String(user.age) : '');
      setDietPreference(user.dietPreference || '1000kcal');
    }
  }, [user, isOpen]);

  const liveBmiInfo = useMemo(() => {
    const h = Number(height);
    const w = Number(weight);
    if (!h || !w || h <= 0 || w <= 0) return null;
    const hM = h / 100;
    const bmiVal = Number((w / (hM * hM)).toFixed(1));

    let status = 'Bình thường';
    let color = '#10b981';
    let dietRec: '1000kcal' | '1200kcal' = '1200kcal';
    let advice = 'Chỉ số thể trạng lý tưởng! Bạn nên chọn thực đơn 1200Kcal để duy trì cân nặng ổn định.';

    if (bmiVal < 18.5) {
      status = 'Gầy / Thiếu cân';
      color = '#38bdf8';
      dietRec = '1200kcal';
      advice = 'Bạn đang dưới chuẩn cân nặng. Khuyến nghị áp dụng thực đơn 1200Kcal kết hợp bồi dưỡng.';
    } else if (bmiVal >= 18.5 && bmiVal <= 22.9) {
      status = 'Cân đối (Chuẩn Châu Á)';
      color = '#10b981';
      dietRec = '1200kcal';
      advice = 'Vóc dáng rất cân đối. Chế độ 1200Kcal giúp giữ vóc dáng khỏe khoắn, không mệt mỏi.';
    } else if (bmiVal >= 23.0 && bmiVal <= 24.9) {
      status = 'Tiền béo phì (Thừa cân)';
      color = '#f59e0b';
      dietRec = '1000kcal';
      advice = 'Khuyến nghị áp dụng chế độ dinh dưỡng 1000Kcal để điều chỉnh năng lượng và đưa BMI về ngưỡng chuẩn.';
    } else {
      status = 'Béo phì';
      color = '#ef4444';
      dietRec = '1000kcal';
      advice = 'Khuyến nghị áp dụng chế độ dinh dưỡng 1000Kcal với định lượng chuẩn để cân bằng năng lượng an toàn và hiệu quả.';
    }

    const idealMin = Number((18.5 * hM * hM).toFixed(1));
    const idealMax = Number((22.9 * hM * hM).toFixed(1));

    return {
      bmi: bmiVal,
      status,
      color,
      dietRecommendation: dietRec,
      advice,
      idealWeightMin: idealMin,
      idealWeightMax: idealMax,
    };
  }, [height, weight]);

  if (!isOpen) return null;

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMessage('');
    setError('');

    try {
      const res = await fetch('/api/user/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fullName,
          email: email.trim(),
          height: height ? Number(height) : null,
          weight: weight ? Number(weight) : null,
          targetWeight: targetWeight ? Number(targetWeight) : null,
          gender,
          age: age ? Number(age) : null,
          dietPreference,
        }),
      });

      const data = await res.json();
      if (!data.success) {
        throw new Error(data.error || 'Cập nhật thất bại');
      }

      onUpdateSuccess(data.user);
      setMessage('Đã cập nhật thông tin thành công!');
      setTimeout(() => {
        setMessage('');
        onClose();
      }, 1200);
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : 'Lỗi cập nhật';
      setError(errorMsg);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(8px)' }}>
      <div className="glass-card w-full max-w-lg animate-fade-in p-6" style={{ maxHeight: '90vh', overflowY: 'auto' }}>
        <div className="flex items-center justify-between pb-4 border-b border-white/10 mb-5">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center bg-cyan-500/20 text-cyan-400 border border-cyan-500/30">
              <Scale size={20} />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">Hồ Sơ Sức Khỏe & Thể Trạng</h2>
              <p className="text-xs text-slate-400">Theo dõi chiều cao, cân nặng và chỉ số BMI</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-white/10 text-slate-400 hover:text-white">
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

        {liveBmiInfo ? (
          <div className="p-4 rounded-2xl mb-5 border border-white/10" style={{ background: 'rgba(255,255,255,0.03)' }}>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-slate-400 font-medium">Chỉ số BMI của bạn:</span>
              <span
                className="px-2.5 py-0.5 rounded-full text-xs font-bold"
                style={{ background: `${liveBmiInfo.color}20`, color: liveBmiInfo.color, border: `1px solid ${liveBmiInfo.color}40` }}
              >
                {liveBmiInfo.status}
              </span>
            </div>
            <div className="flex items-baseline gap-2 mb-3">
              <span className="text-3xl font-extrabold text-white">{liveBmiInfo.bmi}</span>
              <span className="text-xs text-slate-400">kg/m²</span>
            </div>

            <div className="space-y-1 mb-3">
              <div className="h-2.5 w-full rounded-full flex overflow-hidden gap-0.5 bg-white/5 p-0.5 border border-white/10">
                <div className="h-full rounded-l-full bg-sky-400" style={{ width: '25%' }} title="Gầy (<18.5)" />
                <div className="h-full bg-emerald-400" style={{ width: '35%' }} title="Chuẩn (18.5 - 22.9)" />
                <div className="h-full bg-amber-400" style={{ width: '20%' }} title="Thừa cân (23 - 24.9)" />
                <div className="h-full rounded-r-full bg-red-400" style={{ width: '20%' }} title="Béo phì (>=25)" />
              </div>
              <div className="flex justify-between text-[10px] text-slate-500">
                <span>&lt; 18.5 (Gầy)</span>
                <span>18.5 - 22.9 (Chuẩn)</span>
                <span>23 - 24.9</span>
                <span>&ge; 25 (Béo)</span>
              </div>
            </div>

            <div className="text-xs text-slate-300 bg-white/5 p-3 rounded-xl border border-white/5 space-y-1.5">
              <p className="leading-relaxed">{liveBmiInfo.advice}</p>
              <div className="flex items-center justify-between pt-1 border-t border-white/5 text-[11px] text-slate-400">
                <span>Cân nặng lý tưởng: <strong className="text-cyan-300">{liveBmiInfo.idealWeightMin} - {liveBmiInfo.idealWeightMax} kg</strong></span>
                <span>Khuyến nghị: <strong className="text-orange-400">{liveBmiInfo.dietRecommendation}</strong></span>
              </div>
            </div>
          </div>
        ) : (
          <div className="p-4 rounded-xl mb-5 text-center text-xs text-slate-400 border border-dashed border-white/10">
            Nhập chiều cao và cân nặng để hệ thống tự động tính chỉ số BMI và gợi ý thực đơn phù hợp.
          </div>
        )}

        <form onSubmit={handleSave} className="space-y-3.5 text-xs">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1">Họ và tên *</label>
              <input
                required
                type="text"
                className="input-dark"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1">Địa chỉ Email *</label>
              <input
                required
                type="email"
                className="input-dark"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1">
                Chiều cao (cm) {user?.role !== 'admin' && '*'}
              </label>
              <input
                required={user?.role !== 'admin'}
                type="number"
                step="0.1"
                placeholder="Ví dụ: 168"
                className="input-dark"
                value={height}
                onChange={(e) => setHeight(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1">
                Cân nặng hiện tại (kg) {user?.role !== 'admin' && '*'}
              </label>
              <input
                required={user?.role !== 'admin'}
                type="number"
                step="0.1"
                placeholder="Ví dụ: 62.5"
                className="input-dark"
                value={weight}
                onChange={(e) => setWeight(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1">Cân nặng mục tiêu (kg)</label>
              <input
                type="number"
                step="0.1"
                placeholder="Ví dụ: 55"
                className="input-dark"
                value={targetWeight}
                onChange={(e) => setTargetWeight(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1">Tuổi</label>
              <input
                type="number"
                placeholder="Ví dụ: 25"
                className="input-dark"
                value={age}
                onChange={(e) => setAge(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1">Giới tính</label>
              <select
                className="input-dark"
                value={gender}
                onChange={(e) => setGender(e.target.value as 'male' | 'female' | 'other')}
              >
                <option value="female" style={{ background: '#1e293b' }}>Nữ</option>
                <option value="male" style={{ background: '#1e293b' }}>Nam</option>
                <option value="other" style={{ background: '#1e293b' }}>Khác</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1">Thực đơn ưu tiên</label>
              <select
                className="input-dark"
                value={dietPreference}
                onChange={(e) => setDietPreference(e.target.value as '1000kcal' | '1200kcal')}
              >
                <option value="1000kcal" style={{ background: '#1e293b' }}>1000 kcal (Kiểm soát năng lượng)</option>
                <option value="1200kcal" style={{ background: '#1e293b' }}>1200 kcal (Cân bằng năng lượng)</option>
              </select>
            </div>
          </div>

          <div className="pt-3 flex gap-3">
            <button
              type="submit"
              disabled={saving}
              className="btn-primary flex-1 justify-center py-2.5 text-xs font-bold"
            >
              {saving ? 'Đang lưu...' : 'Lưu hồ sơ thể trạng'}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="btn-ghost px-5 text-xs font-medium"
            >
              Đóng
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
