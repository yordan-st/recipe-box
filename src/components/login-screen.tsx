import { useState } from 'react'
import { Box, Flex, Text, Heading, TextField, Button } from '@radix-ui/themes'
import { t } from '@/lib/i18n'

interface LoginScreenProps {
  onLogin: (password: string) => Promise<boolean>
}

export function LoginScreen({ onLogin }: LoginScreenProps) {
  const [password, setPassword] = useState('')
  const [error, setError] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(false)
    setLoading(true)

    const success = await onLogin(password)
    if (!success) {
      setError(true)
      setPassword('')
    }
    setLoading(false)
  }

  return (
    <Flex
      align="center"
      justify="center"
      style={{ minHeight: '100vh', padding: '1rem' }}
    >
      <Box style={{ width: '100%', maxWidth: 360 }}>
        <form onSubmit={handleSubmit}>
          <Flex direction="column" gap="4" align="center">
            <Heading size="6">{t.loginTitle}</Heading>
            <Text size="2" color="gray">
              {t.loginSubtitle}
            </Text>
            <TextField.Root
              size="3"
              type="password"
              placeholder={t.loginPlaceholder}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoFocus
              style={{ width: '100%' }}
            />
            {error && (
              <Text size="2" color="red">
                {t.loginError}
              </Text>
            )}
            <Button
              size="3"
              type="submit"
              disabled={loading || !password}
              style={{ width: '100%' }}
            >
              {loading ? t.loginChecking : t.loginButton}
            </Button>
          </Flex>
        </form>
      </Box>
    </Flex>
  )
}
