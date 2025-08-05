---
description: 'Computes the sample skewness of a sequence.'
sidebar_position: 186
slug: '/sql-reference/aggregate-functions/reference/skewsamp'
title: 'skewSamp'
---




# skewSamp

シーケンスの[サンプル歪度](https://en.wikipedia.org/wiki/Skewness)を計算します。

これは、渡された値がサンプルを形成する場合に、ランダム変数の歪度のバイアスのない推定値を表します。

```sql
skewSamp(expr)
```

**引数**

`expr` — 数値を返す[式](/sql-reference/syntax#expressions)。

**返される値**

指定された分布の歪度。タイプ — [Float64](../../../sql-reference/data-types/float.md)。もし `n <= 1` （`n` はサンプルのサイズ）であれば、この関数は `nan` を返します。

**例**

```sql
SELECT skewSamp(value) FROM series_with_value_column;
```
