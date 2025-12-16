---
description: '`cramersV` 関数の結果は 0（変数間に連関がないことに対応）から 1 の範囲を取り、一方の変数の各値が他方の変数の値によって完全に決定される場合にのみ 1 に達します。これは、2 つの変数間の連関の強さを、それらが取りうる理論上の最大変動に対する割合として解釈できます。'
sidebar_position: 127
slug: /sql-reference/aggregate-functions/reference/cramersv
title: 'cramersV'
doc_type: 'reference'
---

# cramersV {#cramersv}

[Cramer&#39;s V](https://en.wikipedia.org/wiki/Cram%C3%A9r%27s_V)（Cramer&#39;s phi と呼ばれることもあります）は、テーブル内の 2 つの列間の連関を測る指標です。`cramersV` 関数の結果は 0（変数間に連関がないことに対応）から 1 の範囲を取り、各値が他方によって完全に決定される場合にのみ 1 になります。これは、2 つの変数間の連関を、それらが取りうる最大の変動に対する割合として捉えることができます。

:::note
バイアス補正版の Cramer&#39;s V については次を参照してください: [cramersVBiasCorrected](./cramersvbiascorrected.md)
:::

**構文**

```sql
cramersV(column1, column2)
```

**パラメータ**

* `column1`: 比較対象となる 1 つ目の列。
* `column2`: 比較対象となる 2 つ目の列。

**戻り値**

* 0（列の値同士にまったく連関がないことに対応）から 1（完全な連関）までの値。

型: 常に [Float64](../../../sql-reference/data-types/float.md)。

**例**

以下で比較している 2 つの列には互いに連関がないため、`cramersV` の結果は 0 になります：

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

以下の 2 つの列同士には比較的強い関連性があるため、`cramersV` の結果は高い値になります。

```sql
SELECT
    cramersV(a, b)
FROM
    (
        SELECT
            number % 10 AS a,
            if(number % 12 = 0, (number + 1) % 5, number % 5) AS b
        FROM
            numbers(150)
    );
```

結果：

```response
┌─────cramersV(a, b)─┐
│ 0.9066801892162646 │
└────────────────────┘
```
