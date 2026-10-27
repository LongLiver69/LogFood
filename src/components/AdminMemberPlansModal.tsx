'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { format, startOfWeek, addDays, getWeek, getYear } from 'date-fns';
import { vi } from 'date-fns/locale';
import {
  X,
  Calendar,
  UtensilsCrossed,
  ChevronLeft,
  ChevronRight,
  Search,
  Lock,
  Flame,
  CheckCircle,
} from 'lucide-react';
import { MEAL_LABELS, MEAL_ORDER, DAY_LABELS, formatIngredientWeight } from '@/lib/constants';

interface AdminMemberPlansModalProps {
  userId: string | null;
  onClose: () => void;
}

function getWeekKey(date: Date) {
  return `${getYear(date)}-W${String(getWeek(date, { weekStartsOn: 1 })).padStart(2, '0')}`;
}

function getWeekDays(weekStart: Date) {
  return Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));
}

export default function AdminMemberPlansModal({ userId, onClose }: AdminMemberPlansModalProps) {
  const [selectedWeekStart, setSelectedWeekStart] = useState<Date>(() =>
    startOfWeek(new Date(), { weekStartsOn: 1 })
  );
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<{
    user: any;
    availableWeeks: string[];
    dayPlans: any[];
  } | null>(null);
  const [error, setError] = useState('');
  const [assignMessage, setAssignMessage] = useState('');
  const [isAssigning, setIsAssigning] = useState(false);

  const currentWeekKey = useMemo(() => getWeekKey(selectedWeekStart), [selectedWeekStart]);
  const weekDays = useMemo(() => getWeekDays(selectedWeekStart), [selectedWeekStart]);

  const loadUserPlans = useCallback(async () => {
    if (!userId) return;
    setLoading(true);
    setError('');
    try {
      const res = await fetch(`/api/admin/user-plans?userId=${userId}&weekKey=${currentWeekKey}`);
      const json = await res.json();
      if (!json.success) {
        throw new Error(json.error || 'Không thể tải thực đơn thành viên');
      }
      setData(json);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Đã có lỗi xảy ra';
      setError(msg);
    } finally {
      setLoading(false);
    }
  }, [userId, currentWeekKey]);

  useEffect(() => {
    loadUserPlans();
  }, [loadUserPlans]);

  // Jump to week from input date
  const handleDateSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.value) return;
    const picked = new Date(e.target.value);
    if (!isNaN(picked.getTime())) {
      setSelectedWeekStart(startOfWeek(picked, { weekStartsOn: 1 }));
    }
  };

  // Jump to selected weekKey from dropdown
  const handleSelectWeekKey = (wKey: string) => {
    if (!wKey) return;
    const [yearStr, weekStr] = wKey.split('-W');
    const year = parseInt(yearStr, 10);
    const week = parseInt(weekStr, 10);
    if (!isNaN(year) && !isNaN(week)) {
      const jan4 = new Date(year, 0, 4);
      const targetDate = addDays(jan4, (week - 1) * 7);
      setSelectedWeekStart(startOfWeek(targetDate, { weekStartsOn: 1 }));
    }
  };

  // Cấp quyền chế độ ăn (1000kcal hay 1200kcal) theo tuần cho thành viên
  const handleAssignDiet = async (dietType: '1000kcal' | '1200kcal') => {
    if (!userId) return;
    setIsAssigning(true);
    try {
      const res = await fetch('/api/admin/users', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId,
          weekKey: currentWeekKey,
          weeklyDietType: dietType,
        }),
      });
      const resJson = await res.json();
      if (resJson.success) {
        setAssignMessage(`Đã cấp quyền thực đơn ${dietType} cho tuần ${currentWeekKey}!`);
        setTimeout(() => setAssignMessage(''), 2500);
        loadUserPlans();
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsAssigning(false);
    }
  };

  if (!userId) return null;

  const currentWeekDiet =
    data?.user?.weeklyDietPreferences?.[currentWeekKey] ||
    data?.user?.dietPreference ||
    '1000kcal';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5" style={{ background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(10px)' }}>
      <div className="glass-card w-full max-w-6xl animate-fade-in p-5 sm:p-6" style={{ maxHeight: '92vh', overflowY: 'auto' }}>
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-white/10 mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-purple-500/20 text-purple-300 border border-purple-500/30">
              <UtensilsCrossed size={20} />
            </div>
            <div>
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                Xem Thực Đơn Cả Tuần Của Thành Viên
              </h2>
              {data?.user && (
                <p className="text-xs text-slate-400">
                  Thành viên: <strong className="text-white">{data.user.fullName}</strong> ({data.user.email})
                </p>
              )}
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-white/10 text-slate-400 hover:text-white">
            <X size={20} />
          </button>
        </div>

        {error && (
          <div className="p-3 mb-4 rounded-xl text-xs border border-red-500/30 text-red-300 bg-red-500/10">
            {error}
          </div>
        )}

        {/* Member Quick Info Bar & Diet Assignment */}
        {data?.user && (
          <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10 grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs mb-4">
            <div>
              <span className="text-slate-400 block text-[11px]">Chiều cao &amp; Cân nặng:</span>
              <span className="font-bold text-white">
                {data.user.height ? `${data.user.height} cm` : '--'} • {data.user.weight ? `${data.user.weight} kg` : '--'}
              </span>
            </div>
            <div>
              <span className="text-slate-400 block text-[11px]">Chỉ số BMI:</span>
              {data.user.bmiInfo ? (
                <span className="font-bold" style={{ color: data.user.bmiInfo.color }}>
                  BMI {data.user.bmiInfo.bmi} ({data.user.bmiInfo.status})
                </span>
              ) : (
                <span className="text-slate-500 italic">Chưa tính</span>
              )}
            </div>
            <div>
              <span className="text-slate-400 block text-[11px]">Cấp quyền thực đơn tuần ({currentWeekKey}):</span>
              <select
                value={currentWeekDiet}
                disabled={isAssigning}
                onChange={(e) => handleAssignDiet(e.target.value as '1000kcal' | '1200kcal')}
                className="input-dark text-xs py-1 px-2 font-bold text-cyan-300 mt-0.5 cursor-pointer"
              >
                <option value="1000kcal" style={{ background: '#1e293b' }}>1000 kcal (250 - 350 - 100 - 300)</option>
                <option value="1200kcal" style={{ background: '#1e293b' }}>1200 kcal (300 - 420 - 120 - 360)</option>
              </select>
              {assignMessage && (
                <span className="text-[10px] text-emerald-400 block mt-1 font-medium">{assignMessage}</span>
              )}
            </div>
            <div>
              <span className="text-slate-400 block text-[11px]">Tuần có dữ liệu:</span>
              <span className="font-bold text-purple-300">
                {data.availableWeeks?.length || 0} tuần đã chọn món
              </span>
            </div>
          </div>
        )}

        {/* Week Navigator & Week Search Bar */}
        <div className="glass-card p-3.5 flex items-center justify-between flex-wrap gap-3 mb-5 border-purple-500/30">
          {/* Previous week */}
          <button
            onClick={() => setSelectedWeekStart(addDays(selectedWeekStart, -7))}
            className="btn-ghost flex items-center gap-1.5 text-xs py-1.5 px-3"
          >
            <ChevronLeft size={16} /> Tuần trước
          </button>

          {/* Current week title */}
          <div className="text-center">
            <div className="text-white font-bold text-sm sm:text-base">
              {format(selectedWeekStart, 'dd/MM', { locale: vi })} – {format(addDays(selectedWeekStart, 6), 'dd/MM/yyyy', { locale: vi })}
            </div>
            <div className="text-[11px] text-purple-300 font-semibold mt-0.5">{currentWeekKey}</div>
          </div>

          {/* Next week */}
          <button
            onClick={() => setSelectedWeekStart(addDays(selectedWeekStart, 7))}
            className="btn-ghost flex items-center gap-1.5 text-xs py-1.5 px-3"
          >
            Tuần sau <ChevronRight size={16} />
          </button>

          {/* Week search tools */}
          <div className="w-full sm:w-auto flex items-center gap-2 pt-2 sm:pt-0 border-t sm:border-t-0 border-white/5">
            {/* Select from available logged weeks */}
            {data?.availableWeeks && data.availableWeeks.length > 0 && (
              <select
                className="input-dark text-xs py-1.5 px-2.5 max-w-[150px]"
                value={currentWeekKey}
                onChange={(e) => handleSelectWeekKey(e.target.value)}
                title="Chọn tuần thành viên đã từng lên thực đơn"
              >
                <option value="" disabled>-- Chọn tuần đã lưu --</option>
                {data.availableWeeks.map((wk) => (
                  <option key={wk} value={wk} style={{ background: '#1e293b' }}>
                    {wk}
                  </option>
                ))}
              </select>
            )}

            {/* Jump to specific date / week */}
            <div className="flex items-center gap-1 bg-white/5 border border-white/10 rounded-xl px-2 py-1 text-xs">
              <Search size={14} className="text-slate-400" />
              <input
                type="date"
                className="bg-transparent text-slate-200 text-xs outline-none cursor-pointer"
                onChange={handleDateSearch}
                title="Tìm kiếm tuần theo ngày bất kỳ"
              />
            </div>
          </div>
        </div>

        {/* Content: Full Week Meal Grid (7 Columns: T2 -> CN) */}
        {loading ? (
          <div className="p-16 text-center text-slate-400">
            <div className="w-10 h-10 border-2 border-purple-400 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
            <div className="text-xs">Đang tải thực đơn tuần {currentWeekKey}...</div>
          </div>
        ) : (
          <div className="overflow-x-auto pb-4">
            <div className="flex gap-3" style={{ minWidth: 'max-content' }}>
              {weekDays.map((day) => {
                const dayPlan = data?.dayPlans?.find((p) => {
                  const planDate = new Date(p.date);
                  return planDate.toDateString() === day.toDateString();
                });

                const totalCal = dayPlan?.selections?.reduce(
                  (sum: number, s: any) => sum + (s.dishDetail?.calories || 0),
                  0
                ) || 0;

                return (
                  <div key={day.toISOString()} className="flex flex-col gap-2.5 min-w-[220px] w-[220px]">
                    {/* Day Column Header */}
                    <div className="glass-card p-3 text-center border-white/10">
                      <div className="text-xs text-slate-400 font-semibold mb-0.5">{DAY_LABELS[day.getDay()]}</div>
                      <div className="text-lg font-black text-white">{format(day, 'd')}</div>
                      <div className="text-[10px] text-slate-500">{format(day, 'MM/yyyy')}</div>
                      {dayPlan?.isLocked && (
                        <div className="mt-1 inline-flex items-center gap-1 text-[10px] text-slate-400 bg-white/5 px-2 py-0.5 rounded-full">
                          <Lock size={10} /> Đã khóa
                        </div>
                      )}
                      <div className="mt-2 pt-1.5 border-t border-white/5 flex items-center justify-between text-[11px]">
                        <span className="text-slate-400">Tổng calo:</span>
                        <span className="font-bold text-orange-400">{totalCal} kcal</span>
                      </div>
                    </div>

                    {/* 4 Meals for this day */}
                    {MEAL_ORDER.map((mealKey) => {
                      const mealSelections = dayPlan?.selections?.filter((s: any) => s.meal === mealKey) || [];
                      const mealCal = mealSelections.reduce((sum: number, s: any) => sum + (s.dishDetail?.calories || 0), 0);

                      return (
                        <div key={mealKey} className={`glass-card p-2.5 border meal-${mealKey}`}>
                          <div className="flex items-center justify-between mb-1">
                            <span className={`text-[11px] font-bold meal-${mealKey}`}>{MEAL_LABELS[mealKey]}</span>
                            {mealSelections.length > 0 && (
                              <span className="text-[10px] text-orange-400 font-semibold">
                                {mealCal} kcal ({mealSelections.length} món)
                              </span>
                            )}
                          </div>

                          {mealSelections.length > 0 ? (
                            <div className="space-y-2">
                              {mealSelections.map((sel: any, selIdx: number) => (
                                <div key={selIdx} className="p-1.5 rounded-lg bg-white/5 border border-white/5">
                                  <div className="text-xs font-semibold text-white leading-tight mb-1 flex items-center justify-between">
                                    <span>{sel.dishName}</span>
                                    {sel.dishDetail && (
                                      <span className="text-[10px] text-orange-400 font-medium ml-1 shrink-0">
                                        {sel.dishDetail.calories} kcal
                                      </span>
                                    )}
                                  </div>
                                  {sel.dishDetail?.ingredients && sel.dishDetail.ingredients.length > 0 && (
                                    <div className="space-y-0.5 pt-1 border-t border-white/5 text-[10px]">
                                      {sel.dishDetail.ingredients.map((ing: any, i: number) => {
                                        const weightText = formatIngredientWeight(ing.rawGrams, ing.cookedGrams);
                                        return (
                                          <div key={i} className="text-slate-300 flex justify-between gap-1">
                                            <span className="truncate pr-1">{ing.name}:</span>
                                            {weightText ? (
                                              <span className="text-cyan-300 shrink-0 font-medium">
                                                {weightText}
                                              </span>
                                            ) : null}
                                          </div>
                                        );
                                      })}
                                    </div>
                                  )}
                                </div>
                              ))}
                            </div>
                          ) : (
                            <div className="text-[10px] text-slate-500 italic py-1">
                              Chưa chọn món
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
