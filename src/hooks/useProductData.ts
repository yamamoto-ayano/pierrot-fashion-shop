// src/hooks/useProductData.ts
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
