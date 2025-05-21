---
description: '`contingency`関数は、テーブル内の2つのカラム間の関連性を測定する値であるコンティンジェンシー係数を計算します。この計算は、異なる分母を持つ平方根に基づいていますが、`cramersV`関数に似ています。'
sidebar_position: 116
slug: /sql-reference/aggregate-functions/reference/contingency
title: 'contingency'
---


# contingency

`contingency`関数は、[コンティンジェンシー係数](https://en.wikipedia.org/wiki/Contingency_table#Cram%C3%A9r's_V_and_the_contingency_coefficient_C)を計算します。これは、テーブル内の2つのカラム間の関連性を測定する値です。この計算は、[ `cramersV`関数](./cramersv.md)に似ていますが、平方根に異なる分母を持ちます。

**構文**

```sql
contingency(column1, column2)
```

**引数**

- `column1`と`column2`は比較されるカラムです。

**返される値**

- 0から1の間の値です。結果が大きいほど、2つのカラムの関連性が近いことを示します。

**返り値の型**は常に[Float64](../../../sql-reference/data-types/float.md)です。

**例**

以下で比較される2つのカラムは、互いに小さな関連性を持っています。比較のために`cramersV`の結果も含めています：

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

結果:

```response
┌──────cramersV(a, b)─┬───contingency(a, b)─┐
│ 0.41171788506213564 │ 0.05812725261759165 │
└─────────────────────┴─────────────────────┘
```
