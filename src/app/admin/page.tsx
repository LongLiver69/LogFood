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
  CheckCircle,
  AlertTriangle,
} from 'lucide-react';
import { Dish, AdminUserItem, UserProfile } from '@/types';
import { MEAL_LABELS, MEAL_ORDER, formatIngredientWeight } from '@/lib/constants';
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
        rawGrams: i.rawGrams !== undefined && i.rawGrams !== null ? String(i.rawGrams) : '',
        cookedGrams: i.cookedGrams !== undefined && i.cookedGrams !== null ? String(i.cookedGrams) : '',
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
          .filter((i) => i.name.trim())
          .map((i) => ({
            name: i.name.trim(),
            rawGrams: i.rawGrams.trim(),
            cookedGrams: i.cookedGrams.trim(),
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

  const handleSeed = async () => {
    if (!confirm('Hành động này sẽ nạp lại toàn bộ dữ liệu thực đơn mẫu chuẩn 1000Kcal và 1200Kcal. Tiếp tục?')) return;
    try {
      const res = await fetch('/api/dishes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ seed: true }),
      });
      const data = await res.json();
      if (data.success) {
        setMessage('Đã nạp thực đơn mẫu thành công!');
        loadDishes();
        setTimeout(() => setMessage(''), 2000);
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Phê duyệt hoặc khóa tài khoản thành viên
  const handleToggleApproval = async (user: AdminUserItem) => {
    try {
      const newStatus = !user.isApproved;
      const res = await fetch('/api/admin/users', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user._id, isApproved: newStatus }),
      });
      const data = await res.json();
      if (data.success) {
        setMessage(`Đã ${newStatus ? 'phê duyệt' : 'khóa'} tài khoản ${user.fullName}!`);
        loadAdminUsers();
        setTimeout(() => setMessage(''), 2500);
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Cấp quyền chế độ ăn mặc định cho thành viên
  const handleChangeDietPreference = async (userId: string, dietPref: string) => {
    try {
      const res = await fetch('/api/admin/users', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, dietPreference: dietPref }),
      });
      const data = await res.json();
      if (data.success) {
        setMessage('Đã cập nhật chế độ dinh dưỡng thành viên!');
        loadAdminUsers();
        setTimeout(() => setMessage(''), 2500);
      }
    } catch (err) {
      console.error(err);
    }
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
          <Shield size={48} className="mx-auto text-red-400" />
          <h2 className="text-xl font-bold text-white">Yêu Cầu Quyền Quản Trị Viên</h2>
          <p className="text-sm text-slate-400">
            Bạn cần đăng nhập bằng tài khoản Quản trị viên (Admin) để truy cập trang này.
          </p>
          <div className="pt-2 flex flex-col gap-2">
            <Link href="/" className="btn-primary text-xs py-2.5 justify-center">
              Về Trang Chủ Đăng Nhập
            </Link>
            <Link href="/admin/create-admin" className="btn-ghost text-xs py-2 justify-center text-purple-300">
              Khởi Tạo Tài Khoản Admin
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const tabDishes = dishes[activeMealTab] || [];

  return (
    <div className="hero-bg min-h-screen pb-16">
      {/* Admin Navbar */}
      <header className="sticky top-0 z-40 navbar-solid px-4 py-3 border-b border-purple-500/20">
        <div className="max-w-screen-2xl mx-auto flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Link
              href="/"
              className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition-colors"
              title="Về trang chủ"
            >
              <ArrowLeft size={18} />
            </Link>
            <div className="w-9 h-9 rounded-xl flex items-center justify-center bg-gradient-to-br from-purple-500 to-indigo-600 text-white shadow-lg shadow-purple-500/20">
              <Shield size={18} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-base font-bold text-white">Bảng Quản Trị LogFood</h1>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-purple-500/20 text-purple-300 border border-purple-500/30">
                  ADMIN
                </span>
              </div>
              <p className="text-[11px] text-slate-400">Quản lý thực đơn &amp; Phê duyệt thành viên</p>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            {message && (
              <span className="text-xs text-emerald-400 flex items-center gap-1 font-medium animate-fade-in bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/20">
                <Check size={14} /> {message}
              </span>
            )}

            <Link
              href="/admin/create-admin"
              className="btn-ghost text-xs py-1.5 px-3 flex items-center gap-1.5 text-purple-300 border-purple-500/30 bg-purple-500/10 hover:bg-purple-500/20"
            >
              <UserPlus size={14} />
              <span className="hidden sm:inline">Thêm Admin</span>
            </Link>

            {/* Admin User Menu */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setShowAdminMenu(!showAdminMenu)}
                className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-purple-500/10 border border-purple-500/30 hover:border-purple-400 transition-all text-xs text-white"
              >
                <div className="w-5 h-5 rounded-lg bg-purple-500/30 text-purple-200 flex items-center justify-center text-[10px] font-bold">
                  A
                </div>
                <span className="font-semibold hidden sm:inline">{currentUser.fullName}</span>
                <ChevronDown size={14} className="text-slate-400" />
              </button>

              {showAdminMenu && (
                <div className="absolute right-0 mt-2 w-56 rounded-2xl dropdown-solid p-2 z-50 animate-fade-in border-purple-500/30">
                  <div className="px-3 py-2 border-b border-white/10 mb-1">
                    <div className="text-xs font-bold text-white truncate">{currentUser.fullName}</div>
                    <div className="text-[11px] text-slate-400 truncate">{currentUser.email}</div>
                  </div>
                  <button
                    onClick={() => { setShowAdminMenu(false); setShowProfileModal(true); }}
                    className="w-full flex items-center gap-2 px-3 py-2 text-xs rounded-xl text-slate-300 hover:text-white hover:bg-white/10 transition-all"
                  >
                    <UserIcon size={14} />
                    <span>Hồ sơ Quản trị viên</span>
                  </button>
                  <button
                    onClick={() => { setShowAdminMenu(false); setShowChangePasswordModal(true); }}
                    className="w-full flex items-center gap-2 px-3 py-2 text-xs rounded-xl text-slate-300 hover:text-white hover:bg-white/10 transition-all"
                  >
                    <KeyRound size={14} />
                    <span>Đổi mật khẩu</span>
                  </button>
                  <button
                    onClick={() => { setShowAdminMenu(false); handleLogout(); }}
                    className="w-full flex items-center gap-2 px-3 py-2 text-xs rounded-xl text-red-400 hover:bg-red-500/10 transition-all mt-1 border-t border-white/5"
                  >
                    <LogOut size={14} />
                    <span>Đăng xuất</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-screen-2xl mx-auto p-4 space-y-6">
        {/* Navigation Tabs */}
        <div className="flex items-center gap-2 border-b border-white/10 pb-4">
          <button
            onClick={() => setAdminTab('dishes')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
              adminTab === 'dishes'
                ? 'bg-purple-500 text-white shadow-lg shadow-purple-500/25'
                : 'text-slate-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <UtensilsCrossed size={16} />
            <span>Quản Lý Món Ăn</span>
          </button>
          <button
            onClick={() => setAdminTab('users')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
              adminTab === 'users'
                ? 'bg-purple-500 text-white shadow-lg shadow-purple-500/25'
                : 'text-slate-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <Users size={16} />
            <span>Quản Lý &amp; Duyệt Thành Viên</span>
            <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-white/20 text-white font-mono">
              {usersList.length}
            </span>
          </button>
        </div>

        {adminTab === 'dishes' ? (
          /* Tab 1: Dishes CRUD */
          <div className="space-y-4 animate-fade-in">
            {/* Top Toolbar */}
            <div className="glass-card p-4 flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-400 font-medium">Chế độ:</span>
                <div className="flex rounded-xl p-1 gap-1 bg-white/5">
                  {['1000kcal', '1200kcal'].map((d) => (
                    <button
                      key={d}
                      onClick={() => setDietTypeFilter(d)}
                      className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                        dietTypeFilter === d
                          ? 'bg-purple-500 text-white shadow'
                          : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      {d === '1200kcal' ? '1200 kcal (300 - 420 - 120 - 360)' : '1000 kcal'}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={handleSeed}
                  className="btn-ghost text-xs py-2 px-3 text-amber-300 border-amber-500/30 bg-amber-500/10 hover:bg-amber-500/20"
                >
                  Nạp lại thực đơn mẫu
                </button>
                <button
                  onClick={() => {
                    resetForm();
                    setFormData((f) => ({ ...f, dietType: dietTypeFilter, meal: activeMealTab }));
                    setShowForm(!showForm);
                  }}
                  className="btn-primary text-xs py-2 px-3 flex items-center gap-1.5 bg-gradient-to-r from-purple-500 to-indigo-600 shadow-purple-500/20"
                >
                  <Plus size={14} />
                  <span>{showForm ? 'Đóng form' : 'Thêm món ăn mới'}</span>
                </button>
              </div>
            </div>

            {/* Create / Edit Form */}
            {showForm && (
              <div className="glass-card p-5 animate-fade-in border-purple-500/30">
                <div className="flex items-center justify-between pb-3 border-b border-white/10 mb-4">
                  <h3 className="text-sm font-bold text-white flex items-center gap-2">
                    <Edit2 size={16} className="text-purple-400" />
                    <span>{editingDish ? 'Chỉnh sửa món ăn' : 'Thêm món ăn mới vào hệ thống'}</span>
                  </h3>
                  <button onClick={() => setShowForm(false)} className="text-slate-400 hover:text-white">
                    <X size={18} />
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
                  <div>
                    <label className="block text-slate-400 font-medium mb-1">Tên món ăn *</label>
                    <input
                      required
                      className="input-dark text-xs"
                      placeholder="Ví dụ: Cơm gạo lứt thịt bò xào"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="block text-slate-400 font-medium mb-1">Calories (kcal) *</label>
                    <input
                      required
                      type="number"
                      className="input-dark text-xs"
                      placeholder="Ví dụ: 350"
                      value={formData.calories}
                      onChange={(e) => setFormData({ ...formData, calories: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="block text-slate-400 font-medium mb-1">Bữa ăn</label>
                    <select
                      className="input-dark text-xs"
                      value={formData.meal}
                      onChange={(e) => setFormData({ ...formData, meal: e.target.value })}
                    >
                      {MEAL_ORDER.map((m) => (
                        <option key={m} value={m} style={{ background: '#1e293b' }}>
                          {MEAL_LABELS[m]}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-slate-400 font-medium mb-1">Chế độ dinh dưỡng</label>
                    <select
                      className="input-dark text-xs"
                      value={formData.dietType}
                      onChange={(e) => setFormData({ ...formData, dietType: e.target.value })}
                    >
                      <option value="1000kcal" style={{ background: '#1e293b' }}>1000 kcal</option>
                      <option value="1200kcal" style={{ background: '#1e293b' }}>1200 kcal</option>
                    </select>
                  </div>
                </div>

                <div className="mt-3">
                  <label className="block text-slate-400 font-medium mb-1 text-xs">Hướng dẫn nấu / chế biến</label>
                  <textarea
                    rows={2}
                    className="input-dark text-xs"
                    placeholder="Mô tả các bước sơ chế và nấu món..."
                    value={formData.cookingInstructions}
                    onChange={(e) => setFormData({ ...formData, cookingInstructions: e.target.value })}
                  />
                </div>

                {/* Ingredients list */}
                <div className="mt-5 pt-4 border-t border-white/10">
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <label className="text-xs font-bold text-cyan-400 uppercase tracking-wider block">
                        Thành phần định lượng
                      </label>
                      <span className="text-[11px] text-slate-400">
                        Số g chín / Đơn vị thường dùng cho phép viết text (VD: 1 quả, 1 bát, 150g). Không điền sẽ không hiển thị 0g.
                      </span>
                    </div>
                    <button type="button" onClick={addIngredient} className="btn-ghost text-xs flex items-center gap-1.5 py-1 px-3">
                      <Plus size={12} /> Thêm nguyên liệu
                    </button>
                  </div>
                  <div className="space-y-2">
                    {formData.ingredients.map((ing, idx) => (
                      <div key={idx} className="grid grid-cols-[1fr,140px,180px,36px] gap-2 items-center">
                        <input
                          className="input-dark text-xs"
                          placeholder="Tên nguyên liệu (VD: Dưa chuột)"
                          value={ing.name}
                          onChange={(e) => updateIngredient(idx, 'name', e.target.value)}
                        />
                        <input
                          className="input-dark text-xs text-center"
                          type="text"
                          placeholder="Số g sống (VD: 150g)"
                          value={ing.rawGrams}
                          onChange={(e) => updateIngredient(idx, 'rawGrams', e.target.value)}
                        />
                        <input
                          className="input-dark text-xs text-center"
                          type="text"
                          placeholder="Số g chín / Đơn vị (VD: 1 quả)"
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
                        <th className="px-5 py-3 text-left font-semibold text-slate-400 uppercase">Định lượng thành phần</th>
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
                              {dish.ingredients.map((ing, i) => {
                                const weightText = formatIngredientWeight(ing.rawGrams, ing.cookedGrams);
                                return (
                                  <span key={i} className="px-2 py-0.5 rounded bg-white/5 text-slate-300 text-[11px] border border-white/5">
                                    {ing.name}{weightText ? ` (${weightText})` : ''}
                                  </span>
                                );
                              })}
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
          /* Tab 2: Users & Member Approvals & Meal Inspection */
          <div className="glass-card overflow-hidden animate-fade-in">
            <div className="p-5 border-b border-white/10 flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <Users size={18} className="text-purple-400" />
                  Danh Sách Thành Viên &amp; Phê Duyệt Tài Khoản
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Quản trị viên phê duyệt thành viên mới để được đăng nhập, và cấp quyền chế độ ăn (1000Kcal / 1200Kcal) theo tuần
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
                      <th className="px-5 py-3 text-center font-semibold text-slate-400 uppercase">Trạng thái duyệt</th>
                      <th className="px-5 py-3 text-center font-semibold text-slate-400 uppercase">Chế độ mặc định</th>
                      <th className="px-5 py-3 text-center font-semibold text-slate-400 uppercase">Chiều cao / Cân nặng</th>
                      <th className="px-5 py-3 text-center font-semibold text-slate-400 uppercase">Chỉ số BMI</th>
                      <th className="px-5 py-3 text-center font-semibold text-slate-400 uppercase">Số ngày đã chọn</th>
                      <th className="px-5 py-3 text-center font-semibold text-slate-400 uppercase">Cấp tuần &amp; Thực đơn</th>
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
                          {u.isApproved ? (
                            <div className="inline-flex flex-col items-center gap-1">
                              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 inline-flex items-center gap-1">
                                <CheckCircle size={11} /> Đã duyệt
                              </span>
                              <button
                                onClick={() => handleToggleApproval(u)}
                                className="text-[10px] text-slate-400 hover:text-red-400 underline transition-colors"
                              >
                                Khóa lại
                              </button>
                            </div>
                          ) : (
                            <div className="inline-flex flex-col items-center gap-1">
                              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30 inline-flex items-center gap-1">
                                <AlertTriangle size={11} /> Chờ duyệt
                              </span>
                              <button
                                onClick={() => handleToggleApproval(u)}
                                className="px-2.5 py-1 rounded bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/40 text-[11px] font-bold transition-all shadow"
                              >
                                Duyệt ngay
                              </button>
                            </div>
                          )}
                        </td>
                        <td className="px-5 py-3.5 text-center">
                          <select
                            value={u.dietPreference || '1000kcal'}
                            onChange={(e) => handleChangeDietPreference(u._id, e.target.value)}
                            className="input-dark py-1 px-2 text-xs font-bold text-cyan-300 cursor-pointer"
                            title="Chọn chế độ dinh dưỡng mặc định cho thành viên"
                          >
                            <option value="1000kcal" style={{ background: '#1e293b' }}>1000 kcal</option>
                            <option value="1200kcal" style={{ background: '#1e293b' }}>1200 kcal</option>
                          </select>
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
                            <Eye size={14} /> Xem &amp; Cấp tuần
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

      {/* Modal inspection of member's selected meals & weekly diet assignment */}
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
