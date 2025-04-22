'use client'
import ReactECharts from 'echarts-for-react'
import { useEffect, useMemo, useState } from 'react'
import { ChartConfig, Column } from '../../types'
import { nonNullType, roundToDynamicPrecision } from '../../utils'

const MAX_SERIES = 9

function getSupportedColumns(columns: Column[]): {
  xaxis: string[]
  yaxis: string[]
} {
  return {
    xaxis: columns
      .filter((col) => nonNullType(col.type).includes("String") ||
      nonNullType(col.type).startsWith("Enum") || 
      nonNullType(col.type).startsWith("LowCardinality"))
      .map((col) => col.name),
    yaxis: columns
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

export default function Pie(props: {
  data: Record<string, any>[]
  config: ChartConfig
  columns: Column[]
}) {
  const columns = getSupportedColumns(props.columns)
  // unset columns which aren't valid
  const xaxis =
    props.config.xaxis && columns.xaxis.includes(props.config.xaxis)
      ? props.config.xaxis
      : undefined
  const yaxis =
    props.config.yaxis && columns.yaxis.includes(props.config.yaxis)
      ? props.config.yaxis
      : undefined
  // Declare hooks at the top level unconditionally
  const [windowWidth, setWindowWidth] = useState<number>(window.innerWidth)
  useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth)
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  const values = useMemo(() => {
    if (xaxis === undefined || yaxis === undefined) {
      return {}
    }
    let series_count = 0
    return props.data.reduce((accumulator, val) => {
      const seriesName = xaxis! in val ? val[xaxis!] : 'all'
      if (!(seriesName in accumulator)) {
        if (series_count < MAX_SERIES) {
          accumulator[seriesName] = Number(val[yaxis!])
        } else if ('_other_' in accumulator) {
          accumulator['_other_'] = accumulator['_other_'] + Number(val[yaxis!])
        } else {
          accumulator['_other_'] = Number(val[yaxis!])
        }
        series_count++
      } else {
        accumulator[seriesName] = accumulator[seriesName] + Number(val[yaxis!])
      }
      return accumulator
    }, {})
  }, [props.data, xaxis, yaxis])

  const data = useMemo(() => {
    return Object.entries(values).map(([seriesName, value]) => {
      return { value: value, name: seriesName }
    })
  }, [values])

  if (xaxis === undefined || yaxis === undefined) {
    return <></>
  }

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
      left: '80px',
      right: '24px',
      bottom: '24px',
      top: '24px'
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
      valueFormatter: (value: number) => roundToDynamicPrecision(value)
    },
    legend:
      windowWidth >= 1536
        ? {
            top: '0%',
            right: '0px',
            orient: 'vertical',
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
    series: [
      {
        name: xaxis,
        type: 'pie',
        radius: ['50%', '90%'],
        avoidLabelOverlap: true,
        center: ['50%', '55%'],
        label: {
          show: false
        },
        emphasis: {
          label: {
            show: false
          }
        },
        labelLine: {
          show: true
        },
        z: 2,
        itemStyle: {},
        color: [
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
        data: data
      }
    ]
  }

  return (
    <div className='h-full w-full justify-between flex flex-col'>
      <ReactECharts
        option={options}
        notMerge={true}
        style={{ width: '100%', height: '100%' }}
        lazyUpdate={true}
      />
    </div>
  )
}
