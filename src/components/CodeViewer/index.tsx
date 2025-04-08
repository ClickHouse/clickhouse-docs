import { CodeBlock, ClickUIProvider } from '@clickhouse/click-ui/bundled'
import CodeInterpreter from './CodeInterpreter'
import { DefaultView } from './CodeResults'
import { ChartConfig, ChartType } from './types'
import { base64Decode } from './utils'
import { useColorMode } from '@docusaurus/theme-common'
import { isValidElement } from 'react'

function getCodeContent(children: any): string {
  if (typeof children === 'string') return children

  if (isValidElement(children) && children.props?.children) {
    return getCodeContent(children.props.children)
  }

  if (Array.isArray(children)) {
    return children.map(getCodeContent).join('')
  }

  return ''
}

function CodeViewer({
  node,
  inline,
  className,
  language = 'sql',
  show_line_numbers = 'false',
  runnable = false,
  run = false,
  link,
  view = 'table',
  chart_config = '',
  clickhouse_settings = '{}',
  show_statistics = true,
  children,
  ...props
}: any) {
  const showLineNumbers = show_line_numbers === 'true'
  const runBoolean = run === 'true'
  const runnableBoolean = runnable === 'true'
  let chart: { type: ChartType; config?: ChartConfig } | undefined
  try {
    const parsedChart = JSON.parse(base64Decode(chart_config))
    if (parsedChart && parsedChart.type && parsedChart.config) {
      chart = {
        type: parsedChart.type as ChartType,
        config: parsedChart.config
      }
    }
  } catch {
    console.log('chart config is not valid')
  }
  const { colorMode } = useColorMode(); // returns 'light' or 'dark'
  console.log(children.props.children)
  return (
      <div className={`mb-[12px] ${colorMode === 'dark' ? 'bg-[#282828]' : 'bg-[#f5f5f5]'}`}>
        <ClickUIProvider theme={colorMode}>
          
          <CodeBlock
            style={{ wordBreak: 'break-word' }}
            language={language}
            onCopy={function Da() {}}
            onCopyError={function Da() {}}
            showLineNumbers={showLineNumbers}
            wrapLines
            >
            {typeof children === 'string' ? children : getCodeContent(children)}
          </CodeBlock>
          
          <CodeInterpreter
            link={link}
            run={runBoolean}
            runnable={runnableBoolean}
            queryString={typeof children === 'string' ? children : getCodeContent(children)}
            view={chart ? view : DefaultView.Table}
            chart={chart}
            settings={clickhouse_settings}
            show_statistics={show_statistics}
          />
        </ClickUIProvider>
      </div>


  )
}

export default CodeViewer
