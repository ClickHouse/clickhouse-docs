---
description: '異なる引数値の概算数を計算します。'
sidebar_position: 205
slug: /sql-reference/aggregate-functions/reference/uniqcombined
title: 'uniqCombined'
---


# uniqCombined

異なる引数値の概算数を計算します。

```sql
uniqCombined(HLL_precision)(x[, ...])
```

`uniqCombined`関数は、異なる値の数を計算するのに適した選択肢です。

**引数**

- `HLL_precision`: [HyperLogLog](https://en.wikipedia.org/wiki/HyperLogLog)におけるセルの数の2の基数対数です。オプションで、`uniqCombined(x[, ...])`として関数を使用できます。`HLL_precision`のデフォルト値は17で、これは実質的に96 KiBのスペース（2^17セル、各6ビット）を占有します。
- `X`: 可変数のパラメータ。パラメータは`Tuple`、`Array`、`Date`、`DateTime`、`String`、または数値型であることができます。

**返される値**

- [UInt64](../../../sql-reference/data-types/int-uint.md)-型の数です。

**実装の詳細**

`uniqCombined`関数は次のように動作します：

- 集計内のすべてのパラメータのハッシュ（`String`の場合は64ビットハッシュ、その他は32ビット）を計算し、それを計算に使用します。
- 配列、ハッシュテーブル、およびエラー修正テーブルを持つHyperLogLogの3つのアルゴリズムの組み合わせを使用します。
    - 少数の異なる要素の場合は、配列が使用されます。
    - セットサイズが大きくなると、ハッシュテーブルが使用されます。
    - より多くの要素がある場合は、固定のメモリ量を占有するHyperLogLogが使用されます。
- 結果を決定論的に提供します（クエリ処理の順序には依存しません）。

:::note    
非`String`型の場合に32ビットハッシュを使用するため、`UINT_MAX`よりもはるかに大きな基数に対して結果に非常に高いエラーが生じます（数十億の異なる値を超えるとエラーが急速に増加します）、したがってこの場合は[uniqCombined64](/sql-reference/aggregate-functions/reference/uniqcombined64)を使用する必要があります。
:::

[uniq](/sql-reference/aggregate-functions/reference/uniq)関数と比較して、`uniqCombined`関数は：

- メモリの消費が数倍少ないです。
- 精度が数倍高いです。
- 通常はわずかに低いパフォーマンスです。特定のシナリオでは、分散クエリで大量の集約状態をネットワーク経由で送信する場合などに、`uniqCombined`が`uniq`よりもパフォーマンスが良くなることがあります。

**例**

クエリ：

```sql
SELECT uniqCombined(number) FROM numbers(1e6);
```

結果：

```response
┌─uniqCombined(number)─┐
│              1001148 │ -- 1.00 million
└──────────────────────┘
```

`uniqCombined`と`uniqCombined64`の違いについての例は、より大きな入力の場合の[uniqCombined64](/sql-reference/aggregate-functions/reference/uniqcombined64)の例セクションを参照してください。

**関連情報**

- [uniq](/sql-reference/aggregate-functions/reference/uniq)
- [uniqCombined64](/sql-reference/aggregate-functions/reference/uniqcombined64)
- [uniqHLL12](/sql-reference/aggregate-functions/reference/uniqhll12)
- [uniqExact](/sql-reference/aggregate-functions/reference/uniqexact)
- [uniqTheta](/sql-reference/aggregate-functions/reference/uniqthetasketch)
