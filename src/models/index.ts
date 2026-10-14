import mongoose, { Schema, Document, Model } from 'mongoose';

// ============ INGREDIENT ============
export interface IIngredient {
  name: string;
  rawGrams: number;   // số g sống
  cookedGrams: number; // số g chín
}

// ============ DISH (MÓN ĂN) ============
export interface IDish extends Document {
  _id: mongoose.Types.ObjectId;
  name: string;
  calories: number;
  meal: 'breakfast' | 'lunch' | 'snack' | 'dinner';
  dietType: '1000kcal' | '1200kcal';
  ingredients: IIngredient[];
  cookingInstructions: string;
  imageUrl?: string;
  createdAt: Date;
  updatedAt: Date;
}

const IngredientSchema = new Schema<IIngredient>({
  name: { type: String, required: true },
  rawGrams: { type: Number, required: true },
  cookedGrams: { type: Number, required: true },
});

const DishSchema = new Schema<IDish>(
  {
    name: { type: String, required: true },
    calories: { type: Number, required: true },
    meal: {
      type: String,
      enum: ['breakfast', 'lunch', 'snack', 'dinner'],
      required: true,
    },
    dietType: {
      type: String,
      enum: ['1000kcal', '1200kcal'],
      required: true,
    },
    ingredients: [IngredientSchema],
    cookingInstructions: { type: String, default: '' },
    imageUrl: { type: String },
  },
  { timestamps: true }
);

export const Dish: Model<IDish> =
  mongoose.models.Dish || mongoose.model<IDish>('Dish', DishSchema);

// ============ MEAL SELECTION (lựa chọn theo bữa trong ngày) ============
export interface IMealSelection {
  meal: 'breakfast' | 'lunch' | 'snack' | 'dinner';
  dishId: mongoose.Types.ObjectId;
  dishName: string;
}

// ============ DAY PLAN (Kế hoạch trong 1 ngày) ============
export interface IDayPlan extends Document {
  _id: mongoose.Types.ObjectId;
  userId: string; // or ref to User
  date: Date; // date for this day plan
  weekKey: string; // e.g. "2024-W42"
  dayOfWeek: number; // 0=Sunday, 1=Monday,...
  dietType: '1000kcal' | '1200kcal';
  selections: IMealSelection[];
  isLocked: boolean; // locked if date has passed
  createdAt: Date;
  updatedAt: Date;
}

const MealSelectionSchema = new Schema<IMealSelection>({
  meal: {
    type: String,
    enum: ['breakfast', 'lunch', 'snack', 'dinner'],
    required: true,
  },
  dishId: { type: Schema.Types.ObjectId, ref: 'Dish', required: true },
  dishName: { type: String, required: true },
});

const DayPlanSchema = new Schema<IDayPlan>(
  {
    userId: { type: String, required: true },
    date: { type: Date, required: true },
    weekKey: { type: String, required: true },
    dayOfWeek: { type: Number, required: true },
    dietType: { type: String, enum: ['1000kcal', '1200kcal'], default: '1000kcal' },
    selections: [MealSelectionSchema],
    isLocked: { type: Boolean, default: false },
  },
  { timestamps: true }
);

DayPlanSchema.index({ userId: 1, date: 1 }, { unique: true });

export const DayPlan: Model<IDayPlan> =
  mongoose.models.DayPlan || mongoose.model<IDayPlan>('DayPlan', DayPlanSchema);
