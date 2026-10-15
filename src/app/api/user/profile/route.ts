import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import { User } from '@/models';
import { getUserFromRequest, calculateBMI, signToken } from '@/lib/auth';

export async function PUT(request: NextRequest) {
  try {
    const currentUser = await getUserFromRequest(request);
    if (!currentUser) {
      return NextResponse.json(
        { success: false, error: 'Vui lòng đăng nhập để thực hiện tính năng này' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { height, weight, targetWeight, gender, age, fullName, dietPreference, email } = body;

    await dbConnect();
    const updateData: Record<string, unknown> = {};

    if (height !== undefined) updateData.height = height !== null && height !== '' ? Number(height) : null;
    if (weight !== undefined) updateData.weight = weight !== null && weight !== '' ? Number(weight) : null;
    if (targetWeight !== undefined) updateData.targetWeight = targetWeight !== null && targetWeight !== '' ? Number(targetWeight) : null;
    if (gender !== undefined) updateData.gender = gender;
    if (age !== undefined) updateData.age = age !== null && age !== '' ? Number(age) : null;
    if (fullName) updateData.fullName = fullName.trim();
    if (dietPreference) updateData.dietPreference = dietPreference;

    // Cập nhật email nếu có thay đổi
    if (email) {
      const cleanEmail = email.toLowerCase().trim();
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(cleanEmail)) {
        return NextResponse.json({ success: false, error: 'Địa chỉ email không hợp lệ' }, { status: 400 });
      }

      if (cleanEmail !== currentUser.email.toLowerCase()) {
        const emailExists = await User.findOne({
          email: cleanEmail,
          _id: { $ne: currentUser._id },
        });
        if (emailExists) {
          return NextResponse.json(
            { success: false, error: 'Email này đã được sử dụng bởi một tài khoản khác' },
            { status: 400 }
          );
        }
        updateData.email = cleanEmail;
      }
    }

    const updatedUser = await User.findByIdAndUpdate(
      currentUser._id,
      { $set: updateData },
      { new: true, runValidators: true }
    ).select('-password');

    if (!updatedUser) {
      return NextResponse.json({ success: false, error: 'Không tìm thấy người dùng' }, { status: 404 });
    }

    const bmiInfo = calculateBMI(updatedUser.weight, updatedUser.height);

    // Ký lại token với email/fullName mới nhất để đồng bộ phiên làm việc
    const token = signToken({
      userId: updatedUser._id.toString(),
      email: updatedUser.email,
      role: updatedUser.role,
      fullName: updatedUser.fullName,
    });

    const response = NextResponse.json({
      success: true,
      message: 'Cập nhật thông tin thành công',
      user: {
        _id: updatedUser._id,
        email: updatedUser.email,
        fullName: updatedUser.fullName,
        role: updatedUser.role,
        height: updatedUser.height,
        weight: updatedUser.weight,
        targetWeight: updatedUser.targetWeight,
        gender: updatedUser.gender,
        age: updatedUser.age,
        dietPreference: updatedUser.dietPreference,
        bmiInfo,
      },
    });

    response.cookies.set('auth_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60,
      path: '/',
    });

    return response;
  } catch (error) {
    console.error('Update profile error:', error);
    return NextResponse.json({ success: false, error: 'Không thể cập nhật thông tin' }, { status: 500 });
  }
}
