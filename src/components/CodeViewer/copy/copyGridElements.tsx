import { CellProps, SelectedRegion, SelectionFocus } from "@clickhouse/click-ui/bundled";
import { RefObject, createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { Column } from "../types";

interface CopyGridElementsProps {
  cell: CellProps;
  selection: SelectedRegion;
  rowCount: number;
  columnCount: number;
  pageStart?: number;
  focus: SelectionFocus;
  outerRef: RefObject<HTMLDivElement>;
  columnNames: Column[];
  type: String;
}

function copyTableAsMarkdown(table: HTMLTableElement) {
  // Extract header cells from the <thead> section if present
  const headerCells = table.querySelector("thead")
    ? Array.from(table.querySelectorAll("thead th")).map(cell => cell.textContent?.trim() ?? "")
    : [];

  let markdownRows: string[] = [];
  if (headerCells.length > 0) {
    // Create the Markdown header row and separator
    const headerRow = `| ${headerCells.join(" | ")} |`;
    const separatorRow = `| ${headerCells.map(() => "---").join(" | ")} |`;
    markdownRows.push(headerRow)
    markdownRows.push(separatorRow)
  }

  // Extract body rows, excluding the header row if no <thead> is used
  const bodyRows = Array.from(table.querySelectorAll("tbody tr")).length
    ? Array.from(table.querySelectorAll("tbody tr"))
    : []

  // Map each row to a Markdown formatted row
  bodyRows.forEach(row => {
    const rowCells: string[] = Array.from(row.querySelectorAll("td, th")).map(cell => cell.textContent?.trim() ?? "");
    markdownRows.push(`| ${rowCells.join(" | ")} |`);
  });

  // Combine the header, separator, and body rows into the final Markdown table
  const markdownTable = [...markdownRows].join("\n");

  // Copy to clipboard
  navigator.clipboard.writeText(markdownTable);

}

const addCellToRow = (
  row: HTMLTableRowElement,
  cell: CellProps,
  rowIndex: number,
  columnIndex: number
) => {
  const td = document.createElement("td");
  // const root = createRoot(td);
  const html = renderToStaticMarkup(
    createElement(cell, { rowIndex, columnIndex, width: 1000, type: "row-cell" })
  );
  td.innerHTML = html;

  row.appendChild(td);
  // root.unmount();
};

const headerListLoop = (
  thead: HTMLTableSectionElement,
  columnList: Array<number>,
  columnNames: Column[]
) => {
  const row = document.createElement("tr");
  columnList.forEach(columnIndex => {
    const th = document.createElement("th");
    th.innerHTML = columnNames?.[columnIndex].name;
    row.appendChild(th);
  });
  thead.appendChild(row);
};

const columnListLoop = (
  tbody: HTMLTableSectionElement,
  columnList: Array<number>,
  cell: CellProps,
  rowIndex: number
) => {
  const row = document.createElement("tr");
  columnList.forEach(columnIndex => {
    addCellToRow(row, cell, rowIndex, columnIndex);
  });
  tbody.appendChild(row);
};

const copyGridElements = async ({
  cell,
  selection,
  rowCount,
  columnCount,
  pageStart = 0,
  focus,
  outerRef,
  columnNames,
  type
}: CopyGridElementsProps): Promise<void> => {
  if (!outerRef.current) {
    throw "Could not fetch selection";
  }

  const table = document.createElement("table");
  table.style.position = "absolute";
  table.style.top = "-200px";
  table.style.left = "-200px";
  table.style.width = "0px";
  table.style.height = "0px";
  table.style.overflow = "hidden";
  const thead = document.createElement("thead");
  const tbody = document.createElement("tbody");

  switch (selection.type) {
    case "rectangle":
      const columnListRectangle = Array.from(
        { length: selection.bounds.right + 1 - selection.bounds.left },
        (_, index) => selection.bounds.left + index
      );
      headerListLoop(thead, columnListRectangle, columnNames); 
      Array.from(
        { length: selection.bounds.bottom + 1 - selection.bounds.top },
        (_, index) => selection.bounds.top + index
      ).forEach(rowIndex => {
        
        columnListLoop(tbody, columnListRectangle, cell, rowIndex);
      });
      break;
    case "columns":
      const columnList = Array.from(selection.columns).sort();
      headerListLoop(thead, columnList, columnNames); 
      Array.from({ length: rowCount }, (_, index) => pageStart + 1 + index).forEach(
        rowIndex => {
          columnListLoop(tbody, columnList, cell, rowIndex);
        }
      );
      break;
    case "rows":
      const columnListRows = Array.from(
        { length: columnCount },
        (_, index) => pageStart + index
      );
      headerListLoop(thead, columnListRows, columnNames); 
      Array.from(selection.rows).sort().forEach(rowIndex => {
        columnListLoop(tbody, columnListRows, cell, rowIndex);
      });
      break;
    case "empty":
      columnListLoop(tbody, [focus.column], cell, focus.row);
      break;
    default:
      throw new Error("incorrect selection provided");
  }

  table.appendChild(thead);
  table.appendChild(tbody);

  outerRef.current.appendChild(table);

  const windowSelection = window.getSelection();
  if (windowSelection) {
    if (type === 'tsv')
      await navigator.clipboard.writeText(table.innerText);
    else
      await copyTableAsMarkdown(table);
    outerRef.current.removeChild(table);
  } else {
    throw "Could not fetch selection";
  }
};

export default copyGridElements;
