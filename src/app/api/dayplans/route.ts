import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import { DayPlan } from '@/models';
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
    return NextResponse.json({ success: true, data: plans });
  } catch (error) {
    return NextResponse.json({ success: false, error: String(error) }, { status: 500 });
  }
}

// POST /api/dayplans - tạo hoặc cập nhật kế hoạch ngày
export async function POST(request: NextRequest) {
  try {
    await dbConnect();
    const currentUser = await getUserFromRequest(request);
    const body = await request.json();
    const { date, weekKey, dayOfWeek, dietType, selections } = body;

    const targetUserId = currentUser ? currentUser._id.toString() : (body.userId || 'guest');

    // Kiểm tra ngày: nếu ngày trong quá khứ so với hôm nay (bắt đầu ngày) thì không cho chỉnh sửa
    const planDate = new Date(date);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const checkDate = new Date(planDate);
    checkDate.setHours(0, 0, 0, 0);

    const isPastDay = checkDate < today;

    // Check if plan exists
    const existing = await DayPlan.findOne({ userId: targetUserId, date: planDate });

    if (existing) {
      if (existing.isLocked || isPastDay) {
        return NextResponse.json(
          { success: false, error: 'Ngày này đã kết thúc, không thể chỉnh sửa thực đơn đã chọn.' },
          { status: 403 }
        );
      }
      existing.selections = selections;
      existing.dietType = dietType;
      await existing.save();
      return NextResponse.json({ success: true, data: existing });
    }

    if (isPastDay) {
      return NextResponse.json(
        { success: false, error: 'Không thể thêm hoặc chọn thực đơn cho ngày trong quá khứ.' },
        { status: 403 }
      );
    }

    const plan = await DayPlan.create({
      userId: targetUserId,
      date: planDate,
      weekKey,
      dayOfWeek,
      dietType,
      selections,
      isLocked: false,
    });
    return NextResponse.json({ success: true, data: plan }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ success: false, error: String(error) }, { status: 500 });
  }
}
