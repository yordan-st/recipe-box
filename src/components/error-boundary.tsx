import { Component, type ReactNode } from 'react'
import { Box, Flex, Heading, Text, Button } from '@radix-ui/themes'

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
            <Heading size="5">Something went wrong</Heading>
            <Text size="2" color="gray" align="center" style={{ maxWidth: 400 }}>
              The app encountered an unexpected error. Try reloading the page.
            </Text>
            {this.state.error && (
              <Text size="1" color="red" style={{ fontFamily: 'monospace', maxWidth: 500, wordBreak: 'break-all' }}>
                {this.state.error.message}
              </Text>
            )}
            <Button onClick={() => window.location.reload()}>
              Reload
            </Button>
          </Flex>
        </Box>
      )
    }

    return this.props.children
  }
}
