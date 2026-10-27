'use client';

import { Flame, UtensilsCrossed, BookOpen, X, Check, Lock } from 'lucide-react';
import { Dish } from '@/types';
import { MEAL_LABELS, formatIngredientWeight, isNumericWeight, getNumericGramValue } from '@/lib/constants';

interface DishDetailModalProps {
  dish: Dish;
  onClose: () => void;
  onSelect: () => void;
  isSelected: boolean;
  isLocked: boolean;
}

export default function DishDetailModal({
  dish,
  onClose,
  onSelect,
  isSelected,
  isLocked,
}: DishDetailModalProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(8px)' }}>
      <div className="glass-card w-full max-w-lg animate-fade-in" style={{ maxHeight: '90vh', overflowY: 'auto' }}>
        {/* Header */}
        <div className="p-6 border-b border-white/10">
          <div className="flex items-start justify-between">
            <div>
              <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium border meal-${dish.meal} mb-3`}>
                {MEAL_LABELS[dish.meal]} • {dish.dietType}
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
                    <th className="px-4 py-3 text-center text-slate-400 font-medium">Số g sống</th>
                    <th className="px-4 py-3 text-center text-slate-400 font-medium">Số g chín / Đơn vị thường dùng</th>
                  </tr>
                </thead>
                <tbody>
                  {dish.ingredients.map((ing, i) => {
                    const rawVal = ing.rawGrams !== undefined && ing.rawGrams !== null && String(ing.rawGrams).trim() !== '' && String(ing.rawGrams).trim() !== '0' && String(ing.rawGrams).trim() !== '0g'
                      ? (isNumericWeight(String(ing.rawGrams)) ? `${getNumericGramValue(String(ing.rawGrams))}g` : String(ing.rawGrams))
                      : '-';

                    const cookedVal = ing.cookedGrams !== undefined && ing.cookedGrams !== null && String(ing.cookedGrams).trim() !== '' && String(ing.cookedGrams).trim() !== '0' && String(ing.cookedGrams).trim() !== '0g'
                      ? (isNumericWeight(String(ing.cookedGrams)) ? `${getNumericGramValue(String(ing.cookedGrams))}g` : String(ing.cookedGrams))
                      : '-';

                    return (
                      <tr key={i} className="border-t border-white/5 hover:bg-white/5 transition-colors">
                        <td className="px-4 py-3 text-white font-medium">{ing.name}</td>
                        <td className="px-4 py-3 text-center text-amber-400 font-medium">{rawVal}</td>
                        <td className="px-4 py-3 text-center text-emerald-400 font-medium">{cookedVal}</td>
                      </tr>
                    );
                  })}
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
                <p className="text-slate-300 leading-relaxed text-sm whitespace-pre-line">{dish.cookingInstructions}</p>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-white/10">
          {isLocked ? (
            <div className="flex items-center gap-2 text-slate-400 text-sm justify-center">
              <Lock size={16} />
              <span>Ngày này đã kết thúc, không thể chỉnh sửa món</span>
            </div>
          ) : (
            <button
              onClick={() => { onSelect(); onClose(); }}
              className={isSelected ? 'btn-danger w-full justify-center' : 'btn-primary w-full justify-center'}
            >
              {isSelected ? <><X size={16} />Bỏ chọn món này</> : <><Check size={16} />Chọn món này cho thực đơn</>}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
