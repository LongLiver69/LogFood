import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import { Dish } from '@/models';
import { SEED_DISHES } from '@/lib/constants';

// GET /api/dishes - lấy danh sách món ăn
export async function GET(request: NextRequest) {
  try {
    await dbConnect();
    const { searchParams } = new URL(request.url);
    const meal = searchParams.get('meal');
    const dietType = searchParams.get('dietType') || '1000kcal';

    const filter: Record<string, string> = { dietType };
    if (meal) filter.meal = meal;

    const dishes = await Dish.find(filter).sort({ name: 1 });
    return NextResponse.json({ success: true, data: dishes });
  } catch (error) {
    return NextResponse.json({ success: false, error: String(error) }, { status: 500 });
  }
}

// POST /api/dishes - thêm món ăn mới
export async function POST(request: NextRequest) {
  try {
    await dbConnect();
    const body = await request.json();

    // Check if seeding is requested
    if (body.seed) {
      await Dish.deleteMany({});
      await Dish.insertMany(SEED_DISHES);
      return NextResponse.json({ success: true, message: 'Seeded successfully' });
    }

    const dish = await Dish.create(body);
    return NextResponse.json({ success: true, data: dish }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ success: false, error: String(error) }, { status: 500 });
  }
}
