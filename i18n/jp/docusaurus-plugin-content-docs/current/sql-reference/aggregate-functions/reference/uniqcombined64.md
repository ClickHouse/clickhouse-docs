---
description: '異なる引数の値の近似数を計算します。これは uniqCombined と同様ですが、String データ型に対してのみでなく、すべてのデータ型に対して 64 ビットハッシュを使用します。'
sidebar_position: 206
slug: /sql-reference/aggregate-functions/reference/uniqcombined64
title: 'uniqCombined64'
---


# uniqCombined64

異なる引数の値の近似数を計算します。これは [uniqCombined](/sql-reference/aggregate-functions/reference/uniqcombined) と同様ですが、String データ型に対してのみでなく、すべてのデータ型に対して 64 ビットハッシュを使用します。

```sql
uniqCombined64(HLL_precision)(x[, ...])
```

**パラメータ**

- `HLL_precision`: [HyperLogLog](https://en.wikipedia.org/wiki/HyperLogLog) におけるセルの数の 2 を底とする対数。オプションとして、`uniqCombined64(x[, ...])` として関数を使用できます。`HLL_precision` のデフォルト値は 17 で、これは実質的に 96 KiB のスペースを占有します（2^17 セル、各セル 6 ビット）。
- `X`: 可変数のパラメータ。パラメータは `Tuple`、`Array`、`Date`、`DateTime`、`String`、または数値型であることができます。

**戻り値**

- [UInt64](../../../sql-reference/data-types/int-uint.md) 型の数値。

**実装の詳細**

`uniqCombined64` 関数は以下を行います：
- 集約内のすべてのパラメータに対してハッシュ（すべてのデータ型に対する 64 ビットハッシュ）を計算し、それを計算に使用します。
- 三つのアルゴリズムの組み合わせを使用します：配列、ハッシュテーブル、およびエラー訂正テーブル付きの HyperLogLog。
    - 少数の異なる要素には配列が使用されます。
    - セットサイズが大きくなると、ハッシュテーブルが使用されます。
    - より多くの要素になると、HyperLogLog が使用され、固定量のメモリを占有します。
- 結果を決定論的に提供します（クエリ処理の順序には依存しません）。

:::note
すべての型に対して 64 ビットハッシュを使用するため、結果は `UINT_MAX` よりも大きな基数の場合に非常に高いエラーを被りません。これは、非 `String` 型に対して 32 ビットハッシュを使用する [uniqCombined](../../../sql-reference/aggregate-functions/reference/uniqcombined.md) の問題でありません。
:::

[uniq](/sql-reference/aggregate-functions/reference/uniq) 関数と比較して、`uniqCombined64` 関数は：

- 数倍少ないメモリを消費します。
- 数倍高い精度で計算します。

**例**

以下の例では、`uniqCombined64` が `1e10` の異なる数値に対して実行され、異なる引数の値の数の非常に近い近似を返します。

クエリ：

```sql
SELECT uniqCombined64(number) FROM numbers(1e10);
```

結果：

```response
┌─uniqCombined64(number)─┐
│             9998568925 │ -- 10.00 億
└────────────────────────┘
```

比較のために、`uniqCombined` 関数はこのサイズの入力に対してかなり悪い近似を返します。

クエリ：

```sql
SELECT uniqCombined(number) FROM numbers(1e10);
```

結果：

```response
┌─uniqCombined(number)─┐
│           5545308725 │ -- 5.55 億
└──────────────────────┘
```

**参照**

- [uniq](/sql-reference/aggregate-functions/reference/uniq)
- [uniqCombined](/sql-reference/aggregate-functions/reference/uniqcombined)
- [uniqHLL12](/sql-reference/aggregate-functions/reference/uniqhll12)
- [uniqExact](/sql-reference/aggregate-functions/reference/uniqexact)
- [uniqTheta](/sql-reference/aggregate-functions/reference/uniqthetasketch)
