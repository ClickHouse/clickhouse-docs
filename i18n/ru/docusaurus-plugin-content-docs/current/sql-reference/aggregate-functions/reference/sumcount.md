---
slug: /sql-reference/aggregate-functions/reference/sumcount
sidebar_position: 196
title: sumCount
description: "Вычисляет сумму чисел и одновременно подсчитывает количество строк. Функция используется оптимизатором запросов ClickHouse: если в запросе присутствует несколько функций `sum`, `count` или `avg`, их можно заменить на одну функцию `sumCount` для повторного использования вычислений. Функцию редко нужно использовать явно."
---

Вычисляет сумму чисел и одновременно подсчитывает количество строк. Функция используется оптимизатором запросов ClickHouse: если в запросе присутствует несколько функций `sum`, `count` или `avg`, их можно заменить на одну функцию `sumCount` для повторного использования вычислений. Функцию редко нужно использовать явно.

**Синтаксис**

``` sql
sumCount(x)
```

**Аргументы**

- `x` — Входное значение, должно быть [Целым числом](../../../sql-reference/data-types/int-uint.md), [Числом с плавающей точкой](../../../sql-reference/data-types/float.md) или [Десятичным числом](../../../sql-reference/data-types/decimal.md).

**Возвращаемое значение**

- Кортеж `(sum, count)`, где `sum` — сумма чисел, а `count` — количество строк с не-NULL значениями.

Тип: [Кортеж](../../../sql-reference/data-types/tuple.md).

**Пример**

Запрос:

``` sql
CREATE TABLE s_table (x Int8) Engine = Log;
INSERT INTO s_table SELECT number FROM numbers(0, 20);
INSERT INTO s_table VALUES (NULL);
SELECT sumCount(x) from s_table;
```

Результат:

``` text
┌─sumCount(x)─┐
│ (190,20)    │
└─────────────┘
```

**См. также**

- [optimize_syntax_fuse_functions](../../../operations/settings/settings.md#optimize_syntax_fuse_functions) настройка.
