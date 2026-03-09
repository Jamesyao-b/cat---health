import { useState } from 'react'
import API_BASE from '../config'

function FoodRecord({ cat, onNavigate }) {
  const [input, setInput] = useState('')
  const [parsedFoods, setParsedFoods] = useState(null)
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)

  if (!cat) {
    return (
      <div className="container">
        <div className="card">
          <div className="empty-state">
            <p>请先选择一只猫咪</p>
            <button className="primary-btn" onClick={() => onNavigate('home')}>
              返回首页
            </button>
          </div>
        </div>
      </div>
    )
  }

  const handleParse = async () => {
    if (!input.trim()) {
      alert('请输入食物描述')
      return
    }

    setLoading(true)
    try {
      const res = await fetch(`${API_BASE}/food/parse`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ input })
      })
      const data = await res.json()
      setParsedFoods(data)
    } catch (err) {
      console.error('解析失败:', err)
      alert('解析失败，请重试')
    }
    setLoading(false)
  }

  const handleSave = async () => {
    if (!parsedFoods) return

    setSaving(true)
    try {
      const res = await fetch(`${API_BASE}/food/record`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          catId: cat.id,
          foods: parsedFoods.foods,
          totalCalories: parsedFoods.totalCalories
        })
      })
      
      if (res.ok) {
        alert('记录成功！')
        setInput('')
        setParsedFoods(null)
        onNavigate('home')
      } else {
        alert('保存失败，请重试')
      }
    } catch (err) {
      console.error('保存失败:', err)
      alert('保存失败，请重试')
    }
    setSaving(false)
  }

  const examples = [
    '皇家猫粮50g，鸡胸肉20g',
    '渴望猫粮40g，冻干5g',
    '罐头1个，猫条2个'
  ]

  return (
    <div className="container">
      <div className="card record-card">
        <div className="header">
          <button className="back-btn" onClick={() => onNavigate('home')}>
            ← 返回
          </button>
          <h1>📝 记录饮食</h1>
          <p className="subtitle">为 {cat.name} 记录今日饮食</p>
        </div>

        <div className="input-section">
          <label>描述猫咪今天吃了什么</label>
          <textarea
            className="food-input"
            placeholder="例如：皇家猫粮50g，鸡胸肉20g"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            rows={3}
          />
          
          <div className="examples">
            <span className="examples-label">💡 试试这些：</span>
            {examples.map((example, index) => (
              <button
                key={index}
                className="example-btn"
                onClick={() => setInput(example)}
              >
                {example}
              </button>
            ))}
          </div>

          <button
            className="primary-btn parse-btn"
            onClick={handleParse}
            disabled={loading || !input.trim()}
          >
            {loading ? '解析中...' : '🔍 AI解析'}
          </button>
        </div>

        {parsedFoods && (
          <div className="result-section">
            <h3>解析结果</h3>
            
            <div className="parsed-foods">
              {parsedFoods.foods.map((food, index) => (
                <div key={index} className="food-item">
                  <div className="food-icon">
                    {food.category === '干粮' && '🍚'}
                    {food.category === '湿粮' && '🥫'}
                    {food.category === '自制' && '🍗'}
                    {food.category === '零食' && '🍪'}
                    {!['干粮', '湿粮', '自制', '零食'].includes(food.category) && '🍽️'}
                  </div>
                  <div className="food-details">
                    <div className="food-name">{food.name}</div>
                    <div className="food-amount">{food.amount}{food.unit}</div>
                  </div>
                  <div className="food-calories">
                    {food.calories} kcal
                  </div>
                  {food.confidence === 'low' && (
                    <div className="confidence-warning" title="热量为估算值">
                      ⚠️
                    </div>
                  )}
                </div>
              ))}
            </div>

            <div className="total-section">
              <span className="total-label">总热量</span>
              <span className="total-value">{parsedFoods.totalCalories}</span>
              <span className="total-unit">kcal</span>
            </div>

            <div className="action-group">
              <button 
                className="secondary-btn"
                onClick={() => setParsedFoods(null)}
              >
                重新输入
              </button>
              <button
                className="primary-btn"
                onClick={handleSave}
                disabled={saving}
              >
                {saving ? '保存中...' : '✅ 确认保存'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default FoodRecord
