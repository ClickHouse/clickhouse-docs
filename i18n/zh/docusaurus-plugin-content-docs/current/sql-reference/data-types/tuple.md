---
description: 'ClickHouse 中 Tuple 数据类型文档'
sidebar_label: 'Tuple(T1, T2, ...)'
sidebar_position: 34
slug: /sql-reference/data-types/tuple
title: 'Tuple(T1, T2, ...)'
doc_type: 'reference'
---

# Tuple(T1, T2, ...) \\{#tuplet1-t2\\}

一个由多个元素组成的元组，每个元素都有各自的[类型](/sql-reference/data-types)。元组必须至少包含一个元素。

元组用于对列进行临时分组。在查询中使用 IN 表达式时可以对列进行分组，也可用于指定 lambda 函数的某些形式参数。更多信息请参阅 [IN 运算符](../../sql-reference/operators/in.md) 和 [高阶函数](/sql-reference/functions/overview#higher-order-functions) 章节。

元组可以作为查询结果返回。在这种情况下，对于除 JSON 以外的文本格式，值会以逗号分隔并包裹在圆括号中。在 JSON 格式中，元组会以数组形式输出（使用方括号）。

## 创建元组 \\{#creating-tuples\\}

你可以使用函数创建元组：

```sql
tuple(T1, T2, ...)
```

创建元组的示例：

```sql
SELECT tuple(1, 'a') AS x, toTypeName(x)
```

```text
┌─x───────┬─toTypeName(tuple(1, 'a'))─┐
│ (1,'a') │ Tuple(UInt8, String)      │
└─────────┴───────────────────────────┘
```

一个元组（Tuple）可以只包含一个元素

示例：

```sql
SELECT tuple('a') AS x;
```

```text
┌─x─────┐
│ ('a') │
└───────┘
```

语法 `(tuple_element1, tuple_element2)` 可用于在不调用 `tuple()` 函数的情况下创建一个包含多个元素的元组。

示例：

```sql
SELECT (1, 'a') AS x, (today(), rand(), 'someString') AS y, ('a') AS not_a_tuple;
```

```text
┌─x───────┬─y──────────────────────────────────────┬─not_a_tuple─┐
│ (1,'a') │ ('2022-09-21',2006973416,'someString') │ a           │
└─────────┴────────────────────────────────────────┴─────────────┘
```

## 数据类型检测 \\{#data-type-detection\\}

在动态创建 tuple 时，ClickHouse 会将 tuple 参数的类型推断为能够容纳给定参数值的最小类型。 如果该值为 [NULL](/operations/settings/formats#input_format_null_as_default)，则推断出的类型为 [Nullable](../../sql-reference/data-types/nullable.md)。

自动数据类型检测示例：

```sql
SELECT tuple(1, NULL) AS x, toTypeName(x)
```

```text
┌─x─────────┬─toTypeName(tuple(1, NULL))──────┐
│ (1, NULL) │ Tuple(UInt8, Nullable(Nothing)) │
└───────────┴─────────────────────────────────┘
```

## 引用 Tuple 元素 \\{#referring-to-tuple-elements\\}

Tuple 元素可以通过名称或索引进行引用：

```sql
CREATE TABLE named_tuples (`a` Tuple(s String, i Int64)) ENGINE = Memory;
INSERT INTO named_tuples VALUES (('y', 10)), (('x',-10));

SELECT a.s FROM named_tuples; -- by name
SELECT a.2 FROM named_tuples; -- by index
```

结果：

```text
┌─a.s─┐
│ y   │
│ x   │
└─────┘

┌─tupleElement(a, 2)─┐
│                 10 │
│                -10 │
└────────────────────┘
```

## 使用 Tuple 的比较操作 \\{#comparison-operations-with-tuple\\}

两个 Tuple 的比较是通过从左到右依次比较它们的元素来完成的。若第一个 Tuple 的某个元素大于（小于）第二个 Tuple 中对应的元素，则认为第一个 Tuple 大于（小于）第二个 Tuple；否则（当这两个元素相等时），继续比较下一个元素。

示例：

```sql
SELECT (1, 'z') > (1, 'a') c1, (2022, 01, 02) > (2023, 04, 02) c2, (1,2,3) = (3,2,1) c3;
```

```text
┌─c1─┬─c2─┬─c3─┐
│  1 │  0 │  0 │
└────┴────┴────┘
```

实际案例：

```sql
CREATE TABLE test
(
    `year` Int16,
    `month` Int8,
    `day` Int8
)
ENGINE = Memory AS
SELECT *
FROM values((2022, 12, 31), (2000, 1, 1));

SELECT * FROM test;

┌─year─┬─month─┬─day─┐
│ 2022 │    12 │  31 │
│ 2000 │     1 │   1 │
└──────┴───────┴─────┘

SELECT *
FROM test
WHERE (year, month, day) > (2010, 1, 1);

┌─year─┬─month─┬─day─┐
│ 2022 │    12 │  31 │
└──────┴───────┴─────┘
CREATE TABLE test
(
    `key` Int64,
    `duration` UInt32,
    `value` Float64
)
ENGINE = Memory AS
SELECT *
FROM values((1, 42, 66.5), (1, 42, 70), (2, 1, 10), (2, 2, 0));

SELECT * FROM test;

┌─key─┬─duration─┬─value─┐
│   1 │       42 │  66.5 │
│   1 │       42 │    70 │
│   2 │        1 │    10 │
│   2 │        2 │     0 │
└─────┴──────────┴───────┘

-- Let's find a value for each key with the biggest duration, if durations are equal, select the biggest value

SELECT
    key,
    max(duration),
    argMax(value, (duration, value))
FROM test
GROUP BY key
ORDER BY key ASC;

┌─key─┬─max(duration)─┬─argMax(value, tuple(duration, value))─┐
│   1 │            42 │                                    70 │
│   2 │             2 │                                     0 │
└─────┴───────────────┴───────────────────────────────────────┘
```
