---
description: 'バイアス補正付きの Cramer''s V を計算します。'
sidebar_position: 128
slug: /sql-reference/aggregate-functions/reference/cramersvbiascorrected
title: 'cramersVBiasCorrected'
doc_type: 'reference'
---

# cramersVBiasCorrected

Cramer&#39;s V は、テーブル内の 2 列間の連関の強さを表す指標です。[`cramersV` 関数](./cramersv.md) の結果は 0（変数間に連関がないことに対応）から 1 の範囲を取り、一方の値が他方によって完全に決定される場合にのみ 1 になります。この関数は大きなバイアスがかかる可能性があるため、このバージョンの Cramer&#39;s V では[バイアス補正](https://en.wikipedia.org/wiki/Cram%C3%A9r%27s_V#Bias_correction)を採用しています。

**構文**

```sql
cramersVBiasCorrected(column1, column2)
```

**パラメータ**

* `column1`: 比較対象となる最初の列。
* `column2`: 比較対象となる 2 番目の列。

**返される値**

* 0（列の値同士に関連性がないことに対応）から 1（完全な関連性があることに対応）までの値。

型: 常に [Float64](../../../sql-reference/data-types/float.md)。

**例**

以下で比較している 2 つの列は、互いに中程度の関連性を持っています。`cramersVBiasCorrected` の結果が `cramersV` の結果より小さいことに注目してください。

クエリ:

```sql
SELECT
    cramersV(a, b),
    cramersVBiasCorrected(a ,b)
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
┌─────cramersV(a, b)─┬─cramersVBiasCorrected(a, b)─┐
│ 0.5798088336225178 │          0.5305112825189074 │
└────────────────────┴─────────────────────────────┘
```
