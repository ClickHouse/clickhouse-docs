---
slug: /sql-reference/aggregate-functions/reference/analysis_of_variance
sidebar_position: 101
---

# 分散分析 (analysisOfVariance)

一元分散分析（ANOVAテスト）のための統計テストを提供します。これは、正規分布に従う観察のいくつかのグループのテストであり、すべてのグループが同じ平均を持っているかどうかを判断します。

**構文**

```sql
analysisOfVariance(val, group_no)
```

エイリアス: `anova`

**パラメータ**
- `val`: 値。
- `group_no`: `val` が属するグループ番号。

:::note
グループは0から始まる番号が付けられ、テストを実行するには少なくとも2つのグループが必要です。
観察の数が1より大きいグループが少なくとも1つ必要です。
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
