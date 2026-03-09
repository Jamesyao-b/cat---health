if (!process.env.ZHIPU_API_KEY || process.env.ZHIPU_API_KEY === 'your_zhipu_api_key_here') {
  console.warn('⚠️  警告: ZHIPU_API_KEY 未配置，将使用基础解析模式');
}

const ZHIPU_API_URL = 'https://open.bigmodel.cn/api/paas/v4/chat/completions';

async function callZhipuAPI(prompt) {
  const apiKey = process.env.ZHIPU_API_KEY;
  
  if (!apiKey || apiKey === 'your_zhipu_api_key_here') {
    return parseFoodBasic(prompt);
  }
  
  try {
    const response = await fetch(ZHIPU_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: 'glm-4-flash',
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.3,
        max_tokens: 500
      })
    });
    
    if (!response.ok) {
      throw new Error(`API调用失败: ${response.status}`);
    }
    
    const data = await response.json();
    return JSON.parse(data.choices[0].message.content);
  } catch (error) {
    console.error('AI解析失败，使用基础解析:', error.message);
    return parseFoodBasic(prompt);
  }
}

function parseFoodBasic(input) {
  const foods = [];
  const patterns = [
    /(\D+?)(\d+(?:\.\d+)?)\s*(g|克|kg|千克|个|块|罐|包|条)/gi,
    /(\d+(?:\.\d+)?)\s*(g|克|kg|千克|个|块|罐|包|条)\s*(\D+)/gi
  ];
  
  for (const pattern of patterns) {
    let match;
    while ((match = pattern.exec(input)) !== null) {
      let name, amount, unit;
      
      if (match[1] && isNaN(match[1])) {
        name = match[1].trim();
        amount = parseFloat(match[2]);
        unit = match[3];
      } else {
        amount = parseFloat(match[1]);
        unit = match[2];
        name = match[3]?.trim() || '猫粮';
      }
      
      if (name && amount > 0) {
        if (unit === 'kg' || unit === '千克') {
          amount = amount * 1000;
          unit = 'g';
        }
        
        foods.push({ name, amount, unit: unit.replace('克', 'g') });
      }
    }
  }
  
  if (foods.length === 0) {
    const words = input.split(/[,，、和与\s]+/).filter(w => w.trim());
    for (const word of words) {
      foods.push({ name: word.trim(), amount: 50, unit: 'g' });
    }
  }
  
  return foods;
}

export async function parseFoodInput(input) {
  const prompt = `请解析以下猫咪食物描述，提取食物名称和分量。

输入：${input}

请以JSON数组格式返回，每个食物包含name(食物名称)、amount(数量)、unit(单位)三个字段。
示例输出：
[{"name":"皇家猫粮","amount":50,"unit":"g"},{"name":"鸡胸肉","amount":20,"unit":"g"}]

注意：
1. 如果单位是kg或千克，请转换为g
2. 只返回JSON数组，不要有其他说明文字
3. 如果无法识别具体分量，默认为50g`;

  const result = await callZhipuAPI(prompt);
  
  if (Array.isArray(result)) {
    return result;
  }
  
  return parseFoodBasic(input);
}

export async function generateDietAdvice(cat, todayCalories, dailyCalories) {
  const apiKey = process.env.ZHIPU_API_KEY;
  
  if (!apiKey || apiKey === 'your_zhipu_api_key_here') {
    return generateBasicAdvice(cat, todayCalories, dailyCalories);
  }
  
  const prompt = `你是一位专业的宠物营养师，请根据以下信息给出简短的饮食建议（不超过100字）。

猫咪信息：
- 名字：${cat.name}
- 品种：${cat.breed}
- 体重：${cat.weight}kg
- 绝育状态：${cat.isNeutered ? '已绝育' : '未绝育'}
- 活动量：${cat.activityLevel || '普通'}

今日饮食：
- 已摄入：${todayCalories} kcal
- 建议摄入：${dailyCalories} kcal
- 差额：${dailyCalories - todayCalories} kcal

请直接给出建议，不要有开场白。`;

  try {
    const response = await fetch(ZHIPU_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: 'glm-4-flash',
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.7,
        max_tokens: 200
      })
    });
    
    if (!response.ok) {
      throw new Error(`API调用失败: ${response.status}`);
    }
    
    const data = await response.json();
    return data.choices[0].message.content;
  } catch (error) {
    console.error('生成建议失败:', error.message);
    return generateBasicAdvice(cat, todayCalories, dailyCalories);
  }
}

function generateBasicAdvice(cat, todayCalories, dailyCalories) {
  const diff = dailyCalories - todayCalories;
  
  if (diff < -50) {
    return `今日摄入超标${Math.abs(diff)}kcal，建议明天减少零食投喂，或增加15分钟互动游戏帮助消耗。`;
  } else if (diff < 50) {
    return `今日摄入合理，继续保持！建议适当增加湿粮补充水分。`;
  } else {
    return `今日还可以摄入${diff}kcal，相当于约${Math.round(diff / 3.5)}g猫粮。`;
  }
}
