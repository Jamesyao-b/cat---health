import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { config } from 'dotenv';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

config({ path: join(__dirname, '..', '.env') });

const ZHIPU_API_URL = 'https://open.bigmodel.cn/api/paas/v4/chat/completions';

async function callZhipuAPI(prompt) {
  const apiKey = process.env.ZHIPU_API_KEY;
  
  if (!apiKey) {
    console.log('ZHIPU_API_KEY 未配置，使用基础解析');
    return null;
  }
  
  console.log('使用 AI 解析...');
  
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
    console.error('AI解析失败:', error.message);
    return null;
  }
}

function parseFoodBasic(input) {
  console.log('parseFoodBasic 输入:', input);
  
  const foods = [];
  const parts = input.split(/[,，、和与]+/);
  
  console.log('分割结果:', parts);
  
  for (const part of parts) {
    const trimmed = part.trim();
    if (!trimmed) continue;
    
    console.log('处理:', trimmed);
    
    const match = trimmed.match(/^(.+?)(\d+(?:\.\d+)?)\s*(g|克|kg|千克|个|块|罐|包|条)$/i);
    
    console.log('匹配结果:', match);
    
    if (match) {
      const name = match[1].trim();
      const amount = parseFloat(match[2]);
      let unit = match[3];
      
      if (unit === 'kg' || unit === '千克') {
        unit = 'g';
      } else if (unit === '克') {
        unit = 'g';
      }
      
      if (name && amount > 0) {
        console.log('添加食物:', { name, amount, unit });
        foods.push({ name, amount, unit });
      }
    }
  }
  
  console.log('解析结果:', foods);
  
  return foods;
}

export async function parseFoodInput(input) {
  console.log('parseFoodInput 输入:', input);
  
  const result = await callZhipuAPI(`请解析以下猫咪食物描述，提取食物名称和分量。输入：${input}。请以JSON数组格式返回，每个食物包含name(食物名称)、amount(数量)、unit(单位)三个字段。只返回JSON数组。`);
  
  if (Array.isArray(result)) {
    console.log('AI 解析结果:', result);
    return result;
  }
  
  return parseFoodBasic(input);
}

export async function generateDietAdvice(cat, todayCalories, dailyCalories) {
  const diff = dailyCalories - todayCalories;
  
  if (diff < -50) {
    return `今日摄入超标${Math.abs(diff)}kcal，建议明天减少零食投喂，或增加15分钟互动游戏帮助消耗。`;
  } else if (diff < 50) {
    return `今日摄入合理，继续保持！建议适当增加湿粮补充水分。`;
  } else {
    return `今日还可以摄入${diff}kcal，相当于约${Math.round(diff / 3.5)}g猫粮。`;
  }
}
