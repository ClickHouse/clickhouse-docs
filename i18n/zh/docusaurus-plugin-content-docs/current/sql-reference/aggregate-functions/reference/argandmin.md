---
description: '计算 `val` 为最小值时对应的 `arg` 和 `val`。如果有多行记录的最小 `val` 相同，返回哪一行对应的 `arg` 和 `val` 是不确定的。'
sidebar_position: 111
slug: /sql-reference/aggregate-functions/reference/argandmin
title: 'argAndMin'
doc_type: 'reference'
---

# argAndMin

计算 `val` 取最小值时对应的 `arg` 和 `val`。如果存在多行记录的 `val` 相同且都是最小值，则具体返回哪一行对应的 `arg` 和 `val` 是不确定的。
`arg` 和 `min` 这两个部分都作为[聚合函数](/sql-reference/aggregate-functions/index.md)工作，在处理过程中它们都会[跳过 `Null`](/sql-reference/aggregate-functions/index.md#null-processing)，并且在存在非 `Null` 值时返回非 `Null` 值。

:::note
与 `argMin` 的唯一区别在于，`argAndMin` 同时返回参数和数值。
:::

**语法**

```sql
argAndMin(arg, val)
```

**参数**

* `arg` — 参数。
* `val` — 值。

**返回值**

* 与最小 `val` 值对应的 `arg` 值。
* `val` 的最小值。

类型：按顺序与 `arg`、`val` 类型相匹配的元组（tuple）。

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
SELECT argAndMin(user, salary) FROM salary
```

结果：

```text
┌─argAndMin(user, salary)─┐
│ ('worker',1000)         │
└─────────────────────────┘
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

SELECT argMin(a,b), argAndMin(a, b), min(b) FROM test;
┌─argMin(a, b)─┬─argAndMin(a, b)─┬─min(b)─┐
│ a            │ ('a',1)         │      0 │ -- argMin = a,因为它是第一个非 `NULL` 值,而 min(b) 来自另一行!
└──────────────┴─────────────────┴────────┘

SELECT argAndMin(tuple(a), b) FROM test;
┌─argAndMin((a), b)─┐
│ ((NULL),0)        │ -- 'a' `Tuple` 仅包含一个 `NULL` 值,但其本身不是 `NULL`,因此聚合函数不会因该 `NULL` 值而跳过该行
└───────────────────┘

SELECT (argAndMin((a, b), b) as t).1 argMinA, t.2 argMinB from test;
┌─argMinA──┬─argMinB─┐
│ (NULL,0) │       0 │ -- 您可以使用 `Tuple` 获取对应 min(b) 的两列(全部列 - tuple(*))
└──────────┴─────────┘

SELECT argAndMin(a, b), min(b) FROM test WHERE a IS NULL and b IS NULL;
┌─argAndMin(a, b)─┬─min(b)─┐
│ ('',0)          │   ᴺᵁᴸᴸ │ -- 由于过滤条件,所有聚合行都至少包含一个 `NULL` 值,因此所有行都被跳过,结果为 `NULL`
└─────────────────┴────────┘

SELECT argAndMin(a, (b, a)), min(tuple(b, a)) FROM test;
┌─argAndMin(a, (b, a))─┬─min((b, a))─┐
│ ('a',(1,'a'))        │ (0,NULL)    │ -- 'a' 是 min 对应的第一个非 `NULL` 值
└──────────────────────┴─────────────┘

SELECT argAndMin((a, b), (b, a)), min(tuple(b, a)) FROM test;
┌─argAndMin((a, b), (b, a))─┬─min((b, a))─┐
│ ((NULL,0),(0,NULL))       │ (0,NULL)    │ -- argAndMin 在此处返回 ((NULL,0),(0,NULL)),因为 `Tuple` 允许不跳过 `NULL` 值,此时 min(tuple(b, a)) 是该数据集的最小值
└───────────────────────────┴─────────────┘

SELECT argAndMin(a, tuple(b)) FROM test;
┌─argAndMin(a, (b))─┐
│ ('a',(1))         │ -- `Tuple` 可以在 `min` 中使用,以不跳过 b 中包含 `NULL` 值的行
└───────────────────┘
```

**另请参阅**

* [argMin](/sql-reference/aggregate-functions/reference/argmin.md)
* [Tuple](/sql-reference/data-types/tuple.md)
