'use client';

import { useState, useEffect, useCallback } from 'react';
import { format, startOfWeek, addDays, isBefore, isToday, getWeek, getYear } from 'date-fns';
import { vi } from 'date-fns/locale';
import {
  Calendar,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  ChevronUp,
  RotateCcw,
  Flame,
  UtensilsCrossed,
  Settings,
  Check,
  Lock,
  Info,
  X,
  Plus,
  BookOpen,
  Star,
} from 'lucide-react';
import { MEAL_LABELS, MEAL_CALORIES, MEAL_ORDER, DAY_LABELS } from '@/lib/constants';

interface Ingredient {
  name: string;
  rawGrams: number;
  cookedGrams: number;
}

interface Dish {
  _id: string;
  name: string;
  calories: number;
  meal: string;
  dietType: string;
  ingredients: Ingredient[];
  cookingInstructions: string;
}

interface MealSelection {
  meal: string;
  dishId: string;
  dishName: string;
}

interface DayPlan {
  _id?: string;
  date: string;
  weekKey: string;
  dayOfWeek: number;
  dietType: string;
  selections: MealSelection[];
  isLocked: boolean;
}

const DIET_TYPES = ['1000kcal', '1200kcal'] as const;

function getWeekKey(date: Date) {
  return `${getYear(date)}-W${String(getWeek(date, { weekStartsOn: 1 })).padStart(2, '0')}`;
}

function getWeekDays(weekStart: Date) {
  return Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));
}

