---
slug: /sql-reference/table-functions/numbers
sidebar_position: 145
sidebar_label: numbers
title: 'numbers'
description: '返回包含可指定整数的单个“number”列的表。'
---


# numbers 表函数

`numbers(N)` – 返回一个包含单个 'number' 列 (UInt64) 的表，该列包含从 0 到 N-1 的整数。  
`numbers(N, M)` - 返回一个包含单个 'number' 列 (UInt64) 的表，该列包含从 N 到 (N + M - 1) 的整数。  
`numbers(N, M, S)` - 返回一个包含单个 'number' 列 (UInt64) 的表，该列包含从 N 到 (N + M - 1) 的整数，步长为 S。

与 `system.numbers` 表类似，可以用于测试和生成连续值，`numbers(N, M)` 比 `system.numbers` 更高效。

以下查询是等效的：

``` sql
SELECT * FROM numbers(10);
SELECT * FROM numbers(0, 10);
SELECT * FROM system.numbers LIMIT 10;
SELECT * FROM system.numbers WHERE number BETWEEN 0 AND 9;
SELECT * FROM system.numbers WHERE number IN (0, 1, 2, 3, 4, 5, 6, 7, 8, 9);
```

以下查询也是等效的：

``` sql
SELECT number * 2 FROM numbers(10);
SELECT (number - 10) * 2 FROM numbers(10, 10);
SELECT * FROM numbers(0, 20, 2);
```

示例：

``` sql
-- 生成从 2010-01-01 到 2010-12-31 的日期序列
select toDate('2010-01-01') + number as d FROM numbers(365);
```
