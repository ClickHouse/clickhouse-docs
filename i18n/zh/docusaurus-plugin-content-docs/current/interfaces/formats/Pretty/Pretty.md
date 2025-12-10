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

`Pretty` 格式以 Unicode 绘制的字符表格形式输出数据，
在终端中使用 ANSI 转义序列来显示颜色。
表格的完整网格会被绘制出来，并且每一行在终端中占用两行。
每个结果块都会作为一个单独的表格输出。
这样就可以在不对结果进行缓冲的情况下输出这些块（否则就必须先缓冲结果，以便预先计算所有值的可见宽度）。

[NULL](/sql-reference/syntax.md) 会被输出为 `ᴺᵁᴸᴸ`。

## 使用示例 {#example-usage}

示例（以 [`PrettyCompact`](./PrettyCompact.md) 格式为例）：

```sql title="Query"
SELECT * FROM t_null
```

```response title="Response"
┌─x─┬────y─┐
│ 1 │ ᴺᵁᴸᴸ │
└───┴──────┘
```

在所有 `Pretty` 系列格式中，行都不会被转义。以下示例展示的是 [`PrettyCompact`](./PrettyCompact.md) 格式：

```sql title="Query"
SELECT 'String with \'quotes\' and \t character' AS Escaping_test
```

```response title="Response"
┌─Escaping_test────────────────────────┐
│ 包含 'quotes' 和      字符的字符串 │
└──────────────────────────────────────┘
```

为了避免向终端输出过多数据，仅打印前 `10,000` 行。
如果行数大于或等于 `10,000`，则会打印消息 &quot;Showed first 10 000&quot;。

:::note
此格式只适用于输出查询结果，不适合用于解析数据。
:::

Pretty 格式支持输出总计（使用 `WITH TOTALS` 时）和极值（当 `extremes` 被设置为 1 时）。
在这些情况下，总计和极值会在主数据之后以单独的表格输出。
下面的示例展示了这一点，示例中使用了 [`PrettyCompact`](./PrettyCompact.md) 格式：

```sql title="Query"
SELECT EventDate, count() AS c 
FROM test.hits 
GROUP BY EventDate 
WITH TOTALS 
ORDER BY EventDate 
FORMAT PrettyCompact
```

```response title="Response"
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
