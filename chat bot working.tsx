'use client'

/**
 * Synthia AI Assistant - Dedicated Full Page
 * Wraps the generic Chat component with Synthia-specific branding,
 * rich card rendering (costing, target price, confirmation), and empty state.
 */

import { ReactNode, useState, useCallback } from 'react'
import { cn } from '@/lib/utils'
import type { Message as MessageType } from '@/lib/api/ai/types'
import { Calculator, Target, ClipboardCheck, MessageSquare } from 'lucide-react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { useSession } from 'next-auth/react'
import { Chat } from '@/components/chat/chat'
import { deleteMessagesAfterAPI } from '@/lib/api/ai/chat'
import { Messages, SelectableItem } from '@/components/chat/ai-messages'
import { SynthiaLogo } from './synthia-logo'
import { useCurrency } from '@/contexts/CurrencyContext'
import { useLanguage } from '@/contexts/LanguageContext'

// ─── Types ───────────────────────────────────────────────────────────────────

interface DetailedCostParticular {
  Rs_Per_1000_Cartons?: number
}

interface CostingCardData {
  Type: string
  ContentName?: string
  CustomerDetails: {
    CustomerName?: string
    JobName?: string
    ContentType?: string
    SheetSize?: string
    OrderQuantity?: number
    Ups?: string
    RequiredSheets?: number
  }
  CostStructurePer1000: {
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

// Strip afterJson if it contains duplicate structured data already rendered by the card
function cleanAfterJson(text: string): string {
  if (!text) return ''
  // If it contains known summary patterns, skip it entirely (same approach as legacy Synthia)
  if (/COSTING SUMMARY|Cost Structure|Customer Details|Percentage Breakup|TARGET PRICE ANALYSIS/i.test(text)) {
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

  if (!/\*\*[^*]+\*\*/.test(cleanText)) return null
  if (!/[*\u2022]\s+.+:.+/.test(cleanText)) return null

  const lines = cleanText.split('\n')
  const sections: ConfirmationSection[] = []
  let currentSection: ConfirmationSection | null = null
  const footerLines: string[] = []
  let reachedSections = false
  let reachedFooter = false

  for (const line of lines) {
    const trimmed = line.trim()
    if (!trimmed) continue

    if (/^-{5,}$/.test(trimmed)) {
      reachedFooter = true
      continue
    }

    if (reachedFooter) {
      if (/^\d+\.\s+/.test(trimmed)) break
      footerLines.push(trimmed)
      continue
    }

    const sectionMatch = trimmed.match(/^\*\*([^*]+)\*\*$/)
    if (sectionMatch) {
      reachedSections = true
      currentSection = { title: sectionMatch[1].trim(), rows: [] }
      sections.push(currentSection)
      continue
    }

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

interface ParsedSelectableData {
  items: SelectableItem[]
  beforeText: string
  afterText: string
}

function parseSelectableLists(text: string): ParsedSelectableData | null {
  const cleanText = text
    .replace(/\\r\\n/g, '\n')
    .replace(/\\r/g, '')
    .replace(/\\n/g, '\n')
    .replace(/\r/g, '')

  // Match numbered items — with or without (ClientID:X)/(CategoryID:X) suffix
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

  // Items with (ClientID:X)/(CategoryID:X) are always selections
  // Plain numbered lists are selections if beforeText ends with ? or :
  // BUT exclude lists that ask user to type/reply with values (those are input prompts, not selections)
  const bt = beforeLines.join('\n')
  const at = afterLines.join('\n')
  const lastChar = bt.trim().slice(-1)
  if (!hasIdItems) {
    if (lastChar !== '?' && lastChar !== ':') return null
    if (/reply with values|type them|enter the|provide the|fill in/i.test(at)) return null
  }

  return {
    items,
    beforeText: bt,
    afterText: afterLines.join('\n')
  }
}

// ─── Shared Hooks ────────────────────────────────────────────────────────────

function useCostingCurrency() {
  const { getCurrencyInfo, selectedCurrency } = useCurrency()
  const currencySymbol = getCurrencyInfo(selectedCurrency)?.symbol || ''

  const formatCurrency = (value?: number): string => {
    if (typeof value !== 'number') return '-'
    return `${currencySymbol} ${value.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
  }

  return { formatCurrency, currencySymbol }
}

// ─── Card Components ─────────────────────────────────────────────────────────

function CostRow({ label, value, percentage, isProfit, profitColor }: {
  label: string
  value: string
  percentage?: number | null
  isProfit?: boolean
  profitColor?: string
}) {
  // Profit: success color for positive, error color for negative/loss
  const isLoss = isProfit && value.replace(/[^0-9.-]/g, '').startsWith('-')
  const profitColorClass = isProfit
    ? (isLoss ? 'text-[rgb(var(--color-error))]' : 'text-[rgb(var(--color-success))]')
    : ''

  return (
    <div className={cn(
      'flex items-baseline py-2.5 border-b border-[rgb(var(--bd-default))]/30 last:border-b-0',
    )}>
      <span className={cn('flex-1 text-sm', isProfit ? profitColorClass : 'text-[rgb(var(--fg-muted))]')}>
        {label}
      </span>
      <span className={cn(
        'w-[6rem] text-sm text-right font-semibold tabular-nums',
        profitColor || (isProfit ? profitColorClass : 'text-[rgb(var(--fg-default))]')
      )}>
        {value}
      </span>
      {percentage != null && (
        <span className={cn('w-[3.25rem] text-[0.75rem] text-right tabular-nums ml-3 opacity-60', isProfit ? profitColorClass : 'text-[rgb(var(--fg-muted))]')}>
          {percentage}%
        </span>
      )}
    </div>
  )
}

function DetailedCostSummarySection({ data, formatCurrency }: {
  data: NonNullable<CostingCardData['DetailedCostSummary']>
  formatCurrency: (v?: number) => string
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
    green: 'bg-[rgb(var(--color-success))]/8',
    red: 'bg-red-500/8',
    primary: 'bg-[rgb(var(--color-primary))]/15',
  }
  const highlightText: Record<string, string> = {
    green: 'text-[rgb(var(--color-success))]',
    red: 'text-red-400',
    primary: 'text-[rgb(var(--color-primary))]',
  }

  return (
    <>
      <div className="h-px bg-gradient-to-r from-transparent via-[rgb(var(--bd-default))] to-transparent my-4" />
      <div className="text-[0.7rem] font-semibold text-[rgb(var(--fg-muted))] uppercase tracking-widest mb-3 pl-2.5 border-l-2 border-[rgb(var(--color-primary))]">
        Cost Breakdown
      </div>
      <div className="rounded-lg border border-[rgb(var(--bd-default))] overflow-hidden">
        {/* Table header */}
        <div className="flex items-center px-3 py-2.5 bg-[rgb(var(--bg-app))] border-b border-[rgb(var(--bd-default))] text-xs font-bold text-[rgb(var(--fg-default))] uppercase tracking-wide">
          <span className="flex-1">Particulars</span>
          <span className="w-[7rem] text-right">Amount</span>
          <span className="w-[4rem] text-right">%</span>
        </div>
        {/* Table rows */}
        {rows.map((row, idx) => (
          <div
            key={idx}
            className={cn(
              'group flex items-baseline px-3 py-2 border-b border-[rgb(var(--bd-default))]/30 last:border-b-0',
              row.highlight ? highlightBg[row.highlight] : ''
            )}
          >
            <span className={cn('flex-1 text-[0.8rem]', row.highlight ? cn('font-semibold', highlightText[row.highlight]) : 'text-[rgb(var(--fg-muted))]')}>
              {row.label}
              {row.note && <span className="text-[0.65rem] text-[rgb(var(--fg-muted))]/60 ml-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200">({row.note})</span>}
            </span>
            <span className={cn('w-[7rem] text-right text-[0.8rem] font-semibold tabular-nums', row.highlight ? highlightText[row.highlight] : 'text-[rgb(var(--fg-default))]')}>
              {formatCurrency(row.amount)}
            </span>
            <span className={cn('w-[4rem] text-right text-[0.7rem] tabular-nums', row.highlight ? cn('font-medium', highlightText[row.highlight]) : 'text-[rgb(var(--fg-muted))]')}>
              {row.percent}%
            </span>
          </div>
        ))}
      </div>
    </>
  )
}

function CostingCard({ data, timestamp }: { data: CostingCardData; timestamp?: Date }) {
  const { formatCurrency } = useCostingCurrency()

  const customer = data.CustomerDetails || {}
  const contentName = data.ContentName || customer.ContentType || null

  const formattedTimestamp = (timestamp || new Date()).toLocaleString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: true
  })

  return (
    <div className="bg-[rgb(var(--bg-surface))] rounded-xl overflow-hidden border border-[rgb(var(--bd-default))] shadow-lg max-w-full">
      <div className="bg-gradient-to-r from-[rgb(var(--color-primary))]/20 to-[rgb(var(--color-primary))]/10 px-5 py-4 border-b border-[rgb(var(--bd-default))]">
        <div className="flex items-center gap-3">
          {contentName && (
            <img
              src={`/Contents/${contentName}.jpg`}
              alt={contentName}
              className="w-16 h-16 rounded-lg object-cover flex-shrink-0"
              onError={(e) => {
                const currentSrc = e.currentTarget.src
                if (currentSrc.includes('.jpg') && !currentSrc.includes('_tried_png')) {
                  e.currentTarget.src = currentSrc.replace('.jpg', '.png') + '?_tried_png=1'
                } else {
                  e.currentTarget.src = '/Contents/Rectangular.jpg'
                }
              }}
            />
          )}
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-[rgb(var(--fg-muted))] uppercase tracking-wide">
                Costing Summary
              </h3>
              <div className="px-2.5 py-1 bg-[rgb(var(--color-primary))]/15 border border-[rgb(var(--color-primary))]/30 rounded text-xs font-semibold text-[rgb(var(--color-primary))] uppercase tracking-wide">
                Best Plan
              </div>
            </div>
            <div className="text-xs text-[rgb(var(--fg-muted))] mt-1">Job Name: {customer.JobName || 'Print Job Estimation'}</div>
          </div>
        </div>
      </div>

      <div className="px-5 py-4">
        <div className="grid grid-cols-2 gap-3 mb-4">
          <div className="bg-[rgb(var(--bg-app))] border border-[rgb(var(--bd-default))] rounded-lg px-3 py-2.5">
            <div className="text-[0.65rem] font-medium text-[rgb(var(--fg-muted))] uppercase tracking-wide mb-1">Customer</div>
            <div className="text-sm font-semibold text-[rgb(var(--fg-default))]">{customer.CustomerName || '-'}</div>
          </div>
          <div className="bg-[rgb(var(--bg-app))] border border-[rgb(var(--bd-default))] rounded-lg px-3 py-2.5">
            <div className="text-[0.65rem] font-medium text-[rgb(var(--fg-muted))] uppercase tracking-wide mb-1">Order Qty{data.AnnualQuantity != null && data.AnnualQuantity > 0 ? ' / Annual Qty' : ''}</div>
            <div className="text-sm font-semibold text-[rgb(var(--fg-default))]">
              {customer.OrderQuantity?.toLocaleString('en-IN') || '-'}
              {data.AnnualQuantity != null && data.AnnualQuantity > 0 && (
                <span className="text-[rgb(var(--fg-muted))]"> / {data.AnnualQuantity.toLocaleString('en-IN')}</span>
              )}
            </div>
          </div>
          <div className="bg-[rgb(var(--bg-app))] border border-[rgb(var(--bd-default))] rounded-lg px-3 py-2.5">
            <div className="text-[0.65rem] font-medium text-[rgb(var(--fg-muted))] uppercase tracking-wide mb-1">Sheet Size / Wt. per 1000</div>
            <div className="text-sm font-semibold text-[rgb(var(--color-primary))]">
              {customer.SheetSize || '-'}
              {data.DetailedCostSummary?.KgsPer1000Cartons != null && (
                <span className="text-[rgb(var(--fg-muted))]"> / {data.DetailedCostSummary.KgsPer1000Cartons.toLocaleString('en-IN')} kg</span>
              )}
            </div>
          </div>
          <div className="bg-[rgb(var(--bg-app))] border border-[rgb(var(--bd-default))] rounded-lg px-3 py-2.5">
            <div className="text-[0.65rem] font-medium text-[rgb(var(--fg-muted))] uppercase tracking-wide mb-1">Ups / Sheets</div>
            <div className="text-sm font-semibold text-[rgb(var(--fg-default))]">
              {customer.Ups || '-'}
              <span className="text-[rgb(var(--fg-muted))]"> / {customer.RequiredSheets?.toLocaleString('en-IN') || '-'}</span>
            </div>
          </div>
        </div>

        {/* KPI Cards - RMC%, PSR, PKR */}
        {data.KPIs && (data.KPIs.RMCPercent != null || data.KPIs.PSR != null || data.KPIs.PKR != null) && (
          <>
            <div className="h-px bg-gradient-to-r from-transparent via-[rgb(var(--bd-default))] to-transparent my-4" />
            <div className="text-[0.7rem] font-semibold text-[rgb(var(--fg-muted))] uppercase tracking-widest mb-3 pl-2.5 border-l-2 border-[rgb(var(--color-primary))]">
              Key Performance Indicators
            </div>
            <div className="grid grid-cols-3 gap-2.5">
              {data.KPIs.RMCPercent != null && (
                <div className="bg-[rgb(var(--bg-app))] border border-[rgb(var(--bd-default))] rounded-lg px-3 py-2.5 text-center">
                  <div className="text-[0.6rem] font-medium text-[rgb(var(--fg-muted))] uppercase tracking-wide mb-1">RMC%</div>
                  <div className="text-lg font-semibold text-[rgb(var(--fg-default))] tabular-nums">{data.KPIs.RMCPercent.toFixed(1)}%</div>
                  <div className="text-[0.6rem] text-[rgb(var(--fg-muted))] mt-0.5">
                    {data.KPIs.RMCPercent >= 60 ? 'High' : data.KPIs.RMCPercent >= 40 ? 'Moderate' : 'Healthy'}
                  </div>
                </div>
              )}
              {data.KPIs.PSR != null && (
                <div className="bg-[rgb(var(--bg-app))] border border-[rgb(var(--bd-default))] rounded-lg px-3 py-2.5 text-center">
                  <div className="text-[0.6rem] font-medium text-[rgb(var(--fg-muted))] uppercase tracking-wide mb-1">PSR</div>
                  <div className="text-lg font-semibold text-[rgb(var(--fg-default))] tabular-nums">{formatCurrency(data.KPIs.PSR)}</div>
                  <div className="text-[0.6rem] text-[rgb(var(--fg-muted))] mt-0.5">Per Sheet</div>
                </div>
              )}
              {data.KPIs.PKR != null && (
                <div className="bg-[rgb(var(--bg-app))] border border-[rgb(var(--bd-default))] rounded-lg px-3 py-2.5 text-center">
                  <div className="text-[0.6rem] font-medium text-[rgb(var(--fg-muted))] uppercase tracking-wide mb-1">PKR</div>
                  <div className="text-lg font-semibold text-[rgb(var(--fg-default))] tabular-nums">{formatCurrency(data.KPIs.PKR)}</div>
                  <div className="text-[0.6rem] text-[rgb(var(--fg-muted))] mt-0.5">Per Kg</div>
                </div>
              )}
            </div>
          </>
        )}

        {/* Cost Breakdown — granular breakdown with % to FOB */}
        {data.DetailedCostSummary?.Particulars && (
          <DetailedCostSummarySection data={data.DetailedCostSummary} formatCurrency={formatCurrency} />
        )}
      </div>

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
          <div className="border-t border-[rgb(var(--bd-default))]">
            <div className="px-5 py-3 bg-[rgb(var(--bg-subtle))] border-b border-[rgb(var(--bd-default))]">
              <h4 className="text-sm font-semibold text-[rgb(var(--fg-default))] flex items-center gap-2">
                <Target className="w-3.5 h-3.5 text-amber-500" />
                Target Price Analysis
              </h4>
            </div>
            <div className="px-5 py-4">
              <div className="grid grid-cols-3 gap-2.5 mb-3">
                <div className="bg-[rgb(var(--bg-app))] border border-[rgb(var(--bd-default))] rounded-lg px-3 py-2.5 text-center">
                  <div className="text-[0.6rem] font-medium text-[rgb(var(--fg-muted))] uppercase tracking-wide mb-1">Original</div>
                  <div className="text-sm font-semibold text-[rgb(var(--fg-default))] tabular-nums">{formatCurrency(tp.OriginalCostPer1000)}</div>
                </div>
                <div className="bg-[rgb(var(--bg-app))] border border-amber-500/30 rounded-lg px-3 py-2.5 text-center">
                  <div className="text-[0.6rem] font-medium text-[rgb(var(--fg-muted))] uppercase tracking-wide mb-1">Target</div>
                  <div className="text-sm font-semibold text-amber-400 tabular-nums">{formatCurrency(tp.TargetPricePer1000)}</div>
                </div>
                <div className={cn(
                  'border rounded-lg px-3 py-2.5 text-center',
                  isPos
                    ? 'bg-[rgb(var(--color-success))]/5 border-[rgb(var(--color-success))]/30'
                    : 'bg-[rgb(var(--color-error))]/5 border-[rgb(var(--color-error))]/30'
                )}>
                  <div className="text-[0.6rem] font-medium text-[rgb(var(--fg-muted))] uppercase tracking-wide mb-1">Difference</div>
                  <div className={cn('text-sm font-semibold tabular-nums', isPos ? 'text-[rgb(var(--color-success))]' : 'text-[rgb(var(--color-error))]')}>
                    {isPos ? '+' : ''}{formatCurrency(diff)}
                    <span className="text-[0.65rem] ml-0.5 opacity-70">({isPos ? '+' : ''}{diffPct}%)</span>
                  </div>
                </div>
              </div>
              <div className="flex items-center justify-between px-3.5 py-2.5 bg-[rgb(var(--bg-app))] border border-[rgb(var(--bd-default))] rounded-lg">
                <span className="text-[0.78rem] text-[rgb(var(--fg-muted))]">Profit Margin</span>
                <div className="flex items-center gap-3">
                  <span className="text-[0.78rem] text-[rgb(var(--fg-muted))] opacity-50 line-through tabular-nums">{tp.OriginalProfitPercent}%</span>
                  <span className={cn('text-sm font-bold tabular-nums', isProfitPos ? 'text-[rgb(var(--color-success))]' : 'text-[rgb(var(--color-error))]')}>
                    {newProfit}%
                  </span>
                </div>
              </div>
            </div>
          </div>
        )
      })()}

      <div className="px-5 py-2.5 bg-[rgb(var(--bg-app))]/50 border-t border-[rgb(var(--bd-default))] flex items-center justify-between text-[0.7rem] text-[rgb(var(--fg-muted))]">
        <div>Generated: <span className="text-[rgb(var(--fg-default))] font-medium">{formattedTimestamp}</span></div>
        <div>Status: <span className="text-[rgb(var(--fg-default))] font-medium">{data.TargetPriceComparison ? 'Target Price Applied' : 'Estimated'}</span></div>
      </div>

      {data.NextStep && (
        <div className="px-5 py-3.5 border-t border-[rgb(var(--bd-default))]/50 text-sm text-[rgb(var(--fg-muted))] text-center leading-relaxed">
          {data.NextStep}
        </div>
      )}

      {data.afterJson && !(data.NextStep && data.afterJson.includes(data.NextStep)) && (
        <div className="px-5 py-3.5 bg-[rgb(var(--bg-app))]/80 border-t border-[rgb(var(--bd-default))]/50 text-sm text-[rgb(var(--fg-muted))] text-center leading-relaxed"
          dangerouslySetInnerHTML={{
            __html: data.afterJson
              .replace(/\*\*([^*]+)\*\*/g, '<strong class="text-[rgb(var(--fg-default))] font-semibold">$1</strong>')
              .replace(/\n/g, '<br />')
          }}
        />
      )}
    </div>
  )
}

function TargetPriceComparisonCard({ data }: { data: TargetPriceComparisonData }) {
  const { formatCurrency } = useCostingCurrency()

  const customer = data.CustomerDetails || {}
  const diff = data.DifferencePer1000 || 0
  const originalCost = data.OriginalCostPer1000 || 0
  const diffPercent = originalCost > 0 ? ((diff / originalCost) * 100).toFixed(2) : '0'
  const isPositive = diff >= 0
  const newProfit = data.NewProfitPercent || 0
  const isProfitPositive = newProfit >= 0
  const breakdown = data.CostBreakdownPer1000 || {}

  return (
    <div className="bg-[rgb(var(--bg-surface))] rounded-xl overflow-hidden border border-[rgb(var(--bd-default))] shadow-lg max-w-full">
      {/* Header */}
      <div className="bg-gradient-to-r from-amber-500/15 to-amber-500/5 px-5 py-4 border-b border-[rgb(var(--bd-default))]">
        <div className="flex items-center justify-between mb-1">
          <h3 className="text-base font-semibold text-[rgb(var(--fg-default))] flex items-center gap-2">
            <Target className="w-4 h-4 text-amber-500" />
            Target Price Analysis
          </h3>
          <div className="px-2.5 py-1 bg-amber-500/15 border border-amber-500/30 rounded text-xs font-semibold text-amber-400 uppercase tracking-wide">
            Comparison
          </div>
        </div>
        {customer.JobName && <div className="text-xs text-[rgb(var(--fg-muted))]">{customer.JobName}</div>}
      </div>

      <div className="px-5 py-4">
        {/* Customer details (if provided) */}
        {(customer.CustomerName || customer.SheetSize) && (
          <>
            <div className="grid grid-cols-2 gap-3 mb-4">
              {customer.CustomerName && (
                <div className="bg-[rgb(var(--bg-app))] border border-[rgb(var(--bd-default))] rounded-lg px-3 py-2.5">
                  <div className="text-[0.65rem] font-medium text-[rgb(var(--fg-muted))] uppercase tracking-wide mb-1">Customer</div>
                  <div className="text-sm font-semibold text-[rgb(var(--fg-default))]">{customer.CustomerName}</div>
                </div>
              )}
              {customer.SheetSize && (
                <div className="bg-[rgb(var(--bg-app))] border border-[rgb(var(--bd-default))] rounded-lg px-3 py-2.5">
                  <div className="text-[0.65rem] font-medium text-[rgb(var(--fg-muted))] uppercase tracking-wide mb-1">Sheet Size</div>
                  <div className="text-sm font-semibold text-[rgb(var(--color-primary))]">{customer.SheetSize}</div>
                </div>
              )}
              {customer.OrderQuantity && (
                <div className="bg-[rgb(var(--bg-app))] border border-[rgb(var(--bd-default))] rounded-lg px-3 py-2.5">
                  <div className="text-[0.65rem] font-medium text-[rgb(var(--fg-muted))] uppercase tracking-wide mb-1">Order Qty</div>
                  <div className="text-sm font-semibold text-[rgb(var(--fg-default))]">{customer.OrderQuantity.toLocaleString('en-IN')}</div>
                </div>
              )}
              {customer.Ups && (
                <div className="bg-[rgb(var(--bg-app))] border border-[rgb(var(--bd-default))] rounded-lg px-3 py-2.5">
                  <div className="text-[0.65rem] font-medium text-[rgb(var(--fg-muted))] uppercase tracking-wide mb-1">Ups / Sheets</div>
                  <div className="text-sm font-semibold text-[rgb(var(--fg-default))]">{customer.Ups} / {customer.RequiredSheets?.toLocaleString('en-IN') || '-'}</div>
                </div>
              )}
            </div>
            <div className="h-px bg-gradient-to-r from-transparent via-[rgb(var(--bd-default))] to-transparent my-4" />
          </>
        )}

        {/* Price comparison KPI row */}
        <div className="text-[0.7rem] font-semibold text-[rgb(var(--fg-muted))] uppercase tracking-widest mb-3 pl-2.5 border-l-2 border-amber-500">
          Price Comparison (Per 1,000)
        </div>
        <div className="grid grid-cols-3 gap-2.5 mb-4">
          <div className="bg-[rgb(var(--bg-app))] border border-[rgb(var(--bd-default))] rounded-lg px-3 py-2.5 text-center">
            <div className="text-[0.6rem] font-medium text-[rgb(var(--fg-muted))] uppercase tracking-wide mb-1">Original</div>
            <div className="text-base font-semibold text-[rgb(var(--fg-default))] tabular-nums">{formatCurrency(data.OriginalCostPer1000)}</div>
          </div>
          <div className="bg-[rgb(var(--bg-app))] border border-amber-500/30 rounded-lg px-3 py-2.5 text-center">
            <div className="text-[0.6rem] font-medium text-[rgb(var(--fg-muted))] uppercase tracking-wide mb-1">Target</div>
            <div className="text-base font-semibold text-amber-400 tabular-nums">{formatCurrency(data.TargetPricePer1000)}</div>
          </div>
          <div className={cn(
            'border rounded-lg px-3 py-2.5 text-center',
            isPositive
              ? 'bg-[rgb(var(--color-success))]/5 border-[rgb(var(--color-success))]/30'
              : 'bg-[rgb(var(--color-error))]/5 border-[rgb(var(--color-error))]/30'
          )}>
            <div className="text-[0.6rem] font-medium text-[rgb(var(--fg-muted))] uppercase tracking-wide mb-1">Difference</div>
            <div className={cn('text-base font-semibold tabular-nums', isPositive ? 'text-[rgb(var(--color-success))]' : 'text-[rgb(var(--color-error))]')}>
              {isPositive ? '+' : ''}{formatCurrency(diff)}
              <span className="text-xs ml-0.5 opacity-70">({isPositive ? '+' : ''}{diffPercent}%)</span>
            </div>
          </div>
        </div>

        {/* Profit margin change */}
        <div className="flex items-center justify-between px-3.5 py-2.5 bg-[rgb(var(--bg-app))] border border-[rgb(var(--bd-default))] rounded-lg mb-4">
          <span className="text-sm text-[rgb(var(--fg-muted))]">Profit Margin</span>
          <div className="flex items-center gap-3">
            <span className="text-sm text-[rgb(var(--fg-muted))] opacity-50 line-through tabular-nums">{data.OriginalProfitPercent}%</span>
            <span className={cn('text-base font-bold tabular-nums', isProfitPositive ? 'text-[rgb(var(--color-success))]' : 'text-[rgb(var(--color-error))]')}>
              {newProfit}%
            </span>
          </div>
        </div>

        <div className="h-px bg-gradient-to-r from-transparent via-[rgb(var(--bd-default))] to-transparent my-4" />

        {/* Revised cost breakdown */}
        <div className="text-[0.7rem] font-semibold text-[rgb(var(--fg-muted))] uppercase tracking-widest mb-3 pl-2.5 border-l-2 border-amber-500">
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
        'px-5 py-4 flex items-center justify-between border-t',
        isPositive
          ? 'bg-gradient-to-r from-green-900/50 to-green-950/50 border-green-500/30'
          : 'bg-gradient-to-r from-red-900/50 to-red-950/50 border-red-500/30'
      )}>
        <div className={cn('text-[0.8rem] font-semibold uppercase tracking-wide', isPositive ? 'text-green-300' : 'text-red-300')}>
          Target Cost / 1,000
        </div>
        <div className={cn('text-2xl font-bold tabular-nums', isPositive ? 'text-green-400' : 'text-red-400')}>
          {formatCurrency(data.TargetPricePer1000)}
        </div>
      </div>

      {data.afterJson && (
        <div className="px-5 py-3 bg-[rgb(var(--bg-app))]/80 border-t border-[rgb(var(--bd-default))]/50 text-sm text-[rgb(var(--fg-muted))] text-center leading-relaxed"
          dangerouslySetInnerHTML={{
            __html: data.afterJson
              .replace(/\*\*([^*]+)\*\*/g, '<strong class="text-[rgb(var(--fg-default))] font-semibold">$1</strong>')
              .replace(/\n/g, '<br />')
          }}
        />
      )}
    </div>
  )
}

function ConfirmationSummaryCard({ data }: { data: ConfirmationSummaryData }) {
  // Extract content name from rows to show content image
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
    <div className="bg-[rgb(var(--bg-surface))] rounded-xl overflow-hidden border border-[rgb(var(--bd-default))] shadow-lg max-w-full">
      <div className="bg-gradient-to-r from-[rgb(var(--color-primary))]/20 to-[rgb(var(--color-primary))]/10 px-5 py-4 border-b border-[rgb(var(--bd-default))]">
        <div className="flex items-center gap-3">
          {contentName && (
            <div className="w-12 h-12 rounded-lg overflow-hidden border border-[rgb(var(--bd-default))] bg-[rgb(var(--bg-app))] flex-shrink-0">
              <img
                src={`/Contents/${contentName}.jpg`}
                alt={contentName}
                className="w-full h-full object-cover"
                onError={(e) => {
                  const currentSrc = e.currentTarget.src
                  if (currentSrc.includes('.jpg') && !currentSrc.includes('_tried_png')) {
                    e.currentTarget.src = currentSrc.replace('.jpg', '.png') + '?_tried_png=1'
                  } else {
                    e.currentTarget.src = '/Contents/Rectangular.jpg'
                  }
                }}
              />
            </div>
          )}
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-semibold text-[rgb(var(--fg-default))] flex items-center gap-2">
                <ClipboardCheck className="w-4 h-4 text-[rgb(var(--color-primary))]" />
                {data.cardTitle}
              </h3>
              <div className="px-2.5 py-1 bg-amber-500/15 border border-amber-500/30 rounded text-xs font-semibold text-amber-400 uppercase tracking-wide">
                Review
              </div>
            </div>
            {contentName && <div className="text-xs text-[rgb(var(--fg-muted))] mt-1">{contentName}</div>}
          </div>
        </div>
      </div>

      <div className="px-5 py-4 space-y-4">
        {data.sections.map((section, sIdx) => (
          <div key={sIdx}>
            <div className="text-[0.7rem] font-semibold text-[rgb(var(--fg-muted))] uppercase tracking-widest mb-2.5 pl-2.5 border-l-2 border-[rgb(var(--color-primary))]">
              {section.title}
            </div>
            <div>
              {section.rows.map((row, rIdx) => (
                <div
                  key={rIdx}
                  className="flex items-baseline justify-between py-[0.4375rem] border-b border-[rgb(var(--bd-default))]/30 last:border-b-0"
                >
                  <span className="text-[0.82rem] text-[rgb(var(--fg-muted))]">
                    {row.label}
                    {row.auto && <span className="text-[0.65rem] text-[rgb(var(--fg-muted))]/50 ml-1">(auto)</span>}
                  </span>
                  <span className={cn(
                    'text-[0.82rem] font-semibold text-right',
                    row.auto ? 'text-blue-400' : 'text-[rgb(var(--fg-default))]'
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
        <div className="px-5 py-3 bg-[rgb(var(--bg-app))]/80 border-t border-[rgb(var(--bd-default))]/50 text-[0.8rem] text-[rgb(var(--fg-muted))] text-center">
          {data.footerLines.join('\n')}
        </div>
      )}
    </div>
  )
}

// ─── Inline Markdown (for before/after text around lists) ────────────────────

function InlineMarkdown({ text }: { text: string }) {
  if (!text) return null
  // Encode spaces in markdown image URLs so ReactMarkdown can parse them
  const processed = text.replace(/!\[([^\]]*)\]\(([^)]+)\)/g, (_, alt, url) =>
    `![${alt}](${url.replace(/ /g, '%20')})`
  )
  return (
    <div className="text-sm leading-relaxed">
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
                  } else if (!cur.includes('Rectangular')) {
                    e.currentTarget.src = '/Contents/Rectangular.jpg'
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
}

// ─── Dropdown Selector (always-open searchable list) ─────────────────────────

function DropdownSelector({ items, beforeText, afterText, onSelect }: {
  items: SelectableItem[]
  beforeText: string
  afterText: string
  onSelect: (item: SelectableItem) => void
}) {
  const { t } = useLanguage()
  const [search, setSearch] = useState('')

  const filtered = search.trim()
    ? items.filter(i => i.name.toLowerCase().includes(search.trim().toLowerCase()))
    : items

  // Try parsing beforeText as a ConfirmationSummary card before falling back to markdown
  const confirmData = beforeText ? parseConfirmationSummary(beforeText) : null

  return (
    <div>
      {confirmData ? (
        <div className="mb-3"><ConfirmationSummaryCard data={confirmData} /></div>
      ) : (
        beforeText && <InlineMarkdown text={beforeText} />
      )}
      <div className="my-3 max-w-sm rounded-lg border border-[rgb(var(--bd-default))] bg-[rgb(var(--bg-surface))] shadow-sm overflow-hidden">
        <div className="flex items-center gap-2 px-3 py-2 border-b border-[rgb(var(--bd-default))]">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="rgb(var(--fg-muted))" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={t('Type to search...')}
            className="flex-1 text-sm bg-transparent outline-none text-[rgb(var(--fg-default))] placeholder:text-[rgb(var(--fg-muted))]"
            autoFocus
          />
          <span className="text-[0.625rem] font-medium text-[rgb(var(--fg-muted))] bg-[rgb(var(--bg-subtle))] px-1.5 py-0.5 rounded-md flex-shrink-0 tabular-nums whitespace-nowrap">
            {filtered.length} {filtered.length === 1 ? t('result') : t('results')}
          </span>
        </div>
        <div className="max-h-48 overflow-y-auto">
          {filtered.length === 0 ? (
            <div className="px-3 py-3 text-sm text-[rgb(var(--fg-muted))] text-center">{t('No results found')}</div>
          ) : (
            filtered.map((item) => (
              <button
                key={item.id}
                onClick={() => onSelect(item)}
                className={cn(
                  'w-full text-left px-3 py-2 text-sm cursor-pointer transition-colors',
                  'text-[rgb(var(--fg-default))]',
                  'hover:bg-[rgb(var(--color-primary))]/10'
                )}
              >
                {item.num}. {item.name}
              </button>
            ))
          )}
        </div>
      </div>
      {afterText && !/reply with the number/i.test(afterText) && <InlineMarkdown text={afterText} />}
    </div>
  )
}

// ─── Synthia Bot Content Renderer ────────────────────────────────────────────

function renderSynthiaBotContent(message: MessageType, onSelectItem?: (item: SelectableItem) => void): ReactNode | null {
  const costingData = parseCostingSummary(message.content)
  if (costingData) return <CostingCard data={costingData} timestamp={message.timestamp} />

  const targetData = parseTargetPriceComparison(message.content)
  if (targetData) return <TargetPriceComparisonCard data={targetData} />

  const confirmData = parseConfirmationSummary(message.content)
  if (confirmData) return <ConfirmationSummaryCard data={confirmData} />

  const selectableData = parseSelectableLists(message.content)
  if (selectableData) {
    return (
      <DropdownSelector
        items={selectableData.items}
        beforeText={selectableData.beforeText}
        afterText={selectableData.afterText}
        onSelect={(item) => onSelectItem?.(item)}
      />
    )
  }

  // No special content — fall back to generic markdown
  return null
}

// ─── Synthia Empty State ─────────────────────────────────────────────────────

function SynthiaEmptyState({ onSelectItem }: { onSelectItem?: (item: SelectableItem) => void }) {
  const suggestions = [
    { icon: MessageSquare, label: 'Ask a printing question' },
    { icon: Calculator, label: 'Start a cost estimate' },
    { icon: ClipboardCheck, label: 'Get insights' },
  ]

  return (
    <div className="flex flex-col items-center justify-center h-full px-4 py-12">
      <div className="relative mb-6">
        <div className="w-16 h-16 rounded-full bg-gradient-to-br from-[rgb(var(--color-primary))]/15 to-[rgb(var(--color-primary))]/5 flex items-center justify-center">
          <SynthiaLogo size={36} />
        </div>
        <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-green-500 border-2 border-[rgb(var(--bg-app))]" />
      </div>
      <h3 className="text-lg font-semibold text-[rgb(var(--fg-default))] mb-1">
        Hi, I'm Synthia
      </h3>
      <p className="text-sm text-[rgb(var(--fg-muted))] text-center max-w-xs mb-8">
        Your AI assistant, built for the world of printing.
      </p>
      <div className="flex flex-wrap justify-center gap-2 max-w-sm">
        {suggestions.map((s) => (
          <button
            key={s.label}
            onClick={() => onSelectItem?.({ id: '', name: s.label, num: 0 })}
            className="flex items-center gap-2 px-3.5 py-2 rounded-full border border-[rgb(var(--bd-default))] bg-[rgb(var(--bg-surface))] text-sm text-[rgb(var(--fg-muted))] hover:text-[rgb(var(--fg-default))] hover:border-[rgb(var(--color-primary))]/40 hover:bg-[rgb(var(--color-primary))]/5 transition-all duration-200"
          >
            <s.icon className="w-3.5 h-3.5" />
            {s.label}
          </button>
        ))}
      </div>
    </div>
  )
}

// ─── Synthia Messages Component ──────────────────────────────────────────────

interface SynthiaMessagesProps {
  messages: MessageType[]
  isLoading?: boolean
  onExport?: () => void
  onShare?: () => void
  onSelectItem?: (item: SelectableItem) => void
  onEditMessage?: (messageId: string, newContent: string) => void
}

export function SynthiaMessages({ messages, isLoading, onExport, onShare, onSelectItem, onEditMessage }: SynthiaMessagesProps) {
  return (
    <Messages
      messages={messages}
      isLoading={isLoading}
      onExport={onExport}
      onShare={onShare}
      onSelectItem={onSelectItem}
      onEditMessage={onEditMessage}
      botAvatar={<SynthiaLogo size={18} />}
      emptyState={<SynthiaEmptyState onSelectItem={onSelectItem} />}
      renderBotContent={renderSynthiaBotContent}
    />
  )
}

// ─── Page Export ──────────────────────────────────────────────────────────────

export default function SynthiaPage() {
  const { data: session } = useSession()

  const handleBeforeEditMessage = useCallback(async (conversationId: number, messageId: string) => {
    if (!session) return
    await deleteMessagesAfterAPI(conversationId, messageId, session)
  }, [session])

  return (
    <div className="h-[calc(100vh-64px)] w-full">
      <Chat
        mode="fullpage"
        title="Synthia"
        sidebarTitle={<span className="flex items-center gap-2"><SynthiaLogo size={18} /> Synthia</span>}
        logo={<SynthiaLogo size={22} />}
        MessagesComponent={SynthiaMessages}
        fullpagePath="/synthia"
        onBeforeEditMessage={handleBeforeEditMessage}
      />
    </div>
  )
}
