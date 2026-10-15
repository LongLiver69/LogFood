# TÀI LIỆU ĐẶC TẢ YÊU CẦU HỆ THỐNG
# LOGFOOD – HỆ THỐNG QUẢN LÝ CHẾ ĐỘ DINH DƯỠNG

---

## 1. TỔNG QUAN HỆ THỐNG

**LogFood** là hệ thống web application hỗ trợ cá nhân hóa và quản lý chế độ dinh dưỡng hàng ngày, hàng tuần. Hệ thống cho phép người dùng tự lựa chọn món ăn theo từng bữa với định lượng chuẩn xác (gam sống và gam chín), xem hướng dẫn chế biến, nhập thông tin thể trạng (chiều cao, cân nặng) để tự động tính toán chỉ số BMI và nhận khuyến nghị chế độ dinh dưỡng phù hợp.

Hệ thống phân cấp quyền chặt chẽ giữa **Quản trị viên (Admin)** và **Người dùng thông thường (User)**, đảm bảo tính bảo mật và trải nghiệm thuận tiện nhất cho khách hàng.

> **Đặc biệt về tính bảo mật thực đơn:** Khi khách truy cập chưa đăng nhập, hệ thống chỉ hiển thị trang giới thiệu tính năng tổng quan (Landing Page) và **tuyệt đối không hiển thị thực đơn, danh sách món ăn hay kế hoạch tuần**.

---

## 2. CÔNG NGHỆ SỬ DỤNG

| Hạng mục | Công nghệ | Chi tiết |
| :--- | :--- | :--- |
| **Frontend Framework** | **Next.js 16 (App Router)** | React 19, Server & Client Components, TypeScript |
| **Styling & UI** | **Tailwind CSS v4** | Dark Mode, Glassmorphism, Responsive Mobile-First |
| **Database** | **MongoDB Atlas** | Mongoose ODM, Schema validation & indexing |
| **Xác thực & Bảo mật** | **JWT & Bcrypt.js** | HTTP-only Cookies, mật khẩu băm Salt rounds 10 |
| **Xử lý ngày tháng** | **date-fns** | Chuẩn hóa múi giờ Việt Nam, điều hướng tuần |
| **Icons & Visuals** | **Lucide React** | Bộ icon hiện đại, tối ưu hiệu năng render |
| **Deployment** | **Vercel** | Tự động hóa CI/CD, tích hợp biến môi trường |

---

## 3. PHÂN HỆ VÀ PHÂN QUYỀN (ROLE-BASED ACCESS CONTROL)

Hệ thống thiết lập 2 nhóm quyền tài khoản rõ ràng:

| Quyền hạn / Tính năng | Người dùng bình thường (`user`) | Quản trị viên (`admin`) |
| :--- | :---: | :---: |
| Đăng ký tài khoản thông thường | ✅ (Mặc định `user`) | ❌ (Không được đăng ký ở form chung) |
| Khởi tạo tài khoản Quản trị viên (`/admin/create-admin`) | ❌ | ✅ (Yêu cầu mã bảo mật Secret Key) |
| Đăng nhập, Đăng xuất | ✅ | ✅ |
| Đổi mật khẩu tài khoản | ✅ | ✅ |
| Nhập/cập nhật Chiều cao, Cân nặng, Cân nặng mục tiêu | ✅ (Chỉ bản thân) | ✅ (Chỉ bản thân) |
| Xem bảng tính chỉ số BMI và nhận khuyến nghị chế độ | ✅ | ✅ |
| Xem danh sách món ăn, định lượng, cách nấu | ✅ (Khi đã đăng nhập) | ✅ |
| Chọn món ăn từng bữa theo tuần cho bản thân | ✅ | ✅ |
| Khóa không cho sửa thực đơn ngày đã qua | ✅ (Bắt buộc) | ✅ (Bắt buộc) |
| Thêm món ăn mới vào hệ thống | ❌ | ✅ |
| Chỉnh sửa / Xóa món ăn trong hệ thống | ❌ | ✅ |
| Nạp dữ liệu thực đơn mẫu (Seed Data) | ❌ | ✅ |
| Xem danh sách toàn bộ thành viên & chỉ số thể trạng | ❌ | ✅ |
| **Xem danh sách món ăn đã chọn của các thành viên** | ❌ | ✅ |

