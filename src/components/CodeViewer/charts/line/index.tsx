'use client'
import EChartsReact from 'echarts-for-react'
import isEqual from 'lodash/isEqual'
import { useEffect, useMemo, useRef, useState } from 'react'
import { ChartConfig, Column } from '../../types'
import { nonNullType, roundByScale, roundToDynamicPrecision } from '../../utils'
import styles from './styles.module.css'

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
          nonNullType(col.type).startsWith('UInt') ||
          nonNullType(col.type).startsWith('Int')
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

const LineChart = (props: {
  data: Record<string, any>[]
  config: ChartConfig
  scatter?: boolean
  fill_area?: boolean
  columns: Column[]
}) => {
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

  const chartRef = useRef<EChartsReact>(null)
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
  }, [props.data, xaxis, yaxis])

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
  }, [props.data, props.config])

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

  const series = useMemo(() => {
    const mappedColors: { [key: string]: string } = {}

    return Object.values(values).map((series, i) => {
      let color = colors[i % colors.length]
      if (series.name in mappedColors) {
        color = mappedColors[series.name]
      } else {
        mappedColors[series.name] = color
      }
      return {
        name: series.name,
        data: series.data,
        type: props.scatter ? 'scatter' : 'line',
        smooth: true,
        showSymbol: props.scatter ? true : false,
        symbolSize: 6,
        areaStyle: props.fill_area ? {} : null,
        lineStyle: {
          color: color,
          width: 1.5
        },
        itemStyle: {
          color: color
        }
      }
    })
  }, [values, props.config, colors, props.fill_area, props.scatter])

  if (xaxis === undefined || yaxis === undefined) {
    return <></>
  }

  const onMouseOver = () => {
    const echartsInstance = chartRef.current?.getEchartsInstance()
    if (
      echartsInstance &&
      !props.fill_area &&
      !props.scatter &&
      series.length === 1
    ) {
      const newOptions = {
        series: [
          {
            lineStyle: {
              opacity: 1,
              shadowColor: '#FAFF69',
              shadowOffsetX: 0,
              shadowOffsetY: 0,
              shadowBlur: 0
            },
            areaStyle: {
              color: {
                type: 'linear',
                x: 0,
                y: 0,
                x2: 0,
                y2: 0.65,
                colorStops: [
                  {
                    offset: 0,
                    color: '#FAFF69'
                  },
                  {
                    offset: 1,
                    color: '#343431'
                  }
                ]
              },
              opacity: 0.1
            }
          }
        ]
      }
      echartsInstance.setOption(newOptions)
      echartsInstance.dispatchAction({
        type: 'takeGlobalCursor',
        key: 'brush',
        brushOption: {
          brushType: 'lineX'
        }
      })
    }
  }

  const bottomPadding = windowWidth >= 1536 && series.length > 1 ? '48px' : '12px'

  const options: any = {
    animation: false,
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
      left: '8px',
      right: '8px',
      bottom: bottomPadding,
      top: '36px',
      containLabel: true
    },
    xAxis: {
      show: true,
      type: 'category',
      boundaryGap: false,
      data: xAxis,
      nameLocation: 'middle',
      min: 0,
      max: xAxis.length - 1,
      axisLabel: {
        hideOverlap: true
      }
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
    series: series,
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
        : null,
    tooltip: {
      trigger: 'axis',
      textStyle: {
        color: '#FAFF69',
        fontWeight: 'bold',
        fontSize: 16,
        lineHeight: 16
      },
      backgroundColor: '#302e32',
      borderWidth: 0,
      valueFormatter: (value: number) => roundToDynamicPrecision(value),
      ...(series.length === 1 && {
        // Only include these properties if series length is equal to 1
        formatter: (params: any) => {
          return `<div class="${styles.tooltip}">
                      <span class="${styles.tooltiptext}">${params[0].axisValue}: ${roundToDynamicPrecision(
                        params[0].value
                      ).toLocaleString('en-US')}</span>
                  </div>`
        },
        extraCssText: 'visibility: hidden;padding:0px;',
        position: (point: any, params: any, dom: any, rect: any, size: any) => {
          const echartsInstance = chartRef.current?.getEchartsInstance()
          if (echartsInstance) {
            const pos = echartsInstance.convertToPixel({ seriesIndex: 0 }, [
              params[0].axisValue,
              params[0].value
            ])
            return [pos[0], pos[1] - size.contentSize[1] * 2]
          }
        }
      })
    }
    // brush: {
    //   toolbox: ["lineX", "clear"],
    //   brushType: "lineX",
    //   brushMode: "single",
    //   transformable: false
    // }
  }

  const onMouseOut = () => {
    const echartsInstance = chartRef.current?.getEchartsInstance()
    if (echartsInstance) {
      echartsInstance.setOption(options)
    }
  }

  return (
    <div
      className='h-full justify-between flex flex-col'
      onMouseMove={onMouseOver}
      onMouseOut={onMouseOut}>
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

export default LineChart
