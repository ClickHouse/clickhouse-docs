---
'alias': []
'description': 'Pretty格式的文档'
'input_format': false
'keywords':
- 'Pretty'
'output_format': true
'slug': '/interfaces/formats/Pretty'
'title': '漂亮'
---

import PrettyFormatSettings from './_snippets/common-pretty-format-settings.md';

| 输入 | 输出  | 别名 |
|-------|---------|-------|
| ✗     | ✔       |       |

## 描述 {#description}

`Pretty` 格式以 Unicode 艺术表格的形式输出数据，使用 ANSI 转义序列在终端中显示颜色。表格的完整网格被绘制，每一行在终端中占用两行。每个结果块作为一个单独的表输出。这是必要的，因为块可以在不缓冲结果的情况下输出（缓冲结果将需要预先计算所有值的可见宽度）。

[NULL](/sql-reference/syntax.md) 被输出为 `ᴺᵁᴸᴸ`。

## 示例用法 {#example-usage}

示例（显示 [`PrettyCompact`](./PrettyCompact.md) 格式）：

```sql title="Query"
SELECT * FROM t_null
```

```response title="Response"
┌─x─┬────y─┐
│ 1 │ ᴺᵁᴸᴸ │
└───┴──────┘
```

在所有 `Pretty` 格式中，行都不被转义。下面的示例是为 [`PrettyCompact`](./PrettyCompact.md) 格式展示的：

```sql title="Query"
SELECT 'String with \'quotes\' and \t character' AS Escaping_test
```

```response title="Response"
┌─Escaping_test────────────────────────┐
│ String with 'quotes' and      character │
└──────────────────────────────────────┘
```

为了避免向终端转储过多数据，仅打印前 `10,000` 行。如果行数大于或等于 `10,000`，则会打印消息 "Showed first 10 000"。

:::note
此格式仅适合输出查询结果，而不适合解析数据。
:::

Pretty 格式支持输出总值（使用 `WITH TOTALS` 时）和极值（当 'extremes' 设置为 1 时）。在这些情况下，总值和极值在主数据之后以单独的表输出。以下示例中使用了 [`PrettyCompact`](./PrettyCompact.md) 格式：

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

<PrettyFormatSettings/>
