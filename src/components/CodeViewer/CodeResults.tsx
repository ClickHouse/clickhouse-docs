import {
  CellProps,
  createToast,
  Grid,
  Icon,
  SelectedRegion,
  SelectionFocus,
  Tooltip,
} from '@clickhouse/click-ui/bundled'

import { useCallback, useRef, useMemo, useState } from 'react'
import Chart from './charts'
import copyGridElements from './copy/copyGridElements'
import { ChartConfig, ChartType, QueryResults } from './types'
import LoadingSVG from '@site/static/images/loading.svg'
import { useColorMode } from '@docusaurus/theme-common'

export enum DefaultView {
  Chart = 'chart',
  Table = 'table'
}

interface ResultsProps {
  results?: { response?: QueryResults; query_id?: string; error: string }
  queryRunning: boolean
  view: DefaultView
  chart?: { type: ChartType; config?: ChartConfig }
}

export enum Position {
  Start = 'start',
  End = 'end',
  Center = 'center'
}

interface LoadingProps {
  position?: Position
  className?: string
}

const Loading: React.FC<LoadingProps> = ({
  position = Position.Start,
  className = ''
}) => {
  const { colorMode } = useColorMode()
  const strokeColor = colorMode === 'light' ? '#000000' : '#FAFF69'

  return (
    <div className={`flex justify-center h-full ${className}`}>
      <div className={`flex gap-4 items-${position}`}>
        <LoadingSVG width={36} height={36} className={colorMode === 'light' ? 'text-[#000]' : 'text-[#FAFF69]'} />
        <span>&nbsp; Loading</span>
      </div>
    </div>
  )
}

const rowStart = 1
export const PIXEL_PER_CHAR = 7

export function getValueOfCell(
  value: string | null,
  isFocused: boolean,
  maxPx: number
): string | null {
  if (value === null) {
    return null
  }

  if (isFocused) {
    return value
  }

  // lets assume 7px per character
  const maxStrWidth = maxPx / PIXEL_PER_CHAR

  if (value.length <= maxStrWidth) {
    return value
  }

  return value.substring(0, maxStrWidth) + '...'
}

interface SelectedCell {
  row: number,
  column: number
}

