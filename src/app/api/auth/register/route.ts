import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import dbConnect from '@/lib/mongodb';
import { User } from '@/models';
import { calculateBMI } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    await dbConnect();
    const body = await request.json();
    const { email, password, fullName, height, weight, targetWeight, gender, age } = body;

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

    const cleanEmail = email.toLowerCase().trim();
    const existing = await User.findOne({ email: cleanEmail });
    if (existing) {
      return NextResponse.json(
        { success: false, error: 'Email này đã được sử dụng. Vui lòng đăng nhập hoặc dùng email khác.' },
        { status: 400 }
      );
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Mọi người dùng đăng ký thông thường ĐỀU là 'user' và mặc định chờ duyệt (isApproved: false)
    const user = await User.create({
      email: cleanEmail,
      password: hashedPassword,
      fullName: fullName.trim(),
      role: 'user',
      isApproved: false, // Bắt buộc admin xác nhận mới được đăng nhập
      height: height ? Number(height) : undefined,
      weight: weight ? Number(weight) : undefined,
      targetWeight: targetWeight ? Number(targetWeight) : undefined,
      gender: gender || 'female',
      age: age ? Number(age) : undefined,
    });

    const bmiInfo = calculateBMI(user.weight, user.height);

    // Người dùng cần được admin xác nhận mới được đăng nhập, nên không cấp cookie phiên ngay
    return NextResponse.json(
      {
        success: true,
        requiresApproval: true,
        message: 'Đăng ký tài khoản thành công! Tài khoản của bạn đang chờ Quản trị viên phê duyệt để có thể đăng nhập.',
        data: {
          _id: user._id,
          email: user.email,
          fullName: user.fullName,
          role: user.role,
          isApproved: user.isApproved,
          height: user.height,
          weight: user.weight,
          targetWeight: user.targetWeight,
          gender: user.gender,
          age: user.age,
          bmiInfo,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Registration error:', error);
    return NextResponse.json({ success: false, error: 'Đã có lỗi xảy ra khi đăng ký' }, { status: 500 });
  }
}
