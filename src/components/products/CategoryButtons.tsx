// src/components/products/CategoryButtons.tsx
/**
 * 責務: カテゴリーボタン表示コンポーネント
 * - 利用可能なカテゴリーのボタンを表示
 * - カテゴリーボタンのクリックでカテゴリーページへ遷移
 * - カテゴリーが空の場合は非表示
 * - レスポンシブなボタンレイアウト
 */
import { Button } from "@/components/ui/button"

interface CategoryButtonsProps {
  categories: string[]
  onCategoryClick: (category: string) => void
}

export function CategoryButtons({ categories, onCategoryClick }: CategoryButtonsProps) {
  if (categories.length === 0) return null

  return (
    <div className="space-y-3">
      <h2 className="text-lg font-semibold" style={{ color: "#947962" }}>
        カテゴリー
      </h2>
      <div className="flex flex-wrap gap-2">
        {categories.map((category) => (
          <Button
            key={category}
            variant="outline"
            onClick={() => onCategoryClick(category)}
            className="rounded-full border-2 hover:bg-[#F8E8E4] hover:border-[#947962] transition-colors"
            style={{ borderColor: "#947962", color: "#947962" }}
          >
            {category}
          </Button>
        ))}
      </div>
    </div>
  )
}
