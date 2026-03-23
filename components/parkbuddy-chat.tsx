"use client"

/**
 * ParkBuddy AI Assistant - Enhanced Chat UI
 * Modern card-based UI for costing and quotation interactions
 * Merged with Synthia features: DetailedCostSummary, KPIs, ConfirmationSummary,
 * TargetPriceComparison card, ReactMarkdown, enhanced edit message
 */

import { useState, useRef, useEffect, useCallback, memo } from "react"
import type React from "react"
import { Send, Loader2, Mic, Calculator, Target, ClipboardCheck, MessageSquare, Copy, Check, Pencil, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { sendMessage, deleteMessagesAfter } from "@/lib/chat-api"
import { useToast } from "@/hooks/use-toast"
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'

// ─── Types ───────────────────────────────────────────────────────────────────

interface Message {
  id: string
  serverMessageId?: number
  content: string
  sender: "user" | "ai"
  timestamp: Date
  isLoading?: boolean
  options?: string[]
  allowMultiSelect?: boolean
  bookingId?: number | string
}

interface DetailedCostParticular {
  Rs_Per_1000_Cartons?: number
}

interface CostingCardData {
  Type: string
  ContentName?: string
  CustomerDetails?: {
    CustomerName?: string
    JobName?: string
    ContentType?: string
    SheetSize?: string
    OrderQuantity?: number
    Ups?: string
    RequiredSheets?: number
  }
  CostStructurePer1000?: {
    BoardCost?: number
    OtherMaterialCost?: number
    ConversionCost?: number
    Profit?: number
    FreightCost?: number
    TotalCostPer1000?: number
  }
  PercentageBreakup?: {
    BoardCost?: number
    OtherMaterialCost?: number
    ConversionCost?: number
    Profit?: number
    FreightCost?: number
  }
  ProfitMarginPercent?: number
  AnnualQuantity?: number
  DetailedCostSummary?: {
    KgsPer1000Cartons?: number
    Particulars?: {
      BoardCost?: DetailedCostParticular
      MaterialCost?: DetailedCostParticular
      ToolCost?: DetailedCostParticular
      CorrugationCost?: DetailedCostParticular
      WastageCost?: DetailedCostParticular
      ConversionCost?: DetailedCostParticular
      ExWorksCost?: DetailedCostParticular
      Profit?: DetailedCostParticular & { Percent?: number }
      Freight?: DetailedCostParticular
      SellingPrice_FOB?: DetailedCostParticular
    }
  }
  KPIs?: {
    RMCPercent?: number | null
    PSR?: number | null
    PKR?: number | null
  }
  TargetPriceComparison?: {
    OriginalCostPer1000?: number
    TargetPricePer1000?: number
    OriginalProfitPercent?: number
    NewProfitPercent?: number
    DifferencePer1000?: number
  }
  NextStep?: string
  afterJson?: string
}

interface TargetPriceComparisonData {
  Type: string
  CustomerDetails?: {
    CustomerName?: string
    JobName?: string
    SheetSize?: string
    OrderQuantity?: number
    Ups?: string
    RequiredSheets?: number
  }
  OriginalCostPer1000?: number
  TargetPricePer1000?: number
  OriginalProfitPercent?: number
  NewProfitPercent?: number
  DifferencePer1000?: number
  CostBreakdownPer1000?: {
    BoardCost?: number
    OtherMaterialCost?: number
    ConversionCost?: number
    Profit?: number
    FreightCost?: number
  }
  afterJson?: string
}

interface ConfirmationSection {
  title: string
  rows: { label: string; value: string; auto: boolean }[]
}

interface ConfirmationSummaryData {
  cardTitle: string
  sections: ConfirmationSection[]
  footerLines: string[]
}

interface SelectableItem {
  num: number
  name: string
  id: string
}

interface ParsedSelectableData {
  items: SelectableItem[]
  beforeText: string
  afterText: string
}

// ─── Parsers ─────────────────────────────────────────────────────────────────

function cleanApiText(text: string): string {
  return text
    .replace(/\\r\\n/g, '\n')
    .replace(/\\r/g, '')
    .replace(/\\n/g, '\n')
    .replace(/\r/g, '')
    .replace(/\\"/g, '"')
}

function extractJsonByType(text: string, typeValue: string): { data: any; afterJson: string } | null {
  const cleanText = cleanApiText(text)
  const typeIndex = cleanText.indexOf(`"${typeValue}"`)
  if (typeIndex === -1) return null

  const braceStart = cleanText.lastIndexOf('{', typeIndex)
  if (braceStart === -1) return null

  let depth = 0
  let braceEnd = -1
  for (let i = braceStart; i < cleanText.length; i++) {
    if (cleanText[i] === '{') depth++
    else if (cleanText[i] === '}') {
      depth--
      if (depth === 0) { braceEnd = i; break }
    }
  }
  if (braceEnd === -1) return null

  const jsonStr = cleanText.substring(braceStart, braceEnd + 1)
  const afterJson = cleanText.substring(braceEnd + 1).trim()

  try {
    const data = JSON.parse(jsonStr)
    if (data.Type !== typeValue) return null
    return { data, afterJson }
  } catch {
    return null
  }
}

function cleanAfterJson(text: string): string {
  if (!text) return ''
  if (/COSTING SUMMARY|Cost Structure|Customer Details|Percentage Breakup|TARGET PRICE ANALYSIS|Detailed Cost|Particulars|Selling Price|Ex-Works/i.test(text)) {
    return ''
  }
  return text.trim()
}

function parseCostingSummary(text: string): CostingCardData | null {
  const result = extractJsonByType(text, 'CostingBot')
  if (!result) return null
  return { ...result.data, afterJson: cleanAfterJson(result.afterJson) }
}

function parseTargetPriceComparison(text: string): TargetPriceComparisonData | null {
  const result = extractJsonByType(text, 'TargetPriceComparison')
  if (!result) return null
  return { ...result.data, afterJson: cleanAfterJson(result.afterJson) }
}

function parseConfirmationSummary(text: string): ConfirmationSummaryData | null {
  const cleanText = cleanApiText(text)

  // Must have bullet items with key: value pairs
  if (!/[*\u2022]\s+.+:.+/.test(cleanText)) return null

  const hasBoldHeaders = /\*\*[^*]+\*\*/.test(cleanText)

  // For non-bold format, verify plain section headers exist (text line followed by bullet line)
  if (!hasBoldHeaders) {
    const rawLines = cleanText.split('\n')
    let foundSectionPattern = false
    for (let i = 0; i < rawLines.length - 1; i++) {
      const line = rawLines[i].trim()
      if (!line || /^[*\u2022\-]\s/.test(line) || /^\d+\.\s/.test(line)) continue
      for (let j = i + 1; j < rawLines.length; j++) {
        const next = rawLines[j].trim()
        if (!next) continue
        if (/^[*\u2022\-]\s/.test(next)) foundSectionPattern = true
        break
      }
      if (foundSectionPattern) break
    }
    if (!foundSectionPattern) return null
  }

  const lines = cleanText.split('\n')
  const sections: ConfirmationSection[] = []
  let currentSection: ConfirmationSection | null = null
  const footerLines: string[] = []
  let reachedSections = false
  let reachedFooter = false

  for (let i = 0; i < lines.length; i++) {
    const trimmed = lines[i].trim()
    if (!trimmed) continue

    // Stop at numbered items (action buttons like "1. Confirm & Generate Costing")
    if (/^\d+\.\s+/.test(trimmed) && reachedSections) break

    if (/^-{5,}$/.test(trimmed)) {
      reachedFooter = true
      continue
    }

    if (reachedFooter) {
      if (/^\d+\.\s+/.test(trimmed)) break
      footerLines.push(trimmed)
      continue
    }

    // Bold section header: **Title**
    const sectionMatch = trimmed.match(/^\*\*([^*]+)\*\*$/)
    if (sectionMatch) {
      reachedSections = true
      currentSection = { title: sectionMatch[1].trim(), rows: [] }
      sections.push(currentSection)
      continue
    }

    // Bullet item
    const bulletMatch = trimmed.match(/^[*\u2022\-]\s+(.+)$/)
    if (bulletMatch && currentSection) {
      const colonIdx = bulletMatch[1].indexOf(':')
      if (colonIdx > 0) {
        const label = bulletMatch[1].substring(0, colonIdx).trim()
        const value = bulletMatch[1].substring(colonIdx + 1).trim()
        const isAuto = /\(auto\)/i.test(value)
        currentSection.rows.push({ label, value: value.replace(/\s*\(auto\)/i, ''), auto: isAuto })
      } else {
        currentSection.rows.push({ label: bulletMatch[1], value: '', auto: false })
      }
      continue
    }

    // Plain text section header: not a bullet, not a number — next non-empty line is a bullet
    if (!/^[*\u2022\-]\s/.test(trimmed) && !/^\d+\.\s/.test(trimmed)) {
      let nextNonEmpty = ''
      for (let j = i + 1; j < lines.length; j++) {
        if (lines[j].trim()) { nextNonEmpty = lines[j].trim(); break }
      }
      if (/^[*\u2022\-]\s/.test(nextNonEmpty)) {
        reachedSections = true
        currentSection = { title: trimmed, rows: [] }
        sections.push(currentSection)
        continue
      }
    }

    if (!reachedSections) {
      // intro lines before sections - skip
    }
  }

  const sectionsWithRows = sections.filter(s => s.rows.length > 0)
  if (sectionsWithRows.length < 2) return null

  let cardTitle = 'Job Specification Summary'
  if (sections.length > 0 && sections[0].rows.length === 0) {
    cardTitle = sections[0].title
    sections.shift()
  }

  return { cardTitle, sections: sections.filter(s => s.rows.length > 0), footerLines }
}

function parseSelectableLists(text: string): ParsedSelectableData | null {
  const cleanText = text
    .replace(/\\r\\n/g, '\n')
    .replace(/\\r/g, '')
    .replace(/\\n/g, '\n')
    .replace(/\r/g, '')

  const idItemPattern = /^(\d+)\.\s*(.+?)\s*\((ClientID|CategoryID):\s*(\d+)\)\s*$/
  const plainItemPattern = /^(\d+)\.\s+(.+)$/

  const lines = cleanText.split('\n')
  const items: SelectableItem[] = []
  const beforeLines: string[] = []
  const afterLines: string[] = []
  let listStarted = false
  let listEnded = false
  let hasIdItems = false

  for (const line of lines) {
    const trimmed = line.trim()
    const idMatch = trimmed.match(idItemPattern)
    const plainMatch = !idMatch ? trimmed.match(plainItemPattern) : null

    if (!listEnded && (idMatch || plainMatch)) {
      listStarted = true
      if (idMatch) {
        hasIdItems = true
        const name = idMatch[2].trim().replace(/\*\*/g, '')
        items.push({ num: parseInt(idMatch[1]), name, id: idMatch[4] })
      } else if (plainMatch) {
        const name = plainMatch[2].trim().replace(/\*\*/g, '')
        items.push({ num: parseInt(plainMatch[1]), name, id: name })
      }
    } else if (!listStarted) {
      if (trimmed) beforeLines.push(trimmed)
    } else {
      listEnded = true
      if (trimmed) afterLines.push(trimmed)
    }
  }

  if (items.length < 2) return null

  const bt = beforeLines.join('\n')
  const at = afterLines.join('\n')
  const allText = bt + '\n' + at
  const lastChar = bt.trim().slice(-1)
  if (!hasIdItems) {
    if (lastChar !== '?' && lastChar !== ':') return null
    if (/reply with values|type them|enter the|provide the|fill in/i.test(allText)) return null

    const inputFieldPatterns = /\(mm\)|\(cm\)|\(inch\)|\(gsm\)|\(kg\)|\(grams?\)|\(Yes\/No\)|\(Rs\)|\(INR\)|quantity|length|width|height|depth|weight|thickness|diameter/i
    const fieldMatchCount = items.filter(i => inputFieldPatterns.test(i.name)).length
    if (fieldMatchCount >= 2) return null

    if (/need these details|provide .* details|enter .* details|following details|fill .* following|required details|input .* values/i.test(bt)) return null
  }

  return {
    items,
    beforeText: bt,
    afterText: afterLines.join('\n')
  }
}

// ─── Content Image Helper ────────────────────────────────────────────────────

function normalizeContentName(name: string): string {
  if (name.includes(' ')) return name
  return name.replace(/([a-z])([A-Z])/g, '$1 $2').replace(/([A-Z]+)([A-Z][a-z])/g, '$1 $2')
}

function ContentImage({ name, className = "w-12 h-12" }: { name: string; className?: string }) {
  const normalizedName = normalizeContentName(name)
  const encodedName = encodeURIComponent(normalizedName)
  return (
    <div className={cn("rounded-lg overflow-hidden border border-gray-200 bg-gray-50 flex-shrink-0", className)}>
      <img
        src={`/contentsImagesChatBot/${encodedName}.jpg`}
        alt={normalizedName}
        className="w-full h-full object-cover"
        onError={(e) => {
          const cur = e.currentTarget.src
          if (cur.includes('.jpg') && !cur.includes('_tried_png')) {
            e.currentTarget.src = `/contentsImagesChatBot/${encodedName}.png?_tried_png=1`
          } else if (!cur.includes('default')) {
            e.currentTarget.src = '/contentsImagesChatBot/default.jpg'
          }
        }}
      />
    </div>
  )
}

function extractContentName(text: string): string | null {
  const patterns = [
    /(?:content\s*type|content|job\s*type|product|carton\s*type|box\s*type)\s*[:\-]\s*(.+?)(?:\n|$)/i,
    /!\[([^\]]*)\]\([^)]*contentsImagesChatBot[^)]*\)/i,
    /!\[([^\]]*)\]\([^)]*Contents[^)]*\)/i,
  ]
  for (const pattern of patterns) {
    const match = text.match(pattern)
    if (match && match[1]?.trim()) return match[1].trim()
  }
  return null
}

