import { useState, useRef, useEffect } from 'react'
import { Badge, Box, Flex, Text, TextField, IconButton } from '@radix-ui/themes'
import { Cross2Icon } from '@radix-ui/react-icons'

interface TagComboboxProps {
  value: string | null
  onChange: (value: string | null) => void
  options: string[]
  onAddOption: (option: string) => void
  onRemoveOption: (option: string) => void
  color: 'green' | 'amber' | 'blue'
  placeholder: string
}

export function TagCombobox({
  value,
  onChange,
  options,
  onAddOption,
  onRemoveOption,
  color,
  placeholder,
}: TagComboboxProps) {
  const [input, setInput] = useState('')
  const [isOpen, setIsOpen] = useState(false)
  const [highlightedIndex, setHighlightedIndex] = useState(-1)
  const containerRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const filtered = options.filter((o) =>
    o.toLowerCase().includes(input.toLowerCase())
  )

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  function selectOption(option: string) {
    onChange(option)
    setInput('')
    setIsOpen(false)
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'Escape') {
      setIsOpen(false)
      return
    }

    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setIsOpen(true)
      setHighlightedIndex((prev) => Math.min(prev + 1, filtered.length - 1))
      return
    }

    if (e.key === 'ArrowUp') {
      e.preventDefault()
      setHighlightedIndex((prev) => Math.max(prev - 1, 0))
      return
    }

    if (e.key === 'Enter') {
      e.preventDefault()
      if (highlightedIndex >= 0 && highlightedIndex < filtered.length) {
        selectOption(filtered[highlightedIndex])
        return
      }
      const trimmed = input.trim().toLowerCase()
      if (!trimmed) return
      const exactMatch = options.find((o) => o === trimmed)
      if (exactMatch) {
        selectOption(exactMatch)
      } else {
        onAddOption(trimmed)
        selectOption(trimmed)
      }
    }
  }

  function handleDeleteOption(e: React.MouseEvent, option: string) {
    e.preventDefault()
    e.stopPropagation()
    onRemoveOption(option)
    if (value === option) {
      onChange(null)
    }
  }

  if (value) {
    return (
      <Flex align="center" gap="2">
        <Badge variant="soft" size="2" color={color}>
          {value}
          <IconButton
            size="1"
            variant="ghost"
            color={color}
            onClick={() => onChange(null)}
            style={{ marginLeft: '4px', cursor: 'pointer' }}
          >
            <Cross2Icon width={10} height={10} />
          </IconButton>
        </Badge>
      </Flex>
    )
  }

  return (
    <Box ref={containerRef} style={{ position: 'relative' }}>
      <TextField.Root
        ref={inputRef}
        placeholder={placeholder}
        value={input}
        onChange={(e) => {
          setInput(e.target.value)
          setHighlightedIndex(-1)
          setIsOpen(true)
        }}
        onFocus={() => setIsOpen(true)}
        onKeyDown={handleKeyDown}
        size="2"
      />

      {isOpen && (filtered.length > 0 || input.trim()) && (
        <Box
          style={{
            position: 'absolute',
            top: '100%',
            left: 0,
            right: 0,
            zIndex: 50,
            marginTop: '4px',
            background: 'var(--color-panel-solid)',
            border: '1px solid var(--gray-6)',
            borderRadius: 'var(--radius-2)',
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
            maxHeight: '200px',
            overflowY: 'auto',
          }}
        >
          {filtered.map((option, i) => (
            <Flex
              key={option}
              align="center"
              justify="between"
              px="3"
              py="2"
              style={{
                cursor: 'pointer',
                background: i === highlightedIndex ? 'var(--gray-3)' : undefined,
              }}
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => selectOption(option)}
              onMouseEnter={() => setHighlightedIndex(i)}
            >
              <Text size="2">{option}</Text>
              <IconButton
                size="1"
                variant="ghost"
                color="red"
                onMouseDown={(e) => e.preventDefault()}
                onClick={(e) => handleDeleteOption(e, option)}
              >
                <Cross2Icon width={10} height={10} />
              </IconButton>
            </Flex>
          ))}
          {input.trim() && !options.includes(input.trim().toLowerCase()) && (
            <Flex
              align="center"
              px="3"
              py="2"
              style={{
                cursor: 'pointer',
                background: filtered.length === 0 && highlightedIndex === -1 ? 'var(--gray-3)' : undefined,
              }}
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => {
                const trimmed = input.trim().toLowerCase()
                onAddOption(trimmed)
                selectOption(trimmed)
              }}
            >
              <Text size="2" color="gray">
                + "{input.trim().toLowerCase()}" toevoegen
              </Text>
            </Flex>
          )}
        </Box>
      )}
    </Box>
  )
}
