'use client'
import EChartsReact from 'echarts-for-react'
import isEqual from 'lodash/isEqual'
import { useMemo, useRef } from 'react'
import { Column, XAxisConfig, YAxisConfig } from '../../types'
import { nonNullType, roundByScale, roundToDynamicPrecision } from '../../utils'
/*

example query to generate data:

SELECT
    toDateTime('2024-01-01 00:00:00') + INTERVAL number WEEK AS timestamp, any(close) OVER (ORDER BY timestamp ASC ROWS BETWEEN 1 PRECEDING AND CURRENT ROW) AS open,
    round(randNormal(1000, 100), 2) AS close,
    min2 (open, close) - round(randNormal(0, 10), 2) AS low,
    max2 (open, close) + round(randNormal(0, 10), 2) AS high
FROM
    numbers(0, 52)
ORDER BY
    timestamp;
*/

function getSupportedColumns(columns: Column[]): {
  xaxis: string[]
  open: string[]
  close: string[]
  high: string[]
  low: string[]
} {
  return {
    xaxis: columns
      .filter(
        (col) =>
          nonNullType(col.type).startsWith('Date') ||
          nonNullType(col.type).startsWith('UInt') ||
          nonNullType(col.type).startsWith('Int')
      )
      .map((col) => col.name),
    open: columns
      .filter(
        (col) =>
          nonNullType(col.type).startsWith('UInt') ||
          nonNullType(col.type).startsWith('Int') ||
          nonNullType(col.type).startsWith('Decimal') ||
          nonNullType(col.type).startsWith('Float')
      )
      .map((col) => col.name),
    close: columns
      .filter(
        (col) =>
          nonNullType(col.type).startsWith('UInt') ||
          nonNullType(col.type).startsWith('Int') ||
          nonNullType(col.type).startsWith('Decimal') ||
          nonNullType(col.type).startsWith('Float')
      )
      .map((col) => col.name),
    low: columns
      .filter(
        (col) =>
          nonNullType(col.type).startsWith('UInt') ||
          nonNullType(col.type).startsWith('Int') ||
          nonNullType(col.type).startsWith('Decimal') ||
          nonNullType(col.type).startsWith('Float')
      )
      .map((col) => col.name),
    high: columns
      .filter(
        (col) =>
          nonNullType(col.type).startsWith('UInt') ||
          nonNullType(col.type).startsWith('Int') ||
          nonNullType(col.type).startsWith('Decimal') ||
          nonNullType(col.type).startsWith('Float')
      )
      .map((col) => col.name)
  }
}

export type CandleStickChartConfig = XAxisConfig &
  YAxisConfig & {
    title?: string
    high?: string
    low?: string
    open?: string
    close?: string
  }

const CandleStickChart = (props: {
  data: Record<string, any>[]
  config: CandleStickChartConfig
  columns: Column[]
}) => {
  const columns = getSupportedColumns(props.columns)
  const xaxis =
    props.config.xaxis && columns.xaxis.includes(props.config.xaxis)
      ? props.config.xaxis
      : undefined
  const high =
    props.config.high && columns.high.includes(props.config.high)
      ? props.config.high
      : undefined
  const low =
    props.config.low && columns.low.includes(props.config.low)
      ? props.config.low
      : undefined
  const open =
    props.config.open && columns.high.includes(props.config.open)
      ? props.config.open
      : undefined
  const close =
    props.config.close && columns.close.includes(props.config.close)
      ? props.config.close
      : undefined

  const chartRef = useRef<EChartsReact>(null)
  const xAxis = useMemo(() => {
    if (
      xaxis === undefined ||
      high === undefined ||
      low === undefined ||
      open === undefined ||
      close === undefined
    ) {
      return []
    }
    return Array.from(new Set(props.data.map((p) => p[xaxis!])))
  }, [props.data, xaxis, high, low, open, close])

  const values = useMemo(() => {
    if (
      xaxis === undefined ||
      high === undefined ||
      low === undefined ||
      open === undefined ||
      close === undefined
    ) {
      return []
    }
    const initialValues = props.data.map((p) => [
      p[open],
      p[close],
      p[low],
      p[high]
    ])
    return initialValues
  }, [props.data, props.config])

  const options:any = {
    title: {
      text: props.config.title,
      textStyle: {
        width: '100%',
        fontSize: 16,
        color: '#808691',
        fontWeight: 'normal'
      },
      left: 'center'
    },
    animation: false,
    grid: {
      left: '36px',
      right: '16x',
      bottom: '24px',
      top: '24px'
    },
    xAxis: {
      show: true,
      type: 'category',
      data: xAxis,
      nameLocation: 'middle',
      min: 0,
      max: xAxis.length - 1
    },
    yAxis: {
      type: 'value',
      splitLine: {
        show: true,
        lineStyle: {
          color: '#808691',
          opacity: 0.3
        }
      },
      min: (value: { min: number; max: number }) => {
        return props.config.yaxis_min !== undefined
          ? props.config.yaxis_min
          : roundByScale(value.min * 0.9)
      },
      max: props.config.yaxis_max ? props.config.yaxis_max : undefined
    },
    series: {
      type: 'candlestick',
      data: values,
      itemStyle: {
        color: '#99FFA1',
        borderColor: '#99FFA1',
        color0: '#FF7575',
        borderColor0: '#FF7575'
      }
    },
    tooltip: {
      backgroundColor: '#302e32',
      borderColor: '#302e32 transparent transparent transparent',
      textStyle: {
        color: '#FAFF69',
        fontWeight: 'bold',
        fontSize: 16,
        lineHeight: 24
      },
      trigger: 'axis',
      axisPointer: {
        axis: 'x'
      },
      valueFormatter: (value: number) => roundToDynamicPrecision(value)
    }
  }

  return (
    <div className='h-full w-full justify-between flex flex-col'>
      <EChartsReact
        ref={chartRef}
        option={options}
        notMerge
        style={{ width: '100%', height: '100%' }}
        lazyUpdate
        shouldSetOption={(prevProps, currentProps) => {
          return !isEqual(prevProps, currentProps)
        }}
      />
    </div>
  )
}

export default CandleStickChart
