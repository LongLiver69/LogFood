'use client';

import { useState, useMemo } from 'react';
import { format, isSameDay } from 'date-fns';
import { vi } from 'date-fns/locale';
import {
  UtensilsCrossed,
  Flame,
  BookOpen,
  Calendar,
  ChevronLeft,
  ChevronRight,
  Eye,
  Clock,
  Sparkles,
  Layers,
  CheckCircle2,
  AlertCircle,
  RotateCw,
} from 'lucide-react';
import { Dish, DayPlan, UserProfile } from '@/types';
import {
  MEAL_LABELS,
  MEAL_ORDER,
  DAY_LABELS,
  DAY_FULL_LABELS,
  MEAL_CALORIES,
  DISH_CATEGORIES,
  getDishComponents,
  isNumericWeight,
  getNumericGramValue,
  formatIngredientWeight,
} from '@/lib/constants';
import DishDetailModal from '@/components/DishDetailModal';

interface UserDailyMenuProps {
  currentWeekStart: Date | null;
  onPrevWeek: () => void;
  onNextWeek: () => void;
  weekDays: Date[];
  weekKey: string;
  dietType: string;
  dayPlans: DayPlan[];
  isLoading: boolean;
  currentUser: UserProfile;
  onRefresh?: () => void;
}

// Khớp ngày an toàn giữa chuỗi ISO / UTC trong MongoDB và local date
function matchesDay(planDate: string | Date | undefined, targetDate: Date): boolean {
  if (!planDate) return false;
  const pDate = new Date(planDate);
  if (isSameDay(pDate, targetDate)) return true;
  const targetStr = format(targetDate, 'yyyy-MM-dd');
  const planIsoStr = typeof planDate === 'string' ? planDate.substring(0, 10) : pDate.toISOString().substring(0, 10);
  return targetStr === planIsoStr;
}

// Giải phóng chi tiết món ăn (fallback nếu dishDetail chưa được tải nhưng có dishName)
function resolveDish(
  selection: { meal: string; dishId: any; dishName: string; dishDetail?: Dish } | undefined,
  dietType: string,
  mealKey: string
): Dish | null {
  if (!selection) return null;
  if (selection.dishDetail) return selection.dishDetail;
  if (selection.dishName) {
    return {
      _id: String(selection.dishId || 'temp'),
      name: selection.dishName,
      meal: mealKey as any,
      dietType: (dietType || '1000kcal') as any,
      category: 'family',
      calories: 0,
      ingredients: [],
      dishComponents: [],
      cookingInstructions: '',
    };
  }
  return null;
}

