// src/lib/column-detection.ts
/**
 * 責務: CSVデータの列を自動検出する機能
 * - 画像列の検出（image_file_ids、image、img、画像など）
 * - タイトル列の検出（title、name、商品名、品名など）
 * - 価格列の検出（price、金額、価格、値段など）
 * - カテゴリー列の検出（category、カテゴリ、typeなど）
 * - 説明列の検出（description、desc、説明、詳細など）
 */
import type { Row } from "./types"

export interface DetectedColumns {
  imageKey?: string
  titleKey?: string
  priceKey?: string
  categoryKey?: string
  descriptionKey?: string
}

export function detectColumns(rows: Row[], headers: string[]): DetectedColumns {
  if (rows.length === 0) {
    return {}
  }

  const lower = new Map(headers.map((h) => [h, h.toLowerCase()] as const))
  const findBy = (aliases: string[]) => 
    headers.find((h) => aliases.some((a) => lower.get(h)!.includes(a)))

  const imageKey =
    headers.find((h) => lower.get(h) === "image_file_ids") ||
    findBy(["image", "img", "画像", "photo", "picture", "thumbnail", "thumb"])

  const titleKey =
    findBy(["title", "name", "商品名", "品名", "名称"]) || headers[0]

  const priceKey =
    findBy(["price", "金額", "価格", "値段", "amount"]) ||
    headers.find((h) => rows.some((r) => /[¥￥,\d]/.test(String(r[h] ?? ""))))

  const categoryKey =
    findBy(["category", "カテゴリ", "カテゴリー", "type", "種別"]) || ""

  const descriptionKey =
    findBy(["description", "desc", "説明", "詳細"]) ||
    headers.find((h) => h !== titleKey && h !== priceKey && h !== imageKey)

  return {
    imageKey,
    titleKey,
    priceKey,
    categoryKey,
    descriptionKey,
  }
}
