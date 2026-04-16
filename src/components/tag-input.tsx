import { useState } from 'react'
import { Badge, Box, Flex, TextField, Text } from '@radix-ui/themes'
import { Cross2Icon } from '@radix-ui/react-icons'
import { tagColor } from '@/lib/tag-colors'
import { t } from '@/lib/i18n'

const SUGGESTIONS = [...t.defaultTags]

interface TagInputProps {
  tags: string[]
  onChange: (tags: string[]) => void
}

export function TagInput({ tags, onChange }: TagInputProps) {
  const [input, setInput] = useState('')

  function addTag(raw: string) {
    const tag = raw.trim().toLowerCase()
    if (!tag || tags.includes(tag)) return
    onChange([...tags, tag])
    setInput('')
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

  const unusedSuggestions = SUGGESTIONS.filter((s) => !tags.includes(s.toLowerCase()))

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
        <Flex gap="1" wrap="wrap" mt="2">
          <Text size="1" color="gray" mr="1">{t.suggestions}</Text>
          {unusedSuggestions.map((s) => (
            <Badge
              key={s}
              variant="outline"
              size="1"
              color="gray"
              style={{ cursor: 'pointer' }}
              onClick={() => addTag(s)}
            >
              + {s}
            </Badge>
          ))}
        </Flex>
      )}
    </Box>
  )
}
