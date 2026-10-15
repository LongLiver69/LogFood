import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import { User, DayPlan, Dish } from '@/models';
import { getUserFromRequest, calculateBMI } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const currentUser = await getUserFromRequest(request);
    if (!currentUser || currentUser.role !== 'admin') {
      return NextResponse.json(
        { success: false, error: 'Chỉ quản trị viên mới có quyền xem thực đơn của thành viên' },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(request.url);
    const targetUserId = searchParams.get('userId');
    const weekKey = searchParams.get('weekKey');

    if (!targetUserId) {
      return NextResponse.json(
        { success: false, error: 'Vui lòng cung cấp mã định danh thành viên (userId)' },
        { status: 400 }
      );
    }

    await dbConnect();
    const targetUser = await User.findById(targetUserId).select('-password');
    if (!targetUser) {
      return NextResponse.json(
        { success: false, error: 'Không tìm thấy thông tin thành viên' },
        { status: 404 }
      );
    }

    const filter: Record<string, string> = { userId: targetUserId };
    if (weekKey) filter.weekKey = weekKey;

    const availableWeeks = await DayPlan.distinct('weekKey', { userId: targetUserId });
    const dayPlans = await DayPlan.find(filter).sort({ date: 1 });

    // Populate or retrieve dish details for all selections
    const dishIds = dayPlans.flatMap((dp) => dp.selections.map((s) => s.dishId));
    const dishes = await Dish.find({ _id: { $in: dishIds } });
    const dishMap = new Map(dishes.map((d) => [d._id.toString(), d]));

    const enrichedPlans = dayPlans.map((dp) => ({
      _id: dp._id,
      date: dp.date,
      weekKey: dp.weekKey,
      dayOfWeek: dp.dayOfWeek,
      dietType: dp.dietType,
      isLocked: dp.isLocked,
      selections: dp.selections.map((s) => {
        const dishDetail = dishMap.get(s.dishId.toString());
        return {
          meal: s.meal,
          dishId: s.dishId,
          dishName: s.dishName,
          dishDetail: dishDetail || null,
        };
      }),
    }));

    const bmiInfo = calculateBMI(targetUser.weight, targetUser.height);

    return NextResponse.json({
      success: true,
      user: {
        _id: targetUser._id,
        email: targetUser.email,
        fullName: targetUser.fullName,
        role: targetUser.role,
        height: targetUser.height,
        weight: targetUser.weight,
        targetWeight: targetUser.targetWeight,
        gender: targetUser.gender,
        age: targetUser.age,
        dietPreference: targetUser.dietPreference,
        bmiInfo,
      },
      availableWeeks: availableWeeks.sort().reverse(),
      dayPlans: enrichedPlans,
    });
  } catch (error) {
    console.error('Admin view user plans error:', error);
    return NextResponse.json({ success: false, error: 'Lỗi tải thực đơn thành viên' }, { status: 500 });
  }
}
