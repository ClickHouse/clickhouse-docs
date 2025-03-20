---
slug: /sql-reference/aggregate-functions/reference/stddevsampstable
sidebar_position: 191
title: 'stddevSampStable'
description: '结果等于 varSamp 的平方根。与这个函数不同，使用了数值稳定的算法。'
---


# stddevSampStable

结果等于 [varSamp](../../../sql-reference/aggregate-functions/reference/varsamp.md) 的平方根。与 [`stddevSamp`](../reference/stddevsamp.md) 不同，这个函数使用了数值稳定的算法。它运行较慢，但提供了较低的计算误差。

**语法**

```sql
stddevSampStable(x)
```

**参数**

- `x`：要找到样本方差平方根的值。 [(U)Int*](../../data-types/int-uint.md)、[Float*](../../data-types/float.md)、[Decimal*](../../data-types/decimal.md)。

**返回值**

`x` 的样本方差的平方根。 [Float64](../../data-types/float.md)。

**示例**

查询：

```sql
DROP TABLE IF EXISTS test_data;
CREATE TABLE test_data
(
    population UInt8,
)
ENGINE = Log;

INSERT INTO test_data VALUES (3),(3),(3),(4),(4),(5),(5),(7),(11),(15);

SELECT
    stddevSampStable(population)
FROM test_data;
```

结果：

```response
┌─stddevSampStable(population)─┐
│                            4 │
└──────────────────────────────┘
```
