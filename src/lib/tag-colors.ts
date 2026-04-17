export const TAG_CATEGORY_COLORS = {
  dishType: 'green',
  diet: 'amber',
  cuisine: 'blue',
} as const

export type TagCategory = keyof typeof TAG_CATEGORY_COLORS
export type TagCategoryColor = (typeof TAG_CATEGORY_COLORS)[TagCategory]
