---
slug: /sql-reference/aggregate-functions/reference/uniqcombined64
sidebar_position: 206
---

# uniqCombined64

異なる引数値の概算数を計算します。この関数は [uniqCombined](../../../sql-reference/aggregate-functions/reference/uniqcombined.md#agg_function-uniqcombined) と同じですが、String データ型だけでなく、すべてのデータ型に対して 64 ビットのハッシュを使用します。

```sql
uniqCombined64(HLL_precision)(x[, ...])
```

**パラメータ**

- `HLL_precision`: [HyperLogLog](https://en.wikipedia.org/wiki/HyperLogLog) のセル数の底2対数。オプションで、`uniqCombined64(x[, ...])` のように関数を使用できます。デフォルト値は 17 で、実際には 96 KiB のスペース（2^17 セル、各6ビット）を占めます。
- `X`: 可変数のパラメータ。パラメータは `Tuple`、`Array`、`Date`、`DateTime`、`String`、または数値型を指定できます。

**戻り値**

- [UInt64](../../../sql-reference/data-types/int-uint.md)-型の数値。

**実装の詳細**

`uniqCombined64` 関数は以下のことを行います：
- 集約内のすべてのパラメータに対してハッシュ（すべてのデータ型に対して 64 ビットのハッシュ）を計算し、それを計算に使用します。
- 配列、ハッシュテーブル、エラー訂正テーブル付きの HyperLogLog の 3 つのアルゴリズムの組み合わせを使用します。
    - 少数の異なる要素の場合、配列が使用されます。 
    - セットサイズが大きくなると、ハッシュテーブルが使用されます。 
    - より多くの要素の場合は、固定量のメモリを占有する HyperLogLog を使用します。
- 結果は決定論的に提供されます（クエリ処理の順序には依存しません）。

:::note
すべての型に対して 64 ビットのハッシュを使用しているため、結果は非常に高い誤差の影響を受けることはありません。これは、非 String 型に対して 32 ビットのハッシュを使用する [uniqCombined](../../../sql-reference/aggregate-functions/reference/uniqcombined.md) とは異なります。
:::

[uniq](../../../sql-reference/aggregate-functions/reference/uniq.md#agg_function-uniq) 関数と比較して、`uniqCombined64` 関数は：

- メモリ消費が数倍少ない。
- 計算精度が数倍高い。

**例**

以下の例では、`uniqCombined64` が `1e10` の異なる数に対して実行され、異なる引数値の数の非常に近い概算を返します。

クエリ：

```sql
SELECT uniqCombined64(number) FROM numbers(1e10);
```

結果：

```response
┌─uniqCombined64(number)─┐
│             9998568925 │ -- 100億
└────────────────────────┘
```

比較のために、`uniqCombined` 関数はこのサイズの入力に対してかなり不正確な近似値を返します。

クエリ：

```sql
SELECT uniqCombined(number) FROM numbers(1e10);
```

結果：

```response
┌─uniqCombined(number)─┐
│           5545308725 │ -- 55.45億
└──────────────────────┘
```

**関連項目**

- [uniq](../../../sql-reference/aggregate-functions/reference/uniq.md#agg_function-uniq)
- [uniqCombined](../../../sql-reference/aggregate-functions/reference/uniqcombined.md)
- [uniqHLL12](../../../sql-reference/aggregate-functions/reference/uniqhll12.md#agg_function-uniqhll12)
- [uniqExact](../../../sql-reference/aggregate-functions/reference/uniqexact.md#agg_function-uniqexact)
- [uniqTheta](../../../sql-reference/aggregate-functions/reference/uniqthetasketch.md#agg_function-uniqthetasketch)
