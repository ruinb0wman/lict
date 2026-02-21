// 预加载脚本暴露的 API 类型声明

import type { FavoriteWord, HistoryItem } from './index'

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
    electronData: {
      getPath: () => Promise<string>
      favorites: {
        load: () => Promise<FavoriteWord[]>
        save: (favorites: FavoriteWord[]) => Promise<boolean>
      }
      history: {
        load: () => Promise<HistoryItem[]>
        save: (history: HistoryItem[]) => Promise<boolean>
      }
    }
    electronClipboard: {
      onClipboardContent: (callback: (text: string) => void) => () => void
    }
  }
}

export {}
