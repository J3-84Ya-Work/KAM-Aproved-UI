"use client"

import { useState, useMemo } from "react"
import { Search, Check } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"

// Function to get display text (hide IDs like (CategoryID: 15), (ClientID: 68), (ID: 123))
function getDisplayText(text: string): string {
  return text
    .replace(/\s*\([^)]*ID\s*:\s*\d+\)/gi, '')  // Remove (CategoryID: X), (ClientID: X), etc.
    .replace(/\s*\(ID\s*:\s*\d+\)/gi, '')       // Remove (ID: X)
    .trim()
}

interface ScrollableOptionsListProps {
  options: string[]
  messageId: string
  isMultiSelect?: boolean
  selectedOptions?: string[]
  onOptionSelect: (option: string, messageId: string, isMultiSelect: boolean) => void
  onMultiSelectSubmit?: (messageId: string) => void
  isTyping?: boolean
  maxVisibleItems?: number
}

export function ScrollableOptionsList({
  options,
  messageId,
  isMultiSelect = false,
  selectedOptions = [],
  onOptionSelect,
  onMultiSelectSubmit,
  isTyping = false,
  maxVisibleItems = 5,
}: ScrollableOptionsListProps) {
  const [searchQuery, setSearchQuery] = useState("")

  // Filter options based on search query (search in display text without IDs)
  const filteredOptions = useMemo(() => {
    if (!searchQuery.trim()) return options
    const query = searchQuery.toLowerCase()
    return options.filter(option =>
      getDisplayText(option).toLowerCase().includes(query)
    )
  }, [options, searchQuery])

  // Calculate dynamic height based on number of items
  // Each item is approximately 44px (py-2.5 = 10px top + 10px bottom + ~24px content)
  const itemHeight = 44
  const searchBarHeight = 48
  const submitButtonHeight = isMultiSelect && selectedOptions.length > 0 ? 48 : 0
  const visibleItems = Math.min(filteredOptions.length, maxVisibleItems)
  const listHeight = visibleItems * itemHeight
  const totalHeight = searchBarHeight + listHeight + submitButtonHeight + 16 // 16px for padding

  // Only show search if there are more items than maxVisibleItems
  const showSearch = options.length > maxVisibleItems

  return (
    <div
      className="mt-3 ml-0 w-full max-w-[95%] md:max-w-[400px] border border-gray-200 rounded-xl bg-white shadow-sm overflow-hidden"
      style={{ maxHeight: `${totalHeight}px` }}
    >
      {/* Search Input */}
      {showSearch && (
        <div className="p-2 border-b border-gray-100 bg-gray-50/50">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              type="text"
              placeholder="Search options..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 h-9 text-sm border-gray-200 focus:border-[#005180] focus:ring-[#005180]/20"
            />
          </div>
        </div>
      )}

      {/* Scrollable Options List */}
      <ScrollArea
        className="w-full"
        style={{ height: `${listHeight}px` }}
      >
        <div className="p-2 space-y-1">
          {filteredOptions.length > 0 ? (
            filteredOptions.map((option, index) => {
              const isSelected = isMultiSelect && selectedOptions.includes(option)
              // Display text without IDs, but send full option with ID to API
              const displayText = getDisplayText(option)

              return (
                <button
                  key={`${messageId}-option-${index}`}
                  onClick={() => onOptionSelect(option, messageId, isMultiSelect)}
                  disabled={isTyping}
                  className={`w-full text-left px-3 py-2.5 rounded-lg text-sm transition-all flex items-center gap-2 ${
                    isSelected
                      ? "bg-[#005180] text-white"
                      : "bg-gray-50 hover:bg-[#005180]/10 text-gray-700 hover:text-[#005180]"
                  } ${isTyping ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}`}
                >
                  {isMultiSelect && (
                    <div className={`w-5 h-5 rounded border-2 flex items-center justify-center flex-shrink-0 transition-colors ${
                      isSelected
                        ? "bg-white border-white"
                        : "border-gray-300 bg-white"
                    }`}>
                      {isSelected && <Check className="h-3 w-3 text-[#005180]" />}
                    </div>
                  )}
                  <span className="flex-1 truncate">{displayText}</span>
                </button>
              )
            })
          ) : (
            <div className="text-center py-4 text-gray-400 text-sm">
              No options found
            </div>
          )}
        </div>
      </ScrollArea>

      {/* Submit Button for Multi-select */}
      {isMultiSelect && selectedOptions.length > 0 && onMultiSelectSubmit && (
        <div className="p-2 border-t border-gray-100 bg-gray-50/50">
          <Button
            onClick={() => onMultiSelectSubmit(messageId)}
            disabled={isTyping}
            className="w-full bg-[#005180] text-white hover:bg-[#004060] h-9 text-sm"
          >
            Submit Selected ({selectedOptions.length})
          </Button>
        </div>
      )}
    </div>
  )
}

// Special component for YES/NO or CONFIRM/MODIFY buttons (not scrollable)
export function ActionButtonsRow({
  options,
  messageId,
  onOptionSelect,
  isTyping = false,
}: {
  options: string[]
  messageId: string
  onOptionSelect: (option: string, messageId: string, isMultiSelect: boolean) => void
  isTyping?: boolean
}) {
  const isYesNo = options.length === 2 && options.includes('YES') && options.includes('NO')
  const isConfirmModify = options.length === 2 && options.includes('CONFIRM') && options.includes('MODIFY')

  if (!isYesNo && !isConfirmModify) return null

  return (
    <div className="mt-3 ml-0 flex flex-row gap-3">
      {options.map((option, index) => (
        <Button
          key={`${messageId}-action-${index}`}
          variant="outline"
          onClick={() => onOptionSelect(option, messageId, false)}
          disabled={isTyping}
          className={`justify-center text-center h-auto py-2 px-4 text-xs sm:text-sm sm:py-3 sm:px-6 transition-all ${
            isYesNo
              ? option === 'YES'
                ? 'bg-transparent text-green-600 hover:bg-green-50 border-2 border-green-600'
                : 'bg-transparent text-red-600 hover:bg-red-50 border-2 border-red-600'
              : isConfirmModify
                ? option === 'CONFIRM'
                  ? 'bg-transparent text-green-600 hover:bg-green-50 border-2 border-green-600'
                  : 'bg-transparent text-orange-500 hover:bg-orange-50 border-2 border-orange-500'
                : ''
          }`}
        >
          <span>{option === 'CONFIRM' ? 'Confirm' : option === 'MODIFY' ? 'Modify' : option}</span>
        </Button>
      ))}
    </div>
  )
}
