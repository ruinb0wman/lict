import { Star } from 'lucide-react'
import { useAppStore } from '@/stores/appStore'
import { useFavoritesStore } from '@/stores/favoritesStore'
import { isSentence } from '@/utils/api'
import type { QueryResult as QueryResultType, SentenceTranslation } from '@/types'

export function QueryResultView() {
  const { queryResult, isLoading, error, lastQuery } = useAppStore()
  const { isFavorite, toggleFavorite } = useFavoritesStore()

  // 加载状态
  if (isLoading) {
    return (
      <div className="query-result loading">
        <div className="loading-spinner"></div>
        <p className="loading-text">正在查询...</p>
      </div>
    )
  }

  // 错误状态
  if (error) {
    return (
      <div className="query-result error">
        <p className="error-message">{error}</p>
      </div>
    )
  }

  // 空状态
  if (!queryResult) {
    return (
      <div className="query-result empty">
        <p className="empty-text">输入单词或句子开始查询</p>
      </div>
    )
  }

  // 判断是句子翻译还是单词查询
  const isSentenceResult = isSentence(lastQuery) || 'type' in queryResult

  if (isSentenceResult) {
    // 句子翻译结果
    const sentenceResult = queryResult as SentenceTranslation
    return (
      <div className="query-result">
        <div className="sentence-result">
          <h3 className="sentence-original">{sentenceResult.original || lastQuery}</h3>
          <p className="sentence-translation">{sentenceResult.translation}</p>
        </div>
      </div>
    )
  }

  // 单词查询结果
  const wordResult = queryResult as QueryResultType
  const favorited = isFavorite(wordResult.word)

  const handleToggleFavorite = () => {
    toggleFavorite(wordResult.word, wordResult)
  }

  return (
    <div className="query-result">
      {/* 单词标题和音标 */}
      <div className="word-header">
        <div className="word-title-row">
          <h2 className="word-title">{wordResult.word}</h2>
          <button 
            className={`favorite-btn ${favorited ? 'active' : ''}`} 
            title={favorited ? '取消收藏' : '收藏'}
            onClick={handleToggleFavorite}
          >
            <Star 
              size={20} 
              strokeWidth={1.5} 
              fill={favorited ? 'currentColor' : 'none'} 
            />
          </button>
        </div>
        {wordResult.phonetic && (
          <div className="word-phonetic">
            <span>{wordResult.phonetic}</span>
          </div>
        )}
      </div>

      {/* 词性和翻译 */}
      <div className="word-translations">
        {Object.entries(wordResult.translation).map(([pos, translations]) => (
          <div key={pos} className="translation-item">
            <span className="pos-tag">{pos}</span>
            <span className="translation-text">
              {translations.join('；')}
            </span>
          </div>
        ))}
      </div>

      {/* 例句 */}
      {wordResult.example && wordResult.example.length > 0 && (
        <div className="word-examples">
          <h4 className="section-title">例句</h4>
          {wordResult.example.map((example, index) => (
            <div key={index} className="example-item">
              <p className="example-en">{example.en}</p>
              <p className="example-zh">{example.zh}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
