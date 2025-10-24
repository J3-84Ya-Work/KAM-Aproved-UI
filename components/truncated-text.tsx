"use client"

import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

interface TruncatedTextProps {
  text: string
  limit?: number
  className?: string
}

export function TruncatedText({ text, limit = 30, className = "" }: TruncatedTextProps) {
  if (text.length <= limit) {
    return <span className={className}>{text}</span>
  }

  const truncated = text.slice(0, limit) + "..."

  return (
    <TooltipProvider delayDuration={200}>
      <Tooltip>
        <TooltipTrigger asChild>
          <span className={`cursor-help ${className}`}>{truncated}</span>
        </TooltipTrigger>
        <TooltipContent side="top" className="max-w-xs break-words">
          <p>{text}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}
