---
slug: /sql-reference/aggregate-functions/reference/skewsamp
sidebar_position: 186
title: "skewSamp"
description: "シーケンスのサンプル歪度を計算します。"
---


# skewSamp

シーケンスの[サンプル歪度](https://ja.wikipedia.org/wiki/%E6%AD%A9%E5%BA%A6)を計算します。

渡された値がランダム変数のサンプルを形成する場合、無偏推定量としての歪度を表します。

``` sql
skewSamp(expr)
```

**引数**

`expr` — 数値を返す[式](../../../sql-reference/syntax.md#syntax-expressions)。

**返される値**

指定された分布の歪度。タイプ — [Float64](../../../sql-reference/data-types/float.md)。もし `n <= 1` (`n` はサンプルのサイズ) であれば、この関数は `nan` を返します。

**例**

``` sql
SELECT skewSamp(value) FROM series_with_value_column;
```
