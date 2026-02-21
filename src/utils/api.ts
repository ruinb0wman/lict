import { Settings, QueryResponse, QueryResult, SentenceTranslation } from '@/types'

const API_TIMEOUT = 30000 // 30 秒超时

// 判断输入是单词还是句子
export function isSentence(input: string): boolean {
  // 去除首尾空格
  const trimmed = input.trim()
  // 如果包含空格，则认为是句子
  return trimmed.includes(' ')
}

// 构建单词查询的 prompt
function buildWordPrompt(word: string): string {
  return `你是一个专业的英语词典。请解释以下单词，并按 JSON 格式返回：

单词：${word}

要求：
1. 提供该单词的音标（美式）
2. 列出所有常见词性及对应的中文翻译
3. 提供 3 个实用的英文例句，每个例句附带中文翻译
4. 只返回 JSON 数据，不要其他解释

返回格式：
{
  "word": "单词",
  "phonetic": "/音标/",
  "translation": {
    "n.": ["名词翻译"],
    "v.": ["动词翻译"]
  },
  "example": [
    {"en": "英文例句", "zh": "中文翻译"}
  ]
}`
}

// 构建句子翻译的 prompt
function buildSentencePrompt(sentence: string): string {
  return `请将以下英文句子翻译成中文：

句子：${sentence}

要求：
1. 提供准确、通顺的中文翻译
2. 只返回 JSON 格式的结果，不要其他解释

返回格式：
{
  "type": "sentence",
  "original": "${sentence}",
  "translation": "中文翻译"
}`
}

// 调用 LLM API
export async function queryLLM(
  input: string,
  settings: Settings
): Promise<QueryResponse> {
  const { apiBaseUrl, apiKey, model, temperature } = settings

  if (!apiKey) {
    throw new Error('请先设置 API Key')
  }

  const isSentenceInput = isSentence(input)
  const prompt = isSentenceInput 
    ? buildSentencePrompt(input) 
    : buildWordPrompt(input)

  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), API_TIMEOUT)

  try {
    const response = await fetch(`${apiBaseUrl}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model,
        messages: [{ role: 'user', content: prompt }],
        temperature,
        max_tokens: 2000,
      }),
      signal: controller.signal,
    })

    clearTimeout(timeoutId)

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      throw new Error(
        errorData.error?.message || `请求失败: ${response.statusText}`
      )
    }

    const data = await response.json()
    const content = data.choices?.[0]?.message?.content

    if (!content) {
      throw new Error('API 返回数据格式错误')
    }

    // 解析 JSON 响应
    let result: QueryResponse
    try {
      // 尝试直接解析
      result = JSON.parse(content)
    } catch {
      // 如果直接解析失败，尝试从文本中提取 JSON
      const jsonMatch = content.match(/\{[\s\S]*\}/)
      if (jsonMatch) {
        result = JSON.parse(jsonMatch[0])
      } else {
        throw new Error('无法解析 API 返回的数据')
      }
    }

    // 验证返回数据的完整性
    if (isSentenceInput) {
      const sentenceResult = result as SentenceTranslation
      if (sentenceResult.type !== 'sentence' || !sentenceResult.translation) {
        throw new Error('API 返回的数据格式不正确')
      }
    } else {
      const wordResult = result as QueryResult
      if (!wordResult.word || !wordResult.translation) {
        throw new Error('API 返回的数据格式不正确')
      }
      // 确保 example 字段存在
      if (!wordResult.example) {
        wordResult.example = []
      }
    }

    return result
  } catch (error) {
    clearTimeout(timeoutId)
    
    if (error instanceof Error) {
      if (error.name === 'AbortError') {
        throw new Error('请求超时，请检查网络连接')
      }
      throw error
    }
    throw new Error('未知错误')
  }
}

// 测试 API 连接
export async function testAPIConnection(
  settings: Settings
): Promise<{ success: boolean; message: string }> {
  const { apiBaseUrl, apiKey, model } = settings

  if (!apiKey) {
    return { success: false, message: '请先输入 API Key' }
  }

  try {
    const response = await fetch(`${apiBaseUrl}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model,
        messages: [{ role: 'user', content: 'Hello' }],
        max_tokens: 5,
      }),
    })

    if (response.ok) {
      return { success: true, message: '连接成功！' }
    } else {
      const errorData = await response.json().catch(() => ({}))
      return {
        success: false,
        message: `连接失败: ${errorData.error?.message || response.statusText}`,
      }
    }
  } catch (error) {
    return {
      success: false,
      message: `网络错误: ${error instanceof Error ? error.message : '未知错误'}`,
    }
  }
}
