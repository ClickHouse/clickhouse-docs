---
description: '入力パラメータと同じデータ型を結果に使用して数値の合計を計算します。合計がこのデータ型の最大値を超えた場合は、オーバーフローさせて計算されます。'
sidebar_position: 200
slug: /sql-reference/aggregate-functions/reference/sumwithoverflow
title: 'sumWithOverflow'
doc_type: 'reference'
---

# sumWithOverflow

入力パラメータと同じデータ型を結果にも使用して数値の合計を計算します。合計がそのデータ型の最大値を超える場合は、オーバーフローさせて計算されます。

数値型に対してのみ使用できます。

**構文**

```sql
sumWithOverflow(num)
```

**パラメータ**

* `num`: 数値のカラム。[(U)Int*](../../data-types/int-uint.md)、[Float*](../../data-types/float.md)、[Decimal*](../../data-types/decimal.md)。

**戻り値**

* 値の合計。[(U)Int*](../../data-types/int-uint.md)、[Float*](../../data-types/float.md)、[Decimal*](../../data-types/decimal.md)。

**例**

まずテーブル `employees` を作成し、架空の従業員データを挿入します。この例では、これらの値の合計でオーバーフローが発生する可能性があるように、`salary` を `UInt16` として定義します。

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

`sum` 関数と `sumWithOverflow` 関数を使って従業員の給与の合計額をクエリし、`toTypeName` 関数を用いてその型を表示します。
`sum` 関数では結果の型は合計値を保持するのに十分大きい `UInt64` になりますが、`sumWithOverflow` では結果の型は `UInt16` のままになります。

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
