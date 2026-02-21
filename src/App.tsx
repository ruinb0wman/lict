import { useEffect } from 'react'
import { TitleBar } from '@/components/TitleBar'
import { SearchBox } from '@/components/SearchBox'
import { QueryResultView } from '@/components/QueryResult'
import { BottomNav } from '@/components/BottomNav'
import { Settings } from '@/pages/Settings'
import { useAppStore } from '@/stores/appStore'
import { useSettingsStore } from '@/stores/settingsStore'
import './index.css'

function SearchPage() {
  return (
    <div className="search-page">
      <SearchBox />
      <div className="result-container">
        <QueryResultView />
      </div>
    </div>
  )
}

function FavoritesPage() {
  return (
    <div className="page-content">
      <h2 className="page-title">收藏</h2>
      <p className="empty-text">暂无收藏单词</p>
    </div>
  )
}

function HistoryPage() {
  return (
    <div className="page-content">
      <h2 className="page-title">历史记录</h2>
      <p className="empty-text">暂无查询记录</p>
    </div>
  )
}

function App() {
  const { currentPage } = useAppStore()
  const { loadSettings } = useSettingsStore()

  // 应用启动时加载设置
  useEffect(() => {
    loadSettings()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // 根据当前页面渲染不同内容
  const renderPage = () => {
    switch (currentPage) {
      case 'search':
        return <SearchPage />
      case 'favorites':
        return <FavoritesPage />
      case 'history':
        return <HistoryPage />
      case 'settings':
        return <Settings />
      default:
        return <SearchPage />
    }
  }

  return (
    <div className="app">
      <TitleBar />
      <main className="main-content">
        {renderPage()}
      </main>
      <BottomNav />
    </div>
  )
}

export default App
