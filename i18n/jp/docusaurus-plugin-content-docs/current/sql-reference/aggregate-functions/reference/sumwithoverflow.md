---
'description': '数値の合計を計算します。結果のデータ型は入力パラメータと同じです。このデータ型の最大値を超える場合、オーバーフローで計算されます。'
'sidebar_position': 200
'slug': '/sql-reference/aggregate-functions/reference/sumwithoverflow'
'title': 'sumWithOverflow'
'doc_type': 'reference'
---


# sumWithOverflow

数字の合計を計算します。結果のデータ型は入力パラメータと同じです。このデータ型の最大値を超える場合は、オーバーフローを考慮して計算されます。

数字のみで機能します。

**構文**

```sql
sumWithOverflow(num)
```

**パラメータ**
- `num`: 数値のカラム。[(U)Int*](../../data-types/int-uint.md)、[Float*](../../data-types/float.md)、[Decimal*](../../data-types/decimal.md)。

**返される値**

- 値の合計。[(U)Int*](../../data-types/int-uint.md)、[Float*](../../data-types/float.md)、[Decimal*](../../data-types/decimal.md)。

**例**

まず、`employees`というテーブルを作成し、その中に架空の従業員データを挿入します。この例では、オーバーフローが発生する可能性があるため、`salary`を`UInt16`として選択します。

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

`sum`および`sumWithOverflow`関数を使用して従業員の給料の合計額をクエリし、`toTypeName`関数を使ってそのタイプを表示します。`sum`関数の場合、結果の型は合計を含むのに十分な`UInt64`ですが、`sumWithOverflow`では結果の型は`UInt16`のままです。

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
