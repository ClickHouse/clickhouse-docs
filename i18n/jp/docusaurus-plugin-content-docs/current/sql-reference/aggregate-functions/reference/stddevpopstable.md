---
description: '結果は varPop の平方根に等しいです。stddevPop とは異なり、この関数は数値的に安定したアルゴリズムを使用します。'
sidebar_position: 189
slug: /sql-reference/aggregate-functions/reference/stddevpopstable
title: 'stddevPopStable'
---


# stddevPopStable

結果は [varPop](../../../sql-reference/aggregate-functions/reference/varpop.md) の平方根に等しいです。 [`stddevPop`](../reference/stddevpop.md) とは異なり、この関数は数値的に安定したアルゴリズムを使用します。動作は遅くなりますが、計算誤差は低くなります。

**構文**

```sql
stddevPopStable(x)
```

**パラメータ**

- `x`: 標準偏差を計算する値の母集団。[(U)Int*](../../data-types/int-uint.md)、[Float*](../../data-types/float.md)、[Decimal*](../../data-types/decimal.md)。

**返される値**

`x` の標準偏差の平方根。[Float64](../../data-types/float.md)。

**例**

クエリ:

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

結果:

```response
┌─────────────stddev─┐
│ 1.2999977786592576 │
└────────────────────┘
```
