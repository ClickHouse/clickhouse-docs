---
description: '引数の異なる値のおおよその個数を計算します。'
sidebar_position: 205
slug: /sql-reference/aggregate-functions/reference/uniqcombined
title: 'uniqCombined'
doc_type: 'reference'
---

# uniqCombined {#uniqcombined}

異なる引数値のおおよその個数を計算します。

```sql
uniqCombined(HLL_precision)(x[, ...])
```

`uniqCombined` 関数は、異なる値の個数を計算するのに適した関数です。

**Arguments**

* `HLL_precision`: [HyperLogLog](https://en.wikipedia.org/wiki/HyperLogLog) におけるセル数の 2 を底とする対数値。省略可能で、`uniqCombined(x[, ...])` のように関数を使用できます。`HLL_precision` のデフォルト値は 17 で、これはおおよそ 96 KiB の領域（2^17 個のセル、各 6 ビット）に相当します。
* `X`: 可変長のパラメーター。パラメーターには `Tuple`、`Array`、`Date`、`DateTime`、`String`、または数値型を指定できます。

**Returned value**

* [UInt64](../../../sql-reference/data-types/int-uint.md) 型の数値。

**Implementation details**

`uniqCombined` 関数は次のように動作します。

* 集計対象のすべてのパラメーターに対してハッシュ（`String` には 64 ビットハッシュ、それ以外には 32 ビットハッシュ）を計算し、そのハッシュ値を用いて計算を行います。
* 3 つのアルゴリズム（配列、ハッシュテーブル、誤差補正テーブル付き HyperLogLog）を組み合わせて使用します。
  * 相異なる要素数が少ない場合は配列を使用します。
  * 集合のサイズがより大きくなるとハッシュテーブルを使用します。
  * 要素数がさらに大きい場合は HyperLogLog を使用し、一定量のメモリのみを使用します。
* 決定的な結果を返します（クエリの処理順序には依存しません）。

:::note\
非 `String` 型には 32 ビットハッシュを使用するため、`UINT_MAX` を大きく超えるカーディナリティに対しては誤差が非常に大きくなります（数百億件程度の相異なる値を超えると急速に誤差が増加します）。したがって、このような場合は [uniqCombined64](/sql-reference/aggregate-functions/reference/uniqcombined64) を使用する必要があります。
:::

[uniq](/sql-reference/aggregate-functions/reference/uniq) 関数と比較すると、`uniqCombined` 関数は次の特性を持ちます。

* 使用メモリ量が数倍少ない。
* 計算精度が数倍高い。
* 通常は若干性能が低くなります。一部のシナリオでは、たとえば多くの集約状態をネットワーク越しに送信する分散クエリでは、`uniqCombined` の方が `uniq` より高速になることがあります。

**Example**

Query:

```sql
SELECT uniqCombined(number) FROM numbers(1e6);
```

結果:

```response
┌─uniqCombined(number)─┐
│              1001148 │ -- 100万
└──────────────────────┘
```

はるかに大きな入力に対する `uniqCombined` と `uniqCombined64` の違いの例については、[uniqCombined64](/sql-reference/aggregate-functions/reference/uniqcombined64) の例のセクションを参照してください。

**関連項目**

* [uniq](/sql-reference/aggregate-functions/reference/uniq)
* [uniqCombined64](/sql-reference/aggregate-functions/reference/uniqcombined64)
* [uniqHLL12](/sql-reference/aggregate-functions/reference/uniqhll12)
* [uniqExact](/sql-reference/aggregate-functions/reference/uniqexact)
* [uniqTheta](/sql-reference/aggregate-functions/reference/uniqthetasketch)
