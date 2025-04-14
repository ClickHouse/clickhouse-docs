import { CodeBlock, ClickUIProvider, Text } from '@clickhouse/click-ui/bundled'
import CodeInterpreter from './CodeInterpreter'
import { DefaultView } from './CodeResults'
import { ChartConfig, ChartType } from './types'
import { base64Decode } from './utils'
import { useColorMode } from '@docusaurus/theme-common'
import { isValidElement } from 'react'
import DocusaurusCodeBlock from '@theme-original/CodeBlock';

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

function parseInlineStyle(styleString: string): React.CSSProperties {
  if (styleString) {
    return styleString.split(';').reduce((acc, item) => {
      const [key, value] = item.split(':').map(str => str.trim())
      if (key && value) {
        const camelKey = key.replace(/-([a-z])/g, (_, char) => char.toUpperCase())
        acc[camelKey] = value
      }
      return acc
    }, {} as React.CSSProperties)
  }
  return {}
}

function CodeViewer({
  node,
  inline,
  className,
  language = 'sql',
  show_line_numbers = false,
  runnable = 'false',
  run = 'false',
  link,
  view = 'table',
  chart_config = '',
  clickhouse_settings = '{}',
  show_statistics = 'true',
  style = '',
  title='',
  click_ui = 'false',
  children,
  ...props
}: any) {
  const showLineNumbers = show_line_numbers === 'true'
  const runBoolean = run === 'true'
  const runnableBoolean = runnable === 'true'
  const showStatistics = show_statistics === 'true'

  let chart: { type: ChartType; config?: ChartConfig } | undefined
  try {
    const parsedChart = JSON.parse(chart_config !== '' ? base64Decode(chart_config) : '{}')
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
  const extraStyle = parseInlineStyle(style)
  const combinedStyle:React.CSSProperties = {
    wordBreak: 'break-word',
    ...extraStyle
  }
  const header = title ? (
    <>
      <Text className='pl-[16px] pt-[14px]' size='md'>{title}</Text>
    </>
  ): null

  const code_block = click_ui === 'true' ? (
    <CodeBlock
      style={combinedStyle}
      className={`code-viewer`}
      language={language}
      onCopy={function Da() {}}
      onCopyError={function Da() {}}
      showLineNumbers={showLineNumbers}
      theme={colorMode}
      wrapLines={false}
    >
      {typeof children === 'string' ? children : getCodeContent(children)}
    </CodeBlock>
  ): (
    <DocusaurusCodeBlock children={children} className={`language-${language}`}/>
  )
  const results = runnable ? (
    <CodeInterpreter
      link={link}
      run={runBoolean}
      runnable={runnableBoolean}
      queryString={typeof children === 'string' ? children : getCodeContent(children)}
      view={chart ? view : DefaultView.Table}
      chart={chart}
      settings={clickhouse_settings}
      show_statistics={showStatistics}
    />
  ): null

  return (
      <div className={`code-viewer mb-[12px] mt-[12px] ${colorMode === 'dark' ? 'bg-[#282828]' : 'bg-[#f5f5f5]'}`}>
        <ClickUIProvider theme={colorMode}>
          { header }
          { code_block }
          { results }
        </ClickUIProvider>
      </div>


  )
}

export default CodeViewer
