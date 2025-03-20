---
slug: /sql-reference/table-functions/zeros
sidebar_position: 145
sidebar_label: zeros
title: 'zeros'
description: '用于测试目的，作为生成许多行的最快方法。类似于 `system.zeros` 和 `system.zeros_mt` 系统表。'
---


# zeros 表函数

* `zeros(N)` - 返回一个包含单个 'zero' 列 (UInt8) 的表，该列的值为整数 0，重复 `N` 次。
* `zeros_mt(N)` - 与 `zeros` 相同，但使用多个线程。

此函数用于测试目的，作为生成许多行的最快方法。类似于 `system.zeros` 和 `system.zeros_mt` 系统表。

以下查询是等效的：

``` sql
SELECT * FROM zeros(10);
SELECT * FROM system.zeros LIMIT 10;
SELECT * FROM zeros_mt(10);
SELECT * FROM system.zeros_mt LIMIT 10;
```

```response
┌─zero─┐
│    0 │
│    0 │
│    0 │
│    0 │
│    0 │
│    0 │
│    0 │
│    0 │
│    0 │
│    0 │
└──────┘
```
