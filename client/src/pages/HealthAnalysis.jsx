import { useState, useEffect } from 'react'
import API_BASE from '../config'

function HealthAnalysis({ cat, onNavigate }) {
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (cat) {
      fetchStats()
    }
  }, [cat])

  const fetchStats = async () => {
    setLoading(true)
    try {
      const res = await fetch(`${API_BASE}/food/stats/${cat.id}?days=7`)
      const data = await res.json()
      setStats(data)
    } catch (err) {
      console.error('获取统计数据失败:', err)
    }
    setLoading(false)
  }

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

  const getWeightStatusColor = (status) => {
    const colors = {
      underweight: '#ff9800',
      normal: '#4caf50',
      overweight: '#ff5722',
      obese: '#f44336'
    }
    return colors[status] || '#666'
  }

  const maxCalorie = stats ? Math.max(...stats.stats.map(s => Math.max(s.totalCalories, s.targetCalories))) : 300

  return (
    <div className="container">
      <div className="card analysis-card">
        <div className="header">
          <button className="back-btn" onClick={() => onNavigate('home')}>
            ← 返回
          </button>
          <h1>📊 健康分析</h1>
          <p className="subtitle">{cat.name} 的健康报告</p>
        </div>

        {loading ? (
          <div className="loading">
            <div className="spinner"></div>
            <p>加载中...</p>
          </div>
        ) : (
          <>
            <div className="weight-section">
              <h3>⚖️ 体重评估</h3>
              <div className="weight-card">
                <div className="weight-current">
                  <span className="weight-value">{cat.weight}</span>
                  <span className="weight-unit">kg</span>
                </div>
                <div 
                  className="weight-status"
                  style={{ backgroundColor: getWeightStatusColor(cat.weightAdvice?.status) }}
                >
                  {cat.weightAdvice?.label}
                </div>
              </div>
              <div className="weight-advice">
                <p className="advice-goal">🎯 目标：{cat.weightAdvice?.goal}</p>
                <p className="advice-text">{cat.weightAdvice?.suggestion}</p>
              </div>
            </div>

            <div className="calorie-section">
              <h3>🔥 每日热量建议</h3>
              <div className="calorie-recommend">
                <span className="calorie-value">{stats?.dailyCalories || cat.dailyCalories}</span>
                <span className="calorie-unit">kcal/天</span>
              </div>
            </div>

            {stats && stats.stats && (
              <div className="trend-section">
                <h3>📈 近7天热量趋势</h3>
                <div className="chart-container">
                  <div className="chart">
                    {stats.stats.map((day, index) => (
                      <div key={index} className="chart-bar-group">
                        <div className="chart-bars">
                          <div 
                            className="chart-bar target"
                            style={{ 
                              height: `${(day.targetCalories / maxCalorie) * 100}%`,
                            }}
                          ></div>
                          <div 
                            className={`chart-bar actual ${day.totalCalories > day.targetCalories ? 'exceeded' : ''}`}
                            style={{ 
                              height: `${(day.totalCalories / maxCalorie) * 100}%`,
                            }}
                          >
                            <span className="bar-value">{day.totalCalories}</span>
                          </div>
                        </div>
                        <div className="chart-label">
                          {new Date(day.date).toLocaleDateString('zh-CN', { weekday: 'short' })}
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="chart-legend">
                    <span className="legend-item">
                      <span className="legend-color target"></span>
                      建议值
                    </span>
                    <span className="legend-item">
                      <span className="legend-color actual"></span>
                      实际摄入
                    </span>
                  </div>
                </div>
              </div>
            )}

            <div className="tips-section">
              <h3>💡 健康小贴士</h3>
              <ul className="tips-list">
                <li>定时定量喂食，避免自由采食</li>
                <li>湿粮含水量高，有助于泌尿健康</li>
                <li>每周记录体重，监测变化趋势</li>
                <li>互动游戏可帮助消耗多余热量</li>
              </ul>
            </div>

            <button 
              className="primary-btn record-btn"
              onClick={() => onNavigate('record')}
            >
              📝 记录今日饮食
            </button>
          </>
        )}
      </div>
    </div>
  )
}

export default HealthAnalysis
