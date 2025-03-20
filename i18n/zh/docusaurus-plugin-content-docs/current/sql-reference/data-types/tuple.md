---
slug: /sql-reference/data-types/tuple
sidebar_position: 34
sidebar_label: Tuple(T1, T2, ...)
---


# Tuple(T1, T2, ...)

一个元素的元组，每个元素都有一个单独的 [type](/sql-reference/data-types)。 元组必须包含至少一个元素。

元组用于临时列分组。当查询中使用 IN 表达式时，可以对列进行分组，并用于指定 lambda 函数的某些形式参数。有关更多信息，请参见 [IN operators](../../sql-reference/operators/in.md) 和 [Higher order functions](/sql-reference/functions/overview#higher-order-functions) 部分。

元组可以是查询的结果。在这种情况下，对于 JSON 以外的文本格式，值在括号中以逗号分隔。在 JSON 格式中，元组作为数组输出（在方括号中）。

## 创建元组 {#creating-tuples}

您可以使用函数来创建一个元组：

``` sql
tuple(T1, T2, ...)
```

创建元组的示例：

``` sql
SELECT tuple(1, 'a') AS x, toTypeName(x)
```

``` text
┌─x───────┬─toTypeName(tuple(1, 'a'))─┐
│ (1,'a') │ Tuple(UInt8, String)      │
└─────────┴───────────────────────────┘
```

元组可以包含单个元素

示例：

``` sql
SELECT tuple('a') AS x;
```

``` text
┌─x─────┐
│ ('a') │
└───────┘
```

语法 `(tuple_element1, tuple_element2)` 可用于创建一个包含多个元素的元组，而无需调用 `tuple()` 函数。

示例：

``` sql
SELECT (1, 'a') AS x, (today(), rand(), 'someString') AS y, ('a') AS not_a_tuple;
```

``` text
┌─x───────┬─y──────────────────────────────────────┬─not_a_tuple─┐
│ (1,'a') │ ('2022-09-21',2006973416,'someString') │ a           │
└─────────┴────────────────────────────────────────┴─────────────┘
```

## 数据类型检测 {#data-type-detection}

在动态创建元组时，ClickHouse 会推断元组参数的类型为能够容纳提供的参数值的最小类型。如果值为 [NULL](/operations/settings/formats#input_format_null_as_default)，则推断的类型为 [Nullable](../../sql-reference/data-types/nullable.md)。

自动数据类型检测的示例：

``` sql
SELECT tuple(1, NULL) AS x, toTypeName(x)
```

``` text
┌─x─────────┬─toTypeName(tuple(1, NULL))──────┐
│ (1, NULL) │ Tuple(UInt8, Nullable(Nothing)) │
└───────────┴─────────────────────────────────┘
```

## 引用元组元素 {#referring-to-tuple-elements}

元组元素可以通过名称或索引进行引用：

``` sql
CREATE TABLE named_tuples (`a` Tuple(s String, i Int64)) ENGINE = Memory;
INSERT INTO named_tuples VALUES (('y', 10)), (('x',-10));

SELECT a.s FROM named_tuples; -- 通过名称
SELECT a.2 FROM named_tuples; -- 通过索引
```

结果：

``` text
┌─a.s─┐
│ y   │
│ x   │
└─────┘

┌─tupleElement(a, 2)─┐
│                 10 │
│                -10 │
└────────────────────┘
```

## 与元组的比较操作 {#comparison-operations-with-tuple}

两个元组通过从左到右顺序比较其元素进行比较。如果第一个元组的元素大于（小于）第二个元组的相应元素，则第一个元组大于（小于）第二个元组；否则（两个元素相等），比较下一个元素。

示例：

```sql
SELECT (1, 'z') > (1, 'a') c1, (2022, 01, 02) > (2023, 04, 02) c2, (1,2,3) = (3,2,1) c3;
```

``` text
┌─c1─┬─c2─┬─c3─┐
│  1 │  0 │  0 │
└────┴────┴────┘
```

现实世界示例：

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

-- 让我们为每个 key 找到最大 duration 的值，如果 duration 相等，则选择最大 value

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
