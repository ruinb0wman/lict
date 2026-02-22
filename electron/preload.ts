import { ipcRenderer, contextBridge } from 'electron'
import type { HistoryItem } from '../src/types'

// --------- Expose some API to the Renderer process ---------
contextBridge.exposeInMainWorld('ipcRenderer', {
  on(...args: Parameters<typeof ipcRenderer.on>) {
    const [channel, listener] = args
    return ipcRenderer.on(channel, (event, ...args) => listener(event, ...args))
  },
  off(...args: Parameters<typeof ipcRenderer.off>) {
    const [channel, ...omit] = args
    return ipcRenderer.off(channel, ...omit)
  },
  send(...args: Parameters<typeof ipcRenderer.send>) {
    const [channel, ...omit] = args
    return ipcRenderer.send(channel, ...omit)
  },
  invoke(...args: Parameters<typeof ipcRenderer.invoke>) {
    const [channel, ...omit] = args
    return ipcRenderer.invoke(channel, ...omit)
  },
})

// 剪切板 API
contextBridge.exposeInMainWorld('electronClipboard', {
  // 监听剪切板内容变化
  onClipboardContent: (callback: (text: string) => void) => {
    const handler = (_: unknown, text: string) => callback(text)
    ipcRenderer.on('clipboard:content', handler)
    return () => ipcRenderer.off('clipboard:content', handler)
  },
})

// 窗口控制 API
contextBridge.exposeInMainWorld('electronWindow', {
  minimize: () => ipcRenderer.invoke('window:minimize'),
  close: () => ipcRenderer.invoke('window:close'),
  hide: () => ipcRenderer.invoke('window:hide'),
  show: () => ipcRenderer.invoke('window:show'),
})

// 设置管理 API
contextBridge.exposeInMainWorld('electronStore', {
  getSettings: () => ipcRenderer.invoke('settings:get'),
  setSettings: (settings: Record<string, unknown>) => ipcRenderer.invoke('settings:set', settings),
})

// 数据存储 API
contextBridge.exposeInMainWorld('electronData', {
  getPath: () => ipcRenderer.invoke('data:getPath'),
  // 收藏功能现在使用 IndexedDB，不再需要 IPC
  history: {
    load: () => ipcRenderer.invoke('history:load'),
    save: (history: HistoryItem[]) => ipcRenderer.invoke('history:save', history),
  },
})


