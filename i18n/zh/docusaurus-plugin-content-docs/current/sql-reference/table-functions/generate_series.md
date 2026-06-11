---
slug: /sql-reference/table-functions/generate_series
sidebar_position: 146
sidebar_label: 'generate_series'
title: 'generate_series (generateSeries)'
description: '返回一个只有名为 `generate_series` 的单列（UInt64）的表，该列包含从 start 到 stop（含端点）的整数。'
doc_type: 'reference'
---

别名：`generateSeries`

## 语法 \{#syntax\}

返回一个仅包含单列 &#39;generate&#95;series&#39; (类型为 `UInt64`) 的表，该列的取值为从 start 到 stop (含端点) 的整数：

```sql
generate_series(START, STOP)
```

返回一个仅包含名为 &#39;generate&#95;series&#39; 单列 (`UInt64`) 的表，该列包含从 `start` 到 `stop` (含端点) 的整数，数值之间的步长由 `STEP` 指定：

```sql
generate_series(START, STOP, STEP)
```

`STEP` 可以为负数，此时序列将按降序从 `START` 生成至 `STOP`。如果 `STEP` 为负数且 `START < STOP`，则结果为空。

## 示例 \{#examples\}

以下查询返回的表内容相同，但列名不同：

```sql
SELECT * FROM numbers(10, 5);
```

```response
┌─number─┐
│     10 │
│     11 │
│     12 │
│     13 │
│     14 │
└────────┘
```

```sql
SELECT * FROM generate_series(10, 14);
```

```response
┌─generate_series─┐
│              10 │
│              11 │
│              12 │
│              13 │
│              14 │
└─────────────────┘
```

以下查询将返回内容相同但列名不同的表 (不过第二种方式效率更高) ：

```sql
SELECT * FROM numbers(10, 11) WHERE number % 3 == (10 % 3);
```

```response
┌─number─┐
│     10 │
│     13 │
│     16 │
│     19 │
└────────┘
```

```sql
SELECT * FROM generate_series(10, 20, 3);
```

```response
┌─generate_series─┐
│              10 │
│              13 │
│              16 │
│              19 │
└─────────────────┘
```

生成降序序列：

```sql
SELECT * FROM generate_series(9, 0, -1);
```

```response
┌─generate_series─┐
│               9 │
│               8 │
│               7 │
│               6 │
│               5 │
│               4 │
│               3 │
│               2 │
│               1 │
│               0 │
└─────────────────┘
```