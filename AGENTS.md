# AGENTS.md

本文档面向 AI 编程助手，提供项目背景、技术架构和开发规范。

## 项目概述

**dict** 是一个 AI 词典工具桌面应用。它将用户输入的单词发送给配置好的大模型 API，按固定格式返回内容并渲染展示。

### 核心功能

| 功能 | 描述 |
|------|------|
| 🔍 单词查询 | 查询单词的词性、翻译和例句 |
| ⭐ 收藏单词 | 收藏感兴趣的单词以便后续复习 |
| 📚 复习单词 | 复习已收藏的单词 |
| 📝 查询历史 | 查看之前的查询记录 |
| 🌐 语句翻译 | 支持整句翻译 |
| ⚙️ 自定义配置 | 支持配置大模型 API（OpenAI 通用格式） |
| ⌨️ 快捷键 | 自定义快捷键快速唤出应用 |
| 📋 自动读取剪切板 | 自动检测剪切板英文内容并翻译 |

### 单词查询返回格式

```json
{
  "word": "查询的单词",
  "phonetic": "/音标/",
  "translation": {
    "n.": ["名词翻译(如果有)"],
    "v.": ["动词翻译(如果有)"],
    "adj.": ["形容词翻译(如果有)"]
  },
  "example": [
    { "en": "英文例句1", "zh": "对应的中文翻译" },
    { "en": "英文例句2", "zh": "对应的中文翻译" },
    { "en": "英文例句3", "zh": "对应的中文翻译" }
  ]
}
```

## 开发任务清单

