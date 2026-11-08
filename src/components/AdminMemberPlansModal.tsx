'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { format, startOfWeek, addDays, getWeek, getYear } from 'date-fns';
import { vi } from 'date-fns/locale';
import {
  X,
  UtensilsCrossed,
  ChevronLeft,
  ChevronRight,
  Search,
  Lock,
  Flame,
  CheckCircle,
  Plus,
  RefreshCw,
  Trash2,
  Layers,
  Sparkles,
} from 'lucide-react';
import { Dish, MealSelection, DayPlan } from '@/types';
import {
  MEAL_LABELS,
  MEAL_ORDER,
  DAY_LABELS,
  DISH_CATEGORIES,
  getDishComponents,
  formatIngredientWeight,
} from '@/lib/constants';
import DishDetailModal from '@/components/DishDetailModal';

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
    dayPlans: DayPlan[];
  } | null>(null);
  const [error, setError] = useState('');
  const [assignMessage, setAssignMessage] = useState('');
  const [isAssigning, setIsAssigning] = useState(false);

  // Dish Picker modal state
  const [pickerTarget, setPickerTarget] = useState<{
    date: Date;
    dayOfWeek: number;
    meal: 'breakfast' | 'lunch' | 'snack' | 'dinner';
  } | null>(null);

  const [availableDishes, setAvailableDishes] = useState<Dish[]>([]);
  const [pickerCategory, setPickerCategory] = useState<'family' | 'eatclean'>('family');
  const [pickerSearch, setPickerSearch] = useState('');
  const [viewDetailDish, setViewDetailDish] = useState<Dish | null>(null);
  const [isSavingPlan, setIsSavingPlan] = useState(false);

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

  const currentWeekDiet =
    data?.user?.weeklyDietPreferences?.[currentWeekKey] ||
    data?.user?.dietPreference ||
    '1000kcal';

  // Load available dishes when diet type changes or picker opens
  useEffect(() => {
    async function loadDishesForDiet() {
      try {
        const res = await fetch(`/api/dishes?dietType=${currentWeekDiet}`);
        const json = await res.json();
        if (json.success && Array.isArray(json.data)) {
          setAvailableDishes(json.data);
        }
      } catch (err) {
        console.error('Failed to load dishes', err);
      }
    }
    loadDishesForDiet();
  }, [currentWeekDiet]);

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

  // Chọn món cho 1 bữa của thành viên
  const handleSelectDishForMeal = async (targetDish: Dish) => {
    if (!userId || !pickerTarget) return;
    setIsSavingPlan(true);

    try {
      const targetDateStr = format(pickerTarget.date, 'yyyy-MM-dd');

      // Tìm dayPlan hiện tại của ngày này (nếu có)
      const existingPlan = data?.dayPlans?.find((p) => {
        const pDate = new Date(p.date);
        return pDate.toDateString() === pickerTarget.date.toDateString();
      });

      // Tạo selection mới
      const newSelection: MealSelection = {
        meal: pickerTarget.meal,
        dishId: targetDish._id,
        dishName: targetDish.name,
        dishDetail: targetDish,
      };

      // Giữ lại các bữa khác, thay thế/thêm bữa này
      const otherSelections = (existingPlan?.selections || []).filter(
        (s) => s.meal !== pickerTarget.meal
      );
      const updatedSelections = [...otherSelections, newSelection];

      const res = await fetch('/api/dayplans', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId,
          date: targetDateStr,
          weekKey: currentWeekKey,
          dayOfWeek: pickerTarget.dayOfWeek,
          dietType: currentWeekDiet,
          selections: updatedSelections,
        }),
      });

      const resJson = await res.json();
      if (resJson.success) {
        setAssignMessage(`Đã chọn món "${targetDish.name}" cho bữa ${MEAL_LABELS[pickerTarget.meal]}!`);
        setTimeout(() => setAssignMessage(''), 2500);
        setPickerTarget(null);
        await loadUserPlans();
      } else {
        alert(resJson.error || 'Không thể lưu món');
      }
    } catch (err) {
      console.error(err);
      alert('Đã có lỗi xảy ra khi lưu món');
    } finally {
      setIsSavingPlan(false);
    }
  };

  // Xóa món đã chọn của 1 bữa
  const handleRemoveMealSelection = async (day: Date, mealKey: string) => {
    if (!userId) return;
    if (!confirm(`Bạn có chắc muốn xóa món của bữa ${MEAL_LABELS[mealKey]} ngày ${format(day, 'dd/MM')}?`)) return;

    setIsSavingPlan(true);
    try {
      const targetDateStr = format(day, 'yyyy-MM-dd');
      const existingPlan = data?.dayPlans?.find((p) => {
        const pDate = new Date(p.date);
        return pDate.toDateString() === day.toDateString();
      });

      const updatedSelections = (existingPlan?.selections || []).filter((s) => s.meal !== mealKey);

      const res = await fetch('/api/dayplans', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId,
          date: targetDateStr,
          weekKey: currentWeekKey,
          dayOfWeek: day.getDay(),
          dietType: currentWeekDiet,
          selections: updatedSelections,
        }),
      });

      const resJson = await res.json();
      if (resJson.success) {
        setAssignMessage(`Đã xóa món bữa ${MEAL_LABELS[mealKey]}!`);
        setTimeout(() => setAssignMessage(''), 2500);
        await loadUserPlans();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsSavingPlan(false);
    }
  };

  if (!userId) return null;

  // Filter available dishes for picker
  const filteredPickerDishes = pickerTarget
    ? availableDishes.filter((d) => {
        const matchMeal = d.meal === pickerTarget.meal;
        const matchCategory = (d.category || 'family') === pickerCategory;
        const matchSearch = pickerSearch.trim()
          ? d.name.toLowerCase().includes(pickerSearch.toLowerCase())
          : true;
        return matchMeal && matchCategory && matchSearch;
      })
    : [];

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4"
      style={{ background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(10px)' }}
    >
      <div
        className="glass-card w-full max-w-7xl animate-fade-in p-4 sm:p-6 shadow-2xl border-purple-500/30"
        style={{ maxHeight: '94vh', overflowY: 'auto' }}
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-white/10 mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-purple-500/20 text-purple-300 border border-purple-500/30">
              <UtensilsCrossed size={20} />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
                Lên Thực Đơn Cho Thành Viên (Admin chỉ định món ăn)
              </h2>
              {data?.user && (
                <p className="text-xs text-slate-300">
                  Thành viên: <strong className="text-white">{data.user.fullName}</strong> ({data.user.email})
                </p>
              )}
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl hover:bg-white/10 text-slate-400 hover:text-white transition-colors"
            title="Đóng"
          >
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
                <option value="1000kcal" style={{ background: '#1e293b' }}>
                  1000 kcal (250 - 350 - 100 - 300)
                </option>
                <option value="1200kcal" style={{ background: '#1e293b' }}>
                  1200 kcal (300 - 420 - 120 - 360)
                </option>
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

        {/* Content: 7 Columns (T2 -> CN) with Admin Selection Buttons */}
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

                const totalCal =
                  dayPlan?.selections?.reduce(
                    (sum: number, s: any) => sum + (s.dishDetail?.calories || 0),
                    0
                  ) || 0;

                return (
                  <div key={day.toISOString()} className="flex flex-col gap-2.5 min-w-[240px] w-[240px]">
                    {/* Day Column Header */}
                    <div className="glass-card p-3 text-center border-white/10">
                      <div className="text-xs text-slate-400 font-semibold mb-0.5">
                        {DAY_LABELS[day.getDay()]}
                      </div>
                      <div className="text-lg font-black text-white">{format(day, 'd')}</div>
                      <div className="text-[10px] text-slate-500">{format(day, 'MM/yyyy')}</div>
                      <div className="mt-2 pt-1.5 border-t border-white/5 flex items-center justify-between text-[11px]">
                        <span className="text-slate-400">Tổng calo:</span>
                        <span className="font-bold text-orange-400">{totalCal} kcal</span>
                      </div>
                    </div>

                    {/* 4 Meals for this day */}
                    {MEAL_ORDER.map((mealKey) => {
                      const mealSelection = dayPlan?.selections?.find((s: any) => s.meal === mealKey);
                      const dish = mealSelection?.dishDetail;
                      const comps = dish ? getDishComponents(dish) : [];

                      return (
                        <div
                          key={mealKey}
                          className={`glass-card p-3 border meal-${mealKey} flex flex-col justify-between`}
                          style={{ minHeight: '190px' }}
                        >
                          <div>
                            {/* Meal Badge & Calories */}
                            <div className="flex items-center justify-between mb-2 pb-1.5 border-b border-white/5">
                              <span className={`text-[11px] font-bold meal-${mealKey}`}>
                                {MEAL_LABELS[mealKey]}
                              </span>
                              {dish && (
                                <span className="text-[11px] text-orange-400 font-bold flex items-center gap-0.5 whitespace-nowrap shrink-0">
                                  <Flame size={12} />
                                  {dish.calories} kcal
                                </span>
                              )}
                            </div>

                            {/* Dish Content */}
                            {dish ? (
                              <div className="space-y-2">
                                <div className="text-xs font-bold text-white leading-snug line-clamp-2">
                                  {dish.name}
                                </div>

                                {/* Category Tag */}
                                <div className="inline-block">
                                  <span
                                    className={`px-2 py-0.5 rounded text-[10px] font-bold border ${
                                      dish.category === 'family'
                                        ? 'bg-amber-500/10 text-amber-300 border-amber-500/20'
                                        : 'bg-emerald-500/10 text-emerald-300 border-emerald-500/20'
                                    }`}
                                  >
                                    {dish.category === 'family' ? '🍚 Cơm gia đình' : '🥗 Eatclean'}
                                  </span>
                                </div>

                                {/* Components Preview */}
                                {comps.length > 0 && (
                                  <div className="space-y-1 pt-1.5 border-t border-white/5 text-[10px]">
                                    {comps.map((c, cIdx) => (
                                      <div key={cIdx} className="text-slate-300">
                                        <span className="text-cyan-300 font-semibold">• {c.dishName}: </span>
                                        <span>
                                          {c.ingredients?.map((ing, i) => {
                                            const weight = formatIngredientWeight(ing.rawGrams, ing.cookedGrams);
                                            return `${ing.name}${weight ? ` (${weight})` : ''}${i < (c.ingredients?.length || 0) - 1 ? ', ' : ''}`;
                                          })}
                                        </span>
                                      </div>
                                    ))}
                                  </div>
                                )}
                              </div>
                            ) : (
                              <div className="text-[11px] text-slate-500 italic py-6 text-center">
                                Chưa chọn món cho bữa này
                              </div>
                            )}
                          </div>

                          {/* Action Buttons for Admin */}
                          <div className="mt-3 pt-2 border-t border-white/5 flex items-center gap-1.5">
                            {dish ? (
                              <>
                                <button
                                  onClick={() =>
                                    setPickerTarget({
                                      date: day,
                                      dayOfWeek: day.getDay(),
                                      meal: mealKey as 'breakfast' | 'lunch' | 'snack' | 'dinner',
                                    })
                                  }
                                  className="btn-ghost text-[10px] py-1 px-2 flex-1 justify-center text-cyan-300 border-cyan-500/30 bg-cyan-500/10 hover:bg-cyan-500/20"
                                >
                                  <RefreshCw size={11} className="mr-1" /> Đổi món
                                </button>
                                <button
                                  onClick={() => handleRemoveMealSelection(day, mealKey)}
                                  className="p-1.5 rounded-lg text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-colors"
                                  title="Xóa món"
                                >
                                  <Trash2 size={13} />
                                </button>
                              </>
                            ) : (
                              <button
                                onClick={() =>
                                  setPickerTarget({
                                    date: day,
                                    dayOfWeek: day.getDay(),
                                    meal: mealKey as 'breakfast' | 'lunch' | 'snack' | 'dinner',
                                  })
                                }
                                className="btn-primary text-[10px] py-1.5 px-2 w-full justify-center bg-gradient-to-r from-purple-500 to-indigo-600 shadow-purple-500/20"
                              >
                                <Plus size={12} className="mr-1" /> Chọn món
                              </button>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Dish Picker Modal for Admin */}
        {pickerTarget && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5"
            style={{ background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(8px)' }}
          >
            <div
              className="glass-card w-full max-w-3xl animate-fade-in p-5 shadow-2xl border-purple-500/40"
              style={{ maxHeight: '90vh', overflowY: 'auto' }}
            >
              {/* Picker Header */}
              <div className="flex items-center justify-between pb-3 border-b border-white/10 mb-4">
                <div>
                  <h3 className="text-base font-bold text-white flex items-center gap-2">
                    <UtensilsCrossed size={18} className="text-purple-400" />
                    <span>
                      Chọn món cho {MEAL_LABELS[pickerTarget.meal]} ({format(pickerTarget.date, 'EEEE, dd/MM', { locale: vi })})
                    </span>
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Chế độ: <strong className="text-cyan-300">{currentWeekDiet}</strong>
                  </p>
                </div>
                <button
                  onClick={() => setPickerTarget(null)}
                  className="p-1.5 rounded-lg hover:bg-white/10 text-slate-400 hover:text-white"
                >
                  <X size={20} />
                </button>
              </div>

              {/* Category Filter Pills (Món cơm gia đình vs Món eatclean) */}
              <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
                <div className="flex rounded-xl p-1 gap-1 bg-white/5 border border-white/10">
                  <button
                    onClick={() => setPickerCategory('family')}
                    className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                      pickerCategory === 'family'
                        ? 'bg-amber-500 text-slate-900 shadow-lg shadow-amber-500/20'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    <span>🍚</span>
                    <span>{DISH_CATEGORIES.family}</span>
                  </button>
                  <button
                    onClick={() => setPickerCategory('eatclean')}
                    className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                      pickerCategory === 'eatclean'
                        ? 'bg-emerald-500 text-slate-900 shadow-lg shadow-emerald-500/20'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    <span>🥗</span>
                    <span>{DISH_CATEGORIES.eatclean}</span>
                  </button>
                </div>

                {/* Search in picker */}
                <div className="flex items-center gap-2 bg-white/5 border border-white/10 rounded-xl px-3 py-1.5 text-xs flex-1 max-w-xs">
                  <Search size={14} className="text-slate-400 shrink-0" />
                  <input
                    className="bg-transparent text-white text-xs outline-none w-full"
                    placeholder="Tìm tên món ăn..."
                    value={pickerSearch}
                    onChange={(e) => setPickerSearch(e.target.value)}
                  />
                  {pickerSearch && (
                    <button onClick={() => setPickerSearch('')} className="text-slate-400 hover:text-white">
                      <X size={13} />
                    </button>
                  )}
                </div>
              </div>

              {/* Dishes list */}
              {filteredPickerDishes.length === 0 ? (
                <div className="p-12 text-center text-slate-400">
                  <UtensilsCrossed size={36} className="mx-auto mb-2 opacity-30 text-slate-500" />
                  <div className="text-sm">Không tìm thấy món ăn nào phù hợp</div>
                  <div className="text-xs text-slate-500 mt-1">
                    Hãy thử chuyển tab nhóm món hoặc tạo món mới trong mục &quot;Quản Lý Món Ăn&quot;.
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {filteredPickerDishes.map((dish) => {
                    const comps = getDishComponents(dish);

                    return (
                      <div
                        key={dish._id}
                        className="p-3.5 rounded-xl border border-white/10 bg-black/25 hover:border-purple-500/40 transition-all flex flex-col justify-between"
                      >
                        <div>
                          <div className="flex items-start justify-between gap-2 mb-1.5">
                            <h4 className="font-bold text-white text-xs leading-snug">{dish.name}</h4>
                            <span className="text-orange-400 text-xs font-bold shrink-0">
                              {dish.calories} kcal
                            </span>
                          </div>

                          {/* Components breakdown */}
                          <div className="space-y-1 text-[11px] text-slate-300 mb-3">
                            {comps.map((c, cIdx) => (
                              <div key={cIdx}>
                                <span className="text-cyan-300 font-semibold">• {c.dishName}: </span>
                                <span className="text-slate-400">
                                  {c.ingredients?.map((ing, i) => {
                                    const w = formatIngredientWeight(ing.rawGrams, ing.cookedGrams);
                                    return `${ing.name}${w ? ` (${w})` : ''}${i < (c.ingredients?.length || 0) - 1 ? ', ' : ''}`;
                                  })}
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>

                        <div className="pt-2 border-t border-white/5 flex items-center justify-between gap-2">
                          <button
                            type="button"
                            onClick={() => setViewDetailDish(dish)}
                            className="text-[11px] text-purple-300 hover:text-white underline"
                          >
                            Xem chi tiết định lượng
                          </button>
                          <button
                            type="button"
                            disabled={isSavingPlan}
                            onClick={() => handleSelectDishForMeal(dish)}
                            className="btn-primary text-xs py-1.5 px-3 bg-gradient-to-r from-purple-500 to-indigo-600 shadow-purple-500/20"
                          >
                            {isSavingPlan ? 'Đang chọn...' : 'Chọn món này'}
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        )}

        {/* View Dish Detail modal (Read-only view) */}
        {viewDetailDish && (
          <DishDetailModal
            dish={viewDetailDish}
            onClose={() => setViewDetailDish(null)}
            readOnly={true}
          />
        )}
      </div>
    </div>
  );
}