---

## 4. CHI TIẾT CÁC TÍNH NĂNG HỆ THỐNG

### 4.1. Quản lý tài khoản & Xác thực (Authentication)
- **Trang chủ khi chưa đăng nhập (Guest Landing Page)**:
  - Khi chưa đăng nhập, trang chủ chỉ hiển thị nội dung giới thiệu hệ thống, các lợi ích dinh dưỡng và nút Đăng nhập / Đăng ký.
  - **Không hiển thị bất kỳ thông tin thực đơn, danh mục món ăn hay kế hoạch tuần nào**.
- **Đăng ký tài khoản thành viên (`/api/auth/register`)**:
  - Form đăng ký công khai chỉ cho phép đăng ký tài khoản `user` (Người dùng bình thường).
  - Yêu cầu: Họ tên, Email, Mật khẩu (tối thiểu 6 ký tự), Chiều cao, Cân nặng, Cân nặng mục tiêu, Giới tính, Tuổi.
- **Trang tạo tài khoản Quản trị viên (`/admin/create-admin` & `/api/auth/create-admin`)**:
  - Quản trị viên **không được phép đăng ký qua form thông thường**.
  - Hệ thống cung cấp trang riêng biệt `/admin/create-admin`. Chỉ những ai nhập chính xác Mã bảo mật hệ thống (`ADMIN_SETUP_SECRET`) mới được phép khởi tạo hoặc nâng cấp tài khoản Quản trị viên.
- **Đăng nhập (`/api/auth/login`)**:
  - Xác thực qua Email và Mật khẩu bằng `bcryptjs`.
  - Cấp token JWT lưu trong HTTP-Only Cookie.
- **Đổi mật khẩu (`/api/auth/change-password`)**:
  - Cho phép người dùng và quản trị viên đổi mật khẩu bảo mật.
  - Yêu cầu nhập đúng mật khẩu hiện tại, mật khẩu mới (tối thiểu 6 ký tự) và xác nhận mật khẩu mới.
- **Phiên làm việc & Đăng xuất (`/api/auth/me`, `/api/auth/logout`)**:
  - Tự động duy trì trạng thái phiên làm việc khi tải lại trang.
  - Xóa Cookie phiên khi người dùng đăng xuất.

---

### 4.2. Hồ sơ thể trạng & Chỉ số BMI (Body Mass Index)
- **Cập nhật thông tin tài khoản & Thể chất cá nhân**:
  - Họ và tên, Địa chỉ Email đăng nhập (hệ thống kiểm tra tính hợp lệ và không trùng lặp với tài khoản khác).
  - Chiều cao ($cm$), Cân nặng hiện tại ($kg$), Cân nặng mục tiêu ($kg$).
  - Tuổi và Giới tính.
  - Hỗ trợ cả Người dùng thông thường và Quản trị viên cập nhật thông tin thuận tiện.
- **Công thức tính & Thang phân loại BMI (Chuẩn Châu Á - WHO/IDI & WPRO)**:
  $$\text{BMI} = \frac{\text{Cân nặng (kg)}}{[\text{Chiều cao (m)}]^2}$$
  - **$BMI < 18.5$**: *Gầy / Thiếu cân* &rarr; Gợi ý thực đơn 1200 Kcal kết hợp bồi dưỡng.
  - **$18.5 \le BMI \le 22.9$**: *Cân đối (Chuẩn)* &rarr; Gợi ý chế độ 1200 Kcal duy trì vóc dáng.
  - **$23.0 \le BMI \le 24.9$**: *Tiền béo phì (Thừa cân)* &rarr; Gợi ý chế độ 1000 Kcal kiểm soát calo.
  - **$BMI \ge 25.0$**: *Béo phì* &rarr; Khuyến nghị chế độ 1000 Kcal điều hòa năng lượng an toàn.
- **Tính toán cân nặng lý tưởng**: Tự động tính khoảng cân nặng chuẩn của người dùng ($18.5 \times H^2 \div 22.9 \times H^2$).
- **Thanh đo BMI trực quan**: Biểu đồ thanh đo 4 dải màu sắc (Xanh dương, Xanh ngọc, Vàng hổ phách, Đỏ).

---

