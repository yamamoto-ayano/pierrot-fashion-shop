// src/components/products/ProductTable.tsx
import type { Row } from "@/lib/types"

interface ProductTableProps {
  rows: Row[]
  headers: string[]
  isLoading: boolean
  error?: Error
}

export function ProductTable({ rows, headers, isLoading, error }: ProductTableProps) {
  return (
    <div className="overflow-x-auto rounded-xl border shadow-sm">
      <table className="min-w-full text-sm">
        <thead style={{ background: "#F8E8E4" }}>
          <tr>
            {headers.map((h) => (
              <th key={h} className="px-4 py-3 text-left font-semibold text-gray-800">
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {isLoading && (
            <tr>
              <td className="px-4 py-4 text-gray-500" colSpan={headers.length}>
                読み込み中…
              </td>
            </tr>
          )}
          {error && !isLoading && (
            <tr>
              <td className="px-4 py-4 text-red-600" colSpan={headers.length}>
                データ取得に失敗しました。
              </td>
            </tr>
          )}
          {!isLoading && !error && rows.length === 0 && (
            <tr>
              <td className="px-4 py-4 text-gray-500" colSpan={headers.length}>
                条件に合致する商品がありません。
              </td>
            </tr>
          )}
          {rows.map((r, i) => (
            <tr key={i} className="odd:bg-white even:bg-gray-50">
              {headers.map((h) => {
                const value = r[h] ?? ""
                return (
                  <td key={h} className="px-4 py-2">
                    {value}
                  </td>
                )
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
