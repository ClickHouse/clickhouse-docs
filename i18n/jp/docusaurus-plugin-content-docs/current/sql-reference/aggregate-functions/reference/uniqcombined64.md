---
description: '異なる引数値のおおよその個数を計算します。uniqCombined と同様ですが、String データ型だけでなく、すべてのデータ型に対して 64 ビットハッシュを使用します。'
sidebar_position: 206
slug: /sql-reference/aggregate-functions/reference/uniqcombined64
title: 'uniqCombined64'
doc_type: 'reference'
---

# uniqCombined64 {#uniqcombined64}

異なる引数値のおおよその個数を計算します。[uniqCombined](/sql-reference/aggregate-functions/reference/uniqcombined) と同様ですが、`String` データ型だけでなく、すべてのデータ型に対して 64 ビットのハッシュを使用します。

```sql
uniqCombined64(HLL_precision)(x[, ...])
```

**パラメーター**

* `HLL_precision`: [HyperLogLog](https://en.wikipedia.org/wiki/HyperLogLog) におけるセル数の 2 を底とする対数。オプションとして、関数を `uniqCombined64(x[, ...])` のように使用できます。`HLL_precision` のデフォルト値は 17 で、これは実質的に 96 KiB のメモリを使用します（2^17 個のセル、各セル 6 ビット）。
* `X`: 可変個のパラメーター。パラメーターには `Tuple`、`Array`、`Date`、`DateTime`、`String`、数値型を指定できます。

**戻り値**

* [UInt64](../../../sql-reference/data-types/int-uint.md) 型の数値。

**実装の詳細**

`uniqCombined64` 関数は次のように動作します。

* 集約内のすべてのパラメーターに対してハッシュ（すべてのデータ型に対する 64 ビットハッシュ）を計算し、その値を用いて計算を行います。
* 3 つのアルゴリズム（配列、ハッシュテーブル、誤差補正テーブル付き HyperLogLog）を組み合わせて使用します。
  * 相異なる要素数が少ない場合は、配列を使用します。
  * 集合のサイズが大きくなると、ハッシュテーブルを使用します。
  * さらに要素数が多い場合は、一定量のメモリを使用する HyperLogLog を使用します。
* 結果は決定的であり（クエリの処理順序に依存しません）、常に同じ値を返します。

:::note
すべての型に対して 64 ビットハッシュを使用するため、非 `String` 型に対して 32 ビットハッシュを使用する [uniqCombined](../../../sql-reference/aggregate-functions/reference/uniqcombined.md) とは異なり、`UINT_MAX` を大きく超えるカーディナリティに対しても非常に大きな誤差は生じません。
:::

[uniq](/sql-reference/aggregate-functions/reference/uniq) 関数と比較して、`uniqCombined64` 関数は次の特徴があります。

* 使用するメモリ量が数倍少ない。
* 計算精度が数倍高い。

**例**

以下の例では、`uniqCombined64` を `1e10` 個の異なる数値に対して実行し、異なる引数値の個数に非常に近い近似値を返します。

クエリ:

```sql
SELECT uniqCombined64(number) FROM numbers(1e10);
```

結果:

```response
┌─uniqCombined64(number)─┐
│             9998568925 │ -- 100億
└────────────────────────┘
```

比較すると、この程度のサイズの入力に対しては、`uniqCombined` 関数はあまり精度の高くない近似結果を返します。

クエリ:

```sql
SELECT uniqCombined(number) FROM numbers(1e10);
```

結果：

```response
┌─uniqCombined(number)─┐
│           5545308725 │ -- 55億4530万
└──────────────────────┘
```

**関連項目**

* [uniq](/sql-reference/aggregate-functions/reference/uniq)
* [uniqCombined](/sql-reference/aggregate-functions/reference/uniqcombined)
* [uniqHLL12](/sql-reference/aggregate-functions/reference/uniqhll12)
* [uniqExact](/sql-reference/aggregate-functions/reference/uniqexact)
* [uniqTheta](/sql-reference/aggregate-functions/reference/uniqthetasketch)
