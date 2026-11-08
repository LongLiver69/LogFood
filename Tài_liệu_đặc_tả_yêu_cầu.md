# TÀI LIỆU ĐẶC TẢ YÊU CẦU HỆ THỐNG
# LOGFOOD – HỆ THỐNG QUẢN LÝ CHẾ ĐỘ DINH DƯỠNG

---

## 1. TỔNG QUAN HỆ THỐNG

**LogFood** là hệ thống web application hỗ trợ cá nhân hóa và quản lý chế độ dinh dưỡng hàng ngày, hàng tuần. Hệ thống phân định vai trò chuyên nghiệp: **Quản trị viên (Admin/Bác sĩ dinh dưỡng)** là người lên thực đơn và lựa chọn món ăn hàng ngày cho từng thành viên, trong khi **Người dùng (User/Thành viên)** đăng nhập để theo dõi thực đơn hôm nay ăn gì, định lượng thực phẩm (gam sống và gam chín/đơn vị thường dùng), nguyên liệu theo từng món và hướng dẫn chế biến chi tiết.

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
| Đăng ký tài khoản thông thường | ✅ (Mặc định `user`, **chờ Admin duyệt**) | ❌ (Không được đăng ký ở form chung) |
| Phê duyệt tài khoản thành viên đăng nhập | ❌ | ✅ (Duyệt/Kích hoạt hoặc khóa) |
| Khởi tạo tài khoản Quản trị viên (`/admin/create-admin`) | ❌ | ✅ (Yêu cầu mã bảo mật Secret Key) |
| Đăng nhập, Đăng xuất | ✅ (Sau khi được duyệt) | ✅ |
| Đổi mật khẩu tài khoản | ✅ | ✅ |
| Nhập/cập nhật Chiều cao, Cân nặng, Cân nặng mục tiêu | ✅ (Chỉ bản thân) | ✅ (Chỉ bản thân) |
| Xem bảng tính chỉ số BMI và nhận khuyến nghị chế độ | ✅ | ✅ |
| Cấp quyền mức calo thực đơn (1000Kcal / 1200Kcal) theo tuần | ❌ (Không được tự ý đổi) | ✅ (Phân bổ linh hoạt theo tuần) |
| **Lựa chọn món ăn hàng ngày cho User** | ❌ (Chỉ xem thực đơn được giao) | ✅ (**Admin là người lựa chọn món cho User**) |
| **Xem thực đơn "Hôm nay ăn gì?", định lượng, nguyên liệu, hướng dẫn** | ✅ (Giao diện trực quan, dễ nhìn nhất) | ✅ |
| Thêm món ăn mới vào hệ thống (theo nhóm cơm gia đình / eatclean) | ❌ | ✅ |
| Chỉnh sửa / Xóa món ăn trong hệ thống | ❌ | ✅ |
| Nạp dữ liệu thực đơn mẫu (Seed Data) | ❌ | ✅ |
| Xem danh sách toàn bộ thành viên & chỉ số thể trạng | ❌ | ✅ |
| **Lên thực đơn & đổi món từng bữa cho thành viên** | ❌ | ✅ |

---

## 4. CHI TIẾT CÁC TÍNH NĂNG ĐƯỢC NÂNG CẤP MỚI NHẤT

