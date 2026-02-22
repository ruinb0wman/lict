import { app, BrowserWindow, ipcMain, screen, globalShortcut, clipboard, Tray, Menu } from 'electron'
import { fileURLToPath } from 'node:url'
import path from 'node:path'
import fs from 'node:fs'
import Store from 'electron-store'

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

type FavoriteWord = {
  id: string
  word: string
  translation: string
  phonetic?: string
  createdAt: number
  queryData: QueryResult
}

type HistoryItemType = 'word' | 'sentence'

type HistoryItem = {
  id: string
  word: string
  type: HistoryItemType
  result: QueryResponse
  timestamp: number
}

const __dirname = path.dirname(fileURLToPath(import.meta.url))

// ==================== 配置存储 ====================
const store = new Store<{
  windowX?: number
  windowY?: number
  settings?: Record<string, unknown>
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
    icon: path.join(process.env.VITE_PUBLIC, 'electron-vite.svg'),
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
  // 根据平台选择图标格式（Linux 需要 PNG，其他平台可以使用 SVG）
  const iconFileName = process.platform === 'linux' ? 'icon.png' : 'electron-vite.svg'
  const iconPath = VITE_DEV_SERVER_URL
    ? path.join(process.env.VITE_PUBLIC, iconFileName)
    : path.join(RENDERER_DIST, iconFileName)

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

const DATA_DIR = path.join(app.getPath('userData'), 'dict-data')
const FAVORITES_FILE = path.join(DATA_DIR, 'favorites.json')
const HISTORY_FILE = path.join(DATA_DIR, 'history.json')

// 确保数据目录存在
function ensureDataDir() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true })
  }
}

// 读取 JSON 文件
function readJsonFile<T>(filePath: string, defaultValue: T): T {
  try {
    if (!fs.existsSync(filePath)) {
      return defaultValue
    }
    const content = fs.readFileSync(filePath, 'utf-8')
    return JSON.parse(content) as T
  } catch (error) {
    console.error(`Failed to read ${filePath}:`, error)
    return defaultValue
  }
}

// 写入 JSON 文件
function writeJsonFile<T>(filePath: string, data: T): boolean {
  try {
    ensureDataDir()
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf-8')
    return true
  } catch (error) {
    console.error(`Failed to write ${filePath}:`, error)
    return false
  }
}

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

// 收藏数据管理
ipcMain.handle('favorites:load', () => {
  return readJsonFile<FavoriteWord[]>(FAVORITES_FILE, [])
})

ipcMain.handle('favorites:save', (_, favorites: FavoriteWord[]) => {
  return writeJsonFile(FAVORITES_FILE, favorites)
})

// 历史数据管理
ipcMain.handle('history:load', () => {
  return readJsonFile<HistoryItem[]>(HISTORY_FILE, [])
})

ipcMain.handle('history:save', (_, history: HistoryItem[]) => {
  return writeJsonFile(HISTORY_FILE, history)
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

// 发送剪切板内容到渲染进程
function sendClipboardContent() {
  if (!win) return

  const text = clipboard.readText().trim()
  if (!text) return

  // 检查是否为英文内容
  if (!isEnglishText(text)) return

  // 防重复查询：如果与上次相同则不发送
  if (text === lastClipboardText) return

  lastClipboardText = text
  win.webContents.send('clipboard:content', text)
}

// 注册全局快捷键
function registerGlobalShortcut() {
  // 获取设置中的快捷键，默认 Alt+D
  const settings = store.get('settings', {}) as { shortcut?: string }
  const shortcut = settings.shortcut || 'Alt+D'

  // 先注销已注册的快捷键
  globalShortcut.unregisterAll()

  // 注册新的快捷键
  const registered = globalShortcut.register(shortcut, () => {
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
  })

  if (!registered) {
    console.warn(`Failed to register global shortcut: ${shortcut}`)
    // 尝试备用快捷键
    const fallbackShortcut = 'Alt+Shift+D'
    const fallbackRegistered = globalShortcut.register(fallbackShortcut, () => {
      if (!win) {
        createWindow()
        return
      }

      if (win.isVisible()) {
        win.hide()
      } else {
        win.show()
        win.focus()
        setTimeout(sendClipboardContent, 300)
      }
    })

    console.log('isRegistered:', globalShortcut.isRegistered('CommandOrControl+X'));

    if (fallbackRegistered) {
      console.info(`Registered fallback shortcut: ${fallbackShortcut}`)
      // 通知渲染进程主快捷键注册失败
      if (win) {
        win.webContents.send('shortcut:failed', shortcut, fallbackShortcut)
      }
    }
  }
}

// 单例锁
app.requestSingleInstanceLock()

// 声明自定义属性以支持应用退出标记
// 标记应用是否正在退出
let isQuitting = false

app.whenReady().then(() => {
  console.log('[electron]', process.versions.electron)
  createWindow()
  createTray()
  registerGlobalShortcut()

  // 监听窗口显示事件，读取剪切板
  app.on('browser-window-focus', () => {
    setTimeout(sendClipboardContent, 300)
  })
})

// 应用退出前注销快捷键
app.on('will-quit', () => {
  globalShortcut.unregisterAll()
})
