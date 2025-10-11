// src/app/api/products/route.ts
/**
 * 責務: 商品データAPIエンドポイント
 * - Google Sheetsから商品データのCSVを取得
 * - カテゴリーマッピング用のCSVを取得して変換
 * - CSVデータをパースしてJSON形式に変換
 * - データの正規化（カテゴリー名の変換、価格の数値化など）
 * - ISR（2分キャッシュ）によるパフォーマンス最適化
 * - エラーハンドリングとログ出力
 */
import { NextResponse } from "next/server"
import Papa from "papaparse"
import type { Row } from "@/lib/types"

// Vercel/Nextのサーバー実行（Node.js）
export const runtime = "nodejs"

// ISR: 2分キャッシュ（サーバー側で全ユーザー共有）
export const revalidate = 120

// 商品データのCSVエンドポイント
const PRODUCTS_CSV_URL =
  "https://docs.google.com/spreadsheets/d/1DNnfYYCY-hGNpTxq6ljk2-zE-S-w5OAY19lphcSNlJo/export?format=csv&gid=0"

// カテゴリマッピングのCSVエンドポイント
const CATEGORY_CSV_URL =
  "https://docs.google.com/spreadsheets/d/1DNnfYYCY-hGNpTxq6ljk2-zE-S-w5OAY19lphcSNlJo/export?format=csv&gid=1053305482"

// カテゴリマッピングを取得
async function getCategoryMapping(): Promise<Record<string, string>> {
  try {
    console.log("Fetching category mapping from:", CATEGORY_CSV_URL)
    const res = await fetch(CATEGORY_CSV_URL, { 
      cache: "no-store",
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; PierrotApp/1.0)'
      }
    })
    console.log("Category mapping response status:", res.status)
    
    if (!res.ok) {
      console.warn("Failed to fetch category mapping, using empty mapping")
      return {}
    }
    
    const csv = await res.text()
    console.log("Category mapping CSV content:", csv.substring(0, 200))
    
    // CSVの形式を修正：ヘッダー行を追加
    const csvWithHeader = `code,name\n${csv}`
    console.log("CSV with header:", csvWithHeader)
    
    const parsed = Papa.parse<{ code: string; name: string }>(csvWithHeader, { 
      header: true, 
      skipEmptyLines: true 
    })
    
    console.log("Parsed category mapping data:", parsed.data)
    
    const mapping: Record<string, string> = {}
    parsed.data.forEach((row) => {
      if (row.code && row.name) {
        // 改行文字を除去
        mapping[row.code.trim()] = row.name.trim()
      }
    })
    
    console.log("Final category mapping:", mapping)
    return mapping
  } catch (e) {
    console.warn("Error fetching category mapping:", e)
    return {}
  }
}

// 必要に応じて列名の正規化をここで行う
function normalize(rows: Row[], categoryMapping: Record<string, string>) {
  return rows.map((r) => ({
    category: categoryMapping[r.category ?? ""] || (r.category ?? ""),
    sku: r.sku ?? "",
    name: r.name ?? "",
    price: Number((r.price ?? "").toString().replace(/[,¥\s]/g, "")) || 0,
    image_file_ids: r.image_file_ids ?? "",
    last_updated: r.last_updated ?? "",
    // …必要なら追加
  }))
}

export async function GET() {
  try {
    // カテゴリマッピングを取得
    const categoryMapping = await getCategoryMapping()
    
    // 商品データのCSVを取得（結果はISRで120秒キャッシュ）
    const res = await fetch(PRODUCTS_CSV_URL, { cache: "no-store" })
    if (!res.ok) {
      return NextResponse.json({ error: "Failed to fetch CSV" }, { status: 502 })
    }

    const csv = await res.text()
    const parsed = Papa.parse<Row>(csv, { header: true, skipEmptyLines: true })
    const data = normalize(parsed.data, categoryMapping)

    return NextResponse.json({ data }, { status: 200 })
  } catch (e) {
    console.error("[/api/products] error:", e)
    return NextResponse.json({ error: "Internal error" }, { status: 500 })
  }
}
