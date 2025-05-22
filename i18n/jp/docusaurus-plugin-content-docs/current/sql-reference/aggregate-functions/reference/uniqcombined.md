---
'description': '異なる引数値のおおよその数を計算します。'
'sidebar_position': 205
'slug': '/sql-reference/aggregate-functions/reference/uniqcombined'
'title': 'uniqCombined'
---




# uniqCombined

異なる引数値の概算数を計算します。

```sql
uniqCombined(HLL_precision)(x[, ...])
```

`uniqCombined` 関数は、異なる値の数を計算するための良い選択です。

**引数**

- `HLL_precision`: [HyperLogLog](https://en.wikipedia.org/wiki/HyperLogLog) のセル数の2進対数。オプションで、`uniqCombined(x[, ...])` として関数を使用できます。`HLL_precision` のデフォルト値は17で、これは実質的に96 KiBのスペース（2^17セル、各6ビット）を占めます。
- `X`: 可変数のパラメータ。パラメータは `Tuple`、`Array`、`Date`、`DateTime`、`String` または数値型です。

**戻り値**

- [UInt64](../../../sql-reference/data-types/int-uint.md)型の数値。

**実装の詳細**

`uniqCombined` 関数は次のように機能します：

- 集約内のすべてのパラメータのハッシュ（`String`の場合は64ビットハッシュ、それ以外は32ビット）を計算し、それを計算に使用します。
- 配列、ハッシュテーブル、エラー補正テーブルを使用したHyperLogLogの3つのアルゴリズムの組み合わせを利用します。
    - 少数の異なる要素には配列が使用されます。
    - 集合サイズが大きい場合にはハッシュテーブルが使用されます。
    - さらに多くの要素に対しては、固定量のメモリを占有するHyperLogLogが使用されます。
- 結果を決定論的に提供します（クエリ処理順序に依存しません）。

:::note    
`String`型以外では32ビットハッシュを使用するため、`UINT_MAX`を大きく超えるカーディナリティの場合、結果は非常に高い誤差を持ちます（数十億の異なる値を超えると誤差が急上昇します）。したがって、この場合は [uniqCombined64](/sql-reference/aggregate-functions/reference/uniqcombined64) を使用するべきです。
:::

[uniq](/sql-reference/aggregate-functions/reference/uniq) 関数と比べて、`uniqCombined` 関数は：

- メモリの消費が数倍少ないです。
- 精度が数倍高いです。
- 通常、パフォーマンスがわずかに低下します。一部のシナリオでは、ネットワーク上で大量の集約状態を伝送する分散クエリのように、`uniqCombined` が `uniq` よりも優れた性能を発揮します。

**例**

クエリ:

```sql
SELECT uniqCombined(number) FROM numbers(1e6);
```

結果:

```response
┌─uniqCombined(number)─┐
│              1001148 │ -- 1.00百万
└──────────────────────┘
```

より大きな入力に対する `uniqCombined` と `uniqCombined64` の違いの例については、[uniqCombined64](/sql-reference/aggregate-functions/reference/uniqcombined64) の例のセクションを参照してください。

**関連項目**

- [uniq](/sql-reference/aggregate-functions/reference/uniq)
- [uniqCombined64](/sql-reference/aggregate-functions/reference/uniqcombined64)
- [uniqHLL12](/sql-reference/aggregate-functions/reference/uniqhll12)
- [uniqExact](/sql-reference/aggregate-functions/reference/uniqexact)
- [uniqTheta](/sql-reference/aggregate-functions/reference/uniqthetasketch)
