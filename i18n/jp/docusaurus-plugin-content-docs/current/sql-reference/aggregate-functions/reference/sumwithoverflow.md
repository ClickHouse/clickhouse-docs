---
description: '入力パラメータと同じデータ型で数値の合計を計算します。合計がこのデータ型の最大値を超えた場合は、オーバーフローした値として計算されます。'
sidebar_position: 200
slug: /sql-reference/aggregate-functions/reference/sumwithoverflow
title: 'sumWithOverflow'
doc_type: 'reference'
---

# sumWithOverflow

入力パラメータと同じデータ型を結果にも使用して数値の合計を計算します。このデータ型で表現できる最大値を超えた場合は、オーバーフローさせて計算します。

数値型に対してのみ使用できます。

**構文**

```sql
sumWithOverflow(num)
```

**パラメーター**

* `num`: 数値カラム。[(U)Int*](../../data-types/int-uint.md)、[Float*](../../data-types/float.md)、[Decimal*](../../data-types/decimal.md)。

**戻り値**

* 値の合計。[(U)Int*](../../data-types/int-uint.md)、[Float*](../../data-types/float.md)、[Decimal*](../../data-types/decimal.md)。

**例**

まず `employees` というテーブルを作成し、架空の従業員データを挿入します。この例では、これらの値の合計でオーバーフローが発生し得るように、`salary` を `UInt16` として選択します。

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

`sum` 関数と `sumWithOverflow` 関数を使って従業員の給与の合計を計算し、`toTypeName` 関数でそれぞれの型を表示します。
`sum` 関数では結果の型は `UInt64` となり、合計値を格納するのに十分な大きさですが、`sumWithOverflow` では結果の型は `UInt16` のままです。

クエリ:

```sql
SELECT 
    sum(monthly_salary) AS no_overflow,
    sumWithOverflow(monthly_salary) AS overflow,
    toTypeName(no_overflow),
    toTypeName(overflow),    
FROM employees;
```

結果：

```response
   ┌─no_overflow─┬─overflow─┬─toTypeName(no_overflow)─┬─toTypeName(overflow)─┐
1. │      118700 │    53164 │ UInt64                  │ UInt16               │
   └─────────────┴──────────┴─────────────────────────┴──────────────────────┘
```
