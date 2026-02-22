import { useState, useCallback, useEffect } from 'react'
import { Star, Edit2, Save, X, FileText, Trash2, MessageSquare, Volume2 } from 'lucide-react'
import { useAppStore } from '@/stores/appStore'
import { useFavoritesStore } from '@/stores/favoritesStore'
import { useWordsStore } from '@/stores/wordsStore'
import { isSentence } from '@/utils/api'

import type { QueryResult as QueryResultType, SentenceTranslation, TranslationMap, ExampleSentence } from '@/types'

// 单词结果编辑组件
function WordResultEdit({ 
  wordResult, 
  onSave, 
  onCancel 
}: { 
  wordResult: QueryResultType
  onSave: (translation: TranslationMap, examples: ExampleSentence[]) => void
  onCancel: () => void 
}) {
  const [translation, setTranslation] = useState<TranslationMap>(wordResult.translation)
  const [examples, setExamples] = useState<ExampleSentence[]>(wordResult.example || [])
  const [newPos, setNewPos] = useState('')
  const [newTranslation, setNewTranslation] = useState('')
  const [newEn, setNewEn] = useState('')
  const [newZh, setNewZh] = useState('')

  const handleAddTranslation = () => {
    if (newPos && newTranslation) {
      setTranslation(prev => ({
        ...prev,
        [newPos]: newTranslation.split(/[,，;；]/).map(s => s.trim()).filter(Boolean)
      }))
      setNewPos('')
      setNewTranslation('')
    }
  }

  const handleRemoveTranslation = (pos: string) => {
    setTranslation(prev => {
      const newTranslation = { ...prev }
      delete newTranslation[pos]
      return newTranslation
    })
  }

  const handleAddExample = () => {
    if (newEn && newZh) {
      setExamples(prev => [...prev, { en: newEn, zh: newZh }])
      setNewEn('')
      setNewZh('')
    }
  }

  const handleRemoveExample = (index: number) => {
    setExamples(prev => prev.filter((_, i) => i !== index))
  }

  return (
    <div className="word-result-edit">
      <div className="edit-section">
        <h4 className="edit-section-title">翻译</h4>
        {Object.entries(translation).map(([pos, translations]) => (
          <div key={pos} className="edit-translation-item">
            <span className="pos-tag">{pos}</span>
            <span className="translation-text">{translations.join('；')}</span>
            <button className="edit-remove-btn" onClick={() => handleRemoveTranslation(pos)}>
              <X size={14} strokeWidth={1.5} />
            </button>
          </div>
        ))}
        <div className="edit-add-row">
          <input
            type="text"
            placeholder="词性 (如: n.)"
            value={newPos}
            onChange={(e) => setNewPos(e.target.value)}
            className="edit-input-small"
          />
          <input
            type="text"
            placeholder="翻译 (用逗号分隔)"
            value={newTranslation}
            onChange={(e) => setNewTranslation(e.target.value)}
            className="edit-input"
          />
          <button className="edit-add-btn" onClick={handleAddTranslation}>添加</button>
        </div>
      </div>

      <div className="edit-section">
        <h4 className="edit-section-title">例句</h4>
        {examples.map((example, index) => (
          <div key={index} className="edit-example-item">
            <p className="example-en">{example.en}</p>
            <p className="example-zh">{example.zh}</p>
            <button className="edit-remove-btn" onClick={() => handleRemoveExample(index)}>
              <Trash2 size={14} strokeWidth={1.5} />
            </button>
          </div>
        ))}
        <div className="edit-add-row vertical">
          <input
            type="text"
            placeholder="英文例句"
            value={newEn}
            onChange={(e) => setNewEn(e.target.value)}
            className="edit-input"
          />
          <input
            type="text"
            placeholder="中文翻译"
            value={newZh}
            onChange={(e) => setNewZh(e.target.value)}
            className="edit-input"
          />
          <button className="edit-add-btn" onClick={handleAddExample}>添加例句</button>
        </div>
      </div>

      <div className="edit-actions">
        <button className="edit-save-btn" onClick={() => onSave(translation, examples)}>
          <Save size={16} strokeWidth={1.5} />
          保存
        </button>
        <button className="edit-cancel-btn" onClick={onCancel}>
          <X size={16} strokeWidth={1.5} />
          取消
        </button>
      </div>
    </div>
  )
}

