import { app, BrowserWindow, ipcMain, screen, clipboard, Tray, Menu, dialog } from 'electron'
import fs from 'node:fs'
import { fileURLToPath } from 'node:url'
import path from 'node:path'
import Store from 'electron-store'
import { getAudioUrl } from 'google-tts-api'
import playSound from 'play-sound'

const player = playSound({})

// ==================== 类型定义 ====================

type TranslationMap = {
  [key: string]: string[]
}

type ExampleSentence = {
  en: string
  zh: string
}

type QueryResult = {
  word: string
  phonetic?: string
  translation: TranslationMap
  example: ExampleSentence[]
}

type SentenceTranslation = {
  type: 'sentence'
  original: string
  translation: string
}

type QueryResponse = QueryResult | SentenceTranslation

type HistoryItemType = 'word' | 'sentence'

type HistoryItem = {
  id: string
  word: string
  type: HistoryItemType
  result: QueryResponse
  timestamp: number
}

type FavoriteWord = {
  id: string
  word: string
  translation: string
  phonetic?: string
  createdAt: number
  queryData: QueryResult
  reviewCount: number
  lastReviewedAt?: number
  masteryLevel: number
}

const __dirname = path.dirname(fileURLToPath(import.meta.url))

// ==================== 配置存储 ====================
const store = new Store<{
  windowX?: number
  windowY?: number
  settings?: Record<string, unknown>
  history?: HistoryItem[]
}>()

// The built directory structure
process.env.APP_ROOT = path.join(__dirname, '..')
export const VITE_DEV_SERVER_URL = process.env['VITE_DEV_SERVER_URL']
export const MAIN_DIST = path.join(process.env.APP_ROOT, 'dist-electron')
export const RENDERER_DIST = path.join(process.env.APP_ROOT, 'dist')

process.env.VITE_PUBLIC = VITE_DEV_SERVER_URL ? path.join(process.env.APP_ROOT, 'public') : RENDERER_DIST

let win: BrowserWindow | null
let tray: Tray | null = null

// 窗口尺寸
const WINDOW_WIDTH = 400
const WINDOW_HEIGHT = 600

function createWindow() {
  // 获取保存的窗口位置或使用默认位置（屏幕中心）
  const savedX = store.get('windowX')
  const savedY = store.get('windowY')

  let x: number | undefined
  let y: number | undefined

  if (savedX !== undefined && savedY !== undefined) {
    x = savedX
    y = savedY
  } else {
    // 默认居中显示
    const primaryDisplay = screen.getPrimaryDisplay()
    const { width, height } = primaryDisplay.workAreaSize
    x = Math.round((width - WINDOW_WIDTH) / 2)
    y = Math.round((height - WINDOW_HEIGHT) / 2)
  }

  win = new BrowserWindow({
    width: WINDOW_WIDTH,
    height: WINDOW_HEIGHT,
    x,
    y,
    minWidth: WINDOW_WIDTH,
    maxWidth: WINDOW_WIDTH,
    minHeight: WINDOW_HEIGHT,
    maxHeight: WINDOW_HEIGHT,
    frame: false, // 无边框窗口
    resizable: false, // 不可调整大小
    fullscreenable: false,
    maximizable: false,
    titleBarStyle: 'hidden',
    show: false, // 初始不显示窗口，等托盘准备好后再显示
    icon: path.join(process.env.VITE_PUBLIC, 'icon.png'),
    webPreferences: {
      preload: path.join(__dirname, 'preload.mjs'),
      contextIsolation: true,
      nodeIntegration: false,
    },
  })

  // 窗口移动时保存位置
  win.on('moved', () => {
    if (win) {
      const [newX, newY] = win.getPosition()
      store.set('windowX', newX)
      store.set('windowY', newY)
    }
  })

  // 窗口关闭时隐藏而不是退出
  win.on('close', (event) => {
    // 如果应用正在退出，则允许关闭
    if (isQuitting) {
      win = null
      return
    }
    // 否则阻止关闭，改为隐藏窗口
    event.preventDefault()
    win?.hide()
  })

  // Test active push message to Renderer-process.
  win.webContents.on('did-finish-load', () => {
    win?.webContents.send('main-process-message', (new Date).toLocaleString())
  })

  if (VITE_DEV_SERVER_URL) {
    win.loadURL(VITE_DEV_SERVER_URL)
  } else {
    win.loadFile(path.join(RENDERER_DIST, 'index.html'))
  }

  return win
}

// ==================== 系统托盘 ====================

