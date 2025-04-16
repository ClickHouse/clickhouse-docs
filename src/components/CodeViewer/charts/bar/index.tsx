'use client'
import ReactECharts, { EChartsOption } from 'echarts-for-react'
import type { XAXisOption, YAXisOption } from 'echarts/types/dist/shared'
import isEqual from 'lodash/isEqual'
import { useEffect, useMemo, useState } from 'react'
import { ChartConfig, Column } from '../../types'
import { nonNullType, roundToDynamicPrecision } from '../../utils'

const MAX_SERIES = 9

function getSupportedColumns(columns: Column[]): {
  xaxis: string[]
  yaxis: string[]
  series: string[]
} {
  return {
    xaxis: columns
      .filter(
        (col) =>
          nonNullType(col.type).startsWith('Date') ||
          nonNullType(col.type).includes('String') ||
          nonNullType(col.type).startsWith('UInt') ||
          nonNullType(col.type).startsWith('Int')  ||
          nonNullType(col.type).startsWith("Enum") || 
          nonNullType(col.type).startsWith("LowCardinality")
      )
      .map((col) => col.name),
    yaxis: columns
      .filter(
        (col) =>
          nonNullType(col.type).startsWith('UInt') ||
          nonNullType(col.type).startsWith('Int') ||
          nonNullType(col.type).startsWith('Decimal') ||
          nonNullType(col.type).startsWith('Float')
      )
      .map((col) => col.name),
    series: columns
      .filter((col) => 
        nonNullType(col.type).includes("String") ||
        nonNullType(col.type).startsWith("Enum") || 
        nonNullType(col.type).startsWith("LowCardinality")
    )
      .map((col) => col.name)
  }
}

export default function Bar(props: {
  data: Record<string, any>[]
  config: ChartConfig
  horizontal?: boolean
  columns: Column[]
}) {
  const columns = getSupportedColumns(props.columns)
  const xaxis =
    props.config.xaxis && columns.xaxis.includes(props.config.xaxis)
      ? props.config.xaxis
      : undefined
  const yaxis =
    props.config.yaxis && columns.yaxis.includes(props.config.yaxis)
      ? props.config.yaxis
      : undefined
  const series_col =
    props.config.series && columns.series.includes(props.config.series)
      ? props.config.series
      : undefined

  // Declare hooks at the top level unconditionally
  const [windowWidth, setWindowWidth] = useState<number>(window.innerWidth)

  useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth)
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  const xAxis = useMemo(() => {
    if (xaxis === undefined || yaxis === undefined) {
      return []
    }
    return Array.from(new Set(props.data.map((p) => p[xaxis!])))
  }, [props.data, props.config])

  const values = useMemo(() => {
    if (xaxis === undefined || yaxis === undefined) {
      return {}
    }
    let series_count = 0
    const initialValues = props.data.reduce(
      (accumulator, val) => {
        const seriesName =
          series_col && series_col in val ? val[series_col] : 'all'
        if (!(seriesName in accumulator)) {
          if (series_count < MAX_SERIES) {
            accumulator[seriesName] = {
              name: seriesName,
              data: new Array(xAxis.length).fill(0)
            }
          } else {
            accumulator['_other_'] = {
              name: '_other_',
              data: new Array(xAxis.length).fill(0)
            }
          }
          series_count++
        }
        return accumulator
      },
      {} as Record<string, { name: string; data: number[] }>
    )

    props.data.forEach((p) => {
      const seriesName = series_col && series_col in p ? p[series_col] : 'all'
      if (seriesName in initialValues) {
        initialValues[seriesName].data[xAxis.indexOf(p[xaxis!])] = p[yaxis!]
      } else {
        initialValues['_other_'].data[xAxis.indexOf(p[xaxis!])] = p[yaxis!]
      }
    })

    return initialValues
  }, [props.data, props.config, xAxis])

  const colors = useMemo(
    () => [
      '#faff69',
      '#FC74FF',
      '#66ff73',
      '#6df8e1',
      '#33e4ff',
      '#6d9bf3',
      '#cc66ff',
      '#fb63d6',
      '#fdcf33',
      '#fd9050',
      '#fd7575',
      '#b3b6bd'
    ],
    []
  )

  const series:any = useMemo(() => {
    const mappedColors: { [key: string]: string } = {}
    return Object.values(values).map((series, i) => {
      let color = colors[i % colors.length]
      if (series.name in mappedColors) {
        color = mappedColors[series.name]
      } else {
        mappedColors[series.name] = color
      }
      return props.config.stack
        ? {
            type: 'bar',
            name: series.name,
            data: series.data,
            color: color,
            stack: 'series'
          }
        : {
            type: 'bar',
            name: series.name,
            data: series.data,
            color: color
          }
    })
  }, [values, props.config.stack, colors])

  if (xaxis === undefined || yaxis === undefined) {
    return <></>
  }
  const categoryAxis = {
    show: true,
    type: 'category',
    data: xAxis,
    axisLabel: {
      hideOverlap: true
    }
  }

  const numberAxis = {
    splitLine: {
      show: true,
      lineStyle: {
        color: '#808691',
        opacity: 0.3
      }
    },
    axisLabel: {
      hideOverlap: true
    }
  }

  const longestLabelLength = props.horizontal
    ? Math.max(...xAxis.map((label) => String(label).length), 0)
    : 0
  const leftPadding = props.horizontal
    ? Math.max(48, longestLabelLength * 7) // Estimate width based on character count
    : 24

  const bottomPadding = windowWidth >= 1536 && series.length > 1 ? '48px' : '12px'
  const options: EChartsOption = {
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
      left: '8px',
      right: '8px',
      bottom: bottomPadding,
      top: '24px',
      containLabel: true
    },
    tooltip: {
      trigger: 'item',
      textStyle: {
        color: '#FAFF69',
        fontWeight: 'bold',
        fontSize: 16,
        lineHeight: 24
      },
      backgroundColor: '#181818',
      borderWidth: 0,
      valueFormatter: (value: any) =>
        roundToDynamicPrecision(value as number).toString()
    },
    xAxis: props.horizontal
      ? (numberAxis as XAXisOption)
      : (categoryAxis as XAXisOption),
    legend:
      windowWidth >= 1536 && series_col
        ? {
            bottom: '0%',
            right: '0px',
            orient: 'horizontal',
            textStyle: {
              color: '#FFFFFFF',
              fontSize: 14
            },
            icon: 'circle',
            borderRadius: 5,
            borderWidth: 1,
            borderColor: '#626262',
            padding: 10
          }
        : undefined,
    yAxis: props.horizontal
      ? (categoryAxis as YAXisOption)
      : (numberAxis as YAXisOption),
    series: series
  }

  return (
    <div className='h-full w-full justify-between flex flex-col'>
      <ReactECharts
        option={options}
        lazyUpdate
        notMerge
        style={{ width: '100%', height: '100%' }}
        shouldSetOption={(prevProps, currentProps) => {
          return !isEqual(prevProps.option, currentProps.option)
        }}
      />
    </div>
  )
}
