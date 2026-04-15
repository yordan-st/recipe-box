const TAG_COLORS = ['orange', 'blue', 'green', 'purple', 'cyan', 'crimson', 'teal', 'plum'] as const

export type TagColor = (typeof TAG_COLORS)[number]

export function tagColor(tag: string): TagColor {
  let hash = 0
  for (const ch of tag) hash = ((hash << 5) - hash + ch.charCodeAt(0)) | 0
  return TAG_COLORS[Math.abs(hash) % TAG_COLORS.length]
}
