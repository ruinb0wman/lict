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
- `zustand` - 状态管理（建议安装）
- `uuid` - 生成唯一 ID

## 项目结构

当前结构（需要扩展）：

```
dict/
├── electron/               # Electron 主进程代码
│   ├── main.ts            # 主进程入口，创建 BrowserWindow
│   ├── preload.ts         # 预加载脚本，暴露 IPC API
│   └── electron-env.d.ts  # Electron 类型定义
├── src/                   # 渲染进程（前端）代码
│   ├── components/        # 共享组件（需创建）
│   ├── pages/             # 页面组件（需创建）
│   ├── hooks/             # 自定义 Hooks（需创建）
│   ├── stores/            # 状态管理（需创建）
│   ├── utils/             # 工具函数（需创建）
│   ├── types/             # TypeScript 类型定义（需创建）
│   ├── App.tsx            # 根组件
│   ├── main.tsx           # 渲染进程入口
│   ├── App.css            # 组件样式
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
└── README.md              # 项目说明（含详细功能说明和开发计划）
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

预加载脚本暴露了 `window.ipcRenderer` 对象：

```typescript
window.ipcRenderer.on(channel, listener)    // 监听主进程消息
window.ipcRenderer.off(channel, listener)   // 移除监听
window.ipcRenderer.send(channel, ...args)   // 发送消息到主进程
window.ipcRenderer.invoke(channel, ...args) // 异步调用主进程
```

需要添加的 IPC 通道：

| 通道 | 方向 | 说明 |
|------|------|------|
| `data:getPath` | Renderer → Main | 获取用户数据目录 |
| `favorites:load` | Renderer → Main | 加载收藏数据 |
| `favorites:save` | Renderer → Main | 保存收藏数据 |
| `history:load` | Renderer → Main | 加载历史数据 |
| `history:save` | Renderer → Main | 保存历史数据 |
| `clipboard:content` | Main → Renderer | 发送剪切板内容 |
| `window:show` | Main → Renderer | 通知窗口显示 |

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
- 简洁现代风格
- 主色调：蓝色系（#3b82f6）
- 背景色：白色/浅灰色
- 字体：系统默认字体

## 数据存储

### 配置存储
使用 `electron-store`，存储路径由库自动管理。

### 收藏和历史存储
使用 JSON 文件存储在用户数据目录：

```
用户数据目录/
├── favorites.json      # 收藏单词
└── history.json        # 查询历史
```

通过 IPC 在主进程中读写文件。

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

### API 调用

- LLM API 调用封装在 `src/utils/api.ts`
- 超时设置：30 秒
- 需要处理网络错误、API 错误、超时错误
- 支持流式响应（可选优化）

## 当前状态

当前 `src/App.tsx` 为 Vite + React 的默认模板，需要从零实现所有功能。

请按照 README.md 中的「开发计划」逐项完成开发。

## 扩展建议

- [ ] 使用 `electron-store` 进行配置持久化
- [ ] 集成 `zustand` 进行全局状态管理
- [ ] 使用 `react-query` 或 `swr` 处理 API 请求和缓存（可选）
- [ ] 添加单元测试（Vitest + React Testing Library）（可选）
- [ ] 使用 `electron-log` 记录日志（可选）
