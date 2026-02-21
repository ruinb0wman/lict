import { useEffect, useState, useCallback } from 'react'
import { Loader2, Keyboard } from 'lucide-react'
import { useSettingsStore } from '@/stores/settingsStore'

export function Settings() {
  const settings = useSettingsStore()
  const [formData, setFormData] = useState({
    apiBaseUrl: settings.apiBaseUrl,
    apiKey: settings.apiKey,
    model: settings.model,
    temperature: settings.temperature,
    historyLimit: settings.historyLimit,
    shortcut: settings.shortcut,
  })
  const [isRecordingShortcut, setIsRecordingShortcut] = useState(false)
  const [isTesting, setIsTesting] = useState(false)
  const [isSaving, setIsSaving] = useState(false)

  // 加载设置
  useEffect(() => {
    settings.loadSettings()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // 同步设置到表单
  useEffect(() => {
    setFormData({
      apiBaseUrl: settings.apiBaseUrl,
      apiKey: settings.apiKey,
      model: settings.model,
      temperature: settings.temperature,
      historyLimit: settings.historyLimit,
      shortcut: settings.shortcut,
    })
  }, [
    settings.apiBaseUrl,
    settings.apiKey,
    settings.model,
    settings.temperature,
    settings.historyLimit,
    settings.shortcut,
  ])

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: name === 'temperature' || name === 'historyLimit' 
        ? parseFloat(value) 
        : value,
    }))
  }

  // 快捷键录制
  const handleShortcutKeyDown = useCallback((e: React.KeyboardEvent<HTMLInputElement>) => {
    e.preventDefault()
    
    const keys: string[] = []
    if (e.metaKey) keys.push('Cmd')
    if (e.ctrlKey) keys.push('Ctrl')
    if (e.altKey) keys.push('Alt')
    if (e.shiftKey) keys.push('Shift')
    
    // 添加主键
    const key = e.key
    if (key && !['Meta', 'Control', 'Alt', 'Shift'].includes(key)) {
      keys.push(key.length === 1 ? key.toUpperCase() : key)
    }
    
    if (keys.length > 0) {
      const shortcut = keys.join('+')
      setFormData(prev => ({ ...prev, shortcut }))
      setIsRecordingShortcut(false)
    }
  }, [])

  const handleSave = async () => {
    setIsSaving(true)
    await settings.saveSettings(formData)
    setIsSaving(false)
  }

  const handleTestConnection = async () => {
    setIsTesting(true)
    
    // 先保存当前设置
    await settings.saveSettings(formData)
    
    // 测试连接
    await settings.testConnection()
    setIsTesting(false)
  }

  return (
    <div className="settings-page">
      <h2 className="page-title">设置</h2>
      
      <div className="settings-form">
        <div className="form-group">
          <label htmlFor="apiBaseUrl">API Base URL</label>
          <input
            type="text"
            id="apiBaseUrl"
            name="apiBaseUrl"
            value={formData.apiBaseUrl}
            onChange={handleChange}
            placeholder="https://api.openai.com/v1"
          />
        </div>

        <div className="form-group">
          <label htmlFor="apiKey">API Key</label>
          <input
            type="password"
            id="apiKey"
            name="apiKey"
            value={formData.apiKey}
            onChange={handleChange}
            placeholder="sk-..."
          />
        </div>

        <div className="form-group">
          <label htmlFor="model">Model</label>
          <input
            type="text"
            id="model"
            name="model"
            value={formData.model}
            onChange={handleChange}
            placeholder="gpt-3.5-turbo"
          />
        </div>

        <div className="form-row">
          <div className="form-group">
            <label htmlFor="temperature">
              Temperature: {formData.temperature}
            </label>
            <input
              type="range"
              id="temperature"
              name="temperature"
              min="0"
              max="2"
              step="0.1"
              value={formData.temperature}
              onChange={handleChange}
            />
          </div>

          <div className="form-group">
            <label htmlFor="historyLimit">历史记录数量</label>
            <input
              type="number"
              id="historyLimit"
              name="historyLimit"
              min="10"
              max="1000"
              value={formData.historyLimit}
              onChange={handleChange}
            />
          </div>
        </div>

        <div className="form-group">
          <label htmlFor="shortcut">
            <Keyboard size={14} strokeWidth={1.5} style={{ marginRight: 4, verticalAlign: 'middle' }} />
            全局快捷键
          </label>
          <input
            type="text"
            id="shortcut"
            name="shortcut"
            value={formData.shortcut}
            onChange={handleChange}
            onKeyDown={isRecordingShortcut ? handleShortcutKeyDown : undefined}
            onFocus={() => setIsRecordingShortcut(true)}
            onBlur={() => setIsRecordingShortcut(false)}
            placeholder="点击输入快捷键，如：Alt+D"
            readOnly={isRecordingShortcut}
            style={{ 
              cursor: isRecordingShortcut ? 'pointer' : 'text',
              backgroundColor: isRecordingShortcut ? 'rgba(245, 101, 101, 0.1)' : undefined 
            }}
          />
          <small style={{ color: '#6b7280', fontSize: '11px' }}>
            {isRecordingShortcut ? '按下按键组合设置快捷键...' : '点击输入框设置快捷键'}
          </small>
        </div>

        <div className="form-actions">
          <button
            className="btn btn-secondary"
            onClick={handleTestConnection}
            disabled={isTesting || !formData.apiKey}
          >
            {isTesting ? (
              <>
                <Loader2 size={16} strokeWidth={1.5} className="spin" />
                测试中...
              </>
            ) : (
              '测试连接'
            )}
          </button>
          <button
            className="btn btn-primary"
            onClick={handleSave}
            disabled={isSaving}
          >
            {isSaving ? (
              <>
                <Loader2 size={16} strokeWidth={1.5} className="spin" />
                保存中...
              </>
            ) : (
              '保存设置'
            )}
          </button>
        </div>
      </div>
    </div>
  )
}
