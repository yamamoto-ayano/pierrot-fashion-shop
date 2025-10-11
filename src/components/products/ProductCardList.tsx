import Image from "next/image"
import { asImageUrl } from "@/lib/drive"
import { formatPrice } from "@/lib/utils"
import type { Row, CardFieldKeys } from "@/lib/types"

export function ProductCardList({ rows, keys }: { rows: Row[]; keys: CardFieldKeys }) {
  const { titleKey, priceKey, categoryKey, imageKey, descriptionKey } = keys

  if (!rows.length) return <p className="px-4 py-4 text-gray-500">条件に合致する商品がありません。</p>

  return (
    <div className="grid gap-4 grid-cols-[repeat(auto-fill,minmax(220px,1fr))]">
      {rows.map((r, i) => {
        const title = (titleKey && r[titleKey]) || ""
        const price = (priceKey && r[priceKey]) || ""
        const category = (categoryKey && r[categoryKey]) || ""
        const description = (descriptionKey && r[descriptionKey]) || ""

        // ここでID→URLに変換
        const rawImg = (imageKey && r[imageKey]) || ""
        const imageUrl = asImageUrl(rawImg)

        return (
          <article key={i} className="rounded-2xl border bg-white overflow-hidden shadow-sm hover:shadow-md transition-shadow">
            <div className="aspect-[4/3] relative bg-gray-100">
              {imageUrl ? (
                <Image
                  src={imageUrl}
                  alt={title || "image"}
                  fill
                  className="object-cover"
                  unoptimized   // まずは簡単に。最適化する場合は next.config.mjs を設定して外す
                />
              ) : (
                <div className="absolute inset-0 flex items-center justify-center text-gray-400 text-sm">
                  No Image
                </div>
              )}
            </div>
            <div className="p-3 space-y-1.5">
              <h3 className="font-semibold line-clamp-2">{title || "（無題）"}</h3>
              <div className="flex items-center gap-2 text-sm">
                {price && <span className="font-semibold" style={{ color: "#947962" }}>¥{formatPrice(price)}</span>}
                {category && <span className="rounded-full border px-2 py-0.5 text-xs text-gray-600 bg-[var(--chip-bg,#F8E8E433)]">{category}</span>}
              </div>
              {description && <p className="text-xs text-gray-600 line-clamp-2">{description}</p>}
            </div>
          </article>
        )
      })}
    </div>
  )
}
