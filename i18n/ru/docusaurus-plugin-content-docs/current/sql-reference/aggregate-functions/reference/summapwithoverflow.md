---
description: 'Суммирует массив `value` в соответствии с ключами, указанными в массиве `key`. Возвращает кортеж из двух массивов: ключи в отсортированном порядке и значения, суммированные для соответствующих ключей. Отличается от функции sumMap тем, что выполняет суммирование с учетом переполнения.'
sidebar_position: 199
slug: /sql-reference/aggregate-functions/reference/summapwithoverflow
title: 'sumMapWithOverflow'
---


# sumMapWithOverflow

Суммирует массив `value` в соответствии с ключами, указанными в массиве `key`. Возвращает кортеж из двух массивов: ключи в отсортированном порядке и значения, суммированные для соответствующих ключей. 
Отличается от функции [sumMap](../reference/summap.md) тем, что выполняет суммирование с учетом переполнения - т.е. возвращает тот же самый тип данных для суммирования, что и тип данных аргумента.

**Синтаксис**

- `sumMapWithOverflow(key <Array>, value <Array>)` [Тип массива](../../data-types/array.md).
- `sumMapWithOverflow(Tuple(key <Array>, value <Array>))` [Тип кортежа](../../data-types/tuple.md).

**Аргументы** 

- `key`: [Массив](../../data-types/array.md) ключей.
- `value`: [Массив](../../data-types/array.md) значений.

Передача кортежа массивов ключей и значений является синонимом передачи отдельно массива ключей и массива значений.

:::note 
Количество элементов в `key` и `value` должно быть одинаковым для каждой строки, которая суммируется.
:::

**Возвращаемое значение** 

- Возвращает кортеж из двух массивов: ключи в отсортированном порядке и значения, суммированные для соответствующих ключей.

**Пример**

Сначала мы создадим таблицу с названием `sum_map` и вставим в нее данные. Массивы ключей и значений хранятся отдельно в колонке под названием `statusMap` типа [Nested](../../data-types/nested-data-structures/index.md), и вместе в колонке под названием `statusMapTuple` типа [tuple](../../data-types/tuple.md) для иллюстрации использования двух различных синтаксисов этой функции, описанных выше.

Запрос:

```sql
CREATE TABLE sum_map(
    date Date,
    timeslot DateTime,
    statusMap Nested(
        status UInt8,
        requests UInt8
    ),
    statusMapTuple Tuple(Array(Int8), Array(Int8))
) ENGINE = Log;
```
```sql
INSERT INTO sum_map VALUES
    ('2000-01-01', '2000-01-01 00:00:00', [1, 2, 3], [10, 10, 10], ([1, 2, 3], [10, 10, 10])),
    ('2000-01-01', '2000-01-01 00:00:00', [3, 4, 5], [10, 10, 10], ([3, 4, 5], [10, 10, 10])),
    ('2000-01-01', '2000-01-01 00:01:00', [4, 5, 6], [10, 10, 10], ([4, 5, 6], [10, 10, 10])),
    ('2000-01-01', '2000-01-01 00:01:00', [6, 7, 8], [10, 10, 10], ([6, 7, 8], [10, 10, 10]));
```

Если мы сделаем запрос к таблице, используя функции `sumMap`, `sumMapWithOverflow` с синтаксисом массива и `toTypeName`, то мы можем увидеть, что для функции `sumMapWithOverflow` тип данных массива суммированных значений такой же, как и тип аргумента, оба `UInt8` (т.е. суммирование было выполнено с учетом переполнения). Для `sumMap` тип данных массивов суммированных значений изменился с `UInt8` на `UInt64`, чтобы избежать переполнения.

Запрос:

```sql
SELECT
    timeslot,
    toTypeName(sumMap(statusMap.status, statusMap.requests)),
    toTypeName(sumMapWithOverflow(statusMap.status, statusMap.requests)),
FROM sum_map
GROUP BY timeslot
```

Аналогично мы могли бы использовать синтаксис кортежа для получения того же результата.

```sql
SELECT
    timeslot,
    toTypeName(sumMap(statusMapTuple)),
    toTypeName(sumMapWithOverflow(statusMapTuple)),
FROM sum_map
GROUP BY timeslot
```

Результат:

```text
   ┌────────────timeslot─┬─toTypeName(sumMap(statusMap.status, statusMap.requests))─┬─toTypeName(sumMapWithOverflow(statusMap.status, statusMap.requests))─┐
1. │ 2000-01-01 00:01:00 │ Tuple(Array(UInt8), Array(UInt64))                       │ Tuple(Array(UInt8), Array(UInt8))                                    │
2. │ 2000-01-01 00:00:00 │ Tuple(Array(UInt8), Array(UInt64))                       │ Tuple(Array(UInt8), Array(UInt8))                                    │
   └─────────────────────┴──────────────────────────────────────────────────────────┴──────────────────────────────────────────────────────────────────────┘
```

**См. также**
    
- [sumMap](../reference/summap.md)
