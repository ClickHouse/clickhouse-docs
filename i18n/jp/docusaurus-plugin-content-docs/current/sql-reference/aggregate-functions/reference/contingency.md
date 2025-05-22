---
'description': 'The `contingency` function calculates the contingency coefficient,
  a value that measures the association between two columns in a table. The computation
  is similar to the `cramersV` function but with a different denominator in the square
  root.'
'sidebar_position': 116
'slug': '/sql-reference/aggregate-functions/reference/contingency'
'title': 'contingency'
---




# contingency

`contingency` 関数は、テーブル内の2つのカラム間の関連を測定する値である [contingency coefficient](https://en.wikipedia.org/wiki/Contingency_table#Cram%C3%A9r's_V_and_the_contingency_coefficient_C) を計算します。この計算は、平方根に異なる分母を用いて [cramersV 関数](./cramersv.md) に似ています。

**構文**

```sql
contingency(column1, column2)
```

**引数**

- `column1` と `column2` は比較対象のカラムです。

**戻り値**

- 0 と 1 の間の値。結果が大きいほど、2つのカラムの関連は強くなります。

**返り値の型** は常に [Float64](../../../sql-reference/data-types/float.md) です。

**例**

以下の2つのカラムは互いに小さな関連性を持っています。また、比較のために `cramersV` の結果も含めています：

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