### 4.1. Phân quyền & Trải nghiệm người dùng: Admin chọn món, User xem "Hôm nay ăn gì?"
- **Quy tắc cốt lõi:** Người dùng (`user`) **chỉ được xem** thực đơn ngày hôm nay ăn gì, thành phần nguyên liệu, định lượng sống/chín và hướng dẫn nấu. **Quản trị viên (`admin`) là người lựa chọn món ăn hàng ngày cho người dùng.**
- **Giao diện người dùng tối ưu hóa độ dễ nhìn (`UserDailyMenu`):**
  - **Banner ngày nổi bật:** Hiển thị rõ ngày trong tuần (ví dụ: *Thứ Tư, 08/11/2026*), gắn cờ "Hôm nay" trực quan.
  - **Thanh chuyển ngày 1 chạm (Day Selector Pills):** 7 nút bấm Thứ 2 &rarr; Chủ Nhật gọn gàng trên đầu trang, người dùng chạm nhẹ là chuyển ngay sang thực đơn ngày đó.
  - **Thẻ 4 bữa ăn to rõ, cách điệu đẹp mắt:**
    - Bữa Sáng (300 kcal), Bữa Trưa (420 kcal), Phụ Chiều (120 kcal), Bữa Tối (360 kcal).
    - Tên món ăn hiển thị chữ to, độ tương phản cao.
    - Huy hiệu nhóm món: `🍚 Món cơm gia đình` hoặc `🥗 Món ăn eatclean`.
    - Phân tách định lượng thành phần chi tiết theo từng món con (Sub-dishes).
    - Khung hướng dẫn nấu và sơ chế rõ ràng từng bước.
  - **Chế độ xem linh hoạt:** Người dùng có thể chuyển đổi giữa *Xem theo ngày (Dễ nhìn nhất)* và *Tổng quan cả tuần (Bảng 7 cột tóm tắt)*.
  - **Chế độ chỉ đọc (Read-only):** Người dùng không có các nút bấm thêm/sửa/xóa gây rối mắt.

---

### 4.2. Phân loại 2 nhóm món ăn: "Món cơm gia đình" & "Món ăn eatclean"
- Toàn bộ thực đơn trong hệ thống (Sáng, Trưa, Chiều, Tối) được chia thành 2 nhóm rõ rệt:
  1. **🍚 Món cơm gia đình (`family`)**: Món ăn truyền thống gia đình Việt Nam (cơm trắng, thịt kho, cá kho tộ, canh rau cua/cải, bầu nhồi hấp...).
  2. **🥗 Món ăn eatclean (`eatclean`)**: Món ăn chế biến theo phong cách eatclean, giảm dầu mỡ tinh chế (cơm gạo lứt, ức gà áp chảo, cá hồi áp chảo măng tây, rau củ luộc sốt mè...).
- **Bộ lọc chuyển nhóm 1 chạm:**
  - Trong trang Quản lý món ăn Admin: Có thanh nút lọc nhanh `[🍚 Món cơm gia đình]` và `[🥗 Món ăn eatclean]` để Admin lọc danh sách theo đúng nhu cầu.
  - Trong Modal chọn món cho thành viên: Có thanh chuyển nhóm món để Admin nhanh chóng chọn món cơm gia đình hoặc món eatclean cho từng bữa của thành viên.

---

### 4.3. Cấu trúc điền món ăn & Phân bổ định lượng theo từng món con (Sub-dish Components)
- **Tên món ăn (1 dòng tổng quan):**
  - Giữ 1 dòng điền tất cả các món bao gồm cơm, món mặn, món xào, món canh, tráng miệng...
  - *Ví dụ:* `Cơm trắng, bầu nhồi tôm thịt hấp, bưởi`.
- **Thành phần định lượng (Chia theo từng nhóm món con):**
  - Khắc phục triệt để tình trạng nhầm lẫn nguyên liệu giữa các món (ví dụ: không biết rau nào dùng để xào, rau nào dùng để nấu canh, hoặc dầu ăn 3g là của món xào hay món chiên).
  - Định lượng được gom nhóm rõ ràng theo từng món con (`dishComponents`):
    - **Món con #1: Cơm trắng**
      - Gạo tẻ tám xoan: *55g sống &rarr; 1 bát vừa (160g chín)*
    - **Món con #2: Bầu nhồi tôm thịt hấp**
      - Bầu non: *150g sống &rarr; 140g chín*
      - Tôm biển tươi: *60g sống &rarr; 50g chín*
      - Thịt lợn nạc: *40g sống &rarr; 32.5g chín*
    - **Món con #3: Bưởi tráng miệng**
      - Bưởi da xanh: *2 múi*
- **Quy tắc hiển thị định lượng chuẩn xác:**
  - Cho phép nhập đơn vị thường dùng bằng chữ dạng text (ví dụ: *1 quả, 2 múi, 1 bát, 150g*).
  - Các số nguyên/thập phân tự động gắn đuôi đơn vị gam (`32.5g`, `150g`).
  - **Tuyệt đối không hiển thị `0g` hoặc `0`** khi không có định lượng chín hoặc sống.

