// src/hooks/useProductPagination.ts
import { useState, useMemo } from "react"
import type { Row } from "@/lib/types"

export function useProductPagination(rows: Row[], pageSize: number = 10) {
  const [page, setPage] = useState(1)

  const pagination = useMemo(() => {
    const total = rows.length
    const maxPage = Math.max(1, Math.ceil(total / pageSize))
    const pageRows = rows.slice((page - 1) * pageSize, page * pageSize)
    
    return {
      total,
      maxPage,
      pageRows,
      currentPage: page,
      hasNextPage: page < maxPage,
      hasPrevPage: page > 1,
    }
  }, [rows, page, pageSize])

  const goToPage = (newPage: number) => {
    setPage(Math.max(1, Math.min(pagination.maxPage, newPage)))
  }

  const nextPage = () => goToPage(page + 1)
  const prevPage = () => goToPage(page - 1)

  return {
    ...pagination,
    goToPage,
    nextPage,
    prevPage,
    setPage,
  }
}