// ---- Dish Detail Modal ----
function DishDetailModal({
  dish,
  onClose,
  onSelect,
  isSelected,
  isLocked,
}: {
  dish: Dish;
  onClose: () => void;
  onSelect: () => void;
  isSelected: boolean;
  isLocked: boolean;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(8px)' }}>
      <div className="glass-card w-full max-w-lg animate-fade-in" style={{ maxHeight: '90vh', overflowY: 'auto' }}>
        {/* Header */}
        <div className="p-6 border-b border-white/10">
          <div className="flex items-start justify-between">
            <div>
              <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium border meal-${dish.meal} mb-3`}>
                {MEAL_LABELS[dish.meal]}
              </div>
              <h2 className="text-xl font-bold text-white">{dish.name}</h2>
              <div className="flex items-center gap-2 mt-2">
                <Flame size={16} className="text-orange-400" />
                <span className="text-orange-400 font-semibold">{dish.calories} kcal</span>
              </div>
            </div>
            <button onClick={onClose} className="p-2 rounded-lg hover:bg-white/10 text-slate-400 hover:text-white transition-colors">
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Ingredients */}
        <div className="p-6 space-y-4">
          <div>
            <h3 className="text-sm font-semibold text-cyan-400 uppercase tracking-wider mb-3 flex items-center gap-2">
              <UtensilsCrossed size={14} />
              Thành phần & Định lượng
            </h3>
            <div className="overflow-hidden rounded-xl border border-white/10">
              <table className="w-full text-sm">
                <thead>
                  <tr style={{ background: 'rgba(255,255,255,0.05)' }}>
                    <th className="px-4 py-3 text-left text-slate-400 font-medium">Thực phẩm</th>
                    <th className="px-4 py-3 text-center text-slate-400 font-medium">Sống (g)</th>
                    <th className="px-4 py-3 text-center text-slate-400 font-medium">Chín (g)</th>
                  </tr>
                </thead>
                <tbody>
                  {dish.ingredients.map((ing, i) => (
                    <tr key={i} className="border-t border-white/5 hover:bg-white/5 transition-colors">
                      <td className="px-4 py-3 text-white">{ing.name}</td>
                      <td className="px-4 py-3 text-center text-amber-400 font-medium">{ing.rawGrams}</td>
                      <td className="px-4 py-3 text-center text-emerald-400 font-medium">{ing.cookedGrams}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Cooking Instructions */}
          {dish.cookingInstructions && (
            <div>
              <h3 className="text-sm font-semibold text-purple-400 uppercase tracking-wider mb-3 flex items-center gap-2">
                <BookOpen size={14} />
                Hướng dẫn nấu
              </h3>
              <div className="rounded-xl p-4" style={{ background: 'rgba(168,85,247,0.08)', border: '1px solid rgba(168,85,247,0.2)' }}>
                <p className="text-slate-300 leading-relaxed text-sm">{dish.cookingInstructions}</p>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-white/10">
          {isLocked ? (
            <div className="flex items-center gap-2 text-slate-400 text-sm">
              <Lock size={16} />
              <span>Ngày này đã bị khóa, không thể chỉnh sửa</span>
            </div>
          ) : (
            <button
              onClick={() => { onSelect(); onClose(); }}
              className={isSelected ? 'btn-danger w-full justify-center' : 'btn-primary w-full justify-center'}
            >
              {isSelected ? <><X size={16} />Bỏ chọn món này</> : <><Check size={16} />Chọn món này</>}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

// ---- Day Column ----
function DayColumn({
  day,
  dayPlan,
  dishes,
  dietType,
  onUpdateSelections,
}: {
  day: Date;
  dayPlan: DayPlan | null;
  dishes: Record<string, Dish[]>;
  dietType: string;
  onUpdateSelections: (date: Date, selections: MealSelection[]) => void;
}) {
  const [selectedDish, setSelectedDish] = useState<Dish | null>(null);
  const [expandedMeals, setExpandedMeals] = useState<Record<string, boolean>>({});
  const isPast = isBefore(day, new Date()) && !isToday(day);
  const isLocked = isPast || (dayPlan?.isLocked ?? false);
  const selections = dayPlan?.selections || [];

  const getSelectedDishForMeal = (meal: string) =>
    selections.find((s) => s.meal === meal);

  const toggleMealList = (meal: string, currentState: boolean) => {
    setExpandedMeals((prev) => ({
      ...prev,
      [meal]: !currentState,
    }));
  };

  const handleToggleDish = (meal: string, dish: Dish) => {
    if (isLocked) return;
    const existing = getSelectedDishForMeal(meal);
    let newSelections: MealSelection[];
    if (existing?.dishId === dish._id) {
      newSelections = selections.filter((s) => s.meal !== meal);
      // Khi bỏ chọn món thì mở lại danh sách để người dùng chọn món khác
      setExpandedMeals((prev) => ({ ...prev, [meal]: true }));
    } else {
      newSelections = [
        ...selections.filter((s) => s.meal !== meal),
        { meal, dishId: dish._id, dishName: dish.name },
      ];
      // Sau khi chọn xong món thì tự động đóng danh sách lại cho gọn
      setExpandedMeals((prev) => ({ ...prev, [meal]: false }));
    }
    onUpdateSelections(day, newSelections);
  };

  const totalCalories = selections.reduce((sum, sel) => {
    const mealDishes = dishes[sel.meal] || [];
    const d = mealDishes.find((d) => d._id === sel.dishId);
    return sum + (d?.calories || 0);
  }, 0);

  const targetCalories = parseInt(dietType);

  return (
    <div className={`flex flex-col gap-3 min-w-[200px] ${isLocked && !isToday(day) ? 'opacity-60' : ''}`}>
      {/* Day Header */}
      <div className={`glass-card p-3 text-center ${isToday(day) ? 'pulse-glow' : ''}`}
        style={isToday(day) ? { borderColor: 'rgba(34,211,238,0.6)', background: 'rgba(34,211,238,0.1)' } : {}}
      >
        <div className="text-xs text-slate-400 mb-1">{DAY_LABELS[day.getDay()]}</div>
        <div className="text-xs text-slate-500">{format(day, 'dd/MM/yyyy')}</div>
        {isLocked && !isToday(day) && (
          <div className="mt-1 flex items-center justify-center gap-1 text-xs text-slate-500">
            <Lock size={10} /> Đã khóa
          </div>
        )}
        {/* Calorie progress */}
        <div className="mt-2">
          <div className="text-xs text-slate-400">{totalCalories}/{targetCalories} kcal</div>
          <div className="mt-1 h-1.5 rounded-full bg-white/10 overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-500"
              style={{
                width: `${Math.min(100, (totalCalories / targetCalories) * 100)}%`,
                background: totalCalories > targetCalories
                  ? 'linear-gradient(90deg, #ef4444, #dc2626)'
                  : 'linear-gradient(90deg, #22d3ee, #0891b2)',
              }}
            />
          </div>
        </div>
      </div>

      {/* Meals */}
      {MEAL_ORDER.map((meal) => {
        const mealDishes = dishes[meal] || [];
        const selected = getSelectedDishForMeal(meal);
        const selectedDishObj = mealDishes.find((d) => d._id === selected?.dishId);
        const targetCal = MEAL_CALORIES[dietType]?.[meal] || 0;
        const isExpanded = expandedMeals[meal] ?? !selectedDishObj;

        return (
          <div key={meal} className={`glass-card p-3 border meal-${meal}`}>
            <div className="flex items-center justify-between mb-2">
              <div className={`text-xs font-semibold meal-${meal}`}>{MEAL_LABELS[meal]}</div>
              <div className="text-xs text-slate-400 font-medium">{targetCal} kcal</div>
            </div>

            {selectedDishObj ? (
              <div className="mb-2">
                <div
                  className="dish-card selected rounded-lg p-2 transition-all cursor-pointer hover:border-cyan-400/60"
                  style={{ border: '1px solid rgba(34,211,238,0.5)', background: 'rgba(34,211,238,0.08)' }}
                  onClick={() => setSelectedDish(selectedDishObj)}
                  title="Bấm để xem chi tiết"
                >
                  <div className="flex items-start justify-between gap-1">
                    <span className="text-xs text-white font-medium leading-tight">{selectedDishObj.name}</span>
                    <Check size={12} className="text-cyan-400 shrink-0 mt-0.5" />
                  </div>
                  <div className="flex items-center justify-between text-xs mt-1">
                    <span className="text-orange-400 font-medium">{selectedDishObj.calories} kcal</span>
                    <span className="text-[10px] text-slate-400 hover:text-cyan-300 flex items-center gap-0.5">
                      <Info size={10} /> Chi tiết
                    </span>
                  </div>
                </div>

                {!isLocked && (
                  <div className="mt-1.5 flex items-center justify-between">
                    <button
                      type="button"
                      onClick={() => toggleMealList(meal, isExpanded)}
                      className="text-[11px] font-medium text-cyan-400 hover:text-cyan-300 flex items-center gap-1 px-1.5 py-0.5 rounded hover:bg-cyan-400/10 transition-colors"
                    >
                      {isExpanded ? (
                        <>
                          <ChevronUp size={12} /> Thu gọn danh sách
                        </>
                      ) : (
                        <>
                          <RotateCcw size={11} /> Chọn lại
                        </>
                      )}
                    </button>
                    <span className="text-[10px] text-slate-500">
                      {mealDishes.length} món
                    </span>
                  </div>
                )}
              </div>
            ) : (
              <div className="mb-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-500 italic">Chưa chọn món</span>
                  {!isLocked && mealDishes.length > 0 && (
                    <button
                      type="button"
                      onClick={() => toggleMealList(meal, isExpanded)}
                      className="text-[11px] text-cyan-400 hover:text-cyan-300 flex items-center gap-0.5"
                    >
                      {isExpanded ? (
                        <>
                          <ChevronUp size={12} /> Đóng
                        </>
                      ) : (
                        <>
                          <ChevronDown size={12} /> Chọn món ({mealDishes.length})
                        </>
                      )}
                    </button>
                  )}
                </div>
              </div>
            )}

            {!isLocked && isExpanded && (
              <div className="space-y-1 max-h-40 overflow-y-auto pr-1 animate-fade-in pt-1 border-t border-white/5">
                {mealDishes.map((dish) => {
                  const isSel = selected?.dishId === dish._id;
                  return (
                    <div
                      key={dish._id}
                      onClick={() => handleToggleDish(meal, dish)}
                      className={`dish-card rounded-lg p-2 border text-xs transition-all cursor-pointer ${isSel
                        ? 'selected border-cyan-500/50'
                        : 'border-white/10 hover:border-white/20'
                        }`}
                      style={{ background: isSel ? 'rgba(34,211,238,0.08)' : 'rgba(255,255,255,0.02)' }}
                    >
                      <div className="flex items-center justify-between gap-1">
                        <span className={`${isSel ? 'text-cyan-300 font-medium' : 'text-slate-300'} leading-tight`}>{dish.name}</span>
                        <div className="flex items-center gap-1 shrink-0">
                          <button
                            onClick={(e) => { e.stopPropagation(); setSelectedDish(dish); }}
                            className="p-0.5 rounded hover:bg-white/10 text-slate-400 hover:text-white transition-colors"
                            title="Xem chi tiết"
                          >
                            <Info size={10} />
                          </button>
                        </div>
                      </div>
                      <div className="text-orange-400/70 mt-0.5">{dish.calories} kcal</div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        );
      })}

      {/* Dish detail modal */}
      {selectedDish && (
        <DishDetailModal
          dish={selectedDish}
          onClose={() => setSelectedDish(null)}
          onSelect={() => handleToggleDish(selectedDish.meal, selectedDish)}
          isSelected={!!getSelectedDishForMeal(selectedDish.meal)?.dishId && getSelectedDishForMeal(selectedDish.meal)?.dishId === selectedDish._id}
          isLocked={isLocked}
        />
      )}
    </div>
  );
}

// ---- Main Page ----
export default function HomePage() {
  const [currentWeekStart, setCurrentWeekStart] = useState<Date | null>(null);

  useEffect(() => {
    setCurrentWeekStart(startOfWeek(new Date(), { weekStartsOn: 1 }));
  }, []);
  const [dietType, setDietType] = useState<string>('1000kcal');
  const [dishes, setDishes] = useState<Record<string, Dish[]>>({});
  const [dayPlans, setDayPlans] = useState<DayPlan[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isSeeding, setIsSeeding] = useState(false);
  const [saveMessage, setSaveMessage] = useState('');
  const [activeView, setActiveView] = useState<'week' | 'admin'>('week');

  const weekDays = currentWeekStart ? getWeekDays(currentWeekStart) : [];
  const weekKey = currentWeekStart ? getWeekKey(currentWeekStart) : '';

  // Load dishes
  const loadDishes = useCallback(async () => {
    try {
      const res = await fetch(`/api/dishes?dietType=${dietType}`);
      const data = await res.json();
      if (data.success) {
        const grouped: Record<string, Dish[]> = {};
        data.data.forEach((d: Dish) => {
          if (!grouped[d.meal]) grouped[d.meal] = [];
          grouped[d.meal].push(d);
        });
        setDishes(grouped);
      }
    } catch (err) {
      console.error('Failed to load dishes', err);
    }
  }, [dietType]);

  // Load day plans for current week
  const loadDayPlans = useCallback(async () => {
    try {
      const res = await fetch(`/api/dayplans?userId=guest&weekKey=${weekKey}`);
      const data = await res.json();
      if (data.success) {
        setDayPlans(data.data);
      }
    } catch (err) {
      console.error('Failed to load day plans', err);
    }
  }, [weekKey]);

  useEffect(() => {
    setIsLoading(true);
    Promise.all([loadDishes(), loadDayPlans()]).finally(() => setIsLoading(false));
  }, [loadDishes, loadDayPlans]);

  const getDayPlan = (date: Date) =>
    dayPlans.find((p) => {
      const planDate = new Date(p.date);
      return planDate.toDateString() === date.toDateString();
    }) || null;

  const handleUpdateSelections = async (date: Date, selections: MealSelection[]) => {
    setIsSaving(true);
    try {
      const dateStr = format(date, 'yyyy-MM-dd');
      const res = await fetch('/api/dayplans', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: 'guest',
          date: dateStr,
          weekKey,
          dayOfWeek: date.getDay(),
          dietType,
          selections,
        }),
      });
      const data = await res.json();
      if (data.success) {
        await loadDayPlans();
        setSaveMessage('Đã lưu!');
        setTimeout(() => setSaveMessage(''), 2000);
      }
    } catch (err) {
      console.error('Failed to save', err);
    } finally {
      setIsSaving(false);
    }
  };

  const handleSeedData = async () => {
    setIsSeeding(true);
    try {
      const res = await fetch('/api/dishes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ seed: true }),
      });
      const data = await res.json();
      if (data.success) {
        await loadDishes();
        setSaveMessage('Đã thêm dữ liệu mẫu!');
        setTimeout(() => setSaveMessage(''), 3000);
      }
    } catch (err) {
      console.error('Failed to seed', err);
    } finally {
      setIsSeeding(false);
    }
  };

  // Total selections for this week
  const totalSelections = dayPlans.reduce((sum, p) => sum + p.selections.length, 0);

  const noData = Object.keys(dishes).length === 0;

  return (
    <div className="hero-bg min-h-screen">
      {/* Header */}
      <header className="sticky top-0 z-40 glass-card rounded-none border-x-0 border-t-0 px-4 py-3">
        <div className="max-w-screen-2xl mx-auto flex items-center justify-between gap-4">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center"
              style={{ background: 'linear-gradient(135deg, #22d3ee, #a855f7)' }}>
              <UtensilsCrossed size={20} className="text-white" />
            </div>
            <div>
              <h1 className="text-lg font-bold gradient-text">LogFood</h1>
              <p className="text-xs text-slate-400">Quản lý thực đơn giảm cân</p>
            </div>
          </div>

          {/* Diet type selector */}
          <div className="flex items-center gap-2">
            <span className="text-sm text-slate-400 hidden sm:block">Chế độ:</span>
            <div className="flex rounded-xl p-1 gap-1" style={{ background: 'rgba(255,255,255,0.05)' }}>
              {DIET_TYPES.map((type) => (
                <button
                  key={type}
                  onClick={() => setDietType(type)}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${dietType === type
                    ? 'text-white'
                    : 'text-slate-400 hover:text-white'
                    }`}
                  style={dietType === type ? { background: 'linear-gradient(135deg, #22d3ee, #0891b2)' } : {}}
                >
                  {type}
                </button>
              ))}
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2">
            {saveMessage && (
              <span className="text-xs text-emerald-400 flex items-center gap-1 animate-fade-in">
                <Check size={12} /> {saveMessage}
              </span>
            )}
            {isSaving && <span className="text-xs text-cyan-400">Đang lưu...</span>}
            <button
              onClick={() => setActiveView(activeView === 'week' ? 'admin' : 'week')}
              className={`btn-ghost flex items-center gap-2 text-sm ${activeView === 'admin' ? 'text-cyan-400 border-cyan-400/30' : ''}`}
            >
              <Settings size={16} />
              <span className="hidden sm:inline">{activeView === 'admin' ? 'Xem tuần' : 'Quản trị'}</span>
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-screen-2xl mx-auto p-4">
        {/* Stats bar */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
          {[
            { label: 'Chế độ', value: dietType, icon: Star, color: '#22d3ee' },
            { label: 'Tuần hiện tại', value: weekKey, icon: Calendar, color: '#a855f7' },
            { label: 'Bữa đã chọn', value: `${totalSelections} bữa`, icon: Check, color: '#10b981' },
            { label: 'Món ăn', value: `${Object.values(dishes).flat().length} món`, icon: UtensilsCrossed, color: '#f59e0b' },
          ].map(({ label, value, icon: Icon, color }) => (
            <div key={label} className="glass-card p-4">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
                  style={{ background: `${color}20` }}>
                  <Icon size={16} style={{ color }} />
                </div>
                <div className="min-w-0">
                  <div className="text-xs text-slate-400">{label}</div>
                  <div className="text-sm font-semibold text-white truncate">{value}</div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {activeView === 'week' ? (
          <>
            {/* Week navigator */}
            <div className="glass-card p-4 mb-6 flex items-center justify-between">
              <button
                onClick={() => currentWeekStart && setCurrentWeekStart(addDays(currentWeekStart, -7))}
                className="btn-ghost flex items-center gap-2 text-sm"
              >
                <ChevronLeft size={18} /> Tuần trước
              </button>
              <div className="text-center">
                <div className="text-white font-semibold">
                  {currentWeekStart ? format(currentWeekStart, 'dd/MM', { locale: vi }) : '...'} – {currentWeekStart ? format(addDays(currentWeekStart, 6), 'dd/MM/yyyy', { locale: vi }) : '...'}
                </div>
                <div className="text-xs text-slate-400 mt-0.5">{weekKey}</div>
              </div>
              <button
                onClick={() => currentWeekStart && setCurrentWeekStart(addDays(currentWeekStart, 7))}
                className="btn-ghost flex items-center gap-2 text-sm"
              >
                Tuần sau <ChevronRight size={18} />
              </button>
            </div>

            {/* No data alert */}
            {noData && !isLoading && (
              <div className="glass-card p-8 text-center mb-6 animate-fade-in">
                <UtensilsCrossed size={48} className="mx-auto mb-4 text-slate-500" />
                <h2 className="text-xl font-bold text-white mb-2">Chưa có dữ liệu món ăn</h2>
                <p className="text-slate-400 mb-6">Hãy thêm dữ liệu mẫu để bắt đầu sử dụng</p>
                <button onClick={handleSeedData} disabled={isSeeding} className="btn-primary mx-auto">
                  <Plus size={16} />
                  {isSeeding ? 'Đang thêm...' : 'Thêm dữ liệu mẫu'}
                </button>
              </div>
            )}

            {/* Week grid */}
            {isLoading ? (
              <div className="flex items-center justify-center h-64">
                <div className="text-center">
                  <div className="w-12 h-12 rounded-full border-2 border-cyan-400 border-t-transparent animate-spin mx-auto mb-4"></div>
                  <div className="text-slate-400">Đang tải dữ liệu...</div>
                </div>
              </div>
            ) : (
              <div className="overflow-x-auto pb-4">
                <div className="flex gap-3" style={{ minWidth: 'max-content' }}>
                  {weekDays.map((day) => (
                    <DayColumn
                      key={day.toISOString()}
                      day={day}
                      dayPlan={getDayPlan(day)}
                      dishes={dishes}
                      dietType={dietType}
                      onUpdateSelections={handleUpdateSelections}
                    />
                  ))}
                </div>
              </div>
            )}
          </>
        ) : (
          <AdminView dishes={dishes} onRefresh={loadDishes} onSeed={handleSeedData} isSeeding={isSeeding} />
        )}
      </main>
    </div>
  );
}

// ---- Admin View ----
function AdminView({
  dishes,
  onRefresh,
  onSeed,
  isSeeding,
}: {
  dishes: Record<string, Dish[]>;
  onRefresh: () => void;
  onSeed: () => void;
  isSeeding: boolean;
}) {
  const [activeTab, setActiveTab] = useState('breakfast');
  const [showForm, setShowForm] = useState(false);
  const [editingDish, setEditingDish] = useState<Dish | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    calories: '',
    meal: 'breakfast',
    dietType: '1000kcal',
    cookingInstructions: '',
    ingredients: [{ name: '', rawGrams: '', cookedGrams: '' }],
  });
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState('');

  const allDishes = Object.values(dishes).flat();

  const resetForm = () => {
    setFormData({
      name: '',
      calories: '',
      meal: 'breakfast',
      dietType: '1000kcal',
      cookingInstructions: '',
      ingredients: [{ name: '', rawGrams: '', cookedGrams: '' }],
    });
    setEditingDish(null);
  };

  const handleEdit = (dish: Dish) => {
    setEditingDish(dish);
    setFormData({
      name: dish.name,
      calories: String(dish.calories),
      meal: dish.meal,
      dietType: dish.dietType,
      cookingInstructions: dish.cookingInstructions,
      ingredients: dish.ingredients.map((i) => ({
        name: i.name,
        rawGrams: String(i.rawGrams),
        cookedGrams: String(i.cookedGrams),
      })),
    });
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Bạn có chắc muốn xóa món này?')) return;
    try {
      const res = await fetch(`/api/dishes/${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        setMessage('Đã xóa!');
        onRefresh();
        setTimeout(() => setMessage(''), 2000);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleSubmit = async () => {
    setIsSaving(true);
    try {
      const payload = {
        name: formData.name,
        calories: Number(formData.calories),
        meal: formData.meal,
        dietType: formData.dietType,
        cookingInstructions: formData.cookingInstructions,
        ingredients: formData.ingredients
          .filter((i) => i.name)
          .map((i) => ({
            name: i.name,
            rawGrams: Number(i.rawGrams),
            cookedGrams: Number(i.cookedGrams),
          })),
      };

      const url = editingDish ? `/api/dishes/${editingDish._id}` : '/api/dishes';
      const method = editingDish ? 'PUT' : 'POST';
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (data.success) {
        setMessage(editingDish ? 'Đã cập nhật!' : 'Đã thêm mới!');
        onRefresh();
        resetForm();
        setShowForm(false);
        setTimeout(() => setMessage(''), 2000);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsSaving(false);
    }
  };

  const addIngredient = () => {
    setFormData((f) => ({
      ...f,
      ingredients: [...f.ingredients, { name: '', rawGrams: '', cookedGrams: '' }],
    }));
  };

  const updateIngredient = (idx: number, field: string, value: string) => {
    setFormData((f) => ({
      ...f,
      ingredients: f.ingredients.map((ing, i) => (i === idx ? { ...ing, [field]: value } : ing)),
    }));
  };

  const removeIngredient = (idx: number) => {
    setFormData((f) => ({
      ...f,
      ingredients: f.ingredients.filter((_, i) => i !== idx),
    }));
  };

  const tabDishes = dishes[activeTab] || [];

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Admin header */}
      <div className="glass-card p-6">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <Settings size={20} className="text-cyan-400" />
              Quản Trị Món Ăn
            </h2>
            <p className="text-slate-400 text-sm mt-1">Thêm, sửa, xóa danh sách món ăn trong hệ thống</p>
          </div>
          <div className="flex items-center gap-3">
            {message && (
              <span className="text-emerald-400 text-sm flex items-center gap-1">
                <Check size={14} /> {message}
              </span>
            )}
            <button onClick={onSeed} disabled={isSeeding} className="btn-ghost text-sm flex items-center gap-2">
              <Star size={14} />
              {isSeeding ? 'Đang thêm...' : 'Dữ liệu mẫu'}
            </button>
            <button
              onClick={() => { resetForm(); setShowForm(!showForm); }}
              className="btn-primary text-sm"
            >
              <Plus size={16} />
              Thêm món mới
            </button>
          </div>
        </div>
      </div>

      {/* Add/Edit Form */}
      {showForm && (
        <div className="glass-card p-6 animate-fade-in">
          <h3 className="text-lg font-bold text-white mb-6">
            {editingDish ? 'Chỉnh sửa món ăn' : 'Thêm món ăn mới'}
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-slate-400 mb-1.5">Tên món *</label>
              <input
                className="input-dark"
                placeholder="VD: Cơm gạo lứt ức gà"
                value={formData.name}
                onChange={(e) => setFormData((f) => ({ ...f, name: e.target.value }))}
              />
            </div>
            <div>
              <label className="block text-sm text-slate-400 mb-1.5">Calories (kcal) *</label>
              <input
                className="input-dark"
                type="number"
                placeholder="VD: 250"
                value={formData.calories}
                onChange={(e) => setFormData((f) => ({ ...f, calories: e.target.value }))}
              />
            </div>
            <div>
              <label className="block text-sm text-slate-400 mb-1.5">Bữa ăn *</label>
              <select
                className="input-dark"
                value={formData.meal}
                onChange={(e) => setFormData((f) => ({ ...f, meal: e.target.value }))}
              >
                {Object.entries(MEAL_LABELS).map(([k, v]) => (
                  <option key={k} value={k} style={{ background: '#1e293b' }}>{v}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm text-slate-400 mb-1.5">Chế độ *</label>
              <select
                className="input-dark"
                value={formData.dietType}
                onChange={(e) => setFormData((f) => ({ ...f, dietType: e.target.value }))}
              >
                <option value="1000kcal" style={{ background: '#1e293b' }}>1000 kcal</option>
                <option value="1200kcal" style={{ background: '#1e293b' }}>1200 kcal</option>
              </select>
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm text-slate-400 mb-1.5">Hướng dẫn nấu</label>
              <textarea
                className="input-dark"
                rows={3}
                placeholder="Mô tả cách nấu món ăn..."
                value={formData.cookingInstructions}
                onChange={(e) => setFormData((f) => ({ ...f, cookingInstructions: e.target.value }))}
              />
            </div>
          </div>

          {/* Ingredients */}
          <div className="mt-6">
            <div className="flex items-center justify-between mb-3">
              <label className="text-sm font-semibold text-cyan-400">Thành phần & Định lượng</label>
              <button onClick={addIngredient} className="btn-ghost text-xs flex items-center gap-1.5 py-1.5">
                <Plus size={12} /> Thêm nguyên liệu
              </button>
            </div>
            <div className="space-y-2">
              {formData.ingredients.map((ing, idx) => (
                <div key={idx} className="grid grid-cols-[1fr,100px,100px,36px] gap-2">
                  <input
                    className="input-dark text-sm"
                    placeholder="Tên nguyên liệu"
                    value={ing.name}
                    onChange={(e) => updateIngredient(idx, 'name', e.target.value)}
                  />
                  <input
                    className="input-dark text-sm"
                    type="number"
                    placeholder="Sống (g)"
                    value={ing.rawGrams}
                    onChange={(e) => updateIngredient(idx, 'rawGrams', e.target.value)}
                  />
                  <input
                    className="input-dark text-sm"
                    type="number"
                    placeholder="Chín (g)"
                    value={ing.cookedGrams}
                    onChange={(e) => updateIngredient(idx, 'cookedGrams', e.target.value)}
                  />
                  <button
                    onClick={() => removeIngredient(idx)}
                    className="btn-danger py-2 px-2 flex items-center justify-center"
                    style={{ fontSize: '12px' }}
                  >
                    <X size={14} />
                  </button>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-6 flex items-center gap-3">
            <button onClick={handleSubmit} disabled={isSaving || !formData.name} className="btn-primary">
              <Check size={16} />
              {isSaving ? 'Đang lưu...' : editingDish ? 'Cập nhật' : 'Thêm mới'}
            </button>
            <button onClick={() => { resetForm(); setShowForm(false); }} className="btn-ghost">
              Hủy
            </button>
          </div>
        </div>
      )}

      {/* Dish list by meal tabs */}
      <div className="glass-card overflow-hidden">
        {/* Tabs */}
        <div className="flex border-b border-white/10 overflow-x-auto">
          {MEAL_ORDER.map((meal) => (
            <button
              key={meal}
              onClick={() => setActiveTab(meal)}
              className={`px-5 py-4 text-sm font-medium whitespace-nowrap transition-all border-b-2 ${activeTab === meal
                ? 'border-cyan-400 text-cyan-400'
                : 'border-transparent text-slate-400 hover:text-white'
                }`}
            >
              {MEAL_LABELS[meal]}
              <span className="ml-2 px-1.5 py-0.5 rounded-full text-xs"
                style={{ background: 'rgba(255,255,255,0.1)' }}>
                {(dishes[meal] || []).length}
              </span>
            </button>
          ))}
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          {tabDishes.length === 0 ? (
            <div className="p-12 text-center text-slate-400">
              <UtensilsCrossed size={36} className="mx-auto mb-3 opacity-50" />
              <div>Chưa có món ăn nào</div>
            </div>
          ) : (
            <table className="w-full">
              <thead>
                <tr style={{ background: 'rgba(255,255,255,0.03)' }}>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">Tên món</th>
                  <th className="px-6 py-4 text-center text-xs font-semibold text-slate-400 uppercase tracking-wider">Calories</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">Nguyên liệu</th>
                  <th className="px-6 py-4 text-center text-xs font-semibold text-slate-400 uppercase tracking-wider">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {tabDishes.map((dish) => (
                  <tr key={dish._id} className="hover:bg-white/3 transition-colors">
                    <td className="px-6 py-4">
                      <div className="font-medium text-white">{dish.name}</div>
                      <div className="text-xs text-slate-500 mt-0.5">{dish.dietType}</div>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className="px-2.5 py-1 rounded-full text-xs font-semibold text-orange-400"
                        style={{ background: 'rgba(251,146,60,0.1)', border: '1px solid rgba(251,146,60,0.2)' }}>
                        {dish.calories} kcal
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-wrap gap-1">
                        {dish.ingredients.slice(0, 3).map((ing, i) => (
                          <span key={i} className="px-2 py-0.5 rounded text-xs text-slate-300"
                            style={{ background: 'rgba(255,255,255,0.06)' }}>
                            {ing.name} ({ing.rawGrams}g)
                          </span>
                        ))}
                        {dish.ingredients.length > 3 && (
                          <span className="text-xs text-slate-500">+{dish.ingredients.length - 3} khác</span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() => handleEdit(dish)}
                          className="px-3 py-1.5 rounded-lg text-xs font-medium text-cyan-400 transition-all hover:bg-cyan-400/10"
                          style={{ border: '1px solid rgba(34,211,238,0.3)' }}
                        >
                          Sửa
                        </button>
                        <button
                          onClick={() => handleDelete(dish._id)}
                          className="px-3 py-1.5 rounded-lg text-xs font-medium text-red-400 transition-all hover:bg-red-400/10"
                          style={{ border: '1px solid rgba(239,68,68,0.3)' }}
                        >
                          Xóa
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}
