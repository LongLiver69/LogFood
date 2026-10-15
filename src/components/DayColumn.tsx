'use client';

import { useState } from 'react';
import { format, isBefore, isToday } from 'date-fns';
import { Check, Lock, Info, ChevronDown, ChevronUp } from 'lucide-react';
import { Dish, DayPlan, MealSelection } from '@/types';
import { MEAL_LABELS, MEAL_CALORIES, MEAL_ORDER, DAY_LABELS } from '@/lib/constants';
import DishDetailModal from './DishDetailModal';

interface DayColumnProps {
  day: Date;
  dayPlan: DayPlan | null;
  dishes: Record<string, Dish[]>;
  dietType: string;
  onUpdateSelections: (date: Date, selections: MealSelection[]) => void;
  onRequireAuth: () => void;
  isLoggedIn: boolean;
}

export default function DayColumn({
  day,
  dayPlan,
  dishes,
  dietType,
  onUpdateSelections,
  onRequireAuth,
  isLoggedIn,
}: DayColumnProps) {
  const [selectedDish, setSelectedDish] = useState<Dish | null>(null);
  const [expandedMeals, setExpandedMeals] = useState<Record<string, boolean>>({
    breakfast: false,
    lunch: false,
    snack: false,
    dinner: false,
  });

  const isPast = isBefore(day, new Date()) && !isToday(day);
  const isLocked = isPast || (dayPlan?.isLocked ?? false);
  const selections = dayPlan?.selections || [];

  const getSelectedDishForMeal = (meal: string) =>
    selections.find((s) => s.meal === meal);

  const toggleMealList = (meal: string, e?: React.MouseEvent) => {
    e?.stopPropagation();
    setExpandedMeals((prev) => ({
      ...prev,
      [meal]: !prev[meal],
    }));
  };

  const handleToggleDish = (meal: string, dish: Dish) => {
    if (isLocked) return;
    if (!isLoggedIn) {
      onRequireAuth();
      return;
    }
    const existing = getSelectedDishForMeal(meal);
    let newSelections: MealSelection[];
    if (existing?.dishId === dish._id) {
      newSelections = selections.filter((s) => s.meal !== meal);
    } else {
      newSelections = [
        ...selections.filter((s) => s.meal !== meal),
        { meal: dish.meal, dishId: dish._id, dishName: dish.name },
      ];
    }
    onUpdateSelections(day, newSelections);
  };

  const totalCalories = selections.reduce((sum, sel) => {
    const mealDishes = dishes[sel.meal] || [];
    const d = mealDishes.find((item) => item._id === sel.dishId);
    return sum + (d?.calories || 0);
  }, 0);

  const targetCalories = parseInt(dietType);

  return (
    <div className={`flex flex-col gap-3 min-w-[210px] w-full ${isLocked && !isToday(day) ? 'opacity-65' : ''}`}>
      {/* Day Header */}
      <div
        className={`glass-card p-3 text-center transition-all ${isToday(day) ? 'pulse-glow border-cyan-400/60' : ''}`}
        style={isToday(day) ? { background: 'rgba(34,211,238,0.1)' } : {}}
      >
        <div className="text-xs text-slate-400 font-semibold mb-0.5">{DAY_LABELS[day.getDay()]}</div>
        <div className={`text-xl font-black ${isToday(day) ? 'text-cyan-400' : 'text-white'}`}>
          {format(day, 'd')}
        </div>
        <div className="text-[11px] text-slate-500">{format(day, 'MM/yyyy')}</div>
        {isLocked && !isToday(day) && (
          <div className="mt-1 inline-flex items-center gap-1 text-[10px] text-slate-400 bg-white/5 px-2 py-0.5 rounded-full">
            <Lock size={10} /> Đã kết thúc (Khóa)
          </div>
        )}

        {/* Calorie progress bar */}
        <div className="mt-2.5 pt-2 border-t border-white/5">
          <div className="flex justify-between text-[11px] font-medium text-slate-400">
            <span>Đã chọn:</span>
            <span className={totalCalories > targetCalories ? 'text-red-400 font-bold' : 'text-cyan-300 font-bold'}>
              {totalCalories}/{targetCalories} kcal
            </span>
          </div>
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

      {/* Meals for this day */}
      {MEAL_ORDER.map((meal) => {
        const mealDishes = dishes[meal] || [];
        const selected = getSelectedDishForMeal(meal);
        const selectedDishObj = mealDishes.find((d) => d._id === selected?.dishId);
        const targetCal = MEAL_CALORIES[dietType]?.[meal] || 0;
        const isExpanded = expandedMeals[meal];

        return (
          <div key={meal} className={`glass-card p-3 border meal-${meal}`}>
            <div className="flex items-center justify-between mb-1.5">
              <span className={`text-xs font-bold meal-${meal}`}>{MEAL_LABELS[meal]}</span>
              <span className="text-[10px] text-slate-400 bg-white/5 px-1.5 py-0.5 rounded font-medium">{targetCal} kcal</span>
            </div>

            {/* Selected dish card */}
            {selectedDishObj ? (
              <div
                className="dish-card selected rounded-lg p-2.5 mb-2 relative group"
                style={{ border: '1px solid rgba(34,211,238,0.5)', background: 'rgba(34,211,238,0.08)' }}
                onClick={() => setSelectedDish(selectedDishObj)}
              >
                <div className="flex items-start justify-between gap-1">
                  <span className="text-xs text-white font-semibold leading-tight">{selectedDishObj.name}</span>
                  <Check size={14} className="text-cyan-400 shrink-0 mt-0.5" />
                </div>
                <div className="flex items-center justify-between mt-1 text-[11px]">
                  <span className="text-orange-400 font-medium">{selectedDishObj.calories} kcal</span>
                  <span className="text-cyan-400 text-[10px] opacity-80 group-hover:opacity-100 flex items-center gap-0.5">
                    <Info size={10} /> Chi tiết
                  </span>
                </div>
              </div>
            ) : (
              <div className="text-[11px] text-slate-400 italic mb-2 py-1 px-2 rounded bg-white/5 border border-dashed border-white/5">
                Chưa chọn món
              </div>
            )}

            {/* Toggle collapse / expand to pick dishes */}
            {!isLocked && (
              <div className="mb-1">
                <button
                  type="button"
                  onClick={(e) => toggleMealList(meal, e)}
                  className="w-full py-1 text-[11px] font-semibold text-cyan-400 hover:text-cyan-300 flex items-center justify-between bg-white/5 hover:bg-white/10 px-2 rounded-lg transition-all"
                >
                  <span>{selectedDishObj ? 'Đổi món ăn' : 'Chọn món'} ({mealDishes.length})</span>
                  {isExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                </button>
              </div>
            )}

            {/* Collapsible list of dishes */}
            {!isLocked && isExpanded && (
              <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1 animate-fade-in pt-1 border-t border-white/5 mt-1.5">
                {mealDishes.map((dish) => {
                  const isSel = selected?.dishId === dish._id;
                  return (
                    <div
                      key={dish._id}
                      onClick={() => handleToggleDish(meal, dish)}
                      className={`dish-card rounded-lg p-2 border text-xs transition-all cursor-pointer ${
                        isSel ? 'selected border-cyan-500/60 bg-cyan-500/10' : 'border-white/10 hover:border-white/20 bg-white/5'
                      }`}
                    >
                      <div className="flex items-center justify-between gap-1">
                        <span className={`${isSel ? 'text-cyan-300 font-bold' : 'text-slate-300'} leading-tight`}>
                          {dish.name}
                        </span>
                        <div className="flex items-center gap-1 shrink-0">
                          <button
                            type="button"
                            onClick={(e) => { e.stopPropagation(); setSelectedDish(dish); }}
                            className="p-1 rounded hover:bg-white/10 text-slate-400 hover:text-white"
                            title="Xem thành phần & cách nấu"
                          >
                            <Info size={12} />
                          </button>
                        </div>
                      </div>
                      <div className="text-orange-400/80 text-[10px] mt-0.5 font-medium">{dish.calories} kcal</div>
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
