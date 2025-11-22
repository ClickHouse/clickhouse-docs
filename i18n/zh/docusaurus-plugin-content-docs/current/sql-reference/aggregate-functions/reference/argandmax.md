---
description: '计算最大 `val` 值对应的 `arg` 和 `val`。如果有多行记录的最大 `val` 相同，则无法保证返回的是哪一行对应的 `arg` 和 `val`。'
sidebar_position: 111
slug: /sql-reference/aggregate-functions/reference/argandmax
title: 'argAndMax'
doc_type: 'reference'
---

# argAndMax

计算最大 `val` 值所对应的 `arg` 和 `val` 值。如果存在多行具有相同的最大 `val` 值,则返回哪个关联的 `arg` 和 `val` 是不确定的。
`arg` 和 `max` 两部分均作为[聚合函数](/sql-reference/aggregate-functions/index.md)运行,它们在处理过程中都会[跳过 `Null` 值](/sql-reference/aggregate-functions/index.md#null-processing),并在存在非 `Null` 值时返回非 `Null` 值。

:::note
与 `argMax` 唯一的区别在于,`argAndMax` 会同时返回参数和值。
:::

**语法**

```sql
argAndMax(arg, val)
```

**参数**

* `arg` — 参数。
* `val` — 值。

**返回值**

* 与最大 `val` 值对应的 `arg` 值。
* `val` 的最大值

类型:元组,分别与 `arg`、`val` 的类型相匹配。

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
SELECT argAndMax(user, salary) FROM salary;
```

结果：

```text
┌─argAndMax(user, salary)─┐
│ ('director',5000)       │
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

SELECT argMax(a, b), argAndMax(a, b), max(b) FROM test;
┌─argMax(a, b)─┬─argAndMax(a, b)─┬─max(b)─┐
│ b            │ ('b',2)         │      3 │ -- argMax = b 因为它是第一个非 NULL 值,max(b) 来自另一行!
└──────────────┴─────────────────┴────────┘

SELECT argAndMax(tuple(a), b) FROM test;
┌─argAndMax((a), b)─┐
│ ((NULL),3)        │-- 仅包含 `NULL` 值的 `Tuple` 本身不是 `NULL`,因此聚合函数不会因该 `NULL` 值而跳过该行
└───────────────────┘

SELECT (argMax((a, b), b) as t).1 argMaxA, t.2 argMaxB FROM test;
┌─argMaxA──┬─argMaxB─┐
│ (NULL,3) │       3 │ -- 可以使用 Tuple 获取对应 max(b) 的两列(所有列 - tuple(*))
└──────────┴─────────┘

SELECT argAndMax(a, b), max(b) FROM test WHERE a IS NULL AND b IS NULL;
┌─argAndMax(a, b)─┬─max(b)─┐
│ ('',0)          │   ᴺᵁᴸᴸ │-- 由于过滤条件,所有聚合行都至少包含一个 `NULL` 值,因此所有行都被跳过,结果为 `NULL`
└─────────────────┴────────┘

SELECT argAndMax(a, (b,a)) FROM test;
┌─argAndMax(a, (b, a))─┐
│ ('c',(2,'c'))        │ -- 有两行 b=2,在 `Max` 中使用 `Tuple` 可以获取非首个 `arg`
└──────────────────────┘

SELECT argAndMax(a, tuple(b)) FROM test;
┌─argAndMax(a, (b))─┐
│ ('b',(2))         │ -- 可以在 `Max` 中使用 `Tuple` 以避免跳过 NULL 值
└───────────────────┘
```

**另请参阅**

- [argMax](/sql-reference/aggregate-functions/reference/argmax.md)
- [Tuple](/sql-reference/data-types/tuple.md)