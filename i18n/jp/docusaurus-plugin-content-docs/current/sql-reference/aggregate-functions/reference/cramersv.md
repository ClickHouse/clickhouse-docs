---
slug: /sql-reference/aggregate-functions/reference/cramersv
sidebar_position: 127
title: "cramersV"
description: "`cramersV` 関数の結果は、変数間に関連がないことを示す 0 から 1 までの範囲であり、各値が他の値によって完全に決定される場合のみ 1 に達することができます。それは、2 つの変数間の関連性を最大可能な変動の割合として見ることができます。"
---


# cramersV

[Cramer's V](https://en.wikipedia.org/wiki/Cram%C3%A9r%27s_V)（時には Cramer's phi とも呼ばれます）は、テーブル内の 2 つのカラム間の関連性を測定する指標です。`cramersV` 関数の結果は、変数間に関連がないことを示す 0 から 1 までの範囲であり、各値が他の値によって完全に決定される場合のみ 1 に達することができます。それは、2 つの変数間の関連性を最大可能な変動の割合として見ることができます。

:::note
Cramer's V のバイアス補正バージョンについては、[cramersVBiasCorrected](./cramersvbiascorrected.md) を参照してください。
:::

**構文**

``` sql
cramersV(column1, column2)
```

**パラメータ**

- `column1`: 比較する最初のカラム。
- `column2`: 比較する2番目のカラム。

**返される値**

- カラムの値間に関連がない場合は 0、完全な関連がある場合は 1 となる値。

タイプ: いつでも [Float64](../../../sql-reference/data-types/float.md)。

**例**

以下で比較される 2 つのカラムは相互に関連がないため、`cramersV` の結果は 0 です：

クエリ:

``` sql
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

以下の 2 つのカラムはかなり近い関連を持っているため、`cramersV` の結果は高い値になります：

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
