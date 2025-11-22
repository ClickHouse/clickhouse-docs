---
alias: []
description: 'Pretty 格式文档'
input_format: false
keywords: ['Pretty']
output_format: true
slug: /interfaces/formats/Pretty
title: 'Pretty'
doc_type: 'reference'
---

import PrettyFormatSettings from './_snippets/common-pretty-format-settings.md';

| 输入 | 输出 | 别名 |
| -- | -- | -- |
| ✗  | ✔  |    |


## 描述 {#description}

`Pretty` 格式将数据输出为 Unicode 艺术表格，
使用 ANSI 转义序列在终端中显示颜色。
表格会绘制完整的网格，每行在终端中占据两行。
每个结果块作为独立的表格输出。
这样做是为了能够在不缓冲结果的情况下输出数据块（如果需要预先计算所有值的可见宽度，则必须进行缓冲）。

[NULL](/sql-reference/syntax.md) 输出为 `ᴺᵁᴸᴸ`。


## 使用示例 {#example-usage}

示例（以 [`PrettyCompact`](./PrettyCompact.md) 格式显示）：

```sql title="查询"
SELECT * FROM t_null
```

```response title="响应"
┌─x─┬────y─┐
│ 1 │ ᴺᵁᴸᴸ │
└───┴──────┘
```

在所有 `Pretty` 格式中，行都不会进行转义。以下示例以 [`PrettyCompact`](./PrettyCompact.md) 格式显示：

```sql title="查询"
SELECT 'String with \'quotes\' and \t character' AS Escaping_test
```

```response title="响应"
┌─Escaping_test────────────────────────┐
│ String with 'quotes' and      character │
└──────────────────────────────────────┘
```

为避免向终端输出过多数据，仅打印前 `10,000` 行。
如果行数大于或等于 `10,000`，将打印消息 "Showed first 10 000"。

:::note
此格式仅适用于输出查询结果，不适用于解析数据。
:::

Pretty 格式支持输出总计值（使用 `WITH TOTALS` 时）和极值（当 'extremes' 设置为 1 时）。
在这些情况下，总计值和极值会在主数据之后以单独的表格输出。
以下示例使用 [`PrettyCompact`](./PrettyCompact.md) 格式演示：

```sql title="查询"
SELECT EventDate, count() AS c
FROM test.hits
GROUP BY EventDate
WITH TOTALS
ORDER BY EventDate
FORMAT PrettyCompact
```

```response title="响应"
┌──EventDate─┬───────c─┐
│ 2014-03-17 │ 1406958 │
│ 2014-03-18 │ 1383658 │
│ 2014-03-19 │ 1405797 │
│ 2014-03-20 │ 1353623 │
│ 2014-03-21 │ 1245779 │
│ 2014-03-22 │ 1031592 │
│ 2014-03-23 │ 1046491 │
└────────────┴─────────┘

Totals:
┌──EventDate─┬───────c─┐
│ 1970-01-01 │ 8873898 │
└────────────┴─────────┘

Extremes:
┌──EventDate─┬───────c─┐
│ 2014-03-17 │ 1031592 │
│ 2014-03-23 │ 1406958 │
└────────────┴─────────┘
```


## 格式设置 {#format-settings}

<PrettyFormatSettings />