---

### 4.4. Công cụ lên thực đơn hàng ngày cho thành viên của Admin (`AdminMemberPlansModal`)
- Khi Admin mở hồ sơ thành viên:
  - Bảng 7 ngày (Thứ 2 &rarr; Chủ Nhật) hiển thị trạng thái thực đơn của từng bữa.
  - Trên mỗi bữa ăn:
    - Nếu đã có món: Hiển thị tên món, lượng calo, thành phần món con và 2 nút: `[Đổi món]` và `[Xóa]`.
    - Nếu chưa có món: Hiển thị nút `[+ Chọn món]`.
  - Khi click `[+ Chọn món]` hoặc `[Đổi món]`:
    - Mở Popup chọn món thông minh với bộ lọc: `Món cơm gia đình` vs `Món eatclean`.
    - Có thanh tìm kiếm theo tên món ăn.
    - Click "Chọn món này" sẽ lập tức lưu vào cơ sở dữ liệu qua API `/api/dayplans` và cập nhật tức thì vào màn hình của người dùng.

---

### 4.5. Theo dõi các chỉ số cơ thể qua các tuần & Biểu đồ Line Chart (`/body-metrics`)
- **Phân quyền chặt chẽ:** **Admin là người nhập/chỉnh sửa các chỉ số** cho thành viên sau mỗi đợt khám; **User chỉ xem được** (Read-only).
- **Bộ 18 chỉ số khám định kỳ toàn diện:**
  1. Ngày khám
  2. Chiều cao ($cm$)
  3. Cân nặng ($kg$)
  4. BMI ($kg/m^2$ – tự động tính)
  5. Vòng eo ($cm$)
  6. Vòng bụng ($cm$)
  7. Vòng hông ($cm$)
  8. Vòng mông ($cm$)
  9. Tỷ lệ eo hông (tự động tính từ Vòng eo / Vòng hông)
  10. Tỷ lệ mỡ (%)
  11. Tỷ lệ mỡ tại vùng bụng (%)
  12. Mỡ nội tạng
  13. % mỡ dưới da
  14. Lượng cơ ($kg$)
  15. Lượng cơ xương ($kg$)
  16. Lượng nước ($kg$)
  17. BMR ($Kcal$)
  18. Chỉ số điểm cơ thể (InBody score)
- **Biểu đồ đường trực quan (Interactive SVG Line Chart):**
  - Hiển thị diễn biến thay đổi qua các tuần (Tuần 1, Tuần 2, Tuần 3, Tuần 4...).
  - Cho phép người dùng và bác sĩ click chuyển đổi chỉ số cần vẽ (Cân nặng, BMI, % Mỡ, Vòng eo, Lượng cơ, Nước, BMR, Điểm cơ thể).
  - Tự động hiển thị mức độ tiến bộ (ví dụ: *↓ Giảm 2.4 kg*, *↑ Tăng 0.8 kg cơ*, *↓ Giảm 4 cm vòng eo*).
- **Giao diện ưu tiên Mobile-First:**
  - Trên điện thoại: Thiết kế dạng thẻ (Card-based) phân nhóm khoa học (Thông số cơ bản, Số đo các vòng, Mỡ & Cơ, Nước & Năng lượng) kèm thanh chuyển tuần 1 chạm.
  - Hỗ trợ xem dạng bảng đối chiếu 4 tuần chuẩn y khoa (có cuộn ngang cố định cột tiêu đề).

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
  isApproved: boolean;      // Được Admin phê duyệt (mặc định false cho user mới)
  height?: number;          // Chiều cao (cm)
  weight?: number;          // Cân nặng hiện tại (kg)
  targetWeight?: number;    // Cân nặng mục tiêu (kg)
  gender?: 'male' | 'female' | 'other';
  age?: number;             // Tuổi
  dietPreference?: '1000kcal' | '1200kcal'; // Chế độ mặc định
  weeklyDietPreferences?: Map<string, '1000kcal' | '1200kcal'>; // Phân bổ mức calo theo tuần
  createdAt: Date;
  updatedAt: Date;
}
```

### 5.2. Bảng `dishes` (Món ăn)
```typescript
interface IIngredient {
  name: string;                   // Tên nguyên liệu/thực phẩm
  rawGrams?: string | number;     // Định lượng sống (gam hoặc text)
  cookedGrams?: string | number;  // Định lượng chín / đơn vị thường dùng (text)
  dishComponent?: string;         // Tên món con mà nguyên liệu này trực thuộc
}

