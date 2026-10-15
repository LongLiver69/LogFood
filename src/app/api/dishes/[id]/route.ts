import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import { Dish } from '@/models';
import { getUserFromRequest } from '@/lib/auth';

export const dynamic = 'force-dynamic';

type Params = { params: Promise<{ id: string }> };

// GET /api/dishes/[id]
export async function GET(_req: NextRequest, { params }: Params) {
  try {
    await dbConnect();
    const { id } = await params;
    const dish = await Dish.findById(id);
    if (!dish) return NextResponse.json({ success: false, error: 'Không tìm thấy món ăn' }, { status: 404 });
    return NextResponse.json({ success: true, data: dish });
  } catch (error) {
    return NextResponse.json({ success: false, error: String(error) }, { status: 500 });
  }
}

// PUT /api/dishes/[id] - Chỉ Admin
export async function PUT(request: NextRequest, { params }: Params) {
  try {
    const user = await getUserFromRequest(request);
    if (!user || user.role !== 'admin') {
      return NextResponse.json(
        { success: false, error: 'Chỉ quản trị viên (Admin) mới có quyền chỉnh sửa món ăn' },
        { status: 403 }
      );
    }

    await dbConnect();
    const { id } = await params;
    const body = await request.json();
    const dish = await Dish.findByIdAndUpdate(id, body, { new: true, runValidators: true });
    if (!dish) return NextResponse.json({ success: false, error: 'Không tìm thấy món ăn' }, { status: 404 });
    return NextResponse.json({ success: true, data: dish });
  } catch (error) {
    return NextResponse.json({ success: false, error: String(error) }, { status: 500 });
  }
}

// DELETE /api/dishes/[id] - Chỉ Admin
export async function DELETE(request: NextRequest, { params }: Params) {
  try {
    const user = await getUserFromRequest(request);
    if (!user || user.role !== 'admin') {
      return NextResponse.json(
        { success: false, error: 'Chỉ quản trị viên (Admin) mới có quyền xóa món ăn' },
        { status: 403 }
      );
    }

    await dbConnect();
    const { id } = await params;
    const dish = await Dish.findByIdAndDelete(id);
    if (!dish) return NextResponse.json({ success: false, error: 'Không tìm thấy món ăn' }, { status: 404 });
    return NextResponse.json({ success: true, message: 'Đã xóa món ăn thành công' });
  } catch (error) {
    return NextResponse.json({ success: false, error: String(error) }, { status: 500 });
  }
}
