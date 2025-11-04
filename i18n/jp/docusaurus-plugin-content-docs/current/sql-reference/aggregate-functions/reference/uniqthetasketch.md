---
'description': 'Theta Sketch フレームワークを使用して、異なる引数値の近似数を計算します。'
'sidebar_position': 209
'slug': '/sql-reference/aggregate-functions/reference/uniqthetasketch'
'title': 'uniqTheta'
'doc_type': 'reference'
---

Calculates the approximate number of different argument values, using the [Theta Sketch Framework](https://datasketches.apache.org/docs/Theta/ThetaSketches.html#theta-sketch-framework).

```sql
uniqTheta(x[, ...])
```

**Arguments**

この関数は、可変数のパラメータを受け取ります。パラメータは `Tuple`、`Array`、`Date`、`DateTime`、`String`、または数値型です。

**Returned value**

- [UInt64](../../../sql-reference/data-types/int-uint.md)-型の数値。

**Implementation details**

Function:

- 集約内のすべてのパラメータのハッシュを計算し、それを計算に使用します。

- 異なる引数値の数を近似するために[KMV](https://datasketches.apache.org/docs/Theta/InverseEstimate.html)アルゴリズムを使用します。

        4096(2^12) 64ビットスケッチが使用されます。ステートのサイズは約41 KBです。

- 相対誤差は3.125%（95%の信頼度）です。詳細については[相対誤差テーブル](https://datasketches.apache.org/docs/Theta/ThetaErrorTable.html)を参照してください。

**See Also**

- [uniq](/sql-reference/aggregate-functions/reference/uniq)
- [uniqCombined](/sql-reference/aggregate-functions/reference/uniqcombined)
- [uniqCombined64](/sql-reference/aggregate-functions/reference/uniqcombined64)
- [uniqHLL12](/sql-reference/aggregate-functions/reference/uniqhll12)
- [uniqExact](/sql-reference/aggregate-functions/reference/uniqexact)