function createTray() {
  // 使用 book-a.png 作为托盘图标
  const iconPath = VITE_DEV_SERVER_URL
    ? path.join(process.env.VITE_PUBLIC, 'icon.png')
    : path.join(RENDERER_DIST, 'book-a.png')

  tray = new Tray(iconPath)
  tray.setToolTip('Dict - AI 词典工具')

  // 创建右键菜单
  const contextMenu = Menu.buildFromTemplate([
    {
      label: '显示/隐藏窗口',
      click: () => {
        toggleWindow()
      }
    },
    { type: 'separator' },
    {
      label: '退出',
      click: () => {
        isQuitting = true
        app.quit()
      }
    }
  ])

  tray.setContextMenu(contextMenu)

  // 左键点击托盘图标切换窗口显示/隐藏
  tray.on('click', () => {
    toggleWindow()
  })

  // macOS 上双击托盘图标也切换窗口
  tray.on('double-click', () => {
    toggleWindow()
  })
}

// 切换窗口显示/隐藏
function toggleWindow() {
  if (!win) {
    createWindow()
    return
  }

  if (win.isVisible()) {
    win.hide()
  } else {
    win.show()
    win.focus()
    // 窗口显示时读取剪切板
    setTimeout(sendClipboardContent, 300)
  }
}

// ==================== 数据文件存储 ====================
// 历史记录现在使用 electron-store 存储，不再需要 JSON 文件
// 保留 data:getPath 以保持兼容性
const DATA_DIR = path.join(app.getPath('userData'), 'dict-data')

// ==================== IPC 处理器 ====================

// 窗口控制
ipcMain.handle('window:minimize', () => {
  win?.minimize()
})

ipcMain.handle('window:close', () => {
  // 关闭按钮改为隐藏窗口
  win?.hide()
})

ipcMain.handle('window:hide', () => {
  win?.hide()
})

ipcMain.handle('window:show', () => {
  if (win) {
    win.show()
    win.focus()
  }
})

// 设置管理
ipcMain.handle('settings:get', () => {
  return store.get('settings', {})
})

ipcMain.handle('settings:set', (_, settings: Record<string, unknown>) => {
  store.set('settings', settings)
  return true
})

// 数据目录
ipcMain.handle('data:getPath', () => {
  return DATA_DIR
})

// 历史数据管理（使用 electron-store）
ipcMain.handle('history:load', () => {
  return store.get('history', [])
})

ipcMain.handle('history:save', (_, history: HistoryItem[]) => {
  store.set('history', history)
  return true
})

// 语音播放（使用 Google Translate TTS + play-sound）
ipcMain.handle('speech:speak', async (_, word: string) => {
  try {
    console.log('[Main] 播放单词:', word)
    
    // 获取 Google Translate TTS 音频 URL
    const audioUrl = getAudioUrl(word, {
      lang: 'en',
      slow: false,
      host: 'https://translate.google.com',
    })
    
    console.log('[Main] TTS URL:', audioUrl.substring(0, 100) + '...')
    
    return new Promise((resolve, reject) => {
      // 使用 play-sound 播放音频
      player.play(audioUrl, (err: Error | null) => {
        if (err) {
          console.error('[Main] 语音播放失败:', err)
          reject(err)
        } else {
          console.log('[Main] 语音播放完成')
          resolve(true)
        }
      })
    })
  } catch (error) {
    console.error('[Main] 语音播放异常:', error)
    throw error
  }
})

// 收藏数据导入导出
ipcMain.handle('favorites:export', async (_, favorites: FavoriteWord[]) => {
  try {
    const { filePath } = await dialog.showSaveDialog({
      title: '导出收藏单词',
      defaultPath: `favorites_${new Date().toISOString().split('T')[0]}.json`,
      filters: [
        { name: 'JSON Files', extensions: ['json'] },
        { name: 'All Files', extensions: ['*'] }
      ]
    })
    
    if (!filePath) {
      return { success: false, cancelled: true }
    }
    
    const exportData = {
      version: '1.0',
      exportDate: Date.now(),
      favorites: favorites
    }
    
    fs.writeFileSync(filePath, JSON.stringify(exportData, null, 2), 'utf-8')
    return { success: true, filePath }
  } catch (error) {
    console.error('Export favorites failed:', error)
    return { success: false, error: String(error) }
  }
})

