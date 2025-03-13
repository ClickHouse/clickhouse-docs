---
slug: /sql-reference/aggregate-functions/reference/uniqcombined
sidebar_position: 205
title: 'uniqCombined'
description: '異なる引数値のおおよその数を計算します。'
---


# uniqCombined

異なる引数値のおおよその数を計算します。

``` sql
uniqCombined(HLL_precision)(x[, ...])
```

`uniqCombined` 関数は、異なる値の数を計算するのに適した選択肢です。

**引数**

- `HLL_precision`: [HyperLogLog](https://en.wikipedia.org/wiki/HyperLogLog)のセル数の2を基数とした対数。オプショナルで、関数を `uniqCombined(x[, ...])` として使用できます。`HLL_precision` のデフォルト値は17で、これは実質的に96 KiBのスペース（2^17セル、各セル6ビット）を占有します。
- `X`: 可変数のパラメータ。パラメータには `Tuple`、`Array`、`Date`、`DateTime`、`String`、または数値型が使用できます。

**戻り値**

- 数値 [UInt64](../../../sql-reference/data-types/int-uint.md)-型の数値です。

**実装の詳細**

`uniqCombined` 関数は以下を行います：

- 集約内のすべてのパラメータに対してハッシュ（`String` の場合は64ビットハッシュ、それ以外は32ビット）を計算し、それを計算に使用します。
- 三つのアルゴリズムの組み合わせを使用します：配列、ハッシュテーブル、およびエラー訂正テーブルを持つ HyperLogLog。
    - 少数の異なる要素に対しては、配列が使用されます。
    - セットサイズが大きくなると、ハッシュテーブルが使用されます。
    - より多くの要素に対しては、固定されたメモリ量を占有する HyperLogLog が使用されます。
- 結果を決定論的に提供します（クエリ処理順序には依存しません）。

:::note    
文字列以外の型に対して32ビットハッシュを使用するため、結果は `UINT_MAX` よりもはるかに大きな基数に対して非常に高い誤差を持ちます（異なる値が数十億を超えると誤差が急激に増加します）。したがって、この場合は [uniqCombined64](/sql-reference/aggregate-functions/reference/uniqcombined64) を使用するべきです。
:::

[uniq](/sql-reference/aggregate-functions/reference/uniq) 関数と比べて、`uniqCombined` 関数は以下の特徴があります：

- 消費するメモリが数倍少ない。
- 数倍高い精度で計算します。
- 通常は若干パフォーマンスが低下します。特定のシナリオでは、`uniqCombined` がネットワークを介して大量の集約状態を送信する分散クエリで `uniq` よりも良好なパフォーマンスを発揮することがあります。

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

より大きな入力に対する `uniqCombined` と `uniqCombined64` の違いの例については、[uniqCombined64](/sql-reference/aggregate-functions/reference/uniqcombined64) の例セクションを参照してください。

**関連項目**

- [uniq](/sql-reference/aggregate-functions/reference/uniq)
- [uniqCombined64](/sql-reference/aggregate-functions/reference/uniqcombined64)
- [uniqHLL12](/sql-reference/aggregate-functions/reference/uniqhll12)
- [uniqExact](/sql-reference/aggregate-functions/reference/uniqexact)
- [uniqTheta](/sql-reference/aggregate-functions/reference/uniqthetasketch)
