import { useState, KeyboardEvent, FormEvent } from 'react'
import { Search, Loader2 } from 'lucide-react'
import { useAppStore } from '@/stores/appStore'
import { useSettingsStore } from '@/stores/settingsStore'
import { queryLLM } from '@/utils/api'

export function SearchBox() {
  const [input, setInput] = useState('')
  const { isLoading, setLoading, setQueryResult, setError, setLastQuery } = useAppStore()
  const settings = useSettingsStore()

  const handleSearch = async () => {
    const trimmedInput = input.trim()
    if (!trimmedInput || isLoading) return

    // 检查是否已配置 API Key
    if (!settings.apiKey) {
      setError('请先设置 API Key')
      return
    }

    setLoading(true)
    setError(null)
    setLastQuery(trimmedInput)

    try {
      const result = await queryLLM(trimmedInput, settings)
      setQueryResult(result)
    } catch (error) {
      setError(error instanceof Error ? error.message : '查询失败')
      setQueryResult(null)
    } finally {
      setLoading(false)
    }
  }

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSearch()
    }
  }

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault()
    handleSearch()
  }

  return (
    <form onSubmit={handleSubmit} className="search-box">
      <div className="search-input-wrapper">
        <Search className="search-icon" size={20} strokeWidth={1.5} />
        <input
          type="text"
          className="search-input"
          placeholder="输入单词或句子..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          disabled={isLoading}
        />
        {isLoading && (
          <Loader2 className="search-loading" size={18} strokeWidth={1.5} />
        )}
      </div>
    </form>
  )
}
