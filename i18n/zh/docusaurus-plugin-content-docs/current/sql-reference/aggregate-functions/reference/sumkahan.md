---
slug: /sql-reference/aggregate-functions/reference/sumkahan
sidebar_position: 197
title: sumKahan
description: '使用 Kahan 补偿求和算法计算数字的总和'
---

使用 [Kahan 补偿求和算法](https://en.wikipedia.org/wiki/Kahan_summation_algorithm) 计算数字的总和。  
比 [sum](./sum.md) 函数慢。  
补偿仅适用于 [Float](../../../sql-reference/data-types/float.md) 类型。

**语法**

``` sql
sumKahan(x)
```

**参数**

- `x` — 输入值，必须为 [Integer](../../../sql-reference/data-types/int-uint.md)、[Float](../../../sql-reference/data-types/float.md) 或 [Decimal](../../../sql-reference/data-types/decimal.md)。

**返回值**

- 数字的总和，类型为 [Integer](../../../sql-reference/data-types/int-uint.md)、[Float](../../../sql-reference/data-types/float.md) 或 [Decimal](../../../sql-reference/data-types/decimal.md)，取决于输入参数的类型。

**示例**

查询：

``` sql
SELECT sum(0.1), sumKahan(0.1) FROM numbers(10);
```

结果：

``` text
┌───────────sum(0.1)─┬─sumKahan(0.1)─┐
│ 0.9999999999999999 │             1 │
└────────────────────┴───────────────┘
```
