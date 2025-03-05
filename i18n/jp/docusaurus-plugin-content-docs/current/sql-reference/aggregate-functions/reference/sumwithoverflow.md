---
slug: /sql-reference/aggregate-functions/reference/sumwithoverflow
sidebar_position: 200
title: "sumWithOverflow"
description: "合計を計算し、入力パラメータと同じデータ型を結果に使用します。このデータ型の最大値を超える合計であれば、オーバーフローを考慮して計算されます。"
---


# sumWithOverflow

合計を計算し、入力パラメータと同じデータ型を結果に使用します。このデータ型の最大値を超える合計であれば、オーバーフローを考慮して計算されます。

数値のみに対応しています。

**構文**

```sql
sumWithOverflow(num)
```

**パラメータ**
- `num`: 数値のカラム。 [(U)Int*](../../data-types/int-uint.md), [Float*](../../data-types/float.md), [Decimal*](../../data-types/decimal.md)。

**返される値**

- 値の合計。 [(U)Int*](../../data-types/int-uint.md), [Float*](../../data-types/float.md), [Decimal*](../../data-types/decimal.md)。

**例**

まず、テーブル `employees` を作成し、架空の従業員データを挿入します。この例では、`salary` を `UInt16` として選択し、これらの値の合計がオーバーフローを引き起こす可能性があります。

クエリ:

```sql
CREATE TABLE employees
(
    `id` UInt32,
    `name` String,
    `monthly_salary` UInt16
)
ENGINE = Log
```

```sql
SELECT
    sum(monthly_salary) AS no_overflow,
    sumWithOverflow(monthly_salary) AS overflow,
    toTypeName(no_overflow),
    toTypeName(overflow)
FROM employees
```

従業員の給料の合計を `sum` および `sumWithOverflow` 関数を使用してクエリし、`toTypeName` 関数を使用してその型を表示します。
`sum` 関数の結果は `UInt64` であり、合計を含むのに十分な大きさですが、`sumWithOverflow` の結果の型は `UInt16` のままです。

クエリ:

```sql
SELECT 
    sum(monthly_salary) AS no_overflow,
    sumWithOverflow(monthly_salary) AS overflow,
    toTypeName(no_overflow),
    toTypeName(overflow),    
FROM employees;
```

結果:

```response
   ┌─no_overflow─┬─overflow─┬─toTypeName(no_overflow)─┬─toTypeName(overflow)─┐
1. │      118700 │    53164 │ UInt64                  │ UInt16               │
   └─────────────┴──────────┴─────────────────────────┴──────────────────────┘
```
