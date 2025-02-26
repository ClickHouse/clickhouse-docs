---
slug: /sql-reference/aggregate-functions/reference/kurtsamp
sidebar_position: 158
---

# kurtSamp

シーケンスの[サンプルの尖度](https://en.wikipedia.org/wiki/Kurtosis)を計算します。

これは、渡された値がそのサンプルを形成する場合、ランダム変数の尖度の偏りのない推定値を表します。

``` sql
kurtSamp(expr)
```

**引数**

`expr` — 数値を返す[式](../../../sql-reference/syntax.md#syntax-expressions)。

**戻り値**

指定された分布の尖度。型 — [Float64](../../../sql-reference/data-types/float.md)。`n <= 1`（`n`はサンプルのサイズ）の場合、関数は`nan`を返します。

**例**

``` sql
SELECT kurtSamp(value) FROM series_with_value_column;
```
