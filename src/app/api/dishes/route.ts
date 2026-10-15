import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import { Dish } from '@/models';
import { SEED_DISHES } from '@/lib/constants';
import { getUserFromRequest } from '@/lib/auth';

export const dynamic = 'force-dynamic';

// GET /api/dishes - lấy danh sách món ăn (cả admin lẫn user đều được xem)
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

// POST /api/dishes - thêm món ăn mới hoặc nạp dữ liệu mẫu (Chỉ Admin)
export async function POST(request: NextRequest) {
  try {
    await dbConnect();
    const user = await getUserFromRequest(request);

    // Cho phép seed nếu DB hoàn toàn trống để tiện khởi tạo ban đầu,
    // còn lại bắt buộc phải có quyền Admin
    const dishCount = await Dish.countDocuments();
    const body = await request.json();

    if (body.seed && dishCount === 0) {
      await Dish.insertMany(SEED_DISHES);
      return NextResponse.json({ success: true, message: 'Đã nạp dữ liệu thực đơn mẫu thành công' });
    }

    if (!user || user.role !== 'admin') {
      return NextResponse.json(
        { success: false, error: 'Chỉ quản trị viên (Admin) mới có quyền thêm món ăn vào hệ thống' },
        { status: 403 }
      );
    }

    if (body.seed) {
      await Dish.deleteMany({});
      await Dish.insertMany(SEED_DISHES);
      return NextResponse.json({ success: true, message: 'Đã cập nhật lại toàn bộ thực đơn mẫu' });
    }

    const dish = await Dish.create(body);
    return NextResponse.json({ success: true, data: dish }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ success: false, error: String(error) }, { status: 500 });
  }
}
