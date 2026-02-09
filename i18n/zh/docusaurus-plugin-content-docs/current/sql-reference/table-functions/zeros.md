---
description: '在测试场景中用于以最快方式生成大量行。类似于 `system.zeros` 和 `system.zeros_mt` 系统表。'
sidebar_label: 'zeros'
sidebar_position: 145
slug: /sql-reference/table-functions/zeros
title: 'zeros'
doc_type: 'reference'
---

# zeros 表函数 \{#zeros-table-function\}

* `zeros(N)` – 返回一个仅包含单个名为 `zero` 的列（UInt8 类型）的表，该列中包含整数 0，共出现 `N` 次。
* `zeros_mt(N)` – 与 `zeros` 相同，但使用多线程。

此函数用于测试目的，是生成大量行的最高效方法。与 `system.zeros` 和 `system.zeros_mt` 系统表类似。

以下查询等价：

```sql
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
