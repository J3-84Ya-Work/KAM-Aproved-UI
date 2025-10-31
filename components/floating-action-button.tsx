"use client"
import { useState } from "react"
import { MoreHorizontal, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

interface FloatingActionButtonProps {
  actions?: { label: string; onClick: () => void }[]
  className?: string
  label?: string
  iconColor?: string
}

export function FloatingActionButton({ actions = [], className, label = "Options", iconColor = "text-[#005180]" }: FloatingActionButtonProps) {
  const [showActions, setShowActions] = useState(false)

  const toggleActions = () => {
    setShowActions((prev) => !prev)
  }

  return (
    <div className="fixed bottom-20 right-4 z-50">
      {showActions && (
        <div className="absolute bottom-full right-0 mb-4 flex flex-col gap-2 w-48 animate-in slide-in-from-bottom-4 fade-in duration-300">
          {actions.map((action, index) => (
            <Button
              key={index}
              onClick={action.onClick}
              className="w-full justify-start bg-white/95 hover:bg-white text-[#005180] border-2 border-[#78BE20]/60 hover:border-[#78BE20] whitespace-nowrap transition-all duration-200 hover:scale-105 hover:shadow-lg active:scale-95 font-semibold shadow-md backdrop-blur-sm"
              variant="outline"
            >
              {action.label}
            </Button>
          ))}
        </div>
      )}
      <Button
        onClick={toggleActions}
        className={cn(
          "h-12 w-12 rounded-xl shadow-lg",
          "bg-[#005180]/50 hover:bg-[#005180]/65",
          "border-2 border-[#005180]/60 hover:border-[#005180]/75",
          "transition-all duration-300 ease-out",
          "hover:scale-110 active:scale-95",
          showActions && "rotate-45",
          className
        )}
        size="icon"
        aria-label={label}
      >
        {showActions ? (
          <X className={cn("h-8 w-8 stroke-[3] transition-transform duration-300", iconColor)} />
        ) : (
          <MoreHorizontal className={cn("h-8 w-8 stroke-[3] transition-transform duration-300", iconColor)} />
        )}
      </Button>
    </div>
  )
}
