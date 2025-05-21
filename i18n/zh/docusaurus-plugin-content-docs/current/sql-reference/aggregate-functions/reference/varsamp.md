---
'description': '计算数据集的样本方差'
'sidebar_position': 212
'slug': '/sql-reference/aggregate-functions/reference/varSamp'
'title': '方差'
---



## varSamp {#varsamp}

计算数据集的样本方差。

**语法**

```sql
varSamp(x)
```

别名：`VAR_SAMP`。

**参数**

- `x`：要计算样本方差的总体。[(U)Int*](../../data-types/int-uint.md)、[Float*](../../data-types/float.md)、[Decimal*](../../data-types/decimal.md)。

**返回值**

- 返回输入数据集 `x` 的样本方差。[Float64](../../data-types/float.md)。

**实现细节**

`varSamp` 函数使用以下公式计算样本方差：

$$
\sum\frac{(x - \text{mean}(x))^2}{(n - 1)}
$$

其中：

- `x` 是数据集中的每个单独数据点。
- `mean(x)` 是数据集的算术平均值。
- `n` 是数据集中的数据点数量。

该函数假设输入数据集代表更大总体中的一个样本。如果您想计算整个总体的方差（当您拥有完整的数据集时），应使用 [`varPop`](../reference/varpop.md) 代替。

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

SELECT round(varSamp(x),3) AS var_samp FROM test_data;
```

响应：

```response
┌─var_samp─┐
│    0.865 │
└──────────┘
```
