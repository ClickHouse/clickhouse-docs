---
description: 'Вычисляет сумму чисел и одновременно считает количество строк. Функция используется оптимизатором запросов ClickHouse: если в запросе присутствует несколько функций `sum`, `count` или `avg`, их можно заменить одной функцией `sumCount`, чтобы переиспользовать результаты вычислений. Необходимость явного использования этой функции возникает редко.'
sidebar_position: 196
slug: /sql-reference/aggregate-functions/reference/sumcount
title: 'sumCount'
doc_type: 'reference'
---

Вычисляет сумму чисел и одновременно считает количество строк. Функция используется оптимизатором запросов ClickHouse: если в запросе присутствует несколько функций `sum`, `count` или `avg`, их можно заменить одной функцией `sumCount`, чтобы переиспользовать результаты вычислений. Необходимость явного использования этой функции возникает редко.

**Синтаксис**

```sql
sumCount(x)
```

**Аргументы**

* `x` — входное значение, должно быть типа [Integer](../../../sql-reference/data-types/int-uint.md), [Float](../../../sql-reference/data-types/float.md) или [Decimal](../../../sql-reference/data-types/decimal.md).

**Возвращаемое значение**

* Кортеж `(sum, count)`, где `sum` — сумма чисел, а `count` — количество строк со значениями, отличными от NULL.

Тип: [Tuple](../../../sql-reference/data-types/tuple.md).

**Пример**

Запрос:

```sql
CREATE TABLE s_table (x Int8) ENGINE = Log;
INSERT INTO s_table SELECT number FROM numbers(0, 20);
INSERT INTO s_table VALUES (NULL);
SELECT sumCount(x) FROM s_table;
```

Результат:

```text
┌─sumCount(x)─┐
│ (190,20)    │
└─────────────┘
```

**См. также**

* Параметр [optimize&#95;syntax&#95;fuse&#95;functions](../../../operations/settings/settings.md#optimize_syntax_fuse_functions).
