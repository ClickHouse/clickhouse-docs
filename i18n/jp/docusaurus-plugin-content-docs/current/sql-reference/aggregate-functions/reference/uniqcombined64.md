---
slug: /sql-reference/aggregate-functions/reference/uniqcombined64
sidebar_position: 206
title: "uniqCombined64"
description: "異なる引数値の近似数を計算します。これは uniqCombined と同じですが、String データ型だけでなく、すべてのデータ型に 64 ビットハッシュを使用します。"
---


# uniqCombined64

異なる引数値の近似数を計算します。これは [uniqCombined](../../../sql-reference/aggregate-functions/reference/uniqcombined.md#agg_function-uniqcombined) と同じですが、String データ型だけでなく、すべてのデータ型に 64 ビットハッシュを使用します。

``` sql
uniqCombined64(HLL_precision)(x[, ...])
```

**パラメータ**

- `HLL_precision`: [HyperLogLog](https://en.wikipedia.org/wiki/HyperLogLog) のセル数の 2 を基とした対数。オプションで、`uniqCombined64(x[, ...])` のように関数を使用できます。`HLL_precision` のデフォルト値は 17 で、実質的に 96 KiB のスペース（2^17 セル、各セル 6 ビット）を占有します。
- `x`: 可変数のパラメータ。パラメータは `Tuple`、`Array`、`Date`、`DateTime`、`String`、または数値型です。

**返される値**

- [UInt64](../../../sql-reference/data-types/int-uint.md) 型の数値。

**実装の詳細**

`uniqCombined64` 関数は：
- 集計内のすべてのパラメータに対してハッシュ（すべてのデータ型に対して64ビットハッシュ）を計算し、それを計算に使用します。
- 配列、ハッシュテーブル、誤差補正テーブル付きの HyperLogLog の 3 つのアルゴリズムの組み合わせを使用します。
    - 少数の異なる要素には配列が使用されます。
    - セットサイズが大きくなるとハッシュテーブルが使用されます。
    - より多くの要素に対しては、固定量のメモリを占有する HyperLogLog が使用されます。
- 結果を決定論的に提供します（クエリ処理の順序に依存しません）。

:::note
すべての型に 64 ビットハッシュを使用しているため、`UINT_MAX` よりもかなり大きな基数に対する結果は、32 ビットハッシュを使用する [uniqCombined](../../../sql-reference/aggregate-functions/reference/uniqcombined.md) のように非常に高い誤差に悩まされることはありません。
:::

[uniq](../../../sql-reference/aggregate-functions/reference/uniq.md#agg_function-uniq) 関数と比較して、`uniqCombined64` 関数は：

- 消費するメモリが数倍少ないです。
- 精度が数倍高く計算します。

**例**

以下の例では、`uniqCombined64` が `1e10` の異なる数値に対して実行され、異なる引数値の数に非常に近い近似値を返します。

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

比較として、`uniqCombined` 関数はこのサイズの入力に対してかなり貧弱な近似値を返します。

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

- [uniq](../../../sql-reference/aggregate-functions/reference/uniq.md#agg_function-uniq)
- [uniqCombined](../../../sql-reference/aggregate-functions/reference/uniqcombined.md)
- [uniqHLL12](../../../sql-reference/aggregate-functions/reference/uniqhll12.md#agg_function-uniqhll12)
- [uniqExact](../../../sql-reference/aggregate-functions/reference/uniqexact.md#agg_function-uniqexact)
- [uniqTheta](../../../sql-reference/aggregate-functions/reference/uniqthetasketch.md#agg_function-uniqthetasketch)
