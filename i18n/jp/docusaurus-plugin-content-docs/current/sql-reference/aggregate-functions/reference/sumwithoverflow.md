---
description: '数値の合計を計算します。結果のデータ型は入力パラメータと同じです。このデータ型の最大値を超えた場合は、オーバーフローを伴って計算されます。'
sidebar_position: 200
slug: /sql-reference/aggregate-functions/reference/sumwithoverflow
title: 'sumWithOverflow'
---

# sumWithOverflow

数値の合計を計算します。結果のデータ型は入力パラメータと同じです。このデータ型の最大値を超えた場合は、オーバーフローを伴って計算されます。

数値のみに適用されます。

**構文**

```sql
sumWithOverflow(num)
```

**パラメータ**
- `num`: 数値のカラム。[(U)Int*](../../data-types/int-uint.md)、[Float*](../../data-types/float.md)、[Decimal*](../../data-types/decimal.md)。

**戻り値**

- 値の合計。[(U)Int*](../../data-types/int-uint.md)、[Float*](../../data-types/float.md)、[Decimal*](../../data-types/decimal.md)。

**例**

まず、`employees`というテーブルを作成し、架空の従業員データを挿入します。この例では、`salary`を`UInt16`として選択し、これらの値の合計がオーバーフローを引き起こす可能性があります。

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

`sum`および`sumWithOverflow`関数を使用して従業員給与の合計を問い合わせ、`toTypeName`関数を使用してその型を表示します。
`sum`関数の場合、結果の型は`UInt64`で、合計を保持するのに十分な大きさですが、`sumWithOverflow`の場合、結果の型は`UInt16`のままです。

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
