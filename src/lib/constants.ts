import { Dish, DishComponent, Ingredient } from '@/types';

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

// Gom nhóm nguyên liệu theo từng món con (dishComponents)
export function getDishComponents(dish: Partial<Dish>): DishComponent[] {
  if (dish.dishComponents && dish.dishComponents.length > 0) {
    return dish.dishComponents;
  }

  if (!dish.ingredients || dish.ingredients.length === 0) {
    return [];
  }

  // Nếu nguyên liệu có trường dishComponent
  const hasNamedComponent = dish.ingredients.some((ing) => ing.dishComponent && ing.dishComponent.trim());
  if (hasNamedComponent) {
    const map = new Map<string, Ingredient[]>();
    for (const ing of dish.ingredients) {
      const compName = ing.dishComponent && ing.dishComponent.trim() ? ing.dishComponent.trim() : 'Món thành phần';
      if (!map.has(compName)) {
        map.set(compName, []);
      }
      map.get(compName)!.push(ing);
    }
    return Array.from(map.entries()).map(([dishName, ingredients]) => ({
      dishName,
      ingredients,
    }));
  }

  // Mặc định gom tất cả vào một khối
  return [
    {
      dishName: dish.name || 'Thành phần món',
      ingredients: dish.ingredients,
    },
  ];
}

export const DISH_CATEGORIES = {
  family: 'Món cơm gia đình',
  eatclean: 'Món ăn eatclean',
} as const;

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

