"use client"
import { useState, useEffect, useRef, useCallback } from "react"
import type React from "react"
import { useParams, useRouter } from "next/navigation"
import { AppSidebar } from "@/components/app-sidebar"
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar"
import { AppHeader } from "@/components/app-header"
import { Button } from "@/components/ui/button"
import { MessageSquare, Send, Loader2, Mic, Check, Copy, Pencil, X, Calculator, Target } from "lucide-react"
import { ScrollableOptionsList, ActionButtonsRow } from "@/components/ui/scrollable-options-list"
import { getMessages, deleteMessagesAfter, Message } from "@/lib/chat-api"
import { clientLogger } from "@/lib/logger"
import { getCurrentUser } from "@/lib/permissions"
import { useToast } from "@/hooks/use-toast"
import { MobileBottomNav } from "@/components/mobile-bottom-nav"
import { cn } from "@/lib/utils"

// ─── Helper: clean option text ────────────────────────────────────────────────
function cleanOptionText(text: string): string {
  return text
    .replace(/\s*\([^)]*ID\s*:\s*\d+\)/gi, '')
    .replace(/\s*\(ID\s*:\s*\d+\)/gi, '')
    .trim()
}

// ─── Helper: render bold and links ────────────────────────────────────────────
function renderTextWithBoldAndLinks(text: string): React.ReactNode[] {
  const urlRegex = /(https?:\/\/[^\s]+)/g
  const parts = text.split(urlRegex)

  return parts.map((part, index) => {
    if (urlRegex.test(part)) {
      urlRegex.lastIndex = 0
      return (
        <a key={index} href={part} target="_blank" rel="noopener noreferrer"
          className="text-blue-500 underline hover:text-blue-700 break-all"
          onClick={(e) => e.stopPropagation()}>
          {part}
        </a>
      )
    }
    const boldParts = part.split(/(\*\*[^*]+\*\*)/g)
    return boldParts.map((boldPart, boldIndex) => {
      if (boldPart.startsWith('**') && boldPart.endsWith('**')) {
        return <strong key={`${index}-${boldIndex}`}>{boldPart.slice(2, -2)}</strong>
      }
      return <span key={`${index}-${boldIndex}`}>{boldPart}</span>
    })
  })
}

// ─── Helper: normalize content name for image lookup ──────────────────────────
function normalizeContentName(name: string): string {
  if (name.includes(' ')) return name
  return name.replace(/([a-z])([A-Z])/g, '$1 $2').replace(/([A-Z]+)([A-Z][a-z])/g, '$1 $2')
}

// ─── Helper: content image ────────────────────────────────────────────────────
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

// ─── Helper: extract content name from text ───────────────────────────────────
function extractContentName(text: string): string | null {
  const patterns = [
    /(?:content\s*type|content|job\s*type|product|carton\s*type|box\s*type)\s*[:\-]\s*(.+?)(?:\n|$)/i,
  ]
  for (const pattern of patterns) {
    const match = text.match(pattern)
    if (match && match[1]?.trim()) return match[1].trim()
  }
  return null
}

// ─── JSON Parsing Helpers (matching Synthia / ParkBuddy chatbot) ──────────────
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
    else if (cleanText[i] === '}') { depth--; if (depth === 0) { braceEnd = i; break } }
  }
  if (braceEnd === -1) return null
  const jsonStr = cleanText.substring(braceStart, braceEnd + 1)
  const afterJson = cleanText.substring(braceEnd + 1).trim()
  try {
    const data = JSON.parse(jsonStr)
    if (data.Type !== typeValue) return null
    return { data, afterJson }
  } catch { return null }
}

function cleanAfterJson(text: string): string {
  if (!text) return ''
  if (/COSTING SUMMARY|Cost Structure|Customer Details|Percentage Breakup|TARGET PRICE ANALYSIS/i.test(text)) return ''
  return text.trim()
}

// ─── Costing Summary Detection & Rendering ────────────────────────────────────
function isCostingSummary(text: string): boolean {
  return text.includes('COSTING SUMMARY') || text.includes('Customer & JOB DETAILS') || text.includes('COST STRUCTURE') || text.includes('"CostingBot"')
}

