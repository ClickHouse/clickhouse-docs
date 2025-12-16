---
description: '计算最大 `val` 值对应的 `arg` 和 `val`。如果存在多行记录的 `val` 相同且为最大值，则返回哪一行对应的 `arg` 和 `val` 是不确定的。'
sidebar_position: 111
slug: /sql-reference/aggregate-functions/reference/argandmax
title: 'argAndMax'
doc_type: 'reference'
---

# argAndMax {#argandmax}

计算最大 `val` 值所对应的 `arg` 和 `val` 值。如果存在多行具有相同的最大 `val` 值,返回哪个关联的 `arg` 和 `val` 是不确定的。
`arg` 和 `max` 两部分均作为[聚合函数](/sql-reference/aggregate-functions/index.md)运行,它们在处理过程中都会[跳过 `Null`](/sql-reference/aggregate-functions/index.md#null-processing),并在有非 `Null` 值可用时返回非 `Null` 值。

:::note
与 `argMax` 的唯一区别在于,`argAndMax` 会同时返回参数和值。
:::

**语法**

```sql
argAndMax(arg, val)
```

**参数**

* `arg` — 参数。
* `val` — 值。

**返回值**

* 与 `val` 的最大值对应的 `arg` 值。
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

查询:

```sql
SELECT argAndMax(user, salary) FROM salary;
```

结果:

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
│ b            │ ('b',2)         │      3 │ -- argMax = b because it the first not Null value, max(b) is from another row!
└──────────────┴─────────────────┴────────┘

SELECT argAndMax(tuple(a), b) FROM test;
┌─argAndMax((a), b)─┐
│ ((NULL),3)        │-- The a `Tuple` that contains only a `NULL` value is not `NULL`, so the aggregate functions won't skip that row because of that `NULL` value
└───────────────────┘

SELECT (argMax((a, b), b) as t).1 argMaxA, t.2 argMaxB FROM test;
┌─argMaxA──┬─argMaxB─┐
│ (NULL,3) │       3 │ -- you can use Tuple and get both (all - tuple(*)) columns for the according max(b)
└──────────┴─────────┘

SELECT argAndMax(a, b), max(b) FROM test WHERE a IS NULL AND b IS NULL;
┌─argAndMax(a, b)─┬─max(b)─┐
│ ('',0)          │   ᴺᵁᴸᴸ │-- All aggregated rows contains at least one `NULL` value because of the filter, so all rows are skipped, therefore the result will be `NULL`
└─────────────────┴────────┘

SELECT argAndMax(a, (b,a)) FROM test;
┌─argAndMax(a, (b, a))─┐
│ ('c',(2,'c'))        │ -- There are two rows with b=2, `Tuple` in the `Max` allows to get not the first `arg`
└──────────────────────┘

SELECT argAndMax(a, tuple(b)) FROM test;
┌─argAndMax(a, (b))─┐
│ ('b',(2))         │ -- `Tuple` can be used in `Max` to not skip Nulls in `Max`
└───────────────────┘
```

**另请参阅**

* [argMax](/sql-reference/aggregate-functions/reference/argmax.md)
* [Tuple](/sql-reference/data-types/tuple.md)