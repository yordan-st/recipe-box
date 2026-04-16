import { useState, useEffect } from "react";
import { Button, Flex, Text } from "@radix-ui/themes";
import { DownloadIcon, Cross2Icon } from "@radix-ui/react-icons";
import { t } from "@/lib/i18n";

interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

const DISMISS_KEY = "install-prompt-dismissed";
const DISMISS_DURATION_MS = 7 * 24 * 60 * 60 * 1000; // 7 days

function isDismissed(): boolean {
  const raw = localStorage.getItem(DISMISS_KEY);
  if (!raw) return false;
  const dismissedAt = Number(raw);
  if (Date.now() - dismissedAt < DISMISS_DURATION_MS) return true;
  localStorage.removeItem(DISMISS_KEY);
  return false;
}

export function InstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] =
    useState<BeforeInstallPromptEvent | null>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (isDismissed()) return;

    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      setVisible(true);
    };

    window.addEventListener("beforeinstallprompt", handler);
    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;
    await deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === "accepted") {
      setVisible(false);
    }
    setDeferredPrompt(null);
  };

  const handleDismiss = () => {
    localStorage.setItem(DISMISS_KEY, String(Date.now()));
    setVisible(false);
    setDeferredPrompt(null);
  };

  if (!visible) return null;

  return (
    <div
      style={{
        position: "fixed",
        bottom: 0,
        left: 0,
        right: 0,
        zIndex: 1000,
        padding: "12px 16px",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <div
        style={{
          position: "relative",
          background: "var(--color-surface)",
          border: "1px solid var(--gray-6)",
          borderRadius: "var(--radius-3)",
          padding: "20px 14px 10px 14px",
          maxWidth: 480,
          width: "100%",
          boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)",
        }}
      >
        <Button
          size="1"
          variant="ghost"
          color="gray"
          onClick={handleDismiss}
          aria-label={t.dismissInstall}
          style={{
            position: "absolute",
            top: 8,
            right: 8,
          }}
        >
          <Cross2Icon />
        </Button>

        <Flex align="center" justify="center" gap="2" mb="2">
          <DownloadIcon />
          <Text size="2" weight="medium">
            {t.installMessage}
          </Text>
        </Flex>

        <Flex justify="center">
          <Button size="2" variant="solid" onClick={handleInstall}>
            {t.install}
          </Button>
        </Flex>
      </div>
    </div>
  );
}
