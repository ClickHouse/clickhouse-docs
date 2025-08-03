---
description: 'Calculates the approximate number of different argument values. It
  is the same as uniqCombined, but uses a 64-bit hash for all data types rather than
  just for the String data type.'
sidebar_position: 206
slug: '/sql-reference/aggregate-functions/reference/uniqcombined64'
title: 'uniqCombined64'
---




# uniqCombined64

異なる引数値の概算数を計算します。これは [uniqCombined](/sql-reference/aggregate-functions/reference/uniqcombined) と同じですが、String データ型だけでなくすべてのデータ型に対して 64 ビットハッシュを使用します。

```sql
uniqCombined64(HLL_precision)(x[, ...])
```

**パラメータ**

- `HLL_precision`: [HyperLogLog](https://en.wikipedia.org/wiki/HyperLogLog) のセルの数の基数 2 の対数です。オプションで、関数を `uniqCombined64(x[, ...])` のように使用できます。`HLL_precision` のデフォルト値は 17 で、これは実質的に 96 KiB のスペース（2^17 セル、各 6 ビット）を占めます。
- `X`: 可変数のパラメータ。パラメータは `Tuple`, `Array`, `Date`, `DateTime`, `String`, または数値型です。

**返される値**

- [UInt64](../../../sql-reference/data-types/int-uint.md) 型の数値。

**実装の詳細**

`uniqCombined64` 関数は以下を行います：
- すべてのパラメータに対してハッシュ（すべてのデータ型に対する 64 ビットハッシュ）を計算し、それを計算に使用します。
- 配列、ハッシュテーブル、エラー修正テーブルを持つ HyperLogLog という 3 つのアルゴリズムの組み合わせを使用します。
    - 小さな異なる要素の数の場合、配列が使用されます。 
    - 集合のサイズが大きくなると、ハッシュテーブルが使用されます。 
    - より大きな数の要素については、固定サイズのメモリを占める HyperLogLog が使用されます。
- 結果を決定論的に提供します（クエリ処理順序に依存しません）。

:::note
すべての型に対して 64 ビットハッシュを使用するため、結果は `UINT_MAX` よりもはるかに大きな基数に対して非常に高いエラーの影響を受けません。これは 32 ビットハッシュを使用する [uniqCombined](../../../sql-reference/aggregate-functions/reference/uniqcombined.md) とは異なります。
:::

[uniq](/sql-reference/aggregate-functions/reference/uniq) 関数と比較して、`uniqCombined64` 関数は：

- メモリを数倍少なく消費します。
- 数倍高い精度で計算します。

**例**

以下の例では、`uniqCombined64` が `1e10` 異なる数値に対して実行され、異なる引数値の非常に近い概算を返します。

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

比較すると、`uniqCombined` 関数はこのサイズの入力に対してはかなり不正確な近似値を返します。

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

**参照**

- [uniq](/sql-reference/aggregate-functions/reference/uniq)
- [uniqCombined](/sql-reference/aggregate-functions/reference/uniqcombined)
- [uniqHLL12](/sql-reference/aggregate-functions/reference/uniqhll12)
- [uniqExact](/sql-reference/aggregate-functions/reference/uniqexact)
- [uniqTheta](/sql-reference/aggregate-functions/reference/uniqthetasketch)
