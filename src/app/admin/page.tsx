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
  Layers,
  Trash2,
  Activity,
} from 'lucide-react';
import { Dish, AdminUserItem, UserProfile, DishComponent } from '@/types';
import {
  MEAL_LABELS,
  MEAL_ORDER,
  DISH_CATEGORIES,
  getDishComponents,
  formatIngredientWeight,
} from '@/lib/constants';
import AdminMemberPlansModal from '@/components/AdminMemberPlansModal';
import ProfileModal from '@/components/ProfileModal';
import ChangePasswordModal from '@/components/ChangePasswordModal';

interface DishComponentForm {
  dishName: string;
  ingredients: Array<{
    name: string;
    rawGrams: string;
    cookedGrams: string;
  }>;
}

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
  const [categoryFilter, setCategoryFilter] = useState<'all' | 'family' | 'eatclean'>('family');

  const [dishes, setDishes] = useState<Record<string, Dish[]>>({});
  const [usersList, setUsersList] = useState<AdminUserItem[]>([]);
  const [loadingDishes, setLoadingDishes] = useState(false);
  const [loadingUsers, setLoadingUsers] = useState(false);

  const [showForm, setShowForm] = useState(false);
  const [editingDish, setEditingDish] = useState<Dish | null>(null);
  const [formData, setFormData] = useState<{
    name: string;
    calories: string;
    meal: string;
    dietType: string;
    category: 'family' | 'eatclean';
    cookingInstructions: string;
    dishComponents: DishComponentForm[];
  }>({
    name: '',
    calories: '',
    meal: 'breakfast',
    dietType: '1000kcal',
    category: 'family',
    cookingInstructions: '',
    dishComponents: [
      {
        dishName: '',
        ingredients: [{ name: '', rawGrams: '', cookedGrams: '' }],
      },
    ],
  });
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState('');

  // Selected user to view their meals & assign
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
      meal: activeMealTab,
      dietType: dietTypeFilter,
      category: categoryFilter === 'all' ? 'family' : categoryFilter,
      cookingInstructions: '',
      dishComponents: [
        {
          dishName: '',
          ingredients: [{ name: '', rawGrams: '', cookedGrams: '' }],
        },
      ],
    });
    setEditingDish(null);
  };

  const handleEdit = (dish: Dish) => {
    setEditingDish(dish);
    const comps = getDishComponents(dish);

    setFormData({
      name: dish.name,
      calories: String(dish.calories),
      meal: dish.meal,
      dietType: dish.dietType,
      category: dish.category || 'family',
      cookingInstructions: dish.cookingInstructions || '',
      dishComponents:
        comps.length > 0
          ? comps.map((c) => ({
            dishName: c.dishName === dish.name && comps.length === 1 ? '' : c.dishName,
            ingredients: (c.ingredients || []).map((ing) => ({
              name: ing.name || '',
              rawGrams: ing.rawGrams !== undefined && ing.rawGrams !== null ? String(ing.rawGrams) : '',
              cookedGrams: ing.cookedGrams !== undefined && ing.cookedGrams !== null ? String(ing.cookedGrams) : '',
            })),
          }))
          : [
            {
              dishName: '',
              ingredients: dish.ingredients?.map((i) => ({
                name: i.name,
                rawGrams: i.rawGrams !== undefined && i.rawGrams !== null ? String(i.rawGrams) : '',
                cookedGrams: i.cookedGrams !== undefined && i.cookedGrams !== null ? String(i.cookedGrams) : '',
              })) || [{ name: '', rawGrams: '', cookedGrams: '' }],
            },
          ],
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

  // Form Sub-dish component actions
  const addComponentBlock = () => {
    setFormData((prev) => ({
      ...prev,
      dishComponents: [
        ...prev.dishComponents,
        {
          dishName: '',
          ingredients: [{ name: '', rawGrams: '', cookedGrams: '' }],
        },
      ],
    }));
  };

  const removeComponentBlock = (compIndex: number) => {
    if (formData.dishComponents.length <= 1) return;
    setFormData((prev) => ({
      ...prev,
      dishComponents: prev.dishComponents.filter((_, idx) => idx !== compIndex),
    }));
  };

  const updateComponentName = (compIndex: number, name: string) => {
    setFormData((prev) => ({
      ...prev,
      dishComponents: prev.dishComponents.map((c, idx) =>
        idx === compIndex ? { ...c, dishName: name } : c
      ),
    }));
  };

  const addIngredientToComponent = (compIndex: number) => {
    setFormData((prev) => ({
      ...prev,
      dishComponents: prev.dishComponents.map((c, idx) =>
        idx === compIndex
          ? {
            ...c,
            ingredients: [...c.ingredients, { name: '', rawGrams: '', cookedGrams: '' }],
          }
          : c
      ),
    }));
  };

  const updateIngredientInComponent = (
    compIndex: number,
    ingIndex: number,
    field: 'name' | 'rawGrams' | 'cookedGrams',
    value: string
  ) => {
    setFormData((prev) => ({
      ...prev,
      dishComponents: prev.dishComponents.map((c, cIdx) =>
        cIdx === compIndex
          ? {
            ...c,
            ingredients: c.ingredients.map((ing, iIdx) =>
              iIdx === ingIndex ? { ...ing, [field]: value } : ing
            ),
          }
          : c
      ),
    }));
  };

  const removeIngredientFromComponent = (compIndex: number, ingIndex: number) => {
    setFormData((prev) => ({
      ...prev,
      dishComponents: prev.dishComponents.map((c, cIdx) => {
        if (cIdx !== compIndex) return c;
        const filtered = c.ingredients.filter((_, iIdx) => iIdx !== ingIndex);
        return {
          ...c,
          ingredients: filtered.length > 0 ? filtered : [{ name: '', rawGrams: '', cookedGrams: '' }],
        };
      }),
    }));
  };

  const handleSubmit = async () => {
    setIsSaving(true);
    try {
      // Chuẩn hóa dishComponents & ingredients
      const sanitizedComponents: DishComponent[] = [];
      const flatIngredients: Array<{
        name: string;
        rawGrams?: string | number;
        cookedGrams?: string | number;
        dishComponent?: string;
      }> = [];

      formData.dishComponents.forEach((comp, idx) => {
        const compTitle = comp.dishName.trim() || (formData.dishComponents.length > 1 ? `Món ${idx + 1}` : formData.name.trim());
        const validIngredients = comp.ingredients
          .filter((ing) => ing.name.trim())
          .map((ing) => ({
            name: ing.name.trim(),
            rawGrams: ing.rawGrams.trim() || undefined,
            cookedGrams: ing.cookedGrams.trim() || undefined,
            dishComponent: compTitle,
          }));

        if (validIngredients.length > 0) {
          sanitizedComponents.push({
            dishName: compTitle,
            ingredients: validIngredients,
          });
          flatIngredients.push(...validIngredients);
        }
      });

      const payload = {
        name: formData.name.trim(),
        calories: Number(formData.calories),
        meal: formData.meal,
        dietType: formData.dietType,
        category: formData.category,
        cookingInstructions: formData.cookingInstructions.trim(),
        dishComponents: sanitizedComponents,
        ingredients: flatIngredients,
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
        setTimeout(() => setMessage(''), 2500);
      } else {
        alert(data.error || 'Không thể lưu món ăn');
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsSaving(false);
    }
  };

  const handleSeed = async () => {
    if (!confirm('Hành động này sẽ nạp lại toàn bộ dữ liệu thực đơn mẫu chuẩn 1000Kcal và 1200Kcal (gồm Món cơm gia đình và Món eatclean). Tiếp tục?')) return;
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
        setTimeout(() => setMessage(''), 2500);
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

  // Filter dishes by active meal and category
  const rawTabDishes = dishes[activeMealTab] || [];
  const tabDishes = categoryFilter === 'all'
    ? rawTabDishes
    : rawTabDishes.filter((d) => (d.category || 'family') === categoryFilter);

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
                <h1 className="text-base font-bold text-white">Quản Trị</h1>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-purple-500/20 text-purple-300 border border-purple-500/30">
                  ADMIN
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            {message && (
              <span className="text-xs text-emerald-400 flex items-center gap-1 font-medium animate-fade-in bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/20">
                <Check size={14} /> {message}
              </span>
            )}

            <Link
              href="/body-metrics"
              className="btn-ghost text-xs py-1.5 px-3 flex items-center gap-1.5 text-cyan-300 border-cyan-500/30 bg-cyan-500/10 hover:bg-cyan-500/20"
            >
              <Activity size={14} />
              <span className="hidden sm:inline">Chỉ số cơ thể</span>
            </Link>

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
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${adminTab === 'dishes'
              ? 'bg-purple-500 text-white shadow-lg shadow-purple-500/25'
              : 'text-slate-400 hover:text-white hover:bg-white/5'
              }`}
          >
            <UtensilsCrossed size={16} />
            <span>Quản Lý Món Ăn</span>
          </button>
          <button
            onClick={() => setAdminTab('users')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${adminTab === 'users'
              ? 'bg-purple-500 text-white shadow-lg shadow-purple-500/25'
              : 'text-slate-400 hover:text-white hover:bg-white/5'
              }`}
          >
            <Users size={16} />
            <span>Quản Lý Thành Viên &amp; Lên Thực Đơn</span>
            <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-white/20 text-white font-mono">
              {usersList.length}
            </span>
          </button>
        </div>

        {adminTab === 'dishes' ? (
          /* Tab 1: Dishes CRUD */
          <div className="space-y-4 animate-fade-in">
            {/* Top Toolbar */}
            <div className="glass-card p-3 sm:p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex flex-col sm:flex-row sm:items-center gap-2 w-full sm:w-auto">
                <span className="text-xs text-slate-400 font-semibold shrink-0">Chế độ:</span>
                <div className="grid grid-cols-2 sm:flex rounded-xl p-1 gap-1 bg-white/5 border border-white/10 w-full sm:w-auto">
                  {['1000kcal', '1200kcal'].map((d) => (
                    <button
                      key={d}
                      onClick={() => setDietTypeFilter(d)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all text-center ${dietTypeFilter === d
                        ? 'bg-purple-500 text-white shadow'
                        : 'text-slate-400 hover:text-white'
                        }`}
                    >
                      {d === '1200kcal' ? '1200 kcal' : '1000 kcal'}
                      <span className="hidden sm:inline text-[10px] opacity-80 font-normal ml-1">
                        {d === '1200kcal' ? '(300-420-120-360)' : '(250-350-100-300)'}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 sm:flex items-center gap-2 w-full sm:w-auto">
                <button
                  onClick={handleSeed}
                  className="btn-ghost text-xs py-2 px-3 text-amber-300 border-amber-500/30 bg-amber-500/10 hover:bg-amber-500/20 text-center justify-center whitespace-nowrap"
                >
                  Nạp thực đơn mẫu
                </button>
                <button
                  onClick={() => {
                    resetForm();
                    setShowForm(!showForm);
                  }}
                  className="btn-primary text-xs py-2 px-3 flex items-center justify-center gap-1.5 bg-gradient-to-r from-purple-500 to-indigo-600 shadow-purple-500/20 whitespace-nowrap"
                >
                  <Plus size={14} />
                  <span>{showForm ? 'Đóng form' : 'Thêm món ăn mới'}</span>
                </button>
              </div>
            </div>

            {/* Create / Edit Form */}
            {showForm && (
              <div className="glass-card p-5 sm:p-6 animate-fade-in border-purple-500/40 shadow-2xl">
                <div className="flex items-center justify-between pb-3 border-b border-white/10 mb-5">
                  <h3 className="text-sm font-bold text-white flex items-center gap-2">
                    <Edit2 size={16} className="text-purple-400" />
                    <span>{editingDish ? 'Chỉnh sửa món ăn' : 'Thêm món ăn mới vào hệ thống'}</span>
                  </h3>
                  <button onClick={() => setShowForm(false)} className="text-slate-400 hover:text-white">
                    <X size={18} />
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 text-xs mb-4">
                  {/* Tên món ăn (1 dòng) */}
                  <div className="lg:col-span-2">
                    <label className="block text-slate-300 font-semibold mb-1">
                      Tên món ăn (1 dòng điền tất cả các món) *
                    </label>
                    <input
                      required
                      className="input-dark text-xs"
                      placeholder="VD: Cơm trắng, bầu nhồi tôm thịt hấp, bưởi"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    />
                    <span className="text-[10px] text-slate-400 mt-1 block">
                      Ghi gộp tên các món trong bữa (cơm, mặn, rau, tráng miệng...)
                    </span>
                  </div>

                  {/* Phân loại món: Cơm gia đình vs Eatclean */}
                  <div>
                    <label className="block text-slate-300 font-semibold mb-1">Nhóm món ăn *</label>
                    <select
                      className="input-dark text-xs font-semibold text-cyan-300"
                      value={formData.category}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          category: e.target.value as 'family' | 'eatclean',
                        })
                      }
                    >
                      <option value="family" style={{ background: '#1e293b' }}>
                        🍚 {DISH_CATEGORIES.family}
                      </option>
                      <option value="eatclean" style={{ background: '#1e293b' }}>
                        🥗 {DISH_CATEGORIES.eatclean}
                      </option>
                    </select>
                  </div>

                  {/* Calories */}
                  <div>
                    <label className="block text-slate-300 font-semibold mb-1">Calories (kcal) *</label>
                    <input
                      required
                      type="number"
                      className="input-dark text-xs"
                      placeholder="Ví dụ: 420"
                      value={formData.calories}
                      onChange={(e) => setFormData({ ...formData, calories: e.target.value })}
                    />
                  </div>

                  {/* Bữa ăn & Chế độ */}
                  <div>
                    <label className="block text-slate-300 font-semibold mb-1">Bữa ăn</label>
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
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs mb-4">
                  <div>
                    <label className="block text-slate-300 font-semibold mb-1">Chế độ dinh dưỡng</label>
                    <select
                      className="input-dark text-xs"
                      value={formData.dietType}
                      onChange={(e) => setFormData({ ...formData, dietType: e.target.value })}
                    >
                      <option value="1000kcal" style={{ background: '#1e293b' }}>1000 kcal</option>
                      <option value="1200kcal" style={{ background: '#1e293b' }}>1200 kcal</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-slate-300 font-semibold mb-1">Hướng dẫn nấu / chế biến</label>
                    <input
                      className="input-dark text-xs"
                      placeholder="Mô tả cách sơ chế, luộc, xào, hấp..."
                      value={formData.cookingInstructions}
                      onChange={(e) => setFormData({ ...formData, cookingInstructions: e.target.value })}
                    />
                  </div>
                </div>

                {/* Sub-dish Components & Ingredients Builder */}
                <div className="mt-5 pt-4 border-t border-white/10 space-y-4">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div>
                      <label className="text-xs font-bold text-cyan-400 uppercase tracking-wider block">
                        THÀNH PHẦN ĐỊNH LƯỢNG THEO TỪNG MÓN
                      </label>
                      <p className="text-[11px] text-slate-400">
                        Chia định lượng theo từng món con (Ví dụ: Món Cơm trắng, Bầu nhồi tôm thịt hấp, Bưởi) để rõ nguyên liệu thuộc món nào
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={addComponentBlock}
                      className="btn-ghost text-xs flex items-center gap-1.5 py-1 px-3 border-purple-500/30 text-purple-300 bg-purple-500/10 hover:bg-purple-500/20"
                    >
                      <Plus size={13} /> Thêm nhóm món con
                    </button>
                  </div>

                  {formData.dishComponents.map((comp, compIdx) => (
                    <div
                      key={compIdx}
                      className="p-3.5 rounded-xl border border-white/10 bg-black/25 space-y-3"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2 flex-1 max-w-md">
                          <span className="text-[11px] font-bold text-purple-300 uppercase shrink-0">
                            Món #{compIdx + 1}:
                          </span>
                          <input
                            className="input-dark text-xs py-1 px-2.5 font-semibold text-cyan-300"
                            placeholder="Tên món thành phần (VD: Cơm trắng / Bầu nhồi tôm thịt hấp / Bưởi)"
                            value={comp.dishName}
                            onChange={(e) => updateComponentName(compIdx, e.target.value)}
                          />
                        </div>
                        {formData.dishComponents.length > 1 && (
                          <button
                            type="button"
                            onClick={() => removeComponentBlock(compIdx)}
                            className="text-red-400 hover:text-red-300 text-xs flex items-center gap-1 px-2 py-1 rounded hover:bg-red-500/10 transition-colors"
                            title="Xóa nhóm món này"
                          >
                            <Trash2 size={13} />
                            <span className="hidden sm:inline">Xóa món #{compIdx + 1}</span>
                          </button>
                        )}
                      </div>

                      {/* Ingredients list for this component */}
                      <div className="space-y-1.5">
                        <div className="hidden sm:grid grid-cols-[1fr,130px,180px,36px] gap-2 text-[10px] text-slate-400 font-semibold px-1">
                          <span>Tên nguyên liệu</span>
                          <span className="text-center">Số g sống</span>
                          <span className="text-center">Số g chín / ĐVT</span>
                          <span></span>
                        </div>

                        {comp.ingredients.map((ing, ingIdx) => (
                          <div
                            key={ingIdx}
                            className="grid grid-cols-1 sm:grid-cols-[1fr,130px,180px,36px] gap-2 items-center p-2 sm:p-0 rounded-lg bg-white/[0.02] sm:bg-transparent border border-white/5 sm:border-0"
                          >
                            <input
                              className="input-dark text-xs py-1.5"
                              placeholder="Tên nguyên liệu (VD: Bầu, tôm, thịt...)"
                              value={ing.name}
                              onChange={(e) =>
                                updateIngredientInComponent(compIdx, ingIdx, 'name', e.target.value)
                              }
                            />
                            <div className="grid grid-cols-[1fr,1fr,36px] sm:contents gap-2 items-center">
                              <input
                                className="input-dark text-xs text-center py-1.5 text-amber-300"
                                placeholder="g sống (VD: 150g)"
                                value={ing.rawGrams}
                                onChange={(e) =>
                                  updateIngredientInComponent(compIdx, ingIdx, 'rawGrams', e.target.value)
                                }
                              />
                              <input
                                className="input-dark text-xs text-center py-1.5 text-emerald-300"
                                placeholder="g chín / ĐVT (VD: 140g)"
                                value={ing.cookedGrams}
                                onChange={(e) =>
                                  updateIngredientInComponent(compIdx, ingIdx, 'cookedGrams', e.target.value)
                                }
                              />
                              <button
                                type="button"
                                onClick={() => removeIngredientFromComponent(compIdx, ingIdx)}
                                className="btn-danger p-1.5 flex items-center justify-center text-xs h-[34px] rounded-lg shrink-0"
                                title="Xóa nguyên liệu"
                              >
                                <X size={14} />
                              </button>
                            </div>
                          </div>
                        ))}

                        <button
                          type="button"
                          onClick={() => addIngredientToComponent(compIdx)}
                          className="text-[11px] text-cyan-400 hover:text-cyan-300 font-medium inline-flex items-center gap-1 mt-1 hover:underline px-1"
                        >
                          <Plus size={12} /> Thêm nguyên liệu cho món này
                        </button>
                      </div>
                    </div>
                  ))}
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

            {/* Dish table with Category Switcher and Meal Tabs */}
            <div className="glass-card overflow-hidden">
              {/* Category Filter Pills (Món cơm gia đình vs Món eatclean) */}
              <div className="p-3 bg-white/[0.02] border-b border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex flex-col sm:flex-row sm:items-center gap-2 w-full sm:w-auto">
                  <span className="text-xs text-slate-400 font-semibold shrink-0">Phân loại món:</span>
                  <div className="grid grid-cols-3 sm:flex rounded-xl p-1 gap-1 bg-white/5 border border-white/10 w-full sm:w-auto">
                    <button
                      onClick={() => setCategoryFilter('family')}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 whitespace-nowrap ${categoryFilter === 'family'
                        ? 'bg-amber-500 text-slate-900 shadow-lg shadow-amber-500/20'
                        : 'text-slate-400 hover:text-white'
                        }`}
                    >
                      <span>🍚</span>
                      <span className="hidden sm:inline">{DISH_CATEGORIES.family}</span>
                      <span className="sm:hidden">Cơm GĐ</span>
                    </button>
                    <button
                      onClick={() => setCategoryFilter('eatclean')}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 whitespace-nowrap ${categoryFilter === 'eatclean'
                        ? 'bg-emerald-500 text-slate-900 shadow-lg shadow-emerald-500/20'
                        : 'text-slate-400 hover:text-white'
                        }`}
                    >
                      <span>🥗</span>
                      <span className="hidden sm:inline">{DISH_CATEGORIES.eatclean}</span>
                      <span className="sm:hidden">Eatclean</span>
                    </button>
                    <button
                      onClick={() => setCategoryFilter('all')}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center justify-center whitespace-nowrap ${categoryFilter === 'all'
                        ? 'bg-purple-500 text-white shadow'
                        : 'text-slate-400 hover:text-white'
                        }`}
                    >
                      Tất cả
                    </button>
                  </div>
                </div>

                <div className="text-xs text-slate-400 font-medium">
                  Hiển thị <strong className="text-white">{tabDishes.length}</strong> món
                </div>
              </div>

              {/* Meal Tabs */}
              <div className="flex border-b border-white/10 overflow-x-auto">
                {MEAL_ORDER.map((meal) => {
                  const mealCount = ((dishes[meal] || []).filter((d) =>
                    categoryFilter === 'all' ? true : (d.category || 'family') === categoryFilter
                  )).length;

                  return (
                    <button
                      key={meal}
                      onClick={() => setActiveMealTab(meal)}
                      className={`px-4 sm:px-5 py-3 text-xs font-bold whitespace-nowrap transition-all border-b-2 flex items-center gap-2 ${activeMealTab === meal
                        ? 'border-cyan-400 text-cyan-400 bg-cyan-400/5'
                        : 'border-transparent text-slate-400 hover:text-white'
                        }`}
                    >
                      {MEAL_LABELS[meal]}
                      <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-white/10 text-slate-300">
                        {mealCount}
                      </span>
                    </button>
                  );
                })}
              </div>

              <div>
                {loadingDishes ? (
                  <div className="p-12 text-center text-slate-400">
                    <div className="w-8 h-8 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
                    Đang tải danh sách món ăn...
                  </div>
                ) : tabDishes.length === 0 ? (
                  <div className="p-12 text-center text-slate-400">
                    <UtensilsCrossed size={36} className="mx-auto mb-3 opacity-40 text-slate-500" />
                    <div className="text-sm">Chưa có món nào thuộc nhóm này trong bữa {MEAL_LABELS[activeMealTab]}</div>
                  </div>
                ) : (
                  <>
                    {/* MOBILE VIEW (Dạng Card cân đối, đẹp mắt, dễ đọc trên điện thoại) */}
                    <div className="md:hidden divide-y divide-white/10">
                      {tabDishes.map((dish) => {
                        const comps = getDishComponents(dish);
                        const isFamily = (dish.category || 'family') === 'family';

                        return (
                          <div key={dish._id} className="p-4 space-y-3 hover:bg-white/[0.02] transition-colors">
                            {/* Tiêu đề & Calories */}
                            <div className="flex items-start justify-between gap-3">
                              <div className="space-y-1.5 flex-1">
                                <h4 className="font-bold text-white text-sm leading-snug">{dish.name}</h4>
                                <div className="flex flex-wrap items-center gap-1.5">
                                  <span
                                    className={`px-2 py-0.5 rounded text-[10px] font-bold border whitespace-nowrap ${isFamily
                                      ? 'bg-amber-500/10 text-amber-300 border-amber-500/20'
                                      : 'bg-emerald-500/10 text-emerald-300 border-emerald-500/20'
                                      }`}
                                  >
                                    {isFamily ? '🍚 Cơm gia đình' : '🥗 Eatclean'}
                                  </span>
                                  <span className="text-[10px] text-slate-400 px-1.5 py-0.5 rounded bg-white/5 border border-white/5 whitespace-nowrap">
                                    {dish.dietType}
                                  </span>
                                </div>
                              </div>

                              <span className="inline-flex items-center justify-center px-2.5 py-1 rounded-full font-bold text-orange-400 bg-orange-400/10 border border-orange-400/20 text-xs whitespace-nowrap shrink-0">
                                {dish.calories} kcal
                              </span>
                            </div>

                            {/* Định lượng thành phần (không bao giờ bị ép thành cột dọc) */}
                            <div className="p-3 rounded-xl bg-black/25 border border-white/5 space-y-1.5">
                              <div className="text-[10px] uppercase font-bold text-cyan-400 tracking-wider">
                                Định lượng thành phần
                              </div>
                              {comps.length > 1 ? (
                                <div className="space-y-1 text-xs">
                                  {comps.map((c, cIdx) => (
                                    <div key={cIdx} className="text-[11px] leading-relaxed">
                                      <span className="text-cyan-300 font-semibold">• {c.dishName}: </span>
                                      <span className="text-slate-300">
                                        {c.ingredients?.map((ing, i) => {
                                          const weight = formatIngredientWeight(ing.rawGrams, ing.cookedGrams);
                                          return `${ing.name}${weight ? ` (${weight})` : ''}${i < (c.ingredients?.length || 0) - 1 ? ', ' : ''}`;
                                        })}
                                      </span>
                                    </div>
                                  ))}
                                </div>
                              ) : (
                                <div className="flex flex-wrap gap-1.5">
                                  {dish.ingredients?.map((ing, i) => {
                                    const weightText = formatIngredientWeight(ing.rawGrams, ing.cookedGrams);
                                    return (
                                      <span
                                        key={i}
                                        className="px-2 py-0.5 rounded bg-white/5 text-slate-300 text-[11px] border border-white/5 whitespace-nowrap"
                                      >
                                        {ing.name}{weightText ? ` (${weightText})` : ''}
                                      </span>
                                    );
                                  })}
                                </div>
                              )}
                            </div>

                            {/* Nút thao tác trên mobile */}
                            <div className="flex items-center gap-2 pt-1">
                              <button
                                onClick={() => handleEdit(dish)}
                                className="flex-1 py-1.5 px-3 rounded-lg text-xs font-semibold text-cyan-300 bg-cyan-500/10 border border-cyan-500/30 hover:bg-cyan-500/20 text-center transition-colors"
                              >
                                Sửa món
                              </button>
                              <button
                                onClick={() => handleDelete(dish._id)}
                                className="flex-1 py-1.5 px-3 rounded-lg text-xs font-semibold text-red-400 bg-red-500/10 border border-red-500/30 hover:bg-red-500/20 text-center transition-colors"
                              >
                                Xóa món
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    {/* DESKTOP VIEW (Dạng Bảng cuộn ngang mượt mà trên màn hình lớn) */}
                    <div className="hidden md:block overflow-x-auto">
                      <table className="w-full text-xs min-w-[750px]">
                        <thead>
                          <tr style={{ background: 'rgba(255,255,255,0.03)' }}>
                            <th className="px-5 py-3 text-left font-semibold text-slate-400 uppercase">Tên món &amp; Nhóm</th>
                            <th className="px-5 py-3 text-center font-semibold text-slate-400 uppercase whitespace-nowrap w-32">Calories</th>
                            <th className="px-5 py-3 text-left font-semibold text-slate-400 uppercase">Định lượng thành phần (Theo món)</th>
                            <th className="px-5 py-3 text-center font-semibold text-slate-400 uppercase whitespace-nowrap w-28">Thao tác</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                          {tabDishes.map((dish) => {
                            const comps = getDishComponents(dish);
                            const isFamily = (dish.category || 'family') === 'family';

                            return (
                              <tr key={dish._id} className="hover:bg-white/5 transition-colors">
                                <td className="px-5 py-3.5">
                                  <div className="font-bold text-white text-sm">{dish.name}</div>
                                  <div className="flex items-center gap-1.5 mt-1">
                                    <span
                                      className={`px-2 py-0.5 rounded text-[10px] font-bold border whitespace-nowrap ${isFamily
                                        ? 'bg-amber-500/10 text-amber-300 border-amber-500/20'
                                        : 'bg-emerald-500/10 text-emerald-300 border-emerald-500/20'
                                        }`}
                                    >
                                      {isFamily ? '🍚 Cơm gia đình' : '🥗 Eatclean'}
                                    </span>
                                    <span className="text-[10px] text-slate-400 whitespace-nowrap">{dish.dietType}</span>
                                  </div>
                                </td>
                                <td className="px-5 py-3.5 text-center whitespace-nowrap">
                                  <span className="inline-flex items-center justify-center px-3 py-1 rounded-full font-bold text-orange-400 bg-orange-400/10 border border-orange-400/20 whitespace-nowrap">
                                    {dish.calories} kcal
                                  </span>
                                </td>
                                <td className="px-5 py-3.5">
                                  {comps.length > 1 ? (
                                    <div className="space-y-1.5">
                                      {comps.map((c, cIdx) => (
                                        <div key={cIdx} className="text-[11px]">
                                          <span className="text-cyan-300 font-semibold">• {c.dishName}: </span>
                                          <span className="text-slate-300">
                                            {c.ingredients?.map((ing, i) => {
                                              const weight = formatIngredientWeight(ing.rawGrams, ing.cookedGrams);
                                              return `${ing.name}${weight ? ` (${weight})` : ''}${i < (c.ingredients?.length || 0) - 1 ? ', ' : ''}`;
                                            })}
                                          </span>
                                        </div>
                                      ))}
                                    </div>
                                  ) : (
                                    <div className="flex flex-wrap gap-1.5">
                                      {dish.ingredients?.map((ing, i) => {
                                        const weightText = formatIngredientWeight(ing.rawGrams, ing.cookedGrams);
                                        return (
                                          <span
                                            key={i}
                                            className="px-2 py-0.5 rounded bg-white/5 text-slate-300 text-[11px] border border-white/5 whitespace-nowrap"
                                          >
                                            {ing.name}{weightText ? ` (${weightText})` : ''}
                                          </span>
                                        );
                                      })}
                                    </div>
                                  )}
                                </td>
                                <td className="px-5 py-3.5 text-center whitespace-nowrap">
                                  <div className="flex items-center justify-center gap-1.5">
                                    <button
                                      onClick={() => handleEdit(dish)}
                                      className="px-2.5 py-1 rounded text-cyan-400 hover:bg-cyan-400/10 border border-cyan-400/30 transition-all font-semibold"
                                    >
                                      Sửa
                                    </button>
                                    <button
                                      onClick={() => handleDelete(dish._id)}
                                      className="px-2.5 py-1 rounded text-red-400 hover:bg-red-400/10 border border-red-400/30 transition-all font-semibold"
                                    >
                                      Xóa
                                    </button>
                                  </div>
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        ) : (
          /* Tab 2: Users & Member Approvals & Meal Inspection / Assignment */
          <div className="glass-card overflow-hidden animate-fade-in">
            <div className="p-5 border-b border-white/10 flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <Users size={18} className="text-purple-400" />
                  Danh Sách Thành Viên &amp; Lên Thực Đơn
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Phê duyệt tài khoản và click <strong>&quot;Lên thực đơn cho User&quot;</strong> để chọn món hàng ngày cho thành viên
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
                <table className="w-full text-xs min-w-[750px]">
                  <thead>
                    <tr style={{ background: 'rgba(255,255,255,0.03)' }}>
                      <th className="px-5 py-3 text-left font-semibold text-slate-400 uppercase">Thành viên</th>
                      <th className="px-5 py-3 text-center font-semibold text-slate-400 uppercase">Trạng thái duyệt</th>
                      <th className="px-5 py-3 text-center font-semibold text-slate-400 uppercase">Chế độ mặc định</th>
                      <th className="px-5 py-3 text-center font-semibold text-slate-400 uppercase">Chiều cao / Cân nặng</th>
                      <th className="px-5 py-3 text-center font-semibold text-slate-400 uppercase">Chỉ số BMI</th>
                      <th className="px-5 py-3 text-center font-semibold text-slate-400 uppercase">Số ngày đã có món</th>
                      <th className="px-5 py-3 text-center font-semibold text-slate-400 uppercase">Lên thực đơn</th>
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
                            {u.planCount} ngày
                          </span>
                        </td>
                        <td className="px-5 py-3.5 text-center">
                          <div className="flex items-center justify-center gap-1.5">
                            <button
                              onClick={() => setInspectUserId(u._id)}
                              className="px-2.5 py-1.5 rounded-lg text-xs font-bold bg-purple-500 hover:bg-purple-600 text-white shadow-lg shadow-purple-500/25 transition-all inline-flex items-center gap-1.5 whitespace-nowrap"
                            >
                              <UtensilsCrossed size={13} /> Lên thực đơn
                            </button>
                            <Link
                              href={`/body-metrics?userId=${u._id}`}
                              className="px-2.5 py-1.5 rounded-lg text-xs font-bold bg-cyan-500/15 hover:bg-cyan-500/25 text-cyan-300 border border-cyan-500/30 transition-all inline-flex items-center gap-1.5 whitespace-nowrap"
                              title="Xem & nhập chỉ số cơ thể cho thành viên này"
                            >
                              <Activity size={13} /> Chỉ số
                            </Link>
                          </div>
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

      {/* Modal inspection & Assignment of member's meals */}
      <AdminMemberPlansModal
        userId={inspectUserId}
        onClose={() => {
          setInspectUserId(null);
          loadAdminUsers();
        }}
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
