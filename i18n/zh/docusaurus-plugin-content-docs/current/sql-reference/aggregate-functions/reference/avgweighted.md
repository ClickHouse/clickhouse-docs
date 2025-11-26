---
description: '计算加权算术平均数。'
sidebar_position: 113
slug: /sql-reference/aggregate-functions/reference/avgweighted
title: 'avgWeighted'
doc_type: 'reference'
---

# avgWeighted

计算[加权算术平均值](https://en.wikipedia.org/wiki/Weighted_arithmetic_mean)。

**语法**

```sql
avgWeighted(x, weight)
```

**参数**

* `x` — 数值。
* `weight` — 对应数值的权重。

`x` 和 `weight` 都必须是
[整数类型 (Integer)](../../../sql-reference/data-types/int-uint.md) 或 [浮点类型 (floating-point)](../../../sql-reference/data-types/float.md)，
但它们可以是不同的数据类型。

**返回值**

* 当所有权重都等于 0，或传入的权重参数为空时，返回 `NaN`。
* 否则返回加权平均值。

**返回类型** 始终为 [Float64](../../../sql-reference/data-types/float.md)。

**示例**

查询：

```sql
SELECT avgWeighted(x, w)
FROM VALUES('x Int8, w Int8', (4, 1), (1, 0), (10, 2))
```

结果：

```text
┌─avgWeighted(x, weight)─┐
│                      8 │
└────────────────────────┘
```

**示例**

查询：

```sql
SELECT avgWeighted(x, w)
FROM VALUES('x Int8, w Float64', (4, 1), (1, 0), (10, 2))
```

结果：

```text
┌─avgWeighted(x, weight)─┐
│                      8 │
└────────────────────────┘
```

**示例**

查询：

```sql
SELECT avgWeighted(x, w)
FROM VALUES('x Int8, w Int8', (0, 0), (1, 0), (10, 0))
```

结果：

```text
┌─avgWeighted(x, weight)─┐
│                    nan │
└────────────────────────┘
```

**示例**

查询：

```sql
CREATE TABLE test (t UInt8) ENGINE = Memory;
SELECT avgWeighted(t) FROM test
```

结果：

```text
┌─avgWeighted(x, weight)─┐
│                    nan │
└────────────────────────┘
```
