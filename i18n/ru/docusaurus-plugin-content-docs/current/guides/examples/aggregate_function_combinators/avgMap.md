---
slug: '/examples/aggregate-function-combinators/avgMap'
sidebar_label: avgMap
description: 'Пример использования комбинирования avgMap'
title: avgMap
keywords: ['avg', 'map', 'combinator', 'examples', 'avgMap']
doc_type: reference
---
# avgMap {#avgmap}

## Описание {#description}

Комбинатор [`Map`](/sql-reference/aggregate-functions/combinators#-map) может быть применен к функции [`avg`](/sql-reference/aggregate-functions/reference/avg) для вычисления арифметического среднего значений в Map по каждому ключу с использованием агрегирующей комбинированной функции `avgMap`.

## Пример использования {#example-usage}

В этом примере мы создадим таблицу, которая хранит коды состояния и их количество для различных временных интервалов, где каждая строка содержит Map кодов состояния с соответствующими количествами. Мы будем использовать `avgMap` для вычисления среднего количества для каждого кода состояния в пределах каждого временного интервала.

```sql title="Query"
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
    avgMap(status),
FROM metrics
GROUP BY timeslot;
```

Функция `avgMap` будет вычислять среднее количество для каждого кода состояния в пределах каждого временного интервала. Например:
- В временном интервале '2000-01-01 00:00:00':
  - Статус 'a': 15
  - Статус 'b': 25
  - Статус 'c': (35 + 45) / 2 = 40
  - Статус 'd': 55
  - Статус 'e': 65
- В временном интервале '2000-01-01 00:01:00':
  - Статус 'd': 75
  - Статус 'e': 85
  - Статус 'f': (95 + 105) / 2 = 100
  - Статус 'g': (115 + 125) / 2 = 120

```response title="Response"
   ┌────────────timeslot─┬─avgMap(status)───────────────────────┐
1. │ 2000-01-01 00:01:00 │ {'d':75,'e':85,'f':100,'g':120}      │
2. │ 2000-01-01 00:00:00 │ {'a':15,'b':25,'c':40,'d':55,'e':65} │
   └─────────────────────┴──────────────────────────────────────┘
```

## См. также {#see-also}
- [`avg`](/sql-reference/aggregate-functions/reference/avg)
- [`Map комбинатор`](/sql-reference/aggregate-functions/combinators#-map)