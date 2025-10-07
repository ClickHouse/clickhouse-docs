---
'description': '`contingency` 関数は、テーブル内の2つのカラム間の関連性を測定する値である偶発性係数を計算します。計算は `cramersV`
  関数に似ていますが、平方根の分母が異なります。'
'sidebar_position': 116
'slug': '/sql-reference/aggregate-functions/reference/contingency'
'title': '偶発性'
'doc_type': 'reference'
---


# contingency

`contingency`関数は、テーブル内の2つのカラム間の関連性を測定する値である[コンティンジェンシー係数](https://en.wikipedia.org/wiki/Contingency_table#Cram%C3%A9r's_V_and_the_contingency_coefficient_C)を計算します。この計算は、異なる分母を持つ[ `cramersV`関数](./cramersv.md) に似ています。

**構文**

```sql
contingency(column1, column2)
```

**引数**

- `column1`と`column2`は比較されるカラムです。

**戻り値**

- 0から1の間の値。結果が大きいほど、2つのカラムの関連性が高くなります。

**戻り値の型**は常に[Float64](../../../sql-reference/data-types/float.md)です。

**例**

以下の比較される2つのカラムは、互いに小さな関連性を持っています。比較のために`cramersV`の結果も含めています：

```sql
SELECT
    cramersV(a, b),
    contingency(a ,b)
FROM
    (
        SELECT
            number % 10 AS a,
            number % 4 AS b
        FROM
            numbers(150)
    );
```

結果：

```response
┌──────cramersV(a, b)─┬───contingency(a, b)─┐
│ 0.41171788506213564 │ 0.05812725261759165 │
└─────────────────────┴─────────────────────┘
```