function CodeResults(props: ResultsProps) {
  const [selectedCell, setSelectedCell] = useState<SelectedCell>({ row: 1, column: 0 });
  const response = props.results?.response
  const error = props.results?.error
  const gridRef = useRef<HTMLDivElement | null>(null)
  const { colorMode } = useColorMode(); // 'light' or 'dark'

  const isNumeric = (columnType: string) => {
    return columnType.startsWith('UInt') || columnType.startsWith('Int') || columnType.startsWith('Float') || columnType.startsWith('Decimal');
  }

  const isHyperlink = (value: string | null) => {
    return value && value.startsWith('http');
  }

  const extreme = useMemo(() => {
    if (!response) return {};
    let res: Record<string, { max: number; min: number }> = {};
    for (let i = 0; i < response.meta.length; i++) {
      const columnType = response.meta[i].type;
      const columnName = response.meta[i].name;
      if (isNumeric(columnType)) {
        const values = response.data.map(item => item[columnName]);
        const max = Math.max(...values);
        const min = Math.min(...values);
        res[columnName] = { max, min };
      }
    }
    return res;
  }, [response]);


  const cellValue = useCallback(
    (rowIndex: number, columnIndex: number): string | null => {
      const columnName = response?.meta?.[columnIndex]?.name
      const cellData = columnName
        ? response?.data?.[rowIndex - 1]?.[columnName]
        : ''
      if (cellData === null || cellData === undefined) {
        return null
      }

      return typeof cellData === 'object'
        ? JSON.stringify(cellData)
        : cellData.toString()
    },
    [response?.data, response?.meta]
  )

  const onCellClick = (e: any) => {
    e.stopPropagation()
    if (e.detail > 1) {
      const cell = (e.target as HTMLElement).closest<HTMLElement>(
        '[data-grid-row][data-grid-column]'
      )
      if (cell && cell.dataset.gridRow && cell.dataset.gridColumn) {
        const value = cellValue(
          Number(cell.dataset.gridRow),
          Number(cell.dataset.gridColumn)
        )
        isHyperlink(value) && window.open(value || '', '_blank') 
        // props.handleCellClick(value)
      }
    }
  }

  const Cell: CellProps = ({
    type,
    rowIndex,
    columnIndex,
    isScrolling,
    width,
    ...props
  }) => {
    const columnType = response?.meta?.[columnIndex]?.type || ''
    const columnName = response?.meta?.[columnIndex]?.name || ''
    if (type === 'header-cell') {
      return (
        <Tooltip>
          <Tooltip.Trigger data-scrolling={isScrolling} {...props}>
            <span className='max-w-full overflow-hidden whitespace-nowrap text-ellipsis'>
              {response?.meta?.at(columnIndex)?.name}
            </span>
          </Tooltip.Trigger>
          <Tooltip.Content side='bottom'>
            {response?.meta?.at(columnIndex)?.name} -{' '}
            {response?.meta?.at(columnIndex)?.type}
          </Tooltip.Content>
        </Tooltip>
      )
    }

    const textAlign = columnType && isNumeric(columnType) ? "right" : "left";
    const value = cellValue(rowIndex, columnIndex);

    if (isNumeric(columnType) && response && response.data.length > 1) {
      const ratio = value ? 100 * Number(value) / Number(extreme[columnName].max) : 100;
      const bgColor =
      colorMode === 'light'
        ? rowIndex === selectedCell.row
          ? '#f0f0f0'
          : '#ffffff'
        : rowIndex === selectedCell.row
          ? 'lch(15.8 0 0)'
          : '#1f201b'
    
      const barColor = colorMode === 'light' ? '#d2d2d2' : '#35372f'
      
      const background = `linear-gradient(to right, ${barColor} 0%, ${barColor} ${ratio}%, ${bgColor} ${ratio}%, ${bgColor} 100%)`

      return (<span
        style={{
          textAlign: textAlign,
          display: "inline-block",
          width: "100%",
          background: background,
          backgroundSize: "100% 50%",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat"

        }}
        data-scrolling={isScrolling}
        {...props}
      >
        {getValueOfCell(cellValue(rowIndex, columnIndex), false, width)}
      </span>)
    } else if (isHyperlink(value)) {
      return (
        <span style={{ textAlign: textAlign, textDecoration: "underline", cursor: "pointer"}} data-scrolling={isScrolling} {...props}>
          {getValueOfCell(cellValue(rowIndex, columnIndex), false, width)}
        </span>
      )
    } else {
      return (
        <span style={{ textAlign: textAlign }} data-scrolling={isScrolling} {...props}>
          {getValueOfCell(cellValue(rowIndex, columnIndex), false, width)}
        </span>
      )
    }
  }

  const getMenuOptions = (selection: SelectedRegion, focus: SelectionFocus) => {
    return [
      {
        label: 'Copy to TSV',
        onSelect: () => {
          onCopyTSV(selection, focus)
        }
      }
    ]
  }

  const onCopyTSV = (selection: SelectedRegion, focus: SelectionFocus) => {
    try {
      copyGridElements({
        cell: Cell,
        selection: selection,
        focus: focus,
        rowCount: response ? response.rows : 0,
        columnCount: response?.meta?.length ?? 0,
        outerRef: gridRef,
        columnNames: response?.meta ? response.meta : [],
        type: 'tsv'
      })

      createToast({
        title: 'Copied TSV successfully',
        description: 'Now you can paste the content',
        type: 'success'
      })
    } catch (e) {
      console.error(e)

      createToast({
        title: 'Failed to copy',
        description:
          'Encountered an error while copying. Try again after sometime',
        type: 'danger'
      })
    }
  }

  const onGridCopyMarkdown = (
    selection: SelectedRegion,
    focus: SelectionFocus
  ) => {
    try {
      copyGridElements({
        cell: Cell,
        selection: selection,
        focus: focus,
        rowCount: response ? response.rows : 0,
        columnCount: response?.meta?.length ?? 0,
        outerRef: gridRef,
        columnNames: response?.meta ? response.meta : [],
        type: 'markdown'
      })

      createToast({
        title: 'Copied markdown successfully',
        description: 'Now you can paste the content',
        type: 'success'
      })
    } catch (e) {
      console.error(e)

      createToast({
        title: 'Failed to copy',
        description:
          'Encountered an error while copying. Try again after sometime',
        type: 'danger'
      })
    }
  }

  if (props.queryRunning) {
    return (
      <div className='h-[300px] w-full m-1'>
        <Loading position={Position.Center} />
      </div>
    )
  }

  let results = null
  if (props.view == DefaultView.Chart && props.chart) {
    results = <Chart results={props.results?.response} chart={props.chart} />
  } else if (props.view == DefaultView.Table) {
    results = response && response.rows > 0 && (
      <>
        <Grid
          ref={gridRef}
          cell={Cell}
          headerHeight={32}
          rowStart={rowStart}
          rowCount={response ? response.rows : 0}
          onMouseDown={onCellClick}
          rounded='md'
          columnCount={response?.meta?.length ?? 0}
          onColumnResize={(columnIndex: number, newWidth: number) => {}}
          onCopy={onGridCopyMarkdown}
          getMenuOptions={getMenuOptions}
          className='scrollbar scrollbar-thin scrollbar-thumb-neutral-700 scrollbar-track-neutral-725'></Grid>
      </>
    )
  }
  const height_table = props.chart
    ? 300
    : Math.min(Math.ceil(((response?.rows || 0) + 1) * 33), 300)

  return (
    <>
      {error ? (
        <div className='flex'>
          <Icon
            className='w-[30px] h-[30px] my-auto mx-1'
            width='30px'
            height='30px'
            name='warning'
            size='md'
            state='danger'></Icon>
          <p className='mx-1 text-sm text-red-400 text-wrap'>
            An error occurred while processing your request. Please check the
            browser console for more details.
          </p>
        </div>
      ) : (
        <div className={`w-full`} style={{ height: `${height_table}px` }}>
          {results}
        </div>
      )}
    </>
  )
}

export default CodeResults
