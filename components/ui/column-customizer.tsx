"use client"

import { useState, useEffect } from "react"
import { Settings2, ChevronUp, ChevronDown, GripVertical } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { cn } from "@/lib/utils"

export interface ColumnConfig {
  id: string
  label: string
  defaultVisible?: boolean
  required?: boolean
}

interface ColumnCustomizerProps {
  tableId: string
  columns: ColumnConfig[]
  onVisibilityChange: (visibleColumns: string[], columnOrder: string[]) => void
  className?: string
}

export function ColumnCustomizer({
  tableId,
  columns,
  onVisibilityChange,
  className
}: ColumnCustomizerProps) {
  const [open, setOpen] = useState(false)
  const [isInitialized, setIsInitialized] = useState(false)

  // Get storage keys
  const visibilityKey = `table-columns-${tableId}`
  const orderKey = `table-column-order-${tableId}`

  // Get defaults
  const getDefaultVisible = () => columns.filter(c => c.defaultVisible !== false).map(c => c.id)
  const getDefaultOrder = () => columns.map(c => c.id)

  // Applied state (what's currently shown in table)
  const [appliedVisible, setAppliedVisible] = useState<string[]>([])
  const [appliedOrder, setAppliedOrder] = useState<string[]>([])

  // Pending state (what user is editing in popover)
  const [pendingVisible, setPendingVisible] = useState<string[]>([])
  const [pendingOrder, setPendingOrder] = useState<string[]>([])

  // Initialize from localStorage on mount
  useEffect(() => {
    if (columns.length === 0 || isInitialized) return

    let vis = getDefaultVisible()
    let ord = getDefaultOrder()

    try {
      const savedVis = localStorage.getItem(visibilityKey)
      const savedOrd = localStorage.getItem(orderKey)

      if (savedVis) {
        const parsed = JSON.parse(savedVis)
        const requiredIds = columns.filter(c => c.required).map(c => c.id)
        // Filter to only valid column IDs and ensure required columns are included
        vis = [...new Set([
          ...parsed.filter((id: string) => columns.some(c => c.id === id)),
          ...requiredIds
        ])]
      }

      if (savedOrd) {
        const parsed = JSON.parse(savedOrd)
        const allIds = columns.map(c => c.id)
        const validOrder = parsed.filter((id: string) => allIds.includes(id))
        const missing = allIds.filter(id => !validOrder.includes(id))
        ord = [...validOrder, ...missing]
      }
    } catch (e) {
      console.error('Error loading column settings:', e)
    }

    setAppliedVisible(vis)
    setAppliedOrder(ord)
    setPendingVisible(vis)
    setPendingOrder(ord)
    setIsInitialized(true)

    // Notify parent of initial state
    onVisibilityChange(vis, ord)
  }, [columns, visibilityKey, orderKey, isInitialized])

  // Check if there are pending changes
  const hasPendingChanges = () => {
    if (pendingVisible.length !== appliedVisible.length) return true
    if (pendingOrder.join(',') !== appliedOrder.join(',')) return true
    const sortedPending = [...pendingVisible].sort()
    const sortedApplied = [...appliedVisible].sort()
    return sortedPending.join(',') !== sortedApplied.join(',')
  }

  // Toggle column visibility
  const toggleColumn = (colId: string) => {
    const col = columns.find(c => c.id === colId)
    if (col?.required) return

    setPendingVisible(prev => {
      if (prev.includes(colId)) {
        return prev.filter(id => id !== colId)
      } else {
        return [...prev, colId]
      }
    })
  }

  // Move column up/down
  const moveColumn = (colId: string, dir: 'up' | 'down') => {
    setPendingOrder(prev => {
      const idx = prev.indexOf(colId)
      if (idx === -1) return prev
      const newIdx = dir === 'up' ? idx - 1 : idx + 1
      if (newIdx < 0 || newIdx >= prev.length) return prev
      const newOrder = [...prev]
      ;[newOrder[idx], newOrder[newIdx]] = [newOrder[newIdx], newOrder[idx]]
      return newOrder
    })
  }

  // Apply changes
  const handleApply = () => {
    // Save to localStorage
    localStorage.setItem(visibilityKey, JSON.stringify(pendingVisible))
    localStorage.setItem(orderKey, JSON.stringify(pendingOrder))

    // Update applied state
    setAppliedVisible([...pendingVisible])
    setAppliedOrder([...pendingOrder])

    // Notify parent
    onVisibilityChange([...pendingVisible], [...pendingOrder])

    setOpen(false)
  }

  // Reset to defaults
  const handleReset = () => {
    setPendingVisible(getDefaultVisible())
    setPendingOrder(getDefaultOrder())
  }

  // Cancel changes
  const handleCancel = () => {
    setPendingVisible([...appliedVisible])
    setPendingOrder([...appliedOrder])
    setOpen(false)
  }

  // When popover opens, sync pending with applied
  const handleOpenChange = (isOpen: boolean) => {
    if (isOpen) {
      setPendingVisible([...appliedVisible])
      setPendingOrder([...appliedOrder])
    }
    setOpen(isOpen)
  }

  // Sort columns by pending order for display in popover
  const sortedColumns = [...columns].sort((a, b) => {
    const orderToUse = pendingOrder.length > 0 ? pendingOrder : getDefaultOrder()
    return orderToUse.indexOf(a.id) - orderToUse.indexOf(b.id)
  })

  return (
    <Popover open={open} onOpenChange={handleOpenChange}>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className={cn("h-8 w-8 p-0 text-gray-500 hover:text-[#005180] hover:bg-[#005180]/10", className)}
          title="Customize columns"
        >
          <Settings2 className="h-4 w-4" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-56 p-0" align="end" sideOffset={5}>
        <div className="p-3 border-b bg-gray-50">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-gray-700">Customize Columns</span>
            <button onClick={handleReset} className="text-[10px] text-[#005180] hover:underline">
              Reset
            </button>
          </div>
          <p className="text-[10px] text-gray-500 mt-1">Show/hide and reorder</p>
        </div>

        <div className="max-h-[280px] overflow-y-auto p-2">
          {sortedColumns.map((col, idx) => {
            const isChecked = pendingVisible.includes(col.id)
            return (
              <div
                key={col.id}
                className={cn(
                  "flex items-center gap-1.5 px-2 py-1.5 rounded text-xs group",
                  col.required ? "opacity-50" : "hover:bg-gray-100"
                )}
              >
                <GripVertical className="h-3 w-3 text-gray-300" />

                <input
                  type="checkbox"
                  checked={isChecked}
                  onChange={() => toggleColumn(col.id)}
                  disabled={col.required}
                  className="h-3.5 w-3.5 rounded border-gray-300 text-[#005180] focus:ring-[#005180] cursor-pointer disabled:cursor-not-allowed"
                />

                <span className="flex-1 truncate">{col.label}</span>

                <div className="flex gap-0.5 opacity-0 group-hover:opacity-100">
                  <button
                    onClick={() => moveColumn(col.id, 'up')}
                    disabled={idx === 0}
                    className={cn("p-0.5 rounded hover:bg-gray-200", idx === 0 && "opacity-30")}
                  >
                    <ChevronUp className="h-3 w-3 text-gray-500" />
                  </button>
                  <button
                    onClick={() => moveColumn(col.id, 'down')}
                    disabled={idx === sortedColumns.length - 1}
                    className={cn("p-0.5 rounded hover:bg-gray-200", idx === sortedColumns.length - 1 && "opacity-30")}
                  >
                    <ChevronDown className="h-3 w-3 text-gray-500" />
                  </button>
                </div>
              </div>
            )
          })}
        </div>

        <div className="p-2 border-t bg-gray-50 flex gap-2">
          <Button variant="outline" size="sm" onClick={handleCancel} className="flex-1 h-7 text-xs">
            Cancel
          </Button>
          <Button
            size="sm"
            onClick={handleApply}
            disabled={!hasPendingChanges()}
            className={cn(
              "flex-1 h-7 text-xs",
              hasPendingChanges() ? "bg-[#005180] hover:bg-[#004060] text-white" : "bg-gray-200 text-gray-400"
            )}
          >
            Apply
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  )
}
