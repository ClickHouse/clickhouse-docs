---
slug: /sql-reference/aggregate-functions/reference/kurtsamp
sidebar_position: 158
title: "kurtSamp"
description: "シーケンスのサンプル尖度を計算します。"
---


# kurtSamp

シーケンスの[サンプル尖度](https://ja.wikipedia.org/wiki/%E5%B0%96%E5%BA%A6)を計算します。

これは、渡された値がそのサンプルを形成する場合、確率変数の尖度のバイアスのない推定値を表します。

``` sql
kurtSamp(expr)
```

**引数**

`expr` — 数値を返す[式](../../../sql-reference/syntax.md#syntax-expressions)。

**返される値**

指定された分布の尖度。型 — [Float64](../../../sql-reference/data-types/float.md)。`n <= 1` の場合（`n` はサンプルのサイズ）、関数は `nan` を返します。

**例**

``` sql
SELECT kurtSamp(value) FROM series_with_value_column;
```