// =========================================================================
// SEED DATA MẪU: ĐẦY ĐỦ 2 NHÓM: "MÓN CƠM GIA ĐÌNH" VÀ "MÓN ĂN EATCLEAN"
// ĐỊNH LƯỢNG ĐƯỢC CHIA RÕ RÀNG THEO TỪNG MÓN CON TRONG SET BỮA ĂN
// =========================================================================
export const SEED_DISHES = [
  // ===================================================
  // NHÓM 1: MÓN CƠM GIA ĐÌNH (1000 Kcal & 1200 Kcal)
  // ===================================================
  {
    name: 'Phở bò tái nạm gia truyền, quẩy mềm',
    calories: 250,
    meal: 'breakfast',
    dietType: '1000kcal',
    category: 'family',
    dishComponents: [
      {
        dishName: 'Phở bò gia truyền',
        ingredients: [
          { name: 'Bánh phở tươi', rawGrams: 80, cookedGrams: '1 bát vừa (160g)' },
          { name: 'Thịt bò tái nạc', rawGrams: 50, cookedGrams: '40g chín' },
          { name: 'Hành hoa, giá đỗ, rau mùi', rawGrams: 30, cookedGrams: 'vừa ăn' },
        ],
      },
    ],
    ingredients: [
      { name: 'Bánh phở tươi', rawGrams: 80, cookedGrams: '1 bát vừa (160g)', dishComponent: 'Phở bò gia truyền' },
      { name: 'Thịt bò tái nạc', rawGrams: 50, cookedGrams: '40g chín', dishComponent: 'Phở bò gia truyền' },
      { name: 'Hành hoa, giá đỗ, rau mùi', rawGrams: 30, cookedGrams: 'vừa ăn', dishComponent: 'Phở bò gia truyền' },
    ],
    cookingInstructions: 'Chần bánh phở nóng. Trụng thịt bò tái chín tới qua nước dùng hầm xương ngọt thanh. Rắc hành ngò thơm.',
  },
  {
    name: 'Bún sườn chua dọc mùng gia đình',
    calories: 300,
    meal: 'breakfast',
    dietType: '1200kcal',
    category: 'family',
    dishComponents: [
      {
        dishName: 'Bún sườn chua dọc mùng',
        ingredients: [
          { name: 'Bún tươi', rawGrams: 100, cookedGrams: '1 bát' },
          { name: 'Sườn thăn nạc', rawGrams: 70, cookedGrams: '55g chín' },
          { name: 'Dọc mùng & cà chua', rawGrams: 60, cookedGrams: 'vừa ăn' },
        ],
      },
    ],
    ingredients: [
      { name: 'Bún tươi', rawGrams: 100, cookedGrams: '1 bát', dishComponent: 'Bún sườn chua dọc mùng' },
      { name: 'Sườn thăn nạc', rawGrams: 70, cookedGrams: '55g chín', dishComponent: 'Bún sườn chua dọc mùng' },
      { name: 'Dọc mùng & cà chua', rawGrams: 60, cookedGrams: 'vừa ăn', dishComponent: 'Bún sườn chua dọc mùng' },
    ],
    cookingInstructions: 'Hầm sườn lấy nước ngọt. Tước vỏ dọc mùng, bóp muối rửa sạch. Nấu canh chua thanh mát chan bún.',
  },

  // BỮA TRƯA CƠM GIA ĐÌNH (Ví dụ điển hình theo yêu cầu của bạn)
  {
    name: 'Cơm trắng, bầu nhồi tôm thịt hấp, canh rau ngót, bưởi da xanh',
    calories: 350,
    meal: 'lunch',
    dietType: '1000kcal',
    category: 'family',
    dishComponents: [
      {
        dishName: 'Cơm trắng',
        ingredients: [
          { name: 'Gạo tẻ ngon', rawGrams: 45, cookedGrams: '1 bát nhỏ (130g)' },
        ],
      },
      {
        dishName: 'Bầu nhồi tôm thịt hấp',
        ingredients: [
          { name: 'Bầu tươi', rawGrams: 120, cookedGrams: '100g chín' },
          { name: 'Tôm biển tươi bóc nõn', rawGrams: 50, cookedGrams: '40g chín' },
          { name: 'Thịt lợn nạc băm', rawGrams: 40, cookedGrams: '32.5g chín' },
          { name: 'Mộc nhĩ, hành hoa, tiêu', rawGrams: '', cookedGrams: 'vừa ăn' },
        ],
      },
      {
        dishName: 'Canh rau ngót nấu nước luộc thịt',
        ingredients: [
          { name: 'Rau ngót', rawGrams: 80, cookedGrams: '1 bát canh' },
        ],
      },
      {
        dishName: 'Bưởi da xanh tráng miệng',
        ingredients: [
          { name: 'Bưởi da xanh', rawGrams: 100, cookedGrams: '2 múi' },
        ],
      },
    ],
    ingredients: [
      { name: 'Gạo tẻ ngon', rawGrams: 45, cookedGrams: '1 bát nhỏ (130g)', dishComponent: 'Cơm trắng' },
      { name: 'Bầu tươi', rawGrams: 120, cookedGrams: '100g chín', dishComponent: 'Bầu nhồi tôm thịt hấp' },
      { name: 'Tôm biển tươi bóc nõn', rawGrams: 50, cookedGrams: '40g chín', dishComponent: 'Bầu nhồi tôm thịt hấp' },
      { name: 'Thịt lợn nạc băm', rawGrams: 40, cookedGrams: '32.5g chín', dishComponent: 'Bầu nhồi tôm thịt hấp' },
      { name: 'Mộc nhĩ, hành hoa, tiêu', rawGrams: '', cookedGrams: 'vừa ăn', dishComponent: 'Bầu nhồi tôm thịt hấp' },
      { name: 'Rau ngót', rawGrams: 80, cookedGrams: '1 bát canh', dishComponent: 'Canh rau ngót nấu nước luộc thịt' },
      { name: 'Bưởi da xanh', rawGrams: 100, cookedGrams: '2 múi', dishComponent: 'Bưởi da xanh tráng miệng' },
    ],
    cookingInstructions: 'Bầu cắt khúc khoét ruột. Trộn tôm băm, thịt lợn nạc cùng mộc nhĩ nêm chút muối tiêu, nhồi vào khúc bầu rồi hấp cách thủy 15 phút. Nấu canh rau ngót thanh mát. Ăn cùng cơm trắng và tráng miệng bưởi.',
  },
  {
    name: 'Cơm trắng, thịt bò xào đậu cove, canh cải ngọt thịt bằm, dưa hấu',
    calories: 420,
    meal: 'lunch',
    dietType: '1200kcal',
    category: 'family',
    dishComponents: [
      {
        dishName: 'Cơm trắng',
        ingredients: [
          { name: 'Gạo tẻ tám xoan', rawGrams: 55, cookedGrams: '1 bát vừa (160g)' },
        ],
      },
      {
        dishName: 'Thịt bò xào đậu cove',
        ingredients: [
          { name: 'Thịt thăn bò', rawGrams: 90, cookedGrams: '75g chín' },
          { name: 'Đậu cove non', rawGrams: 90, cookedGrams: '80g chín' },
          { name: 'Tỏi băm & dầu ăn thực vật', rawGrams: 3, cookedGrams: 'nửa thìa cà phê' },
        ],
      },
      {
        dishName: 'Canh cải ngọt thịt bằm',
        ingredients: [
          { name: 'Rau cải ngọt', rawGrams: 80, cookedGrams: '1 bát canh' },
          { name: 'Thịt lợn nạc băm', rawGrams: 20, cookedGrams: '15g chín' },
        ],
      },
      {
        dishName: 'Dưa hấu tráng miệng',
        ingredients: [
          { name: 'Dưa hấu đỏ', rawGrams: 120, cookedGrams: '1 miếng vừa' },
        ],
      },
    ],
    ingredients: [
      { name: 'Gạo tẻ tám xoan', rawGrams: 55, cookedGrams: '1 bát vừa (160g)', dishComponent: 'Cơm trắng' },
      { name: 'Thịt thăn bò', rawGrams: 90, cookedGrams: '75g chín', dishComponent: 'Thịt bò xào đậu cove' },
      { name: 'Đậu cove non', rawGrams: 90, cookedGrams: '80g chín', dishComponent: 'Thịt bò xào đậu cove' },
      { name: 'Tỏi băm & dầu ăn thực vật', rawGrams: 3, cookedGrams: 'nửa thìa cà phê', dishComponent: 'Thịt bò xào đậu cove' },
      { name: 'Rau cải ngọt', rawGrams: 80, cookedGrams: '1 bát canh', dishComponent: 'Canh cải ngọt thịt bằm' },
      { name: 'Thịt lợn nạc băm', rawGrams: 20, cookedGrams: '15g chín', dishComponent: 'Canh cải ngọt thịt bằm' },
      { name: 'Dưa hấu đỏ', rawGrams: 120, cookedGrams: '1 miếng vừa', dishComponent: 'Dưa hấu tráng miệng' },
    ],
    cookingInstructions: 'Thịt bò thái mỏng ướp tỏi. Đậu cove tước xơ, xào nhanh lửa lớn với thịt bò giữ độ giòn ngọt. Nấu canh cải thịt băm.',
  },

  // PHỤ CHIỀU CƠM GIA ĐÌNH
  {
    name: 'Chè hạt sen long nhãn ít ngọt',
    calories: 100,
    meal: 'snack',
    dietType: '1000kcal',
    category: 'family',
    dishComponents: [
      {
        dishName: 'Chè hạt sen thanh mát',
        ingredients: [
          { name: 'Hạt sen tươi', rawGrams: 30, cookedGrams: '1 chén nhỏ' },
          { name: 'Long nhãn Hưng Yên', rawGrams: 15, cookedGrams: '4-5 quả' },
        ],
      },
    ],
    ingredients: [
      { name: 'Hạt sen tươi', rawGrams: 30, cookedGrams: '1 chén nhỏ', dishComponent: 'Chè hạt sen thanh mát' },
      { name: 'Long nhãn Hưng Yên', rawGrams: 15, cookedGrams: '4-5 quả', dishComponent: 'Chè hạt sen thanh mát' },
    ],
    cookingInstructions: 'Hầm hạt sen chín bở, lồng vào long nhãn, nấu ngọt thanh mát giải nhiệt.',
  },
  {
    name: 'Sữa đậu nành nguyên chất & Hạt hạnh nhân',
    calories: 120,
    meal: 'snack',
    dietType: '1200kcal',
    category: 'family',
    dishComponents: [
      {
        dishName: 'Đồ uống phụ chiều',
        ingredients: [
          { name: 'Sữa đậu nành không đường', rawGrams: 150, cookedGrams: '1 cốc (150ml)' },
          { name: 'Hạnh nhân rang mộc', rawGrams: '', cookedGrams: '5 hạt' },
        ],
      },
    ],
    ingredients: [
      { name: 'Sữa đậu nành không đường', rawGrams: 150, cookedGrams: '1 cốc (150ml)', dishComponent: 'Đồ uống phụ chiều' },
      { name: 'Hạnh nhân rang mộc', rawGrams: '', cookedGrams: '5 hạt', dishComponent: 'Đồ uống phụ chiều' },
    ],
    cookingInstructions: 'Uống sữa đậu nành ấm kèm hạnh nhân sấy giòn.',
  },

  // BỮA TỐI CƠM GIA ĐÌNH
  {
    name: 'Cơm trắng, cá quả kho tộ, canh cua mồng tơi, dưa leo',
    calories: 300,
    meal: 'dinner',
    dietType: '1000kcal',
    category: 'family',
    dishComponents: [
      {
        dishName: 'Cơm trắng',
        ingredients: [
          { name: 'Gạo tẻ', rawGrams: 40, cookedGrams: '1 bát con (120g)' },
        ],
      },
      {
        dishName: 'Cá quả kho tộ tiêu gừng',
        ingredients: [
          { name: 'Cá quả (cá lóc) phi lê nạc', rawGrams: 90, cookedGrams: '70g chín' },
          { name: 'Nước mắm ngon, tiêu, gừng', rawGrams: '', cookedGrams: 'vừa ăn' },
        ],
      },
      {
        dishName: 'Canh cua đồng mồng tơi mướp hương',
        ingredients: [
          { name: 'Cua đồng giã lọc nước', rawGrams: 50, cookedGrams: '1 bát canh' },
          { name: 'Rau mồng tơi & mướp', rawGrams: 70, cookedGrams: 'vừa ăn' },
        ],
      },
      {
        dishName: 'Dưa leo thái lát',
        ingredients: [
          { name: 'Dưa leo giòn', rawGrams: 100, cookedGrams: '1 quả' },
        ],
      },
    ],
    ingredients: [
      { name: 'Gạo tẻ', rawGrams: 40, cookedGrams: '1 bát con (120g)', dishComponent: 'Cơm trắng' },
      { name: 'Cá quả (cá lóc) phi lê nạc', rawGrams: 90, cookedGrams: '70g chín', dishComponent: 'Cá quả kho tộ tiêu gừng' },
      { name: 'Nước mắm ngon, tiêu, gừng', rawGrams: '', cookedGrams: 'vừa ăn', dishComponent: 'Cá quả kho tộ tiêu gừng' },
      { name: 'Cua đồng giã lọc nước', rawGrams: 50, cookedGrams: '1 bát canh', dishComponent: 'Canh cua đồng mồng tơi mướp hương' },
      { name: 'Rau mồng tơi & mướp', rawGrams: 70, cookedGrams: 'vừa ăn', dishComponent: 'Canh cua đồng mồng tơi mướp hương' },
      { name: 'Dưa leo giòn', rawGrams: 100, cookedGrams: '1 quả', dishComponent: 'Dưa leo thái lát' },
    ],
    cookingInstructions: 'Kho cá quả nhỏ lửa với tiêu và ớt gừng keo lại thơm lừng. Nấu canh cua mồng tơi mướp thanh mát.',
  },
  {
    name: 'Cơm trắng, tôm sú rim mặn ngọt, rau muống luộc, nước canh chanh',
    calories: 360,
    meal: 'dinner',
    dietType: '1200kcal',
    category: 'family',
    dishComponents: [
      {
        dishName: 'Cơm trắng',
        ingredients: [
          { name: 'Gạo tẻ', rawGrams: 45, cookedGrams: '1 bát vừa (135g)' },
        ],
      },
      {
        dishName: 'Tôm sú rim mặn ngọt',
        ingredients: [
          { name: 'Tôm sú tươi', rawGrams: 100, cookedGrams: '80g chín' },
          { name: 'Hành khô & chút nước mắm', rawGrams: '', cookedGrams: 'vừa ăn' },
        ],
      },
      {
        dishName: 'Rau muống luộc',
        ingredients: [
          { name: 'Rau muống non', rawGrams: 120, cookedGrams: '1 đĩa' },
        ],
      },
      {
        dishName: 'Nước canh rau muống dầm sấu/chanh',
        ingredients: [
          { name: 'Nước luộc rau dầm chanh/sấu', rawGrams: '', cookedGrams: '1 bát canh' },
        ],
      },
    ],
    ingredients: [
      { name: 'Gạo tẻ', rawGrams: 45, cookedGrams: '1 bát vừa (135g)', dishComponent: 'Cơm trắng' },
      { name: 'Tôm sú tươi', rawGrams: 100, cookedGrams: '80g chín', dishComponent: 'Tôm sú rim mặn ngọt' },
      { name: 'Hành khô & chút nước mắm', rawGrams: '', cookedGrams: 'vừa ăn', dishComponent: 'Tôm sú rim mặn ngọt' },
      { name: 'Rau muống non', rawGrams: 120, cookedGrams: '1 đĩa', dishComponent: 'Rau muống luộc' },
      { name: 'Nước luộc rau dầm chanh/sấu', rawGrams: '', cookedGrams: '1 bát canh', dishComponent: 'Nước canh rau muống dầm sấu/chanh' },
    ],
    cookingInstructions: 'Luộc rau muống chín tới vớt ra đĩa, nước canh dầm sấu hoặc vắt chanh. Tôm rim vừa ăn ăn kèm cơm trắng.',
  },

  // ===================================================
  // NHÓM 2: MÓN ĂN EATCLEAN (1000 Kcal & 1200 Kcal)
  // ===================================================
  {
    name: 'Bánh mì nguyên cám kẹp trứng ốp la & bơ tươi',
    calories: 250,
    meal: 'breakfast',
    dietType: '1000kcal',
    category: 'eatclean',
    dishComponents: [
      {
        dishName: 'Bánh mì sandwich bơ trứng',
        ingredients: [
          { name: 'Bánh mì nguyên cám', rawGrams: 50, cookedGrams: '2 lát' },
          { name: 'Trứng gà ta', rawGrams: 55, cookedGrams: '1 quả ốp la' },
          { name: 'Quả bơ sáp 034', rawGrams: 30, cookedGrams: 'vài lát' },
          { name: 'Cà chua bi & xà lách', rawGrams: 30, cookedGrams: 'vừa ăn' },
        ],
      },
    ],
    ingredients: [
      { name: 'Bánh mì nguyên cám', rawGrams: 50, cookedGrams: '2 lát', dishComponent: 'Bánh mì sandwich bơ trứng' },
      { name: 'Trứng gà ta', rawGrams: 55, cookedGrams: '1 quả ốp la', dishComponent: 'Bánh mì sandwich bơ trứng' },
      { name: 'Quả bơ sáp 034', rawGrams: 30, cookedGrams: 'vài lát', dishComponent: 'Bánh mì sandwich bơ trứng' },
      { name: 'Cà chua bi & xà lách', rawGrams: 30, cookedGrams: 'vừa ăn', dishComponent: 'Bánh mì sandwich bơ trứng' },
    ],
    cookingInstructions: 'Áp chảo trứng bằng chảo chống dính. Kẹp trứng, bơ và xà lách vào bánh mì nướng giòn.',
  },
  {
    name: 'Yến mạch cán dẹt nấu sữa hạt hạnh nhân & hoa quả',
    calories: 300,
    meal: 'breakfast',
    dietType: '1200kcal',
    category: 'eatclean',
    dishComponents: [
      {
        dishName: 'Bát yến mạch sữa hạt',
        ingredients: [
          { name: 'Yến mạch cán dẹt hữu cơ', rawGrams: 55, cookedGrams: '1 bát nhỏ' },
          { name: 'Sữa hạt hạnh nhân không đường', rawGrams: 120, cookedGrams: '120ml' },
          { name: 'Hạt óc chó & việt quất', rawGrams: 30, cookedGrams: 'vừa ăn' },
        ],
      },
    ],
    ingredients: [
      { name: 'Yến mạch cán dẹt hữu cơ', rawGrams: 55, cookedGrams: '1 bát nhỏ', dishComponent: 'Bát yến mạch sữa hạt' },
      { name: 'Sữa hạt hạnh nhân không đường', rawGrams: 120, cookedGrams: '120ml', dishComponent: 'Bát yến mạch sữa hạt' },
      { name: 'Hạt óc chó & việt quất', rawGrams: 30, cookedGrams: 'vừa ăn', dishComponent: 'Bát yến mạch sữa hạt' },
    ],
    cookingInstructions: 'Nấu yến mạch cùng sữa hạt trong 5 phút. Trang trí hạt óc chó và trái cây tươi.',
  },

  // BỮA TRƯA EATCLEAN
  {
    name: 'Cơm gạo lứt, ức gà áp chảo sốt tiêu, súp lơ xanh hấp, cà chua bi',
    calories: 350,
    meal: 'lunch',
    dietType: '1000kcal',
    category: 'eatclean',
    dishComponents: [
      {
        dishName: 'Cơm gạo lứt huyết rồng',
        ingredients: [
          { name: 'Gạo lứt đỏ', rawGrams: 40, cookedGrams: '1 bát con (120g)' },
        ],
      },
      {
        dishName: 'Ức gà áp chảo tiêu chanh',
        ingredients: [
          { name: 'Ức gà nạc không da', rawGrams: 90, cookedGrams: '70g chín' },
          { name: 'Dầu ô liu extra virgin', rawGrams: 2, cookedGrams: 'vài giọt' },
          { name: 'Tiêu đen & nước cốt chanh', rawGrams: '', cookedGrams: 'vừa ăn' },
        ],
      },
      {
        dishName: 'Súp lơ xanh hấp giòn',
        ingredients: [
          { name: 'Súp lơ xanh (bông cải)', rawGrams: 100, cookedGrams: '85g chín' },
        ],
      },
      {
        dishName: 'Cà chua bi tươi',
        ingredients: [
          { name: 'Cà chua bi', rawGrams: 50, cookedGrams: '4-5 quả' },
        ],
      },
    ],
    ingredients: [
      { name: 'Gạo lứt đỏ', rawGrams: 40, cookedGrams: '1 bát con (120g)', dishComponent: 'Cơm gạo lứt huyết rồng' },
      { name: 'Ức gà nạc không da', rawGrams: 90, cookedGrams: '70g chín', dishComponent: 'Ức gà áp chảo tiêu chanh' },
      { name: 'Dầu ô liu extra virgin', rawGrams: 2, cookedGrams: 'vài giọt', dishComponent: 'Ức gà áp chảo tiêu chanh' },
      { name: 'Tiêu đen & nước cốt chanh', rawGrams: '', cookedGrams: 'vừa ăn', dishComponent: 'Ức gà áp chảo tiêu chanh' },
      { name: 'Súp lơ xanh (bông cải)', rawGrams: 100, cookedGrams: '85g chín', dishComponent: 'Súp lơ xanh hấp giòn' },
      { name: 'Cà chua bi', rawGrams: 50, cookedGrams: '4-5 quả', dishComponent: 'Cà chua bi tươi' },
    ],
    cookingInstructions: 'Áp chảo ức gà với chút tiêu và dầu ô liu. Hấp súp lơ xanh 3 phút. Ăn cùng cơm gạo lứt dẻo thơm.',
  },
  {
    name: 'Cá hồi áp chảo sốt bơ chanh, khoai lang nướng, măng tây, salad xà lách',
    calories: 420,
    meal: 'lunch',
    dietType: '1200kcal',
    category: 'eatclean',
    dishComponents: [
      {
        dishName: 'Khoai lang nướng',
        ingredients: [
          { name: 'Khoai lang vàng Nhật', rawGrams: 100, cookedGrams: '1 củ nhỏ' },
        ],
      },
      {
        dishName: 'Cá hồi áp chảo sốt bơ chanh',
        ingredients: [
          { name: 'Cá hồi Na Uy phi lê', rawGrams: 90, cookedGrams: '75g chín' },
          { name: 'Dầu ô liu & lá thì là', rawGrams: 3, cookedGrams: 'vừa ăn' },
        ],
      },
      {
        dishName: 'Măng tây xanh áp chảo',
        ingredients: [
          { name: 'Măng tây xanh non', rawGrams: 70, cookedGrams: '55g chín' },
        ],
      },
      {
        dishName: 'Salad xà lách dưa chuột',
        ingredients: [
          { name: 'Rau xà lách & dưa leo', rawGrams: 80, cookedGrams: '1 đĩa nhỏ' },
        ],
      },
    ],
    ingredients: [
      { name: 'Khoai lang vàng Nhật', rawGrams: 100, cookedGrams: '1 củ nhỏ', dishComponent: 'Khoai lang nướng' },
      { name: 'Cá hồi Na Uy phi lê', rawGrams: 90, cookedGrams: '75g chín', dishComponent: 'Cá hồi áp chảo sốt bơ chanh' },
      { name: 'Dầu ô liu & lá thì là', rawGrams: 3, cookedGrams: 'vừa ăn', dishComponent: 'Cá hồi áp chảo sốt bơ chanh' },
      { name: 'Măng tây xanh non', rawGrams: 70, cookedGrams: '55g chín', dishComponent: 'Măng tây xanh áp chảo' },
      { name: 'Rau xà lách & dưa leo', rawGrams: 80, cookedGrams: '1 đĩa nhỏ', dishComponent: 'Salad xà lách dưa chuột' },
    ],
    cookingInstructions: 'Ướp cá hồi với chút muối tiêu và nước cốt chanh. Áp chảo cá hồi và măng tây với dầu ô liu.',
  },

  // PHỤ CHIỀU EATCLEAN
  {
    name: 'Táo xanh & Hạt hạnh nhân sấy mộc',
    calories: 100,
    meal: 'snack',
    dietType: '1000kcal',
    category: 'eatclean',
    dishComponents: [
      {
        dishName: 'Bữa phụ nhẹ nhàng',
        ingredients: [
          { name: 'Táo xanh giòn', rawGrams: 100, cookedGrams: '1 quả nhỏ' },
          { name: 'Hạt hạnh nhân sấy', rawGrams: '', cookedGrams: '4 hạt' },
        ],
      },
    ],
    ingredients: [
      { name: 'Táo xanh giòn', rawGrams: 100, cookedGrams: '1 quả nhỏ', dishComponent: 'Bữa phụ nhẹ nhàng' },
      { name: 'Hạt hạnh nhân sấy', rawGrams: '', cookedGrams: '4 hạt', dishComponent: 'Bữa phụ nhẹ nhàng' },
    ],
    cookingInstructions: 'Ăn táo tươi kèm hạt hạnh nhân nguyên vị.',
  },
  {
    name: 'Sữa chua Hy Lạp + Hạt chia + Quả mọng',
    calories: 120,
    meal: 'snack',
    dietType: '1200kcal',
    category: 'eatclean',
    dishComponents: [
      {
        dishName: 'Bát sữa chua Hy Lạp',
        ingredients: [
          { name: 'Sữa chua Hy Lạp nguyên chất', rawGrams: 100, cookedGrams: '1 hộp' },
          { name: 'Hạt chia hữu cơ', rawGrams: '', cookedGrams: '1 thìa cà phê' },
          { name: 'Quả việt quất tươi', rawGrams: 30, cookedGrams: 'vài quả' },
        ],
      },
    ],
    ingredients: [
      { name: 'Sữa chua Hy Lạp nguyên chất', rawGrams: 100, cookedGrams: '1 hộp', dishComponent: 'Bát sữa chua Hy Lạp' },
      { name: 'Hạt chia hữu cơ', rawGrams: '', cookedGrams: '1 thìa cà phê', dishComponent: 'Bát sữa chua Hy Lạp' },
      { name: 'Quả việt quất tươi', rawGrams: 30, cookedGrams: 'vài quả', dishComponent: 'Bát sữa chua Hy Lạp' },
    ],
    cookingInstructions: 'Khuấy đều hạt chia vào sữa chua Hy Lạp, rắc việt quất lên trên thưởng thức.',
  },

  // BỮA TỐI EATCLEAN
  {
    name: 'Salad cá ngừ ngô ngọt, bắp cải tím, trứng luộc',
    calories: 300,
    meal: 'dinner',
    dietType: '1000kcal',
    category: 'eatclean',
    dishComponents: [
      {
        dishName: 'Salad cá ngừ bắp cải tím',
        ingredients: [
          { name: 'Cá ngừ đóng hộp ngâm nước', rawGrams: 80, cookedGrams: '80g' },
          { name: 'Trứng gà luộc', rawGrams: 55, cookedGrams: '1 quả' },
          { name: 'Bắp cải tím & ngô ngọt', rawGrams: 80, cookedGrams: '1 đĩa' },
          { name: 'Sốt sữa chua tỏi chanh', rawGrams: 20, cookedGrams: '2 thìa' },
        ],
      },
    ],
    ingredients: [
      { name: 'Cá ngừ đóng hộp ngâm nước', rawGrams: 80, cookedGrams: '80g', dishComponent: 'Salad cá ngừ bắp cải tím' },
      { name: 'Trứng gà luộc', rawGrams: 55, cookedGrams: '1 quả', dishComponent: 'Salad cá ngừ bắp cải tím' },
      { name: 'Bắp cải tím & ngô ngọt', rawGrams: 80, cookedGrams: '1 đĩa', dishComponent: 'Salad cá ngừ bắp cải tím' },
      { name: 'Sốt sữa chua tỏi chanh', rawGrams: 20, cookedGrams: '2 thìa', dishComponent: 'Salad cá ngừ bắp cải tím' },
    ],
    cookingInstructions: 'Trộn cá ngừ ráo nước cùng rau củ, cắt trứng luộc làm 4, chan sốt sữa chua thanh nhẹ.',
  },
  {
    name: 'Tôm hấp sả gừng, khoai lang hấp, canh bí đỏ, đỗ que luộc',
    calories: 360,
    meal: 'dinner',
    dietType: '1200kcal',
    category: 'eatclean',
    dishComponents: [
      {
        dishName: 'Khoai lang hấp',
        ingredients: [
          { name: 'Khoai lang tím', rawGrams: 90, cookedGrams: '1 củ vừa' },
        ],
      },
      {
        dishName: 'Tôm sú hấp sả gừng',
        ingredients: [
          { name: 'Tôm sú tươi', rawGrams: 100, cookedGrams: '75g chín' },
          { name: 'Sả & gừng tươi', rawGrams: '', cookedGrams: 'vừa thơm' },
        ],
      },
      {
        dishName: 'Canh bí đỏ nấu tôm băm',
        ingredients: [
          { name: 'Bí đỏ', rawGrams: 70, cookedGrams: '1 bát canh' },
          { name: 'Thịt tôm băm', rawGrams: 20, cookedGrams: '15g chín' },
        ],
      },
      {
        dishName: 'Đỗ que luộc giòn',
        ingredients: [
          { name: 'Đỗ que (đậu cove)', rawGrams: 80, cookedGrams: '70g chín' },
        ],
      },
    ],
    ingredients: [
      { name: 'Khoai lang tím', rawGrams: 90, cookedGrams: '1 củ vừa', dishComponent: 'Khoai lang hấp' },
      { name: 'Tôm sú tươi', rawGrams: 100, cookedGrams: '75g chín', dishComponent: 'Tôm sú hấp sả gừng' },
      { name: 'Sả & gừng tươi', rawGrams: '', cookedGrams: 'vừa thơm', dishComponent: 'Tôm sú hấp sả gừng' },
      { name: 'Bí đỏ', rawGrams: 70, cookedGrams: '1 bát canh', dishComponent: 'Canh bí đỏ nấu tôm băm' },
      { name: 'Thịt tôm băm', rawGrams: 20, cookedGrams: '15g chín', dishComponent: 'Canh bí đỏ nấu tôm băm' },
      { name: 'Đỗ que (đậu cove)', rawGrams: 80, cookedGrams: '70g chín', dishComponent: 'Đỗ que luộc giòn' },
    ],
    cookingInstructions: 'Hấp tôm cùng sả gừng thơm lừng. Hấp khoai lang và luộc đỗ que. Nấu canh bí đỏ thanh ngọt.',
  },
];
