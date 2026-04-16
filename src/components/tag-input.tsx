import { useState } from 'react'
import { Badge, Box, Flex, TextField, Text, IconButton } from '@radix-ui/themes'
import { Cross2Icon, TrashIcon } from '@radix-ui/react-icons'
import { tagColor } from '@/lib/tag-colors'
import { useUserPreferences } from '@/hooks/useUserPreferences'
import { t } from '@/lib/i18n'

const DEFAULT_SUGGESTIONS = [...t.defaultTags].map((s) => s.toLowerCase())

interface TagInputProps {
  tags: string[]
  onChange: (tags: string[]) => void
}

export function TagInput({ tags, onChange }: TagInputProps) {
  const [input, setInput] = useState('')
  const { preferences, addCustomTag, removeCustomTag } = useUserPreferences()
  const customTags = preferences.customTags ?? []

  // Merge defaults + custom, deduplicated
  const allSuggestions = [...new Set([...DEFAULT_SUGGESTIONS, ...customTags])]

  function addTag(raw: string) {
    const tag = raw.trim().toLowerCase()
    if (!tag || tags.includes(tag)) return
    onChange([...tags, tag])
    setInput('')
    // Auto-save new tags to global suggestions
    if (!allSuggestions.includes(tag)) {
      addCustomTag(tag)
    }
  }

  function removeTag(tag: string) {
    onChange(tags.filter((t) => t !== tag))
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault()
      addTag(input)
    }
    if (e.key === 'Backspace' && !input && tags.length > 0) {
      removeTag(tags[tags.length - 1])
    }
  }

  function handleDeleteSuggestion(e: React.MouseEvent, tag: string) {
    e.stopPropagation()
    removeCustomTag(tag)
  }

  const unusedSuggestions = allSuggestions.filter((s) => !tags.includes(s))

  return (
    <Box>
      {tags.length > 0 && (
        <Flex gap="1" wrap="wrap" mb="2">
          {tags.map((tag) => (
            <Badge
              key={tag}
              variant="soft"
              size="2"
              color={tagColor(tag)}
              style={{ cursor: 'pointer' }}
              onClick={() => removeTag(tag)}
            >
              {tag} <Cross2Icon width={10} height={10} />
            </Badge>
          ))}
        </Flex>
      )}

      <TextField.Root
        placeholder={t.addTagPlaceholder}
        value={input}
        onChange={(e) => setInput(e.target.value)}
        onKeyDown={handleKeyDown}
        size="2"
      />

      {unusedSuggestions.length > 0 && (
        <Flex gap="1" wrap="wrap" mt="2" align="center">
          <Text size="1" color="gray" mr="1">{t.suggestions}</Text>
          {unusedSuggestions.map((s) => {
            const isCustom = customTags.includes(s) && !DEFAULT_SUGGESTIONS.includes(s)
            return (
              <Flex key={s} align="center" gap="0">
                <Badge
                  variant="outline"
                  size="1"
                  color="gray"
                  style={{ cursor: 'pointer' }}
                  onClick={() => addTag(s)}
                >
                  + {s}
                </Badge>
                {isCustom && (
                  <IconButton
                    size="1"
                    variant="ghost"
                    color="red"
                    onClick={(e) => handleDeleteSuggestion(e, s)}
                    style={{ marginLeft: '2px' }}
                  >
                    <TrashIcon width={10} height={10} />
                  </IconButton>
                )}
              </Flex>
            )
          })}
        </Flex>
      )}
    </Box>
  )
}
