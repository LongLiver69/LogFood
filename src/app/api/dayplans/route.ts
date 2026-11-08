import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import { DayPlan, Dish } from '@/models';
import { getUserFromRequest } from '@/lib/auth';

export const dynamic = 'force-dynamic';

// GET /api/dayplans?userId=xxx&weekKey=2024-W42
export async function GET(request: NextRequest) {
  try {
    await dbConnect();
    const currentUser = await getUserFromRequest(request);
    const { searchParams } = new URL(request.url);
    const requestedUserId = searchParams.get('userId');
    const weekKey = searchParams.get('weekKey');

    let targetUserId = 'guest';

    if (currentUser) {
      // Nếu là admin và có truyền requestedUserId thì xem của user đó, ngược lại xem của chính mình
      if (currentUser.role === 'admin' && requestedUserId) {
        targetUserId = requestedUserId;
      } else {
        targetUserId = currentUser._id.toString();
      }
    } else if (requestedUserId) {
      targetUserId = requestedUserId;
    }

    const filter: Record<string, string> = { userId: targetUserId };
    if (weekKey) filter.weekKey = weekKey;

    const plans = await DayPlan.find(filter).sort({ date: 1 }).lean();

    // Lấy thông tin chi tiết của tất cả các món ăn (Dish) trong kế hoạch
    const dishIds = plans.flatMap((dp) => (dp.selections || []).map((s) => s.dishId));
    const dishes = await Dish.find({ _id: { $in: dishIds } }).lean();
    const dishMap = new Map(dishes.map((d) => [d._id.toString(), d]));

    const enrichedPlans = plans.map((dp) => ({
      ...dp,
      selections: (dp.selections || []).map((s) => {
        const dishDetail = dishMap.get(s.dishId?.toString()) || null;
        return {
          meal: s.meal,
          dishId: s.dishId,
          dishName: s.dishName,
          dishDetail: dishDetail || (s.dishName ? {
            _id: s.dishId?.toString() || 'temp',
            name: s.dishName,
            meal: s.meal,
            dietType: dp.dietType,
            category: 'family',
            calories: 0,
            ingredients: [],
            dishComponents: [],
            cookingInstructions: '',
          } : null),
        };
      }),
    }));

    return NextResponse.json({ success: true, data: enrichedPlans });
  } catch (error) {
    console.error('Error fetching dayplans:', error);
    return NextResponse.json({ success: false, error: String(error) }, { status: 500 });
  }
}

// POST /api/dayplans - tạo hoặc cập nhật kế hoạch ngày (Admin có thể lên thực đơn cho bất kỳ User nào)
export async function POST(request: NextRequest) {
  try {
    await dbConnect();
    const currentUser = await getUserFromRequest(request);
    const body = await request.json();
    const { date, weekKey, dayOfWeek, dietType, selections } = body;

    const isAdmin = currentUser?.role === 'admin';
    const targetUserId = isAdmin && body.userId
      ? body.userId
      : (currentUser ? currentUser._id.toString() : (body.userId || 'guest'));

    // Kiểm tra ngày: nếu ngày trong quá khứ so với hôm nay (bắt đầu ngày) thì không cho chỉnh sửa (áp dụng cho user thường)
    const planDate = new Date(date);
    const startOfTargetDay = new Date(planDate);
    startOfTargetDay.setUTCHours(0, 0, 0, 0);
    const endOfTargetDay = new Date(planDate);
    endOfTargetDay.setUTCHours(23, 59, 59, 999);

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const checkDate = new Date(planDate);
    checkDate.setHours(0, 0, 0, 0);

    const isPastDay = checkDate < today;

    // Check if plan exists
    const existing = await DayPlan.findOne({
      userId: targetUserId,
      $or: [
        { date: planDate },
        { date: startOfTargetDay },
        { date: { $gte: startOfTargetDay, $lte: endOfTargetDay } },
      ],
    });

    if (existing) {
      if (!isAdmin && (existing.isLocked || isPastDay)) {
        return NextResponse.json(
          { success: false, error: 'Ngày này đã kết thúc, không thể chỉnh sửa thực đơn đã chọn.' },
          { status: 403 }
        );
      }
      existing.selections = selections;
      if (dietType) existing.dietType = dietType;
      await existing.save();
      return NextResponse.json({ success: true, data: existing });
    }

    if (!isAdmin && isPastDay) {
      return NextResponse.json(
        { success: false, error: 'Không thể thêm hoặc chọn thực đơn cho ngày trong quá khứ.' },
        { status: 403 }
      );
    }

    const plan = await DayPlan.create({
      userId: targetUserId,
      date: startOfTargetDay,
      weekKey,
      dayOfWeek,
      dietType: dietType || '1000kcal',
      selections,
      isLocked: false,
    });
    return NextResponse.json({ success: true, data: plan }, { status: 201 });
  } catch (error) {
    console.error('Error saving dayplan:', error);
    return NextResponse.json({ success: false, error: String(error) }, { status: 500 });
  }
}