function formatCurrency(value?: number): string {
  if (typeof value !== 'number') return '-'
  return `₹ ${value.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
}

function renderCostingSummary(text: string): React.ReactNode | null {
  if (!isCostingSummary(text)) return null

  let customerName = '-', jobName = '-', sheetSize = '-', orderQuantity = '-'
  let noOfUps = '-', requiredSheets = '-'
  let boardCost = 0, otherMaterialCost = 0, conversionCost = 0, profit = 0, totalCost = 0, freightCost = 0
  let profitMarginPct: number | null = null
  let contentName: string | null = null
  let annualQuantity: number | null = null
  let kgsPer1000: number | null = null
  let pct: Record<string, number> = {}
  let kpis: { RMCPercent?: number | null; PSR?: number | null; PKR?: number | null } | null = null
  let detailedParticulars: Record<string, any> | null = null
  let targetPriceComparison: { OriginalCostPer1000?: number; TargetPricePer1000?: number; OriginalProfitPercent?: number; NewProfitPercent?: number; DifferencePer1000?: number } | null = null
  let nextStep: string | null = null
  let afterJson: string | null = null

  try {
    const result = extractJsonByType(text, 'CostingBot')
    if (result) {
      const jsonData = result.data
      if (jsonData.CustomerDetails) {
        customerName = jsonData.CustomerDetails.CustomerName || '-'
        jobName = jsonData.CustomerDetails.JobName || '-'
        sheetSize = jsonData.CustomerDetails.SheetSize || '-'
        orderQuantity = jsonData.CustomerDetails.OrderQuantity?.toLocaleString('en-IN') || '-'
        noOfUps = jsonData.CustomerDetails.Ups?.toString() || '-'
        requiredSheets = jsonData.CustomerDetails.RequiredSheets?.toLocaleString('en-IN') || '-'
      }
      if (jsonData.CostStructurePer1000) {
        boardCost = jsonData.CostStructurePer1000.BoardCost || 0
        otherMaterialCost = jsonData.CostStructurePer1000.OtherMaterialCost || 0
        conversionCost = jsonData.CostStructurePer1000.ConversionCost || 0
        profit = jsonData.CostStructurePer1000.Profit || 0
        freightCost = jsonData.CostStructurePer1000.FreightCost || 0
        totalCost = jsonData.CostStructurePer1000.TotalCostPer1000 || 0
      }
      if (jsonData.PercentageBreakup) pct = jsonData.PercentageBreakup
      if (jsonData.ProfitMarginPercent != null) profitMarginPct = jsonData.ProfitMarginPercent
      contentName = jsonData.ContentName || jsonData.CustomerDetails?.JobName || null
      if (jsonData.AnnualQuantity != null) annualQuantity = jsonData.AnnualQuantity
      if (jsonData.DetailedCostSummary?.KgsPer1000Cartons != null) kgsPer1000 = jsonData.DetailedCostSummary.KgsPer1000Cartons
      if (jsonData.DetailedCostSummary?.Particulars) detailedParticulars = jsonData.DetailedCostSummary.Particulars
      if (jsonData.KPIs) kpis = jsonData.KPIs
      if (jsonData.TargetPriceComparison) targetPriceComparison = jsonData.TargetPriceComparison
      if (jsonData.NextStep) nextStep = jsonData.NextStep
      const cleaned = cleanAfterJson(result.afterJson)
      if (cleaned) afterJson = cleaned
    }
  } catch (e) {
    const extractValue = (labelPattern: string): string => {
      const lines = text.split('\n')
      for (const line of lines) {
        const regex = new RegExp(labelPattern + '.+:\\s*(.+)', 'i')
        const match = line.match(regex)
        if (match && match[1]) return match[1].trim()
      }
      return '-'
    }
    customerName = extractValue('Customer Name')
    jobName = extractValue('Job Name')
    sheetSize = extractValue('Sheet Size')
    orderQuantity = extractValue('Order Quantity')
    noOfUps = extractValue('No\\.? of Ups')
    requiredSheets = extractValue('Required Sheets')
  }

  const profitLabel = profitMarginPct != null ? `Profit (Margin: ${profitMarginPct}%)` : 'Profit Margin'
  const hasDetailedBreakdown = detailedParticulars != null
  const hasTargetPrice = targetPriceComparison != null

  // Build detailed breakdown rows
  const detailedRows: { label: string; note?: string; amount?: number; percent: string; highlight?: 'green' | 'red' | 'primary' }[] = []
  if (hasDetailedBreakdown) {
    const p = detailedParticulars!
    const fobPrice = p.SellingPrice_FOB?.Rs_Per_1000_Cartons || 0
    const calcPct = (amount?: number) => {
      if (!amount || fobPrice <= 0) return '0.00'
      return ((amount / fobPrice) * 100).toFixed(2)
    }
    if (p.BoardCost?.Rs_Per_1000_Cartons != null) detailedRows.push({ label: 'Board Cost', amount: p.BoardCost.Rs_Per_1000_Cartons, percent: calcPct(p.BoardCost.Rs_Per_1000_Cartons) })
    if (p.MaterialCost?.Rs_Per_1000_Cartons != null) detailedRows.push({ label: 'Material Cost', amount: p.MaterialCost.Rs_Per_1000_Cartons, percent: calcPct(p.MaterialCost.Rs_Per_1000_Cartons) })
    if (p.ToolCost?.Rs_Per_1000_Cartons != null) detailedRows.push({ label: 'Tool Cost', note: 'Tool + Plate', amount: p.ToolCost.Rs_Per_1000_Cartons, percent: calcPct(p.ToolCost.Rs_Per_1000_Cartons) })
    if (p.CorrugationCost?.Rs_Per_1000_Cartons != null) detailedRows.push({ label: 'Corrugation Cost', amount: p.CorrugationCost.Rs_Per_1000_Cartons, percent: calcPct(p.CorrugationCost.Rs_Per_1000_Cartons) })
    if (p.WastageCost?.Rs_Per_1000_Cartons != null) detailedRows.push({ label: 'Wastage Cost', note: 'Paper + Material + Corrugation', amount: p.WastageCost.Rs_Per_1000_Cartons, percent: calcPct(p.WastageCost.Rs_Per_1000_Cartons) })
    if (p.ConversionCost?.Rs_Per_1000_Cartons != null) detailedRows.push({ label: 'Conversion Cost', note: 'Machine + Credit + Labour + Overheads', amount: p.ConversionCost.Rs_Per_1000_Cartons, percent: calcPct(p.ConversionCost.Rs_Per_1000_Cartons) })
    if (p.ExWorksCost?.Rs_Per_1000_Cartons != null) detailedRows.push({ label: 'Ex-works Cost', amount: p.ExWorksCost.Rs_Per_1000_Cartons, percent: calcPct(p.ExWorksCost.Rs_Per_1000_Cartons), highlight: 'primary' })
    if (p.Profit?.Rs_Per_1000_Cartons != null) {
      const profitPct = p.Profit.Percent || 0
      detailedRows.push({ label: `Add: Profit (${profitPct}%)`, amount: p.Profit.Rs_Per_1000_Cartons, percent: calcPct(p.Profit.Rs_Per_1000_Cartons), highlight: profitPct >= 0 ? 'green' : 'red' })
    }
    if (p.Freight?.Rs_Per_1000_Cartons != null) detailedRows.push({ label: 'Add: Freight', amount: p.Freight.Rs_Per_1000_Cartons, percent: calcPct(p.Freight.Rs_Per_1000_Cartons) })
    if (p.SellingPrice_FOB?.Rs_Per_1000_Cartons != null) detailedRows.push({ label: 'FOB / Selling Price', amount: p.SellingPrice_FOB.Rs_Per_1000_Cartons, percent: '100.00', highlight: 'primary' })
  }

  const highlightBg: Record<string, string> = { green: 'bg-green-500/10', red: 'bg-red-500/10', primary: 'bg-[#005180]/10' }
  const highlightText: Record<string, string> = { green: 'text-green-600', red: 'text-red-600', primary: 'text-[#005180]' }

  return (
    <div className="bg-white rounded-xl md:rounded-2xl overflow-hidden border border-gray-200 shadow-lg max-w-full">
      {/* Header */}
      <div className="bg-gradient-to-r from-[#005180]/20 to-[#78BE20]/10 px-4 md:px-5 py-3 md:py-4 border-b border-gray-200">
        <div className="flex items-center gap-3">
          {contentName && <ContentImage name={contentName} className="w-12 h-12 md:w-16 md:h-16" />}
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between mb-1 gap-2">
              <h3 className="text-sm md:text-base font-semibold text-gray-900 flex items-center gap-2">
                <Calculator className="w-4 h-4 text-[#005180] flex-shrink-0" />
                <span className="truncate">Costing Summary</span>
              </h3>
              <div className="px-2 md:px-2.5 py-0.5 md:py-1 bg-green-500/20 border border-green-500/30 rounded text-[0.65rem] md:text-xs font-semibold text-green-700 uppercase tracking-wide flex-shrink-0">
                Best Plan
              </div>
            </div>
            <div className="text-xs text-gray-600 truncate">Job Name: {jobName !== '-' ? jobName : 'Print Job Estimation'}</div>
          </div>
        </div>
      </div>

      {/* Customer Details Grid */}
      <div className="px-4 md:px-5 py-3 md:py-4">
        <div className="grid grid-cols-2 gap-2 md:gap-3 mb-3 md:mb-4">
          <div className="bg-gray-50 border border-gray-200 rounded-lg px-2.5 md:px-3 py-2 md:py-2.5">
            <div className="text-[0.6rem] md:text-[0.65rem] font-medium text-gray-500 uppercase tracking-wide mb-0.5 md:mb-1">Customer</div>
            <div className="text-xs md:text-sm font-semibold text-gray-900 truncate">{customerName}</div>
          </div>
          <div className="bg-gray-50 border border-gray-200 rounded-lg px-2.5 md:px-3 py-2 md:py-2.5">
            <div className="text-[0.6rem] md:text-[0.65rem] font-medium text-gray-500 uppercase tracking-wide mb-0.5 md:mb-1">
              Order Qty{annualQuantity != null && annualQuantity > 0 ? ' / Annual Qty' : ''}
            </div>
            <div className="text-xs md:text-sm font-semibold text-gray-900">
              {orderQuantity}
              {annualQuantity != null && annualQuantity > 0 && (
                <span className="text-gray-500"> / {annualQuantity.toLocaleString('en-IN')}</span>
              )}
            </div>
          </div>
          <div className="bg-gray-50 border border-gray-200 rounded-lg px-2.5 md:px-3 py-2 md:py-2.5">
            <div className="text-[0.6rem] md:text-[0.65rem] font-medium text-gray-500 uppercase tracking-wide mb-0.5 md:mb-1">
              Sheet Size{kgsPer1000 != null ? ' / Wt. per 1000' : ''}
            </div>
            <div className="text-xs md:text-sm font-semibold text-[#005180] truncate">
              {sheetSize}
              {kgsPer1000 != null && (
                <span className="text-gray-500"> / {kgsPer1000.toLocaleString('en-IN')} kg</span>
              )}
            </div>
          </div>
          <div className="bg-gray-50 border border-gray-200 rounded-lg px-2.5 md:px-3 py-2 md:py-2.5">
            <div className="text-[0.6rem] md:text-[0.65rem] font-medium text-gray-500 uppercase tracking-wide mb-0.5 md:mb-1">Ups / Sheets</div>
            <div className="text-xs md:text-sm font-semibold text-gray-900 truncate">{noOfUps} / {requiredSheets}</div>
          </div>
        </div>

        {/* KPI Cards - RMC%, PSR, PKR */}
        {kpis && (kpis.RMCPercent != null || kpis.PSR != null || kpis.PKR != null) && (
          <>
            <div className="h-px bg-gradient-to-r from-transparent via-gray-300 to-transparent my-3 md:my-4" />
            <div className="text-[0.65rem] md:text-[0.7rem] font-semibold text-gray-600 uppercase tracking-widest mb-2 md:mb-3 pl-2 md:pl-2.5 border-l-2 border-[#005180]">
              Key Performance Indicators
            </div>
            <div className="grid grid-cols-3 gap-2 md:gap-2.5 mb-3 md:mb-4">
              {kpis.RMCPercent != null && (
                <div className="bg-gray-50 border border-gray-200 rounded-lg px-2 md:px-3 py-2 md:py-2.5 text-center">
                  <div className="text-[0.55rem] md:text-[0.6rem] font-medium text-gray-500 uppercase tracking-wide mb-0.5 md:mb-1">RMC%</div>
                  <div className="text-base md:text-lg font-semibold text-gray-900 tabular-nums">{kpis.RMCPercent.toFixed(1)}%</div>
                  <div className="text-[0.55rem] md:text-[0.6rem] text-gray-500 mt-0.5">
                    {kpis.RMCPercent >= 60 ? 'High' : kpis.RMCPercent >= 40 ? 'Moderate' : 'Healthy'}
                  </div>
                </div>
              )}
              {kpis.PSR != null && (
                <div className="bg-gray-50 border border-gray-200 rounded-lg px-2 md:px-3 py-2 md:py-2.5 text-center">
                  <div className="text-[0.55rem] md:text-[0.6rem] font-medium text-gray-500 uppercase tracking-wide mb-0.5 md:mb-1">PSR</div>
                  <div className="text-base md:text-lg font-semibold text-gray-900 tabular-nums">{formatCurrency(kpis.PSR)}</div>
                  <div className="text-[0.55rem] md:text-[0.6rem] text-gray-500 mt-0.5">Per Sheet</div>
                </div>
              )}
              {kpis.PKR != null && (
                <div className="bg-gray-50 border border-gray-200 rounded-lg px-2 md:px-3 py-2 md:py-2.5 text-center">
                  <div className="text-[0.55rem] md:text-[0.6rem] font-medium text-gray-500 uppercase tracking-wide mb-0.5 md:mb-1">PKR</div>
                  <div className="text-base md:text-lg font-semibold text-gray-900 tabular-nums">{formatCurrency(kpis.PKR)}</div>
                  <div className="text-[0.55rem] md:text-[0.6rem] text-gray-500 mt-0.5">Per Kg</div>
                </div>
              )}
            </div>
          </>
        )}

        {/* Detailed Cost Breakdown Table */}
        {hasDetailedBreakdown && detailedRows.length > 0 && (
          <>
            <div className="h-px bg-gradient-to-r from-transparent via-gray-300 to-transparent my-3 md:my-4" />
            <div className="text-[0.65rem] md:text-[0.7rem] font-semibold text-gray-600 uppercase tracking-widest mb-2 md:mb-3 pl-2 md:pl-2.5 border-l-2 border-[#005180]">
              Cost Breakdown
            </div>
            <div className="rounded-lg border border-gray-200 overflow-hidden">
              <div className="grid grid-cols-[1fr_auto_auto] px-2 md:px-3 py-1.5 md:py-2.5 bg-gray-50 border-b border-gray-200 text-[0.6rem] md:text-xs font-bold text-gray-700 uppercase tracking-wide">
                <span className="truncate">Particulars</span>
                <span className="text-right whitespace-nowrap pl-2">Amount</span>
                <span className="text-right whitespace-nowrap pl-2">%</span>
              </div>
              {detailedRows.map((row, idx) => (
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
        )}

        {/* Simple Cost Breakdown (fallback when no detailed breakdown) */}
        {!hasDetailedBreakdown && (
          <>
            <div className="h-px bg-gradient-to-r from-transparent via-gray-300 to-transparent my-3 md:my-4" />
            <div className="text-[0.65rem] md:text-[0.7rem] font-semibold text-gray-600 uppercase tracking-widest mb-2 md:mb-3 pl-2 md:pl-2.5 border-l-2 border-[#005180]">
              Cost Breakdown (Per 1,000 Units)
            </div>
            <div>
              {[
                { label: 'Board Cost', value: boardCost, percentage: pct.BoardCost },
                { label: 'Other Material Cost', value: otherMaterialCost, percentage: pct.OtherMaterialCost },
                { label: 'Conversion Cost', value: conversionCost, percentage: pct.ConversionCost },
                { label: profitLabel, value: profit, percentage: pct.Profit, isProfit: true },
                { label: 'Freight Cost', value: freightCost, percentage: pct.FreightCost },
              ].map((row) => {
                const isLoss = row.isProfit && profit < 0
                const profitColorClass = row.isProfit ? (isLoss ? 'text-red-600' : 'text-green-600') : ''
                return (
                  <div key={row.label} className="grid grid-cols-[1fr_auto] items-baseline py-2.5 border-b border-gray-200 last:border-b-0">
                    <span className={cn('truncate text-sm', row.isProfit ? profitColorClass : 'text-gray-600')}>{row.label}</span>
                    <span className={cn('text-right whitespace-nowrap pl-2 text-sm font-semibold tabular-nums', row.isProfit ? profitColorClass : 'text-gray-900')}>
                      {formatCurrency(row.value)}
                      {row.percentage != null && (
                        <span className={cn('text-xs ml-2 opacity-60', row.isProfit ? profitColorClass : 'text-gray-500')}>{row.percentage}%</span>
                      )}
                    </span>
                  </div>
                )
              })}
            </div>
          </>
        )}
      </div>

      {/* Total Bar - only show for simple breakdown */}
      {!hasDetailedBreakdown && (
        <div className="bg-gradient-to-r from-green-900/50 to-green-950/50 px-4 md:px-5 py-3 md:py-4 flex items-center justify-between border-t border-green-500/30 gap-2">
          <div className="text-[0.7rem] md:text-[0.8rem] font-semibold text-green-300 uppercase tracking-wide">Total Cost / 1,000</div>
          <div className="text-xl md:text-2xl font-bold text-green-400 tabular-nums">{formatCurrency(totalCost)}</div>
        </div>
      )}

      {/* Target Price Comparison */}
      {hasTargetPrice && (() => {
        const tp = targetPriceComparison!
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
                  isPos ? 'bg-green-500/5 border-green-500/30' : 'bg-red-500/5 border-red-500/30'
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
                  <span className={cn('text-sm font-bold tabular-nums', isProfitPos ? 'text-green-600' : 'text-red-600')}>
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
        <div className="truncate">Status: <span className="text-gray-700 font-medium">{hasTargetPrice ? 'Target Price Applied' : 'Estimated'}</span></div>
      </div>

      {nextStep && (
        <div className="px-4 md:px-5 py-3 md:py-3.5 border-t border-gray-200/50 text-sm text-gray-600 text-center leading-relaxed">
          {nextStep}
        </div>
      )}

      {afterJson && !(nextStep && afterJson.includes(nextStep)) && (
        <div className="px-4 md:px-5 py-3 md:py-3.5 bg-gray-50/80 border-t border-gray-200/50 text-xs md:text-sm text-gray-600 text-center leading-relaxed"
          dangerouslySetInnerHTML={{
            __html: afterJson
              .replace(/\*\*([^*]+)\*\*/g, '<strong class="text-gray-900 font-semibold">$1</strong>')
              .replace(/\n/g, '<br />')
          }}
        />
      )}
    </div>
  )
}

// ─── Parse numbered options ───────────────────────────────────────────────────
function parseOptions(text: string): { cleanText: string; options: string[] } {
  const optionRegex = /^\s*(\d+)[\.\)]\s*(.+)$/gm
  const matches = [...text.matchAll(optionRegex)]

  if (matches.length >= 2) {
    const options = matches.map(match => cleanOptionText(match[2].trim()))

    // Exclude lists of input field prompts (form fields the user needs to type values for)
    const inputFieldPatterns = /\(mm\)|\(cm\)|\(inch\)|\(gsm\)|\(kg\)|\(grams?\)|\(Yes\/No\)|\(Rs\)|\(INR\)|quantity|length|width|height|depth|weight|thickness|diameter/i
    const fieldMatchCount = options.filter(o => inputFieldPatterns.test(o)).length
    if (fieldMatchCount >= 2) return { cleanText: text, options: [] }

    // Exclude if text before options asks for details to fill
    const firstMatchIndex = text.indexOf(matches[0][0])
    const textBeforeOptions = text.substring(0, firstMatchIndex).trim()
    if (/need these details|provide .* details|enter .* details|following details|fill .* following|required details|input .* values/i.test(textBeforeOptions)) {
      return { cleanText: text, options: [] }
    }

    const uniqueOptions = [...new Set(options)]
    return { cleanText: textBeforeOptions, options: uniqueOptions }
  }
  return { cleanText: text, options: [] }
}

// ─── Extended message type ────────────────────────────────────────────────────
interface ExtendedMessage extends Message {
  options?: string[]
  allowMultiSelect?: boolean
}

// ─── Main Component ───────────────────────────────────────────────────────────
export default function ConversationPage() {
  const params = useParams()
  const router = useRouter()
  const { toast } = useToast()
  const conversationId = params.id as string

  const [messages, setMessages] = useState<ExtendedMessage[]>([])
  const [loading, setLoading] = useState(true)
  const [currentUser, setCurrentUser] = useState<any>(null)
  const [inputMessage, setInputMessage] = useState('')
  const [isSending, setIsSending] = useState(false)
  const [selectedOptions, setSelectedOptions] = useState<Record<number, string[]>>({})
  const [copiedId, setCopiedId] = useState<number | null>(null)
  const [isListening, setIsListening] = useState(false)
  const [editingId, setEditingId] = useState<number | null>(null)
  const [editText, setEditText] = useState("")
  const [toggleMenu, setToggleMenu] = useState<(() => void) | null>(null)

  const messagesEndRef = useRef<HTMLDivElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const recognitionRef = useRef<any>(null)

  const handleMenuToggle = useCallback((toggle: () => void) => {
    setToggleMenu(() => toggle)
  }, [])

  const handleMenuClick = () => {
    if (toggleMenu) toggleMenu()
  }

  // Auto-resize textarea
  const autoResizeTextarea = () => {
    const el = textareaRef.current
    if (!el) return
    el.style.height = 'auto'
    el.style.height = Math.min(el.scrollHeight, 150) + 'px'
  }

  // Get current user
  useEffect(() => {
    setCurrentUser(getCurrentUser())
  }, [])

  // Initialize speech recognition
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
      if (SpeechRecognition) {
        const recognition = new SpeechRecognition()
        recognition.continuous = false
        recognition.interimResults = false
        recognition.lang = 'en-US'
        recognition.onresult = (event: any) => {
          setInputMessage((prev) => prev + (prev ? ' ' : '') + event.results[0][0].transcript)
          setIsListening(false)
        }
        recognition.onerror = () => setIsListening(false)
        recognition.onend = () => setIsListening(false)
        recognitionRef.current = recognition
      }
    }
  }, [])

  // Process message for options
  const processMessageForOptions = (message: Message): ExtendedMessage => {
    if (message.role !== 'assistant') return message

    let content = (message.content || '').replace(/\\n/g, '\n')
    const shouldShowButtons = /select|which\s+(plant|customer|category)|Categories:|available\s+\w+.*:|choose\s+(one|from)/i.test(content) || /^\s*\d+\.\s+\d+\s*$/m.test(content)
    const isYesNoConfirmation = /Reply with:\s*\n?\s*YES\s+[–-]\s+Save/i.test(content) || /YES\s+[–-]\s+Save.*NO\s+[–-]\s+Discard/i.test(content)
    const isMultiSelect = /select\s+processes/i.test(content)

    let { cleanText, options } = parseOptions(content)
    const hasNumberedOptions = options.length >= 2

    if (isYesNoConfirmation) {
      cleanText = content.replace(/Reply with:[\s\S]*$/i, '').trim()
      options = ['YES', 'NO']
    }

    const isJobSpecSummary = /Job Specification Summary/i.test(content) && (/Confirm.*Generate.*Costing/i.test(content) || /Modify.*Details/i.test(content))
    if (isJobSpecSummary) {
      cleanText = content.replace(/-{5,}[\s\S]*$/g, '').trim()
      cleanText = cleanText.replace(/\d+\.\s*[✅❌✏️✓✎]?\s*[✅❌✏️✓✎]?\s*(Confirm.*|Modify.*)$/gim, '').trim()
      cleanText = cleanText.replace(/Please review.*details\.?\s*/gi, '').trim()
      cleanText = cleanText.replace(/What would you like to do\?/i, '').trim()
      cleanText = cleanText.replace(/^[📋📝📄]\s*/g, '').trim()
      options = ['CONFIRM', 'MODIFY']
    }

    const showOptionsButtons = (shouldShowButtons && options.length > 0) || hasNumberedOptions || isYesNoConfirmation || isJobSpecSummary

    return {
      ...message,
      content: showOptionsButtons ? cleanText : content,
      options: showOptionsButtons ? options : undefined,
      allowMultiSelect: isMultiSelect
    }
  }

  // Fetch messages
  useEffect(() => {
    const fetchMessages = async () => {
      if (!currentUser) return
      setLoading(true)
      try {
        const userId = currentUser?.userId || '2'
        const companyId = currentUser?.companyId || '2'
        const result = await getMessages(Number(conversationId), String(userId), String(companyId))
        if (result.success && result.data) {
          setMessages(result.data.map(processMessageForOptions))
        } else {
          setMessages([])
        }
      } catch (error) {
        clientLogger.error('Error fetching messages:', error)
        setMessages([])
      } finally {
        setLoading(false)
      }
    }
    fetchMessages()
  }, [conversationId, currentUser])

  // Auto-scroll
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  // Copy handler
  const handleCopy = (text: string, messageId: number) => {
    navigator.clipboard.writeText(text).then(() => {
      setCopiedId(messageId)
      setTimeout(() => setCopiedId(null), 2000)
    })
  }

  // Edit handlers
  const handleStartEdit = (msg: ExtendedMessage) => {
    setEditingId(msg.messageId)
    setEditText(msg.content)
  }

  const handleCancelEdit = () => {
    setEditingId(null)
    setEditText("")
  }

  const handleSaveEdit = async (messageId: number) => {
    if (!editText.trim()) return
    const idx = messages.findIndex(m => m.messageId === messageId)
    if (idx === -1) return

    // Delete messages on the backend so AI context is clean
    if (Number(conversationId) > 0) {
      try {
        await deleteMessagesAfter(Number(conversationId), messageId)
      } catch (err) {
        console.error('Failed to delete backend messages for edit:', err)
      }
    }

    setMessages(prev => prev.slice(0, idx))
    setEditingId(null)
    setEditText("")
    handleSendMessageWithText(editText.trim())
  }

  // Send message
  const handleSendMessage = async () => {
    const text = inputMessage.trim()
    if (!text || isSending) return
    await handleSendMessageWithText(text)
  }

  const handleSendMessageWithText = async (text: string) => {
    if (!text.trim() || isSending) return
    setIsSending(true)

    const userMessage: ExtendedMessage = {
      messageId: Date.now(),
      conversationId: Number(conversationId),
      role: 'user',
      content: text,
      timestamp: new Date().toISOString()
    }
    setMessages(prev => [...prev, userMessage])
    setInputMessage('')
    if (textareaRef.current) textareaRef.current.style.height = 'auto'

    const thinkingMessage: ExtendedMessage = {
      messageId: Date.now() + 1,
      conversationId: Number(conversationId),
      role: 'assistant',
      content: 'Thinking...',
      timestamp: new Date().toISOString()
    }
    setMessages(prev => [...prev, thinkingMessage])

    try {
      const userId = currentUser?.userId || '2'
      const companyId = currentUser?.companyId || '2'

      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: text,
          newChat: false,
          conversationId: Number(conversationId),
          phone: '9999999999',
          userId,
          companyId
        })
      })

      let replyText = (await response.text()).replace(/\\n/g, '\n')
      const processed = processMessageForOptions({
        messageId: Date.now() + 2,
        conversationId: Number(conversationId),
        role: 'assistant',
        content: replyText,
        timestamp: new Date().toISOString()
      })

      setMessages(prev => {
        const withoutThinking = prev.filter(m => m.content !== 'Thinking...')
        return [...withoutThinking, processed]
      })
    } catch (error) {
      clientLogger.error('Error sending message:', error)
      setMessages(prev => prev.filter(m => m.content !== 'Thinking...'))
    } finally {
      setIsSending(false)
    }
  }

  // Option handlers
  const handleOptionSelect = (option: string, messageId: string | number, isMultiSelect: boolean) => {
    const numericId = typeof messageId === 'string' ? Number(messageId) : messageId
    if (isMultiSelect) {
      setSelectedOptions(prev => {
        const current = prev[numericId] || []
        return { ...prev, [numericId]: current.includes(option) ? current.filter(o => o !== option) : [...current, option] }
      })
    } else if (option === 'CONFIRM') {
      handleSendMessageWithText('Confirm & Generate Costing')
    } else if (option === 'MODIFY') {
      setInputMessage('Modify: ')
      setTimeout(() => textareaRef.current?.focus(), 100)
    } else {
      handleSendMessageWithText(option)
    }
  }

  const handleMultiSelectSubmit = (messageId: string | number) => {
    const numericId = typeof messageId === 'string' ? Number(messageId) : messageId
    const selections = selectedOptions[numericId] || []
    if (selections.length > 0) {
      handleSendMessageWithText(selections.join(', '))
      setSelectedOptions(prev => { const s = { ...prev }; delete s[numericId]; return s })
    }
  }

  // Voice input
  const handleMicClick = () => {
    if (!recognitionRef.current) {
      toast({ title: "Not supported", description: "Voice input is not supported in your browser.", variant: "destructive" })
      return
    }
    if (isListening) {
      recognitionRef.current.stop()
      setIsListening(false)
    } else {
      try { recognitionRef.current.start(); setIsListening(true) }
      catch { toast({ title: "Error", description: "Could not start voice input.", variant: "destructive" }) }
    }
  }

  // Render a single message
  const renderMessage = (message: ExtendedMessage) => {
    const isCosting = isCostingSummary(message.content)
    const detectedContent = extractContentName(message.content)

    if (message.role === 'user') {
      // Editing mode
      if (editingId === message.messageId) {
        return (
          <div key={message.messageId} className="flex justify-end mb-4">
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
                  <button onClick={() => handleSaveEdit(message.messageId)} className="p-1.5 rounded-full bg-[#005180] hover:bg-[#004570] transition-colors">
                    <Send className="w-4 h-4 text-white" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        )
      }

      return (
        <div key={message.messageId} className="flex justify-end mb-4 group">
          <div className="flex items-end gap-1.5">
            <div className="flex items-center gap-0.5">
              <button onClick={() => handleCopy(message.content, message.messageId)}
                className="opacity-50 md:opacity-0 md:group-hover:opacity-100 p-1.5 rounded-full hover:bg-gray-100 active:bg-gray-200 transition-all">
                {copiedId === message.messageId ? <Check className="w-3.5 h-3.5 text-green-500" /> : <Copy className="w-3.5 h-3.5 text-gray-400" />}
              </button>
              <button onClick={() => handleStartEdit(message)}
                className="opacity-50 md:opacity-0 md:group-hover:opacity-100 p-1.5 rounded-full hover:bg-gray-100 active:bg-gray-200 transition-all">
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

    // AI message
    const copyButton = (
      <button onClick={() => handleCopy(message.content, message.messageId)}
        className="opacity-50 md:opacity-0 md:group-hover:opacity-100 p-1.5 rounded-full hover:bg-gray-200 active:bg-gray-200 transition-all self-end">
        {copiedId === message.messageId ? <Check className="w-3.5 h-3.5 text-green-500" /> : <Copy className="w-3.5 h-3.5 text-gray-400" />}
      </button>
    )

    // Thinking indicator
    if (message.content === 'Thinking...') {
      return (
        <div key={message.messageId} className="flex mb-4">
          <div className="bg-gray-100 rounded-2xl rounded-tl-sm px-4 py-2.5 shadow-sm">
            <Loader2 className="w-5 h-5 md:w-4 md:h-4 animate-spin text-gray-600" />
          </div>
        </div>
      )
    }

    // Costing card
    if (isCosting) {
      return (
        <div key={message.messageId}>
          <div className="flex mb-4 group">
            <div className="w-full md:max-w-[90%] lg:max-w-[85%]">
              {renderCostingSummary(message.content)}
            </div>
            {copyButton}
          </div>
          {message.options && message.options.length > 0 && renderOptionsButtons(message)}
        </div>
      )
    }

    // Default AI message
    return (
      <div key={message.messageId}>
        <div className="flex mb-4 group">
          <div className="max-w-[85%] md:max-w-[80%]">
            <div className="bg-gray-100 rounded-2xl rounded-tl-sm px-4 py-3 md:py-2.5 shadow-md">
              {detectedContent && (
                <div className="mb-2">
                  <ContentImage name={detectedContent} className="w-28 h-28 md:w-32 md:h-32" />
                </div>
              )}
              <div className="text-base md:text-sm text-gray-900 whitespace-pre-wrap leading-relaxed">
                {renderTextWithBoldAndLinks(message.content)}
              </div>
            </div>
          </div>
          {copyButton}
        </div>
        {message.options && message.options.length > 0 && renderOptionsButtons(message)}
      </div>
    )
  }

  // Render option buttons for a message
  const renderOptionsButtons = (message: ExtendedMessage) => {
    if (!message.options || message.options.length === 0) return null

    const isYesNo = message.options.length === 2 && message.options.includes('YES') && message.options.includes('NO')
    const isConfirmModify = message.options.length === 2 && message.options.includes('CONFIRM') && message.options.includes('MODIFY')

    if (isYesNo || isConfirmModify) {
      return (
        <ActionButtonsRow
          options={message.options}
          messageId={String(message.messageId)}
          onOptionSelect={handleOptionSelect}
          isTyping={isSending}
        />
      )
    }

    return (
      <ScrollableOptionsList
        options={message.options}
        messageId={String(message.messageId)}
        isMultiSelect={message.allowMultiSelect || false}
        selectedOptions={selectedOptions[message.messageId] || []}
        onOptionSelect={handleOptionSelect}
        onMultiSelectSubmit={handleMultiSelectSubmit}
        isTyping={isSending}
        maxVisibleItems={5}
      />
    )
  }

  return (
    <SidebarProvider>
      <div className="hidden lg:block">
        <AppSidebar />
      </div>
      <SidebarInset>
        <AppHeader
          pageName={`Conversation`}
          showBackButton={true}
          onBackClick={() => router.push('/chats')}
          onMenuClick={handleMenuClick}
        />

        {/* Main chat area - same as ParkBuddy */}
        <div className="h-[calc(100dvh-3.5rem)] md:h-[calc(100dvh-4rem)] overflow-hidden">
          <div className="flex flex-col h-full w-full overflow-hidden">
            {/* Messages Area */}
            <div
              className="flex-1 min-h-0 overflow-y-auto overflow-x-hidden px-3 md:px-4 py-4 md:py-6 pb-[130px] md:pb-[100px]"
              style={{ WebkitOverflowScrolling: 'touch' }}
            >
              {loading ? (
                <div className="flex items-center justify-center h-full text-gray-500">
                  <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#005180] mx-auto mb-4"></div>
                    <p>Loading messages...</p>
                  </div>
                </div>
              ) : messages.length === 0 ? (
                <div className="flex items-center justify-center h-full text-gray-500">
                  <div className="text-center">
                    <MessageSquare className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                    <p>No messages yet</p>
                  </div>
                </div>
              ) : (
                <div className="max-w-4xl mx-auto">
                  {messages.map(renderMessage)}
                  <div ref={messagesEndRef} />
                </div>
              )}
            </div>

            {/* Input Area - Fixed above bottom nav */}
            <div className="fixed bottom-14 md:bottom-0 left-0 right-0 lg:left-64 border-t border-gray-200 bg-white px-3 md:px-4 py-2 md:py-3 z-20 shadow-[0_-2px_10px_rgba(0,0,0,0.08)]">
              <div className="max-w-4xl mx-auto">
                <div className="flex gap-2 items-end">
                  <Button
                    onClick={handleMicClick}
                    disabled={isSending}
                    size="icon"
                    className={cn(
                      "h-11 w-11 rounded-full flex-shrink-0 active:scale-95 transition-all shadow-md self-end",
                      isListening
                        ? "bg-red-500 hover:bg-red-600 animate-pulse"
                        : "bg-gray-100 hover:bg-gray-200 text-[#005180]"
                    )}
                  >
                    <Mic className={cn("h-5 w-5", isListening && "text-white")} />
                  </Button>
                  <div className="flex-1 relative">
                    <textarea
                      ref={textareaRef}
                      value={inputMessage}
                      onChange={(e) => { setInputMessage(e.target.value); autoResizeTextarea() }}
                      onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSendMessage() } }}
                      placeholder={isListening ? "Listening..." : "Ask ParkBuddy anything..."}
                      className="w-full min-h-[44px] max-h-[150px] resize-none rounded-2xl border-2 border-gray-300 focus:border-[#005180] focus:ring-2 focus:ring-[#005180] focus:outline-none px-3 pr-3 text-base md:text-sm py-2.5 md:py-2 bg-white"
                      disabled={isSending || isListening}
                      rows={1}
                    />
                  </div>
                  <Button
                    onClick={handleSendMessage}
                    disabled={!inputMessage.trim() || isSending || isListening}
                    size="icon"
                    className="h-11 w-11 rounded-full bg-[#005180] hover:bg-[#004570] disabled:opacity-50 flex-shrink-0 active:scale-95 transition-transform shadow-md self-end"
                  >
                    {isSending ? <Loader2 className="h-5 w-5 animate-spin" /> : <Send className="h-5 w-5" />}
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <MobileBottomNav onMenuToggle={handleMenuToggle} />
      </SidebarInset>
    </SidebarProvider>
  )
}
