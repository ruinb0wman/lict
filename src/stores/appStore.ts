import { create } from 'zustand'
import { PageType, QueryResponse, AppState } from '@/types'

interface AppStore extends AppState {
  // 页面切换
  setCurrentPage: (page: PageType) => void
  
  // 查询状态
  setQueryResult: (result: QueryResponse | null) => void
  setLoading: (isLoading: boolean) => void
  setError: (error: string | null) => void
  setLastQuery: (query: string) => void
  
  // 重置状态
  resetQueryState: () => void
}

const initialState: AppState = {
  currentPage: 'search',
  queryResult: null,
  isLoading: false,
  error: null,
  lastQuery: '',
}

export const useAppStore = create<AppStore>((set) => ({
  ...initialState,

  setCurrentPage: (page) => set({ currentPage: page }),
  
  setQueryResult: (result) => set({ queryResult: result, error: null }),
  
  setLoading: (isLoading) => set({ isLoading }),
  
  setError: (error) => set({ error }),
  
  setLastQuery: (query) => set({ lastQuery: query }),
  
  resetQueryState: () => set({ 
    queryResult: null, 
    isLoading: false, 
    error: null,
    lastQuery: '',
  }),
}))