### 4.3. Quản lý chế độ dinh dưỡng & Lựa chọn thực đơn tuần
- **2 Chế độ dinh dưỡng mục tiêu**:
  - **Chế độ 1000 Kcal/ngày**:
    - Bữa Sáng: $250\text{ kcal}$
    - Bữa Trưa: $350\text{ kcal}$
    - Phụ Chiều: $100\text{ kcal}$
    - Bữa Tối: $300\text{ kcal}$
  - **Chế độ 1200 Kcal/ngày**:
    - Bữa Sáng: $300\text{ kcal}$
    - Bữa Trưa: $400\text{ kcal}$
    - Phụ Chiều: $150\text{ kcal}$
    - Bữa Tối: $350\text{ kcal}$
- **Cấu trúc hiển thị dạng lịch tuần & Tìm kiếm theo tuần**:
  - Hiển thị đầy đủ 7 ngày trong tuần (từ Thứ 2 đến Chủ Nhật).
  - Điều hướng nhanh giữa các tuần (Tuần trước / Tuần sau / Phím tắt &ldquo;Tuần này&rdquo;).
  - **Tìm kiếm thực đơn theo tuần**: Người dùng có thể chọn bất kỳ ngày nào qua ô chọn ngày (Date Picker) để hệ thống tự động nhảy đến thực đơn của tuần tương ứng.
  - Thanh tiến trình tổng calo đã chọn/mục tiêu của từng ngày.
- **Cơ chế chọn món linh hoạt**:
  - Mỗi bữa hiển thị danh sách món ăn đa dạng để người dùng lựa chọn.
  - Thu gọn/mở rộng danh sách món linh hoạt để tránh rối mắt.
  - Xem chi tiết món ăn (Modal Popup):
    - Tên món và năng lượng ($kcal$).
    - Bảng định lượng nguyên liệu: Tên thực phẩm, số $g$ sống và số $g$ chín để tự cân đo.
    - Hướng dẫn chế biến/nấu ăn từng bước.
- **Quy tắc khóa thực đơn quá khứ (Day Locking Rule)**:
  - Khi một ngày đã kết thúc (ngày trong quá khứ so với thời điểm hiện tại), hệ thống tự động khóa (Locked).
  - Người dùng **chỉ được xem lại**, **không thể thêm, sửa hoặc xóa** món ăn của các ngày đã qua.

---

### 4.4. Phân hệ Quản trị viên (Admin Dashboard - `/admin`)
- **Nguyên tắc phân quyền Quản trị viên**:
  - **Không có màn hình tự chọn món ăn cá nhân**: Quản trị viên tập trung vào công tác giám sát, quản lý thực đơn và theo dõi thành viên, không hiển thị giao diện chọn món cá nhân.
  - Khi đăng nhập vào hệ thống, Quản trị viên được dẫn hướng trực tiếp đến Bảng điều khiển Quản trị (`/admin`).
- **Quản lý danh mục món ăn (CRUD)**:
  - Thêm món ăn mới: Tên món, lượng calo, bữa ăn áp dụng, chế độ calo, hướng dẫn nấu.
  - Nhập thành phần định lượng chi tiết ($g$ sống và $g$ chín).
  - Chỉnh sửa thông tin món ăn hiện có.
  - Xóa món ăn khỏi cơ sở dữ liệu.
- **Quản lý thành viên & Thống kê thể trạng**:
  - **Danh sách thành viên**: Chỉ hiển thị các tài khoản người dùng (`user`), loại bỏ hoàn toàn các tài khoản Quản trị viên (`admin`) khỏi danh sách này.
  - Thống kê chỉ số thể trạng: Chiều cao, cân nặng, cân nặng mục tiêu, chế độ dinh dưỡng đang theo dõi, chỉ số BMI và phân loại thể trạng.
  - Đếm tổng số ngày người dùng đã lên kế hoạch thực đơn.
- **Xem chi tiết thực đơn cả tuần của thành viên (`/api/admin/user-plans`)**:
  - **Hiển thị đầy đủ cả tuần (7 ngày từ Thứ 2 đến Chủ Nhật)**: Bố cục 7 cột ngày trực quan, mỗi ngày hiển thị đầy đủ 4 bữa ăn (Sáng, Trưa, Phụ, Tối).
  - **Tìm kiếm và lọc theo tuần**: Quản trị viên có thể tìm kiếm thực đơn theo ngày bất kỳ qua Date Picker, lựa chọn tuần trong danh sách các tuần thành viên đã lên thực đơn, hoặc bấm nút Tuần trước / Tuần sau.
  - Hiển thị chi tiết năng lượng ($kcal$) và định lượng nguyên liệu sống/chín của từng món ăn mà thành viên đã chọn.