// 批注组件
function NoteSection({ 
  wordId, 
  note, 
  onSave 
}: { 
  wordId: string
  note?: string
  onSave: (note: string) => void
}) {
  const [isEditing, setIsEditing] = useState(false)
  const [noteText, setNoteText] = useState(note || '')
  const { removeNote } = useWordsStore()

  const handleSave = () => {
    onSave(noteText)
    setIsEditing(false)
  }

  const handleRemove = () => {
    removeNote(wordId)
    setNoteText('')
  }

  if (isEditing) {
    return (
      <div className="note-section editing">
        <textarea
          className="note-textarea"
          placeholder="添加批注..."
          value={noteText}
          onChange={(e) => setNoteText(e.target.value)}
          rows={3}
        />
        <div className="note-actions">
          <button className="note-save-btn" onClick={handleSave}>
            <Save size={14} strokeWidth={1.5} />
            保存
          </button>
          <button className="note-cancel-btn" onClick={() => setIsEditing(false)}>
            <X size={14} strokeWidth={1.5} />
            取消
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="note-section">
      {note ? (
        <div className="note-content">
          <div className="note-header">
            <MessageSquare size={14} strokeWidth={1.5} />
            <span>批注</span>
          </div>
          <p className="note-text">{note}</p>
          <div className="note-actions">
            <button className="note-edit-btn" onClick={() => setIsEditing(true)}>
              <Edit2 size={14} strokeWidth={1.5} />
              编辑
            </button>
            <button className="note-delete-btn" onClick={handleRemove}>
              <Trash2 size={14} strokeWidth={1.5} />
              删除
            </button>
          </div>
        </div>
      ) : (
        <button className="note-add-btn" onClick={() => setIsEditing(true)}>
          <FileText size={14} strokeWidth={1.5} />
          添加批注
        </button>
      )}
    </div>
  )
}

export function QueryResultView() {
  const { queryResult, isLoading, error, lastQuery } = useAppStore()
  const { isFavorite, toggleFavorite } = useFavoritesStore()
  const { cachedWords, updateWordTranslation, updateWordExamples, addNote } = useWordsStore()
  const [isEditing, setIsEditing] = useState(false)

  // 预加载语音列表（Electron 中 Web Speech API 需要这个）
  useEffect(() => {
    if (!('speechSynthesis' in window)) {
      console.log('[Speak] 浏览器不支持 Web Speech API')
      return
    }
    
    const synth = window.speechSynthesis
    
    // 尝试获取语音列表
    const voices = synth.getVoices()
    console.log('[Speak] 初始化语音列表:', voices.length, '个语音')
    
    // 如果为空，监听 voiceschanged 事件
    if (voices.length === 0) {
      const handleVoicesChanged = () => {
        const loadedVoices = synth.getVoices()
        console.log('[Speak] 语音列表已加载:', loadedVoices.length, '个语音')
        console.log('[Speak] 语音示例:', loadedVoices.slice(0, 3).map(v => `${v.name}(${v.lang})`).join(', '))
      }
      
      synth.onvoiceschanged = handleVoicesChanged
      
      // Electron 特殊处理：有些版本需要调用 speak 才能触发加载
      // 创建一个空的 utterance 来强制加载语音
      setTimeout(() => {
        if (synth.getVoices().length === 0) {
          console.log('[Speak] 尝试强制加载语音...')
          const dummyUtterance = new SpeechSynthesisUtterance('')
          dummyUtterance.volume = 0
          synth.speak(dummyUtterance)
          synth.cancel()
        }
      }, 100)
      
      return () => {
        synth.onvoiceschanged = null
      }
    }
  }, [])
  
  // 使用 Electron 主进程 TTS 作为备选方案（通过 IPC 调用 Node.js say 模块）
  const speakWithElectronTTS = useCallback(async (word: string) => {
    console.log('[Speak] 使用 Electron TTS 播放:', word)
    
    try {
      if (window.electronSpeech) {
        await window.electronSpeech.speak(word)
        console.log('[Speak] ✅ Electron TTS 播放成功')
      } else {
        console.error('[Speak] ❌ electronSpeech API 不可用')
      }
    } catch (err) {
      console.error('[Speak] ❌ Electron TTS 播放失败:', err)
    }
  }, [])
  
  // 使用 Web Speech API 播放单词发音
  const speakWord = useCallback((word: string) => {
    console.log('[Speak] ========================================')
    console.log('[Speak] 尝试播放单词:', word)
    
    if (!('speechSynthesis' in window)) {
      console.error('[Speak] 当前浏览器不支持 Web Speech API，尝试在线 TTS')
      speakWithElectronTTS(word)
      return
    }
    
    const synth = window.speechSynthesis
    
    // 获取语音列表
    let voices = synth.getVoices()
    console.log('[Speak] 初始语音列表数量:', voices.length)
    
    // 如果语音列表为空，尝试等待加载
    if (voices.length === 0) {
      console.log('[Speak] 语音列表为空，尝试重新加载...')
      // 触发语音加载
      synth.onvoiceschanged = () => {
        console.log('[Speak] 语音列表加载完成事件触发')
      }
      // 某些 Electron 版本需要 cancel() 来触发加载
      synth.cancel()
      voices = synth.getVoices()
      console.log('[Speak] 重新加载后语音数量:', voices.length)
    }
    
    // 如果没有可用语音，使用 Electron TTS 备选方案
    if (voices.length === 0) {
      console.warn('[Speak] 没有本地语音可用，切换到 Electron TTS')
      speakWithElectronTTS(word)
      return
    }
    
    console.log('[Speak] SpeechSynthesis 状态:', {
      pending: synth.pending,
      speaking: synth.speaking,
      paused: synth.paused,
      voicesCount: voices.length
    })
    
    // 打印所有可用语音（用于调试）
    const voiceList = voices.slice(0, 10).map(v => `${v.name}(${v.lang})`).join(', ')
    console.log('[Speak] 可用语音(前10):', voiceList, voices.length > 10 ? `...等共${voices.length}个` : '')
    
    // 选择英语语音，优先选择 Google US English 或 Microsoft 语音
    let selectedVoice = voices.find(v => 
      v.name.includes('Google US English') || 
      v.name.includes('Microsoft David') ||
      v.name.includes('Microsoft Zira')
    ) || voices.find(v => v.lang.startsWith('en'))
    
    // 如果还是没有，使用第一个可用语音
    if (!selectedVoice && voices.length > 0) {
      selectedVoice = voices[0]
    }
    
    console.log('[Speak] 选择的语音:', selectedVoice ? `${selectedVoice.name} (${selectedVoice.lang})` : '无')
    
    // 取消正在播放的语音
    synth.cancel()
    console.log('[Speak] 已取消之前的播放')
    
    const utterance = new SpeechSynthesisUtterance(word)
    
    if (selectedVoice) {
      utterance.voice = selectedVoice
      console.log('[Speak] 已设置语音')
    }
    
    utterance.lang = 'en-US'
    utterance.rate = 0.9
    utterance.pitch = 1
    utterance.volume = 1
    
    // 添加事件监听
    utterance.onstart = () => console.log('[Speak] ✅ 开始播放')
    utterance.onend = () => console.log('[Speak] ✅ 播放结束')
    utterance.onerror = (event) => {
      console.error('[Speak] ❌ 播放错误:', event.error)
      console.error('[Speak] 错误详情:', {
        error: event.error,
        charIndex: event.charIndex,
        elapsedTime: event.elapsedTime,
        name: event.name
      })
      // 如果本地播放失败，尝试 Electron TTS
      if (event.error !== 'canceled') {
        console.log('[Speak] 本地播放失败，尝试 Electron TTS')
        speakWithElectronTTS(word)
      }
    }
    utterance.onpause = () => console.log('[Speak] 播放暂停')
    utterance.onresume = () => console.log('[Speak] 播放恢复')
    utterance.onboundary = (event) => console.log('[Speak] 边界事件:', event.name, 'at', event.charIndex)
    
    console.log('[Speak] 调用 speak()...')
    synth.speak(utterance)
    
    // 检查是否成功加入队列
    setTimeout(() => {
      console.log('[Speak] 500ms后状态:', {
        pending: synth.pending,
        speaking: synth.speaking,
        paused: synth.paused
      })
      
      // 如果既没有 pending 也没有 speaking，可能是失败了
      if (!synth.pending && !synth.speaking) {
        console.error('[Speak] ❌ 语音可能没有成功播放（pending和speaking都为false）')
        console.log('[Speak] 尝试使用 Electron TTS 备选方案')
        speakWithElectronTTS(word)
      }
    }, 500)
    
    // Electron 中的特殊处理：定时 resume 以防止语音被挂起
    const resumeInterval = setInterval(() => {
      if (synth.paused) {
        console.log('[Speak] 检测到暂停状态，尝试恢复')
        synth.resume()
      }
      if (!synth.speaking && !synth.pending) {
        clearInterval(resumeInterval)
      }
    }, 100)
    
    // 5秒后清理定时器
    setTimeout(() => clearInterval(resumeInterval), 5000)
  }, [speakWithElectronTTS])

  // 从缓存获取当前单词的完整数据（包含批注）
  const getCachedWordData = (word: string) => {
    return cachedWords.find(w => w.word.toLowerCase() === word.toLowerCase())
  }

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
  const cachedWord = getCachedWordData(wordResult.word)

  const handleToggleFavorite = () => {
    toggleFavorite(wordResult.word, wordResult)
  }

  const handleSaveEdit = async (translation: TranslationMap, examples: ExampleSentence[]) => {
    if (cachedWord) {
      await updateWordTranslation(cachedWord.id, translation)
      await updateWordExamples(cachedWord.id, examples)
      // 更新当前显示的查询结果
      useAppStore.getState().setQueryResult({
        ...wordResult,
        translation,
        example: examples,
      })
    }
    setIsEditing(false)
  }

  const handleSaveNote = async (note: string) => {
    if (cachedWord) {
      await addNote(cachedWord.id, note)
    }
  }

  return (
    <div className="query-result">
      {/* 单词标题和音标 */}
      <div className="word-header">
        <div className="word-title-row">
          <h2 className="word-title">{wordResult.word}</h2>
          <div className="word-actions">
            <button 
              className="edit-toggle-btn" 
              title={isEditing ? '取消编辑' : '编辑单词'}
              onClick={() => setIsEditing(!isEditing)}
            >
              {isEditing ? <X size={18} strokeWidth={1.5} /> : <Edit2 size={18} strokeWidth={1.5} />}
            </button>
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
        </div>
        {wordResult.phonetic && (
          <div className="word-phonetic">
            <span>{wordResult.phonetic}</span>
            <button 
              className="speak-btn"
              title="播放发音"
              onClick={() => speakWord(wordResult.word)}
            >
              <Volume2 size={16} strokeWidth={1.5} />
            </button>
          </div>
        )}
      </div>

      {isEditing ? (
        <WordResultEdit 
          wordResult={wordResult} 
          onSave={handleSaveEdit} 
          onCancel={() => setIsEditing(false)} 
        />
      ) : (
        <>
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

          {/* 批注 */}
          {cachedWord && (
            <NoteSection 
              wordId={cachedWord.id} 
              note={cachedWord.note} 
              onSave={handleSaveNote} 
            />
          )}
        </>
      )}
    </div>
  )
}
