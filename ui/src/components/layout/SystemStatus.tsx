import { StatusPill } from '@/components/shared/StatusPill'
import { useEngineHealth } from '@/hooks/useEngineHealth'
import { APP_VERSION } from '@/lib/constants'
import type { ConnectionStatus } from '@/types/solver'

function connectionTone(status: ConnectionStatus): 'ok' | 'danger' | 'neutral' {
  if (status === 'CONNECTED') return 'ok'
  if (status === 'DISCONNECTED') return 'danger'
  return 'neutral'
}

export function SystemStatus({ compact = false }: { compact?: boolean }) {
  const { engineHealth, device } = useEngineHealth()
  const gpuLabel = device
    ? device.toUpperCase().includes('CUDA')
      ? 'CUDA'
      : device.toUpperCase()
    : 'NOT REPORTED'

  if (compact) {
    return (
      <div className="space-y-2 text-xs">
        <div className="flex items-center justify-between">
          <span className="text-ink-muted">Engine</span>
          <StatusPill label={engineHealth.engine === 'CONNECTED' ? 'Online' : engineHealth.engine} tone={connectionTone(engineHealth.engine)} />
        </div>
        <div className="flex items-center justify-between">
          <span className="text-ink-muted">GPU</span>
          <StatusPill
            label={gpuLabel}
            tone={device?.toUpperCase().includes('CUDA') ? 'info' : 'neutral'}
          />
        </div>
        <div className="flex items-center justify-between">
          <span className="text-ink-muted">API</span>
          <StatusPill label={engineHealth.api} tone={connectionTone(engineHealth.api)} />
        </div>
        <div className="flex items-center justify-between">
          <span className="text-ink-muted">Version</span>
          <span className="font-mono text-[10px] text-ink">{APP_VERSION}</span>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      <StatusPill
        label={`Engine ${engineHealth.engine === 'CONNECTED' ? 'online' : engineHealth.engine.toLowerCase()}`}
        tone={connectionTone(engineHealth.engine)}
      />
      <StatusPill
        label={`GPU ${gpuLabel}`}
        tone={device?.toUpperCase().includes('CUDA') ? 'info' : 'neutral'}
      />
      <StatusPill
        label={`API ${engineHealth.api.toLowerCase()}`}
        tone={connectionTone(engineHealth.api)}
      />
    </div>
  )
}
