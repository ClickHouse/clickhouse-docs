---
title: '美观'
slug: /interfaces/formats/Pretty
keywords: ['美观']
input_format: false
output_format: true
alias: []
---

import PrettyFormatSettings from './_snippets/common-pretty-format-settings.md';

| Input | Output  | Alias |
|-------|---------|-------|
| ✗     | ✔       |       |

## 描述 {#description}

`Pretty` 格式将数据输出为 Unicode 艺术表格，使用 ANSI 转义序列在终端中显示颜色。
表格的完整网格被绘制，每行在终端中占用两行。
每个结果块输出为一个单独的表格。
这是必要的，以便在不缓冲结果的情况下输出块（如果缓冲值，则需要预先计算所有值的可见宽度）。

[NULL](/sql-reference/syntax.md) 输出为 `ᴺᵁᴸᴸ`。

## 示例用法 {#example-usage}

示例（针对 [`PrettyCompact`](./PrettyCompact.md) 格式显示）：

```sql title="查询"
SELECT * FROM t_null
```

```response title="响应"
┌─x─┬────y─┐
│ 1 │ ᴺᵁᴸᴸ │
└───┴──────┘
```

在任何 `Pretty` 格式中，行都不会被转义。以下示例针对 [`PrettyCompact`](./PrettyCompact.md) 格式显示：

```sql title="查询"
SELECT 'String with \'quotes\' and \t character' AS Escaping_test
```

```response title="响应"
┌─Escaping_test────────────────────────┐
│ String with 'quotes' and      character │
└──────────────────────────────────────┘
```

为了避免向终端转储过多数据，仅打印前 `10,000` 行。
如果行数大于或等于 `10,000`，则会打印消息 "显示前 10 000"。

:::note
此格式仅适用于输出查询结果，不适合解析数据。
:::

美观格式支持输出总值（使用 `WITH TOTALS` 时）和极值（当 'extremes' 设置为 1 时）。
在这些情况下，总值和极值在主数据之后输出，以单独的表格形式显示。
以下示例使用了 [`PrettyCompact`](./PrettyCompact.md) 格式：

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

总计：
┌──EventDate─┬───────c─┐
│ 1970-01-01 │ 8873898 │
└────────────┴─────────┘

极值：
┌──EventDate─┬───────c─┐
│ 2014-03-17 │ 1031592 │
│ 2014-03-23 │ 1406958 │
└────────────┴─────────┘
```

## 格式设置 {#format-settings}

<PrettyFormatSettings/>
