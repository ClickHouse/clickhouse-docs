---
'description': 'Calculates the approximate number of different argument values, using
  the HyperLogLog algorithm.'
'sidebar_position': 208
'slug': '/sql-reference/aggregate-functions/reference/uniqhll12'
'title': 'uniqHLL12'
---




# uniqHLL12

異なる引数値の近似数を計算します。これは [HyperLogLog](https://en.wikipedia.org/wiki/HyperLogLog) アルゴリズムを使用しています。

```sql
uniqHLL12(x[, ...])
```

**引数**

この関数は可変数のパラメータを取ります。パラメータは `Tuple`、`Array`、`Date`、`DateTime`、`String`、または数値型であることができます。

**戻り値**

- [UInt64](../../../sql-reference/data-types/int-uint.md) 型の数値。

**実装詳細**

関数:

- 集約内のすべてのパラメータのハッシュを計算し、それを計算に使用します。

- HyperLogLog アルゴリズムを使用して、異なる引数値の数を近似します。

        2^12 の 5 ビットセルが使用されます。状態のサイズは 2.5 KB をわずかに超えます。結果は、小さなデータセット（&lt;10K 要素）に対してはあまり正確ではなく（最大約10%の誤差）。しかし、高カーディナリティのデータセット（10K-100M）に対しては、結果はかなり正確で、最大誤差は約1.6%です。100M から始まると推定誤差が増加し、非常に高いカーディナリティ（1B+ 要素）のデータセットに対して関数は非常に不正確な結果を返します。

- 決定的な結果を提供します（クエリ処理順序には依存しません）。

この関数の使用は推奨しません。ほとんどの場合、[uniq](/sql-reference/aggregate-functions/reference/uniq) または [uniqCombined](/sql-reference/aggregate-functions/reference/uniqcombined) 関数を使用してください。

**参照**

- [uniq](/sql-reference/aggregate-functions/reference/uniq)
- [uniqCombined](/sql-reference/aggregate-functions/reference/uniqcombined)
- [uniqExact](/sql-reference/aggregate-functions/reference/uniqexact)
- [uniqTheta](/sql-reference/aggregate-functions/reference/uniqthetasketch)
