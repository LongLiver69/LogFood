'use client';

import { useState, useEffect, useCallback, useMemo, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import {
  ArrowLeft,
  Activity,
  Calendar,
  Plus,
  Edit2,
  Trash2,
  Check,
  X,
  User,
  Scale,
  Sparkles,
  Layers,
  ChevronRight,
  TrendingDown,
  TrendingUp,
  FileSpreadsheet,
  BarChart2,
} from 'lucide-react';
import { BodyMetricWeek, BodyMetricDoc, UserProfile } from '@/types';
import BodyMetricsChart, { METRIC_OPTIONS, MetricConfig } from '@/components/BodyMetricsChart';

interface MemberItem {
  _id: string;
  fullName: string;
  email: string;
}

function BodyMetricsContent() {
  const searchParams = useSearchParams();
  const initialUserId = searchParams.get('userId');

  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);

  // Data state
  const [selectedUserId, setSelectedUserId] = useState<string>(initialUserId || '');
  const [membersList, setMembersList] = useState<MemberItem[]>([]);
  const [targetUser, setTargetUser] = useState<{
    _id?: string;
    fullName: string;
    email: string;
    height?: number;
    weight?: number;
  } | null>(null);
  const [metricDoc, setMetricDoc] = useState<BodyMetricDoc | null>(null);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');

  // View state
  const [viewMode, setViewMode] = useState<'cards' | 'table'>('cards');
  const [selectedWeekNumber, setSelectedWeekNumber] = useState<number>(1);
  const [selectedChartMetric, setSelectedChartMetric] = useState<MetricConfig>(METRIC_OPTIONS[0]);

  // Admin form modal state
  const [showFormModal, setShowFormModal] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [formData, setFormData] = useState<BodyMetricWeek>({
    weekNumber: 1,
    examDate: new Date().toISOString().split('T')[0],
    height: undefined,
    weight: undefined,
    bmi: undefined,
    waist: undefined,
    abdomen: undefined,
    hip: undefined,
    buttocks: undefined,
    waistHipRatio: undefined,
    bodyFatPercentage: undefined,
    visceralFatPercentage: undefined,
    visceralFatLevel: undefined,
    subcutaneousFatPercentage: undefined,
    muscleMass: undefined,
    skeletalMuscleMass: undefined,
    bodyWater: undefined,
    bmr: undefined,
    bodyScore: undefined,
    notes: '',
  });

  // Check authentication
  useEffect(() => {
    async function checkAuth() {
      try {
        const res = await fetch('/api/auth/me');
        const json = await res.json();
        if (json.success && json.user) {
          setCurrentUser(json.user);
          if (!initialUserId) {
            setSelectedUserId(json.user._id);
          }
        }
      } catch (err) {
        console.error(err);
      } finally {
        setIsCheckingAuth(false);
      }
    }
    checkAuth();
  }, [initialUserId]);

  // Load metrics data
  const loadMetrics = useCallback(async () => {
    if (!currentUser) return;
    setLoading(true);
    try {
      const url = currentUser.role === 'admin' && selectedUserId
        ? `/api/body-metrics?userId=${selectedUserId}`
        : `/api/body-metrics`;

      const res = await fetch(url);
      const json = await res.json();
      if (json.success) {
        setMetricDoc(json.data);
        setTargetUser(json.targetUser);
        if (json.membersList && json.membersList.length > 0) {
          setMembersList(json.membersList);
          if (!selectedUserId && json.targetUser?._id) {
            setSelectedUserId(json.targetUser._id);
          }
        }

        // Chọn tuần mới nhất có sẵn
        if (json.data?.weeks && json.data.weeks.length > 0) {
          const latestWeek = json.data.weeks[json.data.weeks.length - 1];
          setSelectedWeekNumber(latestWeek.weekNumber);
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [currentUser, selectedUserId]);

  useEffect(() => {
    if (currentUser) {
      loadMetrics();
    }
  }, [currentUser, selectedUserId, loadMetrics]);

  const weeksList = metricDoc?.weeks || [];
  const activeWeekData = weeksList.find((w) => w.weekNumber === selectedWeekNumber) || weeksList[0];

  // Quick stats comparison (latest vs first week)
  const quickStats = useMemo(() => {
    if (weeksList.length === 0) return null;
    const first = weeksList[0];
    const latest = weeksList[weeksList.length - 1];

    const calcDiff = (curr?: number, initial?: number) => {
      if (curr === undefined || initial === undefined) return null;
      return Math.round((curr - initial) * 10) / 10;
    };

    return {
      latestWeight: latest.weight,
      diffWeight: calcDiff(latest.weight, first.weight),
      latestFat: latest.bodyFatPercentage,
      diffFat: calcDiff(latest.bodyFatPercentage, first.bodyFatPercentage),
      latestMuscle: latest.muscleMass,
      diffMuscle: calcDiff(latest.muscleMass, first.muscleMass),
      latestWaist: latest.waist,
      diffWaist: calcDiff(latest.waist, first.waist),
      latestBmi: latest.bmi,
    };
  }, [weeksList]);

  // Open Form to Add New Week
  const handleAddNewWeek = () => {
    const nextWeekNum = weeksList.length > 0 ? Math.max(...weeksList.map((w) => w.weekNumber)) + 1 : 1;
    const lastWeek = weeksList.length > 0 ? weeksList[weeksList.length - 1] : null;

    setFormData({
      weekNumber: nextWeekNum,
      examDate: new Date().toISOString().split('T')[0],
      height: lastWeek?.height || targetUser?.height || undefined,
      weight: lastWeek?.weight || targetUser?.weight || undefined,
      bmi: lastWeek?.bmi || undefined,
      waist: lastWeek?.waist || undefined,
      abdomen: lastWeek?.abdomen || undefined,
      hip: lastWeek?.hip || undefined,
      buttocks: lastWeek?.buttocks || undefined,
      waistHipRatio: lastWeek?.waistHipRatio || undefined,
      bodyFatPercentage: lastWeek?.bodyFatPercentage || undefined,
      visceralFatPercentage: lastWeek?.visceralFatPercentage || undefined,
      visceralFatLevel: lastWeek?.visceralFatLevel || undefined,
      subcutaneousFatPercentage: lastWeek?.subcutaneousFatPercentage || undefined,
      muscleMass: lastWeek?.muscleMass || undefined,
      skeletalMuscleMass: lastWeek?.skeletalMuscleMass || undefined,
      bodyWater: lastWeek?.bodyWater || undefined,
      bmr: lastWeek?.bmr || undefined,
      bodyScore: lastWeek?.bodyScore || undefined,
      notes: '',
    });
    setShowFormModal(true);
  };

  // Open Form to Edit specific Week
  const handleEditWeek = (wk: BodyMetricWeek) => {
    setFormData({ ...wk });
    setShowFormModal(true);
  };

  // Delete Week (Admin only)
  const handleDeleteWeek = async (weekNum: number) => {
    if (!confirm(`Bạn có chắc muốn xóa dữ liệu Tuần ${weekNum}?`)) return;
    try {
      const res = await fetch(`/api/body-metrics?userId=${selectedUserId}&weekNumber=${weekNum}`, {
        method: 'DELETE',
      });
      const json = await res.json();
      if (json.success) {
        setMessage(`Đã xóa dữ liệu Tuần ${weekNum}!`);
        setTimeout(() => setMessage(''), 2500);
        loadMetrics();
      } else {
        alert(json.error || 'Không thể xóa');
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Auto-calculate BMI & Waist-to-Hip ratio in form
  const handleHeightWeightChange = (newHeight?: number, newWeight?: number) => {
    const h = newHeight !== undefined ? newHeight : formData.height;
    const w = newWeight !== undefined ? newWeight : formData.weight;
    let newBmi = formData.bmi;
    if (h && w && h > 0 && w > 0) {
      const hm = h / 100;
      newBmi = Math.round((w / (hm * hm)) * 10) / 10;
    }
    setFormData((prev) => ({
      ...prev,
      height: newHeight !== undefined ? newHeight : prev.height,
      weight: newWeight !== undefined ? newWeight : prev.weight,
      bmi: newBmi,
    }));
  };

  const handleWaistHipChange = (newWaist?: number, newHip?: number) => {
    const waist = newWaist !== undefined ? newWaist : formData.waist;
    const hip = newHip !== undefined ? newHip : formData.hip;
    let newRatio = formData.waistHipRatio;
    if (waist && hip && waist > 0 && hip > 0) {
      newRatio = Math.round((waist / hip) * 100) / 100;
    }
    setFormData((prev) => ({
      ...prev,
      waist: newWaist !== undefined ? newWaist : prev.waist,
      hip: newHip !== undefined ? newHip : prev.hip,
      waistHipRatio: newRatio,
    }));
  };

  // Save Form Data (Admin only)
  const handleSaveWeek = async () => {
    if (!selectedUserId) {
      alert('Vui lòng chọn thành viên cần cập nhật');
      return;
    }

    setIsSaving(true);
    try {
      const res = await fetch('/api/body-metrics', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: selectedUserId,
          weekData: formData,
        }),
      });
      const json = await res.json();
      if (json.success) {
        setMessage(`Đã lưu thành công dữ liệu Tuần ${formData.weekNumber}!`);
        setShowFormModal(false);
        setTimeout(() => setMessage(''), 2500);
        await loadMetrics();
      } else {
        alert(json.error || 'Không thể lưu chỉ số');
      }
    } catch (err) {
      console.error(err);
      alert('Đã có lỗi xảy ra khi lưu');
    } finally {
      setIsSaving(false);
    }
  };

  if (isCheckingAuth) {
    return (
      <div className="hero-bg min-h-screen flex items-center justify-center p-4">
        <div className="w-10 h-10 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!currentUser) {
    return (
      <div className="hero-bg min-h-screen flex items-center justify-center p-4">
        <div className="glass-card max-w-md w-full p-8 text-center space-y-4">
          <Activity size={48} className="mx-auto text-cyan-400" />
          <h2 className="text-xl font-bold text-white">Yêu Cầu Đăng Nhập</h2>
          <p className="text-sm text-slate-400">
            Vui lòng đăng nhập để theo dõi bảng chỉ số cơ thể và biểu đồ tiến độ.
          </p>
          <Link href="/" className="btn-primary text-xs py-2.5 justify-center block">
            Về Trang Chủ Đăng Nhập
          </Link>
        </div>
      </div>
    );
  }

  const isAdmin = currentUser.role === 'admin';

  return (
    <div className="hero-bg min-h-screen pb-16">
      {/* Top Navbar Header */}
      <header className="sticky top-0 z-40 navbar-solid px-3.5 sm:px-4 py-2.5 sm:py-3 border-b border-white/10">
        <div className="max-w-6xl mx-auto flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <Link
              href={isAdmin ? '/admin' : '/'}
              className="p-1.5 sm:p-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition-colors shrink-0"
              title={isAdmin ? 'Về trang quản trị' : 'Về trang chủ'}
            >
              <ArrowLeft size={18} />
            </Link>
            <div className="w-8 h-8 rounded-xl flex items-center justify-center bg-gradient-to-br from-cyan-500 to-purple-600 text-white shadow-lg shadow-cyan-500/20 shrink-0">
              <Activity size={16} />
            </div>
            <div className="flex items-center gap-2">
              <h1 className="text-sm sm:text-base font-bold text-white whitespace-nowrap">
                Chỉ Số Cơ Thể
              </h1>
              {isAdmin && (
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-purple-500/20 text-purple-300 border border-purple-500/30 whitespace-nowrap">
                  ADMIN
                </span>
              )}
            </div>
          </div>

          {/* Right Header: Notification toast & Desktop member switcher */}
          <div className="flex items-center gap-2">
            {message && (
              <span className="text-xs text-emerald-400 flex items-center gap-1 font-medium animate-fade-in bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/20 whitespace-nowrap">
                <Check size={14} /> {message}
              </span>
            )}

            {isAdmin && membersList.length > 0 && (
              <div className="hidden sm:flex items-center gap-1.5 bg-white/5 border border-purple-500/30 rounded-xl px-2.5 py-1 text-xs">
                <User size={13} className="text-purple-400 shrink-0" />
                <select
                  value={selectedUserId}
                  onChange={(e) => setSelectedUserId(e.target.value)}
                  className="bg-transparent text-white text-xs font-bold outline-none cursor-pointer max-w-[180px]"
                  title="Chọn thành viên"
                >
                  {membersList.map((m) => (
                    <option key={m._id} value={m._id} style={{ background: '#1e293b' }}>
                      {m.fullName}
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="max-w-6xl mx-auto p-3 sm:p-5 space-y-4 sm:space-y-5 animate-fade-in">
        {/* Member Banner & Admin Actions */}
        <div className="glass-card p-3.5 sm:p-5 border-cyan-500/20 shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-pulse shrink-0"></span>
              <h2 className="text-base sm:text-lg font-bold text-white">
                {targetUser ? targetUser.fullName : currentUser.fullName}
              </h2>
            </div>

            {/* Mobile Member Switcher for Admin */}
            {isAdmin && membersList.length > 0 && (
              <div className="sm:hidden flex items-center gap-2 pt-1">
                <span className="text-xs text-slate-400 font-medium shrink-0">Chọn thành viên:</span>
                <div className="flex items-center gap-1.5 bg-white/5 border border-purple-500/30 rounded-xl px-2.5 py-1 text-xs flex-1">
                  <User size={13} className="text-purple-400 shrink-0" />
                  <select
                    value={selectedUserId}
                    onChange={(e) => setSelectedUserId(e.target.value)}
                    className="bg-transparent text-white text-xs font-bold outline-none cursor-pointer w-full"
                  >
                    {membersList.map((m) => (
                      <option key={m._id} value={m._id} style={{ background: '#1e293b' }}>
                        {m.fullName}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            )}
          </div>

          {/* Action buttons: Add week for Admin & View mode toggle */}
          <div className="flex flex-col sm:flex-row sm:items-center gap-2 w-full sm:w-auto">
            {/* View mode toggle */}
            <div className="grid grid-cols-2 sm:flex rounded-xl p-1 gap-1 bg-white/5 border border-white/10 w-full sm:w-auto">
              <button
                onClick={() => setViewMode('cards')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                  viewMode === 'cards'
                    ? 'bg-cyan-500 text-slate-900 shadow-lg'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <BarChart2 size={14} />
                <span>Theo tuần</span>
              </button>
              <button
                onClick={() => setViewMode('table')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                  viewMode === 'table'
                    ? 'bg-cyan-500 text-slate-900 shadow-lg'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <FileSpreadsheet size={14} />
                <span>Bảng 4 tuần</span>
              </button>
            </div>

            {isAdmin && (
              <button
                onClick={handleAddNewWeek}
                className="btn-primary text-xs py-2 px-3.5 flex items-center justify-center gap-1.5 bg-gradient-to-r from-purple-500 to-indigo-600 shadow-purple-500/20 whitespace-nowrap w-full sm:w-auto"
              >
                <Plus size={15} />
                <span>Nhập tuần mới</span>
              </button>
            )}
          </div>
        </div>

        {/* Quick Glance Highlights Cards (Mobile-friendly) */}
        {quickStats && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-3.5">
            {/* Cân nặng */}
            <div className="glass-card p-3.5 rounded-2xl border-white/10">
              <div className="text-[11px] text-slate-400 font-semibold mb-1">Cân nặng hiện tại</div>
              <div className="text-xl font-black text-white">
                {quickStats.latestWeight !== undefined ? `${quickStats.latestWeight}` : '--'}
                <span className="text-xs font-semibold text-slate-400 ml-1">kg</span>
              </div>
              {quickStats.diffWeight !== null && (
                <div
                  className={`text-[11px] font-bold mt-1 inline-flex items-center gap-0.5 ${
                    quickStats.diffWeight < 0
                      ? 'text-emerald-400'
                      : quickStats.diffWeight > 0
                      ? 'text-amber-400'
                      : 'text-slate-400'
                  }`}
                >
                  {quickStats.diffWeight < 0 ? '↓ Giảm ' : quickStats.diffWeight > 0 ? '↑ Tăng ' : ''}
                  {Math.abs(quickStats.diffWeight)} kg
                </div>
              )}
            </div>

            {/* Tỷ lệ mỡ */}
            <div className="glass-card p-3.5 rounded-2xl border-white/10">
              <div className="text-[11px] text-slate-400 font-semibold mb-1">Tỷ lệ mỡ cơ thể</div>
              <div className="text-xl font-black text-orange-400">
                {quickStats.latestFat !== undefined ? `${quickStats.latestFat}` : '--'}
                <span className="text-xs font-semibold text-slate-400 ml-1">%</span>
              </div>
              {quickStats.diffFat !== null && (
                <div
                  className={`text-[11px] font-bold mt-1 inline-flex items-center gap-0.5 ${
                    quickStats.diffFat < 0
                      ? 'text-emerald-400'
                      : quickStats.diffFat > 0
                      ? 'text-amber-400'
                      : 'text-slate-400'
                  }`}
                >
                  {quickStats.diffFat < 0 ? '↓ Giảm ' : quickStats.diffFat > 0 ? '↑ Tăng ' : ''}
                  {Math.abs(quickStats.diffFat)}%
                </div>
              )}
            </div>

            {/* Lượng cơ */}
            <div className="glass-card p-3.5 rounded-2xl border-white/10">
              <div className="text-[11px] text-slate-400 font-semibold mb-1">Lượng cơ</div>
              <div className="text-xl font-black text-emerald-400">
                {quickStats.latestMuscle !== undefined ? `${quickStats.latestMuscle}` : '--'}
                <span className="text-xs font-semibold text-slate-400 ml-1">kg</span>
              </div>
              {quickStats.diffMuscle !== null && (
                <div
                  className={`text-[11px] font-bold mt-1 inline-flex items-center gap-0.5 ${
                    quickStats.diffMuscle > 0
                      ? 'text-emerald-400'
                      : quickStats.diffMuscle < 0
                      ? 'text-amber-400'
                      : 'text-slate-400'
                  }`}
                >
                  {quickStats.diffMuscle > 0 ? '↑ Tăng ' : quickStats.diffMuscle < 0 ? '↓ Giảm ' : ''}
                  {Math.abs(quickStats.diffMuscle)} kg
                </div>
              )}
            </div>

            {/* Vòng eo */}
            <div className="glass-card p-3.5 rounded-2xl border-white/10">
              <div className="text-[11px] text-slate-400 font-semibold mb-1">Vòng eo</div>
              <div className="text-xl font-black text-rose-400">
                {quickStats.latestWaist !== undefined ? `${quickStats.latestWaist}` : '--'}
                <span className="text-xs font-semibold text-slate-400 ml-1">cm</span>
              </div>
              {quickStats.diffWaist !== null && (
                <div
                  className={`text-[11px] font-bold mt-1 inline-flex items-center gap-0.5 ${
                    quickStats.diffWaist < 0
                      ? 'text-emerald-400'
                      : quickStats.diffWaist > 0
                      ? 'text-amber-400'
                      : 'text-slate-400'
                  }`}
                >
                  {quickStats.diffWaist < 0 ? '↓ Giảm ' : quickStats.diffWaist > 0 ? '↑ Tăng ' : ''}
                  {Math.abs(quickStats.diffWaist)} cm
                </div>
              )}
            </div>
          </div>
        )}

        {/* Biểu Đồ Dạng Line (Interactive Line Chart) */}
        {weeksList.length > 0 && (
          <BodyMetricsChart
            weeks={weeksList}
            selectedMetric={selectedChartMetric}
            onSelectMetric={(cfg) => setSelectedChartMetric(cfg)}
          />
        )}

        {/* Content Section based on view mode */}
        {loading ? (
          <div className="glass-card p-16 text-center text-slate-400">
            <div className="w-10 h-10 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
            <p className="text-sm">Đang tải chỉ số cơ thể...</p>
          </div>
        ) : weeksList.length === 0 ? (
          <div className="glass-card p-12 text-center text-slate-400 space-y-3">
            <Activity size={40} className="mx-auto text-slate-500 opacity-40" />
            <h3 className="text-base font-bold text-white">Chưa Có Dữ Liệu Chỉ Số Cơ Thể</h3>
            <p className="text-xs text-slate-400 max-w-sm mx-auto">
              {isAdmin
                ? 'Hãy bấm nút "Nhập tuần mới" ở trên để nhập các chỉ số khám định kỳ cho thành viên này.'
                : 'Bác sĩ / Quản trị viên sẽ tiến hành đo đạc và cập nhật các chỉ số cơ thể cho bạn sau mỗi buổi khám.'}
            </p>
            {isAdmin && (
              <button
                onClick={handleAddNewWeek}
                className="btn-primary text-xs py-2 px-4 inline-flex items-center gap-1.5"
              >
                <Plus size={14} /> Nhập chỉ số Tuần 1
              </button>
            )}
          </div>
        ) : viewMode === 'cards' ? (
          /* VIEW MODE 1: THEO TUẦN (CARD-BASED, TỐI ƯU TUYỆT VỜI CHO MOBILE) */
          <div className="space-y-4">
            {/* Week Pills Bar */}
            <div className="flex items-center justify-between gap-3 overflow-x-auto pb-1 scrollbar-none">
              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-400 font-semibold shrink-0">Chọn tuần:</span>
                <div className="flex items-center gap-1.5">
                  {weeksList.map((wk) => (
                    <button
                      key={wk.weekNumber}
                      onClick={() => setSelectedWeekNumber(wk.weekNumber)}
                      className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                        selectedWeekNumber === wk.weekNumber
                          ? 'bg-cyan-500 text-slate-900 shadow-lg shadow-cyan-500/25'
                          : 'bg-white/5 text-slate-300 hover:text-white border border-white/5'
                      }`}
                    >
                      Tuần {wk.weekNumber}
                    </button>
                  ))}
                </div>
              </div>

              {isAdmin && activeWeekData && (
                <div className="flex items-center gap-1.5 shrink-0">
                  <button
                    onClick={() => handleEditWeek(activeWeekData)}
                    className="btn-ghost text-xs py-1 px-2.5 text-cyan-300 border-cyan-500/30 bg-cyan-500/10 hover:bg-cyan-500/20 flex items-center gap-1"
                  >
                    <Edit2 size={12} /> Sửa tuần {activeWeekData.weekNumber}
                  </button>
                  {weeksList.length > 1 && (
                    <button
                      onClick={() => handleDeleteWeek(activeWeekData.weekNumber)}
                      className="p-1.5 rounded-lg text-red-400 hover:bg-red-500/10 border border-red-500/30 transition-colors"
                      title="Xóa tuần này"
                    >
                      <Trash2 size={13} />
                    </button>
                  )}
                </div>
              )}
            </div>

            {/* Detailed Cards for Active Week */}
            {activeWeekData && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Nhóm 1: Thông số cơ bản & BMI */}
                <div className="glass-card p-4 rounded-2xl border-white/10 space-y-3">
                  <h4 className="text-xs font-bold text-cyan-400 uppercase tracking-wider flex items-center gap-2 border-b border-white/5 pb-2">
                    <Scale size={15} /> Thông số cơ bản &amp; BMI
                  </h4>
                  <div className="grid grid-cols-2 gap-2.5 text-xs">
                    <div className="p-2.5 rounded-xl bg-black/20">
                      <span className="text-slate-400 block text-[11px]">Ngày khám:</span>
                      <strong className="text-white font-bold">{activeWeekData.examDate || '--'}</strong>
                    </div>
                    <div className="p-2.5 rounded-xl bg-black/20">
                      <span className="text-slate-400 block text-[11px]">Chiều cao:</span>
                      <strong className="text-white font-bold">
                        {activeWeekData.height ? `${activeWeekData.height} cm` : '--'}
                      </strong>
                    </div>
                    <div className="p-2.5 rounded-xl bg-black/20">
                      <span className="text-slate-400 block text-[11px]">Cân nặng:</span>
                      <strong className="text-cyan-300 font-bold">
                        {activeWeekData.weight ? `${activeWeekData.weight} kg` : '--'}
                      </strong>
                    </div>
                    <div className="p-2.5 rounded-xl bg-black/20">
                      <span className="text-slate-400 block text-[11px]">Chỉ số BMI:</span>
                      <strong className="text-purple-300 font-bold">
                        {activeWeekData.bmi ? `${activeWeekData.bmi} kg/m²` : '--'}
                      </strong>
                    </div>
                  </div>
                </div>

                {/* Nhóm 2: Số đo các vòng */}
                <div className="glass-card p-4 rounded-2xl border-white/10 space-y-3">
                  <h4 className="text-xs font-bold text-rose-400 uppercase tracking-wider flex items-center gap-2 border-b border-white/5 pb-2">
                    <Layers size={15} /> Số đo các vòng cơ thể
                  </h4>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 text-xs">
                    <div className="p-2.5 rounded-xl bg-black/20">
                      <span className="text-slate-400 block text-[11px]">Vòng eo:</span>
                      <strong className="text-rose-300 font-bold">
                        {activeWeekData.waist ? `${activeWeekData.waist} cm` : '--'}
                      </strong>
                    </div>
                    <div className="p-2.5 rounded-xl bg-black/20">
                      <span className="text-slate-400 block text-[11px]">Vòng bụng:</span>
                      <strong className="text-white font-bold">
                        {activeWeekData.abdomen ? `${activeWeekData.abdomen} cm` : '--'}
                      </strong>
                    </div>
                    <div className="p-2.5 rounded-xl bg-black/20">
                      <span className="text-slate-400 block text-[11px]">Vòng hông:</span>
                      <strong className="text-white font-bold">
                        {activeWeekData.hip ? `${activeWeekData.hip} cm` : '--'}
                      </strong>
                    </div>
                    <div className="p-2.5 rounded-xl bg-black/20">
                      <span className="text-slate-400 block text-[11px]">Vòng mông:</span>
                      <strong className="text-white font-bold">
                        {activeWeekData.buttocks ? `${activeWeekData.buttocks} cm` : '--'}
                      </strong>
                    </div>
                    <div className="p-2.5 rounded-xl bg-black/20 col-span-2 sm:col-span-2">
                      <span className="text-slate-400 block text-[11px]">Tỷ lệ eo / hông:</span>
                      <strong className="text-amber-300 font-bold">
                        {activeWeekData.waistHipRatio ? `${activeWeekData.waistHipRatio}` : '--'}
                      </strong>
                    </div>
                  </div>
                </div>

                {/* Nhóm 3: Thành phần mỡ & Lượng cơ */}
                <div className="glass-card p-4 rounded-2xl border-white/10 space-y-3">
                  <h4 className="text-xs font-bold text-orange-400 uppercase tracking-wider flex items-center gap-2 border-b border-white/5 pb-2">
                    <Sparkles size={15} /> Thành phần Mỡ &amp; Lượng Cơ
                  </h4>
                  <div className="grid grid-cols-2 gap-2.5 text-xs">
                    <div className="p-2.5 rounded-xl bg-black/20">
                      <span className="text-slate-400 block text-[11px]">Tỷ lệ mỡ:</span>
                      <strong className="text-orange-300 font-bold">
                        {activeWeekData.bodyFatPercentage ? `${activeWeekData.bodyFatPercentage}%` : '--'}
                      </strong>
                    </div>
                    <div className="p-2.5 rounded-xl bg-black/20">
                      <span className="text-slate-400 block text-[11px]">Tỷ lệ mỡ bụng:</span>
                      <strong className="text-orange-300 font-bold">
                        {activeWeekData.visceralFatPercentage ? `${activeWeekData.visceralFatPercentage}%` : '--'}
                      </strong>
                    </div>
                    <div className="p-2.5 rounded-xl bg-black/20">
                      <span className="text-slate-400 block text-[11px]">Mỡ nội tạng:</span>
                      <strong className="text-white font-bold">
                        {activeWeekData.visceralFatLevel !== undefined ? `${activeWeekData.visceralFatLevel}` : '--'}
                      </strong>
                    </div>
                    <div className="p-2.5 rounded-xl bg-black/20">
                      <span className="text-slate-400 block text-[11px]">% mỡ dưới da:</span>
                      <strong className="text-white font-bold">
                        {activeWeekData.subcutaneousFatPercentage ? `${activeWeekData.subcutaneousFatPercentage}%` : '--'}
                      </strong>
                    </div>
                    <div className="p-2.5 rounded-xl bg-black/20">
                      <span className="text-slate-400 block text-[11px]">Lượng cơ:</span>
                      <strong className="text-emerald-300 font-bold">
                        {activeWeekData.muscleMass ? `${activeWeekData.muscleMass} kg` : '--'}
                      </strong>
                    </div>
                    <div className="p-2.5 rounded-xl bg-black/20">
                      <span className="text-slate-400 block text-[11px]">Lượng cơ xương:</span>
                      <strong className="text-emerald-300 font-bold">
                        {activeWeekData.skeletalMuscleMass ? `${activeWeekData.skeletalMuscleMass} kg` : '--'}
                      </strong>
                    </div>
                  </div>
                </div>

                {/* Nhóm 4: Nước, BMR & Điểm cơ thể */}
                <div className="glass-card p-4 rounded-2xl border-white/10 space-y-3">
                  <h4 className="text-xs font-bold text-emerald-400 uppercase tracking-wider flex items-center gap-2 border-b border-white/5 pb-2">
                    <Activity size={15} /> Nước, Năng Lượng &amp; Điểm Cơ Thể
                  </h4>
                  <div className="grid grid-cols-2 gap-2.5 text-xs">
                    <div className="p-2.5 rounded-xl bg-black/20">
                      <span className="text-slate-400 block text-[11px]">Lượng nước:</span>
                      <strong className="text-cyan-300 font-bold">
                        {activeWeekData.bodyWater ? `${activeWeekData.bodyWater} kg` : '--'}
                      </strong>
                    </div>
                    <div className="p-2.5 rounded-xl bg-black/20">
                      <span className="text-slate-400 block text-[11px]">BMR (Calo trao đổi):</span>
                      <strong className="text-amber-300 font-bold">
                        {activeWeekData.bmr ? `${activeWeekData.bmr} Kcal` : '--'}
                      </strong>
                    </div>
                    <div className="p-2.5 rounded-xl bg-black/20 col-span-2">
                      <span className="text-slate-400 block text-[11px]">Chỉ số điểm cơ thể:</span>
                      <strong className="text-purple-300 font-bold text-sm">
                        {activeWeekData.bodyScore !== undefined ? `${activeWeekData.bodyScore} điểm` : '--'}
                      </strong>
                    </div>
                  </div>

                  {activeWeekData.notes && (
                    <div className="p-3 rounded-xl bg-purple-500/10 border border-purple-500/20 text-xs text-slate-200">
                      <span className="text-purple-300 font-bold block mb-0.5">Lời dặn của chuyên gia:</span>
                      <p className="whitespace-pre-line">{activeWeekData.notes}</p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        ) : (
          /* VIEW MODE 2: BẢNG ĐỐI CHIẾU 4 TUẦN (CHUẨN HÓA THEO ĐÚNG ẢNH BẢNG BIỂU YÊU CẦU) */
          <div className="glass-card overflow-hidden shadow-2xl border-white/10">
            <div className="p-3.5 bg-white/[0.02] border-b border-white/10 flex items-center justify-between">
              <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
                <FileSpreadsheet size={15} className="text-cyan-400" />
                Bảng đối chiếu chỉ số cơ thể qua các tuần
              </h3>
              <span className="text-[11px] text-slate-400">
                Hiển thị {weeksList.length} tuần khám
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-xs min-w-[620px]">
                <thead>
                  <tr style={{ background: 'rgba(255,255,255,0.04)' }}>
                    <th className="px-4 py-3 text-left font-bold text-slate-300 uppercase w-48 border-r border-white/5 sticky left-0 bg-slate-900/90 backdrop-blur-md">
                      Chỉ số
                    </th>
                    {weeksList.map((wk) => (
                      <th
                        key={wk.weekNumber}
                        className="px-4 py-3 text-center font-bold text-cyan-300 uppercase border-r border-white/5 min-w-[120px]"
                      >
                        Tuần {wk.weekNumber}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {/* Row 1: Ngày khám */}
                  <tr className="hover:bg-white/5 transition-colors">
                    <td className="px-4 py-2.5 font-medium text-slate-300 border-r border-white/5 sticky left-0 bg-slate-900/90 backdrop-blur-md">
                      Ngày khám
                    </td>
                    {weeksList.map((wk) => (
                      <td key={wk.weekNumber} className="px-4 py-2.5 text-center text-white font-semibold border-r border-white/5">
                        {wk.examDate || '--'}
                      </td>
                    ))}
                  </tr>

                  {/* Row 2: Chiều cao (cm) */}
                  <tr className="hover:bg-white/5 transition-colors">
                    <td className="px-4 py-2.5 font-medium text-slate-300 border-r border-white/5 sticky left-0 bg-slate-900/90 backdrop-blur-md">
                      Chiều cao (cm)
                    </td>
                    {weeksList.map((wk) => (
                      <td key={wk.weekNumber} className="px-4 py-2.5 text-center text-slate-200 border-r border-white/5">
                        {wk.height ?? '--'}
                      </td>
                    ))}
                  </tr>

                  {/* Row 3: Cân nặng (kg) */}
                  <tr className="hover:bg-white/5 transition-colors bg-cyan-500/[0.03]">
                    <td className="px-4 py-2.5 font-bold text-cyan-300 border-r border-white/5 sticky left-0 bg-slate-900/90 backdrop-blur-md">
                      Cân nặng (kg)
                    </td>
                    {weeksList.map((wk) => (
                      <td key={wk.weekNumber} className="px-4 py-2.5 text-center text-cyan-300 font-bold border-r border-white/5">
                        {wk.weight ?? '--'}
                      </td>
                    ))}
                  </tr>

                  {/* Row 4: BMI (kg/m²) */}
                  <tr className="hover:bg-white/5 transition-colors">
                    <td className="px-4 py-2.5 font-medium text-slate-300 border-r border-white/5 sticky left-0 bg-slate-900/90 backdrop-blur-md">
                      BMI (kg/m²)
                    </td>
                    {weeksList.map((wk) => (
                      <td key={wk.weekNumber} className="px-4 py-2.5 text-center text-purple-300 font-bold border-r border-white/5">
                        {wk.bmi ?? '--'}
                      </td>
                    ))}
                  </tr>

                  {/* Row 5: Vòng eo (cm) */}
                  <tr className="hover:bg-white/5 transition-colors">
                    <td className="px-4 py-2.5 font-medium text-slate-300 border-r border-white/5 sticky left-0 bg-slate-900/90 backdrop-blur-md">
                      Vòng eo (cm)
                    </td>
                    {weeksList.map((wk) => (
                      <td key={wk.weekNumber} className="px-4 py-2.5 text-center text-rose-300 font-semibold border-r border-white/5">
                        {wk.waist ?? '--'}
                      </td>
                    ))}
                  </tr>

                  {/* Row 6: Vòng bụng (cm) */}
                  <tr className="hover:bg-white/5 transition-colors">
                    <td className="px-4 py-2.5 font-medium text-slate-300 border-r border-white/5 sticky left-0 bg-slate-900/90 backdrop-blur-md">
                      Vòng bụng (cm)
                    </td>
                    {weeksList.map((wk) => (
                      <td key={wk.weekNumber} className="px-4 py-2.5 text-center text-slate-200 border-r border-white/5">
                        {wk.abdomen ?? '--'}
                      </td>
                    ))}
                  </tr>

                  {/* Row 7: Vòng hông (cm) */}
                  <tr className="hover:bg-white/5 transition-colors">
                    <td className="px-4 py-2.5 font-medium text-slate-300 border-r border-white/5 sticky left-0 bg-slate-900/90 backdrop-blur-md">
                      Vòng hông (cm)
                    </td>
                    {weeksList.map((wk) => (
                      <td key={wk.weekNumber} className="px-4 py-2.5 text-center text-slate-200 border-r border-white/5">
                        {wk.hip ?? '--'}
                      </td>
                    ))}
                  </tr>

                  {/* Row 8: Vòng mông (cm) */}
                  <tr className="hover:bg-white/5 transition-colors">
                    <td className="px-4 py-2.5 font-medium text-slate-300 border-r border-white/5 sticky left-0 bg-slate-900/90 backdrop-blur-md">
                      Vòng mông (cm)
                    </td>
                    {weeksList.map((wk) => (
                      <td key={wk.weekNumber} className="px-4 py-2.5 text-center text-slate-200 border-r border-white/5">
                        {wk.buttocks ?? '--'}
                      </td>
                    ))}
                  </tr>

                  {/* Row 9: Tỷ lệ eo hông */}
                  <tr className="hover:bg-white/5 transition-colors">
                    <td className="px-4 py-2.5 font-medium text-slate-300 border-r border-white/5 sticky left-0 bg-slate-900/90 backdrop-blur-md">
                      Tỷ lệ eo hông
                    </td>
                    {weeksList.map((wk) => (
                      <td key={wk.weekNumber} className="px-4 py-2.5 text-center text-amber-300 font-semibold border-r border-white/5">
                        {wk.waistHipRatio ?? '--'}
                      </td>
                    ))}
                  </tr>

                  {/* Row 10: Tỷ lệ mỡ (%) */}
                  <tr className="hover:bg-white/5 transition-colors bg-orange-500/[0.03]">
                    <td className="px-4 py-2.5 font-bold text-orange-400 border-r border-white/5 sticky left-0 bg-slate-900/90 backdrop-blur-md">
                      Tỷ lệ mỡ (%)
                    </td>
                    {weeksList.map((wk) => (
                      <td key={wk.weekNumber} className="px-4 py-2.5 text-center text-orange-300 font-bold border-r border-white/5">
                        {wk.bodyFatPercentage !== undefined ? `${wk.bodyFatPercentage}%` : '--'}
                      </td>
                    ))}
                  </tr>

                  {/* Row 11: Tỷ lệ mỡ tại vùng bụng (%) */}
                  <tr className="hover:bg-white/5 transition-colors">
                    <td className="px-4 py-2.5 font-medium text-slate-300 border-r border-white/5 sticky left-0 bg-slate-900/90 backdrop-blur-md">
                      Tỷ lệ mỡ tại vùng bụng (%)
                    </td>
                    {weeksList.map((wk) => (
                      <td key={wk.weekNumber} className="px-4 py-2.5 text-center text-orange-300 border-r border-white/5">
                        {wk.visceralFatPercentage !== undefined ? `${wk.visceralFatPercentage}%` : '--'}
                      </td>
                    ))}
                  </tr>

                  {/* Row 12: Mỡ nội tạng */}
                  <tr className="hover:bg-white/5 transition-colors">
                    <td className="px-4 py-2.5 font-medium text-slate-300 border-r border-white/5 sticky left-0 bg-slate-900/90 backdrop-blur-md">
                      Mỡ nội tạng
                    </td>
                    {weeksList.map((wk) => (
                      <td key={wk.weekNumber} className="px-4 py-2.5 text-center text-slate-200 border-r border-white/5">
                        {wk.visceralFatLevel ?? '--'}
                      </td>
                    ))}
                  </tr>

                  {/* Row 13: % mỡ dưới da */}
                  <tr className="hover:bg-white/5 transition-colors">
                    <td className="px-4 py-2.5 font-medium text-slate-300 border-r border-white/5 sticky left-0 bg-slate-900/90 backdrop-blur-md">
                      % mỡ dưới da
                    </td>
                    {weeksList.map((wk) => (
                      <td key={wk.weekNumber} className="px-4 py-2.5 text-center text-slate-200 border-r border-white/5">
                        {wk.subcutaneousFatPercentage !== undefined ? `${wk.subcutaneousFatPercentage}%` : '--'}
                      </td>
                    ))}
                  </tr>

                  {/* Row 14: Lượng cơ (kg) */}
                  <tr className="hover:bg-white/5 transition-colors bg-emerald-500/[0.03]">
                    <td className="px-4 py-2.5 font-bold text-emerald-400 border-r border-white/5 sticky left-0 bg-slate-900/90 backdrop-blur-md">
                      Lượng cơ (kg)
                    </td>
                    {weeksList.map((wk) => (
                      <td key={wk.weekNumber} className="px-4 py-2.5 text-center text-emerald-300 font-bold border-r border-white/5">
                        {wk.muscleMass ?? '--'}
                      </td>
                    ))}
                  </tr>

                  {/* Row 15: Lượng cơ xương */}
                  <tr className="hover:bg-white/5 transition-colors">
                    <td className="px-4 py-2.5 font-medium text-slate-300 border-r border-white/5 sticky left-0 bg-slate-900/90 backdrop-blur-md">
                      Lượng cơ xương (kg)
                    </td>
                    {weeksList.map((wk) => (
                      <td key={wk.weekNumber} className="px-4 py-2.5 text-center text-emerald-300 border-r border-white/5">
                        {wk.skeletalMuscleMass ?? '--'}
                      </td>
                    ))}
                  </tr>

                  {/* Row 16: Lượng nước (kg) */}
                  <tr className="hover:bg-white/5 transition-colors">
                    <td className="px-4 py-2.5 font-medium text-slate-300 border-r border-white/5 sticky left-0 bg-slate-900/90 backdrop-blur-md">
                      Lượng nước (kg)
                    </td>
                    {weeksList.map((wk) => (
                      <td key={wk.weekNumber} className="px-4 py-2.5 text-center text-cyan-300 border-r border-white/5">
                        {wk.bodyWater ?? '--'}
                      </td>
                    ))}
                  </tr>

                  {/* Row 17: BMR (Kcal) */}
                  <tr className="hover:bg-white/5 transition-colors">
                    <td className="px-4 py-2.5 font-medium text-slate-300 border-r border-white/5 sticky left-0 bg-slate-900/90 backdrop-blur-md">
                      BMR (Kcal)
                    </td>
                    {weeksList.map((wk) => (
                      <td key={wk.weekNumber} className="px-4 py-2.5 text-center text-amber-300 font-semibold border-r border-white/5">
                        {wk.bmr ?? '--'}
                      </td>
                    ))}
                  </tr>

                  {/* Row 18: Chỉ số điểm cơ thể */}
                  <tr className="hover:bg-white/5 transition-colors bg-purple-500/[0.03]">
                    <td className="px-4 py-2.5 font-bold text-purple-300 border-r border-white/5 sticky left-0 bg-slate-900/90 backdrop-blur-md">
                      Chỉ số điểm cơ thể
                    </td>
                    {weeksList.map((wk) => (
                      <td key={wk.weekNumber} className="px-4 py-2.5 text-center text-purple-300 font-bold border-r border-white/5">
                        {wk.bodyScore ?? '--'}
                      </td>
                    ))}
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        )}
      </main>

      {/* ADMIN INPUT / EDIT MODAL (Tối ưu cho cả Mobile & Desktop) */}
      {showFormModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5"
          style={{ background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(10px)' }}
        >
          <div
            className="glass-card w-full max-w-2xl animate-fade-in p-5 sm:p-6 shadow-2xl border-purple-500/40"
            style={{ maxHeight: '92vh', overflowY: 'auto' }}
          >
            {/* Header */}
            <div className="flex items-center justify-between pb-3 border-b border-white/10 mb-4">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Edit2 size={18} className="text-purple-400" />
                <span>Nhập Chỉ Số Khám Tuần {formData.weekNumber}</span>
              </h3>
              <button
                onClick={() => setShowFormModal(false)}
                className="p-1.5 rounded-lg hover:bg-white/10 text-slate-400 hover:text-white"
              >
                <X size={20} />
              </button>
            </div>

            <div className="space-y-4 text-xs">
              {/* Tuần & Ngày khám */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Số thứ tự tuần *</label>
                  <input
                    type="number"
                    min="1"
                    className="input-dark text-xs"
                    value={formData.weekNumber}
                    onChange={(e) =>
                      setFormData({ ...formData, weekNumber: Number(e.target.value) })
                    }
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Ngày khám *</label>
                  <input
                    type="date"
                    className="input-dark text-xs"
                    value={formData.examDate || ''}
                    onChange={(e) => setFormData({ ...formData, examDate: e.target.value })}
                  />
                </div>
              </div>

              {/* Nhóm 1: Chiều cao, Cân nặng, BMI */}
              <div className="p-3.5 rounded-xl bg-black/25 border border-white/10 space-y-2.5">
                <span className="text-[11px] font-bold text-cyan-400 uppercase tracking-wider block">
                  1. Chiều cao, Cân nặng &amp; BMI
                </span>
                <div className="grid grid-cols-3 gap-2.5">
                  <div>
                    <label className="block text-slate-400 mb-1">Chiều cao (cm)</label>
                    <input
                      type="number"
                      step="0.1"
                      className="input-dark text-xs"
                      placeholder="VD: 162"
                      value={formData.height || ''}
                      onChange={(e) =>
                        handleHeightWeightChange(
                          e.target.value ? Number(e.target.value) : undefined,
                          undefined
                        )
                      }
                    />
                  </div>
                  <div>
                    <label className="block text-slate-400 mb-1">Cân nặng (kg)</label>
                    <input
                      type="number"
                      step="0.1"
                      className="input-dark text-xs font-bold text-cyan-300"
                      placeholder="VD: 60.5"
                      value={formData.weight || ''}
                      onChange={(e) =>
                        handleHeightWeightChange(
                          undefined,
                          e.target.value ? Number(e.target.value) : undefined
                        )
                      }
                    />
                  </div>
                  <div>
                    <label className="block text-slate-400 mb-1">BMI (kg/m²)</label>
                    <input
                      type="number"
                      step="0.1"
                      className="input-dark text-xs font-bold text-purple-300 bg-white/5"
                      placeholder="Tự động tính"
                      value={formData.bmi || ''}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          bmi: e.target.value ? Number(e.target.value) : undefined,
                        })
                      }
                    />
                  </div>
                </div>
              </div>

              {/* Nhóm 2: Số đo các vòng */}
              <div className="p-3.5 rounded-xl bg-black/25 border border-white/10 space-y-2.5">
                <span className="text-[11px] font-bold text-rose-400 uppercase tracking-wider block">
                  2. Số đo các vòng cơ thể (cm)
                </span>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                  <div>
                    <label className="block text-slate-400 mb-1">Vòng eo (cm)</label>
                    <input
                      type="number"
                      step="0.1"
                      className="input-dark text-xs font-semibold text-rose-300"
                      placeholder="VD: 68"
                      value={formData.waist || ''}
                      onChange={(e) =>
                        handleWaistHipChange(
                          e.target.value ? Number(e.target.value) : undefined,
                          undefined
                        )
                      }
                    />
                  </div>
                  <div>
                    <label className="block text-slate-400 mb-1">Vòng bụng (cm)</label>
                    <input
                      type="number"
                      step="0.1"
                      className="input-dark text-xs"
                      placeholder="VD: 74"
                      value={formData.abdomen || ''}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          abdomen: e.target.value ? Number(e.target.value) : undefined,
                        })
                      }
                    />
                  </div>
                  <div>
                    <label className="block text-slate-400 mb-1">Vòng hông (cm)</label>
                    <input
                      type="number"
                      step="0.1"
                      className="input-dark text-xs"
                      placeholder="VD: 85"
                      value={formData.hip || ''}
                      onChange={(e) =>
                        handleWaistHipChange(
                          undefined,
                          e.target.value ? Number(e.target.value) : undefined
                        )
                      }
                    />
                  </div>
                  <div>
                    <label className="block text-slate-400 mb-1">Vòng mông (cm)</label>
                    <input
                      type="number"
                      step="0.1"
                      className="input-dark text-xs"
                      placeholder="VD: 92"
                      value={formData.buttocks || ''}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          buttocks: e.target.value ? Number(e.target.value) : undefined,
                        })
                      }
                    />
                  </div>
                  <div className="col-span-2 sm:col-span-2">
                    <label className="block text-slate-400 mb-1">Tỷ lệ eo / hông</label>
                    <input
                      type="number"
                      step="0.01"
                      className="input-dark text-xs font-bold text-amber-300 bg-white/5"
                      placeholder="Tự động tính (Eo / Hông)"
                      value={formData.waistHipRatio || ''}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          waistHipRatio: e.target.value ? Number(e.target.value) : undefined,
                        })
                      }
                    />
                  </div>
                </div>
              </div>

              {/* Nhóm 3: Mỡ & Cơ */}
              <div className="p-3.5 rounded-xl bg-black/25 border border-white/10 space-y-2.5">
                <span className="text-[11px] font-bold text-orange-400 uppercase tracking-wider block">
                  3. Tỷ lệ mỡ (%) &amp; Lượng cơ (kg)
                </span>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                  <div>
                    <label className="block text-slate-400 mb-1">Tỷ lệ mỡ (%)</label>
                    <input
                      type="number"
                      step="0.1"
                      className="input-dark text-xs font-bold text-orange-300"
                      placeholder="VD: 24.5"
                      value={formData.bodyFatPercentage || ''}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          bodyFatPercentage: e.target.value ? Number(e.target.value) : undefined,
                        })
                      }
                    />
                  </div>
                  <div>
                    <label className="block text-slate-400 mb-1">Tỷ lệ mỡ bụng (%)</label>
                    <input
                      type="number"
                      step="0.1"
                      className="input-dark text-xs"
                      placeholder="VD: 22.0"
                      value={formData.visceralFatPercentage || ''}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          visceralFatPercentage: e.target.value ? Number(e.target.value) : undefined,
                        })
                      }
                    />
                  </div>
                  <div>
                    <label className="block text-slate-400 mb-1">Mỡ nội tạng</label>
                    <input
                      type="number"
                      step="0.5"
                      className="input-dark text-xs"
                      placeholder="VD: 4.5"
                      value={formData.visceralFatLevel !== undefined ? formData.visceralFatLevel : ''}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          visceralFatLevel: e.target.value ? Number(e.target.value) : undefined,
                        })
                      }
                    />
                  </div>
                  <div>
                    <label className="block text-slate-400 mb-1">% mỡ dưới da</label>
                    <input
                      type="number"
                      step="0.1"
                      className="input-dark text-xs"
                      placeholder="VD: 18.2"
                      value={formData.subcutaneousFatPercentage || ''}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          subcutaneousFatPercentage: e.target.value ? Number(e.target.value) : undefined,
                        })
                      }
                    />
                  </div>
                  <div>
                    <label className="block text-slate-400 mb-1">Lượng cơ (kg)</label>
                    <input
                      type="number"
                      step="0.1"
                      className="input-dark text-xs font-bold text-emerald-300"
                      placeholder="VD: 27.5"
                      value={formData.muscleMass || ''}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          muscleMass: e.target.value ? Number(e.target.value) : undefined,
                        })
                      }
                    />
                  </div>
                  <div>
                    <label className="block text-slate-400 mb-1">Lượng cơ xương (kg)</label>
                    <input
                      type="number"
                      step="0.1"
                      className="input-dark text-xs"
                      placeholder="VD: 21.0"
                      value={formData.skeletalMuscleMass || ''}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          skeletalMuscleMass: e.target.value ? Number(e.target.value) : undefined,
                        })
                      }
                    />
                  </div>
                </div>
              </div>

              {/* Nhóm 4: Nước, BMR, Điểm cơ thể */}
              <div className="p-3.5 rounded-xl bg-black/25 border border-white/10 space-y-2.5">
                <span className="text-[11px] font-bold text-emerald-400 uppercase tracking-wider block">
                  4. Lượng nước, BMR &amp; Điểm cơ thể
                </span>
                <div className="grid grid-cols-3 gap-2.5">
                  <div>
                    <label className="block text-slate-400 mb-1">Lượng nước (kg)</label>
                    <input
                      type="number"
                      step="0.1"
                      className="input-dark text-xs"
                      placeholder="VD: 34.0"
                      value={formData.bodyWater || ''}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          bodyWater: e.target.value ? Number(e.target.value) : undefined,
                        })
                      }
                    />
                  </div>
                  <div>
                    <label className="block text-slate-400 mb-1">BMR (Kcal)</label>
                    <input
                      type="number"
                      className="input-dark text-xs"
                      placeholder="VD: 1250"
                      value={formData.bmr || ''}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          bmr: e.target.value ? Number(e.target.value) : undefined,
                        })
                      }
                    />
                  </div>
                  <div>
                    <label className="block text-slate-400 mb-1">Điểm cơ thể</label>
                    <input
                      type="number"
                      className="input-dark text-xs font-bold text-purple-300"
                      placeholder="VD: 82"
                      value={formData.bodyScore !== undefined ? formData.bodyScore : ''}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          bodyScore: e.target.value ? Number(e.target.value) : undefined,
                        })
                      }
                    />
                  </div>
                </div>
              </div>

              {/* Ghi chú */}
              <div>
                <label className="block text-slate-300 font-semibold mb-1">
                  Ghi chú / Đánh giá của chuyên gia
                </label>
                <textarea
                  rows={2}
                  className="input-dark text-xs"
                  placeholder="Nhập nhận xét về tiến độ giảm mỡ, tăng cơ..."
                  value={formData.notes || ''}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                />
              </div>
            </div>

            {/* Modal Actions */}
            <div className="mt-5 pt-3 border-t border-white/10 flex items-center justify-end gap-2.5">
              <button
                type="button"
                onClick={() => setShowFormModal(false)}
                className="btn-ghost text-xs py-2 px-4"
              >
                Hủy
              </button>
              <button
                type="button"
                disabled={isSaving}
                onClick={handleSaveWeek}
                className="btn-primary text-xs py-2 px-5 bg-gradient-to-r from-purple-500 to-indigo-600 shadow-purple-500/20"
              >
                {isSaving ? 'Đang lưu...' : 'Lưu chỉ số tuần'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function BodyMetricsPage() {
  return (
    <Suspense
      fallback={
        <div className="hero-bg min-h-screen flex items-center justify-center p-4">
          <div className="w-10 h-10 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin" />
        </div>
      }
    >
      <BodyMetricsContent />
    </Suspense>
  );
}
