---
'description': '计算总体方差'
'sidebar_position': 210
'slug': '/en/sql-reference/aggregate-functions/reference/varPop'
'title': '方差'
---



## varPop {#varpop}

计算总体方差：

$$
\frac{\Sigma{(x - \bar{x})^2}}{n}
$$

**语法**

```sql
varPop(x)
```

别名：`VAR_POP`。

**参数**

- `x`：用于计算总体方差的值的集合。[(U)Int*](../../data-types/int-uint.md)、[Float*](../../data-types/float.md)、[Decimal*](../../data-types/decimal.md)。

**返回值**

- 返回 `x` 的总体方差。 [`Float64`](../../data-types/float.md)。

**示例**

查询：

```sql
DROP TABLE IF EXISTS test_data;
CREATE TABLE test_data
(
    x UInt8,
)
ENGINE = Memory;

INSERT INTO test_data VALUES (3), (3), (3), (4), (4), (5), (5), (7), (11), (15);

SELECT
    varPop(x) AS var_pop
FROM test_data;
```

结果：

```response
┌─var_pop─┐
│    14.4 │
└─────────┘
```
