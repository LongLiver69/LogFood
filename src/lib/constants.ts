// Seed data cho danh sách món ăn
export const SEED_DISHES = [
  // ===== BỮA SÁNG (250 Kcal) =====
  {
    name: 'Cháo yến mạch sữa',
    calories: 250,
    meal: 'breakfast',
    dietType: '1000kcal',
    ingredients: [
      { name: 'Yến mạch', rawGrams: 50, cookedGrams: 150 },
      { name: 'Sữa tươi không đường', rawGrams: 100, cookedGrams: 100 },
      { name: 'Chuối', rawGrams: 60, cookedGrams: 60 },
    ],
    cookingInstructions: 'Nấu yến mạch với sữa và 100ml nước trong 5 phút. Cho chuối thái lát lên trên. Ăn nóng.',
  },
  {
    name: 'Bánh mì nguyên cám trứng luộc',
    calories: 245,
    meal: 'breakfast',
    dietType: '1000kcal',
    ingredients: [
      { name: 'Bánh mì nguyên cám', rawGrams: 60, cookedGrams: 60 },
      { name: 'Trứng gà', rawGrams: 60, cookedGrams: 55 },
      { name: 'Rau xà lách', rawGrams: 30, cookedGrams: 30 },
    ],
    cookingInstructions: 'Luộc trứng 8 phút. Kẹp trứng với rau vào bánh mì. Ăn kèm 1 ly nước lọc.',
  },
  {
    name: 'Sinh tố chuối + hạt chia',
    calories: 240,
    meal: 'breakfast',
    dietType: '1000kcal',
    ingredients: [
      { name: 'Chuối', rawGrams: 100, cookedGrams: 100 },
      { name: 'Sữa chua không đường', rawGrams: 100, cookedGrams: 100 },
      { name: 'Hạt chia', rawGrams: 10, cookedGrams: 10 },
    ],
    cookingInstructions: 'Xay chuối với sữa chua, thêm hạt chia. Để ngăn mát 30 phút trước khi uống.',
  },
  {
    name: 'Phở bò ít mỡ',
    calories: 250,
    meal: 'breakfast',
    dietType: '1000kcal',
    ingredients: [
      { name: 'Bánh phở', rawGrams: 80, cookedGrams: 160 },
      { name: 'Thịt bò nạc', rawGrams: 40, cookedGrams: 32 },
      { name: 'Giá đỗ', rawGrams: 30, cookedGrams: 30 },
      { name: 'Hành lá', rawGrams: 5, cookedGrams: 5 },
    ],
    cookingInstructions: 'Chần bánh phở. Thái thịt bò mỏng, trụng qua nước dùng. Cho giá và hành vào tô, chan nước dùng nóng.',
  },
  {
    name: 'Trứng bác rau củ',
    calories: 245,
    meal: 'breakfast',
    dietType: '1000kcal',
    ingredients: [
      { name: 'Trứng gà', rawGrams: 100, cookedGrams: 90 },
      { name: 'Cà chua', rawGrams: 50, cookedGrams: 50 },
      { name: 'Hành tây', rawGrams: 30, cookedGrams: 28 },
      { name: 'Dầu ô-liu', rawGrams: 5, cookedGrams: 5 },
    ],
    cookingInstructions: 'Xào cà chua và hành với dầu ô-liu. Đổ trứng đánh vào, khuấy đều đến khi chín.',
  },
  // ===== BỮA TRƯA (350 Kcal) =====
  {
    name: 'Cơm gạo lứt + ức gà luộc + rau muống xào tỏi',
    calories: 350,
    meal: 'lunch',
    dietType: '1000kcal',
    ingredients: [
      { name: 'Gạo lứt', rawGrams: 60, cookedGrams: 180 },
      { name: 'Ức gà', rawGrams: 80, cookedGrams: 64 },
      { name: 'Rau muống', rawGrams: 100, cookedGrams: 80 },
      { name: 'Tỏi', rawGrams: 5, cookedGrams: 5 },
    ],
    cookingInstructions: 'Vo gạo lứt và nấu cơm. Luộc ức gà 15 phút với sả và gừng. Xào rau muống với tỏi phi vàng.',
  },
  {
    name: 'Bún bò nạm hầm rau củ',
    calories: 350,
    meal: 'lunch',
    dietType: '1000kcal',
    ingredients: [
      { name: 'Bún tươi', rawGrams: 100, cookedGrams: 100 },
      { name: 'Thịt bò nạm', rawGrams: 50, cookedGrams: 40 },
      { name: 'Cà rốt', rawGrams: 40, cookedGrams: 38 },
      { name: 'Khoai tây', rawGrams: 50, cookedGrams: 48 },
    ],
    cookingInstructions: 'Hầm bò với cà rốt và khoai tây 45 phút. Chan nước dùng lên bún. Thêm hành ngò.',
  },
  {
    name: 'Cơm trắng + cá hồi áp chảo + canh bí đỏ',
    calories: 355,
    meal: 'lunch',
    dietType: '1000kcal',
    ingredients: [
      { name: 'Gạo trắng', rawGrams: 55, cookedGrams: 165 },
      { name: 'Cá hồi', rawGrams: 70, cookedGrams: 56 },
      { name: 'Bí đỏ', rawGrams: 80, cookedGrams: 75 },
      { name: 'Hành lá', rawGrams: 5, cookedGrams: 5 },
    ],
    cookingInstructions: 'Ướp cá hồi muối tiêu 10 phút, áp chảo 3 phút mỗi mặt. Nấu canh bí đỏ với hành.',
  },
  {
    name: 'Mì udon gà rau cải',
    calories: 345,
    meal: 'lunch',
    dietType: '1000kcal',
    ingredients: [
      { name: 'Mì udon', rawGrams: 100, cookedGrams: 200 },
      { name: 'Ức gà', rawGrams: 60, cookedGrams: 48 },
      { name: 'Cải xanh', rawGrams: 80, cookedGrams: 70 },
      { name: 'Nấm hương', rawGrams: 30, cookedGrams: 28 },
    ],
    cookingInstructions: 'Luộc mì udon. Nấu nước dùng gà, cho cải và nấm vào. Chan lên mì.',
  },
  {
    name: 'Cơm gạo lứt + đậu hũ sốt cà chua + rau cải luộc',
    calories: 350,
    meal: 'lunch',
    dietType: '1000kcal',
    ingredients: [
      { name: 'Gạo lứt', rawGrams: 55, cookedGrams: 165 },
      { name: 'Đậu hũ cứng', rawGrams: 100, cookedGrams: 90 },
      { name: 'Cà chua', rawGrams: 60, cookedGrams: 58 },
      { name: 'Rau cải', rawGrams: 100, cookedGrams: 85 },
    ],
    cookingInstructions: 'Chiên đậu hũ vàng, sốt cà chua thái hạt lựu. Luộc rau cải. Ăn kèm cơm gạo lứt.',
  },
  // ===== PHỤ CHIỀU (100 Kcal) =====
  {
    name: 'Táo + hạnh nhân',
    calories: 100,
    meal: 'snack',
    dietType: '1000kcal',
    ingredients: [
      { name: 'Táo xanh', rawGrams: 100, cookedGrams: 100 },
      { name: 'Hạnh nhân', rawGrams: 10, cookedGrams: 10 },
    ],
    cookingInstructions: 'Rửa táo sạch, ăn cùng hạnh nhân. Nên ăn trước bữa tối 3 tiếng.',
  },
  {
    name: 'Sữa chua không đường',
    calories: 95,
    meal: 'snack',
    dietType: '1000kcal',
    ingredients: [
      { name: 'Sữa chua không đường', rawGrams: 150, cookedGrams: 150 },
    ],
    cookingInstructions: 'Ăn trực tiếp hoặc thêm vài lát dâu tây để tăng hương vị.',
  },
  {
    name: 'Chuối + hạt chia',
    calories: 100,
    meal: 'snack',
    dietType: '1000kcal',
    ingredients: [
      { name: 'Chuối', rawGrams: 80, cookedGrams: 80 },
      { name: 'Hạt chia', rawGrams: 5, cookedGrams: 5 },
    ],
    cookingInstructions: 'Thái chuối lát, rắc hạt chia lên trên.',
  },
  {
    name: 'Dưa leo + hummus',
    calories: 100,
    meal: 'snack',
    dietType: '1000kcal',
    ingredients: [
      { name: 'Dưa leo', rawGrams: 100, cookedGrams: 100 },
      { name: 'Hummus (đậu xanh nghiền)', rawGrams: 30, cookedGrams: 30 },
    ],
    cookingInstructions: 'Thái dưa leo thành que, chấm với hummus.',
  },
  {
    name: 'Trứng luộc',
    calories: 90,
    meal: 'snack',
    dietType: '1000kcal',
    ingredients: [
      { name: 'Trứng gà', rawGrams: 60, cookedGrams: 55 },
    ],
    cookingInstructions: 'Luộc trứng 8 phút, bóc vỏ ăn trực tiếp.',
  },
  // ===== BỮA TỐI (300 Kcal) =====
  {
    name: 'Súp gà rau củ ít tinh bột',
    calories: 300,
    meal: 'dinner',
    dietType: '1000kcal',
    ingredients: [
      { name: 'Ức gà', rawGrams: 80, cookedGrams: 64 },
      { name: 'Khoai lang', rawGrams: 60, cookedGrams: 58 },
      { name: 'Cà rốt', rawGrams: 50, cookedGrams: 48 },
      { name: 'Súp lơ xanh', rawGrams: 60, cookedGrams: 55 },
    ],
    cookingInstructions: 'Hầm gà với rau củ 30 phút. Nêm muối và tiêu vừa ăn. Ăn nóng.',
  },
  {
    name: 'Salad cá ngừ + quinoa',
    calories: 295,
    meal: 'dinner',
    dietType: '1000kcal',
    ingredients: [
      { name: 'Cá ngừ đóng hộp (trong nước)', rawGrams: 80, cookedGrams: 80 },
      { name: 'Quinoa', rawGrams: 40, cookedGrams: 100 },
      { name: 'Xà lách', rawGrams: 50, cookedGrams: 50 },
      { name: 'Cà chua bi', rawGrams: 50, cookedGrams: 50 },
      { name: 'Dầu ô-liu', rawGrams: 5, cookedGrams: 5 },
    ],
    cookingInstructions: 'Nấu quinoa theo hướng dẫn. Trộn cá ngừ, rau và quinoa. Thêm dầu ô-liu và chanh.',
  },
  {
    name: 'Cơm gạo lứt + tôm hấp + rau xanh',
    calories: 300,
    meal: 'dinner',
    dietType: '1000kcal',
    ingredients: [
      { name: 'Gạo lứt', rawGrams: 45, cookedGrams: 135 },
      { name: 'Tôm sú', rawGrams: 80, cookedGrams: 60 },
      { name: 'Rau cải xanh', rawGrams: 100, cookedGrams: 85 },
    ],
    cookingInstructions: 'Nấu cơm gạo lứt. Hấp tôm với sả 10 phút. Xào rau với tỏi.',
  },
  {
    name: 'Canh chua cá lóc',
    calories: 300,
    meal: 'dinner',
    dietType: '1000kcal',
    ingredients: [
      { name: 'Cá lóc', rawGrams: 100, cookedGrams: 75 },
      { name: 'Cà chua', rawGrams: 60, cookedGrams: 58 },
      { name: 'Dứa', rawGrams: 40, cookedGrams: 40 },
      { name: 'Rau muống', rawGrams: 50, cookedGrams: 45 },
      { name: 'Gạo lứt', rawGrams: 40, cookedGrams: 120 },
    ],
    cookingInstructions: 'Phi tỏi, cho cà chua và dứa vào xào. Thêm nước, đun sôi, cho cá vào. Cuối cùng cho rau muống.',
  },
  {
    name: 'Đậu phụ hấp nước tương + rau luộc',
    calories: 295,
    meal: 'dinner',
    dietType: '1000kcal',
    ingredients: [
      { name: 'Đậu phụ non', rawGrams: 150, cookedGrams: 145 },
      { name: 'Gạo lứt', rawGrams: 40, cookedGrams: 120 },
      { name: 'Bông cải xanh', rawGrams: 80, cookedGrams: 75 },
      { name: 'Nước tương ít muối', rawGrams: 10, cookedGrams: 10 },
    ],
    cookingInstructions: 'Hấp đậu phụ 8 phút. Luộc bông cải. Chan nước tương pha tỏi ớt lên đậu phụ.',
  },
];

export const MEAL_LABELS: Record<string, string> = {
  breakfast: 'Bữa Sáng',
  lunch: 'Bữa Trưa',
  snack: 'Phụ Chiều',
  dinner: 'Bữa Tối',
};

export const MEAL_CALORIES: Record<string, Record<string, number>> = {
  '1000kcal': {
    breakfast: 250,
    lunch: 350,
    snack: 100,
    dinner: 300,
  },
  '1200kcal': {
    breakfast: 300,
    lunch: 400,
    snack: 150,
    dinner: 350,
  },
};

export const MEAL_ORDER = ['breakfast', 'lunch', 'snack', 'dinner'];

export const DAY_LABELS = ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'];
export const DAY_FULL_LABELS = ['Chủ nhật', 'Thứ 2', 'Thứ 3', 'Thứ 4', 'Thứ 5', 'Thứ 6', 'Thứ 7'];
