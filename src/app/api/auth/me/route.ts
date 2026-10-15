import { NextRequest, NextResponse } from 'next/server';
import { getUserFromRequest, calculateBMI } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const user = await getUserFromRequest(request);
    if (!user) {
      return NextResponse.json({ success: false, user: null }, { status: 200 });
    }

    const bmiInfo = calculateBMI(user.weight, user.height);

    return NextResponse.json({
      success: true,
      user: {
        _id: user._id,
        email: user.email,
        fullName: user.fullName,
        role: user.role,
        height: user.height,
        weight: user.weight,
        targetWeight: user.targetWeight,
        gender: user.gender,
        age: user.age,
        dietPreference: user.dietPreference,
        bmiInfo,
      },
    });
  } catch (error) {
    console.error('Error in /api/auth/me:', error);
    return NextResponse.json({ success: false, error: 'Lỗi xác thực người dùng' }, { status: 500 });
  }
}
