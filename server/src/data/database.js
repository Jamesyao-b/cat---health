const cats = new Map();
const foodRecords = new Map();
const weightRecords = new Map();
let catIdCounter = 1;
let recordIdCounter = 1;

function createCat(catData) {
  const id = `cat_${catIdCounter++}`;
  const cat = {
    id,
    ...catData,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
  cats.set(id, cat);
  weightRecords.set(id, [{
    weight: catData.weight,
    date: new Date().toISOString().split('T')[0]
  }]);
  return cat;
}

function getCat(id) {
  return cats.get(id);
}

function getAllCats() {
  return Array.from(cats.values());
}

function updateCat(id, updates) {
  const cat = cats.get(id);
  if (!cat) return null;
  
  const updatedCat = {
    ...cat,
    ...updates,
    updatedAt: new Date().toISOString()
  };
  
  if (updates.weight && updates.weight !== cat.weight) {
    const records = weightRecords.get(id) || [];
    records.push({
      weight: updates.weight,
      date: new Date().toISOString().split('T')[0]
    });
    weightRecords.set(id, records);
  }
  
  cats.set(id, updatedCat);
  return updatedCat;
}

function deleteCat(id) {
  cats.delete(id);
  foodRecords.delete(id);
  weightRecords.delete(id);
  return true;
}

function addFoodRecord(catId, record) {
  const id = `record_${recordIdCounter++}`;
  const foodRecord = {
    id,
    catId,
    ...record,
    createdAt: new Date().toISOString()
  };
  
  if (!foodRecords.has(catId)) {
    foodRecords.set(catId, []);
  }
  foodRecords.get(catId).push(foodRecord);
  return foodRecord;
}

function getFoodRecords(catId, date) {
  const records = foodRecords.get(catId) || [];
  if (date) {
    return records.filter(r => r.date === date);
  }
  return records;
}

function getTodayFoodRecords(catId) {
  const today = new Date().toISOString().split('T')[0];
  return getFoodRecords(catId, today);
}

function getWeightRecords(catId) {
  return weightRecords.get(catId) || [];
}

function getDailyStats(catId, date) {
  const records = getFoodRecords(catId, date);
  const totalCalories = records.reduce((sum, r) => sum + r.totalCalories, 0);
  return {
    date,
    totalCalories,
    recordCount: records.length,
    records
  };
}

export {
  createCat,
  getCat,
  getAllCats,
  updateCat,
  deleteCat,
  addFoodRecord,
  getFoodRecords,
  getTodayFoodRecords,
  getWeightRecords,
  getDailyStats
};
