import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import { DayPlan } from '@/models';

// GET /api/dayplans?userId=xxx&weekKey=2024-W42
export async function GET(request: NextRequest) {
  try {
    await dbConnect();
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId') || 'guest';
    const weekKey = searchParams.get('weekKey');

    const filter: Record<string, string> = { userId };
    if (weekKey) filter.weekKey = weekKey;

    const plans = await DayPlan.find(filter).sort({ date: 1 });
    return NextResponse.json({ success: true, data: plans });
  } catch (error) {
    return NextResponse.json({ success: false, error: String(error) }, { status: 500 });
  }
}

// POST /api/dayplans - tạo hoặc cập nhật kế hoạch ngày
export async function POST(request: NextRequest) {
  try {
    await dbConnect();
    const body = await request.json();
    const { userId = 'guest', date, weekKey, dayOfWeek, dietType, selections } = body;

    // Check if plan exists
    const existing = await DayPlan.findOne({ userId, date: new Date(date) });

    if (existing) {
      if (existing.isLocked) {
        return NextResponse.json({ success: false, error: 'This day plan is locked and cannot be edited.' }, { status: 403 });
      }
      existing.selections = selections;
      existing.dietType = dietType;
      await existing.save();
      return NextResponse.json({ success: true, data: existing });
    }

    const plan = await DayPlan.create({
      userId,
      date: new Date(date),
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
