---
description: '引数の異なる値のおおよその数を計算します。`uniqCombined` と同じですが、String データ型だけでなく、すべてのデータ型に対して 64 ビットのハッシュ値を使用します。'
sidebar_position: 206
slug: /sql-reference/aggregate-functions/reference/uniqcombined64
title: 'uniqCombined64'
doc_type: 'reference'
---

# uniqCombined64

異なる引数値のおおよその個数を計算します。[uniqCombined](/sql-reference/aggregate-functions/reference/uniqcombined) と同様ですが、`String` データ型だけでなく、すべてのデータ型に対して 64 ビットハッシュを使用します。

```sql
uniqCombined64(HLL_precision)(x[, ...])
```

**パラメータ**

* `HLL_precision`: [HyperLogLog](https://en.wikipedia.org/wiki/HyperLogLog) におけるセル数の底 2 の対数。オプションとして、関数を `uniqCombined64(x[, ...])` の形で使用できます。`HLL_precision` のデフォルト値は 17 で、これは実質 96 KiB の領域（2^17 個のセル、各 6 ビット）に相当します。
* `X`: 可変個のパラメータ。パラメータには `Tuple`、`Array`、`Date`、`DateTime`、`String`、または数値型を指定できます。

**返される値**

* [UInt64](../../../sql-reference/data-types/int-uint.md) 型の数値。

**実装の詳細**

`uniqCombined64` 関数は次のように動作します。

* 集約中のすべてのパラメータに対してハッシュ（すべてのデータ型に対して 64 ビットハッシュ）を計算し、そのハッシュ値を用いて計算を行います。
* 3 つのアルゴリズム（配列、ハッシュテーブル、および誤差補正テーブル付き HyperLogLog）を組み合わせて使用します。
  * 異なる要素数が少ない場合は配列を使用します。
  * 集合のサイズが大きくなるとハッシュテーブルを使用します。
  * さらに要素数が多い場合は HyperLogLog を使用し、固定量のメモリを使用します。
* 結果は決定的です（クエリ処理の順序には依存しません）。

:::note
すべての型に対して 64 ビットハッシュを使用するため、非 `String` 型に対して 32 ビットハッシュを使用する [uniqCombined](../../../sql-reference/aggregate-functions/reference/uniqcombined.md) と異なり、`UINT_MAX` を大きく超えるカーディナリティに対しても結果に非常に大きな誤差が生じることはありません。
:::

[uniq](/sql-reference/aggregate-functions/reference/uniq) 関数と比較すると、`uniqCombined64` 関数は次の特徴があります。

* 消費するメモリが数倍少ない。
* 計算精度が数倍高い。

**例**

以下の例では、`uniqCombined64` を `1e10` 個の異なる数値に対して実行し、異なる引数値の数に非常に近い近似値を返しています。

クエリ:

```sql
SELECT uniqCombined64(number) FROM numbers(1e10);
```

結果：

```response
┌─uniqCombined64(number)─┐
│             9998568925 │ -- 100億
└────────────────────────┘
```

比較すると、この規模の入力に対しては、`uniqCombined` 関数はかなり精度の低い近似値しか返しません。

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
