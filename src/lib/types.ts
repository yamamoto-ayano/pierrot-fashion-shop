/**
 * 責務: アプリケーション全体で使用する型定義
 * - データ行の型定義（Row）
 * - カード表示用のフィールドキー（CardFieldKeys）
 * - ソート方向の型定義（SortDirection）
 * - 定数定義（ALL）
 */
// 共通の型定義

export type Row = Record<string, string>

export type CardFieldKeys = {
  titleKey?: string
  priceKey?: string
  categoryKey?: string
  imageKey?: string
  descriptionKey?: string
}

export type SortDirection = "asc" | "desc"

export const ALL = "__ALL__" as const
