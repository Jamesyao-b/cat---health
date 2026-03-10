import { useState, useEffect } from 'react'
import API_BASE from '../config'

function Home({ cats, selectedCat, onSelectCat, onNavigate, onRefresh }) {
  const [todayStats, setTodayStats] = useState(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (selectedCat) {
      fetchTodayStats()
    }
  }, [selectedCat])

  const fetchTodayStats = async () => {
    setLoading(true)
    try {
      const res = await fetch(`${API_BASE}/food/today/${selectedCat.id}`)
      const data = await res.json()
      setTodayStats(data)
    } catch (err) {
      console.error('获取今日数据失败:', err)
    }
    setLoading(false)
  }

  const formatDate = (dateStr) => {
    const date = new Date(dateStr)
    return `${date.getFullYear()}年${date.getMonth() + 1}月${date.getDate()}日`
  }

  const calculateAge = (birthDate) => {
    const birth = new Date(birthDate)
    const now = new Date()
    const months = (now.getFullYear() - birth.getFullYear()) * 12 + (now.getMonth() - birth.getMonth())
    if (months < 12) {
      return `${months}个月`
    }
    const years = Math.floor(months / 12)
    const remainingMonths = months % 12
    return remainingMonths > 0 ? `${years}岁${remainingMonths}个月` : `${years}岁`
  }

  return (
    <div className="container">
      <div className="card">
        <div className="header">
          <h1>🐱 喵健康</h1>
          <p className="subtitle">科学管理猫咪饮食，守护毛孩子健康</p>
        </div>

        {cats.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">🐱</div>
            <p className="empty-text">还没有创建猫咪档案</p>
            <button 
              className="primary-btn"
              onClick={() => onNavigate('create')}
            >
              创建档案
            </button>
          </div>
        ) : (
          <>
            <div className="cat-selector">
              {cats.map(cat => (
                <div 
                  key={cat.id}
                  className={`cat-tab ${selectedCat?.id === cat.id ? 'active' : ''}`}
                  onClick={() => onSelectCat(cat)}
                >
                  {cat.name}
                </div>
              ))}
              <div 
                className="cat-tab add"
                onClick={() => onNavigate('create')}
              >
                +
              </div>
            </div>

            {selectedCat && (
              <>
                <div className="cat-card">
                  <div className="cat-avatar">
                    {selectedCat.photo ? (
                      <img src={selectedCat.photo} alt={selectedCat.name} />
                    ) : (
                      <div className="avatar-placeholder">🐱</div>
                    )}
                  </div>
                  <div className="cat-info">
                    <h2>{selectedCat.name}</h2>
                    <p className="cat-breed">{selectedCat.breed}</p>
                    <div className="cat-tags">
                      <span className="tag">{calculateAge(selectedCat.birthDate)}</span>
                      <span className="tag">{selectedCat.weight}kg</span>
                      <span className="tag">{selectedCat.isNeutered ? '已绝育' : '未绝育'}</span>
                    </div>
                  </div>
                  <button 
                    className="edit-btn"
                    onClick={() => onNavigate('edit', selectedCat)}
                  >
                    ✏️ 编辑
                  </button>
                </div>

                {loading ? (
                  <div className="loading">
                    <div className="spinner"></div>
                    <p>加载中...</p>
                  </div>
                ) : todayStats && (
                  <div className="calorie-section">
                    <div className="calorie-header">
                      <span>今日摄入</span>
                      <span className="date">{formatDate(new Date().toISOString())}</span>
                    </div>
                    <div className="calorie-bar">
                      <div 
                        className={`calorie-fill ${todayStats.status}`}
                        style={{ width: `${Math.min(100, todayStats.percentage)}%` }}
                      ></div>
                    </div>
                    <div className="calorie-numbers">
                      <span className="current">{todayStats.totalCalories}</span>
                      <span className="divider">/</span>
                      <span className="target">{todayStats.dailyCalories}</span>
                      <span className="unit">kcal</span>
                    </div>
                    <div className={`calorie-status ${todayStats.status}`}>
                      {todayStats.status === 'ok' 
                        ? `✅ 还可摄入 ${todayStats.remaining} kcal` 
                        : `⚠️ 已超标 ${Math.abs(todayStats.remaining)} kcal`}
                    </div>
                  </div>
                )}

                <div className="action-buttons">
                  <button 
                    className="action-btn record"
                    onClick={() => onNavigate('record')}
                  >
                    <span className="btn-icon">📝</span>
                    <span className="btn-text">记录饮食</span>
                  </button>
                  <button 
                    className="action-btn analysis"
                    onClick={() => onNavigate('analysis')}
                  >
                    <span className="btn-icon">📊</span>
                    <span className="btn-text">健康分析</span>
                  </button>
                </div>

                {todayStats && todayStats.records && todayStats.records.length > 0 && (
                  <div className="today-records">
                    <h3>今日记录</h3>
                    {todayStats.records.map((record, index) => (
                      <div key={index} className="record-item">
                        <div className="record-time">
                          {new Date(record.createdAt).toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })}
                        </div>
                        <div className="record-foods">
                          {record.foods.map((food, i) => (
                            <span key={i} className="food-tag">
                              {food.name} {food.amount}{food.unit}
                            </span>
                          ))}
                        </div>
                        <div className="record-calories">
                          {record.totalCalories} kcal
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </>
            )}
          </>
        )}
      </div>
    </div>
  )
}

export default Home
