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
