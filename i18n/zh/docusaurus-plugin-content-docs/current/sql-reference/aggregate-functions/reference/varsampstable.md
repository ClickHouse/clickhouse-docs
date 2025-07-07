---
'description': '计算数据集的样本方差。与 `varSamp` 不同，此函数使用数值稳定的算法。虽然它运行较慢，但提供了更低的计算误差。'
'sidebar_position': 213
'slug': '/sql-reference/aggregate-functions/reference/varsampstable'
'title': 'varSampStable'
---

## varSampStable {#varsampstable}

计算数据集的样本方差。与 [`varSamp`](../reference/varsamp.md) 不同，此函数使用数值稳定的算法。虽然运行速度较慢，但提供了更低的计算误差。

**语法**

```sql
varSampStable(x)
```

别名: `VAR_SAMP_STABLE`

**参数**

- `x`: 要计算样本方差的总体。[(U)Int*](../../data-types/int-uint.md)、[Float*](../../data-types/float.md)、[Decimal*](../../data-types/decimal.md)。

**返回值**

- 返回输入数据集的样本方差。[Float64](../../data-types/float.md)。

**实现细节**

`varSampStable` 函数使用与 [`varSamp`](../reference/varsamp.md) 相同的公式计算样本方差：

$$
\sum\frac{(x - \text{mean}(x))^2}{(n - 1)}
$$

其中：
- `x` 是数据集中每个单独的数据点。
- `mean(x)` 是数据集的算术平均值。
- `n` 是数据集中数据点的数量。

**示例**

查询：

```sql
DROP TABLE IF EXISTS test_data;
CREATE TABLE test_data
(
    x Float64
)
ENGINE = Memory;

INSERT INTO test_data VALUES (10.5), (12.3), (9.8), (11.2), (10.7);

SELECT round(varSampStable(x),3) AS var_samp_stable FROM test_data;
```

响应：

```response
┌─var_samp_stable─┐
│           0.865 │
└─────────────────┘
```
