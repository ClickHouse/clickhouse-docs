---
slug: /sql-reference/aggregate-functions/reference/uniqcombined64
sidebar_position: 206
title: 'uniqCombined64'
description: '異なる引数の値の近似数を計算します。これは uniqCombined と同じですが、String データ型だけでなく、すべてのデータ型に対して 64 ビットハッシュを使用します。'
---


# uniqCombined64

異なる引数の値の近似数を計算します。これは [uniqCombined](/sql-reference/aggregate-functions/reference/uniqcombined) と同じですが、String データ型だけでなく、すべてのデータ型に対して 64 ビットハッシュを使用します。

``` sql
uniqCombined64(HLL_precision)(x[, ...])
```

**パラメータ**

- `HLL_precision`: [HyperLogLog](https://en.wikipedia.org/wiki/HyperLogLog) のセルの数の基数 2 の対数。オプションで、`uniqCombined64(x[, ...])` として関数を使用できます。`HLL_precision` のデフォルト値は 17 で、実質的に 96 KiB のスペース（2^17 セル、各 6 ビット）を使用します。
- `X`: 可変数のパラメータ。パラメータは `Tuple`、`Array`、`Date`、`DateTime`、`String`、または数値型を取ることができます。

**返される値**

- [UInt64](../../../sql-reference/data-types/int-uint.md)-型の数値。

**実装の詳細**

`uniqCombined64` 関数は次のことを行います：
- 集約内のすべてのパラメータのハッシュ（すべてのデータ型に対して 64 ビットのハッシュ）を計算し、それを計算に使用します。
- 配列、ハッシュテーブル、および誤差修正テーブルを用いた HyperLogLog の三つのアルゴリズムの組み合わせを使用します。
    - 異なる要素数が少ない場合は、配列を使用します。 
    - セットサイズが大きくなると、ハッシュテーブルを使用します。 
    - 要素数がさらに大きい場合は、固定量のメモリを占有する HyperLogLog を使用します。
- 結果は決定論的に提供されます（クエリ処理順序に依存しません）。

:::note
すべての型に対して 64 ビットハッシュを使用するため、結果は `UINT_MAX` よりもはるかに大きい数の基数に対して非常に高い誤差の影響を受けません。これは、非 `String` 型に対して 32 ビットハッシュを使用する [uniqCombined](../../../sql-reference/aggregate-functions/reference/uniqcombined.md) とは異なります。
:::

[uniq](/sql-reference/aggregate-functions/reference/uniq) 関数と比較すると、`uniqCombined64` 関数は：

- 消費するメモリが数倍少ないです。
- 計算精度が数倍高いです。

**例**

以下の例では、`uniqCombined64` を `1e10` 異なる数字に対して実行し、異なる引数の値の近似数を非常に近い値で返します。

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

比較すると、`uniqCombined` 関数はこのサイズの入力に対してかなり悪い近似値を返します。

クエリ：

```sql
SELECT uniqCombined(number) FROM numbers(1e10);
```

結果：

```response
┌─uniqCombined(number)─┐
│           5545308725 │ -- 55.4 億
└──────────────────────┘
```

**関連項目**

- [uniq](/sql-reference/aggregate-functions/reference/uniq)
- [uniqCombined](/sql-reference/aggregate-functions/reference/uniqcombined)
- [uniqHLL12](/sql-reference/aggregate-functions/reference/uniqhll12)
- [uniqExact](/sql-reference/aggregate-functions/reference/uniqexact)
- [uniqTheta](/sql-reference/aggregate-functions/reference/uniqthetasketch)
