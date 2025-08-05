---
description: '合計を計算します。数字にしか適用されません。'
sidebar_position: 195
slug: '/sql-reference/aggregate-functions/reference/sum'
title: 'sum'
---




# sum

合計を計算します。数値にのみ機能します。

**構文**

```sql
sum(num)
```

**パラメータ**
- `num`: 数値のカラム。 [(U)Int*](../../data-types/int-uint.md), [Float*](../../data-types/float.md), [Decimal*](../../data-types/decimal.md)。

**返される値**

- 値の合計。 [(U)Int*](../../data-types/int-uint.md), [Float*](../../data-types/float.md), [Decimal*](../../data-types/decimal.md)。

**例**

まず、テーブル `employees` を作成し、いくつかの架空の従業員データを挿入します。

クエリ:

```sql
CREATE TABLE employees
(
    `id` UInt32,
    `name` String,
    `salary` UInt32
)
ENGINE = Log
```

```sql
INSERT INTO employees VALUES
    (87432, 'John Smith', 45680),
    (59018, 'Jane Smith', 72350),
    (20376, 'Ivan Ivanovich', 58900),
    (71245, 'Anastasia Ivanovna', 89210);
```

`sum` 関数を使用して、従業員の給与の合計をクエリします。

クエリ:

```sql
SELECT sum(salary) FROM employees;
```

結果:

```response
   ┌─sum(salary)─┐
1. │      266140 │
   └─────────────┘
```
