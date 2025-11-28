---
description: 'Cramer の V を計算し、バイアス補正を適用します。'
sidebar_position: 128
slug: /sql-reference/aggregate-functions/reference/cramersvbiascorrected
title: 'cramersVBiasCorrected'
doc_type: 'reference'
---

# cramersVBiasCorrected

Cramer&#39;s V は、テーブル内の 2 つの列間の関連の強さを表す指標です。[`cramersV` 関数](./cramersv.md) の結果は 0（変数間に関連がないことに対応）から 1 の範囲の値を取り、一方の値が他方の値によって一意に決まる場合にのみ 1 に達します。この関数は強いバイアスがかかる可能性があるため、このバージョンの Cramer&#39;s V では [バイアス補正](https://en.wikipedia.org/wiki/Cram%C3%A9r%27s_V#Bias_correction) を使用します。

**構文**

```sql
cramersVBiasCorrected(column1, column2)
```

**パラメータ**

* `column1`: 比較対象となる最初の列。
* `column2`: 比較対象となる2番目の列。

**戻り値**

* 0（列の値同士に連関がまったくない状態）から 1（完全な連関）までの値。

型: 常に [Float64](../../../sql-reference/data-types/float.md)。

**例**

以下で比較されている2つの列には、互いに中程度の連関があります。`cramersVBiasCorrected` の結果が `cramersV` の結果より小さいことに注目してください。

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
