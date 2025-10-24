"use client"
import { useState } from "react"
import { Plus, X } from "lucide-react"
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
    <div className="fixed bottom-20 right-4 z-40">
      {showActions && (
        <div className="absolute bottom-full right-0 mb-4 flex flex-col gap-2 max-w-[90vw]">
          {actions.map((action, index) => (
            <Button
              key={index}
              onClick={action.onClick}
              className="w-full justify-start truncate bg-blue-50 hover:bg-blue-100 text-blue-900 border-blue-200 whitespace-nowrap"
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
          "h-14 w-14 rounded-xl shadow-lg",
          "bg-[#005180]/50 hover:bg-[#005180]/65",
          "border-2 border-[#005180]/60 hover:border-[#005180]/75",
          "transition-colors duration-300",
          className
        )}
        size="icon"
        aria-label={label}
      >
        {showActions ? <X className={cn("h-10 w-10 stroke-[4]", iconColor)} /> : <Plus className={cn("h-10 w-10 stroke-[4]", iconColor)} />}
      </Button>
    </div>
  )
}