// Parse action buttons from the end of messages
interface ActionButton {
  num: number
  label: string
}

function parseActionButtons(text: string): { bodyText: string; buttons: ActionButton[] } | null {
  const lines = text.split('\n')
  const buttons: ActionButton[] = []
  const bodyLines: string[] = []
  let foundButtons = false

  for (let i = lines.length - 1; i >= 0; i--) {
    const trimmed = lines[i].trim()
    const match = trimmed.match(/^(\d+)\.\s+(.+)$/)
    if (match && !foundButtons) {
      buttons.unshift({ num: parseInt(match[1]), label: match[2] })
    } else if (buttons.length > 0) {
      foundButtons = true
      bodyLines.unshift(lines[i])
    } else {
      bodyLines.unshift(lines[i])
    }
  }

  if (buttons.length >= 2 && buttons.length <= 4 && buttons.every(b => b.label.length < 60)) {
    const inputFieldPatterns = /\(mm\)|\(cm\)|\(inch\)|\(gsm\)|\(kg\)|\(grams?\)|\(Yes\/No\)|\(Rs\)|\(INR\)|quantity|length|width|height|depth|weight|thickness|diameter/i
    const fieldMatchCount = buttons.filter(b => inputFieldPatterns.test(b.label)).length
    if (fieldMatchCount >= 2) return null

    // If body text ends with ":" it's a selection prompt (e.g. "Select mill for X:"),
    // not action buttons — let parseSelectableLists handle it instead
    const bodyTrimmed = bodyLines.join('\n').trimEnd()
    if (bodyTrimmed.trim().endsWith(':')) return null

    return { bodyText: bodyTrimmed, buttons }
  }
  return null
}

// ─── UI Components ───────────────────────────────────────────────────────────

