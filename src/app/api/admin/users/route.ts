import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import { User, DayPlan } from '@/models';
import { getUserFromRequest, calculateBMI } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const currentUser = await getUserFromRequest(request);
    if (!currentUser || currentUser.role !== 'admin') {
      return NextResponse.json(
        { success: false, error: 'Chỉ quản trị viên mới có quyền xem danh sách người dùng' },
        { status: 403 }
      );
    }

    await dbConnect();
    // Chỉ lấy người dùng thông thường, không bao gồm admin
    const users = await User.find({ role: 'user' }).sort({ createdAt: -1 }).select('-password').lean();

    // Lấy số lượng thực đơn của tất cả người dùng trong 1 truy vấn tổng hợp duy nhất (tránh N+1)
    const userIds = users.map((u) => u._id.toString());
    const planCounts = await DayPlan.aggregate<{ _id: string; count: number }>([
      { $match: { userId: { $in: userIds } } },
      { $group: { _id: '$userId', count: { $sum: 1 } } },
    ]);

    const countMap = new Map<string, number>(planCounts.map((item) => [item._id, item.count]));

    const usersWithStats = users.map((u) => {
      const planCount = countMap.get(u._id.toString()) || 0;
      const bmiInfo = calculateBMI(u.weight, u.height);
      return {
        _id: u._id,
        email: u.email,
        fullName: u.fullName,
        role: u.role,
        height: u.height,
        weight: u.weight,
        targetWeight: u.targetWeight,
        gender: u.gender,
        age: u.age,
        dietPreference: u.dietPreference,
        planCount,
        bmiInfo,
        createdAt: u.createdAt,
      };
    });

    return NextResponse.json({ success: true, data: usersWithStats });
  } catch (error) {
    console.error('Admin users error:', error);
    return NextResponse.json({ success: false, error: 'Lỗi tải danh sách người dùng' }, { status: 500 });
  }
}
