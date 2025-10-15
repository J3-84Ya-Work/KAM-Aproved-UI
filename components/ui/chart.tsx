'use client'

import * as React from 'react'
import * as RechartsPrimitive from 'recharts'

import { cn } from '@/lib/utils'

// Format: { THEME_NAME: CSS_SELECTOR }
const THEMES = { light: '', dark: '.dark' } as const

export type ChartConfig = {
  [k in string]: {
    label?: React.ReactNode
    icon?: React.ComponentType
  } & (
    | { color?: string; theme?: never }
    | { color?: never; theme: Record<keyof typeof THEMES, string> }
  )
}

type ChartContextProps = {
  config: ChartConfig
}

const ChartContext = React.createContext<ChartContextProps | null>(null)

function useChart() {
  const context = React.useContext(ChartContext)

  if (!context) {
    throw new Error('useChart must be used within a <ChartContainer />')
  }

  return context
}

function ChartContainer({
  id,
  className,
  children,
  config,
  ...props
}: React.ComponentProps<'div'> & {
  config: ChartConfig
  children: React.ComponentProps<
    typeof RechartsPrimitive.ResponsiveContainer
  >['children']
}) {
  const uniqueId = React.useId()
  const chartId = `chart-${id || uniqueId.replace(/:/g, '')}`

  return (
    <ChartContext.Provider value={{ config }}>
      <div
        data-slot="chart"
        data-chart={chartId}
        className={cn(
          "flex justify-center [&_.recharts-layer]:outline-hidden [&_.recharts-sector]:outline-hidden",
          "[&_.recharts-cartesian-axis-tick_text]:fill-muted-foreground [&_.recharts-cartesian-grid_line[stroke='#ccc']]:stroke-border/50",
          "[&_.recharts-radial-bar-background-sector]:fill-muted [&_.recharts-dot[stroke='#fff']]:stroke-transparent [&_.recharts-layer]:outline-hidden",
          "aspect-video text-xs max-w-full max-h-[200px] overflow-hidden sm:[&_.recharts-sector]:outline-hidden border",
          className,
        )}
        {...props}
      >
        <ChartStyle id={chartId} config={config} />
        <RechartsPrimitive.ResponsiveContainer>
          {children}
        </RechartsPrimitive.ResponsiveContainer>
      </div>
    </ChartContext.Provider>
  )
}

const ChartStyle = ({ id, config }: { id: string; config: ChartConfig }) => {
  const colorConfig = Object.entries(config).filter(
    ([, config]) => config.theme || config.color,
  )

  if (!colorConfig.length) {
    return null
  }

  return (
    <style
      dangerouslySetInnerHTML={{
        __html: Object.entries(THEMES)
          .map(
            ([theme, prefix]) => `
${prefix} [data-chart=${id}] {
${colorConfig
  .map(([key, itemConfig]) => {
    const color =
      itemConfig.theme?.[theme as keyof typeof itemConfig.theme] ||
      itemConfig.color
    return color ? `  --color-${key}: ${color};` : null
  })
  .join('\n')}
}
`,
          )
          .join('\n'),
      }}
    />
  )
}

const ChartTooltip = RechartsPrimitive.Tooltip

type TooltipPayload = {
  name?: string
  value?: number | string
  dataKey?: string
  color?: string
}

type ChartTooltipContentProps = Omit<React.ComponentProps<
  typeof RechartsPrimitive.Tooltip
>, 'content'> &
  React.ComponentProps<'div'> & {
    active?: boolean
    hideLabel?: boolean
    hideIndicator?: boolean
    indicator?: 'line' | 'dot' | 'dashed'
    nameKey?: string
    labelKey?: string
    label?: string
    payload?: TooltipPayload[]
    labelFormatter?: (value: any, name: string) => string
    formatter?: (value: any, name: string) => string
  }

