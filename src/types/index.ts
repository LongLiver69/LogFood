export interface Ingredient {
  name: string;
  rawGrams: number;
  cookedGrams: number;
}

export interface Dish {
  _id: string;
  name: string;
  calories: number;
  meal: 'breakfast' | 'lunch' | 'snack' | 'dinner';
  dietType: '1000kcal' | '1200kcal';
  ingredients: Ingredient[];
  cookingInstructions: string;
}

export interface MealSelection {
  meal: 'breakfast' | 'lunch' | 'snack' | 'dinner';
  dishId: string;
  dishName: string;
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
  height?: number;
  weight?: number;
  targetWeight?: number;
  gender?: 'male' | 'female' | 'other';
  age?: number;
  dietPreference?: '1000kcal' | '1200kcal';
  bmiInfo?: BmiInfo | null;
}

export interface AdminUserItem extends UserProfile {
  planCount: number;
  createdAt: string;
}
