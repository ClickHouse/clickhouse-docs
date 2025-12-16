---
description: 'Theta Sketch Framework を使用して、異なる引数値のおおよその個数を計算します。'
sidebar_position: 209
slug: /sql-reference/aggregate-functions/reference/uniqthetasketch
title: 'uniqTheta'
doc_type: 'reference'
---

[Theta Sketch Framework](https://datasketches.apache.org/docs/Theta/ThetaSketches.html#theta-sketch-framework) を使用して、異なる引数値のおおよその個数を計算します。

```sql
uniqTheta(x[, ...])
```

**引数**

この関数は可変個のパラメータを受け取ります。パラメータには `Tuple`、`Array`、`Date`、`DateTime`、`String`、または数値型を指定できます。

**戻り値**

* [UInt64](../../../sql-reference/data-types/int-uint.md) 型の数値。

**実装の詳細**

関数は次のように動作します:

* 集約内のすべてのパラメータに対してハッシュ値を計算し、そのハッシュを計算に利用します。

* [KMV](https://datasketches.apache.org/docs/Theta/InverseEstimate.html) アルゴリズムを使用して、異なる引数値の個数を近似します。

  4096 (2^12) 個の 64 ビットスケッチが使用されます。状態のサイズは約 41 KB です。

* 相対誤差は 3.125%（95% 信頼水準）です。詳細は [relative error table](https://datasketches.apache.org/docs/Theta/ThetaErrorTable.html) を参照してください。

**関連項目**

* [uniq](/sql-reference/aggregate-functions/reference/uniq)
* [uniqCombined](/sql-reference/aggregate-functions/reference/uniqcombined)
* [uniqCombined64](/sql-reference/aggregate-functions/reference/uniqcombined64)
* [uniqHLL12](/sql-reference/aggregate-functions/reference/uniqhll12)
* [uniqExact](/sql-reference/aggregate-functions/reference/uniqexact)