---

## 5. ĐẶC TẢ CƠ SỞ DỮ LIỆU (DATABASE SCHEMA)

### 5.1. Bảng `users` (Người dùng)
```typescript
interface IUser {
  _id: ObjectId;
  email: string;            // Duy nhất, chữ thường, bắt buộc
  password: string;         // Mã hóa Bcrypt
  fullName: string;         // Họ và tên
  role: 'admin' | 'user';   // Quyền hạn ('admin' hoặc 'user')
  height?: number;          // Chiều cao (cm)
  weight?: number;          // Cân nặng hiện tại (kg)
  targetWeight?: number;    // Cân nặng mục tiêu (kg)
  gender?: 'male' | 'female' | 'other';
  age?: number;             // Tuổi
  dietPreference?: '1000kcal' | '1200kcal';
  createdAt: Date;
  updatedAt: Date;
}
```

### 5.2. Bảng `dishes` (Món ăn)
```typescript
interface IIngredient {
  name: string;             // Tên nguyên liệu/thực phẩm
  rawGrams: number;         // Định lượng sống (gam)
  cookedGrams: number;      // Định lượng chín (gam)
}

interface IDish {
  _id: ObjectId;
  name: string;             // Tên món ăn
  calories: number;         // Lượng calo (kcal)
  meal: 'breakfast' | 'lunch' | 'snack' | 'dinner'; // Bữa ăn
  dietType: '1000kcal' | '1200kcal';                // Chế độ dinh dưỡng
  ingredients: IIngredient[];                       // Danh sách nguyên liệu
  cookingInstructions: string;                      // Hướng dẫn chế biến
  imageUrl?: string;
  createdAt: Date;
  updatedAt: Date;
}
```

### 5.3. Bảng `dayplans` (Kế hoạch thực đơn ngày)
```typescript
interface IMealSelection {
  meal: 'breakfast' | 'lunch' | 'snack' | 'dinner';
  dishId: ObjectId;         // Tham chiếu bảng dishes
  dishName: string;         // Tên món ăn đã chọn
}

interface IDayPlan {
  _id: ObjectId;
  userId: string;           // Mã định danh người dùng
  date: Date;               // Ngày lên thực đơn (00:00:00)
  weekKey: string;          // Ví dụ: '2026-W42'
  dayOfWeek: number;        // 0: CN, 1: T2, ..., 6: T7
  dietType: '1000kcal' | '1200kcal';
  selections: IMealSelection[];
  isLocked: boolean;        // Trạng thái khóa
  createdAt: Date;
  updatedAt: Date;
}
// Index hợp nhất: { userId: 1, date: 1 } (unique: true)
```

---

## 6. DANH SÁCH API ENDPOINTS

| Nhóm API | Method | Endpoint | Mô tả | Quyền hạn |
| :--- | :---: | :--- | :--- | :---: |
| **Auth** | `POST` | `/api/auth/register` | Đăng ký tài khoản thành viên (`role: user`) | Mọi người |
| | `POST` | `/api/auth/create-admin` | Khởi tạo tài khoản Quản trị viên | Secret Key / Admin |
| | `POST` | `/api/auth/login` | Đăng nhập tài khoản & cấp JWT cookie | Mọi người |
| | `POST` | `/api/auth/logout` | Đăng xuất & xóa cookie phiên | Mọi người |
| | `POST` | `/api/auth/change-password` | Đổi mật khẩu tài khoản | Đã đăng nhập |
| | `GET` | `/api/auth/me` | Lấy thông tin tài khoản & chỉ số BMI | Đã đăng nhập |
| **Profile** | `PUT` | `/api/user/profile` | Cập nhật chiều cao, cân nặng, mục tiêu | Đã đăng nhập |
| **Dishes** | `GET` | `/api/dishes` | Lấy danh sách món theo bữa & chế độ | Đã đăng nhập |
| | `POST` | `/api/dishes` | Thêm món ăn mới hoặc nạp dữ liệu mẫu | **Admin** |
| | `GET` | `/api/dishes/[id]` | Xem chi tiết 1 món ăn | Đã đăng nhập |
| | `PUT` | `/api/dishes/[id]` | Chỉnh sửa món ăn | **Admin** |
| | `DELETE` | `/api/dishes/[id]` | Xóa món ăn khỏi hệ thống | **Admin** |
| **DayPlans** | `GET` | `/api/dayplans` | Lấy danh sách thực đơn đã chọn trong tuần | Đã đăng nhập |
| | `POST` | `/api/dayplans` | Lưu món ăn đã chọn cho ngày (kiểm tra khóa) | Đã đăng nhập |
| **Admin** | `GET` | `/api/admin/users` | Lấy danh sách thành viên & thống kê BMI | **Admin** |
| | `GET` | `/api/admin/user-plans` | **Xem chi tiết thực đơn đã chọn của thành viên** | **Admin** |

