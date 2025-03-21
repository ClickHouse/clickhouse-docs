---
slug: /sql-reference/table-functions/generate_series
sidebar_position: 146
sidebar_label: generate_series
title: 'generate_series (generateSeries)'
description: '返回一个包含单个“generate_series”列 (UInt64) 的表，该列包含从开始到结束的整数（包括起止值）。'
---


# generate_series (generateSeries) 表函数

`generate_series(START, STOP)`（别名：`generateSeries`） - 返回一个包含单个“generate_series”列 (UInt64) 的表，该列包含从开始到结束的整数（包括起止值）。

`generate_series(START, STOP, STEP)` - 返回一个包含单个“generate_series”列 (UInt64) 的表，该列包含从开始到结束的整数（包括起止值），值之间的间隔由 STEP 指定。

以下查询返回内容相同但列名不同的表：

``` sql
SELECT * FROM numbers(10, 5);
SELECT * FROM generate_series(10, 14);
```

以下查询返回内容相同但列名不同的表（但第二种选择更有效）：

``` sql
SELECT * FROM numbers(10, 11) WHERE number % 3 == (10 % 3);
SELECT * FROM generate_series(10, 20, 3) ;
```
