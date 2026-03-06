'use client'

import * as React from 'react'
import { Check, ChevronsUpDown, X, Search } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Badge } from '@/components/ui/badge'
import { Checkbox } from '@/components/ui/checkbox'
import { ScrollArea } from '@/components/ui/scroll-area'

interface MultiSelectOption {
  value: string
  label: string
}

interface MultiSelectDropdownProps {
  options: MultiSelectOption[]
  selected: string[]
  onChange: (selected: string[]) => void
  placeholder?: string
  searchPlaceholder?: string
  loading?: boolean
  disabled?: boolean
  allowNA?: boolean
  maxDisplayBadges?: number
  className?: string
}

function MultiSelectDropdown({
  options,
  selected,
  onChange,
  placeholder = 'Select...',
  searchPlaceholder = 'Search...',
  loading = false,
  disabled = false,
  allowNA = false,
  maxDisplayBadges = 2,
  className,
}: MultiSelectDropdownProps) {
  const [open, setOpen] = React.useState(false)
  const [search, setSearch] = React.useState('')

  const isNA = selected.includes('NA')

  const filteredOptions = React.useMemo(() => {
    if (!search) return options
    const lower = search.toLowerCase()
    return options.filter(o => o.label.toLowerCase().includes(lower))
  }, [options, search])

  const toggleValue = (value: string) => {
    if (value === 'NA') {
      // NA is mutually exclusive with other values
      if (isNA) {
        onChange([])
      } else {
        onChange(['NA'])
      }
      return
    }

    // If currently NA, switch to this value
    if (isNA) {
      onChange([value])
      return
    }

    if (selected.includes(value)) {
      onChange(selected.filter(v => v !== value))
    } else {
      onChange([...selected, value])
    }
  }

  const selectAll = () => {
    onChange(options.map(o => o.value))
  }

  const clearAll = () => {
    onChange([])
  }

  const getDisplayLabels = (): string[] => {
    if (isNA) return ['NA']
    return selected.map(v => {
      const opt = options.find(o => o.value === v)
      return opt?.label || v
    })
  }

  const displayLabels = getDisplayLabels()
  const visibleLabels = displayLabels.slice(0, maxDisplayBadges)
  const extraCount = displayLabels.length - maxDisplayBadges

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild disabled={disabled || loading}>
        <button
          type="button"
          role="combobox"
          aria-expanded={open}
          className={cn(
            'flex min-h-9 w-full items-center justify-between rounded-md border border-input bg-transparent px-3 py-1.5 text-sm shadow-xs transition-colors',
            'hover:bg-accent/50 focus:outline-none focus:ring-1 focus:ring-ring',
            'disabled:cursor-not-allowed disabled:opacity-50',
            className,
          )}
        >
          <div className="flex flex-wrap gap-1 flex-1 min-w-0">
            {loading ? (
              <span className="text-muted-foreground text-sm">Loading...</span>
            ) : selected.length === 0 ? (
              <span className="text-muted-foreground text-sm truncate">{placeholder}</span>
            ) : (
              <>
                {visibleLabels.map((label) => (
                  <Badge
                    key={label}
                    variant="secondary"
                    className="text-xs px-1.5 py-0 max-w-[120px] truncate"
                  >
                    {label}
                  </Badge>
                ))}
                {extraCount > 0 && (
                  <Badge variant="outline" className="text-xs px-1.5 py-0">
                    +{extraCount} more
                  </Badge>
                )}
              </>
            )}
          </div>
          <div className="flex items-center gap-1 ml-1 shrink-0">
            {selected.length > 0 && (
              <X
                className="h-3.5 w-3.5 text-muted-foreground hover:text-foreground cursor-pointer"
                onClick={(e) => {
                  e.stopPropagation()
                  clearAll()
                }}
              />
            )}
            <ChevronsUpDown className="h-3.5 w-3.5 text-muted-foreground" />
          </div>
        </button>
      </PopoverTrigger>
      <PopoverContent
        className="p-0 w-[--radix-popover-trigger-width] max-w-[calc(100vw-2rem)]"
        align="start"
      >
        {/* Search */}
        <div className="flex items-center border-b px-3 py-2">
          <Search className="h-4 w-4 text-muted-foreground mr-2 shrink-0" />
          <input
            type="text"
            placeholder={searchPlaceholder}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
          />
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2 px-3 py-1.5 border-b bg-muted/30">
          <button
            type="button"
            onClick={selectAll}
            className="text-xs text-[#005180] hover:underline font-medium"
          >
            Select All
          </button>
          <span className="text-muted-foreground text-xs">|</span>
          <button
            type="button"
            onClick={clearAll}
            className="text-xs text-muted-foreground hover:underline"
          >
            Clear
          </button>
          <span className="ml-auto text-xs text-muted-foreground">
            {selected.filter(v => v !== 'NA').length} selected
          </span>
        </div>

        {/* Options */}
        <ScrollArea className="max-h-[200px]">
          <div className="p-1">
            {allowNA && (
              <button
                type="button"
                onClick={() => toggleValue('NA')}
                className={cn(
                  'flex items-center gap-2 w-full rounded-sm px-2 py-1.5 text-sm hover:bg-accent cursor-pointer',
                  isNA && 'bg-accent'
                )}
              >
                <Checkbox checked={isNA} className="pointer-events-none" />
                <span className="text-muted-foreground font-medium">NA (Not Applicable)</span>
              </button>
            )}
            {filteredOptions.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4">No results found</p>
            ) : (
              filteredOptions.map((option) => {
                const isSelected = selected.includes(option.value)
                return (
                  <button
                    type="button"
                    key={option.value}
                    onClick={() => toggleValue(option.value)}
                    className={cn(
                      'flex items-center gap-2 w-full rounded-sm px-2 py-1.5 text-sm hover:bg-accent cursor-pointer',
                      isSelected && 'bg-accent/60'
                    )}
                  >
                    <Checkbox checked={isSelected} className="pointer-events-none" />
                    <span className="truncate">{option.label}</span>
                  </button>
                )
              })
            )}
          </div>
        </ScrollArea>
      </PopoverContent>
    </Popover>
  )
}

export { MultiSelectDropdown }
export type { MultiSelectOption, MultiSelectDropdownProps }
