// src/hooks/useProductData.ts
/**
 * 責務: 商品データの取得と初期処理を行うカスタムフック
 * - SWRを使用した商品データの取得とキャッシュ管理
 * - ヘッダー情報の抽出
 * - 列の自動検出（画像・タイトル・価格・カテゴリー・説明）
 * - カテゴリー候補の生成
 * - エラー状態とローディング状態の管理
 */
import useSWR from "swr"
import { useMemo } from "react"
import type { Row } from "@/lib/types"
import { detectColumns } from "@/lib/column-detection"

const fetcher = (url: string) => fetch(url).then((r) => r.json())

export function useProductData() {
  const { data, error, isLoading } = useSWR<{ data: Row[] }>("/api/products", fetcher, {
    refreshInterval: 120_000, // 2分ごと再取得
    revalidateOnFocus: false,
  })

  const rows = useMemo(() => data?.data ?? [], [data?.data])
  const headers = useMemo(() => rows[0] ? Object.keys(rows[0]) : [], [rows])
  const detectedColumns = useMemo(() => detectColumns(rows, headers), [rows, headers])

  // カテゴリ候補
  const categoryOptions = useMemo(() => {
    if (!detectedColumns.categoryKey) return []
    const set = new Set<string>()
    rows.forEach((r) => {
      const v = (r[detectedColumns.categoryKey!] ?? "").toString().trim()
      if (v) set.add(v)
    })
    return Array.from(set).sort((a, b) => a.localeCompare(b, "ja"))
  }, [rows, detectedColumns.categoryKey])

  return {
    rows,
    headers,
    detectedColumns,
    categoryOptions,
    error,
    isLoading,
  }
}
