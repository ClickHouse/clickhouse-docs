---
slug: '/examples/aggregate-function-combinators/maxMap'
title: 'maxMap'
description: 'Пример использования комбинатора maxMap'
keywords: ['max', 'map', 'combinator', 'examples', 'maxMap']
sidebar_label: 'maxMap'
---


# maxMap {#maxmap}

## Описание {#description}

Комбинатор [`Map`](/sql-reference/aggregate-functions/combinators#-map) может быть применен к функции [`max`](/sql-reference/aggregate-functions/reference/max) для вычисления максимального значения в Map по каждому ключу, используя агрегатную функцию `maxMap`.

## Пример использования {#example-usage}

В этом примере мы создадим таблицу, которая хранит коды состояний и их количество для различных временных интервалов, где каждая строка содержит Map кодов состояний и соответствующих им количеств. Мы будем использовать `maxMap`, чтобы найти максимальное количество для каждого кода состояния в каждом временном интервале.

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
    maxMap(status),
FROM metrics
GROUP BY timeslot;
```

Функция `maxMap` найдет максимальное количество для каждого кода состояния в каждом временном интервале. Например:
- В временном интервале '2000-01-01 00:00:00':
  - Код состояния 'a': 15
  - Код состояния 'b': 25
  - Код состояния 'c': max(35, 45) = 45
  - Код состояния 'd': 55
  - Код состояния 'e': 65
- В временном интервале '2000-01-01 00:01:00':
  - Код состояния 'd': 75
  - Код состояния 'e': 85
  - Код состояния 'f': max(95, 105) = 105
  - Код состояния 'g': max(115, 125) = 125

```response title="Ответ"
   ┌────────────timeslot─┬─maxMap(status)───────────────────────┐
1. │ 2000-01-01 00:01:00 │ {'d':75,'e':85,'f':105,'g':125}      │
2. │ 2000-01-01 00:00:00 │ {'a':15,'b':25,'c':45,'d':55,'e':65} │
   └─────────────────────┴──────────────────────────────────────┘
```

## См. также {#see-also}
- [`max`](/sql-reference/aggregate-functions/reference/max)
- [`Map combinator`](/sql-reference/aggregate-functions/combinators#-map)
