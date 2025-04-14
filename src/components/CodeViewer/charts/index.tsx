import { Panel } from '@clickhouse/click-ui/bundled'
import { useEffect, useState } from 'react'
import { ChartConfig, ChartType, QueryResults } from '../types'
import BarChart from './bar'
import CandleStickChart from './candlestick'
import HeatMap from './heatmap'
import LineChart from './line'
import PieChart from './pie'

const chartTypes = Object.values(ChartType)

const Chart = (props: {
  results?: QueryResults
  chart: { type: ChartType; config?: ChartConfig }
}) => {
  const [windowWidth, setWindowWidth] = useState<number>(0)

  useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth)
    handleResize()
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  if (!props.results) {
    return <div></div>
  }

  let chart = null

  if (props.chart.config) {
    switch (props.chart.type) {
      case ChartType.Line:
      case ChartType.Area:
      case ChartType.Scatter: {
        chart = (
          <div className='h-full w-full'>
            <LineChart
              config={props.chart.config!}
              columns={props.results!.meta}
              data={props.results?.data!}
              scatter={props.chart.type === ChartType.Scatter}
              fill_area={props.chart.type === ChartType.Area}
            />
          </div>
        )
        break
      }
      case ChartType.HorizontalBar:
      case ChartType.Bar: {
        chart = (
          <div className='h-full w-full'>
            <BarChart
              columns={props.results!.meta}
              config={props.chart.config!}
              data={props.results?.data!}
              horizontal={props.chart.type === ChartType.HorizontalBar}
            />
          </div>
        )
        break
      }
      case ChartType.Pie: {
        chart = (
          <div className='h-full w-full'>
            <PieChart
              config={props.chart.config!}
              data={props.results?.data!}
              columns={props.results!.meta}
            />
          </div>
        )
        break
      }
      case ChartType.HeatMap: {
        chart = (
          <div className='h-full w-full'>
            <HeatMap
              config={props.chart.config!}
              data={props.results?.data!}
              columns={props.results!.meta}
            />
          </div>
        )
        break
      }
      case ChartType.CandleStick: {
        chart = (
          <div className='h-full w-full'>
            <CandleStickChart
              config={props.chart.config!}
              data={props.results?.data!}
              columns={props.results!.meta}
            />
          </div>
        )
        break
      }
      default: {
        chart = null
      }
    }
  }

  return (
    <div className='flex h-full border-0 flex-col-reverse lg:flex-row gap-2 lg:gap-4'>
      <Panel
        className={`w-full h-full`}
        alignItems='start'
        color='default'
        hasBorder
        orientation='vertical'
        padding='md'
        radii='sm'
        >
        {chart}
      </Panel>
    </div>
  )
}

export default Chart
