---
title: 'varPopStable'
slug: /sql-reference/aggregate-functions/reference/varpopstable
sidebar_position: 211
description: '返回总体方差。与 varPop 不同，该函数使用数值稳定算法。它的运行速度较慢，但提供更低的计算误差。'
---

## varPopStable {#varpopstable}

返回总体方差。与 [`varPop`](../reference/varpop.md) 不同，该函数使用一个 [数值稳定](https://en.wikipedia.org/wiki/Numerical_stability) 算法。它的运行速度较慢，但提供更低的计算误差。

**语法**

```sql
varPopStable(x)
```

别名: `VAR_POP_STABLE`。

**参数**

- `x`: 要计算总体方差的值集合。[(U)Int*](../../data-types/int-uint.md)、[Float*](../../data-types/float.md)、[Decimal*](../../data-types/decimal.md)。

**返回值**

- 返回 `x` 的总体方差。[Float64](../../data-types/float.md)。

**示例**

查询:

```sql
DROP TABLE IF EXISTS test_data;
CREATE TABLE test_data
(
    x UInt8,
)
ENGINE = Memory;

INSERT INTO test_data VALUES (3),(3),(3),(4),(4),(5),(5),(7),(11),(15);

SELECT
    varPopStable(x) AS var_pop_stable
FROM test_data;
```

结果:

```response
┌─var_pop_stable─┐
│           14.4 │
└────────────────┘
```
