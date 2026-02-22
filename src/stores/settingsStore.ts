import { create } from 'zustand'
import { Settings, defaultSettings } from '@/types'
import { useAppStore } from '@/stores/appStore'

interface SettingsState extends Settings {
  isLoading: boolean
  loadSettings: () => Promise<void>
  saveSettings: (settings: Partial<Settings>) => Promise<void>
  testConnection: () => Promise<{ success: boolean; message: string }>
}

export const useSettingsStore = create<SettingsState>((set, get) => ({
  // 默认值
  ...defaultSettings,
  isLoading: false,

  // 加载设置
  loadSettings: async () => {
    set({ isLoading: true })
    try {
      const savedSettings = await window.electronStore.getSettings()
      set({
        apiBaseUrl: (savedSettings.apiBaseUrl as string) || defaultSettings.apiBaseUrl,
        apiKey: (savedSettings.apiKey as string) || defaultSettings.apiKey,
        model: (savedSettings.model as string) || defaultSettings.model,
        temperature: (savedSettings.temperature as number) ?? defaultSettings.temperature,
        historyLimit: (savedSettings.historyLimit as number) || defaultSettings.historyLimit,

        isLoading: false,
      })
    } catch (error) {
      console.error('Failed to load settings:', error)
      set({ isLoading: false })
      setTimeout(() => {
        useAppStore.getState().showToast('加载设置失败', 'error')
      }, 0)
    }
  },

  // 保存设置
  saveSettings: async (newSettings) => {
    set({ isLoading: true })
    try {
      const current = get()
      const merged = {
        apiBaseUrl: newSettings.apiBaseUrl ?? current.apiBaseUrl,
        apiKey: newSettings.apiKey ?? current.apiKey,
        model: newSettings.model ?? current.model,
        temperature: newSettings.temperature ?? current.temperature,
        historyLimit: newSettings.historyLimit ?? current.historyLimit,

      }
      await window.electronStore.setSettings(merged)
      set({ ...merged, isLoading: false })
      setTimeout(() => {
        useAppStore.getState().showToast('设置已保存', 'success')
      }, 0)
    } catch (error) {
      console.error('Failed to save settings:', error)
      set({ isLoading: false })
      setTimeout(() => {
        useAppStore.getState().showToast('保存设置失败', 'error')
      }, 0)
    }
  },

  // 测试 API 连接
  testConnection: async () => {
    const { apiBaseUrl, apiKey, model } = get()
    
    if (!apiKey) {
      return { success: false, message: '请先输入 API Key' }
    }

    try {
      const response = await fetch(`${apiBaseUrl}/chat/completions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model,
          messages: [{ role: 'user', content: 'Hello' }],
          max_tokens: 5,
        }),
      })

      if (response.ok) {
        setTimeout(() => {
          useAppStore.getState().showToast('API 连接测试成功', 'success')
        }, 0)
        return { success: true, message: '连接成功！' }
      } else {
        const errorData = await response.json().catch(() => ({}))
        const message = errorData.error?.message || response.statusText
        setTimeout(() => {
          useAppStore.getState().showToast(`连接失败: ${message}`, 'error', 5000)
        }, 0)
        return { 
          success: false, 
          message: `连接失败: ${message}` 
        }
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : '未知错误'
      setTimeout(() => {
        useAppStore.getState().showToast(`网络错误: ${message}`, 'error', 5000)
      }, 0)
      return { 
        success: false, 
        message: `网络错误: ${message}` 
      }
    }
  },
}))
