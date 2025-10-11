// src/app/api/products/route.ts
import { NextResponse } from "next/server"
import Papa from "papaparse"
import type { Row } from "@/lib/types"

// Vercel/Nextのサーバー実行（Node.js）
export const runtime = "nodejs"

// ISR: 2分キャッシュ（サーバー側で全ユーザー共有）
export const revalidate = 120

// 例：公開シートのCSVエンドポイント（必要に応じて差し替え）
const CSV_URL =
  "https://docs.google.com/spreadsheets/d/1DNnfYYCY-hGNpTxq6ljk2-zE-S-w5OAY19lphcSNlJo/export?format=csv&gid=0"

// 必要に応じて列名の正規化をここで行う
function normalize(rows: Row[]) {
  return rows.map((r) => ({
    category: r.category ?? "",
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
    // 毎回最新CSVを取得（結果はISRで120秒キャッシュ）
    const res = await fetch(CSV_URL, { cache: "no-store" })
    if (!res.ok) {
      return NextResponse.json({ error: "Failed to fetch CSV" }, { status: 502 })
    }

    const csv = await res.text()
    const parsed = Papa.parse<Row>(csv, { header: true, skipEmptyLines: true })
    const data = normalize(parsed.data)

    return NextResponse.json({ data }, { status: 200 })
  } catch (e) {
    console.error("[/api/products] error:", e)
    return NextResponse.json({ error: "Internal error" }, { status: 500 })
  }
}
