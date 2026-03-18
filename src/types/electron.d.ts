// 预加载脚本暴露的 API 类型声明

import type { HistoryItem, FavoriteWord } from './index'

declare global {
  interface Window {
    ipcRenderer: {
      on: (channel: string, listener: (event: unknown, ...args: unknown[]) => void) => void
      off: (channel: string, listener: (...args: unknown[]) => void) => void
      send: (channel: string, ...args: unknown[]) => void
      invoke: (channel: string, ...args: unknown[]) => Promise<unknown>
    }
    electronWindow: {
      minimize: () => Promise<void>
      close: () => Promise<void>
      hide: () => Promise<void>
      show: () => Promise<void>
    }
    electronStore: {
      getSettings: () => Promise<Record<string, unknown>>
      setSettings: (settings: Record<string, unknown>) => Promise<boolean>
    }
    electronSettings: {
      export: (settings: Record<string, unknown>) => Promise<{
        success: boolean
        cancelled?: boolean
        filePath?: string
        error?: string
      }>
      import: () => Promise<{
        success: boolean
        cancelled?: boolean
        settings?: Record<string, unknown>
        error?: string
      }>
    }
    electronData: {
      getPath: () => Promise<string>
      // 收藏功能现在使用 IndexedDB，不再需要 IPC
      history: {
        load: () => Promise<HistoryItem[]>
        save: (history: HistoryItem[]) => Promise<boolean>
      }
    }
    electronClipboard: {
      onClipboardContent: (callback: (text: string) => void) => () => void
    }
    electronFavorites: {
      export: (favorites: FavoriteWord[]) => Promise<{
        success: boolean
        cancelled?: boolean
        filePath?: string
        error?: string
      }>
      import: () => Promise<{
        success: boolean
        cancelled?: boolean
        favorites?: FavoriteWord[]
        totalCount?: number
        validCount?: number
        error?: string
      }>
    }
    electronSpeech: {
      speak: (word: string) => Promise<boolean>
    }
  }
}

export {}
