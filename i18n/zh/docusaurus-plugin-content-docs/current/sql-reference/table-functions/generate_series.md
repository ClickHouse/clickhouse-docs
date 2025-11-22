---
slug: /sql-reference/table-functions/generate_series
sidebar_position: 146
sidebar_label: 'generate_series'
title: 'generate_series（generateSeries）'
description: '返回一张仅包含名为 `generate_series` 的单列表（UInt64 类型），该列包含从 start 到 stop（含端点）的整数。'
doc_type: 'reference'
---



# generate_series 表函数

别名：`generateSeries`



## 语法 {#syntax}

返回一个包含单列 'generate_series'(`UInt64`)的表,该列包含从 start 到 stop 的整数(包含边界值):

```sql
generate_series(START, STOP)
```

返回一个包含单列 'generate_series'(`UInt64`)的表,该列包含从 start 到 stop 的整数(包含边界值),值之间的间隔由 `STEP` 指定:

```sql
generate_series(START, STOP, STEP)
```


## Examples {#examples}

以下查询返回内容相同但列名不同的表：

```sql
SELECT * FROM numbers(10, 5);
SELECT * FROM generate_series(10, 14);
```

以下查询同样返回内容相同但列名不同的表（但第二种方式效率更高）：

```sql
SELECT * FROM numbers(10, 11) WHERE number % 3 == (10 % 3);
SELECT * FROM generate_series(10, 20, 3);
```
