---
'description': 'The result of the `cramersV` function ranges from 0 (corresponding
  to no association between the variables) to 1 and can reach 1 only when each value
  is completely determined by the other. It may be viewed as the association between
  two variables as a percentage of their maximum possible variation.'
'sidebar_position': 127
'slug': '/sql-reference/aggregate-functions/reference/cramersv'
'title': 'cramersV'
---




# cramersV

[Cramer's V](https://en.wikipedia.org/wiki/Cram%C3%A9r%27s_V)（時々Cramer's phiと呼ばれる）は、テーブル内の二つのカラム間の関連性を測定する指標です。`cramersV`関数の結果は、変数間に関連がない場合に相当する0から1までの範囲で、各値が互いに完全に決定される場合にのみ1に達することができます。この指標は、二つの変数間の関連性をその最大可能変動の割合として見ることができます。

:::note
バイアス修正されたCramer's Vのバージョンについては、[cramersVBiasCorrected](./cramersvbiascorrected.md)を参照してください。
:::

**構文**

```sql
cramersV(column1, column2)
```

**パラメータ**

- `column1`: 比較する最初のカラム。
- `column2`: 比較する二番目のカラム。

**返される値**

- カラムの値間に関連がない場合に相当する0から（完全な関連）1までの値。

タイプ: いつも [Float64](../../../sql-reference/data-types/float.md)。

**例**

以下の二つのカラムは互いに関連がないため、`cramersV`の結果は0です：

クエリ:

```sql
SELECT
    cramersV(a, b)
FROM
    (
        SELECT
            number % 3 AS a,
            number % 5 AS b
        FROM
            numbers(150)
    );
```

結果:

```response
┌─cramersV(a, b)─┐
│              0 │
└────────────────┘
```

以下の二つのカラムはかなり密接に関連しているため、`cramersV`の結果は高い値になります：

```sql
SELECT
    cramersV(a, b)
FROM
    (
        SELECT
            number % 10 AS a,
            number % 5 AS b
        FROM
            numbers(150)
    );
```

結果:

```response
┌─────cramersV(a, b)─┐
│ 0.8944271909999159 │
└────────────────────┘
```
