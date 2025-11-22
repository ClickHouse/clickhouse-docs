---
description: '`contingency` 関数は連関係数（contingency coefficient）を計算します。これは、テーブル内の 2 つの列間の関連の強さを測定する値です。この計算は `cramersV` 関数と類似していますが、平方根の分母が異なります。'
sidebar_position: 116
slug: /sql-reference/aggregate-functions/reference/contingency
title: 'contingency'
doc_type: 'reference'
---

# contingency

`contingency` 関数は [contingency coefficient](https://en.wikipedia.org/wiki/Contingency_table#Cram%C3%A9r's_V_and_the_contingency_coefficient_C) を計算します。これは、テーブル内の 2 つの列間の連関の強さを測定する値です。計算方法は [`cramersV` 関数](./cramersv.md) と類似していますが、平方根内部の分母が異なります。

**構文**

```sql
contingency(column1, column2)
```

**引数**

* `column1` と `column2` は比較対象となる列です。

**戻り値**

* 0 から 1 の間の値。結果が大きいほど、2 つの列の関連性が高くなります。

**戻り値の型** は常に [Float64](../../../sql-reference/data-types/float.md) です。

**例**

以下で比較している 2 つの列は、互いの関連性が低い例です。比較のために、`cramersV` の結果も併記しています。

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
┌─────cramersV(a, b)─┬──contingency(a, b)─┐
│ 0.5798088336225178 │ 0.0817230766271248 │
└────────────────────┴────────────────────┘
```
