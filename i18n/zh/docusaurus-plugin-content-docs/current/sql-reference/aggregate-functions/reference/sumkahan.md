---
description: '使用 Kahan 补偿求和算法计算数值的总和'
sidebar_position: 197
slug: /sql-reference/aggregate-functions/reference/sumkahan
title: 'sumKahan'
doc_type: 'reference'
---

使用 [Kahan 补偿求和算法](https://en.wikipedia.org/wiki/Kahan_summation_algorithm)计算数值的总和。
性能比 [sum](./sum.md) 函数更低。
补偿仅对 [Float](../../../sql-reference/data-types/float.md) 类型生效。

**语法**

```sql
sumKahan(x)
```

**参数**

* `x` — 输入值，必须为 [Integer](../../../sql-reference/data-types/int-uint.md)、[Float](../../../sql-reference/data-types/float.md) 或 [Decimal](../../../sql-reference/data-types/decimal.md)。

**返回值**

* 所有数值之和，其类型为 [Integer](../../../sql-reference/data-types/int-uint.md)、[Float](../../../sql-reference/data-types/float.md) 或 [Decimal](../../../sql-reference/data-types/decimal.md)，具体取决于输入参数的类型。

**示例**

查询：

```sql
SELECT sum(0.1), sumKahan(0.1) FROM numbers(10);
```

结果：

```text
┌───────────sum(0.1)─┬─sumKahan(0.1)─┐
│ 0.9999999999999999 │             1 │
└────────────────────┴───────────────┘
```
