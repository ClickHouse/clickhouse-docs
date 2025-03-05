---
slug: /sql-reference/aggregate-functions/reference/uniqcombined
sidebar_position: 205
title: "uniqCombined"
description: "異なる引数値の大まかな数を計算します。"
---


# uniqCombined

異なる引数値の大まかな数を計算します。

``` sql
uniqCombined(HLL_precision)(x[, ...])
```

`uniqCombined` 関数は、異なる値の数を計算するための良い選択です。

**引数**

- `HLL_precision`: [HyperLogLog](https://en.wikipedia.org/wiki/HyperLogLog) のセルの数の基数2対数。オプションで、関数を `uniqCombined(x[, ...])` として使用できます。`HLL_precision` のデフォルト値は17で、実際には96 KiBのスペース（2^17セル、各セルは6ビット）を占めます。
- `X`: 可変数のパラメータ。パラメータは `Tuple`、`Array`、`Date`、`DateTime`、`String`、または数値型になれます。

**戻り値**

- [UInt64](../../../sql-reference/data-types/int-uint.md)-型の数値。

**実装詳細**

`uniqCombined` 関数は以下を行います：

- 集約内のすべてのパラメータのハッシュ（`String` に対しては64ビットハッシュ、その他は32ビット）を計算し、それを計算に使用します。
- 配列、ハッシュテーブル、およびエラー訂正テーブルを伴うHyperLogLogの3つのアルゴリズムの組み合わせを使用します。
    - 少数の異なる要素の場合、配列が使用されます。
    - セットサイズが大きくなると、ハッシュテーブルが使用されます。
    - より多くの要素の場合、固定量のメモリを占有するHyperLogLogが使用されます。
- 結果は決定的に提供されます（クエリの処理順序には依存しません）。

:::note    
非 `String` 型には32ビットハッシュを使用するため、結果は `UINT_MAX` よりもかなり大きな基数に対して非常に高い誤差を持つことになります（異なる値が数十億を超えた場合、誤差は急激に増加します）。そのため、この場合は [uniqCombined64](../../../sql-reference/aggregate-functions/reference/uniqcombined64.md#agg_function-uniqcombined64) を使用するべきです。
:::

[uniq](../../../sql-reference/aggregate-functions/reference/uniq.md#agg_function-uniq) 関数と比べて、`uniqCombined` 関数は：

- 消費するメモリが数倍少ない。
- 計算の精度が数倍高い。
- 通常はわずかにパフォーマンスが低い。一部のシナリオでは、ネットワーク越しに大量の集約状態を送信する分散クエリの場合、`uniqCombined` が `uniq` よりもパフォーマンスが良いことがあります。

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

`uniqCombined` と `uniqCombined64` の間の差異に関しては、より大きな入力の例については [uniqCombined64](../../../sql-reference/aggregate-functions/reference/uniqcombined64.md#agg_function-uniqcombined64) の例セクションを参照してください。

**関連項目**

- [uniq](../../../sql-reference/aggregate-functions/reference/uniq.md#agg_function-uniq)
- [uniqCombined64](../../../sql-reference/aggregate-functions/reference/uniqcombined64.md#agg_function-uniqcombined64)
- [uniqHLL12](../../../sql-reference/aggregate-functions/reference/uniqhll12.md#agg_function-uniqhll12)
- [uniqExact](../../../sql-reference/aggregate-functions/reference/uniqexact.md#agg_function-uniqexact)
- [uniqTheta](../../../sql-reference/aggregate-functions/reference/uniqthetasketch.md#agg_function-uniqthetasketch)
