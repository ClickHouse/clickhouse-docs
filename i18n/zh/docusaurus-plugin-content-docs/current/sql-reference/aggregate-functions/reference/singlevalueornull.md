---
description: '聚合函数 `singleValueOrNull` 用于实现子查询运算符，例如 `x = ALL (SELECT ...)`。它用于检查数据中是否存在且仅存在一个唯一的非 NULL 值。'
sidebar_position: 184
slug: /sql-reference/aggregate-functions/reference/singlevalueornull
title: 'singleValueOrNull'
doc_type: 'reference'
---

# singleValueOrNull

聚合函数 `singleValueOrNull` 用于实现子查询运算符，例如 `x = ALL (SELECT ...)`。它会检查数据中是否存在且仅存在一个唯一的非 NULL 值。
如果恰好只有一个这样的值，则返回该值。如果没有值，或存在至少两个不同的值，则返回 NULL。

**语法**

```sql
singleValueOrNull(x)
```

**参数**

* `x` — 任意[数据类型](../../data-types/index.md)的列（不包括 [Map](../../data-types/map.md)、[Array](../../data-types/array.md) 或 [Tuple](../../data-types/tuple)，这些类型不能为 [Nullable](../../data-types/nullable.md) 类型）。

**返回值**

* 当 `x` 中只有一个唯一的非 NULL 值时，返回该唯一值。
* 当不存在任何值或存在至少两个不同值时，返回 `NULL`。

**示例**

查询：

```sql
CREATE TABLE test (x UInt8 NULL) ENGINE=Log;
INSERT INTO test (x) VALUES (NULL), (NULL), (5), (NULL), (NULL);
SELECT singleValueOrNull(x) FROM test;
```

结果：

```response
┌─singleValueOrNull(x)─┐
│                    5 │
└──────────────────────┘
```

查询：

```sql
INSERT INTO test (x) VALUES (10);
SELECT singleValueOrNull(x) FROM test;
```

结果：

```response
┌─singleValueOrNull(x)─┐
│                 ᴺᵁᴸᴸ │
└──────────────────────┘
```
