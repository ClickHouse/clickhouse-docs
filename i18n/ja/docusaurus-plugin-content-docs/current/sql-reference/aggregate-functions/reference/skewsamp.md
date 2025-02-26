---
slug: /sql-reference/aggregate-functions/reference/skewsamp
sidebar_position: 186
---

# skewSamp

一連のサンプルの[サンプル歪度](https://en.wikipedia.org/wiki/Skewness)を計算します。

これは、渡された値がそのサンプルを形成する場合、ランダム変数の歪度の偏りのない推定値を表します。

``` sql
skewSamp(expr)
```

**引数**

`expr` — 数値を返す[式](../../../sql-reference/syntax.md#syntax-expressions)。

**戻り値**

与えられた分布の歪度。タイプ — [Float64](../../../sql-reference/data-types/float.md)。もし `n <= 1` (`n` はサンプルのサイズ) の場合、この関数は `nan` を返します。

**例**

``` sql
SELECT skewSamp(value) FROM series_with_value_column;
```
