import mongoose, { Schema, Document, Model } from 'mongoose';

// ============ USER (NGƯỜI DÙNG & PHÂN QUYỀN) ============
export interface IUser extends Document {
  _id: mongoose.Types.ObjectId;
  email: string;
  password: string;
  fullName: string;
  role: 'admin' | 'user';
  isApproved?: boolean; // Được quản trị viên phê duyệt để đăng nhập
  height?: number; // cm
  weight?: number; // kg
  targetWeight?: number; // kg
  gender?: 'male' | 'female' | 'other';
  age?: number;
  dietPreference?: '1000kcal' | '1200kcal';
  weeklyDietPreferences?: Map<string, string>; // Phân quyền mức calo theo tuần (ví dụ '2026-W44': '1200kcal')
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema = new Schema<IUser>(
  {
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: true },
    fullName: { type: String, required: true, trim: true },
    role: { type: String, enum: ['admin', 'user'], default: 'user' },
    isApproved: { type: Boolean, default: false },
    height: { type: Number, min: 50, max: 250 },
    weight: { type: Number, min: 20, max: 300 },
    targetWeight: { type: Number, min: 20, max: 300 },
    gender: { type: String, enum: ['male', 'female', 'other'], default: 'female' },
    age: { type: Number, min: 10, max: 120 },
    dietPreference: { type: String, enum: ['1000kcal', '1200kcal'], default: '1000kcal' },
    weeklyDietPreferences: { type: Map, of: String, default: {} },
  },
  { timestamps: true }
);

export const User: Model<IUser> =
  mongoose.models.User || mongoose.model<IUser>('User', UserSchema);

// ============ INGREDIENT ============
export interface IIngredient {
  name: string;
  rawGrams?: string | number;   // số g sống
  cookedGrams?: string | number; // số g chín hoặc đơn vị thường dùng (text)
  dishComponent?: string;       // Thuộc món con nào (VD: "Cơm trắng", "Bầu nhồi tôm thịt hấp")
}

// ============ DISH COMPONENT (MÓN CON / MÓN THÀNH PHẦN TRONG BỮA) ============
export interface IDishComponent {
  dishName: string; // Tên món con (VD: "Cơm trắng", "Bầu nhồi tôm thịt hấp", "Bưởi")
  ingredients: IIngredient[];
}

// ============ DISH (MÓN ĂN / SET BỮA ĂN) ============
export interface IDish extends Document {
  _id: mongoose.Types.ObjectId;
  name: string;
  calories: number;
  meal: 'breakfast' | 'lunch' | 'snack' | 'dinner';
  dietType: '1000kcal' | '1200kcal';
  category: 'family' | 'eatclean'; // 'family': Món cơm gia đình, 'eatclean': Món ăn eatclean
  dishComponents?: IDishComponent[];
  ingredients: IIngredient[];
  cookingInstructions: string;
  imageUrl?: string;
  createdAt: Date;
  updatedAt: Date;
}

const IngredientSchema = new Schema<IIngredient>({
  name: { type: String, required: true },
  rawGrams: { type: Schema.Types.Mixed, default: '' },
  cookedGrams: { type: Schema.Types.Mixed, default: '' },
  dishComponent: { type: String, default: '' },
});

const DishComponentSchema = new Schema<IDishComponent>({
  dishName: { type: String, required: true },
  ingredients: [IngredientSchema],
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
    category: {
      type: String,
      enum: ['family', 'eatclean'],
      default: 'eatclean',
    },
    dishComponents: [DishComponentSchema],
    ingredients: [IngredientSchema],
    cookingInstructions: { type: String, default: '' },
    imageUrl: { type: String },
  },
  { timestamps: true }
);

DishSchema.index({ dietType: 1, meal: 1, category: 1 });
DishSchema.index({ dietType: 1, category: 1 });

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
DayPlanSchema.index({ userId: 1, weekKey: 1 });

export const DayPlan: Model<IDayPlan> =
  mongoose.models.DayPlan || mongoose.model<IDayPlan>('DayPlan', DayPlanSchema);

// ============ BODY METRICS (THEO DÕI CHỈ SỐ CƠ THỂ THEO TUẦN) ============
export interface IBodyMetricWeek {
  weekNumber: number; // 1, 2, 3, 4...
  examDate?: string; // Ngày khám
  height?: number; // Chiều cao (cm)
  weight?: number; // Cân nặng (kg)
  bmi?: number; // BMI (kg/m²)
  waist?: number; // Vòng eo (cm)
  abdomen?: number; // Vòng bụng (cm)
  hip?: number; // Vòng hông (cm)
  buttocks?: number; // Vòng mông (cm)
  waistHipRatio?: number; // Tỷ lệ eo hông
  bodyFatPercentage?: number; // Tỷ lệ mỡ (%)
  visceralFatPercentage?: number; // Tỷ lệ mỡ tại vùng bụng (%)
  visceralFatLevel?: number; // Mỡ nội tạng
  subcutaneousFatPercentage?: number; // % mỡ dưới da
  muscleMass?: number; // Lượng cơ (kg)
  skeletalMuscleMass?: number; // Lượng cơ xương (kg)
  bodyWater?: number; // Lượng nước (kg)
  bmr?: number; // BMR (Kcal)
  bodyScore?: number; // Chỉ số điểm cơ thể
  notes?: string;
}

export interface IBodyMetric extends Document {
  _id: mongoose.Types.ObjectId;
  userId: string;
  weeks: IBodyMetricWeek[];
  createdAt: Date;
  updatedAt: Date;
}

const BodyMetricWeekSchema = new Schema<IBodyMetricWeek>({
  weekNumber: { type: Number, required: true },
  examDate: { type: String, default: '' },
  height: { type: Number },
  weight: { type: Number },
  bmi: { type: Number },
  waist: { type: Number },
  abdomen: { type: Number },
  hip: { type: Number },
  buttocks: { type: Number },
  waistHipRatio: { type: Number },
  bodyFatPercentage: { type: Number },
  visceralFatPercentage: { type: Number },
  visceralFatLevel: { type: Number },
  subcutaneousFatPercentage: { type: Number },
  muscleMass: { type: Number },
  skeletalMuscleMass: { type: Number },
  bodyWater: { type: Number },
  bmr: { type: Number },
  bodyScore: { type: Number },
  notes: { type: String, default: '' },
});

const BodyMetricSchema = new Schema<IBodyMetric>(
  {
    userId: { type: String, required: true, unique: true },
    weeks: [BodyMetricWeekSchema],
  },
  { timestamps: true }
);

BodyMetricSchema.index({ userId: 1 }, { unique: true });

export const BodyMetric: Model<IBodyMetric> =
  mongoose.models.BodyMetric || mongoose.model<IBodyMetric>('BodyMetric', BodyMetricSchema);

