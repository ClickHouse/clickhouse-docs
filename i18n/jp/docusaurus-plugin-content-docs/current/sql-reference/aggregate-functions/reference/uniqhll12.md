---
description: 'HyperLogLogアルゴリズムを使用して、異なる引数値の近似数を計算します。'
sidebar_position: 208
slug: /sql-reference/aggregate-functions/reference/uniqhll12
title: 'uniqHLL12'
---


# uniqHLL12

[HyperLogLog](https://en.wikipedia.org/wiki/HyperLogLog) アルゴリズムを使用して、異なる引数値の近似数を計算します。

```sql
uniqHLL12(x[, ...])
```

**引数**

この関数は可変数のパラメータを受け取ります。パラメータは `Tuple`、`Array`、`Date`、`DateTime`、`String`、または数値型である必要があります。

**返される値**

- [UInt64](../../../sql-reference/data-types/int-uint.md)型の数値。

**実装の詳細**

関数:

- 集計のすべてのパラメータのハッシュを計算し、それを計算に使用します。

- HyperLogLogアルゴリズムを使用して、異なる引数値の数を近似します。

        2^12の5ビットセルが使用されます。状態のサイズはわずかに2.5 KBを超えます。結果は、小さなデータセット（&lt;10K要素）ではあまり正確ではなく（最大で約10%の誤差）、しかし高カーディナリティのデータセット（10K-100M）では、最大誤差が約1.6%と比較的正確です。100M以上からは推定誤差が増加し、関数は非常に高いカーディナリティのデータセット（1B+要素）に対して非常に不正確な結果を返すことになります。

- 決定的な結果を提供します（クエリ処理順序には依存しません）。

この関数の使用は推奨されません。ほとんどの場合は、[uniq](/sql-reference/aggregate-functions/reference/uniq) または [uniqCombined](/sql-reference/aggregate-functions/reference/uniqcombined) 関数を使用してください。

**関連情報**

- [uniq](/sql-reference/aggregate-functions/reference/uniq)
- [uniqCombined](/sql-reference/aggregate-functions/reference/uniqcombined)
- [uniqExact](/sql-reference/aggregate-functions/reference/uniqexact)
- [uniqTheta](/sql-reference/aggregate-functions/reference/uniqthetasketch)
