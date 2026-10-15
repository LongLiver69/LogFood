import { NextRequest } from 'next/server';
import jwt from 'jsonwebtoken';
import dbConnect from './mongodb';
import { User, IUser } from '@/models';

const JWT_SECRET = process.env.JWT_SECRET || 'logfood-super-secret-jwt-key-2026';

export interface JwtPayload {
  userId: string;
  email: string;
  role: 'admin' | 'user';
  fullName: string;
}

export function signToken(payload: JwtPayload): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '7d' });
}

export function verifyToken(token: string): JwtPayload | null {
  try {
    return jwt.verify(token, JWT_SECRET) as JwtPayload;
  } catch {
    return null;
  }
}

export async function getUserFromRequest(request: NextRequest): Promise<IUser | null> {
  try {
    // 1. Try cookie
    const tokenFromCookie = request.cookies.get('auth_token')?.value;
    // 2. Try Bearer header
    const authHeader = request.headers.get('authorization');
    const tokenFromHeader = authHeader?.startsWith('Bearer ') ? authHeader.substring(7) : null;

    const token = tokenFromCookie || tokenFromHeader;
    if (!token) return null;

    const decoded = verifyToken(token);
    if (!decoded || !decoded.userId) return null;

    await dbConnect();
    const user = await User.findById(decoded.userId).select('-password');
    return user;
  } catch (err) {
    console.error('Error in getUserFromRequest:', err);
    return null;
  }
}

// Tính chỉ số BMI và phân loại theo thang chuẩn WHO cho người Châu Á
export function calculateBMI(weightKg?: number, heightCm?: number) {
  if (!weightKg || !heightCm || heightCm <= 0 || weightKg <= 0) {
    return null;
  }

  const heightM = heightCm / 100;
  const bmi = Number((weightKg / (heightM * heightM)).toFixed(1));

  let status = 'Bình thường';
  let color = '#10b981'; // green
  let dietRecommendation: '1000kcal' | '1200kcal' = '1200kcal';
  let advice = 'Chỉ số thể trạng lý tưởng. Duy trì chế độ dinh dưỡng cân bằng và tập luyện đều đặn.';

  if (bmi < 18.5) {
    status = 'Gầy / Thiếu cân';
    color = '#38bdf8'; // light blue
    dietRecommendation = '1200kcal';
    advice = 'Bạn đang ở ngưỡng nhẹ cân. Nên ăn đủ các bữa và bổ sung thêm dinh dưỡng lành mạnh.';
  } else if (bmi >= 18.5 && bmi <= 22.9) {
    status = 'Cân đối / Chuẩn';
    color = '#10b981'; // emerald
    dietRecommendation = '1200kcal';
    advice = 'Thể trạng cân đối. Chế độ 1200Kcal rất phù hợp để giữ vóc dáng thon gọn.';
  } else if (bmi >= 23.0 && bmi <= 24.9) {
    status = 'Tiền béo phì (Thừa cân)';
    color = '#f59e0b'; // amber
    dietRecommendation = '1000kcal';
    advice = 'Khuyến nghị áp dụng chế độ dinh dưỡng 1000Kcal để điều chỉnh năng lượng và đưa BMI về ngưỡng chuẩn.';
  } else {
    status = 'Béo phì';
    color = '#ef4444'; // red
    dietRecommendation = '1000kcal';
    advice = 'Chế độ dinh dưỡng 1000Kcal với định lượng chuẩn chính xác sẽ giúp bạn kiểm soát năng lượng an toàn và hiệu quả.';
  }

  // Cân nặng lý tưởng theo công thức Broca điều chỉnh
  const idealWeightMin = Number((18.5 * heightM * heightM).toFixed(1));
  const idealWeightMax = Number((22.9 * heightM * heightM).toFixed(1));

  return {
    bmi,
    status,
    color,
    dietRecommendation,
    advice,
    idealWeightMin,
    idealWeightMax,
  };
}
