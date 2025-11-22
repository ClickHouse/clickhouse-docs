---
description: "结果等于 varPop 的平方根。与 stddevPop 不同，本函数采用数值稳定的算法。"
sidebar_position: 189
slug: /sql-reference/aggregate-functions/reference/stddevpopstable
title: 'stddevPopStable'
doc_type: 'reference'
---

# stddevPopStable

结果等于 [varPop](../../../sql-reference/aggregate-functions/reference/varpop.md) 的平方根。与 [`stddevPop`](../reference/stddevpop.md) 不同，此函数使用数值更稳定的算法。虽然运行速度较慢，但计算误差更小。

**语法**

```sql
stddevPopStable(x)
```

**参数**

* `x`: 要计算标准差的一组值。[(U)Int*](../../data-types/int-uint.md)、[Float*](../../data-types/float.md)、[Decimal*](../../data-types/decimal.md)。

**返回值**

`x` 方差的平方根。[Float64](../../data-types/float.md)。

**示例**

查询：

```sql
DROP TABLE IF EXISTS test_data;
CREATE TABLE test_data
(
    population Float64, -- 人口数据
)
ENGINE = Log;

INSERT INTO test_data SELECT randUniform(5.5, 10) FROM numbers(1000000);

SELECT
    stddevPopStable(population) AS stddev -- 总体标准差
FROM test_data;
```

结果：

```response
┌─────────────stddev─┐
│ 1.2999977786592576 │
└────────────────────┘
```
