---
description: 'シーケンスの標本歪度を計算します。'
sidebar_position: 186
slug: /sql-reference/aggregate-functions/reference/skewsamp
title: 'skewSamp'
doc_type: 'reference'
---

# skewSamp

シーケンスの[標本歪度](https://en.wikipedia.org/wiki/Skewness)を計算します。

渡された値がある確率変数の標本である場合、その確率変数の歪度に対する不偏推定量を表します。

```sql
skewSamp(expr)
```

**引数**

`expr` — 数値を返す[式](/sql-reference/syntax#expressions)。

**戻り値**

与えられた分布の歪度。型 — [Float64](../../../sql-reference/data-types/float.md)。`n <= 1`（`n` はサンプルサイズ）の場合、関数は `nan` を返します。

**例**

```sql
SELECT skewSamp(value) FROM series_with_value_column;
```
