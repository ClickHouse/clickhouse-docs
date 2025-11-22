---
description: '计算最大 `val` 对应的 `arg` 值。'
sidebar_position: 109
slug: /sql-reference/aggregate-functions/reference/argmax
title: 'argMax'
doc_type: 'reference'
---

# argMax

计算最大 `val` 值对应的 `arg`。如果存在多行记录具有相同的最大 `val` 值，则返回哪一个对应的 `arg` 是不确定的。
`arg` 和 `max` 两部分都作为[聚合函数](/sql-reference/aggregate-functions/index.md)工作，它们在处理过程中都会[跳过 `Null`](/sql-reference/aggregate-functions/index.md#null-processing)，并且在存在非 `Null` 值时返回非 `Null` 值。

**语法**

```sql
argMax(arg, val)
```

**参数**

* `arg` — 参数。
* `val` — 值。

**返回值**

* 与最大 `val` 对应的 `arg` 值。

类型：与 `arg` 类型一致。

**示例**

输入表：

```text
┌─user─────┬─salary─┐
│ director │   5000 │
│ manager  │   3000 │
│ worker   │   1000 │
└──────────┴────────┘
```

查询：

```sql
SELECT argMax(user, salary) FROM salary;
```

结果：

```text
┌─argMax(user, salary)─┐
│ director             │
└──────────────────────┘
```

**扩展示例**

```sql
CREATE TABLE test
(
    a Nullable(String),
    b Nullable(Int64)
)
ENGINE = Memory AS
SELECT *
FROM VALUES(('a', 1), ('b', 2), ('c', 2), (NULL, 3), (NULL, NULL), ('d', NULL));

SELECT * FROM test;
┌─a────┬────b─┐
│ a    │    1 │
│ b    │    2 │
│ c    │    2 │
│ ᴺᵁᴸᴸ │    3 │
│ ᴺᵁᴸᴸ │ ᴺᵁᴸᴸ │
│ d    │ ᴺᵁᴸᴸ │
└──────┴──────┘

SELECT argMax(a, b), max(b) FROM test;
┌─argMax(a, b)─┬─max(b)─┐
│ b            │      3 │ -- argMax = 'b',因为它是第一个非 NULL 值,max(b) 来自另一行!
└──────────────┴────────┘

SELECT argMax(tuple(a), b) FROM test;
┌─argMax(tuple(a), b)─┐
│ (NULL)              │ -- 仅包含一个 `NULL` 值的 `Tuple` 本身不是 `NULL`,因此聚合函数不会因该 `NULL` 值而跳过该行
└─────────────────────┘

SELECT (argMax((a, b), b) as t).1 argMaxA, t.2 argMaxB FROM test;
┌─argMaxA─┬─argMaxB─┐
│ ᴺᵁᴸᴸ    │       3 │ -- 可以使用 Tuple 获取对应 max(b) 的两列(所有列 - tuple(*))
└─────────┴─────────┘

SELECT argMax(a, b), max(b) FROM test WHERE a IS NULL AND b IS NULL;
┌─argMax(a, b)─┬─max(b)─┐
│ ᴺᵁᴸᴸ         │   ᴺᵁᴸᴸ │ -- 由于过滤条件,所有聚合行都至少包含一个 `NULL` 值,因此所有行都被跳过,结果为 `NULL`
└──────────────┴────────┘

SELECT argMax(a, (b,a)) FROM test;
┌─argMax(a, tuple(b, a))─┐
│ c                      │ -- 有两行 b=2,在 `Max` 中使用 `Tuple` 可以获取非第一个的 `arg`
└────────────────────────┘

SELECT argMax(a, tuple(b)) FROM test;
┌─argMax(a, tuple(b))─┐
│ b                   │ -- 可以在 `Max` 中使用 `Tuple` 以避免跳过 NULL 值
└─────────────────────┘
```

**另请参阅**

* [Tuple](/sql-reference/data-types/tuple.md)
