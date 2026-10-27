'use client';

import { format, addDays, startOfWeek } from 'date-fns';
import { vi } from 'date-fns/locale';
import { ChevronLeft, ChevronRight, Star, Calendar, Scale, Activity, UtensilsCrossed, Sparkles } from 'lucide-react';
import { Dish, DayPlan, MealSelection, UserProfile } from '@/types';
import DayColumn from './DayColumn';

interface WeeklyPlannerProps {
  currentWeekStart: Date | null;
  onPrevWeek: () => void;
  onNextWeek: () => void;
  onSelectWeekStart: (date: Date) => void;
  weekDays: Date[];
  weekKey: string;
  dietType: string;
  dishes: Record<string, Dish[]>;
  dayPlans: DayPlan[];
  isLoading: boolean;
  currentUser: UserProfile | null;
  onUpdateSelections: (date: Date, selections: MealSelection[]) => void;
  onOpenProfile: () => void;
  onRequireAuth: () => void;
}

export default function WeeklyPlanner({
  currentWeekStart,
  onPrevWeek,
  onNextWeek,
  onSelectWeekStart,
  weekDays,
  weekKey,
  dietType,
  dishes,
  dayPlans,
  isLoading,
  currentUser,
  onUpdateSelections,
  onOpenProfile,
  onRequireAuth,
}: WeeklyPlannerProps) {
  const getDayPlan = (date: Date) =>
    dayPlans.find((p) => {
      const planDate = new Date(p.date);
      return planDate.toDateString() === date.toDateString();
    }) || null;

  const totalSelections = dayPlans.reduce((sum, p) => sum + p.selections.length, 0);
  const plannedDaysCount = dayPlans.filter((p) => p.selections.length > 0).length;
  const noData = Object.keys(dishes).length === 0;

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.value) return;
    const picked = new Date(e.target.value);
    if (!isNaN(picked.getTime())) {
      onSelectWeekStart(startOfWeek(picked, { weekStartsOn: 1 }));
    }
  };

  const handleCurrentWeek = () => {
    onSelectWeekStart(startOfWeek(new Date(), { weekStartsOn: 1 }));
  };

  return (
    <div className="space-y-6">
      {/* User stats bar */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="glass-card p-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0 bg-cyan-400/10 text-cyan-400">
              <Star size={18} />
            </div>
            <div className="min-w-0">
              <div className="text-xs text-slate-400 font-medium">Chế độ dinh dưỡng tuần</div>
              <div className="text-sm font-bold text-white truncate">
                {dietType === '1200kcal' ? '1200 kcal' : '1000 kcal'}
              </div>
              <div className="text-[10px] text-cyan-400 font-medium truncate">
                {dietType === '1200kcal' ? '4 bữa: 300 - 420 - 120 - 360' : '4 bữa: 250 - 350 - 100 - 300'}
              </div>
            </div>
          </div>
        </div>

        <div className="glass-card p-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0 bg-purple-400/10 text-purple-400">
              <Calendar size={18} />
            </div>
            <div className="min-w-0">
              <div className="text-xs text-slate-400 font-medium">Tuần đang xem</div>
              <div className="text-sm font-bold text-white truncate">{weekKey}</div>
              <div className="text-[10px] text-purple-300 font-medium truncate">Mở chọn trước các ngày</div>
            </div>
          </div>
        </div>

        <div
          className="glass-card p-4 cursor-pointer hover:border-cyan-400/30 transition-all"
          onClick={onOpenProfile}
        >
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0 bg-emerald-400/10 text-emerald-400">
              <Scale size={18} />
            </div>
            <div className="min-w-0">
              <div className="text-xs text-slate-400 font-medium">Chiều cao &amp; Cân nặng</div>
              <div className="text-sm font-bold text-white truncate">
                {currentUser?.height && currentUser?.weight ? (
                  `${currentUser.height} cm • ${currentUser.weight} kg`
                ) : (
                  <span className="text-cyan-400 text-xs font-semibold underline">Nhấn để cập nhật</span>
                )}
              </div>
              {currentUser?.bmiInfo && (
                <div className="text-[10px] font-bold truncate" style={{ color: currentUser.bmiInfo.color }}>
                  BMI {currentUser.bmiInfo.bmi} ({currentUser.bmiInfo.status})
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="glass-card p-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0 bg-amber-400/10 text-amber-400">
              <Activity size={18} />
            </div>
            <div className="min-w-0">
              <div className="text-xs text-slate-400 font-medium">Tiến độ chọn thực đơn</div>
              <div className="text-sm font-bold text-white truncate">
                {plannedDaysCount} / 7 ngày đã chọn
              </div>
              <div className="text-[10px] text-slate-400 truncate">
                {totalSelections} món ăn trong tuần
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Week Navigator & Search Bar */}
      <div className="glass-card p-4 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <button
            onClick={onPrevWeek}
            className="btn-ghost flex items-center gap-1.5 text-xs py-2 px-3"
            title="Xem tuần trước"
          >
            <ChevronLeft size={16} /> <span className="hidden sm:inline">Tuần trước</span>
          </button>
          <button
            onClick={handleCurrentWeek}
            className="btn-ghost text-xs py-2 px-3 text-cyan-300 border-cyan-500/30 bg-cyan-500/10 hover:bg-cyan-500/20"
            title="Trở về tuần này"
          >
            Tuần này
          </button>
        </div>

        {/* Date Display */}
        <div className="text-center order-first sm:order-none w-full sm:w-auto">
          <div className="text-white font-bold text-sm sm:text-base">
            {currentWeekStart ? format(currentWeekStart, 'dd/MM', { locale: vi }) : '...'} – {currentWeekStart ? format(addDays(currentWeekStart, 6), 'dd/MM/yyyy', { locale: vi }) : '...'}
          </div>
          <div className="text-[11px] text-cyan-400 font-semibold mt-0.5">{weekKey}</div>
        </div>

        <div className="flex items-center gap-2">
          {/* Week Search Datepicker */}
          <div className="flex items-center gap-1.5 bg-slate-900/60 border border-slate-700/80 rounded-xl px-2.5 py-1.5">
            <Calendar size={14} className="text-cyan-400 shrink-0" />
            <span className="text-[11px] text-slate-400 hidden md:inline">Tìm tuần:</span>
            <input
              type="date"
              value={currentWeekStart ? format(currentWeekStart, 'yyyy-MM-dd') : ''}
              onChange={handleDateChange}
              title="Chọn ngày để chuyển đến tuần tương ứng"
              className="bg-transparent text-xs text-white outline-none cursor-pointer [color-scheme:dark]"
            />
          </div>

          <button
            onClick={onNextWeek}
            className="btn-ghost flex items-center gap-1.5 text-xs py-2 px-3"
            title="Xem tuần sau"
          >
            <span className="hidden sm:inline">Tuần sau</span> <ChevronRight size={16} />
          </button>
        </div>
      </div>

      {/* Empty dishes alert */}
      {noData && !isLoading && (
        <div className="glass-card p-8 text-center animate-fade-in border-dashed">
          <UtensilsCrossed size={48} className="mx-auto mb-4 text-slate-500" />
          <h2 className="text-lg font-bold text-white mb-1">Chưa có dữ liệu thực đơn</h2>
          <p className="text-slate-400 text-xs">
            Vui lòng liên hệ quản trị viên để cập nhật danh sách món ăn vào hệ thống.
          </p>
        </div>
      )}

      {/* Weekly Meal Grid */}
      {isLoading ? (
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="w-10 h-10 rounded-full border-2 border-cyan-400 border-t-transparent animate-spin mx-auto mb-3" />
            <div className="text-slate-400 text-xs">Đang tải kế hoạch thực đơn...</div>
          </div>
        </div>
      ) : (
        <div className="overflow-x-auto pb-6">
          <div className="flex gap-3" style={{ minWidth: 'max-content' }}>
            {weekDays.map((day) => (
              <DayColumn
                key={day.toISOString()}
                day={day}
                dayPlan={getDayPlan(day)}
                dishes={dishes}
                dietType={dietType}
                onUpdateSelections={onUpdateSelections}
                onRequireAuth={onRequireAuth}
                isLoggedIn={!!currentUser}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
