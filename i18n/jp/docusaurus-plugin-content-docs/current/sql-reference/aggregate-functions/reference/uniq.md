---
'description': '引数の異なる値の概数を計算します。'
'sidebar_position': 204
'slug': '/sql-reference/aggregate-functions/reference/uniq'
'title': 'uniq'
'doc_type': 'reference'
---


# uniq

引数の異なる値の近似数を計算します。

```sql
uniq(x[, ...])
```

**引数**

この関数は可変数のパラメータを取ります。パラメータには `Tuple`、`Array`、`Date`、`DateTime`、`String`、または数値型を指定できます。

**返される値**

- [UInt64](../../../sql-reference/data-types/int-uint.md)型の数値。

**実装の詳細**

関数：

- 集約内のすべてのパラメータに対してハッシュを計算し、それを計算に使用します。

- 適応型サンプリングアルゴリズムを使用します。計算状態のために、関数は最大65536の要素ハッシュ値のサンプルを使用します。このアルゴリズムは非常に高精度で、CPU上で非常に効率的です。クエリに複数のこの関数が含まれている場合、`uniq`を使用することは他の集約関数を使用するのとほぼ同じくらい速くなります。

- 結果を決定論的に提供します（クエリ処理の順序には依存しません）。

この関数はほぼすべてのシナリオで使用することをお勧めします。

**関連項目**

- [uniqCombined](/sql-reference/aggregate-functions/reference/uniqcombined)
- [uniqCombined64](/sql-reference/aggregate-functions/reference/uniqcombined64)
- [uniqHLL12](/sql-reference/aggregate-functions/reference/uniqhll12)
- [uniqExact](/sql-reference/aggregate-functions/reference/uniqexact)
- [uniqTheta](/sql-reference/aggregate-functions/reference/uniqthetasketch)
