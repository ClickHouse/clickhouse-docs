---
'description': '結果はvarSampの平方根と等しいです'
'sidebar_position': 190
'slug': '/sql-reference/aggregate-functions/reference/stddevsamp'
'title': 'stddevSamp'
'doc_type': 'reference'
---


# stddevSamp

結果は [varSamp](../../../sql-reference/aggregate-functions/reference/varsamp.md) の平方根に等しいです。

エイリアス: `STDDEV_SAMP`.

:::note
この関数は数値的に不安定なアルゴリズムを使用しています。計算で [数値的安定性](https://en.wikipedia.org/wiki/Numerical_stability) が必要な場合は、[`stddevSampStable`](../reference/stddevsampstable.md) 関数を使用してください。これは遅く動作しますが、計算誤差が低くなります。
:::

**構文**

```sql
stddevSamp(x)
```

**パラメータ**

- `x`: サンプル分散の平方根を求める値。[(U)Int*](../../data-types/int-uint.md)、[Float*](../../data-types/float.md)、[Decimal*](../../data-types/decimal.md)。

**返される値**

`x` のサンプル分散の平方根。[Float64](../../data-types/float.md)。

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
