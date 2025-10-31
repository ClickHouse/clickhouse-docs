---
'description': '引数の異なる値の近似数を計算します。HyperLogLogアルゴリズムを使用しています。'
'sidebar_position': 208
'slug': '/sql-reference/aggregate-functions/reference/uniqhll12'
'title': 'uniqHLL12'
'doc_type': 'reference'
---


# uniqHLL12

異なる引数値の近似数を計算します。これは、[HyperLogLog](https://en.wikipedia.org/wiki/HyperLogLog)アルゴリズムを使用しています。

```sql
uniqHLL12(x[, ...])
```

**引数**

関数は可変数のパラメータを受け取ります。パラメータは `Tuple`、`Array`、`Date`、`DateTime`、`String`、または数値型である必要があります。

**返される値**

- [UInt64](../../../sql-reference/data-types/int-uint.md)型の数値。

**実装の詳細**

関数：

- 集約内のすべてのパラメータのハッシュを計算し、それを計算に使用します。

- 異なる引数値の近似数を算出するためにHyperLogLogアルゴリズムを使用します。

        2^12の5ビットセルが使用されます。状態のサイズは2.5 KBを少し超えます。結果は小さなデータセット（&lt;10K要素）に対してはあまり正確ではありません（最大約10%の誤差）。しかし、高い基数のデータセット（10K-100M）に対しては、最大誤差が約1.6%とかなり正確です。100Mからは、推定誤差が増加し、非常に高い基数のデータセット（1B+要素）に対しては、関数が非常に不正確な結果を返すことになります。

- 確定的な結果を提供します（クエリ処理の順序に依存しません）。

この関数の使用は推奨しません。ほとんどの場合、[uniq](/sql-reference/aggregate-functions/reference/uniq)または[uniqCombined](/sql-reference/aggregate-functions/reference/uniqcombined)関数を使用してください。

**関連項目**

- [uniq](/sql-reference/aggregate-functions/reference/uniq)
- [uniqCombined](/sql-reference/aggregate-functions/reference/uniqcombined)
- [uniqExact](/sql-reference/aggregate-functions/reference/uniqexact)
- [uniqTheta](/sql-reference/aggregate-functions/reference/uniqthetasketch)
