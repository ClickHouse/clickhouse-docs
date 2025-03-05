---
slug: /sql-reference/aggregate-functions/reference/uniqcombined64
sidebar_position: 206
title: "uniqCombined64"
description: "異なる引数値の概算数を計算します。これは uniqCombined と同じですが、String データ型だけでなく、すべてのデータ型に対して 64 ビットのハッシュを使用します。"
---


# uniqCombined64

異なる引数値の概算数を計算します。これは [uniqCombined](../../../sql-reference/aggregate-functions/reference/uniqcombined.md#agg_function-uniqcombined) と同じですが、String データ型だけでなく、すべてのデータ型に対して 64 ビットのハッシュを使用します。

``` sql
uniqCombined64(HLL_precision)(x[, ...])
```

**パラメータ**

- `HLL_precision`: [HyperLogLog](https://en.wikipedia.org/wiki/HyperLogLog) 内のセルの数の 2 の基数対数。オプションとして、関数を `uniqCombined64(x[, ...])` のように使用できます。`HLL_precision` のデフォルト値は 17 で、実質的には 96 KiB のスペース（2^17 セル、各 6 ビット）です。
- `X`: 可変数のパラメータ。パラメータは `Tuple`、`Array`、`Date`、`DateTime`、`String`、または数値型です。

**返される値**

- [UInt64](../../../sql-reference/data-types/int-uint.md)-型の数値。

**実装の詳細**

`uniqCombined64` 関数は：
- 集計内のすべてのパラメータに対してハッシュ（すべてのデータ型の 64 ビットハッシュ）を計算し、それを計算に使用します。
- 配列、ハッシュテーブル、エラー訂正テーブルを持つ HyperLogLog の 3 つのアルゴリズムの組み合わせを使用します。
    - 小さい数の異なる要素には配列が使用されます。 
    - セットサイズが大きくなるとハッシュテーブルが使用されます。 
    - より多くの要素がある場合は HyperLogLog が使用され、固定量のメモリを占有します。
- 結果は決定論的に提供されます（クエリ処理の順序に依存しません）。

:::note
すべてのタイプに対して 64 ビットのハッシュを使用しているため、結果は `UINT_MAX` よりもはるかに大きい基数に対して非常に高い誤差に悩まされることはありません。これは [uniqCombined](../../../sql-reference/aggregate-functions/reference/uniqcombined.md) が非`String`型に対して 32 ビットのハッシュを使用しているためです。
:::

[uniq](/sql-reference/aggregate-functions/reference/uniq) 関数と比較して、`uniqCombined64` 関数は：

- メモリを数倍少なく消費します。
- 精度が数倍高く計算します。

**例**

以下の例では、`uniqCombined64` が `1e10` の異なる数に対して実行され、異なる引数値の概算数が非常に近い値として返されます。

クエリ：

```sql
SELECT uniqCombined64(number) FROM numbers(1e10);
```

結果：

```response
┌─uniqCombined64(number)─┐
│             9998568925 │ -- 100 億
└────────────────────────┘
```

対照として、`uniqCombined` 関数はこのサイズの入力に対してあまり良い概算を返しません。

クエリ：

```sql
SELECT uniqCombined(number) FROM numbers(1e10);
```

結果：

```response
┌─uniqCombined(number)─┐
│           5545308725 │ -- 55.45 億
└──────────────────────┘
```

**関連項目**

- [uniq](/sql-reference/aggregate-functions/reference/uniq)
- [uniqCombined](../../../sql-reference/aggregate-functions/reference/uniqcombined.md)
- [uniqHLL12](../../../sql-reference/aggregate-functions/reference/uniqhll12.md#agg_function-uniqhll12)
- [uniqExact](/sql-reference/aggregate-functions/reference/uniqexact)
- [uniqTheta](../../../sql-reference/aggregate-functions/reference/uniqthetasketch.md#agg_function-uniqthetasketch)
