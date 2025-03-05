---
slug: /sql-reference/aggregate-functions/reference/uniqcombined
sidebar_position: 205
title: "uniqCombined"
description: "異なる引数値の近似数を計算します。"
---


# uniqCombined

異なる引数値の近似数を計算します。

``` sql
uniqCombined(HLL_precision)(x[, ...])
```

`uniqCombined`関数は、異なる値の数を計算するのに適しています。

**引数**

- `HLL_precision`: [HyperLogLog](https://en.wikipedia.org/wiki/HyperLogLog)のセル数の2進対数。オプションで、`uniqCombined(x[, ...])`の形でも使用可能です。`HLL_precision`のデフォルト値は17で、実際には96 KiBのスペース（2^17セル、各6ビット）を占めます。
- `X`: 可変数のパラメータ。パラメータは、`Tuple`、`Array`、`Date`、`DateTime`、`String`、または数値型です。

**戻り値**

- [UInt64](../../../sql-reference/data-types/int-uint.md)-型の数値。

**実装の詳細**

`uniqCombined`関数は以下を行います：

- 集約内のすべてのパラメータに対してハッシュ（`String`の場合は64ビットハッシュ、それ以外は32ビット）を計算し、計算に使用します。
- 配列、ハッシュテーブル、および誤差修正テーブルを使用したHyperLogLogの3つのアルゴリズムの組み合わせを使用します。
    - 異なる要素の数が少ない場合は、配列が使用されます。
    - セットのサイズが大きくなると、ハッシュテーブルが使用されます。
    - より多くの要素の場合、HyperLogLogが使用され、固定のメモリ量を占有します。
- 結果は決定論的に提供されます（クエリの処理順序に依存しません）。

:::note    
非`String`型に対して32ビットハッシュを使用するため、結果は`UINT_MAX`を大きく超えるカーディナリティに対して非常に高い誤差を持ちます（数十億の異なる値を超えると誤差が急激に増加します）。したがって、その場合は[uniqCombined64](../../../sql-reference/aggregate-functions/reference/uniqcombined64.md#agg_function-uniqcombined64)を使用するべきです。
:::

[uniq](/sql-reference/aggregate-functions/reference/uniq)関数と比べて、`uniqCombined`関数は：

- 消費するメモリが数倍少なくなります。
- 精度が数倍高くなります。
- 通常はパフォーマンスが若干低下します。特定のシナリオでは、`uniqCombined`が`uniq`よりも優れた性能を発揮することがあります。例えば、ネットワーク越しに多くの集約状態を送信する分散クエリの場合です。

**例**

クエリ：

```sql
SELECT uniqCombined(number) FROM numbers(1e6);
```

結果：

```response
┌─uniqCombined(number)─┐
│              1001148 │ -- 1.00百万
└──────────────────────┘
```

`uniqCombined`と`uniqCombined64`の大規模な入力における違いの例については、[uniqCombined64](../../../sql-reference/aggregate-functions/reference/uniqcombined64.md#agg_function-uniqcombined64)の例セクションを参照してください。

**参照**

- [uniq](/sql-reference/aggregate-functions/reference/uniq)
- [uniqCombined64](../../../sql-reference/aggregate-functions/reference/uniqcombined64.md#agg_function-uniqcombined64)
- [uniqHLL12](../../../sql-reference/aggregate-functions/reference/uniqhll12.md#agg_function-uniqhll12)
- [uniqExact](/sql-reference/aggregate-functions/reference/uniqexact)
- [uniqTheta](../../../sql-reference/aggregate-functions/reference/uniqthetasketch.md#agg_function-uniqthetasketch)
