import express from 'express';
import { getCat } from '../data/database.js';
import { addFoodRecord, getFoodRecords, getTodayFoodRecords, getDailyStats } from '../data/database.js';
import { findFoodCalories } from '../data/foodData.js';
import { calculateDER, getWeightAdvice } from '../data/catData.js';
import { parseFoodInput } from '../services/foodParser.js';

const router = express.Router();

router.post('/parse', async (req, res) => {
  try {
    const { input } = req.body;
    
    if (!input || !input.trim()) {
      return res.status(400).json({ error: '请输入食物描述' });
    }
    
    const parsedFoods = await parseFoodInput(input);
    
    const foods = parsedFoods.map(f => findFoodCalories(f.name, f.amount, f.unit));
    const totalCalories = foods.reduce((sum, f) => sum + f.calories, 0);
    
    res.json({
      foods,
      totalCalories,
      originalInput: input
    });
  } catch (error) {
    console.error('Parse food error:', error);
    res.status(500).json({ error: '解析食物失败' });
  }
});

router.post('/record', (req, res) => {
  try {
    const { catId, foods, totalCalories, date } = req.body;
    
    const cat = getCat(catId);
    if (!cat) {
      return res.status(404).json({ error: '猫咪不存在' });
    }
    
    const record = addFoodRecord(catId, {
      foods,
      totalCalories,
      date: date || new Date().toISOString().split('T')[0]
    });
    
    res.json(record);
  } catch (error) {
    console.error('Add food record error:', error);
    res.status(500).json({ error: '添加记录失败' });
  }
});

router.get('/records/:catId', (req, res) => {
  const { date } = req.query;
  const records = getFoodRecords(req.params.catId, date);
  res.json(records);
});

router.get('/today/:catId', (req, res) => {
  const cat = getCat(req.params.catId);
  if (!cat) {
    return res.status(404).json({ error: '猫咪不存在' });
  }
  
  const records = getTodayFoodRecords(req.params.catId);
  const totalCalories = records.reduce((sum, r) => sum + r.totalCalories, 0);
  
  const birth = new Date(cat.birthDate);
  const ageMonths = Math.floor((Date.now() - birth.getTime()) / (1000 * 60 * 60 * 24 * 30));
  const dailyCalories = calculateDER({ ...cat, ageMonths });
  const weightAdvice = getWeightAdvice({ ...cat, ageMonths });
  
  const remaining = dailyCalories - totalCalories;
  const percentage = Math.min(100, Math.round((totalCalories / dailyCalories) * 100));
  
  res.json({
    catId: req.params.catId,
    date: new Date().toISOString().split('T')[0],
    records,
    totalCalories,
    dailyCalories,
    remaining,
    percentage,
    status: remaining >= 0 ? 'ok' : 'exceeded',
    weightAdvice
  });
});

router.get('/stats/:catId', (req, res) => {
  const { days = 7 } = req.query;
  const cat = getCat(req.params.catId);
  
  if (!cat) {
    return res.status(404).json({ error: '猫咪不存在' });
  }
  
  const birth = new Date(cat.birthDate);
  const ageMonths = Math.floor((Date.now() - birth.getTime()) / (1000 * 60 * 60 * 24 * 30));
  const dailyCalories = calculateDER({ ...cat, ageMonths });
  
  const stats = [];
  const today = new Date();
  
  for (let i = parseInt(days) - 1; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);
    const dateStr = date.toISOString().split('T')[0];
    const dayStats = getDailyStats(req.params.catId, dateStr);
    stats.push({
      date: dateStr,
      totalCalories: dayStats.totalCalories,
      recordCount: dayStats.recordCount,
      targetCalories: dailyCalories
    });
  }
  
  res.json({
    catId: req.params.catId,
    dailyCalories,
    stats
  });
});

export default router;
