import { useState } from 'react'
import API_BASE from '../config'

function CreateCat({ onNavigate, onRefresh }) {
  const [step, setStep] = useState(1)
  const [loading, setLoading] = useState(false)
  const [breeds, setBreeds] = useState([])
  const [formData, setFormData] = useState({
    name: '',
    breed: '',
    birthDate: '',
    gender: '',
    isNeutered: '',
    weight: '',
    activityLevel: 'normal',
    healthConditions: [],
    photo: ''
  })

  useState(() => {
    fetchBreeds()
  }, [])

  const fetchBreeds = async () => {
    try {
      const res = await fetch(`${API_BASE}/cats/breeds`)
      const data = await res.json()
      setBreeds(data)
    } catch (err) {
      console.error('获取品种列表失败:', err)
    }
  }

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleHealthCondition = (condition) => {
    setFormData(prev => {
      const conditions = prev.healthConditions.includes(condition)
        ? prev.healthConditions.filter(c => c !== condition)
        : [...prev.healthConditions, condition]
      return { ...prev, healthConditions: conditions }
    })
  }

  const validateStep = () => {
    switch (step) {
      case 1:
        return formData.name && formData.breed && formData.birthDate
      case 2:
        return formData.gender && formData.isNeutered !== '' && formData.weight
      default:
        return true
    }
  }

  const handleNext = () => {
    if (validateStep()) {
      setStep(step + 1)
    }
  }

  const handleBack = () => {
    setStep(step - 1)
  }

  const handleSubmit = async () => {
    setLoading(true)
    try {
      const res = await fetch(`${API_BASE}/cats`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          isNeutered: formData.isNeutered === 'true'
        })
      })
      
      if (res.ok) {
        onRefresh()
        onNavigate('home')
      } else {
        const error = await res.json()
        alert(error.error || '创建失败')
      }
    } catch (err) {
      console.error('创建档案失败:', err)
      alert('创建失败，请重试')
    }
    setLoading(false)
  }

  const maxDate = new Date().toISOString().split('T')[0]
  const minDate = new Date(Date.now() - 30 * 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]

  return (
    <div className="container">
      <div className="card create-card">
        <div className="header">
          <button className="back-btn" onClick={() => onNavigate('home')}>
            ← 返回
          </button>
          <h1>创建猫咪档案</h1>
          <div className="step-indicator">
            <span className={step >= 1 ? 'active' : ''}>1</span>
            <span className={step >= 2 ? 'active' : ''}>2</span>
            <span className={step >= 3 ? 'active' : ''}>3</span>
          </div>
        </div>

        <div className="progress-bar">
          <div className={`progress-step ${step >= 1 ? 'active' : ''}`}></div>
          <div className={`progress-step ${step >= 2 ? 'active' : ''}`}></div>
          <div className={`progress-step ${step >= 3 ? 'active' : ''}`}></div>
        </div>

        {step === 1 && (
          <div className="form-step">
            <h2>基础信息</h2>
            
            <div className="form-group">
              <label>猫咪名称 *</label>
              <input
                type="text"
                placeholder="给猫咪起个名字吧"
                value={formData.name}
                onChange={(e) => handleChange('name', e.target.value)}
                maxLength={10}
              />
            </div>

            <div className="form-group">
              <label>品种 *</label>
              <select
                value={formData.breed}
                onChange={(e) => handleChange('breed', e.target.value)}
              >
                <option value="">请选择品种</option>
                {breeds.map((breed, index) => (
                  <option key={index} value={breed.name}>{breed.name}</option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label>出生日期 *</label>
              <input
                type="date"
                value={formData.birthDate}
                onChange={(e) => handleChange('birthDate', e.target.value)}
                max={maxDate}
                min={minDate}
              />
            </div>

            <button 
              className="primary-btn"
              onClick={handleNext}
              disabled={!validateStep()}
            >
              下一步
            </button>
          </div>
        )}

        {step === 2 && (
          <div className="form-step">
            <h2>身体信息</h2>

            <div className="form-group">
              <label>性别 *</label>
              <div className="radio-group">
                <label className={`radio-item ${formData.gender === 'male' ? 'selected' : ''}`}>
                  <input
                    type="radio"
                    name="gender"
                    value="male"
                    checked={formData.gender === 'male'}
                    onChange={(e) => handleChange('gender', e.target.value)}
                  />
                  <span>公</span>
                </label>
                <label className={`radio-item ${formData.gender === 'female' ? 'selected' : ''}`}>
                  <input
                    type="radio"
                    name="gender"
                    value="female"
                    checked={formData.gender === 'female'}
                    onChange={(e) => handleChange('gender', e.target.value)}
                  />
                  <span>母</span>
                </label>
                <label className={`radio-item ${formData.gender === 'unknown' ? 'selected' : ''}`}>
                  <input
                    type="radio"
                    name="gender"
                    value="unknown"
                    checked={formData.gender === 'unknown'}
                    onChange={(e) => handleChange('gender', e.target.value)}
                  />
                  <span>未知</span>
                </label>
              </div>
            </div>

            <div className="form-group">
              <label>绝育状态 *</label>
              <div className="radio-group">
                <label className={`radio-item ${formData.isNeutered === 'true' ? 'selected' : ''}`}>
                  <input
                    type="radio"
                    name="isNeutered"
                    value="true"
                    checked={formData.isNeutered === 'true'}
                    onChange={(e) => handleChange('isNeutered', e.target.value)}
                  />
                  <span>已绝育</span>
                </label>
                <label className={`radio-item ${formData.isNeutered === 'false' ? 'selected' : ''}`}>
                  <input
                    type="radio"
                    name="isNeutered"
                    value="false"
                    checked={formData.isNeutered === 'false'}
                    onChange={(e) => handleChange('isNeutered', e.target.value)}
                  />
                  <span>未绝育</span>
                </label>
              </div>
            </div>

            <div className="form-group">
              <label>当前体重 (kg) *</label>
              <input
                type="number"
                placeholder="例如: 4.5"
                value={formData.weight}
                onChange={(e) => handleChange('weight', parseFloat(e.target.value))}
                min="1"
                max="15"
                step="0.1"
              />
              <span className="hint">体重范围: 1-15 kg</span>
            </div>

            <div className="button-group">
              <button className="secondary-btn" onClick={handleBack}>
                上一步
              </button>
              <button 
                className="primary-btn"
                onClick={handleNext}
                disabled={!validateStep()}
              >
                下一步
              </button>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="form-step">
            <h2>补充信息</h2>

            <div className="form-group">
              <label>活动量</label>
              <div className="radio-group">
                <label className={`radio-item ${formData.activityLevel === 'lazy' ? 'selected' : ''}`}>
                  <input
                    type="radio"
                    name="activityLevel"
                    value="lazy"
                    checked={formData.activityLevel === 'lazy'}
                    onChange={(e) => handleChange('activityLevel', e.target.value)}
                  />
                  <span>懒猫 🛋️</span>
                </label>
                <label className={`radio-item ${formData.activityLevel === 'normal' ? 'selected' : ''}`}>
                  <input
                    type="radio"
                    name="activityLevel"
                    value="normal"
                    checked={formData.activityLevel === 'normal'}
                    onChange={(e) => handleChange('activityLevel', e.target.value)}
                  />
                  <span>普通 🐱</span>
                </label>
                <label className={`radio-item ${formData.activityLevel === 'active' ? 'selected' : ''}`}>
                  <input
                    type="radio"
                    name="activityLevel"
                    value="active"
                    checked={formData.activityLevel === 'active'}
                    onChange={(e) => handleChange('activityLevel', e.target.value)}
                  />
                  <span>活泼 🏃</span>
                </label>
              </div>
            </div>

            <div className="form-group">
              <label>健康状况（可多选）</label>
              <div className="checkbox-group">
                {['无', '糖尿病', '肾病', '心脏病', '肥胖'].map(condition => (
                  <label 
                    key={condition}
                    className={`checkbox-item ${
                      condition === '无' 
                        ? (formData.healthConditions.length === 0 ? 'selected' : '')
                        : (formData.healthConditions.includes(condition) ? 'selected' : '')
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={condition === '无' 
                        ? formData.healthConditions.length === 0
                        : formData.healthConditions.includes(condition)
                      }
                      onChange={() => {
                        if (condition === '无') {
                          handleChange('healthConditions', [])
                        } else {
                          handleHealthCondition(condition)
                        }
                      }}
                    />
                    <span>{condition}</span>
                  </label>
                ))}
              </div>
            </div>

            <div className="button-group">
              <button className="secondary-btn" onClick={handleBack}>
                上一步
              </button>
              <button 
                className="primary-btn"
                onClick={handleSubmit}
                disabled={loading}
              >
                {loading ? '创建中...' : '完成创建'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default CreateCat
