---
slug: /sql-reference/aggregate-functions/reference/argmin
sidebar_position: 110
title: 'argMin'
description: '计算最小 `val` 值的 `arg` 值。如果有多行相同的 `val` 为最大值，则返回的相关 `arg` 是不确定的。'
---


# argMin

计算最小 `val` 值的 `arg` 值。如果有多行相同的 `val` 为最大值，则返回的相关 `arg` 是不确定的。两个部分 `arg` 和 `min` 的行为如同 [aggregate functions](/sql-reference/aggregate-functions/index.md)，在处理过程中它们都会 [跳过 `Null`](/sql-reference/aggregate-functions/index.md#null-processing)，如果有不为 `Null` 的值，则返回非 `Null` 值。

**语法**

``` sql
argMin(arg, val)
```

**参数**

- `arg` — 参数。
- `val` — 值。

**返回值**

- 与最小 `val` 值对应的 `arg` 值。

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
SELECT argMin(user, salary) FROM salary
```

结果：

``` text
┌─argMin(user, salary)─┐
│ worker               │
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
FROM VALUES((NULL, 0), ('a', 1), ('b', 2), ('c', 2), (NULL, NULL), ('d', NULL));

select * from test;
┌─a────┬────b─┐
│ ᴺᵁᴸᴸ │    0 │
│ a    │    1 │
│ b    │    2 │
│ c    │    2 │
│ ᴺᵁᴸᴸ │ ᴺᵁᴸᴸ │
│ d    │ ᴺᵁᴸᴸ │
└──────┴──────┘

SELECT argMin(a, b), min(b) FROM test;
┌─argMin(a, b)─┬─min(b)─┐
│ a            │      0 │ -- argMin = a，因为它是第一个非 `NULL` 的值，min(b) 来自另一行！
└──────────────┴────────┘

SELECT argMin(tuple(a), b) FROM test;
┌─argMin(tuple(a), b)─┐
│ (NULL)              │ -- 参数 a 的 `Tuple` 仅包含一个 `NULL` 值，因此聚合函数不会因为这个 `NULL` 值而跳过那一行
└─────────────────────┘

SELECT (argMin((a, b), b) as t).1 argMinA, t.2 argMinB from test;
┌─argMinA─┬─argMinB─┐
│ ᴺᵁᴸᴸ    │       0 │ -- 您可以使用 `Tuple` 并获取与 max(b) 对应的 (all - tuple(*)) 所有列
└─────────┴─────────┘

SELECT argMin(a, b), min(b) FROM test WHERE a IS NULL and b IS NULL;
┌─argMin(a, b)─┬─min(b)─┐
│ ᴺᵁᴸᴸ         │   ᴺᵁᴸᴸ │ -- 所有聚合行至少包含一个 `NULL` 值，因为过滤器的原因，因此所有行都被跳过，因此结果将是 `NULL`
└──────────────┴────────┘

SELECT argMin(a, (b, a)), min(tuple(b, a)) FROM test;
┌─argMin(a, tuple(b, a))─┬─min(tuple(b, a))─┐
│ d                      │ (NULL,NULL)      │ -- 'd' 是 min 的第一个非 `NULL` 值
└────────────────────────┴──────────────────┘

SELECT argMin((a, b), (b, a)), min(tuple(b, a)) FROM test;
┌─argMin(tuple(a, b), tuple(b, a))─┬─min(tuple(b, a))─┐
│ (NULL,NULL)                      │ (NULL,NULL)      │ -- argMin 在这里返回 (NULL,NULL)，因为 `Tuple` 允许不跳过 `NULL`，而此例中的 min(tuple(b, a)) 是此数据集的最小值
└──────────────────────────────────┴──────────────────┘

SELECT argMin(a, tuple(b)) FROM test;
┌─argMin(a, tuple(b))─┐
│ d                   │ -- `Tuple` 可以在 `min` 中使用，以便不跳过 b 中的 `NULL` 行。
└─────────────────────┘
```

**另见**

- [Tuple](/sql-reference/data-types/tuple.md)
