'use client'
import {
  default as EChartsReact,
  default as ReactECharts
} from 'echarts-for-react'
import isEqual from 'lodash/isEqual'
import { useMemo, useRef } from 'react'
import { ChartConfig, Column } from '../../types'
import { nonNullType } from '../../utils'
import styles from './styles.module.css'

const MAX_SERIES = 9

export type HeatmapChartConfig = ChartConfig & {
  zaxis?: string
}

function getSupportedColumns(columns: Column[]): {
  xaxis: string[]
  yaxis: string[]
  zaxis: string[]
} {
  return {
    xaxis: columns
      .filter(
        (col) =>
          nonNullType(col.type).includes('String') ||
          nonNullType(col.type).startsWith("Enum") || 
          nonNullType(col.type).startsWith("LowCardinality") ||
          nonNullType(col.type).includes('Date')
      )
      .map((col) => col.name),
    yaxis: columns
      .filter(
        (col) =>
          nonNullType(col.type).includes('String') ||
          nonNullType(col.type).startsWith("Enum") || 
          nonNullType(col.type).startsWith("LowCardinality") ||
          nonNullType(col.type).includes('Date')
      )
      .map((col) => col.name),
    zaxis: columns
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

export default function HeatMap(props: {
  data: Record<string, any>[]
  config: HeatmapChartConfig
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
  const zaxis =
    props.config.zaxis && columns.zaxis.includes(props.config.zaxis)
      ? props.config.zaxis
      : undefined

  const chartRef = useRef<EChartsReact>(null)

  const xValues = useMemo(() => {
    if (xaxis === undefined || yaxis === undefined || zaxis === undefined) {
      return []
    }
    return props.data
      .map((p) => p[xaxis!])
      .filter((item, pos, ary) => {
        return !pos || item != ary[pos - 1]
      })
  }, [props.data, props.config])

  const yValues = useMemo(() => {
    if (xaxis === undefined || yaxis === undefined || zaxis === undefined) {
      return []
    }
    return props.data
      .map((p) => p[yaxis!])
      .sort()
      .filter((item, pos, ary) => {
        return !pos || item != ary[pos - 1]
      })
  }, [props.data, props.config])

  const values = useMemo(() => {
    if (xaxis === undefined || yaxis === undefined || zaxis === undefined) {
      return {}
    }
    return props.data.reduce(
      (vals, val) => {
        val[xaxis!] in vals
          ? (vals[val[xaxis!]][val[yaxis!]] = Number(val[zaxis!]))
          : (vals[val[xaxis!]] = { [val[yaxis!]]: Number(val[zaxis!]) })
        return vals
      },
      {} as Record<string, { name: string; data: number[] }>
    )
  }, [props.data, props.config])

  const longestYLabelLength = Math.max(
    ...yValues.map((label) => String(label).length),
    0
  )
  const leftPadding = longestYLabelLength * 8

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
    grid: {
      left: `${leftPadding}px`,
      right: '16px',
      bottom: '36px',
      top: '32px'
    },
    xAxis: {
      type: 'category',
      offset: 15,
      data: xValues,
      splitArea: {
        show: true
      },
      axisLine: {
        onZero: false
      }
    },
    toolBox: {
      show: false
    },
    yAxis: {
      type: 'category',
      offset: 15,
      splitArea: {
        show: true
      },
      data: yValues,
      axisLine: {
        onZero: false
      }
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
      formatter: (params: any) => {
        return `<div class='${styles.tooltip}'><span class='${styles.tooltiptext}'>${
          yValues[params.value[1]]
        } - ${xValues[params.value[0]]} - ${Number(
          params.value[2]
        ).toLocaleString('en-US')}</span>
                        </div>`
      },
      position: (point: any, params: any, dom: any, rect: any, size: any) => {
        const echartsInstance = chartRef.current?.getEchartsInstance()
        if (echartsInstance) {
          const pos = echartsInstance.convertToPixel({ seriesIndex: 0 }, [
            params.value[0],
            params.value[1]
          ])
          const xOffset = pos[0] - size.contentSize[1] * 2
          const yOffset = pos[1] - size.contentSize[1] - 10
          return [xOffset, yOffset]
        }
        return [point[0], point[1]]
      },
      extraCssText: 'visibility: hidden;padding:0px;'
    },
    visualMap: {
      min: Math.min(
        ...props.data.map((p) =>
          props.config.zaxis ? p[props.config.zaxis] : 0
        )
      ),
      max: Math.max(
        ...props.data.map((p) =>
          props.config.zaxis ? p[props.config.zaxis] : 0
        )
      ),
      calculable: true,
      orient: 'horizontal',
      color: [
        'rgba(252, 255, 116, 1)',
        'rgba(252, 255, 116, 0.9)',
        'rgba(252, 255, 116, 0.8)',
        'rgba(252, 255, 116, 0.7)',
        'rgba(252, 255, 116, 0.6)',
        'rgba(252, 255, 116, 0.5)',
        'rgba(252, 255, 116, 0.4)',
        'rgba(252, 255, 116, 0.3)',
        'rgba(252, 255, 116, 0.2)',
        'rgba(252, 255, 116, 0.1)',
        '#262626'
      ],
      show: false
    },
    series: [
      {
        type: 'heatmap',
        data: xValues
          .map((x, xi) =>
            yValues.map((y, yi) => [xi, yi, y in values[x] ? values[x][y] : 0])
          )
          .flat(),
        label: {
          show: false
        },
        emphasis: {
          itemStyle: {
            color: '#FAFF69' // Color on emphasis for better visibility
          }
        },
        itemStyle: {
          borderWidth: 1,
          borderColor: '#262626' // Set a distinct border to see each cell
        }
      }
    ],
    legend: null
  }

  return (
    <div className='h-full w-full justify-between flex flex-col'>
      <ReactECharts
        ref={chartRef}
        option={options}
        style={{ width: '100%', height: '100%' }}
        lazyUpdate
        shouldSetOption={(prevProps, currentProps) => {
          return !isEqual(prevProps, currentProps)
        }}
      />
    </div>
  )
}