ipcMain.handle('favorites:import', async () => {
  try {
    const { filePaths } = await dialog.showOpenDialog({
      title: '导入收藏单词',
      filters: [
        { name: 'JSON Files', extensions: ['json'] },
        { name: 'All Files', extensions: ['*'] }
      ],
      properties: ['openFile']
    })
    
    if (!filePaths || filePaths.length === 0) {
      return { success: false, cancelled: true }
    }
    
    const fileContent = fs.readFileSync(filePaths[0], 'utf-8')
    const importData = JSON.parse(fileContent)
    
    // 验证数据结构
    if (!importData.favorites || !Array.isArray(importData.favorites)) {
      return { success: false, error: 'Invalid file format: favorites array not found' }
    }
    
    // 验证每个收藏项的必要字段
    const validFavorites = importData.favorites.filter((f: FavoriteWord) => {
      return f.id && f.word && f.queryData && f.createdAt
    })
    
    return { 
      success: true, 
      favorites: validFavorites,
      totalCount: importData.favorites.length,
      validCount: validFavorites.length
    }
  } catch (error) {
    console.error('Import favorites failed:', error)
    return { success: false, error: String(error) }
  }
})

// 应用生命周期
app.on('window-all-closed', () => {
  // 不退出应用，保持托盘图标运行
  // if (process.platform !== 'darwin') {
  //   app.quit()
  //   win = null
  // }
})

app.on('activate', () => {
  // macOS 上点击 dock 图标时显示窗口
  if (win === null) {
    createWindow()
  } else {
    win.show()
  }
})

let lastClipboardText = ''

// 检查文本是否为英文内容
function isEnglishText(text: string): boolean {
  // 去除首尾空格
  const trimmed = text.trim()
  if (!trimmed) return false
  // 判断是否为英文：只包含 ASCII 字符（包括标点符号）
  // 至少包含一个字母
  const hasLetter = /[a-zA-Z]/.test(trimmed)
  // 只包含允许的字符（字母、数字、空格、常见标点）
  // eslint-disable-next-line no-control-regex
  const isValidChars = /^[\x00-\x7F]+$/.test(trimmed)
  return hasLetter && isValidChars
}

// 检查文本是否为单词（而非句子）
function isWord(text: string): boolean {
  const trimmed = text.trim()
  if (!trimmed) return false
  
  // 单词条件：
  // 1. 不包含空格（句子通常包含空格）
  // 2. 只包含字母和连字符（如 well-known）
  // 3. 至少包含一个字母
  // 4. 长度在合理范围内（1-50个字符）
  // 5. 不包含句子标点符号（句号、问号、感叹号、逗号、分号、冒号等）
  
  const hasSpace = /\s/.test(trimmed)
  if (hasSpace) return false
  
  const hasSentencePunctuation = /[.!?,:;"'()\[\]{}]/.test(trimmed)
  if (hasSentencePunctuation) return false
  
  const hasLetter = /[a-zA-Z]/.test(trimmed)
  if (!hasLetter) return false
  
  const isValidChars = /^[a-zA-Z-]+$/.test(trimmed)
  if (!isValidChars) return false
  
  const length = trimmed.length
  if (length < 1 || length > 50) return false
  
  return true
}

// 发送剪切板内容到渲染进程
function sendClipboardContent() {
  if (!win) return

  const text = clipboard.readText().trim()
  if (!text) return

  // 检查是否为英文内容
  if (!isEnglishText(text)) return

  // 检查是否为单词（而非句子），只有单词才自动翻译
  if (!isWord(text)) return

  // 防重复查询：如果与上次相同则不发送
  if (text === lastClipboardText) return

  lastClipboardText = text
  win.webContents.send('clipboard:content', text)
}

// 标记应用是否正在退出
let isQuitting = false

// ==================== 单例锁 ====================
// 请求单例锁，确保只有一个应用实例在运行
// 在 Wayland 环境下（如 niri），可以通过配置快捷键来 spawn 应用
// 如果应用已在运行，会触发 second-instance 事件，显示已有窗口
const gotTheLock = app.requestSingleInstanceLock()

if (!gotTheLock) {
  // 如果没有获得锁，说明已有实例在运行，直接退出
  console.log('[electron] Another instance is running, quitting...')
  app.quit()
} else {
  // 获得锁，监听第二个实例启动事件
  app.on('second-instance', () => {
    console.log('[electron] Second instance started, showing window...')
    // 当运行第二个实例时，让第一个实例显示窗口
    if (win) {
      if (win.isMinimized()) win.restore()
      win.show()
      win.focus()
      // 窗口显示时读取剪切板
      setTimeout(sendClipboardContent, 300)
    } else {
      createWindow()
    }
  })

  app.whenReady().then(() => {
    console.log('[electron]', process.versions.electron)
    createWindow()
    createTray()

    // 监听窗口显示事件，读取剪切板
    app.on('browser-window-focus', () => {
      setTimeout(sendClipboardContent, 300)
    })
  })
}
