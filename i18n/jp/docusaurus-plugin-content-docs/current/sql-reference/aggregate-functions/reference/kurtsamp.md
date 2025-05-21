---
description: 'シーケンスの標本尖度を計算します。'
sidebar_position: 158
slug: /sql-reference/aggregate-functions/reference/kurtsamp
title: 'kurtSamp'
---


# kurtSamp

シーケンスの [標本尖度](https://en.wikipedia.org/wiki/Kurtosis) を計算します。

与えられた値がその標本を形成する場合、これはランダム変数の尖度の偏りのない推定値を表します。

```sql
kurtSamp(expr)
```

**引数**

`expr` — 数値を返す [式](/sql-reference/syntax#expressions)。

**戻り値**

指定された分布の尖度。タイプ — [Float64](../../../sql-reference/data-types/float.md)。もし `n <= 1` （`n` は標本のサイズ）であれば、この関数は `nan` を返します。

**例**

```sql
SELECT kurtSamp(value) FROM series_with_value_column;
```
