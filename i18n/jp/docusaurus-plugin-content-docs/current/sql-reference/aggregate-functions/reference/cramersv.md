---
'description': '`cramersV` 関数の結果は、0（変数間の関連性がないことに対応）から1までの範囲で、各値が完全に他の値によって決定される場合のみ1に達することができます。これは、2つの変数間の関連性をそれらの最大可能な変動のパーセンテージとして見ることができます。'
'sidebar_position': 127
'slug': '/sql-reference/aggregate-functions/reference/cramersv'
'title': 'cramersV'
'doc_type': 'reference'
---


# cramersV

[Cramer's V](https://en.wikipedia.org/wiki/Cram%C3%A9r%27s_V)（場合によってはCramer's phiとも呼ばれる）は、テーブル内の2つのカラム間の関連性を測定する指標です。 `cramersV`関数の結果は、0（変数間に関連性がないことに対応）から1までの範囲で、各値が他の値によって完全に決定される場合にのみ1に到達します。これは、2つの変数間の関連性をその最大の可能な変動の割合として見ることができます。

:::note
Cramer's Vのバイアス補正バージョンについては、以下を参照してください: [cramersVBiasCorrected](./cramersvbiascorrected.md)
:::

**構文**

```sql
cramersV(column1, column2)
```

**パラメータ**

- `column1`: 比較される最初のカラム。
- `column2`: 比較される2番目のカラム。

**返される値**

- カラムの値間に関連性がないことに対応する0から（完全な関連性に対応する）1までの値。

タイプ: いつも [Float64](../../../sql-reference/data-types/float.md)。

**例**

以下で比較されている2つのカラムは互いに関連性がないため、`cramersV`の結果は0です：

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

以下の2つのカラムは比較的近い関連性を持っているため、`cramersV`の結果は高い値になります：

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
