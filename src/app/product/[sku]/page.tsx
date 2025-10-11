// src/app/product/[sku]/page.tsx
"use client"

import useSWR from "swr"
import { useRouter, useParams } from "next/navigation"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { asImageUrl } from "@/lib/drive"
import { formatPrice } from "@/lib/utils"
import type { Row } from "@/lib/types"

const fetcher = (url: string) => fetch(url).then((r) => r.json())

export default function ProductPage() {
  const router = useRouter()
  const params = useParams()
  const sku = params.sku as string

  const { data, error, isLoading } = useSWR<{ data: Row[] }>("/api/products", fetcher, {
    refreshInterval: 120_000,
    revalidateOnFocus: false,
  })

  const rows = data?.data ?? []
  const product = rows.find((r) => r.sku === sku)

  if (isLoading) {
    return (
      <main className="min-h-dvh p-6">
        <div className="max-w-4xl mx-auto">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
            <div className="grid md:grid-cols-2 gap-8">
              <div className="aspect-square bg-gray-200 rounded-lg"></div>
              <div className="space-y-4">
                <div className="h-8 bg-gray-200 rounded w-3/4"></div>
                <div className="h-6 bg-gray-200 rounded w-1/2"></div>
                <div className="h-4 bg-gray-200 rounded w-full"></div>
                <div className="h-4 bg-gray-200 rounded w-2/3"></div>
              </div>
            </div>
          </div>
        </div>
      </main>
    )
  }

  if (error || !product) {
    return (
      <main className="min-h-dvh p-6">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">商品が見つかりません</h1>
          <p className="text-gray-600 mb-6">指定された商品は存在しないか、削除された可能性があります。</p>
          <Button onClick={() => router.push("/")} className="rounded-full">
            商品一覧に戻る
          </Button>
        </div>
      </main>
    )
  }

  // 商品情報の取得
  const title = product.name || "（無題）"
  const price = product.price || ""
  const category = product.category || ""
  const description = product.description || ""
  const imageUrl = asImageUrl(product.image_file_ids || "")

  return (
    <main className="min-h-dvh p-6">
      <div className="max-w-4xl mx-auto">
        {/* 戻るボタン */}
        <div className="mb-6">
          <Button
            variant="outline"
            onClick={() => router.back()}
            className="rounded-full"
          >
            ← 戻る
          </Button>
        </div>

        {/* 商品詳細 */}
        <div className="grid md:grid-cols-2 gap-8">
          {/* 商品画像 */}
          <div className="aspect-square relative bg-gray-100 rounded-xl overflow-hidden">
            {imageUrl ? (
              <Image
                src={imageUrl}
                alt={title}
                fill
                className="object-cover"
                priority
                unoptimized
              />
            ) : (
              <div className="absolute inset-0 flex items-center justify-center text-gray-400 text-lg">
                No Image
              </div>
            )}
          </div>

          {/* 商品情報 */}
          <div className="space-y-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">{title}</h1>
              {category && (
                <span className="inline-block rounded-full border px-3 py-1 text-sm text-gray-600 bg-[#F8E8E4] border-[#947962]">
                  {category}
                </span>
              )}
            </div>

            {price && (
              <div className="text-2xl font-bold" style={{ color: "#947962" }}>
                ¥{formatPrice(price)}
              </div>
            )}

            {description && (
              <div>
                <h2 className="text-lg font-semibold text-gray-900 mb-2">商品説明</h2>
                <p className="text-gray-600 leading-relaxed">{description}</p>
              </div>
            )}

            <div className="pt-4">
              <Button
                size="lg"
                className="w-full rounded-full text-lg py-6"
                style={{ backgroundColor: "#947962", color: "white" }}
                onClick={() => {
                  // ここにお問い合わせや購入処理を追加
                  alert("お問い合わせ機能は準備中です")
                }}
              >
                お問い合わせ
              </Button>
            </div>
          </div>
        </div>

        {/* 商品詳細情報 */}
        <div className="mt-12 pt-8 border-t border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">商品詳細</h2>
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <dt className="text-sm font-medium text-gray-500">商品コード</dt>
              <dd className="text-sm text-gray-900">{product.sku}</dd>
            </div>
            {product.last_updated && (
              <div>
                <dt className="text-sm font-medium text-gray-500">最終更新日</dt>
                <dd className="text-sm text-gray-900">
                  {new Date(product.last_updated).toLocaleDateString("ja-JP")}
                </dd>
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  )
}
