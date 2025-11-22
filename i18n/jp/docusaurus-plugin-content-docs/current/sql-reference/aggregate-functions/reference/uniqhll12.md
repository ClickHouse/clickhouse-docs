---
description: 'HyperLogLog アルゴリズムを使用して、引数の異なる値のおおよその個数を計算します。'
sidebar_position: 208
slug: /sql-reference/aggregate-functions/reference/uniqhll12
title: 'uniqHLL12'
doc_type: 'reference'
---

# uniqHLL12

[HyperLogLog](https://en.wikipedia.org/wiki/HyperLogLog) アルゴリズムを使用して、引数の異なる値の概算個数を計算します。

```sql
uniqHLL12(x[, ...])
```

**引数**

この関数は可変個のパラメータを受け取ります。パラメータには `Tuple`、`Array`、`Date`、`DateTime`、`String`、または数値型を指定できます。

**返される値**

* [UInt64](../../../sql-reference/data-types/int-uint.md) 型の数値。

**実装の詳細**

関数は次の処理を行います。

* 集計内のすべてのパラメータに対してハッシュ値を計算し、そのハッシュ値を計算に使用します。

* HyperLogLog アルゴリズムを使用して、異なる引数値の個数を近似します。

  2^12 個の 5 ビットのセルを使用します。状態のサイズは 2.5 KB をわずかに上回ります。小さなデータセット（&lt;10K 要素）に対しては結果の精度はあまり高くなく（最大約 10% の誤差）、一方で高カーディナリティのデータセット（10K–100M）に対しては、最大誤差が約 1.6% と比較的高い精度を持ちます。100M 以上では推定誤差が増加し、極端にカーディナリティの高いデータセット（1B+ 要素）に対しては非常に不正確な結果を返します。

* 決定的な結果を提供します（クエリ処理順序に依存しません）。

この関数の使用は推奨されません。ほとんどの場合、[uniq](/sql-reference/aggregate-functions/reference/uniq) 関数または [uniqCombined](/sql-reference/aggregate-functions/reference/uniqcombined) 関数を使用してください。

**関連項目**

* [uniq](/sql-reference/aggregate-functions/reference/uniq)
* [uniqCombined](/sql-reference/aggregate-functions/reference/uniqcombined)
* [uniqExact](/sql-reference/aggregate-functions/reference/uniqexact)
* [uniqTheta](/sql-reference/aggregate-functions/reference/uniqthetasketch)
