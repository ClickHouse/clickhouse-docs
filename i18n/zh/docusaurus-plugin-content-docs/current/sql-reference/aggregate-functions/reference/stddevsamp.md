
# stddevSamp

结果等于 [varSamp](../../../sql-reference/aggregate-functions/reference/varsamp.md) 的平方根。

别名： `STDDEV_SAMP`。

:::note
此函数使用数值不稳定算法。如果您需要计算中的 [数值稳定性](https://en.wikipedia.org/wiki/Numerical_stability)，请使用 [`stddevSampStable`](../reference/stddevsampstable.md) 函数。它的速度较慢，但提供了更低的计算误差。
:::

**语法**

```sql
stddevSamp(x)
```

**参数**

- `x`：要计算样本方差平方根的值。 [(U)Int*](../../data-types/int-uint.md)、[Float*](../../data-types/float.md)、[Decimal*](../../data-types/decimal.md)。

**返回值**

`x` 的样本方差平方根。 [Float64](../../data-types/float.md)。

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
    stddevSamp(population)
FROM test_data;
```

结果：

```response
┌─stddevSamp(population)─┐
│                      4 │
└────────────────────────┘
```
