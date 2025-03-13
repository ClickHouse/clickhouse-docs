---
slug: /sql-reference/aggregate-functions/reference/analysis_of_variance
sidebar_position: 101
title: "analysisOfVariance"
description: "1方向分散分析のための統計的検定（ANOVA検定）を提供します。これは、すべてのグループが同じ平均を持っているかどうかを調べるために、正規分布に従う観測値のいくつかのグループに対する検定です。"
---


# analysisOfVariance

1方向分散分析のための統計的検定（ANOVA検定）を提供します。これは、すべてのグループが同じ平均を持っているかどうかを調べるために、正規分布に従う観測値のいくつかのグループに対する検定です。 

**構文**

```sql
analysisOfVariance(val, group_no)
```

別名: `anova`

**パラメータ**
- `val`: 値。 
- `group_no`: `val` が属するグループ番号。

:::note
グループは0から始まり、テストを実行するには少なくとも2つのグループが必要です。
観測値の数が1より大きいグループが少なくとも1つ必要です。
:::

**戻り値**

- `(f_statistic, p_value)`。[タプル](../../data-types/tuple.md)([Float64](../../data-types/float.md), [Float64](../../data-types/float.md))。

**例**

クエリ:

```sql
SELECT analysisOfVariance(number, number % 2) FROM numbers(1048575);
```

結果:

```response
┌─analysisOfVariance(number, modulo(number, 2))─┐
│ (0,1)                                         │
└───────────────────────────────────────────────┘
```
