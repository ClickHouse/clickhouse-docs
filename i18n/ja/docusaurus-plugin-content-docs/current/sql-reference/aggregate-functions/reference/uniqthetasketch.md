---
slug: /sql-reference/aggregate-functions/reference/uniqthetasketch
sidebar_position: 209
title: uniqTheta
---

異なる引数値の近似数を計算します。これは [Theta Sketch Framework](https://datasketches.apache.org/docs/Theta/ThetaSketchFramework.html) を使用しています。

``` sql
uniqTheta(x[, ...])
```

**引数**

この関数は可変数のパラメータを取ります。パラメータは `Tuple`、`Array`、`Date`、`DateTime`、`String`、または数値型です。

**返される値**

- [UInt64](../../../sql-reference/data-types/int-uint.md)-型の数値。

**実装の詳細**

関数:

- 集約内のすべてのパラメータのハッシュを計算し、それを計算に使用します。

- [KMV](https://datasketches.apache.org/docs/Theta/InverseEstimate.html) アルゴリズムを使用して、異なる引数値の近似数を算出します。

        4096(2^12) の 64ビットスケッチが使用されます。状態のサイズは約 41 KB です。

- 相対誤差は 3.125%（95%信頼度）です。詳細は [相対誤差テーブル](https://datasketches.apache.org/docs/Theta/ThetaErrorTable.html) を参照してください。

**関連項目**

- [uniq](../../../sql-reference/aggregate-functions/reference/uniq.md#agg_function-uniq)
- [uniqCombined](../../../sql-reference/aggregate-functions/reference/uniqcombined.md#agg_function-uniqcombined)
- [uniqCombined64](../../../sql-reference/aggregate-functions/reference/uniqcombined64.md#agg_function-uniqcombined64)
- [uniqHLL12](../../../sql-reference/aggregate-functions/reference/uniqhll12.md#agg_function-uniqhll12)
- [uniqExact](../../../sql-reference/aggregate-functions/reference/uniqexact.md#agg_function-uniqexact)
