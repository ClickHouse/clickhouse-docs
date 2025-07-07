---
'description': '入力データに最大三角形三バケットアルゴリズムを適用します。'
'sidebar_label': 'largestTriangleThreeBuckets'
'sidebar_position': 159
'slug': '/sql-reference/aggregate-functions/reference/largestTriangleThreeBuckets'
'title': 'largestTriangleThreeBuckets'
---




# largestTriangleThreeBuckets

入力データに [Largest-Triangle-Three-Buckets](https://skemman.is/bitstream/1946/15343/3/SS_MSthesis.pdf) アルゴリズムを適用します。  
このアルゴリズムは、視覚化のために時系列データをダウンサンプリングするために使用されます。  
x座標でソートされた系列で動作するように設計されています。  
このアルゴリズムは、ソートされた系列をバケットに分割し、各バケット内で最大の三角形を見つけることによって機能します。  
バケットの数は、結果の系列におけるポイントの数に等しくなります。  
関数はデータを `x` でソートし、その後ソートされたデータにダウンサンプリングアルゴリズムを適用します。

**構文**

```sql
largestTriangleThreeBuckets(n)(x, y)
```

エイリアス: `lttb`。

**引数**

- `x` — x座標。[整数](../../../sql-reference/data-types/int-uint.md)、[浮動小数点](../../../sql-reference/data-types/float.md)、[小数](../../../sql-reference/data-types/decimal.md)、[日付](../../../sql-reference/data-types/date.md)、[Date32](../../../sql-reference/data-types/date32.md)、[日時](../../../sql-reference/data-types/datetime.md)、[日時64](../../../sql-reference/data-types/datetime64.md)。
- `y` — y座標。[整数](../../../sql-reference/data-types/int-uint.md)、[浮動小数点](../../../sql-reference/data-types/float.md)、[小数](../../../sql-reference/data-types/decimal.md)、[日付](../../../sql-reference/data-types/date.md)、[Date32](../../../sql-reference/data-types/date32.md)、[日時](../../../sql-reference/data-types/datetime.md)、[日時64](../../../sql-reference/data-types/datetime64.md)。

NaNは提供された系列では無視され、NaN値は分析から除外されます。これにより、関数は有効な数値データのみで動作します。

**パラメータ**

- `n` — 結果の系列内のポイントの数。[UInt64](../../../sql-reference/data-types/int-uint.md)。

**返される値**

[Array](../../../sql-reference/data-types/array.md) の [Tuple](../../../sql-reference/data-types/tuple.md) で、2つの要素を持ちます：

**例**

入力テーブル：

```text
┌─────x───────┬───────y──────┐
│ 1.000000000 │ 10.000000000 │
│ 2.000000000 │ 20.000000000 │
│ 3.000000000 │ 15.000000000 │
│ 8.000000000 │ 60.000000000 │
│ 9.000000000 │ 55.000000000 │
│ 10.00000000 │ 70.000000000 │
│ 4.000000000 │ 30.000000000 │
│ 5.000000000 │ 40.000000000 │
│ 6.000000000 │ 35.000000000 │
│ 7.000000000 │ 50.000000000 │
└─────────────┴──────────────┘
```

クエリ：

```sql
SELECT largestTriangleThreeBuckets(4)(x, y) FROM largestTriangleThreeBuckets_test;
```

結果：

```text
┌────────largestTriangleThreeBuckets(4)(x, y)───────────┐
│           [(1,10),(3,15),(9,55),(10,70)]              │
└───────────────────────────────────────────────────────┘
```
