'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  Shield,
  UtensilsCrossed,
  Users,
  Plus,
  Check,
  Edit2,
  X,
  Eye,
  UserPlus,
  ArrowLeft,
  LogOut,
  KeyRound,
  User as UserIcon,
  ChevronDown,
} from 'lucide-react';
import { Dish, AdminUserItem, UserProfile } from '@/types';
import { MEAL_LABELS, MEAL_ORDER } from '@/lib/constants';
import AdminMemberPlansModal from '@/components/AdminMemberPlansModal';
import ProfileModal from '@/components/ProfileModal';
import ChangePasswordModal from '@/components/ChangePasswordModal';

export default function AdminPage() {
  const router = useRouter();
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);

  // Admin Profile & Auth Modals
  const [showAdminMenu, setShowAdminMenu] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [showChangePasswordModal, setShowChangePasswordModal] = useState(false);

  const [adminTab, setAdminTab] = useState<'dishes' | 'users'>('dishes');
  const [activeMealTab, setActiveMealTab] = useState('breakfast');
  const [dietTypeFilter, setDietTypeFilter] = useState('1000kcal');
  const [dishes, setDishes] = useState<Record<string, Dish[]>>({});
  const [usersList, setUsersList] = useState<AdminUserItem[]>([]);
  const [loadingDishes, setLoadingDishes] = useState(false);
  const [loadingUsers, setLoadingUsers] = useState(false);

  const [showForm, setShowForm] = useState(false);
  const [editingDish, setEditingDish] = useState<Dish | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    calories: '',
    meal: 'breakfast',
    dietType: '1000kcal',
    cookingInstructions: '',
    ingredients: [{ name: '', rawGrams: '', cookedGrams: '' }],
  });
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState('');

  // Selected user to view their meals
  const [inspectUserId, setInspectUserId] = useState<string | null>(null);

  // Check auth session
  useEffect(() => {
    async function checkAuth() {
      try {
        const res = await fetch('/api/auth/me');
        const json = await res.json();
        if (json.success && json.user) {
          setCurrentUser(json.user);
        } else {
          setCurrentUser(null);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setIsCheckingAuth(false);
      }
    }
    checkAuth();
  }, []);

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
      router.push('/');
    } catch (err) {
      console.error('Logout error', err);
    }
  };

  // Load dishes
  const loadDishes = useCallback(async () => {
    setLoadingDishes(true);
    try {
      const res = await fetch(`/api/dishes?dietType=${dietTypeFilter}`);
      const data = await res.json();
      if (data.success) {
        const grouped: Record<string, Dish[]> = {};
        data.data.forEach((d: Dish) => {
          if (!grouped[d.meal]) grouped[d.meal] = [];
          grouped[d.meal].push(d);
        });
        setDishes(grouped);
      }
    } catch (err) {
      console.error('Failed to load dishes', err);
    } finally {
      setLoadingDishes(false);
    }
  }, [dietTypeFilter]);

  // Load users (chỉ lấy thành viên, không bao gồm admin)
  const loadAdminUsers = useCallback(async () => {
    setLoadingUsers(true);
    try {
      const res = await fetch('/api/admin/users');
      const data = await res.json();
      if (data.success) {
        const regularMembers = (data.data || []).filter((u: AdminUserItem) => u.role !== 'admin');
        setUsersList(regularMembers);
      }
    } catch (err) {
      console.error('Failed to load admin users', err);
    } finally {
      setLoadingUsers(false);
    }
  }, []);

  useEffect(() => {
    if (currentUser?.role === 'admin') {
      if (adminTab === 'dishes') {
        loadDishes();
      } else {
        loadAdminUsers();
      }
    }
  }, [currentUser, adminTab, loadDishes, loadAdminUsers]);

  const resetForm = () => {
    setFormData({
      name: '',
      calories: '',
      meal: 'breakfast',
      dietType: '1000kcal',
      cookingInstructions: '',
      ingredients: [{ name: '', rawGrams: '', cookedGrams: '' }],
    });
    setEditingDish(null);
  };

  const handleEdit = (dish: Dish) => {
    setEditingDish(dish);
    setFormData({
      name: dish.name,
      calories: String(dish.calories),
      meal: dish.meal,
      dietType: dish.dietType,
      cookingInstructions: dish.cookingInstructions,
      ingredients: dish.ingredients.map((i) => ({
        name: i.name,
        rawGrams: String(i.rawGrams),
        cookedGrams: String(i.cookedGrams),
      })),
    });
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Bạn có chắc muốn xóa món ăn này khỏi hệ thống?')) return;
    try {
      const res = await fetch(`/api/dishes/${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        setMessage('Đã xóa món ăn thành công!');
        loadDishes();
        setTimeout(() => setMessage(''), 2000);
      } else {
        alert(data.error || 'Không thể xóa');
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleSubmit = async () => {
    setIsSaving(true);
    try {
      const payload = {
        name: formData.name,
        calories: Number(formData.calories),
        meal: formData.meal,
        dietType: formData.dietType,
        cookingInstructions: formData.cookingInstructions,
        ingredients: formData.ingredients
          .filter((i) => i.name)
          .map((i) => ({
            name: i.name,
            rawGrams: Number(i.rawGrams),
            cookedGrams: Number(i.cookedGrams),
          })),
      };

      const url = editingDish ? `/api/dishes/${editingDish._id}` : '/api/dishes';
      const method = editingDish ? 'PUT' : 'POST';
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (data.success) {
        setMessage(editingDish ? 'Đã cập nhật món ăn!' : 'Đã thêm món ăn mới thành công!');
        loadDishes();
        resetForm();
        setShowForm(false);
        setTimeout(() => setMessage(''), 2000);
      } else {
        alert(data.error || 'Không thể lưu món ăn');
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsSaving(false);
    }
  };

  const addIngredient = () => {
    setFormData((f) => ({
      ...f,
      ingredients: [...f.ingredients, { name: '', rawGrams: '', cookedGrams: '' }],
    }));
  };

  const updateIngredient = (idx: number, field: string, value: string) => {
    setFormData((f) => ({
      ...f,
      ingredients: f.ingredients.map((ing, i) => (i === idx ? { ...ing, [field]: value } : ing)),
    }));
  };

  const removeIngredient = (idx: number) => {
    setFormData((f) => ({
      ...f,
      ingredients: f.ingredients.filter((_, i) => i !== idx),
    }));
  };

  if (isCheckingAuth) {
    return (
      <div className="hero-bg min-h-screen flex items-center justify-center p-4">
        <div className="w-10 h-10 border-2 border-purple-400 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!currentUser || currentUser.role !== 'admin') {
    return (
      <div className="hero-bg min-h-screen flex items-center justify-center p-4">
        <div className="glass-card max-w-md w-full p-8 text-center space-y-4">
          <div className="w-12 h-12 rounded-2xl flex items-center justify-center bg-red-500/20 text-red-400 mx-auto border border-red-500/30">
            <Shield size={24} />
          </div>
          <h2 className="text-xl font-bold text-white">Truy Cập Bị Giới Hạn</h2>
          <p className="text-xs text-slate-400 leading-relaxed">
            Trang này chỉ dành riêng cho Quản trị viên hệ thống. Người dùng bình thường không có quyền truy cập.
          </p>
          <div className="pt-2">
            <Link href="/" className="btn-primary text-xs py-2 px-4 inline-flex items-center gap-1.5">
              <ArrowLeft size={14} /> Trở về trang chủ
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const tabDishes = dishes[activeMealTab] || [];

  return (
    <div className="hero-bg min-h-screen pb-16">
      {/* Top Navbar */}
      <header className="sticky top-0 z-40 navbar-solid px-4 py-3">
        <div className="max-w-screen-2xl mx-auto flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-purple-500/20 text-purple-300 border border-purple-500/30">
              <Shield size={20} />
            </div>
            <div>
              <h1 className="text-base font-bold text-white">Bảng Quản Trị Hệ Thống</h1>
              <p className="text-[11px] text-slate-400">LogFood Nutrition Manager</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/admin/create-admin"
              className="btn-ghost text-xs py-1.5 px-3 flex items-center gap-1.5 text-purple-300 border-purple-500/30 bg-purple-500/10 hover:bg-purple-500/20"
            >
              <UserPlus size={14} />
              <span className="hidden sm:inline">Tạo Admin Mới</span>
            </Link>

            {/* Admin User Menu: Edit info, Change password, Logout */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setShowAdminMenu(!showAdminMenu)}
                className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white/5 border border-purple-500/30 hover:border-purple-400/60 transition-all"
              >
                <div className="w-6 h-6 rounded-lg flex items-center justify-center bg-purple-500/20 text-purple-300">
                  <UserIcon size={14} />
                </div>
                <div className="text-left hidden md:block">
                  <div className="text-xs font-bold text-white truncate max-w-[120px]">
                    {currentUser?.fullName || 'Quản trị viên'}
                  </div>
                  <div className="text-[10px] text-purple-300 font-semibold">Admin</div>
                </div>
                <ChevronDown size={14} className="text-slate-400" />
              </button>

              {showAdminMenu && (
                <div className="absolute right-0 mt-2 w-60 rounded-2xl dropdown-solid p-2 z-50 animate-fade-in">
                  <div className="px-3 py-2 border-b border-white/10 mb-1">
                    <div className="text-xs font-bold text-white">{currentUser?.fullName}</div>
                    <div className="text-[11px] text-slate-400 truncate">{currentUser?.email}</div>
                    <span className="inline-block mt-1 px-2 py-0.5 rounded text-[10px] font-bold bg-purple-500/20 text-purple-300 border border-purple-500/30">
                      Tài khoản Quản trị
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      setShowAdminMenu(false);
                      setShowProfileModal(true);
                    }}
                    className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs text-slate-300 hover:text-white hover:bg-white/5 transition-all text-left cursor-pointer"
                  >
                    <Edit2 size={14} className="text-cyan-400 shrink-0" />
                    <span>Chỉnh sửa thông tin</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setShowAdminMenu(false);
                      setShowChangePasswordModal(true);
                    }}
                    className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs text-slate-300 hover:text-white hover:bg-white/5 transition-all text-left cursor-pointer"
                  >
                    <KeyRound size={14} className="text-amber-400 shrink-0" />
                    <span>Đổi mật khẩu</span>
                  </button>

                  <div className="border-t border-white/10 my-1" />

                  <button
                    type="button"
                    onClick={() => {
                      setShowAdminMenu(false);
                      handleLogout();
                    }}
                    className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-all text-left cursor-pointer font-semibold"
                  >
                    <LogOut size={14} className="shrink-0" />
                    <span>Đăng xuất</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-screen-2xl mx-auto p-4 space-y-6">
        {/* Navigation Tabs */}
        <div className="glass-card p-4 flex items-center justify-between flex-wrap gap-4">
          <div className="flex p-1 rounded-xl bg-white/5 border border-white/10">
            <button
              type="button"
              onClick={() => setAdminTab('dishes')}
              className={`px-4 py-2 rounded-lg text-xs font-bold flex items-center gap-2 transition-all ${adminTab === 'dishes' ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 shadow' : 'text-slate-400 hover:text-white'
                }`}
            >
              <UtensilsCrossed size={14} /> Quản lý món ăn
            </button>
            <button
              type="button"
              onClick={() => setAdminTab('users')}
              className={`px-4 py-2 rounded-lg text-xs font-bold flex items-center gap-2 transition-all ${adminTab === 'users' ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30 shadow' : 'text-slate-400 hover:text-white'
                }`}
            >
              <Users size={14} /> Danh sách thành viên &amp; Xem thực đơn
            </button>
          </div>

          {message && (
            <span className="text-xs text-emerald-400 flex items-center gap-1 animate-fade-in font-medium">
              <Check size={14} /> {message}
            </span>
          )}
        </div>

        {adminTab === 'dishes' ? (
          <div className="space-y-6 animate-fade-in">
            {/* Action Bar */}
            <div className="flex items-center justify-between flex-wrap gap-3">
              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-400">Xem chế độ:</span>
                <div className="flex rounded-lg p-0.5 bg-white/5 border border-white/10 text-xs">
                  <button
                    onClick={() => setDietTypeFilter('1000kcal')}
                    className={`px-3 py-1 rounded-md font-semibold transition-all ${dietTypeFilter === '1000kcal' ? 'bg-cyan-500/20 text-cyan-300' : 'text-slate-400 hover:text-white'
                      }`}
                  >
                    1000 kcal
                  </button>
                  <button
                    onClick={() => setDietTypeFilter('1200kcal')}
                    className={`px-3 py-1 rounded-md font-semibold transition-all ${dietTypeFilter === '1200kcal' ? 'bg-cyan-500/20 text-cyan-300' : 'text-slate-400 hover:text-white'
                      }`}
                  >
                    1200 kcal
                  </button>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => { resetForm(); setShowForm(!showForm); }}
                  className="btn-primary text-xs flex items-center gap-1.5"
                >
                  <Plus size={16} /> Thêm món mới
                </button>
              </div>
            </div>

            {/* Form Thêm / Sửa Món */}
            {showForm && (
              <div className="glass-card p-6 animate-fade-in border-cyan-500/30">
                <h3 className="text-base font-bold text-white mb-4 flex items-center gap-2">
                  <Edit2 size={16} className="text-cyan-400" />
                  {editingDish ? 'Chỉnh sửa món ăn' : 'Thêm món ăn mới vào hệ thống'}
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs text-slate-400 mb-1.5 font-medium">Tên món ăn *</label>
                    <input
                      className="input-dark"
                      placeholder="VD: Cơm gạo lứt + Ức gà áp chảo"
                      value={formData.name}
                      onChange={(e) => setFormData((f) => ({ ...f, name: e.target.value }))}
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-slate-400 mb-1.5 font-medium">Calories (kcal) *</label>
                    <input
                      className="input-dark"
                      type="number"
                      placeholder="VD: 350"
                      value={formData.calories}
                      onChange={(e) => setFormData((f) => ({ ...f, calories: e.target.value }))}
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-slate-400 mb-1.5 font-medium">Bữa ăn *</label>
                    <select
                      className="input-dark"
                      value={formData.meal}
                      onChange={(e) => setFormData((f) => ({ ...f, meal: e.target.value }))}
                    >
                      {Object.entries(MEAL_LABELS).map(([k, v]) => (
                        <option key={k} value={k} style={{ background: '#1e293b' }}>{v}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs text-slate-400 mb-1.5 font-medium">Chế độ dinh dưỡng *</label>
                    <select
                      className="input-dark"
                      value={formData.dietType}
                      onChange={(e) => setFormData((f) => ({ ...f, dietType: e.target.value }))}
                    >
                      <option value="1000kcal" style={{ background: '#1e293b' }}>1000 kcal (4 bữa: 250 - 350 - 100 - 300)</option>
                      <option value="1200kcal" style={{ background: '#1e293b' }}>1200 kcal (4 bữa: 300 - 400 - 150 - 350)</option>
                    </select>
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-xs text-slate-400 mb-1.5 font-medium">Hướng dẫn nấu &amp; chế biến</label>
                    <textarea
                      className="input-dark"
                      rows={3}
                      placeholder="Các bước chế biến, nêm gia vị, thời gian luộc/áp chảo..."
                      value={formData.cookingInstructions}
                      onChange={(e) => setFormData((f) => ({ ...f, cookingInstructions: e.target.value }))}
                    />
                  </div>
                </div>

                {/* Ingredients list */}
                <div className="mt-5 pt-4 border-t border-white/10">
                  <div className="flex items-center justify-between mb-3">
                    <label className="text-xs font-bold text-cyan-400 uppercase tracking-wider">
                      Thành phần định lượng (Số g sống &amp; số g chín)
                    </label>
                    <button type="button" onClick={addIngredient} className="btn-ghost text-xs flex items-center gap-1.5 py-1 px-3">
                      <Plus size={12} /> Thêm nguyên liệu
                    </button>
                  </div>
                  <div className="space-y-2">
                    {formData.ingredients.map((ing, idx) => (
                      <div key={idx} className="grid grid-cols-[1fr,110px,110px,36px] gap-2 items-center">
                        <input
                          className="input-dark text-xs"
                          placeholder="Tên nguyên liệu (VD: Ức gà nạc)"
                          value={ing.name}
                          onChange={(e) => updateIngredient(idx, 'name', e.target.value)}
                        />
                        <input
                          className="input-dark text-xs text-center"
                          type="number"
                          placeholder="Số g sống"
                          value={ing.rawGrams}
                          onChange={(e) => updateIngredient(idx, 'rawGrams', e.target.value)}
                        />
                        <input
                          className="input-dark text-xs text-center"
                          type="number"
                          placeholder="Số g chín"
                          value={ing.cookedGrams}
                          onChange={(e) => updateIngredient(idx, 'cookedGrams', e.target.value)}
                        />
                        <button
                          type="button"
                          onClick={() => removeIngredient(idx)}
                          className="btn-danger p-2 flex items-center justify-center text-xs h-[38px] rounded-lg"
                          title="Xóa nguyên liệu"
                        >
                          <X size={14} />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="mt-6 flex items-center gap-3">
                  <button
                    type="button"
                    onClick={handleSubmit}
                    disabled={isSaving || !formData.name || !formData.calories}
                    className="btn-primary text-xs"
                  >
                    <Check size={16} />
                    {isSaving ? 'Đang lưu...' : editingDish ? 'Lưu cập nhật' : 'Tạo món ăn'}
                  </button>
                  <button
                    type="button"
                    onClick={() => { resetForm(); setShowForm(false); }}
                    className="btn-ghost text-xs"
                  >
                    Hủy
                  </button>
                </div>
              </div>
            )}

            {/* Dish table by meal tabs */}
            <div className="glass-card overflow-hidden">
              <div className="flex border-b border-white/10 overflow-x-auto">
                {MEAL_ORDER.map((meal) => (
                  <button
                    key={meal}
                    onClick={() => setActiveMealTab(meal)}
                    className={`px-5 py-3.5 text-xs font-bold whitespace-nowrap transition-all border-b-2 flex items-center gap-2 ${activeMealTab === meal ? 'border-cyan-400 text-cyan-400 bg-cyan-400/5' : 'border-transparent text-slate-400 hover:text-white'
                      }`}
                  >
                    {MEAL_LABELS[meal]}
                    <span className="px-2 py-0.5 rounded-full text-[10px] bg-white/10 text-slate-300">
                      {(dishes[meal] || []).length}
                    </span>
                  </button>
                ))}
              </div>

              <div className="overflow-x-auto">
                {loadingDishes ? (
                  <div className="p-12 text-center text-slate-400">
                    <div className="w-8 h-8 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
                    Đang tải danh sách món ăn...
                  </div>
                ) : tabDishes.length === 0 ? (
                  <div className="p-12 text-center text-slate-400">
                    <UtensilsCrossed size={36} className="mx-auto mb-3 opacity-40 text-slate-500" />
                    <div className="text-sm">Chưa có món ăn nào trong bữa này</div>
                  </div>
                ) : (
                  <table className="w-full text-xs">
                    <thead>
                      <tr style={{ background: 'rgba(255,255,255,0.03)' }}>
                        <th className="px-5 py-3 text-left font-semibold text-slate-400 uppercase">Tên món</th>
                        <th className="px-5 py-3 text-center font-semibold text-slate-400 uppercase">Calories</th>
                        <th className="px-5 py-3 text-left font-semibold text-slate-400 uppercase">Định lượng thành phần (g)</th>
                        <th className="px-5 py-3 text-center font-semibold text-slate-400 uppercase">Thao tác</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                      {tabDishes.map((dish) => (
                        <tr key={dish._id} className="hover:bg-white/5 transition-colors">
                          <td className="px-5 py-3.5">
                            <div className="font-semibold text-white">{dish.name}</div>
                            <div className="text-[10px] text-slate-500 mt-0.5">{dish.dietType}</div>
                          </td>
                          <td className="px-5 py-3.5 text-center">
                            <span className="px-2.5 py-1 rounded-full font-bold text-orange-400 bg-orange-400/10 border border-orange-400/20">
                              {dish.calories} kcal
                            </span>
                          </td>
                          <td className="px-5 py-3.5">
                            <div className="flex flex-wrap gap-1.5">
                              {dish.ingredients.map((ing, i) => (
                                <span key={i} className="px-2 py-0.5 rounded bg-white/5 text-slate-300 text-[11px] border border-white/5">
                                  {ing.name} ({ing.rawGrams}g sống &rarr; {ing.cookedGrams}g chín)
                                </span>
                              ))}
                            </div>
                          </td>
                          <td className="px-5 py-3.5 text-center">
                            <div className="flex items-center justify-center gap-1.5">
                              <button
                                onClick={() => handleEdit(dish)}
                                className="px-2.5 py-1 rounded text-cyan-400 hover:bg-cyan-400/10 border border-cyan-400/30 transition-all"
                              >
                                Sửa
                              </button>
                              <button
                                onClick={() => handleDelete(dish._id)}
                                className="px-2.5 py-1 rounded text-red-400 hover:bg-red-400/10 border border-red-400/30 transition-all"
                              >
                                Xóa
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            </div>
          </div>
        ) : (
          /* Tab 2: Users & Member Meal Inspection */
          <div className="glass-card overflow-hidden animate-fade-in">
            <div className="p-5 border-b border-white/10 flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <Users size={18} className="text-purple-400" />
                  Danh Sách Thành Viên &amp; Xem Thực Đơn Đã Chọn
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Bấm nút &ldquo;Xem thực đơn&rdquo; để xem chi tiết danh sách món ăn từng bữa của thành viên
                </p>
              </div>
              <button
                onClick={loadAdminUsers}
                className="btn-ghost text-xs flex items-center gap-1.5"
              >
                Làm mới danh sách
              </button>
            </div>

            {loadingUsers ? (
              <div className="p-12 text-center text-slate-400">
                <div className="w-8 h-8 border-2 border-purple-400 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
                Đang tải danh sách thành viên...
              </div>
            ) : usersList.length === 0 ? (
              <div className="p-12 text-center text-slate-400">
                Chưa có thành viên nào đăng ký trong hệ thống
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-xs">
                  <thead>
                    <tr style={{ background: 'rgba(255,255,255,0.03)' }}>
                      <th className="px-5 py-3 text-left font-semibold text-slate-400 uppercase">Thành viên</th>
                      <th className="px-5 py-3 text-center font-semibold text-slate-400 uppercase">Chế độ</th>
                      <th className="px-5 py-3 text-center font-semibold text-slate-400 uppercase">Chiều cao / Cân nặng</th>
                      <th className="px-5 py-3 text-center font-semibold text-slate-400 uppercase">Chỉ số BMI</th>
                      <th className="px-5 py-3 text-center font-semibold text-slate-400 uppercase">Số ngày đã chọn</th>
                      <th className="px-5 py-3 text-center font-semibold text-slate-400 uppercase">Chi tiết thực đơn</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {usersList.map((u) => (
                      <tr key={u._id} className="hover:bg-white/5 transition-colors">
                        <td className="px-5 py-3.5">
                          <div className="font-bold text-white">{u.fullName}</div>
                          <div className="text-[11px] text-slate-400">{u.email}</div>
                        </td>
                        <td className="px-5 py-3.5 text-center">
                          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                            {u.dietPreference || '1000kcal'}
                          </span>
                        </td>
                        <td className="px-5 py-3.5 text-center">
                          {u.height && u.weight ? (
                            <span className="font-semibold text-slate-200">
                              {u.height} cm • {u.weight} kg
                              {u.targetWeight && <span className="text-slate-400 text-[10px] block">Mục tiêu: {u.targetWeight} kg</span>}
                            </span>
                          ) : (
                            <span className="text-slate-500 italic">Chưa nhập</span>
                          )}
                        </td>
                        <td className="px-5 py-3.5 text-center">
                          {u.bmiInfo ? (
                            <div>
                              <span
                                className="px-2 py-0.5 rounded-full font-bold text-[11px]"
                                style={{ background: `${u.bmiInfo.color}20`, color: u.bmiInfo.color, border: `1px solid ${u.bmiInfo.color}30` }}
                              >
                                BMI {u.bmiInfo.bmi} • {u.bmiInfo.status}
                              </span>
                            </div>
                          ) : (
                            <span className="text-slate-500 italic">--</span>
                          )}
                        </td>
                        <td className="px-5 py-3.5 text-center">
                          <span className="px-2.5 py-1 rounded bg-white/5 font-semibold text-cyan-300">
                            {u.planCount} ngày đã chọn
                          </span>
                        </td>
                        <td className="px-5 py-3.5 text-center">
                          <button
                            onClick={() => setInspectUserId(u._id)}
                            className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-purple-500/10 hover:bg-purple-500/20 text-purple-300 border border-purple-500/30 transition-all inline-flex items-center gap-1.5"
                          >
                            <Eye size={14} /> Xem thực đơn
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </main>

      {/* Modal inspection of member's selected meals */}
      <AdminMemberPlansModal
        userId={inspectUserId}
        onClose={() => setInspectUserId(null)}
      />

      {/* Admin Profile Modal */}
      <ProfileModal
        isOpen={showProfileModal}
        onClose={() => setShowProfileModal(false)}
        user={currentUser}
        onUpdateSuccess={(updated) => {
          setCurrentUser(updated);
          setMessage('Cập nhật thông tin Quản trị viên thành công!');
          setTimeout(() => setMessage(''), 3000);
        }}
      />

      {/* Admin Change Password Modal */}
      <ChangePasswordModal
        isOpen={showChangePasswordModal}
        onClose={() => setShowChangePasswordModal(false)}
      />
    </div>
  );
}
