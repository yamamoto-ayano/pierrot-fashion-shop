// src/app/category/[category]/page.tsx
/**
 * 責務: カテゴリー別商品一覧ページ
 * - URLパラメータからカテゴリー名を取得
 * - 指定されたカテゴリーの商品のみをフィルタリングして表示
 * - 検索・並び替え・ページネーション機能（20件表示）
 * - 画像がある場合はカード表示、ない場合は表表示
 * - 戻るボタンによるナビゲーション
 */
"use client"

import useSWR from "swr"
import { useMemo, useState } from "react"
import { useRouter } from "next/navigation"
import { Input } from "@/components/ui/input"
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { ProductCardList } from "@/components/products/ProductCardList"
import { isNumericColumn, toNumber } from "@/lib/utils"
import type { Row, SortDirection } from "@/lib/types"

const fetcher = (url: string) => fetch(url).then((r) => r.json())

// ===== ユーティリティ =====
const PAGE_SIZE = 20

// ===== サブUI：表 =====
function ProductTable({
  rows,
  headers,
  isLoading,
  error,
}: {
  rows: Row[];
  headers: string[];
  isLoading: boolean;
  error?: Error;
}) {
  return (
    <div className="overflow-x-auto rounded-xl border shadow-sm">
      <table className="min-w-full text-sm">
        <thead style={{ background: "#F8E8E4" }}>
          <tr>
            {headers.map((h) => (
              <th key={h} className="px-4 py-3 text-left font-semibold text-gray-800">{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {isLoading && (
            <tr><td className="px-4 py-4 text-gray-500" colSpan={headers.length}>読み込み中…</td></tr>
          )}
          {error && !isLoading && (
            <tr><td className="px-4 py-4 text-red-600" colSpan={headers.length}>データ取得に失敗しました。</td></tr>
          )}
          {!isLoading && !error && rows.length === 0 && (
            <tr><td className="px-4 py-4 text-gray-500" colSpan={headers.length}>条件に合致する商品がありません。</td></tr>
          )}
          {rows.map((r, i) => (
            <tr key={i} className="odd:bg-white even:bg-gray-50">
              {headers.map((h) => {
                const value = r[h] ?? ""
                const displayValue = value
                return (
                  <td key={h} className="px-4 py-2">{displayValue}</td>
                )
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

// ===== ページ本体 =====
export default function CategoryPage({ params }: { params: { category: string } }) {
  const router = useRouter()
  const categoryName = decodeURIComponent(params.category)

  const { data, error, isLoading } = useSWR<{ data: Row[] }>("/api/products", fetcher, {
    refreshInterval: 120_000,   // 2分ごと再取得
    revalidateOnFocus: false,
  })

  const rows = useMemo(() => data?.data ?? [], [data?.data])
  const headers = useMemo(() => rows[0] ? Object.keys(rows[0]) : [], [rows])

  // 画面状態
  const [q, setQ] = useState("")
  const [sortKey, setSortKey] = useState<string>("")
  const [sortDir, setSortDir] = useState<SortDirection>("asc")
  const [page, setPage] = useState(1)

  // 列推定（useEffectなし）
  const lower = new Map(headers.map((h) => [h, h.toLowerCase()] as const))
  const findBy = (aliases: string[]) => headers.find((h) => aliases.some((a) => lower.get(h)!.includes(a)))

  const imageKey =
    headers.find((h) => lower.get(h) === "image_file_ids") ||
    findBy(["image", "img", "画像", "photo", "picture", "thumbnail", "thumb"])

  const titleKey =
    findBy(["title", "name", "商品名", "品名", "名称"]) || headers[0]

  const priceKey =
    findBy(["price", "金額", "価格", "値段", "amount"]) ||
    headers.find((h) => rows.some((r) => /[¥￥,\d]/.test(String(r[h] ?? ""))))

  const categoryKey =
    findBy(["category", "カテゴリ", "カテゴリー", "type", "種別"]) ||
    ""

  const descriptionKey =
    findBy(["description", "desc", "説明", "詳細"]) ||
    headers.find((h) => h !== titleKey && h !== priceKey && h !== imageKey)

  // カテゴリで絞り込み
  const categoryFiltered = useMemo(() => {
    if (!categoryKey) return rows
    return rows.filter((r) => (r[categoryKey] ?? "").toString() === categoryName)
  }, [rows, categoryKey, categoryName])

  // 絞り込み・検索・ソート・ページング
  const filtered = useMemo(() => {
    let arr = categoryFiltered

    const kw = q.trim().toLowerCase()
    if (kw) {
      arr = arr.filter((r) => Object.values(r).some((v) => String(v).toLowerCase().includes(kw)))
    }

    if (sortKey) {
      const numeric = isNumericColumn(arr, sortKey)
      arr = [...arr].sort((a, b) => {
        const A = String(a[sortKey] ?? "")
        const B = String(b[sortKey] ?? "")
        if (numeric) {
          const na = toNumber(A), nb = toNumber(B)
          return sortDir === "asc" ? na - nb : nb - na
        }
        return sortDir === "asc" ? A.localeCompare(B, "ja") : B.localeCompare(A, "ja")
      })
    }

    return arr
  }, [categoryFiltered, q, sortKey, sortDir])

  const total = filtered.length
  const maxPage = Math.max(1, Math.ceil(total / PAGE_SIZE))
  const pageRows = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)

  const hasImage = Boolean(imageKey)

  return (
    <main className="min-h-dvh p-6 space-y-6">
      <header className="space-y-1">
        <div className="flex items-center gap-4">
          <Button
            variant="outline"
            onClick={() => router.push("/")}
            className="rounded-full"
          >
            ← 戻る
          </Button>
          <div>
            <h1 className="text-2xl font-bold" style={{ color: "#947962" }}>
              {categoryName} — 商品一覧
            </h1>
            <p className="text-sm text-gray-600">
              {total}件の商品が見つかりました
            </p>
          </div>
        </div>
      </header>

      {/* コントロール */}
      <div className="flex flex-wrap gap-3 items-center">
        <Input
          placeholder="検索（商品名・説明・型番など）"
          value={q}
          onChange={(e) => { setQ(e.target.value); setPage(1) }}
          className="max-w-xs"
        />

        {/* 並び替えキー */}
        <Select
          value={sortKey || undefined}
          onValueChange={(v) => { setSortKey(v); setPage(1) }}
        >
          <SelectTrigger className="w-[220px]">
            <SelectValue placeholder="並び替えキー" />
          </SelectTrigger>
          <SelectContent>
            {headers.map((h) => <SelectItem key={h} value={h}>{h}</SelectItem>)}
          </SelectContent>
        </Select>

        {/* 昇順/降順 */}
        <Select value={sortDir} onValueChange={(v: SortDirection) => setSortDir(v)}>
          <SelectTrigger className="w-[140px]">
            <SelectValue placeholder="昇順/降順" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="asc">昇順</SelectItem>
            <SelectItem value="desc">降順</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* 一覧：画像列があればカード、なければ表 */}
      {hasImage ? (
        <ProductCardList
          rows={pageRows}
          keys={{
            titleKey,
            priceKey,
            categoryKey: categoryKey || undefined,
            imageKey,
            descriptionKey,
          }}
        />
      ) : (
        <ProductTable rows={pageRows} headers={headers} isLoading={isLoading} error={error} />
      )}

      {/* ページネーション */}
      <div className="flex items-center gap-3">
        <Button variant="secondary" onClick={() => setPage((p) => Math.max(1, p - 1))}>Prev</Button>
        <span className="text-sm">{page} / {maxPage}（{total}件）</span>
        <Button onClick={() => setPage((p) => Math.min(maxPage, p + 1))}>Next</Button>
      </div>
    </main>
  )
}
