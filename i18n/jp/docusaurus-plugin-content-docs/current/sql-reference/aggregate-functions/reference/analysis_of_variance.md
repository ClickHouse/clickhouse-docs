---
description: '一方向の分散分析（ANOVAテスト）のための統計的テストを提供します。これは、正規分布した観測のいくつかのグループに対して、すべてのグループが同じ平均を持つかどうかを調べるテストです。'
sidebar_position: 101
slug: /sql-reference/aggregate-functions/reference/analysis_of_variance
title: 'analysisOfVariance'
---


# analysisOfVariance

一方向の分散分析（ANOVAテスト）のための統計的テストを提供します。これは、正規分布した観測のいくつかのグループに対して、すべてのグループが同じ平均を持つかどうかを調べるテストです。 

**構文**

```sql
analysisOfVariance(val, group_no)
```

エイリアス: `anova`

**パラメータ**
- `val`: 値。 
- `group_no` : `val` が属するグループ番号。

:::note
グループは0から始まり、テストを実行するには少なくとも2つのグループが必要です。
観測の数が1より大きいグループが少なくとも1つ必要です。
:::

**返される値**

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
