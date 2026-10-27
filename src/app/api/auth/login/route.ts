import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import dbConnect from '@/lib/mongodb';
import { User } from '@/models';
import { signToken, calculateBMI } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    await dbConnect();
    const body = await request.json();
    const { email, password } = body;

    if (!email || !password) {
      return NextResponse.json(
        { success: false, error: 'Vui lòng nhập email và mật khẩu' },
        { status: 400 }
      );
    }

    const cleanEmail = email.toLowerCase().trim();
    const user = await User.findOne({ email: cleanEmail });

    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Email hoặc mật khẩu không chính xác' },
        { status: 401 }
      );
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return NextResponse.json(
        { success: false, error: 'Email hoặc mật khẩu không chính xác' },
        { status: 401 }
      );
    }

    // Kiểm tra phê duyệt của Quản trị viên đối với tài khoản 'user'
    if (user.role === 'user' && user.isApproved === false) {
      return NextResponse.json(
        {
          success: false,
          error: 'Tài khoản của bạn chưa được Quản trị viên phê duyệt. Vui lòng liên hệ Admin để được kích hoạt tài khoản.',
        },
        { status: 403 }
      );
    }

    const token = signToken({
      userId: user._id.toString(),
      email: user.email,
      role: user.role,
      fullName: user.fullName,
    });

    const bmiInfo = calculateBMI(user.weight, user.height);

    const weeklyDietPreferences = user.weeklyDietPreferences instanceof Map
      ? Object.fromEntries(user.weeklyDietPreferences)
      : (user.weeklyDietPreferences || {});

    const response = NextResponse.json({
      success: true,
      message: 'Đăng nhập thành công',
      data: {
        _id: user._id,
        email: user.email,
        fullName: user.fullName,
        role: user.role,
        isApproved: user.isApproved ?? true,
        height: user.height,
        weight: user.weight,
        targetWeight: user.targetWeight,
        gender: user.gender,
        age: user.age,
        dietPreference: user.dietPreference,
        weeklyDietPreferences,
        bmiInfo,
      },
      token,
    });

    response.cookies.set('auth_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 7 * 24 * 60 * 60,
    });

    return response;
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json({ success: false, error: 'Đã có lỗi xảy ra khi đăng nhập' }, { status: 500 });
  }
}
