---
slug: /sql-reference/aggregate-functions/reference/sumwithoverflow
sidebar_position: 200
---

# sumWithOverflow

数値の合計を計算し、結果のデータ型は入力パラメータと同じデータ型を使用します。この合計がこのデータ型の最大値を超える場合、オーバーフローで計算されます。

数字にのみ対応しています。

**構文**

```sql
sumWithOverflow(num)
```

**パラメータ**
- `num`: 数値のカラムです。[(U)Int*](../../data-types/int-uint.md)、[Float*](../../data-types/float.md)、[Decimal*](../../data-types/decimal.md)。

**返り値**

- 値の合計。[(U)Int*](../../data-types/int-uint.md)、[Float*](../../data-types/float.md)、[Decimal*](../../data-types/decimal.md)。

**例**

まず、`employees`というテーブルを作成し、架空の従業員データを挿入します。この例では、`salary`を`UInt16`として選択し、これらの値の合計がオーバーフローを引き起こす可能性があります。

クエリ：

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

`sum`および`sumWithOverflow`関数を使用して従業員の給与の合計額をクエリし、`toTypeName`関数を使用してその型を表示します。
`sum`関数の結果の型は`UInt64`で、合計を含むのに十分大きいのに対し、`sumWithOverflow`の結果の型は`UInt16`のままです。  

クエリ：

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
