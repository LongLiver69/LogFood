'use client';

import { Flame, UtensilsCrossed, BookOpen, X, Check, Lock, Layers } from 'lucide-react';
import { Dish } from '@/types';
import {
  MEAL_LABELS,
  DISH_CATEGORIES,
  getDishComponents,
  isNumericWeight,
  getNumericGramValue,
} from '@/lib/constants';

interface DishDetailModalProps {
  dish: Dish;
  onClose: () => void;
  onSelect?: () => void;
  isSelected?: boolean;
  isLocked?: boolean;
  readOnly?: boolean;
}

export default function DishDetailModal({
  dish,
  onClose,
  onSelect,
  isSelected = false,
  isLocked = false,
  readOnly = false,
}: DishDetailModalProps) {
  const components = getDishComponents(dish);
  const categoryLabel = dish.category && DISH_CATEGORIES[dish.category]
    ? DISH_CATEGORIES[dish.category]
    : 'Món ăn dinh dưỡng';
  const isFamily = dish.category === 'family';

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(8px)' }}
    >
      <div className="glass-card w-full max-w-xl animate-fade-in shadow-2xl border-white/15" style={{ maxHeight: '90vh', overflowY: 'auto' }}>
        {/* Header */}
        <div className="p-6 border-b border-white/10">
          <div className="flex items-start justify-between gap-3">
            <div>
              <div className="flex flex-wrap items-center gap-2 mb-2">
                <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border meal-${dish.meal}`}>
                  {MEAL_LABELS[dish.meal] || dish.meal}
                </span>
                <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-white/10 text-slate-300 border border-white/10">
                  {dish.dietType}
                </span>
                <span
                  className={`px-2.5 py-1 rounded-full text-xs font-semibold border ${
                    isFamily
                      ? 'bg-amber-500/15 text-amber-300 border-amber-500/30'
                      : 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30'
                  }`}
                >
                  {isFamily ? '🍚 ' : '🥗 '}
                  {categoryLabel}
                </span>
              </div>
              <h2 className="text-xl sm:text-2xl font-bold text-white leading-snug">{dish.name}</h2>
              <div className="flex items-center gap-2 mt-2">
                <Flame size={18} className="text-orange-400" />
                <span className="text-orange-400 font-bold text-base">{dish.calories} kcal</span>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-xl hover:bg-white/10 text-slate-400 hover:text-white transition-colors shrink-0"
              title="Đóng"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Content: Ingredients & Cooking Instructions */}
        <div className="p-6 space-y-6">
          {/* Ingredients Breakdown */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-bold text-cyan-400 uppercase tracking-wider flex items-center gap-2">
                <UtensilsCrossed size={16} />
                Thành phần định lượng
              </h3>
              {components.length > 1 && (
                <span className="text-[11px] text-slate-400 flex items-center gap-1 font-medium bg-white/5 px-2.5 py-1 rounded-lg border border-white/5">
                  <Layers size={13} className="text-purple-400" />
                  Gồm {components.length} món thành phần
                </span>
              )}
            </div>

            {/* List components */}
            <div className="space-y-4">
              {components.map((comp, compIdx) => (
                <div
                  key={compIdx}
                  className="rounded-xl border border-white/10 overflow-hidden bg-black/20"
                >
                  {/* If multi-component, show component title */}
                  {(components.length > 1 || (comp.dishName && comp.dishName !== dish.name)) && (
                    <div className="px-4 py-2.5 bg-gradient-to-r from-purple-500/15 via-cyan-500/10 to-transparent border-b border-white/10 flex items-center justify-between">
                      <div className="text-xs font-bold text-cyan-300 flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-cyan-400"></span>
                        <span>Món: {comp.dishName}</span>
                      </div>
                      <span className="text-[11px] text-slate-400">
                        {comp.ingredients?.length || 0} nguyên liệu
                      </span>
                    </div>
                  )}

                  <table className="w-full text-xs sm:text-sm">
                    <thead>
                      <tr style={{ background: 'rgba(255,255,255,0.03)' }}>
                        <th className="px-4 py-2.5 text-left text-slate-400 font-semibold">Nguyên liệu</th>
                        <th className="px-4 py-2.5 text-center text-slate-400 font-semibold">Số g sống</th>
                        <th className="px-4 py-2.5 text-center text-slate-400 font-semibold">
                          Số g chín / ĐVT
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                      {(comp.ingredients || []).map((ing, i) => {
                        const rawTrim = ing.rawGrams !== undefined && ing.rawGrams !== null ? String(ing.rawGrams).trim() : '';
                        const rawVal = rawTrim !== '' && rawTrim !== '0' && rawTrim !== '0g'
                          ? (isNumericWeight(rawTrim) ? `${getNumericGramValue(rawTrim)}g` : rawTrim)
                          : '-';

                        const cookedTrim = ing.cookedGrams !== undefined && ing.cookedGrams !== null ? String(ing.cookedGrams).trim() : '';
                        const cookedVal = cookedTrim !== '' && cookedTrim !== '0' && cookedTrim !== '0g'
                          ? (isNumericWeight(cookedTrim) ? `${getNumericGramValue(cookedTrim)}g` : cookedTrim)
                          : '-';

                        return (
                          <tr key={i} className="hover:bg-white/5 transition-colors">
                            <td className="px-4 py-2.5 text-white font-medium">{ing.name}</td>
                            <td className="px-4 py-2.5 text-center text-amber-400 font-medium">
                              {rawVal}
                            </td>
                            <td className="px-4 py-2.5 text-center text-emerald-400 font-medium">
                              {cookedVal}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              ))}
            </div>
          </div>

          {/* Cooking Instructions */}
          {dish.cookingInstructions && (
            <div>
              <h3 className="text-sm font-bold text-purple-400 uppercase tracking-wider mb-2.5 flex items-center gap-2">
                <BookOpen size={16} />
                Hướng dẫn nấu &amp; chế biến
              </h3>
              <div
                className="rounded-xl p-4 leading-relaxed text-xs sm:text-sm text-slate-200 whitespace-pre-line"
                style={{
                  background: 'rgba(168,85,247,0.08)',
                  border: '1px solid rgba(168,85,247,0.2)',
                }}
              >
                {dish.cookingInstructions}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-5 border-t border-white/10 flex items-center justify-end gap-3">
          {readOnly || !onSelect ? (
            <button
              onClick={onClose}
              className="btn-ghost text-xs px-5 py-2.5 rounded-xl border border-white/20 text-white hover:bg-white/10 w-full sm:w-auto"
            >
              Đóng
            </button>
          ) : isLocked ? (
            <div className="flex items-center gap-2 text-slate-400 text-xs justify-center w-full py-1">
              <Lock size={15} />
              <span>Ngày này đã kết thúc, không thể chỉnh sửa món</span>
            </div>
          ) : (
            <div className="flex items-center gap-2.5 w-full">
              <button
                onClick={onClose}
                className="btn-ghost text-xs py-2.5 px-4 rounded-xl flex-1 justify-center"
              >
                Hủy
              </button>
              <button
                onClick={() => {
                  onSelect();
                  onClose();
                }}
                className={`text-xs py-2.5 px-5 rounded-xl flex-1 justify-center flex items-center gap-2 ${
                  isSelected ? 'btn-danger' : 'btn-primary'
                }`}
              >
                {isSelected ? (
                  <>
                    <X size={16} />
                    <span>Bỏ chọn món này</span>
                  </>
                ) : (
                  <>
                    <Check size={16} />
                    <span>Chọn món này</span>
                  </>
                )}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
