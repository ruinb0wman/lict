// ==================== 查询结果类型 ====================

export type TranslationMap = {
  [key: string]: string[];
};

export type ExampleSentence = {
  en: string;
  zh: string;
};

export type QueryResult = {
  word: string;
  phonetic?: string;
  translation: TranslationMap;
  example: ExampleSentence[];
};

export type SentenceTranslation = {
  type: 'sentence';
  original: string;
  translation: string;
};

export type QueryResponse = QueryResult | SentenceTranslation;

// ==================== 收藏单词类型 ====================

export type FavoriteWord = {
  id: string;
  word: string;
  translation: string;
  phonetic?: string;
  createdAt: number;
  queryData: QueryResult;
  // 复习相关字段
  reviewCount: number;      // 复习次数
  lastReviewedAt?: number;  // 上次复习时间
  masteryLevel: number;     // 掌握程度 0-5，0=未复习，5=已掌握
};

// ==================== 历史记录类型 ====================

export type HistoryItemType = 'word' | 'sentence';

export type HistoryItem = {
  id: string;
  word: string;
  type: HistoryItemType;
  result: QueryResponse;
  timestamp: number;
};

// ==================== 用户配置类型 ====================

export type Settings = {
  apiBaseUrl: string;
  apiKey: string;
  model: string;
  temperature: number;
  historyLimit: number;
  shortcut: string;
};

export const defaultSettings: Settings = {
  apiBaseUrl: 'https://api.openai.com/v1',
  apiKey: '',
  model: 'gpt-3.5-turbo',
  temperature: 0.7,
  historyLimit: 100,
  shortcut: 'Alt+D',
};

// ==================== Toast 类型 ====================

export type ToastType = 'success' | 'error' | 'warning' | 'info';

export type ToastState = {
  message: string;
  type: ToastType;
  duration: number;
  visible: boolean;
};

// ==================== 应用状态类型 ====================

export type PageType = 'search' | 'favorites' | 'history' | 'review' | 'settings';

export type AppState = {
  currentPage: PageType;
  queryResult: QueryResponse | null;
  isLoading: boolean;
  error: string | null;
  lastQuery: string;
  toast: ToastState | null;
};
