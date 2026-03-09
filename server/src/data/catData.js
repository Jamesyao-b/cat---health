const catBreeds = [
  { name: '英国短毛猫', standardWeight: { min: 3.5, max: 5.5 } },
  { name: '美国短毛猫', standardWeight: { min: 3.5, max: 5.5 } },
  { name: '布偶猫', standardWeight: { min: 4.5, max: 7.0 } },
  { name: '暹罗猫', standardWeight: { min: 2.5, max: 4.5 } },
  { name: '波斯猫', standardWeight: { min: 3.5, max: 5.5 } },
  { name: '缅因猫', standardWeight: { min: 5.0, max: 8.0 } },
  { name: '橘猫', standardWeight: { min: 4.0, max: 6.0 } },
  { name: '狸花猫', standardWeight: { min: 3.5, max: 5.0 } },
  { name: '蓝猫', standardWeight: { min: 3.5, max: 5.5 } },
  { name: '加菲猫', standardWeight: { min: 4.0, max: 6.0 } },
  { name: '无毛猫', standardWeight: { min: 3.5, max: 5.5 } },
  { name: '金吉拉', standardWeight: { min: 3.5, max: 5.0 } },
  { name: '银渐层', standardWeight: { min: 3.5, max: 5.5 } },
  { name: '英短蓝白', standardWeight: { min: 3.5, max: 5.5 } },
  { name: '英短蓝金', standardWeight: { min: 3.5, max: 5.5 } },
  { name: '美短虎斑', standardWeight: { min: 3.5, max: 5.5 } },
  { name: '美短起司', standardWeight: { min: 3.5, max: 5.5 } },
  { name: '布偶重点色', standardWeight: { min: 4.5, max: 7.0 } },
  { name: '暹罗重点色', standardWeight: { min: 2.5, max: 4.5 } },
  { name: '混血/其他', standardWeight: { min: 3.5, max: 5.0 } }
];

const activityFactors = {
  kitten: 2.5,
  intact_adult: 1.4,
  neutered_lazy: 1.0,
  neutered_normal: 1.2,
  neutered_active: 1.4,
  overweight: 0.9,
  pregnant: 1.8
};

function getActivityFactor(cat) {
  if (cat.ageMonths < 12) return activityFactors.kitten;
  if (cat.healthConditions?.includes('overweight')) return activityFactors.overweight;
  if (!cat.isNeutered) return activityFactors.intact_adult;
  
  const activityMap = {
    lazy: activityFactors.neutered_lazy,
    normal: activityFactors.neutered_normal,
    active: activityFactors.neutered_active
  };
  
  return activityMap[cat.activityLevel] || activityFactors.neutered_normal;
}

function calculateRER(weightKg) {
  return 70 * Math.pow(weightKg, 0.75);
}

function calculateDER(cat) {
  const rer = calculateRER(cat.weight);
  const factor = getActivityFactor(cat);
  return Math.round(rer * factor);
}

function getWeightStatus(cat) {
  const breed = catBreeds.find(b => b.name === cat.breed) || catBreeds[catBreeds.length - 1];
  const { min, max } = breed.standardWeight;
  
  if (cat.weight < min * 0.9) return { status: 'underweight', label: '偏瘦', color: '#ff9800' };
  if (cat.weight > max * 1.1) return { status: 'obese', label: '肥胖', color: '#f44336' };
  if (cat.weight > max) return { status: 'overweight', label: '超重', color: '#ff5722' };
  return { status: 'normal', label: '正常', color: '#4caf50' };
}

function getWeightAdvice(cat) {
  const weightStatus = getWeightStatus(cat);
  const der = calculateDER(cat);
  
  const advice = {
    underweight: {
      goal: '增重',
      dailyCalories: Math.round(der * 1.1),
      suggestion: `建议每日摄入 ${Math.round(der * 1.1)} kcal，可适当增加湿粮或营养膏补充营养。`
    },
    normal: {
      goal: '维持',
      dailyCalories: der,
      suggestion: `体重正常，建议每日摄入 ${der} kcal，保持当前喂养习惯。`
    },
    overweight: {
      goal: '减重',
      dailyCalories: Math.round(der * 0.9),
      suggestion: `建议每日控制在 ${Math.round(der * 0.9)} kcal，减少零食投喂，增加互动游戏。`
    },
    obese: {
      goal: '减重',
      dailyCalories: Math.round(der * 0.8),
      suggestion: `体重超标较多，建议每日控制在 ${Math.round(der * 0.8)} kcal，建议咨询兽医制定减重计划。`
    }
  };
  
  return {
    ...weightStatus,
    ...advice[weightStatus.status]
  };
}

export {
  catBreeds,
  activityFactors,
  calculateRER,
  calculateDER,
  getWeightStatus,
  getWeightAdvice
};