export default function UserDailyMenu({
  currentWeekStart,
  onPrevWeek,
  onNextWeek,
  weekDays,
  weekKey,
  dietType,
  dayPlans,
  isLoading,
  currentUser,
  onRefresh,
}: UserDailyMenuProps) {
  // Mặc định chọn ngày hôm nay nếu nằm trong tuần hiện tại, ngược lại chọn ngày đầu tuần (Thứ 2)
  const today = useMemo(() => new Date(), []);

  const initialSelectedDay = useMemo(() => {
    const foundToday = weekDays.find((d) => isSameDay(d, today));
    return foundToday || (weekDays.length > 0 ? weekDays[0] : new Date());
  }, [weekDays, today]);

  const [selectedDate, setSelectedDate] = useState<Date>(initialSelectedDay);
  const [viewMode, setViewMode] = useState<'daily' | 'weekly'>('daily');
  const [detailDish, setDetailDish] = useState<Dish | null>(null);

  // Cập nhật selectedDate nếu weekDays thay đổi và selectedDate không thuộc tuần đó
  const activeDate = useMemo(() => {
    const isCurrentInWeek = weekDays.some((d) => isSameDay(d, selectedDate));
    if (!isCurrentInWeek && weekDays.length > 0) {
      const foundToday = weekDays.find((d) => isSameDay(d, today));
      return foundToday || weekDays[0];
    }
    return selectedDate;
  }, [weekDays, selectedDate, today]);

  // Tìm DayPlan của activeDate (khớp an toàn cả local date và UTC ISO)
  const currentDayPlan = useMemo(() => {
    return dayPlans.find((p) => matchesDay(p.date, activeDate)) || null;
  }, [dayPlans, activeDate]);

  // Định mức calo chuẩn theo bữa
  const targetCalories = MEAL_CALORIES[dietType] || MEAL_CALORIES['1000kcal'];
  const totalTargetCal = Object.values(targetCalories).reduce((a, b) => a + b, 0);

  // Tổng calo thực tế hôm nay
  const totalActualCal =
    currentDayPlan?.selections?.reduce((sum, s) => {
      const d = resolveDish(s, dietType, s.meal);
      return sum + (d?.calories || 0);
    }, 0) || 0;

  return (
    <div className="space-y-6 animate-fade-in max-w-6xl mx-auto">
      {/* Top Banner & Week Navigation */}
      <div className="glass-card p-4 sm:p-6 border-cyan-500/20 shadow-xl">
        <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-white/10">
          <div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse"></span>
              <h2 className="text-xl sm:text-2xl font-black text-white">Thực Đơn Dinh Dưỡng Của Bạn</h2>
            </div>
            <p className="text-xs sm:text-sm text-slate-300 mt-1">
              Chế độ được chỉ định: <strong className="text-cyan-300 font-bold uppercase">{dietType}</strong> (Mục tiêu: {totalTargetCal} kcal/ngày)
            </p>
          </div>

          {/* View mode toggle */}
          <div className="flex rounded-xl p-1 gap-1 bg-white/5 border border-white/10">
            <button
              onClick={() => setViewMode('daily')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                viewMode === 'daily'
                  ? 'bg-cyan-500 text-slate-900 shadow-lg shadow-cyan-500/25'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <span>☀️</span>
              <span>Xem theo ngày</span>
            </button>
            <button
              onClick={() => setViewMode('weekly')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                viewMode === 'weekly'
                  ? 'bg-cyan-500 text-slate-900 shadow-lg shadow-cyan-500/25'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <span>📅</span>
              <span>Tổng quan cả tuần</span>
            </button>
          </div>
        </div>

        {/* Week switcher & Day Pills */}
        <div className="mt-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
          {/* Week navigation */}
          <div className="flex items-center gap-2">
            <button
              onClick={onPrevWeek}
              className="btn-ghost text-xs py-1.5 px-3 flex items-center gap-1"
            >
              <ChevronLeft size={16} /> Tuần trước
            </button>
            <div className="text-center px-2">
              <span className="text-xs font-bold text-white block">
                {currentWeekStart ? format(currentWeekStart, 'dd/MM', { locale: vi }) : ''} –{' '}
                {currentWeekStart ? format(new Date(currentWeekStart.getTime() + 6 * 86400000), 'dd/MM/yyyy', { locale: vi }) : ''}
              </span>
              <span className="text-[10px] text-purple-300 font-medium">{weekKey}</span>
            </div>
            <button
              onClick={onNextWeek}
              className="btn-ghost text-xs py-1.5 px-3 flex items-center gap-1"
            >
              Tuần sau <ChevronRight size={16} />
            </button>
            {onRefresh && (
              <button
                onClick={onRefresh}
                title="Làm mới thực đơn từ máy chủ"
                className="btn-ghost text-xs py-1.5 px-2.5 flex items-center gap-1 text-cyan-400 hover:text-cyan-300 hover:bg-cyan-500/10 border-cyan-500/30"
              >
                <RotateCw size={14} className={isLoading ? 'animate-spin' : ''} />
                <span className="hidden sm:inline">Làm mới</span>
              </button>
            )}
          </div>

          {/* Quick Day Selector Pills (T2 -> CN) */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
            {weekDays.map((day) => {
              const isSelected = isSameDay(day, activeDate);
              const isCurrentDay = isSameDay(day, today);
              const dayIndex = day.getDay();
              const dayPlanForThis = dayPlans.find((p) => matchesDay(p.date, day));
              const hasMeals = (dayPlanForThis?.selections?.length || 0) > 0;

              return (
                <button
                  key={day.toISOString()}
                  onClick={() => {
                    setSelectedDate(day);
                    setViewMode('daily');
                  }}
                  className={`px-3 py-2 rounded-xl text-xs font-bold transition-all shrink-0 flex flex-col items-center min-w-[56px] relative border ${
                    isSelected
                      ? 'bg-gradient-to-b from-cyan-500 to-blue-600 text-white shadow-lg shadow-cyan-500/30 border-cyan-400'
                      : isCurrentDay
                      ? 'bg-white/10 text-cyan-300 border-cyan-400/40 hover:bg-white/15'
                      : 'bg-white/5 text-slate-300 border-white/5 hover:bg-white/10'
                  }`}
                >
                  <span className="text-[10px] uppercase opacity-80">{DAY_LABELS[dayIndex]}</span>
                  <span className="text-sm font-black mt-0.5">{format(day, 'd')}</span>
                  <div className="flex items-center gap-1 mt-1">
                    {isCurrentDay && (
                      <span className="w-1.5 h-1.5 rounded-full bg-cyan-300" title="Hôm nay"></span>
                    )}
                    {hasMeals && (
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" title="Đã có món ăn"></span>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {isLoading ? (
        <div className="glass-card p-16 text-center text-slate-400 border-white/10">
          <div className="w-10 h-10 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-sm">Đang tải thực đơn của bạn...</p>
        </div>
      ) : viewMode === 'daily' ? (
        /* DAILY VIEW: 4 Clean, Legible, Rich Cards */
        <div className="space-y-6">
          {/* Active Day Header Banner */}
          <div className="glass-card p-4 sm:p-5 flex flex-wrap items-center justify-between gap-4 border-white/10 bg-gradient-to-r from-purple-900/20 via-cyan-900/10 to-transparent">
            <div>
              <div className="flex items-center gap-2">
                <Calendar size={18} className="text-cyan-400" />
                <h3 className="text-lg sm:text-xl font-black text-white">
                  Thực đơn {DAY_FULL_LABELS[activeDate.getDay()]}, Ngày {format(activeDate, 'dd/MM/yyyy', { locale: vi })}
                </h3>
                {isSameDay(activeDate, today) && (
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-cyan-400/20 text-cyan-300 border border-cyan-400/30">
                    Hôm nay
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-400 mt-1">
                Admin đã lên thực đơn chi tiết từng món và định lượng để bạn chuẩn bị và chế biến
              </p>
            </div>

            {/* Daily Calorie Summary */}
            <div className="flex items-center gap-3 bg-white/5 px-4 py-2.5 rounded-2xl border border-white/10">
              <Flame size={20} className="text-orange-400" />
              <div>
                <div className="text-xs text-slate-400">Năng lượng cả ngày:</div>
                <div className="text-base font-bold text-white">
                  <span className="text-orange-400">{totalActualCal}</span> / {totalTargetCal} kcal
                </div>
              </div>
            </div>
          </div>

          {/* 4 Meals Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {MEAL_ORDER.map((mealKey) => {
              const selection = currentDayPlan?.selections?.find((s) => s.meal === mealKey);
              const dish = resolveDish(selection, dietType, mealKey);
              const comps = dish ? getDishComponents(dish) : [];

              return (
                <div
                  key={mealKey}
                  className={`glass-card p-5 sm:p-6 border meal-${mealKey} flex flex-col justify-between shadow-xl transition-all hover:border-cyan-400/30`}
                >
                  <div>
                    {/* Meal Header */}
                    <div className="flex items-center justify-between pb-3 border-b border-white/10 mb-4">
                      <div className="flex items-center gap-2.5">
                        <span className={`px-3 py-1 rounded-full text-xs font-bold border meal-${mealKey}`}>
                          {MEAL_LABELS[mealKey]}
                        </span>
                      </div>
                      {dish && (
                        <div className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-orange-500/10 border border-orange-500/20 text-orange-400 text-xs font-bold whitespace-nowrap shrink-0">
                          <Flame size={14} />
                          <span>{dish.calories} kcal</span>
                        </div>
                      )}
                    </div>

                    {/* Dish Content */}
                    {dish ? (
                      <div className="space-y-4">
                        {/* Dish Name & Category */}
                        <div>
                          <div className="flex flex-wrap items-center gap-2 mb-1.5">
                            <span
                              className={`px-2 py-0.5 rounded text-[10px] font-bold border ${
                                dish.category === 'family'
                                  ? 'bg-amber-500/15 text-amber-300 border-amber-500/30'
                                  : 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30'
                              }`}
                            >
                              {dish.category === 'family' ? '🍚 Món cơm gia đình' : '🥗 Món ăn eatclean'}
                            </span>
                            <span className="text-[10px] text-slate-400">{dish.dietType}</span>
                          </div>
                          <h4 className="text-base sm:text-lg font-bold text-white leading-snug">
                            {dish.name}
                          </h4>
                        </div>

                        {/* Ingredients by Sub-dish Components */}
                        <div className="space-y-2.5 pt-2 border-t border-white/10">
                          <div className="flex items-center justify-between text-xs text-cyan-400 font-bold uppercase tracking-wider">
                            <span className="flex items-center gap-1.5">
                              <UtensilsCrossed size={14} /> Thành phần &amp; Định lượng
                            </span>
                          </div>

                          <div className="space-y-2">
                            {comps.map((comp, cIdx) => (
                              <div
                                key={cIdx}
                                className="rounded-xl border border-white/10 bg-black/30 overflow-hidden"
                              >
                                {/* Component header if multi-component */}
                                {(comps.length > 1 || (comp.dishName && comp.dishName !== dish.name)) && (
                                  <div className="px-3 py-1.5 bg-white/5 border-b border-white/5 text-[11px] font-bold text-purple-300 flex items-center gap-1.5">
                                    <span className="w-1.5 h-1.5 rounded-full bg-purple-400"></span>
                                    <span>Món: {comp.dishName}</span>
                                  </div>
                                )}

                                <div className="p-2.5 space-y-1.5 text-xs">
                                  {(comp.ingredients || []).map((ing, iIdx) => {
                                    const rawTrim = ing.rawGrams !== undefined && ing.rawGrams !== null ? String(ing.rawGrams).trim() : '';
                                    const cookedTrim = ing.cookedGrams !== undefined && ing.cookedGrams !== null ? String(ing.cookedGrams).trim() : '';

                                    const rawVal =
                                      rawTrim !== '' && rawTrim !== '0' && rawTrim !== '0g'
                                        ? isNumericWeight(rawTrim)
                                          ? `${getNumericGramValue(rawTrim)}g sống`
                                          : rawTrim
                                        : null;

                                    const cookedVal =
                                      cookedTrim !== '' && cookedTrim !== '0' && cookedTrim !== '0g'
                                        ? isNumericWeight(cookedTrim)
                                          ? `${getNumericGramValue(cookedTrim)}g chín`
                                          : cookedTrim
                                        : null;

                                    return (
                                      <div
                                        key={iIdx}
                                        className="flex items-center justify-between gap-2 py-0.5 border-b border-white/[0.03] last:border-0"
                                      >
                                        <span className="font-medium text-slate-200">
                                          {ing.name}
                                        </span>
                                        <div className="flex items-center gap-2 text-[11px] font-semibold shrink-0">
                                          {rawVal && (
                                            <span className="text-amber-300 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
                                              {rawVal}
                                            </span>
                                          )}
                                          {cookedVal && (
                                            <span className="text-emerald-300 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                                              {cookedVal}
                                            </span>
                                          )}
                                        </div>
                                      </div>
                                    );
                                  })}
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Cooking Instructions (if present) */}
                        {dish.cookingInstructions && (
                          <div className="pt-2 border-t border-white/10">
                            <div className="p-3 rounded-xl bg-purple-500/10 border border-purple-500/20 text-xs text-slate-200 leading-relaxed">
                              <div className="text-[11px] font-bold text-purple-300 mb-1 flex items-center gap-1.5">
                                <BookOpen size={13} /> Hướng dẫn nấu:
                              </div>
                              <p className="whitespace-pre-line text-slate-300">
                                {dish.cookingInstructions}
                              </p>
                            </div>
                          </div>
                        )}
                      </div>
                    ) : (
                      /* Empty state: Admin hasn't scheduled this meal yet */
                      <div className="py-12 text-center text-slate-400">
                        <UtensilsCrossed size={36} className="mx-auto mb-2 opacity-30 text-slate-500" />
                        <div className="text-sm font-semibold text-slate-300">
                          Chưa có thực đơn cho bữa này
                        </div>
                        <p className="text-xs text-slate-500 mt-1 max-w-xs mx-auto">
                          Quản trị viên / Bác sĩ dinh dưỡng đang chuẩn bị thực đơn cho bạn.
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Card Footer: View Details Button */}
                  {dish && (
                    <div className="mt-4 pt-3 border-t border-white/10 flex justify-end">
                      <button
                        onClick={() => setDetailDish(dish)}
                        className="btn-ghost text-xs py-1.5 px-3 flex items-center gap-1.5 text-cyan-300 border-cyan-500/30 bg-cyan-500/10 hover:bg-cyan-500/20"
                      >
                        <Eye size={14} />
                        <span>Xem chi tiết &amp; định lượng</span>
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        /* WEEKLY OVERVIEW: 7-day compact summary table */
        <div className="glass-card p-5 border-white/10 shadow-xl overflow-x-auto">
          <div className="flex gap-4" style={{ minWidth: 'max-content' }}>
            {weekDays.map((day) => {
              const dayPlan = dayPlans.find((p) => matchesDay(p.date, day));
              const totalCal =
                dayPlan?.selections?.reduce((sum, s) => {
                  const d = resolveDish(s, dietType, s.meal);
                  return sum + (d?.calories || 0);
                }, 0) || 0;
              const isSelected = isSameDay(day, activeDate);

              return (
                <div
                  key={day.toISOString()}
                  className={`flex flex-col gap-3 min-w-[240px] w-[240px] rounded-2xl p-3 border transition-all ${
                    isSelected
                      ? 'border-cyan-400 bg-cyan-500/5 shadow-lg'
                      : 'border-white/10 bg-white/[0.02]'
                  }`}
                >
                  <div className="text-center pb-2 border-b border-white/10">
                    <span className="text-xs text-slate-400 font-bold block">
                      {DAY_LABELS[day.getDay()]}
                    </span>
                    <span className="text-base font-black text-white">{format(day, 'dd/MM')}</span>
                    <div className="mt-1 text-xs font-bold text-orange-400">
                      {totalCal} / {totalTargetCal} kcal
                    </div>
                    <button
                      onClick={() => {
                        setSelectedDate(day);
                        setViewMode('daily');
                      }}
                      className="text-[10px] text-cyan-300 hover:underline mt-1 block mx-auto"
                    >
                      Xem chi tiết ngày này →
                    </button>
                  </div>

                  {MEAL_ORDER.map((mealKey) => {
                    const sel = dayPlan?.selections?.find((s) => s.meal === mealKey);
                    const dish = resolveDish(sel, dietType, mealKey);

                    return (
                      <div
                        key={mealKey}
                        className={`p-2.5 rounded-xl border meal-${mealKey} text-xs flex flex-col justify-between`}
                        style={{ minHeight: '90px' }}
                      >
                        <div className="flex items-center justify-between text-[11px] font-bold mb-1">
                          <span className={`meal-${mealKey}`}>{MEAL_LABELS[mealKey]}</span>
                          {dish && (
                            <span className="text-orange-400 font-semibold">
                              {dish.calories} kcal
                            </span>
                          )}
                        </div>
                        {dish ? (
                          <div className="text-white font-semibold line-clamp-2 text-[11px]">
                            {dish.name}
                          </div>
                        ) : (
                          <div className="text-slate-500 italic text-[10px]">Chưa có món</div>
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

      {/* Dish Detail Modal (Read-Only) */}
      {detailDish && (
        <DishDetailModal
          dish={detailDish}
          onClose={() => setDetailDish(null)}
          readOnly={true}
        />
      )}
    </div>
  );
}

