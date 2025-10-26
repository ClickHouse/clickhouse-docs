---
'description': '结果等于 varSamp 的平方根。与此函数不同，它使用了一个数值稳定的算法。'
'sidebar_position': 191
'slug': '/sql-reference/aggregate-functions/reference/stddevsampstable'
'title': 'stddevSampStable'
'doc_type': 'reference'
---


# stddevSampStable

结果等于 [varSamp](../../../sql-reference/aggregate-functions/reference/varsamp.md) 的平方根。与 [`stddevSamp`](../reference/stddevsamp.md) 不同，此函数使用数值稳定算法。它的速度较慢，但提供了更低的计算误差。

**语法**

```sql
stddevSampStable(x)
```

**参数**

- `x`：要计算样本方差平方根的值。[(U)Int*](../../data-types/int-uint.md)、[Float*](../../data-types/float.md)、[Decimal*](../../data-types/decimal.md)。

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
    stddevSampStable(population)
FROM test_data;
```

结果：

```response
┌─stddevSampStable(population)─┐
│                            4 │
└──────────────────────────────┘
```
