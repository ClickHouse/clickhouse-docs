---
slug: /sql-reference/aggregate-functions/reference/argmax
sidebar_position: 109
title: 'argMax'
description: '计算最大 `val` 值的 `arg` 值。'
---


# argMax

计算最大 `val` 值的 `arg` 值。如果有多行的 `val` 值相等且为最大值，则返回哪个关联的 `arg` 值是不可预知的。两个部分 `arg` 和 `max` 的行为都作为 [聚合函数](/sql-reference/aggregate-functions/index.md)，在处理过程中都会 [跳过 `Null`](/sql-reference/aggregate-functions/index.md#null-processing)，如果有可用的非 `Null` 值，则返回非 `Null` 值。

**语法**

``` sql
argMax(arg, val)
```

**参数**

- `arg` — 参数。
- `val` — 值。

**返回值**

- 与最大 `val` 值对应的 `arg` 值。

类型：与 `arg` 类型匹配。

**示例**

输入表：

``` text
┌─user─────┬─salary─┐
│ director │   5000 │
│ manager  │   3000 │
│ worker   │   1000 │
└──────────┴────────┘
```

查询：

``` sql
SELECT argMax(user, salary) FROM salary;
```

结果：

``` text
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

select * from test;
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
│ b            │      3 │ -- argMax = 'b' 因为它是第一个非 Null 值，max(b) 来自另一行!
└──────────────┴────────┘

SELECT argMax(tuple(a), b) FROM test;
┌─argMax(tuple(a), b)─┐
│ (NULL)              │ -- 包含仅一个 `NULL` 值的 `Tuple` 不为 `NULL`，因此聚合函数不会因该 `NULL` 值跳过该行
└─────────────────────┘

SELECT (argMax((a, b), b) as t).1 argMaxA, t.2 argMaxB FROM test;
┌─argMaxA─┬─argMaxB─┐
│ ᴺᵁᴸᴸ    │       3 │ -- 你可以使用 Tuple 并获得与 max(b) 相应的所有 (all - tuple(*)) 列
└─────────┴─────────┘

SELECT argMax(a, b), max(b) FROM test WHERE a IS NULL AND b IS NULL;
┌─argMax(a, b)─┬─max(b)─┐
│ ᴺᵁᴸᴸ         │   ᴺᵁᴸᴸ │ -- 所有聚合行至少包含一个 `NULL` 值，因此结果将为 `NULL`
└──────────────┴────────┘

SELECT argMax(a, (b,a)) FROM test;
┌─argMax(a, tuple(b, a))─┐
│ c                      │ -- 有两行 b=2, `Tuple` 在 `Max` 中允许获取不是第一个的 `arg`
└────────────────────────┘

SELECT argMax(a, tuple(b)) FROM test;
┌─argMax(a, tuple(b))─┐
│ b                   │ -- `Tuple` 可以在 `Max` 中使用，以不跳过 Null 值
└─────────────────────┘
```

**另见**

- [Tuple](/sql-reference/data-types/tuple.md)
