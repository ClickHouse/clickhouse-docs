---
'description': '異なる引数値の近似数を計算します。これはuniqCombinedと同じですが、Stringデータ型だけでなく、すべてのデータ型に対して64ビットハッシュを使用します。'
'sidebar_position': 206
'slug': '/sql-reference/aggregate-functions/reference/uniqcombined64'
'title': 'uniqCombined64'
'doc_type': 'reference'
---


# uniqCombined64

異なる引数値の近似的な数を計算します。これは [uniqCombined](/sql-reference/aggregate-functions/reference/uniqcombined) と同じですが、String データ型だけでなく、すべてのデータ型に対して 64 ビットハッシュを使用します。

```sql
uniqCombined64(HLL_precision)(x[, ...])
```

**パラメータ**

- `HLL_precision`: [HyperLogLog](https://en.wikipedia.org/wiki/HyperLogLog) におけるセルの数の2の対数です。オプションとして、関数を `uniqCombined64(x[, ...])` のように使用することができます。`HLL_precision` のデフォルト値は 17 で、実質的に 96 KiB のメモリ（2^17 セル、各セル 6 ビット）を占有します。
- `X`: 可変数のパラメータ。パラメータは `Tuple`、`Array`、`Date`、`DateTime`、`String`、または数値型です。

**返される値**

- [UInt64](../../../sql-reference/data-types/int-uint.md) 型の数値。

**実装の詳細**

`uniqCombined64` 関数は以下のことを行います：
- 集約内のすべてのパラメータに対してハッシュ（すべてのデータ型に対して 64 ビットハッシュ）を計算し、それを計算に使用します。
- 配列、ハッシュテーブル、エラー訂正テーブルを持つ HyperLogLog の組み合わせの 3 つのアルゴリズムを使用します。
  - 異なる要素の数が少ない場合は、配列が使用されます。
  - セットのサイズが大きくなると、ハッシュテーブルが使用されます。
  - より多くの要素に対しては、固定のメモリを占有する HyperLogLog が使用されます。
- 結果は決定的に提供されます（クエリ処理の順序には依存しません）。

:::note
すべてのタイプに 64 ビットハッシュを使用しているため、結果は 32 ビットハッシュを使用する [uniqCombined](../../../sql-reference/aggregate-functions/reference/uniqcombined.md) のように、`UINT_MAX` よりも著しく大きなカーディナリティに対して非常に高いエラーを伴うことはありません。
:::

[uniq](/sql-reference/aggregate-functions/reference/uniq) 関数と比較して、`uniqCombined64` 関数は：

- 数倍少ないメモリを消費します。
- 数倍高い精度で計算します。

**例**

以下の例では、`1e10` 異なる数に対して `uniqCombined64` が実行され、異なる引数値の近似数が非常に密接に返されます。

クエリ：

```sql
SELECT uniqCombined64(number) FROM numbers(1e10);
```

結果：

```response
┌─uniqCombined64(number)─┐
│             9998568925 │ -- 10.00 billion
└────────────────────────┘
```

比較として、`uniqCombined` 関数はこのサイズの入力に対してかなり不十分な近似を返します。

クエリ：

```sql
SELECT uniqCombined(number) FROM numbers(1e10);
```

結果：

```response
┌─uniqCombined(number)─┐
│           5545308725 │ -- 5.55 billion
└──────────────────────┘
```

**関連項目**

- [uniq](/sql-reference/aggregate-functions/reference/uniq)
- [uniqCombined](/sql-reference/aggregate-functions/reference/uniqcombined)
- [uniqHLL12](/sql-reference/aggregate-functions/reference/uniqhll12)
- [uniqExact](/sql-reference/aggregate-functions/reference/uniqexact)
- [uniqTheta](/sql-reference/aggregate-functions/reference/uniqthetasketch)