---

## 7. CẤU TRÚC MÃ NGUỒN (MODULAR ARCHITECTURE)

Hệ thống được module hóa rõ ràng, chia tách các components và pages chuyên biệt:
```
src/
├── app/
│   ├── admin/
│   │   ├── create-admin/page.tsx # Trang tạo tài khoản Quản trị viên
│   │   └── page.tsx              # Trang Dashboard Quản trị viên
│   ├── api/                      # Toàn bộ API Endpoints bảo mật
│   │   ├── admin/
│   │   ├── auth/
│   │   ├── dayplans/
│   │   ├── dishes/
│   │   └── user/
│   ├── layout.tsx                # Layout gốc và thẻ Meta SEO
│   └── page.tsx                  # Trang chủ (Landing Page khi chưa đăng nhập / Weekly Planner)
├── components/
│   ├── AdminMemberPlansModal.tsx # Modal xem chi tiết món ăn của thành viên
│   ├── AuthModal.tsx             # Modal Đăng nhập / Đăng ký người dùng
│   ├── ChangePasswordModal.tsx   # Modal Đổi mật khẩu
│   ├── DayColumn.tsx             # Cột hiển thị từng ngày trong tuần
│   ├── DishDetailModal.tsx       # Modal xem chi tiết món ăn & định lượng
│   ├── GuestHero.tsx             # Giao diện Landing Page khi chưa đăng nhập
│   ├── Navbar.tsx                # Thanh điều hướng và menu người dùng
│   ├── ProfileModal.tsx          # Modal Cập nhật hồ sơ thể trạng & BMI
│   └── WeeklyPlanner.tsx         # Bảng kế hoạch thực đơn tuần
├── lib/
│   ├── auth.ts                   # JWT & Tính toán BMI chuẩn Châu Á
│   ├── constants.ts              # Dữ liệu món ăn mẫu & cấu hình calo
│   └── mongodb.ts                # Kết nối MongoDB Atlas
├── models/                       # Mongoose Schemas (User, Dish, DayPlan)
└── types/                        # TypeScript Interfaces toàn hệ thống
```

---

## 8. YÊU CẦU PHI CHỨC NĂNG

1. **Giao diện & Trải nghiệm người dùng (UI/UX)**:
   - Thiết kế chuẩn Glassmorphism thời thượng, hiệu ứng Dark Theme cao cấp bảo vệ mắt.
   - Hiển thị tương thích 100% trên điện thoại (Mobile Responsive), máy tính bảng và màn hình lớn.
   - Thao tác chọn món trực quan, mượt mà với hiệu ứng vi mô (micro-interactions).
2. **Hiệu năng & Tối ưu hóa**:
   - Sử dụng App Router và Turbopack cho tốc độ biên dịch và tải trang siêu nhanh.
   - Bộ nhớ đệm kết nối MongoDB Mongoose chống rò rỉ kết nối trên môi trường Serverless.
3. **Bảo mật**:
   - Mật khẩu người dùng được băm an toàn qua thư viện `bcryptjs`.
   - Token phiên truyền tải qua HTTP-Only Cookie chống tấn công XSS.
   - Chặn phân quyền ở cả tầng giao diện (Frontend) lẫn tầng xử lý (Backend API).
4. **Tối ưu SEO**:
   - Tiêu đề (`title`), mô tả (`description`), từ khóa (`keywords`) và thẻ OpenGraph chuẩn hóa tiếng Việt chuẩn SEO.
