---
slug: /sql-reference/aggregate-functions/reference/avgweighted
sidebar_position: 113
title: 'avgWeighted'
description: '计算加权算术平均数。'
---


# avgWeighted

计算[加权算术平均数](https://en.wikipedia.org/wiki/Weighted_arithmetic_mean)。

**语法**

``` sql
avgWeighted(x, weight)
```

**参数**

- `x` — 值。
- `weight` — 值的权重。

`x` 和 `weight` 必须都是
[整数](../../../sql-reference/data-types/int-uint.md) 或 [浮点数](../../../sql-reference/data-types/float.md)，
但可以具有不同的类型。

**返回值**

- 如果所有权重均为0或提供的权重参数为空，返回 `NaN`。
- 否则返回加权平均数。

**返回类型** 始终为 [Float64](../../../sql-reference/data-types/float.md)。

**示例**

查询：

``` sql
SELECT avgWeighted(x, w)
FROM values('x Int8, w Int8', (4, 1), (1, 0), (10, 2))
```

结果：

``` text
┌─avgWeighted(x, weight)─┐
│                      8 │
└────────────────────────┘
```

**示例**

查询：

``` sql
SELECT avgWeighted(x, w)
FROM values('x Int8, w Float64', (4, 1), (1, 0), (10, 2))
```

结果：

``` text
┌─avgWeighted(x, weight)─┐
│                      8 │
└────────────────────────┘
```

**示例**

查询：

``` sql
SELECT avgWeighted(x, w)
FROM values('x Int8, w Int8', (0, 0), (1, 0), (10, 0))
```

结果：

``` text
┌─avgWeighted(x, weight)─┐
│                    nan │
└────────────────────────┘
```

**示例**

查询：

``` sql
CREATE table test (t UInt8) ENGINE = Memory;
SELECT avgWeighted(t) FROM test
```

结果：

``` text
┌─avgWeighted(x, weight)─┐
│                    nan │
└────────────────────────┘
```
