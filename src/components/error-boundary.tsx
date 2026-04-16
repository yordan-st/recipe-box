import { Component, type ReactNode } from 'react'
import { Box, Flex, Heading, Text, Button } from '@radix-ui/themes'
import { t } from '@/lib/i18n'

interface Props {
  children: ReactNode
}

interface State {
  hasError: boolean
  error?: Error
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error }
  }

  render() {
    if (this.state.hasError) {
      return (
        <Box p="6">
          <Flex direction="column" align="center" gap="4" py="8">
            <Heading size="5">{t.somethingWentWrong}</Heading>
            <Text size="2" color="gray" align="center" style={{ maxWidth: 400 }}>
              {t.errorDescription}
            </Text>
            {this.state.error && (
              <Text size="1" color="red" style={{ fontFamily: 'monospace', maxWidth: 500, wordBreak: 'break-all' }}>
                {this.state.error.message}
              </Text>
            )}
            <Button onClick={() => window.location.reload()}>
              {t.reload}
            </Button>
          </Flex>
        </Box>
      )
    }

    return this.props.children
  }
}
