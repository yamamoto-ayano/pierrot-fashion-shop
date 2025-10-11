import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import type { Row } from "./types"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// 数値列かどうかを判定
export const isNumericColumn = (rows: Row[], key: string) =>
  rows.length > 0 && rows.every((r) => /^[\d,¥￥.\-]+$/.test(String(r[key] ?? "")))

// 文字列を数値に変換（カンマや通貨記号を除去）
export const toNumber = (v: string) => Number(v.replace?.(/[^\d.\-]/g, "") ?? v)

// 価格をフォーマット
export const formatPrice = (v?: string) => {
  if (!v) return ""
  const num = toNumber(v)
  return Number.isFinite(num) ? new Intl.NumberFormat("ja-JP").format(num) : v
}
