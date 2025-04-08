export interface QueryResponse {
  query?: string
  status: number
  query_id?: string
  error?: any
  response?: QueryResults
  warning?: string | undefined
}

export interface QueryResults {
  meta: Column[]
  data: Record<string, any>[]
  rows: number
  exception?: string
  statistics: QueryStatistics
}

export interface QueryStatistics {
  elapsed: number
  rows_read: number
  bytes_read: number
}

export interface Column {
  database?: string
  table?: string
  name: string
  type: string
}

export interface QueryParameter {
  name: string
  type?: string
  textStartPos?: number
  textEndPos?: number
  value: string
}

export enum ChartType {
  Line = 'line',
  Bar = 'bar',
  HorizontalBar = 'horizontal bar',
  Area = 'area',
  Pie = 'pie',
  Scatter = 'scatter',
  HeatMap = 'heatmap',
  CandleStick = 'candlestick'
}

export interface YAxisConfig {
  yaxis?: string
  yaxis_min?: number
  yaxis_max?: number
}

export interface XAxisConfig {
  xaxis?: string
}

export interface SeriesConfig {
  series?: string
}

export interface StackableConfig {
  stack?: boolean
}

export type ChartConfig = StackableConfig &
  SeriesConfig &
  YAxisConfig &
  XAxisConfig & {
    title?: string
  }

export interface QueryResults {
  meta: Column[]
  data: Record<string, any>[]
  rows: number
  exception?: string
  statistics: QueryStatistics
}

export interface QueryStatistics {
  elapsed: number
  rows_read: number
  bytes_read: number
}
