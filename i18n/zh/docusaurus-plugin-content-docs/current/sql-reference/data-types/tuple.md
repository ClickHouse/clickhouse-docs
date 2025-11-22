---
description: 'ClickHouse 中 Tuple（元组）数据类型的文档'
sidebar_label: 'Tuple(T1, T2, ...)'
sidebar_position: 34
slug: /sql-reference/data-types/tuple
title: 'Tuple(T1, T2, ...)'
doc_type: 'reference'
---



# Tuple(T1, T2, ...)

一个元组，由若干元素组成，每个元素都有各自的[类型](/sql-reference/data-types)。Tuple 必须至少包含一个元素。

元组用于临时对列进行分组。当在查询中使用 IN 表达式时可以对列进行分组，也可用于指定 lambda 函数的某些形式参数。更多信息参见 [IN 运算符](../../sql-reference/operators/in.md)和[高阶函数](/sql-reference/functions/overview#higher-order-functions)章节。

元组可以作为查询结果返回。在这种情况下，对于除 JSON 以外的其他文本格式，值以逗号分隔并包裹在括号中。在 JSON 格式中，元组以数组形式输出（使用方括号）。



## 创建元组 {#creating-tuples}

可以使用函数来创建元组:

```sql
tuple(T1, T2, ...)
```

创建元组的示例:

```sql
SELECT tuple(1, 'a') AS x, toTypeName(x)
```

```text
┌─x───────┬─toTypeName(tuple(1, 'a'))─┐
│ (1,'a') │ Tuple(UInt8, String)      │
└─────────┴───────────────────────────┘
```

元组可以包含单个元素

示例:

```sql
SELECT tuple('a') AS x;
```

```text
┌─x─────┐
│ ('a') │
└───────┘
```

可以使用语法 `(tuple_element1, tuple_element2)` 来创建包含多个元素的元组,而无需调用 `tuple()` 函数。

示例:

```sql
SELECT (1, 'a') AS x, (today(), rand(), 'someString') AS y, ('a') AS not_a_tuple;
```

```text
┌─x───────┬─y──────────────────────────────────────┬─not_a_tuple─┐
│ (1,'a') │ ('2022-09-21',2006973416,'someString') │ a           │
└─────────┴────────────────────────────────────────┴─────────────┘
```


## 数据类型检测 {#data-type-detection}

在动态创建元组时,ClickHouse 会将元组参数的类型推断为能够容纳所提供参数值的最小类型。如果值为 [NULL](/operations/settings/formats#input_format_null_as_default),则推断的类型为 [Nullable](../../sql-reference/data-types/nullable.md)。

自动数据类型检测示例:

```sql
SELECT tuple(1, NULL) AS x, toTypeName(x)
```

```text
┌─x─────────┬─toTypeName(tuple(1, NULL))──────┐
│ (1, NULL) │ Tuple(UInt8, Nullable(Nothing)) │
└───────────┴─────────────────────────────────┘
```


## 引用元组元素 {#referring-to-tuple-elements}

元组元素可以通过名称或索引来引用:

```sql
CREATE TABLE named_tuples (`a` Tuple(s String, i Int64)) ENGINE = Memory;
INSERT INTO named_tuples VALUES (('y', 10)), (('x',-10));

SELECT a.s FROM named_tuples; -- 按名称引用
SELECT a.2 FROM named_tuples; -- 按索引引用
```

结果:

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


## 元组的比较操作 {#comparison-operations-with-tuple}

两个元组通过从左到右依次比较其元素来进行比较。如果第一个元组的元素大于(小于)第二个元组的对应元素,则第一个元组大于(小于)第二个元组;否则(两个元素相等时),继续比较下一个元素。

示例:

```sql
SELECT (1, 'z') > (1, 'a') c1, (2022, 01, 02) > (2023, 04, 02) c2, (1,2,3) = (3,2,1) c3;
```

```text
┌─c1─┬─c2─┬─c3─┐
│  1 │  0 │  0 │
└────┴────┴────┘
```

实际应用示例:

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

-- 为每个键查找持续时间最长的值,如果持续时间相等,则选择值最大的

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
