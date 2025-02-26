---
slug: /sql-reference/aggregate-functions/reference/cramersv
sidebar_position: 127
---

# cramersV

[Cramer's V](https://en.wikipedia.org/wiki/Cram%C3%A9r%27s_V)（時にはCramer's phiとも呼ばれる）は、テーブル内の二つのカラムの関係性を測る指標です。`cramersV` 関数の結果は 0（変数間に関係がないことに対応）から 1までの範囲であり、各値が完全に他の値によって決定される場合にのみ1に達することができます。これは、二つの変数の関係性をその最大の変動のパーセンテージとして見ることができます。

:::note
Cramer's Vのバイアス補正版については、[cramersVBiasCorrected](./cramersvbiascorrected.md)をご覧ください。
:::

**構文**

```sql
cramersV(column1, column2)
```

**パラメータ**

- `column1`: 比較する最初のカラム。
- `column2`: 比較する二番目のカラム。

**返される値**

- カラムの値間に関係がないことに対応する0から（完全な関連に対応する）1の間の値。

タイプ: いつでも [Float64](../../../sql-reference/data-types/float.md)。

**例**

以下で比較される二つのカラムは互いに関連がないため、`cramersV` の結果は0です。

クエリ：

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

結果：

```response
┌─cramersV(a, b)─┐
│              0 │
└────────────────┘
```

以下の二つのカラムはかなり近い関連性があるため、`cramersV` の結果は高い値になります。

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

結果：

```response
┌─────cramersV(a, b)─┐
│ 0.8944271909999159 │
└────────────────────┘
```
