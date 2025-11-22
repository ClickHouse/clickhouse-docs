---
description: '結果は varPop の平方根です。'
sidebar_position: 188
slug: /sql-reference/aggregate-functions/reference/stddevpop
title: 'stddevPop'
doc_type: 'reference'
---

# stddevPop

結果は [varPop](../../../sql-reference/aggregate-functions/reference/varpop.md) の値の平方根と等しくなります。

別名: `STD`, `STDDEV_POP`。

:::note
この関数は数値的に不安定なアルゴリズムを用いています。計算で[数値安定性](https://en.wikipedia.org/wiki/Numerical_stability)が必要な場合は、[`stddevPopStable`](../reference/stddevpopstable.md) 関数を使用してください。処理速度は遅くなりますが、計算誤差は小さくなります。
:::

**構文**

```sql
stddevPop(x)
```

**パラメータ**

* `x`: 標準偏差を求める対象となる値の母集団。[(U)Int*](../../data-types/int-uint.md)、[Float*](../../data-types/float.md)、[Decimal*](../../data-types/decimal.md)。

**戻り値**

* `x` の標準偏差の平方根。[Float64](../../data-types/float.md)。

**例**

クエリ:

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

結果:

```response
┌────────────stddev─┐
│ 3.794733192202055 │
└───────────────────┘
```
