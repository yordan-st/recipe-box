import { Tooltip, IconButton } from '@radix-ui/themes';
import { CheckCircledIcon, CrossCircledIcon, UpdateIcon } from '@radix-ui/react-icons';
import { useSyncStatus } from '@/hooks/useSyncStatus';
import { fullSync } from '@/lib/sync/sync-engine';
import { t } from '@/lib/i18n';

export function SyncStatusIndicator() {
  const { state, lastError } = useSyncStatus();

  const label =
    state === 'syncing' ? t.syncing :
    state === 'error' ? t.syncError(lastError ?? '') :
    state === 'offline' ? t.offline :
    t.synced;

  const color =
    state === 'error' ? 'red' as const :
    state === 'offline' ? 'orange' as const :
    state === 'syncing' ? 'gray' as const :
    'green' as const;

  return (
    <Tooltip content={label}>
      <IconButton
        size="2"
        variant="ghost"
        color={color}
        onClick={() => fullSync()}
        aria-label={label}
      >
        {state === 'syncing' ? (
          <UpdateIcon style={{ animation: 'spin 1s linear infinite' }} />
        ) : state === 'error' || state === 'offline' ? (
          <CrossCircledIcon />
        ) : (
          <CheckCircledIcon />
        )}
      </IconButton>
    </Tooltip>
  );
}
