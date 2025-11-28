---
description: '母分散を返します。varPop と異なり、この関数は数値的に安定したアルゴリズムを使用します。処理速度は低下しますが、計算誤差をより小さく抑えられます。'
sidebar_position: 211
slug: /sql-reference/aggregate-functions/reference/varpopstable
title: 'varPopStable'
doc_type: 'reference'
---



## varPopStable

母分散を返します。[`varPop`](../reference/varpop.md) と異なり、この関数は[数値的に安定な](https://en.wikipedia.org/wiki/Numerical_stability)アルゴリズムを使用します。処理は遅くなりますが、計算誤差を小さく抑えることができます。

**構文**

```sql
varPopStable(x)
```

別名: `VAR_POP_STABLE`.

**パラメーター**

* `x`: 分散を計算する対象となる値の母集団。[(U)Int*](../../data-types/int-uint.md)、[Float*](../../data-types/float.md)、[Decimal*](../../data-types/decimal.md)。

**返り値**

* `x` の母分散を返します。[Float64](../../data-types/float.md)。

**例**

クエリ:

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

結果:

```response
┌─var_pop_stable─┐
│           14.4 │
└────────────────┘
```
