---
'description': '異なる引数値の近似数を計算します。'
'sidebar_position': 205
'slug': '/sql-reference/aggregate-functions/reference/uniqcombined'
'title': 'uniqCombined'
'doc_type': 'reference'
---


# uniqCombined

異なる引数値の概算数を計算します。

```sql
uniqCombined(HLL_precision)(x[, ...])
```

`uniqCombined`関数は、異なる値の数を計算するための良い選択肢です。

**引数**

- `HLL_precision`: [HyperLogLog](https://en.wikipedia.org/wiki/HyperLogLog)のセルの数の2の冪対数。オプションで、関数を`uniqCombined(x[, ...])`として使用できます。`HLL_precision`のデフォルト値は17で、実質的に96 KiBのスペース（2^17セル、各6ビット）を占有します。
- `X`: 可変数のパラメータ。パラメータは`Tuple`、`Array`、`Date`、`DateTime`、`String`、または数値型です。

**返される値**

- [UInt64](../../../sql-reference/data-types/int-uint.md)-型の数値。

**実装の詳細**

`uniqCombined`関数は:

- 集約内のすべてのパラメータのハッシュ（`String`の場合は64ビットハッシュ、その他は32ビット）を計算し、計算に使用します。
- 配列、ハッシュテーブル、およびエラー訂正テーブルを持つHyperLogLogの3つのアルゴリズムの組み合わせを使用します。
  - 少数の異なる要素の場合、配列が使用されます。
  - セットサイズが大きくなると、ハッシュテーブルが使用されます。
  - より多くの要素の場合、固定メモリ量を占有するHyperLogLogが使用されます。
- 結果は決定論的に提供されます（クエリ処理順序には依存しません）。

:::note    
非`String`型に対して32ビットハッシュを使用するため、結果は`UINT_MAX`を大幅に超えるカーディナリティに対して非常に高い誤差が出ます（異なる値の数が数十億を超えると誤差は急速に増加します）。したがって、この場合は[uniqCombined64](/sql-reference/aggregate-functions/reference/uniqcombined64)を使用するべきです。
:::

[uniq](/sql-reference/aggregate-functions/reference/uniq)関数と比較して、`uniqCombined`関数は:

- 数倍少ないメモリを消費します。
- 数倍高い精度で計算します。
- 通常はわずかに性能が低くなります。特定のシナリオでは、`uniqCombined`はネットワーク経由で多数の集約状態を送信する分散クエリのような場合に`uniq`よりも優れたパフォーマンスを発揮することがあります。

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

`uniqCombined`と`uniqCombined64`の間の違いに関する例については、[uniqCombined64](/sql-reference/aggregate-functions/reference/uniqcombined64)の例のセクションを参照してください。

**関連事項**

- [uniq](/sql-reference/aggregate-functions/reference/uniq)
- [uniqCombined64](/sql-reference/aggregate-functions/reference/uniqcombined64)
- [uniqHLL12](/sql-reference/aggregate-functions/reference/uniqhll12)
- [uniqExact](/sql-reference/aggregate-functions/reference/uniqexact)
- [uniqTheta](/sql-reference/aggregate-functions/reference/uniqthetasketch)
