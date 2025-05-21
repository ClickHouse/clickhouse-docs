---
description: '`cramersV` 関数の結果は 0 から 1 の範囲で、変数間に関連性がない場合は 0 に対応し、各値が他の値によって完全に決定される場合のみ 1 に達することができます。これは、二つの変数間の関連性を最大の変動の割合として見ることができます。'
sidebar_position: 127
slug: /sql-reference/aggregate-functions/reference/cramersv
title: 'cramersV'
---


# cramersV

[Cramer's V](https://en.wikipedia.org/wiki/Cram%C3%A9r%27s_V)（Cramer's phiとも呼ばれることがあります）は、テーブル内の二つのカラム間の関連性を測定する指標です。`cramersV` 関数の結果は 0 から 1 の範囲で、変数間に関連性がない場合は 0 に対応し、各値が他の値によって完全に決定される場合のみ 1 に達することができます。これは、二つの変数間の関連性を最大の変動の割合として見ることができます。

:::note
Cramer's V のバイアス補正版については、[cramersVBiasCorrected](./cramersvbiascorrected.md) を参照してください。
:::

**構文**

```sql
cramersV(column1, column2)
```

**パラメータ**

- `column1`: 比較する最初のカラム。
- `column2`: 比較する二つ目のカラム。

**戻り値**

- 値は 0（カラムの値間に関連性がないことに対応）から 1（完全な関連性）までの範囲。

型: 常に [Float64](../../../sql-reference/data-types/float.md)。

**例**

以下で比較される二つのカラムはお互いに関連性がないため、`cramersV` の結果は 0 です：

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

以下の二つのカラムはかなり近い関連性を持っているため、`cramersV` の結果は高い値になります：

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
