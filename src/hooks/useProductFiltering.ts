// src/hooks/useProductFiltering.ts
import { useMemo, useState } from "react"
import type { Row, SortDirection } from "@/lib/types"
import { filterAndSortProducts, type FilterOptions } from "@/lib/filtering"

export function useProductFiltering(rows: Row[]) {
  const [searchQuery, setSearchQuery] = useState("")
  const [sortKey, setSortKey] = useState<string>("")
  const [sortDirection, setSortDirection] = useState<SortDirection>("asc")

  const filteredRows = useMemo(() => {
    const options: FilterOptions = {
      searchQuery,
      sortKey,
      sortDirection,
      enableRandomShuffle: true,
    }
    return filterAndSortProducts(rows, options)
  }, [rows, searchQuery, sortKey, sortDirection])

  return {
    searchQuery,
    setSearchQuery,
    sortKey,
    setSortKey,
    sortDirection,
    setSortDirection,
    filteredRows,
  }
}
