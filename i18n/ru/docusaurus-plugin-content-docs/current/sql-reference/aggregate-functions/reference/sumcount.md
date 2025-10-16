---
slug: '/sql-reference/aggregate-functions/reference/sumcount'
sidebar_position: 196
description: 'Вычисляет сумму чисел и одновременно подсчитывает количество строк.'
title: sumCount
doc_type: reference
---
Вычисляет сумму чисел и одновременно подсчитывает количество строк. Функция используется оптимизатором запросов ClickHouse: если в запросе есть несколько функций `sum`, `count` или `avg`, их можно заменить на одну функцию `sumCount`, чтобы повторно использовать вычисления. Эта функция редко требуется для явного использования.

**Синтаксис**

```sql
sumCount(x)
```

**Аргументы**

- `x` — Входное значение, должно быть [Integer](../../../sql-reference/data-types/int-uint.md), [Float](../../../sql-reference/data-types/float.md) или [Decimal](../../../sql-reference/data-types/decimal.md).

**Возвращаемое значение**

- Кортеж `(sum, count)`, где `sum` — это сумма чисел, а `count` — количество строк с ненулевыми значениями.

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

- [optimize_syntax_fuse_functions](../../../operations/settings/settings.md#optimize_syntax_fuse_functions) настройка.