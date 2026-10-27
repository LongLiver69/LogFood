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
      const weeklyDietPreferences = u.weeklyDietPreferences instanceof Map
        ? Object.fromEntries(u.weeklyDietPreferences)
        : (u.weeklyDietPreferences || {});

      return {
        _id: u._id,
        email: u.email,
        fullName: u.fullName,
        role: u.role,
        isApproved: u.isApproved ?? true,
        height: u.height,
        weight: u.weight,
        targetWeight: u.targetWeight,
        gender: u.gender,
        age: u.age,
        dietPreference: u.dietPreference,
        weeklyDietPreferences,
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

// PATCH /api/admin/users: Duyệt/Khóa tài khoản hoặc phân quyền chế độ ăn (1000kcal / 1200kcal) theo tuần
export async function PATCH(request: NextRequest) {
  try {
    const currentUser = await getUserFromRequest(request);
    if (!currentUser || currentUser.role !== 'admin') {
      return NextResponse.json(
        { success: false, error: 'Chỉ quản trị viên mới có quyền thực hiện thao tác này' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { userId, isApproved, dietPreference, weekKey, weeklyDietType } = body;

    if (!userId) {
      return NextResponse.json({ success: false, error: 'Thiếu mã định danh người dùng (userId)' }, { status: 400 });
    }

    await dbConnect();
    const user = await User.findById(userId);
    if (!user) {
      return NextResponse.json({ success: false, error: 'Không tìm thấy người dùng' }, { status: 404 });
    }

    if (isApproved !== undefined) {
      user.isApproved = Boolean(isApproved);
    }

    if (dietPreference) {
      user.dietPreference = dietPreference;
    }

    if (weekKey && weeklyDietType) {
      if (!user.weeklyDietPreferences) {
        user.weeklyDietPreferences = new Map();
      }
      user.weeklyDietPreferences.set(weekKey, weeklyDietType);
      user.markModified('weeklyDietPreferences');
    }

    await user.save();

    const weeklyObj = user.weeklyDietPreferences instanceof Map
      ? Object.fromEntries(user.weeklyDietPreferences)
      : (user.weeklyDietPreferences || {});

    return NextResponse.json({
      success: true,
      message: 'Cập nhật người dùng thành công',
      data: {
        _id: user._id,
        isApproved: user.isApproved,
        dietPreference: user.dietPreference,
        weeklyDietPreferences: weeklyObj,
      },
    });
  } catch (error) {
    console.error('Update user admin error:', error);
    return NextResponse.json({ success: false, error: 'Lỗi cập nhật người dùng' }, { status: 500 });
  }
}
