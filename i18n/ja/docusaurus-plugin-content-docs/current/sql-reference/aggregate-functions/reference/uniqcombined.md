---
slug: /sql-reference/aggregate-functions/reference/uniqcombined
sidebar_position: 205
---

# uniqCombined

異なる引数の値の近似数を計算します。

``` sql
uniqCombined(HLL_precision)(x[, ...])
```

`uniqCombined` 関数は、異なる値の数を計算するのに適した選択肢です。

**引数**

- `HLL_precision`: [HyperLogLog](https://en.wikipedia.org/wiki/HyperLogLog)内のセルの数の2の基数対数。オプションで、`uniqCombined(x[, ...])` として関数を使用できます。デフォルトの`HLL_precision`の値は17で、これは実質的に96 KiBのスペース（2^17 セル、各6ビット）を意味します。
- `X`: 可変数のパラメータ。パラメータには `Tuple`、`Array`、`Date`、`DateTime`、`String`、または数値型が含まれます。

**返される値**

- [UInt64](../../../sql-reference/data-types/int-uint.md)-型の数値。

**実装詳細**

`uniqCombined` 関数は以下を行います：

- 集約内のすべてのパラメータに対してハッシュ（`String`の場合は64ビットハッシュ、それ以外は32ビット）を計算し、それを使って計算を行います。
- 配列、ハッシュテーブル、およびエラー修正テーブルを備えたHyperLogLogの三つのアルゴリズムの組み合わせを使用します。
    - 異なる要素が少ない場合は、配列が使用されます。 
    - セットのサイズが大きくなると、ハッシュテーブルが使用されます。 
    - 複数の要素がある場合は、固定のメモリ量を占有するHyperLogLogが使用されます。
- 結果は決定的に提供されます（クエリ処理順序には依存しません）。

:::note    
非`String`型に対して32ビットハッシュを使用するため、結果は`UINT_MAX`を大きく超える基数に対して非常に高い誤差が生じます（何十億の異なる値の後にエラーが急激に増加します）。この場合、[uniqCombined64](../../../sql-reference/aggregate-functions/reference/uniqcombined64.md#agg_function-uniqcombined64)を使用するべきです。
:::

[uniq](../../../sql-reference/aggregate-functions/reference/uniq.md#agg_function-uniq) 関数と比較して、`uniqCombined` 関数は：

- 数倍少ないメモリを消費します。
- 数倍高い精度で計算します。
- 通常はわずかにパフォーマンスが低下します。いくつかのシナリオでは、`uniqCombined` が`uniq` よりもパフォーマンスが良くなることもあります。例えば、ネットワークを介して大量の集約状態を送信する分散クエリでの使用です。

**例**

クエリ:

```sql
SELECT uniqCombined(number) FROM numbers(1e6);
```

結果:

```response
┌─uniqCombined(number)─┐
│              1001148 │ -- 1.00 million
└──────────────────────┘
```

はるかに大きな入力に対する `uniqCombined` と `uniqCombined64` の違いの例については、[uniqCombined64](../../../sql-reference/aggregate-functions/reference/uniqcombined64.md#agg_function-uniqcombined64)の例のセクションを参照してください。

**関連情報**

- [uniq](../../../sql-reference/aggregate-functions/reference/uniq.md#agg_function-uniq)
- [uniqCombined64](../../../sql-reference/aggregate-functions/reference/uniqcombined64.md#agg_function-uniqcombined64)
- [uniqHLL12](../../../sql-reference/aggregate-functions/reference/uniqhll12.md#agg_function-uniqhll12)
- [uniqExact](../../../sql-reference/aggregate-functions/reference/uniqexact.md#agg_function-uniqexact)
- [uniqTheta](../../../sql-reference/aggregate-functions/reference/uniqthetasketch.md#agg_function-uniqthetasketch)
