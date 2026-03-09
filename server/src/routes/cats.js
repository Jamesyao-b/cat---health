import express from 'express';
import { createCat, getCat, getAllCats, updateCat, deleteCat, getWeightRecords } from '../data/database.js';
import { catBreeds, calculateDER, getWeightAdvice } from '../data/catData.js';

const router = express.Router();

router.get('/breeds', (req, res) => {
  res.json(catBreeds);
});

router.post('/', (req, res) => {
  try {
    const { name, breed, birthDate, gender, isNeutered, weight, activityLevel, healthConditions, photo } = req.body;
    
    if (!name || !breed || !birthDate || !gender || isNeutered === undefined || !weight) {
      return res.status(400).json({ error: '缺少必填字段' });
    }
    
    if (weight < 1 || weight > 15) {
      return res.status(400).json({ error: '体重需在1-15kg之间' });
    }
    
    const birth = new Date(birthDate);
    const ageMonths = Math.floor((Date.now() - birth.getTime()) / (1000 * 60 * 60 * 24 * 30));
    
    const cat = createCat({
      name,
      breed,
      birthDate,
      gender,
      isNeutered,
      weight,
      activityLevel: activityLevel || 'normal',
      healthConditions: healthConditions || [],
      photo,
      ageMonths
    });
    
    const der = calculateDER({ ...cat, ageMonths });
    const weightAdvice = getWeightAdvice({ ...cat, ageMonths });
    
    res.json({
      ...cat,
      dailyCalories: der,
      weightAdvice
    });
  } catch (error) {
    console.error('Create cat error:', error);
    res.status(500).json({ error: '创建档案失败' });
  }
});

router.get('/', (req, res) => {
  const cats = getAllCats();
  const catsWithStats = cats.map(cat => {
    const birth = new Date(cat.birthDate);
    const ageMonths = Math.floor((Date.now() - birth.getTime()) / (1000 * 60 * 60 * 24 * 30));
    const der = calculateDER({ ...cat, ageMonths });
    const weightAdvice = getWeightAdvice({ ...cat, ageMonths });
    
    return {
      ...cat,
      ageMonths,
      dailyCalories: der,
      weightAdvice
    };
  });
  res.json(catsWithStats);
});

router.get('/:id', (req, res) => {
  const cat = getCat(req.params.id);
  if (!cat) {
    return res.status(404).json({ error: '猫咪不存在' });
  }
  
  const birth = new Date(cat.birthDate);
  const ageMonths = Math.floor((Date.now() - birth.getTime()) / (1000 * 60 * 60 * 24 * 30));
  const der = calculateDER({ ...cat, ageMonths });
  const weightAdvice = getWeightAdvice({ ...cat, ageMonths });
  const weightHistory = getWeightRecords(req.params.id);
  
  res.json({
    ...cat,
    ageMonths,
    dailyCalories: der,
    weightAdvice,
    weightHistory
  });
});

router.put('/:id', (req, res) => {
  try {
    const updates = req.body;
    
    if (updates.weight && (updates.weight < 1 || updates.weight > 15)) {
      return res.status(400).json({ error: '体重需在1-15kg之间' });
    }
    
    const cat = updateCat(req.params.id, updates);
    if (!cat) {
      return res.status(404).json({ error: '猫咪不存在' });
    }
    
    const birth = new Date(cat.birthDate);
    const ageMonths = Math.floor((Date.now() - birth.getTime()) / (1000 * 60 * 60 * 24 * 30));
    const der = calculateDER({ ...cat, ageMonths });
    const weightAdvice = getWeightAdvice({ ...cat, ageMonths });
    
    res.json({
      ...cat,
      ageMonths,
      dailyCalories: der,
      weightAdvice
    });
  } catch (error) {
    console.error('Update cat error:', error);
    res.status(500).json({ error: '更新档案失败' });
  }
});

router.delete('/:id', (req, res) => {
  const success = deleteCat(req.params.id);
  if (!success) {
    return res.status(404).json({ error: '猫咪不存在' });
  }
  res.json({ success: true });
});

export default router;
