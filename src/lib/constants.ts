// Kiểm tra xem chuỗi có phải là số (hoặc số kèm chữ g, gam, gr) không
export function isNumericWeight(str: string): boolean {
  const clean = str.trim().toLowerCase();
  return /^(\d+([.,]\d+)?)\s*(g|gam|gr)?$/i.test(clean);
}

export function getNumericGramValue(str: string): string {
  const clean = str.trim().toLowerCase();
  const match = clean.match(/^(\d+([.,]\d+)?)\s*(g|gam|gr)?$/i);
  if (match) {
    return match[1].replace(',', '.');
  }
  return str.trim();
}

// Hàm định dạng số g sống và số g chín / đơn vị thường dùng
// Luôn đảm bảo giá trị số có đơn vị g (VD: 32.5 -> 32.5g chín)
// Bỏ hoàn toàn các trường hợp hiển thị '0g' hoặc '0'
export function formatIngredientWeight(raw?: string | number, cooked?: string | number): string {
  const rawStr = raw !== undefined && raw !== null ? String(raw).trim() : '';
  const cookedStr = cooked !== undefined && cooked !== null ? String(cooked).trim() : '';

  const hasRaw = rawStr !== '' && rawStr !== '0' && rawStr !== '0g';
  const hasCooked = cookedStr !== '' && cookedStr !== '0' && cookedStr !== '0g';

  if (!hasRaw && !hasCooked) return '';

  let formattedRaw = '';
  if (hasRaw) {
    if (isNumericWeight(rawStr)) {
      const num = getNumericGramValue(rawStr);
      formattedRaw = `${num}g sống`;
    } else if (rawStr.toLowerCase().includes('sống')) {
      formattedRaw = rawStr;
    } else if (rawStr.toLowerCase().endsWith('g')) {
      formattedRaw = `${rawStr} sống`;
    } else {
      formattedRaw = rawStr;
    }
  }

  let formattedCooked = '';
  if (hasCooked) {
    if (isNumericWeight(cookedStr)) {
      const num = getNumericGramValue(cookedStr);
      formattedCooked = `${num}g chín`;
    } else if (cookedStr.toLowerCase().includes('chín')) {
      const match = cookedStr.trim().match(/^(\d+([.,]\d+)?)\s*chín$/i);
      if (match) {
        formattedCooked = `${match[1].replace(',', '.')}g chín`;
      } else {
        formattedCooked = cookedStr;
      }
    } else {
      // Đơn vị thường dùng dạng chữ (VD: 1 quả, 1 bát nhỏ, 2 lát...)
      formattedCooked = cookedStr;
    }
  }

  if (hasRaw && hasCooked) {
    return `${formattedRaw} → ${formattedCooked}`;
  }
  if (hasRaw) {
    return formattedRaw;
  }
  return formattedCooked;
}

