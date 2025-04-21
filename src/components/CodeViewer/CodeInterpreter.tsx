import { Button, Icon, RadioGroup, Tooltip } from '@clickhouse/click-ui/bundled'
import { createClient as createWebClient } from '@clickhouse/client-web'
import { parse } from 'json5'
import { useEffect, useState } from 'react'
import short from 'short-uuid'
import CodeResults, { DefaultView } from './CodeResults'
import {
  ChartConfig,
  ChartType,
  QueryParameter,
  QueryResponse,
  QueryResults
} from './types'
import { formatBytes, formatReadableRows, roundToDynamicPrecision } from './utils'
import { getGoogleAnalyticsUserIdFromBrowserCookie } from '../../lib/google/google'



interface Props {
  queryString: string
  runnable: boolean
  link: string
  run: boolean
  view: DefaultView
  chart?: { type: ChartType; config?: ChartConfig }
  settings: string
  show_statistics: boolean
}

function CodeInterpreter({
  queryString,
  runnable,
  link,
  run,
  view,
  chart,
  settings,
  show_statistics
}: Props) {
  const [results, setResults] = useState<any>(null)
  const [showResultsPanel, setShowResultsPanel] = useState<boolean>(false)
  const [queryRunning, setQueryRunning] = useState<boolean>(false)
  const [currentView, setCurrentView] = useState<DefaultView>(view)
  const [runByUser, setRunByUser] = useState<boolean>(false)

  const clickhouse_settings = JSON.parse(settings)
  const clickhouse_web = createWebClient({
    url: 'https://sql-clickhouse.clickhouse.com',
    username: 'demo',
    password: '',
    clickhouse_settings: {
      ...clickhouse_settings,
      allow_experimental_analyzer: 1,
      result_overflow_mode: 'break',
      read_overflow_mode: 'break'
    }
  })

  function useWindowWidth(): number {
    const [width, setWidth] = useState(typeof window !== 'undefined' ? window.innerWidth : 0)
  
    useEffect(() => {
      function handleResize() {
        setWidth(window.innerWidth)
      }
  
      window.addEventListener('resize', handleResize)
      return () => window.removeEventListener('resize', handleResize)
    }, [])
  
    return width
  }

  function generateId(): string {
    return short.generate().toUpperCase().slice(0, 27)
  }

  async function query(
    query: string,
    query_id: string,
    params: Array<QueryParameter>,
    runManually: boolean
  ): Promise<QueryResponse> {
    if (!query) {
      return { error: 'Query not provided', status: 400, query_id: query_id }
    }
    query = query.replace(/;$/, '').trim()

    const query_params: { [key: string]: string } = {}
    params.forEach((param) => {
      if (param.type && /^(Array|Map|Tuple|Nested)/.test(param.type)) {
        try {
          query_params[param.name] = parse(param.value)
        } catch (e) {
          // just send and let clickhouse error
          query_params[param.name] = param.value
        }
      } else {
        query_params[param.name] = param.value
      }
    })

    try {
      // Inject metadata as log comment
      const currentPath = typeof window !== 'undefined' ? window.location.pathname : ''
      let jsonLogComment: Record<string, any> = {}
      if (typeof window !== "undefined") {
        let gaId = getGoogleAnalyticsUserIdFromBrowserCookie('_ga')
        if (gaId) {
          jsonLogComment['ga_id'] = gaId
        }
      }
      if (currentPath) {
        jsonLogComment['url_path'] = currentPath
      }
      jsonLogComment['auto_run'] = !runManually

      const res = await clickhouse_web.query({
        query: query,
        query_id: query_id,
        query_params: query_params,
        clickhouse_settings: {
          log_comment: JSON.stringify(jsonLogComment),
        }
      })
      const json = (await res.json()) as QueryResults
      if (json.exception) {
        console.error('Error while running query', json.exception)
        return {
          query: query,
          status: 500,
          response: json,
          query_id: query_id,
          error: json.exception
        }
      }
      return { query: query, status: 200, response: json, query_id: query_id }
    } catch (error) {
      console.error('Error while running query', error)
      return { error: error, status: 500, query_id: query_id }
    }
  }

  useEffect(() => {
    if (run) {
      handleRunQuery(false)
    }
  }, [run])

  const handleRunQuery = async (runManually: boolean) => {

    const query_run_id = generateId()
    setResults({})
    setQueryRunning(true)
    setShowResultsPanel(true)

    const res = await query(queryString, query_run_id, [], runManually)
    setQueryRunning(false)
    setResults({
      response: res.response,
      query_id: res.query_id,
      error: res.error
    })
    setRunByUser(runManually)
  }

  const closeResultPanel = (event: any) => {
    event.preventDefault()
    setShowResultsPanel(false)
  }

  const openTableResultPanel = (event: any) => {
    event.preventDefault()
    setShowResultsPanel(true)
  }

  const runBy = () => {
    if (runByUser) {
      return 'Executed by user.'
    } else {
      if (run) {
        return 'Executed on load.'
      }
    }
  }

  const hideTableResultButton = () => {
    if (results) {
      const show_results = showResultsPanel ? (
        <Tooltip>
          <Tooltip.Trigger>
            <Button
              className='h-full m-auto'
              fillWidth={false}
              iconLeft='chevron-down'
              onClick={closeResultPanel}
              type='empty'></Button>
          </Tooltip.Trigger>
          <Tooltip.Content side='bottom'>Close the results</Tooltip.Content>
        </Tooltip>
      ) : (
        <Tooltip>
          <Tooltip.Trigger>
            <Button
              className='h-full m-auto'
              fillWidth={false}
              iconLeft='chevron-up'
              onClick={openTableResultPanel}
              type='empty'></Button>
          </Tooltip.Trigger>
          <Tooltip.Content side='bottom'>Open the results</Tooltip.Content>
        </Tooltip>
      )

      return (
        <div className={`flex items-end whitespace-pre-wrap flex-nowrap ${chart && 'w-[180px] h-[28px]'}`}>
          {show_results}
          {chart && (
            <div className='flex-nowrap'>
              <RadioGroup
                orientation='horizontal'
                style={{'flexWrap': 'nowrap'}}
                value={currentView}>
                <RadioGroup.Item
                  label='Table'
                  onClick={(): void => {
                    setCurrentView(DefaultView.Table)
                  }}
                  value={DefaultView.Table}
                />
                <RadioGroup.Item
                  label='Chart'
                  onClick={(): void => {
                    setCurrentView(DefaultView.Chart)
                  }}
                  value={DefaultView.Chart}
                />
              </RadioGroup>
            </div>
          )}
          
        </div>
      )
    }
  }

  const windowWidth = useWindowWidth()

  const runButton = () => {

    if (runnable) {
      return (
        <div className='flex justify-between'>
          <div className='flex items-center flex-nowrap'>
            <div className='flex items-center'>{hideTableResultButton()}</div>
            <div className='flex items-end min-h-[28px]'>
              {show_statistics && results?.response?.statistics && (
                <div className={`whitespace-pre-wrap text-[${windowWidth > 600 ? '12': '10'}px] mx-auto italic ${chart ? 'ml-[14px]' : ''}`}>
                  { windowWidth > 600 ? `Read ${formatReadableRows(results.response.statistics.rows_read)} rows and ${formatBytes(results.response.statistics.bytes_read)} in ${roundToDynamicPrecision(results.response.statistics.elapsed)} secs` : 
                  `Read ${formatReadableRows(results.response.statistics.rows_read)} rows in ${roundToDynamicPrecision(results.response.statistics.elapsed)} secs` }
                </div>
              )}
            </div>
          </div>
          
          <div className='flex items-center'>
            <div className='m-[8px]'>
              <Tooltip>
                <Tooltip.Trigger>
                  <Button
                    iconLeft='play'
                    onClick={() => {handleRunQuery(true)}}
                    type='primary'
                    loading={queryRunning}></Button>
                </Tooltip.Trigger>
                <Tooltip.Content side='bottom'>Run the query</Tooltip.Content>
              </Tooltip>
            </div>
            {link && (
              <Tooltip>
                <Tooltip.Trigger>
                  <a href={link} target='_blank' rel='noreferrer'>
                    <Icon
                      height=''
                      className='flex items-center p-[0.365rem]'
                      name='popout'
                      size='md'
                      // state="neutral"
                      color='white'
                    />
                  </a>
                </Tooltip.Trigger>
                <Tooltip.Content side='bottom'>Open in Play</Tooltip.Content>
              </Tooltip>
            )}
          </div>
        </div>
      )
    }
  }

  return (
    <>
      {runButton()}
      <div className='flex flex-col-reverse divide-y-4 divide-y-reverse'>
        {showResultsPanel && (
          <CodeResults
            results={results}
            queryRunning={queryRunning}
            chart={chart}
            view={currentView}
          />
        )}
      </div>
    </>
  )
}

export default CodeInterpreter
