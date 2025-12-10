---
description: 'HyperLogLog アルゴリズムを使用して、異なる引数値の個数を近似的に計算します。'
sidebar_position: 208
slug: /sql-reference/aggregate-functions/reference/uniqhll12
title: 'uniqHLL12'
doc_type: 'reference'
---

# uniqHLL12 {#uniqhll12}

[HyperLogLog](https://en.wikipedia.org/wiki/HyperLogLog) アルゴリズムを使用して、引数の異なる値のおおよその個数を計算します。

```sql
uniqHLL12(x[, ...])
```

**引数**

この関数は可変個の引数を取ります。引数には `Tuple`、`Array`、`Date`、`DateTime`、`String`、または数値型を指定できます。

**戻り値**

* [UInt64](../../../sql-reference/data-types/int-uint.md) 型の数値。

**実装の詳細**

この関数は次のように動作します:

* 集約内のすべての引数に対してハッシュ値を計算し、それを内部計算に使用します。

* HyperLogLog アルゴリズムを使用して、異なる引数値の個数を近似します。

  2^12 個の 5 ビットセルが使用されます。状態のサイズは 2.5 KB をわずかに上回ります。小さいデータセット（&lt;10K 要素）では結果の精度はあまり高くなく（誤差は最大で約 10%）、高カーディナリティのデータセット（10K〜100M）では結果は比較的正確で、最大誤差は約 1.6% です。100M を超えると推定誤差は増加し、極めて高いカーディナリティ（1B+ 要素）のデータセットに対しては非常に不正確な結果を返します。

* 決定論的な結果を返します（クエリ処理の順序に依存しません）。

この関数の使用は推奨しません。ほとんどの場合、代わりに [uniq](/sql-reference/aggregate-functions/reference/uniq) 関数または [uniqCombined](/sql-reference/aggregate-functions/reference/uniqcombined) 関数を使用してください。

**関連項目**

* [uniq](/sql-reference/aggregate-functions/reference/uniq)
* [uniqCombined](/sql-reference/aggregate-functions/reference/uniqcombined)
* [uniqExact](/sql-reference/aggregate-functions/reference/uniqexact)
* [uniqTheta](/sql-reference/aggregate-functions/reference/uniqthetasketch)