// Seed data cho danh sách món ăn
export const SEED_DISHES = [
  // ==========================================
  // ===== CHẾ ĐỘ 1000 KCAL (250 - 350 - 100 - 300) =====
  // ==========================================

  // --- BỮA SÁNG (250 Kcal) ---
  {
    name: 'Cháo yến mạch sữa',
    calories: 250,
    meal: 'breakfast',
    dietType: '1000kcal',
    ingredients: [
      { name: 'Yến mạch', rawGrams: 50, cookedGrams: '1 bát nhỏ (150g)' },
      { name: 'Sữa tươi không đường', rawGrams: 100, cookedGrams: '100ml' },
      { name: 'Chuối', rawGrams: 60, cookedGrams: 'nửa quả' },
    ],
    cookingInstructions: 'Nấu yến mạch với sữa và 100ml nước trong 5 phút. Cho chuối thái lát lên trên. Ăn nóng.',
  },
  {
    name: 'Bánh mì nguyên cám trứng luộc',
    calories: 245,
    meal: 'breakfast',
    dietType: '1000kcal',
    ingredients: [
      { name: 'Bánh mì nguyên cám', rawGrams: 60, cookedGrams: '2 lát' },
      { name: 'Trứng gà', rawGrams: 60, cookedGrams: '1 quả luộc' },
      { name: 'Rau xà lách', rawGrams: 30, cookedGrams: 'vừa ăn' },
    ],
    cookingInstructions: 'Luộc trứng 8 phút. Kẹp trứng với rau vào bánh mì. Ăn kèm 1 ly nước ấm.',
  },
  {
    name: 'Phở bò ít mỡ',
    calories: 250,
    meal: 'breakfast',
    dietType: '1000kcal',
    ingredients: [
      { name: 'Bánh phở', rawGrams: 80, cookedGrams: '1 bát (160g)' },
      { name: 'Thịt bò nạc', rawGrams: 50, cookedGrams: '40g chín' },
      { name: 'Giá đỗ & hành', rawGrams: 30, cookedGrams: 'vừa ăn' },
    ],
    cookingInstructions: 'Chần bánh phở. Trụng thịt bò chín tới qua nước dùng trong. Chan nước dùng nóng.',
  },

  // --- BỮA TRƯA (350 Kcal - Chia 4-5 món) ---
  {
    name: 'Cơm gạo lứt huyết rồng',
    calories: 130,
    meal: 'lunch',
    dietType: '1000kcal',
    ingredients: [
      { name: 'Gạo lứt huyết rồng', rawGrams: 40, cookedGrams: '1 bát nhỏ (120g)' },
    ],
    cookingInstructions: 'Ngâm gạo lứt 30 phút, nấu chín dẻo.',
  },
  {
    name: 'Ức gà áp chảo sốt tiêu chanh',
    calories: 120,
    meal: 'lunch',
    dietType: '1000kcal',
    ingredients: [
      { name: 'Ức gà nạc', rawGrams: 90, cookedGrams: '70g chín' },
      { name: 'Dầu ô-liu', rawGrams: '', cookedGrams: 'nửa thìa cà phê' },
      { name: 'Tiêu & cốt chanh', rawGrams: '', cookedGrams: 'vừa ăn' },
    ],
    cookingInstructions: 'Ướp ức gà với chút tiêu, áp chảo chín vàng 2 mặt, vắt chanh thưởng thức.',
  },
  {
    name: 'Canh rau ngót nấu thịt nạc',
    calories: 40,
    meal: 'lunch',
    dietType: '1000kcal',
    ingredients: [
      { name: 'Rau ngót', rawGrams: 70, cookedGrams: '1 bát canh' },
      { name: 'Thịt băm nạc', rawGrams: 20, cookedGrams: '15g chín' },
    ],
    cookingInstructions: 'Nấu sôi nước, cho thịt băm và rau ngót vò nhẹ vào nấu chín, nêm nhạt.',
  },
  {
    name: 'Rau muống xào tỏi ít dầu',
    calories: 40,
    meal: 'lunch',
    dietType: '1000kcal',
    ingredients: [
      { name: 'Rau muống non', rawGrams: 100, cookedGrams: '1 đĩa nhỏ' },
      { name: 'Tỏi băm & dầu ô-liu', rawGrams: '', cookedGrams: '1 tép tỏi' },
    ],
    cookingInstructions: 'Luộc sơ rau muống rồi đảo nhanh với tỏi phi thơm, ít dầu.',
  },
  {
    name: 'Dưa chuột thái lát',
    calories: 20,
    meal: 'lunch',
    dietType: '1000kcal',
    ingredients: [
      { name: 'Dưa chuột tươi', rawGrams: 150, cookedGrams: '1 quả vừa' },
    ],
    cookingInstructions: 'Rửa sạch bằng nước muối loãng, gọt vỏ thái lát ăn tươi.',
  },
  {
    name: 'Cá hồi áp chảo măng tây (Set 4 món)',
    calories: 350,
    meal: 'lunch',
    dietType: '1000kcal',
    ingredients: [
      { name: 'Cá hồi Na Uy', rawGrams: 80, cookedGrams: '65g chín' },
      { name: 'Gạo lứt', rawGrams: 40, cookedGrams: '1 bát nhỏ' },
      { name: 'Măng tây', rawGrams: 60, cookedGrams: '50g chín' },
      { name: 'Canh bí xanh tôm', rawGrams: 80, cookedGrams: '1 bát' },
      { name: 'Cà chua bi', rawGrams: 40, cookedGrams: '4 quả' },
    ],
    cookingInstructions: 'Áp chảo cá hồi và măng tây. Ăn kèm cơm gạo lứt và canh bí xanh.',
  },

  // --- PHỤ CHIỀU (100 Kcal) ---
  {
    name: 'Táo xanh & Hạnh nhân',
    calories: 100,
    meal: 'snack',
    dietType: '1000kcal',
    ingredients: [
      { name: 'Táo xanh', rawGrams: 100, cookedGrams: '1 quả nhỏ' },
      { name: 'Hạt hạnh nhân', rawGrams: '', cookedGrams: '4 hạt' },
    ],
    cookingInstructions: 'Rửa sạch táo, ăn cùng 4 hạt hạnh nhân sấy.',
  },
  {
    name: 'Sữa chua không đường hạt chia',
    calories: 100,
    meal: 'snack',
    dietType: '1000kcal',
    ingredients: [
      { name: 'Sữa chua không đường', rawGrams: 100, cookedGrams: '1 hộp' },
      { name: 'Hạt chia hữu cơ', rawGrams: '', cookedGrams: '1 thìa cà phê' },
    ],
    cookingInstructions: 'Trộn hạt chia vào sữa chua, để 10 phút cho hạt nở đều.',
  },

  // --- BỮA TỐI (300 Kcal - Chia 4-5 món) ---
  {
    name: 'Khoai lang vàng hấp',
    calories: 100,
    meal: 'dinner',
    dietType: '1000kcal',
    ingredients: [
      { name: 'Khoai lang', rawGrams: 90, cookedGrams: '1 củ nhỏ' },
    ],
    cookingInstructions: 'Rửa sạch, hấp chín mềm khoảng 20 phút.',
  },
  {
    name: 'Tôm sú hấp sả gừng',
    calories: 110,
    meal: 'dinner',
    dietType: '1000kcal',
    ingredients: [
      { name: 'Tôm sú tươi', rawGrams: 100, cookedGrams: '4 con vừa (75g chín)' },
      { name: 'Sả & gừng', rawGrams: '', cookedGrams: 'vừa thơm' },
    ],
    cookingInstructions: 'Xếp tôm lên xửng cùng sả đập dập và gừng thái sợi, hấp 8 phút.',
  },
  {
    name: 'Canh bí đỏ thịt bằm',
    calories: 45,
    meal: 'dinner',
    dietType: '1000kcal',
    ingredients: [
      { name: 'Bí đỏ', rawGrams: 70, cookedGrams: '1 bát canh' },
      { name: 'Thịt nạc băm', rawGrams: 20, cookedGrams: '15g chín' },
    ],
    cookingInstructions: 'Nấu bí đỏ mềm với thịt băm, rắc hành ngò thơm.',
  },
  {
    name: 'Bông cải xanh luộc',
    calories: 30,
    meal: 'dinner',
    dietType: '1000kcal',
    ingredients: [
      { name: 'Bông cải xanh', rawGrams: 100, cookedGrams: '1 đĩa nhỏ' },
    ],
    cookingInstructions: 'Luộc bông cải xanh trong nước sôi 3-4 phút giữ độ giòn ngọt.',
  },
  {
    name: 'Salad dưa chuột cà chua bi',
    calories: 15,
    meal: 'dinner',
    dietType: '1000kcal',
    ingredients: [
      { name: 'Dưa chuột', rawGrams: 80, cookedGrams: 'nửa quả' },
      { name: 'Cà chua bi', rawGrams: 40, cookedGrams: '3-4 quả' },
    ],
    cookingInstructions: 'Trộn cùng nước cốt chanh và một chút muối tiêu.',
  },

  // ==========================================
  // ===== CHẾ ĐỘ 1200 KCAL (300 - 420 - 120 - 360) =====
  // ==========================================

  // --- BỮA SÁNG (300 Kcal) ---
  {
    name: 'Bánh mì nguyên cám + Trứng ốp la + Bơ',
    calories: 300,
    meal: 'breakfast',
    dietType: '1200kcal',
    ingredients: [
      { name: 'Bánh mì nguyên cám', rawGrams: 60, cookedGrams: '2 lát' },
      { name: 'Trứng gà', rawGrams: 60, cookedGrams: '1 quả ốp la' },
      { name: 'Quả bơ tươi', rawGrams: 40, cookedGrams: 'vài lát' },
      { name: 'Cà chua bi', rawGrams: 30, cookedGrams: '3 quả' },
    ],
    cookingInstructions: 'Áp chảo trứng với chút dầu ô-liu. Kẹp trứng, bơ và cà chua vào bánh mì nướng giòn.',
  },
  {
    name: 'Phở bò tái nạm dinh dưỡng',
    calories: 300,
    meal: 'breakfast',
    dietType: '1200kcal',
    ingredients: [
      { name: 'Bánh phở tươi', rawGrams: 100, cookedGrams: '1 tô (180g)' },
      { name: 'Thịt bò nạc', rawGrams: 70, cookedGrams: '55g chín' },
      { name: 'Hành hoa & giá đỗ', rawGrams: 40, cookedGrams: '1 nhúm' },
    ],
    cookingInstructions: 'Chần bánh phở nóng. Trụng thịt bò chín tới, chan nước hầm xương thanh ngọt.',
  },
  {
    name: 'Yến mạch sữa hạt & Hạt óc chó',
    calories: 300,
    meal: 'breakfast',
    dietType: '1200kcal',
    ingredients: [
      { name: 'Yến mạch cán dẹt', rawGrams: 55, cookedGrams: '1 bát' },
      { name: 'Sữa hạt hạnh nhân', rawGrams: 120, cookedGrams: '120ml' },
      { name: 'Quả óc chó', rawGrams: '', cookedGrams: '2 hạt' },
      { name: 'Quả việt quất / chuối', rawGrams: 40, cookedGrams: 'vài quả' },
    ],
    cookingInstructions: 'Nấu yến mạch với sữa hạt 5 phút. Thêm hạt óc chó và trái cây tươi.',
  },

  // --- BỮA TRƯA (420 Kcal - Chia 4-5 món) ---
  {
    name: 'Cơm gạo lứt huyết rồng',
    calories: 140,
    meal: 'lunch',
    dietType: '1200kcal',
    ingredients: [
      { name: 'Gạo lứt', rawGrams: 50, cookedGrams: '1 bát vừa (150g)' },
    ],
    cookingInstructions: 'Nấu cơm gạo lứt dẻo thơm, ăn khi còn ấm.',
  },
  {
    name: 'Thịt bò xào măng tây ít dầu',
    calories: 150,
    meal: 'lunch',
    dietType: '1200kcal',
    ingredients: [
      { name: 'Thịt thăn bò', rawGrams: 90, cookedGrams: '75g chín' },
      { name: 'Măng tây xanh', rawGrams: 70, cookedGrams: '50g chín' },
      { name: 'Tỏi băm & tiêu', rawGrams: '', cookedGrams: 'vừa ăn' },
    ],
    cookingInstructions: 'Thái mỏng thịt bò, xào nhanh lửa lớn với măng tây và tỏi phi.',
  },
  {
    name: 'Canh bí xanh nấu tôm tươi',
    calories: 45,
    meal: 'lunch',
    dietType: '1200kcal',
    ingredients: [
      { name: 'Bí xanh (bí đao)', rawGrams: 100, cookedGrams: '1 bát canh' },
      { name: 'Tôm nõn giã nhỏ', rawGrams: 25, cookedGrams: '20g chín' },
      { name: 'Hành hoa & ngò gai', rawGrams: '', cookedGrams: 'vừa ăn' },
    ],
    cookingInstructions: 'Xào sơ tôm, cho bí xanh vào nấu sôi 3 phút, nêm thanh nhẹ.',
  },
  {
    name: 'Đậu cove xào nấm đùi gà',
    calories: 55,
    meal: 'lunch',
    dietType: '1200kcal',
    ingredients: [
      { name: 'Đậu cove non', rawGrams: 80, cookedGrams: '1 đĩa nhỏ' },
      { name: 'Nấm đùi gà', rawGrams: 50, cookedGrams: '45g chín' },
      { name: 'Dầu ô-liu', rawGrams: '', cookedGrams: '1 thìa cà phê' },
    ],
    cookingInstructions: 'Xào nấm và đậu cove vừa chín tới giữ độ giòn ngọt.',
  },
  {
    name: 'Dưa chuột thái lát & Cà chua',
    calories: 30,
    meal: 'lunch',
    dietType: '1200kcal',
    ingredients: [
      { name: 'Dưa chuột', rawGrams: 150, cookedGrams: '1 quả vừa' },
      { name: 'Cà chua bi', rawGrams: 50, cookedGrams: '4 quả' },
    ],
    cookingInstructions: 'Rửa sạch, gọt vỏ thái lát ăn kèm bữa ăn.',
  },
  {
    name: 'Cá hồi áp chảo sốt bơ chanh (Set 5 món đầy đủ)',
    calories: 420,
    meal: 'lunch',
    dietType: '1200kcal',
    ingredients: [
      { name: 'Cá hồi Na Uy', rawGrams: 90, cookedGrams: '75g chín' },
      { name: 'Cơm gạo lứt', rawGrams: 45, cookedGrams: '1 bát con' },
      { name: 'Canh cải ngọt thịt nạc', rawGrams: 80, cookedGrams: '1 bát' },
      { name: 'Bông cải xanh & cà rốt', rawGrams: 80, cookedGrams: '1 đĩa' },
      { name: 'Dưa chuột', rawGrams: 100, cookedGrams: '1 quả' },
    ],
    cookingInstructions: 'Áp chảo cá hồi sốt bơ chanh, ăn kèm 4 món phụ dinh dưỡng cân bằng.',
  },

  // --- PHỤ CHIỀU (120 Kcal) ---
  {
    name: 'Sữa chua Hy Lạp + Hạt dẻ cười',
    calories: 120,
    meal: 'snack',
    dietType: '1200kcal',
    ingredients: [
      { name: 'Sữa chua Hy Lạp', rawGrams: 120, cookedGrams: '1 hũ' },
      { name: 'Hạt dẻ cười bóc vỏ', rawGrams: '', cookedGrams: '6 hạt' },
    ],
    cookingInstructions: 'Ăn sữa chua Hy Lạp kèm hạt dẻ cười để bổ sung đạm và chất béo tốt.',
  },
  {
    name: 'Chuối tiêu & Bơ đậu phộng',
    calories: 120,
    meal: 'snack',
    dietType: '1200kcal',
    ingredients: [
      { name: 'Chuối tiêu chín', rawGrams: 80, cookedGrams: '1 quả vừa' },
      { name: 'Bơ đậu phộng nguyên chất', rawGrams: '', cookedGrams: '1 thìa cà phê' },
    ],
    cookingInstructions: 'Cắt lát chuối và phết nhẹ bơ đậu phộng thưởng thức.',
  },

  // --- BỮA TỐI (360 Kcal - Chia 4-5 món) ---
  {
    name: 'Khoai lang Nhật hấp mật',
    calories: 120,
    meal: 'dinner',
    dietType: '1200kcal',
    ingredients: [
      { name: 'Khoai lang Nhật', rawGrams: 110, cookedGrams: '1 củ vừa' },
    ],
    cookingInstructions: 'Hấp chín mềm ngọt tự nhiên, không thêm đường.',
  },
  {
    name: 'Ức gà nướng thảo mộc',
    calories: 130,
    meal: 'dinner',
    dietType: '1200kcal',
    ingredients: [
      { name: 'Ức gà tươi', rawGrams: 100, cookedGrams: '80g chín' },
      { name: 'Lá hương thảo & dầu ô-liu', rawGrams: '', cookedGrams: 'vừa ăn' },
    ],
    cookingInstructions: 'Ướp ức gà với hương thảo và muối tiêu, nướng nồi chiên không dầu 15 phút.',
  },
  {
    name: 'Canh rong biển đậu phụ non',
    calories: 45,
    meal: 'dinner',
    dietType: '1200kcal',
    ingredients: [
      { name: 'Rong biển khô', rawGrams: 10, cookedGrams: '1 bát canh' },
      { name: 'Đậu phụ non', rawGrams: 60, cookedGrams: 'nửa bìa' },
      { name: 'Thịt nạc băm', rawGrams: 15, cookedGrams: '12g chín' },
    ],
    cookingInstructions: 'Nấu nước dùng ngọt thanh, cho rong biển và đậu phụ non vào đun sôi nhẹ.',
  },
  {
    name: 'Rau cải ngồng luộc chấm kho quẹt nhẹ',
    calories: 40,
    meal: 'dinner',
    dietType: '1200kcal',
    ingredients: [
      { name: 'Cải ngồng non', rawGrams: 120, cookedGrams: '1 đĩa' },
    ],
    cookingInstructions: 'Luộc cải ngồng vừa chín tới giữ màu xanh tươi.',
  },
  {
    name: 'Dưa chuột thái lát tươi',
    calories: 25,
    meal: 'dinner',
    dietType: '1200kcal',
    ingredients: [
      { name: 'Dưa chuột', rawGrams: 150, cookedGrams: '1 quả' },
    ],
    cookingInstructions: 'Rửa sạch thái lát ăn kèm bữa tối thanh nhẹ.',
  },
  {
    name: 'Tôm sú rim mặn ngọt & Rau luộc (Set 5 món)',
    calories: 360,
    meal: 'dinner',
    dietType: '1200kcal',
    ingredients: [
      { name: 'Tôm sú', rawGrams: 110, cookedGrams: '85g chín' },
      { name: 'Cơm gạo lứt', rawGrams: 40, cookedGrams: '1 bát nhỏ' },
      { name: 'Canh bí đỏ thịt bằm', rawGrams: 80, cookedGrams: '1 bát' },
      { name: 'Bông cải luộc', rawGrams: 80, cookedGrams: '1 đĩa' },
      { name: 'Dưa chuột', rawGrams: 100, cookedGrams: '1 quả' },
    ],
    cookingInstructions: 'Tôm rim nhạt, ăn kèm cơm gạo lứt, canh bí đỏ và rau xanh.',
  },
];

export const MEAL_LABELS: Record<string, string> = {
  breakfast: 'Bữa Sáng',
  lunch: 'Bữa Trưa',
  snack: 'Phụ Chiều',
  dinner: 'Bữa Tối',
};

// Cấu hình định mức calo theo bữa
// Chế độ 1200 Kcal: 4 bữa chuẩn 300 - 420 - 120 - 360 (Theo YH TDTT)
export const MEAL_CALORIES: Record<string, Record<string, number>> = {
  '1000kcal': {
    breakfast: 250,
    lunch: 350,
    snack: 100,
    dinner: 300,
  },
  '1200kcal': {
    breakfast: 300,
    lunch: 420,
    snack: 120,
    dinner: 360,
  },
};

export const MEAL_ORDER = ['breakfast', 'lunch', 'snack', 'dinner'];

export const DAY_LABELS = ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'];
export const DAY_FULL_LABELS = ['Chủ nhật', 'Thứ 2', 'Thứ 3', 'Thứ 4', 'Thứ 5', 'Thứ 6', 'Thứ 7'];
