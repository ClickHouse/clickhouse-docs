---
description: '異なる引数値のおおよその個数を計算します。'
sidebar_position: 205
slug: /sql-reference/aggregate-functions/reference/uniqcombined
title: 'uniqCombined'
doc_type: 'reference'
---

# uniqCombined {#uniqcombined}

引数として与えられた異なる値のおおよその個数を計算します。

```sql
uniqCombined(HLL_precision)(x[, ...])
```

`uniqCombined` 関数は、異なる値の個数を計算するのに適した選択肢です。

**引数**

* `HLL_precision`: [HyperLogLog](https://en.wikipedia.org/wiki/HyperLogLog) におけるセル数の、2 を底とする対数値。省略可能で、`uniqCombined(x[, ...])` のように関数を使用できます。`HLL_precision` のデフォルト値は 17 で、これは実質的に 96 KiB の領域（2^17 個のセル、各 6 ビット）に相当します。
* `X`: 可変長のパラメータ。パラメータには `Tuple`、`Array`、`Date`、`DateTime`、`String`、または数値型を指定できます。

**戻り値**

* [UInt64](../../../sql-reference/data-types/int-uint.md) 型の数値。

**実装の詳細**

`uniqCombined` 関数は次のように動作します:

* 集約内のすべてのパラメータに対してハッシュ（`String` には 64 ビットハッシュ、それ以外には 32 ビットハッシュ）を計算し、それを計算に使用します。
* 3 つのアルゴリズム（配列、ハッシュテーブル、および誤差補正テーブル付き HyperLogLog）の組み合わせを使用します。
  * 異なる要素数が少ない場合は、配列を使用します。
  * Set のサイズが大きくなると、ハッシュテーブルを使用します。
  * さらに要素数が多い場合は、HyperLogLog を使用し、一定量のメモリを占有します。
* 結果を決定的に返します（クエリの処理順序に依存しません）。

:::note
非 `String` 型には 32 ビットハッシュを使用するため、カーディナリティが `UINT_MAX` を大きく超える場合には誤差が非常に大きくなります（数百億件の異なる値を超えたあたりから急速に誤差が増大します）。したがって、このような場合には [uniqCombined64](/sql-reference/aggregate-functions/reference/uniqcombined64) を使用する必要があります。
:::

[uniq](/sql-reference/aggregate-functions/reference/uniq) 関数と比較して、`uniqCombined` 関数は次の特徴があります。

* メモリ消費量が数倍少ない。
* 計算精度が数倍高い。
* 通常はパフォーマンスがわずかに低くなります。一部のシナリオでは、例えば多くの集約状態をネットワーク越しに送信する分散クエリでは、`uniqCombined` の方が `uniq` より高速になる場合があります。

**例**

クエリ:

```sql
SELECT uniqCombined(number) FROM numbers(1e6);
```

結果：

```response
┌─uniqCombined(number)─┐
│              1001148 │ -- 100万
└──────────────────────┘
```

さらに大きな入力に対する `uniqCombined` と `uniqCombined64` の違いの例については、[uniqCombined64](/sql-reference/aggregate-functions/reference/uniqcombined64) の「例」セクションを参照してください。

**関連項目**

* [uniq](/sql-reference/aggregate-functions/reference/uniq)
* [uniqCombined64](/sql-reference/aggregate-functions/reference/uniqcombined64)
* [uniqHLL12](/sql-reference/aggregate-functions/reference/uniqhll12)
* [uniqExact](/sql-reference/aggregate-functions/reference/uniqexact)
* [uniqTheta](/sql-reference/aggregate-functions/reference/uniqthetasketch)
