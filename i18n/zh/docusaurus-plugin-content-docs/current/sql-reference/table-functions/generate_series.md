---
slug: /sql-reference/table-functions/generate_series
sidebar_position: 146
sidebar_label: 'generate_series'
title: 'generate_series (generateSeries)'
description: '返回一个只有名为 `generate_series` 的单列（UInt64）的表，该列包含从 start 到 stop（含端点）的整数。'
doc_type: 'reference'
---

# generate&#95;series 表函数 \{#generate&#95;series-table-function\}

别名：`generateSeries`

## 语法 \{#syntax\}

返回一个仅包含单列 &#39;generate&#95;series&#39;（类型为 `UInt64`）的表，该列的取值为从 start 到 stop（含端点）的整数：

```sql
generate_series(START, STOP)
```

返回一个仅包含名为 &#39;generate&#95;series&#39; 单列（`UInt64`）的表，该列包含从 `start` 到 `stop`（含端点）的整数，数值之间的步长由 `STEP` 指定：

```sql
generate_series(START, STOP, STEP)
```

## 示例 \{#examples\}

以下查询返回的表内容相同，但列名不同：

```sql
SELECT * FROM numbers(10, 5);
SELECT * FROM generate_series(10, 14);
```

以下查询将返回内容相同但列名不同的表（不过第二种方式效率更高）：

```sql
SELECT * FROM numbers(10, 11) WHERE number % 3 == (10 % 3);
SELECT * FROM generate_series(10, 20, 3);
```
