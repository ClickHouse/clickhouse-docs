
# stddevPopStable

结果等于 [varPop](../../../sql-reference/aggregate-functions/reference/varpop.md) 的平方根。与 [`stddevPop`](../reference/stddevpop.md) 不同，此函数使用数值稳定的算法。它的运行速度较慢，但提供了更低的计算误差。

**语法**

```sql
stddevPopStable(x)
```

**参数**

- `x`：要计算标准差的值的总体。[(U)Int*](../../data-types/int-uint.md)，[Float*](../../data-types/float.md)，[Decimal*](../../data-types/decimal.md)。

**返回值**

`x` 的标准差的平方根。[Float64](../../data-types/float.md)。

**示例**

查询：

```sql
DROP TABLE IF EXISTS test_data;
CREATE TABLE test_data
(
    population Float64,
)
ENGINE = Log;

INSERT INTO test_data SELECT randUniform(5.5, 10) FROM numbers(1000000)

SELECT
    stddevPopStable(population) AS stddev
FROM test_data;
```

结果：

```response
┌─────────────stddev─┐
│ 1.2999977786592576 │
└────────────────────┘
```
