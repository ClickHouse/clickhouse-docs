---
'alias': []
'description': 'Pretty 格式的文档'
'input_format': false
'keywords':
- 'Pretty'
'output_format': true
'slug': '/interfaces/formats/Pretty'
'title': 'Pretty'
'doc_type': 'reference'
---

import PrettyFormatSettings from './_snippets/common-pretty-format-settings.md';

| Input | Output  | Alias |
|-------|---------|-------|
| ✗     | ✔       |       |

## 描述 {#description}

`Pretty` 格式将数据输出为 Unicode 艺术表格， 
使用 ANSI 转义序列在终端中显示颜色。
整个表格的网格被绘制，每行在终端中占据两行。
每个结果块作为一个单独的表格输出。 
这样可以不对结果进行缓冲（如果缓冲，必须预先计算所有值的可见宽度）。

[NULL](/sql-reference/syntax.md) 输出为 `ᴺᵁᴸᴸ`。

## 示例用法 {#example-usage}

示例（显示用于 [`PrettyCompact`](./PrettyCompact.md) 格式）：

```sql title="Query"
SELECT * FROM t_null
```

```response title="Response"
┌─x─┬────y─┐
│ 1 │ ᴺᵁᴸᴸ │
└───┴──────┘
```

在任何 `Pretty` 格式中，行都不会被转义。以下示例显示用于 [`PrettyCompact`](./PrettyCompact.md) 格式：

```sql title="Query"
SELECT 'String with \'quotes\' and \t character' AS Escaping_test
```

```response title="Response"
┌─Escaping_test────────────────────────┐
│ String with 'quotes' and      character │
└──────────────────────────────────────┘
```

为了避免将过多数据转储到终端中，仅打印前 `10,000` 行。 
如果行数大于或等于 `10,000`，则会打印消息 "显示前 10 000"。

:::note
此格式仅适合输出查询结果，但不适合解析数据。
:::

Pretty 格式支持输出总值（当使用 `WITH TOTALS` 时）和极值（当 'extremes' 设置为 1 时）。 
在这些情况下，总值和极值在主要数据之后输出，作为单独的表格。 
以下示例展示了使用 [`PrettyCompact`](./PrettyCompact.md) 格式的情况：

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
