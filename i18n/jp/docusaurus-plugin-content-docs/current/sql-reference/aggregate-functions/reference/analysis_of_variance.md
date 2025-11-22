---
description: '一元配置分散分析（ANOVA テスト）のための統計的検定を行います。これは、正規分布に従う複数のグループの観測値に対して、すべてのグループの平均が同一かどうかを判定するための検定です。'
sidebar_position: 101
slug: /sql-reference/aggregate-functions/reference/analysis_of_variance
title: 'analysisOfVariance'
doc_type: 'reference'
---

# analysisOfVariance

一元配置分散分析（ANOVA）を行うための統計的検定を提供します。これは、正規分布に従う複数のグループから得られた観測値に対して、すべてのグループの平均が等しいかどうかを判定する検定です。

**構文**

```sql
analysisOfVariance(val, group_no)
```

エイリアス: `anova`

**パラメーター**

* `val`: 値。
* `group_no` : `val` が属するグループ番号。

:::note
グループは 0 から番号が振られ、検定を実行するには少なくとも 2 つのグループが必要です。
観測数が 1 を超えるグループが少なくとも 1 つ含まれている必要があります。
:::

**返される値**

* `(f_statistic, p_value)`。[Tuple](../../data-types/tuple.md)([Float64](../../data-types/float.md), [Float64](../../data-types/float.md))。

**例**

クエリ:

```sql
SELECT analysisOfVariance(number, number % 2) FROM numbers(1048575);
```

結果：

```response
┌─analysisOfVariance(number, modulo(number, 2))─┐
│ (0,1)                                         │
└───────────────────────────────────────────────┘
```