详细的开发任务清单见 [README.md 中的「开发计划」章节](./README.md#开发计划)。

开发任务分为五个阶段：

1. **第一阶段：基础功能** - 项目架构、窗口配置、类型定义、状态管理、设置页面、单词查询、结果展示
2. **第二阶段：数据功能** - 本地存储、收藏功能、收藏页面、历史记录、历史页面
3. **第三阶段：增强功能** - 语句翻译、自动读取剪切板、复习模式、全局快捷键
4. **第四阶段：UI/UX 优化** - 导航布局、样式优化、错误处理、性能优化
5. **第五阶段：打包发布** - 构建配置、测试、发布

**AI 编码建议：** 按阶段逐项完成任务，每次专注于一个具体任务，完成后再进行下一个。

## 技术栈

| 类别 | 技术 |
|------|------|
| 桌面框架 | Electron 30 |
| 前端框架 | React 18 + TypeScript 5 |
| 构建工具 | Vite 5 |
| 包管理器 | Bun |
| 代码规范 | ESLint 8 + @typescript-eslint |
| 状态管理 | Zustand（建议） |
| 配置存储 | electron-store |

### 关键依赖

- `electron` - 桌面应用框架
- `react` / `react-dom` - UI 框架
- `vite-plugin-electron` - Vite Electron 集成插件
- `electron-builder` - 应用打包工具
- `electron-store` - 配置持久化
- `zustand` - 状态管理
- `uuid` - 生成唯一 ID
- `dexie` - IndexedDB 封装

## 项目结构

当前结构：

```
dict/
├── electron/               # Electron 主进程代码
│   ├── main.ts            # 主进程入口，创建 BrowserWindow
│   ├── preload.ts         # 预加载脚本，暴露 IPC API
│   ├── preload.d.ts       # 预加载脚本类型声明
│   └── electron-env.d.ts  # Electron 类型定义
├── src/                   # 渲染进程（前端）代码
│   ├── components/        # 共享组件
│   │   ├── BottomNav.tsx      # 底部导航栏
│   │   ├── ErrorBoundary.tsx  # 全局错误边界
│   │   ├── NetworkStatus.tsx  # 网络状态检测
│   │   ├── PageTransition.tsx # 页面过渡动画包装器
│   │   ├── QueryResult.tsx    # 查询结果展示
│   │   ├── SearchBox.tsx      # 搜索框组件
│   │   ├── TitleBar.tsx       # 自定义标题栏
│   │   └── Toast.tsx          # Toast 提示组件
│   ├── pages/             # 页面组件
│   │   ├── Favorites.tsx      # 收藏页面
│   │   ├── History.tsx        # 历史记录页面
│   │   ├── Review.tsx         # 复习页面
│   │   └── Settings.tsx       # 设置页面
│   ├── hooks/             # 自定义 Hooks
│   │   ├── useNetworkStatus.ts   # 网络状态 Hook
│   │   └── usePageTransition.ts  # 页面过渡动画 Hook
│   ├── stores/            # 状态管理（Zustand）
│   │   ├── appStore.ts        # 应用状态（页面、查询、Toast）
│   │   ├── favoritesStore.ts  # 收藏状态
│   │   ├── historyStore.ts    # 历史记录状态
│   │   └── settingsStore.ts   # 配置存储
│   ├── utils/             # 工具函数
│   │   └── api.ts             # LLM API 封装
│   ├── types/             # TypeScript 类型定义
│   │   ├── electron.d.ts      # Electron API 类型
│   │   └── index.ts           # 全局类型定义
│   ├── App.tsx            # 根组件
│   ├── main.tsx           # 渲染进程入口
│   ├── index.css          # 全局样式
│   ├── vite-env.d.ts      # Vite 类型定义
│   └── assets/            # 静态资源
├── public/                # 公共资源
├── dist/                  # 前端构建输出（运行时生成）
├── dist-electron/         # Electron 构建输出（运行时生成）
├── package.json           # 项目配置
├── tsconfig.json          # TypeScript 配置
├── tsconfig.node.json     # Node 环境 TypeScript 配置
├── vite.config.ts         # Vite 配置
├── electron-builder.json5 # Electron Builder 打包配置
├── .eslintrc.cjs          # ESLint 配置
├── index.html             # 应用入口 HTML
├── README.md              # 项目说明（含详细功能说明和开发计划）
└── AGENTS.md              # AI 助手文档
```

## 架构说明

### 进程架构

采用 Electron 标准的多进程架构：

- **主进程 (Main Process)**：`electron/main.ts`
  - 负责创建应用窗口
  - 管理应用生命周期
  - 与操作系统交互（快捷键、剪切板、文件 I/O）

- **渲染进程 (Renderer Process)**：`src/`
  - React 应用运行在 Chromium 中
  - 负责 UI 渲染和用户交互

- **预加载脚本 (Preload Script)**：`electron/preload.ts`
  - 使用 `contextBridge` 安全地暴露 IPC API
  - 桥接主进程和渲染进程通信

### IPC 通信

预加载脚本暴露了以下 API 对象：

**`window.ipcRenderer`** - 通用 IPC 通信：
```typescript
window.ipcRenderer.on(channel, listener)    // 监听主进程消息
window.ipcRenderer.off(channel, listener)   // 移除监听
window.ipcRenderer.send(channel, ...args)   // 发送消息到主进程
window.ipcRenderer.invoke(channel, ...args) // 异步调用主进程
```

**`window.electronFavorites`** - 收藏导入导出：
```typescript
window.electronFavorites.export(favorites: FavoriteWord[])  // 导出收藏到 JSON 文件
window.electronFavorites.import()                          // 从 JSON 文件导入收藏
```

已实现的 IPC 通道：

| 通道 | 方向 | 说明 | 状态 |
|------|------|------|------|
| `window:minimize` | Renderer → Main | 最小化窗口 | ✅ 已完成 |
| `window:close` | Renderer → Main | 关闭窗口 | ✅ 已完成 |
| `window:hide` | Renderer → Main | 隐藏窗口 | ✅ 已完成 |
| `window:show` | Renderer → Main | 显示窗口 | ✅ 已完成 |
| `settings:get` | Renderer → Main | 获取设置 | ✅ 已完成 |
| `settings:set` | Renderer → Main | 保存设置 | ✅ 已完成 |
| `data:getPath` | Renderer → Main | 获取用户数据目录 | ✅ 已完成 |
| `favorites:load` | Renderer → Main | 加载收藏数据 | 🗑️ 已移除（使用 IndexedDB） |
| `favorites:save` | Renderer → Main | 保存收藏数据 | 🗑️ 已移除（使用 IndexedDB） |
| `history:load` | Renderer → Main | 加载历史数据 | ✅ 已完成 |
| `history:save` | Renderer → Main | 保存历史数据 | ✅ 已完成 |
| `clipboard:content` | Main → Renderer | 发送剪切板内容 | ✅ 已完成 |
| `favorites:export` | Renderer → Main | 导出收藏数据 | ✅ 已完成 |
| `favorites:import` | Renderer → Main | 导入收藏数据 | ✅ 已完成 |

## 界面规范

### 窗口规格
- 窗口尺寸：400 × 600（宽度 × 高度）
- 固定大小，不可调整
- 无边框窗口（frameless）
- 支持拖拽移动（使用 `-webkit-app-region: drag`）

### 导航结构
```
┌─────────────────────────────┐
│      内容区域               │
├─────────────────────────────┤
│  🔍  收藏  历史  设置        │  ← 底部导航栏
└─────────────────────────────┘
```

### 视觉风格
- **整体风格**：极简主义，深色主题
- **主色调**：深灰黑 `#1a1a1a`（文字）、红色 `#f56565`（强调）
- **背景色**：深灰 `#1b1b1f`（主背景）、浅灰 `#202127`（卡片背景）
- **字体**：系统默认字体栈
- **图标**：Lucide 线性图标，1.5px 细线条
- **圆角**：小元素 6px，大元素 12px

## 数据存储

### 存储方案

| 数据类型 | 存储方式 | 说明 |
|---------|---------|------|
| 收藏单词 | IndexedDB (Dexie.js) | 浏览器端数据库，在渲染进程中直接操作 |
| 查询历史 | electron-store | 用户数据目录，通过 IPC 读写 |
| 用户配置 | electron-store | 用户数据目录，通过 IPC 读写 |

### 配置和历史存储
使用 `electron-store`，存储路径由库自动管理：

```
用户数据目录/
└── config.json         # 用户配置和查询历史
```

### 收藏存储
使用 IndexedDB + Dexie.js，在渲染进程中直接操作，数据存储在浏览器内部存储中。

## 常用命令

```bash
# 开发模式（热重载）
bun run dev

# 构建应用
bun run build

# 代码检查
bun run lint

# 预览生产构建
bun run preview
```

## 构建和打包

### 构建流程

1. `tsc` - TypeScript 类型检查
2. `vite build` - 打包前端资源和 Electron 主进程
3. `electron-builder` - 打包成可分发应用

### 输出目录

- `dist/` - 前端资源（index.html 及静态资源）
- `dist-electron/` - Electron 主进程和预加载脚本
- `release/${version}/` - 最终安装包

### 支持平台

| 平台 | 输出格式 |
|------|----------|
| macOS | `.dmg` |
| Windows | `.exe` (NSIS 安装包) |
| Linux | `.AppImage` |

## 代码规范

### ESLint 配置

- 使用 `eslint:recommended` 作为基础规则
- 集成 `@typescript-eslint` 进行 TypeScript 检查
- 包含 `react-hooks/recommended` 规则
- 启用 `react-refresh/only-export-components` 规则

### TypeScript 配置

- `target`: ES2020
- `module`: ESNext
- `moduleResolution`: bundler
- `strict`: true（启用所有严格类型检查）
- `noUnusedLocals`: true（禁止未使用的局部变量）
- `noUnusedParameters`: true（禁止未使用的参数）

### 命名约定

- 组件文件：PascalCase（如 `App.tsx`, `SearchBox.tsx`）
- 工具文件：camelCase（如 `api.ts`, `formatters.ts`）
- 类型定义：PascalCase，优先使用 `type` 而非 `interface`
- 自定义 Hooks：以 `use` 开头（如 `useFavorites`, `useSettings`）
- Store 文件：以 `Store` 结尾（如 `favoritesStore.ts`）

## 开发注意事项

### 安全

- 始终通过 `contextBridge` 暴露 API，**不要**直接暴露完整的 `ipcRenderer`
- 预加载脚本是渲染进程访问 Node.js API 的唯一安全通道
- 所有文件 I/O 和系统操作必须在主进程中完成

### 路径处理

主进程中使用 `process.env.VITE_PUBLIC` 访问公共资源路径：

- 开发模式：指向 `public/` 目录
- 生产模式：指向 `dist/` 目录

### 状态管理

建议使用 **Zustand** 进行全局状态管理：

- `src/stores/settingsStore.ts` - 应用配置
- `src/stores/appStore.ts` - 应用状态（当前页面、查询结果等）
- `src/stores/favoritesStore.ts` - 收藏单词
- `src/stores/historyStore.ts` - 查询历史
- `src/stores/wordsStore.ts` - 单词缓存（IndexedDB）

### API 调用

- LLM API 调用封装在 `src/utils/api.ts`
- 超时设置：30 秒
- 需要处理网络错误、API 错误、超时错误
- 支持流式响应（可选优化）

## 当前状态

### 第一阶段：基础功能 ✅ 已完成

- [x] 项目架构搭建（目录结构、依赖安装、路径别名）
- [x] 基础窗口配置（400×600、无边框、拖拽、位置记忆）
- [x] 类型定义（QueryResult、FavoriteWord、HistoryItem、Settings）
- [x] 状态管理（Zustand：appStore、settingsStore）
- [x] 设置页面（API 配置、测试连接、配置持久化）
- [x] 单词查询功能（SearchBox、API 封装、Loading、错误处理）
- [x] 查询结果展示（单词/句子、音标、词性、例句、空状态）
- [x] 深色主题视觉风格

### 第二阶段：数据功能 ✅ 已完成

- [x] 收藏功能（favoritesStore + IndexedDB/Dexie）
- [x] 收藏页面（Favorites.tsx）
- [x] 收藏导入导出（JSON 格式，支持备份和迁移）
- [x] 历史记录功能（historyStore + electron-store）
- [x] 历史页面（History.tsx）

### 第三阶段：增强功能 ✅ 已完成

- [x] 语句翻译（自动识别单词/句子，不同返回格式）
- [x] 自动读取剪切板（窗口显示时检测英文内容并自动查询）
- [x] 复习模式（卡片翻转、认识/不认识、复习统计）
- [x] 全局快捷键（Alt+D 唤出/隐藏，支持自定义，Esc 隐藏）

### 第四阶段：UI/UX 优化 ✅ 已完成

- [x] 导航和布局
  - [x] 底部导航栏组件（BottomNav.tsx）
  - [x] 页面切换动画（usePageTransition hook + CSS 动画）
  - [x] 当前页面高亮显示
- [x] 样式优化
  - [x] CSS 变量控制主题（已完成）
  - [x] 主色调红色 #f56565（已完成）
  - [x] Loading 动画（已完成）
  - [x] Toast 提示组件（四种类型：success/error/warning/info）
  - [x] 滚动条样式优化（已完成）
- [x] 错误处理优化
  - [x] 全局错误边界（ErrorBoundary 组件）
  - [x] API 错误友好提示（Toast 提示）
  - [x] 网络断开检测（useNetworkStatus hook）
- [x] 性能优化
  - [x] 组件懒加载（React.lazy + Suspense）

### 第五阶段：打包发布 ⏳ 待开始

详见 [README.md 开发计划](./README.md#开发计划)

## 扩展建议

### 已集成

- [x] 使用 `electron-store` 进行配置持久化
- [x] 集成 `zustand` 进行全局状态管理
- [x] 使用 `lucide-react` 作为图标库
- [x] 使用 `dexie` 封装 IndexedDB

### 待考虑

- [ ] 使用 `react-query` 或 `swr` 处理 API 请求和缓存（可选）
- [ ] 添加单元测试（Vitest + React Testing Library）（可选）
- [ ] 使用 `electron-log` 记录日志（可选）
- [ ] 集成 i18n 国际化支持（可选）

## 用户通知

完成重要操作后，使用 `notify-send` 命令行工具通知用户：

```bash
notify-send "任务完成" "已完成 xxx 功能"
```

示例：
- `notify-send "任务完成" "已完成用户自定义 API token 功能"`
- `notify-send "构建成功" "应用已打包完成"`
- `notify-send "错误" "构建失败，请检查日志"`
