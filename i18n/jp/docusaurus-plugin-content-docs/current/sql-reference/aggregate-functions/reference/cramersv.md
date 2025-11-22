---
description: '`cramersV` 関数の結果は 0（変数間に全く関連がないことに対応）から 1 の範囲をとり、各値が他方の変数によって一意に決まる場合にのみ 1 に達します。これは、2つの変数間の関連性を、それらが理論上取りうる最大の変動に対する割合として捉えることができます。'
sidebar_position: 127
slug: /sql-reference/aggregate-functions/reference/cramersv
title: 'cramersV'
doc_type: 'reference'
---

# cramersV

[Cramer&#39;s V](https://en.wikipedia.org/wiki/Cram%C3%A9r%27s_V)（Cramer&#39;s phi と呼ばれることもあります）は、テーブル内の2つの列間の関連を測る指標です。`cramersV` 関数の結果は 0（変数間に関連がないことに対応）から 1 の範囲を取り、各値が他方によって完全に決定される場合にのみ 1 に達します。これは、2つの変数間の関連を、それらの取りうる最大の変動幅に対する割合として解釈できます。

:::note
Cramer&#39;s V のバイアス補正版については、[cramersVBiasCorrected](./cramersvbiascorrected.md) を参照してください。
:::

**構文**

```sql
cramersV(column1, column2)
```

**パラメータ**

* `column1`: 比較対象となる 1 番目の列。
* `column2`: 比較対象となる 2 番目の列。

**戻り値**

* 列の値の間に関連性がまったくない場合に対応する 0 から、完全な関連性がある場合に対応する 1 までの値。

型: 常に [Float64](../../../sql-reference/data-types/float.md)。

**例**

以下で比較されている 2 つの列には互いに関連性がないため、`cramersV` の結果は 0 になります。

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

結果：

```response
┌─cramersV(a, b)─┐
│              0 │
└────────────────┘
```

以下の2つの列には比較的強い関連があるため、`cramersV` の値は高くなります。

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
