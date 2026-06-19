'use client'

import { Info } from 'lucide-react'
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip'

export function InfoTip({ label }: { label: string }) {
  return (
    <Tooltip>
      <TooltipTrigger
        render={
          <button
            type="button"
            className="inline-flex text-muted-foreground transition-colors hover:text-foreground"
            aria-label="More information"
          >
            <Info className="size-3.5" />
          </button>
        }
      />
      <TooltipContent className="max-w-xs text-pretty leading-relaxed">
        {label}
      </TooltipContent>
    </Tooltip>
  )
}
