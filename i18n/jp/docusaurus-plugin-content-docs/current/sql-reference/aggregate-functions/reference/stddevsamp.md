---
description: '結果は varSamp の平方根です'
sidebar_position: 190
slug: /sql-reference/aggregate-functions/reference/stddevsamp
title: 'stddevSamp'
doc_type: 'reference'
---

# stddevSamp {#stddevsamp}

結果は [varSamp](../../../sql-reference/aggregate-functions/reference/varsamp.md) の平方根と等しくなります。

エイリアス: `STDDEV_SAMP`。

:::note
この関数は数値的に不安定なアルゴリズムを使用します。計算で[数値安定性](https://en.wikipedia.org/wiki/Numerical_stability)が必要な場合は、[`stddevSampStable`](../reference/stddevsampstable.md) 関数を使用してください。こちらは動作が遅くなりますが、計算誤差をより小さく抑えることができます。
:::

**構文**

```sql
stddevSamp(x)
```

**パラメータ**

* `x`: 標本分散の平方根を求める対象の値。[(U)Int*](../../data-types/int-uint.md)、[Float*](../../data-types/float.md)、[Decimal*](../../data-types/decimal.md)。

**戻り値**

`x` の標本分散の平方根。[Float64](../../data-types/float.md)。

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
    stddevSamp(population)
FROM test_data;
```

結果:

```response
┌─stddevSamp(population)─┐
│                      4 │
└────────────────────────┘
```
