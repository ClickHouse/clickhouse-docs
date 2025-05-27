---
'description': '结果等于 varPop 的平方根。'
'sidebar_position': 188
'slug': '/sql-reference/aggregate-functions/reference/stddevpop'
'title': 'stddevPop'
---


# stddevPop

结果等于 [varPop](../../../sql-reference/aggregate-functions/reference/varpop.md) 的平方根。

别名: `STD`, `STDDEV_POP`。

:::note
此函数使用数值不稳定的算法。如果您需要计算中的 [数值稳定性](https://en.wikipedia.org/wiki/Numerical_stability)，请使用 [`stddevPopStable`](../reference/stddevpopstable.md) 函数。该函数运行较慢，但提供较低的计算误差。
:::

**语法**

```sql
stddevPop(x)
```

**参数**

- `x`: 要查找标准差的值的总体。[(U)Int*](../../data-types/int-uint.md), [Float*](../../data-types/float.md), [Decimal*](../../data-types/decimal.md)。

**返回值**

- `x` 的标准差的平方根。[Float64](../../data-types/float.md)。

**示例**

查询:

```sql
DROP TABLE IF EXISTS test_data;
CREATE TABLE test_data
(
    population UInt8,
)
ENGINE = Log;

INSERT INTO test_data VALUES (3),(3),(3),(4),(4),(5),(5),(7),(11),(15);

SELECT
    stddevPop(population) AS stddev
FROM test_data;
```

结果:

```response
┌────────────stddev─┐
│ 3.794733192202055 │
└───────────────────┘
```
