// src/lib/filtering.ts
/**
 * 責務: 商品データのフィルタリングとソート機能
 * - 検索クエリによるフィルタリング
 * - カテゴリーによるフィルタリング
 * - 数値・文字列によるソート
 * - ランダムシャッフル機能
 * - フィルタリング結果のメモ化
 */
import type { Row, SortDirection } from "./types"
import { isNumericColumn, toNumber } from "./utils"

export interface FilterOptions {
  searchQuery: string
  sortKey: string
  sortDirection: SortDirection
  enableRandomShuffle?: boolean
}

export function filterAndSortProducts(
  rows: Row[],
  options: FilterOptions
): Row[] {
  let arr = rows

  // 検索やソートがない場合はランダムシャッフルを適用
  const hasSearch = options.searchQuery.trim().length > 0
  const hasSort = options.sortKey.length > 0
  
  if (!hasSearch && !hasSort && options.enableRandomShuffle) {
    arr = shuffleArray(rows)
  }

  // 検索フィルタ
  const kw = options.searchQuery.trim().toLowerCase()
  if (kw) {
    arr = arr.filter((r) => 
      Object.values(r).some((v) => String(v).toLowerCase().includes(kw))
    )
  }

  // ソート
  if (options.sortKey) {
    const numeric = isNumericColumn(arr, options.sortKey)
    arr = [...arr].sort((a, b) => {
      const A = String(a[options.sortKey] ?? "")
      const B = String(b[options.sortKey] ?? "")
      if (numeric) {
        const na = toNumber(A)
        const nb = toNumber(B)
        return options.sortDirection === "asc" ? na - nb : nb - na
      }
      return options.sortDirection === "asc" 
        ? A.localeCompare(B, "ja") 
        : B.localeCompare(A, "ja")
    })
  }

  return arr
}

// ランダムシャッフル関数（Fisher-Yates アルゴリズム）
function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array]
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
  }
  return shuffled
}
