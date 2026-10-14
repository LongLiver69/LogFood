import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import { Dish } from '@/models';

type Params = { params: Promise<{ id: string }> };

// GET /api/dishes/[id]
export async function GET(_req: NextRequest, { params }: Params) {
  try {
    await dbConnect();
    const { id } = await params;
    const dish = await Dish.findById(id);
    if (!dish) return NextResponse.json({ success: false, error: 'Not found' }, { status: 404 });
    return NextResponse.json({ success: true, data: dish });
  } catch (error) {
    return NextResponse.json({ success: false, error: String(error) }, { status: 500 });
  }
}

// PUT /api/dishes/[id]
export async function PUT(request: NextRequest, { params }: Params) {
  try {
    await dbConnect();
    const { id } = await params;
    const body = await request.json();
    const dish = await Dish.findByIdAndUpdate(id, body, { new: true, runValidators: true });
    if (!dish) return NextResponse.json({ success: false, error: 'Not found' }, { status: 404 });
    return NextResponse.json({ success: true, data: dish });
  } catch (error) {
    return NextResponse.json({ success: false, error: String(error) }, { status: 500 });
  }
}

// DELETE /api/dishes/[id]
export async function DELETE(_req: NextRequest, { params }: Params) {
  try {
    await dbConnect();
    const { id } = await params;
    const dish = await Dish.findByIdAndDelete(id);
    if (!dish) return NextResponse.json({ success: false, error: 'Not found' }, { status: 404 });
    return NextResponse.json({ success: true, message: 'Deleted successfully' });
  } catch (error) {
    return NextResponse.json({ success: false, error: String(error) }, { status: 500 });
  }
}
