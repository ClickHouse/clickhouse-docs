---
description: 'データ系列の標本尖度を計算します。'
sidebar_position: 158
slug: /sql-reference/aggregate-functions/reference/kurtsamp
title: 'kurtSamp'
doc_type: 'reference'
---

# kurtSamp

一連の値の[標本尖度](https://en.wikipedia.org/wiki/Kurtosis)を計算します。

渡された値がある確率変数の標本を構成している場合、その確率変数の尖度に対する不偏推定量となります。

```sql
kurtSamp(expr)
```

**引数**

`expr` — 数値を返す[式](/sql-reference/syntax#expressions)。

**戻り値**

与えられた分布の尖度。型 — [Float64](../../../sql-reference/data-types/float.md)。`n <= 1` の場合（`n` は標本サイズ）、関数は `nan` を返します。

**例**

```sql
SELECT kurtSamp(value) FROM series_with_value_column;
```
