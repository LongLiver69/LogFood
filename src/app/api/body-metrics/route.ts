import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import { BodyMetric, User } from '@/models';
import { getUserFromRequest } from '@/lib/auth';

export const dynamic = 'force-dynamic';

// GET /api/body-metrics?userId=xxx
export async function GET(request: NextRequest) {
  try {
    await dbConnect();
    const currentUser = await getUserFromRequest(request);
    if (!currentUser) {
      return NextResponse.json(
        { success: false, error: 'Vui lòng đăng nhập để xem chỉ số cơ thể' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const requestedUserId = searchParams.get('userId');

    let targetUserId = currentUser._id.toString();
    let membersList: Array<{ _id: string; fullName: string; email: string }> = [];

    if (currentUser.role === 'admin') {
      // Admin lấy danh sách các thành viên để có dropdown chuyển đổi
      const users = await User.find({ role: 'user' })
        .select('_id fullName email')
        .sort({ fullName: 1 })
        .lean();
      membersList = users.map((u: any) => ({
        _id: u._id.toString(),
        fullName: u.fullName,
        email: u.email,
      }));

      if (requestedUserId) {
        targetUserId = requestedUserId;
      } else if (membersList.length > 0) {
        targetUserId = membersList[0]._id;
      }
    }

    // Lấy thông tin user mục tiêu
    const targetUser = await User.findById(targetUserId).select('fullName email height weight role').lean();

    let record = await BodyMetric.findOne({ userId: targetUserId }).lean();

    // Nếu chưa có record nhưng có targetUser, tạo khung rỗng hoặc tuần 1 mặc định từ chiều cao/cân nặng của user
    if (!record && targetUser) {
      const initialHeight = (targetUser as any).height || undefined;
      const initialWeight = (targetUser as any).weight || undefined;
      let initialBmi: number | undefined;
      if (initialHeight && initialWeight) {
        const hm = initialHeight / 100;
        initialBmi = Math.round((initialWeight / (hm * hm)) * 10) / 10;
      }

      record = {
        userId: targetUserId,
        weeks: initialWeight ? [
          {
            weekNumber: 1,
            examDate: new Date().toISOString().split('T')[0],
            height: initialHeight,
            weight: initialWeight,
            bmi: initialBmi,
          },
        ] : [],
      } as any;
    }

    // Sắp xếp các tuần theo thứ tự tăng dần
    if (record && record.weeks) {
      record.weeks.sort((a, b) => a.weekNumber - b.weekNumber);
    }

    return NextResponse.json({
      success: true,
      data: record,
      targetUser,
      membersList,
      isAdmin: currentUser.role === 'admin',
    });
  } catch (error) {
    return NextResponse.json({ success: false, error: String(error) }, { status: 500 });
  }
}

// POST /api/body-metrics - Admin lưu / cập nhật chỉ số của 1 tuần cho thành viên
export async function POST(request: NextRequest) {
  try {
    await dbConnect();
    const currentUser = await getUserFromRequest(request);
    if (!currentUser || currentUser.role !== 'admin') {
      return NextResponse.json(
        { success: false, error: 'Chỉ Quản trị viên (Admin) mới có quyền nhập chỉ số cơ thể' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { userId, weekData } = body;

    if (!userId || !weekData || typeof weekData.weekNumber !== 'number') {
      return NextResponse.json(
        { success: false, error: 'Thiếu thông tin người dùng hoặc tuần khám' },
        { status: 400 }
      );
    }

    // Tự động tính BMI nếu có chiều cao và cân nặng
    const h = Number(weekData.height);
    const w = Number(weekData.weight);
    if (h > 0 && w > 0 && !weekData.bmi) {
      const hm = h / 100;
      weekData.bmi = Math.round((w / (hm * hm)) * 10) / 10;
    }

    // Tự động tính tỷ lệ eo hông nếu có eo và hông
    const waist = Number(weekData.waist);
    const hip = Number(weekData.hip);
    if (waist > 0 && hip > 0 && !weekData.waistHipRatio) {
      weekData.waistHipRatio = Math.round((waist / hip) * 100) / 100;
    }

    let record = await BodyMetric.findOne({ userId });

    if (!record) {
      record = await BodyMetric.create({
        userId,
        weeks: [weekData],
      });
    } else {
      const existingIdx = record.weeks.findIndex(
        (wk) => wk.weekNumber === weekData.weekNumber
      );

      if (existingIdx >= 0) {
        record.weeks[existingIdx] = { ...record.weeks[existingIdx], ...weekData };
      } else {
        record.weeks.push(weekData);
      }

      record.weeks.sort((a, b) => a.weekNumber - b.weekNumber);
      await record.save();
    }

    // Cập nhật lại chiều cao / cân nặng mới nhất vào hồ sơ User nếu có
    if (h > 0 || w > 0) {
      const updateFields: Record<string, number> = {};
      if (h > 0) updateFields.height = h;
      if (w > 0) updateFields.weight = w;
      await User.findByIdAndUpdate(userId, { $set: updateFields });
    }

    return NextResponse.json({ success: true, data: record });
  } catch (error) {
    return NextResponse.json({ success: false, error: String(error) }, { status: 500 });
  }
}

// DELETE /api/body-metrics?userId=xxx&weekNumber=x - Chỉ Admin
export async function DELETE(request: NextRequest) {
  try {
    await dbConnect();
    const currentUser = await getUserFromRequest(request);
    if (!currentUser || currentUser.role !== 'admin') {
      return NextResponse.json(
        { success: false, error: 'Chỉ Quản trị viên (Admin) mới có quyền xóa dữ liệu' },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const weekNumber = Number(searchParams.get('weekNumber'));

    if (!userId || isNaN(weekNumber)) {
      return NextResponse.json({ success: false, error: 'Thông tin không hợp lệ' }, { status: 400 });
    }

    const record = await BodyMetric.findOne({ userId });
    if (!record) {
      return NextResponse.json({ success: false, error: 'Không tìm thấy dữ liệu' }, { status: 404 });
    }

    record.weeks = record.weeks.filter((wk) => wk.weekNumber !== weekNumber);
    await record.save();

    return NextResponse.json({ success: true, message: `Đã xóa dữ liệu Tuần ${weekNumber}` });
  } catch (error) {
    return NextResponse.json({ success: false, error: String(error) }, { status: 500 });
  }
}

