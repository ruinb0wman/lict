import { app, BrowserWindow, ipcMain, screen } from 'electron'
import { fileURLToPath } from 'node:url'
import path from 'node:path'
import Store from 'electron-store'

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

  // 窗口关闭时清理
  win.on('closed', () => {
    win = null
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
}

// ==================== IPC 处理器 ====================

// 窗口控制
ipcMain.handle('window:minimize', () => {
  win?.minimize()
})

ipcMain.handle('window:close', () => {
  win?.close()
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

// 应用生命周期
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
    win = null
  }
})

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow()
  }
})

app.whenReady().then(createWindow)
