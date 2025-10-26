---
slug: '/sql-reference/statements/select/where'
sidebar_label: WHERE
description: 'Документация для WHERE оператор'
title: 'Оператор WHERE'
doc_type: reference
---
# WHERE Условие

`WHERE` условие позволяет фильтровать данные, которые поступают из [FROM](../../../sql-reference/statements/select/from.md) условия в `SELECT`.

Если есть `WHERE` условие, оно должно содержать выражение с типом `UInt8`. Обычно это выражение с операторами сравнения и логическими операторами. Строки, для которых это выражение вычисляется в `0`, исключаются из дальнейших преобразований или результата.

`WHERE` выражение оценивается с точки зрения возможности использования индексов и обрезки партиций, если поддерживаемый движок таблицы это позволяет.

:::note    
Существует оптимизация фильтрации под названием [PREWHERE](../../../sql-reference/statements/select/prewhere.md).
:::

Если вам нужно проверить значение на [NULL](/sql-reference/syntax#null), используйте операторы [IS NULL](/sql-reference/operators#is_null) и [IS NOT NULL](/sql-reference/operators#is_not_null) или функции [isNull](../../../sql-reference/functions/functions-for-nulls.md#isNull) и [isNotNull](../../../sql-reference/functions/functions-for-nulls.md#isNotNull).
В противном случае выражение с `NULL` никогда не пройдет.

**Пример**

Чтобы найти числа, которые являются кратными 3 и больше 10, выполните следующий запрос на [таблице чисел](../../../sql-reference/table-functions/numbers.md):

```sql
SELECT number FROM numbers(20) WHERE (number > 10) AND (number % 3 == 0);
```

Результат:

```text
┌─number─┐
│     12 │
│     15 │
│     18 │
└────────┘
```

Запросы с значениями `NULL`:

```sql
CREATE TABLE t_null(x Int8, y Nullable(Int8)) ENGINE=MergeTree() ORDER BY x;
INSERT INTO t_null VALUES (1, NULL), (2, 3);

SELECT * FROM t_null WHERE y IS NULL;
SELECT * FROM t_null WHERE y != 0;
```

Результат:

```text
┌─x─┬────y─┐
│ 1 │ ᴺᵁᴸᴸ │
└───┴──────┘
┌─x─┬─y─┐
│ 2 │ 3 │
└───┴───┘
```