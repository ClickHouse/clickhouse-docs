---
slug: '/examples/aggregate-function-combinators/sumMap'
title: 'sumMap'
description: 'Пример использования комбинатора sumMap'
keywords: ['sum', 'map', 'combinator', 'examples', 'sumMap']
sidebar_label: 'sumMap'
---


# sumMap {#summap}

## Описание {#description}

Комбинатор [`Map`](/sql-reference/aggregate-functions/combinators#-map) может быть применен к функции [`sum`](/sql-reference/aggregate-functions/reference/sum) для вычисления суммы значений в Map в соответствии с каждым ключом, используя агрегатный комбинатор `sumMap`.

## Пример использования {#example-usage}

В этом примере мы создадим таблицу, которая будет хранить коды статусов и их количество для различных временных промежутков, где каждая строка содержит Map кодов статусов и соответствующих им количеств. Мы будем использовать `sumMap`, чтобы вычислить общее количество для каждого кода статуса в пределах каждого временного промежутка.

```sql title="Запрос"
CREATE TABLE metrics(
    date Date,
    timeslot DateTime,
    status Map(String, UInt64)
) ENGINE = Log;

INSERT INTO metrics VALUES
    ('2000-01-01', '2000-01-01 00:00:00', (['a', 'b', 'c'], [15, 25, 35])),
    ('2000-01-01', '2000-01-01 00:00:00', (['c', 'd', 'e'], [45, 55, 65])),
    ('2000-01-01', '2000-01-01 00:01:00', (['d', 'e', 'f'], [75, 85, 95])),
    ('2000-01-01', '2000-01-01 00:01:00', (['f', 'g', 'g'], [105, 115, 125]));

SELECT
    timeslot,
    sumMap(status),
FROM metrics
GROUP BY timeslot;
```

Функция `sumMap` вычислит общее количество для каждого кода статуса в пределах каждого временного промежутка. Например:
- В временном промежутке '2000-01-01 00:00:00':
  - Статус 'a': 15
  - Статус 'b': 25
  - Статус 'c': 35 + 45 = 80
  - Статус 'd': 55
  - Статус 'e': 65
- В временном промежутке '2000-01-01 00:01:00':
  - Статус 'd': 75
  - Статус 'e': 85
  - Статус 'f': 95 + 105 = 200
  - Статус 'g': 115 + 125 = 240

```response title="Ответ"
   ┌────────────timeslot─┬─sumMap(status)───────────────────────┐
1. │ 2000-01-01 00:01:00 │ {'d':75,'e':85,'f':200,'g':240}      │
2. │ 2000-01-01 00:00:00 │ {'a':15,'b':25,'c':80,'d':55,'e':65} │
   └─────────────────────┴──────────────────────────────────────┘
```

## Смотрите также {#see-also}
- [`sum`](/sql-reference/aggregate-functions/reference/sum)
- [`Map combinator`](/sql-reference/aggregate-functions/combinators#-map)
