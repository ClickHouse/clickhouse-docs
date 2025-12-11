---
description: '同时计算数值之和和行数。该函数被 ClickHouse 查询优化器使用：如果一个查询中存在多个 `sum`、`count` 或 `avg` 函数，它们可以被替换为单个 `sumCount` 函数以重用计算。通常无需显式调用该函数。'
sidebar_position: 196
slug: /sql-reference/aggregate-functions/reference/sumcount
title: 'sumCount'
doc_type: 'reference'
---

同时计算数值之和和行数。该函数被 ClickHouse 查询优化器使用：如果一个查询中存在多个 `sum`、`count` 或 `avg` 函数，它们可以被替换为单个 `sumCount` 函数以重用计算。通常无需显式调用该函数。

**语法**

```sql
sumCount(x)
```

**参数**

* `x` — 输入值，必须是 [Integer](../../../sql-reference/data-types/int-uint.md)、[Float](../../../sql-reference/data-types/float.md) 或 [Decimal](../../../sql-reference/data-types/decimal.md)。

**返回值**

* 元组 `(sum, count)`，其中 `sum` 是数值之和，`count` 是非 NULL 值行的行数。

类型：[Tuple](../../../sql-reference/data-types/tuple.md)。

**示例**

查询：

```sql
CREATE TABLE s_table (x Int8) ENGINE = Log;
INSERT INTO s_table SELECT number FROM numbers(0, 20);
INSERT INTO s_table VALUES (NULL);
SELECT sumCount(x) FROM s_table;
```

结果：

```text
┌─sumCount(x)─┐
│ (190,20)    │
└─────────────┘
```

**另请参阅**

* [optimize&#95;syntax&#95;fuse&#95;functions](../../../operations/settings/settings.md#optimize_syntax_fuse_functions) 设置。