interface IDishComponent {
  dishName: string;               // Tên món thành phần (VD: Cơm trắng / Bầu nhồi tôm thịt hấp / Bưởi)
  ingredients: IIngredient[];     // Danh sách nguyên liệu của riêng món con này
}

interface IDish {
  _id: ObjectId;
  name: string;                   // Tên món ăn (1 dòng tổng quan tất cả các món)
  calories: number;               // Lượng calo (kcal)
  meal: 'breakfast' | 'lunch' | 'snack' | 'dinner'; // Bữa ăn
  dietType: '1000kcal' | '1200kcal';                // Chế độ dinh dưỡng
  category: 'family' | 'eatclean';                  // 'family': Món cơm gia đình, 'eatclean': Món ăn eatclean
  dishComponents?: IDishComponent[];                // Danh sách món con và định lượng tương ứng
  ingredients: IIngredient[];                       // Danh sách phẳng đồng bộ (hỗ trợ tương thích ngược)
  cookingInstructions: string;                      // Hướng dẫn chế biến / nấu ăn
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
  dishDetail?: Partial<IDish>; // Snapshot chi tiết món ăn (kèm dishComponents & ingredients)
}

interface IDayPlan {
  _id: ObjectId;
  userId: string;           // Mã định danh người dùng
  date: Date;               // Ngày lên thực đơn (00:00:00)
  weekKey: string;          // Ví dụ: '2026-W45'
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
| **Auth** | `POST` | `/api/auth/register` | Đăng ký tài khoản thành viên (`isApproved: false`) | Mọi người |
| | `POST` | `/api/auth/create-admin` | Khởi tạo tài khoản Quản trị viên | Secret Key / Admin |
| | `POST` | `/api/auth/login` | Đăng nhập tài khoản & kiểm tra phê duyệt | Mọi người |
| | `POST` | `/api/auth/logout` | Đăng xuất & xóa cookie phiên | Mọi người |
| | `POST` | `/api/auth/change-password` | Đổi mật khẩu tài khoản | Đã đăng nhập |
| | `GET` | `/api/auth/me` | Lấy thông tin tài khoản & chỉ số BMI, chế độ tuần | Đã đăng nhập |
| **Profile** | `PUT` | `/api/user/profile` | Cập nhật chiều cao, cân nặng, mục tiêu | Đã đăng nhập |
| **Dishes** | `GET` | `/api/dishes` | Lấy danh sách món theo bữa, chế độ & nhóm món (`?category=family\|eatclean`) | Đã đăng nhập |
| | `POST` | `/api/dishes` | Thêm món ăn mới (kèm `dishComponents`) hoặc nạp dữ liệu mẫu | **Admin** |
| | `GET` | `/api/dishes/[id]` | Xem chi tiết 1 món ăn | Đã đăng nhập |
| | `PUT` | `/api/dishes/[id]` | Chỉnh sửa món ăn (cập nhật `category` & `dishComponents`) | **Admin** |
| | `DELETE` | `/api/dishes/[id]` | Xóa món ăn khỏi hệ thống | **Admin** |
| **DayPlans** | `GET` | `/api/dayplans` | Lấy danh sách thực đơn đã chọn trong tuần | Đã đăng nhập |
| | `POST` | `/api/dayplans` | Lưu món ăn đã chọn cho ngày (Admin có quyền chọn món cho bất kỳ User nào) | Đã đăng nhập / Admin |
| **Admin** | `GET` | `/api/admin/users` | Lấy danh sách thành viên & thống kê BMI | **Admin** |
| | `PATCH` | `/api/admin/users` | Phê duyệt tài khoản & cấp quyền calo theo tuần | **Admin** |
| | `GET` | `/api/admin/user-plans` | Xem chi tiết thực đơn & tuần của thành viên | **Admin** |
| **BodyMetrics** | `GET` | `/api/body-metrics` | Lấy danh sách chỉ số các tuần & thành viên | Đã đăng nhập |
| | `POST` | `/api/body-metrics` | Lưu/cập nhật chỉ số tuần khám cho thành viên | **Admin** |
| | `DELETE` | `/api/body-metrics` | Xóa dữ liệu 1 tuần khám | **Admin** |

---

## 7. CẤU TRÚC MÃ NGUỒN (MODULAR ARCHITECTURE)

```
src/
├── app/
│   ├── admin/
│   │   ├── create-admin/page.tsx # Trang tạo tài khoản Quản trị viên
│   │   └── page.tsx              # Bảng điều khiển Quản Trị (CRUD món ăn, chuyển nhóm món, duyệt thành viên)
│   ├── body-metrics/
│   │   └── page.tsx              # Trang Theo dõi các chỉ số cơ thể & Biểu đồ Line Chart
│   ├── api/                      # Toàn bộ API Endpoints bảo mật
│   │   ├── admin/
│   │   ├── auth/
│   │   ├── body-metrics/         # API quản lý và lưu trữ chỉ số cơ thể
│   │   ├── dayplans/
│   │   ├── dishes/
│   │   └── user/
│   ├── layout.tsx                # Layout gốc và thẻ Meta SEO
│   └── page.tsx                  # Trang chủ (Guest Landing / User Daily Menu)
├── components/
│   ├── AdminMemberPlansModal.tsx # Modal Admin lên thực đơn, đổi món & cấp quyền tuần cho thành viên
│   ├── AuthModal.tsx             # Modal Đăng nhập / Đăng ký người dùng
│   ├── BodyMetricsChart.tsx      # Biểu đồ SVG Line Chart tương tác theo dõi chỉ số cơ thể
│   ├── ChangePasswordModal.tsx   # Modal Đổi mật khẩu
│   ├── DishDetailModal.tsx       # Modal chi tiết món ăn hiển thị theo từng món con (không 0g)
│   ├── GuestHero.tsx             # Giao diện Landing Page khi chưa đăng nhập
│   ├── Navbar.tsx                # Thanh điều hướng và menu người dùng
│   ├── ProfileModal.tsx          # Modal Cập nhật hồ sơ thể trạng & BMI
│   ├── UserDailyMenu.tsx         # Giao diện thành viên xem "Hôm nay ăn gì?", định lượng, nguyên liệu & hướng dẫn
│   └── WeeklyPlanner.tsx         # Bảng kế hoạch tuần tương thích
├── lib/
│   ├── auth.ts                   # JWT & Tính toán BMI chuẩn Châu Á
│   ├── constants.ts              # Dữ liệu món ăn mẫu, cấu hình calo YH TDTT & gom nhóm món con
│   └── mongodb.ts                # Kết nối MongoDB Atlas
├── models/                       # Mongoose Schemas (User, Dish, DayPlan)
└── types/                        # TypeScript Interfaces toàn hệ thống
```

---

## 8. TIÊU CHUẨN KIỂM ĐỊNH VÀ NGHIỆM THU

1. **Giao diện Người dùng (User View):**
   - Người dùng đăng nhập chỉ nhìn thấy thực đơn do Admin chỉ định.
   - Bố cục thẻ 4 bữa ăn rõ ràng, dễ đọc; thanh chọn ngày 1 chạm hoạt động mượt mà.
   - Tên món hiển thị 1 dòng; định lượng được phân tách rành mạch theo từng món con.
   - Không xuất hiện `0g` ở các thành phần không nhập hoặc có đơn vị chữ.
2. **Quản lý Thực đơn (Admin View):**
   - Admin chuyển đổi mượt mà giữa danh mục `🍚 Món cơm gia đình` và `🥗 Món ăn eatclean`.
   - Form thêm/sửa món cho phép tạo các khối món con (`dishComponents`) và lưu thành công.
3. **Phân quyền và Lên thực đơn:**
   - Admin có thể vào xem bất kỳ thành viên nào, ấn `[+ Chọn món]` hoặc `[Đổi món]` theo từng bữa ăn, dữ liệu cập nhật ngay lập tức vào tài khoản thành viên.
