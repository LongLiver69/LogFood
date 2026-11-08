export interface Ingredient {
  name: string;
  rawGrams?: string | number;
  cookedGrams?: string | number; // số g chín hoặc đơn vị thường dùng (ví dụ: 1 quả, 1 bát, 100g...)
  dishComponent?: string; // Tên món con thuộc về (VD: "Cơm trắng", "Bầu nhồi tôm thịt hấp")
}

export interface DishComponent {
  dishName: string; // Tên món con (VD: "Cơm trắng", "Bầu nhồi tôm thịt hấp", "Bưởi")
  ingredients: Ingredient[];
}

export interface Dish {
  _id: string;
  name: string;
  calories: number;
  meal: 'breakfast' | 'lunch' | 'snack' | 'dinner';
  dietType: '1000kcal' | '1200kcal';
  category?: 'family' | 'eatclean'; // 'family': Món cơm gia đình, 'eatclean': Món ăn eatclean
  dishComponents?: DishComponent[];
  ingredients: Ingredient[];
  cookingInstructions: string;
  imageUrl?: string;
}

export interface MealSelection {
  meal: 'breakfast' | 'lunch' | 'snack' | 'dinner';
  dishId: string;
  dishName: string;
  dishDetail?: Dish;
}

export interface DayPlan {
  _id?: string;
  userId: string;
  date: string;
  weekKey: string;
  dayOfWeek: number;
  dietType: '1000kcal' | '1200kcal';
  selections: MealSelection[];
  isLocked: boolean;
}

export interface BmiInfo {
  bmi: number;
  status: string;
  color: string;
  dietRecommendation: '1000kcal' | '1200kcal';
  advice: string;
  idealWeightMin: number;
  idealWeightMax: number;
}

export interface UserProfile {
  _id: string;
  email: string;
  fullName: string;
  role: 'admin' | 'user';
  isApproved?: boolean;
  height?: number;
  weight?: number;
  targetWeight?: number;
  gender?: 'male' | 'female' | 'other';
  age?: number;
  dietPreference?: '1000kcal' | '1200kcal';
  weeklyDietPreferences?: Record<string, '1000kcal' | '1200kcal'>;
  bmiInfo?: BmiInfo | null;
}

export interface AdminUserItem extends UserProfile {
  planCount: number;
  createdAt: string;
}

export interface BodyMetricWeek {
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

export interface BodyMetricDoc {
  _id?: string;
  userId: string;
  weeks: BodyMetricWeek[];
  createdAt?: string;
  updatedAt?: string;
}

