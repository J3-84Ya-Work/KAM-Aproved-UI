"use client"
import { useState } from "react"
import { Plus, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

interface FloatingActionButtonProps {
  actions?: { label: string; onClick: () => void }[]
  className?: string
  label?: string
}

export function FloatingActionButton({ actions = [], className, label = "Options" }: FloatingActionButtonProps) {
  const [showActions, setShowActions] = useState(false)

  const toggleActions = () => {
    setShowActions((prev) => !prev)
  }

  return (
    <div className="fixed bottom-20 right-4 z-40 max-w-[90vw]">
      {showActions && (
        <div className="flex flex-col gap-2 mb-4 max-w-full">
          {actions.map((action, index) => (
            <Button
              key={index}
              onClick={action.onClick}
              className="w-full justify-start truncate bg-blue-50 hover:bg-blue-100 text-blue-900 border-blue-200"
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
          "h-14 w-14 rounded-full shadow-lg",
          "bg-blue/20 hover:bg-blue/30 backdrop-blur-sm",
          "border-2 border-blue/40",
          "transition-colors duration-300",
          className
        )}
        size="icon"
        aria-label={label}
      >
        {showActions ? <X className="h-6 w-6 text-blue" /> : <Plus className="h-6 w-6 text-blue" />}
      </Button>
    </div>
  )
}
