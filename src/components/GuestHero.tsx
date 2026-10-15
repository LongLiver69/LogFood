'use client';

import { UtensilsCrossed, Scale, Calendar, Lock, Sparkles, LogIn, ArrowRight, ShieldCheck } from 'lucide-react';
import Link from 'next/link';

interface GuestHeroProps {
  onOpenLogin: () => void;
  onOpenRegister: () => void;
}

export default function GuestHero({ onOpenLogin, onOpenRegister }: GuestHeroProps) {
  return (
    <div className="max-w-5xl mx-auto py-12 px-4 sm:px-6 lg:px-8 space-y-12 animate-fade-in text-center">
      {/* Hero Badge */}
      <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-cyan-400/30 bg-cyan-400/10 text-cyan-300 text-xs font-semibold">
        <Sparkles size={14} className="text-cyan-400" />
        Hệ Thống Quản Lý Chế Độ Dinh Dưỡng Khoa Học
      </div>

      {/* Main Title & Description */}
      <div className="space-y-4 max-w-3xl mx-auto">
        <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight leading-tight">
          Cá Nhân Hóa Thực Đơn <br />
          <span className="gradient-text">Kiểm Soát Năng Lượng Chuẩn Xác</span>
        </h1>
        <p className="text-sm sm:text-base text-slate-300 leading-relaxed">
          LogFood giúp bạn lựa chọn món ăn theo từng bữa, quản lý định lượng thực phẩm (gam sống &amp; gam chín)
          và theo dõi chỉ số thể trạng (BMI) cá nhân hóa. Vui lòng đăng nhập để bắt đầu xây dựng kế hoạch dinh dưỡng của bạn.
        </p>
      </div>

      {/* CTA Buttons */}
      <div className="flex items-center justify-center gap-4 flex-wrap">
        <button
          onClick={onOpenRegister}
          className="btn-primary text-sm py-3 px-6 shadow-lg shadow-cyan-500/20 inline-flex items-center gap-2 whitespace-nowrap"
        >
          <Sparkles size={16} className="shrink-0" />
          <span>Đăng Ký Thành Viên Mới</span>
        </button>
        <button
          onClick={onOpenLogin}
          className="btn-ghost text-sm py-3 px-6 hover:text-white inline-flex items-center gap-2 whitespace-nowrap"
        >
          <LogIn size={16} className="shrink-0" />
          <span>Đã có tài khoản? Đăng nhập</span>
        </button>
      </div>

      {/* Notice that menu requires login */}
      <div className="p-4 rounded-2xl bg-white/5 border border-white/10 max-w-xl mx-auto text-xs text-slate-400 flex items-center justify-center gap-2">
        <Lock size={15} className="text-amber-400 shrink-0" />
        <span>Thực đơn và kế hoạch tuần được bảo mật. Bạn cần đăng nhập để xem và chọn món.</span>
      </div>

      {/* Feature Highlights Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-left pt-6">
        <div className="glass-card p-5 space-y-2.5 hover:border-cyan-400/40 transition-all">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-cyan-500/20 text-cyan-400 border border-cyan-500/30">
            <UtensilsCrossed size={20} />
          </div>
          <h3 className="text-sm font-bold text-white">Chế Độ 1000 &amp; 1200 Kcal</h3>
          <p className="text-xs text-slate-400 leading-relaxed">
            Thực đơn chia 4 bữa khoa học (Sáng, Trưa, Phụ chiều, Tối) với lượng calo được tính toán tối ưu.
          </p>
        </div>

        <div className="glass-card p-5 space-y-2.5 hover:border-emerald-400/40 transition-all">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
            <Scale size={20} />
          </div>
          <h3 className="text-sm font-bold text-white">Định Lượng Sống &amp; Chín</h3>
          <p className="text-xs text-slate-400 leading-relaxed">
            Mỗi món ăn đi kèm bảng số gam nguyên liệu sống và chín cùng hướng dẫn nấu chi tiết.
          </p>
        </div>

        <div className="glass-card p-5 space-y-2.5 hover:border-purple-400/40 transition-all">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-purple-500/20 text-purple-400 border border-purple-500/30">
            <ShieldCheck size={20} />
          </div>
          <h3 className="text-sm font-bold text-white">Theo Dõi Thể Trạng BMI</h3>
          <p className="text-xs text-slate-400 leading-relaxed">
            Tự động tính chỉ số BMI theo chuẩn Châu Á và gợi ý chế độ dinh dưỡng phù hợp với cơ thể bạn.
          </p>
        </div>

        <div className="glass-card p-5 space-y-2.5 hover:border-amber-400/40 transition-all">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-amber-500/20 text-amber-400 border border-amber-500/30">
            <Calendar size={20} />
          </div>
          <h3 className="text-sm font-bold text-white">Kỷ Luật &amp; Khóa Ngày</h3>
          <p className="text-xs text-slate-400 leading-relaxed">
            Tự động khóa thực đơn khi ngày kết thúc, giúp bạn duy trì thói quen dinh dưỡng ổn định và nghiêm túc.
          </p>
        </div>
      </div>
    </div>
  );
}
