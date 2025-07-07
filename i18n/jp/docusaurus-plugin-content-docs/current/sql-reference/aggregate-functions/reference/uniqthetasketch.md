---
'description': 'Calculates the approximate number of different argument values, using
  the Theta Sketch Framework.'
'sidebar_position': 209
'slug': '/sql-reference/aggregate-functions/reference/uniqthetasketch'
'title': 'uniqTheta'
---



異なる引数値のおおよその数を計算します。これは、[Theta Sketch Framework](https://datasketches.apache.org/docs/Theta/ThetaSketches.html#theta-sketch-framework)を使用しています。

```sql
uniqTheta(x[, ...])
```

**引数**

この関数は可変数のパラメータを受け取ります。パラメータは `Tuple`、 `Array`、 `Date`、 `DateTime`、 `String`、または数値型でなければなりません。

**戻り値**

- [UInt64](../../../sql-reference/data-types/int-uint.md)型の数値。

**実装の詳細**

関数:

- 集約内のすべてのパラメータに対してハッシュを計算し、それを計算に使用します。

- 異なる引数値の数を近似するために、[KMV](https://datasketches.apache.org/docs/Theta/InverseEstimate.html)アルゴリズムを使用します。

        4096(2^12) 64ビットスケッチが使用されます。状態のサイズは約41 KBです。

- 相対誤差は3.125%（95%の信頼度）で、詳細については[相対誤差テーブル](https://datasketches.apache.org/docs/Theta/ThetaErrorTable.html)を参照してください。

**関連情報**

- [uniq](/sql-reference/aggregate-functions/reference/uniq)
- [uniqCombined](/sql-reference/aggregate-functions/reference/uniqcombined)
- [uniqCombined64](/sql-reference/aggregate-functions/reference/uniqcombined64)
- [uniqHLL12](/sql-reference/aggregate-functions/reference/uniqhll12)
- [uniqExact](/sql-reference/aggregate-functions/reference/uniqexact)