function formatCurrency(value?: number): string {
  if (typeof value !== 'number') return '-'
  return `₹ ${value.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
}

function CostRow({ label, value, percentage, isProfit, profitColor }: {
  label: string
  value: string
  percentage?: number | null
  isProfit?: boolean
  profitColor?: string
}) {
  const isLoss = isProfit && value.replace(/[^0-9.-]/g, '').startsWith('-')
  const profitColorClass = isProfit
    ? (isLoss ? 'text-red-600' : 'text-green-600')
    : ''

  return (
    <div className="flex items-baseline py-2.5 border-b border-gray-200 last:border-b-0">
      <span className={cn('flex-1 text-sm', isProfit ? profitColorClass : 'text-gray-600')}>
        {label}
      </span>
      <span className={cn(
        'w-[6rem] text-sm text-right font-semibold tabular-nums',
        profitColor || (isProfit ? profitColorClass : 'text-gray-900')
      )}>
        {value}
      </span>
      {percentage != null && (
        <span className={cn('w-[3.25rem] text-xs text-right tabular-nums ml-3 opacity-60', isProfit ? profitColorClass : 'text-gray-500')}>
          {percentage}%
        </span>
      )}
    </div>
  )
}

// ─── Detailed Cost Summary Section (from Synthia) ────────────────────────────

function DetailedCostSummarySection({ data }: {
  data: NonNullable<CostingCardData['DetailedCostSummary']>
}) {
  const p = data.Particulars
  if (!p) return null

  const fobPrice = p.SellingPrice_FOB?.Rs_Per_1000_Cartons || 0
  const calcPercent = (amount?: number) => {
    if (!amount || fobPrice <= 0) return '0.00'
    return ((amount / fobPrice) * 100).toFixed(2)
  }

  const rows: { label: string; note?: string; amount?: number; percent: string; highlight?: 'green' | 'red' | 'primary' }[] = []

  if (p.BoardCost?.Rs_Per_1000_Cartons != null)
    rows.push({ label: 'Board Cost', amount: p.BoardCost.Rs_Per_1000_Cartons, percent: calcPercent(p.BoardCost.Rs_Per_1000_Cartons) })
  if (p.MaterialCost?.Rs_Per_1000_Cartons != null)
    rows.push({ label: 'Material Cost', amount: p.MaterialCost.Rs_Per_1000_Cartons, percent: calcPercent(p.MaterialCost.Rs_Per_1000_Cartons) })
  if (p.ToolCost?.Rs_Per_1000_Cartons != null)
    rows.push({ label: 'Tool Cost', note: 'Tool + Plate', amount: p.ToolCost.Rs_Per_1000_Cartons, percent: calcPercent(p.ToolCost.Rs_Per_1000_Cartons) })
  if (p.CorrugationCost?.Rs_Per_1000_Cartons != null)
    rows.push({ label: 'Corrugation Cost', amount: p.CorrugationCost.Rs_Per_1000_Cartons, percent: calcPercent(p.CorrugationCost.Rs_Per_1000_Cartons) })
  if (p.WastageCost?.Rs_Per_1000_Cartons != null)
    rows.push({ label: 'Wastage Cost', note: 'Paper + Material + Corrugation', amount: p.WastageCost.Rs_Per_1000_Cartons, percent: calcPercent(p.WastageCost.Rs_Per_1000_Cartons) })
  if (p.ConversionCost?.Rs_Per_1000_Cartons != null)
    rows.push({ label: 'Conversion Cost', note: 'Machine + Credit + Labour + Overheads', amount: p.ConversionCost.Rs_Per_1000_Cartons, percent: calcPercent(p.ConversionCost.Rs_Per_1000_Cartons) })
  if (p.ExWorksCost?.Rs_Per_1000_Cartons != null)
    rows.push({ label: 'Ex-works Cost', amount: p.ExWorksCost.Rs_Per_1000_Cartons, percent: calcPercent(p.ExWorksCost.Rs_Per_1000_Cartons), highlight: 'primary' })
  if (p.Profit?.Rs_Per_1000_Cartons != null) {
    const profitPct = p.Profit.Percent || 0
    rows.push({ label: `Add: Profit (${profitPct}%)`, amount: p.Profit.Rs_Per_1000_Cartons, percent: calcPercent(p.Profit.Rs_Per_1000_Cartons), highlight: profitPct >= 0 ? 'green' : 'red' })
  }
  if (p.Freight?.Rs_Per_1000_Cartons != null)
    rows.push({ label: 'Add: Freight', amount: p.Freight.Rs_Per_1000_Cartons, percent: calcPercent(p.Freight.Rs_Per_1000_Cartons) })
  if (p.SellingPrice_FOB?.Rs_Per_1000_Cartons != null)
    rows.push({ label: 'FOB / Selling Price', amount: p.SellingPrice_FOB.Rs_Per_1000_Cartons, percent: '100.00', highlight: 'primary' })

  if (rows.length === 0) return null

  const highlightBg: Record<string, string> = {
    green: 'bg-green-500/10',
    red: 'bg-red-500/10',
    primary: 'bg-[#005180]/10',
  }
  const highlightText: Record<string, string> = {
    green: 'text-green-600',
    red: 'text-red-600',
    primary: 'text-[#005180]',
  }

  return (
    <>
      <div className="h-px bg-gradient-to-r from-transparent via-gray-300 to-transparent my-3 md:my-4" />
      <div className="text-[0.65rem] md:text-[0.7rem] font-semibold text-gray-600 uppercase tracking-widest mb-2 md:mb-3 pl-2 md:pl-2.5 border-l-2 border-[#005180]">
        Cost Breakdown
      </div>
      <div className="rounded-lg border border-gray-200 overflow-hidden">
        {/* Table header */}
        <div className="grid grid-cols-[1fr_auto_auto] px-2 md:px-3 py-1.5 md:py-2.5 bg-gray-50 border-b border-gray-200 text-[0.6rem] md:text-xs font-bold text-gray-700 uppercase tracking-wide">
          <span className="truncate">Particulars</span>
          <span className="text-right whitespace-nowrap pl-2">Amount</span>
          <span className="text-right whitespace-nowrap pl-2">%</span>
        </div>
        {/* Table rows */}
        {rows.map((row, idx) => (
          <div
            key={idx}
            className={cn(
              'group grid grid-cols-[1fr_auto_auto] items-baseline px-2 md:px-3 py-1.5 md:py-2 border-b border-gray-200/30 last:border-b-0',
              row.highlight ? highlightBg[row.highlight] : ''
            )}
          >
            <span className={cn('truncate text-[0.7rem] md:text-[0.8rem]', row.highlight ? cn('font-semibold', highlightText[row.highlight]) : 'text-gray-600')}>
              {row.label}
              {row.note && <span className="text-[0.6rem] text-gray-400 ml-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200">({row.note})</span>}
            </span>
            <span className={cn('text-right whitespace-nowrap pl-2 text-[0.7rem] md:text-[0.8rem] font-semibold tabular-nums', row.highlight ? highlightText[row.highlight] : 'text-gray-900')}>
              {formatCurrency(row.amount)}
            </span>
            <span className={cn('text-right whitespace-nowrap pl-2 text-[0.6rem] md:text-[0.7rem] tabular-nums', row.highlight ? cn('font-medium', highlightText[row.highlight]) : 'text-gray-500')}>
              {row.percent}%
            </span>
          </div>
        ))}
      </div>
    </>
  )
}

// ─── Costing Card ────────────────────────────────────────────────────────────

const CostingCard = memo(function CostingCard({ data, timestamp }: { data: CostingCardData; timestamp?: Date }) {
  const customer = data.CustomerDetails || {}
  const costs = data.CostStructurePer1000 || {}
  const pct = data.PercentageBreakup || {}
  const profitMarginPct = data.ProfitMarginPercent

  const contentName = data.ContentName || customer.ContentType || null

  const formattedTimestamp = (timestamp || new Date()).toLocaleString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: true
  })

  const profitLabel = profitMarginPct != null ? `Profit (Margin: ${profitMarginPct}%)` : 'Profit Margin'

  // Determine if we should show the detailed breakdown or the simple one
  const hasDetailedBreakdown = data.DetailedCostSummary?.Particulars != null

  return (
    <div className="bg-white rounded-xl md:rounded-2xl overflow-hidden border border-gray-200 shadow-lg max-w-full">
      <div className="bg-gradient-to-r from-[#005180]/20 to-[#78BE20]/10 px-4 md:px-5 py-3 md:py-4 border-b border-gray-200">
        <div className="flex items-center gap-3">
          {contentName && (
            <ContentImage name={contentName} className="w-12 h-12 md:w-16 md:h-16" />
          )}
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between mb-1 gap-2">
              <h3 className="text-sm md:text-base font-semibold text-gray-900 flex items-center gap-2">
                <Calculator className="w-4 h-4 md:w-4 md:h-4 text-[#005180] flex-shrink-0" />
                <span className="truncate">Costing Summary</span>
              </h3>
              <div className="px-2 md:px-2.5 py-0.5 md:py-1 bg-green-500/20 border border-green-500/30 rounded text-[0.65rem] md:text-xs font-semibold text-green-700 uppercase tracking-wide flex-shrink-0">
                Best Plan
              </div>
            </div>
            <div className="text-xs md:text-xs text-gray-600 truncate">Job Name: {customer.JobName || 'Print Job Estimation'}</div>
          </div>
        </div>
      </div>

      <div className="px-4 md:px-5 py-3 md:py-4">
        {/* Customer Details - with Annual Qty and Kg per 1000 */}
        <div className="grid grid-cols-2 gap-2 md:gap-3 mb-3 md:mb-4">
          <div className="bg-gray-50 border border-gray-200 rounded-lg px-2.5 md:px-3 py-2 md:py-2.5">
            <div className="text-[0.6rem] md:text-[0.65rem] font-medium text-gray-500 uppercase tracking-wide mb-0.5 md:mb-1">Customer</div>
            <div className="text-xs md:text-sm font-semibold text-gray-900 truncate">{customer.CustomerName || '-'}</div>
          </div>
          <div className="bg-gray-50 border border-gray-200 rounded-lg px-2.5 md:px-3 py-2 md:py-2.5">
            <div className="text-[0.6rem] md:text-[0.65rem] font-medium text-gray-500 uppercase tracking-wide mb-0.5 md:mb-1">
              Order Qty{data.AnnualQuantity != null && data.AnnualQuantity > 0 ? ' / Annual Qty' : ''}
            </div>
            <div className="text-xs md:text-sm font-semibold text-gray-900">
              {customer.OrderQuantity?.toLocaleString('en-IN') || '-'}
              {data.AnnualQuantity != null && data.AnnualQuantity > 0 && (
                <span className="text-gray-500"> / {data.AnnualQuantity.toLocaleString('en-IN')}</span>
              )}
            </div>
          </div>
          <div className="bg-gray-50 border border-gray-200 rounded-lg px-2.5 md:px-3 py-2 md:py-2.5">
            <div className="text-[0.6rem] md:text-[0.65rem] font-medium text-gray-500 uppercase tracking-wide mb-0.5 md:mb-1">
              Sheet Size{data.DetailedCostSummary?.KgsPer1000Cartons != null ? ' / Wt. per 1000' : ''}
            </div>
            <div className="text-xs md:text-sm font-semibold text-[#005180] truncate">
              {customer.SheetSize || '-'}
              {data.DetailedCostSummary?.KgsPer1000Cartons != null && (
                <span className="text-gray-500"> / {data.DetailedCostSummary.KgsPer1000Cartons.toLocaleString('en-IN')} kg</span>
              )}
            </div>
          </div>
          <div className="bg-gray-50 border border-gray-200 rounded-lg px-2.5 md:px-3 py-2 md:py-2.5">
            <div className="text-[0.6rem] md:text-[0.65rem] font-medium text-gray-500 uppercase tracking-wide mb-0.5 md:mb-1">Ups / Sheets</div>
            <div className="text-xs md:text-sm font-semibold text-gray-900 truncate">
              {customer.Ups || '-'}
              <span className="text-gray-500"> / {customer.RequiredSheets?.toLocaleString('en-IN') || '-'}</span>
            </div>
          </div>
        </div>

        {/* KPI Cards - RMC%, PSR, PKR */}
        {data.KPIs && (data.KPIs.RMCPercent != null || data.KPIs.PSR != null || data.KPIs.PKR != null) && (
          <>
            <div className="h-px bg-gradient-to-r from-transparent via-gray-300 to-transparent my-3 md:my-4" />
            <div className="text-[0.65rem] md:text-[0.7rem] font-semibold text-gray-600 uppercase tracking-widest mb-2 md:mb-3 pl-2 md:pl-2.5 border-l-2 border-[#005180]">
              Key Performance Indicators
            </div>
            <div className="grid grid-cols-3 gap-2 md:gap-2.5 mb-3 md:mb-4">
              {data.KPIs.RMCPercent != null && (
                <div className="bg-gray-50 border border-gray-200 rounded-lg px-2 md:px-3 py-2 md:py-2.5 text-center">
                  <div className="text-[0.55rem] md:text-[0.6rem] font-medium text-gray-500 uppercase tracking-wide mb-0.5 md:mb-1">RMC%</div>
                  <div className="text-base md:text-lg font-semibold text-gray-900 tabular-nums">{data.KPIs.RMCPercent.toFixed(1)}%</div>
                  <div className="text-[0.55rem] md:text-[0.6rem] text-gray-500 mt-0.5">
                    {data.KPIs.RMCPercent >= 60 ? 'High' : data.KPIs.RMCPercent >= 40 ? 'Moderate' : 'Healthy'}
                  </div>
                </div>
              )}
              {data.KPIs.PSR != null && (
                <div className="bg-gray-50 border border-gray-200 rounded-lg px-2 md:px-3 py-2 md:py-2.5 text-center">
                  <div className="text-[0.55rem] md:text-[0.6rem] font-medium text-gray-500 uppercase tracking-wide mb-0.5 md:mb-1">PSR</div>
                  <div className="text-base md:text-lg font-semibold text-gray-900 tabular-nums">{formatCurrency(data.KPIs.PSR)}</div>
                  <div className="text-[0.55rem] md:text-[0.6rem] text-gray-500 mt-0.5">Per Sheet</div>
                </div>
              )}
              {data.KPIs.PKR != null && (
                <div className="bg-gray-50 border border-gray-200 rounded-lg px-2 md:px-3 py-2 md:py-2.5 text-center">
                  <div className="text-[0.55rem] md:text-[0.6rem] font-medium text-gray-500 uppercase tracking-wide mb-0.5 md:mb-1">PKR</div>
                  <div className="text-base md:text-lg font-semibold text-gray-900 tabular-nums">{formatCurrency(data.KPIs.PKR)}</div>
                  <div className="text-[0.55rem] md:text-[0.6rem] text-gray-500 mt-0.5">Per Kg</div>
                </div>
              )}
            </div>
          </>
        )}

        {/* Detailed Cost Breakdown Table (if available from API) */}
        {hasDetailedBreakdown && (
          <DetailedCostSummarySection data={data.DetailedCostSummary!} />
        )}

        {/* Simple Cost Breakdown (fallback when no detailed breakdown) */}
        {!hasDetailedBreakdown && (
          <>
            <div className="h-px bg-gradient-to-r from-transparent via-gray-300 to-transparent my-3 md:my-4" />
            <div className="text-[0.65rem] md:text-[0.7rem] font-semibold text-gray-600 uppercase tracking-widest mb-2 md:mb-3 pl-2 md:pl-2.5 border-l-2 border-[#005180]">
              Cost Breakdown (Per 1,000 Units)
            </div>
            <div>
              <CostRow label="Board Cost" value={formatCurrency(costs.BoardCost)} percentage={pct.BoardCost} />
              <CostRow label="Other Material Cost" value={formatCurrency(costs.OtherMaterialCost)} percentage={pct.OtherMaterialCost} />
              <CostRow label="Conversion Cost" value={formatCurrency(costs.ConversionCost)} percentage={pct.ConversionCost} />
              <CostRow label={profitLabel} value={formatCurrency(costs.Profit)} percentage={pct.Profit} isProfit />
              <CostRow label="Freight Cost" value={formatCurrency(costs.FreightCost)} percentage={pct.FreightCost} />
            </div>
          </>
        )}
      </div>

      {/* Total Bar - only show for simple breakdown (DetailedCostSummary has FOB row as total) */}
      {!hasDetailedBreakdown && (
        <div className="bg-gradient-to-r from-green-900/50 to-green-950/50 px-4 md:px-5 py-3 md:py-4 flex items-center justify-between border-t border-green-500/30 gap-2">
          <div className="text-[0.7rem] md:text-[0.8rem] font-semibold text-green-300 uppercase tracking-wide">Total Cost / 1,000</div>
          <div className="text-xl md:text-2xl font-bold text-green-400 tabular-nums">{formatCurrency(costs.TotalCostPer1000)}</div>
        </div>
      )}

      {/* Target Price Comparison — inline section (when nested inside CostingBot JSON) */}
      {data.TargetPriceComparison && (() => {
        const tp = data.TargetPriceComparison
        const diff = tp.DifferencePer1000 || 0
        const originalCost = tp.OriginalCostPer1000 || 0
        const diffPct = originalCost > 0 ? ((diff / originalCost) * 100).toFixed(2) : '0'
        const isPos = diff >= 0
        const newProfit = tp.NewProfitPercent || 0
        const isProfitPos = newProfit >= 0
        return (
          <div className="border-t border-gray-200">
            <div className="px-4 md:px-5 py-2.5 md:py-3 bg-gray-50 border-b border-gray-200">
              <h4 className="text-xs md:text-sm font-semibold text-gray-900 flex items-center gap-2">
                <Target className="w-3 h-3 md:w-3.5 md:h-3.5 text-amber-500 flex-shrink-0" />
                <span>Target Price Analysis</span>
              </h4>
            </div>
            <div className="px-4 md:px-5 py-3 md:py-4">
              <div className="grid grid-cols-3 gap-2 md:gap-2.5 mb-2.5 md:mb-3">
                <div className="bg-gray-50 border border-gray-200 rounded-lg px-2 md:px-3 py-2 md:py-2.5 text-center">
                  <div className="text-[0.55rem] md:text-[0.6rem] font-medium text-gray-500 uppercase tracking-wide mb-0.5 md:mb-1">Original</div>
                  <div className="text-xs md:text-sm font-semibold text-gray-900 tabular-nums">{formatCurrency(tp.OriginalCostPer1000)}</div>
                </div>
                <div className="bg-gray-50 border border-amber-500/30 rounded-lg px-2 md:px-3 py-2 md:py-2.5 text-center">
                  <div className="text-[0.55rem] md:text-[0.6rem] font-medium text-gray-500 uppercase tracking-wide mb-0.5 md:mb-1">Target</div>
                  <div className="text-xs md:text-sm font-semibold text-amber-600 tabular-nums">{formatCurrency(tp.TargetPricePer1000)}</div>
                </div>
                <div className={cn(
                  'border rounded-lg px-2 md:px-3 py-2 md:py-2.5 text-center',
                  isPos
                    ? 'bg-green-500/5 border-green-500/30'
                    : 'bg-red-500/5 border-red-500/30'
                )}>
                  <div className="text-[0.55rem] md:text-[0.6rem] font-medium text-gray-500 uppercase tracking-wide mb-0.5 md:mb-1">Difference</div>
                  <div className={cn('text-xs md:text-sm font-semibold tabular-nums', isPos ? 'text-green-600' : 'text-red-600')}>
                    {isPos ? '+' : ''}{formatCurrency(diff)}
                    <span className="text-[0.6rem] ml-0.5 opacity-70">({isPos ? '+' : ''}{diffPct}%)</span>
                  </div>
                </div>
              </div>
              <div className="flex items-center justify-between px-3 md:px-3.5 py-2 md:py-2.5 bg-gray-50 border border-gray-200 rounded-lg">
                <span className="text-[0.7rem] md:text-[0.78rem] text-gray-600">Profit Margin</span>
                <div className="flex items-center gap-2 md:gap-3">
                  <span className="text-[0.7rem] md:text-[0.78rem] text-gray-400 opacity-50 line-through tabular-nums">{tp.OriginalProfitPercent}%</span>
                  <span className={cn('text-sm md:text-sm font-bold tabular-nums', isProfitPos ? 'text-green-600' : 'text-red-600')}>
                    {newProfit}%
                  </span>
                </div>
              </div>
            </div>
          </div>
        )
      })()}

      {/* Footer */}
      <div className="px-4 md:px-5 py-2 md:py-2.5 bg-gray-50/50 border-t border-gray-200 flex flex-col md:flex-row items-start md:items-center justify-between gap-1 md:gap-2 text-[0.65rem] md:text-[0.7rem] text-gray-500">
        <div className="truncate">Generated: <span className="text-gray-700 font-medium">{formattedTimestamp}</span></div>
        <div className="truncate">Status: <span className="text-gray-700 font-medium">{data.TargetPriceComparison ? 'Target Price Applied' : 'Estimated'}</span></div>
      </div>

      {data.NextStep && (
        <div className="px-4 md:px-5 py-3 md:py-3.5 border-t border-gray-200/50 text-sm md:text-sm text-gray-600 text-center leading-relaxed">
          {data.NextStep}
        </div>
      )}

      {data.afterJson && !(data.NextStep && (() => {
        const norm = (s: string) => s.replace(/[\u2014\u2013]+/g, '--').replace(/-+/g, '-').trim()
        return norm(data.afterJson!).includes(norm(data.NextStep!)) || norm(data.NextStep!).includes(norm(data.afterJson!))
      })()) && (
        <div className="px-4 md:px-5 py-3 md:py-3.5 bg-gray-50/80 border-t border-gray-200/50 text-xs md:text-sm text-gray-600 text-center leading-relaxed"
          dangerouslySetInnerHTML={{
            __html: data.afterJson
              .replace(/\*\*([^*]+)\*\*/g, '<strong class="text-gray-900 font-semibold">$1</strong>')
              .replace(/\n/g, '<br />')
          }}
        />
      )}
    </div>
  )
})

// ─── Target Price Comparison Card (standalone) ───────────────────────────────

const TargetPriceComparisonCard = memo(function TargetPriceComparisonCard({ data }: { data: TargetPriceComparisonData }) {
  const customer = data.CustomerDetails || {}
  const diff = data.DifferencePer1000 || 0
  const originalCost = data.OriginalCostPer1000 || 0
  const diffPercent = originalCost > 0 ? ((diff / originalCost) * 100).toFixed(2) : '0'
  const isPositive = diff >= 0
  const newProfit = data.NewProfitPercent || 0
  const isProfitPositive = newProfit >= 0
  const breakdown = data.CostBreakdownPer1000 || {}

  return (
    <div className="bg-white rounded-xl md:rounded-2xl overflow-hidden border border-gray-200 shadow-lg max-w-full">
      {/* Header */}
      <div className="bg-gradient-to-r from-amber-500/15 to-amber-500/5 px-4 md:px-5 py-3 md:py-4 border-b border-gray-200">
        <div className="flex items-center justify-between mb-1">
          <h3 className="text-sm md:text-base font-semibold text-gray-900 flex items-center gap-2">
            <Target className="w-4 h-4 text-amber-500" />
            Target Price Analysis
          </h3>
          <div className="px-2 md:px-2.5 py-0.5 md:py-1 bg-amber-500/15 border border-amber-500/30 rounded text-[0.65rem] md:text-xs font-semibold text-amber-600 uppercase tracking-wide">
            Comparison
          </div>
        </div>
        {customer.JobName && <div className="text-xs text-gray-600">{customer.JobName}</div>}
      </div>

      <div className="px-4 md:px-5 py-3 md:py-4">
        {/* Customer details (if provided) */}
        {(customer.CustomerName || customer.SheetSize) && (
          <>
            <div className="grid grid-cols-2 gap-2 md:gap-3 mb-3 md:mb-4">
              {customer.CustomerName && (
                <div className="bg-gray-50 border border-gray-200 rounded-lg px-2.5 md:px-3 py-2 md:py-2.5">
                  <div className="text-[0.6rem] md:text-[0.65rem] font-medium text-gray-500 uppercase tracking-wide mb-0.5 md:mb-1">Customer</div>
                  <div className="text-xs md:text-sm font-semibold text-gray-900">{customer.CustomerName}</div>
                </div>
              )}
              {customer.SheetSize && (
                <div className="bg-gray-50 border border-gray-200 rounded-lg px-2.5 md:px-3 py-2 md:py-2.5">
                  <div className="text-[0.6rem] md:text-[0.65rem] font-medium text-gray-500 uppercase tracking-wide mb-0.5 md:mb-1">Sheet Size</div>
                  <div className="text-xs md:text-sm font-semibold text-[#005180]">{customer.SheetSize}</div>
                </div>
              )}
              {customer.OrderQuantity && (
                <div className="bg-gray-50 border border-gray-200 rounded-lg px-2.5 md:px-3 py-2 md:py-2.5">
                  <div className="text-[0.6rem] md:text-[0.65rem] font-medium text-gray-500 uppercase tracking-wide mb-0.5 md:mb-1">Order Qty</div>
                  <div className="text-xs md:text-sm font-semibold text-gray-900">{customer.OrderQuantity.toLocaleString('en-IN')}</div>
                </div>
              )}
              {customer.Ups && (
                <div className="bg-gray-50 border border-gray-200 rounded-lg px-2.5 md:px-3 py-2 md:py-2.5">
                  <div className="text-[0.6rem] md:text-[0.65rem] font-medium text-gray-500 uppercase tracking-wide mb-0.5 md:mb-1">Ups / Sheets</div>
                  <div className="text-xs md:text-sm font-semibold text-gray-900">{customer.Ups} / {customer.RequiredSheets?.toLocaleString('en-IN') || '-'}</div>
                </div>
              )}
            </div>
            <div className="h-px bg-gradient-to-r from-transparent via-gray-300 to-transparent my-3 md:my-4" />
          </>
        )}

        {/* Price comparison KPI row */}
        <div className="text-[0.65rem] md:text-[0.7rem] font-semibold text-gray-600 uppercase tracking-widest mb-2 md:mb-3 pl-2 md:pl-2.5 border-l-2 border-amber-500">
          Price Comparison (Per 1,000)
        </div>
        <div className="grid grid-cols-3 gap-2 md:gap-2.5 mb-3 md:mb-4">
          <div className="bg-gray-50 border border-gray-200 rounded-lg px-2 md:px-3 py-2 md:py-2.5 text-center">
            <div className="text-[0.55rem] md:text-[0.6rem] font-medium text-gray-500 uppercase tracking-wide mb-0.5 md:mb-1">Original</div>
            <div className="text-sm md:text-base font-semibold text-gray-900 tabular-nums">{formatCurrency(data.OriginalCostPer1000)}</div>
          </div>
          <div className="bg-gray-50 border border-amber-500/30 rounded-lg px-2 md:px-3 py-2 md:py-2.5 text-center">
            <div className="text-[0.55rem] md:text-[0.6rem] font-medium text-gray-500 uppercase tracking-wide mb-0.5 md:mb-1">Target</div>
            <div className="text-sm md:text-base font-semibold text-amber-600 tabular-nums">{formatCurrency(data.TargetPricePer1000)}</div>
          </div>
          <div className={cn(
            'border rounded-lg px-2 md:px-3 py-2 md:py-2.5 text-center',
            isPositive
              ? 'bg-green-500/5 border-green-500/30'
              : 'bg-red-500/5 border-red-500/30'
          )}>
            <div className="text-[0.55rem] md:text-[0.6rem] font-medium text-gray-500 uppercase tracking-wide mb-0.5 md:mb-1">Difference</div>
            <div className={cn('text-sm md:text-base font-semibold tabular-nums', isPositive ? 'text-green-600' : 'text-red-600')}>
              {isPositive ? '+' : ''}{formatCurrency(diff)}
              <span className="text-xs ml-0.5 opacity-70">({isPositive ? '+' : ''}{diffPercent}%)</span>
            </div>
          </div>
        </div>

        {/* Profit margin change */}
        <div className="flex items-center justify-between px-3 md:px-3.5 py-2 md:py-2.5 bg-gray-50 border border-gray-200 rounded-lg mb-3 md:mb-4">
          <span className="text-xs md:text-sm text-gray-600">Profit Margin</span>
          <div className="flex items-center gap-2 md:gap-3">
            <span className="text-xs md:text-sm text-gray-400 opacity-50 line-through tabular-nums">{data.OriginalProfitPercent}%</span>
            <span className={cn('text-sm md:text-base font-bold tabular-nums', isProfitPositive ? 'text-green-600' : 'text-red-600')}>
              {newProfit}%
            </span>
          </div>
        </div>

        <div className="h-px bg-gradient-to-r from-transparent via-gray-300 to-transparent my-3 md:my-4" />

        {/* Revised cost breakdown */}
        <div className="text-[0.65rem] md:text-[0.7rem] font-semibold text-gray-600 uppercase tracking-widest mb-2 md:mb-3 pl-2 md:pl-2.5 border-l-2 border-amber-500">
          Revised Breakdown (Per 1,000)
        </div>

        <div>
          <CostRow label="Board Cost" value={formatCurrency(breakdown.BoardCost)} />
          <CostRow label="Other Material Cost" value={formatCurrency(breakdown.OtherMaterialCost)} />
          <CostRow label="Conversion Cost" value={formatCurrency(breakdown.ConversionCost)} />
          <CostRow label={`Profit (${newProfit}%)`} value={formatCurrency(breakdown.Profit)} isProfit />
          <CostRow label="Freight Cost" value={formatCurrency(breakdown.FreightCost)} />
        </div>
      </div>

      {/* Target total bar */}
      <div className={cn(
        'px-4 md:px-5 py-3 md:py-4 flex items-center justify-between border-t gap-2',
        isPositive
          ? 'bg-gradient-to-r from-green-900/50 to-green-950/50 border-green-500/30'
          : 'bg-gradient-to-r from-red-900/50 to-red-950/50 border-red-500/30'
      )}>
        <div className={cn('text-[0.7rem] md:text-[0.8rem] font-semibold uppercase tracking-wide', isPositive ? 'text-green-300' : 'text-red-300')}>
          Target Cost / 1,000
        </div>
        <div className={cn('text-xl md:text-2xl font-bold tabular-nums', isPositive ? 'text-green-400' : 'text-red-400')}>
          {formatCurrency(data.TargetPricePer1000)}
        </div>
      </div>

      {data.afterJson && (
        <div className="px-4 md:px-5 py-3 bg-gray-50/80 border-t border-gray-200/50 text-xs md:text-sm text-gray-600 text-center leading-relaxed"
          dangerouslySetInnerHTML={{
            __html: data.afterJson
              .replace(/\*\*([^*]+)\*\*/g, '<strong class="text-gray-900 font-semibold">$1</strong>')
              .replace(/\n/g, '<br />')
          }}
        />
      )}
    </div>
  )
})

// ─── Confirmation Summary Card ───────────────────────────────────────────────

const ConfirmationSummaryCard = memo(function ConfirmationSummaryCard({ data }: { data: ConfirmationSummaryData }) {
  const contentName = (() => {
    for (const section of data.sections) {
      for (const row of section.rows) {
        if (/^(content|job\s*type|product)$/i.test(row.label) && row.value) {
          return row.value
        }
      }
    }
    return null
  })()

  return (
    <div className="bg-white rounded-xl md:rounded-2xl overflow-hidden border border-gray-200 shadow-lg max-w-full">
      <div className="bg-gradient-to-r from-[#005180]/20 to-[#78BE20]/10 px-4 md:px-5 py-3 md:py-4 border-b border-gray-200">
        <div className="flex items-center gap-3">
          {contentName && (
            <ContentImage name={contentName} className="w-12 h-12" />
          )}
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between">
              <h3 className="text-sm md:text-base font-semibold text-gray-900 flex items-center gap-2">
                <ClipboardCheck className="w-4 h-4 text-[#005180]" />
                {data.cardTitle}
              </h3>
              <div className="px-2 md:px-2.5 py-0.5 md:py-1 bg-amber-500/15 border border-amber-500/30 rounded text-[0.65rem] md:text-xs font-semibold text-amber-600 uppercase tracking-wide">
                Review
              </div>
            </div>
            {contentName && <div className="text-xs text-gray-600 mt-1">{contentName}</div>}
          </div>
        </div>
      </div>

      <div className="px-4 md:px-5 py-3 md:py-4 space-y-3 md:space-y-4">
        {data.sections.map((section, sIdx) => (
          <div key={sIdx}>
            <div className="text-[0.65rem] md:text-[0.7rem] font-semibold text-gray-600 uppercase tracking-widest mb-2 md:mb-2.5 pl-2 md:pl-2.5 border-l-2 border-[#005180]">
              {section.title}
            </div>
            <div>
              {section.rows.map((row, rIdx) => (
                <div
                  key={rIdx}
                  className="flex items-baseline justify-between py-[0.375rem] md:py-[0.4375rem] border-b border-gray-200/30 last:border-b-0"
                >
                  <span className="text-[0.78rem] md:text-[0.82rem] text-gray-600">
                    {row.label}
                    {row.auto && <span className="text-[0.6rem] md:text-[0.65rem] text-gray-400 ml-1">(auto)</span>}
                  </span>
                  <span className={cn(
                    'text-[0.78rem] md:text-[0.82rem] font-semibold text-right',
                    row.auto ? 'text-blue-500' : 'text-gray-900'
                  )}>
                    {row.value || '-'}
                  </span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {data.footerLines.length > 0 && (
        <div className="px-4 md:px-5 py-2.5 md:py-3 bg-gray-50/80 border-t border-gray-200/50 text-[0.75rem] md:text-[0.8rem] text-gray-600 text-center">
          {data.footerLines.join('\n')}
        </div>
      )}
    </div>
  )
})

// ─── Inline Markdown (ReactMarkdown-based text rendering) ────────────────────

const InlineMarkdown = memo(function InlineMarkdown({ text }: { text: string }) {
  if (!text) return null
  // Encode spaces in markdown image URLs so ReactMarkdown can parse them
  const processed = text.replace(/!\[([^\]]*)\]\(([^)]+)\)/g, (_, alt, url) =>
    `![${alt}](${url.replace(/ /g, '%20')})`
  )
  return (
    <div className="text-base md:text-sm leading-relaxed">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          p: ({ children }) => <p className="mb-2 last:mb-0">{children}</p>,
          strong: ({ children }) => <strong className="font-semibold">{children}</strong>,
          em: ({ children }) => <em className="italic">{children}</em>,
          img: ({ src, alt }) => {
            let normalizedSrc = src || ''
            if (normalizedSrc.startsWith('Contents/')) {
              normalizedSrc = '/' + normalizedSrc
            } else if (normalizedSrc.startsWith('images/Contents/')) {
              normalizedSrc = '/' + normalizedSrc.replace('images/', '')
            }
            // Also map to contentsImagesChatBot folder
            if (normalizedSrc.startsWith('/Contents/')) {
              const filename = normalizedSrc.split('/').pop() || ''
              normalizedSrc = `/contentsImagesChatBot/${filename}`
            }
            return (
              <img
                src={normalizedSrc}
                alt={alt || ''}
                className="w-32 h-auto rounded-lg my-2 block"
                loading="lazy"
                onError={(e) => {
                  const cur = e.currentTarget.src
                  if (cur.includes('.jpg') && !cur.includes('_tried_png')) {
                    e.currentTarget.src = cur.replace('.jpg', '.png') + '?_tried_png=1'
                  } else if (!cur.includes('default')) {
                    e.currentTarget.src = '/contentsImagesChatBot/default.jpg'
                  }
                }}
              />
            )
          },
        }}
      >
        {processed}
      </ReactMarkdown>
    </div>
  )
})

// ─── Dropdown Selector (searchable list) ────────────────────────────────────

function DropdownSelector({ items, beforeText, afterText, onSelect }: {
  items: SelectableItem[]
  beforeText: string
  afterText: string
  onSelect: (item: SelectableItem) => void
}) {
  const [search, setSearch] = useState('')
  const [showAll, setShowAll] = useState(false)
  const INITIAL_DISPLAY_COUNT = 5

  const filtered = search.trim()
    ? items.filter(i => i.name.toLowerCase().includes(search.trim().toLowerCase()))
    : items

  const displayItems = showAll || search.trim() ? filtered : filtered.slice(0, INITIAL_DISPLAY_COUNT)
  const hasMore = filtered.length > INITIAL_DISPLAY_COUNT

  // Try parsing beforeText as a ConfirmationSummary card
  const confirmData = beforeText ? parseConfirmationSummary(beforeText) : null

  return (
    <div className="w-full">
      {confirmData ? (
        <div className="mb-3"><ConfirmationSummaryCard data={confirmData} /></div>
      ) : (
        beforeText && <InlineMarkdown text={beforeText} />
      )}
      <div className="max-w-sm rounded-lg border-2 border-gray-200 bg-white shadow-sm overflow-hidden mt-3">
        <div className="flex items-center gap-2 px-3 py-2.5 md:py-2 border-b border-gray-200 bg-gray-50">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-400">
            <circle cx="11" cy="11" r="8"/>
            <path d="m21 21-4.3-4.3"/>
          </svg>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Type to search..."
            className="flex-1 text-sm md:text-sm bg-transparent outline-none text-gray-900 placeholder:text-gray-400"
            autoFocus
          />
          <div className="text-xs text-gray-500 font-medium whitespace-nowrap">
            {filtered.length} {filtered.length === 1 ? 'result' : 'results'}
          </div>
        </div>
        {showAll ? (
          <div
            className="overflow-y-scroll overflow-x-hidden"
            style={{
              height: '240px',
              maxHeight: '240px',
              overflowY: 'scroll',
              WebkitOverflowScrolling: 'touch',
              scrollbarWidth: 'thin',
              touchAction: 'pan-y',
              overscrollBehavior: 'contain'
            }}
          >
            {displayItems.map((item) => (
              <button
                key={item.id}
                onClick={() => onSelect(item)}
                className="w-full text-left px-3 py-2.5 md:py-2 text-sm md:text-sm cursor-pointer transition-colors text-gray-900 hover:bg-[#005180]/10 border-b border-gray-100 last:border-b-0 active:bg-[#005180]/20"
              >
                {item.num}. {item.name}
              </button>
            ))}
          </div>
        ) : (
          <div>
            {filtered.length === 0 ? (
              <div className="px-3 py-4 text-sm text-gray-500 text-center">No results found</div>
            ) : (
              displayItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => onSelect(item)}
                  className="w-full text-left px-3 py-2.5 md:py-2 text-sm md:text-sm cursor-pointer transition-colors text-gray-900 hover:bg-[#005180]/10 border-b border-gray-100 last:border-b-0 active:bg-[#005180]/20"
                >
                  {item.num}. {item.name}
                </button>
              ))
            )}
          </div>
        )}
        {!showAll && hasMore && !search.trim() && (
          <div className="border-t border-gray-200">
            <button
              onClick={() => setShowAll(true)}
              className="w-full px-3 py-2.5 text-sm font-medium text-[#005180] hover:bg-[#005180]/5 transition-colors active:bg-[#005180]/10"
            >
              Show All ({filtered.length})
            </button>
          </div>
        )}
      </div>
      {afterText && !/reply with the number/i.test(afterText) && (
        <div className="mt-3"><InlineMarkdown text={afterText} /></div>
      )}
    </div>
  )
}

function ParkBuddyEmptyState() {
  const suggestions = [
    { icon: MessageSquare, label: 'Ask a printing question' },
    { icon: Calculator, label: 'Start a cost estimate' },
    { icon: ClipboardCheck, label: 'Get business insights', small: true },
  ]

  return (
    <div className="flex flex-col items-center justify-center h-full px-4 py-8 md:py-12">
      <h3 className="text-3xl md:text-4xl font-bold text-[#005180] mb-3 md:mb-2">
        I'm ParkBuddy
      </h3>
      <p className="text-base md:text-lg text-gray-600 text-center max-w-md mb-8 px-4">
        Your AI assistant, built for the world of printing.
      </p>
      <div className="flex flex-col gap-2.5 md:gap-2 w-full max-w-md px-4">
        <div className="grid grid-cols-2 gap-2.5 md:gap-2 w-full">
          {suggestions.slice(0, 2).map((s) => (
            <button
              key={s.label}
              className="flex items-center justify-center gap-1.5 px-2 py-3.5 md:py-2.5 rounded-xl md:rounded-lg border border-gray-200 bg-white text-xs md:text-sm font-medium text-gray-700 hover:text-gray-900 hover:border-[#005180]/40 hover:bg-[#005180]/5 active:scale-98 transition-all duration-200 shadow-sm min-h-[48px] md:min-h-0"
            >
              <s.icon className="w-4 h-4 md:w-4 md:h-4 shrink-0" />
              <span>{s.label}</span>
            </button>
          ))}
        </div>
        <div className="w-full flex justify-center">
          {(() => {
            const s = suggestions[2]
            return (
              <button
                className="flex items-center justify-center gap-1.5 px-2 py-2.5 md:py-2.5 rounded-xl md:rounded-lg border border-gray-200 bg-white text-xs md:text-sm font-medium text-gray-700 hover:text-gray-900 hover:border-[#005180]/40 hover:bg-[#005180]/5 active:scale-98 transition-all duration-200 shadow-sm min-h-[40px] md:min-h-0 w-auto"
              >
                <s.icon className="w-4 h-4 md:w-4 md:h-4 shrink-0" />
                <span>{s.label}</span>
              </button>
            )
          })()}
        </div>
      </div>
    </div>
  )
}

// ─── Main Chat Component ─────────────────────────────────────────────────────

interface ParkBuddyChatProps {
  initialMessage?: string | null
}

export function ParkBuddyChat({ initialMessage }: ParkBuddyChatProps) {
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [isListening, setIsListening] = useState(false)
  const [conversationId, setConversationId] = useState<number>(0)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const hasInitialized = useRef(false)
  const isFirstMessageSent = useRef(false)
  const recognitionRef = useRef<any>(null)
  const { toast } = useToast()
  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [])

  const autoResizeTextarea = useCallback(() => {
    const el = textareaRef.current
    if (!el) return
    el.style.height = 'auto'
    el.style.height = Math.min(el.scrollHeight, 150) + 'px'
  }, [])

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  useEffect(() => {
    if (initialMessage && !hasInitialized.current) {
      hasInitialized.current = true
      handleSendMessage(initialMessage)
    }
  }, [initialMessage])

  // Initialize speech recognition
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
      if (SpeechRecognition) {
        recognitionRef.current = new SpeechRecognition()
        recognitionRef.current.continuous = false
        recognitionRef.current.interimResults = false
        recognitionRef.current.lang = 'en-US'

        recognitionRef.current.onresult = (event: any) => {
          const transcript = event.results[0][0].transcript
          setInput(transcript)
          setIsListening(false)
        }

        recognitionRef.current.onerror = (event: any) => {
          console.error('Speech recognition error:', event.error)
          setIsListening(false)
          toast({
            title: "Voice input error",
            description: "Could not recognize speech. Please try again.",
            variant: "destructive",
          })
        }

        recognitionRef.current.onend = () => {
          setIsListening(false)
        }
      }
    }
  }, [])

  const handleVoiceInput = useCallback(() => {
    if (!recognitionRef.current) {
      toast({
        title: "Not supported",
        description: "Voice input is not supported in your browser.",
        variant: "destructive",
      })
      return
    }

    if (isListening) {
      recognitionRef.current.stop()
      setIsListening(false)
    } else {
      try {
        recognitionRef.current.start()
        setIsListening(true)
      } catch (error) {
        console.error('Error starting speech recognition:', error)
        toast({
          title: "Error",
          description: "Could not start voice input.",
          variant: "destructive",
        })
      }
    }
  }, [isListening, toast])

  // Copy message to clipboard
  const [copiedId, setCopiedId] = useState<string | null>(null)

  const handleCopy = useCallback((text: string, messageId: string) => {
    navigator.clipboard.writeText(text).then(() => {
      setCopiedId(messageId)
      setTimeout(() => setCopiedId(null), 2000)
    })
  }, [])

  // Edit message — deletes all messages after the edited one and resends
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editText, setEditText] = useState("")
  const pendingEditResend = useRef<string | null>(null)

  const handleStartEdit = useCallback((message: Message) => {
    setEditingId(message.id)
    setEditText(message.content)
  }, [])

  const handleCancelEdit = useCallback(() => {
    setEditingId(null)
    setEditText("")
  }, [])

  const handleSaveEdit = async (messageId: string) => {
    if (!editText.trim()) return

    const msgIndex = messages.findIndex(m => m.id === messageId)
    if (msgIndex === -1) return

    const editedMessage = messages[msgIndex]

    // Delete messages after the edited one on the backend using server message ID
    if (conversationId && editedMessage.serverMessageId) {
      console.log(`📝 Edit: deleting messages after serverMessageId=${editedMessage.serverMessageId} in conversation=${conversationId}`)
      try {
        const result = await deleteMessagesAfter(conversationId, editedMessage.serverMessageId)
        console.log('📝 Delete result:', result)
        if (!result.success) {
          console.error('Failed to delete messages on server:', result.error)
        }
      } catch (err) {
        console.error('Failed to delete messages on server:', err)
      }
    } else {
      console.warn('📝 Edit: no serverMessageId found for message, skipping backend delete. conversationId:', conversationId, 'serverMessageId:', editedMessage.serverMessageId)
    }

    // Store the text to resend after state update
    pendingEditResend.current = editText.trim()

    // Remove this message and all messages after it (client-side)
    setMessages(prev => prev.slice(0, msgIndex))

    // Reset edit state
    setEditingId(null)
    setEditText("")
  }

  // Trigger resend after messages state has updated from edit
  useEffect(() => {
    if (pendingEditResend.current && !isLoading) {
      const textToResend = pendingEditResend.current
      pendingEditResend.current = null
      handleSendMessage(textToResend)
    }
  }, [messages, isLoading])

  const handleSendMessage = useCallback(async (messageContent?: string) => {
    const textToSend = messageContent || input
    if (!textToSend.trim() || isLoading) return

    const userMessageId = `user-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`
    const userMessage: Message = {
      id: userMessageId,
      content: textToSend,
      sender: "user",
      timestamp: new Date(),
    }

    setMessages((prev) => [...prev, userMessage])
    setInput("")
    setIsLoading(true)

    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto'
    }

    try {
      const isNewChat = !isFirstMessageSent.current

      const response: any = await sendMessage(
        textToSend,
        conversationId,
        '9999999999',
        isNewChat,
        isNewChat ? textToSend.substring(0, 40) : undefined
      )

      if (isNewChat) {
        isFirstMessageSent.current = true
      }

      // Extract conversationId from response (check all case variants)
      const d = response.data || {}
      const respConvId = d.conversationId || d.ConversationId || d.ConversationID || d.conversation_id

      if (respConvId) {
        console.log('💬 Got conversationId from response:', respConvId)
        setConversationId(respConvId)
      }


      const messageContent = typeof response.data === 'string'
        ? response.data
        : (d.reply || d.message || d.text || d.Reply || d.Message || response.reply || response.message || response.text || response.content || "I apologize, but I couldn't process that request.")

      const aiMessageId = `ai-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`
      const aiMessage: Message = {
        id: aiMessageId,
        content: messageContent,
        sender: "ai",
        timestamp: new Date(),
        options: response.options,
        allowMultiSelect: response.allowMultiSelect,
        bookingId: response.bookingId,
      }

      setMessages((prev) => [...prev, aiMessage])

      // Set server message ID on the user message from response headers
      const serverUserMsgId = d.userMessageId
      if (serverUserMsgId) {
        console.log('💬 Setting serverMessageId on user message:', serverUserMsgId)
        setMessages(prev => prev.map(m =>
          m.id === userMessageId ? { ...m, serverMessageId: serverUserMsgId } : m
        ))
      } else {
        console.warn('💬 No userMessageId in response headers, edit-delete will not work for this message')
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to send message",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }, [input, isLoading, conversationId, toast])

  const handleKeyPress = useCallback((e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }, [handleSendMessage])

  const handleSelectItem = useCallback((item: SelectableItem) => {
    handleSendMessage(item.name)
  }, [handleSendMessage])

  const renderMessage = (message: Message) => {
    if (message.sender === "user") {
      // Editing mode
      if (editingId === message.id) {
        return (
          <div key={message.id} className="flex justify-end mb-4">
            <div className="max-w-[85%] md:max-w-[80%] w-full">
              <div className="bg-[#005180]/10 border-2 border-[#005180] rounded-2xl rounded-tr-sm px-3 py-2 shadow-md">
                <textarea
                  value={editText}
                  onChange={(e) => setEditText(e.target.value)}
                  className="w-full text-base md:text-sm text-gray-900 bg-transparent border-0 outline-none resize-none min-h-[40px]"
                  autoFocus
                />
                <div className="flex justify-end gap-2 mt-2">
                  <button onClick={handleCancelEdit} className="p-1.5 rounded-full hover:bg-gray-200 transition-colors">
                    <X className="w-4 h-4 text-gray-500" />
                  </button>
                  <button onClick={() => handleSaveEdit(message.id)} className="p-1.5 rounded-full bg-[#005180] hover:bg-[#004570] transition-colors">
                    <Send className="w-4 h-4 text-white" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        )
      }

      return (
        <div key={message.id} className="flex justify-end mb-4 group">
          <div className="flex items-end gap-1.5">
            <div className="flex items-center gap-0.5">
              <button
                onClick={() => handleCopy(message.content, message.id)}
                className="opacity-50 md:opacity-0 md:group-hover:opacity-100 p-1.5 rounded-full hover:bg-gray-100 active:bg-gray-200 transition-all"
              >
                {copiedId === message.id ? (
                  <Check className="w-3.5 h-3.5 text-green-500" />
                ) : (
                  <Copy className="w-3.5 h-3.5 text-gray-400" />
                )}
              </button>
              <button
                onClick={() => handleStartEdit(message)}
                className="opacity-50 md:opacity-0 md:group-hover:opacity-100 p-1.5 rounded-full hover:bg-gray-100 active:bg-gray-200 transition-all"
              >
                <Pencil className="w-3.5 h-3.5 text-gray-400" />
              </button>
            </div>
            <div className="max-w-[85%] md:max-w-[80%] bg-[#005180] text-white rounded-2xl rounded-tr-sm px-4 py-3 md:py-2.5 shadow-md">
              <p className="text-base md:text-sm whitespace-pre-wrap leading-relaxed">{message.content}</p>
            </div>
          </div>
        </div>
      )
    }

    // AI message copy button
    const copyButton = (
      <button
        onClick={() => handleCopy(message.content, message.id)}
        className="opacity-50 md:opacity-0 md:group-hover:opacity-100 p-1.5 rounded-full hover:bg-gray-200 active:bg-gray-200 transition-all self-end"
      >
        {copiedId === message.id ? (
          <Check className="w-3.5 h-3.5 text-green-500" />
        ) : (
          <Copy className="w-3.5 h-3.5 text-gray-400" />
        )}
      </button>
    )

    // Try to parse as costing card
    const costingData = parseCostingSummary(message.content)
    if (costingData) {
      return (
        <div key={message.id} className="flex mb-6 group">
          <div className="w-full md:max-w-[90%] lg:max-w-[85%]">
            <CostingCard data={costingData} timestamp={message.timestamp} />
          </div>
          {copyButton}
        </div>
      )
    }

    // Try to parse as standalone target price comparison card
    const targetData = parseTargetPriceComparison(message.content)
    if (targetData) {
      return (
        <div key={message.id} className="flex mb-6 group">
          <div className="w-full md:max-w-[90%] lg:max-w-[85%]">
            <TargetPriceComparisonCard data={targetData} />
          </div>
          {copyButton}
        </div>
      )
    }

    // Try to parse as confirmation summary card
    const confirmData = parseConfirmationSummary(message.content)
    if (confirmData) {
      const confirmActionData = parseActionButtons(message.content)
      return (
        <div key={message.id} className="flex mb-6 group">
          <div className="w-full md:max-w-[90%] lg:max-w-[85%]">
            <ConfirmationSummaryCard data={confirmData} />
            {confirmActionData && confirmActionData.buttons.length > 0 && (
              <div className="flex gap-2 flex-wrap mt-3">
                {confirmActionData.buttons.map((btn) => (
                  <button
                    key={btn.num}
                    onClick={() => handleSendMessage(btn.label)}
                    className={cn(
                      "flex-1 min-w-[120px] px-4 py-2.5 rounded-xl text-sm font-medium transition-all active:scale-95 shadow-sm",
                      btn.label.toLowerCase().includes('confirm')
                        ? "bg-[#005180] text-white hover:bg-[#004570]"
                        : "bg-white text-gray-700 border border-gray-300 hover:border-[#005180] hover:text-[#005180]"
                    )}
                  >
                    {btn.label}
                  </button>
                ))}
              </div>
            )}
          </div>
          {copyButton}
        </div>
      )
    }

    // Try to parse as action buttons (2-4 short numbered options like Confirm/Modify)
    const actionData = parseActionButtons(message.content)
    if (actionData) {
      const detectedContentForAction = extractContentName(actionData.bodyText)
      return (
        <div key={message.id} className="flex mb-4 group">
          <div className="max-w-[85%] md:max-w-[80%]">
            <div className="bg-gray-100 rounded-2xl rounded-tl-sm px-4 py-3 md:py-2.5 shadow-md">
              {detectedContentForAction && (
                <div className="mb-3 flex justify-center">
                  <ContentImage name={detectedContentForAction} className="w-24 h-24 md:w-28 md:h-28" />
                </div>
              )}
              <div className="mb-3">
                <InlineMarkdown text={actionData.bodyText} />
              </div>
              <div className="flex gap-2 flex-wrap">
                {actionData.buttons.map((btn) => (
                  <button
                    key={btn.num}
                    onClick={() => handleSendMessage(btn.label)}
                    className={cn(
                      "flex-1 min-w-[120px] px-4 py-2.5 rounded-xl text-sm font-medium transition-all active:scale-95 shadow-sm",
                      btn.label.toLowerCase().includes('confirm')
                        ? "bg-[#005180] text-white hover:bg-[#004570]"
                        : "bg-white text-gray-700 border border-gray-300 hover:border-[#005180] hover:text-[#005180]"
                    )}
                  >
                    {btn.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
          {copyButton}
        </div>
      )
    }

    // Try to parse as selectable list
    const selectableData = parseSelectableLists(message.content)
    if (selectableData) {
      return (
        <div key={message.id} className="flex mb-4 group">
          <div className="max-w-[85%] md:max-w-[80%]">
            <div className="bg-gray-100 rounded-2xl rounded-tl-sm px-4 py-3 md:py-2.5 shadow-md">
              <DropdownSelector
                items={selectableData.items}
                beforeText={selectableData.beforeText}
                afterText={selectableData.afterText}
                onSelect={handleSelectItem}
              />
            </div>
          </div>
          {copyButton}
        </div>
      )
    }

    // Default AI message — use ReactMarkdown for proper rendering
    // Only show ContentImage if the message does NOT already have markdown images
    const hasMarkdownImage = /!\[([^\]]*)\]\(([^)]+)\)/.test(message.content)
    const detectedContent = !hasMarkdownImage ? extractContentName(message.content) : null

    return (
      <div key={message.id} className="flex mb-4 group">
        <div className="max-w-[85%] md:max-w-[80%]">
          <div className="bg-gray-100 rounded-2xl rounded-tl-sm px-4 py-3 md:py-2.5 shadow-md">
            {detectedContent && (
              <div className="mb-2">
                <ContentImage name={detectedContent} className="w-28 h-28 md:w-32 md:h-32" />
              </div>
            )}
            <InlineMarkdown text={message.content} />
          </div>
        </div>
        {copyButton}
      </div>
    )
  }

  return (
    <div className="flex flex-col h-full w-full overflow-hidden">
      {/* Messages Area */}
      <div
        className="flex-1 min-h-0 overflow-y-auto overflow-x-hidden px-3 md:px-4 py-4 md:py-6 pb-[130px] md:pb-[100px]"
        style={{
          WebkitOverflowScrolling: 'touch',
        }}
      >
        {messages.length === 0 ? (
          <ParkBuddyEmptyState />
        ) : (
          <div className="max-w-4xl mx-auto">
            {messages.map(renderMessage)}
            {isLoading && (
              <div className="flex mb-4">
                <div className="bg-gray-100 rounded-2xl rounded-tl-sm px-4 py-2.5 shadow-sm">
                  <Loader2 className="w-5 h-5 md:w-4 md:h-4 animate-spin text-gray-600" />
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      {/* Input Area */}
      <div className="fixed bottom-14 md:bottom-0 left-0 right-0 lg:left-64 border-t border-gray-200 bg-white px-3 md:px-4 py-2 md:py-3 z-20 shadow-[0_-2px_10px_rgba(0,0,0,0.08)]">
        <div className="max-w-4xl mx-auto">
          <div className="flex gap-2 items-end">
            <Button
              onClick={handleVoiceInput}
              disabled={isLoading}
              size="icon"
              className={cn(
                "h-11 w-11 md:h-11 md:w-11 rounded-full flex-shrink-0 active:scale-95 transition-all shadow-md self-end",
                isListening
                  ? "bg-red-500 hover:bg-red-600 animate-pulse"
                  : "bg-gray-100 hover:bg-gray-200 text-[#005180]"
              )}
            >
              <Mic className={cn("h-5 w-5 md:h-5 md:w-5", isListening && "text-white")} />
            </Button>
            <div className="flex-1 relative">
              <textarea
                ref={textareaRef}
                value={input}
                onChange={(e) => {
                  setInput(e.target.value)
                  autoResizeTextarea()
                }}
                onKeyDown={handleKeyPress}
                placeholder={isListening ? "Listening..." : "Ask ParkBuddy anything..."}
                className="w-full min-h-[44px] max-h-[150px] resize-none rounded-2xl border-2 border-gray-300 focus:border-[#005180] focus:ring-2 focus:ring-[#005180] focus:outline-none px-3 pr-3 text-base md:text-sm py-2.5 md:py-2 bg-white"
                disabled={isLoading || isListening}
                rows={1}
              />
            </div>
            <Button
              onClick={() => handleSendMessage()}
              disabled={!input.trim() || isLoading || isListening}
              size="icon"
              className="h-11 w-11 md:h-11 md:w-11 rounded-full bg-[#005180] hover:bg-[#004570] disabled:opacity-50 flex-shrink-0 active:scale-95 transition-transform shadow-md self-end"
            >
              {isLoading ? (
                <Loader2 className="h-5 w-5 md:h-5 md:w-5 animate-spin" />
              ) : (
                <Send className="h-5 w-5 md:h-5 md:w-5" />
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
