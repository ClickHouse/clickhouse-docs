---
description: '一元配置分散分析（ANOVA 検定）のための統計的手法を提供します。正規分布に従う複数の観測値グループについて、すべてのグループの平均値が等しいかどうかを検定します。'
sidebar_position: 101
slug: /sql-reference/aggregate-functions/reference/analysis_of_variance
title: 'analysisOfVariance'
doc_type: 'reference'
---

# analysisOfVariance

一元分散分析（ANOVA 検定）を行うための統計的検定です。正規分布に従う複数のグループの観測値に対して、すべてのグループの平均が同一かどうかを判定します。

**構文**

```sql
analysisOfVariance(val, group_no)
```

エイリアス: `anova`

**パラメータ**

* `val`: 値。
* `group_no` : `val` が属するグループ番号。

:::note
グループは 0 から番号付けされ、検定を実行するには少なくとも 2 つのグループが必要です。
観測値の数が 1 を超えるグループが少なくとも 1 つ必要です。
:::

**戻り値**

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
