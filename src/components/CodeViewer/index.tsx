import { CodeBlock, ClickUIProvider, Text, Button } from '@clickhouse/click-ui/bundled'
import CodeInterpreter from './CodeInterpreter'
import { DefaultView } from './CodeResults'
import { ChartConfig, ChartType } from './types'
import { base64Decode } from './utils'
import { useColorMode } from '@docusaurus/theme-common'
import { isValidElement, useState } from 'react'
import DocusaurusCodeBlock from '@theme-original/CodeBlock'
import Editor from '@monaco-editor/react'

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
  editable = 'false',
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
  const [code, setCode] = useState(typeof children === 'string' ? children : getCodeContent(children))
  
  const showLineNumbers = show_line_numbers === 'true'
  const runBoolean = run === 'true'
  const runnableBoolean = runnable === 'true'
  const editableBoolean = editable === 'true'
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
  
  const { colorMode } = useColorMode()
  const extraStyle = parseInlineStyle(style)
  const combinedStyle: React.CSSProperties = {
    wordBreak: 'break-word',
    ...extraStyle
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    // Allow tab in textarea
    if (e.key === 'Tab') {
      e.preventDefault()
      const target = e.target as HTMLTextAreaElement
      const start = target.selectionStart
      const end = target.selectionEnd
      const newValue = code.substring(0, start) + '  ' + code.substring(end)
      setCode(newValue)
      setTimeout(() => {
        target.selectionStart = target.selectionEnd = start + 2
      }, 0)
    }
  }

  const header = title ? (
    <Text className='pl-[16px] pt-[14px]' size='md'>{title}</Text>
  ) : null

  // Always show as editable Monaco editor when editable=true
  const code_block = editableBoolean ? (
    <div className="min-h-[200px]">
      <Editor
        value={code}
        onChange={(value) => setCode(value || '')}
        language={language}
        theme={colorMode === 'dark' ? 'vs-dark' : 'vs-light'}
        height={`${Math.max(200, (code.split('\n').length + 2) * 19)}px`}
        options={{
          minimap: { enabled: false },
          scrollBeyondLastLine: false,
          fontSize: 14,
          lineNumbers: showLineNumbers ? 'on' : 'off',
          wordWrap: 'on',
          automaticLayout: true,
          tabSize: 2,
          insertSpaces: true,
          folding: false,
          glyphMargin: false,
          lineDecorationsWidth: 0,
          lineNumbersMinChars: 3,
          renderLineHighlight: 'line',
          selectOnLineNumbers: true,
          roundedSelection: false,
          scrollbar: {
            verticalScrollbarSize: 8,
            horizontalScrollbarSize: 8
          }
        }}
      />
    </div>
  ) : (
    click_ui === 'true' ? (
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
        {code}
      </CodeBlock>
    ) : (
      <DocusaurusCodeBlock children={code} className={`language-${language}`}/>
    )
  )

  const results = runnableBoolean ? (
    <CodeInterpreter
      link={link}
      run={runBoolean}
      runnable={runnableBoolean}
      queryString={code}
      view={chart ? view : DefaultView.Table}
      chart={chart}
      settings={clickhouse_settings}
      show_statistics={showStatistics}
    />
  ) : null

  return (
    <div className={`code-viewer ${colorMode === 'dark' ? 'bg-[#282828]' : 'bg-[#f5f5f5]'}`}>
      <ClickUIProvider theme={colorMode}>
        {header}
        {code_block}
        {results}
      </ClickUIProvider>
    </div>
  )
}

export default CodeViewer
