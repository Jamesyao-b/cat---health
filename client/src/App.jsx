import { useState, useEffect } from 'react'
import Home from './pages/Home'
import CreateCat from './pages/CreateCat'
import EditCat from './pages/EditCat'
import FoodRecord from './pages/FoodRecord'
import HealthAnalysis from './pages/HealthAnalysis'
import API_BASE from './config'
import './index.css'

function App() {
  const [currentPage, setCurrentPage] = useState('home')
  const [selectedCat, setSelectedCat] = useState(null)
  const [cats, setCats] = useState([])

  useEffect(() => {
    fetchCats()
  }, [])

  const fetchCats = async () => {
    try {
      const res = await fetch(`${API_BASE}/cats`)
      const data = await res.json()
      setCats(data)
      if (data.length > 0 && !selectedCat) {
        setSelectedCat(data[0])
      }
    } catch (err) {
      console.error('获取猫咪列表失败:', err)
    }
  }

  const navigateTo = (page, cat = null) => {
    setCurrentPage(page)
    if (cat) {
      setSelectedCat(cat)
    }
  }

  const renderPage = () => {
    switch (currentPage) {
      case 'home':
        return (
          <Home 
            cats={cats} 
            selectedCat={selectedCat}
            onSelectCat={setSelectedCat}
            onNavigate={navigateTo}
            onRefresh={fetchCats}
          />
        )
      case 'create':
        return (
          <CreateCat 
            onNavigate={navigateTo}
            onRefresh={fetchCats}
          />
        )
      case 'edit':
        return (
          <EditCat 
            cat={selectedCat}
            onNavigate={navigateTo}
            onRefresh={fetchCats}
          />
        )
      case 'record':
        return (
          <FoodRecord 
            cat={selectedCat}
            onNavigate={navigateTo}
          />
        )
      case 'analysis':
        return (
          <HealthAnalysis 
            cat={selectedCat}
            onNavigate={navigateTo}
          />
        )
      default:
        return <Home cats={cats} selectedCat={selectedCat} onSelectCat={setSelectedCat} onNavigate={navigateTo} />
    }
  }

  return (
    <div className="app-container">
      {renderPage()}
    </div>
  )
}

export default App
