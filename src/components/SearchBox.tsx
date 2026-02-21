import { useState, useEffect, useCallback, KeyboardEvent, FormEvent } from 'react'
import { Search, Loader2 } from 'lucide-react'
import { useAppStore } from '@/stores/appStore'
import { useSettingsStore } from '@/stores/settingsStore'
import { useHistoryStore } from '@/stores/historyStore'
import { queryLLM } from '@/utils/api'

export function SearchBox() {
  const [input, setInput] = useState('')
  const { isLoading, setLoading, setQueryResult, setError, setLastQuery, lastQuery, showToast } = useAppStore()
  const settings = useSettingsStore()
  const { addHistory } = useHistoryStore()

  // 执行查询的通用函数
  const performSearch = useCallback(async (queryText: string) => {
    if (!queryText || isLoading) return

    // 检查是否已配置 API Key
    if (!settings.apiKey) {
      showToast('请先设置 API Key', 'warning')
      setError('请先设置 API Key')
      return
    }

    // 防重复查询
    if (queryText === lastQuery) return

    setLoading(true)
    setError(null)
    setLastQuery(queryText)

    try {
      const result = await queryLLM(queryText, settings)
      setQueryResult(result)
      // 保存到历史记录
      await addHistory(queryText, result, settings.historyLimit)
      showToast('查询成功', 'success', 2000)
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : '查询失败'
      setError(errorMessage)
      setQueryResult(null)
      showToast(errorMessage, 'error', 5000)
    } finally {
      setLoading(false)
    }
  }, [isLoading, lastQuery, settings, setLoading, setError, setLastQuery, setQueryResult, addHistory, showToast])

  const handleSearch = async () => {
    const trimmedInput = input.trim()
    if (!trimmedInput) return
    await performSearch(trimmedInput)
  }

  // 监听剪切板内容变化
  useEffect(() => {
    // 检查是否在 Electron 环境中
    if (!window.electronClipboard) return

    // 注册剪切板监听
    const unsubscribe = window.electronClipboard.onClipboardContent((text) => {
      // 防重复查询：如果与上次查询相同则不处理
      if (text === lastQuery) return
      
      // 自动填充输入框
      setInput(text)
      // 自动触发查询
      performSearch(text)
    })

    return () => {
      unsubscribe()
    }
  }, [lastQuery, performSearch])

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
