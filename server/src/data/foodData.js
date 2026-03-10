const foodCalories = {
  dryFood: [
    { brand: '皇家', product: '室内成猫', caloriesPer100g: 350, protein: 31, fat: 12 },
    { brand: '皇家', product: '绝育成猫', caloriesPer100g: 370, protein: 37, fat: 12 },
    { brand: '渴望', product: '全猫粮', caloriesPer100g: 410, protein: 40, fat: 20 },
    { brand: '爱肯拿', product: '农场盛宴', caloriesPer100g: 380, protein: 35, fat: 17 },
    { brand: '巅峰', product: '风干牛肉', caloriesPer100g: 520, protein: 40, fat: 32 },
    { brand: '素力高', product: '金素猫粮', caloriesPer100g: 400, protein: 42, fat: 21 },
    { brand: '百利', product: '经典无谷', caloriesPer100g: 410, protein: 41, fat: 21 },
    { brand: '纽翠斯', product: '黑钻系列', caloriesPer100g: 420, protein: 40, fat: 22 },
    { brand: 'GO!', product: '九种肉', caloriesPer100g: 460, protein: 46, fat: 18 },
    { brand: '福摩', product: '三文鱼', caloriesPer100g: 380, protein: 36, fat: 18 },
    { brand: '美士', product: '全猫粮', caloriesPer100g: 360, protein: 32, fat: 15 },
    { brand: '雪诗雅', product: '无谷系列', caloriesPer100g: 400, protein: 38, fat: 19 },
    { brand: '蓝爵', product: '无谷成猫', caloriesPer100g: 380, protein: 34, fat: 16 },
    { brand: '希尔思', product: '成猫理想平衡', caloriesPer100g: 340, protein: 28, fat: 14 },
    { brand: '冠能', product: '成猫粮', caloriesPer100g: 360, protein: 30, fat: 15 }
  ],
  wetFood: [
    { name: '主食罐头', caloriesPer100g: 100, note: '因品牌而异' },
    { name: '妙鲜包', caloriesPer100g: 80, note: '约85g/包' }
  ],
  homemade: [
    { name: '鸡胸肉(熟)', caloriesPer100g: 165, note: '水煮无盐' },
    { name: '牛肉(熟)', caloriesPer100g: 250, note: '水煮无盐' },
    { name: '三文鱼(熟)', caloriesPer100g: 180, note: '水煮无盐' },
    { name: '蛋黄', caloriesPer100g: 320, note: '煮熟' },
    { name: '蛋白', caloriesPer100g: 52, note: '煮熟' }
  ],
  treats: [
    { name: '冻干鸡肉', caloriesPer100g: 450, note: '需复水' },
    { name: '冻干鹌鹑蛋', caloriesPer100g: 180 },
    { name: '猫条', caloriesPer100g: 150, note: '每条约15g，约22kcal' },
    { name: '肉干零食', caloriesPer100g: 350 },
    { name: '冻干小鱼干', caloriesPer100g: 380 }
  ],
  supplements: [
    { name: '营养膏', caloriesPerCm: 5, note: '每厘米约5kcal' },
    { name: '化毛膏', caloriesPerCm: 4, note: '每厘米约4kcal' }
  ]
};

function findFoodCalories(foodName, amount, unit = 'g') {
  const allFoods = [
    ...foodCalories.dryFood.map(f => ({ ...f, category: '干粮', name: `${f.brand} ${f.product}` })),
    ...foodCalories.wetFood.map(f => ({ ...f, category: '湿粮' })),
    ...foodCalories.homemade.map(f => ({ ...f, category: '自制' })),
    ...foodCalories.treats.map(f => ({ ...f, category: '零食' }))
  ];
  
  const normalizedInput = foodName.toLowerCase().replace(/\s+/g, '');
  
  let matchedFood = allFoods.find(f => {
    const foodNameNormalized = (f.name || `${f.brand} ${f.product}`).toLowerCase().replace(/\s+/g, '').replace(/\(.*?\)/g, '');
    const brandNormalized = f.brand?.toLowerCase().replace(/\s+/g, '');
    const productNormalized = f.product?.toLowerCase().replace(/\s+/g, '');
    
    return (
      foodNameNormalized.includes(normalizedInput) ||
      normalizedInput.includes(brandNormalized) ||
      normalizedInput.includes(productNormalized) ||
      normalizedInput.includes('猫粮') && foodNameNormalized.includes('猫')
    );
  });
  
  if (!matchedFood) {
    const defaultCalories = {
      '干粮': 380,
      '湿粮': 100,
      '自制': 200,
      '零食': 350
    };
    
    let category = '干粮';
    if (normalizedInput.includes('罐') || normalizedInput.includes('湿粮') || normalizedInput.includes('妙鲜包')) category = '湿粮';
    else if (normalizedInput.includes('鸡') || normalizedInput.includes('牛肉') || normalizedInput.includes('鱼') || normalizedInput.includes('蛋黄') || normalizedInput.includes('蛋白')) category = '自制';
    else if (normalizedInput.includes('冻干') || normalizedInput.includes('猫条') || normalizedInput.includes('零食') || normalizedInput.includes('肉干')) category = '零食';
    
    return {
      name: foodName,
      category,
      amount,
      unit,
      calories: Math.round(amount * defaultCalories[category] / 100),
      confidence: 'low'
    };
  }
  
  const caloriesPer100g = matchedFood.caloriesPer100g;
  let calories;
  
  if (unit === '个' || unit === '块') {
    if (matchedFood.name?.includes('猫条')) {
      calories = Math.round(amount * 22);
    } else {
      calories = Math.round(amount * 15);
    }
  } else {
    calories = Math.round(amount * caloriesPer100g / 100);
  }
  
  return {
    name: matchedFood.name || `${matchedFood.brand} ${matchedFood.product}`,
    brand: matchedFood.brand,
    category: matchedFood.category,
    amount,
    unit,
    calories,
    confidence: 'high'
  };
}

export {
  foodCalories,
  findFoodCalories
};
