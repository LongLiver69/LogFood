import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import dbConnect from '@/lib/mongodb';
import { User } from '@/models';
import { getUserFromRequest } from '@/lib/auth';

export const dynamic = 'force-dynamic';

const ADMIN_SETUP_SECRET = process.env.ADMIN_SETUP_SECRET;

export async function POST(request: NextRequest) {
  try {
    await dbConnect();
    const caller = await getUserFromRequest(request);
    const body = await request.json();
    const { email, password, fullName, secretKey } = body;

    if (!email || !password || !fullName) {
      return NextResponse.json(
        { success: false, error: 'Vui lòng cung cấp đầy đủ email, mật khẩu và họ tên' },
        { status: 400 }
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        { success: false, error: 'Mật khẩu phải có ít nhất 6 ký tự' },
        { status: 400 }
      );
    }

    // Bắt buộc: Chỉ ai nhập đúng mã bảo mật hệ thống (Secret Key) thì mới tạo được Quản trị viên
    const effectiveSecret = process.env.ADMIN_SETUP_SECRET || 'Admin@2001';
    if (!secretKey || secretKey.trim() !== effectiveSecret.trim()) {
      return NextResponse.json(
        { success: false, error: 'Mã bảo mật hệ thống không chính xác. Chỉ ai có mã bảo mật mới được phép thêm Quản trị viên.' },
        { status: 403 }
      );
    }

    const cleanEmail = email.toLowerCase().trim();
    const existing = await User.findOne({ email: cleanEmail });
    if (existing) {
      if (existing.role === 'admin') {
        return NextResponse.json(
          { success: false, error: 'Tài khoản email này đã là Quản trị viên' },
          { status: 400 }
        );
      }
      // Nâng cấp user thông thường lên admin
      const salt = await bcrypt.genSalt(10);
      existing.password = await bcrypt.hash(password, salt);
      existing.fullName = fullName.trim();
      existing.role = 'admin';
      await existing.save();

      return NextResponse.json({
        success: true,
        message: 'Đã nâng cấp tài khoản thành Quản trị viên thành công',
        data: {
          _id: existing._id,
          email: existing.email,
          fullName: existing.fullName,
          role: existing.role,
        },
      });
    }

    // Tạo mới tài khoản admin
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newAdmin = await User.create({
      email: cleanEmail,
      password: hashedPassword,
      fullName: fullName.trim(),
      role: 'admin',
    });

    return NextResponse.json({
      success: true,
      message: 'Tạo tài khoản Quản trị viên thành công',
      data: {
        _id: newAdmin._id,
        email: newAdmin.email,
        fullName: newAdmin.fullName,
        role: newAdmin.role,
      },
    }, { status: 201 });
  } catch (error) {
    console.error('Create admin error:', error);
    return NextResponse.json({ success: false, error: 'Đã có lỗi xảy ra khi tạo tài khoản quản trị' }, { status: 500 });
  }
}
