---
description: '计算最小 `val` 值对应的 `arg` 值。如果存在多行记录的 `val` 具有相同的最小值，则返回哪一个对应的 `arg` 是非确定性的。'
sidebar_position: 110
slug: /sql-reference/aggregate-functions/reference/argmin
title: 'argMin'
doc_type: 'reference'
---

# argMin

计算具有最小 `val` 值时对应的 `arg` 值。如果存在多行的 `val` 相同且为最小值，则最终返回哪一行的 `arg` 是不确定的。
`arg` 部分和 `min` 部分都作为[聚合函数](/sql-reference/aggregate-functions/index.md)工作，它们在处理过程中都会[跳过 `Null`](/sql-reference/aggregate-functions/index.md#null-processing)，并且在存在非 `Null` 值时返回非 `Null` 值。

**语法**

```sql
argMin(arg, val)
```

**参数**

* `arg` — 参数。
* `val` — 值。

**返回值**

* `val` 最小值对应的 `arg`。

类型：与 `arg` 相同。

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
SELECT argMin(user, salary) FROM salary
```

结果：

```text
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

SELECT * FROM test;
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
│ a            │      0 │ -- argMin = a,因为它是第一个非 `NULL` 值,min(b) 来自另一行!
└──────────────┴────────┘

SELECT argMin(tuple(a), b) FROM test;
┌─argMin(tuple(a), b)─┐
│ (NULL)              │ -- 仅包含 `NULL` 值的 `Tuple` 本身不是 `NULL`,因此聚合函数不会因该 `NULL` 值而跳过该行
└─────────────────────┘

SELECT (argMin((a, b), b) as t).1 argMinA, t.2 argMinB from test;
┌─argMinA─┬─argMinB─┐
│ ᴺᵁᴸᴸ    │       0 │ -- 可以使用 `Tuple` 获取对应 max(b) 的所有列(all - tuple(*))
└─────────┴─────────┘

SELECT argMin(a, b), min(b) FROM test WHERE a IS NULL and b IS NULL;
┌─argMin(a, b)─┬─min(b)─┐
│ ᴺᵁᴸᴸ         │   ᴺᵁᴸᴸ │ -- 由于过滤条件,所有聚合行都至少包含一个 `NULL` 值,因此所有行都被跳过,结果为 `NULL`
└──────────────┴────────┘

SELECT argMin(a, (b, a)), min(tuple(b, a)) FROM test;
┌─argMin(a, tuple(b, a))─┬─min(tuple(b, a))─┐
│ d                      │ (NULL,NULL)      │ -- 'd' 是 min 对应的第一个非 `NULL` 值
└────────────────────────┴──────────────────┘

SELECT argMin((a, b), (b, a)), min(tuple(b, a)) FROM test;
┌─argMin(tuple(a, b), tuple(b, a))─┬─min(tuple(b, a))─┐
│ (NULL,NULL)                      │ (NULL,NULL)      │ -- argMin 在此返回 (NULL,NULL),因为 `Tuple` 允许不跳过 `NULL`,而 min(tuple(b, a)) 在此情况下是该数据集的最小值
└──────────────────────────────────┴──────────────────┘

SELECT argMin(a, tuple(b)) FROM test;
┌─argMin(a, tuple(b))─┐
│ d                   │ -- `Tuple` 可用于 `min` 中以不跳过 b 为 `NULL` 值的行
└─────────────────────┘
```

**另请参见**

* [Tuple](/sql-reference/data-types/tuple.md)
