import { useState, useEffect } from 'react'
import { Button, Callout, Flex, Text } from '@radix-ui/themes'
import { DownloadIcon, Cross2Icon } from '@radix-ui/react-icons'

interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>
}

const DISMISS_KEY = 'install-prompt-dismissed'
const DISMISS_DURATION_MS = 7 * 24 * 60 * 60 * 1000 // 7 days

function isDismissed(): boolean {
  const raw = localStorage.getItem(DISMISS_KEY)
  if (!raw) return false
  const dismissedAt = Number(raw)
  if (Date.now() - dismissedAt < DISMISS_DURATION_MS) return true
  localStorage.removeItem(DISMISS_KEY)
  return false
}

export function InstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] =
    useState<BeforeInstallPromptEvent | null>(null)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    if (isDismissed()) return

    const handler = (e: Event) => {
      e.preventDefault()
      setDeferredPrompt(e as BeforeInstallPromptEvent)
      setVisible(true)
    }

    window.addEventListener('beforeinstallprompt', handler)
    return () => window.removeEventListener('beforeinstallprompt', handler)
  }, [])

  const handleInstall = async () => {
    if (!deferredPrompt) return
    await deferredPrompt.prompt()
    const { outcome } = await deferredPrompt.userChoice
    if (outcome === 'accepted') {
      setVisible(false)
    }
    setDeferredPrompt(null)
  }

  const handleDismiss = () => {
    localStorage.setItem(DISMISS_KEY, String(Date.now()))
    setVisible(false)
    setDeferredPrompt(null)
  }

  if (!visible) return null

  return (
    <div
      style={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        zIndex: 1000,
        padding: '12px 16px',
      }}
    >
      <Callout.Root>
        <Callout.Icon>
          <DownloadIcon />
        </Callout.Icon>
        <Flex align="center" gap="3" wrap="wrap" flexGrow="1">
          <Callout.Text>
            <Text weight="medium">Install Recipe Box</Text> for a faster,
            app-like experience.
          </Callout.Text>
          <Flex gap="2" ml="auto">
            <Button size="2" variant="solid" onClick={handleInstall}>
              Install Recipe Box
            </Button>
            <Button
              size="2"
              variant="ghost"
              color="gray"
              onClick={handleDismiss}
              aria-label="Dismiss install prompt"
            >
              <Cross2Icon />
            </Button>
          </Flex>
        </Flex>
      </Callout.Root>
    </div>
  )
}
