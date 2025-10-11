// src/app/page.tsx
"use client"

import { useRouter } from "next/navigation"
import { Input } from "@/components/ui/input"
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { ProductCardList } from "@/components/products/ProductCardList"
import { ProductTable } from "@/components/products/ProductTable"
import { CategoryButtons } from "@/components/products/CategoryButtons"
import { useProductData } from "@/hooks/useProductData"
import { useProductFiltering } from "@/hooks/useProductFiltering"
import { useProductPagination } from "@/hooks/useProductPagination"
import type { SortDirection } from "@/lib/types"

// ===== ユーティリティ =====
const PAGE_SIZE = 10

// ===== ページ本体 =====
export default function Page() {
  const router = useRouter()
  
  // データ取得とカテゴリマッピング
  const { rows, headers, detectedColumns, categoryOptions, error, isLoading } = useProductData()
  
  // フィルタリング・ソート
  const {
    searchQuery,
    setSearchQuery,
    sortKey,
    setSortKey,
    sortDirection,
    setSortDirection,
    filteredRows,
  } = useProductFiltering(rows)
  
  // ページネーション
  const {
    pageRows,
    total,
    maxPage,
    currentPage,
    nextPage,
    prevPage,
    setPage,
  } = useProductPagination(filteredRows, PAGE_SIZE)

  const hasImage = Boolean(detectedColumns.imageKey)

  // カテゴリーボタンのクリック処理
  const handleCategoryClick = (category: string) => {
    router.push(`/category/${encodeURIComponent(category)}`)
  }

  return (
    <main className="min-h-dvh p-6 space-y-6">
      <header className="space-y-1">
        <h1 className="text-2xl font-bold" style={{ color: "#947962" }}>Pierrot — 商品一覧</h1>
        <p className="text-sm text-gray-600">公開シートの更新は最長2分で反映されます。</p>
      </header>

      {/* カテゴリーボタン */}
      <CategoryButtons 
        categories={categoryOptions} 
        onCategoryClick={handleCategoryClick} 
      />

      {/* コントロール */}
      <div className="flex flex-wrap gap-3 items-center">
        <Input
          placeholder="検索（商品名・説明・型番など）"
          value={searchQuery}
          onChange={(e) => { setSearchQuery(e.target.value); setPage(1) }}
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
        <Select value={sortDirection} onValueChange={(v: SortDirection) => setSortDirection(v)}>
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
            titleKey: detectedColumns.titleKey,
            priceKey: detectedColumns.priceKey,
            categoryKey: detectedColumns.categoryKey,
            imageKey: detectedColumns.imageKey,
            descriptionKey: detectedColumns.descriptionKey,
          }}
        />
      ) : (
        <ProductTable 
          rows={pageRows} 
          headers={headers} 
          isLoading={isLoading} 
          error={error} 
        />
      )}

      {/* ページネーション */}
      <div className="flex items-center gap-3">
        <Button variant="secondary" onClick={prevPage}>Prev</Button>
        <span className="text-sm">{currentPage} / {maxPage}（{total}件）</span>
        <Button onClick={nextPage}>Next</Button>
      </div>
    </main>
  )
}