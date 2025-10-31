---
'description': '人口分散を計算します。'
'sidebar_position': 210
'slug': '/sql-reference/aggregate-functions/reference/varPop'
'title': 'varPop'
'doc_type': 'reference'
---

## varPop {#varpop}

母集団分散を計算します：

$$
\frac{\Sigma{(x - \bar{x})^2}}{n}
$$

**構文**

```sql
varPop(x)
```

エイリアス: `VAR_POP`。

**パラメーター**

- `x`: 母集団分散を求める値の集合。[(U)Int*](../../data-types/int-uint.md)、[Float*](../../data-types/float.md)、[Decimal*](../../data-types/decimal.md)。

**返される値**

- `x`の母集団分散を返します。[`Float64`](../../data-types/float.md)。

**例**

クエリ：

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

結果：

```response
┌─var_pop─┐
│    14.4 │
└─────────┘
```