function ChartTooltipContent({
  active,
  payload = [],
  className,
  indicator = 'dot',
  hideLabel = false,
  hideIndicator = false,
  label,
  labelFormatter,
  labelClassName,
  formatter,
  color,
  nameKey,
  labelKey,
}: ChartTooltipContentProps) {
  const { config } = useChart()

  const tooltipLabel = React.useMemo(() => {
    if (hideLabel || !Array.isArray(payload) || payload.length === 0) {
      return null
    }

    const [item] = payload
    const key = `${labelKey || item?.dataKey || item?.name || 'value'}`
    return labelFormatter ? labelFormatter(label || '', key) : label || key
  }, [hideLabel, payload, labelFormatter, labelKey, label])

  if (!active || payload.length === 0) {
    return null
  }

  return (
    <div
      className={cn(
        'flex flex-col gap-1 rounded bg-muted p-2 text-xs',
        className,
      )}
    >
      {tooltipLabel && (
        <span
          className={labelClassName || 'font-medium text-primary mb-1'}
          style={{ color }}
        >
          {tooltipLabel}
        </span>
      )}
      {payload.map((item, index) => (
        <div key={index} className="flex items-center gap-2">
          {!hideIndicator && (
            <span
              className={cn(
                'inline-block rounded-full',
                indicator === 'dot' && 'w-2 h-2 bg-current',
                indicator === 'line' && 'w-4 h-[2px] bg-current',
              )}
              style={{ backgroundColor: item.color }}
            />
          )}
          <span>
            {formatter
              ? formatter(item.value || '', nameKey || item.name || '')
              : item.value}
          </span>
        </div>
      ))}
    </div>
  )
}

const ChartLegend = RechartsPrimitive.Legend

type LegendPayload = {
  value?: string
  dataKey?: string
  color?: string
  [key: string]: any
}

function ChartLegendContent({
  className,
  hideIcon = false,
  payload = [],
  verticalAlign = 'bottom',
  nameKey,
}: React.ComponentProps<'div'> & {
    payload?: LegendPayload[]
    verticalAlign?: 'top' | 'bottom'
    hideIcon?: boolean
    nameKey?: string
  }) {
  const { config } = useChart()

  if (!payload || payload.length === 0) {
    return null
  }

  return (
    <div
      className={cn(
        'flex items-center justify-center gap-4',
        verticalAlign === 'top' ? 'pb-3' : 'pt-3',
        className,
      )}
    >
      {payload.map((item: LegendPayload) => {
        const key = `${nameKey || item.dataKey || 'value'}`
        const itemConfig = getPayloadConfigFromPayload(config, item, key)

        return (
          <div
            key={item.value}
            className={
              '[&>svg]:text-muted-foreground flex items-center gap-1.5 [&>svg]:h-3 [&>svg]:w-3'
            }
          >
            {itemConfig?.icon && !hideIcon ? (
              <itemConfig.icon />
            ) : (
              <div
                className="h-2 w-2 shrink-0 rounded-[2px]"
                style={{
                  backgroundColor: item.color,
                }}
              />
            )}
            {itemConfig?.label}
          </div>
        )
      })}
    </div>
  )
}

// Helper to extract item config from a payload.
function getPayloadConfigFromPayload(
  config: ChartConfig,
  payload: unknown,
  key: string,
) {
  if (typeof payload !== 'object' || payload === null) {
    return undefined
  }

  const payloadPayload =
    'payload' in payload &&
    typeof payload.payload === 'object' &&
    payload.payload !== null
      ? payload.payload
      : undefined

  let configLabelKey: string = key

  if (
    key in payload &&
    typeof payload[key as keyof typeof payload] === 'string'
  ) {
    configLabelKey = payload[key as keyof typeof payload] as string
  } else if (
    payloadPayload &&
    key in payloadPayload &&
    typeof payloadPayload[key as keyof typeof payloadPayload] === 'string'
  ) {
    configLabelKey = payloadPayload[
      key as keyof typeof payloadPayload
    ] as string
  }

  return configLabelKey in config
    ? config[configLabelKey]
    : config[key as keyof typeof config]
}

export {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
  ChartStyle,
}
