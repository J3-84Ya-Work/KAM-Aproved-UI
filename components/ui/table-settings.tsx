"use client"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Settings2, Eye, EyeOff, ArrowUpDown, RotateCcw, GripVertical, ChevronUp, ChevronDown } from "lucide-react"

interface ColumnConfig {
  id: string
  label: string
  defaultVisible?: boolean
}

interface TableSettingsProps {
  storageKey: string
  columns: ColumnConfig[]
  columnVisibility: Record<string, boolean>
  setColumnVisibility: (visibility: Record<string, boolean>) => void
  columnOrder: string[]
  setColumnOrder: (order: string[]) => void
  sortColumn?: string
  setSortColumn?: (column: string) => void
  sortDirection?: 'asc' | 'desc'
  setSortDirection?: (direction: 'asc' | 'desc') => void
  onReset?: () => void
}

export function TableSettingsButton({
  storageKey,
  columns,
  columnVisibility,
  setColumnVisibility,
  columnOrder,
  setColumnOrder,
  sortColumn = '',
  setSortColumn,
  sortDirection = 'desc',
  setSortDirection,
  onReset,
}: TableSettingsProps) {
  const [open, setOpen] = useState(false)
  const [draggedItem, setDraggedItem] = useState<string | null>(null)
  const [dragOverItem, setDragOverItem] = useState<string | null>(null)
  const dragNodeRef = useRef<HTMLDivElement | null>(null)

  // Column labels lookup
  const columnLabels = columns.reduce((acc, col) => {
    acc[col.id] = col.label
    return acc
  }, {} as Record<string, string>)

  // Toggle column visibility
  const toggleColumnVisibility = (columnId: string) => {
    setColumnVisibility({
      ...columnVisibility,
      [columnId]: columnVisibility[columnId] === false ? true : false
    })
  }

  // Handle sort
  const handleSetSort = (columnId: string) => {
    if (!setSortColumn || !setSortDirection) return
    if (sortColumn === columnId) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc')
    } else {
      setSortColumn(columnId)
      setSortDirection('asc')
    }
  }

  // Clear sorting
  const clearSort = () => {
    if (setSortColumn) setSortColumn('')
    if (setSortDirection) setSortDirection('desc')
  }

  // Drag handlers
  const handleDragStart = (e: React.DragEvent<HTMLDivElement>, columnId: string) => {
    setDraggedItem(columnId)
    dragNodeRef.current = e.target as HTMLDivElement
    e.dataTransfer.effectAllowed = 'move'
    e.dataTransfer.setData('text/plain', columnId)

    // Add dragging class after a small delay for visual feedback
    setTimeout(() => {
      if (dragNodeRef.current) {
        dragNodeRef.current.classList.add('opacity-50')
      }
    }, 0)
  }

  const handleDragEnter = (e: React.DragEvent<HTMLDivElement>, columnId: string) => {
    e.preventDefault()
    if (columnId !== draggedItem) {
      setDragOverItem(columnId)
    }
  }

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = 'move'
  }

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
  }

  const handleDrop = (e: React.DragEvent<HTMLDivElement>, targetColumnId: string) => {
    e.preventDefault()

    if (draggedItem && draggedItem !== targetColumnId) {
      const newOrder = [...columnOrder]
      const draggedIndex = newOrder.indexOf(draggedItem)
      const targetIndex = newOrder.indexOf(targetColumnId)

      // Remove dragged item and insert at target position
      newOrder.splice(draggedIndex, 1)
      newOrder.splice(targetIndex, 0, draggedItem)

      setColumnOrder(newOrder)
    }

    // Reset drag state
    setDraggedItem(null)
    setDragOverItem(null)
    if (dragNodeRef.current) {
      dragNodeRef.current.classList.remove('opacity-50')
    }
  }

  const handleDragEnd = () => {
    setDraggedItem(null)
    setDragOverItem(null)
    if (dragNodeRef.current) {
      dragNodeRef.current.classList.remove('opacity-50')
    }
  }

  // Save to localStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem(`${storageKey}-column-visibility`, JSON.stringify(columnVisibility))
      localStorage.setItem(`${storageKey}-column-order`, JSON.stringify(columnOrder))
      if (sortColumn !== undefined) {
        localStorage.setItem(`${storageKey}-sort-column`, sortColumn)
      }
      if (sortDirection !== undefined) {
        localStorage.setItem(`${storageKey}-sort-direction`, sortDirection)
      }
    }
  }, [storageKey, columnVisibility, columnOrder, sortColumn, sortDirection])

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="p-2 rounded-full hover:bg-[#005180]/10 transition-colors duration-200 group relative"
        title="Customize Table"
      >
        <Settings2 className="h-5 w-5 text-[#005180] group-hover:text-[#003d63]" />
      </button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-[450px] p-0 rounded-2xl overflow-hidden">
          <DialogHeader className="px-4 py-3 border-b bg-[#005180]">
            <DialogTitle className="text-white text-base font-semibold flex items-center gap-2">
              <Settings2 className="h-4 w-4" />
              Table Settings
            </DialogTitle>
            <DialogDescription className="text-white/70 text-xs">
              Customize columns, sorting, and arrangement
            </DialogDescription>
          </DialogHeader>

          <div className="p-4 space-y-4 max-h-[60vh] overflow-y-auto">
            {/* Sort Section */}
            {setSortColumn && (
              <div>
                <div className="flex items-center justify-between mb-2">
                  <h4 className="text-sm font-semibold text-gray-900 flex items-center gap-2">
                    <ArrowUpDown className="h-4 w-4 text-[#005180]" />
                    Sort By
                  </h4>
                  {sortColumn && (
                    <button onClick={clearSort} className="text-xs text-gray-500 hover:text-[#B92221]">
                      Clear
                    </button>
                  )}
                </div>
                <div className="grid grid-cols-2 gap-2">
                  {columnOrder.filter(col => col !== 'actions').map((columnId) => (
                    <button
                      key={columnId}
                      onClick={() => handleSetSort(columnId)}
                      className={`px-3 py-2 text-xs rounded-md border text-left flex items-center justify-between ${
                        sortColumn === columnId
                          ? 'bg-[#005180] text-white border-[#005180]'
                          : 'bg-white text-gray-700 border-gray-200 hover:border-[#005180] hover:bg-[#005180]/5'
                      }`}
                    >
                      <span>{columnLabels[columnId] || columnId}</span>
                      {sortColumn === columnId && (
                        <span className="text-[10px] ml-1">
                          {sortDirection === 'asc' ? '↑' : '↓'}
                        </span>
                      )}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Columns Section */}
            <div>
              <h4 className="text-sm font-semibold text-gray-900 flex items-center gap-2 mb-2">
                <Eye className="h-4 w-4 text-[#005180]" />
                Show / Hide Columns
              </h4>
              <div className="grid grid-cols-2 gap-2">
                {columnOrder.map((columnId) => {
                  const isVisible = columnVisibility[columnId] !== false
                  return (
                    <button
                      key={columnId}
                      onClick={() => toggleColumnVisibility(columnId)}
                      className={`px-3 py-2 text-xs rounded-md border flex items-center gap-2 ${
                        isVisible
                          ? 'bg-[#78BE20]/10 text-[#78BE20] border-[#78BE20]/30'
                          : 'bg-gray-100 text-gray-400 border-gray-200'
                      }`}
                    >
                      {isVisible ? <Eye className="h-3 w-3" /> : <EyeOff className="h-3 w-3" />}
                      <span>{columnLabels[columnId] || columnId}</span>
                    </button>
                  )
                })}
              </div>
            </div>

            {/* Rearrange Section with Drag and Drop + Mobile Buttons */}
            <div>
              <h4 className="text-sm font-semibold text-gray-900 flex items-center gap-2 mb-2">
                <GripVertical className="h-4 w-4 text-[#005180]" />
                Rearrange Columns
                <span className="text-xs font-normal text-gray-500 hidden sm:inline">(drag to reorder)</span>
              </h4>
              <div className="border rounded-md overflow-hidden">
                {columnOrder.map((columnId, index) => {
                  const isVisible = columnVisibility[columnId] !== false
                  const isDragging = draggedItem === columnId
                  const isDragOver = dragOverItem === columnId

                  const moveUp = () => {
                    if (index > 0) {
                      const newOrder = [...columnOrder]
                      ;[newOrder[index - 1], newOrder[index]] = [newOrder[index], newOrder[index - 1]]
                      setColumnOrder(newOrder)
                    }
                  }

                  const moveDown = () => {
                    if (index < columnOrder.length - 1) {
                      const newOrder = [...columnOrder]
                      ;[newOrder[index], newOrder[index + 1]] = [newOrder[index + 1], newOrder[index]]
                      setColumnOrder(newOrder)
                    }
                  }

                  return (
                    <div
                      key={columnId}
                      draggable
                      onDragStart={(e) => handleDragStart(e, columnId)}
                      onDragEnter={(e) => handleDragEnter(e, columnId)}
                      onDragOver={handleDragOver}
                      onDragLeave={handleDragLeave}
                      onDrop={(e) => handleDrop(e, columnId)}
                      onDragEnd={handleDragEnd}
                      className={`flex items-center justify-between px-3 py-2 cursor-grab active:cursor-grabbing select-none transition-all ${
                        index !== columnOrder.length - 1 ? 'border-b' : ''
                      } ${isVisible ? 'bg-white' : 'bg-gray-50'} ${
                        isDragging ? 'opacity-50 bg-gray-100' : ''
                      } ${isDragOver ? 'bg-[#005180]/10 border-[#005180]' : ''}`}
                    >
                      <div className="flex items-center gap-2">
                        <GripVertical className="h-4 w-4 text-gray-400 hidden sm:block" />
                        <span className={`text-sm ${isVisible ? 'text-gray-900' : 'text-gray-400'}`}>
                          {columnLabels[columnId] || columnId}
                        </span>
                      </div>
                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          onClick={(e) => { e.stopPropagation(); moveUp(); }}
                          disabled={index === 0}
                          className={`p-1 rounded hover:bg-gray-100 ${index === 0 ? 'opacity-30 cursor-not-allowed' : 'text-gray-500 hover:text-[#005180]'}`}
                        >
                          <ChevronUp className="h-4 w-4" />
                        </button>
                        <button
                          type="button"
                          onClick={(e) => { e.stopPropagation(); moveDown(); }}
                          disabled={index === columnOrder.length - 1}
                          className={`p-1 rounded hover:bg-gray-100 ${index === columnOrder.length - 1 ? 'opacity-30 cursor-not-allowed' : 'text-gray-500 hover:text-[#005180]'}`}
                        >
                          <ChevronDown className="h-4 w-4" />
                        </button>
                        <span className="text-xs text-gray-400 w-5 text-right">
                          {index + 1}
                        </span>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="px-4 py-3 border-t bg-gray-50 flex items-center justify-between">
            <Button
              variant="outline"
              size="sm"
              className="text-gray-600 border-gray-300"
              onClick={onReset}
            >
              <RotateCcw className="h-3 w-3 mr-1" />
              Reset All
            </Button>
            <Button
              size="sm"
              className="bg-[#005180] hover:bg-[#004060] text-white"
              onClick={() => setOpen(false)}
            >
              Done
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}

// Hook to manage table settings state with localStorage persistence
export function useTableSettings(storageKey: string, defaultColumns: ColumnConfig[], defaultVisibility: Record<string, boolean> = {}) {
  const [columnVisibility, setColumnVisibility] = useState<Record<string, boolean>>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem(`${storageKey}-column-visibility`)
      if (saved) {
        try {
          return JSON.parse(saved)
        } catch (e) {}
      }
    }
    return defaultVisibility
  })

  const [columnOrder, setColumnOrder] = useState<string[]>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem(`${storageKey}-column-order`)
      if (saved) {
        try {
          return JSON.parse(saved)
        } catch (e) {}
      }
    }
    return defaultColumns.map(col => col.id)
  })

  const [sortColumn, setSortColumn] = useState<string>(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem(`${storageKey}-sort-column`) || ''
    }
    return ''
  })

  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>(() => {
    if (typeof window !== 'undefined') {
      return (localStorage.getItem(`${storageKey}-sort-direction`) as 'asc' | 'desc') || 'desc'
    }
    return 'desc'
  })

  const resetSettings = () => {
    setColumnVisibility(defaultVisibility)
    setColumnOrder(defaultColumns.map(col => col.id))
    setSortColumn('')
    setSortDirection('desc')
  }

  return {
    columnVisibility,
    setColumnVisibility,
    columnOrder,
    setColumnOrder,
    sortColumn,
    setSortColumn,
    sortDirection,
    setSortDirection,
    resetSettings,
    columns: defaultColumns,
  }
}
